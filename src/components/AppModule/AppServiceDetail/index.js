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
import { Tabs, Checkbox, Dropdown, Button, Card, Menu, Icon, Popover, Tooltip, Modal,
  Form, Select, Row, Col } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import find from 'lodash/find'
import ContainerList from './AppContainerList'
import AppServiceDetailInfo from './AppServiceDetailInfo'
import AppServiceAssistSetting from './AppServiceAssistSetting'
import ComposeGroup from './ComposeGroup'
import SecurityGroupTab from '../../../../client/containers/SecurityGroup/AppDetailTab'
import BindDomain from './BindDomain'
import PortDetail from './PortDetail'
import AppUseful from './AppUseful'
import AppServiceLog from './AppServiceLog'
import AppServiceEvent from './AppServiceEvent'
import AppServiceRental from './AppServiceRental'
import AppSettingsHttps from './AppSettingsHttps'
import ServiceMonitor from './ServiceMonitor'
import AppAutoScale from './AppAutoScale'
import VisitType from './VisitType'
import AlarmStrategy from '../../ManageMonitor/AlarmStrategy'
import AppServerTag from './AppServerTag'
import { loadServiceDetail, loadServiceContainerList, loadK8sService, deleteServices,
  UpdateServiceAnnotation } from '../../../actions/services'
import { addTerminal } from '../../../actions/terminal'
import TenxIcon from '@tenx-ui/icon/es/_old'
import './style/AppServiceDetail.less'
import { parseServiceDomain } from '../../parseDomain'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import { LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../../constants'
import { addPodWatch, removePodWatch } from '../../../containers/App/status'
import TipSvcDomain from '../../TipSvcDomain'
import { getServiceStatusByContainers } from '../../../common/status_identify'
import { ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import { SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import Title from '../../Title'
import { SHOW_BILLING } from '../../../constants'
import { getServiceStatus } from '../../../common/status_identify'
import ServiceMeshSwitch from './ServiceMeshSwitch'
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import { GET_MONITOR_METRICS_FAILURE } from '../../../actions/manage_monitor';
import TenxTab from './FilterTabs';
import classNames from 'classnames';
import * as podAction from '../../../actions/app_manage'
import * as IPPoolAction from '../../../../client/actions/ipPool'
import { getDeepValue } from '../../../../client/util/util'
import isCidr from 'is-cidr'
import Notification from '../../../components/Notification'

const DEFAULT_TAB = '#containers'
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const notification = new Notification()
const formItemLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
  colon: false,
}

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
    this.loadServiceTagData = this.loadServiceTagData.bind(this)

    this.state = {
      activeTabKey: props.selectTab || DEFAULT_TAB,
      currentContainer: [],
      httpIcon: 'http',
      deleteModal: false,
      serviceTag: {},
      editorVisible: false,
      editorLoading: false,
      netSegment: undefined,
    }
  }

  loadServiceTagData() {
    const { cluster, serviceName, loadServiceDetail} = this.props
    loadServiceDetail(cluster, serviceName).then( res => {
      const data = res.response.result.data || {}
      const labels = data.spec.template.metadata.labels || {}
      this.setState({
        serviceTag: labels
      })
    })
  }
  loadData = (nextProps) => {
    const self = this
    const {
      cluster,
      serviceName,
      loadServiceDetail,
      loadK8sService,
      loadServiceContainerList,
      projectName
    } = nextProps || this.props
    const query = {}
    loadServiceDetail(cluster, serviceName).then( res => {
      const data = res.response.result.data || {}
      const labels = data.spec.template.metadata.labels || {}
      this.setState({
        serviceTag: labels
      })
    })
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
    // bpm 需要根据一个参数, 请求一个带query的容器列表接口
    const appCenterChoiceHidden = this.props.bpmShow
    const bpmQuery = appCenterChoiceHidden ? 'filter=label,system/appcenter-cluster' : null
    loadServiceContainerList(cluster, serviceName, { projectName }, bpmQuery, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, self.props, result.data)
          // For fix issue #CRYSTAL-2079(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          clearInterval(this.upStatusInterval)
          query.customizeOpts = {
            keepChecked: true
          }
          if (projectName) {
            query.projectName = projectName
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadServiceContainerList(cluster, serviceName, query, bpmQuery)
          }, LOAD_STATUS_TIMEOUT)
          // Reload list each UPDATE_INTERVAL
          self.upStatusInterval = setInterval(() => {
            loadServiceContainerList(cluster, serviceName, query, bpmQuery)
          }, UPDATE_INTERVAL)
        },
        isAsync: true
      }
    })
    this.loadIPPool()
  }
  loadIPPool = () => {
    const { getIPPoolList, getPodNetworkSegment, cluster } = this.props
    getIPPoolList(cluster, { version: 'v1' }, {
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取集群地址池列表失败')
          }
        },
      },
    })
    getPodNetworkSegment(cluster, {
      success: {
        func: res => {
          this.setState({
            netSegment: res.data, // 校验网段使用
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取集群地址池失败')
          }
        },
      },
    })
  }

  closeModal() {
    const { onClose } = this.props
    onClose()
  }

  openTerminalModal(item) {
    const { cluster, addTerminal } = this.props
    addTerminal(cluster, item)
  }

  componentDidMount() {
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

  startService(service) {
    const { funcs, scope} = this.props
    const _self = this
    funcs.batchStartService()
  }

  stopService(service) {
    const { funcs } = this.props
    const self = this
    funcs.batchStopService()
  }

  delteService() {
    this.setState({
      deleteModal: true
    })
  }
  cancelDeleteModal() {
    this.setState({
      deleteModal: false
    })
  }
  okDeleteModal() {
    const { deleteServices, scope, serviceDetail, loadServices } = this.props
    const service = scope.state.currentShowInstance || serviceDetail
     // fix LOT-275 此bug是在测试LOT-275时发现的,实际上与LOT-275无关 是个老bug
    deleteServices(service.cluster,{ services: [service.metadata.name]},{
      success:{
        func: (res) => {
          loadServices()
          this.setState({
            deleteModal: false
          })
          scope.setState({
            modalShow: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {

        },
        isAsync: true
      }
    })
  }
  handleMenuDisabled(key) {
    const { scope } = this.props
    const service = scope.state.currentShowInstance
    //当点击停止的时候，只有status为Running的时候才可以点击
    //当点击重新部署的时候，只有status不为Stopped的时候才可以点击
    //当状态为启动中的时候，只可进行删除操作
    const status = getServiceStatus(service)
    if (status) {
      if (key === 'stop' && (status.phase === 'Stopped' || status.phase === 'RollingUpdate')) {
        return true
      } else if (key === 'restart' && status.phase === 'Stopped') {
        return true
      } else if (key === 'restart' && (
        status.phase === 'RollingUpdate' || status.phase === 'ScrollRelease'
      )) {
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
  handleMenuItem = ({ key }, service) => {
    switch (key) {
      case 'restart':
        return this.restartService(service)
      case 'start':
        return this.startService(service)
      case 'stop':
        return  this.stopService(service)
      case 'delete':
        return this.delteService(service)
      default:
        return null
    }
  }
  toggleEditorLoading = () => {
    this.setState({
      editorLoading: !this.state.editorLoading,
    })
  }
  toggleEditorVisible = () => {
    const { editorVisible } = this.state
    this.setState({
      editorVisible: !editorVisible,
    })
    !editorVisible && this.props.form.setFieldsValue({
      ipPool: this.currentIPPool(),
    })
  }
  editorIPPool = () => {
    const { UpdateServiceAnnotation, form, serviceName, serviceDetail, cluster } = this.props
    form.validateFields((err, values) => {
      if (err) return
      const annotations = getDeepValue(serviceDetail, [ 'spec', 'template', 'metadata', 'annotations' ]) || {}
      const isFixed = annotations.hasOwnProperty('cni.projectcalico.org/ipAddrs')
      if (isFixed) return notification.warn('服务已固定IP，不可修改地址池', '请先释放固定 IP')
      const newIsV4 = isCidr.v4(values.ipPool)
      const newISV6 = isCidr.v6(values.ipPool)
      const oldIsV4 = annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')
      const oldIsV6 = annotations.hasOwnProperty('cni.projectcalico.org/ipv6pools')
        // 新的pool是 v4 / 新旧pool都是v4
      if (newIsV4 && oldIsV4 || newIsV4 && !oldIsV4 && !oldIsV6) {
        Object.assign(annotations, {
          'cni.projectcalico.org/ipv4pools': `[\"${values.ipPool}\"]`,
        })
      } else if (newIsV4 && oldIsV6) {
        // 新的pool是 v4 / 旧pool都是v6
        Object.assign(annotations, {
          'cni.projectcalico.org/ipv4pools': `[\"${values.ipPool}\"]`,
          'cni.projectcalico.org/ipv6pools': '',
        })
      } else if (newISV6 && oldIsV6 || newISV6 && !oldIsV4 && !oldIsV6) {
        // 新的pool是 v6 / 新旧pool都是v6
        Object.assign(annotations, {
          'cni.projectcalico.org/ipv6pools': `[\"${values.ipPool}\"]`,
        })
      } else if (newISV6 && oldIsV4) {
        // 新的pool是 v6 / 旧pool都是v4
        Object.assign(annotations, {
          'cni.projectcalico.org/ipv4pools': '',
          'cni.projectcalico.org/ipv6pools': `[\"${values.ipPool}\"]`,
        })
      }
      this.toggleEditorLoading()
      notification.spin('修改中...')
      UpdateServiceAnnotation(cluster, serviceName, annotations, {
        success: {
          func: () => {
            notification.close()
            notification.success('地址池修改成功')
            const { onChangeVisible, onHandleCanleIp } = this.props
            this.toggleEditorLoading()
            this.toggleEditorVisible()
            this.loadData()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            notification.close()
            this.toggleEditorLoading()
            const { statusCode } = error
            if (statusCode !== 403) {
              notification.warn('地址池修改失败')
            }
          },
        },
      })
    })
  }
  currentIPPool = () => {
    const { netSegment } = this.state
    let ipPool = netSegment
    const annotations = getDeepValue(this.props.serviceDetail, [ 'spec', 'template', 'metadata', 'annotations' ]) || {}
    if (annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')
      && annotations['cni.projectcalico.org/ipv4pools']) {
      ipPool = JSON.parse(annotations['cni.projectcalico.org/ipv4pools'])[0]
    }
    if (annotations.hasOwnProperty('cni.projectcalico.org/ipv6pools')
      && annotations['cni.projectcalico.org/ipv6pools']) {
      ipPool = JSON.parse(annotations['cni.projectcalico.org/ipv6pools'])[0]
    }
    return ipPool
  }
  render() {
    const { formatMessage } = this.props.intl
    const parentScope = this
    const { loginUser, serviceList, shiningFlag } = this.props
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
      ipPoolList,
      form,
    } = this.props
    const { getFieldProps } = form
    const { bindingPort, https } = serviceDetail
    const bindHttpsStatus = {
      bindingPort,
      https,
    }
    const { activeTabKey, currentContainer, deleteModal,
      editorLoading, editorVisible, netSegment } = this.state
    const httpsTabKey = '#https'
    const isKubeNode = (SERVICE_KUBE_NODE_PORT == loginUser.info.proxyType)
    const shinningWraper = classNames({
      'shinningWraper': true,
      'shinning': shiningFlag, // 可变的
    });
    const shinningInner = classNames({
      'shinningInner': true,
      'shinning': shiningFlag, // 可变的
    })
    let nocache = currentContainer.map((item) => {
      return item.metadata.name;
    })
    const service = scope.state.currentShowInstance || serviceDetail
    let statusService = service
    service.status = getServiceStatusByContainers(service, containers)
    if(serviceList) {
      let tmp = find(serviceList, item => item.metadata.name === service.metadata.name)
      if(tmp) {
        statusService = tmp
      }
    }
    const { billingConfig } = loginUser.info
    const { enabled: billingEnabled } = billingConfig
    const isStoped = getServiceStatus(service)
      && getServiceStatus(service).phase === 'Stopped'
      || false
    const operaMenu = (
    <Menu onClick={key => this.handleMenuItem(key, service)}>
      <Menu.Item key='restart' disabled={this.handleMenuDisabled('restart')}  className={shinningInner}>
        <TenxTooltip title={`服务网格配置已更改, 重新部署后生效`} disabled={!shiningFlag}>
          <span>{formatMessage(AppServiceDetailIntl.redeploy)}</span>
        </TenxTooltip>
      </Menu.Item>
      <Menu.Item key='start' disabled={!isStoped}>
        <span>{formatMessage(ServiceCommonIntl.start)} </span>
      </Menu.Item>
      <Menu.Item key='stop' disabled={this.handleMenuDisabled('stop')}>
        <span>{formatMessage(ServiceCommonIntl.stop)}</span>
      </Menu.Item>
      <Menu.Item key='delete'>
        <span>{formatMessage(ServiceCommonIntl.delete)}</span>
      </Menu.Item>
    </Menu>
    );
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
      let onTerminal = containers.map((item, index) => {
        return (
          <Button className='loginBtn' type='primary' size='large' key={index} onClick={this.openTerminalModal.bind('', item)}>
            <TenxIcon type="terminal"/>
            <span>{formatMessage(AppServiceDetailIntl.loginTerminal)}</span>
          </Button>
          )
      })
    return (
      <div id='AppServiceDetail'>
        <Modal title={formatMessage(AppServiceDetailIntl.deleteOperation)} visible={deleteModal}
          onCancel={()=>this.cancelDeleteModal()}
          onOk={()=>this.okDeleteModal()}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {formatMessage(AppServiceDetailIntl.deleteServiceinfo, { serviceName: service.metadata.name })}
          </div>
        </Modal>
        <Modal
          title={'修改地址池'}
          visible={editorVisible}
          onOk={this.editorIPPool}
          onCancel={this.toggleEditorVisible}
          confirmLoading={editorLoading}
        >
          <div>
            <div className="alertRow">
              修改地址池后，容器将会重启，请确认是否继续修改
            </div>
            <FormItem
              label={'地址池'}
              {...formItemLayout}
            >
              <Select
                size="large"
                placeholder={'请选择地址池'}
                showSearch
                optionFilterProp="children"
                style={{ width: 280 }}
                {...getFieldProps('ipPool', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请选择地址池'}],
                })}
              >
                {ipPoolList.map((k,ind) => <Select.Option key={k.cidr}>{k.cidr}</Select.Option>)}
              </Select>
            </FormItem>
          </div>
        </Modal>
        <div className='titleBox'>
          <Title title={`${service.metadata.name} ${formatMessage(AppServiceDetailIntl.serviceDetailPage)}`} />
          <Icon className='closeBtn' type='cross' onClick={this.closeModal} />
          {/*<i className='closeBtn fa fa-times' onClick={this.closeModal}></i>*/}
          <div className='imgBox'>
            <TenxIcon type="gear" size={80}/>
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {service.metadata.name}
            </p>
            <div className='leftBox appSvcDetailDomain'>
              <div>
                <div>
                  {formatMessage(AppServiceDetailIntl.status)}：
                  <span style={{ position: 'relative' }}>
                    <ServiceStatus
                      smart={true}
                      service={statusService} />
                  </span>
                </div>
                <div className='address'>
                  <span>{formatMessage(AppServiceDetailIntl.address)}：</span>
                  <div className='addressRight'>
                    <TipSvcDomain
                    svcDomain={svcDomain}
                    parentNode='appSvcDetailDomain'
                    icon={this.state.httpIcon}
                    serviceMeshflagListInfo={this.props.mesh}
                    msaUrl={this.props.msaUrl}
                    serviceName={service.metadata.name}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div>
                  {formatMessage(AppServiceDetailIntl.containerObject)}：
                  <span>
                    {availableReplicas}/{replicas}
                  </span>
                </div>
                <div>
                  地址池：
                  <span>
                    {this.currentIPPool()}
                  </span>
                  <span className="editor" onClick={this.toggleEditorVisible}>修改</span>
                </div>
              </div>
            </div>
            <div className='rightBox'>
              {
                containerShow.length > 1 ?
                  <Popover content={containerShow} title={formatMessage(AppServiceDetailIntl.selectInstance)} trigger='click' getTooltipContainer={() => document.getElementById('AppServiceDetail')}>
                    <Button className='loginBtn' type='primary' size='large'>
                      <TenxIcon type="terminal"/>
                      <span>{formatMessage(AppServiceDetailIntl.loginTerminal)}</span>
                    </Button>
                  </Popover>
                  :
                  onTerminal
              }
              <span className={shinningWraper}>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button type='ghost' size='large' className='ant-dropdown-link' href='#'>
                  {formatMessage(AppServiceDetailIntl.serviceAbout)} <i className='fa fa-caret-down'></i>
                </Button>
              </Dropdown>
              </span>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          <div className='siderBox'>
            <TenxTab
              tabPosition='left'
              onTabClick={this.onTabClick}
              activeKey={activeTabKey}
              bpmShow = {this.props.bpmShow}
              filterKey = {['#containers', '#basic', '#monitor', '#logs', '#events', '#ports' ]}
              >
              <TabPane tab={formatMessage(AppServiceDetailIntl.containerObject)} key='#containers'>
                {
                  activeTabKey === '#containers' ?
                    <ContainerList
                      serviceName={service.metadata.name}
                      serviceDetail={serviceDetail}
                      cluster={service.cluster}
                      containerList={containers}
                      loading={isContainersFetching}
                      onTabClick={this.onTabClick}
                      loadServiceContainerList={this.props.loadServiceContainerList}
                    />
                    :
                    null
                }
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.basicsMessage)} key='#basic'>
                <AppServiceDetailInfo
                  cluster={service.cluster}
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching}
                  activeTabKey={activeTabKey}
                  serviceName={this.props.serviceName}
                  loadServiceDetail={this.props.loadServiceDetail}
                  containerList={containers}
                  volumes={service.spec.template.spec.volumes}
                  modalShow={this.props.serviceDetailmodalShow}
                  page={this.props.page}
                  size={this.props.size}
                  name={this.props.name}
                />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.serviceMeshSwitch)} key="#serviceMeshSwitch"
              className='zhangtao'>
              <ServiceMeshSwitch serviceName={service.metadata.name} activeKey={activeTabKey}
                  // istioFlag={service.metadata.annotations["sidecar.istio.io/inject"]}
                  />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.assistSet)} key='#setting'>
                <AppServiceAssistSetting
                  serviceDetail={serviceDetail}
                  loading={isServiceDetailFetching} />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.configGroup)} key='#configgroup'>
                <ComposeGroup
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceName={service.metadata.name}
                  service={serviceDetail}
                  cluster={service.cluster}
                  />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.fireWall)} key='#securitygroup'>
                <SecurityGroupTab />
              </TabPane>
              <TabPane tab={
                  <Tooltip placement="right" title={isKubeNode ? formatMessage(AppServiceDetailIntl.unsupportbindDomain):''}>
                    <span>{formatMessage(AllServiceListIntl.bundDomin)}</span>
                  </Tooltip>
                }
                disabled={isKubeNode} key='#binddomain'>
                <BindDomain
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  activeKey={activeTabKey}
                  isCurrentTab={activeTabKey==='#binddomain'}
                  />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.visitStyle)} key='#visitType'>
                { activeTabKey==='#visitType' && <VisitType
                  cluster={service.cluster}
                  serviceName={service.metadata.name}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  service={serviceDetail}
                  activeKey={activeTabKey}
                  isCurrentTab={activeTabKey==='#visitType'}
                />}
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.port)} key='#ports'>
                <PortDetail
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  currentCluster={currentCluster}
                  container={containers[0]}
                  loading={isContainersFetching}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  loadData = {()=> this.loadData()}
                  isCurrentTab={activeTabKey==='#ports'}
                  bindHttpsStatus={bindHttpsStatus}
                  />
              </TabPane>
              <TabPane tab={<Tooltip placement="right"
              title={isKubeNode ? formatMessage(AppServiceDetailIntl.currentProxynosupportHTTPS): ''}>
              <span>{formatMessage(AppServiceDetailIntl.setHTTPS)}</span></Tooltip>} disabled={isKubeNode} key={httpsTabKey}>
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
              <TabPane tab={formatMessage(AppServiceDetailIntl.livenessprobe)} key='#livenessprobe'>
                <AppUseful
                  service={serviceDetail}
                  loading={isServiceDetailFetching}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.monitor)} key='#monitor'>
                <div className='ServiceMonitor'>
                  {
                    serviceDetailmodalShow &&
                    <ServiceMonitor
                      serviceName={service.metadata.name}
                      cluster={service.cluster} />
                  }
                </div>
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.strategy)} key='#strategy'>
                <AlarmStrategy
                  createBy={'service'}
                  serviceName={service.metadata.name}
                  currentService={service}
                  cluster={service.cluster}
                  isCurrentTab={activeTabKey === '#strategy'}
                />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.autoScale)} key='#autoScale'>
                <AppAutoScale
                  replicas={service.spec.replicas}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceName={service.metadata.name}
                  volumes={service.volumeTypeList}
                  isCurrentTab={activeTabKey==='#autoScale'}
                  cluster={service.cluster} />
              </TabPane>
              <TabPane tab={formatMessage(AppServiceDetailIntl.logs)} key='#logs'>
                <AppServiceLog
                  activeKey={activeTabKey}
                  containers={containers}
                  serviceName={service.metadata.name}
                  cluster={service.cluster}
                  serviceDetailmodalShow={serviceDetailmodalShow}
                  serviceDetail={serviceDetail}
                  bpmShow = {this.props.bpmShow}
                relative/>
              </TabPane>
              {billingEnabled ?
              [<TabPane tab={formatMessage(AppServiceDetailIntl.events)} key='#events'>
                <AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} type={'replicaset'} serviceDetailmodalShow={serviceDetailmodalShow}/>
              </TabPane>,
              <TabPane tab={formatMessage(AppServiceDetailIntl.rentalInfo)} key='#rentalInfo'>
                <AppServiceRental serviceName={service.metadata.name} serviceDetail={[serviceDetail]} />
              </TabPane>]
              :
              <TabPane tab={formatMessage(AppServiceDetailIntl.events)} key='#events'>
                <AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} type={'replicaset'} serviceDetailmodalShow={serviceDetailmodalShow}/>
              </TabPane>
              }
              <TabPane tab={formatMessage(AppServiceDetailIntl.serverTag)} key='#serverTag'>
                <AppServerTag
                  // activeKey={activeTabKey}
                  // containers={containers}
                  serviceName={service.metadata.name}
                  serviceTag={this.state.serviceTag}
                  loadDataAllData = { this.loadServiceTagData }
                  clusterID={service.cluster}
                  // serviceDetailmodalShow={serviceDetailmodalShow}
                  // serviceDetail={serviceDetail}
                  serviceName={this.props.serviceName}
                relative/>
              </TabPane>
            </TenxTab>
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
  const  cluster = currentShowInstance && currentShowInstance.cluster
  const  metadata  = currentShowInstance && currentShowInstance.metadata
  const serviceName = metadata ? metadata.name : ''
  const { projectName } = state.entities.current.space
  const {rebootShining: { shiningFlag = false } = {}} = state.serviceMesh
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
  const { services } = state.services.serviceList
  const ipPoolList = getDeepValue(state, [ 'ipPool', 'getIPPoolList', 'data' ]) || []
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
    serviceList: services || [],
    projectName,
    shiningFlag,
    ipPoolList,
  }
}
export default injectIntl(connect(mapStateToProps, {
  loadServiceDetail,
  loadServiceContainerList,
  loadK8sService,
  addTerminal,
  deleteServices,
  UpdateServiceAnnotation,
  getIPPoolList: IPPoolAction.getIPPoolList,
  getPodNetworkSegment: podAction.getPodNetworkSegment,
})(Form.create()(AppServiceDetail)), { withRef: true, })

// Tenx Tooltip
// 通过一个外部变量控制是否渲染tooltip
function TenxTooltip(
  {
    disabled = false,
    title,
    children
  }
) {
  return (
    <div>
      {
        disabled ? children:
        <Tooltip title={title}>
          {children}
        </Tooltip>
      }
    </div>
  )
}
