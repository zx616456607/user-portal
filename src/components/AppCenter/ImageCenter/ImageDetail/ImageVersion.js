/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ImageVersion component
 * 
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import './style/ImageVersion.less'

export default class ImageVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
    }
  }
  
  render() {
    return (
      <Card className="ImageVersion">
        <i className="fa fa-tag"></i>&nbsp;
        2.3.3
    	</Card>
    )
  }
}

ImageVersion.propTypes = {
//
}
