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
    this.state = {

    }
  }

  render() {
    return (
      <Card className="imageDetailInfo">
        <h1>docker hub 官方 wordpress</h1>
        <h3>时速云上部署(通过环境变量与mysql通信)</h3>
        <p>1.创建mysql容器(需要在"高级设置"中添加环境变量)</p>
        <div className="codeBox">
          <span># 环境变量</span><br />
          <span className="leftSpan">变量名</span><span className="rightSpan">变量值</span><br />
          <span className="leftSpan">MYSQL_ROOT_PASSWORD</span><span className="rightSpan">root_password&lt;自行修改&gt;</span><br />
          <span className="leftSpan">MYSQL_DATABASE</span><span className="rightSpan">wordpress&lt;自行修改&gt;</span><br />
          <span className="leftSpan">MYSQL_USER</span><span className="rightSpan">wordpress&lt;自行修改&gt;</span><br />
          <span className="leftSpan">MYSQL_PASSWORD</span><span className="rightSpan">wordpress&lt;自行修改&gt;</span><br />
          <div style={{ clear: "both" }}></div>
        </div>
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}
