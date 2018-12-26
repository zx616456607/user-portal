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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import intlMsg from './AppServiceListIntl'
import ServiceCommonIntl, { AllServiceListIntl } from './ServiceIntl'
import { Modal, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination, Alert,
  notification,
  message} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AppServiceList.less'
import { calcuDate } from '../../common/tools'
import {
  loadServiceList,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAutoScale
} from '../../actions/services'
import { removeTerminal } from '../../actions/terminal'
import { getDeploymentOrAppCDRule } from '../../actions/cicd_flow'
import { LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../constants'
import {ANNOTATION_HTTPS, DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE} from '../../../constants'
import { browserHistory } from 'react-router'
import RollingUpdateModal from './AppServiceDetail/RollingUpdateModal'
import GrayscaleUpgradeModal from './AppServiceDetail/GrayscaleUpgradeModal'
import ConfigModal from './AppServiceDetail/ConfigModal'
import ManualScaleModal from './AppServiceDetail/ManualScaleModal'
import { parseServiceDomain } from '../parseDomain'
import ServiceStatus from '../TenxStatus/ServiceStatus'
import TipSvcDomain from '../TipSvcDomain'
import yaml from 'js-yaml'
import { addDeploymentWatch, removeDeploymentWatch } from '../../containers/App/status'
import StateBtnModal from '../StateBtnModal'
import errorHandler from '../../containers/App/error_handler'
import NotificationHandler from '../../components/Notification'
import { SERVICE_KUBE_NODE_PORT } from '../../../constants'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'
import { isResourcePermissionError } from '../../common/tools'
import isEmpty from "lodash/isEmpty";
import meshIcon from '../../assets/img/meshIcon.svg'
import {camelize} from "humps";
import * as meshActions from '../../actions/serviceMesh'
import { getDeepValue } from '../../../client/util/util';
import TenxIcon from '@tenx-ui/icon/es/_old'
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const confirm = Modal.confirm
const MyComponent = React.createClass({
  propTypes: {
    serviceList: React.PropTypes.array
  },
  onchange: function (e) {
    const { value, checked } = e.target
    const { scope } = this.props
    const { serviceList } = scope.state
    const checkedList = serviceList.filter((service) => service.checked)
    serviceList.map((service) => {
      if (service.metadata.name === value) {
        service.checked = checked
      }
    })
    if (checkedList.length === 0) {
      scope.setState({
        runBtn: false,
        stopBtn: false,
        restartBtn: false
      })
      return
    }
    if (checkedList.length === 1) {
      if (checkedList[0].status.phase === 'Running') {
        scope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
      }
      if (checkedList[0].status.phase === 'Stopped') {
        scope.setState({
          runBtn: true,
          stopBtn: false,
          restartBtn: false,
        })
      }
      if (checkedList[0].status.phase === 'Pending' || checkedList[0].status.phase === 'Starting' || checkedList[0].status.phase === 'Deploying') {
        scope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
      }
      if (checkedList[0].status.phase === 'RollingUpdate' || checkedList[0].status.phase === 'ScrollRelease') {
        scope.setState({
          restartBtn: false,
        })
      }
    } else if (checkedList.length > 1) {
      let runCount = 0
      let stopCount = 0
      let pending = 0
      let rollingUpdateCount = 0
      checkedList.forEach((item, index) => {
        if (item.status.phase === 'Running') {
          runCount++
        } else if (item.status.phase === 'Pending' || item.status.phase === 'Starting' || item.status.phase === 'Deploying') {
          pending++
        } else if (item.status.phase === 'RollingUpdate' || item.status.phase === 'ScrollRelease') {
          rollingUpdateCount++
        } else {
          stopCount++
        }
      })
      if (runCount + pending === checkedList.length) {
        scope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
        if (pending) {
          scope.setState({
            restartBtn: true
          })
        }
        return
      }
      if (stopCount === checkedList.length) {
        scope.setState({
          runBtn: true,
          stopBtn: false,
          restartBtn: false,
        })
        return
      }
      scope.setState({
        runBtn: true,
        stopBtn: true,
        restartBtn: true,
      })
      return
    }
    scope.setState({
      serviceList
    })
  },
  selectServiceByLine: function (e, item) {
    let stopPro = e._dispatchInstances;
    if (stopPro.length != 2) {
      const { scope } = this.props
      scope.setState({
        donotUserCurrentShowInstance: true
      })
      const { serviceList } = scope.state
      serviceList.map((service) => {
        if (service.metadata.name === item.metadata.name) {
          service.checked = !service.checked
        }
      })
      handleStateOfServiceList(scope, serviceList)
      scope.setState({
        serviceList
      })
    }
  },
  modalShow: function (item) {
    // e.stopPropagation()
    const { scope } = this.props;
    scope.setState({
      selectTab: null,
      modalShow: true,
      currentShowInstance: item
    });
  },
  onShowSizeChange: function (page, size) {
    if (size === this.props.size) {
      return
    }
    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
    }
    if (size !== DEFAULT_PAGE_SIZE) {
      query.size = size
    }
    const { name } = this.props
    if (name) {
      query.name = name
    }
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      query
    })
  },
  serviceOperaClick(item, e) {
    const { scope } = this.props
    const { serviceList } = scope.state
    if(e.key == 'start' || e.key == 'stop' || e.key == 'restart' || e.key == 'batchRestartService' || e.key == 'delete'){
      serviceList.map((service) => {
        if (service.metadata.name === item.metadata.name) {
          service.checked = true
        } else {
          service.checked = false
        }
      })
    } else {
      scope.setState({
        currentShowInstance: item,
        donotUserCurrentShowInstance: false
      })
    }
    switch (e.key) {
      case 'start':
        return scope.batchStartService()
      case 'stop':
        return scope.batchStopService()
      case 'restart':
        return scope.batchQuickRestartService()
      case 'batchRestartService':
        return scope.batchRestartService()
      case 'delete':
        return scope.batchDeleteServices()
      case 'rollingUpdate':
        return this.showRollingUpdateModal()
      case 'grayscaleUpgrade':
        return this.showGrayscaleUpgradeModal()
      // 扩展
      case 'manualScale':
        return this.showManualScaleModal(item)
      case 'autoScale':
        return this.showServiceDetail('autoScale')
      // 变更设置
      case 'config':
        return this.showConfigModal()
      case 'basic':
        return this.showServiceDetail('basic')
      case 'ports':
        return this.showServiceDetail('ports')
      case 'livenessprobe':
        return this.showServiceDetail('livenessprobe')
      // 更多设置
      case 'binddomain':
        return this.showServiceDetail('binddomain')
      case 'https':
        return this.showServiceDetail('https')
      case 'serverTag':
        return this.showServiceDetail('serverTag')
    }
  },
  showRollingUpdateModal() {
    const { scope } = this.props
    scope.setState({
      rollingUpdateModalShow: true
    })
  },
  showGrayscaleUpgradeModal() {
    const { scope } = this.props
    scope.setState({
      grayscaleUpgradeModalVisible: true
    })
  },
  showConfigModal() {
    const { scope } = this.props
    scope.setState({
      configModal: true
    })
  },
  showManualScaleModal(item) {
    const { scope, cluster } = this.props
    scope.props.loadAutoScale(cluster, item.metadata.name, {
      success: {
        func: (result) => {
          if (result.data) {
            if (Object.getOwnPropertyNames(result.data).length > 0) {
              // Check if autoscaling is disabled
              if (result.data.spec.scaleTargetRef && result.data.spec.scaleTargetRef.name === item.metadata.name) {
                scope.setState({
                  disableScale: true
                })
              }
              return
            }
          }
          scope.setState({
            disableScale: false
          })
        }
      }
    })
    scope.setState({
      manualScaleModalShow: true
    })
  },
  showServiceDetail(item){
    const { scope } = this.props
    let tabKeys = '#' + item
    scope.setState({
      selectTab: tabKeys,
      modalShow: true,
    })
  },
  renderGroupIcon(group){
    const { intl: { formatMessage } } = this.props
    if(!group || !group.id || group.type == 'none'){
      return <span></span>
    }
    if(group.id == "mismatch"){
      return <Tooltip title={formatMessage(AllServiceListIntl.netPortDelete)}>
        <span className='standrand netcolor'>{formatMessage(AllServiceListIntl.net)}</span>
      </Tooltip>

    }
    switch(group.type){
      case 'private':
        return <Tooltip title={formatMessage(AllServiceListIntl.serviceInnerNet)}>
          <span className='standrand privateColor'>{formatMessage(AllServiceListIntl.inner)}</span>
        </Tooltip>
      case 'public':
        return <Tooltip title={formatMessage(AllServiceListIntl.servicePublicNet)}>
          <span className='standrand publicColor'>{formatMessage(AllServiceListIntl.public)}</span>
        </Tooltip>
      default:
        return <span></span>
    }
  },
  renderLBIcon() {
    const { intl: { formatMessage } } = this.props
    return (
      <Tooltip title={formatMessage(AllServiceListIntl.serviceloadBalance)}>
      <span className='standrand privateColor'>lb</span>
      </Tooltip>
    )
  },
  rendermeshIcon() {
    return (
      <span style={{ lineHeight: '16px' }}>
        <Tooltip title={this.props.intl.formatMessage(AllServiceListIntl.thisServiceOpenMesh)}>
        <img className="meshIcon"　src={meshIcon} alt=""/>
        </Tooltip>
      </span>
    )
  },
  renderOSIcon(os, arch) {
    let ele
    if (os === 'windows') {
      ele = <span className="osColor" style={{ lineHeight: '16px' }} >
        <Tooltip title="Windows">
          <TenxIcon
            type="windows"
            style={{ color: '#2db7f5', height: '16px', width: '16px' }}
            className="meshIcon"
          />
        </Tooltip>
      </span>
    } else if (os === 'linux') {
      if (arch === 'amd64') {
        ele = <span className="osColor" style={{ lineHeight: '16px' }} >
          <Tooltip title="Linux">
            <TenxIcon
              type="Linux"
              style={{ color: '#2db7f5', height: '16px', width: '16px' }}
              className="meshIcon"
            />
          </Tooltip>
        </span>
      } else if (arch === 'arm64') {
        ele = [
          <span className="osColor" style={{ lineHeight: '16px' }} >
            <Tooltip title="Linux">
              <TenxIcon
                type="Linux"
                style={{ color: '#2db7f5', height: '16px', width: '16px' }}
                className="meshIcon"
              />
            </Tooltip>
          </span>,
          <span className="osColor" style={{ lineHeight: '16px' }} >
            <Tooltip title="Arm">
              <TenxIcon
                type="Arm"
                style={{ color: '#2db7f5', height: '16px', width: '16px' }}
                className="meshIcon"
              />
            </Tooltip>
          </span>,
        ]
      }
    } else {
      ele = null
    }
    return ele
  },
  render: function () {
    const { formatMessage } = this.props.intl
    const { cluster, serviceList, loading, page, size, total, bindingDomains, bindingIPs, k8sServiceList, loginUser } = this.props
    const { mesh = []} = this.props
    if (loading) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    if (serviceList.length < 1) {
      return (
        <div className="loadingBox">
          <Icon type="frown"/>&nbsp;{formatMessage(AllServiceListIntl.noDate)}
        </div>
      )
    }
    const items = serviceList.map((item) => {
      item.cluster = cluster
      let redeployDisable = true
      if(item.status.phase == 'Running' || item.status.phase == 'Pending'){
        redeployDisable = false
      }

      const isRollingUpdate = item.status.phase == 'RollingUpdate'
      const titleText = (isRollingUpdate ? formatMessage(intlMsg.grayBackAct): formatMessage(intlMsg.rollUpdateAct)) || ''
      const isRollingUpdateOrScrollRelease = item.status.phase == 'RollingUpdate' || item.status.phase === 'ScrollRelease'
      const ipv4Str = getDeepValue(item, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      const ipv4 = ipv4Str && JSON.parse(ipv4Str)
      const isDisabled = ipv4 && ipv4.length <= item.spec.replicas || false
      const dropdown = (
        <Menu onClick={this.serviceOperaClick.bind(this, item)} style={{width:'100px'}} id="appservicelistDropdownMenu">
          {
            item.status.phase == "Stopped"
              ? <Menu.Item key="start">
                {formatMessage(ServiceCommonIntl.start)}
              </Menu.Item>
              : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            item.status.phase == "Running" || item.status.phase == 'Pending'
              ?<Menu.Item key="stop">
                {formatMessage(ServiceCommonIntl.stop)}
              </Menu.Item>
              : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            item.status.phase == "Running"
              ? <Menu.Item key="restart">
                {formatMessage(ServiceCommonIntl.reboot)}
              </Menu.Item>
              : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            redeployDisable
              ? <Menu.Item
                key="batchRestartService"
                disabled={isRollingUpdateOrScrollRelease}
                title={
                  isRollingUpdateOrScrollRelease && titleText
                }
              >
                {formatMessage(AllServiceListIntl.redeploy)}
              </Menu.Item>
              : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          <Menu.Item key="delete">
            {formatMessage(ServiceCommonIntl.delete)}
          </Menu.Item>
          <Menu.Divider key="baseline1" />
          <Menu.Item
            key="rollingUpdate"
            disabled={isDisabled}
          >
            {formatMessage(AllServiceListIntl.rollPublish)}
          </Menu.Item>
          <Menu.Item
            key="grayscaleUpgrade"
            disabled={isDisabled}
          >
            {formatMessage(AllServiceListIntl.grayPublish)}
          </Menu.Item>
          <SubMenu title={formatMessage(intlMsg.expand)}>
            <Menu.Item
              key="manualScale" style={{width:'102px'}}
              disabled={isRollingUpdateOrScrollRelease || isDisabled}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.standardExtend)}
            </Menu.Item>
            <Menu.Item
              key="autoScale" disabled={isRollingUpdateOrScrollRelease || isDisabled}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.autoScale)}
            </Menu.Item>
          </SubMenu>
          <SubMenu title={formatMessage(AllServiceListIntl.changeSet)}>
            <Menu.Item
              key="config" disabled={isRollingUpdateOrScrollRelease}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.changeConfig)}
            </Menu.Item>
            <Menu.Item
              key="basic" disabled={isRollingUpdateOrScrollRelease}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.changeEnv)}
            </Menu.Item>
            <Menu.Item
              key="ports" disabled={isRollingUpdateOrScrollRelease}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.changePort)}
            </Menu.Item>
            <Menu.Item
              key="livenessprobe" disabled={isRollingUpdateOrScrollRelease}
              title={
                isRollingUpdateOrScrollRelease && titleText
              }
            >
              {formatMessage(AllServiceListIntl.HightAvailable)}
            </Menu.Item>
          </SubMenu>
          <SubMenu title={formatMessage(AllServiceListIntl.moreSet)}>
            <Menu.Item key="binddomain" style={{width:'102px'}}>
              {formatMessage(AllServiceListIntl.bundDomin)}
            </Menu.Item>
            <Menu.Item key="https" disabled={loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT}>
              {formatMessage(AllServiceListIntl.setHTTPS)}
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="serverTag">
            {formatMessage(AllServiceListIntl.serviceTag)}
          </Menu.Item>
        </Menu>

      );
      let mirror = ''
      const images = item.spec.template.spec.containers.map(container => {
        return container.image
      })
      if (item.metadata.annotations && item.metadata.annotations['rollingupdate/target']) {
        const rollingupdateTarget = JSON.parse(item.metadata.annotations['rollingupdate/target'])
        mirror = rollingupdateTarget[0].from + '\n' + rollingupdateTarget[0].to
      }else {
        mirror = images.join(', ')? images.join(', ') : ''
      }
      let lb = false
      let k8sSer = ''
      if (k8sServiceList) {
        for (let k8sService of k8sServiceList) {
          if (k8sService && k8sService.metadata && item.metadata.name === k8sService.metadata.name) {

            const key = camelize('ingress-lb')
            if (
              k8sService.metadata.annotations &&
              k8sService.metadata.annotations[key] &&
              !isEmpty(k8sService.metadata.annotations[key])
            ) {
              let lbArr = JSON.parse(k8sService.metadata.annotations[key])
              if (!isEmpty(lbArr) && !isEmpty(lbArr[0].name)) {
                lb = true
                k8sSer = k8sService
              }
            }
            break
          }
        }
      }
      const svcDomain = parseServiceDomain(item, bindingDomains, bindingIPs, k8sSer)
      let volume = false
      if(
        item.spec
        && item.spec.template
        && item.spec.template.spec
        && item.spec.template.spec.volumes
      ){
        const volumes = item.spec.template.spec.volumes
        for(let i = 0; i < volumes.length; i++){
          if(
            volumes[i].persistentVolumeClaim
            || volumes[i].rbd
            || (volumes[i].hostPath && (volumes[i].hostPath.path !== '/etc/localtime' && volumes[i].hostPath.path !== '/etc/timezone'))
          ){
            volume = true
            break
          }
        }
      }
      let group = false
      if(item.lbgroup){
        if(item.lbgroup.id || (item.lbgroup.type && item.lbgroup.type !== 'none')){
          group = true
        }
      }
      let heightSize = '60px'
      let lineHeightSize = '60px'
      const meshflag =  (mesh.find(({name}) => name === item.metadata.name) || {} ).value
      const stackFlag = item.appStack
      if (volume || group || lb || meshflag || stackFlag){
        heightSize = '30px'
        lineHeightSize = '40px'
      }
      let os = 'linux', arch = 'amd64'
      if (item.spec.template.metadata.annotations && item.spec.template.metadata.annotations.imagetagOs) {
        os = item.spec.template.metadata.annotations.imagetagOs
      }
      if (item.spec.template.metadata.annotations && item.spec.template.metadata.annotations.imagetagArch) {
        arch = item.spec.template.metadata.annotations.imagetagArch
      }
      return (
        <div
          className={item.checked ? "selectedInstance instanceDetail" : "instanceDetail"}
          key={item.metadata.name}
          onClick={(e) => this.selectServiceByLine(e, item)} >
          <div className="selectIconTitle commonData">
            <Checkbox value={item.metadata.name} checked={item.checked} />
          </div>
          <div className="name commonData">
            <div className="viewBtn" onClick={() => this.modalShow(item)} style={{height: heightSize, lineHeight: lineHeightSize}}>
              {item.metadata.name}
            </div>
            {
              (volume || group || lb || meshflag || stackFlag || os) && <div className='icon_container'>
                {
                  volume && <Tooltip title={formatMessage(intlMsg.thisServerStorage)} placement="top">
                    <span className='standrand volumeColor'><FormattedMessage {...intlMsg.storage}/></span>
                  </Tooltip>
                }
                {
                  group && this.renderGroupIcon(item.lbgroup)
                }
                {
                  lb && this.renderLBIcon()
                }
                { meshflag && this.rendermeshIcon() }
                {
                  stackFlag && <Tooltip title={`通过应用堆栈 ${stackFlag} 初始部署`} placement="top">
                    <span className='standrand volumeColor'>堆</span>
                  </Tooltip>
                }
                {
                  os && arch && this.renderOSIcon(os, arch)
                }
              </div>
            }
          </div>
          <div className="status commonData">
            <ServiceStatus service={item} />
          </div>
          <div className="image commonData">
            <Tooltip title={mirror} placement="topLeft">
              <span>{mirror}</span>
            </Tooltip>
          </div>
          <div className="service commonData appSvcListDomain">
            <Tooltip title={svcDomain.length > 0 ? svcDomain[0] : ""}>
              <TipSvcDomain
              svcDomain={svcDomain} parentNode="AppInfo" icon={item.https === true ? 'https' : 'http'}
              serviceMeshflagListInfo={this.props.mesh}
              msaUrl={this.props.msaUrl}
              serviceName={item.metadata.name}
              />
            </Tooltip>
          </div>
          <div className="createTime commonData">
            <span>{calcuDate(item.metadata.creationTimestamp || '')}</span>
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button
              overlay={dropdown} type="ghost"
              trigger={['hover']}
              onClick={() => this.modalShow(item)}>
              <Icon type="eye-o" />
              <span><FormattedMessage {...intlMsg.check}/></span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
      </div>
    );
  }
});

class AppServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    // this.batchDeleteServices = this.batchDeleteServices.bind(this)
    // this.confirmDeleteServices = this.confirmDeleteServices.bind(this)
    this.goAddService = this.goAddService.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)

    this.batchStartService = this.batchStartService.bind(this)
    this.batchStopService = this.batchStopService.bind(this)
    this.batchRestartService = this.batchRestartService.bind(this)
    this.batchQuickRestartService = this.batchQuickRestartService.bind(this)
    this.batchDeleteServices = this.batchDeleteServices.bind(this)
    this.handleStartServiceOk = this.handleStartServiceOk.bind(this)
    this.handleStartServiceCancel = this.handleStartServiceCancel.bind(this)
    this.handleStopServiceOk = this.handleStopServiceOk.bind(this)
    this.handleStopServiceCancel = this.handleStopServiceCancel.bind(this)
    this.handleRestarServiceOk = this.handleRestarServiceOk.bind(this)
    this.handleRestarServiceCancel = this.handleRestarServiceCancel.bind(this)
    this.handleQuickRestarServiceOk = this.handleQuickRestarServiceOk.bind(this)
    this.handleQuickRestarServiceCancel = this.handleQuickRestarServiceCancel.bind(this)
    this.handleDeleteServiceOk = this.handleDeleteServiceOk.bind(this)
    this.handleDeleteServiceCancel = this.handleDeleteServiceCancel.bind(this)

    this.state = {
      modalShow: false,
      currentShowInstance: null,
      serviceList: props.serviceList,
      searchInputDisabled: false,
      rollingUpdateModalShow: false,
      manualScaleModalShow: false,
      isCreate: true,
      servicesList: [],
      selectedList: [],
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      redeploybtn: false,
      StartServiceModal: false,
      StopServiceModal: false,
      RestarServiceModal: false,
      QuickRestarServiceModal: false,
      DeleteServiceModal: false,
      grayscaleUpgradeModalVisible: false,
      mesh: undefined,
      documentTitle: this.props.intl.formatMessage(AllServiceListIntl.documentTitle),
    }
  }
  getInitialState() {
    return {
      disableScale: false
    }
  }
  loadServices(nextProps, options) {
    const self = this
    const {
      cluster, appName, loadServiceList, page, size, name
    } = nextProps || this.props
    const query = { page, size, name }
    query.customizeOpts = options
    loadServiceList(cluster, appName, query, {
      success: {
        func: (result) => {
          addDeploymentWatch(cluster, self.props, result.data)
          // For fix issue #CRYSTAL-1604(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadServiceList(cluster, appName, query)
          }, LOAD_STATUS_TIMEOUT)
        },
        isAsync: true
      }
    })
    this.reloadServiceMesh()
  }

  onAllChange(e) {
    const { checked } = e.target
    const { serviceList } = this.state
    serviceList.map((service) => service.checked = checked)
    this.setState({
      serviceList,
      donotUserCurrentShowInstance: true
    })
    if (checked) {
      this.setState({
        runBtn: true,
        stopBtn: true,
        restartBtn: true,
      })
    } else {
      this.setState({
        runBtn: false,
        stopBtn: false,
        restartBtn: false,
      })
    }
    handleStateOfServiceList(this, serviceList)
  }

  componentWillMount() {
    this.loadServices()
  }

  componentWillReceiveProps(nextProps) {
    let { page, size, name, serviceList, onServicesChange, availabilityNumber, total } = nextProps
    this.setState({
      serviceList
    })
    onServicesChange(serviceList, availabilityNumber, total)

    if (page === this.props.page && size === this.props.size && name === this.props.name) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadServices(nextProps)
  }

  componentDidMount() {
    // Reload list each UPDATE_INTERVAL
    this.upStatusInterval = setInterval(() => {
      this.loadServices(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
    this.reloadServiceMesh()
  }
  reloadServiceMesh = async () => {
    const { getServiceListServiceMeshStatus } = this.props
    const serviceNames = this.props.serviceList.map(({ metadata: { name } = {}}) => name)
    let ServiceListmeshResult
    try{
      ServiceListmeshResult =
      await getServiceListServiceMeshStatus(this.props.cluster, serviceNames)
    } catch(e) { notification.error({message: '获取服务网格状态出错'}) }
    // console.log('ServiceListmeshResult', ServiceListmeshResult)
    const ServiceListmeshData = ServiceListmeshResult.response.result || {}
    const serviceListMesh = serviceNames.map((name) => {
      const serviceMesh = Object.values(ServiceListmeshData)
      .filter((service)=> typeof service === 'object')
      .find((service) => service.metadata.name === name) || {}
      return { name, value: serviceMesh.istioEnabled, referencedComponent: serviceMesh.referencedComponent }
    })
    this.setState({ mesh: serviceListMesh })
  }
  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removeDeploymentWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  batchStartService() {
    this.setState({
      StartServiceModal: true
    })
  }
  batchStopService() {
    this.setState({
      StopServiceModal: true
    })
  }
  batchRestartService() {
    this.setState({
      RestarServiceModal: true
    })
  }
  batchQuickRestartService() {
    this.setState({
      QuickRestarServiceModal: true
    })
  }
  batchDeleteServices() {
    const { serviceList, cluster, getDeploymentOrAppCDRule } = this.props
    const checkList = serviceList.filter(item => item.checked)
    if(checkList && checkList.length > 0) {
      const name = checkList.map(service => service.metadata.name).join(',')
      getDeploymentOrAppCDRule(cluster, 'service', name)
    }
    this.setState({
      DeleteServiceModal: true
    })
  }

  handleStartServiceOk() {
    const self = this
    const { cluster, startServices, serviceList, appName, intl } = this.props
    const formatMessage = intl
    let stoppedService = []
    const checkedServiceList = serviceList.filter((service) => service.checked)
    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Stopped') {
        stoppedService.push(service)
      }
    })
    const serviceNames = stoppedService.map((service) => service.metadata.name)
    const allServices = self.state.serviceList
    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Starting'
      }
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList
    })
    startServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            StartServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true
      }
    })
  }
  handleStartServiceCancel() {
    this.setState({
      StartServiceModal: false,
    })
  }
  handleStopServiceOk() {
    const self = this
    const { cluster, stopServices, serviceList, appName, intl } = this.props
    let checkedServiceList = serviceList.filter((service) => service.checked)
    let runningServices = []
    if (this.state.currentShowInstance && !this.state.donotUserCurrentShowInstance) {
      checkedServiceList = [this.state.currentShowInstance]
    }
    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Running' || service.status.phase === 'Pending' || service.status.phase === 'Starting' || service.status.phase === 'Deploying') {
        runningServices.push(service)
      }
    })
    const serviceNames = runningServices.map((service) => service.metadata.name)
    const allServices = self.state.serviceList
    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Stopping'
      }
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(intl.formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList: allServices
    })
    if (serviceNames.length < 1) {
      self.setState({
        StopServiceModal: false,
        runBtn: false,
        stopBtn: false,
        restartBtn: false,
      })
      let notification = new NotificationHandler()
      notification.error(intl.formatMessage(intlMsg.slcStopServer))
      return
    }
    stopServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            StopServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true
      }
    })
  }
  handleStopServiceCancel() {
    this.setState({
      StopServiceModal: false,
    })
  }
  handleRestarServiceOk() {
    const self = this
    const { cluster, restartServices, serviceList, appName, intl, removeTerminal, terminalList } = this.props
    let checkedServiceList = serviceList.filter((service) => service.checked)
    if(terminalList.length){
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        removeTerminal(cluster, item.metadata.name)
      })
    }
    let runningServices = []

    if (this.state.currentShowInstance && !this.state.donotUserCurrentShowInstance) {
      checkedServiceList = [this.state.currentShowInstance]
    }

    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Running' || service.status.phase === 'Pending') {
        runningServices.push(service)
      }
    })
    const serviceNames = runningServices.map((service) => service.metadata.name)
    const allServices = self.state.serviceList

    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(intl.formatMessage(intlMsg.noOperationServer))
      return
    }

    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Redeploying'
      }
    })
    self.setState({
      serviceList: allServices,
      RestarServiceModal: false,
    })
    restartServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
            redeploybtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true
      }
    })
  }
  handleRestarServiceCancel() {
    this.setState({
      RestarServiceModal: false,
    })
  }
  handleQuickRestarServiceOk() {
    const self = this
    const { cluster, quickRestartServices, serviceList, appName, intl, removeTerminal, terminalList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    if(terminalList.length){
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        removeTerminal(cluster, item.metadata.name)
      })
    }
    let runningServices = []

    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Running') {
        runningServices.push(service)
      }
    })
    const serviceNames = runningServices.map((service) => service.metadata.name)
    const allServices = self.state.serviceList

    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Restarting'
      }
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(intl.formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList
    })
    quickRestartServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.loadServices(self.props)
          self.setState({
            QuickRestarServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
          self.setState({
            QuickRestarServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
          self.loadServices(self.props)
        },
        isAsync: true
      }
    })
  }
  handleQuickRestarServiceCancel() {
    this.setState({
      QuickRestarServiceModal: false,
    })
  }
  handleDeleteServiceOk() {
    const self = this
    const { cluster, appName, loadServiceList, deleteServices, intl, serviceList, removeTerminal, terminalList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    if(terminalList.length){
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        removeTerminal(cluster, item.metadata.name)
      })
    }


    const serviceNames = []
    const releaseNames = []
    checkedServiceList.forEach(service => {
      serviceNames.push(service.metadata.name)
      let releaseName = service.metadata.labels.releaseName
      // do not pass releaseName when delete stack app
      if (releaseName && !serviceNames.includes(releaseName) && !service.appStack) {
        releaseNames.push(releaseName)
      }
    })
    const allServices = self.state.serviceList
    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Terminating'
      }
    })
    self.setState({
      DeleteServiceModal: false,
      serviceList: allServices
    })
    deleteServices(cluster, {services: serviceNames, releaseNames}, {
      success: {
        func: () => {
          self.loadServices(self.props)
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true
      }
    })
  }
  handleDeleteServiceCancel() {
    this.setState({
      DeleteServiceModal: false,
    })
  }
  /*batchDeleteServices() {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmDeleteServices(checkedServiceList)
  }*/

  /*confirmDeleteServices(serviceList, callback) {
    const self = this
    const { cluster, appName, loadServiceList, deleteServices, intl } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => self.loadServices(self.props),
          isAsync: true
        },
        failed: {
          func: (err) => {
            errorHandler(err, intl)
            self.loadServices(self.props)
          },
          isAsync: true
        }
      }
    }
    confirm({
      title: `您是否确认要删除这${serviceNames.length}个服务`,
      content: serviceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allServices = self.state.serviceList
          allServices.map((service) => {
            if (serviceNames.indexOf(service.metadata.name) > -1) {
              service.status.phase = 'Terminating'
            }
          })
          if (allServices.length <= 0) {
            const noti = new NotificationHandler()
            noti.error('没有可以操作的服务')
            return
          }
          self.setState({
            serviceList: allServices
          })
          deleteServices(cluster, serviceNames, callback)
          // for detail page delete service action
          self.setState({
            modalShow: false
          })
          resolve()
        });
      },
      onCancel() { },
    })
  }*/
  closeModal() {
    this.setState({
      modalShow: false,
      documentTitle: "",
    }, () => {
      this.setState({
        documentTitle: this.props.intl.formatMessage(AllServiceListIntl.documentTitle)
      })
    })
  }

  goAddService() {
    const { appName } = this.props
    // browserHistory.push(`/app_manage/app_create/quick_create?appName=${appName}&action=addService&fromDetail=true`)
    browserHistory.push(`/app_manage/app_create?appName=${appName}&action=addService&fromDetail=true`)
  }

  onShowSizeChange(page, size) {
    if (size === this.props.size) {
      return
    }
    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
    }
    if (size !== DEFAULT_PAGE_SIZE) {
      query.size = size
    }
    const { name } = this.props
    if (name) {
      query.name = name
    }
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      query
    })
  }
  onPageChange(page) {
    if (page === this.props.page) {
      return
    }
    const { pathname, size, name } = this.props
    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
      query.size = size
    }
    if (name) {
      query.name = name
    }
    browserHistory.push({
      pathname,
      query
    })
  }

  render() {
    const parentScope = this
    let {
      modalShow, currentShowInstance, serviceList,
      selectTab, rollingUpdateModalShow, configModal,
      manualScaleModalShow, runBtn, stopBtn, restartBtn,
      redeploybtn, grayscaleUpgradeModalVisible,
      documentTitle,
    } = this.state
    const {
      name, pathname, page,
      size, total, isFetching,
      loginUser, cluster, appName, loadServiceList, k8sServiceList, intl: { formatMessage },
      serviceList: propsserviceList
    } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    const isChecked = (checkedServiceList.length > 0)
    let isAllChecked = (serviceList.length === checkedServiceList.length)
    if (serviceList.length === 0) {
      isAllChecked = false
    }
    // currentShowInstance = checkedServiceList[0]
    const funcs = {
      batchRestartService: this.batchRestartService,
      batchStopService: this.batchStopService,
      // confirmDeleteServices: this.confirmDeleteServices,
      batchDeleteServices: this.batchDeleteServices,
    }
    const operaMenu = (
      <Menu>
        <Menu.Item key="0" disabled={!redeploybtn}>
          <span onClick={this.batchRestartService}><i className='fa fa-undo' /> <FormattedMessage {...intlMsg.redeploy}/></span>
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="AppServiceList" style={{ padding: '10px 15px' }}>
        <QueueAnim className="demo-content"
                   key="demo"
                   type="right"
        >
          <div className="operaBox" key="serverList">
            <Title title={documentTitle} />
            {/* <Title title={formatMessage(intlMsg.nameServerList, { appName })} /> */}
            <Button
              size="large"
              type="primary"
              onClick={this.goAddService}
              >
              <i className="fa fa-plus"></i>
              <FormattedMessage {...intlMsg.addServer}/>
            </Button>
            <Button size="large" onClick={this.batchStartService} disabled={!runBtn}>
              <i className="fa fa-play"></i>
              <FormattedMessage {...intlMsg.boot}/>
            </Button>
            <Modal title={formatMessage(intlMsg.redeployAct)} visible={this.state.RestarServiceModal}
                   onOk={this.handleRestarServiceOk} onCancel={this.handleRestarServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} scope={parentScope} state="Restart" />
            </Modal>
            <Modal title={formatMessage(intlMsg.bootAct)} visible={this.state.StartServiceModal}
                   onOk={this.handleStartServiceOk} onCancel={this.handleStartServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} state="Running" />
            </Modal>
            <Button size="large" onClick={this.batchStopService} disabled={!stopBtn}>
              <i className="fa fa-stop"></i>
              <FormattedMessage {...intlMsg.stop}/>
            </Button>
            <Button size="large" onClick={() => this.loadServices(this.props)} >
              <i className="fa fa-refresh"></i>
              <FormattedMessage {...intlMsg.refresh}/>
            </Button>
            <Modal title={formatMessage(intlMsg.stopAct)} visible={this.state.StopServiceModal}
                   onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} scope={parentScope} state="Stopped" />
            </Modal>
            <Button size="large" onClick={this.batchDeleteServices} disabled={!isChecked}>
              <i className="fa fa-trash"></i>
              <FormattedMessage {...intlMsg.delete}/>
            </Button>
            <Modal title={formatMessage(intlMsg.deleteAct)} visible={this.state.DeleteServiceModal}
                   onOk={this.handleDeleteServiceOk} onCancel={this.handleDeleteServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} scope={parentScope} state='Delete' cdRule={this.props.cdRule}/>
            </Modal>
            <Button size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
              <i className="fa fa-bolt"></i>
              <FormattedMessage {...intlMsg.reboot}/>
            </Button>
            <Modal title={formatMessage(intlMsg.rebootAct)} visible={this.state.QuickRestarServiceModal}
                   onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} state="QuickRestar" />
            </Modal>
            <Dropdown overlay={operaMenu} trigger={['click']}>
              <Button size="large" disabled={!isChecked}>
                <FormattedMessage {...intlMsg.more}/>
                <i className="fa fa-caret-down"></i>
              </Button>
            </Dropdown>
            <div className="rightBox">
              <span className="totalPage"><FormattedMessage {...intlMsg.totalItems} values={{ total }}/></span>
              <div className="paginationBox">
                <Pagination
                  className="inlineBlock"
                  simple
                  onChange={this.onPageChange}
                  onShowSizeChange={this.onShowSizeChange}
                  current={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="appTitle">
            <div className="selectIconTitle commonTitle">
              <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={serviceList.length < 1} />
            </div>
            <div className="name commonTitle">
              <FormattedMessage {...intlMsg.serverName}/>
            </div>
            <div className="status commonTitle">
              <FormattedMessage {...intlMsg.status}/>
            </div>
            <div className="image commonTitle">
              <FormattedMessage {...intlMsg.image}/>
            </div>
            <div className="service commonTitle">
              <FormattedMessage {...intlMsg.serverAddress}/>
            </div>
            <div className="createTime commonTitle">
              <FormattedMessage {...intlMsg.createTime}/>
            </div>
            <div className="actionBox commonTitle">
              <FormattedMessage {...intlMsg.act}/>
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <MyComponent
            loginUser={loginUser}
            cluster={cluster}
            name={name}
            scope={parentScope}
            serviceList={serviceList}
            k8sServiceList={k8sServiceList}
            loading={isFetching}
            bindingIPs={this.props.bindingIPs}
            intl={this.props.intl}
            bindingDomains={this.props.bindingDomains}
            mesh={this.state.mesh}
            msaUrl={this.props.msaUrl}
             />
          <Modal
            title="垂直居中的对话框"
            visible={this.state.modalShow}
            className="AppServiceDetail"
            transitionName="move-right"
            onCancel={this.closeModal}
          >
          {
            modalShow ?
              <AppServiceDetail
                loadServices={()=>this.loadServices(this.props)}
                appName={appName}
                scope={parentScope}
                funcs={funcs}
                selectTab={selectTab}
                serviceDetailmodalShow={this.state.modalShow}
                onClose={this.closeModal}
                mesh={this.state.mesh}
                msaUrl={this.props.msaUrl}
                k8sServiceList={k8sServiceList}
              />
              :
              null
          }
          </Modal>
          {
            rollingUpdateModalShow ?
              <RollingUpdateModal
                parentScope={parentScope}
                cluster={cluster}
                appName={appName}
                visible={rollingUpdateModalShow}
                loadServiceList={loadServiceList}
                service={currentShowInstance} />
              :null
          }
          {
            grayscaleUpgradeModalVisible &&
            <GrayscaleUpgradeModal
              cluster={cluster}
              appName={appName}
              loadServiceList={loadServiceList}
              service={currentShowInstance}
              onCancel={() => this.setState({ grayscaleUpgradeModalVisible: false })}
            />
          }
          <ConfigModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={configModal}
            loadServiceList={loadServiceList}
            service={currentShowInstance} />
          <ManualScaleModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={manualScaleModalShow}
            service={currentShowInstance}
            loadServiceList={loadServiceList}
            disableScale={this.state.disableScale}
          />
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
  quickRestartServices: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  // total: PropTypes.number.isRequired,
  onServicesChange: PropTypes.func.isRequired, // For change app status when service list change
}

function handleStateOfServiceList(scope, serviceList) {
  const checkedList = serviceList.filter((service) => service.checked)
  if (checkedList.length === 0) {
    scope.setState({
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      redeploybtn: false,
    })
    return
  }
  if (checkedList.length === 1) {
    if(checkedList[0].status.phase === 'Pending'){
      scope.setState({
        runBtn: false,
        stopBtn: true,
        restartBtn: false,
        redeploybtn: true,
      })
      return
    }
    if (checkedList[0].status.phase === 'Running') {
      scope.setState({
        runBtn: false,
        stopBtn: true,
        restartBtn: true,
        redeploybtn: true,
      })
    }
    if (checkedList[0].status.phase === 'Stopped') {
      scope.setState({
        runBtn: true,
        stopBtn: false,
        restartBtn: false,
        redeploybtn: false,
      })
    }
    if (checkedList[0].status.phase === 'Starting' || checkedList[0].status.phase === 'Deploying') {
      scope.setState({
        runBtn: false,
        stopBtn: true,
        restartBtn: true,
        redeploybtn: true,
      })
    }
  } else if (checkedList.length > 1) {
    let runCount = 0
    let stopCount = 0
    let pending = 0
    checkedList.forEach((item, index) => {
      if (item.status.phase === 'Running') {
        runCount++
      }
      else if (item.status.phase === 'Pending' || item.status.phase === 'Starting' || item.status.phase === 'Deploying') {
        pending++
      } else {
        stopCount++
      }
    })
    if (runCount + pending === checkedList.length) {
      scope.setState({
        runBtn: false,
        stopBtn: true,
        restartBtn: true,
        redeploybtn: true,
      })
      if (pending) {
        scope.setState({
          restartBtn: true
        })
      }
      return
    }
    if (stopCount === checkedList.length) {
      scope.setState({
        runBtn: true,
        stopBtn: false,
        restartBtn: false,
        redeploybtn: false,
      })
      return
    }
    scope.setState({
      runBtn: true,
      stopBtn: true,
      restartBtn: true,
      redeploybtn: true,
    })
    return
  }
}

function mapStateToProps(state, props) {
  const { query, pathname } = props.location
  let { page, size, name } = query
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const { appName } = props
  const { loginUser } = state.entities
  const { cluster } = state.entities.current
  const { statusWatchWs } = state.entities.sockets
  const { terminal } = state
  const terminalList = terminal.list[cluster.clusterID] || []
  const defaultServices = {
    isFetching: false,
    cluster: cluster.clusterID,
    appName,
    serviceList: [],
    total: 0
  }
  const {
    serviceItems
  } = state.services
  let targetServices
  if (serviceItems[cluster.clusterID] && serviceItems[cluster.clusterID][appName]) {
    targetServices = serviceItems[cluster.clusterID][appName]
  }
  const { serviceList, isFetching, total, availabilityNumber } = targetServices || defaultServices
  const { getDeploymentOrAppCDRule } = state.cicd_flow
  const defaultCDRule = {
    isFetching: false,
    result: {
      results: []
    }
  }
  const { entities: { loginUser: { info: { msaConfig: {url:msaUrl} = {} } } = {} } = {} } = state
  if (serviceList) {
    serviceList.forEach(service => {
      service.appStack = getDeepValue(service, [ 'metadata', 'labels', 'system/appstack' ])
    })
  }
  return {
    loginUser: loginUser,
    cluster: cluster.clusterID,
    statusWatchWs,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    appName,
    pathname,
    page,
    size,
    total,
    name,
    serviceList,
    terminalList,
    isFetching,
    availabilityNumber,
    cdRule: getDeploymentOrAppCDRule && getDeploymentOrAppCDRule.result ? getDeploymentOrAppCDRule : defaultCDRule,
    msaUrl
  }
}

AppServiceList = connect(mapStateToProps, {
  loadServiceList,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAutoScale,
  getDeploymentOrAppCDRule,
  removeTerminal,
  getServiceListServiceMeshStatus: meshActions.getServiceListServiceMeshStatus,
})(AppServiceList)

export default injectIntl(AppServiceList, {
  withRef: true,
})
