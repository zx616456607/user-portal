/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import './style/DetailInfo.less'

export default class DetailInfo extends Component {
  constructor(props) {
    super(props);
    // codeBox
  }
  render() {
    const detailMarkdown  = this.props.detailInfo
    return (
      <Card className="imageDetailInfo">
        <div dangerouslySetInnerHTML={{__html:detailMarkdown}}></div>
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}
