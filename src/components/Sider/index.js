/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppSider component
 * 
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, message, Button,Tooltip,Popover,Icon, Menu } from 'antd'
import { Link } from 'react-router'
import "./style/sider.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.selectModel = this.selectModel.bind(this);    
    this.state = {
    	currentKey: checkCurrentPath(this.props.pathname),
  	}
   }
	
	selectModel(currentKey,currentIcon,event){
		this.setState({
			currentKey: currentKey,
		});
	}
	
  render() {
  	const { currentKey } = this.state
  	const noticeModel = (
	<Card className="noticeModel" title="Card title" style={{ width: 300 }}>
    <p>{ this.state.currentKey }</p>
    <p>Card content</p>
    <p>Card contasdfasdfasdfwaetgqwreent</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
	</Card>)
    return (
    	<div id="sider">
	    	<ul className="siderTop">
	    		<li className="logoItem">	    			
		    		<Link to="/">
		    			<img className="logo" src="/img/sider/logo.svg" />
		    		</Link>   			
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"1","#home")} className={currentKey=="1" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="总览"> 
		    			<Link to="/">
		    				<svg className="home commonImg">
			    				<use xlinkHref="#home" />
			    			</svg>
		    			</Link>
	    			</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"2","#app")} className={currentKey=="2" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="应用管理">
		    			<Link to="/app_manage">
		    				<svg className="app commonImg">
			    				<use xlinkHref="#app" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"3","#app")} className={currentKey=="3" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="交付中心">
		    			<Link to="/app_manage">
		    				<svg className="center commonImg">
			    				<use xlinkHref="#center" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"4","#database")} className={currentKey=="4" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="数据库与缓存">
		    			<Link to="/">
		    				<svg className="database commonImg">
			    				<use xlinkHref="#database" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"5","#system")} className={currentKey=="5" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="系统集成">
		    			<Link to="/">
		    				<svg className="system commonImg">
			    				<use xlinkHref="#system" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"6","#manage")} className={currentKey=="6" ? "selectedLi":""}>
	    			<Tooltip placement="right" title="管理与监控">
		    			<Link to="/">
		    				<svg className="manageMoniter commonImg">
			    				<use xlinkHref="#managemoniter" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"7","#setting")} className={currentKey=="7" ? "selectedLi":""}>
	    			<Tooltip placement="right" title="系统设置">
		    			<Link to="/">
		    				<svg className="setting commonImg">
			    				<use xlinkHref="#setting" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    	</ul>
	    	<ul className="siderBottom">
	    		<li>
		    		<Tooltip placement="right" title="创建应用">
		    			<Link to="/">
		    				<svg className="add commonImg">
			    				<use xlinkHref="#add" />
			    			</svg>
		    			</Link>
	    			</Tooltip>
	    		</li>
	    		<li>
	    			<Tooltip placement="right" title="通知中心">
	    				<Popover placement="rightBottom" content={noticeModel} trigger="click">
			    			<Link to="/">
			    				<svg className="message commonImg">
				    				<use href="#message" />
				    			</svg>
			    			</Link>
		    			</Popover>
	    			</Tooltip>
	    		</li>
	    	</ul>
	    </div>
    )
  }
}

function checkCurrentPath(pathname){
	var ApplicationCheck = new RegExp("Application","gi");
	if(ApplicationCheck.test(pathname)){
		return "2";
	}
	var homeCheck = new RegExp("/","gi");
	if(homeCheck.test(pathname)){
		return "1";
	}
}
