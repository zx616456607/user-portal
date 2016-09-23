/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppDetail component
 * 
 * v0.1 - 2016-09-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppInstanceList from "./AppInstanceList.js"
import AppGraph from "./AppGraph.js"
import AppLog from "./AppLog.js"
import "./style/AppDetail.less"
import { loadContainerList } from '../../actions/app_manage'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

class AppDetail extends Component {
  constructor(props) {
    super(props);  
    this.state = {
      currentKey: "1"
    }
  }

	componentWillMount() {
		const { master, appName, loadContainerList } = this.props
    document.title = `应用 ${appName} 详情 | 时速云`
    loadContainerList(master, appName)
  }
  
  render() {
    const { children, appName, containerList, isFetching } = this.props
    const { currentKey } = this.state
    return (
          <div id="AppDetail">
	        <QueueAnim className="demo-content"
	          key="demo"
	          type="right"
	        >
	          <div className="cover"></div>
          	  <div key="ca" className="AppInfo">
          	    <Card className="topCard">
                  <div className="imgBox">
                    <img src="/img/test/github.jpg" />
              	  </div>
              	  <div className="infoBox">
	                <p className="appTitle">
	                  萌萌的 {appName}
	                </p>
	                <div className="leftInfo">
	                  <div className="status">
	                    运行状态&nbsp;:
	                    <span>
	                      <i className="fa fa-circle"></i>
	                      运行中
	                    </span>
	                  </div>
	                  <div className="address">
	                    地址&nbsp;:&nbsp;http:\//www.tenxcloud.com
	                  </div>
	                  <div className="service">
	                    服务&nbsp;:&nbsp;3/3
	                  </div>
	                </div>
	                <div className="middleInfo">
	                  <div className="createDate">
	                    创建&nbsp;:&nbsp;2016-09-09&nbsp;18:15 
	                  </div>
	                  <div className="updateDate">
	                    更新&nbsp;:&nbsp;2016-09-09&nbsp;18:15
	                  </div>
	                </div>
	                <div className="rightInfo">
	                  <div className="introduction">
	                    应用描述&nbsp;:&nbsp;这是一个萌萌哒的应用描述
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
	                <TabPane tab="服务实例" key="1" >
										<AppInstanceList key="AppInstanceList" data={ containerList } loading={ isFetching } />
									</TabPane>
	                <TabPane tab="应用拓补图" key="2" >应用拓补图</TabPane>
	                <TabPane tab="编排文件" key="3" ><AppGraph key="AppGraph" /></TabPane>
	                <TabPane tab="操作日志" key="4" ><AppLog key="AppLog" /></TabPane>
	                <TabPane tab="监控" key="5" >监控</TabPane>
	              </Tabs>
	            </Card>
	          </div>
      		</QueueAnim>
          </div>
        )
    }
}

AppDetail.propTypes = {
  // Injected by React Redux
  master: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { app_name } = props.params
	const defaultContainers = {
    isFetching: false,
    master: 'default',
		appName: app_name,
    containerList: []
  }
	const {
    containers
  } = state
	let targetContainers
	if (containers['default'] && containers['default'][app_name]) {
		targetContainers = containers['default'][app_name]
	}
	const { master, containerList, isFetching } = targetContainers || defaultContainers
  return {
		master,
    appName: app_name,
		containerList,
		isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerList
})(AppDetail)
