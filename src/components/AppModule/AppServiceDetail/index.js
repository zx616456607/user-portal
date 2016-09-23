/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppGraph component
 * 
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Tabs,Checkbox,Dropdown,Button,Card, Menu,Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerList from './AppContainerList'
import './style/AppServiceDetail.less'

const TabPane = Tabs.TabPane;
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重新部署
					  </Menu.Item>
					  <Menu.Item key="1">
						停止容器
					  </Menu.Item>
					  <Menu.Item key="2">
						删除
					  </Menu.Item>
					  <Menu.Item key="3">
						查看架构图
					  </Menu.Item>
					  <Menu.Item key="4">
						查看编排
					  </Menu.Item>
					</Menu>);

export default class AppServiceDetail extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
  }
  
  closeModal(){
  	const {scope} = this.props
  	scope.setState({
  	  modalShow : false
  	});
  }
  
  render() {
  	const {scope} = this.props;
  	const instanceInfo = scope.state.currentShowInstance;
    return (
      <div id="AppServiceDetail">
        <div className="titleBox">
          <i className="closeBtn fa fa-times" onClick={this.closeModal}></i>
	      <div className="imgBox">
	        <img src="/img/test/github.jpg" />
	      </div>
	      <div className="infoBox">
	        <p className="instanceName">
	          {instanceInfo.name}
	        </p>
	        <div className="leftBox">
	          <span className="status">
	            运行状态&nbsp;:&nbsp;
	            <span className={ instanceInfo.status == "1" ? "normal":"error" }>
	              { instanceInfo.status == "1" ? "运行中":"异常" }
	            </span>
	          </span><br />
	          <span>
	            地址&nbsp;:&nbsp;{instanceInfo.serviceIP}
	          </span><br />
	          <span>
	            容器实例&nbsp;:&nbsp;3/3
	          </span>
	        </div>
	        <div className="rightBox">
	          <Button className="loginBtn" type="primary">
	            <svg className="terminal">
	              <use xlinkHref="#terminal" />
	            </svg>
	            登录终端
	          </Button>
	          <Dropdown overlay={operaMenu} trigger={['click']}>
				<Button type="ghost" size="large" className="ant-dropdown-link" href="#">
		          更多 <i className="fa fa-caret-down"></i>
				</Button>
			  </Dropdown>
	        </div>
	      </div>
	      <div style={{clear:"both"}}></div>
	    </div> 
	    <div className="bottomBox">
	      <div className="siderBox">
	          <Tabs 
	            tabPosition="left"
	            defaultActiveKey="1"
	          >
	            <TabPane tab="容器实例" key="1"><ContainerList /></TabPane>
	            <TabPane tab="基础信息" key="2">基础信息</TabPane>
	            <TabPane tab="配置组" key="3">配置组</TabPane>
	            <TabPane tab="绑定域名" key="4">绑定域名</TabPane>
	            <TabPane tab="端口" key="5">端口</TabPane>
	            <TabPane tab="高可用" key="6">高可用</TabPane>
	            <TabPane tab="监控" key="7">监控</TabPane>
	            <TabPane tab="日志" key="8">日志</TabPane>
	            <TabPane tab="事件" key="9">事件</TabPane>
	          </Tabs>
	      </div>
	      <div className="contentBox">
	      </div>
	    </div>
      </div>
    )
  }
}

AppServiceDetail.propTypes = {
//
}
