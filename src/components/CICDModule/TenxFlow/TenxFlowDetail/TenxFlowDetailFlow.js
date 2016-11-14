/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailFlow component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Card, Alert, Modal, Button } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowStateList, getProjectList, searchProject } from '../../../../actions/cicd_flow'
import { getDockerfileList, CreateTenxflowBuild, StopTenxflowBuild } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlow.less'
import EditTenxFlowModal from './TenxFlowDetailFlow/EditTenxFlowModal.js'
import CreateTenxFlowModal from './TenxFlowDetailFlow/CreateTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'

const confirm = Modal.confirm;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.tooltip',
    defaultMessage: 'TenxFlow流程定义，这里您可以定义一系列构建所需要的项目执行过程，可以是代码构建，亦或是开发自测，也可以是自动化集成、并实现自动化部署的一个All-In-One Platform',
  },
  add: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.add',
    defaultMessage: '添加Flow项目',
  },
})

class TenxFlowDetailFlow extends Component {
  constructor(props) {
    super(props);
    this.createNewFlow = this.createNewFlow.bind(this);
    this.closeCreateNewFlow = this.closeCreateNewFlow.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.refreshStageList = this.refreshStageList.bind(this);
    this.state = {
      editTenxFlowModal: false,
      currentModalShowFlow: null,
      currentFlowEdit: null,
      createNewFlow: false,
      buildingList: []
    }
  }

  componentWillMount() {
    const { getTenxFlowStateList, flowId, getProjectList, getDockerfileList } = this.props;
    const _this = this;
    let buildingList = [];
    getTenxFlowStateList(flowId, {
      success: {        
        func: (res) => {
          res.data.results.map((item) =>{
            let buildId = null;
            if(!Boolean(item.lastBuildStatus)) {
              buildId = null;
            } else {
              buildId = item.lastBuildStatus.buildId;
            }
            buildingList.push({
              buildId: buildId,
              stageId: item.metadata.id
            })
          });
          _this.setState({
            buildingList: buildingList
          });
          getProjectList();
        },
        isAsync: true        
      }
    });
  }
  
  createNewFlow() {
    //this function only for user create an new flow show the edit modal
    this.setState({
      currentFlowEdit: null,
      createNewFlow: true,    
    });
  }
  
  closeCreateNewFlow() {
    //this function only for user close the modal of  create an new flow 
    this.setState({
      currentFlowEdit: null,
      createNewFlow: false
    });
  }
  
  buildFlow(stageId) {
    //this function for user build stage
    //and user can build single one
    const { CreateTenxflowBuild, getTenxFlowStateList, flowId } = this.props;
    let buildFlag = true;
    const _this = this;
    CreateTenxflowBuild(flowId, { stageId: stageId }, {
      success: {
        func: (res) => {
          let buildingList = _this.state.buildingList;
          buildingList.map((item) => {
            if(item.stageId == stageId) {
              buildFlag = false;
              item.buildId = res.data.results.flowBuildId;
            }
          });
          if(buildFlag) {
            buildingList.push({
              stageId: stageId,
              buildId: res.data.results.flowBuildId
            });
          }
          _this.setState({
            buildingList: buildingList
          });
          getTenxFlowStateList(flowId);
        },
        isAsync: true
      }
    })
  }
  
  stopBuildFlow(stageId, stageName) {
    //this function for user stop building stage
    const { StopTenxflowBuild, getTenxFlowStateList, flowId } = this.props;
    const { buildingList } = this.state;
    confirm({
        title: '确定停止构建？',
        content: `停止${stageName}构建`,
        onOk() {
          buildingList.map((item) => {
            if(item.stageId == stageId) {
              StopTenxflowBuild(flowId, item.buildId, {
                success: {
                  func: (res) => getTenxFlowStateList(flowId),
                  isAsync: true
                }
              });
            }
          });          
        },
        onCancel() {},
    });
  }
  
  refreshStageList() {
    //this function for temp refresh stage list 
    //it will be instead of  using websocket get stage list for native
    const { getTenxFlowStateList, flowId } = this.props;
    getTenxFlowStateList(flowId);
  }

  render() {
    const { flowId, stageInfo, stageList, isFetching, projectList } = this.props;
    let scope = this;
    let { currentFlowEdit } = scope.state;
    let cards = null;
    if(!Boolean(stageList)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    } else {      
      cards = stageList.map( (item, index) => {
        return (
          <TenxFlowDetailFlowCard key={'TenxFlowDetailFlowCard' + index} config={item} scope={scope} index={index} flowId={flowId} currentFlowEdit={currentFlowEdit} codeList={projectList} />
        )
      });
    }
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          <Button style={{ marginBottom: '20px' }} size='large' type='primary' onClick={this.refreshStageList}>
            <span><i className='fa fa-refresh'></i>&nbsp;刷新</span>
          </Button><br />
          { cards }
          <div className={ this.state.createNewFlow ? 'TenxFlowDetailFlowCardBigDiv commonCardBox createCardBox' : 'commonCardBox createCardBox'}>
            <Card className='commonCard createCard' onClick={this.createNewFlow}>
              { !this.state.createNewFlow ? [
                <QueueAnim key='createCardAnimate'>
                  <div className='createInfo' key='createCard'>
                    <Icon className='addIcon' type="plus-circle-o" />
                    <p>
                      <FormattedMessage {...menusText.add} />
                    </p>
                  </div>
                </QueueAnim>
              ] : null }
              {
                this.state.createNewFlow ? [
                  <QueueAnim key='creattingCardAnimate'>
                    <CreateTenxFlowModal key='CreateTenxFlowModal' scope={scope} flowId={flowId} stageInfo={stageInfo} codeList={projectList} />
                  </QueueAnim>
                ] : null
              }
            </Card>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultStageList = {
    isFetching: false,
    stageList: []
  }
  const defaultStatus = {
    projectList:[]
  }
  const defaultDockerFile = {
    dockerfileList: [],
  }
  const { getTenxflowStageList } = state.cicd_flow;
  const { isFetching, stageList } = getTenxflowStageList || defaultStageList;
  const { managed } = state.cicd_flow;
  const {projectList} = managed || defaultStatus;
  const { dockerfileLists } = state.cicd_flow
  const {dockerfileList} = dockerfileLists || defaultDockerFile
  return {
    isFetching,
    stageList,
    projectList,
    dockerfileList
  }
}

TenxFlowDetailFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowStateList,
  getProjectList,
  searchProject,
  getDockerfileList,
  CreateTenxflowBuild,
  StopTenxflowBuild
})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

