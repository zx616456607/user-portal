/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ContainerList component
 * 
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tooltip,Checkbox,Card,Menu,Dropdown,Button } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerList.less'

const ButtonGroup = Button.Group;
const data = [{
	id:"1",
	appName:"test1",
	appStatus:"1",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"2",
	appName:"test2",
	appStatus:"1",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"3",
	appName:"test3",
	appStatus:"0",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"4",
	appName:"test4",
	appStatus:"0",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"5",
	appName:"test5",
	appStatus:"0",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"6",
	appName:"test6",
	appStatus:"1",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"7",
	appName:"test7",
	appStatus:"1",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
},{
	id:"8",
	appName:"test8",
	appStatus:"0",
	serviceNum:"12",
	containerNum:"12",
	serviceIPInput:"192.168.1.1",
	serviceIPOutput:"www.tenxcloud.com",
	createTime:"2016-09-09 11:27:27",
}];
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重启容器
					  </Menu.Item>
					  <Menu.Item key="1">
						停止容器
					  </Menu.Item>
					  <Menu.Item key="2">
						删除容器
					  </Menu.Item>
					</Menu>);


var MyComponent = React.createClass({	  
  propTypes: {
   config: React.PropTypes.array
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
  render : function() {
	var config = this.props.config;
	var items = config.map((item) => {
	  return (
	    <div className={this.checkedFunc(item.id) ? "selectedContainer containerDetail":"containerDetail"} key={item.id}>
			<div className="selectIconTitle commonData">
			  <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
			</div>
			<div className="containerName commonData">
		      <Link to={`/app_manage/detail/${item.id}`} >
	    	    {item.appName}
		      </Link>
			</div>
			<div className="containerStatus commonData">
			  <i className={item.appStatus == 1 ? "normal fa fa-circle":"error fa fa-circle"}></i>
			  <span className={item.appStatus == 1 ? "normal":"error"} >{item.appStatus == 1 ? "正常":"异常"}</span>
			</div>
			<div className="serviceName commonData">
			  {item.serviceNum}
			</div>
			<div className="imageName commonData">
			  <Tooltip placement="top" title={item.containerNum}>
			    <span>{item.containerNum}</span>
			  </Tooltip>
			</div>
			<div className="visitIp commonData">
			  <Tooltip placement="top" title={item.serviceIPInput}>
			    <span>{item.serviceIPInput}</span>
			  </Tooltip>
			  <br />
			  <Tooltip placement="top" title={item.serviceIPOutput}>
			    <span>{item.serviceIPOutput}</span>
			  </Tooltip>
			</div>
			<div className="createTime commonData">
			  {item.createTime}
			</div>
			<div className="actionBox commonData">
			  <ButtonGroup>
			    <Button type="ghost" className="viewBtn">
			      <svg className="terminal">
	                <use xlinkHref="#terminal" />
	              </svg>
		          终端
			    </Button>
			    <Dropdown overlay={operaMenu} trigger={['click']}>
				  <Button type="ghost" className="moreBtn ant-dropdown-link">
		            <i className="fa fa-caret-down"></i>
				  </Button>
			    </Dropdown>
			  </ButtonGroup>
			</div>
			<div style={{clear:"both",width:"0"}}></div>
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


export default class ContainerList extends Component {
  constructor(props) {
	super(props);
	this.onchange = this.onchange.bind(this);
	this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList:[]
    }
  }
  
  allSelectedChecked(){
  	if(this.state.selectedList.length == data.length){
  		return true;
  	}else{
  		return false;
  	}
  }
  
  onchange(){
  	//select title checkbox 
    let newList = new Array();
  	if(this.state.selectedList.length == data.length){
  	  //had select all item,turn the selectedlist to null
      newList = [];  		
  	}else{
  	  //select some item or nothing,turn the selectedlist to selecet all item
  	  for(let elem of data){
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
        <QueueAnim 
          className = "ContainerList"        
          type = "right"
        >
          <div id="ContainerList" key = "ContainerList">
      	    <div className="operationBox">
	          <div className="leftBox">
	      	    <Button type="primary" size="large"><i className="fa fa-power-off"></i>重启容器</Button>
	      	    <Button type="ghost" size="large"><i className="fa fa-stop"></i>停止容器</Button>
	      	    <Button type="ghost" size="large"><i className="fa fa-trash-o"></i>删除容器</Button>
	          </div>
	        <div className="rightBox">
	      	  <div className="littleLeft">
	      	    <i className="fa fa-search"></i>
	      	  </div>
	      	  <div className="littleRight">
	      	    <input placeholder="输入容器名搜索" />
	      	  </div>
	        </div>
	        <div className="clearDiv"></div>
      	  </div>
      	  <Card className="containerBox">
      	    <div className="containerTitle">
      		  <div className="selectIconTitle commonTitle">
      		    <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
      		  </div>
      		  <div className="containerName commonTitle">
      		    容器名称
      		  </div>
      		  <div className="containerStatus commonTitle">
      		    状态
      		  </div>
      		  <div className="serviceName commonTitle">
      		    所属应用
      		  </div>
      		  <div className="imageName commonTitle">
      		    镜像
      		  </div>
      		  <div className="visitIp commonTitle">
      		    访问地址
      		  </div>
      		  <div className="createTime commonTitle">
      		    创建时间
      		    <i className="fa fa-sort"></i>
      		  </div>
      		  <div className="actionBox commonTitle">
      		    操作
      		  </div>
      	    </div>
      	    <MyComponent config = {data} scope={parentScope}/>
      	  </Card>
        </div>
      </QueueAnim>
    )
  }
}