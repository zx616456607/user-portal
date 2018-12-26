/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * AllServiceList.js page
 *
 * @author zhangtao
 * @date Friday June 1st 2018
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceList component
 *
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component } from 'react'
import { injectIntl,  } from 'react-intl'
import { Modal, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination, Input, Alert, Select, message  } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import isEmpty from 'lodash/isEmpty'
import AppServiceDetail from './AppServiceDetail'
import './style/AllService.less'
import { calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import {
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAllServices,
  loadAutoScale
} from '../../actions/services'
import { removeTerminal } from '../../actions/terminal'
import { deleteSetting, getSettingListfromserviceorapp } from '../../actions/alert'
import { getDeploymentOrAppCDRule } from '../../actions/cicd_flow'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, ANNOTATION_HTTPS } from '../../../constants'
import RollingUpdateModal from './AppServiceDetail/RollingUpdateModal'
import GrayscaleUpgradeModal from './AppServiceDetail/GrayscaleUpgradeModal'
import ConfigModal from './AppServiceDetail/ConfigModal'
import ManualScaleModal from './AppServiceDetail/ManualScaleModal'
import { parseServiceDomain } from '../parseDomain'
import ServiceStatus from '../TenxStatus/ServiceStatus'
import TipSvcDomain from '../TipSvcDomain'
import { addDeploymentWatch, removeDeploymentWatch } from '../../containers/App/status'
import { LABEL_APPNAME, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL, PAYMENT_REQUIRED_CODE } from '../../constants'
import StateBtnModal from '../StateBtnModal'
import errorHandler from '../../containers/App/error_handler'
import NotificationHandler from '../../components/Notification'
import { SERVICE_KUBE_NODE_PORT } from '../../../constants'
import CreateAlarm from './AlarmModal'
import CreateGroup from './AlarmModal/CreateGroup'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'
import { isResourcePermissionError } from '../../common/tools'
import ResourceBanner from '../../components/TenantManage/ResourceBanner/index'
import TenxIcon from '@tenx-ui/icon/es/_old'
import ServiceCommonIntl, { AllServiceListIntl } from './ServiceIntl'
import * as meshActions from '../../actions/serviceMesh'
import { getDeepValue } from '../../../client/util/util'
import TimeHover from '@tenx-ui/time-hover/lib'
const Option = Select.Option;
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const confirm = Modal.confirm

const MyComponent =  injectIntl(React.createClass({
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
        return
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
      return
    }

    if (checkedList.length > 1) {
      let runCount = 0
      let stopCount = 0
      let pending = 0
      checkedList.forEach((item, index) => {
        if(item.status.phase === 'Running') {
          runCount++
        }
        else if(item.status.phase === 'Pending' || item.status.phase === 'Starting' || item.status.phase === 'Deploying') {
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
      // handle state of serviceList
      handleStateOfServiceList(scope, serviceList)
    }
  },
  modalShow(item) {
    // e.stopPropagation()
    const {scope} = this.props;
    scope.setState({
      selectTab: null,
      modalShow: true,
      currentShowInstance: item,
      donotUserCurrentShowInstance: false, //fix LOT-275
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
      success:{
        func: (result) => {
          if(result.data) {
            if(Object.getOwnPropertyNames(result.data).length > 0) {
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
  showMonitoring(item){
    const { scope } = this.props
    scope.setState({
      selectTab: '#monitor',
      modalShow: true,
      currentShowInstance: item,
      donotUserCurrentShowInstance: false
    })
  },
  showAlert(item) {
    const { scope } = this.props
    scope.setState({alarmModal: true, currentShowInstance: item})
    setTimeout(()=> {
      document.getElementById('name').focus()
    },500)
  },
  renderGroupIcon(group){
    const { formatMessage } = this.props.intl
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
    const { formatMessage } = this.props.intl
    return (
      <Tooltip title={formatMessage(AllServiceListIntl.serviceloadBalance)}>
        <span className='standrand privateColor'>lb</span>
      </Tooltip>
    )
  },
  rendermeshIcon() {
    return (
      <span style={{ lineHeight: '16px' }} >
        <Tooltip title={this.props.intl.formatMessage(AllServiceListIntl.thisServiceOpenMesh)}>
        <TenxIcon
          type="mesh"
          style={{ color: '#2db7f5', height: '16px', width: '16px' }}
          className='meshIcon'
          />
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
    const { cluster, serviceList, loading, page, size, total,bindingDomains, bindingIPs, loginUser, scope } = this.props
    const { mesh = []} = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
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
      const ipv4 = getDeepValue(item, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      const ipv4Arr = ipv4 && JSON.parse(ipv4)
      const isDisabled = ipv4Arr && ipv4Arr.length <= item.spec.replicas || false
      const dropdown = (
        <Menu onClick={this.serviceOperaClick.bind(this, item)} style={{width: '100px'}} id="allservicelistDropdownMenu" className="allservicelistDropdownMenu">
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
                disabled={isRollingUpdate}
                title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}
              >
            {formatMessage(AllServiceListIntl.redeploy)}
            </Menu.Item>
            : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          <Menu.Item key="delete">
            {formatMessage(ServiceCommonIntl.delete)}
          </Menu.Item>
          <Menu.Divider key="baseline1" />
          <Menu.Item key="rollingUpdate"
            disabled={isDisabled}
            >
            {formatMessage(AllServiceListIntl.rollPublish)}
          </Menu.Item>
          <Menu.Item key="grayscaleUpgrade"
            disabled={isDisabled}
            >
            {formatMessage(AllServiceListIntl.grayPublish)}
          </Menu.Item>
          <SubMenu title={formatMessage(AllServiceListIntl.extend)} >
            <Menu.Item key="manualScale" style={{width:'102px'}} disabled={isRollingUpdate || isDisabled} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
              {formatMessage(AllServiceListIntl.standardExtend)}
            </Menu.Item>
            <Menu.Item key="autoScale" disabled={isRollingUpdate || isDisabled} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
            {formatMessage(AllServiceListIntl.autoScale)}
            </Menu.Item>
          </SubMenu>
          <SubMenu title={formatMessage(AllServiceListIntl.changeSet)}>
            <Menu.Item key="config" disabled={isRollingUpdate} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
              {formatMessage(AllServiceListIntl.changeConfig)}
            </Menu.Item>
            <Menu.Item key="basic" disabled={isRollingUpdate} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
              {formatMessage(AllServiceListIntl.changeEnv)}
            </Menu.Item>
            <Menu.Item key="ports" disabled={isRollingUpdate} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
              {formatMessage(AllServiceListIntl.changePort)}
            </Menu.Item>
            <Menu.Item key="livenessprobe" disabled={isRollingUpdate} title={isRollingUpdate && formatMessage(AllServiceListIntl.pleaseAfterRollOperation) || ''}>
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
            <Menu.Item key="serverTag" >
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
      let appName = ""
      if(item.metadata){
        appName = item.metadata.labels[LABEL_APPNAME]
      }

      let httpIcon = 'http'
      let lb = false
      let k8sSer = ''
      for (let k8sService of this.props.k8sServiceList) {
        if (k8sService && k8sService.metadata && item.metadata.name === k8sService.metadata.name) {
          if (k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_HTTPS] === 'true') {
            httpIcon = 'https'
          }
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
      const svcDomain = parseServiceDomain(item, bindingDomains,bindingIPs, k8sSer)
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
      const meshflag = (mesh.find(({name}) => name === item.metadata.name) || {} ).value
      const stackFlag = item.appStack
      const chartName = item.chartName
      if (volume || group || lb || meshflag || stackFlag || chartName){
        heightSize = '30px'
        lineHeightSize = '40px'
      }
      const os = item.spec.template.metadata.annotations.imagetagOs
      const arch = item.spec.template.metadata.annotations.imagetagArch
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
              (volume || group || lb || meshflag || stackFlag || os)
              && <div className='icon_container'>
                {
                  volume && <Tooltip title="该服务已添加存储" placement="top">
                    <span className='standrand volumeColor'>存</span>
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
                  chartName && <Tooltip title={`通过应用模板 ${chartName} 初始部署`} placement="top">
                    <span className='standrand volumeColor'>模</span>
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
          <div className="appname commonData">
            <Tooltip title={appName}>
              <Link to={`/app_manage/detail/${appName}`}>
                <span>{appName}</span>
              </Link>
            </Tooltip>
          </div>
          <div className="alarm commonData">
            <Tooltip title={formatMessage(AllServiceListIntl.checkMonitor)}>
              <TenxIcon type="manage-monitor" onClick={()=> this.showMonitoring(item)}/>
            </Tooltip>
            <Tooltip title={formatMessage(AllServiceListIntl.alarmSet)} onClick={()=> this.showAlert(item)}>
            <Icon type="notification" />
            </Tooltip>
          </div>
          <div className="image commonData">

            <Tooltip title={mirror} placement="topLeft">
              <span>{mirror}</span>
            </Tooltip>
          </div>
          <div className="service commonData allSvcListDomain">
            <TipSvcDomain
              svcDomain={svcDomain}
              parentNode='appBox'
              icon={httpIcon}
              serviceMeshflagListInfo={this.props.mesh}
              msaUrl={this.props.msaUrl}
              serviceName={item.metadata.name}
              />
          </div>
          <div className="createTime commonData">
            <TimeHover time={item.metadata.creationTimestamp} />
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              trigger={['hover']}
              onClick={() => this.modalShow(item)}>
              <Icon type="eye-o" />
              <span>{formatMessage(AllServiceListIntl.check)}</span>
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
}), {withRef: true,});

/*function loadServices(props) {
  const { cluster, loadAllServices, page, size, name } = props
  loadAllServices(cluster, {
    pageIndex: page,
    pageSize: size,
    name
  })
}*/

class ServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    /*this.confirmStartService = this.confirmStartService.bind(this)
    this.batchStopServices = this.batchStopServices.bind(this)
    this.confirmStopServices = this.confirmStopServices.bind(this)
    this.batchRestartServices = this.batchRestartServices.bind(this)*/
    // this.confirmRestartServices = this.confirmRestartServices.bind(this)
    // this.batchDeleteServices = this.batchDeleteServices.bind(this)
    // this.confirmDeleteServices = this.confirmDeleteServices.bind(this)
    // this.confirmQuickRestartService = this.confirmQuickRestartService.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    // this.showRollingUpdateModal = this.showRollingUpdateModal.bind(this)
    // this.showConfigModal = this.showConfigModal.bind(this)
    // this.showManualScaleModal = this.showManualScaleModal.bind(this)
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
    this.cancelModal = this.cancelModal.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.handleCheckboxvalue = this.handleCheckboxvalue.bind(this)
    this.handleSearchNameOrLabel = this.handleSearchNameOrLabel.bind(this)
    this.selectSearchType = this.selectSearchType.bind(this)
    this.searchServiceKey = this.searchServiceKey.bind(this)
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
      selectTab: '#autoScale',
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      redeploybtn: false,
      StartServiceModal: false,
      StopServiceModal: false,
      RestarServiceModal: false,
      QuickRestarServiceModal: false,
      DeleteServiceModal: false,
      detail: false,
      k8sServiceList: [],
      step:1 ,// create alarm step
      alarmStrategy: true,
      grayscaleUpgradeModalVisible: false,
      showPlaceholder: this.props.intl.formatMessage(AllServiceListIntl.serviceNameSearch),
      showInpVal: '',
      documentTitle: this.props.intl.formatMessage(AllServiceListIntl.documentTitle),
      mesh: undefined,
    }
  }
  getInitialState() {
    return {
      disableScale: false
    }
  }
  loadServices(nextProps, options, openModal) {
    const self = this
    const { cluster, loadAllServices, page, size, name, label } = nextProps || this.props
    const query = {
      pageIndex: page,
      pageSize: size,
      name,
      label
    }
    this.reloadServiceMesh()
    if(name) {
      this.setState({
        searchInputValue: name
      })
    }
    query.customizeOpts = options
    return new Promise(resolve => {
      loadAllServices(cluster, query, {
        success: {
          func: (result) => {
            resolve()
            // Add deploment status watch, props must include statusWatchWs!!!
            let { services } = result.data
            let deployments = services.map(service => service.deployment)
            let k8sServiceList = services.map(service => service.service)
            this.setState({
              k8sServiceList,
            })
            addDeploymentWatch(cluster, self.props, deployments)
            // For fix issue #CRYSTAL-1604(load list again for update status)
            clearTimeout(self.loadStatusTimeout)
            query.customizeOpts = {
              keepChecked: true,
            }
            self.loadStatusTimeout = setTimeout(() => {
              loadAllServices(cluster, query)
            }, LOAD_STATUS_TIMEOUT)
          },
          isAsync: true
        }
      })
    })
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
  async componentDidMount() {
    const { serName } = this.props
    await this.loadServices().then(() => {
      if (serName) {
        const { serviceList } = this.props
        if (serName && serviceList) {
          this.setState({
            currentShowInstance: serviceList.filter((item)=>item.metadata.name === serName)[0],
            selectTab: null,
            modalShow: true,
          },()=>{
            browserHistory.replace('/app_manage/service')
          })
        }
      }
    })
    // Reload list each UPDATE_INTERVAL
    this.upStatusInterval = setInterval(() => {
      this.loadServices(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
    // getServiceListServiceMeshStatus (
    await  this.reloadServiceMesh()
  }
  reloadServiceMesh = async () => {
    const serviceNames = this.props.serviceList.map(({ metadata: { name } = {}}) => name)
    let ServiceListmeshResult
    try{
      ServiceListmeshResult =
      await this.props.getServiceListServiceMeshStatus(this.props.cluster, serviceNames)
    } catch(e) {
      const notification = new NotificationHandler()
      notification.error({message:'获取服务网格状态出错'})
    }
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
  componentWillReceiveProps(nextProps) {
    let { page, size, name, label, serviceList } = nextProps
    this.setState({
      serviceList: serviceList,
    })
    if (page === this.props.page && size === this.props.size && name === this.props.name && label === this.props.label) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadServices(nextProps)
  }
  batchStartService(e) {
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
    const { serviceList, cluster, getDeploymentOrAppCDRule, getSettingListfromserviceorapp } = this.props
    const checkList = serviceList.filter(item => item.checked)
    if(checkList && checkList.length > 0) {
      const name = checkList.map(service => service.metadata.name).join(',')
      getDeploymentOrAppCDRule(cluster, 'service', name)
      const query = {
        targetNames: name,
      }
      getSettingListfromserviceorapp(query, cluster)
    }
    this.setState({
      DeleteServiceModal: true,
      alarmStrategy: true,
    })
  }
  handleStartServiceOk() {
    const self = this
    const { cluster, startServices, serviceList, intl } = this.props
    const { formatMessage } = intl
    let stoppedService = []
    let checkedServiceList = serviceList.filter((service) => service.checked)
    if (this.state.currentShowInstance && !this.state.donotUserCurrentShowInstance) {
      checkedServiceList = [this.state.currentShowInstance]
    }
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
      noti.error(formatMessage(AllServiceListIntl.cannotOperationService))
      return
    }
    self.setState({
      serviceList: allServices
    })
    this.setState({
      StartServiceModal: false,
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
    })
    startServices(cluster, serviceNames, {
      success: {
        func: () => {
          // this.setState({
          //   StartServiceModal: false,
          //   runBtn: false,
          //   stopBtn: false,
          //   restartBtn: false,
          // })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if(statusCode !== PAYMENT_REQUIRED_CODE){
            if(isResourcePermissionError(err)){
              //403 没权限判断 在App/index中统一处理 这里直接返回
              //return;
            }else{
              errorHandler(err, intl)
            }
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
    const { cluster, stopServices, serviceList, intl } = this.props
    const { formatMessage } = intl
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
      noti.error(formatMessage(AllServiceListIntl.cannotOperationService))
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
      notification.error(formatMessage(AllServiceListIntl.choiceStopService))
      return
    }
    this.setState({
      StopServiceModal: false,
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
    })
    stopServices(cluster, serviceNames, {
      success: {
        func: () => {
          // this.setState({
          //   StopServiceModal: false,
          //   runBtn: false,
          //   stopBtn: false,
          //   restartBtn: false,
          // })
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
    const { cluster, restartServices, serviceList, intl, removeTerminal, terminalList } = this.props
    const { formatMessage } = intl
    let servicesList = serviceList

    let checkedServiceList = servicesList.filter((service) => service.checked)
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
      if (service.status) {
        if (service.status.phase === 'Running' || service.status.phase === 'Pending') {
          runningServices.push(service)
        }
      }
    })
    const serviceNames = runningServices.map((service) => service.metadata.name)
    const allServices = self.state.serviceList

    if (serviceNames.length <= 0) {
      const noti = new NotificationHandler()
      noti.error(formatMessage(AllServiceListIntl.cannotOperationService))
      return
    }

    allServices.map((service) => {
      if (serviceNames.indexOf(service.metadata.name) > -1) {
        if (service.status) {
          service.status.phase = 'Redeploying'
        }
      }
    })
    self.setState({
      serviceList: allServices,
      RestarServiceModal: false,
    })
    this.setState({
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      redeploybtn: false,
    })
    restartServices(cluster, serviceNames, {
      success: {
        func: () => {
          // this.setState({
          //   runBtn: false,
          //   stopBtn: false,
          //   restartBtn: false,
          //   redeploybtn: false,
          // })
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
    const { cluster, quickRestartServices, serviceList, intl, removeTerminal, terminalList } = this.props
    const { formatMessage } = intl
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
      noti.error(formatMessage(AllServiceListIntl.cannotOperationService))
      return
    }
    self.setState({
      serviceList
    })
    this.setState({
      QuickRestarServiceModal: false,
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
    })
    quickRestartServices(cluster, serviceNames, {
      success: {
        func: () => {
          // this.setState({
          //   QuickRestarServiceModal: false,
          //   runBtn: false,
          //   stopBtn: false,
          //   restartBtn: false,
          // })
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
          this.setState({
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
    const { cluster, appName, loadAllServices, deleteServices, intl, serviceList, deleteSetting, SettingListfromserviceorapp, removeTerminal, terminalList } = this.props
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
      if (releaseName && !releaseNames.includes(releaseName) && !service.appStack) {
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
      runBtn:false,
      stopBtn:false,
      isChecked:false,
      restartBtn:false,
      serviceList: allServices
    })
    deleteServices(cluster, {services: serviceNames, releaseNames}, {
      success: {
        func: () => {
          self.loadServices(self.props)

          const { alarmStrategy } = self.state
          if(alarmStrategy){
            let strategyID = []
            let strategyName = []
            let strategyList = SettingListfromserviceorapp.result || []
            strategyList.forEach((item, index) => {
              strategyID.push(item.strategyID)
              strategyName.push(item.strategyName)
            })
            strategyID.length > 0 && deleteSetting(cluster, strategyID, strategyName)
          }
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
  /*batchDeleteServices(e) {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmDeleteServices(checkedServiceList)
  }
  confirmDeleteServices(serviceList, callback) {
    const self = this
    const { cluster, loadAllServices, deleteServices, intl } = this.props
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
          if (serviceNames.length <= 0) {
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
  searchServices() {
    const { page, size, name, pathname } = this.props
    if (this.state.searchInputValue != name) {
      const query = { page, size, name: this.state.searchInputValue,  }
      browserHistory.push({
        pathname,
        query
      })
    }
  }
  searchServiceKey() {
    const {searchInputValue} = this.state
    const { page, size, pathname } = this.props
      let label = searchInputValue
      const query = { page, size, label }
      browserHistory.push({
        pathname,
        query
      })
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
  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
    this.state.resetFields()
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }
  handleCheckboxvalue(obj){
    if(obj){
      this.setState({
        alarmStrategy: obj.checkedvalue
      })
    }
  }
  handleSearchNameOrLabel(value) {
    const {formatMessage} = this.props.intl
    const serviceName = formatMessage(AllServiceListIntl.serviceName)
    const serviceTagButton = formatMessage(AllServiceListIntl.serviceTagButton)
    switch (value) {
      case serviceName:
        return this.setState({
          showPlaceholder: formatMessage(AllServiceListIntl.serviceNameSearch)
        })
      case serviceTagButton:
        return this.setState({
          showPlaceholder: formatMessage(AllServiceListIntl.serviceTagButtonSearch)
        })
      default:
        return null
    }
  }
  selectSearchType() {
    const {showPlaceholder} = this.state
    const {formatMessage} = this.props.intl
    const serviceNameSearch = formatMessage(AllServiceListIntl.serviceNameSearch)
    const serviceTagButtonSearch = formatMessage(AllServiceListIntl.serviceTagButtonSearch)
    switch (showPlaceholder) {
      case serviceNameSearch:
        return this.searchServices()
      case serviceTagButtonSearch:
        return  this.searchServiceKey()
      default:
        return this.searchServices()
    }
  }
  render() {
    const parentScope = this
    const { formatMessage }= this.props.intl
    let {
      modalShow, selectTab,
      currentShowInstance,
      serviceList,
      rollingUpdateModalShow,
      configModal,
      manualScaleModalShow,
      runBtn, stopBtn, restartBtn,
      redeploybtn,
      grayscaleUpgradeModalVisible,
      showPlaceholder,
      documentTitle,
    } = this.state
    const {
      pathname, page, size, total, isFetching, cluster,
      loadAllServices, loginUser, SettingListfromserviceorapp,
    } = this.props
    let appName = ''
    if (this.state.currentShowInstance) {
      appName = this.state.currentShowInstance.metadata.labels['system/appName']
    }
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    const isChecked = (checkedServiceList.length > 0)
    let isAllChecked = (serviceList.length === checkedServiceList.length)
    if (serviceList.length === 0) {
      isAllChecked = false
    }
    // currentShowInstance = checkedServiceList[0]
    const funcs = {
      handleRestarServiceOk: this.handleRestarServiceOk,
      batchRestartService: this.batchRestartService,
      batchStopService: this.batchStopService,
      batchDeleteServices: this.batchDeleteServices,
      batchStartService: this.batchStartService,
      // confirmStopServices: this.confirmStopServices,
      // confirmDeleteServices: this.confirmDeleteServices,
    }
    const operaMenua = (
      <Menu>
        <Menu.Item key="0" disabled={!restartBtn}>
          <span className="Moreoperation" onClick={this.batchQuickRestartService}><i className="fa fa-bolt"></i>{formatMessage(ServiceCommonIntl.reboot)}</span>
        </Menu.Item>
        <Menu.Item key="1" disabled={!redeploybtn}>
          <span className="Moreoperation" onClick={this.batchRestartService}><i className='fa fa-undo' />{formatMessage(AllServiceListIntl.redeploy)}</span>
        </Menu.Item>
      </Menu>
    );
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    const selectBefore = (
      <Select defaultValue={formatMessage(AllServiceListIntl.serviceName)} style={{ width: 90 }} onChange={this.handleSearchNameOrLabel}>
        <Option value={formatMessage(AllServiceListIntl.serviceName)}>{formatMessage(AllServiceListIntl.serviceName)}</Option>
        <Option value={formatMessage(AllServiceListIntl.serviceTagButton)}>{formatMessage(AllServiceListIntl.serviceTagButton)}</Option>
      </Select>
    );
    return (
      <div id="AppServiceList">
        <Title title={documentTitle} />
        <ResourceBanner resourceType='service'/>
        <QueueAnim className="demo-content">
          <div key='animateBox'>
          <div className='operationBox operationBoxa'>
            <div className='leftBox'>
              <Button type='ghost' size='large' onClick={this.batchStartService} disabled={!runBtn}>
                <i className='fa fa-play'></i>{formatMessage(ServiceCommonIntl.start)}
              </Button>
              <Modal title={formatMessage(AllServiceListIntl.reStartOperation)} visible={this.state.RestarServiceModal}
                onOk={this.handleRestarServiceOk} onCancel={this.handleRestarServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} scope={parentScope} state='Restart' />
              </Modal>
              <Modal title={formatMessage(AllServiceListIntl.startOperation)} visible={this.state.StartServiceModal}
                onOk={this.handleStartServiceOk} onCancel={this.handleStartServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} scope={parentScope} state='Running' />
              </Modal>
              <Button type='ghost' size='large' onClick={this.batchStopService} disabled={!stopBtn}>
                <i className='fa fa-stop'></i>{formatMessage(ServiceCommonIntl.stop)}
              </Button>
              <Modal title={formatMessage(AllServiceListIntl.stopOperation)} visible={this.state.StopServiceModal}
                onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} scope={parentScope} state='Stopped' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.loadServices(this.props)}>
                <i className='fa fa-refresh'></i>{formatMessage(ServiceCommonIntl.refresh)}
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteServices} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>{formatMessage(ServiceCommonIntl.delete)}
              </Button>
              <Modal title={formatMessage(AllServiceListIntl.deleteOperation)} visible={this.state.DeleteServiceModal}
                onOk={this.handleDeleteServiceOk} onCancel={this.handleDeleteServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} state='Delete' cdRule={this.props.cdRule} callback={this.handleCheckboxvalue} settingList={SettingListfromserviceorapp}/>
              </Modal>
              <Button type='ghost' size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
                <i className="fa fa-bolt"></i>{formatMessage(ServiceCommonIntl.reboot)}
              </Button>
              <Modal title={formatMessage(AllServiceListIntl.rebootOperation)} visible={this.state.QuickRestarServiceModal}
                onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} state='QuickRestar' />
              </Modal>

              <Button type='ghost' size='large' onClick={this.batchRestartService} disabled={!redeploybtn}>
                <i className='fa fa-undo' />{formatMessage(AllServiceListIntl.redeploy)}
              </Button>

            </div>
            <div className='rightBox'>
              <div className='littleLeft'>
                <i className='fa fa-search' onClick={() => this.selectSearchType()}></i>
              </div>
              <div className='littleRight'>
                {/* <Input
                  size='large'
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={this.state.searchInputValue}
                  placeholder='按服务名称搜索'
                  style={{paddingRight: '28px'}}
                  onPressEnter={() => this.searchServices()} /> */}

                  <Input
                    size='large'
                    className='selectInp'
                    addonBefore={selectBefore}
                    onChange={(e) => {
                      this.setState({
                        searchInputValue: e.target.value,
                      })
                    }}
                    value={this.state.searchInputValue}
                    placeholder={showPlaceholder}
                    style={{paddingRight: '28px'}}
                    onPressEnter={() => this.selectSearchType()}
                    />

              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'>{formatMessage(ServiceCommonIntl.common)} {total}
              {formatMessage(ServiceCommonIntl.page)}</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={this.onPageChange}
                  onShowSizeChange={this.onShowSizeChange}
                  current={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>}
            <div style={{ clear: 'both' }}></div>
          </div>

          <div className='operationBox operationBoxb'>
            <div className='leftBox'>
              <Button type='ghost' size='large' onClick={this.batchStartService} disabled={!runBtn}>
                <i className='fa fa-play'></i>{formatMessage(ServiceCommonIntl.start)}
              </Button>
              <Button type='ghost' size='large' onClick={this.batchStopService} disabled={!stopBtn}>
                <i className='fa fa-stop'></i>{formatMessage(ServiceCommonIntl.stop)}
              </Button>
              <Button type='ghost' size='large' onClick={() => this.loadServices(this.props)}>
                <i className='fa fa-refresh'></i>{formatMessage(ServiceCommonIntl.refresh)}
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteServices} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>{formatMessage(ServiceCommonIntl.delete)}
              </Button>
              <Dropdown overlay={operaMenua} trigger={['click']}>
                <Button size="large" disabled={!isChecked}>
                  {formatMessage(ServiceCommonIntl.moreOperation)}<i className="fa fa-caret-down Arrow"></i>
                </Button>
              </Dropdown>
            </div>
            <div className='rightBox'>
              <div className='littleLeft'>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                {/* <Input
                  size='large'
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={this.state.searchInputValue}
                  placeholder='按服务名称搜索'
                  style={{paddingRight: '28px'}}
                  onPressEnter={() => this.searchServices()} /> */}
                  <Input
                    size='large'
                    className='selectInp'
                    addonBefore={selectBefore}
                    onChange={(e) => {
                      this.setState({
                        searchInputValue: e.target.value,
                      })
                    }}
                    value={this.state.searchInputValue}
                    placeholder={showPlaceholder}
                    style={{paddingRight: '28px'}}
                    onPressEnter={() => this.selectSearchType()}
                    />
              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'>{formatMessage(ServiceCommonIntl.common)} {total}
              {formatMessage(ServiceCommonIntl.page)}</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={this.onPageChange}
                  onShowSizeChange={this.onShowSizeChange}
                  current={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>}
            <div style={{ clear: 'both' }}></div>
          </div>

          <Card className='appBox'>
            <div className='appTitle'>
              <div className="selectIconTitle commonTitle">
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={serviceList.length < 1}></Checkbox>
              </div>
              <div className='name commonTitle'>
                {formatMessage(AllServiceListIntl.serviceName)}
              </div>
              <div className='status commonTitle'>
                {formatMessage(ServiceCommonIntl.status)}
              </div>
              <div className='appname commonTitle'>
                {formatMessage(AllServiceListIntl.appName)}
              </div>
              <div className='alarm commonTitle'>
                {formatMessage(AllServiceListIntl.alarm)}
              </div>
              <div className='image commonTitle'>
                {formatMessage(AllServiceListIntl.image)}
              </div>
              <div className='service commonTitle'>
                {formatMessage(AllServiceListIntl.serviceAddress)}
              </div>
              <div className='createTime commonTitle'>
                {formatMessage(AllServiceListIntl.createTime)}
              </div>
              <div className='actionBox commonTitle'>
                {formatMessage(ServiceCommonIntl.operation)}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>

            <MyComponent
              cluster={cluster}
              loginUser={loginUser}
              name={name}
              scope={parentScope}
              serviceList={serviceList}
              loading={isFetching}
              bindingDomains={this.props.bindingDomains}
              bindingIPs={this.props.bindingIPs}
              k8sServiceList={this.state.k8sServiceList}
              mesh={this.state.mesh}
              msaUrl={this.props.msaUrl}
               />
          </Card>
          </div>
          <Modal title={formatMessage(AllServiceListIntl.createAlarmStrategy)} visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal: false, step: 1,})}
            maskClosable={false}
            footer={null}

          >
            <CreateAlarm createBy={'service'} funcs={modalFunc} currentService={currentShowInstance} isShow={this.state.alarmModal}/>
          </Modal>
           {/* 通知组 */}
          <Modal title={formatMessage(AllServiceListIntl.createNotification)} visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
          <CreateGroup funcs={modalFunc} shouldLoadGroup={true}/>
          </Modal>
          <Modal
            title={formatMessage(AllServiceListIntl.verticalMiddleModal)}
            visible={this.state.modalShow}
            className='AppServiceDetail'
            transitionName='move-right'
            onCancel={this.closeModal}
            >
            {
              modalShow &&
              <AppServiceDetail
                appName={appName}
                scope={parentScope}
                funcs={funcs}
                loadServices={()=>this.loadServices(this.props)}
                selectTab={selectTab}
                serviceDetailmodalShow={this.state.modalShow}
                page={page}
                size={size}
                name={this.props.name}
                onClose={this.closeModal}
                mesh={this.state.mesh}
                msaUrl={this.props.msaUrl}
                k8sServiceList={this.state.k8sServiceList}
              />
            }
          </Modal>
          {
            rollingUpdateModalShow ?
            <RollingUpdateModal
              parentScope={parentScope}
              cluster={cluster}
              appName={appName}
              visible={rollingUpdateModalShow}
              loadServiceList={() => this.loadServices(this.props)}
              service={currentShowInstance} />
            :null
          }
          {
            grayscaleUpgradeModalVisible &&
            <GrayscaleUpgradeModal
              cluster={cluster}
              appName={appName}
              service={currentShowInstance}
              loadServiceList={() => this.loadServices(this.props)}
              onCancel={() => this.setState({ grayscaleUpgradeModalVisible: false })}
            />
          }
          <ConfigModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={configModal}
            loadServiceList={() => this.loadServices(this.props)}
            service={currentShowInstance} />
          <ManualScaleModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={manualScaleModalShow}
            service={currentShowInstance}
            disableScale={this.state.disableScale}
            loadServiceList={() => this.loadServices(this.props)} />
        </QueueAnim>
      </div>
    )
  }
}

function handleStateOfServiceList (scope, serviceList) {
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
      return
    }
    if (checkedList[0].status.phase === 'Stopped') {
      scope.setState({
        runBtn: true,
        stopBtn: false,
        restartBtn: false,
        redeploybtn: false,
      })
      return
    }
    if (checkedList[0].status.phase === 'Starting' || checkedList[0].status.phase === 'Deploying') {
      scope.setState({
        runBtn: false,
        stopBtn: true,
        restartBtn: true,
        redeploybtn: true,
      })
    }
  }
  if (checkedList.length > 1) {
    let runCount = 0
    let stopCount = 0
    let pending = 0
    checkedList.map((item, index) => {
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
  scope.setState({
    serviceList
  })
}

function mapStateToProps(state, props) {
  const { query, pathname } = props.location
  let { page, size, name,serName, label } = query
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const { SettingListfromserviceorapp } = state.alert
  const { loginUser } = state.entities
  const { cluster } = state.entities.current
  const { statusWatchWs } = state.entities.sockets
  const { services, isFetching, total } = state.services.serviceList
  const { getDeploymentOrAppCDRule } = state.cicd_flow
  const { terminal } = state
  const terminalList = terminal.list[cluster.clusterID] || []
  const defaultCDRule = {
    isFetching: false,
    result: {
      results: []
    }
  }
  const { entities: { loginUser: { info: { msaConfig: {url:msaUrl} = {} } } = {} } = {} } = state
  if (services) {
    services.forEach(service => {
      service.appStack = getDeepValue(service, [ 'metadata', 'labels', 'system/appstack' ])
    })
  }
  return {
    loginUser: loginUser,
    cluster: cluster.clusterID,
    statusWatchWs,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    currentCluster: cluster,
    name,
    label,
    pathname,
    page,
    size,
    total,
    serName,
    serviceList: services || [],
    terminalList,
    isFetching,
    cdRule: getDeploymentOrAppCDRule && getDeploymentOrAppCDRule.result ? getDeploymentOrAppCDRule :  defaultCDRule,
    SettingListfromserviceorapp,
    msaUrl,
  }
}

ServiceList = connect(mapStateToProps, {
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAllServices,
  loadAutoScale,
  getDeploymentOrAppCDRule,
  deleteSetting,
  getSettingListfromserviceorapp,
  removeTerminal,
  getServiceListServiceMeshStatus: meshActions.getServiceListServiceMeshStatus,
})(ServiceList)

export default injectIntl(ServiceList, {
  withRef: true,
})
