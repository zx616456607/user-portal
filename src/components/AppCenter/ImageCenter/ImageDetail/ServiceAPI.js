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
import './style/ServiceAPI.less'

const testData = [{
	id:"1",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234"
},{
	id:"2",
	imageName:"Mysql",
	imgUrl:"/img/test/mysql.jpg",
	type:"private",
	imageUrl:"tenxcloud/Mysql",
	downloadNum:"1234"
},{
	id:"3",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"public",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234"
},{
	id:"4",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"private",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234"
},{
	id:"5",
	imageName:"Mysql",
	imgUrl:"/img/test/mysql.jpg",
	type:"public",
	imageUrl:"tenxcloud/Mysql",
	downloadNum:"1234"
},{
	id:"6",
	imageName:"Php",
	imgUrl:"/img/test/php.jpg",
	type:"public",
	imageUrl:"tenxcloud/Php",
	downloadNum:"1234"
},{
	id:"7",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"public",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234"
},{
	id:"8",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"private",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234"
},{
	id:"9",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234"
},{
	id:"10",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234"
}];

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

export default class ServiceAPI extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
    }
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
        	<MyComponent config={testData} />
        </div>
    	</Card>
    )
  }
}

ServiceAPI.propTypes = {
//
}
