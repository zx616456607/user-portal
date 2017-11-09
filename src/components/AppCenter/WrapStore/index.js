/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Store
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Icon, Dropdown, Menu, Card, Popover } from 'antd'
import classNames from 'classnames'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'

class AppWrapStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  renderClassifyTab() {
    return ['全部', '系统', 'AI训练', '机器学习', '营销应用', '其他'].map(item => {
      return <span className={classNames('filterTab')} key={item}>{item}</span>
    })
  }
  renderSortTab() {
    return ['按照下载次数', '按照发布时间', '按照名称'].map(item => {
      return <span className={classNames('filterTab')} key={item}>{item}</span>
    })
  }
  renderWrapList(isHot) {
    const menu = (
      <Menu>
        <Menu.Item key="download">下载</Menu.Item>
        <Menu.Item key="offShelf">下架</Menu.Item>
      </Menu>
    );
    const deployMethod = (
      <Menu
        className="deployModeList"
        onClick={({ key }) => {
          if (key === 'container') {
            // return func.goDeploy(row.fileName)
          }
          // browserHistory.push(`/app_manage/vm_wrap/create?fileName=${row.fileName}`)
        }}
      >
        <Menu.Item key="container">容器应用</Menu.Item>
        <Menu.Item key="vm">传统应用</Menu.Item>
      </Menu>
    )
    return [1,2,3,4,5].map((item, index) => {
      return (
        <Row className={classNames("wrapList", {"noBorder": isHot, 'hotWrapList': isHot, 'commonWrapList': !isHot})} type="flex" justify="space-around" align="middle">
          {
            isHot && <Col span={3}>{index !== 0 ? <span className={`hotOrder hotOrder${index + 1}`}>{index + 1}</span> : <i className="champion"/>}</Col>
          }
          <Col span={isHot ? 5 : 4}>
            <img className={classNames({"wrapIcon": !isHot, "hotWrapIcon": isHot})} src={require('../../../assets/img/docker.png')}/>
          </Col>
          <Col span={isHot ? 8 : 15}>
            <Row className="wrapListMiddle">
              <Col className="appName">展示应用名称</Col>
              {
                !isHot && <Col className="hintColor appDesc">展示应用描述，发布应用时提示的内容。展示应用描述</Col>
              }
              <Col className="downloadBox">
                <span className="hintColor"><Icon type="download" /> 99999</span>
                {
                  !isHot && <span className="hintColor"><Icon type="clock-circle-o" /> 发布于 1 年前</span>
                }
              </Col>
            </Row>
          </Col>
          <Col span={isHot ? 8 : 5} style={{ textAlign: 'right' }}>
            <Dropdown.Button overlay={menu} type="ghost">
              <Popover
                content={deployMethod}
                title="请选择部署方式"
                trigger="click"
                getTooltipContainer={() => document.getElementsByClassName(isHot ? 'hotWrapList' : 'commonWrapList')[0]}
              >
                <span><Icon type="appstore-o" /> 部署</span>
              </Popover>
            </Dropdown.Button>
          </Col>
        </Row>
      )
    })
  }
  render() {
    return (
      <QueueAnim>
        <div key="appWrapStore" className="appWrapStore">
          <div className="wrapStoreHead">
            <div className="storeHeadText">应用包商店</div>
            <CommonSearchInput 
              placeholder="请输入应用包名称搜索"
              size="large"
              style={{ width: 280 }}
            />
          </div>
          <div className="filterAndSortBox">
            <div className="filterClassify">
              <span>分类：</span>
              {this.renderClassifyTab()}
            </div>
            <div className="sortBox">
              <span>排序：</span>
              {this.renderSortTab()}
            </div>
          </div>
          <div className="wrapStoreBody">
            <div className="wrapListBox wrapStoreLeft">
              {this.renderWrapList(false)}
            </div>
            <div className="wrapListBox wrapStoreRight">
              <Card title="排行榜" bordered={false} className="hotWrapCard">
                {this.renderWrapList(true)}
              </Card>
            </div>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  return {
    
  }
}
export default connect(mapStateToProps, {
  
})(AppWrapStore)