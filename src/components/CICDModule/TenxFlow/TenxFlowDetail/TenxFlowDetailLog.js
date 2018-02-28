/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFLowDetailLog component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Card, Dropdown, Spin, Menu, Icon, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import {
  getTenxflowBuildLogs, getTenxflowBuildDetailLogs, getTenxflowBuildLastLogs,
  changeBuildStatus, approveFlowStage,
} from '../../../../actions/cicd_flow'
import moment from 'moment'
import './style/TenxFLowDetailLog.less'
import TenxFlowBuildLog from '../TenxFlowBuildLog'
import Title from '../../../Title'
import Notification from '../../../Notification'

const menusText = defineMessages({
  bulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.bulidLog',
    defaultMessage: '执行记录',
  },
  downLoadBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.downLoadBulidLog',
    defaultMessage: '下载执行记录',
  },
  viewBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.viewBulidLog',
    defaultMessage: '查看执行记录',
  },
  cost: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.cost',
    defaultMessage: '耗时',
  },
  normal: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.normal',
    defaultMessage: '执行成功',
  },
  fail: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.fail',
    defaultMessage: '执行失败',
  },
  msShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.msShow',
    defaultMessage: '毫秒',
  },
  sShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.sShow',
    defaultMessage: '秒',
  },
  mShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.mShow',
    defaultMessage: '分钟',
  },
  hShow: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.hShow',
    defaultMessage: '小时',
  },
  running: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.running',
    defaultMessage: '运行中',
  },
  wait: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.wait',
    defaultMessage: '等待',
  },
})

function checkStatusSpan(status, scope, isApproving) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch(status) {
    case 0:
      return formatMessage(menusText.normal);
    case 1:
      return formatMessage(menusText.fail);
    case 2:
      return isApproving ? '等待审批' : formatMessage(menusText.running);
    case 3:
      return formatMessage(menusText.wait);
    case 33:
      return '审批超时'
    case 34:
      return '拒绝执行'
    default:
      return formatMessage(menusText.normal);
  }
}

function checkStatusClass(status, isApproving) {
  //this function for user input the status return current className
  switch(status) {
    case 0:
      return 'normal';
    case 1:
    case 33:
    case 34:
      return 'fail';
    case 2:
      return isApproving ? 'approving' : 'runing';
    case 3:
      return 'wait';
  }
}

function dateFormat(dateString) {
  if (!dateString) {
    return '';
  }
  var timeStr = moment(dateString);
  return timeStr.format("YYYY-MM-DD HH:mm:ss")
}

function dateSizeFormat(startTime, endTime, scope) {
  //this function for user get the flow building time
  const { formatMessage } = scope.props.intl;
  if(!Boolean(endTime)) {
    return (<span>{formatMessage(menusText.running)}</span>)
  }
  let newStart = new Date(Date.parse(startTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let newEnd = new Date(Date.parse(endTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let timeSize = newEnd.getTime() - newStart.getTime();
  if(timeSize > 1000) {
    timeSize = parseInt(timeSize / 1000);
    if(timeSize > 60) {
      timeSize = parseInt(timeSize / 60);
      if(timeSize > 60) {
        timeSize = parseInt(timeSize / 60);
        return (<span>{timeSize + formatMessage(menusText.hShow)}</span>)
      } else {
        return (<span>{timeSize + formatMessage(menusText.mShow)}</span>)
      }
    } else {
      return (<span>{timeSize + formatMessage(menusText.sShow)}</span>)
    }
  } else {
    return (<span>{timeSize + formatMessage(menusText.msShow)}</span>)
  }
}

function getTriggeredInfo(triggeredInfo) {
  if (!triggeredInfo) return '手动触发'
  try {
    if (typeof triggeredInfo == 'string') {
      triggeredInfo = JSON.parse(triggeredInfo)
    }
    if (triggeredInfo.type == 'Branch') {
      return 'commit CI触发'
    }
    if (triggeredInfo.type == 'Tag') {
      return '新建Tag CI触发'
    }
    if (triggeredInfo.type == 'merge_request') {
      return 'pull request CI触发'
    }
  } catch (error) {
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return {
      approvalBtnLoading: false,
      approvalObj: {},
      approvalModal: false,
    }
  },
  operaMenuClick: function () {
    //this function for user click the drop menu
  },
  confirmApproval() {
    this.setState({
      approvalBtnLoading: true,
    })
    const { flowBuildId, stageId, approval } = this.state.approvalObj
    const { scope } = this.props
    const { approveFlowStage, getTenxflowBuildLogs, flowId } = scope.props
    const notification = new Notification()
    approveFlowStage(flowBuildId, stageId, { approval }, {
      success: {
        func: res => {
          this.setState({
            approvalModal: false,
            approvalBtnLoading: false,
            approvalObj: {},
          })
          getTenxflowBuildLogs(flowId)
          notification.success('审批成功')
        },
        isAsync: true,
      },
      failed: {
        func:  err => {
          this.setState({
            approvalBtnLoading: false,
          })
          const { statusCode, message } = err
          if (statusCode === 400 && message.message === 'approval daemon is not ready') {
            this.setState({
              approvalModal: false,
            })
            notification.warn('审批流程启动中，请稍后进行操作')
            return
          }
          notification.error('审批失败')
        },
        isAsync: true,
      },
    })
  },
  render: function () {
    const { config, scope, isFetching, spaceName, flowName } = this.props;
    if(isFetching || config == undefined) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config || config.length <1) {
      return (
        <div className='LogDetail'>
        目前还没有任何构建记录
        </div>
      )
    }
    let items = config.map((item, index) => {
      // const dropdown = (
      //   <Menu onClick={this.operaMenuClick.bind(this, item)}
      //     style={{ width: '130px' }}
      //     >
      //     <Menu.Item key='2'>
      //       <i className='fa fa-eye' style={{ float:'left',lineHeight:'18px',marginRight:'5px' }} />
      //       <span style={{ float:'left' }} ><FormattedMessage {...menusText.viewBulidLog} /></span>
      //       <div style={{ clear:'both' }}></div>
      //     </Menu.Item>
      //   </Menu>
      // );
      const { isApproving, waitingApprovalStages } = item
      return (
        <div className='LogDetail' key={item.buildId + index} >
          <div className='leftBox'>
            <p className={ checkStatusClass(item.status, isApproving) + ' title' }>
              { checkStatusSpan(item.status, scope, isApproving) }
            </p>
            <i className={ checkStatusClass(item.status, isApproving) + ' fa fa-dot-circle-o dot' } />
          </div>
          <div className='rightBox'>
            <p className='title'>
              {flowName}
            </p>
            <div className='infoBox'>
              <span className='user'>
                <i className='fa fa-user' />
                {spaceName}
              </span>
              <span className='updateTime'>
                <i className='fa fa-wpforms' />
                {dateFormat(item.creationTime)}
              </span>
              <span className='costTime'>
                <Icon type='clock-circle-o' />
                { item.status != 2 ? <FormattedMessage {...menusText.cost} /> : null }
                { dateSizeFormat(item.creationTime, item.endTime, scope) }
              </span>
              <span className='costTime' style={{width:'105px'}}>
                <Icon type="play-circle-o" />
                {getTriggeredInfo(item.triggeredInfo)}
              </span>
              <div className='btnBox' style={{width: '400px'}}>
                <Button size='large' type='primary' className='operaBtn'
                  onClick={() => scope.getBuildLogDetailInfo(item.buildId)}>
                  <i className='fa fa-wpforms' />&nbsp;
                  <FormattedMessage {...menusText.bulidLog} />
                </Button>
                {
                  isApproving && [
                    <Button
                      key="deny"
                      size="large"
                      className="operaBtn deny"
                      icon="minus-circle-o"
                      onClick={() => this.setState({
                        approvalModal: true,
                        approvalObj: {
                          flowBuildId: item.buildId,
                          stageId: waitingApprovalStages[0].stageId,
                          approval: 'deny',
                        }
                      })}
                    >
                    拒绝
                    </Button>,
                    <Button
                      key="approve"
                      size="large"
                      className="operaBtn approve"
                      icon="check-circle-o"
                      onClick={() => this.setState({
                        approvalModal: true,
                        approvalObj: {
                          flowBuildId: item.buildId,
                          stageId: waitingApprovalStages[0].stageId,
                          approval: 'approve',
                        }
                      })}
                    >
                    通过
                    </Button>,
                  ]
                }
              </div>
              <div style={{ clear:'both' }}></div>
            </div>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      );
    });
    const approvalText = this.state.approvalObj.approval === 'deny'
      ? '拒绝'
      : '通过'
    return (
      <div className='DeployLogList'>
        {items}
        <Modal
          title={`审批${approvalText}`}
          visible={this.state.approvalModal}
          width={610}
          onCancel={() => this.setState({ approvalModal: false })}
          onOk={this.confirmApproval}
          okText={approvalText}
          confirmLoading={this.state.approvalBtnLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            <span>
            {
              this.state.approvalObj.approval === 'deny'
                ? '该操作后流水线将终止执行！'
                : '该操作后流水线将继续执行！'
            }
            </span>
          </div>
          <div className="themeColor" style={{marginBottom: '15px'}}>
            <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}/>
            {
              this.state.approvalObj.approval === 'deny'
                ? '您是否确认拒绝本次流水线执行？'
                : '您是否确认通过本次流水线执行？'
            }
          </div>
        </Modal>
      </div>
    );
  }
});

class TenxFLowDetailLog extends Component {
  constructor(props) {
    super(props);
    this.getBuildLogDetailInfo = this.getBuildLogDetailInfo.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.state = {
      TenxFlowDeployLogModal: false
    }
  }

  componentWillMount() {
    const { getTenxflowBuildLogs, flowId } = this.props;
    getTenxflowBuildLogs(flowId);
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  getBuildLogDetailInfo(buildId) {
    //this function for show user the detail log info
    const { getTenxflowBuildDetailLogs, flowId } = this.props;
    this.setState({
      TenxFlowDeployLogModal: true
    })
    getTenxflowBuildDetailLogs(flowId, buildId)
  }
  callback(flowId) {
    const { getTenxflowBuildLastLogs, changeBuildStatus } = this.props
    return () => {
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const info = result.data.results.results
            changeBuildStatus(info.buildId, info.status)
          },
          isAsync: true
        },
        failed: {
          func: () => {
          }
        }
      })
    }
  }
  render() {
    const { scope, isFetching, logs, spaceName, flowName, detailFetching, detailLogs, flowId } = this.props;
    const thisScope = this;
    return (
      <Card id='TenxFLowDetailLog'>
        <Title title="TenxFlow" />
        <MyComponent config={logs} scope={thisScope} isFetching={isFetching} spaceName={spaceName} flowName={flowName} />
        <Modal visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal} >
          <TenxFlowBuildLog scope={thisScope} flowId={flowId} isFetching={detailFetching} logs={detailLogs} callback={this.callback(flowId)} visible={this.state.TenxFlowDeployLogModal} />
        </Modal>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultLogs = {
    isFetching: false,
    logs: []
  }
  const defaultDetailStageLogs = {
    detailFetching: false,
    logs: []
  }
  const { current } = state.entities
  const { space } = current
  const spaceName = space.spaceName || space.projectName
  const { getTenxflowBuildLogs, getTenxflowBuildDetailLogs } = state.cicd_flow
  const { logs = [], waitingApprovalStages, isFetching } = getTenxflowBuildLogs || defaultLogs
  logs.forEach(log => {
    if (waitingApprovalStages && waitingApprovalStages[0] && waitingApprovalStages[0].flowBuildId === log.buildId) {
      log.isApproving = true
      log.waitingApprovalStages = waitingApprovalStages
    }
  })
  const detailLogs = getTenxflowBuildDetailLogs.logs || defaultDetailStageLogs.logs
  const detailFetching = getTenxflowBuildDetailLogs.isFetching || defaultDetailStageLogs.detailFetching
  return {
    isFetching,
    logs,
    spaceName,
    detailLogs,
    detailFetching
  }
}

TenxFLowDetailLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxflowBuildLogs,
  getTenxflowBuildDetailLogs,
  getTenxflowBuildLastLogs,
  changeBuildStatus,
  approveFlowStage,
})(injectIntl(TenxFLowDetailLog, {
  withRef: true,
}));

