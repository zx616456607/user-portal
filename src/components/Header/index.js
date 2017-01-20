/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Header component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Select, Input, Form, Icon } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import querystring from 'querystring'
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../actions/user'
import { loadTeamClustersList } from '../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../actions/entities'
import { getCookie } from '../../common/tools'
import { USER_CURRENT_CONFIG } from '../../../constants'
import { MY_SPACE } from '../../constants'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../common/notification_handler'
import UserPanel from './UserPanel'
import backOldBtn from '../../assets/img/headerBackOldArrow.png'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const team = mode === standard ? '团队' : '空间'
const zone = mode === standard ? '区域' : '集群'
const selectTeam = mode === standard ? '选择团队' : '选择空间'
const selectZone = mode === standard ? '选择区域' : '选择集群'
// The following routes RegExp will show select space or select cluster
const SPACE_CLUSTER_PATHNAME_MAP = {
  space: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
    /^\/app_center\/?$/,
    /\/app_center\/stack_center/,
    /\/ci_cd/,
  ],
  cluster: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
  ],
}

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option
const InputGroup = Input.Group
const menusText = defineMessages({
  doc: {
    id: 'Header.menu.doc',
    defaultMessage: '文档中心',
  },
  user: {
    id: 'Header.menu.user',
    defaultMessage: '用户',
  },
  team: {
    id: 'Header.menu.team',
    defaultMessage: '团队',
  },
  space: {
    id: 'Header.menu.space',
    defaultMessage: '空间',
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
    const _this = this
    const { loadTeamClustersList, setCurrent, current, showCluster } = this.props
    /*if (space.namespace === current.space.namespace) {
      return
    }*/
    let notification = new NotificationHandler()
    loadTeamClustersList(space.teamID, { size: 100 }, {
      success: {
        func: (result) => {
          if (!result.data || result.data.length < 1) {
            notification.warn(`${team} [${space.spaceName}] 的${zone}列表为空，请重新选择${team}`)
            _this.setState({
              spacesVisible: true,
              clustersVisible: false,
            })
            return
          }
          setCurrent({
            team: { teamID: space.teamID },
            space,
          })
          _this.setState({
            spacesVisible: false,
            clustersVisible: (showCluster ? true : false),
          })
        },
        isAsync: true
      },
      faied: {
        func: (error) => {
          notification.error(`加载${team} [${space.spaceName}] 的${zone}列表失败，请重新选择${team}`)
          _this.setState({
            spacesVisible: true,
            clustersVisible: false,
          })
        }
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
    let msg = `${zone}已成功切换到 [${cluster.clusterName}]`
    if (current.cluster.namespace !== current.space.namespace) {
      msg = `${team}已成功切换到 [${current.space.spaceName}]，${msg}`
    }
    let notification = new NotificationHandler()
    notification.success(msg)
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
            defaultSpace = MY_SPACE
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
  }

  render() {
    const {
      current,
      loginUser,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
      migrated,
      showSpace,
      showCluster,
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
    } = this.state
    teamspaces.map((space) => {
      mode === standard
      ? space.name = space.teamName
      : space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.clusterName
    })
    let selectValue = mode === standard ? current.space.teamName : current.space.spaceName
    return (
      <div id="header">
        {
          showSpace && (
            <div className="space">
              <div className="spaceTxt">
                <svg className='headerteamspace'>
                  <use xlinkHref='#headerteamspace' />
                </svg>
                <span style={{ marginLeft: 15 }}>{team}</span>
                </div>
                <div className="spaceBtn">
                  <PopSelect
                    title={selectTeam}
                    btnStyle={false}
                    special={true}
                    visible={spacesVisible}
                    list={teamspaces}
                    loading={isTeamspacesFetching}
                    onChange={this.handleSpaceChange}
                    selectValue={selectValue}
                    popTeamSelect={mode === standard} />
                </div>
            </div>
          )
        }
        {
          showCluster && (
            <div className="cluster">
              <div className="clusterTxt">
                <svg className='headercluster'>
                  <use xlinkHref='#headercluster' />
                </svg>
                <span style={{ marginLeft: 20 }}>{zone}</span>
              </div>
              <div className="envirBox">
                <PopSelect
                  title={selectZone}
                  btnStyle={false}
                  visible={clustersVisible}
                  list={teamClusters}
                  loading={isTeamClustersFetching}
                  onChange={this.handleClusterChange}
                  selectValue={current.cluster.clusterName || '...'} />
              </div>
            </div>
          )
        }
        <div className="rightBox">
        {
          migrated === 1 ?
          <a href='https://console.tenxcloud.com' target='_blank'>
            <div className='backVersion'>
              <div className='imgBox'>
                <img src={backOldBtn} />
              </div>
              <span className='backText'>返回旧版</span>
            </div>
          </a> :
          <div></div>
        }
          <div className="docBtn">
            <a href="http://docs.tenxcloud.com" target="_blank">
              <FormattedMessage {...menusText.doc}/>
            </a>
          </div>
          <div className="docBtn">
            <a href="http://docs.tenxcloud.com/faq" target="_blank">
              FAQ
            </a>
          </div>
          <UserPanel loginUser={loginUser}/>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { pathname } = props
  const { current, loginUser } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  let showSpace = false
  let showCluster = false
  SPACE_CLUSTER_PATHNAME_MAP.space.every(path => {
    if (pathname.search(path) == 0) {
      showSpace = true
      return false
    }
    return true
  })
  SPACE_CLUSTER_PATHNAME_MAP.cluster.every(path => {
    if (pathname.search(path) == 0) {
      showCluster = true
      return false
    }
    return true
  })
  return {
    current,
    loginUser: loginUser.info,
    migrated: loginUser.info.migrated || 0,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    showSpace,
    showCluster,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
  loadLoginUserDetail,
})(Header)