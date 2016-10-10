/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * PublicCompose component
 * 
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert,Menu,Button,Card,Input,Dropdown,Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/PublicCompose.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
	search: {
    id: 'AppCenter.ComposeCenter.PublicCompose.search',
    defaultMessage: '搜索',
 },
  delete: {
    id: 'AppCenter.ComposeCenter.PublicCompose.delete',
    defaultMessage: '删除',
  },
  type: {
    id: 'AppCenter.ComposeCenter.PublicCompose.type',
    defaultMessage: '类型',
  },
  name: {
    id: 'AppCenter.ComposeCenter.PublicCompose.name',
    defaultMessage: '编排名称',
  },
  time: {
    id: 'AppCenter.ComposeCenter.PublicCompose.time',
    defaultMessage: '时间',
  },
  opera: {
    id: 'AppCenter.ComposeCenter.PublicCompose.opera',
    defaultMessage: '操作',
  },
  imageUrl: {
    id: 'AppCenter.ComposeCenter.PublicCompose.imageUrl',
    defaultMessage: '包含镜像',
  },
  deployService: {
    id: 'AppCenter.ComposeCenter.PublicCompose.deployService',
    defaultMessage: '部署服务',
  },
  editService: {
    id: 'AppCenter.ComposeCenter.PublicCompose.editService',
    defaultMessage: '编辑服务',
  },
  deleteService: {
    id: 'AppCenter.ComposeCenter.PublicCompose.deleteService',
    defaultMessage: '删除服务',
  },
  createCompose: {
  	id: 'AppCenter.ComposeCenter.PublicCompose.createCompose',
  	defaultMessage: '创建编排',
  },
  tooltipsFirst: {
  	id: 'AppCenter.ComposeCenter.PublicCompose.tooltipsFirst',
    defaultMessage: '目前时速云支持两种类型的服务编排服务：',
  },
  tooltipsSecond: {
  	id: 'AppCenter.ComposeCenter.PublicCompose.tooltipsSecond',
    defaultMessage: '[1] Pod 编排，适用于紧耦合的服务组，保证一组服务始终部署在同一节点，并可以共享网络空间和存储卷',
  },
  tooltipsThird: {
  	id: 'AppCenter.ComposeCenter.PublicCompose.tooltipsThird',
    defaultMessage: '[2] Stack 编排，设计上与 Docker Compose 相似，但可以支持跨物理节点的服务之间通过 API 进行网络通信 ',
  },
  tooltipsForth: {
  	id: 'AppCenter.ComposeCenter.PublicCompose.tooltipsForth',
    defaultMessage: '* 以上两种编排均支持用 yaml 文件描述多个容器及其之间的关系，定制各个容器的属性，并可一键部署运行',
  }
})

const testData = [{
	id:"1",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"2",
	imageName:"Mysql",
	imgUrl:"/img/test/mysql.jpg",
	type:"private",
	imageUrl:"tenxcloud/Mysql",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"3",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"public",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"4",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"private",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"5",
	imageName:"Mysql",
	imgUrl:"/img/test/mysql.jpg",
	type:"public",
	imageUrl:"tenxcloud/Mysql",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"6",
	imageName:"Php",
	imgUrl:"/img/test/php.jpg",
	type:"public",
	imageUrl:"tenxcloud/Php",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"7",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"public",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"8",
	imageName:"Oracle",
	imgUrl:"/img/test/oracle.jpg",
	type:"private",
	imageUrl:"tenxcloud/Oracle",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"9",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
},{
	id:"10",
	imageName:"Github",
	imgUrl:"/img/test/github.jpg",
	type:"private",
	imageUrl:"tenxcloud/Github",
	downloadNum:"1234",
	time:"2016-10-10 13:50:50"
}];

let MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array,
    scope : React.PropTypes.object
  },
  menuClick:function(id){
  	//this function for user delete select image
  	
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
			const dropdown = (
			  <Menu onClick={this.menuClick.bind(this,item)}
					style={{width:"100px"}}
			  >
			    <Menu.Item key="1">
			    	<FormattedMessage {...menusText.editService} />
			    </Menu.Item>
			    <Menu.Item key="2">
			    	<FormattedMessage {...menusText.deleteService} />
			    </Menu.Item>
			  </Menu>
			);
		  return (
		    <div className="composeDetail" key={item.id} >
					<div className="name">
						<span className="maxSpan">{item.imageName}</span>
					</div>
					<div className="type">
						<span>{item.type}</span>
					</div>
					<div className="image">
						<span className="maxSpan">{item.imageUrl}</span>
					</div>
					<div className="time">
						<span>{item.time}</span>
					</div>
					<div className="opera">
						<Dropdown.Button overlay={dropdown} type="ghost">
				      <FormattedMessage {...menusText.deployService} />
				    </Dropdown.Button>
					</div>
				</div>
	    );
		});
		return (
		  <div className="composeList">
	        { items }
		  </div>
    );
  }
});		

class PublicCompose extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
  	}
  }
  
  filterAttr(e){
  	//this function for user filter different attr
  	console.log(e)
  }
  
  filterType(e){
  	//this function for user filter different type
  	console.log(e)
  }
	
  render() {
  	const { formatMessage } = this.props.intl;
  	const scope = this.props.scope;
		const typeDropdown = (
			  <Menu onClick={this.filterType.bind(this)}
					style={{width:"100px"}}
			  >
			    <Menu.Item key="1">
			    	酱油
			    </Menu.Item>
			    <Menu.Item key="2">
			    	又一瓶酱油
			    </Menu.Item>
			  </Menu>
			);
    return (    	
      <QueueAnim className="PublicCompose"
      	type="right"
      >
				<div id="PublicCompose" key="PublicCompose">
					<Alert type="info" message={
						<div>
							<p><FormattedMessage {...menusText.tooltipsFirst} /></p>
			  			<p><FormattedMessage {...menusText.tooltipsSecond} /></p>
			  			<p><FormattedMessage {...menusText.tooltipsThird} /></p>
			  			<p><FormattedMessage {...menusText.tooltipsForth} /></p>
						</div>
						} />
					<Card className="PublicComposeCard">
						<div className="operaBox">
							<Input className="searchBox" placeholder={ formatMessage(menusText.search) } type="text" />
							<i className="fa fa-search"></i>
						</div>
						<div className="titleBox">
							<div className="name">
								<FormattedMessage {...menusText.name} />
							</div>
							<div className="type">
								<Dropdown overlay={typeDropdown} trigger={['click']} getPopupContainer={()=>document.getElementById("PublicCompose")}>
								<div>
									<FormattedMessage {...menusText.type} />&nbsp;
									<i className="fa fa-filter"></i>
								</div>
								</Dropdown>
							</div>
							<div className="image">
								<FormattedMessage {...menusText.imageUrl} />
							</div>
							<div className="time">
								<FormattedMessage {...menusText.time} />
							</div>
							<div className="opera">
								<FormattedMessage {...menusText.opera} />
							</div>
							<div style={{ clear:"both" }}></div>
						</div>
						<MyComponent scope={scope} config={testData} />
					</Card>
				</div>
	  	</QueueAnim>
    )
  }
}

PublicCompose.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(PublicCompose, {
  withRef: true,
}))