/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ImageDetailBox component
 * 
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Switch,Tabs,Button,Card,Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import ImageVersion from './ImageVersion.js'
import ServiceAPI from './ServiceAPI.js'
import DetailInfo from './DetailInfo.js'
import './style/ImageDetailBox.less'

const TabPane = Tabs.TabPane;

export default class ImageDetailBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
    }
  }
  
  render() {
  	const scope = this.props.scope;
  	const imageDetail = scope.state.imageDetailModalShowId;
  	console.log(imageDetail)
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
        	<div className="imgBox">
        		<img src={imageDetail.imgUrl} />
        	</div>
        	<div className="infoBox">
        		<p className="imageName">{imageDetail.imageName}</p>
        		<div className="leftBox">
        			<p className="imageUrl">{imageDetail.imageUrl}</p>
        			<span className="type">类型：</span>
        			<Switch checked={imageDetail.type == "public" ? true:false } checkedChildren={"公开"} unCheckedChildren={"私有"} />
        		</div>
        		<div className="rightBox">
        			<Button size="large" type="primary">
        				部署镜像
        			</Button>
        			<Button size="large" type="ghost">
        				<i className="fa fa-star-o"></i>&nbsp;
        				收藏镜像
        			</Button>
        		</div>
        		<i className="closeBtn fa fa-times" onClick={this.closeModal}></i>
        	</div>
        	<div style={{ clear:"both" }}></div>
        </div>
       	<div className="downloadBox">
       		<div className="code">
       			<i className="fa fa-download"></i>&nbsp;
       			下载镜像：&nbsp;&nbsp;&nbsp;&nbsp;
       			<span className="pullCode">docker pull 192.168.123.456/{imageDetail.imageUrl}</span>&nbsp;&nbsp;
       			<i className="fa fa-copy"></i>
       		</div>
       		<div className="times">
       			<i className="fa fa-cloud-download"></i>&nbsp;&nbsp;
       			{imageDetail.downloadNum}
       		</div>
       		<div style={{ clear:"both" }}></div>
       	</div>
        <div className="infoBox">
        	<Tabs className="itemList" defaultActiveKey="1" >
				    <TabPane tab="基本信息" key="1"><DetailInfo /></TabPane>
				    <TabPane tab="服务接口" key="2"><ServiceAPI /></TabPane>
				    <TabPane tab="DockerFile" key="3">Conten of Tab Pane 3</TabPane>
				    <TabPane tab="版本" key="4"><ImageVersion /></TabPane>
				    <TabPane tab="属性" key="5">Conten of Tab Pane 3</TabPane>
				  </Tabs>
        </div>
    	</div>
    )
  }
}

ImageDetailBox.propTypes = {
//
}
