/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppSider component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import querystring from 'querystring'
import classNames from 'classnames'
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../actions/user'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option
const InputGroup = Input.Group
const menusText = defineMessages({
  doc: {
    id: 'Header.menu.doc',
    defaultMessage: '文档',
  },
  user: {
    id: 'Header.menu.user',
    defaultMessage: '用户',
  },
  userMenu1: {
    id: 'Header.menu.user.menu1',
    defaultMessage: '第一个菜单项',
  },
  userMenu2: {
    id: 'Header.menu.user.menu2',
    defaultMessage: '第二个菜单项',
  },
  userMenu3: {
    id: 'Header.menu.user.menu3',
    defaultMessage: '第三个菜单项（不可用）',
  }
})

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a target="_blank" href="http://www.alipay.com/">
        <FormattedMessage {...menusText.userMenu1} />
      </a>
    </Menu.Item>
    <Menu.Item key="1">
      <a target="_blank" href="http://www.taobao.com/">
        <FormattedMessage {...menusText.userMenu2} />
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3" disabled>
      <FormattedMessage {...menusText.userMenu3} />
    </Menu.Item>
  </Menu>
)

function loadSpaces(props) {
  const { loadUserTeamspaceList } = props
  loadUserTeamspaceList('default', { size: 100 })
}

class Header extends Component {
  constructor(props) {
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.setCluster = this.setCluster.bind(this)
    this.state = {
      spaceVisible: false,
      value: '',
      focus: false,
      selectSpace: null
    }
  }

  handleSpaceChange(space) {
    this.setState({
      selectSpace: space
    })
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  setCluster(value, option) {
    window.localStorage.setItem('cluster', value)
  }

  componentWillMount() {
    loadSpaces(this.props)
  }

  render() {
    const { isTeamspacesFetching, teamspaces } = this.props
    const spaceResultArr = ['奔驰-CRM系统', '奔驰-OA系统', '奔驰-进销存系统']
    const ClusterResultArr = ['test', '产品环境', 'k8s 1.4']

    return (
      <div id="header">
        <div className="space">
          <div className="spaceTxt">
            <i className="fa fa-cube" />
            <span style={{ marginLeft: 5 }}>空间</span>
          </div>
          <div className="spaceBtn">
            <PopSelect
              btnStyle={false}
              list={teamspaces}
              loading={isTeamspacesFetching}
              onChange={this.handleSpaceChange}
              selectValue="奔驰HRM系统" />
          </div>
        </div>
        <div className="cluster">
          <div className="clusterTxt">
            <i className="fa fa-sitemap" />
            <span style={{ marginLeft: 5 }}>集群</span>
          </div>
          {/*<div className="clusterBtn">
            <span style={{ padding: '0 10px 5px 10px' }}>开发测试集群</span>
            <span>生产环境集群</span>
          </div>*/}
          <div className="envirBox">
            <PopSelect
              btnStyle={false}
              list={teamspaces}
              loading={isTeamspacesFetching}
              selectValue="奔驰HRM系统" />
            {/*<PopSelect  btnStyle={false} list={ClusterResultArr} selectValue="产品环境集群" />*/}
          </div>
        </div>
        <div className="rightBox">
          <div className="docBtn">
            <FormattedMessage {...menusText.doc} />
          </div>
          <Dropdown overlay={menu}>
            <div className="ant-dropdown-link userBtn">
              <FormattedMessage {...menusText.user} />
              <Icon type="down" />
            </div>
          </Dropdown>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { teamspaces } = state.user
  return {
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : [])
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList
})(Header)