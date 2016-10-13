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
import './style/AppContainerList.less'

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
	serviceIPInput:"192.168.1.1/tenxcloud_2.0/instanceList",
	serviceIPOutput:"www.tenxcloud.com/tenxcloud_2.0",
	createTime:"2016-09-09 11:27:27",
}];

var MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  checkedFunc : function(e){
  	//check this item selected or not
  	const {scope} = this.props;
  	let oldList = scope.state.selectedList;
  	if(oldList.includes(e)){
  		return true;
  	}else{
  		return false;
  	}
  },
  onchange : function(e){
  	//single item selected function
  	const {scope} = this.props;
  	let oldList = scope.state.selectedList;
  	if(oldList.includes(e)){
  	  let index = oldList.indexOf(e);
  	  oldList.splice(index,1);
  	}else{	
	  oldList.push(e);
  	}
    scope.setState({
      selectedList:oldList
    });
  },
  modalShow:function(instanceId){
  	//close model function
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
		  {/*(<div className="selectIconTitle commonData">
		    <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
		  </div>)*/}
		  <div className="name commonData" style={ { marginLeft: 24 } } >
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
			<span>内&nbsp;:&nbsp;{item.serviceIPInput}</span>
			<span>外&nbsp;:&nbsp;{item.serviceIPOutput}</span>
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

export default class AppContainerList extends Component {
  constructor(props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList:[]
    }
  }
  
  allSelectedChecked(){
  	if(this.state.selectedList.length == testData.length){
  		return true;
  	}else{
  		return false;
  	}
  }
  
  onchange(){
  	//select title checkbox 
    let newList = new Array();
  	if(this.state.selectedList.length == testData.length){
  	  //had select all item,turn the selectedlist to null
      newList = [];  		
  	}else{
  	  //select some item or nothing,turn the selectedlist to selecet all item
  	  for(let elem of testData){
  	    newList.push(elem.id);
  	  }
  	}
  	this.setState({
  	  selectedList : newList
  	});
  }
  
  render() {
  	const parentScope = this;
    return (
      <div id="AppContainerList">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
	      {/*(<div className="operaBox">
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
	          <span>共&nbsp;{testData.length} 容器</span>
	          <span>已选中的容器({this.state.selectedList.length}个)</span>
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>)*/}
	      <Card className="dataBox">
	        <div className="titleBox">
		      {/*(<div className="selectIconTitle commonData">
		        <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
		      </div>)*/}
		      <div className="name commonData" style={ { marginLeft: 24 } } >
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
	        <MyComponent scope={parentScope} config={testData} />
	      </Card>
        </QueueAnim>
      </div>
    )
  }
}

AppContainerList.propTypes = {
  selectedList : React.PropTypes.array
}
