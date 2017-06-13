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
import CICDSettingModal from './CICDSettingModal.js'
import StageBuildLog from './StageBuildLog.js'
import SetStageFileLink from './SetStageFileLink.js'
import NotificationHandler from '../../../../../common/notification_handler'
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
function currentStatus(status) {
  //this function for show different status
  const podName = status ? status.podName : ''
  const stageStatus = !!status ? status.status : 3;
  switch (stageStatus) {
    case 0:
      return (
        <div className='finishStatus status'>
          <Icon type="check-circle-o" />
          <p><FormattedMessage {...menusText.finish} /></p>
          <p style={{bottom: '60px'}}>{podName ? <Link to={`/app_manage/container/${podName}`}>查看详情</Link> : ''}</p>
        </div>
      );
    case 2:
      return (
        <div className='runningStatus status'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <p><FormattedMessage {...menusText.running} /></p>
          <p style={{bottom: '60px'}}>{podName ? <Link to={`/app_manage/container/${podName}`}>查看详情</Link> : ''}</p>
        </div>
      );
    case 1:
      return (
        <div className='failStatus status'>
          <Icon type="cross-circle-o" />
          <p><FormattedMessage {...menusText.fail} /></p>
          <p style={{bottom: '60px'}}>{podName ? <Link to={`/app_manage/container/${podName}`}>查看详情</Link> : ''}</p>
        </div>
      );
    case 3:
      return (
        <div className='runningStatus status'>
          <Icon type="clock-circle-o" />
          <p><FormattedMessage {...menusText.wait} /></p>
          <p style={{bottom: '60px'}}>{podName ? <Link to={`/app_manage/container/${podName}`}>查看详情</Link> : ''}</p>
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
    this.viewCicdBox = this.viewCicdBox.bind(this);
    this.viewCicdBoxP = this.viewCicdBoxP.bind(this);
    this.cancelEditCard = this.cancelEditCard.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.ciRulesChangeSuccess = this.ciRulesChangeSuccess.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.openSettingStageFile = this.openSettingStageFile.bind(this);
    this.renderBuildBtn = this.renderBuildBtn.bind(this);
    this.state = {
      editStatus: false,
      cicdSetModalShow: false,
      ciRulesOpened: false,
      TenxFlowDeployLogModal: false,
      setStageFileModal: false
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

  viewCicdBox(e) {
    //this function for user change open cicd or not
    const { getTenxflowCIRules, UpdateTenxflowCIRules, flowId, config } = this.props;
    const _this = this;
    let notification = new NotificationHandler()
    if (e) {
      getTenxflowCIRules(flowId);
      this.setState({
        cicdSetModalShow: true,
      });
      return
    }
    confirm({
      title: '确定关闭持续集成？',
      content: `关闭持续集成`,
      onOk() {
        let body = {
          enabled: 0,
          config: {
            branch: null,
            tag: null,
            mergeRequest: null,
            buildCluster: config.spec.ci.config.buildCluster
          }
        }
        UpdateTenxflowCIRules(flowId, body, {
          success: {
            func: (res) => {
              notification.success('持续集成', '关闭持续集成成功');
            },
            isAsync: true
          }
        });
        _this.setState({
          cicdSetModalShow: false,
          ciRulesOpened: false
        });
      },
      onCancel() { }
    })
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
  viewCicdBoxP(e) {
    //this function for open the modal of cicd
    const { getTenxflowCIRules, flowId } = this.props;
    getTenxflowCIRules(flowId);
    this.setState({
      cicdSetModalShow: true
    });
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
    this.setState({
      ciRulesOpened: true
    })
  }

  openTenxFlowDeployLogModal(stageId) {
    //this function for user open the modal of tenxflow deploy log
    const { flowId, getStageBuildLogList } = this.props;
    this.setState({
      TenxFlowDeployLogModal: true
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
    const { id, name } = config.metadata
    let disabled = false
    if (preStage && preStage.link && preStage.link.enabled == 1 && preStage.link.sourceDir != "") {
      disabled = true
    }
    const btn = currentStatusBtn(lastBuildStatus)
    if ((lastBuildStatus && lastBuildStatus.status === 2) || project.repoType === 'svn') {
      return (
        <Button size='large' type='primary' className='startBtn'
          onClick={this.buildFlow.bind(this, id, lastBuildStatus, name, null, null)}>
          {btn}
        </Button>
      )
    }
    let targetElement = (
      <Button size='large' type='primary' className='startBtn'
        onClick={() => projectId && getRepoBranchesAndTagsByProjectId(projectId)}>
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
            <Button size='large' type='primary' className='startBtn'
              onClick={() => projectId && getRepoBranchesAndTagsByProjectId(projectId)}
              disabled={disabled}
            >
              {btn}
            </Button>
          </div>
        </Tooltip>
      )
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
        onChange={this.buildFlow.bind(this, id, lastBuildStatus, name)}
        targetElement={targetElement}
        loading={loading}
        isShowBuildBtn={true}
        getTooltipContainer={() => document.body}>
        {tabs}
      </PopTabSelect>
    )
  }

  render() {
    let {
      config, preStage, index, scope, uniformRepo,
      currentFlowEdit, flowId, codeList,
      isFetching, ciRules, buildFetching,
      logs, supportedDependencies, totalLength,
      imageList, toggleCustomizeBaseImageModal,
      baseImages, firstState,
    } = this.props;
    const scopeThis = this;
    const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, config.metadata.id)} style={{ width: '110px' }}>
          <Menu.Item key='deleteStage' disabled={index == (totalLength - 1) ? false : true}>
            <Icon type='delete' style={{ float: 'left', lineHeight: '16px', marginRight: '5px', fontSize: '14px' }} />
            <span style={{ float: 'left', lineHeight: '16px', fontSize: '14px' }} ><FormattedMessage {...menusText.deleteBtn} /></span>
            <div style={{ clear: 'both' }}></div>
          </Menu.Item>
        </Menu>
      )
    return (
      <div id='TenxFlowDetailFlowCard' key={'TenxFlowDetailFlowCard' + index} className={currentFlowEdit == index ? 'TenxFlowDetailFlowCardBigDiv' : ''} >
        <Card className={currentEditClass(config.lastBuildStatus, currentFlowEdit, index)}>
          {
            currentFlowEdit != index ? [
              <QueueAnim key={'FlowCardShowAnimate' + index}>
                <div key={'TenxFlowDetailFlowCardShow' + index} id={this.cardId}>
                  <div className='statusBox'>
                    {currentStatus(config.lastBuildStatus)}
                  </div>
                  <div className='infoBox'>
                    <div className='name commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.name} />
                      </div>
                      <div className='info'>
                        <span className='infoSpan'>{config.metadata.name}</span>
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className='type commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.type} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-cog' />
                        {currentFlowType(config.metadata.type, config.metadata.customType, imageList)}
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className='code commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.code} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-github' />
                        <span className='infoSpan'>{!!config.spec.project ? fetchCodeStoreName(config.spec.project.id, codeList) : null}</span>
                        <div style={{ clear: 'both' }}></div>
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className='branch commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.branch} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-sitemap' />
                        <span className='infoSpan'>{!!config.spec.project ? config.spec.project.branch : null}</span>
                        <div style={{ clear: 'both' }}></div>
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
            ] : null
          }
          {
            currentFlowEdit == index ? [
              <QueueAnim key={'EditTenxFlowModalAnimate' + index}>
                <EditTenxFlowModal key={'EditTenxFlowModal' + index} rootScope={scope} scope={scopeThis}
                  config={config} flowId={flowId} stageId={config.metadata.id} codeList={codeList} index={index}
                  supportedDependencies={supportedDependencies} imageList={imageList} baseImages={baseImages}
                  otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={toggleCustomizeBaseImageModal}
                  uniformRepo={uniformRepo} isBuildImage={this.props.isBuildImage}
                  />
              </QueueAnim>
            ] : null
          }
          {
            (index == 0 && currentFlowEdit != index) && (
              (config.spec.project && config.spec.project.repoType === 'svn')
              ? (
                <Tooltip title="SVN 代码库不支持持续集成">
                  <div className='cicdBox' key='cicdBox'>
                    <Switch disabled/>
                    <p className='switchTitile' style={{color: '#ccc'}}><FormattedMessage {...menusText.cicd} /></p>
                  </div>
                </Tooltip>
              )
              : (
                <div className='cicdBox' key='cicdBox'>
                  <Switch onChange={this.viewCicdBox} checked={this.state.ciRulesOpened} />
                  <p className='switchTitile'><FormattedMessage {...menusText.cicd} /></p>
                  <p className='viewP' onClick={()=>this.viewCicdBoxP()}><FormattedMessage {...menusText.view} /></p>
                </div>
              )
            )
          }
        </Card>
        {
          currentFlowEdit != index ? [
            <div className={config.lastBuildStatus == 'finish' ? 'finishArrow arrowBox' : 'arrowBox'} key='finishArrow'>
              {index != (totalLength - 1) ? [<Button size='large' className='fileButton' type='ghost' onClick={this.openSettingStageFile}>
                                            <span>{config.lastBuildStatus == 'finish' ? '重选文件' : '提取文件'}</span>
                                          </Button>] : null}
              {this.props.isBuildImage ? '' : <svg className='cicdarrow'>
                <use xlinkHref='#cicdarrow' />
              </svg> }
              {(index != (totalLength - 1) && config.link.enabled === 1) ? [<p className='fileUrl'>{formatStageLink(config.link)}</p>]:null}
            </div>
          ] : null
        }
        <div style={{ clear: 'both' }}></div>
        <Modal className='tenxFlowCicdSetting'
          visible={this.state.cicdSetModalShow}
          >
          <CICDSettingModal scope={scopeThis} flowId={flowId}
            ciRules={ciRules} isFetching={isFetching} visible={this.state.cicdSetModalShow}/>
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <StageBuildLog scope={scopeThis} isFetching={buildFetching} logs={logs} flowId={flowId} visible={this.state.TenxFlowDeployLogModal}/>
        </Modal>
        <Modal
          visible={this.state.setStageFileModal}
          className='tenxFlowCicdSetting'
          >
          <SetStageFileLink scope={scopeThis} flowId={flowId} config={config} />
        </Modal>
        <Modal title="删除子任务操作" visible={this.state.delFlowModal}
          onOk={()=> this.delFlowItem()} onCancel={()=> this.setState({delFlowModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除子任务 {config.metadata.name} 这项操作?</div>
        </Modal>
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

