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
import { Spin, Icon, Card, Modal, Button, Switch, Menu, Dropdown, notification } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { getTenxflowCIRules, UpdateTenxflowCIRules, deleteTenxFlowStateDetail } from '../../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlowCard.less'
import EditTenxFlowModal from './EditTenxFlowModal.js'
import CICDSettingModal from './CICDSettingModal.js'

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
  other: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.other',
    defaultMessage: '自定义',
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
    defaultMessage: '编辑项目',
  },
  deleteBtn: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.deleteBtn',
    defaultMessage: '删除项目',
  },
})

function currentStatus(status) {
  //this function for show different status
  const stageStatus = !!status ? status.status : 3;
  switch(stageStatus) {
    case 0:
      return (
        <div className='finishStatus status'>
          <Icon type="check-circle-o" />
          <p><FormattedMessage {...menusText.finish} /></p>
        </div>
        );
      break;
    case 2:
      return (
        <div className='runningStatus status'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <p><FormattedMessage {...menusText.running} /></p>
        </div>
        );
      break;
    case 1:
       return (
          <div className='failStatus status'>
            <Icon type="cross-circle-o" />
            <p><FormattedMessage {...menusText.fail} /></p>
          </div>
        );
      break;
    case 3:
      return (
        <div className='runningStatus status'>
          <Icon type="clock-circle-o" />
          <p><FormattedMessage {...menusText.wait} /></p>
        </div>
        );
      break;
  }
}
  
function currentFlowType(type) {
  //this function for show different flow type
  switch(type) {
    case 1:
      return (
        <FormattedMessage {...menusText.unitCheck} />
        );
      break;
    case 2:
      return (
        <FormattedMessage {...menusText.containCheck} />
        );
      break;
//  case 3:
//    return (
//      <FormattedMessage {...menusText.podToPodCheck} />
//      );
//    break;
    case 4:
      return (
        <FormattedMessage {...menusText.runningCode} />
        );
      break;
    case 3:
      return (
        <FormattedMessage {...menusText.buildImage} />
        );
      break;
    case 6:
      return (
        <FormattedMessage {...menusText.other} />
        );
      break;
  }
}
  
function currentStatusBtn(status) {
  //this function for different status show different Btn msg
  const stageStatus = !!status ? status.status : 3;
  switch(stageStatus) {
    case 0:
      return (
        <div>
          <i className='fa fa-play' />
          <span><FormattedMessage {...menusText.startBtn} /></span>
        </div>
        );
      break;
    case 2:
      return (
        <div>
          <i className='fa fa-stop' />
          <span><FormattedMessage {...menusText.stopBtn} /></span>
        </div>
        );
      break;
    case 1:
      return (
        <div>
          <i className='fa fa-repeat' />
          <span><FormattedMessage {...menusText.restartBtn} /></span>
        </div>
        );
      break;
    case 3:
      return (
        <div>
          <i className='fa fa-play' />
          <span><FormattedMessage {...menusText.startBtn} /></span>
        </div>
        );
      break;
  }
}

function currentEditClass(status, editIndex, index) {
  //this function for different status and edit show different class
  const stageStatus = !!status ? status.status : 3;
  if(editIndex == index) {
    return 'edittingCard commonCard';
  }else if(stageStatus == 2) {
    return 'runningCard commonCard';
  }else {
    return 'commonCard';
  } 
}

function fetchCodeStoreName(id, codeList) {
  //this function for fetcht code store name 
  let codeName = null;
  if(!Boolean(codeList)) {
    return;
  }
  codeList.map((item) => {
    if(item.id == id) {
      codeName = item.name;
    }
  });
  return codeName;
}

function buildButtonCheck(statusInfo) {
  //this function for check the stage status
  //and let the edit button is disable or not
  if(Boolean(statusInfo)) {
    if(statusInfo.status == 2) {
      return true;
    }
  } else {
    return false;
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
    this.state = {
      editStatus: false,
      cicdSetModalShow: false,
      ciRulesOpened: false
    }
  }
  
  componentWillReceiveProps(nextProps) {
    let ciRulesOpened = nextProps.config.spec.ci.enabled == 1 ? true : false;
    this.setState({
      ciRulesOpened: ciRulesOpened
    });
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
    const { getTenxflowCIRules, UpdateTenxflowCIRules, flowId } = this.props;
    const _this = this;
    if(e){
      getTenxflowCIRules(flowId);
      this.setState({
        cicdSetModalShow: true
      });
    }else {
      confirm({
        title: '确定关闭持续集成？',
        content: `关闭持续集成`,
        onOk() {            
          let body = {
            enabled: 0,
            config: {
              branch: null,
              tag: null,
              mergeRequest: null
            }
          }
          UpdateTenxflowCIRules(flowId, body, {
            success: {
              func: (res) => {
                notification['success']({
                  message: '持续集成',
                  description: '关闭持续集成成功~',
                });
              },
              isAsync: true
            }
          });
          _this.setState({
            cicdSetModalShow: false,
            ciRulesOpened: false
          });
        },
        onCancel() {},
      });
    }
  }
  
  operaMenuClick(item, name, e) {
    //this function for user click the dropdown menu
    let key = e.key;
    const { scope, deleteTenxFlowStateDetail, flowId } = this.props;
    const { getTenxFlowStateList } = scope.props;
    switch(key) {
      case 'deleteStage':
        confirm({
        title: '确定删除构建流程？',
        content: `确定删除构建流程${name}`,
        onOk() {            
          deleteTenxFlowStateDetail(flowId, item, {
            success: {
              func: () => {
                notification['success']({
                  message: '构建流程',
                  description: '删除构建流程~',
                });
                getTenxFlowStateList(flowId);
              },
              isAsync: true
            }
          })         
        },
        onCancel() {},
      });
      break;
    }
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
  
  buildFlow(stageId, type, stageName) {
    //this function for user build single stage
    const { scope } = this.props;
    const stageStatus = !!type ? type.status : 3;
    if(stageStatus == 2) {
      scope.stopBuildFlow(stageId, stageName);
    } else {
      scope.buildFlow(stageId);
    }    
  }
  
  ciRulesChangeSuccess() {
    //this function for alert user the ci rules change sucees
    notification['success']({
      message: 'CI规则',
      description: 'CI规则修改成功~',
    });
  }
   
  render() {
    let { config, index, scope, currentFlowEdit, flowId, codeList, isFetching, ciRules } = this.props;
    const scopeThis = this;
    const dropdown = (
      <Menu onClick={this.operaMenuClick.bind(this, config.metadata.id, config.metadata.name)} style={{ width: '110px' }}>
        <Menu.Item key='deleteStage'>
          <i className='fa fa-trash' style={{ float:'left', lineHeight: '16px', marginRight: '5px', fontSize: '14px' }} />
          <span style={{ float: 'left', lineHeight: '16px', fontSize: '14px' }}><FormattedMessage {...menusText.deleteBtn} /></span>
          <div style={{ clear: 'both' }}></div>
        </Menu.Item>
      </Menu>
    );
    return (
      <div id='TenxFlowDetailFlowCard' key={'TenxFlowDetailFlowCard' + index} className={ currentFlowEdit == index ? 'TenxFlowDetailFlowCardBigDiv':'' } >
        <Card className={ currentEditClass(config.lastBuildStatus, currentFlowEdit, index) }>
          {
            currentFlowEdit != index ? [
              <QueueAnim key={'FlowCardShowAnimate' + index}>
                <div key={'TenxFlowDetailFlowCardShow' + index}>
                  <div className='statusBox'>
                    { currentStatus(config.lastBuildStatus) }
                  </div>
                  <div className='infoBox'>
                    <div className='name commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.name} />
                      </div>
                      <div className='info'>
                        <span className='infoSpan'>{config.metadata.name}</span>
                      </div>
                      <div style={{ clear:'both' }}></div>
                    </div>
                    <div className='type commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.type} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-cog' />
                        { currentFlowType(config.metadata.type) }
                      </div>
                      <div style={{ clear:'both' }}></div>
                    </div>
                    <div className='code commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.code} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-github' />
                        <span className='infoSpan'>{fetchCodeStoreName(config.spec.project.id, codeList)}</span>
                        <div style={{ clear:'both' }}></div>
                      </div>
                      <div style={{ clear:'both' }}></div>
                    </div>
                    <div className='branch commonInfo'>
                      <div className='title'>
                        <FormattedMessage {...menusText.branch} />
                      </div>
                      <div className='info'>
                        <i className='fa fa-sitemap' />
                        <span className='infoSpan'>{config.spec.project.branch}</span>
                        <div style={{ clear:'both' }}></div>
                      </div>
                      <div style={{ clear:'both' }}></div>
                    </div>
                    <div className='btnBox'>
                      <Button size='large' type='primary' className='startBtn'
                        onClick={this.buildFlow.bind(this, config.metadata.id, config.lastBuildStatus, config.metadata.name)}>
                        { currentStatusBtn(config.lastBuildStatus) }
                      </Button>
                      <Button size='large' type='ghost' className='logBtn'>
                        <i className='fa fa-wpforms' />
                        <FormattedMessage {...menusText.logBtn} />
                      </Button>
                      <Dropdown.Button overlay={dropdown} type='ghost' size='large' 
                        className='editBtn' onClick={this.editFlow} disabled={ buildButtonCheck(config.lastBuildStatus) }>
                        <i className='fa fa-pencil-square-o' />
                        <FormattedMessage {...menusText.editBtn} />
                      </Dropdown.Button>
                      <div style={{ clear:'both' }}></div>
                    </div>
                  </div>
                  <div style={{ clear:'both' }}></div>
                </div>
              </QueueAnim>
            ] : null
          }
          {
            currentFlowEdit == index ? [
              <QueueAnim key={'EditTenxFlowModalAnimate' + index}>
                <EditTenxFlowModal key={'EditTenxFlowModal' + index} rootScope={scope} scope={scopeThis} config={config} flowId={flowId} stageId={config.metadata.id} codeList={codeList} />
              </QueueAnim>
            ] : null
          }
          {
            (index == 0 && currentFlowEdit != index) ? [
            <div className='cicdBox' key='cicdBox'>
              <Switch onChange={this.viewCicdBox} checked={this.state.ciRulesOpened}/>
              <p className='switchTitile'><FormattedMessage {...menusText.cicd} /></p>
              <p className='viewP' onClick={this.viewCicdBoxP}><FormattedMessage {...menusText.view} /></p>
            </div>
            ] : null
          }
        </Card>
        {
          currentFlowEdit != index ? [
            <div className={ config.lastBuildStatus == 'finish' ? 'finishArrow arrowBox' : 'arrowBox' } key='finishArrow'>
              <Icon type="arrow-right" />
            </div>
          ] : null
        }
        <div style={{ clear:'both' }}></div>
        <Modal className='tenxFlowCicdSetting'
          visible={this.state.cicdSetModalShow}
        >
          <CICDSettingModal scope={scopeThis} flowId={flowId} 
            ciRules={ciRules} isFetching={isFetching} />
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
  const { getTenxflowCIRules } = state.cicd_flow;
  const { isFetching, ciRules } = getTenxflowCIRules || defaultCiRules
  return {
    isFetching,
    ciRules
  }
}

TenxFlowDetailFlowCard.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxflowCIRules,
  UpdateTenxflowCIRules,
  deleteTenxFlowStateDetail
})(injectIntl(TenxFlowDetailFlowCard, {
  withRef: true,
}));

