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
import { injectIntl, FormattedMessage } from 'react-intl'
import { Icon, Menu, Modal, Button, Spin, Form, } from 'antd'
import ErrorPage from '../ErrorPage'
// import Header, { SPACE_CLUSTER_PATHNAME_MAP } from '../../components/Header'
import { SPACE_CLUSTER_PATHNAME_MAP } from '../../components/Header'
// import DefaultSider from '../../components/Sider/Enterprise'
import Websocket from '../../components/Websocket'
import { browserHistory, Link } from 'react-router'
import {
  isEmptyObject, getPortalRealMode, isResourcePermissionError,
  isResourceQuotaError, getCookie, setCookie,
} from '../../common/tools'
import { resetErrorMessage } from '../../actions'
import {
  setSockets, loadLoginUserDetail,
  setCurrent, setListProjects, setProjectVisibleClusters,
  // setLoginUser,
} from '../../actions/entities'
import { getResourceDefinition } from '../../actions/quota'
import { updateContainerList, updateAppList } from '../../actions/app_manage'
import { loadLicensePlatform } from '../../actions/license'
import { updateAppServicesList, updateServiceContainersList, updateServicesList } from '../../actions/services'
import { handleOnMessage } from './status'
import {
  SHOW_ERROR_PAGE_ACTION_TYPES,
  LOGIN_EXPIRED_MESSAGE,
  PAYMENT_REQUIRED_CODE,
  UPGRADE_EDITION_REQUIRED_CODE,
  LICENSE_EXPRIED_CODE,
  LITE, MY_SPACE,
  KEYCLOAK_TOKEN,
  KEYCLOAK_REFRESHTOKEN,
} from '../../constants'
import TenxIcon from '@tenx-ui/icon/es/_old'
import errorHandler from './error_handler'
import Intercom from 'react-intercom'
import NotificationHandler from '../../common/notification_handler'
import Xterm from '../../../client/containers/Term'
import IntlMessages from './Intl'
import CommonIntlMessages from '../CommonIntl'
import noProjectsImage from '../../assets/img/no-projects.png'
import noClustersImage from '../../assets/img/no-clusters.png'
import classNames from 'classnames'
import { USER_CURRENT_CONFIG, INTL_COOKIE_NAME } from '../../../constants'
import Keycloak from '../../3rd_account/Keycloak'
import UnifiedNav from '@tenx-ui/b-unified-navigation'
import '@tenx-ui/b-unified-navigation/assets/index.css'
import * as openApiActions from '../../actions/open_api'
import * as storageActions from '../../actions/storage'
import { camelizeKeys } from 'humps'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = mode === standard
const realMode = getPortalRealMode()

const EXCLUDE_GET_CLUSTER_INFO_PATH = [
  '/cluster',
]

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.handleLoginModalCancel = this.handleLoginModalCancel.bind(this)
    this.onStatusWebsocketSetup = this.onStatusWebsocketSetup.bind(this)
    this.getStatusWatchWs = this.getStatusWatchWs.bind(this)
    this.handleUpgradeModalClose = this.handleUpgradeModalClose.bind(this)
    // this.setSwitchSpaceOrCluster = this.setSwitchSpaceOrCluster.bind(this)
    this.quotaSuffix = this.quotaSuffix.bind(this)
    this.state = {
      // siderStyle: props.siderStyle,
      loginModalVisible: false,
      loadErrorModalVisible: false,
      loadLoginUserSuccess: true,
      upgradeModalShow: false,
      upgradeFrom: null,
      resourcePermissionModal: false,
      switchSpaceOrCluster: false,
      resourcequotaModal: false,
      resourcequotaMessage: {},
      message403: "",
      resource: [],
      locale: getCookie(INTL_COOKIE_NAME),
    }
  }

  async componentWillMount() {
    const self = this
    const { loginUser, loadLoginUserDetail, intl, loadApiInfo } = this.props
    loadApiInfo()
    window._intl = intl
    const { formatMessage } = intl
    MY_SPACE.name = formatMessage(CommonIntlMessages.myProject)
    MY_SPACE.spaceName = formatMessage(CommonIntlMessages.myProject)
    MY_SPACE.teamName = formatMessage(CommonIntlMessages.teamName)
    // load user info
    if (isEmptyObject(loginUser)) {
      await loadLoginUserDetail({
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
    if (this.props.loginUser && this.props.loginUser.accountType === 'keycloak') {
      if (!window.localStorage) {
        return
      }
      const token = localStorage.getItem(KEYCLOAK_TOKEN)
      const refreshToken = localStorage.getItem(KEYCLOAK_REFRESHTOKEN)
      const keycloak = new Keycloak()
      const authenticated = await keycloak.init({ token, refreshToken })
      if (!authenticated) {
        return window.location.href = '/logout'
      }
      keycloak.client.onAuthLogout = () => {
        window.location.href = '/logout'
      }
    }
  }

  setSwitchSpaceOrClusterTrue = (extras, cb) => {
    const {
      pathname,
    } = this.props
    this.setState({
      switchSpaceOrCluster: true,
    }, cb)
    // 只有用户点击的切换行为才做跳转
    if (extras.e) {
      if (pathname.match(/\//g).length > 2 && this.checkPath(pathname)) {
        browserHistory.push('/')
      }
    }
  }

  setSwitchSpaceOrClusterFalse = () => {
    this.setState({
      switchSpaceOrCluster: false,
    })
  }

  checkPath(pathname) {
    const pathArr = [
      '/app_manage/app_create/quick_create',
      '/app_center/projects/public',
      '/app_center/projects/publish',
      '/app_center/projects/replications',
      '/app_center/projects/other',
      '/app_center/template/create',
      '/manange_monitor/alarm_setting/resource',
      '/manange_monitor/alarm_setting/log',
      '/middleware_center/app/config',
      '/manange_monitor/alarm_record/resource',
      '/manange_monitor/alarm_record/log',
      '/net-management/appLoadBalance/createLoadBalance',
    ]
    if(pathname === '/app_manage/app_create/quick_create' &&
      this.props.location.hash === "#configure-service"){
      return true
    }
    return !(pathArr.indexOf(pathname) > -1)
  }
  componentWillReceiveProps(nextProps) {
    const {
      errorMessage,
      pathname,
      resetErrorMessage,
      redirectUrl,
      // siderStyle,
      current: newCurrent,
    } = nextProps
    // this.setState({ siderStyle })
    const {
      sockets,
      current: oldCurrent,
    } = this.props
    const { formatMessage } = this.props.intl
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
      let msg = formatMessage(IntlMessages.insufficientBalance)
      if (newSpace.namespace !== 'default') {
        if (standardFlag) {
          msg = formatMessage(IntlMessages.teamInsufficientBalance)
        } else {
          msg = formatMessage(IntlMessages.projectInsufficientBalance)
        }
      }
      notification.warn(formatMessage(IntlMessages.operationFailed), msg, null)
      return
    }

    // 配额不足
    if (isResourceQuotaError(errorMessage.error)) {
      this.setState({
        resourcequotaModal: true,
        resourcequotaMessage: JSON.parse(message.message),
      })
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
    }
    // license 过期
    if (statusCode === LICENSE_EXPRIED_CODE) {
      notification.error(formatMessage(IntlMessages.licenseExpired))
      window.location.href = '/logout'
      return
    }
    // 没有权限
    if (isResourcePermissionError(errorMessage.error)) {
      let state = {
        resourcePermissionModal: true,
      };
      if(!!errorMessage.error.message.data && !!errorMessage.error.message.data.desc){
        state.message403 = errorMessage.error.message.data.desc;
      }else{
        state.message403 = "";
      }
      this.setState(state);
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

    // 配额不足
    if (isResourceQuotaError(error)) {
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
    const { children, errorMessage, loginUser, current, location } = this.props
    const { pathname } = location
    const { loadLoginUserSuccess, loginErr, switchSpaceOrCluster } = this.state
    if (isEmptyObject(loginUser) && !loadLoginUserSuccess) {
      return (
        <ErrorPage code={loginErr.statusCode} errorMessage={{ error: loginErr }} />
      )
    }
    if (errorMessage) {
      const { statusCode } = errorMessage.error
      if (this.showErrorPage(errorMessage)) {
        return (
          <ErrorPage code={statusCode} errorMessage={errorMessage} />
        )
      }
    }
    let showProjectOrCluster = false
    const showProjectOrClusterPaths = [
      ...SPACE_CLUSTER_PATHNAME_MAP.space,
      ...SPACE_CLUSTER_PATHNAME_MAP.cluster,
      ...SPACE_CLUSTER_PATHNAME_MAP.loadProjectAndClusterNeeded,
    ]
    showProjectOrClusterPaths.every(path => {
      if (pathname.search(path) == 0) {
        showProjectOrCluster = true
        return false
      }
      return true
    })
    if (!showProjectOrCluster) {
      return children
    }
    if (current.space.noProjectsFlag) {
      return (
        <div className="loading">
          <img src={noProjectsImage} alt="no-projects" />
          <br />
          <FormattedMessage
            {...IntlMessages.noProjetsTipWithLink}
            values={{
              link: <Link to="/tenant_manage/project_manage">
                <FormattedMessage {...IntlMessages.createProject} />
              </Link>
            }}
          />
        </div>
      )
    }
    if (current.space.noClustersFlag) {
      return (
        <div className="loading">
          <img src={noClustersImage} alt="no-clusters" />
          <br />
          <FormattedMessage
            {...IntlMessages.noClustersTipWithLink}
            values={{
              link: <Link to={`/tenant_manage/project_manage/project_detail?name=${current.space.projectName}`}>
                <FormattedMessage {...IntlMessages.applyClusters} />
              </Link>
            }}
          />
        </div>
      )
    }
    if (!current.space.projectName) {
      return (
        <div className="loading">
          <Spin size="large" /> <FormattedMessage {...IntlMessages.initialization} />
        </div>
      )
    }
    if (!current.cluster.apiHost && EXCLUDE_GET_CLUSTER_INFO_PATH.indexOf(pathname) < 0) {
      return (
        <div className="loading">
          <Spin size="large" /> <FormattedMessage {...IntlMessages.getClusterInfo} />
        </div>
      )
    }
    /* if (switchSpaceOrCluster) {
      return (
        <div key="loading" className="loading">
          <Spin size="large" /> <FormattedMessage {...IntlMessages.switchClusterOrProject} />
        </div>
      )
    } */
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
    // 捕获错误，主要用于网站升级后加载 js 失败，提醒用户刷新页面
    window.addEventListener('error', e => {
      const { target } = e
      if (target && target.src && target.tagName === 'SCRIPT') {
        let { src } = target
        src = src.replace(window.location.origin, '')
        if (/^\/bundles\/[a-zA-Z0-9\.]+\.js$/.test(src)) {
          this.setState({
            loadErrorModalVisible: true,
          })
          return false
        }
      }
    }, true)

    const { loadLicensePlatform, getResourceDefinition } = this.props
    if (realMode === LITE) {
      loadLicensePlatform()
    }

    getResourceDefinition({
      success: {
        func: res => {
          if (res.code === 200) {
            const tempData = res.data.definitions
            const resolveData = arr => {
              const tempArr = []
              const arrData = arr
              const func = data => {
                for (const v of data) {
                  tempArr.push(v)
                  if(v.children) {
                    func(v.children)
                  }
                }
              }
              func(arrData)
              return tempArr
            }
            this.setState({
              resource: resolveData(tempData)
            })
          }
        }
      }
    })
  }
  quotaSuffix(type) {
    const { formatMessage } = this.props.intl
    let suffix = ''
    switch (type) {
      case 'cpu':
        return suffix = 'C'
      case 'memory':
        return suffix = 'GB'
      case 'storage':
        return suffix = 'GB'
      default:
        return suffix = formatMessage(IntlMessages.one)
    }
  }
  quotaEn(type) {
    for (const v of this.state.resource) {
      if(type === v.resourceType) {
        return v.resourceName
      }
    }
  }

  loadStorageClassType(cluster) {
    if(!cluster){
      return
    }
    const { getStorageClassType, setCurrent } = this.props
    const defalutStorageCLassType = {
      private: false,
      share: false,
      host: false,
    }
    Object.assign(cluster, { storageClassType: defalutStorageCLassType })
    setCurrent({
      cluster,
    })
    const { clusterID } = cluster
    if (!clusterID || clusterID === 'undefined') {
      return
    }
    getStorageClassType(clusterID, {
      success: {
        func: res => {
          Object.assign(cluster,{ storageClassType: res.data})
          setCurrent({
            cluster,
          })
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          setCurrent({
            cluster,
          })
        },
        isAsync: true,
      }
    })
  }

  onProjectChange = (project, projects, extras = {}) => {
    this.setSwitchSpaceOrClusterTrue(extras, () => {
      // 历史遗留问题，需要转成小驼峰
      project = camelizeKeys(project)
      project.name = project.displayName ? `${project.displayName} ( ${project.projectName} )`  : project.projectName
      const { setCurrent, setListProjects } = this.props
      setCurrent({
        space: project,
        cluster: {},
      })
      projects = camelizeKeys(projects)
      setListProjects(projects)
      this.setSwitchSpaceOrClusterFalse()
    })
  }

  onClusterChange = (cluster, clusters, extras = {}) => {
    this.setSwitchSpaceOrClusterTrue(extras, () => {
      // 历史遗留问题，需要转成小驼峰
      cluster = camelizeKeys(cluster)
      const { setCurrent, setProjectVisibleClusters, current } = this.props
      setCurrent({
        cluster,
      })
      clusters = camelizeKeys(clusters)
      const { namespace } = current.space
      setProjectVisibleClusters(namespace, clusters[namespace])
      this.loadStorageClassType(cluster)
      this.setSwitchSpaceOrClusterFalse()
    })
  }

  // loginUser need more info, such as vmWrapConfig
  /* onAuthReady = async (authData, loginUser) => {
    const { setLoginUser } = this.props
    setLoginUser(loginUser)
    if (loginUser && loginUser.accountType === 'keycloak') {
      if (!window.localStorage) {
        return
      }
      const token = localStorage.getItem(KEYCLOAK_TOKEN)
      const refreshToken = localStorage.getItem(KEYCLOAK_REFRESHTOKEN)
      const keycloak = new Keycloak()
      const authenticated = await keycloak.init({ token, refreshToken })
      if (!authenticated) {
        return window.location.href = '/logout'
      }
      keycloak.client.onAuthLogout = () => {
        window.location.href = '/logout'
      }
    }
  } */

  render() {
    let {
      pathname,
      redirectUrl,
      pathnameWithHash,
      loginUser,
      currentUser,
      // Sider,
      // siderStyle,
      UpgradeModal,
      location,
      License
    } = this.props
    const { formatMessage } = this.props.intl
    const hashTag = '#'
    const hashTagReg = new RegExp(hashTag, 'g')
    redirectUrl = redirectUrl.replace(hashTagReg, encodeURIComponent(hashTag))
    const {
      loginModalVisible,
      loadErrorModalVisible,
      loadLoginUserSuccess,
      loginErr,
      upgradeModalShow,
      upgradeFrom,
      resourcePermissionModal,
      resourcequotaModal,
      resourcequotaMessage,
    } = this.state
    /* let OpenStack = siderStyle == 'bigger'
    if (location.pathname.indexOf('/OpenStack') > -1) {
      OpenStack = true
    }
    const headerClassName = classNames('tenx-layout-header',{
      'tenx-layout-header-bigger': OpenStack
    })
    const siderClassName = classNames('tenx-layout-sider',{
      'tenx-layout-sider-bigger': OpenStack
    })
    const contentClassName = classNames('tenx-layout-content',{
      'tenx-layout-content-bigger': OpenStack
    }) */
    if (isEmptyObject(loginUser) && loadLoginUserSuccess) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
    }
    const { username, token, oemInfo, vmWrapConfig } = this.props
    const { paasApiUrl, userPortalUrl, msaPortalUrl } = window.__INITIAL_CONFIG__
    const config = {
      paasApiUrl, userPortalUrl, msaPortalUrl, oemInfo,
      vmWrapEnabled: vmWrapConfig.enabled,
    }
    if (!token) {
      return <div className="loading">
        <Spin size="large" />
      </div>
    }
    return (
      <div>
        {this.renderErrorMessage()}
        {this.props.tipError}
        <UnifiedNav
          key="portal"
          portal="user-portal"
          switchingProjectCluster={this.state.switchSpaceOrCluster}
          pathname={pathname}
          showSider={true}
          showHeader={true}
          Link={Link}
          config={config}
          onProjectChange={this.onProjectChange}
          onClusterChange={this.onClusterChange}
          // onAuthReady={this.onAuthReady}
          username={username}
          token={token}
          locale={this.state.locale}
          changeLocale={locale => {
            setCookie(INTL_COOKIE_NAME, locale)
            this.setState({ locale })
            this.props.setCurrent({ locale })
            // window.location.reload()
          }}
        >
          {this.getChildren()}
        </UnifiedNav>
        <Xterm />
        {this.getStatusWatchWs()}
        {this.renderIntercom()}
        <Modal
          visible={loginModalVisible}
          title={formatMessage(IntlMessages.loginExpired)}
          onCancel={this.handleLoginModalCancel}
          footer={[
            <Link to={`/login?redirect=${redirectUrl}`}>
              <Button
                key="submit"
                type="primary"
                size="large"
                onClick={this.handleLoginModalCancel}
              >
                <FormattedMessage {...IntlMessages.goLogin} />
              </Button>
            </Link>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <p style={{ marginBottom: 16 }}>
              <TenxIcon type="lost" size={120}/>
            </p>
            <p><FormattedMessage {...IntlMessages.loginExpiredTip} /></p>
          </div>
        </Modal>
        <Modal
          visible={loadErrorModalVisible}
          title={formatMessage(IntlMessages.loadError)}
          maskClosable={false}
          closable={false}
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => window.location.reload()}
            >
              <FormattedMessage {...IntlMessages.loadErrorBtn} />
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <p style={{ marginBottom: 16 }}>
              <TenxIcon type="lost" size={120}/>
            </p>
            <p><FormattedMessage {...IntlMessages.loadErrorTips} /></p>
          </div>
        </Modal>
        <Modal
          visible={currentUser && loginUser.userName && currentUser !== loginUser.userName}
          title={formatMessage(IntlMessages.loginUserChanged)}
          maskClosable={false}
          closable={false}
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => window.location.reload()}
            >
              <FormattedMessage {...IntlMessages.loginUserChangedBtn} />
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: 8 }}></i>
              <FormattedMessage {...IntlMessages.loginUserChangedTips} values={{ user: currentUser }} />
            </div>
          </div>
        </Modal>
        {
          UpgradeModal &&
          <UpgradeModal
            closeModal={this.handleUpgradeModalClose}
            currentType={upgradeFrom}
            visible={upgradeModalShow} />
        }
        <Modal
          width="550px"
          title={formatMessage(IntlMessages.notAuthorized)}
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
              <FormattedMessage {...IntlMessages.gotIt} />
            </Button>
          ]}
        >
          <div>
            <Icon type="cross-circle" />
            <FormattedMessage
              {...IntlMessages.notAuthorizedTip}
              values={{
                operation: !!this.state.message403
                  ? `"${this.state.message403}"`
                  : ''
              }}
            />
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
              <FormattedMessage {...IntlMessages.gotIt} />
            </Button>
          ]}
        >
          <div className="alert_content">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <div className="alert_text">
              <FormattedMessage
                {...IntlMessages.resourceQuotaTip1}
                values={{
                  leftResource: <a>
                    {
                      resourcequotaMessage.available >= 0
                      ? this.quotaSuffix(resourcequotaMessage.type) === formatMessage(IntlMessages.one)
                        ? resourcequotaMessage.available.toFixed(0)
                        : resourcequotaMessage.available.toFixed(2)
                      : 0
                    }
                    {this.quotaSuffix(resourcequotaMessage.type)} {this.quotaEn(resourcequotaMessage.type)}
                  </a>,
                }}
              />
            </div>
            <div>
              <FormattedMessage {...IntlMessages.resourceQuotaTip2} />
            </div>
          </div>
        </Modal>
      </div>
    )
    /* return (
      <div className={this.props.License ? 'tenx-layout toptips' : 'tenx-layout'} id='siderTooltip'>
        {this.renderErrorMessage()}
        {this.props.tipError}
        <div className={headerClassName} style={this.props.tipError? { top: 50 } : null}>
          <div className='tenx-layout-wrapper'>
            <Header pathname={pathname} setSwitchSpaceOrCluster={this.setSwitchSpaceOrCluster} />
          </div>
        </div>
        <div className={siderClassName} style={this.props.tipError? { top: 50 } : null}>
          <Sider
            pathname={pathnameWithHash}
            changeSiderStyle={this.props.changeSiderStyle}
            siderStyle={siderStyle}
            tipError={this.props.tipError}
          />
        </div>
        <div className={contentClassName} style={this.props.tipError? { marginTop: 50 } : null}>
          {this.getChildren()}
        </div>

        <Modal
          visible={loginModalVisible}
          title={formatMessage(IntlMessages.loginExpired)}
          onCancel={this.handleLoginModalCancel}
          footer={[
            <Link to={`/login?redirect=${redirectUrl}`}>
              <Button
                key="submit"
                type="primary"
                size="large"
                onClick={this.handleLoginModalCancel}
              >
                <FormattedMessage {...IntlMessages.goLogin} />
              </Button>
            </Link>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <p style={{ marginBottom: 16 }}>
              <TenxIcon type="lost" size={120}/>
            </p>
            <p><FormattedMessage {...IntlMessages.loginExpiredTip} /></p>
          </div>
        </Modal>
        <Modal
          visible={loadErrorModalVisible}
          title={formatMessage(IntlMessages.loadError)}
          maskClosable={false}
          closable={false}
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => window.location.reload()}
            >
              <FormattedMessage {...IntlMessages.loadErrorBtn} />
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <p style={{ marginBottom: 16 }}>
              <TenxIcon type="lost" size={120}/>
            </p>
            <p><FormattedMessage {...IntlMessages.loadErrorTips} /></p>
          </div>
        </Modal>
        <Modal
          visible={currentUser && loginUser.userName && currentUser !== loginUser.userName}
          title={formatMessage(IntlMessages.loginUserChanged)}
          maskClosable={false}
          closable={false}
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={() => window.location.reload()}
            >
              <FormattedMessage {...IntlMessages.loginUserChangedBtn} />
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center' }} className="logon-filure">
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: 8 }}></i>
              <FormattedMessage {...IntlMessages.loginUserChangedTips} values={{ user: currentUser }} />
            </div>
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
          width="550px"
          title={formatMessage(IntlMessages.notAuthorized)}
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
              <FormattedMessage {...IntlMessages.gotIt} />
            </Button>
          ]}
        >
          <div>
            <Icon type="cross-circle" />
            <FormattedMessage
              {...IntlMessages.notAuthorizedTip}
              values={{
                operation: !!this.state.message403
                  ? `"${this.state.message403}"`
                  : ''
              }}
            />
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
              <FormattedMessage {...IntlMessages.gotIt} />
            </Button>
          ]}
        >
          <div className="alert_content">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <div className="alert_text">
              <FormattedMessage
                {...IntlMessages.resourceQuotaTip1}
                values={{
                  leftResource: <a>
                    {
                      resourcequotaMessage.available >= 0
                      ? this.quotaSuffix(resourcequotaMessage.type) === formatMessage(IntlMessages.one)
                        ? resourcequotaMessage.available.toFixed(0)
                        : resourcequotaMessage.available.toFixed(2)
                      : 0
                    }
                    {this.quotaSuffix(resourcequotaMessage.type)} {this.quotaEn(resourcequotaMessage.type)}
                  </a>,
                }}
              />
            </div>
            <div>
              <FormattedMessage {...IntlMessages.resourceQuotaTip2} />
            </div>
          </div>
        </Modal>
      </div>
    ) */
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.object,
  resetErrorMessage: PropTypes.func.isRequired,
  // Injected by React Router
  children: PropTypes.node,
  pathname: PropTypes.string,
  // siderStyle: PropTypes.oneOf(['mini', 'bigger']),
  intl: PropTypes.object.isRequired,
  UpgradeModal: PropTypes.func, // 升级模块
  // License: PropTypes.Boolean,
  tipError: PropTypes.node
}

App.defaultProps = {
  // siderStyle: 'mini',
  // Sider: DefaultSider,
}

function mapStateToProps(state, props) {
  const { errorMessage, entities, license, colorState } = state
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
  const config = getCookie(USER_CURRENT_CONFIG) || ''
  let [ currentUser ] = config.split(',')
  const { username, token } = state.openApi.result || {}
  return {
    username,
    token,
    reduxState: state,
    errorMessage,
    pathname,
    redirectUrl,
    pathnameWithHash,
    current,
    sockets,
    currentUser,
    loginUser: loginUser.info,
    platform: (platform.result ? platform.result.data : {}),
    oemInfo: getDeepValue(loginUser, [ 'info', 'oemInfo' ]) || {},
    vmWrapConfig: getDeepValue(loginUser, [ 'info', 'vmWrapConfig' ]) || {},
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
  getResourceDefinition, // 获取资源定义
  loadApiInfo: openApiActions.loadApiInfo,
  setCurrent,
  getStorageClassType: storageActions.getStorageClassType,
  setListProjects,
  setProjectVisibleClusters,
  // setLoginUser,
})(App)

export default injectIntl(App, {
  withRef: true,
})
