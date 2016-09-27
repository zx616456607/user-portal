/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * BindDomain component
 * 
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Alert,Card,Input,Button,Select } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/BindDomain.less"			
const InputGroup = Input.Group;

export default class BindDomain extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
  	const parentScope = this;
    return (
     <div id="bindDomain">
     	<Alert message='Tips:添加域名绑定后，需要在域名服务器上，将指定域名的CNAME指向下面表格中系统生成的"CNAME地址"' type="info" />
	   	<div className="titleBox">
	   		<div className="commonTitle">
	   			<span>服务端口</span>
	   		</div>
	   		<div className="commonTitle">
	   			<span>域名</span>
	   		</div>
	   		<div className="commonTitle">
	   			<span>CNAME地址</span>
	   		</div>
	   		<div style={{ clear:"both" }}></div>
	   	</div>
	   	<Card className="infoBox">
	   		<div className="protocol">
		   		<Select size="large" defaultValue="lucy" style={{ width: 150 }}>
			      <Option value="jack">Jack</Option>
			      <Option value="lucy">Lucy</Option>
			      <Option value="disabled" disabled>Disabled</Option>
			      <Option value="yiminghe">yiminghe</Option>
			    </Select>
		    </div>
		    <div className="domain">
		    	<InputGroup className="newDomain">
	          <Input size="large" />
	          <div className="ant-input-group-wrap">
	            <Button className="addBtn" size="large">
	            	<i className="fa fa-plus"></i>
	            </Button>
	          </div>
	        </InputGroup>
		    </div>
		    <div className="tooltip">
		    	<span>提示：添加域名后，CNAME地址会出现在这里</span>
		    </div>
		    <div style={{ clear:"both" }}></div>
	   	</Card>
     </div>
    )
  }
}

BindDomain.propTypes = {
//
}
