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
import { Tabs, Checkbox, Dropdown, Button, Card, Menu, Icon, Popover, Tooltip } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerList from './AppContainerList'
import AppServiceDetailInfo from './AppServiceDetailInfo'
import AppServiceAssistSetting from './AppServiceAssistSetting'
import ComposeGroup from './ComposeGroup'
import BindDomain from './BindDomain'
import PortDetail from './PortDetail'
import AppUseful from './AppUseful'
import AppServiceLog from './AppServiceLog'
import AppServiceEvent from './AppServiceEvent'
import AppServiceRental from './AppServiceRental'
import AppSettingsHttps from './AppSettingsHttps'
import ServiceMonitor from './ServiceMonitor'
import AppAutoScale from './AppAutoScale'
import AlarmStrategy from '../../ManageMonitor/AlarmStrategy'
import { loadServiceDetail, loadServiceContainerList, loadK8sService } from '../../../actions/services'
import { addTerminal } from '../../../actions/terminal'
import CommmonStatus from '../../CommonStatus'
import './style/AppServiceDetail.less'
import { parseServiceDomain } from '../../parseDomain'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import { TENX_MARK, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../../constants'
import { addPodWatch, removePodWatch } from '../../../containers/App/status'
import TipSvcDomain from '../../TipSvcDomain'
import { getServiceStatusByContainers } from '../../../common/status_identify'
import { ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import { SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import Title from '../../Title'

const DEFAULT_TAB = '#containers'
const TabPane = Tabs.TabPane;

function terminalSelectedCheck(item, list) {
  //this function for check the container selected or not
  let existFlag = false;
  list.map((container) => {
    if (item.metadata.name == container.metadata.name) {
      existFlag = true;
    }
  });
  return existFlag;
}

class AppServiceDetail extends Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.restartService = this.restartService.bind(this)
    this.stopService = this.stopService.bind(this)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.onHttpsComponentSwitchChange = this.onHttpsComponentSwitchChange.bind(this)

    this.state = {
      activeTabKey: props.selectTab || DEFAULT_TAB,
      currentContainer: [],
      httpIcon: 'http',
    }
  }

  loadData(nextProps) {
    const self = this
    const {
      cluster,
      serviceName,
      loadServiceDetail,
      loadK8sService,
      loadServiceContainerList,
    } = nextProps || this.props
    const query = {}
    loadServiceDetail(cluster, serviceName)
    loadK8sService(cluster, serviceName, {
      success: {
        func: (result) => {
          const camelizedSvcName = camelize(serviceName)
          let httpIcon = 'http'
          if (result.data && result.data[camelizedSvcName] && result.data[camelizedSvcName].metadata
            && result.data[camelizedSvcName].metadata.annotations && result.data[camelizedSvcName].metadata.annotations[ANNOTATION_HTTPS] === 'true') {
            httpIcon = 'https'
          }
          this.setState({
            httpIcon,
          })
        },
        isAsync: true
      }
    })
    loadServiceContainerList(cluster, serviceName, null, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, self.props, result.data)
          // For fix issue #CRYSTAL-2079(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          clearInterval(this.upStatusInterval)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadServiceContainerList(cluster, serviceName, query)
          }, LOAD_STATUS_TIMEOUT)
          // Reload list each UPDATE_INTERVAL
          self.upStatusInterval = setInterval(() => {
            loadServiceContainerList(cluster, serviceName, query)
          }, UPDATE_INTERVAL)
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

  openTerminalModal(item) {
    const { cluster, addTerminal } = this.props
    addTerminal(cluster, item)
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, serviceName, selectTab } = nextProps
    const { scope } = this.props

    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (serviceDetailmodalShow) {
      scope.setState({
        donotUserCurrentShowInstance: false
      })
      this.loadData(nextProps)
      if (serviceName === this.props.serviceName && (!selectTab)) {
        return
      }
      this.setState({
        activeTabKey: selectTab || DEFAULT_TAB
      })
    } else {
      scope.setState({
        donotUserCurrentShowInstance: true
      })
      clearTimeout(this.loadStatusTimeout)
      clearInterval(this.upStatusInterval)
    }
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removePodWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  onTabClick(activeTabKey) {
    const {loginUser} = this.props
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    if ( loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT) {
      if(activeTabKey == '#binddomain' || activeTabKey == '#https') {
        return
      }
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
    // funcs.confirmDeleteServices([service])
    funcs.batchDeleteServices()
  }

  handleMenuDisabled(key) {
    const { scope } = this.props
    const service = scope.state.currentShowInstance
    //当点击停止的时候，只有status为Running的时候才可以点击
    //当点击重新部署的时候，只有status为Running的时候才可以点击
    //当状态为启动中的时候，只可进行删除操作
    if (service.status) {
      if (key === 'stop' && service.status.phase === 'Stopped') {
        return true
      } else if (key === 'restart' && service.status.phase !== 'Running') {
        return true
      }
    }
    return false
  }
  onHttpsComponentSwitchChange(status) {
    this.setState({
      httpIcon: status ? 'https' : 'http'
    })
  }
  render() {
    const parentScope = this
    const { loginUser } = this.props
    const {
      scope,
      serviceDetailmodalShow,
      serviceDetail,
      isServiceDetailFetching,
      containers,
      isContainersFetching,
      appName,
      currentCluster,
      bindingDomains,
      bindingIPs,
      k8sService,
    } = this.props
    const { activeTabKey, currentContainer } = this.state
    const httpsTabKey = '#https'
    const isKubeNode = (SERVICE_KUBE_NODE_PORT == loginUser.info.proxyType)

    let nocache = currentContainer.map((item) => {
      return item.metadata.name;
    })
    const service = scope.state.currentShowInstance || serviceDetail
    service.status = getServiceStatusByContainers(service, containers)
    const operaMenu = (<Menu>
      <Menu.Item key='restart' disabled={this.handleMenuDisabled('restart')}>
        <span onClick={() => this.restartService(service)}>重新部署</span>
      </Menu.Item>
      <Menu.Item key='stop' disabled={this.handleMenuDisabled('stop')}>
        <span onClick={() => this.stopService(service)}>停止</span>
      </Menu.Item>
      <Menu.Item key='delete'>
        <span onClick={() => this.delteService(service)}>删除</span>
      </Menu.Item>
    </Menu>);
    const svcDomain = parseServiceDomain(service, bindingDomains, bindingIPs)
    const { availableReplicas, replicas } = service.status
    let containerShow = containers.map((item, index) => {
      return (
        <div key={`Popoverkey-`+index} className={terminalSelectedCheck(item, parentScope.state.currentContainer) ? 'containerTerminalDetailSelected containerTerminalDetail' : 'containerTerminalDetail'}
          onClick={this.openTerminalModal.bind(parentScope, item)}>
          <span>{item.metadata.name}</span>
        </div>
      )
    })
    return (
      <div id='AppServiceDetail'>
        <div className='titleBox'>
          <Title title={`${appName} 服务详情页`} />
          <Icon className='closeBtn' type='cross' onClick={this.closeModal} />
          {/*<i className='closeBtn fa fa-times' onClick={this.closeModal}></i>*/}
          <div className='imgBox'>
            <svg>
              <use xlinkHref='#server' />
            </svg>
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {service.metadata.name}
            </p>
            <div className='leftBox appSvcDetailDomain'>
              <div>
                状态：
                <span style={{ position: 'relative', top: '-5px' }}>
                  <ServiceStatus
                    smart={true}
                    service={service} />
                </span>
              </div>
              <div className='address'>
                <span>地址：</span>
                <div className='addressRight'>
                  <TipSvcDomain svcDomain={svcDomain} parentNode='appSvcDetailDomain' icon={this.state.httpIcon}/>
                </div>
              </div>
              <div>
                容器实例：
                <span>
                  {availableReplicas}/{replicas}
                </span>
              </div>
            </div>
            <div className='rightBox'>
              <Popover content={containerShow} title='选择实例链接' trigger='click' getTooltipContainer={() => document.getElementById('AppServiceDetail')}>
                <Button className='loginBtn' type='primary' size='large'>
                  <svg className='terminal'>
                    <use xlinkHref='#terminal' />
                  </svg>
                  <span>登录终端</span>
                </Button>
              </Popover>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button type='ghost' size='large' className='ant-dropdown-link' href='#'>
                  服务相关 <i className='fa fa-caret-down'></i>
                </Button>
              </Dropdown>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left'
              onTabClick={this.onTabClick}
              activeKey={activeTabKey}
              >
              <TabPane tab='容器实例' key='#containers'>
                <ContainerList
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  containerList={containers}
                  loading={isContainersFetching}
                  />
              </TabPane>
              <TabPane tab='基础信息' key='#basic'>
                <AppServiceDetailInfo
                  cluster={service.cluster}
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab='辅助设置' key='#setting'>
                <AppServiceAssistSetting
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab='配置组' key='#configgroup'>
                <ComposeGroup
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceName={service.metadata.name}
                  service={serviceDetail}
                  cluster={service.cluster}
                  />
              </TabPane>
              <TabPane tab={<Tooltip placement="right" title={isKubeNode ? '当前代理不支持绑定域名':''}><span>绑定域名</span></Tooltip>} disabled={isKubeNode} key='#binddomain'>
                <BindDomain
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  activeKey={activeTabKey}
                  isCurrentTab={activeTabKey==='#binddomain'}
                  />
              </TabPane>
              <TabPane tab='端口' key='#ports'>
                <PortDetail
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  currentCluster={currentCluster}
                  container={containers[0]}
                  loading={isContainersFetching}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  loadData = {()=> this.loadData()}
                  isCurrentTab={activeTabKey==='#ports'}
                  />
              </TabPane>
              <TabPane tab={<Tooltip placement="right" title={isKubeNode ? '当前代理不支持设置 HTTPS': ''}><span>设置 HTTPS</span></Tooltip>} disabled={isKubeNode} key={httpsTabKey}>
                <AppSettingsHttps
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  container={containers[0]}
                  scope = {this}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  isCurrentTab={activeTabKey===httpsTabKey}
                  onSwitchChange={this.onHttpsComponentSwitchChange}
                  />
              </TabPane>
              <TabPane tab='高可用' key='#livenessprobe'>
                <AppUseful
                  service={serviceDetail}
                  loading={isServiceDetailFetching}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  />
              </TabPane>
              <TabPane tab='监控' key='#monitor'>
                <div className='ServiceMonitor'>
                  <ServiceMonitor
                    serviceName={service.metadata.name}
                    cluster={service.cluster} />
                </div>
              </TabPane>
              <TabPane tab='告警策略' key='#strategy'>
                <AlarmStrategy serviceName={service.metadata.name} cluster={service.cluster}/>
              </TabPane>
              <TabPane tab='自动伸缩' key='#autoScale'>
                <AppAutoScale
                  replicas={service.spec.replicas}
                  serviceName={service.metadata.name}
                  volumes={service.spec.template.spec.volumes}
                  cluster={service.cluster} />
              </TabPane>
              <TabPane tab='日志' key='#logs'>
                <AppServiceLog
                  activeKey={activeTabKey}
                  containers={containers}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow} />
              </TabPane>
              <TabPane tab='事件' key='#events'>
                <AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} type={'replicaset'} serviceDetailmodalShow={serviceDetailmodalShow}/>
              </TabPane>
              <TabPane tab='租赁信息' key='#rentalInfo'>
                <AppServiceRental serviceName={service.metadata.name} serviceDetail={[serviceDetail]} />
              </TabPane>
            </Tabs>
          </div>
          <div className='contentBox'>
          </div>
        </div>
      </div>
    )
  }
}

AppServiceDetail.propTypes = {
  loadServiceDetail: PropTypes.func.isRequired,
  loadServiceContainerList: PropTypes.func.isRequired,
  isServiceDetailFetching: PropTypes.bool.isRequired,
  // containers: PropTypes.array.isRequired,
  isContainersFetching: PropTypes.bool.isRequired,
}

function mapStateToProps(state, props) {
  const {scope} = props
  const {loginUser} = state.entities
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
    serviceContainers,
    k8sService,
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

  let k8sServiceData = {}
  const camelizedSvcName = camelize(serviceName)
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[camelizedSvcName]) {
    k8sServiceData = k8sService.data[camelizedSvcName]
  }

  return {
    loginUser: loginUser,
    cluster,
    statusWatchWs,
    currentCluster: state.entities.current.cluster,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    serviceName,
    serviceDetail: targetService.service,
    isServiceDetailFetching: targetService.isFetching,
    containers: targetContainers.containerList,
    isContainersFetching: targetContainers.isFetching,
    k8sService: k8sServiceData,
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail,
  loadServiceContainerList,
  loadK8sService,
  addTerminal,
})(AppServiceDetail)
