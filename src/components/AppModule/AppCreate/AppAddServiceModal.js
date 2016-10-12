/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppAddServiceModal component
 * 
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Input,Modal,Checkbox,Button,Card,Menu,Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppDeployServiceModal from './AppDeployServiceModal.js'
import { loadPublicImageList } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/AppAddServiceModal.less'

const MyComponent = React.createClass({	  
  propTypes: {
    config: React.PropTypes.array
  },
  modalShow:function(imageName, registryServer){
  	//close model function
  	const {scope} = this.props;
  	const rootScope = scope.props.scope;
  	scope.setState({
  		modalShow: true,
  		currentSelectedImage: imageName,
			registryServer
  	});
		rootScope.setState({
			modalShow : false,
      serviceModalShow:true
		})
    console.log('rootScope',rootScope);
  },
  render : function() {
		const { images, registryServer, loading } = this.props
		if (loading) {
			return (
				<Spin />
			)
		}
		const items = images.map((item) => {
			return (
				<div key={item.name} className="serviceDetail">
					<img className="imgUrl" src="/img/test/github.jpg"/>
					<div className="infoBox">
						<span className="name">{item.name}</span> <span className="type">{item.category || ''}</span><br />
						<span className="intro">{item.description}</span>
					</div>
					<Button type="primary" size="large" onClick={this.modalShow.bind(this, item.name, registryServer)}>
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

class AppAddServiceModal extends Component {
  constructor(props) {
    super(props);
    this.selectImageType = this.selectImageType.bind(this);    
    this.closeModal = this.closeModal.bind(this);    
    this.openModal = this.openModal.bind(this);    
    this.state = {
      modalShow:false,
      currentImageType:"public",
      currentSelectedImage:null,
      registryServer: null
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
    this.props.scope.setState({
  	  modalShow:false
  	});
  }

  openModal(){
  	//the function for open the deploy new service modal
    this.props.scope.setState({
  	  modalShow:true
  	});
  }

	componentWillMount() {
    document.title = '添加应用 | 时速云'
		const { registry, loadPublicImageList } = this.props
		loadPublicImageList(registry)
  }
  
  render() {
  	const parentScope = this
		const { publicImageList, registryServer, scope, isFetching } = this.props
    const servicesList = scope.state.servicesList
    return (
	    <div id="AppAddServiceModal" key="AppAddServiceModal">
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
	      <MyComponent scope={parentScope} images={publicImageList} loading={isFetching} registryServer={registryServer} />
	      <Modal
	        visible={this.props.scope.state.serviceModalShow}
					className="AppServiceDetail"
					transitionName="move-right"
	      >
	        <AppDeployServiceModal scope={parentScope} servicesList={servicesList} />
          </Modal>
	    </div>  
    )
  }
}

AppAddServiceModal.propTypes = {
  selectedList : React.PropTypes.array,
  loadPublicImageList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultPublicImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    imageList: []
  }
  const {
    publicImages
  } = state.images
  const { registry, imageList, isFetching, server } = publicImages[DEFAULT_REGISTRY] || defaultPublicImages

  return {
    registry,
		registryServer: server,
    publicImageList: imageList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadPublicImageList
})(AppAddServiceModal)