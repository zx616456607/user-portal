/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux main app file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Icon, Menu, Modal, Button, Spin, } from 'antd'
import ErrorPage from '../ErrorPage'
import Header from '../../components/Header'
import DefaultSider from '../../components/Sider/Enterprise'
import Websocket from '../../components/Websocket'
import { browserHistory, Link } from 'react-router'
import { isEmptyObject, getPortalRealMode, isResourcePermissionError } from '../../common/tools'
import { resetErrorMessage } from '../../actions'
import { setSockets, loadLoginUserDetail } from '../../actions/entities'
import { updateContainerList, updateAppList } from '../../actions/app_manage'
import { loadLicensePlatform } from '../../actions/license'
import { updateAppServicesList, updateServiceContainersList, updateServicesList } from '../../actions/services'
import { loadApiInfo } from '../../actions/open_api'
import { handleOnMessage } from './status'
import {
  SHOW_ERROR_PAGE_ACTION_TYPES,
  LOGIN_EXPIRED_MESSAGE,
  PAYMENT_REQUIRED_CODE,
  UPGRADE_EDITION_REQUIRED_CODE,
  LICENSE_EXPRIED_CODE,
  LITE,
} from '../../constants'
import { ROLE_SYS_ADMIN } from '../../../constants'
import errorHandler from './error_handler'
import Intercom from 'react-intercom'
import NotificationHandler from '../../common/notification_handler'
import Xterm from '../../components/TerminalModal/Xterm'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = mode === standard
const realMode = getPortalRealMode()

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.handleLoginModalCancel = this.handleLoginModalCancel.bind(this)
    this.onStatusWebsocketSetup = this.onStatusWebsocketSetup.bind(this)
    this.getStatusWatchWs = this.getStatusWatchWs.bind(this)
    this.handleUpgradeModalClose = this.handleUpgradeModalClose.bind(this)
    this.setSwitchSpaceOrCluster = this.setSwitchSpaceOrCluster.bind(this)
    this.state = {
      siderStyle: props.siderStyle,
      loginModalVisible: false,
      loadLoginUserSuccess: true,
      upgradeModalShow: false,
      upgradeFrom: null,
      resourcePermissionModal: false,
      switchSpaceOrCluster: false,
      resourcequotaModal: false,
      resourcequotaMessage: {},
    }
  }

  componentWillMount() {
    const self = this
    const { loginUser, loadLoginUserDetail, loadApiInfo } = this.props
    // load user info
    if (isEmptyObject(loginUser)) {
      loadLoginUserDetail({
        failed: {
          func: (err) => {
            self.setState({
              loadLoginUserSuccess: false,
              loginErr: err,
            })
          },
          isAsync: true
        }
      })
    }
    loadApiInfo()
  }

  setSwitchSpaceOrCluster() {
    const {
      pathname,
    } = this.props
    clearTimeout(this.switchSpaceOrClusterTimeout)
    this.setState({
      switchSpaceOrCluster: true,
    }, () => {
      this.switchSpaceOrClusterTimeout = setTimeout(() => {
        this.setState({
          switchSpaceOrCluster: false,
        })
      }, 200)
    })
    if (pathname.match(/\//g).length > 2) {
      browserHistory.push('/')
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      errorMessage,
      pathname,
      resetErrorMessage,
      redirectUrl,
      siderStyle,
      current: newCurrent,
    } = nextProps
    this.setState({ siderStyle })
    const {
      sockets,
      current: oldCurrent,
    } = this.props
    const { statusWatchWs } = sockets
    const { space: newSpace, cluster: newCluster } = newCurrent
    const { space: oldSpace, cluster: oldCluster } = oldCurrent
    if (oldSpace.namespace && (newSpace.namespace !== oldSpace.namespace
      || newCluster.clusterID !== oldCluster.clusterID)
    ) {
      statusWatchWs && statusWatchWs.close()
      // move to header
      /* clearTimeout(this.switchSpaceOrClusterTimeout)
      this.setState({
        switchSpaceOrCluster: true,
      }, () => {
        this.switchSpaceOrClusterTimeout = setTimeout(() => {
          this.setState({
            switchSpaceOrCluster: false,
          })
        }, 200)
      })
      if (pathname.match(/\//g).length > 2) {
        browserHistory.push('/')
      } */
    }
    // Set previous location
    if (redirectUrl !== this.props.redirectUrl) {
      window.previousLocation = this.props.redirectUrl
    }
    if (!errorMessage) {
      return
    }
    let notification = new NotificationHandler()
    const { statusCode, message } = errorMessage.error
    // 登录失效
    if (message === LOGIN_EXPIRED_MESSAGE) {
      this.setState({ loginModalVisible: true })
      return
    }
    // 余额不足
    if (statusCode === PAYMENT_REQUIRED_CODE) {
      let msg = '余额不足，请充值后重试'
      if (space.namespace !== 'default') {
        if (standardFlag) {
          msg = '团队余额不足，请充值后重试'
        }
        else {
          msg = '团队空间余额不足，请充值后重试'
        }
      }
      notification.warn('操作失败', msg, null)
      return
    }
    // 升级版本
    if (statusCode === UPGRADE_EDITION_REQUIRED_CODE) {
      if (!message.details) {
        return
      }
      if (standardFlag) {
        let { kind, level } = message.details
        level = parseInt(level)
        // 超出专业版限额，发工单联系客服
        if (level > 1) {
          notification.warn(`您需要的资源超出专业版限额，请通过右下角联系客服`, '', null)
          return
        }
        this.setState({
          upgradeModalShow: true,
          upgradeFrom: kind
        })
        return
      }
      this.setState({
        resourcequotaModal: true,
        resourcequotaMessage: JSON.parse(message.message),
      })
    }
    // license 过期
    if (statusCode === LICENSE_EXPRIED_CODE) {
      notification.error('许可证已过期，请在登录界面激活')
      window.location.href = '/logout'
      return
    }
    if (isResourcePermissionError(errorMessage.error)) {
      this.setState({
        resourcePermissionModal: true,
      })
      return
    }
    if (pathname !== this.props.pathname) {
      resetErrorMessage()
    }
  }

  handleDismissClick() {
    this.props.resetErrorMessage()
  }

  handleLoginModalCancel() {
    this.setState({ loginModalVisible: false })
  }

  showErrorPage(errorMessage) {
    if (!errorMessage) {
      return false
    }
    const { type, error } = errorMessage
    if (SHOW_ERROR_PAGE_ACTION_TYPES.indexOf(type) < 0) {
      return false
    }
    const { statusCode } = error
    if (statusCode === 404 || statusCode >= 500) {
      return true
    }
    return false
  }

  renderErrorMessage() {
    const { errorMessage, resetErrorMessage, intl } = this.props
    const handleDismissClick = this.handleDismissClick
    if (!errorMessage) {
      return null
    }

    const { error } = errorMessage

    const { statusCode, message } = error
    // 登录失效
    if (message === LOGIN_EXPIRED_MESSAGE) {
      resetErrorMessage()
      return
    }

    // 余额不足
    if (statusCode === PAYMENT_REQUIRED_CODE) {
      resetErrorMessage()
      return
    }

    // 升级版本
    if (statusCode === UPGRADE_EDITION_REQUIRED_CODE) {
      resetErrorMessage()
      return
    }

    // 没有权限
    if (isResourcePermissionError(error)) {
      resetErrorMessage()
      return
    }

    if (this.showErrorPage(errorMessage)) {
      return
    }

    errorHandler(error, intl)

    resetErrorMessage()
  }

  onStatusWebsocketSetup(ws) {
    const { setSockets, loginUser, current } = this.props
    const { watchToken, namespace } = loginUser
    const watchAuthInfo = {
      accessToken: watchToken,
      namespace: namespace
    }
    if (current.space.namespace !== 'default') {
      watchAuthInfo.teamspace = current.space.namespace
    }
    ws.send(JSON.stringify(watchAuthInfo))
    setSockets({
      statusWatchWs: ws
    })
    ws.onmessage = (event) => {
      // this.props.onMessage(event.data)
      handleOnMessage(this.props, event.data)
    }
  }

  getStatusWatchWs() {
    if (!window.WebSocket) {
      // Show some tips?
      return
    }
    const { loginUser } = this.props
    if (!loginUser.tenxApi) {
      return
    }
    let protocol = window.location.protocol == 'http:' ? 'ws:' : 'wss:'
    return (
      <Websocket
        url={`${protocol}//${loginUser.tenxApi.host}/spi/v2/watch`}
        onSetup={this.onStatusWebsocketSetup}
        debug={false} />
    )
  }

  getChildren() {
    const { children, errorMessage, loginUser, current } = this.props
    const { loadLoginUserSuccess, loginErr, switchSpaceOrCluster } = this.state
    if (isEmptyObject(loginUser) && !loadLoginUserSuccess) {
      return (
        <ErrorPage code={loginErr.statusCode} errorMessage={{ error: loginErr }} />
      )
    }
    if (!errorMessage) {
      if (!current.space.projectName) {
        return (
          <div className="loading">
            <Spin size="large" /> 初始化中...
          </div>
        )
      }
      if (switchSpaceOrCluster) {
        return (
          <div className="loading">
            <Spin size="large" /> 切换项目/集群中...
          </div>
        )
      }
      return children
    }
    const { statusCode } = errorMessage.error
    if (this.showErrorPage(errorMessage)) {
      return (
        <ErrorPage code={statusCode} errorMessage={errorMessage} />
      )
    }
    return children
  }

  handleUpgradeModalClose() {
    this.setState({
      upgradeModalShow: false,
    })
  }

  renderIntercom() {
    const {
      loginUser,
      platform,
    } = this.props
    const user = {
      name: loginUser.userName,
      email: loginUser.email,
      phone: loginUser.phone,
      creationTime: loginUser.creationTime,
      role: loginUser.role,
      balance: loginUser.balance,
      teamCount: loginUser.teamCount
    }
    if (standardFlag) {
      return (
        <Intercom appID='okj9h5pl' { ...user } />
      )
    }
    const { platformid } = platform
    if (realMode === LITE && platformid) {
      delete user.email
      user.platformid = platformid
      user.name = `${LITE}-${platformid.substring(0, 6)}-${user.name}`
      user.user_id = `${LITE}-${platformid}-${user.name}`
      return (
        <Intercom appID='okj9h5pl' { ...user } />
      )
    }
  }

  componentDidMount() {
    const { loadLicensePlatform } = this.props
    if (realMode === LITE) {
      loadLicensePlatform()
    }
  }
  quotaSuffix(type) {
    let suffix = ''
    switch (type) {
      case 'cpu':
        return suffix = 'C'
      case 'memory':
        return suffix = 'GB'
      case 'storage':
        return suffix = 'GB'
      default:
        return suffix = '个'
    }
  }
  quotaEn(type) {
    switch (type) {
      case 'cpu':
        return 'CPU'
      case 'memory':
        return '内存'
      case 'storage':
        return '磁盘'
      case 'application':
        return '应用'
      case 'service':
        return '服务'
      case 'container':
        return '容器'
      case 'volume':
        return '存储'
      case 'snapshot':
        return '快照'
      case 'configuration':
        return '服务配置'
      case 'mysql':
        return 'MySQL'
      case 'redis':
        return 'Redis'
      case 'zookeeper':
        return 'ZooKeeper'
      case 'elasticsearch':
        return 'ElasticSearch'
      case 'etcd':
        return 'Etcd'
      case 'tenxflow':
        return 'TenxFlow'
      case 'subTask':
        return '子任务'
      case 'dockerfile':
        return 'Dockerfile'
      case 'registryProject':
        return '镜像仓库组'
      case 'registry':
        return '镜像仓库'
      case 'orchestrationTemplate':
        return '编排文件'
      case 'applicationPackage':
        return '应用包'
      default:
        return type
    }
  }

  render() {
    let {
      children,
      pathname,
      redirectUrl,
      pathnameWithHash,
      loginUser,
      Sider,
      siderStyle,
      UpgradeModal,
      License
    } = this.props
    const hashTag = '#'
    const hashTagReg = new RegExp(hashTag, 'g')
    redirectUrl = redirectUrl.replace(hashTagReg, encodeURIComponent(hashTag))
    const {
      loginModalVisible,
      loadLoginUserSuccess,
      loginErr,
      upgradeModalShow,
      upgradeFrom,
      resourcePermissionModal,
      resourcequotaModal,
      resourcequotaMessage,
    } = this.state
    const scope = this
    if (isEmptyObject(loginUser) && loadLoginUserSuccess) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
    }
    return (
      <div className={this.props.License ? 'tenx-layout toptips' : 'tenx-layout'} id='siderTooltip'>
        {this.renderErrorMessage()}
        {this.props.tipError}
        <div className={this.state.siderStyle == 'mini' ? 'tenx-layout-header' : 'tenx-layout-header-bigger tenx-layout-header'}>
          <div className='tenx-layout-wrapper'>
            <Header pathname={pathname} setSwitchSpaceOrCluster={this.setSwitchSpaceOrCluster} />
          </div>
        </div>
        <div className={this.state.siderStyle == 'mini' ? 'tenx-layout-sider' : 'tenx-layout-sider-bigger tenx-layout-sider'}>
          <Sider pathname={pathnameWithHash} changeSiderStyle={this.props.changeSiderStyle} siderStyle={this.state.siderStyle} />
        </div>
        <div className={this.state.siderStyle == 'mini' ? 'tenx-layout-content' : 'tenx-layout-content-bigger tenx-layout-content'}>
          {this.getChildren()}
        </div>

        <Modal
          visible={loginModalVisible}
          title="登录失效"
          onCancel={this.handleLoginModalCancel}
          footer={[
            <Link to={`/login?redirect=${redirectUrl}`}>
              <Button
                key="submit"
                type="primary"
                size="large"
                onClick={this.handleLoginModalCancel}>
                去登录
              </Button>
            </Link>,
          ]}
        >
          <div style={{ textAlign: 'center' }}>
            <p>
              <svg>
                <use xlinkHref='#lost' />
              </svg>
            </p>
            <p>您的登录状态已失效，请登录后继续当前操作</p>
          </div>
        </Modal>
        {this.getStatusWatchWs()}
        {this.renderIntercom()}
        {
          UpgradeModal &&
          <UpgradeModal
            closeModal={this.handleUpgradeModalClose}
            currentType={upgradeFrom}
            visible={upgradeModalShow} />
        }
        <Xterm />
        <Modal
          title="当前操作未被授权"
          visible={resourcePermissionModal}
          maskClosable={false}
          onCancel={() => this.setState({ resourcePermissionModal: false })}
          wrapClassName="resourcePermissionModal"
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => this.setState({ resourcePermissionModal: false })}
            >
              知道了
            </Button>
          ]}
        >
          <div>
            <Icon type="cross-circle" />
            <span>
              当前操作未被授权，请联系管理员进行授权后，再进行操作
            </span>
          </div>
        </Modal>
        <Modal
          visible={resourcequotaModal}
          maskClosable={false}
          onCancel={() => this.setState({ resourcequotaModal: false })}
          wrapClassName="resourcequotaModal"
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => this.setState({ resourcequotaModal: false })}
            >
              知道了
            </Button>
          ]}
        >
          <div className="alert_content">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <div className="alert_text">
              超过配额，你目前只剩下
            <a> {resourcequotaMessage.available >= 0 ? resourcequotaMessage.available : 0} {this.quotaSuffix(resourcequotaMessage.type)} {this.quotaEn(resourcequotaMessage.type)} </a>
              配额
            </div>
            <div>
              您可以前往总览或项目详情页面查询当前配额使用情况或联系系统管理员提高配额。
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.object,
  resetErrorMessage: PropTypes.func.isRequired,
  // Injected by React Router
  children: PropTypes.node,
  pathname: PropTypes.string,
  siderStyle: PropTypes.oneOf(['mini', 'bigger']),
  intl: PropTypes.object.isRequired,
  UpgradeModal: PropTypes.func, // 升级模块
  // License: PropTypes.Boolean,
  tipError: PropTypes.node
}

App.defaultProps = {
  siderStyle: 'mini',
  Sider: DefaultSider,
}

function mapStateToProps(state, props) {
  const { errorMessage, entities, license } = state
  const { platform } = license
  const { current, sockets, loginUser } = entities
  const { location } = props
  const { pathname, search, hash } = location
  let redirectUrl = pathname
  let pathnameWithHash = pathname
  if (search) {
    redirectUrl += search
  }
  if (hash) {
    redirectUrl += hash
    pathnameWithHash += hash
  }
  return {
    reduxState: state,
    errorMessage,
    pathname,
    redirectUrl,
    pathnameWithHash,
    current,
    sockets,
    loginUser: loginUser.info,
    platform: (platform.result ? platform.result.data : {})
  }
}

App = connect(mapStateToProps, {
  resetErrorMessage,
  setSockets,
  loadLoginUserDetail,
  updateContainerList,
  updateAppList,
  updateAppServicesList,
  updateServiceContainersList,
  updateServicesList,
  loadLicensePlatform,
  loadApiInfo,
})(App)

export default injectIntl(App, {
  withRef: true,
})