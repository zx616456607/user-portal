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

let testData = [
  {
    'name': 'test1',
    'updateTime': '1小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'normal'
  },
  {
    'name': 'test2',
    'updateTime': '2小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'fail',
    'config': '2C 8G',
    'updateType': 'normal'
  },
  {
    'name': 'test3',
    'updateTime': '3小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'grey'
  },
  {
    'name': 'test4',
    'updateTime': '4小时前',
    'status': 'fail',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'normal'
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
      currentModalShowFlow: null
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
    const scope = this;
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          
          <div className='commonCardBox createCardBox'>
            <Card className='commonCard createCard' onClick={this.createNewFlow}>
              <Icon type="plus-circle-o" />
              <p>
                <FormattedMessage {...menusText.add} />
              </p>
            </Card>
          </div>
        </div>
        <Modal
          visible={this.state.editTenxFlowModal}
          className='AppServiceDetail'
          transitionName='move-right'
          >
          <EditTenxFlowModal scope={scope} />
        </Modal>
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

