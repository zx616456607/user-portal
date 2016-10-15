/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ImageSpace component
 * 
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu,Button,Card,Input,Dropdown,Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/ImageSpace.less"
import ImageDetailBox from './ImageDetail/Index.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
	search: {
    id: 'AppCenter.ImageCenter.ImageSpace.search',
    defaultMessage: '搜索',
  },
	publicType: {
    id: 'AppCenter.ImageCenter.ImageSpace.publicType',
    defaultMessage: '公有',
 	},
 	privateType: {
    id: 'AppCenter.ImageCenter.ImageSpace.privateType',
    defaultMessage: '私有',
 	},
  delete: {
    id: 'AppCenter.ImageCenter.ImageSpace.delete',
    defaultMessage: '删除',
  },
  type: {
    id: 'AppCenter.ImageCenter.ImageSpace.type',
    defaultMessage: '类型：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.ImageSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.ImageSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.ImageSpace.deployService',
    defaultMessage: '部署服务',
  },
  uploadImage: {
  	id: 'AppCenter.ImageCenter.ImageSpace.uploadImage',
  	defaultMessage: '上传镜像',
  },
  uploadImageFirstTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.uploadImageFirstTips',
  	defaultMessage: '在本地 docker 环境中输入以下命令进行登录',
  },
  uploadImageSecondTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.uploadImageSecondTips',
  	defaultMessage: '然后，对本地需要 push 的 image 进行标记，比如：',
  },
  uploadImageThirdTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.uploadImageThirdTips',
  	defaultMessage: '最后在命令行输入如下命令，就可以 push 这个 image 到镜像仓库中了',
  },
  downloadImage: {
  	id: 'AppCenter.ImageCenter.ImageSpace.downloadImage',
  	defaultMessage: '下载镜像',
  },
  downloadImageFirstTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.downloadImageFirstTips',
  	defaultMessage: '在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了',
  },
  downloadImageSecondTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.downloadImageSecondTips',
  	defaultMessage: '私有镜像需要先 login 后才能拉取',
  },
  downloadImageThirdTips: {
  	id: 'AppCenter.ImageCenter.ImageSpace.downloadImageThirdTips',
  	defaultMessage: '为了在本地方便使用，下载后可以修改<tag>为短标签，比如：',
  },
})

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
    config : React.PropTypes.array,
    scope : React.PropTypes.object
  },
  deleteImage:function(id){
  	//this function for user delete select image
  	
  },
  showImageDetail:function(id){
  	//this function for user select image and show the image detail info
//		const scope = this.props.scope;
//		scope.setState({
//			imageDetailModalShow:true,
//			currentImage:id
//		});
  },
  render : function() {
		let config = this.props.config;
		let items = config.map((item) => {
			const dropdown = (
			  <Menu onClick={this.deleteImage.bind(this,item)}
					style={{width:"100px"}}
			  >
			    <Menu.Item key="1">
			    	<FormattedMessage {...menusText.delete} />
			    </Menu.Item>
			  </Menu>
			);
		  return (
		    <div className="imageDetail" key={item.id} >
					<div className="imageBox">
						<img src={item.imgUrl} />
					</div>
					<div className="contentBox">
						<span className="title" onClick={this.showImageDetail.bind(this,item)}>
							{item.imageName}
						</span><br />
						<span className="type">
							<FormattedMessage {...menusText.type} />&nbsp;
							{item.type == "public" ? [
								<span key={item.id + "unlock"}><i className="fa fa-unlock-alt"></i>&nbsp;<FormattedMessage {...menusText.publicType} /></span>]
								:
								[<span key={item.id + "lock"}><i className="fa fa-lock"></i>&nbsp;<FormattedMessage {...menusText.privateType} /></span>]
							}
						</span>
						<span className="imageUrl">
							<FormattedMessage {...menusText.imageUrl} />&nbsp;
							<span className="colorUrl">{item.imageUrl}</span>
						</span>
						<span className="downloadNum">
							<FormattedMessage {...menusText.downloadNum} />&nbsp;{item.downloadNum}
						</span>
					</div>
					<div className="btnBox">
						<Dropdown.Button overlay={dropdown} type="ghost">
				      <FormattedMessage {...menusText.deployService} />
				    </Dropdown.Button>
					</div>
				</div>
	    );
		});
		return (
		  <div className="imageList">
	        { items }
		  </div>
    );
  }
});		

class ImageSpace extends Component {
  constructor(props) {
    super(props);
    this.openUploadModal = this.openUploadModal.bind(this);
    this.closeUploadModal = this.closeUploadModal.bind(this);
    this.openDownloadModal = this.openDownloadModal.bind(this);
    this.closeDownloadModal = this.closeDownloadModal.bind(this);
    this.state = {
			uploadModalVisible:false,
			downloadModalVisible:false,
			currentImage:null,
			imageDetailModalShow:false
  	}
  }
  
  openUploadModal(){
  	//this function for user open the upload image modal
  	this.setState({
  		uploadModalVisible:true
  	});
  }
  
  closeUploadModal(){
  	//this function for user close the upload image modal
  	this.setState({
  		uploadModalVisible:false
  	});
  }
  
  openDownloadModal(){
  	//this function for user open the download image modal
  	this.setState({
  		downloadModalVisible:true
  	});
  }
  
	closeDownloadModal(){
  	//this function for user close the download image modal
  	this.setState({
  		downloadModalVisible:false
  	});
  }
	
	closeImageDetailModal(){
		//this function for user close the modal of image detail info
		this.setState({
			imageDetailModalShow:false
		});
	}
	
  render() {
  	const { formatMessage } = this.props.intl;
  	const rootscope = this.props.scope;
  	const scope = this;
    return (
      <QueueAnim className="ImageSpace"
      	type="right"
      >
				<div id="ImageSpace" key="ImageSpace">
					<Card className="ImageSpaceCard">
						<div className="operaBox">
							<Button className="uploadBtn" size="large" type="primary" onClick={this.openUploadModal}>
								<i className="fa fa-cloud-upload"></i>&nbsp;
								<FormattedMessage {...menusText.uploadImage} />
							</Button>
							<Button className="downloadBtn" size="large" type="ghost" onClick={this.openDownloadModal}>
								<i className="fa fa-cloud-download"></i>&nbsp;					
								<FormattedMessage {...menusText.downloadImage} />
							</Button>
							<Input className="searchBox" placeholder={ formatMessage(menusText.search) } type="text" />
							<i className="fa fa-search"></i>
						</div>
						<MyComponent scope={scope} config={testData} />
						<Modal title={<FormattedMessage {...menusText.uploadImage} />} className="uploadImageModal" visible={this.state.uploadModalVisible}
		          onCancel={this.closeUploadModal} onOk={this.closeUploadModal}
		        >
		          <p>1.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageFirstTips} /></p>
		          <span className="codeSpan">
		          	sudo docker login 192.168.123.456
		          </span>
		          <p>2.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageSecondTips} /></p>
		          <span className="codeSpan">
		          	sudo docker tag  tenxcloud/hello-world:latest 192.168.123.456/&lt;username&gt;/&lt;repository&gt;:&lt;tag&gt;
		          </span>
		          <p>3.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageThirdTips} /></p>
		          <span className="codeSpan">
		          	sudo docker push 192.168.123.456/&lt;username&gt;/&lt;repository&gt;:&lt;tag&gt;
		          </span>
		        </Modal>
		        <Modal title={<FormattedMessage {...menusText.downloadImage} />} className="uploadImageModal" visible={this.state.downloadModalVisible}
		          onCancel={this.closeDownloadModal} onOk={this.closeDownloadModal}
		        >
		          <p><FormattedMessage {...menusText.downloadImageFirstTips} /></p>
		          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;<FormattedMessage {...menusText.downloadImageSecondTips} /></p>
		          <span className="codeSpan">
		          	sudo docker pull 192.168.123.456/&lt;username&gt;/&lt;repository&gt;:&lt;tag&gt;
		          </span>
		          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;<FormattedMessage {...menusText.downloadImageThirdTips} /></p>
		        	<span className="codeSpan">
		          	sudo docker tag  192.168.123.456/tenxcloud/hello-world:latst tenxcloud/hello-world:latest
		          </span>
		        </Modal>
		        <Modal
				      visible={this.state.imageDetailModalShow}
							className="AppServiceDetail"
							transitionName="move-right"
							onCancel={this.closeImageDetailModal}
				     >
				      <ImageDetailBox scope={scope} config={ this.state.currentImage } />
		        </Modal>
					</Card>
				</div>
	  	</QueueAnim>
    )
  }
}

ImageSpace.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ImageSpace, {
  withRef: true,
}))