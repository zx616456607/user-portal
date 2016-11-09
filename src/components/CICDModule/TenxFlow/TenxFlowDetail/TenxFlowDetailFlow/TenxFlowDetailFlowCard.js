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
import { Spin, Icon, Card, Modal, Button, Switch } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/TenxFlowDetailFlowCard.less'
import EditTenxFlowModal from './EditTenxFlowModal.js'
import CICDSettingModal from './CICDSettingModal.js'

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
})

function currentStatus(status) {
  //this function for show different status
  switch(status) {
    case 'finish':
      return (
        <div className='finishStatus status'>
          <Icon type="check-circle-o" />
          <p><FormattedMessage {...menusText.finish} /></p>
        </div>
        );
      break;
    case 'running':
      return (
        <div className='runningStatus status'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <p><FormattedMessage {...menusText.running} /></p>
        </div>
        );
      break;
    case 'fail':
       return (
          <div className='failStatus status'>
            <Icon type="cross-circle-o" />
            <p><FormattedMessage {...menusText.fail} /></p>
          </div>
        );
      break;
    case 'wait':
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
    case 3:
      return (
        <FormattedMessage {...menusText.podToPodCheck} />
        );
      break;
    case 4:
      return (
        <FormattedMessage {...menusText.runningCode} />
        );
      break;
    case 5:
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
  switch(status) {
    case 'finish':
      return (
        <div>
          <i className='fa fa-play' />
          <span><FormattedMessage {...menusText.startBtn} /></span>
        </div>
        );
      break;
    case 'running':
      return (
        <div>
          <i className='fa fa-stop' />
          <span><FormattedMessage {...menusText.stopBtn} /></span>
        </div>
        );
      break;
    case 'fail':
      return (
        <div>
          <i className='fa fa-repeat' />
          <span><FormattedMessage {...menusText.restartBtn} /></span>
        </div>
        );
      break;
    case 'wait':
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
  if(editIndex == index) {
    return 'edittingCard commonCard';
  }else if(status == 'running') {
    return 'runningCard commonCard';
  }else {
    return 'commonCard';
  } 
}
  
class TenxFlowDetailFlowCard extends Component {
  constructor(props) {
    super(props);
    this.editFlow = this.editFlow.bind(this);
    this.viewCicdBox = this.viewCicdBox.bind(this);
    this.viewCicdBoxP = this.viewCicdBoxP.bind(this);
    this.cancelEditCard = this.cancelEditCard.bind(this);
    this.state = {
      editStatus: false,
      cicdSetModalShow: false
    }
  }
  
  editFlow() {
    //this function for user click the edit button and then open the edit modal
    const { scope, index } = this.props;
    scope.setState({
      currentFlowEdit: index
    });
  }
  
  viewCicdBox(e) {
    //this function for user change open cicd or not
    if(e){
      this.setState({
        cicdSetModalShow: true
      });
    }else {
      this.setState({
        cicdSetModalShow: false
      });
    }
  }
  
  viewCicdBoxP(e) {
    //this function for open the modal of cicd
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
  
  render() {
    let { config, index, scope, currentFlowEdit } = this.props;
    const scopeThis = this;
    console.log(config)
    return (
      <div id='TenxFlowDetailFlowCard' key={'TenxFlowDetailFlowCard' + index} className={ currentFlowEdit == index ? 'TenxFlowDetailFlowCardBigDiv':'' } >
        <Card className={ currentEditClass(config.status, currentFlowEdit, index) }>
          {
            currentFlowEdit != index ? [
              <QueueAnim key={'FlowCardShowAnimate' + index}>
                <div key={'TenxFlowDetailFlowCardShow' + index}>
                  <div className='statusBox'>
                    { currentStatus('wait') }
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
                        <span className='infoSpan'>{config.spec.container.image}</span>
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
                      <Button size='large' type='primary'>
                        { currentStatusBtn('wait') }
                      </Button>
                      <Button size='large' type='ghost'>
                        <i className='fa fa-wpforms' />
                        <FormattedMessage {...menusText.logBtn} />
                      </Button>
                      <Button size='large' type='ghost' className='editBtn' onClick={this.editFlow} disabled={ config.status == 'running' ? true : false }>
                        <i className='fa fa-pencil-square-o' />
                        <FormattedMessage {...menusText.editBtn} />
                      </Button>
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
                <EditTenxFlowModal key={'EditTenxFlowModal' + index} scope={scopeThis} config={config} />
              </QueueAnim>
            ] : null
          }
          {
            (index == 0 && currentFlowEdit != index) ? [
            <div className='cicdBox' key='cicdBox'>
              <Switch onChange={this.viewCicdBox}/>
              <p className='switchTitile'><FormattedMessage {...menusText.cicd} /></p>
              <p className='viewP' onClick={this.viewCicdBoxP}><FormattedMessage {...menusText.view} /></p>
            </div>
            ] : null
          }
        </Card>
        {
          currentFlowEdit != index ? [
            <div className={ config.status == 'finish' ? 'finishArrow arrowBox' : 'arrowBox' } key='finishArrow'>
              <Icon type="arrow-right" />
            </div>
          ] : null
        }
        <div style={{ clear:'both' }}></div>
        <Modal className='tenxFlowCicdSetting'
          visible={this.state.cicdSetModalShow}
        >
          <CICDSettingModal scope={scopeThis} />
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

TenxFlowDetailFlowCard.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TenxFlowDetailFlowCard, {
  withRef: true,
}));

