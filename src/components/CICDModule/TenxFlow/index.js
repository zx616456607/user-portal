/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowList component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin, notification } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getTenxFlowList, deleteTenxFlowSingle, getTenxflowBuildLastLogs ,CreateTenxflowBuild , getTenxflowBuildDetailLogs} from '../../../actions/cicd_flow'
import { DEFAULT_REGISTRY } from '../../../constants'
import CreateTenxFlow from './CreateTenxFlow.js'
import TenxFlowBuildLog from './TenxFlowBuildLog'
import moment from 'moment'
import './style/TenxFlowList.less'
import { cloneDeep } from 'lodash'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.TenxFlowList.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowList.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.TenxFlowList.updateTime',
    defaultMessage: '更新时间',
  },
  status: {
    id: 'CICD.Tenxflow.TenxFlowList.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.TenxFlowList.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowList.tooltips',
    defaultMessage: 'TenxFlow：这里完成【代码项目构建、测试】等流程的定义与执行，可以实现若干个（≥1）项目组成的一个Flow，由若干个项目流程化完成一个Flow，直至完成整个总项目，其中大部分流程以生成应用镜像为结束标志。',
  },
  create: {
    id: 'CICD.Tenxflow.TenxFlowList.create',
    defaultMessage: '创建TenxFlow',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyLog',
    defaultMessage: '构建记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyStart',
    defaultMessage: '立即构建',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowList.delete',
    defaultMessage: '删除TenxFlow',
  },
  unUpdate: {
    id: 'CICD.Tenxflow.TenxFlowList.unUpdate',
    defaultMessage: '未更新',
  }
})

function dateFormat(dateString) {
  if (!dateString) {
    return '';
  }
  var timeStr = moment(dateString);
  return timeStr.format("YYYY-MM-DD HH:mm:ss")
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    let key = e.key;
    let { flowId } = item;
    const { scope } = this.props;
    const { deleteTenxFlowSingle, getTenxFlowList } = scope.props;
    Modal.confirm({
      title: '您是否确认要删除这项内容',
      content: (<h3>{item.name}</h3>),
      onOk() {
        deleteTenxFlowSingle(flowId, {
          success: {
            func: () => getTenxFlowList(),
            isAsync: true
          },
          failed: {
            func: (res)=> {
              let statusCode = res.statusCode;
              switch(statusCode) {
                case 500: 
                  break;
              }
              notification['error']({
                message: '删除失败',
                description: '',
              });
            }
          }
        })
      }
    });
    
  },
  showDeloyLog: function (item, e) {
    //this function for show user the deploy log of the tenxflow
    const { scope } = this.props;
    scope.setState({
      TenxFlowDeployLogModal: true
    });
  },
  starFlowBuild(flowId, index) {
    const {CreateTenxflowBuild ,getTenxflowBuildDetailLogs} = this.props.scope.props
    const parentScope = this.props.scope
    CreateTenxflowBuild(flowId, {}, {
      success: {
        func: (res) => {
          getTenxflowBuildDetailLogs(flowId, res.data.results.flowBuildId, {
            success: {
              func: (result) => {
                const flowListState = cloneDeep(parentScope.state.flowListState)
                flowListState[index].status = result.data.results.results[0].status
                parentScope.setState({
                  flowListState
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: (res)=> {
          Modal.error({
            title: '构建失败',
            content: (res.message.results.message)
          });
        }
      }
    })
  },
  render: function () {
    const { config, scope, isFetching } = this.props;
    const { flowListState } = this.props.scope.state
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const items = config.map((item, index) => {
      let status = ''
      switch (flowListState[index].status) {
        case 0:
          status = '成功'
          break;
        case 1:
          status = "失败"
          break;
        case 2:
          status = "执行中..."
          break;
        default:
          status = "等待中..."
      }
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)}>
          <Menu.Item key='deleteFlow'>
            <i className='fa fa-trash' style={{lineHeight: '20px', marginRight: '5px' }} />&nbsp;
            <FormattedMessage {...menusText.delete} style={{display:'inlineBlock'}}/>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='tenxflowDetail' key={item.name} >
          <div className='name'>
            <Link to={`/ci_cd/tenx_flow/tenx_flow_build?${item.flowId}`}>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='time'>
            <span className='timeSpan'>
              <Tooltip placement='topLeft' title={item.updateTime ? dateFormat(item.updateTime) : dateFormat(item.createTime)}>
                <span>{item.updateTime ? dateFormat(item.updateTime) : dateFormat(item.createTime) }</span>
              </Tooltip>
            </span>
          </div>
          <div className={`status status-`+`${flowListState[index].status}`}>
            <span><i className="fa fa-circle"></i>{status}</span>
          </div>
          <div className='oprea'>
            <Button className='logBtn' size='large' type='primary' onClick={scope.openTenxFlowDeployLogModal.bind(scope, item.flowId)}>
              <i className='fa fa-wpforms' />&nbsp;
              <FormattedMessage {...menusText.deloyLog} />
            </Button>
            <Dropdown.Button overlay={dropdown} type='ghost' size='large'>
              <span onClick={()=> this.starFlowBuild(item.flowId, index)}>
                <i className='fa fa-pencil-square-o' />&nbsp;
                <FormattedMessage {...menusText.deloyStart} />
              </span>
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='tenxflowList'>
        {items}
      </div>
    );
  }
});

class TenxFlowList extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      currentTenxFlow: null,
      currentFlowId: null
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
    const { getTenxFlowList } = this.props;
    const self = this
    getTenxFlowList({
      success: {
        func:(res) => {
          const flowListState = []
          res.data.results.forEach((list, index) => {
            flowListState.push({status:list.status})
          })
          self.setState({
            flowListState
          })
        }
      }
    });
  }

  openCreateTenxFlowModal() {
    //this function for user open the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: true
    });
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false
    });
  }

  openTenxFlowDeployLogModal(flowId) {
    //this function for user open the modal of tenxflow deploy log
    const { getTenxflowBuildLastLogs } = this.props;
    getTenxflowBuildLastLogs(flowId)
    this.setState({
      TenxFlowDeployLogModal: true,
      currentFlowId: flowId
    });
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { isFetching, flowList, buildFetching, logs, cicdApi } = this.props;
    let message = ''
    if (flowList.length < 1) {
      message = " * 目前还没有添加任何 TenxFlow"
    }
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='TenxFlowList' key='TenxFlowList'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Button className='createBtn' size='large' type='primary' onClick={this.openCreateTenxFlowModal}>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.create} />
            </Button>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'></i>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='time'>
                <FormattedMessage {...menusText.updateTime} />
              </div>
              <div className='status'>
                <FormattedMessage {...menusText.status} />
              </div>
              <div className='oprea'>
                <FormattedMessage {...menusText.opera} />
              </div>
            </div>
            <MyComponent scope={scope} config={flowList} isFetching={isFetching} />
          </Card>
        </div>
        <Modal
          visible={this.state.createTenxFlowModal}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeCreateTenxFlowModal}
          >
          <CreateTenxFlow scope={scope} isFetching={isFetching} flowList={flowList} />
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={this.state.currentFlowId} />
        </Modal>
        <div><br/>{message}<br/></div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowList = {
    isFetching: false,
    flowList: [],
  }
  const defaultBuildLog = {
    buildFetching: false,
    logs: [],
  }
  const { getTenxflowList } = state.cicd_flow
  const { isFetching, flowList } = getTenxflowList || defaultFlowList
  const { getTenxflowBuildLastLogs } = state.cicd_flow
  const { logs } = getTenxflowBuildLastLogs || defaultBuildLog
  let buildFetching = getTenxflowBuildLastLogs.isFetching || defaultBuildLog.buildFetching
  return {
    isFetching,
    flowList,
    buildFetching,
    logs
  }
}

TenxFlowList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowList,
  deleteTenxFlowSingle,
  getTenxflowBuildLastLogs,
  CreateTenxflowBuild,
  getTenxflowBuildDetailLogs
})(injectIntl(TenxFlowList, {
  withRef: true,
}));

