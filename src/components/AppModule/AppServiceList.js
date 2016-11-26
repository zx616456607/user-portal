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
import { Modal, message, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination, } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AppServiceList.less'
import { calcuDate } from '../../common/tools'
import {
  loadServiceList,
  addService,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices
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
      } else if (checkedList[0].status.phase === 'Stopped') {
        scope.setState({
          runBtn: true,
          stopBtn: false,
          restartBtn: false,
        })
      }
    } else if (checkedList.length > 1) {
      scope.setState({
        runBtn: true,
        stopBtn: true,
        restartBtn: true,
      })
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
        } else if (checkedList[0].status.phase === 'Stopped') {
          scope.setState({
            runBtn: true,
            stopBtn: false,
            restartBtn: false,
          })
        }
      } else if (checkedList.length > 1) {
        scope.setState({
          runBtn: true,
          stopBtn: true,
          restartBtn: true,
        })
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
          <div className="image commonData">
            <Tooltip title={item.images.join(', ') ? item.images.join(', ') : ""}>
              <span>{item.images.join(', ') || '-'}</span>
            </Tooltip>
          </div>
          <div className="service commonData">
            <Tooltip title={svcDomain.length > 0 ? svcDomain[0] : ""}>
              <TipSvcDomain svcDomain={svcDomain} />
            </Tooltip>
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
                  已经是已停止状态, 不能做重新部署
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
                  已经是已停止状态, 不能做快速重启
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
  const { cluster, appName, loadServiceList, page, size, name } = props
  loadServiceList(cluster, appName, { page, size, name })
}*/

class AppServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.batchDeleteServices = this.batchDeleteServices.bind(this)
    this.confirmDeleteServices = this.confirmDeleteServices.bind(this)
    // this.confirmQuickRestartService = this.confirmQuickRestartService.bind(this)
    this.showAddServiceModal = this.showAddServiceModal.bind(this)
    this.closeAddServiceModal = this.closeAddServiceModal.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    // this.showRollingUpdateModal = this.showRollingUpdateModal.bind(this)
    // this.showConfigModal = this.showConfigModal.bind(this)
    // this.showManualScaleModal = this.showManualScaleModal.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.onSubmitAddService = this.onSubmitAddService.bind(this)

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
    const {
      cluster, appName, loadServiceList, page, size, name
    } = nextProps || this.props
    loadServiceList(cluster, appName, { page, size, name })
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
    document.title = `${appName} 的服务列表 | 时速云`
    loadServices(this.props)
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
    loadServices(nextProps)
  }

  /* confirmStartService(e) {
     const self = this
     const { serviceList } = this.state
     const { cluster, appName, loadServiceList, startServices } = this.props
     const checkedServiceList = serviceList.filter((service) => service.checked)
     const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
     confirm({
       title: `您是否确认要启动这${checkedServiceList.length}个服务`,
       content: checkedServiceNames.join(', '),
       onOk() {
         return new Promise((resolve) => {
           serviceList.map((service) => {
             if (checkedServiceNames.indexOf(service.metadata.name) > -1) {
               service.status.phase = 'Starting'
             }
           })
           self.setState({
             serviceList
           })
           startServices(cluster, checkedServiceNames, {
             success: {
               func: () => loadServiceList(cluster, appName),
               isAsync: true
             }
           })
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
    const { cluster, startServices, serviceList, appName, loadServiceList } = this.props
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
          loadServiceList(cluster, appName)
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
    const { cluster, stopServices, serviceList, appName, loadServiceList } = this.props
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
          loadServiceList(cluster, appName)
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
  handleRestarServiceOk() {
    const self = this
    const { cluster, restartServices, serviceList, loadServiceList, appName } = this.props
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
        service.status.phase = 'Redeploying'
      }
    })
    self.setState({
      serviceList: allServices
    })
    restartServices(cluster, serviceNames, {
      success: {
        func: () => {
          loadServiceList(cluster, appName)
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
    const { cluster, quickRestartServices, serviceList, loadServiceList, appName } = this.props
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
          loadServiceList(cluster, appName)
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
  /*batchRestartServices(e) {
    const { serviceList } = this.state
    const { cluster, appName } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmRestartServices(checkedServiceList)
  }*/
  /*confirmRestartServices(serviceList, callback) {
    const self = this
    const { cluster, appName, loadServiceList, restartServices } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => loadServiceList(cluster, appName),
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
  }

  batchStopServices(e) {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmStopServices(checkedServiceList)
  }
  confirmStopServices(serviceList, callback) {
    const self = this
    const { cluster, appName, loadServiceList, stopServices } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => loadServiceList(cluster, appName),
          isAsync: true
        }
      }
    }
    confirm({
      title: `您是否确认要停止这${serviceNames.length}个服务`,
      content: serviceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allServices = self.state.serviceList
          allServices.map((service) => {
            if (serviceNames.indexOf(service.metadata.name) > -1) {
              service.status.phase = 'Stopping'
            }
          })
          self.setState({
            serviceList: allServices
          })
          stopServices(cluster, serviceNames, callback)
          resolve()
        });
      },
      onCancel() { },
    })
  }*/

  batchDeleteServices(e) {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmDeleteServices(checkedServiceList)
  }
  confirmDeleteServices(serviceList, callback) {
    const self = this
    const { cluster, appName, loadServiceList, deleteServices } = this.props
    const serviceNames = serviceList.map((service) => service.metadata.name)
    if (!callback) {
      callback = {
        success: {
          func: () => loadServiceList(cluster, appName),
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
  /*confirmQuickRestartService(e) {
    const self = this
    const { serviceList } = this.state
    const { cluster, appName, loadServiceList, quickRestartServices } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    confirm({
      title: `您是否确认要快速重启这${checkedServiceList.length}个服务`,
      content: checkedServiceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          serviceList.map((service) => {
            if (checkedServiceNames.indexOf(service.metadata.name) > -1) {
              service.status.phase = 'Restarting'
            }
          })
          self.setState({
            serviceList
          })
          quickRestartServices(cluster, checkedServiceNames, {
            success: {
              func: () => loadServiceList(cluster, appName),
              isAsync: true
            }
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

  showAddServiceModal() {
    this.setState({
      addServiceModalShow: true
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

  /*showRollingUpdateModal() {
    this.setState({
      rollingUpdateModalShow: true
    })
  }
  showConfigModal() {
    this.setState({
      configModal: true
    })
  }
  showManualScaleModal() {
    this.setState({
      manualScaleModalShow: true
    })
  }*/

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

  closeAddServiceModal() {
    this.setState({
      addServiceModalShow: false
    })
  }

  onSubmitAddService(serviceTemplate) {
    const hide = message.loading('正在添加中...', 0)
    const { cluster, appName, addService, loadServiceList } = this.props
    const { Service, Deployment } = serviceTemplate
    const body = {
      template: `${yaml.dump(Service)}\n---\n${yaml.dump(Deployment)}`
    }
    addService(cluster, appName, body, {
      success: {
        func: () => {
          loadServiceList(cluster, appName)
          hide()
          message.success(`服务 ${Service.metadata.name} 添加成功`)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          hide()
          message.error(`服务 ${Service.metadata.name} 添加失败`)
        }
      }
    })
  }

  render() {
    const parentScope = this
    let {modalShow, currentShowInstance, serviceList, selectTab, rollingUpdateModalShow, configModal, manualScaleModalShow,
      addServiceModalShow, deployServiceModalShow, runBtn, stopBtn, restartBtn} = this.state
    const {name, pathname, page, size, total, isFetching, cluster, appName, loadServiceList} = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    const isChecked = (checkedServiceList.length > 0)
    let isAllChecked = (serviceList.length === checkedServiceList.length)
    if (serviceList.length === 0) {
      isAllChecked = false
    }
    // currentShowInstance = checkedServiceList[0]
    const funcs = {
      confirmRestartServices: this.confirmRestartServices,
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
        {/*<Menu.Item key="1">
          <span onClick={this.showManualScaleModal}>水平扩展</span>
        </Menu.Item>
        <Menu.Item key="2" disabled={checkedServiceList.length > 1}>
          <span onClick={() => {
            this.setState({
              selectTab: '#autoScale',
              currentShowInstance: currentShowInstance,
              modalShow: true,
            })
          } }>自动伸缩</span>
        </Menu.Item>
        <Menu.Item key="3">
          <span onClick={this.showRollingUpdateModal}>灰度升级</span>
        </Menu.Item>
        <Menu.Item key="4">
          <span onClick={this.showConfigModal}>更改配置</span>
        </Menu.Item>*/}
      </Menu>
    );
    return (
      <div id="AppServiceList" style={{ padding: '10px 15px' }}>
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div className="operaBox">
            <Button
              size="large"
              type="primary"
              onClick={this.showAddServiceModal}
              style={{ backgroundColor: '#2db7f5' }}>
              <i className="fa fa-plus"></i>
              添加服务
            </Button>
            <Button size="large" onClick={this.batchStartService} disabled={!runBtn}>
              <i className="fa fa-play"></i>
              启动
            </Button>
            <Modal title="启动操作" visible={this.state.StartServiceModal}
              onOk={this.handleStartServiceOk} onCancel={this.handleStartServiceCancel}
              >
              <StartServiceModal serviceList={serviceList} />
            </Modal>
            <Button size="large" onClick={() => loadServices(this.props)} >
              <i className="fa fa-refresh"></i>
              刷新
            </Button>
            <Button size="large" onClick={this.batchStopService} disabled={!stopBtn}>
              <i className="fa fa-stop"></i>
              停止
            </Button>
            <Modal title="停止操作" visible={this.state.StopServiceModal}
              onOk={this.handleStopServiceOk} onCancel={this.handleStopServiceCancel}
              >
              <StopServiceModal serviceList={serviceList} />
            </Modal>
            <Button size="large" onClick={this.batchDeleteServices} disabled={!isChecked}>
              <i className="fa fa-trash"></i>
              删除
            </Button>
            <Button size="large" onClick={this.batchQuickRestartService} disabled={!restartBtn}>
              <i className="fa fa-bolt"></i>
              重启
            </Button>
            <Modal title="重新操作" visible={this.state.QuickRestarServiceModal}
              onOk={this.handleQuickRestarServiceOk} onCancel={this.handleQuickRestarServiceCancel}
              >
              <QuickRestarServiceModal serviceList={serviceList} />
            </Modal>
            <Dropdown overlay={operaMenu} trigger={['click']}>
              <Button size="large" disabled={!isChecked}>
                更多
                <i className="fa fa-caret-down"></i>
              </Button>
            </Dropdown>
            <div className='rightBox'>
              <span className='totalPage'>共 {total}条</span>
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
              服务名称
          </div>
            <div className="status commonTitle">
              运行状态
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
            loadServiceList={loadServiceList}
            service={currentShowInstance} />
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
            loadServiceList={loadServiceList} />
          <Modal title="添加服务"
            visible={addServiceModalShow}
            className="AppAddServiceModal"
            wrapClassName="appAddServiceModal"
            onCancel={this.closeAddServiceModal}
            >
            <AppAddServiceModal scope={parentScope} />
          </Modal>
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
  total: PropTypes.number.isRequired,
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
  const { cluster } = state.entities.current
  const defaultServices = {
    isFetching: false,
    cluster: cluster.clusterID,
    appName,
    serviceList: []
  }
  const {
    serviceItmes
  } = state.services
  let targetServices
  if (serviceItmes[cluster.clusterID] && serviceItmes[cluster.clusterID][appName]) {
    targetServices = serviceItmes[cluster.clusterID][appName]
  }
  const { serviceList, isFetching, total } = targetServices || defaultServices
  return {
    cluster: cluster.clusterID,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    appName,
    pathname,
    page,
    size,
    total,
    name,
    serviceList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceList,
  addService,
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
})(AppServiceList)