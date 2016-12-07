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
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../actions/user'
import { loadTeamClustersList } from '../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../actions/entities'
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
function loadSpaces(props, callback) {
  const { loadUserTeamspaceList } = props
  loadUserTeamspaceList('default', { size: 100 }, callback)
}

class Header extends Component {
  constructor(props) {
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.state = {
      spacesVisible: false,
      clustersVisible: false,
      visible: false,
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
  handleVisibleChange() {
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
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
      visible,
    } = this.state
    teamspaces.map((space) => {
      space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.clusterName
    })
    let logMenu = (
      <div className='logMenu'>
        <div className='rechangeInf'>
          <div className='balance'>
            <p>账户余额 &nbsp;:</p>
            <p><span>{loginUser.info.balance?loginUser.info.balance : 0}</span><span style={{fontSize:'14px',color:'#8a8a8a'}}>&nbsp;&nbsp;T币</span></p>
          </div>
          <Button style={{height:30,backgroundColor:'#46b2fa',borderColor:'#46b2fa',color:'#fff',fontSize:'14px'}}>立即充值</Button>
        </div>
        <table className='navTab'>
          <tbody>
            <tr>
              <td>
                <Link to='/account'>
                  <svg className='logMenuSvg'>
                    <use xlinkHref='#logaccountinf'/>
                  </svg>
                  <div>账户信息</div>
                </Link>
              </td>
              <td>
                <Link to='/account/cost'>
                  <svg className='logMenuSvg'>
                    <use xlinkHref='#logcostrecord'/>
                  </svg>
                  <div>消费记录</div>
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link to='/account/user/editPass'>
                  <svg className='logMenuSvg'>
                    <use xlinkHref='#logchangepass'/>
                  </svg>
                  <div>修改密码</div>
                </Link>
              </td>
              <td>
                <Link to='/account'>
                  <svg className='logMenuSvg'>
                    <use xlinkHref='#logteam'/>
                  </svg>
                  <div>我的团队</div>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='logCancle'>
          <a href='/logout'>
            <svg className='logCancleSvg'>
              <use xlinkHref='#logteam'/>
            </svg>
            注销登录
          </a>
        </div>
      </div>
    )
    let logTitle = (
      <div className='logTitle'>
        <div className='logAvatar'>{loginUser.info.userName?loginUser.info.userName.substr(0,1).toUpperCase() : ''}</div>
        <div style={{float:'left',paddingLeft: '7px'}}>
          <div style={{lineHeight: '20px',paddingTop: '8px',minWidth:180}}>
            <p style={{fontSize: '16px',color: '#46b2fa'}}>{loginUser.info.userName || '...'}</p>
            <p style={{fontSize: '12px'}}>{loginUser.info.email || '...'}</p>
          </div>
        </div>
        <div className='loginTag'>个人</div>
      </div>
    )
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <div id="header">
        <div className="space">
          <div className="spaceTxt">
            <svg className='headerteamspace'>
              <use xlinkHref='#headerteamspace' />
            </svg>
            <span style={{ marginLeft: 15 }}>空间</span>
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
            <svg className='headercluster'>
              <use xlinkHref='#headercluster' />
            </svg>
            <span style={{ marginLeft: 20 }}>集群</span>
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
          <Popover content={logMenu}
          title={logTitle}
          overlayClassName='logPopMenu'
          placement="bottomRight"
          arrowPointAtCenter={true}
          trigger='click'
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          >
            <div className='userBtn'>
              {loginUser.info.userName || '...'}
              <Icon type="down" className={rotate}/>
            </div>
          </Popover>
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