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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Tooltip, Checkbox, Card, Menu, Dropdown, Button, Icon, Modal, Spin, Input, Pagination, Alert } from 'antd'
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
import { addAppWatch, removeAppWatch } from '../../containers/App/status'
import StateBtnModal from '../StateBtnModal'
import errorHandler from '../../containers/App/error_handler'
import NotificationHandler from '../../common/notification_handler'

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
    const checkedList = appList.filter((app) => app.checked)
    appList.map((app) => {
      if (app.name === value) {
        app.checked = checked
      }
    });
    if (checkedList.length === 0) {
      parentScope.setState({
        runBtn: false,
        stopBtn: false,
        restartBtn: false,
      })
      return
    }
    if (checkedList.length === 1) {
      if (checkedList[0].status.phase === 'Running') {
        parentScope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
        return
      }
      if (checkedList[0].status.phase === 'Stopped') {
        parentScope.setState({
          runBtn: true,
          stopBtn: false,
          restartBtn: false,
        })
        return
      }
      if (checkedList[0].status.phase === 'Pending') {
        parentScope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: false,
        })
      }
    }
    if (checkedList.length > 1) {
      let runCount = 0
      let stopCount = 0
      let pending = 0
      checkedList.map((item, index) => {
        if(item.status.phase === 'Running') {
          runCount++
        }
        else if(item.status.phase === 'Pending') {
          pending++
        } else {
          stopCount++
        }
      })
      if (runCount + pending === checkedList.length) {
        parentScope.setState({
          runBtn: false,
          stopBtn: true,
          restartBtn: true,
        })
        if(pending){
          parentScope.setState({
            restartBtn: false
          })
        }
        return
      }
      if (stopCount === checkedList.length) {
        parentScope.setState({
          runBtn: true,
          stopBtn: false,
          restartBtn: false,
        })
        return
      }
      parentScope.setState({
        runBtn: true,
        stopBtn: true,
        restartBtn: true,
      })
      return
    }
    parentScope.setState({
      appList
    });
  },
  appOperaClick: function (item, e) {
    switch (e.key) {
      case 'stopApp':
        this.stopApp(item.name);
        break;
      case 'deleteApp':
        this.deleteApp(item.name);
        break;
      case 'restartApp':
        this.restartApp(item.name);
        break;
    }
  },
  selectAppByline: function (item, e) {
    let stopPro = e._dispatchInstances;
    if (stopPro.length != 2) {
      const { parentScope } = this.props
      const { appList } = parentScope.state
      appList.map((app) => {
        if (app.name === item.name) {
          app.checked = !app.checked
        }
      });
      const checkedList = appList.filter((app) => app.checked)
      if (checkedList.length === 0) {
        parentScope.setState({
          runBtn: false,
          stopBtn: false,
          restartBtn: false,
        })
        return
      }
      if (checkedList.length === 1) {
        if (checkedList[0].status.phase === 'Running' || checkedList[0].status.phase === 'Starting' || checkedList[0].status.phase === 'Pending' ||checkedList[0].status.phase === 'Deploying') {
          parentScope.setState({
            runBtn: false,
            stopBtn: true,
            restartBtn: true,
          })
          return
        }
        if (checkedList[0].status.phase === 'Pending') {
          parentScope.setState({
            runBtn: false,
            stopBtn: true,
            restartBtn: true,
          })
          return
        }
        if (checkedList[0].status.phase === 'Stopped') {
          parentScope.setState({
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
        let pending = 0
        checkedList.map((item, index) => {
          if (item.status.phase === 'Running') {
            runCount++
          }
          if (item.status.phase === 'Pending') {
            pending++
          } else {
            stopCount++
          }
        })
        if (runCount + pending === checkedList.length) {
          parentScope.setState({
            runBtn: false,
            stopBtn: true,
            restartBtn: true,
          })
          if(pending) {
            parentScope.setState({
              restartBtn: false
            })
          }
          return
        }
        if (stopCount === checkedList.length) {
          parentScope.setState({
            runBtn: true,
            stopBtn: false,
            restartBtn: false,
          })
          return
        }
        parentScope.setState({
          runBtn: true,
          stopBtn: true,
          restartBtn: true,
        })
        return
      }
      parentScope.setState({
        appList
      });
    }
  },
  stopApp: function (name) {
    const { confirmStopApps, batchStopApps} = this.props.funcs
    const app = {
      name
    }
    //confirmStopApps([app])
    batchStopApps([app])
  },
  restartApp: function (name) {
    const { confirmRestartApps, batchRestartApps } = this.props.funcs
    const app = {
      name
    }
    // confirmRestartApps([app])
    batchRestartApps([app])
  },
  deleteApp: function (name) {
    const { confirmDeleteApps } = this.props.funcs
    const app = {
      name
    }
    confirmDeleteApps([app])
  },
  goStack(appName, e) {
    e.stopPropagation()
    browserHistory.push(`/app_manage/detail/${appName}#stack`)
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
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.appOperaClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='stopApp' disabled={item.status.phase === 'Stopped'}>
            <span>停止</span>
          </Menu.Item>
          <Menu.Item key='deleteApp'>
            <span>删除</span>
          </Menu.Item>
          <Menu.Item key='restartApp'
            disabled={item.status.phase === 'Stopped'}
            onClick={(e) => this.restartApp(e, item.name)}>
            <span>重新部署</span>
          </Menu.Item>
        </Menu>
      );
      const appDomain = parseAppDomain(item, this.props.bindingDomains)
      return (
        <div className={item.checked ? 'appDetail appDetailSelected' : 'appDetail'} key={item.name} onClick={this.selectAppByline.bind(this, item)} >
          <div className='selectIconTitle commonData'>
            <Checkbox value={item.name} checked={item.checked} onChange={this.onchange} />
          </div>
          <div className='appName commonData'>
            <Tooltip title={item.name}>
              <Link to={`/app_manage/detail/${item.name}`} >
                {item.name}
              </Link>
            </Tooltip>
          </div>
          <div className='appStatus commonData'>
            <AppStatus app={item} />
          </div>
          <div className='containerNum commonData'>
            {item.instanceCount + '' || '-'}
          </div>
          <div className='visitIp commonData appListDomain'>
            <TipSvcDomain appDomain={appDomain} parentNode='AppList' />
          </div>
          <div className='createTime commonData'>
            <Tooltip title={calcuDate(item.createTime)}>
              <span>{calcuDate(item.createTime)}</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={this.goStack.bind(this, item.name)}>
              查看编排
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


class AppList extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.confirmDeleteApps = this.confirmDeleteApps.bind(this)
    this.batchDeleteApps = this.batchDeleteApps.bind(this)
    this.searchApps = this.searchApps.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.sortApps = this.sortApps.bind(this)

    this.batchStartApps = this.batchStartApps.bind(this)
    this.batchStopApps = this.batchStopApps.bind(this)
    this.batchRestartApps = this.batchRestartApps.bind(this)
    this.handleStartAppsOk = this.handleStartAppsOk.bind(this)
    this.handleStartAppsCancel = this.handleStartAppsCancel.bind(this)
    this.handleStopAppsOk = this.handleStopAppsOk.bind(this)
    this.handleStopAppsCancel = this.handleStopAppsCancel.bind(this)
    this.handleRestarAppsOk = this.handleRestarAppsOk.bind(this)
    this.handleRestarAppsCancel = this.handleRestarAppsCancel.bind(this)
    this.state = {
      appList: props.appList,
      searchInputValue: props.name,
      searchInputDisabled: false,
      runBtn: false,
      stopBtn: false,
      restartBtn: false,
      startAppsModal: false,
      stopAppsModal: false,
      restarAppsModal: false,
    }
  }

  loadData(nextProps) {
    const self = this
    const {
      loadAppList, cluster, page,
      size, name, sortOrder,
      sortBy
    } = nextProps || this.props
    loadAppList(cluster, { page, size, name, sortOrder, sortBy }, {
      success: {
        func: (result) => {
          // Add app status watch, props must include statusWatchWs!!!
          addAppWatch(cluster, self.props, result.data)
        },
        isAsync: true
      }
    })
  }

  onAllChange(e) {
    const { checked } = e.target
    const { appList, runBtn, stopBtn, restartBtn} = this.state
    appList.map((app) => app.checked = checked)
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
    this.setState({
      appList,
    })
  }

  componentWillMount() {
    document.title = '应用列表 | 时速云'
    this.loadData()
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removeAppWatch(cluster, statusWatchWs)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      appList: nextProps.appList
    })
    let { page, size, name, currentCluster, sortOrder, sortBy } = nextProps
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.namespace !== this.props.currentCluster.namespace) {
      this.loadData(nextProps)
      return
    }
    if (page === this.props.page && size === this.props.size && name === this.props.name
      && sortOrder == this.props.sortOrder && sortBy == this.props.sortBy) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadData(nextProps)
  }

  batchStartApps(e) {
    this.setState({
      startAppsModal: true
    })
  }
  batchStopApps(app) {
    const { appList } = this.state
    if (app) {
      appList.map((item) => {
        item.checked = false
        if (item.name === app[0].name) {
          item.checked = true
        }
      });
    }
    this.setState({
      stopAppsModal: true
    })
  }
  batchRestartApps(app) {
    const { appList } = this.state
    if (app) {
      appList.map((item) => {
        item.checked = false
        if (item.name === app[0].name) {
          item.checked = true
        }
      });
    }
    this.setState({
      restarAppsModal: true
    })
  }

  confirmDeleteApps(appList) {
    const self = this
    const { cluster, deleteApps, intl } = this.props
    const appNames = appList.map((app) => app.name)
    confirm({
      title: `您是否确认要删除这${appNames.length}个应用`,
      content: appNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          const allApps = self.state.appList
          allApps.map((app) => {
            if (appNames.indexOf(app.name) > -1) {
              app.status.phase = 'Terminating'
            }
          })
          if (appNames.length <= 0) {
            const noti = new NotificationHandler()
            noto.error('没有可以操作的应用')
            return
          }
          deleteApps(cluster, appNames, {
            success: {
              func: () => self.loadData(self.props),
              isAsync: true
            },
            failed: {
              func: (err) => {
                errorHandler(err, intl)
                self.loadData(self.props)
              },
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
  handleStartAppsOk() {
    const self = this
    const { cluster, startApps, appList, intl } = this.props
    let stoppedApps = []
    const checkedAppList = appList.filter((app) => app.checked)
    checkedAppList.map((app, index) => {
      if (app.status.phase === 'Stopped') {
        stoppedApps.push(app)
      }
    })
    const appNames = stoppedApps.map((app) => app.name)
    const allApps = self.state.appList
    allApps.map((app) => {
      if (appNames.indexOf(app.name) > -1) {
        app.status.phase = 'Starting'
      }
    })
    if(appNames.length <= 0)  {
      const noti = new NotificationHandler()
      noto.error('没有可以操作的应用')
      return
    }
    self.setState({
      startAppsModal: false,
      appList: allApps
    })
    startApps(cluster, appNames, {
      success: {
        func: () => {
          // self.loadData()
          self.setState({
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          errorHandler(err, intl)
          self.loadData(self.props)
        },
        isAsync: true
      }
    })
  }
  handleStartAppsCancel() {
    this.setState({
      startAppsModal: false,
    })
  }
  handleStopAppsOk() {
    const self = this
    const { cluster, stopApps, appList, intl } = this.props
    const checkedAppList = appList.filter((app) => app.checked)
    let runningApps = []

    checkedAppList.map((app, index) => {
      if (app.status.phase === 'Running' || app.status.phase === 'Starting' || app.status.phase === 'Pending' || app.status.phase === 'Deploying') {
        runningApps.push(app)
      }
    })
    const appNames = runningApps.map((app) => app.name)
    const allApps = self.state.appList
    allApps.map((app) => {
      if (appNames.indexOf(app.name) > -1) {
        app.status.phase = 'Stopping'
      }
    })
    if(appNames.length <= 0)  {
      const noti = new NotificationHandler()
      noto.error('没有可以操作的应用')
      return
    }
    self.setState({
      stopAppsModal: false,
      appList: allApps
    })
    stopApps(cluster, appNames, {
      success: {
        func: () => {
          // self.loadData()
          self.setState({
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          errorHandler(err, intl)
          self.loadData(self.props)
        },
        isAsync: true
      }
    })
  }
  handleStopAppsCancel() {
    this.setState({
      stopAppsModal: false,
    })
  }
  handleRestarAppsOk() {
    const self = this
    const { cluster, restartApps, appList, intl } = this.props
    const checkedAppList = appList.filter((app) => app.checked)
    let runningApps = []

    checkedAppList.map((app, index) => {
      if (app.status.phase === 'Running' || app.status.phase === 'Starting' || app.status.phase === 'Pending' || app.status.phase === 'Deploying') {
        runningApps.push(app)
      }
    })
    const appNames = runningApps.map((app) => app.name)
    const allApps = self.state.appList
    
    allApps.map((app) => {
      if (appNames.indexOf(app.name) > -1) {
        app.status.phase = 'Redeploying'
      }
    })
    if(appNames.length <= 0)  {
      const noti = new NotificationHandler()
      noto.error('没有可以操作的应用')
      return
    }
    self.setState({
      restarAppsModal: false,
      appList: allApps
    })
    restartApps(cluster, appNames, {
      success: {
        func: () => {
          // self.loadData()
          self.setState({
            runBtn: false,
            stopBtn: false,
            restartBtn: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          errorHandler(err, intl)
          self.loadData(self.props)
        },
        isAsync: true
      }
    })
  }
  handleRestarAppsCancel() {
    this.setState({
      restarAppsModal: false,
    })
  }
  render() {
    const scope = this
    const { name, pathname, page, size, sortOrder, sortBy, total, cluster, isFetching, startApps, stopApps } = this.props
    const { appList, searchInputValue, searchInputDisabled, runBtn, stopBtn, restartBtn } = this.state
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
      confirmDeleteApps: this.confirmDeleteApps,
      batchStopApps: this.batchStopApps,
      batchRestartApps: this.batchRestartApps,
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
              <Link to='/app_manage/app_create'>
                <Button type='primary' size='large'>
                  <i className="fa fa-plus" />创建应用
                </Button>
              </Link>
              <Button type='ghost' size='large' onClick={this.batchStartApps} disabled={!runBtn}>
                <i className='fa fa-play' />启动
              </Button>
              <Modal title="启动操作" visible={this.state.startAppsModal}
                onOk={this.handleStartAppsOk} onCancel={this.handleStartAppsCancel}
                >
                <StateBtnModal appList={appList} state='Running' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.batchStopApps()} disabled={!stopBtn}>
                <i className='fa fa-stop' />停止
              </Button>
              <Modal title="停止操作" visible={this.state.stopAppsModal}
                onOk={this.handleStopAppsOk} onCancel={this.handleStopAppsCancel}
                >
                <StateBtnModal appList={appList} state='Stopped' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh' />刷新
              </Button>
              <Button type='ghost' size='large' onClick={this.batchDeleteApps} disabled={!isChecked}>
                <i className='fa fa-trash-o' />删除
              </Button>
              <Button type='ghost' size='large' onClick={() => this.batchRestartApps()} disabled={!restartBtn}>
                <i className='fa fa-undo' />重新部署
              </Button>
              <Modal title="重新部署操作" visible={this.state.restarAppsModal}
                onOk={this.handleRestarAppsOk} onCancel={this.handleRestarAppsCancel}
                >
                <StateBtnModal appList={appList} state='Restart' />
              </Modal>
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchApps}>
                <i className='fa fa-search' />
              </div>
              <div className='littleRight'>
                <Input
                  size='large'
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
            </div>
            <div className='clearDiv'></div>
          </div>
          <Card className='appBox'>
            <div className='appTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={appList.length < 1} />
              </div>
              <div className='appName commonTitle'>
                应用名称
              </div>
              <div className='appStatus commonTitle'>
                状态
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
  // total: PropTypes.number.isRequired,
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
  const { statusWatchWs } = state.entities.sockets
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
    statusWatchWs,
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

AppList = connect(mapStateToProps, {
  loadAppList,
  stopApps,
  deleteApps,
  restartApps,
  startApps,
})(AppList)

export default injectIntl(AppList, {
  withRef: true,
})