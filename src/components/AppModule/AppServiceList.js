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
import { Modal, Checkbox, Dropdown, Button, Card, Menu, Icon, Spin, Tooltip, Pagination } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceDetail from './AppServiceDetail'
import './style/AppServiceList.less'
import { loadServiceList, startServices, restartServices, stopServices, deleteServices, quickRestartServices } from '../../actions/services'
import { DEFAULT_CLUSTER, DEFAULT_PAGE_SIZE } from '../../constants'
import { browserHistory } from 'react-router'

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
    serviceList.map((service) => {
      if (service.metadata.name === value) {
        service.checked = checked
      }
    })
    scope.setState({
      serviceList
    })
  },
  modalShow: function (item) {
    const {scope} = this.props;
    scope.setState({
      modalShow: true,
      currentShowInstance: item
    });
  },
  onShowSizeChange: function (page, size) {
    if (size === this.props.size) {
      return
    }
    const query = {}
    if (page !== 1) {
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
  onPageChange: function (page) {
    if (page === this.props.page) {
      return
    }
    const { pathname, size, name } = this.props
    const query = {}
    if (page !== 1) {
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
  },
  render: function () {
    const { serviceList, loading, page, size, total } = this.props
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
          还没有服务哦~
        </div>
      )
    }
    const items = serviceList.map((item) => {
      item.cluster = DEFAULT_CLUSTER
      return (
        <div className={item.checked ? "selectedInstance instanceDetail" : "instanceDetail"} key={item.metadata.name}>
          <div className="selectIconTitle commonData">
            <Checkbox value={item.metadata.name} checked={item.checked} onChange={this.onchange}></Checkbox>
          </div>
          <div className="name commonData">
            <Tooltip title={item.metadata.name}>
              <span className="viewBtn" onClick={this.modalShow.bind(this, item)}>
                {item.metadata.name}
              </span>
            </Tooltip>
          </div>
          <div className="status commonData">
            {item.spec.replicas || '-'}
          </div>
          <div className="image commonData">
            <Tooltip title={item.images.join(', ') ? item.images.join(', ') : ""}>
              <span>{item.images.join(', ') || '-'}</span>
            </Tooltip>
          </div>
          <div className="service commonData">
            <Tooltip title={item.serviceIP ? item.serviceIP : ""}>
              <span>{item.serviceIP || '-'}</span>
            </Tooltip>
          </div>
          <div className="createTime commonData">
            <Tooltip title={item.metadata.creationTimestamp ? item.metadata.creationTimestamp : ""}>
              <span>{item.metadata.creationTimestamp || '-'}</span>
            </Tooltip>
          </div>
          <div className="actionBox commonData">
            <Button type="primary" className="viewBtn" onClick={this.modalShow.bind(this, item)}>
              <i className="fa fa-eye"></i>
              查看详情
            </Button>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
        <div className="paginationBox">
          <Pagination
            className="inlineBlock"
            simple
            showSizeChanger
            showQuickJumper
            onShowSizeChange={this.onShowSizeChange}
            onChange={this.onPageChange}
            defaultCurrent={page}
            pageSize={size}
            showTotal={total => `共 ${total} 条`}
            total={total} />
        </div>
      </div>
    );
  }
});

function loadServices(props) {
  const { cluster, appName, loadServiceList, page, size, name } = props
  loadServiceList(cluster, appName, { page, size, name })
}

class AppServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.confirmStartService = this.confirmStartService.bind(this)
    this.batchStopServices = this.batchStopServices.bind(this)
    this.confirmStopServices = this.confirmStopServices.bind(this)
    this.batchRestartServices = this.batchRestartServices.bind(this)
    this.confirmRestartServices = this.confirmRestartServices.bind(this)
    this.batchDeleteServices = this.batchDeleteServices.bind(this)
    this.confirmDeleteServices = this.confirmDeleteServices.bind(this)
    this.confirmQuickRestartService = this.confirmQuickRestartService.bind(this)
    this.state = {
      modalShow: false,
      currentShowInstance: null,
      serviceList: props.serviceList,
      searchInputDisabled: false
    }
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

  confirmStartService(e) {
    const { serviceList } = this.state
    const { cluster, appName, loadServiceList, startServices } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    confirm({
      title: `您是否确认要启动这${checkedServiceList.length}个服务`,
      content: checkedServiceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
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
  }

  batchRestartServices(e) {
    const { serviceList } = this.state
    const { cluster, appName } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmRestartServices(checkedServiceList)
  }

  confirmRestartServices(serviceList, callback) {
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
          restartServices(cluster, serviceNames, callback)
          resolve()
        });
      },
      onCancel() { },
    })
  }

  confirmQuickRestartService(e) {
    const { serviceList } = this.state
    const { cluster, appName, loadServiceList, quickRestartServices } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    confirm({
      title: `您是否确认要快速重启这${checkedServiceList.length}个服务`,
      content: checkedServiceNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
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
  }

  batchStopServices(e) {
    const { serviceList } = this.state
    const checkedServiceList = serviceList.filter((service) => service.checked)
    this.confirmStopServices(checkedServiceList)
  }

  confirmStopServices(serviceList, callback) {
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
          stopServices(cluster, serviceNames, callback)
          resolve()
        });
      },
      onCancel() { },
    })
  }

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

  render() {
    const parentScope = this
    const operaMenu = (<Menu>
      <Menu.Item key="0">
        <span onClick={this.batchRestartServices}>重新部署</span>
      </Menu.Item>
      <Menu.Item key="1">
        <span>弹性伸缩</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span>灰度升级</span>
      </Menu.Item>
      <Menu.Item key="3">
        <span>更改配置</span>
      </Menu.Item>
    </Menu>);
    let { modalShow, currentShowInstance, serviceList } = this.state
    const { name, pathname, page, size, total, isFetching, appName } = this.props
    const checkedServiceList = serviceList.filter((service) => service.checked)
    const checkedServiceNames = checkedServiceList.map((service) => service.metadata.name)
    const isChecked = (checkedServiceList.length > 0)
    let isAllChecked = (serviceList.length === checkedServiceList.length)
    if (serviceList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmRestartServices: this.confirmRestartServices,
      confirmStopServices: this.confirmStopServices,
      confirmDeleteServices: this.confirmDeleteServices,
    }
    return (
      <div id="AppServiceList">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div className="operaBox">
            <Button size="large" onClick={this.confirmStartService} disabled={!isChecked}>
              <i className="fa fa-play"></i>
              启动
            </Button>
            <Button size="large" onClick={this.batchStopServices} disabled={!isChecked}>
              <i className="fa fa-stop"></i>
              停止
            </Button>
            <Button size="large" onClick={this.batchDeleteServices} disabled={!isChecked}>
              <i className="fa fa-trash"></i>
              删除
            </Button>
            <Tooltip placement="top" title="快速重启 = docker restart">
              <Button size="large" onClick={this.confirmQuickRestartService} disabled={!isChecked}>
                <i className="fa fa-bolt"></i>
                快速重启
              </Button>
            </Tooltip>
            <Dropdown overlay={operaMenu} trigger={['click']}>
              <Button size="large" disabled={!isChecked}>
                更多
                <i className="fa fa-caret-down"></i>
              </Button>
            </Dropdown>
          </div>
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
            size={size} total={total} pathname={pathname} page={page} name={name}
            scope={parentScope} serviceList={serviceList} loading={isFetching} />
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
              serviceDetailmodalShow={this.state.modalShow}
              />
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
  page = parseInt(page || 1)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < 1) {
    page = 1
  }
  if (isNaN(size) || size < 1 || size > 100) {
    size = DEFAULT_PAGE_SIZE
  }
  const { appName } = props
  const defaultServices = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    appName,
    serviceList: []
  }
  const {
    serviceItmes
  } = state.services
  let targetServices
  if (serviceItmes[DEFAULT_CLUSTER] && serviceItmes[DEFAULT_CLUSTER][appName]) {
    targetServices = serviceItmes[DEFAULT_CLUSTER][appName]
  }
  const { cluster, serviceList, isFetching, total } = targetServices || defaultServices
  return {
    cluster,
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
  startServices,
  restartServices,
  stopServices,
  deleteServices,
  quickRestartServices,
})(AppServiceList)