/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ServiceList component
 * 
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal,Checkbox,Button,Card, Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ServiceList.less"

const testData = [{
	id:"1",
	name:"test1",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"2",
	name:"test2",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"3",
	name:"test3",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"4",
	name:"test4",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"5",
	name:"test5",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"6",
	name:"test6",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"7",
	name:"test7",
	imageName:"Linux",
	resource:"1G/2G",
},{
	id:"8",
	name:"test8",
	imageName:"Linux",
	resource:"1G/2G",
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
	    <div key={item.id} className={this.checkedFunc(item.id) ? "selectedService serviceDetail":"serviceDetail"}>
		  <div className="selectIconTitle commonData">
		    <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
		  </div>
		  <div className="name commonData">
		    <span className="viewSpan" onClick={this.modalShow.bind(this,item)}>
	    	  {item.name}
		    </span>
		  </div>
		  <div className="image commonData">
			{item.imageName}
		  </div>
		  <div className="resource commonData">
			{item.resource}
		  </div>
		  <div className="opera commonData">
			<Button className="viewBtn" type="ghost" size="large">
			  <i className="fa fa-eye"></i>&nbsp;
			   查看
			</Button>
			<Button type="ghost" size="large">
			  <i className="fa fa-trash"></i>&nbsp;
	           删除
			</Button>
		  </div>
	      <div style={{clear:"both"}}></div>
		</div>
      );
	});
	return (
	  <div className="serviceList">
        { items }
	  </div>
    );
  }
});		

export default class ServiceList extends Component {
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
  	const parentScope = this
    return (
	    <QueueAnim id="ServiceList"
	      type="right"
	    >
	    <div className="ServiceList" key="ServiceList">
	      <div className="operaBox">
	        <Button type="primary" size="large">
	          <i className="fa fa-plus"></i>&nbsp;
	             添加服务
	        </Button>
	        <Button size="large" type="ghost">
	          <i className="fa fa-trash"></i>&nbsp;
	            删除
	        </Button>
	      </div>
	      <div className="dataBox">
	        <div className="titleBox">
		      <div className="selectIconTitle commonData">
		        <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
		      </div>
		      <div className="name commonData">
		        服务名称
		      </div>
		      <div className="image commonData">
			    镜像
		      </div>
		      <div className="resource commonData">
			    计算资源
		      </div>
		      <div className="opera commonData">
			    操作
		      </div>
	          <div style={{clear:"both"}}></div>
	        </div>
	        <MyComponent scope={parentScope} config={testData} />
	      </div>
	      <div className="btnBox">
	        <Link to={`/app_manage/app_create`}>
	          <Button type="primary" size="large">
	            上一步
	          </Button>
	        </Link>
	        <Link to={`/app_manage/app_create/compose_file`}>
	          <Button type="primary" size="large">
	            下一步
	          </Button>
	        </Link>
	      </div>
	      <Modal title="Modal"
          okText="OK" cancelText="Cancel"
          >
          </Modal>
	    </div>  
        </QueueAnim>
    )
  }
}

ServiceList.propTypes = {
  selectedList : React.PropTypes.array
}
