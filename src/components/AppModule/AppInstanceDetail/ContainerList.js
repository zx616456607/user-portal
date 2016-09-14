/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppDetail component
 * 
 * v0.1 - 2016-09-13
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox,Button,Card, Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ContainerList.less"

const testData = [{
	id:"1",
	name:"test1",
	status:"1",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"2",
	name:"test2",
	status:"1",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"3",
	name:"test3",
	status:"0",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"4",
	name:"test4",
	status:"0",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"5",
	name:"test5",
	status:"0",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"6",
	name:"test6",
	status:"1",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"7",
	name:"test7",
	status:"1",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"8",
	name:"test8",
	status:"0",
	imageName:"Linux",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
}];

var MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  onchange : function(){
  	  	
  },
  modalShow:function(instanceId){
  	const {scope} = this.props;
  	scope.setState({
  		modalShow : true,
  		currentShowInstance : instanceId
  	});
  },
  render : function() {
	var config = this.props.config;
	var items = config.map((item) => {
	  return (
	    <div className="containerDetail" key={item.id}>
		  <div className="selectIconTitle commonData">
		    <Checkbox onChange={()=>this.onchange()}></Checkbox>
		  </div>
		  <div className="name commonData">
		    <span className="viewBtn" onClick={this.modalShow.bind(this,item)}>
	    	  {item.name}
		    </span>
		  </div>
		  <div className="status commonData">
			<i className={item.status == 1 ? "normal fa fa-circle":"error fa fa-circle"}></i>
			&nbsp;{item.status == 1 ? "运行中":"异常"}
		  </div>
		  <div className="image commonData">
			{item.imageName}
		  </div>
		  <div className="address commonData">
			内:&nbsp;{item.serviceIPInput}<br />
			外:&nbsp;{item.serviceIPOutput}
		  </div>
		  <div className="createTime commonData">
			{item.createTime}
		  </div>
	      <div style={{clear:"both"}}></div>
		</div>
      );
	});
	return (
	  <div className="containerList">
        { items }
	  </div>
    );
  }
});		

export default class ContainerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }
  
  render() {
    return (
      <div id="ContainerList">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
	      <div className="operaBox">
	        <div className="leftBox">
	          <Button type="primary" size="large">
	            <i className="fa fa-play"></i>
	            启动
	          </Button>
	          <Button size="large">
	            <i className="fa fa-stop"></i>
	            停止
	          </Button>
	          <Button size="large">
	            <i className="fa fa-trash"></i>
	            删除
	          </Button>
	        </div>
	        <div className="rightBox">
	          <span>共&nbsp;个 容器</span>
	          <span>已选中的容器(个)</span>
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	      <Card className="dataBox">
	        <div className="titleBox">
		      <div className="selectIconTitle commonData">
		        <Checkbox onChange={()=>this.onchange()}></Checkbox>
		      </div>
		      <div className="name commonData">
		        名称
		      </div>
		      <div className="status commonData">
			    运行状态
		      </div>
		      <div className="image commonData">
			    镜像
		      </div>
		      <div className="address commonData">
			    地址
		      </div>
		      <div className="createTime commonData">
			    创建时间
		      </div>
	          <div style={{clear:"both"}}></div>
	        </div>
	        <MyComponent config={testData} />
	      </Card>
        </QueueAnim>
      </div>
    )
  }
}

ContainerList.propTypes = {
//
}
