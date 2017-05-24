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
    const { productName,title } = this.props
    if (title !== nextProps.title) {
      document.title = nextProps.title +' | '+ productName
    }
  }
  componentDidMount() {
    const { productName,title } = this.props
    document.title = this.props.title +' | '+productName
  }
  render() {
    console.log('productName',this.props.productName)
    return (
      <span></span>
    )
  }
}

function mapStateToProps(state,props) {
  // state.entities.loginUser.info
  const { loginUser } = state.entities
  const { oemInfo } = loginUser.info
  const { productName } = oemInfo.company
  return {
    productName
  }
}


export default connect(mapStateToProps)(Title)