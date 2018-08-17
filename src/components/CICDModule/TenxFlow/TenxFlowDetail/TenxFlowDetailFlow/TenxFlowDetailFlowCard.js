/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailFlowCard component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Card, Modal, Button, Switch, Menu, Dropdown, Tooltip } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import {
  getTenxflowCIRules, UpdateTenxflowCIRules, deleteTenxFlowStateDetail,
  getStageBuildLogList, getRepoBranchesAndTagsByProjectId,
} from '../../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlowCard.less'
import EditTenxFlowModal from './EditTenxFlowModal.js'
import CreateTenxFlowModal from './CreateTenxFlowModal'
import CICDSettingModal from './CICDSettingModal.js'
import StageBuildLog from './StageBuildLog.js'
import SetStageFileLink from './SetStageFileLink.js'
import NotificationHandler from '../../../../../components/Notification'
import PopTabSelect from '../../../../PopTabSelect'

const PopTab = PopTabSelect.Tab;
const PopOption = PopTabSelect.Option;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;

const menusText = defineMessages({
  finish: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.finish',
    defaultMessage: '执行完成',
  },
  running: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.running',
    defaultMessage: '执行中...',
  },
  fail: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.fail',
    defaultMessage: '执行失败',
  },
  wait: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.wait',
    defaultMessage: '等待执行',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.name',
    defaultMessage: '名称：',
  },
  type: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.type',
    defaultMessage: '类型：',
  },
  code: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.code',
    defaultMessage: '代码：',
  },
  branch: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.branch',
    defaultMessage: '分支：',
  },
  cicd: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.cicd',
    defaultMessage: '持续集成',
  },
  view: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.view',
    defaultMessage: '查看触发规则',
  },
  unitCheck: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.unitCheck',
    defaultMessage: '单元测试',
  },
  containCheck: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.containCheck',
    defaultMessage: '集成测试',
  },
  podToPodCheck: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.podToPodCheck',
    defaultMessage: '端对端测试',
  },
  runningCode: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.runningCode',
    defaultMessage: '代码编译',
  },
  buildImage: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.buildImage',
    defaultMessage: '镜像构建',
  },
  linkPod: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.linkPod',
    defaultMessage: '依赖环境',
  },
  startBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.startBtn',
    defaultMessage: '启动',
  },
  stopBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.stopBtn',
    defaultMessage: '停止',
  },
  logBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.logBtn',
    defaultMessage: '执行记录',
  },
  restartBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.restartBtn',
    defaultMessage: '重启',
  },
  editBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.editBtn',
    defaultMessage: '编辑子任务',
  },
  deleteBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.deleteBtn',
    defaultMessage: '删除子任务',
  },
  didNotDelete: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.didNotDelete',
    defaultMessage: '只能从最后一个开始删除哦',
  }
})

//<p style={{bottom: '60px'}}>{podName ? <Link to={`/app_manage/container/${podName}`}>查看执行容器</Link> : ''}</p>
function currentStatus(status, stateType) {
  //this function for show different status
  const podName = status ? status.podName : ''
  const stageStatus = !!status ? status.status : 3;
  const noRunningCheckDetail = <p className="detail-link">
    <Tooltip title="任务未运行">
      <span className="diabledColor">查看详情</span>
    </Tooltip>
  </p>
  switch (stageStatus) {
    case 0:
      if (stateType == 6) {
        return <div className='finishStatus status'>
          <Icon type="check-circle-o" />
          <p>审批通过</p>
        </div>
      }
      return (
        <div className='finishStatus status'>
          <Icon type="check-circle-o" />
          <p><FormattedMessage {...menusText.finish} /></p>
          {noRunningCheckDetail}
        </div>
      );
    case 1:
      return (
        <div className='failStatus status'>
          <Icon type="cross-circle-o" />
          <p><FormattedMessage {...menusText.fail} /></p>
          {noRunningCheckDetail}
        </div>
      );
    case 2:
      if (stateType == 6) {
        return <div className='approvingStatus status'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <p>等待审批</p>
        </div>
      }
      return (
        <div className='runningStatus status'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <p><FormattedMessage {...menusText.running} /></p>
          <p className="detail-link">{podName ? <Link to={`/app_manage/container/${podName}`}>查看详情</Link> : ''}</p>
        </div>
      );
    case 3:
      return (
        <div className='runningStatus status'>
          <Icon type="clock-circle-o" />
          <p><FormattedMessage {...menusText.wait} /></p>
          {noRunningCheckDetail}
        </div>
      );
    case 33: // timeout
      return (
        <div className='failStatus status'>
          <Icon type="cross-circle-o" />
          <p>审批超时</p>
        </div>
      );
    case 34: // deny
      return (
        <div className='failStatus status'>
          <Icon type="cross-circle-o" />
          <p>审批拒绝</p>
        </div>
      );
  }
}

function currentFlowType(type, customTypeText, imageList) {
  //this function for show different flow type
  for (var i in imageList) {
    if (imageList[i].imageList[0].categoryId == type) {
      return (imageList[i].imageList[0].categoryName)
    }
  }
  return
  // switch (type) {
  //   case 1:
  //     return (
  //       <FormattedMessage {...menusText.unitCheck} />
  //     );
  //     break;
  //   case 2:
  //     return (
  //       <FormattedMessage {...menusText.containCheck} />
  //     );
  //     break;
  //   case 4:
  //   case 3:
  //     return (
  //       <FormattedMessage {...menusText.buildImage} />
  //     );
  //     break;
  //     return (
  //       <FormattedMessage {...menusText.runningCode} />
  //     );
  //     break;
  //   case 5:
  //     return customTypeText;
  //     break;
  //   default:
  //     return (
  //       <FormattedMessage {...menusText.linkPod} />
  //     )
  // }
}

function currentStatusBtn(status) {
  //this function for different status show different Btn msg
  const stageStatus = !!status ? status.status : 3;
  switch (stageStatus) {
    case 0:
      return (
        <div>
          <Icon type='caret-right' />
          <span><FormattedMessage {...menusText.startBtn} /></span>
        </div>
      );
    case 2:
      return (
        <div>
          <i className='fa fa-stop' />
          <span><FormattedMessage {...menusText.stopBtn} /></span>
        </div>
      );
    case 1:
    case 33:
    case 34:
      return (
        <div>
          <i className='fa fa-repeat' />
          <span><FormattedMessage {...menusText.restartBtn} /></span>
        </div>
      );
    case 3:
      return (
        <div>
          <i className='fa fa-play' />
          <span><FormattedMessage {...menusText.startBtn} /></span>
        </div>
      );
  }
}

function currentEditClass(status, editIndex, index) {
  //this function for different status and edit show different class
  const stageStatus = !!status ? status.status : 3;
  if (editIndex == index) {
    return 'edittingCard commonCard';
  } else if (stageStatus == 2) {
    return 'runningCard commonCard';
  } else {
    return 'commonCard';
  }
}

function fetchCodeStoreName(id, codeList) {
  //this function for fetcht code store name
  if (!Boolean(id)) {
    return '';
  }
  let codeName = null;
  if (!Boolean(codeList)) {
    return;
  }
  codeList.map((item) => {
    if (item.id == id) {
      codeName = item.name;
    }
  });
  return codeName;
}

function buildButtonCheck(statusInfo) {
  //this function for check the stage status
  //and let the edit button is disable or not
  if (Boolean(statusInfo)) {
    if (statusInfo.status == 2) {
      return true;
    }
  } else {
    return false;
  }
}

function formatStageLink(link) {
  //this function for format link url
  if(Boolean(link)) {
    if(Boolean(link.sourceDir)) {
      return link.sourceDir;
    } else {
      return '';
    }
  } else {
    return '';
  }
}

class TenxFlowDetailFlowCard extends Component {
  constructor(props) {
    super(props);
    this.editFlow = this.editFlow.bind(this);
    this.cancelEditCard = this.cancelEditCard.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.ciRulesChangeSuccess = this.ciRulesChangeSuccess.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.openSettingStageFile = this.openSettingStageFile.bind(this);
    this.renderBuildBtn = this.renderBuildBtn.bind(this);
    this.loadTenxflowCIRules = this.loadTenxflowCIRules.bind(this);
    this.state = {
      editStatus: false,
      cicdSetModalShow: false,
      ciRulesOpened: props.config.spec.ci.enabled == 1,
      TenxFlowDeployLogModal: false,
      setStageFileModal: false,
      currentConfig: null,
    }
  }

  componentWillMount() {
    this.setState({
      ciRulesOpened: this.props.config.spec.ci.enabled == 1 ? true : false
    });
  }

  componentWillReceiveProps(nextProps) {
    // let ciRulesOpened = nextProps.config.spec.ci.enabled == 1 ? true : false;
    // this.setState({
    //   ciRulesOpened: ciRulesOpened
    // });
  }

  editFlow() {
    //this function for user click the edit button and then open the edit modal
    const { scope, index } = this.props;
    scope.setState({
      currentFlowEdit: index,
      createNewFlow: false
    });
  }

  operaMenuClick(item) {
    //this function for user click the dropdown menu
    this.setState({delFlowModal: true, stageId: item})
  }
  delFlowItem() {
    const { scope, deleteTenxFlowStateDetail, flowId } = this.props;
    const { getTenxFlowStateList } = scope.props;
    let notification = new NotificationHandler()
    const self = this
    this.setState({delFlowModal: false})
    deleteTenxFlowStateDetail(flowId, this.state.stageId, {
      success: {
        func: () => {
          notification.success('删除构建子任务', '删除构建子任务成功');
          getTenxFlowStateList(flowId, {
            success: {
              func: (results) => {
                self.handWebSocket(scope, results)
              }
            }
          });
        },
        isAsync: true
      }
    })
  }
  handWebSocket(scope, res){
    let buildingList = []
    res.data.results.map((item) => {
      let buildId = null;
      if (!Boolean(item.lastBuildStatus)) {
        buildId = null;
      } else {
        buildId = item.lastBuildStatus.buildId;
      }
      let buildItem = {
        buildId: buildId,
        stageId: item.metadata.id
      }
      if (item.lastBuildStatus) {
        buildItem.status = item.lastBuildStatus.status
      }
      buildingList.push(buildItem)
    })
    scope.onSetup(scope.state.socket, buildingList)
  }

  cancelEditCard() {
    //this function for user cancel edit the card
    const { scope } = this.props;
    scope.setState({
      currentFlowEdit: null
    });
  }

  buildFlow(stageId, type, stageName, key, tabKey) {
    //this function for user build single stage
    const { scope } = this.props;
    const stageStatus = !!type ? type.status : 3;
    if (stageStatus == 2) {
      scope.stopBuildFlow(stageId, stageName);
    } else {
      const options = {}
      if (key && tabKey) {
        options.branch = key
      }
      scope.buildFlow(stageId, options);
    }
  }

  ciRulesChangeSuccess() {
    //this function for alert user the ci rules change sucees
    let notification = new NotificationHandler()
    notification.success('CI规则', 'CI规则修改成功~');
    const scope = this.props.scope
    const flowId = scope.props.flowId
    scope.props.getTenxFlowStateList(flowId)
  }

  openTenxFlowDeployLogModal(stageId) {
    //this function for user open the modal of tenxflow deploy log
    const { flowId, getStageBuildLogList } = this.props;
    this.setState({
      TenxFlowDeployLogModal: true,
      currentStageID: stageId
    });
    getStageBuildLogList(flowId, stageId)
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  openSettingStageFile() {
    //this function for open the setting stage file modal
    this.setState({
      setStageFileModal: true
    })
  }

  renderBuildBtn(config, preStage) {
    const { getRepoBranchesAndTagsByProjectId } = this.props
    const { repoBranchesAndTags } = this.props
    const project = config.spec.project || {}
    const projectId = project.id
    const { lastBuildStatus } = config
    const { id, name, type } = config.metadata
    let disabled = false
    if (preStage && preStage.link && preStage.link.enabled == 1 && preStage.link.sourceDir != "") {
      disabled = true
    }
    const btn = currentStatusBtn(lastBuildStatus)
    if ((lastBuildStatus && lastBuildStatus.status === 2) || type == 6) {
      return (
        <Button size='large' type='primary' className='startBtn'
          onClick={this.buildFlow.bind(this, id, lastBuildStatus, name, null, null)}>
          {btn}
        </Button>
      )
    }
    let targetElement = (
      <Button size='large' type='primary' className='startBtn' disabled={disabled}
        onClick={() => {
          const notification = new NotificationHandler()
          if (project.repoType === 'svn') {
            this.buildFlow(id, lastBuildStatus, name, null, null)
            return
          }
          projectId && getRepoBranchesAndTagsByProjectId(projectId, {
            failed: {
              func: res => {
                if (res.statusCode == 500) {
                  return notification.error('代码仓库暂时无法访问，请检查相关配置后重试')
                }
              }
            }
          })
        }}>
        {btn}
      </Button>
    )
    if (disabled) {
      targetElement = (
        <Tooltip
          title="子任务依赖前面任务的输出，不能单独执行"
          placement="left"
          getTooltipContainer={() => document.getElementById('TenxFlowDetailFlow')}
        >
          <div className="disabledBoxForToolTip">
            {targetElement}
          </div>
        </Tooltip>
      )
    }
    if (project.repoType === 'svn') {
      return targetElement
    }
    const tabs = []
    let loading
    const branchesAndTags = repoBranchesAndTags[projectId]
    if (!branchesAndTags || (!branchesAndTags.data.branches && !branchesAndTags.data.tags)) {
      tabs.push(<PopOption key="not_found_branches_tags">未找到分支及标签，点击构建</PopOption>)
    } else {
      const { isFetching, data } = branchesAndTags
      loading = isFetching
      const { branches, tags } = data
      for(let key in data) {
        if (data.hasOwnProperty(key)) {
          tabs.push(
            <PopTab key={key} title={key === 'branches' ? '分支' : '标签'}>
              {
                data[key].map(item => {
                  let name = item.branch || item.tag
                  return <PopOption key={name}>{name}</PopOption>
                })
              }
            </PopTab>
          )
        }
      }
    }

    return (
      <PopTabSelect
        placeholder="请输入分支或标签"
        onChange={this.buildFlow.bind(this, id, lastBuildStatus, name)}
        targetElement={targetElement}
        loading={loading}
        isShowBuildBtn={true}
        getTooltipContainer={() => document.body}>
        {tabs}
      </PopTabSelect>
    )
  }

  loadTenxflowCIRules() {
    const { getTenxflowCIRules, flowId } = this.props
    getTenxflowCIRules(flowId)
  }

  render() {
    let {
      config, preStage, index, scope, uniformRepo,
      currentFlowEdit, flowId, codeList,
      isFetching, ciRules, buildFetching,
      logs, supportedDependencies, totalLength,
      imageList, toggleCustomizeBaseImageModal,
      baseImages, firstState,
      currentStageAdd, setCurrentStageAdd,
      CreateTenxFlowModalEl,
    } = this.props;
    const scopeThis = this;
    const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, config.metadata.id)} style={{ width: '110px' }}>
          <Menu.Item
            key='deleteStage'
            disabled={index == 0 && totalLength > 1}
          >
            <Icon type='delete' style={{ float: 'left', lineHeight: '16px', marginRight: '5px', fontSize: '14px' }} />
            <span style={{ float: 'left', lineHeight: '16px', fontSize: '14px' }}>
              <FormattedMessage {...menusText.deleteBtn} />
            </span>
            <div style={{ clear: 'both' }}></div>
          </Menu.Item>
        </Menu>
      )
    return (
      <div>
        <div key={'TenxFlowDetailFlowCard' + index} className={currentFlowEdit == index ? 'TenxFlowDetailFlowCard TenxFlowDetailFlowCardBigDiv' : 'TenxFlowDetailFlowCard'} >
          <Card className={currentEditClass(config.lastBuildStatus, currentFlowEdit, index)}>
            {
              currentFlowEdit != index
                ? <QueueAnim key={'FlowCardShowAnimate' + index}>
                  <div key={'TenxFlowDetailFlowCardShow' + index}>
                    <div className='statusBox'>
                      {currentStatus(config.lastBuildStatus, config.metadata.type)}
                    </div>
                    <div className='infoBox'>
                      <div className='name commonInfo'>
                        <div className='info'>
                          <span className='infoSpan'>{config.metadata.name}</span>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                      </div>
                      <div className='btnBox'>
                        {/*<Button size='large' type='primary' className='startBtn'
                          onClick={this.buildFlow.bind(this, config.metadata.id, config.lastBuildStatus, config.metadata.name)}>
                          {currentStatusBtn(config.lastBuildStatus)}
                        </Button>*/}
                        {
                          this.renderBuildBtn(config, preStage)
                        }
                        <Button size='large' type='ghost' className='logBtn' onClick={this.openTenxFlowDeployLogModal.bind(this, config.metadata.id)}>
                          <svg className='cicdlogSvg'>
                            <use xlinkHref='#cicdlog' />
                          </svg>
                          <FormattedMessage {...menusText.logBtn} />
                        </Button>
                        {this.props.isBuildImage ? <Button size='large' type='ghost' className='logBtn' onClick={this.editFlow}>
                          <svg className='cicdlogSvg'>
                            <use xlinkHref='#cicdedit' />
                          </svg>
                          <FormattedMessage {...menusText.editBtn} />
                        </Button>
                          :
                          <Dropdown.Button overlay={dropdown} type='ghost' size='large'
                          className='editBtn' onClick={this.editFlow} disabled={buildButtonCheck(config.lastBuildStatus)}>
                          <svg className='cicdlogSvg'>
                            <use xlinkHref='#cicdedit' />
                          </svg>
                          <FormattedMessage {...menusText.editBtn} />
                        </Dropdown.Button>}

                        <div style={{ clear: 'both' }}></div>
                      </div>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </QueueAnim>
                : null
            }
            {
              currentFlowEdit == index
                ? <QueueAnim key={'EditTenxFlowModalAnimate' + index}>
                  <EditTenxFlowModal key={'EditTenxFlowModal' + index} rootScope={scope} scope={scopeThis}
                    config={config} flowId={flowId} stageId={config.metadata.id} codeList={codeList} index={index}
                    supportedDependencies={supportedDependencies} imageList={imageList} baseImages={baseImages}
                    otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={toggleCustomizeBaseImageModal}
                    uniformRepo={uniformRepo} isBuildImage={this.props.isBuildImage}
                    />
                </QueueAnim>
                : null
            }
            {
              (index == 0 && currentFlowEdit != index) && (
                <div className='cicdBox' key='cicdBox'>
                  <a onClick={() => {
                    this.setState({
                      cicdSetModalShow: true,
                      currentConfig: config,
                    })
                    this.loadTenxflowCIRules()
                  }}>
                  CI 已{this.state.ciRulesOpened ? '开启' : '关闭'}
                  </a>
                </div>
              )
            }
          </Card>
          {
            currentFlowEdit != index ? (
              <div className={config.lastBuildStatus == 'finish' ? 'finishArrow arrowBox' : 'arrowBox'} key='finishArrow'>
                {index != (totalLength - 1) ? [<Button size='large' className='fileButton' type='ghost' onClick={this.openSettingStageFile}>
                                              <span>{config.lastBuildStatus == 'finish' ? '重选文件' : '提取文件'}</span>
                                            </Button>] : null}
                {this.props.isBuildImage ? '' : <svg className='cicdarrow'>
                  <use xlinkHref='#cicdarrow' />
                </svg> }
                {
                  (index != (totalLength - 1) && config.link.enabled === 1)
                    ? <p className='fileUrl'>{formatStageLink(config.link)}</p>
                    : (index != (totalLength - 1) && <div className="addBtn">
                      <Tooltip
                        title="添加子任务"
                      >
                        <Button
                          icon="plus"
                          shape="circle-outline"
                          onClick={() => setCurrentStageAdd(index)}
                          disabled={this.props.flowBuildStatus == 2}
                        />
                      </Tooltip>
                    </div>)
                }
              </div>
            ) : null
          }
          <div style={{ clear: 'both' }}></div>
          <Modal className='tenxFlowCicdSetting'
            visible={this.state.cicdSetModalShow}
            onCancel={()=>this.setState({cicdSetModalShow:false})}
            maskClosable={true}
            >
            <CICDSettingModal
              scope={scopeThis}
              flowId={flowId}
              ciRules={ciRules}
              isFetching={isFetching}
              visible={this.state.cicdSetModalShow}
              config={this.state.currentConfig}
              ciRulesOpened={this.state.ciRulesOpened}
              loadTenxflowCIRules={this.loadTenxflowCIRules}
            />
          </Modal>
          <Modal
            visible={this.state.TenxFlowDeployLogModal}
            className='TenxFlowBuildLogModal'
            onCancel={this.closeTenxFlowDeployLogModal}
            >
            <StageBuildLog
              parent={scopeThis}
              isFetching={buildFetching}
              logs={logs}
              flowId={flowId}
              visible={this.state.TenxFlowDeployLogModal}
              stageId={this.state.currentStageID}
              stage={config}
            />
          </Modal>
          <Modal
            visible={this.state.setStageFileModal}
            className='tenxFlowCicdSetting'
            onCancel={()=>this.setState({setStageFileModal:false})}
            >
            <SetStageFileLink scope={scopeThis} flowId={flowId} config={config} />
          </Modal>
          <Modal title="删除子任务操作" visible={this.state.delFlowModal}
            onOk={()=> this.delFlowItem()} onCancel={()=> this.setState({delFlowModal: false})}
            >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              您是否确定要删除子任务 {config.metadata.name} 这项操作?
            </div>
          </Modal>
        </div>
        {
          currentStageAdd === index &&
          <div className="TenxFlowDetailFlowCard TenxFlowDetailFlowCardBigDiv">
            <Card className="edittingCard commonCard">{CreateTenxFlowModalEl}</Card>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultCiRules = {
    isFetching: false,
    ciRules: {}
  }
  const defaultLogList = {
    isFetching: false,
    logs: []
  }
  const { getTenxflowCIRules, repoBranchesAndTags } = state.cicd_flow;
  const { isFetching, ciRules } = getTenxflowCIRules || defaultCiRules
  const { getStageBuildLogList } = state.cicd_flow
  const { logs } = getStageBuildLogList || defaultLogList

  const buildFetching = getStageBuildLogList ? getStageBuildLogList.isFetching : defaultLogList.isFetching
  return {
    isFetching,
    ciRules,
    logs,
    buildFetching,
    repoBranchesAndTags,
  }
}

TenxFlowDetailFlowCard.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxflowCIRules,
  UpdateTenxflowCIRules,
  deleteTenxFlowStateDetail,
  getStageBuildLogList,
  getRepoBranchesAndTagsByProjectId,
})(injectIntl(TenxFlowDetailFlowCard, {
  withRef: true,
}));

