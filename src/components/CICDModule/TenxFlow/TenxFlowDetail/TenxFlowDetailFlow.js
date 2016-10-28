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
import './style/TenxFlowDetailFlow.less'
import EditTenxFlowModal from './TenxFlowDetailFlow/EditTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'

let testData = [
  {
    'name': 'test1',
    'type': 'unitCheck',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'finish'
  },
  {
    'name': 'test2',
    'type': 'podToPodCheck',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'running'
  },
  {
    'name': 'test3',
    'type': 'containCheck',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'finish'
  },
  {
    'name': 'test4',
    'type': 'runningCode',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'fail'
  },
  {
    'name': 'test5',
    'type': 'other',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'wait'
  },
  {
    'name': 'test6',
    'type': 'buildImage',
    'codeSource': 'github-gaojian',
    'branch': 'master',
    'status': 'finish'
  },
]

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
    this.state = {
      editTenxFlowModal: false,
      currentModalType: 'create',
      currentModalShowFlow: null,
      currentFlowEdit: null
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  }
  
  createNewFlow() {
    //this function only for user create an new flow show the edit modal
    this.setState({
      editTenxFlowModal: true,
      currentModalType: 'create'
    });
  }

  render() {
    let scope = this;
    let { currentFlowEdit } = scope.state;
    let cards = testData.map( (item, index) => {
      return (
        <TenxFlowDetailFlowCard config={item} scope={scope} index={index} currentFlowEdit={currentFlowEdit} />
      )
    });
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          { cards }
          <div style={{ clear:'both' }}></div>
          <div className='commonCardBox createCardBox'>
            <Card className='commonCard createCard' onClick={this.createNewFlow}>
              <Icon type="plus-circle-o" />
              <p>
                <FormattedMessage {...menusText.add} />
              </p>
            </Card>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

TenxFlowDetailFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

