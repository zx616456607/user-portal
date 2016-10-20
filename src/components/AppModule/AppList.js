/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2016-09-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Tooltip, Checkbox, Card, Menu, Dropdown, Button, Icon, Modal, Spin, Input, Pagination } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/AppList.less'
import { loadAppList, stopApps, deleteApps, restartApps, startApps } from '../../actions/app_manage'
import { DEFAULT_CLUSTER, DEFAULT_PAGE_SIZE } from '../../constants'
import { tenxDateFormat } from '../../common/tools'
import { browserHistory } from 'react-router'

const confirm = Modal.confirm
const ButtonGroup = Button.Group

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    parentScope: React.PropTypes.object,
  },
  onchange: function (e) {
    e.stopPropagation();
    const { value, checked } = e.target
    const { parentScope } = this.props
    const { appList } = parentScope.state
    appList.map((app) => {
      if (app.name === value) {
        app.checked = checked
      }
    });
    parentScope.setState({
      appList
    });
  },
  appOperaClick: function (item, e) {
    //this function for user click opera menu
  },
  selectAppDetail: function (item) {
    //this function for user click app detail ,and then this app will be selected
    const { parentScope } = this.props
    const { appList } = parentScope.state
    appList.map((app) => {
      if (app.name === item.name) {
        app.checked = !app.checked
      }
    });
    parentScope.setState({
      appList
    });
  },
  handleDropdown: function (e) {
    e.stopPropagation()
  },
  stopApp: function (e, name) {
    const { confirmStopApps } = this.props.funcs
    const app = {
      name
    }
    confirmStopApps([app])
  },
  restartApp: function (e, name) {
    e.stopPropagation()
    const { confirmRestartApps } = this.props.funcs
    const app = {
      name
    }
    confirmRestartApps([app])
  },
  deleteApp: function (e, name) {
    e.stopPropagation()
    const { confirmDeleteApps } = this.props.funcs
    const app = {
      name
    }
    confirmDeleteApps([app])
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
    const { config, loading, page, size, total } = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className="loadingBox">
          暂无数据
        </div>
      )
    }
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.appOperaClick.bind(this, item)}
          style={{ width: "100px" }}
          >
          <Menu.Item key="1">
            <span onClick={(e) => this.stopApp(e, item.name)}>停止</span>
          </Menu.Item>
          <Menu.Item key="2">
            <span onClick={(e) => this.deleteApp(e, item.name)}>删除</span>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to={`/app_manage/detail/${item.name}#topology`} >
              查看拓扑图
            </Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to={`/app_manage/detail/${item.name}#stack`} >
              查看编排
            </Link>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className={item.checked ? "appDetail appDetailSelected" : "appDetail"} key={item.name} onClick={this.selectAppDetail.bind(this, item)} >
          <div className="selectIconTitle commonData">
            <Checkbox value={item.name} checked={item.checked} onChange={this.onchange}></Checkbox>
          </div>
          <div className="appName commonData">
            <Tooltip title={item.name}>
              <Link to={`/app_manage/detail/${item.name}`} >
                {item.name}
              </Link>
            </Tooltip>
          </div>
          <div className="appStatus commonData">
            <i className={item.appStatus == 0 ? "normal fa fa-circle" : "error fa fa-circle"}></i>
            <span className={item.appStatus == 0 ? "normal" : "error"} >{item.appStatus == 0 ? "正常" : "异常"}</span>
          </div>
          <div className="serviceNum commonData">
            {item.serviceCount + '' || '-'}
          </div>
          <div className="containerNum commonData">
            {item.instanceCount + '' || '-'}
          </div>
          <div className="visitIp commonData">
            <Tooltip title={item.address ? item.address : ""}>
              <span>{item.address || '-'}</span>
            </Tooltip>
          </div>
          <div className="createTime commonData">
            <Tooltip title={tenxDateFormat(item.createTime)}>
              <span>{tenxDateFormat(item.createTime)}</span>
            </Tooltip>
          </div>
          <div className="actionBox commonData">
            <ButtonGroup>
              <Button type="ghost" onClick={(e) => this.restartApp(e, item.name)}>
                重新部署
              </Button>
              <Dropdown overlay={dropdown}>
                <Button type="ghost" onClick={(e) => this.handleDropdown(e, false)}>
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </ButtonGroup>
          </div>
          <div style={{ clear: "both", width: "0" }}></div>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
        <div style={{ marginTop: 15 }}>
          <Pagination
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

function loadData(props) {
  const { loadAppList, cluster, page, size, name } = props
  loadAppList(cluster, { page, size, name })
}

class AppList extends Component {
  constructor(props) {
    super(props)
    this.onAllChange = this.onAllChange.bind(this)
    this.confirmStartApps = this.confirmStartApps.bind(this)
    this.batchStartApps = this.batchStartApps.bind(this)
    this.confirmStopApps = this.confirmStopApps.bind(this)
    this.batchStopApps = this.batchStopApps.bind(this)
    this.confirmDeleteApps = this.confirmDeleteApps.bind(this)
    this.batchDeleteApps = this.batchDeleteApps.bind(this)
    this.confirmRestartApps = this.confirmRestartApps.bind(this)
    this.batchRestartApps = this.batchRestartApps.bind(this)
    this.searchApps = this.searchApps.bind(this)
    this.state = {
      appList: props.appList,
      searchInputDisabled: false,
    }
  }

  onAllChange(e) {
    const { checked } = e.target
    const { appList } = this.state
    appList.map((app) => app.checked = checked)
    this.setState({
      appList
    })
  }

  componentWillMount() {
    document.title = '应用列表 | 时速云'
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      appList: nextProps.appList
    })
    let { page, size, name } = nextProps
    if (page === this.props.page && size === this.props.size && name === this.props.name) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    loadData(nextProps)
  }

  confirmStartApps(appList) {
    const { cluster, loadAppList, startApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要启动这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          startApps(cluster, appNames, {
            success: {
              func: () => loadAppList(cluster),
              isAsync: true
            }
          })
          resolve()
        });
      },
      onCancel() { },
    });
  }

  batchStartApps(e) {
    const { appList } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    this.confirmStartApps(checkedAppList)
  }

  confirmStopApps(appList) {
    const { cluster, loadAppList, stopApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要停止这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          stopApps(cluster, appNames, {
            success: {
              func: () => loadAppList(cluster),
              isAsync: true
            }
          })
          resolve()
        });
      },
      onCancel() { },
    })
  }

  batchStopApps(e) {
    const { appList } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    this.confirmStopApps(checkedAppList)
  }

  confirmDeleteApps(appList) {
    const { cluster, loadAppList, deleteApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要删除这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          deleteApps(cluster, appNames, {
            success: {
              func: () => loadAppList(cluster),
              isAsync: true
            }
          })
          resolve()
        });
      },
      onCancel() { },
    });
  }

  batchDeleteApps(e) {
    const { appList } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    this.confirmDeleteApps(checkedAppList)
  }

  confirmRestartApps(appList) {
    const { cluster, loadAppList, restartApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要重新部署这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          restartApps(cluster, appNames, {
            success: {
              func: () => loadAppList(cluster),
              isAsync: true
            }
          })
          resolve()
        });
      },
      onCancel() { },
    });
  }

  batchRestartApps(e) {
    const { appList } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    this.confirmRestartApps(checkedAppList)
  }

  searchApps(e) {
    const { name, pathname } = this.props
    const value = e.target.value.trim()
    if (value === name) {
      return
    }
    this.setState({
      searchInputDisabled: true
    })
    const query = {}
    if (value) {
      query.name = value
    }
    browserHistory.push({
      pathname,
      query
    })
  }

  render() {
    const scope = this
    const { name, pathname, page, size, total, cluster, isFetching } = this.props
    const { appList, searchInputDisabled } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    const isChecked = (checkedAppList.length > 0)
    let isAllChecked = (appList.length === checkedAppList.length)
    if (appList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmStopApps: this.confirmStopApps,
      confirmStartApps: this.confirmStartApps,
      confirmRestartApps: this.confirmRestartApps,
      confirmDeleteApps: this.confirmDeleteApps
    }
    return (
      <QueueAnim
        className="AppList"
        type="right"
        >
        <div id="AppList" key="AppList">
          <div className="operationBox">
            <div className="leftBox">
              <Button type="ghost" size="large">
                <Link to="/app_manage/app_create">
                  <i className="fa fa-plus"></i>添加应用
                </Link>
              </Button>
              <Button type="ghost" size="large" onClick={this.batchStartApps} disabled={!isChecked}>
                <i className="fa fa-play"></i>启动
              </Button>
              <Button type="ghost" size="large" onClick={this.batchStopApps} disabled={!isChecked}>
                <i className="fa fa-stop"></i>停止
              </Button>
              <Button type="ghost" size="large" onClick={this.batchDeleteApps} disabled={!isChecked}>
                <i className="fa fa-trash-o"></i>删除
              </Button>
              <Button type="ghost" size="large" onClick={this.batchRestartApps} disabled={!isChecked}>
                <i className="fa fa-undo"></i>重新部署
              </Button>
            </div>
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search"></i>
              </div>
              <div className="littleRight">
                <Input
                  defaultValue={name}
                  placeholder="输入应用名回车搜索"
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchApps} />
              </div>
            </div>
            <div className="clearDiv"></div>
          </div>
          <Card className="appBox">
            <div className="appTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={appList.length < 1}></Checkbox>
              </div>
              <div className="appName commonTitle">
                应用名称
              </div>
              <div className="appStatus commonTitle">
                应用状态
              </div>
              <div className="serviceNum commonTitle">
                服务数量
                <i className="fa fa-sort"></i>
              </div>
              <div className="containerNum commonTitle">
                容器数量
                <i className="fa fa-sort"></i>
              </div>
              <div className="visitIp commonTitle">
                访问地址
              </div>
              <div className="createTime commonTitle">
                创建时间
                <i className="fa fa-sort"></i>
              </div>
              <div className="actionBox commonTitle">
                操作
              </div>
            </div>
            <MyComponent
              size={size} total={total} pathname={pathname} page={page} name={name}
              config={appList} loading={isFetching}
              parentScope={scope} funcs={funcs} />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

AppList.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  appList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadAppList: PropTypes.func.isRequired,
  stopApps: PropTypes.func.isRequired,
  deleteApps: PropTypes.func.isRequired,
  restartApps: PropTypes.func.isRequired,
  startApps: PropTypes.func.isRequired,
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
  const defaultApps = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    appList: []
  }
  const {
    appItems
  } = state.apps
  const { cluster, appList, isFetching, total } = appItems[DEFAULT_CLUSTER] || defaultApps

  return {
    cluster,
    pathname,
    page,
    size,
    total,
    name,
    appList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadAppList,
  stopApps,
  deleteApps,
  restartApps,
  startApps,
})(AppList)