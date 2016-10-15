/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ContainerDetail component
 * 
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown,Tabs,Card,Menu,Button,Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerDetailInfo from "./ContainerDetailInfo.js"
import ContainerDetailGraph from "./ContainerGraph.js"
import ContainerDetailLog from "./ContainerLog.js"
import "./style/ContainerDetail.less"
import { loadContainerDetail } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
const ButtonGroup = Button.Group;
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						<i className="fa fa-stop" style={{marginRight:"10px"}}></i>停止
					  </Menu.Item>
					  <Menu.Item key="1">
						<i className="fa fa-trash-o" style={{marginRight:"10px"}}></i>删除
					  </Menu.Item>
					</Menu>);

function loadData(props) {
  const { cluster, containerName } = props
  props.loadContainerDetail(cluster, containerName)
}

class ContainerDetail extends Component {
  constructor(props) {
    super(props);  
    this.state = {
      currentKey: "1"
    }
  }

	componentWillMount() {
		const { containerName } = this.props
    document.title = `容器 ${ containerName } | 时速云`
    loadData(this.props)
  }
  
  render() {
    const { containerName, isFetching, container } = this.props
    const { children } = this.props
    const { currentKey } = this.state
		if (isFetching || !container.metadata) {
			return (
				<Spin />
			)
		}
		if (!container.status) {
			container.status = {}
		}
    return (
      <div id="ContainerDetail">
	    <QueueAnim className="demo-content"
	     key="demo"
	     type="right"
	    >
	      <div className="cover"></div>
            <div key="ca" className="containerInfo">
          	  <Card className="topCard">
                <div className="imgBox">
                  <img src="/img/test/github.jpg" />
                </div>
                <div className="infoBox">
	              <p className="appTitle">
	                { containerName }
	              </p>
	              <div className="leftInfo">
	                <div className="status">
	                  运行状态&nbsp;:
	                  <span>
											<i className={container.status.phase == 'Running' ? "normal fa fa-circle":"error fa fa-circle"}></i>
	                    <span className={container.status.phase == 'Running' ? "normal":"error"} >
												{ container.status.phase }
											</span>
	                  </span>
	                </div>
	                <div className="address">
	                  地址&nbsp;:&nbsp; {container.status.podIP}
	                </div>
	                </div>
	                <div className="middleInfo">
	                  <div className="createDate">
	                    创建&nbsp;:&nbsp;{container.metadata.creationTimestamp} 
	                  </div>
	                  {/*<div className="updateDate">
	                    更新&nbsp;:&nbsp;{container.metadata.creationTimestamp} 
	                  </div>*/}
	                </div>
	                <div className="rightInfo">
	                  <div className="actionBox commonData">
	                    <Button type="primary" className="viewBtn">
			      		  <svg className="terminal">
	                		<use xlinkHref="#terminal" />
	              		  </svg>
		          		  登录终端
			    		</Button>
			            <ButtonGroup>
			              <Button type="ghost">
		          			<i className="fa fa-power-off"></i>重启
			    		  </Button>
			   			  <Dropdown overlay={operaMenu} trigger={['click']}>
				  		    <Button type="ghost" className="moreBtn ant-dropdown-link">
		            		  <i className="fa fa-caret-down"></i>
				  			</Button>
			    		  </Dropdown>
			  			</ButtonGroup>
					  </div>
	                </div>
	                <div style={{ clear:"both" }}></div>
	              </div>
	              <div style={{ clear:"both" }}></div>
	            </Card>
	            <Card className="bottomCard">
	              <Tabs
	               tabPosition="top"
	               defaultActiveKey="1"
	              >
	                <TabPane tab="容器配置" key="1" >
										<ContainerDetailInfo key="ContainerDetailInfo" container={ container } />
									</TabPane>
	                <TabPane tab="监控" key="2" >应用拓补图</TabPane>
	                <TabPane tab="日志" key="3" ><ContainerDetailGraph key="ContainerDetailGraph" /></TabPane>
	                <TabPane tab="事件" key="4" ><ContainerDetailLog key="ContainerDetailLog" / ></TabPane>
	              </Tabs>
	            </Card>
	          </div>
      		</QueueAnim>
          </div>
        )
    }
}

ContainerDetail.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerName: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  container: PropTypes.object.isRequired,
  loadContainerDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { container_name } = props.params
	const cluster = DEFAULT_CLUSTER
	const defaultContainer = {
    isFetching: false,
    cluster,
		containerName: container_name,
    container: {}
  }
	const {
    containerDetail
  } = state.containers
	const { container, isFetching } = containerDetail[cluster] || defaultContainer

  return {
    containerName: container_name,
		cluster,
		isFetching,
		container
  }
}

export default connect(mapStateToProps, {
  loadContainerDetail,
})(ContainerDetail)
