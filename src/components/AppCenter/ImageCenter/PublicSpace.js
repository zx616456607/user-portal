/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * PublicSpace component
 * 
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert,Menu,Button,Card,Input } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/PublicSpace.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.PublicSpace.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.PublicSpace.belong',
    defaultMessage: '所属空间：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.PublicSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.PublicSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.PublicSpace.deployService',
    defaultMessage: '部署服务',
  },
  tooltips: {
  	id: 'AppCenter.ImageCenter.PublicSpace.tooltips',
    defaultMessage: '公共镜像 —— 企业成员可以将在镜像空间内设置的私有镜像，一键开放为企业所有人可见的公共镜像，可以实现跨团队，共享容器镜像服务，实现企业内部高效开发协作的容器镜像PaaS平台。',
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
		const scope = this.props.scope;
		scope.setState({
			imageDetailModalShow:true,
			imageDetailModalShowId:id
		});
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

class PublicSpace extends Component {
  constructor(props) {
    super(props);
    this.state = {

  	}
  }
	
  render() {
  	const { formatMessage } = this.props.intl;
  	const scope = this.props.scope;
    return (
      <QueueAnim className="PublicSpace"
      	type="right"
      >
				<div id="PublicSpace" key="PublicSpace">
					<Alert message={<FormattedMessage {...menusText.tooltips} />} type="info" />
					<Card className="PublicSpaceCard">
						<div className="operaBox">
							<Input className="searchBox" placeholder={ formatMessage(menusText.search) } type="text" />
							<i className="fa fa-search"></i>
							<div style={{ clear:"both" }}></div>
						</div>
						<MyComponent scope={scope} config={testData} />
					</Card>
				</div>
	  	</QueueAnim>
    )
  }
}

PublicSpace.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(PublicSpace, {
  withRef: true,
}));