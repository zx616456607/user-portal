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
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { calcuDate } from '../../common/tools'
import { browserHistory } from 'react-router'
import AppStatus from '../TenxStatus/AppStatus'
import { parseAppDomain } from '../parseDomain'
import TipSvcDomain from '../TipSvcDomain'

const confirm = Modal.confirm
const ButtonGroup = Button.Group

let MyComponent = React.createClass({
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
    switch (e.key) {
      case 'stopApp':
        this.stopApp(item.name);
        break;
      case 'deleteApp':
        this.deleteApp(item.name);
        break;
    }
  },
  selectAppByline: function (item, e) {
    //this function for user click app line ,and then this app will be selected
    //when user click the menu button will trigger the function
    //so the first thing should estimate
    //the event target is the menu button or others
    //if the target is menu button , the function will be return null
    let stopPro = e._dispatchInstances;
    if (stopPro.length != 2) {
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
    }
  },
  stopApp: function (name) {
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
  deleteApp: function (name) {
    const { confirmDeleteApps } = this.props.funcs
    const app = {
      name
    }
    confirmDeleteApps([app])
  },
  render: function () {
    const { config, loading } = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className='loadingBox'>
          暂无数据
        </div>
      )
    }
    const appDomain = [
      {
        name: 'servce1',
        data: ['10.1.27.1',]
      },
      {
        name: 'servce2',
        data: ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
      },
      {
        name: 'servce3',
        data: ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
      },
    ]
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.appOperaClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='stopApp'>
            <span>停止</span>
          </Menu.Item>
          <Menu.Item key='deleteApp'>
            <span>删除</span>
          </Menu.Item>
          <Menu.Item key='topology'>
            <Link to={`/app_manage/detail/${item.name}#topology`} >
              查看拓扑图
            </Link>
          </Menu.Item>
          <Menu.Item key='stack'>
            <Link to={`/app_manage/detail/${item.name}#stack`} >
              查看编排
            </Link>
          </Menu.Item>
        </Menu>
      );
      const domains = parseAppDomain(item, this.props.bindingDomains)
      return (
        <div className={item.checked ? 'appDetail appDetailSelected' : 'appDetail'} key={item.name} onClick={this.selectAppByline.bind(this, item)} >
          <div className='selectIconTitle commonData'>
            <Checkbox value={item.name} checked={item.checked} onChange={this.onchange}></Checkbox>
          </div>
          <div className='appName commonData'>
            <Tooltip title={item.name}>
              <Link to={`/app_manage/detail/${item.name}`} >
                {item.name}
              </Link>
            </Tooltip>
          </div>
          <div className='appStatus commonData'>
            <AppStatus services={item.services} phase={item.phase} />
          </div>
          <div className='containerNum commonData'>
            {item.instanceCount + '' || '-'}
          </div>
          <div className='visitIp commonData'>
            <Tooltip title='appDomain'>
              <TipSvcDomain appDomain={appDomain}/>
            </Tooltip>
          </div>
          <div className='createTime commonData'>
            <Tooltip title={calcuDate(item.createTime)}>
              <span>{calcuDate(item.createTime)}</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={(e) => this.restartApp(e, item.name)}>
              <span>重新部署</span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both', width: '0' }}></div>
        </div>
      );
    });
    return (
      <div className='dataBox'>
        {items}
      </div>
    );
  }
});

function loadData(props) {
  const { loadAppList, cluster, page, size, name, sortOrder, sortBy } = props
  loadAppList(cluster, { page, size, name, sortOrder, sortBy })
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
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.sortApps = this.sortApps.bind(this)
    this.state = {
      appList: props.appList,
      searchInputValue: props.name,
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
    let { page, size, name, currentCluster, sortOrder, sortBy } = nextProps
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.spaceID !== this.props.currentCluster.spaceID) {
      loadData(nextProps)
      return
    }
    if (page === this.props.page && size === this.props.size && name === this.props.name
      && sortOrder == this.props.sortOrder && sortBy == this.props.sortBy) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    loadData(nextProps)
  }

  confirmStartApps(appList) {
    const self = this
    const { cluster, startApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要启动这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allApps = self.state.appList
          allApps.map((app) => {
            if (appNames.indexOf(app.name) > -1) {
              app.phase = 'Starting'
            }
          })
          startApps(cluster, appNames, {
            success: {
              func: () => loadData(self.props),
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
    const self = this
    const { cluster, stopApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要停止这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allApps = self.state.appList
          allApps.map((app) => {
            if (appNames.indexOf(app.name) > -1) {
              app.phase = 'Stopping'
            }
          })
          self.setState({
            appList: allApps
          })
          stopApps(cluster, appNames, {
            success: {
              func: () => loadData(self.props),
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
    const self = this
    const { cluster, deleteApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要删除这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allApps = self.state.appList
          allApps.map((app) => {
            if (appNames.indexOf(app.name) > -1) {
              app.phase = 'Terminating'
            }
          })
          deleteApps(cluster, appNames, {
            success: {
              func: () => loadData(self.props),
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
    const self = this
    const { cluster, restartApps } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要重新部署这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allApps = self.state.appList
          allApps.map((app) => {
            if (appNames.indexOf(app.name) > -1) {
              app.phase = 'Redeploying'
            }
          })
          restartApps(cluster, appNames, {
            success: {
              func: () => loadData(self.props),
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
    const { name, pathname, sortOrder, sortBy } = this.props
    const { searchInputValue } = this.state
    if (searchInputValue === name) {
      return
    }
    this.setState({
      searchInputDisabled: true
    })
    const query = {}
    if (searchInputValue) {
      query.name = searchInputValue
    }
    query.sortOrder = sortOrder
    query.sortBy = sortBy
    browserHistory.push({
      pathname,
      query
    })
  }

  onPageChange(page) {
    const { size, sortOrder, sortBy } = this.props
    this.updateBrowserHistory(page, size, sortOrder, sortBy)
  }

  onShowSizeChange(page, size) {
    const { sortOrder, sortBy } = this.props
    this.updateBrowserHistory(page, size, sortOrder, sortBy)
  }

  updateBrowserHistory(page, size, sortOrder, sortBy) {

    if (page === this.props.page &&
      size === this.props.size &&
      sortOrder === this.props.sortOrder &&
      sortBy === this.props.sortBy) {
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
    query.sortOrder = sortOrder
    query.sortBy = sortBy
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      query
    })
  }

  sortApps(by) {
    let { page, size, sortOrder } = this.props
    if (sortOrder == 'asc') {
      sortOrder = 'desc'
    } else {
      sortOrder = 'asc'
    }
    this.updateBrowserHistory(page, size, sortOrder, by)
  }

  render() {
    const scope = this
    const { name, pathname, page, size, sortOrder, sortBy, total, cluster, isFetching } = this.props
    const { appList, searchInputValue, searchInputDisabled } = this.state
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

    // kind: asc:升序（向上的箭头） desc:降序（向下的箭头）
    // type: create_time：创建时间 instance_count：容器数量
    function spliceSortClassName(kind, type, sortOrder, sortBy) {
      const on = 'on'
      const off = 'off'
      let toggle = off
      if (kind === sortOrder && type === sortBy) {
        toggle = on
      }
      let prefix = ''
      if (kind === 'asc') {
        prefix = 'ant-table-column-sorter-up '
      } else {
        prefix = 'ant-table-column-sorter-down '
      }

      return prefix + toggle
    }

    return (
      <QueueAnim
        className='AppList'
        type='right'
        >
        <div id='AppList' key='AppList'>
          <div className='operationBox'>
            <div className='leftBox'>
              <Button type='primary' size='large'>
                <Link to='/app_manage/app_create'>
                  <i className='fa fa-plus'></i>创建应用
                </Link>
              </Button>
              <Button type='ghost' size='large' onClick={this.batchStartApps} disabled={!isChecked}>
                <i className='fa fa-play'></i>启动
              </Button>
              <Button type='ghost' size='large' onClick={this.batchStopApps} disabled={!isChecked}>
                <i className='fa fa-stop'></i>停止
              </Button>
              <Button type='ghost' size='large' onClick={() => loadData(this.props)}>
                <i className='fa fa-refresh'></i>刷新
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteApps} disabled={!isChecked}>
                <i className='fa fa-trash-o'></i>删除
              </Button>
              <Button type='ghost' size='large' onClick={this.batchRestartApps} disabled={!isChecked}>
                <i className='fa fa-undo'></i>重新部署
              </Button>
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchApps}>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                <Input
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={searchInputValue}
                  placeholder='按应用名搜索'
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchApps} />
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
            <div className='appTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={appList.length < 1}></Checkbox>
              </div>
              <div className='appName commonTitle'>
                应用名称
              </div>
              <div className='appStatus commonTitle'>
                应用状态
              </div>
              {/*<div className='serviceNum commonTitle'>
                服务数量
                <i className='fa fa-sort'></i>
              </div>*/}
              <div className='containerNum commonTitle' onClick={() => this.sortApps('instance_count')}>
                容器数量
                  <div className="ant-table-column-sorter">
                  <span className={spliceSortClassName('asc', 'instance_count', sortOrder, sortBy)} title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className={spliceSortClassName('desc', 'instance_count', sortOrder, sortBy)} title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='visitIp commonTitle'>
                访问地址
              </div>
              <div className='createTime commonTitle' onClick={() => this.sortApps('create_time')}>
                创建时间
                  <div className="ant-table-column-sorter">
                  <span className={spliceSortClassName('asc', 'create_time', sortOrder, sortBy)} title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className={spliceSortClassName('desc', 'create_time', sortOrder, sortBy)} title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='actionBox commonTitle'>
                操作
              </div>
            </div>
            <MyComponent
              name={name}
              config={appList}
              loading={isFetching}
              parentScope={scope}
              funcs={funcs}
              bindingDomains={this.props.bindingDomains} />
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
  sortOrder: PropTypes.string.isRequired,
  sortBy: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const { query, pathname } = props.location
  let { page, size, name, sortOrder, sortBy } = query
  if (sortOrder != 'asc' && sortOrder != 'desc') {
    sortOrder = 'desc'
  }
  if (sortBy != 'instance_count') {
    sortBy = 'create_time'
  }
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const { cluster } = state.entities.current
  const defaultApps = {
    isFetching: false,
    cluster: cluster.clusterID,
    appList: []
  }
  const {
    appItems
  } = state.apps
  const { appList, isFetching, total } = appItems[cluster.clusterID] || defaultApps

  return {
    cluster: cluster.clusterID,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    currentCluster: cluster,
    pathname,
    page,
    size,
    total,
    name,
    sortOrder,
    sortBy,
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