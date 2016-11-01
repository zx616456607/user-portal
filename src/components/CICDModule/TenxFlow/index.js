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
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../constants'
import CreateTenxFlow from './CreateTenxFlow.js'
import TestModal from '../../TerminalModal'
import './style/TenxFlowList.less'
import TenxFlowBuildLog from './TenxFlowBuildLog.js'

let testData = [
  {
    'name': 'test1',
    'updateTime': '1小时前',
    'status': 'finish'
  },
  {
    'name': 'test2',
    'updateTime': '2小时前',
    'status': 'running'
  },
  {
    'name': 'test3',
    'updateTime': '3小时前',
    'status': 'finish'
  },
  {
    'name': 'test4',
    'updateTime': '4小时前',
    'status': 'fail'
  },
]

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
  checkImage: {
    id: 'CICD.Tenxflow.TenxFlowList.checkImage',
    defaultMessage: '查看镜像',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowList.delete',
    defaultMessage: '删除TenxFlow',
  },
})

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
  },
  showDeloyLog: function (item, e) {
    //this function for show user the deploy log of the tenxflow
    const { scope } = this.props;
    scope.setState({
      TenxFlowDeployLogModal: true
    });
  },
  render: function () {
    const { config, scope } = this.props;
    let items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='1'>
            <i className='fa fa-eye' />&nbsp;
            <FormattedMessage {...menusText.checkImage} />
          </Menu.Item>
          <Menu.Item key='2'>
            <i className='fa fa-trash' />&nbsp;
            <FormattedMessage {...menusText.delete} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='tenxflowDetail' key={item.name} >
          <div className='name'>
            <Link to='/ci_cd/tenx_flow/tenx_flow_build'>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='time'>
            <span>{item.updateTime}</span>
          </div>
          <div className='status'>
            {item.status}
          </div>
          <div className='oprea'>
            <Button className='logBtn' size='large' type='primary' onClick={scope.openTenxFlowDeployLogModal}>
              <i className='fa fa-wpforms' />&nbsp;
              <FormattedMessage {...menusText.deloyLog} />
            </Button>
            <Dropdown.Button overlay={dropdown} type='ghost' size='large'>
              <i className='fa fa-pencil-square-o' />&nbsp;
              <FormattedMessage {...menusText.deloyStart} />
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
      currentTenxFlow: null
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
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

  openTenxFlowDeployLogModal() {
    //this function for user open the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: true
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
            <MyComponent scope={scope} config={testData} />
          </Card>
        </div>
        <Modal
          visible={this.state.createTenxFlowModal}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeCreateTenxFlowModal}
          >
          <CreateTenxFlow scope={scope} />
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} />
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

TenxFlowList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TenxFlowList, {
  withRef: true,
}));

