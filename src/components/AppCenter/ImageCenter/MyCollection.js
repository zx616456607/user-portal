/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * MyCollection component
 * 
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert,Menu,Button,Card,Input,Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/MyCollection.less"
import ImageDetailBox from './ImageDetail/Index.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.MyCollection.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.MyCollection.belong',
    defaultMessage: '所属空间：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.MyCollection.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.MyCollection.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.MyCollection.deployService',
    defaultMessage: '部署服务',
  },
  tooltips: {
  	id: 'AppCenter.ImageCenter.MyCollection.tooltips',
    defaultMessage: '我的收藏 —— 您可以将任意可见的镜像空间内的镜像，一键收藏到我的收藏，便捷的管理常用容器镜像。',
  }
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
	type:"private",
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
	type:"private",
	imageUrl:"tenxcloud/Mysql",
	downloadNum:"1234"
},{
	id:"6",
	imageName:"Php",
	imgUrl:"/img/test/php.jpg",
	type:"private",
	imageUrl:"tenxcloud/Php",
	downloadNum:"1234"
},{
	id:"7",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"private",
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
							<FormattedMessage {...menusText.belong} />&nbsp;
							{item.type}
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
						<Button type="ghost">
				      <FormattedMessage {...menusText.deployService} />
				    </Button>
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

class MyCollection extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
			currentImage:null,
			imageDetailModalShow:false
  	}
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
      <QueueAnim className="MyCollection"
      	type="right"
      >
				<div id="MyCollection" key="MyCollection">
					<Alert message={<FormattedMessage {...menusText.tooltips} />} type="info" />
					<Card className="MyCollectionCard">
						<div className="operaBox">
							<Input className="searchBox" placeholder={ formatMessage(menusText.search) } type="text" />
							<i className="fa fa-search"></i>
							<div style={{ clear:"both" }}></div>
						</div>
						<MyComponent scope={scope} config={testData} />
					</Card>
				</div>
				<Modal
		        visible={this.state.imageDetailModalShow}
						className="AppServiceDetail"
						transitionName="move-right"
						onCancel={this.closeImageDetailModal}
		      >
		      <ImageDetailBox scope={scope} config={ this.state.currentImage } />
        </Modal>
	  	</QueueAnim>
    )
  }
}

MyCollection.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(MyCollection, {
  withRef: true,
}))