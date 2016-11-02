 /**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeStore component
 *
 * v0.1 - 2016-10-31
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../constants'
// import CreateTenxFlow from './CreateTenxFlow.js'
// import TestModal from '../../TerminalModal'
import './style/CodeStore.less'
// import TenxFlowBuildLog from './TenxFlowBuildLog.js'

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
  }
]

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.TenxStorm.tooltips',
    defaultMessage: '代码仓库：这里完成构建前的准备的工作，开发者可以在这里关联企业里业务代码所在的托管仓库，关联好的代码仓库后，选择激活代码项目为可构建状态，后便后续构建Flow里选择可构建的代码库。',
  },
  show: {
    id: 'CICD.TenxStorm.show',
    defaultMessage: '查看公钥',
  },
  name: {
    id: 'CICD.TenxStorm.name',
    defaultMessage: '名称',
  },
  attr: {
    id: 'CICD.TenxStorm.attr',
    defaultMessage: '属性',
  },
  action: {
    id: 'CICD.TenxStorm.action',
    defaultMessage: '操作',
  },
  codeSrc: {
    id: 'CICD.TenxStorm.codeSrc',
    defaultMessage: '代码源',
  },
  linkCode: {
    id: 'CICD.TenxStorm.linkCode',
    defaultMessage: '关联代码库',
  },
  releaseActivation: {
    id: 'CICD.TenxStorm.releaseActivation',
    defaultMessage: '解除激活',
  },
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
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
            WebHook
          </Menu.Item>
          <Menu.Item key='2'>
            <i className='fa fa-trash' />&nbsp;
            <FormattedMessage {...menusText.show} />
          </Menu.Item>
          <Menu.Item key='3'>
            <i className='fa fa-trash' />&nbsp;
            <FormattedMessage {...menusText.releaseActivation} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='CodeTable' key={item.name} >
          <div className='name'>
            <Link to='/ci_cd/tenx_flow/tenx_flow_build'>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='type'>
            <span>{item.updateTime}</span>
          </div>
          <div className='codelink'>
            {item.status}
          </div>
          <div className='action'>

          </div>
        </div>
      );
    });
    return (
      <div className='CodeStore'>
        {items}
      </div>
    );
  }
});

class CodeStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createTenxFlowModal: false
    }
  }

  componentWillMount() {
    document.title = '代码仓库 | 时速云';
  }


  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='CodeStore' key='CodeStore'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Button className='createBtn' size='large' type='primary' onClick={this.openCreateTenxFlowModal}>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.linkCode} />
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
              <div className='type'>
                <FormattedMessage {...menusText.attr} />
              </div>
              <div className='codelink'>
                <FormattedMessage {...menusText.codeSrc} />
              </div>
              <div className='action'>
                <FormattedMessage {...menusText.action} />
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
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

CodeStore.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect()(injectIntl(CodeStore, {
  withRef: true,
}));

