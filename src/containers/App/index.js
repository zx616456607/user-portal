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
import { resetErrorMessage } from '../../actions'
import { Icon, Menu, notification, Modal, Button, Spin, } from 'antd'
import ErrorPage from '../ErrorPage'
import Header from '../../components/Header'
import Sider from '../../components/Sider'
import WebSocket from '../../components/WebSocket'
import { Link } from 'react-router'
import { setSockets, loadLoginUserDetail } from '../../actions/entities'
import { isEmptyObject } from '../../common/tools'
import { updateContainerList } from '../../actions/app_manage'
import { handleOnMessage } from './status'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.handleLoginModalCancel = this.handleLoginModalCancel.bind(this)
    this.onStatusWebsocketSetup = this.onStatusWebsocketSetup.bind(this)
    this.getStatusWatchWs = this.getStatusWatchWs.bind(this)
    this.state = {
      siderStyle: 'mini',
      loginModalVisible: false,
    }
  }

  componentWillMount() {
    const { loginUser, loadLoginUserDetail } = this.props
    // load user info
    if (isEmptyObject(loginUser)) {
      loadLoginUserDetail()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { errorMessage, current } = nextProps
    const { statusWatchWs } = this.props.sockets
    const { space, cluster } = current
    if (space.namespace !== this.props.current.space.namespace || cluster.clusterID !== this.props.current.cluster.clusterID) {
      statusWatchWs && statusWatchWs.close()
    }
    if (!errorMessage) {
      return
    }
    if (errorMessage.message === 'LOGIN_EXPIRED') {
      this.setState({ loginModalVisible: true })
      return
    }
  }

  handleDismissClick() {
    this.props.resetErrorMessage()
  }

  handleLoginModalCancel() {
    this.setState({ loginModalVisible: false })
  }

  renderErrorMessage() {
    const { errorMessage, resetErrorMessage } = this.props
    const handleDismissClick = this.handleDismissClick
    if (!errorMessage) {
      return null
    }

    if (errorMessage.message === 'LOGIN_EXPIRED') {
      resetErrorMessage()
      return
    }

    notification.error({
      message: 'error',
      description: JSON.stringify(errorMessage.message),
      // duration: 4.5,
      // duration: null,
      onClose: handleDismissClick
    })

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
      handleOnMessage(this.props, JSON.parse(event.data))
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
    return (
      <WebSocket
        url={`ws://${loginUser.tenxApi.host}/spi/v2/watch`}
        onSetup={this.onStatusWebsocketSetup}
        debug={true} />
    )
  }

  render() {
    let { children, pathname, errorMessage, loginUser } = this.props
    const { loginModalVisible } = this.state
    const scope = this
    /*if (errorMessage) {
      if (errorMessage.statusCode === 404) {
        children = (
          <ErrorPage />
        )
      }
    }*/
    if (isEmptyObject(loginUser)) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
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
          {children}
          {this.getChildren}
        </div>
        <Modal
          visible={loginModalVisible}
          title="登录失效"
          onCancel={this.handleLoginModalCancel}
          footer={[
            <Link to={`/login?redirect=${pathname}`}>
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
  pathname: PropTypes.string
}

function mapStateToProps(state, props) {
  const { errorMessage, entities } = state
  const { current, sockets, loginUser } = entities
  return {
    reduxState: state,
    errorMessage,
    pathname: props.location.pathname,
    current,
    sockets,
    loginUser: loginUser.info,
  }
}

export default connect(mapStateToProps, {
  resetErrorMessage,
  setSockets,
  loadLoginUserDetail,
  updateContainerList,
})(App)
