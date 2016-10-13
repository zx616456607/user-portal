/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppServiceList component
 * 
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal,Checkbox,Dropdown,Button,Card, Menu,Icon,Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AppServiceList.less'
import { loadServiceList, startServices, restartServices, stopServices, deleteServices } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const confirm = Modal.confirm
const MyComponent = React.createClass({	  
  propTypes : {
    serviceList : React.PropTypes.array
  },
  onchange: function(e){
		const { value, checked } = e.target
  	const { scope } = this.props
  	const { serviceList } = scope.state
		serviceList.map((service) => {
			if (service.metadata.name === value) {
				service.checked = checked
			}
		})
		scope.setState({
			serviceList
		})
  },
  modalShow:function(instanceId){
  	const {scope} = this.props;
  	scope.setState({
  		modalShow : true,
  		currentShowInstance : instanceId
  	});
  },
  render : function() {
	const { serviceList, loading } = this.props
	if (loading) {
		return (
			<Spin/>
		)
	}
	if (serviceList.length < 1) {
		return (
			<span>还没有服务哦~</span>
		)
	}
	const items = serviceList.map((item) => {
	  return (
	    <div className="instanceDetail" key={item.metadata.name}>
			<div className="selectIconTitle commonData">
				<Checkbox value={ item.metadata.name } checked={ item.checked }  onChange={this.onchange}></Checkbox>
			</div>
			<div className="name commonData">
		      <span className="viewBtn" onClick={this.modalShow.bind(this,item)}>
	    	    {item.metadata.name}
		      </span>
			</div>
			<div className="status commonData">
			  {item.spec.replicas || '-'}
			</div>
			<div className="image commonData">
			  {item.images.join(', ') || '-'}
			</div>
			<div className="service commonData">
			  {item.serviceIP || '-'}
			</div>
			<div className="createTime commonData">
			  {item.metadata.creationTimestamp || '-'}
			</div>
			<div className="actionBox commonData">
			  <span className="viewBtn" onClick={this.modalShow.bind(this,item)}>
			    <i className="fa fa-eye"></i>&nbsp;
			       查看详情
			  </span>
			</div>
			<div style={{clear:"both"}}></div>
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

class AppServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.confirmStartService = this.confirmStartService.bind(this)
		this.confirmStopService = this.confirmStopService.bind(this)
		this.confirmRestartService = this.confirmRestartService.bind(this)
    this.state = {
      modalShow:false,
      currentShowInstance: null,
			serviceList: props.serviceList
    }
  }

	onAllChange(e){
		const { checked } = e.target
  	const { serviceList } = this.state
		serviceList.map((service) => service.checked = checked)
		this.setState({
			serviceList
		})
	}

	componentWillReceiveProps(nextProps) {
    this.setState({
      serviceList: nextProps.serviceList
    })
  }
  
	componentWillMount() {
		const { cluster, appName, loadServiceList } = this.props
		document.title = `${appName} 的服务列表 | 时速云`
    loadServiceList(cluster, appName)
  }

	confirmStartService(e) {
		const { serviceList } = this.state
		const { cluster, appName, loadServiceList, startServices } = this.props
		const checkedServiceList = serviceList.filter((service) => service.checked)
		const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
		confirm({
			title: `您是否确认要启动这${checkedServiceList.length}个服务`,
			content: checkedServiceNames.join(', '),
			onOk() {
				return new Promise((resolve) => {
					startServices(cluster, checkedServiceNames, {
						success: {
							func: () => loadServiceList(cluster, appName),
							isAsync: true
						}
					})
					resolve()
				});
			},
			onCancel() {},
		})
	}

	confirmRestartService(e) {
		const { serviceList } = this.state
		const { cluster, appName, loadServiceList, restartServices } = this.props
		const checkedServiceList = serviceList.filter((service) => service.checked)
		const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
		confirm({
			title: `您是否确认要重新启动这${checkedServiceList.length}个服务`,
			content: checkedServiceNames.join(', '),
			onOk() {
				return new Promise((resolve) => {
					restartServices(cluster, checkedServiceNames, {
						success: {
							func: () => loadServiceList(cluster, appName),
							isAsync: true
						}
					})
					resolve()
				});
			},
			onCancel() {},
		})
	}

	confirmStopService(e) {
		const { serviceList } = this.state
		const { cluster, appName, loadServiceList, stopServices } = this.props
		const checkedServiceList = serviceList.filter((service) => service.checked)
		const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
		confirm({
			title: `您是否确认要停止这${checkedServiceList.length}个服务`,
			content: checkedServiceNames.join(', '),
			onOk() {
				return new Promise((resolve) => {
					stopServices(cluster, checkedServiceNames, {
						success: {
							func: () => loadServiceList(cluster, appName),
							isAsync: true
						}
					})
					resolve()
				});
			},
			onCancel() {},
		})
	}

  closeModal(){
    this.setState({
  	  modalShow:false  
  	})
  }
  
  render() {
		const parentScope = this
		const operaMenu = (<Menu>
								<Menu.Item key="0">
									<span style={{ display: "block", padding: "7px 15px", margin:" -7px -15px" }} onClick={ this.confirmRestartService }>重新部署</span>
								</Menu.Item>
								<Menu.Item key="1">
								弹性伸缩
								</Menu.Item>
								<Menu.Item key="2">
								灰度升级
								</Menu.Item>
								<Menu.Item key="3">
								更改配置
								</Menu.Item>
							</Menu>);
		let { modalShow, currentShowInstance, serviceList } = this.state
		const { isFetching } = this.props
		const checkedServiceList = serviceList.filter((service) => service.checked)
		const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    const isChecked = (checkedServiceList.length > 0)
		let isAllChecked = (serviceList.length === checkedServiceList.length)
		if (serviceList.length === 0) {
			isAllChecked = false
		}
		return (
      <div id="AppServiceList">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
	      <div className="operaBox">
	        <Button size="large" onClick={ this.confirmStartService } disabled={ !isChecked }>
	          <i className="fa fa-play"></i>
	          启动
	        </Button>
	        <Button size="large" onClick={ this.confirmStopService } disabled={ !isChecked }>
	          <i className="fa fa-stop"></i>
	          停止
	        </Button>
	        <Button size="large" disabled={ !isChecked }>
	          <i className="fa fa-trash"></i>
	          删除
	        </Button>
            <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large" disabled={ !isChecked }>
	            更多
	          <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	      </div>
	      <div className="appTitle">
      	    <div className="selectIconTitle commonTitle">
      		  <Checkbox checked={ isAllChecked } onChange={this.onAllChange} disabled={ serviceList.length < 1 }></Checkbox>
      		</div>
            <div className="name commonTitle">
      		  服务名称
      		</div>
      		<div className="status commonTitle">
      		  运行状态
      		</div>
      		<div className="image commonTitle">
      		  镜像
      		</div>
      		<div className="service commonTitle">
      		  服务地址
      		</div>
      		<div className="createTime commonTitle">
      		  创建时间
      		</div>
      		<div className="actionBox commonTitle">
      		  操作
      		</div>
      		<div style={{ clear:"both" }}></div>
      	  </div>
      	  <MyComponent scope={parentScope} serviceList={serviceList} loading={isFetching} />
      	  <Modal
						title="垂直居中的对话框"
						visible={this.state.modalShow}
						className="AppServiceDetail"
						transitionName="move-right"
						onCancel={this.closeModal}
					>
	        <AppServiceDetail scope={parentScope} />
          </Modal>
        </QueueAnim>
      </div>
    )
  }
}

AppServiceList.propTypes = {
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  serviceList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired,
  startServices: PropTypes.func.isRequired,
  restartServices: PropTypes.func.isRequired,
  stopServices: PropTypes.func.isRequired,
  deleteServices: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const { appName } = props
	const defaultServices = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
		appName,
    serviceList: []
  }
	const {
    serviceItmes
  } = state.services
	let targetServices
	if (serviceItmes[DEFAULT_CLUSTER] && serviceItmes[DEFAULT_CLUSTER][appName]) {
		targetServices = serviceItmes[DEFAULT_CLUSTER][appName]
	}
	const { cluster, serviceList, isFetching } = targetServices || defaultServices
  return {
		cluster,
    appName,
		serviceList,
		isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceList,
	startServices,
	restartServices,
	stopServices,
	deleteServices
})(AppServiceList)