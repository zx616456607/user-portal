/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * app store component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Icon, Tabs } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/storeDetail.less'
const TabPane = Tabs.TabPane;

class DetailInfo extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    const {data} = this.props
    return (
      <div className="infoList">
        <div dangerouslySetInnerHTML={{__html: data.description}}></div>
      </div>
    )
  }
}

class DetailStack extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    const {data} = this.props
    return (
      <div className="infoList">
        <Input type="textarea" value={data.content} autosize={{ minRows: 5, maxRows: 20 }}/>
      </div>
    )
  }
}

class DetailBox extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const {data} = this.props
    return (
      <div className="appStoreDetail" key="appStoreDetail">
        <div className="topTitle">
          持续集成与部署：
          <span className="rightColse"><Icon type="cross" /></span>
        </div>
        <div className="wrapContent">
          <div className="boxDeploy">
            <img className="detailImage" src={data.imageUrl} />
            <ul className="detailType">
              <li><h3>{data.name}</h3></li>
              <li>类型：{data.category}</li>
              <li>来源：{data.owner}</li>
            </ul>
            <div className="right-btn">
              <Link to={`/app_manage/app_create/compose_file?templateid=${data.id}`} ><Button size="large" type="primary">部署</Button></Link>
            </div>
          </div>
          <div className="boxContent">
            <Tabs className="itemList" defaultActiveKey="1">
              <TabPane tab={<div style={{lineHeight:'40px'}}>基本信息</div>} key={1}><DetailInfo data={ data } /></TabPane>
              <TabPane tab={<div style={{lineHeight:'40px'}}>编排文件</div>} key={2}><DetailStack data={ data } /></TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

}

export default DetailBox