/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppCreateServiceModal component
 * 
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Input,Modal,Checkbox,Button,Card,Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppCreateServiceModal.less"

const testData = [{
	id:"1",
	name:"test1",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"2",
	name:"test2",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"3",
	name:"test3",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"4",
	name:"test4",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"5",
	name:"test5",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"6",
	name:"test6",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"7",
	name:"test7",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
},{
	id:"8",
	name:"test8",
	type:"Linux",
	imgUrl:"/img/test/github.jpg",
	intro:"为毛我属于linux分类呢？为毛呢？喂，编程的那个你该吃药了！"
}];

var MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  modalShow:function(imageId){
  	//close model function
  	const {scope} = this.props;
  	const rootScope = scope.props.scope;
  	scope.setState({
  		modalShow : true,
  		currentSelectedImage : imageId
  	});
	rootScope.setState({
		modalShow : false
	})
  	console.log(rootScope)
  },
  render : function() {
	var config = this.props.config;
	var items = config.map((item) => {
	  return (
	    <div key={item.id} className="serviceDetail">
		  <img className="imgUrl" src={item.imgUrl} />
		  <div className="infoBox">
		    <span className="name">{item.name}</span>/<span className="type">{item.type}</span><br />
		    <span className="intro">{item.intro}</span>
		  </div>
		  <Button type="primary" size="large" onClick={this.modalShow.bind(this,item.id)}>
		    部署
		    <i className="fa fa-arrow-circle-o-right"></i>
		  </Button>
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

export default class AppCreateServiceModal extends Component {
  constructor(props) {
    super(props);
    this.selectImageType = this.selectImageType.bind(this);    
    this.closeModal = this.closeModal.bind(this);    
    this.openModal = this.openModal.bind(this);    
    this.state = {
      modalShow:false,
      currentImageType:"public",
      currentSelectedImage:null
    }
  }
  
  selectImageType(currentType){
  	//the function for user select image type
  	this.setState({
  	  currentImageType:currentType	
  	});
  }
  
  closeModal(){
  	//the function for close the deploy new service modal
    this.setState({
  	  modalShow:false  
  	});
  }
  
  openModal(){
  	//the function for open the deploy new service modal
    this.setState({
  	  modalShow:true  
  	});
  }
  
  render() {
  	const parentScope = this
    return (
	    <div id="AppCreateServiceModal" key="AppCreateServiceModal">
	      <div className="operaBox">
	        <span className="titleSpan">选择镜像</span>
	        <Button type={this.state.currentImageType == "public" ? "primary":"ghost"} size="large" onClick={this.selectImageType.bind(this,"public")}>
	           公有
	        </Button>
	        <Button size="large" type={this.state.currentImageType == "private" ? "primary":"ghost"} onClick={this.selectImageType.bind(this,"private")}>
	            私有
	        </Button>
	        <Button size="large" type={this.state.currentImageType == "collect" ? "primary":"ghost"} onClick={this.selectImageType.bind(this,"collect")}>
	            收藏
	        </Button>
	        <div className="inputBox">
	          <Input size="large" placeholder="搜索你的本命服务名吧~" />
	          <i className="fa fa-search"></i>
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	      <MyComponent scope={parentScope} config={testData} />
	      <Modal
	        title="垂直居中的对话框"
	        visible={this.state.modalShow}
			className="AppServiceDetail"
			transitionName="move-right"
			onCancel={this.closeModal}
	      >
	        
          </Modal>
	    </div>  
    )
  }
}

AppCreateServiceModal.propTypes = {
  selectedList : React.PropTypes.array
}
