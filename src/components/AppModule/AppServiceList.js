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
import { Modal,Checkbox,Dropdown,Button,Card, Menu,Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AppServiceList.less'
import { loadServiceList } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重新部署
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
const MyComponent = React.createClass({	  
  propTypes : {
    serviceList : React.PropTypes.array
  },
  onchange : function(){
  	  	
  },
  modalShow:function(instanceId){
  	const {scope} = this.props;
  	scope.setState({
  		modalShow : true,
  		currentShowInstance : instanceId
  	});
  },
  render : function() {
	const { serviceList } = this.props
	const items = serviceList.map((item) => {
	  return (
	    <div className="instanceDetail" key={item.metadata.name}>
			<div className="selectIconTitle commonData">
			  <Checkbox onChange={()=>this.onchange()}></Checkbox>
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
    this.closeModal = this.closeModal.bind(this);    
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
    loadServiceList(cluster, appName)
  }

  closeModal(){
    this.setState({
  	  modalShow:false  
  	});
  }
  
  render() {
		const parentScope = this
		let { modalShow, currentShowInstance, serviceList } = this.state
		const { isFetching } = this.props
    return (
      <div id="AppServiceList">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
	      <div className="operaBox">
	        <Button size="large">
	          <i className="fa fa-play"></i>
	          启动
	        </Button>
	        <Button size="large">
	          <i className="fa fa-stop"></i>
	          停止
	        </Button>
	        <Button size="large">
	          <i className="fa fa-trash"></i>
	          删除
	        </Button>
            <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large">
	            更多
	          <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	      </div>
	      <div className="appTitle">
      	    <div className="selectIconTitle commonTitle">
      		  <Checkbox></Checkbox>
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
  loadServiceList: PropTypes.func.isRequired
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
    services
  } = state
	let targetServices
	if (services[DEFAULT_CLUSTER] && services[DEFAULT_CLUSTER][appName]) {
		targetServices = services[DEFAULT_CLUSTER][appName]
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
  loadServiceList
})(AppServiceList)