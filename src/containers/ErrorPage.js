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

class ErrorPage extends Component {
  constructor(props) {
    super(props)
  }

  renderErrorMessage() {
    let { code, message } = this.props
    if (message.message) {
      message = message.message
    }
    return (
      <p>
        <h1>{`${code} error`}</h1>
        <h2>{message}</h2>
      </p>
    )
  }

  render() {
    return (
      <div id='NotFoundErrorPageBox'>
        {this.renderErrorMessage()}
        <iframe className='NotFoundErrorPage' src='/ErrorPage/index.html'>
        </iframe>
      </div>
    )
  }
}

ErrorPage.propTypes = {
  code: PropTypes.number.isRequired,
  message: PropTypes.object,
}

export default ErrorPage