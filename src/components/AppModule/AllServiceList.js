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
import { Modal, message, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination, Input, Alert } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AllService.less'
import { calcuDate } from '../../common/tools'
import {
  addService,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAllServices
} from '../../actions/services'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { browserHistory } from 'react-router'
import RollingUpdateModal from './AppServiceDetail/RollingUpdateModal'
import ConfigModal from './AppServiceDetail/ConfigModal'
import ManualScaleModal from './AppServiceDetail/ManualScaleModal'
import { parseServiceDomain } from '../parseDomain'
import ServiceStatus from '../TenxStatus/ServiceStatus'
import AppAddServiceModal from './AppCreate/AppAddServiceModal'
import AppDeployServiceModal from './AppCreate/AppDeployServiceModal'
import TipSvcDomain from '../TipSvcDomain'
import yaml from 'js-yaml'
import { addDeploymentWatch, removeDeploymentWatch } from '../../containers/App/status'
import { LABEL_APPNAME } from '../../constants'

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
      return
    }
    if (checkedList.length > 1) {
      let runCount = 0
      let stopCount = 0
      checkedList.map((item, index) => {
        item.status.phase === 'Running' ? runCount++ : stopCount++
      })
      if (runCount === checkedList.length) {
        scope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
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
      const { serviceList } = scope.state
      serviceList.map((service) => {
        if (service.metadata.name === item.metadata.name) {
          service.checked = !service.checked
        }
      })
      const checkedList = serviceList.filter((service) => service.checked)
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
          return
        }
      }
      if (checkedList.length > 1) {
        let runCount = 0
        let stopCount = 0
        checkedList.map((item, index) => {
          item.status.phase === 'Running' ? runCount++ : stopCount++
        })
        if (runCount === checkedList.length) {
          scope.setState({
            runBtn: false,
            stopBtn: true,
            restartBtn: true,
          })
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
    }
  },
  modalShow: function (item) {
    // e.stopPropagation()
    const {scope} = this.props;
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
    scope.setState({
      currentShowInstance: item
    })
    switch (e.key) {
      case 'manualScale':
        return this.showManualScaleModal()
      case 'autoScale':
        return this.showAutoScaleModal()
      case 'rollingUpdate':
        return this.showRollingUpdateModal()
      case 'config':
        return this.showConfigModal()
    }
  },
  showRollingUpdateModal() {
    const { scope } = this.props
    scope.setState({
      rollingUpdateModalShow: true
    })
  },
  showConfigModal() {
    const { scope } = this.props
    scope.setState({
      configModal: true
    })
  },
  showManualScaleModal() {
    const { scope } = this.props
    scope.setState({
      manualScaleModalShow: true
    })
  },
  showAutoScaleModal() {
    const { scope } = this.props
    scope.setState({
      selectTab: '#autoScale',
      modalShow: true,
    })
  },
  render: function () {
    const { cluster, serviceList, loading, page, size, total } = this.props
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
          服务列表为空
        </div>
      )
    }
    const items = serviceList.map((item) => {
      item.cluster = cluster
      const dropdown = (
        <Menu onClick={this.serviceOperaClick.bind(this, item)}>
          <Menu.Item key="manualScale">
            水平扩展
          </Menu.Item>
          <Menu.Item key="autoScale">
            自动伸缩
          </Menu.Item>
          <Menu.Item key="rollingUpdate">
            灰度升级
          </Menu.Item>
          <Menu.Item key="config">
            更改配置
          </Menu.Item>
        </Menu>
      );
      const svcDomain = parseServiceDomain(item, this.props.bindingDomains)
      const images = item.spec.template.spec.containers.map(container => {
        return container.image
      })
      const appName = item.metadata.labels[LABEL_APPNAME]
      return (
        <div
          className={item.checked ? "selectedInstance instanceDetail" : "instanceDetail"}
          key={item.metadata.name}
          onClick={(e) => this.selectServiceByLine(e, item)} >
          <div className="selectIconTitle commonData">
            <Checkbox value={item.metadata.name} checked={item.checked} onChange={this.onchange} />
          </div>
          <div className="name commonData">
            <Tooltip title={item.metadata.name}>
              <span className="viewBtn" onClick={() => this.modalShow(item)}>
                {item.metadata.name}
              </span>
            </Tooltip>
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
          <div className="image commonData">
            <Tooltip title={images.join(', ') ? images.join(', ') : ""}>
              <span>{images.join(', ') || '-'}</span>
            </Tooltip>
          </div>
          <div className="service commonData">
            <TipSvcDomain svcDomain={svcDomain} />
          </div>
          <div className="createTime commonData">
            <Tooltip title={calcuDate(item.metadata.creationTimestamp ? item.metadata.creationTimestamp : '')}>
              <span>{calcuDate(item.metadata.creationTimestamp || '')}</span>
            </Tooltip>
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button
              overlay={dropdown} type='ghost'
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

let StartServiceModal = React.createClass({
  getInitialState() {
    return {
      //
    }
  },
  render: function () {
    const { serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    let runningServices = []

    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Running') {
        runningServices.push(service)
      }
    })
    let item = runningServices.map((service, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{service.name}</td>
          <td style={{ color: '#4bbd74' }}>服务为运行中状态</td>
        </tr>
      )
    })
    return (
      <div id="StartServiceModal">
        {
          runningServices.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedServiceList.length}个服务中, 有
                  <span className="modalDot" style={{ backgroundColor: '#4bbd74' }}>{runningServices.length}个</span>
                  已经是运行中状态, 不需再启动
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: 运行中状态的服务不需再次启动</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                    {item}
                  </tbody>
                </table>
              </div>
            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定启动这{(checkedServiceList.length - runningServices.length)}个已停止的服务 ?
        </div>
      </div>
    )
  }
})
let StopServiceModal = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    const { serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    let stoppedService = []

    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Stopped') {
        stoppedService.push(service)
      }
    })
    let item = stoppedService.map((service, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{service.name}</td>
          <td style={{ color: '#f85958' }}>服务为已停止状态</td>
        </tr>
      )
    })
    return (
      <div id="StartServiceModal">
        {
          stoppedService.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedServiceList.length}个服务中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{stoppedService.length}个</span>
                  已经是已停止状态, 不需再停止
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: 已停止状态的服务不需再次停止</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                    {item}
                  </tbody>
                </table>
              </div>

            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定停止这{(checkedServiceList.length - stoppedService.length)}个运行中的服务 ?
        </div>
      </div>
    )
  }
})
let RestarServiceModal = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    const { serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    let stoppedService = []
    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Stopped') {
        stoppedService.push(service)
      }
    })
    let item = stoppedService.map((service, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{service.name}</td>
          <td style={{ color: '#f85958' }}>服务为已停止状态</td>
        </tr>
      )
    })
    return (
      <div id="StartServiceModal">
        {
          stoppedService.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedServiceList.length}个服务中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{stoppedService.length}个</span>
                  是已停止状态, 不能做重新部署
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: 运行状态时服务才可以重新部署</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                    {item}
                  </tbody>
                </table>
              </div>

            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定重新部署这{(checkedServiceList.length - stoppedService.length)}个可以重新部署的服务 ?
        </div>
      </div>
    )
  }
})
let QuickRestarServiceModal = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    const { serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    let stoppedService = []
    checkedServiceList.map((service, index) => {
      if (service.status.phase === 'Stopped') {
        stoppedService.push(service)
      }
    })
    let item = stoppedService.map((service, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{service.name}</td>
          <td style={{ color: '#f85958' }}>服务为已停止状态</td>
        </tr>
      )
    })
    return (
      <div id="StartServiceModal">
        {
          stoppedService.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedServiceList.length}个服务中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{stoppedService.length}个</span>
                  是已停止状态, 不能快速重启
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: 运行状态时服务才可以快速重启</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                    {item}
                  </tbody>
                </table>
              </div>

            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定快速重启这{(checkedServiceList.length - stoppedService.length)}个可以快速重启的服务 ?
        </div>
      </div>
    )
  }
})

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
    this.batchDeleteServices = this.batchDeleteServices.bind(this)
    this.confirmDeleteServices = this.confirmDeleteServices.bind(this)
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
    this.handleStartServiceOk = this.handleStartServiceOk.bind(this)
    this.handleStartServiceCancel = this.handleStartServiceCancel.bind(this)
    this.handleStopServiceOk = this.handleStopServiceOk.bind(this)
    this.handleStopServiceCancel = this.handleStopServiceCancel.bind(this)
    this.handleRestarServiceOk = this.handleRestarServiceOk.bind(this)
    this.handleRestarServiceCancel = this.handleRestarServiceCancel.bind(this)
    this.handleQuickRestarServiceOk = this.handleQuickRestarServiceOk.bind(this)
    this.handleQuickRestarServiceCancel = this.handleQuickRestarServiceCancel.bind(this)
    this.state = {
      modalShow: false,
      currentShowInstance: null,
      serviceList: props.serviceList,
      searchInputDisabled: false,
      rollingUpdateModalShow: false,
      manualScaleModalShow: false,
      addServiceModalShow: false, // for add service
      deployServiceModalShow: false,
      isCreate: true,
      servicesList: [],
      selectedList: [],
      selectTab: '#autoScale',
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      StartServiceModal: false,
      StopServiceModal: false,
      RestarServiceModal: false,
      QuickRestarServiceModal: false,
    }
  }

  loadServices(nextProps) {
    const self = this
    const { cluster, loadAllServices, page, size, name } = nextProps || this.props
    const query = {
      pageIndex: page,
      pageSize: size,
      name
    }
    loadAllServices(cluster, query, {
      success: {
        func: (result) => {
          // Add deploment status watch, props must include statusWatchWs!!!
          let { services } = result.data
          let deployments = services.map(service => service.deployment)
          addDeploymentWatch(cluster, self.props, deployments)
        },
        isAsync: true
      }
    })
  }

  onAllChange(e) {
    const { checked } = e.target
    const { serviceList } = this.state
    serviceList.map((service) => service.checked = checked)
    this.setState({
      serviceList
    })
  }

  componentWillMount() {
    const { appName } = this.props
    document.title = '服务列表 | 时速云'
    this.loadServices()
    return
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removeDeploymentWatch(cluster, statusWatchWs)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      serviceList: nextProps.serviceList
    })
    let { page, size, name } = nextProps
    if (page === this.props.page && size === this.props.size && name === this.props.name) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadServices(nextProps)
  }

  /*confirmRestartServices(serviceList, callback) {
    const self = this
    const { cluster, loadAllServices, restartServices } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => loadServices(self.props),
          isAsync: true
        }
      }
    }
    confirm({
      title: `您是否确认要重新部署这${serviceNames.length}个服务`,
      content: serviceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allServices = self.state.serviceList
          allServices.map((service) => {
            if (serviceNames.indexOf(service.metadata.name) > -1) {
              service.status.phase = 'Redeploying'
            }
          })
          self.setState({
            serviceList: allServices
          })
          restartServices(cluster, serviceNames, callback)
          resolve()
        });
      },
      onCancel() { },
    })
  }*/

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

  handleStartServiceOk() {
    const self = this
    const { cluster, startServices, serviceList } = this.props
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
    self.setState({
      serviceList
    })
    startServices(cluster, serviceNames, {
      success: {
        func: () => {
          // self.loadServices()
          this.setState({
            StartServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
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
    const { cluster, stopServices, serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
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
        service.status.phase = 'Stopping'
      }
    })
    self.setState({
      serviceList: allServices
    })
    stopServices(cluster, serviceNames, {
      success: {
        func: () => {
          // self.loadServices()
          this.setState({
            StopServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
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
  handleRestarServiceOk(services) {
    const self = this
    const { cluster, restartServices, serviceList } = this.props
    let servicesList = services ? services : serviceList
    const checkedServiceList = servicesList.filter((service) => service.checked)
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
        service.status.phase = 'Redeploying'
      }
    })
    self.setState({
      serviceList: allServices
    })
    restartServices(cluster, serviceNames, {
      success: {
        func: () => {
          // self.loadServices()
          this.setState({
            RestarServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
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
    const { cluster, quickRestartServices, serviceList } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    let runningServices = []

    checkedServiceList.map((service, index) => {
      console.log('service :::', service);
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
    self.setState({
      serviceList
    })
    quickRestartServices(cluster, serviceNames, {
      success: {
        func: () => {
          self.loadServices()
          this.setState({
            QuickRestarServiceModal: false,
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
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

  batchDeleteServices(e) {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmDeleteServices(checkedServiceList)
  }
  confirmDeleteServices(serviceList, callback) {
    const self = this
    const { cluster, loadAllServices, deleteServices } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => self.loadServices(self.props),
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
  }
  closeModal() {
    this.setState({
      modalShow: false
    })
  }
  searchServices() {
    const { page, size, name, pathname } = this.props
    if (this.state.searchInputValue != name) {
      const query = { page, size, name: this.state.searchInputValue }
      browserHistory.push({
        pathname,
        query
      })
    }
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
      modalShow,
      currentShowInstance,
      serviceList,
      rollingUpdateModalShow,
      configModal,
      manualScaleModalShow,
      deployServiceModalShow, runBtn, stopBtn, restartBtn
    } = this.state
    const {
      pathname, page, size, total, isFetching, cluster,
      loadAllServices
    } = this.props
    let selectTab = this.state.selectTab
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
      confirmStopServices: this.confirmStopServices,
      confirmDeleteServices: this.confirmDeleteServices,
    }
    const operaMenu = (
      <Menu>
        <Menu.Item key="0" disabled={!restartBtn}>
          <span onClick={this.batchRestartService}>重新部署</span>
          <Modal title="重新部署操作" visible={this.state.RestarServiceModal}
            onOk={this.handleRestarServiceOk} onCancel={this.handleRestarServiceCancel}
            >
            <RestarServiceModal serviceList={serviceList} />
          </Modal>
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="AppServiceList">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div className='operationBox'>
            <div className='leftBox'>
              <Button type='ghost' size='large' onClick={this.batchStartService} disabled={!runBtn}>
                <i className='fa fa-play'></i>启动
              </Button>
              <Modal title="启动操作" visible={this.state.StartServiceModal}
                onOk={this.handleStartServiceOk} onCancel={this.handleStartServiceCancel}
                >
                <StartServiceModal serviceList={serviceList} />
              </Modal>
              <Button type='ghost' size='large' onClick={this.batchStopService} disabled={!stopBtn}>
                <i className='fa fa-stop'></i>停止
              </Button>
              <Modal title="停止操作" visible={this.state.StopServiceModal}
                onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
                >
                <StopServiceModal serviceList={serviceList} />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.loadServices(this.props)}>
                <i className='fa fa-refresh'></i>刷新
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteServices} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>删除
              </Button>
              <Tooltip placement="top" title="快速重启 = docker restart">
                <Button size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
                  <i className="fa fa-bolt"></i>
                  快速重启
                </Button>
              </Tooltip>
              <Modal title="重启操作" visible={this.state.QuickRestarServiceModal}
                onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
                >
                <QuickRestarServiceModal serviceList={serviceList} />
              </Modal>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button size="large" disabled={!isChecked}>
                  更多操作
                  <i className="fa fa-caret-down"></i>
                </Button>
              </Dropdown>
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchApps}>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                <Input
                  size='large'
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={this.state.searchInputValue}
                  placeholder='按应用名搜索'
                  onPressEnter={() => this.searchServices()} />
              </div>
            </div>
            <div className='pageBox'>
              <span className='totalPage'>共 {total}条</span>
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
            </div>
            <div className='clearDiv'></div>
          </div>
          <Card className='appBox'>
            <div className="appTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={serviceList.length < 1}></Checkbox>
              </div>
              <div className="name commonTitle">
                服务名称
            </div>
              <div className="status commonTitle">
                运行状态
            </div>
              <div className="appname commonTitle">
                所属应用
            </div>
              <div className="image commonTitle">
                镜像
            </div>
              <div className="service commonTitle">
                服务地址
            </div>
              <div className="createTime commonTitle">
                创建时间
            </div>
              <div className="actionBox commonTitle">
                操作
            </div>
              <div style={{ clear: "both" }}></div>
            </div>

            <MyComponent
              cluster={cluster}
              name={name}
              scope={parentScope}
              serviceList={serviceList}
              loading={isFetching}
              bindingDomains={this.props.bindingDomains} />
          </Card>
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
              />
          </Modal>
          <RollingUpdateModal
            parentScope={parentScope}
            cluster={cluster}
            appName={appName}
            visible={rollingUpdateModalShow}
            loadServiceList={() => this.loadServices(this.props)}
            service={currentShowInstance} />
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
            loadServiceList={() => this.loadServices(this.props)} />
          <Modal
            visible={deployServiceModalShow}
            className="AppServiceDetail"
            transitionName="move-right"
            >
            <AppDeployServiceModal
              scope={parentScope}
              onSubmitAddService={this.onSubmitAddService}
              serviceOpen={deployServiceModalShow} />
          </Modal>

        </QueueAnim>
      </div>
    )
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
  const { cluster } = state.entities.current
  const { statusWatchWs } = state.entities.sockets
  const { services, isFetching, total } = state.services.serviceList
  return {
    cluster: cluster.clusterID,
    statusWatchWs,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    name,
    pathname,
    page,
    size,
    total,
    serviceList: services || [],
    isFetching
  }
}

export default connect(mapStateToProps, {
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
  loadAllServices
})(ServiceList)
