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
import { parseServiceDomain } from '../../parseDomain'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import { TENX_MARK } from '../../../constants'
import { addPodWatch, removePodWatch } from '../../../containers/App/status'
import TipSvcDomain from '../../TipSvcDomain'

const DEFAULT_TAB = '#containers'
const TabPane = Tabs.TabPane;

/*function loadData(props) {
  const { cluster, serviceName, loadServiceDetail, loadServiceContainerList } = props
  document.title = `${serviceName} 服务详情页 | 时速云`
  loadServiceDetail(cluster, serviceName)
  loadServiceContainerList(cluster, serviceName)
}*/

class AppServiceDetail extends Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.restartService = this.restartService.bind(this)
    this.stopService = this.stopService.bind(this)
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.handleMenuShow = this.handleMenuShow.bind(this)
    this.state = {
      activeTabKey: props.selectTab || DEFAULT_TAB,
      TerminalLayoutModal: false,
    }
  }

  loadData(nextProps) {
    const self = this
    const {
      cluster,
      serviceName,
      loadServiceDetail,
      loadServiceContainerList
    } = nextProps || this.props
    document.title = `${serviceName} 服务详情页 | 时速云`
    loadServiceDetail(cluster, serviceName)
    loadServiceContainerList(cluster, serviceName, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, self.props, result.data)
        },
        isAsync: true
      }
    })
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
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, serviceName, selectTab } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (serviceDetailmodalShow) {
      this.loadData(nextProps)
      if (serviceName === this.props.serviceName && (!selectTab)) {
        return
      }
      this.setState({
        activeTabKey: selectTab || DEFAULT_TAB
      })
    }
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removePodWatch(cluster, statusWatchWs)
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
    const { funcs, scope} = this.props
    const _self = this
    funcs.batchRestartService()
  }

  stopService(service) {
    const { funcs } = this.props
    const self = this
    funcs.batchStopService()
  }

  delteService(service) {
    const { funcs } = this.props
    const self = this
    funcs.confirmDeleteServices([service])
  }
  handleMenuShow(){
    const { scope } = this.props
    const service = scope.state.currentShowInstance
    if(service.status){
      if(service.status.phase === 'Stopped'){
        return true
      }
    }
    return false
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
      <Menu.Item key="0" disabled={this.handleMenuShow()}>
        <span onClick={() => this.restartService(service)}>重新部署</span>
      </Menu.Item>
      <Menu.Item key="1" disabled={this.handleMenuShow()}>
        <span onClick={() => this.stopService(service)}>停止</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span onClick={() => this.delteService(service)}>删除</span>
      </Menu.Item>
    </Menu>);
    const svcDomain = parseServiceDomain(service, this.props.bindingDomains)
    let availableReplicas = 0
    if (service) {
      if (service.status) {
        availableReplicas = service.status.availableReplicas || 0
      }
    }
    return (
      <div id="AppServiceDetail">
        <div className="titleBox">
          <Icon className="closeBtn" type="cross" onClick={this.closeModal} />
          {/*<i className="closeBtn fa fa-times" onClick={this.closeModal}></i>*/}
          <div className="imgBox">
            <img src="/img/default.png" />
          </div>
          <div className="infoBox">
            <p className="instanceName">
              {service.metadata.name}
            </p>
            <div className="leftBox">
              <div>
                运行状态&nbsp;:&nbsp;
                <span style={{position:'relative',top:'-5px'}}>
                  <ServiceStatus
                    smart={true}
                    service={service} />
                </span>
              </div>
              <div>
                地址&nbsp;:&nbsp;
                <div style={{display: 'inline-block'}}>
                  <TipSvcDomain svcDomain={svcDomain}/>
                </div>
              </div>
              <div>
                容器实例&nbsp;:&nbsp;
                <span>
                  {availableReplicas}
                  /
                  {service.spec.replicas || service.metadata.annotations[`${TENX_MARK}/replicas`]}
                </span>
              </div>
            </div>
            <div className="rightBox">
              <Button className="loginBtn" type="primary" size="large"
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
          <TerminalModal scope={parentScope} config={containers.length > 0 ? containers[0] : null} show={this.state.TerminalLayoutModal} />
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
                <AppServiceLog serviceName={service.metadata.name} cluster={service.cluster} serviceDetailmodalShow={serviceDetailmodalShow} />
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
  const {scope} = props
  const {statusWatchWs} = state.entities.sockets
  const currentShowInstance = scope.state.currentShowInstance
  const {cluster, metadata } = currentShowInstance
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
    statusWatchWs,
    bindingDomains: state.entities.current.cluster.bindingDomains,
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