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
import { setCurrent, loadLoginUserDetail } from '../../actions'
import { getCookie } from '../../common/tools'
import { USER_CURRENT_CONFIG } from '../../../constants'
import { browserHistory } from 'react-router'
import { Link } from 'react-router'

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
  logOut: {
    id: 'Header.menu.user.logOut',
    defaultMessage: '注销',
  },
  userMenu2: {
    id: 'Header.menu.user.menu2',
    defaultMessage: '第二个',
  },
  userMenu3: {
    id: 'Header.menu.user.menu3',
    defaultMessage: '第三个',
  }
})

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="/logout">
        <Icon type="logout" /> <FormattedMessage {...menusText.logOut} />
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
    }
  }

  handleSpaceChange(space) {
    const { loadTeamClustersList, setCurrent, current } = this.props
    /*if (space.namespace === current.space.namespace) {
      return
    }*/
    setCurrent({
      team: { teamID: space.teamID },
      space,
    })
    loadTeamClustersList(space.teamID, { size: 100 }, {
      success: {
        func: (result) => {
          if (result.data.length < 1) {
            setCurrent({
              cluster: {}
            })
          }
        },
        isAsync: true
      }
    })
    this.setState({
      spacesVisible: false,
      clustersVisible: true,
    })
  }

  handleClusterChange(cluster) {
    this.setState({
      clustersVisible: false,
    })
    const { setCurrent, current } = this.props
    if (current.cluster.namespace === current.space.namespace
      && cluster.clusterID === current.cluster.clusterID) {
      return
    }
    cluster.namespace = current.space.namespace
    setCurrent({
      cluster
    })
    const { pathname } = window.location
    let msg = `集群已成功切换到 ${cluster.clusterName}`
    if (current.cluster.namespace !== current.space.namespace) {
      msg = `空间已成功切换到 ${current.space.spaceName}，${msg}`
    }
    message.success(msg)
    if (pathname.match(/\//g).length > 2) {
      browserHistory.push('/')
    }
  }

  componentWillMount() {
    const {
      loadTeamClustersList,
      setCurrent,
      loadLoginUserDetail,
      loginUser,
    } = this.props
    const config = getCookie(USER_CURRENT_CONFIG)
    const [teamID, namespace, clusterID] = config.split(',')
    setCurrent({
      team: { teamID },
      space: { namespace },
      cluster: { clusterID },
    })
    const self = this
    loadSpaces(this.props, {
      success: {
        func: (resultT) => {
          let defaultSpace = resultT.teamspaces[0] || {}
          if (namespace === 'default') {
            defaultSpace = {
              spaceName: '我的空间',
              namespace: 'default',
              teamID,
            }
          } else {
            resultT.teamspaces.map(space => {
              if (space.namespace === namespace) {
                defaultSpace = space
              }
            })
          }
          setCurrent({
            space: defaultSpace
          })
          loadTeamClustersList(defaultSpace.teamID, { size: 100 }, {
            success: {
              func: (resultC) => {
                if (!resultC.data) {
                  resultC.data = []
                }
                let defaultCluster = resultC.data[0] || {}
                resultC.data.map(cluster => {
                  if (cluster.clusterID === clusterID) {
                    defaultCluster = cluster
                  }
                })
                setCurrent({ cluster: defaultCluster })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
    // load user info
    if (!loginUser.info.userName) {
      loadLoginUserDetail()
    }
  }

  render() {
    const {
      current,
      loginUser,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
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
              special={true}
              visible={spacesVisible}
              list={teamspaces}
              loading={isTeamspacesFetching}
              onChange={this.handleSpaceChange}
              selectValue={current.space.spaceName || '...'} />
          </div>
        </div>
        <div className="cluster">
          <div className="clusterTxt">
            <i className="fa fa-sitemap" />
            <span style={{ marginLeft: 5 }}>集群</span>
          </div>
          <div className="envirBox">
            <PopSelect
              title="选择集群"
              btnStyle={false}
              visible={clustersVisible}
              list={teamClusters}
              loading={isTeamClustersFetching}
              onChange={this.handleClusterChange}
              selectValue={current.cluster.clusterName || '...'} />
          </div>
        </div>
        <div className="rightBox">
          <div className="docBtn">
            <FormattedMessage {...menusText.doc} />
          </div>
          <Dropdown overlay={menu}>
            <div className="ant-dropdown-link userBtn">
              {/*<FormattedMessage {...menusText.user} />*/}
              {loginUser.info.userName || '...'}
              <Icon type="down" />
            </div>
          </Dropdown>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { current, loginUser } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  return {
    current,
    loginUser,
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
  loadLoginUserDetail,
})(Header)