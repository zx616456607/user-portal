/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ServiceAPI component
 * 
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadImageDetailTagConfig } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/ServiceAPI.less'

let MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  render : function() {
		let config = this.props.config;
		let items = config.map((item) => {
		  return (
		    <div className="apiItemDetail" key={item.id} >
					<span className="leftSpan">{item.imageName}</span>
        	<span className="rightSpan">{item.imageUrl}</span>
        	<div style={{ clear:"both" }}></div>
				</div>
	    );
		});
		return (
		  <div className="apiItemList">
	        { items }
		  </div>
    );
  }
});		

class ServiceAPI extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
    }
  }
  
  componentWillMount(){
		const { registry, loadImageDetailTagConfig } = this.props;
		const { fullname,imageTag } = this.props;
		console.log(this.props)
		setTimeout(function(){
		loadImageDetailTagConfig(registry, fullname,imageTag);
			
		},100)
  }
  
  render() {
    return (
      <Card className="imageServiceAPI">
        <p>容器端口: 8080/tcp</p>
        <p>数据存储器: 无</p>
        <p>所需环境变量: </p>
        <div className="itemBox">
        	<div className="title">
        		<span className="leftSpan">变量名</span>
        		<span className="rightSpan">镜像</span>
        		<div style={{ clear:"both" }}></div>
        	</div>
        	
        </div>
    	</Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTagConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    configList: []
  }
  const { imageTagConfig } = state.getImageTagConfig
  const { registry, tag, isFetching, server, configList } = imageTagConfig[DEFAULT_REGISTRY] || defaultImageDetailTagConfig

  return {
    registry,
		registryServer: server,
    configList: configList,
    isFetching,
    tag
  }
}

ServiceAPI.propTypes = {
//
}

export default connect(mapStateToProps, {
	loadImageDetailTagConfig
})(ServiceAPI);