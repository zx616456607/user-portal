/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ImageDetailBox component
 * 
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Switch,Tabs,Button,Card,Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageVersion from './ImageVersion.js'
import ServiceAPI from './ServiceAPI.js'
import DetailInfo from './DetailInfo.js'
import './style/ImageDetailBox.less'

const TabPane = Tabs.TabPane;

const menusText = defineMessages({
  type: {
    id: 'AppCenter.ImageCenter.ImageDetail.type',
    defaultMessage: '类型：',
  },
  pubilicType: {
    id: 'AppCenter.ImageCenter.ImageDetail.pubilicType',
    defaultMessage: '公开',
  },
  privateType: {
    id: 'AppCenter.ImageCenter.ImageDetail.privateType',
    defaultMessage: '私有',
  },
  colletctImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.colletctImage',
    defaultMessage: '收藏镜像',
  },
  deployImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.deployService',
    defaultMessage: '部署镜像',
  },
  downloadImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.downloadImage',
    defaultMessage: '下载镜像',
  },
  info: {
    id: 'AppCenter.ImageCenter.ImageDetail.info',
    defaultMessage: '基本信息',
  },
  serviceAPI: {
    id: 'AppCenter.ImageCenter.ImageDetail.serviceAPI',
    defaultMessage: '服务接口',
  },
  tag: {
    id: 'AppCenter.ImageCenter.ImageDetail.tag',
    defaultMessage: '版本',
  },
  attribute: {
    id: 'AppCenter.ImageCenter.ImageDetail.attribute',
    defaultMessage: '属性',
  },
})

class ImageDetailBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	imageDetail:null,
    	tags:null
    }
  }
  
  componentWillMount(){
  	const imageDetail = this.props.config;
  	this.setState({
  		imageDetail:imageDetail
  	});
  }
  
  componentWillReceiveProps(nextPorps){
  	//this function for user select different image
  	//the nextProps is mean new props, and the this.props didn't change
  	//so that we should use the nextProps
		this.setState({
			imageDetail:nextPorps.config
		});
	}
  
  render() {
  	const { formatMessage } = this.props.intl;
  	const imageDetail = this.props.config;
  	const config = this.state.imageDetail;
  	const scope = this;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
        	<div className="imgBox">
        		<img src="/img/test/github.jpg" />
        	</div>
        	<div className="infoBox">
        		<p className="imageName">{imageDetail.name}</p>
        		<div className="leftBox">
        			<p className="imageUrl">{imageDetail.description}</p>
        			<span className="type"><FormattedMessage {...menusText.type} /></span>
        			<Switch checked={imageDetail.isPrivate == 0 ? true:false } checkedChildren={ formatMessage(menusText.pubilicType) } unCheckedChildren={ formatMessage(menusText.privateType) } />
        		</div>
        		<div className="rightBox">
        			<Button size="large" type="primary">
        				<FormattedMessage {...menusText.deployImage} />
        			</Button>
        			<Button size="large" type="ghost">
        				<i className="fa fa-star-o"></i>&nbsp;
        				<FormattedMessage {...menusText.colletctImage} />
        			</Button>
        		</div>
        		<i className="closeBtn fa fa-times" onClick={this.closeModal}></i>
        	</div>
        	<div style={{ clear:"both" }}></div>
        </div>
       	<div className="downloadBox">
       		<div className="code">
       			<i className="fa fa-download"></i>&nbsp;
       			<FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
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
        	<Tabs className="itemList" defaultActiveKey="1">
				    <TabPane tab={ formatMessage(menusText.info) } key="1"><DetailInfo config={imageDetail} /></TabPane>
				    <TabPane tab={ formatMessage(menusText.serviceAPI) } key="2"><ServiceAPI config={imageDetail} /></TabPane>
				    <TabPane tab="DockerFile" key="3">Conten of Tab Pane 3</TabPane>
				    <TabPane tab={ formatMessage(menusText.tag) } key="4"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
				    <TabPane tab={ formatMessage(menusText.attribute) } key="5">Conten of Tab Pane 3</TabPane>
				  </Tabs>
        </div>
    	</div>
    )
  }
}

ImageDetailBox.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ImageDetailBox, {
  withRef: true,
}));