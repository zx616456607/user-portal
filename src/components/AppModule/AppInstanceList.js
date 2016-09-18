/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppInstanceList component
 * 
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Modal,Checkbox,Dropdown,Button,Card, Menu,Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from "./AppServiceDetail.js"
import "./style/AppInstanceList.less"

const data = [{
	id:"1",
	name:"test1",
	status:"1",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"2",
	name:"test2",
	status:"1",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"3",
	name:"test3",
	status:"0",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"4",
	name:"test4",
	status:"0",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"5",
	name:"test5",
	status:"0",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"6",
	name:"test6",
	status:"1",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"7",
	name:"test7",
	status:"1",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
},{
	id:"8",
	name:"test8",
	status:"0",
	imageName:"Linux",
	serviceIP:"192.168.1.1",
	createTime:"2016-09-09 11:27:27",
}];
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
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
	    <div className="instanceDetail" key={item.id}>
			<div className="selectIconTitle commonData">
			  <Checkbox onChange={()=>this.onchange()}></Checkbox>
			</div>
			<div className="name commonData">
		      <span className="viewBtn" onClick={this.modalShow.bind(this,item)}>
	    	    {item.name}
		      </span>
			</div>
			<div className="status commonData">
			  {item.status}
			</div>
			<div className="image commonData">
			  {item.imageName}
			</div>
			<div className="service commonData">
			  {item.serviceIP}
			</div>
			<div className="createTime commonData">
			  {item.createTime}
			</div>
			<div className="actionBox commonData">
			  <span className="viewBtn" onClick={this.modalShow.bind(this,item)}>
			    <i className="fa fa-eye"></i>&nbsp;
			       查看详情
			  </span>
			</div>
			<div style={{clear:"both"}}></div>
		</div>
      );
	});
	return (
	  <div className="dataBox">
        { items }
	  </div>
    );
  }
});					

export default class AppInstanceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);    
    this.state = {
      modalShow:false,
      currentShowInstance:null
    }
  }
  
  closeModal(){
    this.setState({
  	  modalShow:false  
  	});
  }
  
  render() {
  	const parentScope = this;
  	let {modalShow} = this.state;
  	let {currentShowInstance} = this.state;
    return (
      <div id="AppInstanceList">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
	      <div className="operaBox">
	        <Button size="large">
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
            <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large">
	            更多
	          <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	      </div>
	      <div className="appTitle">
      	    <div className="selectIconTitle commonTitle">
      		  <Checkbox></Checkbox>
      		</div>
            <div className="name commonTitle">
      		  服务名称
      		</div>
      		<div className="status commonTitle">
      		  运行状态
      		</div>
      		<div className="image commonTitle">
      		  镜像
      		</div>
      		<div className="service commonTitle">
      		  服务地址
      		</div>
      		<div className="createTime commonTitle">
      		  创建时间
      		</div>
      		<div className="actionBox commonTitle">
      		  操作
      		</div>
      		<div style={{ clear:"both" }}></div>
      	  </div>
      	  <MyComponent scope={parentScope} config = {data} />
      	  <Modal
	        title="垂直居中的对话框"
	        visible={this.state.modalShow}
			className="AppServiceDetail"
			transitionName="move-right"
			onCancel={this.closeModal}
	      >
	        <AppServiceDetail scope={parentScope} />
          </Modal>
        </QueueAnim>
      </div>
    )
  }
}

AppInstanceList.propTypes = {
//
}
