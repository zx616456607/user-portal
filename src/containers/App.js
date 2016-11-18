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
import { resetErrorMessage } from '../actions'
import { Icon, Menu, notification, Modal, Button } from 'antd'
import ErrorPage from './ErrorPage'
import Header from '../components/Header'
import Sider from '../components/Sider'
import { Link } from 'react-router'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.state = {
      siderStyle: 'mini',
      loginModalVisible: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    const { errorMessage } = nextProps
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

  render() {
    let { children, pathname, errorMessage } = this.props
    const { loginModalVisible } = this.state
    const scope = this
    /*if (errorMessage) {
      if (errorMessage.statusCode === 404) {
        children = (
          <ErrorPage />
        )
      }
    }*/
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
  return {
    errorMessage: state.errorMessage,
    pathname: props.location.pathname
  }
}

export default connect(mapStateToProps, {
  resetErrorMessage
})(App)
