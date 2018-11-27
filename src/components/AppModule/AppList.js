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
import { Tooltip, Checkbox, Card, Menu, Dropdown, Button, Icon, Modal, Spin, Input, Pagination } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/AppList.less'
import { loadAppList, stopApps, deleteApps, restartApps, startApps } from '../../actions/app_manage'
import { deleteSetting, getSettingListfromserviceorapp } from '../../actions/alert'
import { getDeploymentOrAppCDRule } from '../../actions/cicd_flow'
import { removeTerminal } from '../../actions/terminal'
import { LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { calcuDate } from '../../common/tools'
import { browserHistory } from 'react-router'
import AppStatus from '../TenxStatus/AppStatus'
import { parseAppDomain } from '../parseDomain'
import TipSvcDomain from '../TipSvcDomain'
import { addAppWatch, removeAppWatch } from '../../containers/App/status'
import StateBtnModal from '../StateBtnModal'
import errorHandler from '../../containers/App/error_handler'
import NotificationHandler from '../../components/Notification'
import CreateAlarm from './AlarmModal'
import CreateGroup from './AlarmModal/CreateGroup'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'
import { isResourcePermissionError } from '../../common/tools'
import ResourceBanner from '../../components/TenantManage/ResourceBanner'
import intlMsg from './AppListIntl'
import * as serviceMeshAciton from '../../actions/serviceMesh'

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    parentScope: React.PropTypes.object,
  },
  onchange: function (e) {
    e.stopPropagation()
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
          restartBtn: true,
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
      case 'stack':
        return browserHistory.push(`/app_manage/detail/${item.name}#stack`)
      default: return false
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
    const { confirmDeleteApps, batchDeleteApps } = this.props.funcs
    const app = {
      name
    }
    // confirmDeleteApps([app])
    batchDeleteApps([app])
  },
  goTologoly(appName, e) {
    e.stopPropagation()
    browserHistory.push(`/app_manage/detail/${appName}#topology`)
  },
  showAlert(item, that) {
    const { intl: { formatMessage } } = that.props
    if(!item.services.length){
      Modal.info({
        title: formatMessage(intlMsg.tip),
        content: <div style={{color:'#2db7f5'}}><FormattedMessage {...intlMsg.noServerNoAlarm}/></div>,
        onOk() {},
      });
      return
    }
    const { parentScope } = this.props
    parentScope.setState({alarmModal: true, alertCurrentApp:item })
    setTimeout(()=> {
      document.getElementById('name').focus()
    },500)
  },
  render: function () {
    const { config, loading, bindingDomains, bindingIPs, parentScope, intl: { formatMessage } } = this.props
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
          <Icon type="frown"/>&nbsp;<FormattedMessage {...intlMsg.noDataYet}/>
        </div>
      )
    }
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.appOperaClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='stopApp' disabled={item.status.phase === 'Stopped'}>
            <span><FormattedMessage {...intlMsg.stop}/></span>
          </Menu.Item>
          <Menu.Item key='deleteApp'>
            <span><FormattedMessage {...intlMsg.delete}/></span>
          </Menu.Item>
          <Menu.Item key='stack'>
            <span><FormattedMessage {...intlMsg.checkLayout}/></span>
          </Menu.Item>
          <Menu.Item key='restartApp'
            disabled={item.status.phase === 'Stopped'}
            onClick={(e) => this.restartApp(e, item.name)}>
            <span><FormattedMessage {...intlMsg.reDeploy}/></span>
          </Menu.Item>
        </Menu>
      );
      const appDomain = parseAppDomain(item, bindingDomains, bindingIPs)
      return (
        <div className={item.checked ? 'appDetail appDetailSelected' : 'appDetail'} key={item.name} onClick={this.selectAppByline.bind(this, item)} >
          <div className='selectIconTitle commonData'>
            <Checkbox value={item.name} checked={item.checked} onChange={this.onchange} />
          </div>
          <div className='appName commonData'>
            <Tooltip title={item.name}>
              <Link to={`/app_manage/detail/${item.name}`} >
                {/*<span className="indexOf">{item.name.substr(0,1)}</span>*/}
                {item.name}
              </Link>
            </Tooltip>
          </div>
          <div className='appStatus commonData'>
            <AppStatus app={item} />
          </div>
          <div className='containerNum commonData'>
            {item.instanceCount || '-'}
          </div>
          {/* normal => 设置过 */}
          <div className="alarm commonData">
            {/* <Tooltip title="查看监控">
            <svg className="managemoniter" onClick={()=> browserHistory.push(`app_manage/detail/${item.name}#monitor`)}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#managemoniter"></use></svg>
            </Tooltip> */}
            <Tooltip title={formatMessage(intlMsg.alarmSetting)} onClick={()=> this.showAlert(item, this)}>
              <Icon type="notification" />
            </Tooltip>
          </div>
          <div className='visitIp commonData appListDomain'>
            <TipSvcDomain appDomain={appDomain}
            serviceMeshflagListInfo={this.props.serviceMeshflagListInfo}
            parentNode='AppList'
            msaUrl={this.props.msaUrl}
             />
          </div>
          <div className='createTime commonData'>
            <Tooltip title={calcuDate(item.createTime)}>
              <span>{calcuDate(item.createTime)}</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={this.goTologoly.bind(this, item.name)}>
              <FormattedMessage {...intlMsg.lookTopology}/>
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
    // this.confirmDeleteApps = this.confirmDeleteApps.bind(this)
    // this.batchDeleteApps = this.batchDeleteApps.bind(this)
    this.searchApps = this.searchApps.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.sortApps = this.sortApps.bind(this)

    this.batchStartApps = this.batchStartApps.bind(this)
    this.batchDeleteApps = this.batchDeleteApps.bind(this)
    this.batchStopApps = this.batchStopApps.bind(this)
    this.batchRestartApps = this.batchRestartApps.bind(this)
    this.handleStartAppsOk = this.handleStartAppsOk.bind(this)
    this.handleStartAppsCancel = this.handleStartAppsCancel.bind(this)
    this.handleStopAppsOk = this.handleStopAppsOk.bind(this)
    this.handleStopAppsCancel = this.handleStopAppsCancel.bind(this)
    this.handleRestarAppsOk = this.handleRestarAppsOk.bind(this)
    this.handleRestarAppsCancel = this.handleRestarAppsCancel.bind(this)
    this.handleDeleteAppsOk = this.handleDeleteAppsOk.bind(this)
    this.handleDeleteAppsCancel = this.handleDeleteAppsCancel.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.GetServiceSettingList = this.GetServiceSettingList.bind(this)
    this.handleCheckboxvalue = this.handleCheckboxvalue.bind(this)
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
      deleteAppsModal: false,
      deployEnvModalVisible: false,
      step: 1, // first step create AlarmModal
      alarmStrategy: true,
      serviceMeshflagListInfo: [] // 当前应用中所有服务的istio信息
    }
  }

  loadData = async (nextProps, options) => {
    const self = this
    const {
      loadAppList, cluster, page,
      size, name, sortOrder,
      sortBy, intl: { formatMessage },
    } = nextProps || this.props
    const query = { page, size, name, sortOrder, sortBy }
    query.customizeOpts = options

    const appListresult = await loadAppList(cluster, query, location.pathname, {
      success: {
        func: (result) => {
          // Add app status watch, props must include statusWatchWs!!!
          addAppWatch(cluster, self.props, result.data)
          // For fix issue #CRYSTAL-1604(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadAppList(cluster, query, location.pathname)
          }, LOAD_STATUS_TIMEOUT)
        },
        isAsync: true
      }
    })
    const { result: { data = [] } = {} } = appListresult.response
    const serviceNameList = data.map(({ services }) => services)
      .reduce((current, next)=> next.concat(current), [])
      .map(({ metadata: { name } = {} }) => name)
    const serviceMeshflag = await
    this.props.getServiceListServiceMeshStatus(cluster,serviceNameList,)
    const { result:serviceMeshflagList = {}} = serviceMeshflag.response
    const serviceMeshflagListInfo = Object.values(serviceMeshflagList)
    .filter((item) => typeof item === 'object')
    .map((item) => ({ name: item.metadata.name,
      istioEnabled:item.istioEnabled,
      referencedComponent: item.referencedComponent}))
    this.setState({serviceMeshflagListInfo})
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
    this.loadData()
  }

  componentDidMount() {
    // Reload list each UPDATE_INTERVAL
    this.upStatusInterval = setInterval(() => {
      this.loadData(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removeAppWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      appList: nextProps.appList
    })
    let { page, size, name, sortOrder, sortBy } = nextProps
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

  /*confirmDeleteApps(appList) {
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
            noti.error('没有可以操作的应用')
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
      onCancel() {},
    });
  }*/
  GetServiceSettingList(app, name){
    const { cluster, getSettingListfromserviceorapp } = this.props
    const query = {
      appNames: name,
    }
    if(app){
      query.appNames = app[0].name
    }
    getSettingListfromserviceorapp(query, cluster)
  }

  batchDeleteApps(app) {
    /*const { appList } = this.state
    const checkedAppList = appList.filter((app) => app.checked)
    this.confirmDeleteApps(checkedAppList)*/
    const { appList } = this.state
    const { getDeploymentOrAppCDRule, currentCluster } = this.props
    if (app) {
      appList.map((item) => {
        item.checked = false
        if (item.name === app[0].name) {
          item.checked = true
        }
      });
    }
    const name = appList.filter(item => item.checked).map(item => item.name).join(',')
    getDeploymentOrAppCDRule(currentCluster.clusterID, 'app', name)
    this.GetServiceSettingList(app, name)
    this.setState({
      deleteAppsModal: true,
      alarmStrategy: true,
    })
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
      query.name = searchInputValue.trim()
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
      noti.error(formatMessage(intlMsg.noOperationApp))
      return
    }
    self.setState({
      startAppsModal: false,
      appList: allApps
    })
    startApps(cluster, appNames, {
      success: {
        func: () => {
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
          if(isResourcePermissionError(err) || err.statusCode === 402){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
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
      noti.error(formatMessage(intlMsg.noOperationApp))
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
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }
          else{
            errorHandler(err, intl)
          }
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
    const { cluster, restartApps, appList, intl, removeTerminal, terminalList, intl: { formatMessage } } = this.props
    const checkedAppList = appList.filter((app) => app.checked)
    let runningApps = []

    if(terminalList.length){
      const deleteAppList = cloneDeep(checkedAppList)
      const deleteServiceList = []
      deleteAppList.forEach( item => {
        item.services.forEach( servicesItem => {
          deleteServiceList.push(servicesItem)
        })
      })
      deleteServiceList.forEach(item => {
        removeTerminal(cluster, item.metadata.name)
      })
    }
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
      noti.error(formatMessage(intlMsg.noOperationApp))
      return
    }
    self.setState({
      restarAppsModal: false,
      appList: allApps
    })
    restartApps(cluster, appNames, {
      success: {
        func: () => {
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
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            //return;
          }else{
            errorHandler(err, intl)
          }
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
  handleDeleteAppsOk() {
    const self = this
    const { cluster, deleteApps, intl, appList, deleteSetting, SettingListfromserviceorapp, removeTerminal, terminalList } = this.props
    const checkedAppList = appList.filter((app) => app.checked)

    const appNames = checkedAppList.map((app) => app.name)
    const releaseNames = []
    if(terminalList.length){
      const deleteAppList = cloneDeep(checkedAppList)
      const deleteServiceList = []
      deleteAppList.forEach( item => {
        item.services.forEach( servicesItem => {
          deleteServiceList.push(servicesItem)
        })
      })
      deleteServiceList.forEach(item => {
        removeTerminal(cluster, item.metadata.name)
      })
    }
    const allApps = self.state.appList
    allApps.map((app) => {
      if (appNames.indexOf(app.name) > -1) {
        app.status.phase = 'Terminating'
        if (app.k8sServices) {
          let releaseName = app.k8sServices[0].metadata.labels.releaseName
          if (releaseName && !releaseNames.includes(releaseName)) {
            releaseNames.push(releaseName)
          }
        }
      }
    })
    self.setState({
      deleteAppsModal: false,
      runBtn:false,
      stopBtn:false,
      isChecked:false,
      restartBtn:false,
      appList: allApps
    })
    deleteApps(cluster, {apps: appNames, releaseNames}, {
      success: {
        func: () => {
          self.loadData(self.props)

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
          self.loadData(self.props)
        },
        isAsync: true
      }
    })
  }
  handleDeleteAppsCancel() {
    this.setState({
      deleteAppsModal: false,
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
  render() {
    const scope = this
    const { name, pathname, page, size, sortOrder, sortBy, total, cluster, isFetching, startApps, stopApps,
      intl: { formatMessage }, SettingListfromserviceorapp } = this.props
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
      // confirmDeleteApps: this.confirmDeleteApps,
      batchStopApps: this.batchStopApps,
      batchRestartApps: this.batchRestartApps,
      batchDeleteApps: this.batchDeleteApps,
    }
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    const dropdownb = (
      <Menu className="Moreoperations">
        <Menu.Item key="0" disabled={!isChecked}>
          <span onClick={() => this.batchDeleteApps()}><i className='fa fa-trash-o' /> <FormattedMessage {...intlMsg.delete}/></span>
        </Menu.Item>
        <Menu.Item key="1" disabled={!restartBtn}>
          <span onClick={() => this.batchRestartApps()}><i className='fa fa-undo' /> <FormattedMessage {...intlMsg.reDeploy}/></span>
        </Menu.Item>
      </Menu>
    );
    const dropdownc = (
      <Menu className="Moreoperations">
        <Menu.Item key="0">
          <span onClick={() => this.loadData(this.props)}><i className='fa fa-refresh' /> <FormattedMessage {...intlMsg.refresh}/></span>
        </Menu.Item>
        <Menu.Item key="1" disabled={!isChecked}>
          <span onClick={() => this.batchDeleteApps()}><i className='fa fa-trash-o' /> <FormattedMessage {...intlMsg.delete}/></span>
        </Menu.Item>
        <Menu.Item key="2" disabled={!restartBtn}>
          <span onClick={() => this.batchRestartApps()}><i className='fa fa-undo' /> <FormattedMessage {...intlMsg.reDeploy}/></span>
        </Menu.Item>
      </Menu>
    );
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
    let linkUrl = '/app_manage/app_create'
    let createBtn = formatMessage(intlMsg.createApp)
    if (pathname === '/ai-deep-learning/ai-model-service') {
      linkUrl = '/app_manage/app_create/quick_create?addAI=true'
      createBtn = formatMessage(intlMsg.aiModalApp)
    }
    const createButton = (<Button type='primary' size='large' onClick={() => browserHistory.push(linkUrl)}>
        <i className="fa fa-plus" /> { createBtn }
      </Button>)

    return (
      <QueueAnim
        className='AppList'
        type='right'
        >
        <Title title={formatMessage(intlMsg.appList)}/>
        <div id='AppList' key='AppList'>
          <ResourceBanner resourceType='application'/>
          <div className='operationBox operationBoxa'>
            <div className='leftBox'>
             { createButton }
              {/*<Button type='ghost' size='large' onClick={() => this.setState({ deployEnvModalVisible: true })}>
                <svg className='rocket'>
                  <use xlinkHref='#rocket' />
                </svg>
                快速创建
              </Button>*/}
              <Button type='ghost' size='large' onClick={this.batchStartApps} disabled={!runBtn}>
                <i className='fa fa-play' /><FormattedMessage {...intlMsg.boot}/>
              </Button>
              <Modal title={formatMessage(intlMsg.bootOperation)} visible={this.state.startAppsModal}
                onOk={this.handleStartAppsOk} onCancel={this.handleStartAppsCancel}
                >
                <StateBtnModal appList={appList} state='Running' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.batchStopApps()} disabled={!stopBtn}>
                <i className='fa fa-stop' /><FormattedMessage {...intlMsg.stop}/>
              </Button>
              <Modal title={formatMessage(intlMsg.stopOperation)} visible={this.state.stopAppsModal}
                onOk={this.handleStopAppsOk} onCancel={this.handleStopAppsCancel}
                >
                <StateBtnModal appList={appList} state='Stopped' />
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh' /><FormattedMessage {...intlMsg.refresh}/>
              </Button>
              <Button type='ghost' size='large' onClick={() => this.batchDeleteApps()} disabled={!isChecked}>
                <i className='fa fa-trash-o' /><FormattedMessage {...intlMsg.delete}/>
              </Button>
              <Modal title={formatMessage(intlMsg.deleteOperation)} visible={this.state.deleteAppsModal}
                onOk={this.handleDeleteAppsOk} onCancel={this.handleDeleteAppsCancel}
                >
               <StateBtnModal appList={appList} state='Delete' cdRule={this.props.cdRule} settingList={SettingListfromserviceorapp} callback={this.handleCheckboxvalue}/>
              </Modal>
              <Button type='ghost' size='large' onClick={() => this.batchRestartApps()} disabled={!restartBtn}>
                <i className='fa fa-undo' /><FormattedMessage {...intlMsg.reDeploy}/>
              </Button>
              <Modal title={formatMessage(intlMsg.reDeployOperation)} visible={this.state.restarAppsModal}
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
                  placeholder={formatMessage(intlMsg.searchByAppName)}
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchApps} />
              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'><FormattedMessage {...intlMsg.allItems} values={{ total }}/></span>
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
            <div className='clearDiv'></div>
          </div>

          <div className='operationBox operationBoxb'>
            <div className='leftBox'>
              { createButton }
              {/*<Button type='ghost' size='large' onClick={() => this.setState({ deployEnvModalVisible: true })}>
                <svg className='rocket'>
                  <use xlinkHref='#rocket' />
                </svg>
                快速创建
              </Button>*/}
              <Button type='ghost' size='large' onClick={this.batchStartApps} disabled={!runBtn}>
                <i className='fa fa-play' /><FormattedMessage {...intlMsg.boot}/>
              </Button>
              <Button type='ghost' size='large' onClick={() => this.batchStopApps()} disabled={!stopBtn}>
                <i className='fa fa-stop' /><FormattedMessage {...intlMsg.stop}/>
              </Button>
              <Button type='ghost' size='large' onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh' /><FormattedMessage {...intlMsg.refresh}/>
              </Button>
              <Dropdown overlay={dropdownb} trigger={['click']}>
                <Button size="large" >
                  <FormattedMessage {...intlMsg.moreOperation}/><i className="fa fa-caret-down Arrow"></i>
                </Button>
              </Dropdown>
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
                  placeholder={formatMessage(intlMsg.searchByAppName)}
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchApps} />
              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'><FormattedMessage {...intlMsg.allItems} values={{ total }}/></span>
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
            <div className='clearDiv'></div>
          </div>

          <div className='operationBox operationBoxc'>
            <div className='leftBox'>
             { createButton }
              {/*<Button type='ghost' size='large' onClick={() => this.setState({ deployEnvModalVisible: true })}>
                <svg className='rocket'>
                  <use xlinkHref='#rocket' />
                </svg>
                快速创建
              </Button>*/}
              <Button type='ghost' size='large' onClick={this.batchStartApps} disabled={!runBtn}>
                <i className='fa fa-play' /><FormattedMessage {...intlMsg.boot}/>
              </Button>
              <Button type='ghost' size='large' onClick={() => this.batchStopApps()} disabled={!stopBtn}>
                <i className='fa fa-stop' /><FormattedMessage {...intlMsg.stop}/>
              </Button>
              <Dropdown overlay={dropdownc} trigger={['click']}>
                <Button size="large" >
                  <FormattedMessage {...intlMsg.moreOperation}/><i className="fa fa-caret-down Arrow"></i>
                </Button>
              </Dropdown>
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
                  placeholder={formatMessage(intlMsg.searchByAppName)}
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchApps} />
              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'><FormattedMessage {...intlMsg.allItems} values={{ total }}/></span>
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
            <div className='clearDiv'></div>
          </div>

          <Card className='appBox'>
            <div className='appTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox checked={isAllChecked} onChange={this.onAllChange} disabled={appList.length < 1} />
              </div>
              <div className='appName commonTitle'>
                <FormattedMessage {...intlMsg.appName}/>
              </div>
              <div className='appStatus commonTitle'>
                <FormattedMessage {...intlMsg.status}/>
              </div>
              {/*<div className='serviceNum commonTitle'>
                服务数量
                <i className='fa fa-sort'></i>
              </div>*/}
              <div className='containerNum commonTitle' onClick={() => this.sortApps('instance_count')}>
                <FormattedMessage {...intlMsg.containerNum}/>
                  <div className="ant-table-column-sorter">
                  <span className={spliceSortClassName('asc', 'instance_count', sortOrder, sortBy)} title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className={spliceSortClassName('desc', 'instance_count', sortOrder, sortBy)} title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className="alarm commonTitle">
                <FormattedMessage {...intlMsg.alarm}/>
              </div>
              <div className='visitIp commonTitle'>
                <FormattedMessage {...intlMsg.accessAddress}/>
              </div>
              <div className='createTime commonTitle' onClick={() => this.sortApps('create_time')}>
                <FormattedMessage {...intlMsg.createTime}/>
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
                <FormattedMessage {...intlMsg.operation}/>
              </div>
            </div>
            <MyComponent
              name={name}
              config={appList}
              loading={isFetching}
              parentScope={scope}
              funcs={funcs}
              bindingDomains={this.props.bindingDomains}
              bindingIPs={this.props.bindingIPs}
              intl={this.props.intl}
              serviceMeshflagListInfo={this.state.serviceMeshflagListInfo}
              msaUrl={this.props.msaUrl}
            />
          </Card>
          <Modal title={formatMessage(intlMsg.createAlarmStg)} visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.cancelModal()}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc} createBy="app" currentApp={this.state.alertCurrentApp} isShow={this.state.alarmModal}/>
          </Modal>
          {/* 通知组 */}
          <Modal title={formatMessage(intlMsg.createNotiGroup)} visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc} shouldLoadGroup={true} currentApp={this.state.alertCurrentApp}/>
          </Modal>
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
  const { SettingListfromserviceorapp } = state.alert
  const { terminal } = state
  const terminalList = terminal.list[cluster.clusterID] || []
  const defaultApps = {
    isFetching: false,
    cluster: cluster.clusterID,
    appList: []
  }
  const {
    appItems
  } = state.apps
  const { appList, isFetching, total } = appItems[cluster.clusterID] || defaultApps
  const { getDeploymentOrAppCDRule }  = state.cicd_flow
  const defaultCDRule = {
    isFetching: false,
    result: {
      results: []
    }
  }
  const { entities: { loginUser: { info: { msaConfig: {url:msaUrl} = {} } } = {} } = {} } = state
  return {
    cluster: cluster.clusterID,
    statusWatchWs,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    currentCluster: cluster,
    pathname,
    page,
    size,
    total,
    name,
    sortOrder,
    sortBy,
    appList,
    terminalList,
    isFetching,
    cdRule: getDeploymentOrAppCDRule && getDeploymentOrAppCDRule.result ? getDeploymentOrAppCDRule :  defaultCDRule,
    SettingListfromserviceorapp,
    msaUrl,
  }
}

AppList = connect(mapStateToProps, {
  loadAppList,
  stopApps,
  deleteApps,
  restartApps,
  startApps,
  getDeploymentOrAppCDRule,
  deleteSetting,
  getSettingListfromserviceorapp,
  removeTerminal,
  getServiceListServiceMeshStatus: serviceMeshAciton.getServiceListServiceMeshStatus,
})(AppList)

export default injectIntl(AppList, {
  withRef: true,
})
