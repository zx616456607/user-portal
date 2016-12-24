/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Error page
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import './style/ErrorPage.less'

class ErrorPage extends Component {
  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { code, errorMessage } = nextProps
    const { type } = errorMessage || {}
    const _errorMessage = this.props.errorMessage || {}
    if (code === this.props.code && type === _errorMessage.type) {
      return false
    }
    return true
  }

  renderErrorMessage() {
    const { code, errorMessage } = this.props
    const { error } = errorMessage
    let { message } = error
    if (message && message.message) {
      message = message.message
    }
    return (
      <div>
        <h1>{`${code} error`}</h1>
        <h2>{message}</h2>
      </div>
    )
  }

  render() {
    const { code, errorMessage } = this.props
    const { error } = errorMessage
    let { message } = error
    if (message && message.message) {
      message = message.message
    }
    return (
      <div id='NotFoundErrorPageBox' className='CommonSecondContent'>
        <p className='codeTitle'>{code}</p>
        <img className='errorImg' src='/img/error404.png' />
        <p>{message}</p>
        <p>
          <Link to='/'>
            <div className='backBtn'>返回首页</div>
          </Link>
        </p>
      </div>
    )
  }
}

ErrorPage.propTypes = {
  code: PropTypes.number.isRequired,
  errorMessage: PropTypes.object,
}

ErrorPage.defaultProps = {
  code: 404,
  errorMessage: {
    error: {
      message: "Page not found"
    }
  },
}

export default ErrorPage