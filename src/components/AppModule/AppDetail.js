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
import AppServiceList from './AppServiceList'
import AppGraph from './AppGraph'
import AppLog from './AppLog'
import './style/AppDetail.less'
import { loadServiceList } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'

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
		const { cluster, appName, loadServiceList } = this.props
    document.title = `应用 ${appName} 详情 | 时速云`
    // loadServiceList(cluster, appName)
  }
  
  render() {
    const { children, appName, serviceList, isFetching } = this.props
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
	                  {appName}
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
										<AppServiceList key="AppServiceList" appName={ appName } loading={ isFetching } />
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
  cluster: PropTypes.string.isRequired,
  serviceList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { app_name } = props.params
	const defaultServices = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
		appName: app_name,
    serviceList: []
  }
	const {
    services
  } = state
	let targetServices
	if (services[DEFAULT_CLUSTER] && services[DEFAULT_CLUSTER][app_name]) {
		targetServices = services[DEFAULT_CLUSTER][app_name]
	}
	const { cluster, serviceList, isFetching } = targetServices || defaultServices
  return {
		cluster,
    appName: app_name,
		serviceList,
		isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceList
})(AppDetail)
