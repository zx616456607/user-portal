/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService component
 *
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Checkbox, Dropdown, Button, Card, Menu, Icon, Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerList from './AppContainerList'
import AppServiceDetailInfo from './AppServiceDetailInfo'
import ComposeGroup from './ComposeGroup'
import BindDomain from './BindDomain'
import PortDetail from './PortDetail'
import AppUseful from './AppUseful'
import AppServiceLog from './AppServiceLog'
import AppServiceEvent from './AppServiceEvent'
import ServiceMonitor from './ServiceMonitor'
import AppAutoScale from './AppAutoScale'
import { loadServiceDetail, loadServiceContainerList } from '../../../actions/services'
import CommmonStatus from '../../CommonStatus'
import './style/AppServiceDetail.less'
import TerminalModal from '../../TerminalModal'
import parseServiceDomain from '../../parseDomain'

const DEFAULT_TAB = '#containers'
const TabPane = Tabs.TabPane;

function loadData(props) {
  const { cluster, serviceName, loadServiceDetail, loadServiceContainerList } = props
  document.title = `${serviceName} 服务详情页 | 时速云`
  loadServiceDetail(cluster, serviceName)
  loadServiceContainerList(cluster, serviceName)
}

class AppServiceDetail extends Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.restartService = this.restartService.bind(this)
    this.stopService = this.stopService.bind(this)
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.state = {
      activeTabKey: props.selectTab || DEFAULT_TAB,
      TerminalLayoutModal: false,
    }
  }

  closeModal() {
    const {scope} = this.props
    scope.setState({
      modalShow: false
    });
  }
  closeTerminalLayoutModal() {
    //this function for user close the terminal modal
    this.setState({
      TerminalLayoutModal: false
    });
  }
  openTerminalModal(e) {
    //this function for user open the terminal modal
    e.stopPropagation();
    this.setState({
      TerminalLayoutModal: true
    });
  }
  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, serviceName, selectTab } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (serviceDetailmodalShow) {
      loadData(nextProps)
      if (serviceName === this.props.serviceName && (!selectTab)) {
        return
      }
      this.setState({
        activeTabKey: selectTab || DEFAULT_TAB
      })
    }
  }
  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    this.setState({
      activeTabKey
    })
  }
  restartService(service) {
    const { funcs } = this.props
    const self = this
    funcs.confirmRestartServices([service], {
      success: {
        func: () => {
          loadData(self.props)
          self.setState({
            activeTabKey: DEFAULT_TAB
          })
        },
        isAsync: true
      }
    })
  }

  stopService(service) {
    const { funcs } = this.props
    const self = this
    funcs.confirmStopServices([service], {
      success: {
        func: () => {
          loadData(self.props)
          self.setState({
            activeTabKey: DEFAULT_TAB
          })
        },
        isAsync: true
      }
    })
  }

  delteService(service) {
    const { funcs } = this.props
    const self = this
    funcs.confirmDeleteServices([service])
  }

  render() {
    const parentScope = this
    const {
      scope,
      serviceDetailmodalShow,
      serviceDetail,
      isServiceDetailFetching,
      containers,
      isContainersFetching,
      appName,
    } = this.props
    const { activeTabKey } = this.state
    const service = scope.state.currentShowInstance
    const operaMenu = (<Menu>
      <Menu.Item key="0">
        <span onClick={() => this.restartService(service)}>重新部署</span>
      </Menu.Item>
      <Menu.Item key="1">
        <span onClick={() => this.stopService(service)}>停止</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span onClick={() => this.delteService(service)}>删除</span>
      </Menu.Item>
      <Menu.Item key="3">
        <Link to={`/app_manage/detail/${appName}#topology`} onClick={this.closeModal} >
          查看拓扑图
        </Link>
      </Menu.Item>
      <Menu.Item key="4">
        <Link to={`/app_manage/detail/${appName}#stack`} onClick={this.closeModal} >
          查看编排
        </Link>
      </Menu.Item>
    </Menu>);
    const svcDomain = parseServiceDomain(service)
    return (
      <div id="AppServiceDetail">
        <div className="titleBox">
          <Icon className="closeBtn" type="cross" onClick={this.closeModal} />
          {/*<i className="closeBtn fa fa-times" onClick={this.closeModal}></i>*/}
          <div className="imgBox">
            <img src="/img/test/github.jpg" />
          </div>
          <div className="infoBox">
            <p className="instanceName">
              {service.metadata.name}
            </p>
            <div className="leftBox">
              <span className="status">
                运行状态&nbsp;:&nbsp;
              <span className={service.status == "1" ? "normal" : "error"}>
                  {service.status == "1" ? "运行中" : "异常"}
                </span>
              </span>
              <br />
              <span>
                地址&nbsp;:&nbsp;
                {
                  svcDomain ?
                    (<a target="_blank" href={svcDomain}>{svcDomain}</a>) : (<span>-</span>)
                }
              </span>
              <br />
              <span>
                容器实例&nbsp;:&nbsp;{service.spec.replicas}/{service.spec.replicas}
              </span>
            </div>
            <div className="rightBox">
              <Button className="loginBtn" type="primary"
                onClick={this.openTerminalModal}>
                <svg className="terminal">
                  <use xlinkHref="#terminal" />
                </svg>
                登录终端
            </Button>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button type="ghost" size="large" className="ant-dropdown-link" href="#">
                  更多 <i className="fa fa-caret-down"></i>
                </Button>
              </Dropdown>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <Modal
          visible={this.state.TerminalLayoutModal}
          className='TerminalLayoutModal'
          transitionName='move-down'
          onCancel={this.closeTerminalLayoutModal}
          >
          <TerminalModal scope={parentScope} config={containers.length > 0 ? containers[0] : null} />
        </Modal>
        <div className="bottomBox">
          <div className="siderBox">
            <Tabs
              tabPosition="left"
              onTabClick={this.onTabClick}
              activeKey={activeTabKey}
              >
              <TabPane tab="容器实例" key="#containers">
                <ContainerList
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  containerList={containers}
                  loading={isContainersFetching}
                  />
              </TabPane>
              <TabPane tab="基础信息" key="#basic">
                <AppServiceDetailInfo
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab="配置组" key="#configgroup">
                <ComposeGroup
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceName={service.metadata.name}
                  service={serviceDetail}
                  cluster={service.cluster}
                  />
              </TabPane>
              <TabPane tab="绑定域名" key="#binddomain">
                <BindDomain
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  />
              </TabPane>
              <TabPane tab="端口" key="#ports">
                <PortDetail
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  container={containers[0]}
                  loading={isContainersFetching}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  />
              </TabPane>
              <TabPane tab="高可用" key="#livenessprobe">
                <AppUseful
                  service={serviceDetail}
                  loading={isServiceDetailFetching}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  />
              </TabPane>
              <TabPane tab="监控" key="#monitor">
                <div className="ServiceMonitor">
                  <ServiceMonitor
                    serviceName={service.metadata.name}
                    cluster={service.cluster} />
                </div>
              </TabPane>
              <TabPane tab="自动伸缩" key="#autoScale">
                <AppAutoScale
                  replicas={service.spec.replicas}
                  serviceName={service.metadata.name}
                  cluster={service.cluster} />
              </TabPane>
              <TabPane tab="日志" key="#logs">
                <AppServiceLog serviceName={service.metadata.name} cluster={service.cluster} />
              </TabPane>
              <TabPane tab="事件" key="#events">
                <AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} />
              </TabPane>
            </Tabs>
          </div>
          <div className="contentBox">
          </div>
        </div>
      </div>
    )
  }
}

AppServiceDetail.propTypes = {
  loadServiceDetail: PropTypes.func.isRequired,
  loadServiceContainerList: PropTypes.func.isRequired,
  service: PropTypes.object.isRequired,
  isServiceDetailFetching: PropTypes.bool.isRequired,
  containers: PropTypes.array.isRequired,
  isContainersFetching: PropTypes.bool.isRequired,
}

function mapStateToProps(state, props) {
  const { scope } = props
  const currentShowInstance = scope.state.currentShowInstance
  const { cluster, metadata } = currentShowInstance
  const serviceName = metadata ? metadata.name : ''
  const defaultService = {
    isFetching: false,
    cluster,
    serviceName,
    service: {}
  }
  const defaultServices = {
    isFetching: false,
    cluster,
    serviceName,
    containerList: []
  }
  const {
    serviceDetail,
    serviceContainers
  } = state.services

  let targetService
  if (serviceDetail[cluster] && serviceDetail[cluster][serviceName]) {
    targetService = serviceDetail[cluster][serviceName]
  }
  targetService = targetService || defaultService

  let targetContainers
  if (serviceContainers[cluster] && serviceContainers[cluster][serviceName]) {
    targetContainers = serviceContainers[cluster][serviceName]
  }
  targetContainers = targetContainers || defaultServices

  return {
    cluster,
    serviceName,
    serviceDetail: targetService.service,
    isServiceDetailFetching: targetService.isFetching,
    containers: targetContainers.containerList,
    isContainersFetching: targetContainers.isFetching,
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail,
  loadServiceContainerList,
})(AppServiceDetail)