/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppList component
 * 
 * v0.1 - 2016-09-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Tooltip, Checkbox, Card, Menu, Dropdown, Button, Icon, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/AppList.less'
import { loadAppList, deleteApps } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'

const confirm = Modal.confirm
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重新部署
					  </Menu.Item>
					  <Menu.Item key="1">
						停止容器
					  </Menu.Item>
					  <Menu.Item key="2">
						删除
					  </Menu.Item>
					  <Menu.Item key="3">
						查看架构图
					  </Menu.Item>
					  <Menu.Item key="4">
						查看编排
					  </Menu.Item>
					</Menu>);

const MyComponent = React.createClass({	  
  propTypes: {
   config: React.PropTypes.array,
   parentScope: React.PropTypes.object,
  },
  onchange: function(e){
		const { value, checked } = e.target
  	const { parentScope } = this.props
  	const { appList } = parentScope.state
		appList.map((app) => {
			if (app.name === value) {
				app.checked = checked
			}
		})
		parentScope.setState({
			appList
		})
  },
  render: function() {
		const { config, loading } = this.props
		if (loading) {
			return (
				<div className="dataBox">
					<Spin />
				</div>
			)
		}
		if (config.length < 1) {
			return (
				<div className="dataBox">
					暂无数据
				</div>
			)
		}
		const items = config.map((item) => {
			return (
				<div className="appDetail" key={item.name}>
					<div className="selectIconTitle commonData">
						<Checkbox value={ item.name } checked={ item.checked }  onChange={this.onchange}></Checkbox>
					</div>
					<div className="appName commonData">
							<Link to={`/app_manage/detail/${item.name}`} >
								{item.name}
							</Link>
					</div>
					<div className="appStatus commonData">
						<i className={item.appStatus == 1 ? "normal fa fa-circle":"error fa fa-circle"}></i>
						<span className={item.appStatus == 1 ? "normal":"error"} >{item.appStatus == 1 ? "正常":"异常"}</span>
					</div>
					<div className="serviceNum commonData">
						{item.serviceCount || '-'}
					</div>
					<div className="containerNum commonData">
						{item.instanceCount || '-'}
					</div>
					<div className="visitIp commonData">
						{item.address || '-'}
					</div>
					<div className="createTime commonData">
						{item.createTime}
					</div>
					<div className="actionBox commonData">
						<Dropdown overlay={operaMenu} trigger={['click']}>
							<Button type="ghost" size="large" className="ant-dropdown-link" href="#">
								更多 <i className="fa fa-caret-down"></i>
							</Button>
						</Dropdown>
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


class AppList extends Component {
  constructor(props) {
		super(props)
		this.onAllChange = this.onAllChange.bind(this)
		this.confirmDeleteApp = this.confirmDeleteApp.bind(this)
		this.state = {
			appList: props.appList
		}
  }
  
  onAllChange(e){
		const { checked } = e.target
  	const { appList } = this.state
		appList.map((app) => app.checked = checked)
		this.setState({
			appList
		})
	}
	
	componentWillMount() {
    document.title = '应用列表 | 时速云'
		const { cluster, loadAppList } = this.props
		loadAppList(cluster)
  }

	componentWillReceiveProps(nextProps) {
		console.log(nextProps.appList)
    this.setState({
      appList: nextProps.appList
    })
  }

	confirmDeleteApp(e) {
		const { appList } = this.state
		const { cluster, loadAppList, deleteApps } = this.props
		const checkedAppList = appList.filter((app) => app.checked)
		const checkedAppNames = checkedAppList.map((app) => app.name)
		confirm({
			title: `您是否确认要删除这${checkedAppList.length}项内容`,
			content: checkedAppNames.join(', '),
			onOk() {
				return new Promise((resolve) => {
					deleteApps(cluster, checkedAppNames, {
						success: {
							func: () => loadAppList(cluster),
							isAsync: true
						}
					})
					resolve()
				});
			},
			onCancel() {},
		});
	}

  render() {
		const scope = this
		const { cluster, isFetching } = this.props
		const { appList } = this.state
		const checkedAppList = appList.filter((app) => app.checked)
		const isChecked = (checkedAppList.length > 0)
		let isAllChecked = (appList.length === checkedAppList.length)
		if (appList.length === 0) {
			isAllChecked = false
		}
    return (
        <QueueAnim 
          className = "AppList"
          type = "right"
        >
          <div id="AppList" key = "AppList">
      	    <div className="operationBox">
	          <div className="leftBox">
	      	    <Button type="ghost" size="large">
	      	      <Link to="/app_manage/app_create">
	      	        <i className="fa fa-plus"></i>添加应用
	      	      </Link>
	      	    </Button>
	      	    <Button type="ghost" size="large" disabled={ !isChecked }>
								<i className="fa fa-stop"></i>停止
							</Button>
	      	    <Button type="ghost" size="large" onClick={ this.confirmDeleteApp } disabled={ !isChecked }>
								<i className="fa fa-trash-o"></i>删除
							</Button>
	      	    <Button type="ghost" size="large" disabled={ !isChecked }>
								<i className="fa fa-undo"></i>重新部署
							</Button>
	          </div>
	        <div className="rightBox">
	      	  <div className="littleLeft">
	      	    <i className="fa fa-search"></i>
	      	  </div>
	      	  <div className="littleRight">
	      	    <input placeholder="输入应用名搜索" />
	      	  </div>
	        </div>
	        <div className="clearDiv"></div>
      	  </div>
      	  <Card className="appBox">
      	    <div className="appTitle">
      		  <div className="selectIconTitle commonTitle">
      		    <Checkbox checked={ isAllChecked } onChange={this.onAllChange} disabled={ appList.length < 1 }></Checkbox>
      		  </div>
      		  <div className="appName commonTitle">
      		    应用名称
      		  </div>
      		  <div className="appStatus commonTitle">
      		    应用状态
      		  </div>
      		  <div className="serviceNum commonTitle">
      		    服务数量
      		    <i className="fa fa-sort"></i>
      		  </div>
      		  <div className="containerNum commonTitle">
      		    容器数量
      		    <i className="fa fa-sort"></i>
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
      	    <MyComponent config={appList} loading={isFetching} parentScope={scope}/>
      	  </Card>
        </div>
      </QueueAnim>
    )
  }
}

AppList.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  appList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadAppList: PropTypes.func.isRequired,
  deleteApps: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultApps = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    appList: []
  }
  const {
    appItems
  } = state.apps
  const { cluster, appList, isFetching } = appItems[DEFAULT_CLUSTER] || defaultApps

  return {
    cluster,
    appList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadAppList,
	deleteApps
})(AppList)