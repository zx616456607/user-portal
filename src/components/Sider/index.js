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
import { Card, message, Button,Tooltip,Popover,Icon, Menu, Modal,Radio ,Upload  } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import "./style/sider.less"
import { beforeUploadFile, uploading, mergeUploadingIntoList, getUploadFileUlr, uploadFileOptions } from '../../actions/storage'
import { cloneDeep } from 'lodash'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

const RadioGroup = Radio.Group
class Slider extends Component {
  constructor(props) {
    super(props);
    this.selectModel = this.selectModel.bind(this);    
    this.state = {
    	currentKey: checkCurrentPath(this.props.pathname),
			isUnzip: false
  	}
   }
	handleCancel() {
		const currentOptions = cloneDeep(this.props.uploadFileOptions)
	  currentOptions.visible = false
		this.props.changeUploadFileOptions(currentOptions)
	}
	selectModel(currentKey,currentIcon,event){
	  this.setState({
		currentKey: currentKey,
	  });
	}
	changeRadioValue(e) {
		this.setState({
			isUnzip: e.target.value
		})
	}	
	
	getUploadData() {
		const options = this.props.uploadFileOptions
		const volumeName = options.volumeName
		const self = this
		return {
			showUploadList: false,
			data: {
				isUnzip: self.state.isUnzip,
				volumeName: volumeName,
				pool: options.pool,
				cluster: options.cluster,
				backupId: self.props.beforeUploadState.backupId
			},
			beforeUpload: (file) => {
				self.props.uploading(0)
				file.isUnzip = self.state.isUnzip
				return new Promise(function (resolve, reject) {
					self.props.beforeUploadFile(options.pool, options.cluster, volumeName, file, {
						success: {
							isAsync: true,
							func() {
								self.props.mergeUploadingIntoList(self.props.beforeUploadState)
								const currentOptions = cloneDeep(options)
								currentOptions.uploadFile = false
								currentOptions.visible = false
								currentOptions.uploadFileStatus = 'active',
								self.props.changeUploadFileOptions(currentOptions)
								resolve(true)
							}
						}
					})
				})
			},
			action: getUploadFileUlr(options.pool, options.cluster, volumeName),
			onChange(info) {
				if (info.event) {
					self.props.uploading(info.event.percent.toFixed(2))
				}
				if (info.file.status === 'done') {
					const fileInfo = cloneDeep(self.props.beforeUploadState)
					fileInfo.status = 'Complete'
					self.props.mergeUploadingIntoList(fileInfo)
					self.props.uploading(100)
					const currentOptions = cloneDeep(self.props.uploadFileOptions)
					currentOptions.uploadFile = false
					currentOptions.uploadFileStatus = 'success'
					self.props.changeUploadFileOptions(currentOptions)
					message.success('文件上传成功')
				} else if (info.file.status === 'error') {
					// self.props.uploading(100)
					const currentOptions = cloneDeep(self.props.uploadFileOptions)
					currentOptions.uploadFile = false
					currentOptions.uploadFileStatus = 'exception'
					self.props.changeUploadFileOptions(currentOptions)
					const fileInfo = cloneDeep(self.props.beforeUploadState)
					fileInfo.status = 'Failure'
					self.props.mergeUploadingIntoList(fileInfo)
					message.error('文件上传失败')
				}
			}
		}
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
				<Modal title="上传文件" wrapClassName="vertical-center-modal" footer="" visible={this.props.uploadFileOptions.visible} onCancel = { () => this.handleCancel() }>
					<div className="uploadModal">
						<RadioGroup  onChange={(e) => {this.changeRadioValue(e)}} value={this.state.isUnzip}>
							<Radio key="a" value={false}>直接上传</Radio>
							<Radio key="b" value={true}>上传并解压</Radio>
						</RadioGroup>
						<p>
							<Upload {...this.getUploadData()}>
								<Button type="primary">
									<Icon type="upload" /> 选择文件
                </Button>
							</Upload>
						</p>
						<p>或将文件拖到这里</p>
					</div>
					<ul className="uploadhint">
						<li>1、支持任何格式文件，大小不超过600M</li>
						<li>2、仅支持 zip 格式文件解压，导入时会覆盖存储卷内[同文件名]</li>
						<li style={{ color: 'red' }}>* 请先停止挂载该存储卷的服务再进行文件导入</li>
					</ul>
				</Modal>
	    	<ul className="siderTop">
	    		<li className="logoItem">	    			
		    		<Link to="/">
		    			<img className="logo" src="/img/sider/logo.svg" />
		    		</Link>   			
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"1","#home")} className={currentKey=="1" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="总览" getTooltipContainer={()=>document.getElementById("siderTooltip")}> 
		    			<Link to="/">
		    				<svg className="home commonImg">
			    				<use xlinkHref="#home" />
			    			</svg>
		    			</Link>
	    			</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"2","#app")} className={currentKey=="2" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="应用管理" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/app_manage"> 
		    				<svg className="app commonImg">
			    				<use xlinkHref="#app" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"3","#appCenter")} className={currentKey=="3" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="交付中心" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/app_center">
		    				<svg className="center commonImg">
			    				<use xlinkHref="#center" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"4","#database")} className={currentKey=="4" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="数据库与缓存" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/database_cache">
		    				<svg className="database commonImg">
			    				<use xlinkHref="#database" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"5","#system")} className={currentKey=="5" ? "selectedLi":""}>
		    		<Tooltip placement="right" title="系统集成" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/">
		    				<svg className="system commonImg">
			    				<use xlinkHref="#system" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"6","#manage")} className={currentKey=="6" ? "selectedLi":""}>
	    			<Tooltip placement="right" title="管理与监控" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/">
		    				<svg className="manageMoniter commonImg">
			    				<use xlinkHref="#managemoniter" />
			    			</svg>
		    			</Link>
		    		</Tooltip>
	    		</li>
	    		<li onClick={this.selectModel.bind(this,"7","#setting")} className={currentKey=="7" ? "selectedLi":""}>
	    			<Tooltip placement="right" title="系统设置" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
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
		    		<Tooltip placement="right" title="创建应用" getTooltipContainer={()=>document.getElementById("siderTooltip")}>
		    			<Link to="/app_manage/app_create">
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
	let AppCenterCheck = new RegExp("app_center","gi");
	if(AppCenterCheck.test(pathname)){
		return "3";
	}
	let ApplicationCheck = new RegExp("app_manage","gi");
	if(ApplicationCheck.test(pathname)){
		return "2";
	}
	let homeCheck = new RegExp("/","gi");
	if(homeCheck.test(pathname)){
		return "1";
	}
}

function mapStateToProp(state) {
	return {
		uploadFileOptions: state.storage.uploadFileOptions,
		beforeUploadState: state.storage.beforeUploadFile
	}
}

export default connect(mapStateToProp, {
	beforeUploadFile, 
	uploading, 
	mergeUploadingIntoList,
	changeUploadFileOptions: uploadFileOptions
})(Slider)