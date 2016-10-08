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
import AppCreateServiceModal from './AppCreateServiceModal.js'
import "./style/ServiceList.less"

class MyComponent extends Component {
  constructor (props) {
    super(props)
  }
  checkedFunc (e) {
  	//check this item selected or not
  	const {scope} = this.props;
  	let oldList = scope.state.selectedList;
  	if(oldList.includes(e)){
  		return true;
  	}else{
  		return false;
  	}
  }
  onchange (e) {
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
  }
  modalShow (instanceId) {
  	//close model function
  	const {scope} = this.props;
  	scope.setState({
  		modalShow : true,
  		currentShowInstance : instanceId
  	});
  }
  
  render () {
	var config = this.props.scope.state.servicesList;
    console.log('serviceList=======');
    console.log(config);
    console.log('serviceList=======');
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
}

export default class ServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);    
    this.openModal = this.openModal.bind(this);    
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.subServicesList = this.subServicesList.bind(this);
    this.delServicesList = this.delServicesList.bind(this);
    this.state = {
      modalShow:false,
      selectedList:[],
      servicesList:[]
    }
  }
  
  closeModal(){
  	//the function for close the create service modal
    this.setState({
  	  modalShow:false  
  	});
  }
  
  openModal(){
  	//the function for open the create service modal
    this.setState({
  	  modalShow:true
  	});
  }
  
  allSelectedChecked(){
  	if(this.state.selectedList.length == this.state.servicesList.length){
  		return true;
  	}else{
  		return false;
  	}
  }
  
  onchange(){
  	//select title checkbox 
    let newList = new Array();
  	if(this.state.selectedList.length == this.state.servicesList.length){
  	  //had select all item,turn the selectedlist to null
      newList = [];  		
  	}else{
  	  //select some item or nothing,turn the selectedlist to selecet all item
  	  for(let elem of this.state.servicesList){
  	    newList.push(elem.id);
  	  }
  	}
  	this.setState({
  	  selectedList : newList
  	});
  }
  subServicesList(){
    console.log('aaa');
    console.log(this.state.servicesList);
    localStorage.setItem('servicesList',JSON.stringify(this.state.servicesList))
  }
  delServicesList(){
    localStorage.removeItem('servicesList');
  }
  componentWillMount() {
    //this.setState({servicesList:[]})
    const serviceList = JSON.parse(localStorage.getItem('servicesList'))
    if(serviceList){
      this.setState({
        servicesList : serviceList
      })
    }
  }
  
  render() {
  	const parentScope = this
    const { servicesList,isFetching} = this.props
    return (
	    <QueueAnim id="ServiceList"
	      type="right"
	    >
	    <div className="ServiceList" key="ServiceList">
	      <div className="operaBox">
	        <Button type="primary" size="large" onClick={this.openModal}>
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
	        <MyComponent scope={parentScope} loading= {isFetching} config={this.state.servicesList}/>
	      </div>
	      <div className="btnBox">
	        <Link to={`/app_manage/app_create`}>
	          <Button type="primary" size="large" onClick={this.delServicesList}>
	            上一步
	          </Button>
	        </Link>
	        <Link to={`/app_manage/app_create/compose_file`}>
	          <Button type="primary" size="large" onClick={this.subServicesList}>
	            下一步
	          </Button>
	        </Link>
	      </div>
	      <Modal title="添加服务"
	        visible={this.state.modalShow}
          className="AppCreateServiceModal"
          onCancel={this.closeModal}
          >
		    <AppCreateServiceModal scope={parentScope} servicesList = {this.state.servicesList} />
          </Modal>
	    </div>  
        </QueueAnim>
    )
  }
}

ServiceList.propTypes = {
  cluster: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  servicesList: PropTypes.array.isRequired,
}

