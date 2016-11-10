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
import { Spin, Icon, Card, Alert, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowStateList } from '../../../../actions/cicd_flow'
import { getProjectList, searchProject } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlow.less'
import EditTenxFlowModal from './TenxFlowDetailFlow/EditTenxFlowModal.js'
import CreateTenxFlowModal from './TenxFlowDetailFlow/CreateTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'

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
    this.state = {
      editTenxFlowModal: false,
      currentModalShowFlow: null,
      currentFlowEdit: null,
      createNewFlow: false
    }
  }

  componentWillMount() {
    const { getTenxFlowStateList, flowId } = this.props;
    getTenxFlowStateList(flowId);
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

  render() {
    const { flowId, stageInfo, stageList, isFetching } = this.props;
    let scope = this;
    let { currentFlowEdit } = scope.state;
    let cards = null;
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    } else {      
      cards = stageList.map( (item, index) => {
        return (
          <TenxFlowDetailFlowCard config={item} scope={scope} index={index} flowId={flowId} currentFlowEdit={currentFlowEdit} />
        )
      });
    }
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
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
                    <CreateTenxFlowModal key='CreateTenxFlowModal' scope={scope} flowId={flowId} stageInfo={stageInfo} />
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
  const { getTenxflowStageList } = state.cicd_flow;
  const { isFetching, stageList } = getTenxflowStageList || defaultStageList;
  return {
    isFetching,
    stageList
  }
}

TenxFlowDetailFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowStateList,
  getProjectList,
  searchProject
})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

