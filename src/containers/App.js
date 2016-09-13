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
import { Icon, Menu } from 'antd'
import Header from '../components/Header'
import Sider from '../components/Sider'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
  }

  handleDismissClick(e) {
    this.props.resetErrorMessage()
    e.preventDefault()
  }

  renderErrorMessage() {
    const { errorMessage } = this.props
    if (!errorMessage) {
      return null
    }

    return (
      <p style={{ backgroundColor: '#e99', padding: 10 }}>
        <b>{errorMessage}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    )
  }

  render() {
    const { children, pathname } = this.props
    return (
      <div className="tenx-layout">
        {this.renderErrorMessage()}
        <div className="tenx-layout-header">
          <div className="tenx-layout-wrapper">
            <Header />
          </div>
        </div>
        <div className="tenx-layout-sider">
          <Sider pathname={pathname}/>
        </div>
        <div className="tenx-layout-content">
          {children}
        </div>
      </div>
    )
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.string,
  resetErrorMessage: PropTypes.func.isRequired,
  // Injected by React Router
  children: PropTypes.node,
  pathname: PropTypes.string
}

function mapStateToProps(state) {
  return {
    errorMessage: state.errorMessage,
    pathname: state.routing.locationBeforeTransitions.pathname
  }
}

export default connect(mapStateToProps, {
  resetErrorMessage
})(App)
