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
import { loadTeamClustersList } from '../../actions/team'
import { setCluster } from '../../actions'

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

function loadSpaces(props, callback) {
  const { loadUserTeamspaceList } = props
  loadUserTeamspaceList('default', { size: 100 }, callback)
}

class Header extends Component {
  constructor(props) {
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.setCluster = this.setCluster.bind(this)
    this.state = {
      spacesVisible: false,
      cliustersVisible: false,
      focus: false,
      selectSpace: {},
      selectCluster: {},
    }
  }

  handleSpaceChange(space) {
    console.log('space--------------------------------')
    console.log(space)
    const { loadTeamClustersList } = this.props
    loadTeamClustersList(space.teamID, { size: 100 })
    this.setState({
      selectSpace: space,
      spacesVisible: false,
      cliustersVisible: true,
    })
  }

  handleClusterChange(cluster) {
    console.log('cluster--------------------------------')
    console.log(cluster)
    this.setState({
      selectCluster: cluster,
      cliustersVisible: false,
    })
  }

  setCluster(value, option) {
    window.localStorage.setItem('cluster', value)
  }

  componentWillMount() {
    const self = this
    const { loadTeamClustersList, setCluster } = this.props
    loadSpaces(this.props, {
      success: {
        func: (resultT) => {
          const defaultSpace = resultT.teamspaces[0] || {}
          this.setState({
            selectSpace: defaultSpace,
          })
          loadTeamClustersList(defaultSpace.teamID, { size: 100 }, {
            success: {
              func: (resultC) => {
                let defaultCluster = resultC.data[0] || {}
                setCluster(defaultCluster)
                self.setState({
                  selectCluster: defaultCluster,
                })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }

  render() {
    const { isTeamspacesFetching, teamspaces, teamClusters } = this.props
    const {
      spacesVisible,
      cliustersVisible,
      selectSpace,
      selectCluster,
    } = this.state
    teamspaces.map((space) => {
      space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.description
    })
    return (
      <div id="header">
        <div className="space">
          <div className="spaceTxt">
            <i className="fa fa-cube" />
            <span style={{ marginLeft: 5 }}>空间</span>
          </div>
          <div className="spaceBtn">
            <PopSelect
              title="选择项目空间"
              btnStyle={false}
              visible={spacesVisible}
              list={teamspaces}
              loading={isTeamspacesFetching}
              onChange={this.handleSpaceChange}
              selectValue={selectSpace.spaceName} />
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
              title="选择集群"
              btnStyle={false}
              visible={cliustersVisible}
              list={teamClusters}
              loading={isTeamspacesFetching}
              onChange={this.handleClusterChange}
              selectValue={selectCluster.description} />
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
  const { teamClusters } = state.team
  return {
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCluster,
})(Header)