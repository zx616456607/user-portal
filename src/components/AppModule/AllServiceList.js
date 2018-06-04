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
import React, { Component, PropTypes } from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Modal, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination, Input, Alert, Select  } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import isEmpty from 'lodash/isEmpty'
import AppServiceDetail from './AppServiceDetail'
import './style/AllService.less'
import { calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import {
  addService,
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
import yaml from 'js-yaml'
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

const Option = Select.Option;
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
    if(!group || !group.id || group.type == 'none'){
      return <span></span>
    }
    if(group.id == "mismatch"){
      return <Tooltip title='网络出口已删除'>
        <span className='standrand netcolor'>网</span>
      </Tooltip>

    }
    switch(group.type){
      case 'private':
        return <Tooltip title='该服务可内网访问（通过集群网络出口）'>
          <span className='standrand privateColor'>内</span>
        </Tooltip>
      case 'public':
        return <Tooltip title='该服务可公网访问（通过集群网络出口）'>
          <span className='standrand publicColor'>公</span>
        </Tooltip>
      default:
        return <span></span>
    }
  },
  renderLBIcon() {
    return (
      <Tooltip title='该服务可被访问（通过应用负载均衡 LB ）'>
        <span className='standrand privateColor'>lb</span>
      </Tooltip>
    )
  },
  render: function () {
    const { cluster, serviceList, loading, page, size, total,bindingDomains, bindingIPs, loginUser, scope } = this.props
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
          <Icon type="frown"/>&nbsp;暂无数据
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
      const dropdown = (
        <Menu onClick={this.serviceOperaClick.bind(this, item)} style={{width: '100px'}} id="allservicelistDropdownMenu">
          {
            item.status.phase == "Stopped"
            ? <Menu.Item key="start">
              启动
            </Menu.Item>
            : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            item.status.phase == "Running" || item.status.phase == 'Pending'
            ?<Menu.Item key="stop">
              停止
            </Menu.Item>
            : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            item.status.phase == "Running"
            ? <Menu.Item key="restart">
              重启
            </Menu.Item>
            : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          {
            redeployDisable
            ? <Menu.Item
                key="batchRestartService"
                disabled={isRollingUpdate}
                title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}
              >
            重新部署
            </Menu.Item>
            : <Menu.Item style={{display:'none'}}></Menu.Item>
          }
          <Menu.Item key="delete">
            删除
          </Menu.Item>
          <Menu.Divider key="baseline1" />
          <Menu.Item key="rollingUpdate" >
            滚动发布
          </Menu.Item>
          <Menu.Item key="grayscaleUpgrade">
             灰度发布
          </Menu.Item>
          <SubMenu title="扩展">
            <Menu.Item key="manualScale" style={{width:'102px'}} disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              水平扩展
            </Menu.Item>
            <Menu.Item key="autoScale" disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              自动伸缩
            </Menu.Item>
          </SubMenu>
          <SubMenu title="变更设置">
            <Menu.Item key="config" disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              更改配置
            </Menu.Item>
            <Menu.Item key="basic" disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              修改环境变量
            </Menu.Item>
            <Menu.Item key="ports" disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              修改端口
            </Menu.Item>
            <Menu.Item key="livenessprobe" disabled={isRollingUpdate} title={isRollingUpdate && '请在灰度升级完成或回滚后操作' || ''}>
              设置高可用
            </Menu.Item>
          </SubMenu>
          <SubMenu title="更多设置">
            <Menu.Item key="binddomain" style={{width:'102px'}}>
              绑定域名
            </Menu.Item>
            <Menu.Item key="https" disabled={loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT}>
              设置HTTPS
            </Menu.Item>
          </SubMenu>
            <Menu.Item key="serverTag" >
              服务标签
            </Menu.Item>
        </Menu>
      );
      const svcDomain = parseServiceDomain(item, bindingDomains,bindingIPs)
      const images = item.spec.template.spec.containers.map(container => {
        return container.image
      })
      let appName = ""
      if(item.metadata){
        appName = item.metadata.labels[LABEL_APPNAME]
      }

      let httpIcon = 'http'
      let lb = false
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
            }
          }
          break
        }
      }
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
      if(volume || group || lb){
        heightSize = '30px'
        lineHeightSize = '40px'
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
              (volume || group || lb) && <div className='icon_container'>
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
            <Tooltip title="查看监控">
            <svg className="managemoniter" onClick={()=> this.showMonitoring(item)}>
              <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#managemoniter"></use>
            </svg>
            </Tooltip>
            <Tooltip title="告警设置" onClick={()=> this.showAlert(item)}>
            <Icon type="notification" />
            </Tooltip>
          </div>
          <div className="image commonData">
            <Tooltip title={images.join(', ') ? images.join(', ') : ""} placement="topLeft">
              <span>{images.join(', ') || '-'}</span>
            </Tooltip>
          </div>
          <div className="service commonData allSvcListDomain">
            <TipSvcDomain svcDomain={svcDomain} parentNode='appBox' icon={httpIcon} />
          </div>
          <div className="createTime commonData">
            <span>{calcuDate(item.metadata.creationTimestamp || '')}</span>
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              trigger={['hover']}
              onClick={() => this.modalShow(item)}>
              <Icon type="eye-o" />
              <span>查看</span>
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
      showPlaceholder: '按服务名称搜索',
      showInpVal: ''
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

  componentDidMount() {
    const { serName } = this.props
    this.loadServices().then(() => {
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
      noti.error('没有可以操作的服务')
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
      noti.error('没有可以操作的服务')
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
      notification.error('请选择要停止的服务')
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
      noti.error('没有可以操作的服务')
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
      noti.error('没有可以操作的服务')
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
      if (releaseName && !releaseNames.includes(releaseName)) {
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
      modalShow: false
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
    switch (value) {
      case '服务名称':
        return this.setState({
          showPlaceholder: '按服务名称搜索'
        })
      case '服务标签键':
        return this.setState({
          showPlaceholder: '按服务标签键搜索'
        })
      default:
        return null
    }
  }
  selectSearchType() {
    const {showPlaceholder} = this.state
    switch (showPlaceholder) {
      case '按服务名称搜索':
        return this.searchServices()
      case '按服务标签键搜索':
        return  this.searchServiceKey()
      default:
        return this.searchServices()
    }
  }
  render() {
    const parentScope = this
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
      showPlaceholder
    } = this.state
    const {
      pathname, page, size, total, isFetching, cluster,
      loadAllServices, loginUser, SettingListfromserviceorapp
    } = this.props
    let appName = ''
    if (this.state.currentShowInstance) {
      appName = this.state.currentShowInstance.metadata.labels['tenxcloud.com/appName']
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
      // confirmStopServices: this.confirmStopServices,
      // confirmDeleteServices: this.confirmDeleteServices,
    }
    const operaMenu = (
      <Menu>
        <Menu.Item key="0" disabled={!redeploybtn}>
          <span className="Moreoperation" onClick={this.batchRestartService}><i className='fa fa-undo' /> 重新部署</span>
        </Menu.Item>
      </Menu>
    );
    const operaMenua = (
      <Menu>
        <Menu.Item key="0" disabled={!restartBtn}>
          <span className="Moreoperation" onClick={this.batchQuickRestartService}><i className="fa fa-bolt"></i> 重启</span>
        </Menu.Item>
        <Menu.Item key="1" disabled={!redeploybtn}>
          <span className="Moreoperation" onClick={this.batchRestartService}><i className='fa fa-undo' /> 重新部署</span>
        </Menu.Item>
      </Menu>
    );
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    const selectBefore = (
      <Select defaultValue="服务名称" style={{ width: 90 }} onChange={this.handleSearchNameOrLabel}>
        <Option value="服务名称">服务名称</Option>
        <Option value="服务标签键">服务标签键</Option>
      </Select>
    );
    return (
      <div id="AppServiceList">
        <Title title="服务列表" />
        <QueueAnim className="demo-content">
          <div key='animateBox'>
          <div className='operationBox operationBoxa'>
            <div className='leftBox'>
              <Button type='ghost' size='large' onClick={this.batchStartService} disabled={!runBtn}>
                <i className='fa fa-play'></i>启动
              </Button>
              <Modal title="重新部署操作" visible={this.state.RestarServiceModal}
                onOk={this.handleRestarServiceOk} onCancel={this.handleRestarServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} scope={parentScope} state='Restart' />
              </Modal>
              <Modal title="启动操作" visible={this.state.StartServiceModal}
                onOk={this.handleStartServiceOk} onCancel={this.handleStartServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} state='Running' />
              </Modal>
              <Button type='ghost' size='large' onClick={this.batchStopService} disabled={!stopBtn}>
                <i className='fa fa-stop'></i>停止
              </Button>
              <Modal title="停止操作" visible={this.state.StopServiceModal}
                onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} scope={parentScope} state='Stopped' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.loadServices(this.props)}>
                <i className='fa fa-refresh'></i>刷新
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteServices} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>删除
              </Button>
              <Modal title="删除操作" visible={this.state.DeleteServiceModal}
                onOk={this.handleDeleteServiceOk} onCancel={this.handleDeleteServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} state='Delete' cdRule={this.props.cdRule} callback={this.handleCheckboxvalue} settingList={SettingListfromserviceorapp}/>
              </Modal>
              <Button type='ghost' size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
                <i className="fa fa-bolt"></i>重启
              </Button>
              <Modal title="重启操作" visible={this.state.QuickRestarServiceModal}
                onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
                >
                <StateBtnModal serviceList={serviceList} state='QuickRestar' />
              </Modal>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button size="large" disabled={!isChecked}>
                  更多操作<i className="fa fa-caret-down Arrow"></i>
                </Button>
              </Dropdown>
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
              <span className='totalPage'>共 {total} 条</span>
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
                <i className='fa fa-play'></i>启动
              </Button>
              <Button type='ghost' size='large' onClick={this.batchStopService} disabled={!stopBtn}>
                <i className='fa fa-stop'></i>停止
              </Button>
              <Button type='ghost' size='large' onClick={() => this.loadServices(this.props)}>
                <i className='fa fa-refresh'></i>刷新
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteServices} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>删除
              </Button>
              <Dropdown overlay={operaMenua} trigger={['click']}>
                <Button size="large" disabled={!isChecked}>
                  更多操作<i className="fa fa-caret-down Arrow"></i>
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
              <span className='totalPage'>共 {total} 条</span>
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
                服务名称
            </div>
              <div className='status commonTitle'>
                状态
              </div>
              <div className='appname commonTitle'>
                所属应用
              </div>
              <div className='alarm commonTitle'>
                监控告警
              </div>
              <div className='image commonTitle'>
                镜像
              </div>
              <div className='service commonTitle'>
                服务地址
              </div>
              <div className='createTime commonTitle'>
                创建时间
              </div>
              <div className='actionBox commonTitle'>
                操作
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
               />
          </Card>
          </div>
          <Modal title="创建告警策略" visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal:false})}
            maskClosable={false}
            footer={null}

          >
            <CreateAlarm funcs={modalFunc} currentService={currentShowInstance} isShow={this.state.alarmModal}/>
          </Modal>
           {/* 通知组 */}
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
          <CreateGroup funcs={modalFunc} shouldLoadGroup={true}/>
          </Modal>
          <Modal
            title='垂直居中的对话框'
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
    SettingListfromserviceorapp
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
})(ServiceList)

export default injectIntl(ServiceList, {
  withRef: true,
})
