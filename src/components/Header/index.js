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
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, message } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import querystring from 'querystring'
import classNames from 'classnames'
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../actions/user'
import { loadTeamClustersList } from '../../actions/team'
import { setCurrent } from '../../actions'
import { getCookie } from '../../common/tools'
import { USER_CURRENT_CONFIG } from '../../../constants'
import { browserHistory } from 'react-router'

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
    this.state = {
      spacesVisible: false,
      clustersVisible: false,
      focus: false,
      selectSpace: {},
      selectCluster: {},
    }
  }

  handleSpaceChange(space) {
    const { loadTeamClustersList, setCurrent } = this.props
    setCurrent({
      team: { teamID: space.teamID },
      space
    })
    loadTeamClustersList(space.teamID, { size: 100 })
    this.setState({
      selectSpace: space,
      spacesVisible: false,
      clustersVisible: true,
    })
  }

  handleClusterChange(cluster) {
    this.setState({
      clustersVisible: false,
    })
    if (cluster.clusterID === this.state.selectCluster.clusterID) {
      return
    }
    const { setCurrent } = this.props
    setCurrent({
      cluster
    })
    message.success(`集群已成功切换到 ${cluster.clusterName}`)
    browserHistory.push('/')
    this.setState({
      selectCluster: cluster,
    })
  }

  componentWillMount() {
    const { loadTeamClustersList, setCurrent } = this.props
    const config = getCookie(USER_CURRENT_CONFIG)
    const [teamID, spaceID, clusterID] = config.split(',')
    setCurrent({
      team: { teamID },
      space: { spaceID },
      cluster: { clusterID },
    })
    const self = this
    loadSpaces(this.props, {
      success: {
        func: (resultT) => {
          let defaultSpace = resultT.teamspaces[0] || {}
          if (spaceID === 'default') {
            defaultSpace = {
              spaceName: '我的空间',
              teamID
            }
          }
          this.setState({
            selectSpace: defaultSpace,
          })
          loadTeamClustersList(defaultSpace.teamID, { size: 100 }, {
            success: {
              func: (resultC) => {
                let defaultCluster = resultC.data[0] || {}
                // setCurrent({ cluster: defaultCluster })
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
    const {
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
      selectSpace,
      selectCluster,
    } = this.state
    teamspaces.map((space) => {
      space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.clusterName
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
              visible={clustersVisible}
              list={teamClusters}
              loading={isTeamClustersFetching}
              onChange={this.handleClusterChange}
              selectValue={selectCluster.clusterName} />
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
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
})(Header)