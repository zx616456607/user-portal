/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceList component
 *
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component } from 'react'
import * as PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl'
import intlMsg from '../../../../../src/components/AppModule/AppServiceListIntl'
import { AllServiceListIntl } from '../../../../../src/components/AppModule/ServiceIntl'
import { Modal, Checkbox, Dropdown, Menu, Icon, Spin, Tooltip } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from '../../../../../src/components/AppModule/AppServiceDetail'
import '../../../../../src/components/AppModule/style/AppServiceList.less'
import { calcuDate } from '../../../../../src/common/tools'
import {
  // loadServiceList,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAutoScale,
} from '../../../../../src/actions/services'
import { loadAppClusterServerList as loadServiceList } from '../../../../actions/middlewareCenter'
import { removeTerminal } from '../../../../../src/actions/terminal'
import { getDeploymentOrAppCDRule } from '../../../../../src/actions/cicd_flow'
import { UPDATE_INTERVAL } from '../../../../../src/constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../../constants'
import { browserHistory } from 'react-router'
import RollingUpdateModal from '../../../../../src/components/AppModule/AppServiceDetail/RollingUpdateModal'
import GrayscaleUpgradeModal from '../../../../../src/components/AppModule/AppServiceDetail/GrayscaleUpgradeModal'
import ConfigModal from '../../../../../src/components/AppModule/AppServiceDetail/ConfigModal'
import ManualScaleModal from '../../../../../src/components/AppModule/AppServiceDetail/ManualScaleModal'
import { parseServiceDomain } from '../../../../../src/components/parseDomain'
import ServiceStatus from '../../../../../src/components/TenxStatus/ServiceStatus'
import TipSvcDomain from '../../../../../src/components/TipSvcDomain'
import { removeDeploymentWatch } from '../../../../../src/containers/App/status'
import StateBtnModal from '../../../../../src/components/StateBtnModal'
import errorHandler from '../../../../../src/containers/App/error_handler'
import NotificationHandler from '../../../../../src/components/Notification'
// import { SERVICE_KUBE_NODE_PORT } from '../../../../../src/constants'
import cloneDeep from 'lodash/cloneDeep'
import { isResourcePermissionError } from '../../../../../src/common/tools'
import isEmpty from 'lodash/isEmpty';
import { camelize } from 'humps';

// const SubMenu = Menu.SubMenu
class MyComponent extends React.Component {
  static PropTypes = {
    serviceList: React.PropTypes.array,
  }
  onchange(e) {
    const { value, checked } = e.target
    const { scope } = this.props
    const { serviceList } = scope.state
    const checkedList = serviceList.filter(service => service.checked)
    serviceList.map(service => {
      if (service.metadata.name === value) {
        service.checked = checked
      }
      return {}
    })
    if (checkedList.length === 0) {
      scope.setState({
        runBtn: false,
        stopBtn: false,
        restartBtn: false,
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
      // let rollingUpdateCount = 0
      checkedList.forEach(item => {
        if (item.status.phase === 'Running') {
          runCount++
        } else if (item.status.phase === 'Pending' || item.status.phase === 'Starting' || item.status.phase === 'Deploying') {
          pending++
        } else if (item.status.phase === 'RollingUpdate' || item.status.phase === 'ScrollRelease') {
          // rollingUpdateCount++
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
            restartBtn: true,
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
      serviceList,
    })
  }
  selectServiceByLine(e, item) {
    const stopPro = e._dispatchInstances;
    if (stopPro.length !== 2) {
      const { scope } = this.props
      scope.setState({
        donotUserCurrentShowInstance: true,
      })
      const { serviceList } = scope.state
      serviceList.map(service => {
        if (service.metadata.name === item.metadata.name) {
          service.checked = !service.checked
        }
        return {}
      })
      handleStateOfServiceList(scope, serviceList)
      scope.setState({
        serviceList,
      })
    }
  }
  modalShow = item => {
    // e.stopPropagation()
    const { scope } = this.props;
    scope.setState({
      selectTab: null,
      modalShow: true,
      currentShowInstance: item,
    });
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
      query,
    })
  }
  serviceOperaClick(item, e) {
    const { scope } = this.props
    const { serviceList } = scope.state
    if (e.key === 'start' || e.key === 'stop' || e.key === 'restart' || e.key === 'batchRestartService' || e.key === 'delete') {
      serviceList.map(service => {
        if (service.metadata.name === item.metadata.name) {
          service.checked = true
        } else {
          service.checked = false
        }
        return {}
      })
    } else {
      scope.setState({
        currentShowInstance: item,
        donotUserCurrentShowInstance: false,
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
        return scope.batchRestartService(item) // 炎黃
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
      default:
        return {}
    }
  }
  showRollingUpdateModal() {
    const { scope } = this.props
    scope.setState({
      rollingUpdateModalShow: true,
    })
  }
  showGrayscaleUpgradeModal() {
    const { scope } = this.props
    scope.setState({
      grayscaleUpgradeModalVisible: true,
    })
  }
  showConfigModal() {
    const { scope } = this.props
    scope.setState({
      configModal: true,
    })
  }
  showManualScaleModal(item) {
    const { scope, cluster } = this.props
    scope.props.loadAutoScale(cluster, item.metadata.name, {
      success: {
        func: result => {
          if (result.data) {
            if (Object.getOwnPropertyNames(result.data).length > 0) {
              // Check if autoscaling is disabled
              if (result.data.spec.scaleTargetRef && result.data.spec.scaleTargetRef.name ===
                item.metadata.name) {
                scope.setState({
                  disableScale: true,
                })
              }
              return
            }
          }
          scope.setState({
            disableScale: false,
          })
        },
      },
    })
    scope.setState({
      manualScaleModalShow: true,
    })
  }
  showServiceDetail(item) {
    const { scope } = this.props
    const tabKeys = '#' + item
    scope.setState({
      selectTab: tabKeys,
      modalShow: true,
    })
  }
  renderGroupIcon(group) {
    const { intl: { formatMessage } } = this.props
    if (!group || !group.id || group.type === 'none') {
      return <span></span>
    }
    if (group.id === 'mismatch') {
      return <Tooltip title={formatMessage(AllServiceListIntl.netPortDelete)}>
        <span className="standrand netcolor">{formatMessage(AllServiceListIntl.net)}</span>
      </Tooltip>

    }
    switch (group.type) {
      case 'private':
        return <Tooltip title={formatMessage(AllServiceListIntl.serviceInnerNet)}>
          <span className="standrand privateColor">{formatMessage(AllServiceListIntl.inner)}</span>
        </Tooltip>
      case 'public':
        return <Tooltip title={formatMessage(AllServiceListIntl.servicePublicNet)}>
          <span className="standrand publicColor">{formatMessage(AllServiceListIntl.public)}</span>
        </Tooltip>
      default:
        return <span></span>
    }
  }
  renderLBIcon() {
    const { intl: { formatMessage } } = this.props
    return (
      <Tooltip title={formatMessage(AllServiceListIntl.serviceloadBalance)}>
        <span className="standrand privateColor">lb</span>
      </Tooltip>
    )
  }
  render() {
    const { formatMessage } = this.props.intl
    const { cluster, serviceList, loading, bindingDomains, bindingIPs, k8sServiceList,
    } = this.props
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
    const items = serviceList.map(item => {
      item.cluster = cluster
      let redeployDisable = true
      if (item.status.phase === 'Running' || item.status.phase === 'Pending') {
        redeployDisable = false
      }

      const isRollingUpdate = item.status.phase === 'RollingUpdate'
      const titleText = (isRollingUpdate ? formatMessage(intlMsg.grayBackAct)
        : formatMessage(intlMsg.rollUpdateAct)) || ''
      const isRollingUpdateOrScrollRelease = item.status.phase === 'RollingUpdate'
      || item.status.phase === 'ScrollRelease'
      // const ipv4 = item.spec.template && item.spec.template.metadata &&
      // item.spec.template.metadata.annotations
      //   && item.spec.template.metadata.annotations['cni.projectcalico.org/ipAddrs']
      //   && JSON.parse(item.spec.template.metadata.annotations['cni.projectcalico.org/ipAddrs'])
      //   || null
      // const isDisabled = ipv4 && ipv4.length <= item.spec.replicas || false
      const dropdown = (
        <Menu onClick={this.serviceOperaClick.bind(this, item)} style={{ width: 100 }} id="appservicelistDropdownMenu">
          {/* {
            item.status.phase == 'Stopped'
              ? <Menu.Item key="start">
                {formatMessage(ServiceCommonIntl.start)}
              </Menu.Item>
              : <Menu.Item style={{ display: 'none' }}></Menu.Item>
          }
          {
            item.status.phase == 'Running' || item.status.phase == 'Pending'
              ? <Menu.Item key="stop">
                {formatMessage(ServiceCommonIntl.stop)}
              </Menu.Item>
              : <Menu.Item style={{ display: 'none' }}></Menu.Item>
          } */}
          {/* {
            item.status.phase == 'Running'
              ? <Menu.Item key="restart">
                {formatMessage(ServiceCommonIntl.reboot)}
              </Menu.Item>
              : <Menu.Item style={{ display: 'none' }}></Menu.Item>
          } */}
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
              : <Menu.Item style={{ display: 'none' }}></Menu.Item>
          }
          {/* <Menu.Item key="delete">
            {formatMessage(ServiceCommonIntl.delete)}
          </Menu.Item> */}
          {/* <Menu.Divider key="baseline1" /> */}
          {/* <Menu.Item
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
          </Menu.Item> */}
          {/* <SubMenu title={formatMessage(intlMsg.expand)}>
            <Menu.Item
              key="manualScale" style={{ width: '102px' }}
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
          </SubMenu> */}
          {/* <SubMenu title={formatMessage(AllServiceListIntl.changeSet)}>
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
          </SubMenu> */}
          {/* <SubMenu title="更多设置">
            <Menu.Item key="binddomain" style={{ width: '102px' }}>
              {formatMessage(AllServiceListIntl.bundDomin)}
            </Menu.Item>
            <Menu.Item key="https" disabled={loginUser.info.proxyType === SERVICE_KUBE_NODE_PORT}>
              {formatMessage(AllServiceListIntl.setHTTPS)}
            </Menu.Item>
          </SubMenu> */}
          {/* <Menu.Item key="serverTag">
            {formatMessage(AllServiceListIntl.serviceTag)}
          </Menu.Item> */}
        </Menu>

      );
      let mirror = ''
      const images = item.spec.template.spec.containers.map(container => {
        return container.image
      })
      if (item.metadata.annotations && item.metadata.annotations['rollingupdate/target']) {
        const rollingupdateTarget = JSON.parse(item.metadata.annotations['rollingupdate/target'])
        mirror = rollingupdateTarget[0].from + '\n' + rollingupdateTarget[0].to
      } else {
        mirror = images.join(', ') ? images.join(', ') : ''
      }
      let lb = false
      let k8sSer = ''
      if (k8sServiceList) {
        for (const k8sService of k8sServiceList) {
          if (k8sService && k8sService.metadata && item.metadata.name
             === k8sService.metadata.name) {

            const key = camelize('ingress-lb')
            if (
              k8sService.metadata.annotations &&
              k8sService.metadata.annotations[key] &&
              !isEmpty(k8sService.metadata.annotations[key])
            ) {
              const lbArr = JSON.parse(k8sService.metadata.annotations[key])
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
      if (
        item.spec
        && item.spec.template
        && item.spec.template.spec
        && item.spec.template.spec.volumes
      ) {
        const volumes = item.spec.template.spec.volumes
        for (let i = 0; i < volumes.length; i++) {
          if (
            volumes[i].persistentVolumeClaim
            || volumes[i].rbd
            || (volumes[i].hostPath && (volumes[i].hostPath.path !== '/etc/localtime' && volumes[i].hostPath.path !== '/etc/timezone'))
          ) {
            volume = true
            break
          }
        }
      }
      let group = false
      if (item.lbgroup) {
        if (item.lbgroup.id || (item.lbgroup.type && item.lbgroup.type !== 'none')) {
          group = true
        }
      }
      let heightSize = '60px'
      let lineHeightSize = '60px'
      if (volume || group || lb) {
        heightSize = '30px'
        lineHeightSize = '40px'
      }
      return (
        <div
          className={item.checked ? 'selectedInstance instanceDetail' : 'instanceDetail'}
          key={item.metadata.name}
          onClick={e => this.selectServiceByLine(e, item)} >
          <div className="selectIconTitle commonData">
            <Checkbox value={item.metadata.name} checked={item.checked} />
          </div>
          <div className="name commonData">
            <div className="viewBtn" onClick={() => this.modalShow(item)} style={{ height: heightSize, lineHeight: lineHeightSize }}>
              {item.metadata.name}
            </div>
            {
              (volume || group || lb) && <div className="icon_container">
                {
                  volume && <Tooltip title={formatMessage(intlMsg.thisServerStorage)} placement="top">
                    <span className="standrand volumeColor"><FormattedMessage {...intlMsg.storage}/></span>
                  </Tooltip>
                }
                {
                  group && this.renderGroupIcon(item.lbgroup)
                }
                {
                  lb && this.renderLBIcon()
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
            <Tooltip title={svcDomain.length > 0 ? svcDomain[0] : ''}>
              <TipSvcDomain svcDomain={svcDomain} parentNode="appSvcListDomain" icon={item.https === true ? 'https' : 'http'} />
            </Tooltip>
          </div>
          <div className="createTime commonData">
            <span>{calcuDate(item.metadata.creationTimestamp || '')}</span>
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button
              overlay={dropdown} type="ghost"
              trigger={[ 'hover' ]}
              onClick={() => this.modalShow(item)}>
              <Icon type="eye-o" />
              <span><FormattedMessage {...intlMsg.check}/></span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
      </div>
    );
  }
}

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
      rebootItem: null, // 炎黃魔改
    }
  }
  getInitialState() {
    return {
      disableScale: false,
    }
  }
  loadServices(nextProps, options) {
    // const self = this
    const {
      // cluster, appName, loadServiceList,
      page, size, name,
    } = nextProps || this.props
    const query = { page, size, name }
    query.customizeOpts = options
    // loadServiceList(cluster, appName, query, {
    //   success: {
    //     func: result => {
    //       addDeploymentWatch(cluster, self.props, result.data)
    //       // For fix issue #CRYSTAL-1604(load list again for update status)
    //       clearTimeout(self.loadStatusTimeout)
    //       query.customizeOpts = {
    //         keepChecked: true,
    //       }
    //       self.loadStatusTimeout = setTimeout(() => {
    //         loadServiceList(cluster, appName, query)
    //       }, LOAD_STATUS_TIMEOUT)
    //     },
    //     isAsync: true,
    //   },
    // })
  }

  onAllChange(e) {
    const { checked } = e.target
    const { serviceList } = this.state
    serviceList.map(service => {
      service.checked = checked
      return {}
    })
    this.setState({
      serviceList,
      donotUserCurrentShowInstance: true,
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

  componentDidMount() {
    // Reload list each UPDATE_INTERVAL
    this.loadServices()
    this.upStatusInterval = setInterval(() => {
      this.loadServices(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
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
      StartServiceModal: true,
    })
  }
  batchStopService() {
    this.setState({
      StopServiceModal: true,
    })
  }
  batchRestartService(item) { // 炎黃
    this.setState({
      RestarServiceModal: true,
      rebootItem: item,
    })
  }
  batchQuickRestartService() {
    this.setState({
      QuickRestarServiceModal: true,
    })
  }
  batchDeleteServices() {
    const { serviceList, cluster, getDeploymentOrAppCDRule: newgetDeploymentOrAppCDRule }
    = this.props
    const checkList = serviceList.filter(item => item.checked)
    if (checkList && checkList.length > 0) {
      const name = checkList.map(service => service.metadata.name).join(',')
      newgetDeploymentOrAppCDRule(cluster, 'service', name)
    }
    this.setState({
      DeleteServiceModal: true,
    })
  }

  handleStartServiceOk() {
    const self = this
    const { cluster, startServices: newStartServices, serviceList,
      // appName,
      intl } = this.props
    const formatMessage = intl
    const stoppedService = []
    const checkedServiceList = serviceList.filter(service => service.checked)
    checkedServiceList.map(service => {
      if (service.status.phase === 'Stopped') {
        stoppedService.push(service)
      }
      return {}
    })
    const serviceNames = stoppedService.map(service => service.metadata.name)
    const allServices = self.state.serviceList
    allServices.map(service => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Starting'
      }
      return {}
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList,
    })
    newStartServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            StartServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if (isResourcePermissionError(err)) {
            // 403 没权限判断 在App/index中统一处理 这里直接返回
            // return;
          } else {
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true,
      },
    })
  }
  handleStartServiceCancel() {
    this.setState({
      StartServiceModal: false,
    })
  }
  handleStopServiceOk() {
    const self = this
    const { cluster, stopServices: newstopServices, serviceList,
      // appName,
      intl } = this.props
    let checkedServiceList = serviceList.filter(service => service.checked)
    const runningServices = []
    if (this.state.currentShowInstance && !this.state.donotUserCurrentShowInstance) {
      checkedServiceList = [ this.state.currentShowInstance ]
    }
    checkedServiceList.map(service => {
      if (service.status.phase === 'Running' || service.status.phase === 'Pending' || service.status.phase === 'Starting' || service.status.phase === 'Deploying') {
        runningServices.push(service)
      }
      return {}
    })
    const serviceNames = runningServices.map(service => service.metadata.name)
    const allServices = self.state.serviceList
    allServices.map(service => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Stopping'
      }
      return {}
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(intl.formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList: allServices,
    })
    if (serviceNames.length < 1) {
      self.setState({
        StopServiceModal: false,
        runBtn: false,
        stopBtn: false,
        restartBtn: false,
      })
      const notification = new NotificationHandler()
      notification.error(intl.formatMessage(intlMsg.slcStopServer))
      return
    }
    newstopServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            StopServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if (isResourcePermissionError(err)) {
            // 403 没权限判断 在App/index中统一处理 这里直接返回
            // return;
          } else {
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true,
      },
    })
  }
  handleStopServiceCancel() {
    this.setState({
      StopServiceModal: false,
    })
  }
  handleRestarServiceOk() { // 炎黃更改
    const self = this
    const { rebootItem = {} } = this.state
    const { appName, cluster: yanhuangcluster } = rebootItem
    const { cluster, restartServices: newrestartServices, serviceList,
      // appName,
      intl, removeTerminal: newremoveTerminal, terminalList, loadServiceList: newloadServiceList }
      = this.props
    let checkedServiceList = serviceList.filter(
      // service => service.checked
      () => true
    )
    if (terminalList.length) {
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        newremoveTerminal(cluster, item.metadata.name)
      })
    }
    const runningServices = []

    if (this.state.currentShowInstance && !this.state.donotUserCurrentShowInstance) {
      checkedServiceList = [ this.state.currentShowInstance ]
    }
    checkedServiceList.map(service => {
      if (service.status.phase === 'Running' || service.status.phase === 'Pending') {
        runningServices.push(service)
      }
      return {}
    })
    let serviceNames = runningServices.map(service => service.metadata.name)
    const allServices = self.state.serviceList

    // if (serviceNames.length <= 0) {
    //   const noti = new NotificationHandler()
    //   noti.error(intl.formatMessage(intlMsg.noOperationServer))
    //   return
    // }

    allServices.map(service => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Redeploying'
      }
      return {}
    })
    self.setState({
      serviceList: allServices,
      RestarServiceModal: false,
    })
    serviceNames = [ rebootItem.metadata.name ]
    newrestartServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.setState({
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
            redeploybtn: false,
          })
          newloadServiceList(yanhuangcluster, appName)
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if (isResourcePermissionError(err)) {
            // 403 没权限判断 在App/index中统一处理 这里直接返回
            // return;
          } else {
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true,
      },
    })
  }
  handleRestarServiceCancel() {
    this.setState({
      RestarServiceModal: false,
    })
  }
  handleQuickRestarServiceOk() {
    const self = this
    const { cluster, quickRestartServices: newquickRestartServices, serviceList,
      //  appName,
      intl, removeTerminal: newremoveTerminal, terminalList } = this.props
    const checkedServiceList = serviceList.filter(service => service.checked)
    if (terminalList.length) {
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        newremoveTerminal(cluster, item.metadata.name)
      })
    }
    const runningServices = []

    checkedServiceList.map(service => {
      if (service.status.phase === 'Running') {
        runningServices.push(service)
      }
      return {}
    })
    const serviceNames = runningServices.map(service => service.metadata.name)
    const allServices = self.state.serviceList

    allServices.map(service => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Restarting'
      }
      return {}
    })
    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(intl.formatMessage(intlMsg.noOperationServer))
      return
    }
    self.setState({
      serviceList,
    })
    newquickRestartServices(cluster, serviceNames, {
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
        isAsync: true,
      },
      failed: {
        func: err => {
          if (isResourcePermissionError(err)) {
            // 403 没权限判断 在App/index中统一处理 这里直接返回
            // return;
          } else {
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
        isAsync: true,
      },
    })
  }
  handleQuickRestarServiceCancel() {
    this.setState({
      QuickRestarServiceModal: false,
    })
  }
  handleDeleteServiceOk() {
    const self = this
    const { cluster,
      //  appName, loadServiceList,

      deleteServices: newdeleteServices, intl, serviceList, removeTerminal: newremoveTerminal,
      terminalList } = this.props
    const checkedServiceList = serviceList.filter(service => service.checked)
    if (terminalList.length) {
      const deleteList = cloneDeep(checkedServiceList)
      deleteList.forEach(item => {
        newremoveTerminal(cluster, item.metadata.name)
      })
    }


    const serviceNames = []
    const releaseNames = []
    checkedServiceList.forEach(service => {
      serviceNames.push(service.metadata.name)
      const releaseName = service.metadata.labels.releaseName
      if (releaseName && !serviceNames.includes(releaseName)) {
        releaseNames.push(releaseName)
      }
    })
    const allServices = self.state.serviceList
    allServices.map(service => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        service.status.phase = 'Terminating'
      }
      return {}
    })
    self.setState({
      DeleteServiceModal: false,
      serviceList: allServices,
    })
    newdeleteServices(cluster, { services: serviceNames, releaseNames }, {
      success: {
        func: () => {
          self.loadServices(self.props)
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if (isResourcePermissionError(err)) {
            // 403 没权限判断 在App/index中统一处理 这里直接返回
            // return;
          } else {
            errorHandler(err, intl)
          }
          self.loadServices(self.props)
        },
        isAsync: true,
      },
    })
  }
  handleDeleteServiceCancel() {
    this.setState({
      DeleteServiceModal: false,
    })
  }
  /* batchDeleteServices() {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmDeleteServices(checkedServiceList)
  }*/

  /* confirmDeleteServices(serviceList, callback) {
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
      query,
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
      query,
    })
  }

  render() {
    const parentScope = this
    const {
      // modalShow,
      currentShowInstance,
      // serviceList,
      selectTab, rollingUpdateModalShow, configModal,
      manualScaleModalShow,
      // runBtn, stopBtn, restartBtn,
      grayscaleUpgradeModalVisible,
    } = this.state
    const {
      name,
      //  pathname, page,size, total,
      isFetching,
      loginUser, cluster, appName, loadServiceList: newloadServiceList, k8sServiceList,
      intl: { formatMessage }, serviceList,
    } = this.props
    const checkedServiceList = serviceList.filter(service => service.checked)
    // const checkedServiceNames = checkedServiceList.map(service => service.metadata.name)
    // const isChecked = (checkedServiceList.length > 0)
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
    // const operaMenu = (
    //   <Menu>
    //     <Menu.Item key="0" disabled={!redeploybtn}>
    //       <span onClick={this.batchRestartService}><i className="fa fa-undo" /> <FormattedMessage {...intlMsg.redeploy}/></span>
    //     </Menu.Item>
    //   </Menu>
    // );
    return (
      <div id="AppServiceList" style={{ padding: '10px 15px' }}>
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
        >
          {/* <div className="operaBox" key="serverList"> */}
          {/* <Title title={formatMessage(intlMsg.nameServerList, { appName })} /> */}
          {/* <Button
              size="large"
              type="primary"
              onClick={this.goAddService}
              style={{ backgroundColor: '#2db7f5' }}>
              <i className="fa fa-plus"></i>
              <FormattedMessage {...intlMsg.addServer}/>
            </Button>
            <Button size="large" onClick={this.batchStartService} disabled={!runBtn}>
              <i className="fa fa-play"></i>
              <FormattedMessage {...intlMsg.boot}/>
            </Button> */}
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
          {/* <Button size="large" onClick={this.batchStopService} disabled={!stopBtn}>
              <i className="fa fa-stop"></i>
              <FormattedMessage {...intlMsg.stop}/>
            </Button>
            <Button size="large" onClick={() => this.loadServices(this.props)} >
              <i className="fa fa-refresh"></i>
              <FormattedMessage {...intlMsg.refresh}/>
            </Button> */}
          <Modal title={formatMessage(intlMsg.stopAct)} visible={this.state.StopServiceModal}
            onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
          >
            <StateBtnModal serviceList={serviceList} scope={parentScope} state="Stopped" />
          </Modal>
          {/* <Button size="large" onClick={this.batchDeleteServices} disabled={!isChecked}>
              <i className="fa fa-trash"></i>
              <FormattedMessage {...intlMsg.delete}/>
            </Button> */}
          <Modal title={formatMessage(intlMsg.deleteAct)} visible={this.state.DeleteServiceModal}
            onOk={this.handleDeleteServiceOk} onCancel={this.handleDeleteServiceCancel}
          >
            <StateBtnModal serviceList={serviceList} scope={parentScope} state="Delete" cdRule={this.props.cdRule}/>
          </Modal>
          {/* <Button size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
              <i className="fa fa-bolt"></i>
              <FormattedMessage {...intlMsg.reboot}/>
            </Button> */}
          {/* <Modal title={formatMessage(intlMsg.rebootAct)} visible={this.state.QuickRestarServiceModal}
              onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
            >
              <StateBtnModal serviceList={serviceList} state="QuickRestar" />
            </Modal>
            <Dropdown overlay={operaMenu} trigger={[ 'click' ]}>
              <Button size="large" disabled={!isChecked}>
                <FormattedMessage {...intlMsg.more}/>
                <i className="fa fa-caret-down"></i>
              </Button>
            </Dropdown> */}
          {/* <div className="rightBox">
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
            <div style={{ clear: 'both' }}></div> */}
          {/* </div> */}
          <div className="appTitle">
            <div className="selectIconTitle commonTitle">
              <Checkbox checked={isAllChecked} onChange={this.onAllChange}
                disabled={serviceList.length < 1} />
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
            <div style={{ clear: 'both' }}></div>
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
            bindingDomains={this.props.bindingDomains} />
          <Modal
            title="垂直居中的对话框"
            visible={this.state.modalShow}
            className="AppServiceDetail"
            transitionName="move-right"
            onCancel={this.closeModal}
          >
            <AppServiceDetail
              appName={appName}
              scope={parentScope}
              funcs={funcs}
              selectTab={selectTab}
              serviceDetailmodalShow={this.state.modalShow}
              bpmShow={true}
              k8sServiceList={k8sServiceList}
              onClose={() => { this.setState({ modalShow: false }) }}
            />
          </Modal>
          {
            rollingUpdateModalShow ?
              <RollingUpdateModal
                parentScope={parentScope}
                cluster={cluster}
                appName={appName}
                visible={rollingUpdateModalShow}
                loadServiceList={newloadServiceList}
                service={currentShowInstance} />
              : null
          }
          {
            grayscaleUpgradeModalVisible &&
            <GrayscaleUpgradeModal
              cluster={cluster}
              appName={appName}
              loadServiceList={newloadServiceList}
              service={currentShowInstance}
              onCancel={() => this.setState({ grayscaleUpgradeModalVisible: false })}
            />
          }
          <ConfigModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={configModal}
            loadServiceList={newloadServiceList}
            service={currentShowInstance} />
          <ManualScaleModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={manualScaleModalShow}
            service={currentShowInstance}
            loadServiceList={newloadServiceList}
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
  const checkedList = serviceList.filter(service => service.checked)
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
    if (checkedList[0].status.phase === 'Pending') {
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
    checkedList.forEach(item => {
      if (item.status.phase === 'Running') {
        runCount++
      } else if (item.status.phase === 'Pending' || item.status.phase === 'Starting' || item.status.phase === 'Deploying') {
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
          restartBtn: true,
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
  const { query, pathname } = props.location || {}
  let { page, size, name } = query || {}
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
    total: 0,
  }
  const {
    serviceItems,
  } = state.services
  let targetServices
  if (serviceItems[cluster.clusterID] && serviceItems[cluster.clusterID][appName]) {
    targetServices = serviceItems[cluster.clusterID][appName]
  }
  let { serviceList, isFetching, total, availabilityNumber } = targetServices || defaultServices

  // 炎黄新加, 后人不要参考这些代码,都是屎!!!
  const {
    AppClusterServerList: oldAppClusterServerList = {},
  } = state.middlewareCenter
  const AppClusterServerList = cloneDeep(oldAppClusterServerList.data) || {}
  const olddata = AppClusterServerList.data || []
  delete AppClusterServerList.data
  serviceList = olddata.map(item => {
    return {
      ...AppClusterServerList,
      ...item,
    }
  })
  // console.log('炎黄服务详情', JSON.stringify(serviceList))
  const { getDeploymentOrAppCDRule: newgetDeploymentOrAppCDRule } = state.cicd_flow
  const defaultCDRule = {
    isFetching: false,
    result: {
      results: [],
    },
  }
  return {
    loginUser,
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
    cdRule: newgetDeploymentOrAppCDRule && newgetDeploymentOrAppCDRule.result
      ? newgetDeploymentOrAppCDRule : defaultCDRule,
  }
}

const HOCAppServiceList = connect(mapStateToProps, {
  loadServiceList,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAutoScale,
  getDeploymentOrAppCDRule,
  removeTerminal,
})(AppServiceList)

export default injectIntl(HOCAppServiceList, {
  withRef: true,
})
