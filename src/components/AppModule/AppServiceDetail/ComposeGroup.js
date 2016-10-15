/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeGroup component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeGroup.less"

const testData = [{
	id:"1",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"2",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"3",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"4",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"5",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"6",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"7",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
},{
	id:"8",
	mountPod:"/root/etc/network",
	group:"myNetwork",
	file:"network.sh"
}];

var MyComponent = React.createClass({
  propTypes : {
    config : React.PropTypes.array
  },
  render : function() {
	var config = this.props.config;
	var items = config.map((item) => {
	  return (
	    <div className="composeDetail" key={item.id}>
	    	<div className="commonData">
	    		<span>{item.mountPod}</span>
	    	</div>
	      <div className="commonData">
	    		<span>{item.group}</span>
	    	</div>
	    	<div className="composefile commonData">
	    		<span>{item.file}</span>
	    	</div>
	      <div style={{clear:"both"}}></div>
			</div>
    );
	});
	return (
	  <Card className="composeList">
        { items }
	  </Card>
    );
  }
});

export default class ComposeGroup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
  	const parentScope = this;
    return (
      <div id="ComposeGroup">
      	<div className="titleBox">
      		<div className="commonTitle">
      			容器挂载点
      		</div>
      		<div className="commonTitle">
      			配置组
      		</div>
      		<div className="commonTitle">
      			配置文件
      		</div>
      		<div style={{clear:"both"}}></div>
      	</div>
      	<MyComponent config={testData} />
      </div>
    )
  }
}

ComposeGroup.propTypes = {
//
}
