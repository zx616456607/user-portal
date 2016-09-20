/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ComposeFile component
 * 
 * v0.1 - 2016-09-20
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown,Modal,Checkbox,Button,Card,Menu,Input } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"

const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重新部署
					  </Menu.Item>
					  <Menu.Item key="1">
						弹性伸缩
					  </Menu.Item>
					  <Menu.Item key="2">
						灰度升级
					  </Menu.Item>
					  <Menu.Item key="3">
						更改配置
					  </Menu.Item>
					</Menu>);

export default class ComposeFile extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
  	const parentScope = this.props.scope;
  	const createModel = parentScope.state.createModel;
  	let backUrl = backLink(createModel);
    return (
	    <QueueAnim id="ComposeFile"
	      type="right"
	    >
	      <div className="ComposeFile" key="ComposeFile">
	        <div className="nameBox">
	          <span>应用名称</span>
	          <Input size="large" placeholder="起一个萌萌哒的名称吧~" />
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="introBox">
	          <span>添加描述</span>
	          <Input size="large" placeholder="写一个萌萌哒的描述吧~" />
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="composeBox">
	          <div className="topBox">
	            <span>编排类型</span>
	            <span>tenxcloud.yaml</span>
	            <Button size="large" type="primary">
	              选择编排
	            </Button>
	            <div style={{ clear:"both" }}></div>
	          </div>
	          <div className="bottomBox">
	            <span>描述文件</span>
	            <div className="textareaBox">
	              <div className="operaBox">
	                <i className="fa fa-expand"></i>
	                <i className="fa fa-star-o"></i>
	              </div>
	              <textarea></textarea>
	            </div>
	            <div style={{ clear:"both" }}></div>
	          </div>          
	        </div>
	        <div className="envirBox">
	          <span>部署环境</span>
	          <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large" type="ghost">
	            请选择空间
	            <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	        <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large" type="ghost">
	            请选择集群
	            <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	        </div>
	        <div className="btnBox">
	          <Link to={`${backUrl}`}>
	            <Button size="large" type="primary" className="lastBtn">
	              上一步
	            </Button>
	          </Link>
	          <Link to={`/app_manage`}>
	            <Button size="large" type="primary" className="createBtn">
	              创建
	            </Button>
	          </Link>
	        </div>
	      </div>  
        </QueueAnim>
    )
  }
}

ComposeFile.propTypes = {

}

function backLink(createModel){
	switch(createModel){
		case "fast":
		  return "/app_manage/app_create/fast_create";
		  break;
		case "store":
		  return "/app_manage/app_create/app_store";
		  break;
		case "layout":
		  return "/app_manage/app_create";
		  break;
	}
}
