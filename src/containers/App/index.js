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
import { resetErrorMessage } from '../../actions'
import { Icon, Menu, Modal, Button, Spin, } from 'antd'
import ErrorPage from '../ErrorPage'
import Header from '../../components/Header'
import Sider from '../../components/Sider/Enterprise'
import Websocket from '../../components/Websocket'
import { Link } from 'react-router'
import { setSockets, loadLoginUserDetail } from '../../actions/entities'
import { isEmptyObject } from '../../common/tools'
import { updateContainerList, updateAppList } from '../../actions/app_manage'
import { updateAppServicesList, updateServiceContainersList, updateServicesList } from '../../actions/services'
import { handleOnMessage } from './status'
import { SHOW_ERROR_PAGE_ACTION_TYPES, LOGIN_EXPIRED_MESSAGE, PAYMENT_REQUIRED_CODE, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import errorHandler from './error_handler'
import Intercom from 'react-intercom'
import NotificationHandler from '../../common/notification_handler'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.handleLoginModalCancel = this.handleLoginModalCancel.bind(this)
    this.onStatusWebsocketSetup = this.onStatusWebsocketSetup.bind(this)
    this.getStatusWatchWs = this.getStatusWatchWs.bind(this)
    this.handleUpgradeModalClose = this.handleUpgradeModalClose.bind(this)
    this.state = {
      siderStyle: props.siderStyle,
      loginModalVisible: false,
      loadLoginUserSuccess: true,
      upgradeModalShow: false,
      upgradeFrom: null,
    }
  }

  componentWillMount() {
    const self = this
    const { loginUser, loadLoginUserDetail } = this.props
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
  }

  componentWillReceiveProps(nextProps) {
    const { errorMessage, current, pathname, resetErrorMessage } = nextProps
    const { statusWatchWs } = this.props.sockets
    const { space, cluster } = current
    let notification = new NotificationHandler()
    if (space.namespace !== this.props.current.space.namespace || cluster.clusterID !== this.props.current.cluster.clusterID) {
      statusWatchWs && statusWatchWs.close()
    }
    if (!errorMessage) {
      return
    }
    const { statusCode, message } = errorMessage.error
    // 登录失效
    if (message === LOGIN_EXPIRED_MESSAGE) {
      this.setState({ loginModalVisible: true })
      return
    }
    // 余额不足
    if (statusCode === PAYMENT_REQUIRED_CODE) {
      notification.warn('操作失败', message.message, null)
      return
    }
    // 升级版本
    if (statusCode === UPGRADE_EDITION_REQUIRED_CODE) {
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

    if (this.showErrorPage(errorMessage)) {
      return
    }

    errorHandler(error, intl)

    setTimeout(resetErrorMessage)
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
    const { children, errorMessage, loginUser } = this.props
    const { loadLoginUserSuccess, loginErr } = this.state
    if (isEmptyObject(loginUser) && !loadLoginUserSuccess) {
      return (
        <ErrorPage code={loginErr.statusCode} errorMessage={{ error: loginErr }} />
      )
    }
    if (!errorMessage) {
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

  render() {
    let {
      children,
      pathname,
      redirectUrl,
      loginUser,
      Sider,
      UpgradeModal,
    } = this.props
    const {
      loginModalVisible,
      loadLoginUserSuccess,
      loginErr,
      siderStyle,
      upgradeModalShow,
      upgradeFrom,
    } = this.state
    const scope = this
    if (isEmptyObject(loginUser) && loadLoginUserSuccess) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
    }
    const user = {
      name: loginUser.userName,
      email: loginUser.email,
      phone: loginUser.phone,
      creationTime: loginUser.creationTime,
      role: loginUser.role,
      balance: loginUser.balance,
      teamCount: loginUser.teamCount
    }
    return (
      <div className='tenx-layout'>
        {this.renderErrorMessage()}
        <div id='siderTooltip'></div>
        <div className={this.state.siderStyle == 'mini' ? 'tenx-layout-header' : 'tenx-layout-header-bigger tenx-layout-header'}>
          <div className='tenx-layout-wrapper'>
            <Header />
          </div>
        </div>
        <div className={this.state.siderStyle == 'mini' ? 'tenx-layout-sider' : 'tenx-layout-sider-bigger tenx-layout-sider'}>
          <Sider pathname={pathname} scope={scope} siderStyle={this.state.siderStyle} />
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
            <p><img src="/img/lost.svg" /></p>
            <p>您的登录状态已失效，请登录后继续当前操作</p>
          </div>
        </Modal>
        {this.getStatusWatchWs()}
        <Intercom appID='okj9h5pl' { ...user } />
        {
          UpgradeModal &&
          <UpgradeModal
            closeModal={this.handleUpgradeModalClose}
            currentType={upgradeFrom}
            visible={upgradeModalShow} />
        }
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
  Sider: PropTypes.any.isRequired,
  intl: PropTypes.object.isRequired,
  UpgradeModal: PropTypes.object, // 升级模块
}

App.defaultProps = {
  siderStyle: 'mini',
  Sider,
}

function mapStateToProps(state, props) {
  const { errorMessage, entities } = state
  const { current, sockets, loginUser } = entities
  const { location } = props
  const { pathname, search, hash } = location
  let redirectUrl = pathname
  if (search) {
    redirectUrl += search
  }
  if (hash) {
    redirectUrl += hash
  }
  return {
    reduxState: state,
    errorMessage,
    pathname,
    redirectUrl,
    current,
    sockets,
    loginUser: loginUser.info,
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
})(App)

export default injectIntl(App, {
  withRef: true,
})