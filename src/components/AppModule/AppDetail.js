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
import { Tabs, Card, Menu, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceList from './AppServiceList'
import AppGraph from './AppGraph'
import AppLog from './AppLog'
import AppMonitior from './AppMonitior'
import './style/AppDetail.less'
import { formatDate } from '../../common/tools'
import { loadAppDetail } from '../../actions/app_manage'
import { browserHistory } from 'react-router'
import AppStatus from '../TenxStatus/AppStatus'
import { parseAppDomain } from '../parseDomain'
import TipSvcDomain from '../TipSvcDomain'

const DEFAULT_TAB = '#service'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

class AppDetail extends Component {
  constructor(props) {
    super(props)
    this.onTabClick = this.onTabClick.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB
    }
  }

  componentWillMount() {
    const { cluster, appName, loadAppDetail } = this.props
    document.title = `应用 ${appName} 详情 | 时速云`
    loadAppDetail(cluster, appName)
  }

  componentWillReceiveProps(nextProps) {
    let { hash } = nextProps
    if (hash === this.props.hash) {
      return
    }
    if (!hash) {
      hash = DEFAULT_TAB
    }
    this.setState({
      activeTabKey: hash
    })
  }

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    const { pathname } = this.props
    this.setState({
      activeTabKey
    })
    if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }
    browserHistory.push({
      pathname,
      hash: activeTabKey
    })
  }

  render() {
    const { children, appName, app, isFetching, location } = this.props
    const { activeTabKey } = this.state
    if (isFetching || !app) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let updateDate = '-'
    if (app && app.services && app.services[0]) {
      updateDate = app.services[0].metadata.creationTimestamp
    }
    const domains = parseAppDomain(app, this.props.bindingDomains)
    // const svcDomain = ['10.11.102.1111','10.11.102.222','10.11.102.333']
    const appDomain = [
      {
        name: 'servce1',
        data: ['10.1.27.1',]
      },
      {
        name: 'servce2',
        data: ['10.1.27.1',]
      },
      {
        name: 'servce3',
        data: ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
      },
    ]
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
                <img src="/img/app.png" />
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  {appName}
                </p>
                <div className="leftInfo">
                  <div className="status">
                    运行状态&nbsp;:
                    <div style={{ display: 'inline-block', position: 'relative', top: '-5px' }}>
                      <AppStatus services={app.services} smart={true} />
                    </div>
                  </div>
                  <div className="address">
                    <TipSvcDomain appDomain={appDomain} type={true} />
                  </div>
                  <div className="service">
                    服务&nbsp;:&nbsp; {`${app.serviceCount} / ${app.serviceCount}`}
                  </div>
                </div>
                <div className="middleInfo">
                  <div className="createDate">
                    创建&nbsp;:&nbsp;{formatDate(app.createTime || '')}
                  </div>
                  <div className="updateDate">
                    更新&nbsp;:&nbsp;{formatDate(updateDate || '')}
                  </div>
                </div>
                <div className="rightInfo">
                  <div className="introduction">
                    应用描述&nbsp;:&nbsp;{app.description || '无'}
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div style={{ clear: "both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey={activeTabKey}
                onTabClick={this.onTabClick}
                activeKey={activeTabKey}
                >
                <TabPane tab="服务实例" key={DEFAULT_TAB} >
                  <AppServiceList
                    location={location}
                    key="AppServiceList"
                    appName={appName}
                    loading={isFetching} />
                </TabPane>
                <TabPane tab="应用拓扑" key="#topology">应用拓扑</TabPane>
                <TabPane tab="编排文件" key="#stack" ><AppGraph key="AppGraph" cluster={this.props.cluster} appName={this.props.appName} /></TabPane>
                <TabPane tab="审计日志" key="#logs" >
                  <AppLog key="AppLog"
                    cluster={this.props.cluster}
                    appName={this.props.appName} />
                </TabPane>
                <TabPane tab="监控" key="#monitor" >
                  <AppMonitior
                    cluster={this.props.cluster}
                    appName={this.props.appName} />
                </TabPane>
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
  appName: PropTypes.string.isRequired,
  app: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadAppDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { app_name } = props.params
  const { hash, pathname } = props.location
  const { cluster } = state.entities.current
  const defaultApp = {
    isFetching: false,
    cluster: cluster.clusterID,
    appName: app_name,
    app: {}
  }
  const {
    appDetail
  } = state.apps
  let targetServices
  const { app, isFetching } = appDetail || defaultServices
  return {
    cluster: cluster.clusterID,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    appName: app_name,
    app,
    isFetching,
    hash,
    pathname,
    location: props.location
  }
}

export default connect(mapStateToProps, {
  loadAppDetail
})(AppDetail)
