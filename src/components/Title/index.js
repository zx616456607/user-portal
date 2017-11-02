/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  personalized All Title
 *
 * v0.1 - 2017-7-17
 * @author BaiYu
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'

class Title extends Component {
  constructor(props) {
    super(props)
  }
  componentWillReceiveProps(nextProps) {
    const { productName, title } = nextProps
    let topTitle = title
    if (productName) {
      topTitle = title + ' | '+ productName
    }
    if (title !== this.props.title || productName !== this.props.productName) {
      document.title = topTitle
    }
  }
  componentDidMount() {
    const { productName, title } = this.props
    let topTitle = title
    if (productName) {
      topTitle = title + ' | ' + productName
    }
    document.title = topTitle
  }
  render() {
    return null
  }
}

function mapStateToProps(state,props) {
  // state.entities.loginUser.info
  const { loginUser } = state.entities
  const oemInfo = loginUser.info.oemInfo || {}
  const { productName } = oemInfo.company || {}
  return {
    productName
  }
}


export default connect(mapStateToProps)(Title)