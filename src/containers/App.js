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
import { Icon, Menu, notification } from 'antd'
import ErrorPage from './ErrorPage'
import Header from '../components/Header'
import Sider from '../components/Sider'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.state = {
      siderStyle: 'mini'
    }
  }

  handleDismissClick() {
    this.props.resetErrorMessage()
  }

  renderErrorMessage() {
    const { errorMessage } = this.props
    const handleDismissClick = this.handleDismissClick
    if (!errorMessage) {
      return null
    }

    notification.error({
      message: 'error',
      description: JSON.stringify(errorMessage.message),
      // duration: 4.5,
      // duration: null,
      onClose: handleDismissClick
    })

    setTimeout(this.props.resetErrorMessage)
  }

  render() {
    let { children, pathname, errorMessage } = this.props
    const scope = this;
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
        <div className={ this.state.siderStyle == 'mini' ? 'tenx-layout-header' : 'tenx-layout-header-bigger tenx-layout-header'}>
          <div className='tenx-layout-wrapper'>
            <Header />
          </div>
        </div>
        <div className={ this.state.siderStyle == 'mini' ? 'tenx-layout-sider' : 'tenx-layout-sider-bigger tenx-layout-sider'}>
          <Sider pathname={pathname} scope={scope} siderStyle={this.state.siderStyle} />
        </div>
        <div className={ this.state.siderStyle == 'mini' ? 'tenx-layout-content' : 'tenx-layout-content-bigger tenx-layout-content'}>
          {children}
        </div>
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
