/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  node server list
 *
 * v0.1 - 2016/11/16
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Radio, Icon, Spin, Tooltip, Progress, Button, Select, Checkbox } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'
import MySpace from './MySpace'
import { getAppStatus, getServiceStatus, getContainerStatus } from '../../../../common/status_identify'
import { connect } from 'react-redux'
import { loadClusterInfo, GetPrivilege } from '../../../../actions/overview_cluster'
import { loadClusterSummary } from '../../../../actions/overview_cluster'
import ProgressBox from '../../../ProgressBox'
import { parseAmount } from '../../../../common/tools'
import homeMySQL from '../../../../assets/img/homeMySQL.png'
import homeMongoCluster from '../../../../assets/img/homeMongoCluster.png'
import homeRedis from '../../../../assets/img/homeRedis.png'
import homeZookeeper from '../../../../assets/img/homeZookeeper.png'
import homeElasticSearch from '../../../../assets/img/homeElasticSearch.png'
import homeEtcd from '../../../../assets/img/homeEtcdCluster.png'
import snapshot from '../../../../assets/img/snapshot.png'
import { Link } from 'react-router'
import { AVATAR_HOST, SHOW_BILLING, REG, DEFAULT_IMAGE_POOL } from '../../../../constants'
import { fetchStorage } from '../../../../actions/storage'
import { getClusterQuota, getClusterQuotaList } from '../../../../actions/quota'
import { GetProjectsDetail } from '../../../../actions/project'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { FormattedMessage } from 'react-intl'
import IntlMessages from '../../../../containers/IndexPage/Enterprise/Intl'
import CommonIntlMessages from '../../../../containers/CommonIntl'
import { loadDbCacheList } from '../../../../actions/database_cache'

const RadioGroup = Radio.Group
function getClusterCostOption(costValue, restValue) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: "{b} : {c}<br/> ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: '60%',
      top: '30%',
      data: [{ name: '余额' }, { name: '消费' }],
      formatter: function (name) {
        if (name === '余额') {
          return name + '：' + restValue.fullAmount
        } else {
          return name + '：' + costValue.fullAmount
        }
      },
      textStyle: {
        fontSize: 14,
        color: '#666'
      },
      itemGap: 15,
      itemWidth: 10,
      itemHeight: 10,
    },
    color: ['#46b2fa', '#2abe84'],
    series: [
      {
        name: '',
        type: 'pie',
        selectedMode: 'single',
        radius: '45%',
        center: ['30%', '50%'],
        data: [
          { value: restValue.amount, name: '余额' },
          { value: costValue.amount, name: '消费', selected: true },
        ],
        itemStyle: {
          normal: {
            borderWidth: 0.5,
            borderColor: '#ffffff'
          },
          emphasis: {
          }
        }
      }
    ]
  }
}

let SvcState = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    const { currentState } = this.props
    let item
    if (currentState === 'normal') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#2eb764' }}></div>
          <span style={{ color: '#2eb865' }}>
            <FormattedMessage {...IntlMessages.svcNormal} />
          </span>
        </div>
      )
    }
    if (currentState === 'warning') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#f0986b' }}></div>
          <span style={{ color: '#f0986b' }}>
            <FormattedMessage {...IntlMessages.svcWaring} />
          </span>
        </div>
      )
    }
    if (currentState === 'uninstalled') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#f0986b' }}></div>
          <span style={{ color: '#f0986b' }}>
            <FormattedMessage {...IntlMessages.svcNotInstall} />
          </span>
        </div>
      )
    }
    if (currentState === 'abnormal') {
      item = (
        <div>
          <Icon type="exclamation-circle" style={{ color: '#f85a59' }} className='errorDot' />
          <span style={{ color: '#f85a59' }}>
            <FormattedMessage {...IntlMessages.svcAbnormal} />
          </span>
        </div>
      )
    }
    if (currentState === 'stopped') {
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{ backgroundColor: '#ffa500' }}></div>
          <span style={{ color: '#ffa500' }}>
            <FormattedMessage {...IntlMessages.svcStopped} />
          </span>
        </div>
      )
    }
    return (
      <div id='SvcState'>
        {item}
      </div>
    )
  }
})

class Ordinary extends Component {
  constructor(props) {
    super(props)
    this.handleSize = this.handleSize.bind(this)
    this.thousandBitSeparator = this.thousandBitSeparator.bind(this)
    this.loadClusterSummary = this.loadClusterSummary.bind(this)
    this.handleMinVisible = this.handleMinVisible.bind(this)
    this.myProject = this.props.intl.formatMessage(CommonIntlMessages.myProject)
    this.state = {
      tab1: true,
      tab2: false,
      tab3: false,
      tab4: false,
      tab5: false,
      tab6: false,
      isTeam: false,
      statefulApp: 'mysql',
      isComputing: true,
      isApplication: false,
      isService: false,
      clusterList: [],
      clusterUseList: [],
      storageCount: 0,
      memoryCount: 0,
      hostCount: 0,
      publicCount: 0,
      roleNameArr: '',
      minvisible: true,
      dbClusterList: []
    }
  }

  loadClusterSummary(clusterID) {
    const { loadClusterSummary } = this.props
    loadClusterSummary(clusterID, {
      failed: {
        func: () => {
          // do not show error in page
        }
      }
    })
  }

  componentWillMount() {
    const { current, loadClusterInfo, loadDbCacheList } = this.props
    const { minvisible } = this.state
    const { clusterID } = current.cluster
    loadDbCacheList(clusterID, 'mysql', {
      success: {
        func: res => {
          this.setState({
            dbClusterList: res.databaseList
          })
        }
      },
      failed: {
        func: () => {}
      }
    })
    loadClusterInfo(clusterID, { minvisible })
    this.loadClusterSummary(clusterID)
    this.fetchQuotaList()
    this.storageList()
    this.fetchProjectName()
  }

  handleMinVisible(e) {
    const { loadClusterInfo, current } = this.props
    const { clusterID } = current.cluster
    const minvisible = !e.target.checked
    this.setState({ minvisible }, state => {
      loadClusterInfo(clusterID, { minvisible })
    })
  }

  fetchProjectName() {
    const { GetProjectsDetail, projectName } = this.props
    if (!projectName || projectName === 'default') return
    GetProjectsDetail({
      projectsName: projectName
    }, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              let roleIdArr = []
              let roleNameArr = []
              res.data.outlineRoles.forEach(item => {
                if (item.indexOf('RID-') !== -1) {
                  roleIdArr.push(item)
                }
              })
              const { relatedRoles } = res.data
              roleIdArr.length && relatedRoles && relatedRoles.length && relatedRoles.forEach(item => {
                if (roleIdArr.includes(item.roleId)) {
                  roleNameArr.push(item.roleName)
                }
              })
              this.setState({
                roleNameArr,
              })
            }
          },
          isAsync: true,
        }
      })
  }

  storageList() {
    const { fetchStorage, clusterID } = this.props
    let query = {
      cluster: clusterID
    }

    fetchStorage(query, {
      success: {
        func: res => {
          if (res.code === 200) {
            this.setState({
              hostCount: res.data.host,
              publicCount: res.data.share,
              memoryCount: res.data.private,
              storageCount: res.data.snapshot
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: err => {
        },
        isAsync: true,
      }
    })
  }

  fetchQuotaList() {
    const { getClusterQuota, getClusterQuotaList, clusterID } = this.props
    let query = {
      id: clusterID,
    }
    getClusterQuota(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              clusterList: res.data
            })
          }
        },
        isAsync: true
      }
    })
    getClusterQuotaList(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              clusterUseList: res.data
            })
          }
        },
        isAsync: true
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { loadClusterInfo } = this.props
    const { current } = nextProps
    const { clusterID } = current.cluster
    if (clusterID !== this.props.current.cluster.clusterID) {
      loadClusterInfo(clusterID)
      this.loadClusterSummary(clusterID)
      return
    }
    if (current.team.teamID !== 'default') {
      this.setState({
        isTeam: true
      })
    }
  }

  thousandBitSeparator(num) {
    return num && (num.toString().indexOf('.') != -1 ? num.toString().replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
      return $1 + ",";
    }) : num.toString().replace(/(\d)(?=(\d{3}))/g, function ($0, $1) {
      return $1 + ",";
    }));
  }

  handleSize(size) {
    if (!size) {
      return 0 + 'MB'
    }
    let result = 0
    if (size < 1024) {
      return size + 'MB'
    }
    if (size < 1024 * 1024) {
      result = this.thousandBitSeparator(Math.floor(size / 1024 * 100) / 100)
      return result + 'GB'
    }
    if (size < 1024 * 1024 * 1024) {
      result = this.thousandBitSeparator(Math.floor(size / (1024 * 1024) * 100) / 100)
      return result + 'T'
    }
    result = this.thousandBitSeparator(Math.floor(size / (1024 * 1024 * 1024) * 100) / 100)
    return result + 'T'
  }

  onChange(e) {
    const { isApplication, isComputing, isService } = this.state
    switch (e.target.value) {
      case 'computing':
        if (isComputing) {
          this.setState({
            isComputing: false
          })
        } else {
          this.setState({
            isComputing: true,
            isApplication: false,
            isService: false,
          })
        }
        break
      case 'application':
        if (isApplication) {
          this.setState({
            isApplication: false
          })
        } else {
          this.setState({
            isApplication: true,
            isComputing: false,
            isService: false,
          })
        }
        break
      case 'service':
        if (isService) {
          this.setState({
            isService: false
          })
        } else {
          this.setState({
            isService: true,
            isApplication: false,
            isComputing: false,
          })
        }
        break
      default:
        return
    }
  }
  maxClusterCount(value) {
    const { clusterList } = this.state
    let count = -1
    if (clusterList) {
      Object.keys(clusterList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(clusterList)[index] !== null ? Object.values(clusterList)[index] : -1
        }
      })
    }
    return count
  }
  useClusterCount(value) {
    const { clusterUseList } = this.state
    let count = 0
    if (clusterUseList) {
      Object.keys(clusterUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(clusterUseList)[index].toString().indexOf('.') === -1 ?
            Object.values(clusterUseList)[index] : Object.values(clusterUseList)[index].toFixed(2)
        }
      })
    }
    return count
  }
  renderProcessNumber(key, span = {}) {
    const { formatMessage } = this.props.intl
    const usedCount = this.useClusterCount(key)
    const maxCount = this.maxClusterCount(key)
    const { left = 10, right = 10 } = span
    let overUesd = false
    if (usedCount > maxCount && maxCount !== -1) {
      overUesd = true
    }
    const content = <div>
      <span style={{ color: overUesd ? 'red' : 'white' }}>{usedCount}</span>
      /
      <span>{maxCount === -1 ? formatMessage(IntlMessages.unlimit) : maxCount}</span>
    </div>
    return (
      <Row className="number-row" >
        <Col span={2}></Col>
        <Col span={22} className="number textoverflow" >
          <Tooltip title={content}>
            <p>
              <span style={{ color: overUesd ? 'red' : '#333333' }}>{usedCount}</span>
              /
              <span style={{ color: '#333333' }}>
              {
                maxCount === -1
                ? formatMessage(IntlMessages.unlimit)
                : maxCount
                }
              </span>
            </p>
          </Tooltip>
        </Col>
      </Row>
    )
  }
  filterPercent(value, count) {
    let max = 100
    let result = 0
    if (value === 0 && count === 0) return 0
    if (value === 1) {
      if (count > value) {
        result = max
      } else {
        if (count === value) {
          result = max
        } else {
          result = count * 100
        }
      }
    } else if (value !== -1) {
      let number = 100 / value
      for (let i = 0; i < count; i++) {
        if (String(count).indexOf('.') === -1) {
          result += number
        } else {
          if (Number(String(count).split('.')[0]) > 0) {
            result += Math.floor(number)
          } else {
            result += count * number
          }
        }
      }
    }
    result > max ? result = max : result
    return result
  }
  dBAndClusterChange = val => {
    const { current, loadDbCacheList } = this.props
    const { clusterID } = current.cluster
    loadDbCacheList(clusterID, val, {
      success: {
        func: res => {
          this.setState({
            dbClusterList: res.databaseList
          })
        }
      },
      failed: {
        func: () => {
          this.setState({
            dbClusterList: []
          })
        }
      }
    })
  }
  filterDbStatus = () => {
    const { dbClusterList } = this.state
    const statusList = {"Pending": 0, "Running": 0, "Stopping": 0, "Stopped": 0}
    if (dbClusterList.length === 0) {
      return statusList
    }
    for (const key in statusList) {
      statusList[key] = dbClusterList.filter(v => v.status === key).length || 0
    }
    return statusList
  }
  render() {
    const {
      clusterOperations, clusterSysinfo, clusterStorage, clusterAppStatus,
      clusterNodeSummary, clusterDbServices, clusterName, clusterUseList,
      clusterNodeSpaceConsumption, clusterSummary, volumeSummary,
      clusterStaticSummary, isFetching, loginUser, current, intl,
    } = this.props
    const { space } = current
    const { formatMessage } = intl
    const { userName, email, avatar, certInfos, billingConfig } = loginUser
    const { enabled: billingEnabled } = billingConfig || { enabled: false }
    let boxPos = 0
    if ((clusterStorage.freeSize + clusterStorage.usedSize) > 0) {
      boxPos = (clusterStorage.usedSize / (clusterStorage.freeSize + clusterStorage.usedSize)).toFixed(4)
    }
    //应用
    let appRunning = clusterAppStatus.appMap.get('Running')
    let appStopped = clusterAppStatus.appMap.get('Stopped')
    let appOthers = clusterAppStatus.appMap.get('Unknown') || 0 + clusterAppStatus.appMap.get('Pending') || 0
    //服务
    let svcRunning = clusterAppStatus.svcMap.get('Running')
    let svcStopped = clusterAppStatus.svcMap.get('Stopped')
    let svcOthers = clusterAppStatus.svcMap.get('Deploying') ? clusterAppStatus.svcMap.get('Deploying') : 0 +
      clusterAppStatus.svcMap.get('Pending') ? clusterAppStatus.svcMap.get('Pending') : 0
    //容器
    let conRunning = clusterAppStatus.podMap.get('Running')
    let conFailed = clusterAppStatus.podMap.get('Failed') || 0 +
      clusterAppStatus.podMap.get('Abnormal') ? clusterAppStatus.podMap.get('Abnormal') : 0
    let conOthers = clusterAppStatus.podMap.get('Pending') ? clusterAppStatus.podMap.get('Pending') : 0 +
      clusterAppStatus.podMap.get('Terminating') ? clusterAppStatus.podMap.get('Terminating') : 0 +
        clusterAppStatus.podMap.get('Unknown') ? clusterAppStatus.podMap.get('Unknown') : 0

    appRunning = appRunning ? appRunning : 0
    appStopped = appStopped ? appStopped : 0
    appOthers = appOthers ? appOthers : 0
    svcRunning = svcRunning ? svcRunning : 0
    svcStopped = svcStopped ? svcStopped : 0
    svcOthers = svcOthers ? svcOthers : 0
    conRunning = conRunning ? conRunning : 0
    conFailed = conFailed ? conFailed : 0
    conOthers = conOthers ? conOthers : 0
    //计算资源使用率
    //CPU
    let CPUNameArr = []
    let CPUResourceName = []
    let CPUUsedArr = []
    if (clusterNodeSummary.cpu && clusterNodeSummary.cpu.length !== 0) {
      clusterNodeSummary.cpu.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        CPUResourceName.push(name)
        name = name.length > 9 ? `${name.substring(0, 6)}...` : name
        CPUNameArr.push(name)
        CPUUsedArr.push(item.used)
      })
    } else {
      CPUUsedArr = [ formatMessage(IntlMessages.noData) ]
    }
    //内存
    let memoryNameArr = []
    let memoryResourceName = []
    let memoryUsedArr = []
    if (clusterNodeSummary.memory && clusterNodeSummary.memory.length !== 0) {
      clusterNodeSummary.memory.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        memoryResourceName.push(name)
        name = name.length > 9 ? `${name.substring(0, 6)}...` : name
        memoryNameArr.push(name)
        memoryUsedArr.push(item.used)
      })
    } else {
      memoryUsedArr = [ formatMessage(IntlMessages.noData) ]
    }
    //磁盘
    let diskNameArr = []
    let diskUsedArr = []
    if (clusterNodeSummary.storage && clusterNodeSummary.storage.length !== 0) {
      clusterNodeSummary.storage.slice(0, 3).map((item, index) => {
        let name = item.name.replace(/192.168./, '')
        diskNameArr.push(name)
        // diskNameArr.push(item.name)
        diskUsedArr.push((item.used))
      })
    } else {
      diskUsedArr = [ formatMessage(IntlMessages.noData) ]
    }
/*    //数据库与缓存
    //MySQL
    const mysqlData = clusterDbServices.get('mysql')
    let mySQLRunning = 0
    let mySQLStopped = 0
    let mySQLOthers = 0

    if (mysqlData.size !== 0) {
      const failedCount = mysqlData.get('failed') ? mysqlData.get('failed') : 0
      const pendingCount = mysqlData.get('pending') ? mysqlData.get('pending') : 0
      const runningCount = mysqlData.get('running') ? mysqlData.get('running') : 0
      const unknownCount = mysqlData.get('unknown') ? mysqlData.get('unknown') : 0
      mySQLRunning = runningCount
      mySQLStopped = failedCount + unknownCount
      mySQLOthers = pendingCount
    }
    //Mongo
    const mongoData = clusterDbServices.get('mongo')
    let mongoRunning = 0
    let mongoStopped = 0
    let mongoOthers = 0
    if (mongoData.size !== 0) {
      const failedCount = mongoData.get('failed') ? mongoData.get('failed') : 0
      const pendingCount = mongoData.get('pending') ? mongoData.get('pending') : 0
      const runningCount = mongoData.get('running') ? mongoData.get('running') : 0
      const unknownCount = mongoData.get('unknown') ? mongoData.get('unknown') : 0
      mongoRunning = runningCount
      mongoStopped = failedCount + unknownCount
      mongoOthers = pendingCount
    }
    //Redis
    const redisData = clusterDbServices.get('redis')
    let redisRunning = 0
    let redisStopped = 0
    let redisOthers = 0
    if (redisData.size !== 0) {
      const failedCount = redisData.get('failed') ? redisData.get('failed') : 0
      const pendingCount = redisData.get('pending') ? redisData.get('pending') : 0
      const runningCount = redisData.get('running') ? redisData.get('running') : 0
      const unknownCount = redisData.get('unknown') ? redisData.get('unknown') : 0
      redisRunning = runningCount
      redisStopped = failedCount + unknownCount
      redisOthers = pendingCount
    }
    // Zookeeper
    const zookeeperData = clusterDbServices.get('zookeeper')
    let zookeeperRunning = 0
    let zookeeperStopped = 0
    let zookeeperOthers = 0
    if (zookeeperData.size !== 0) {
      const failedCount = zookeeperData.get('failed') ? zookeeperData.get('failed') : 0
      const pendingCount = zookeeperData.get('pending') ? zookeeperData.get('pending') : 0
      const runningCount = zookeeperData.get('running') ? zookeeperData.get('running') : 0
      const unknownCount = zookeeperData.get('unknown') ? zookeeperData.get('unknown') : 0
      zookeeperRunning = runningCount
      zookeeperStopped = failedCount + unknownCount
      zookeeperOthers = pendingCount
    }
    // ElasticSearch
    const elasticSearchData = clusterDbServices.get('elasticsearch')
    let elasticSearchRunning = 0
    let elasticSearchStopped = 0
    let elasticSearchOthers = 0
    if (elasticSearchData.size !== 0) {
      const failedCount = elasticSearchData.get('failed') ? elasticSearchData.get('failed') : 0
      const pendingCount = elasticSearchData.get('pending') ? elasticSearchData.get('pending') : 0
      const runningCount = elasticSearchData.get('running') ? elasticSearchData.get('running') : 0
      const unknownCount = elasticSearchData.get('unknown') ? elasticSearchData.get('unknown') : 0
      elasticSearchRunning = runningCount
      elasticSearchStopped = failedCount + unknownCount
      elasticSearchOthers = pendingCount
    }
    // Etcd
    const etcdData = clusterDbServices.get('etcd')
    let etcdRunning = 0
    let etcdStopped = 0
    let etcdOthers = 0
    if (etcdData.size !== 0) {
      const failedCount = etcdData.get('failed') ? etcdData.get('failed') : 0
      const pendingCount = etcdData.get('pending') ? etcdData.get('pending') : 0
      const runningCount = etcdData.get('running') ? etcdData.get('running') : 0
      const unknownCount = etcdData.get('unknown') ? etcdData.get('unknown') : 0
      etcdRunning = runningCount
      etcdStopped = failedCount + unknownCount
      etcdOthers = pendingCount
    }*/
    const statefulApps = {
      mysql: "MySQL",
      redis: "Redis",
      zookeeper: "ZooKeeper",
      elasticsearch: "ElasticSearch",
      //etcd: "Etcd",
    }
    const statefulAppTabMapping = {
      mysql: 'tab1',
      mongo: 'tab2',
      redis: 'tab3',
      zookeeper: 'tab4',
      elasticsearch: 'tab5',
      etcd: 'tab6',
    }
    const defaultState = {
      tab1: false,
      tab2: false,
      tab3: false,
      tab4: false,
      tab5: false,
      tab6: false,
      statefulApp: 'MySQL',
    }
    const onStatefulAppOptionClick = function (app) {
      const tab = statefulAppTabMapping[app]
      const newState = {
        [tab]: true,
        statefulApp: statefulApps[app],
      }
      this.setState(Object.assign({}, defaultState, newState))
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select
        defaultValue={this.state.statefulApp}
        style={{ width: '80%', margin: '10px 10%' }}
        onChange={val => {this.dBAndClusterChange(val)}}
      >
        {statefulAppOptions}
      </Select>
    )
    //集群mem、cpu和存储概况
    let clusterSummaryCapacity = clusterSummary.capacity
    let clusterSummaryUsed = clusterSummary.used
    //let cpuUsed = Math.ceil(clusterSummaryUsed.cpu / clusterSummaryCapacity.cpu * 100)
    let cpuUsed = clusterSummaryUsed.cpu
    let memoryUsed = clusterSummaryUsed.memory
    let volumeCapacity = volumeSummary.total

    //memory
    const usedMemory = (clusterSummaryUsed.memory / 1024 / 1024).toFixed(2)
    const capacityMemory = (clusterSummaryCapacity.memory / 1024 / 1024).toFixed(2)
    let memoryUsedPrecent = Math.ceil(clusterSummaryUsed.memory / clusterSummaryCapacity.memory * 100)

    //cpu
    let cpuUsedPrecent = Math.ceil(clusterSummaryUsed.cpu / clusterSummaryCapacity.cpu * 100)
    const capacityCPU = (clusterSummaryCapacity.cpu / 1000).toFixed(2)
    const usedCPU = (clusterSummaryUsed.cpu / 1000).toFixed(2)
    // let volumeAllocated =  parseInt(volumeSummary.allocated)
    // if (volumeCapacity.toLowerCase().indexOf('g') > 0) {
    //   volumeCapacity = parseInt(volumeCapacity) * 1024
    // } else {
    //   volumeCapacity = parseInt(volumeCapacity)
    // }
    // let volumeUsed = Math.ceil(volumeAllocated / volumeCapacity * 100)

    //volume
    let volumeAllocated = parseFloat(volumeSummary.allocated)
    if (volumeCapacity.toLowerCase().indexOf('g') > 0) {
      volumeCapacity = parseFloat(volumeCapacity).toFixed(2)
    } else if (volumeCapacity.toLowerCase().indexOf('t') > 0) {
      volumeCapacity = (parseFloat(volumeCapacity) * 1024).toFixed(2)
    } else {
      volumeCapacity = (parseFloat(volumeCapacity) / 1024).toFixed(2)
    }
    let volumeUsedPrecent = Math.ceil(volumeAllocated / (volumeCapacity * 1024) * 100)
    let volumeUsed = (volumeAllocated / 1024).toFixed(2)

    // pod number
    let canCreateContainer = Math.floor((clusterSummaryCapacity.memory - clusterSummaryUsed.memory) / 512 / 1024)
    let allocatedPod = clusterStaticSummary.pod
    let allocatedPodNumber = 0

    allocatedPodNumber += allocatedPod ? allocatedPod['running'] : 0
    allocatedPodNumber += allocatedPod ? allocatedPod['pending'] : 0
    let capacityCreateContainer = canCreateContainer + allocatedPodNumber
    //Options
    let appOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '已停止' }, { name: '操作中' }],
        formatter: function (name) {
          if (name === '运行中') {
            return formatMessage(IntlMessages.running) + '  ' + appRunning
            + formatMessage(IntlMessages.one)
          } else if (name === '已停止') {
            return formatMessage(IntlMessages.stopped) + '  ' + appStopped
            + formatMessage(IntlMessages.one)
          } else if (name === '操作中') {
            return formatMessage(IntlMessages.operating) + '  ' + appOthers
            + formatMessage(IntlMessages.one)
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: appRunning, name: '运行中' },
          { value: appStopped, name: '已停止' },
          { value: appOthers, name: '操作中', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let serviceOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '已停止' }, { name: '操作中' }],
        // data: legendData,
        formatter: function (name) {
          if (name === '运行中') {
            return formatMessage(IntlMessages.running) + '  ' + svcRunning
            + formatMessage(IntlMessages.one)
          } else if (name === '已停止') {
            return formatMessage(IntlMessages.stopped) + '  ' + svcStopped
            + formatMessage(IntlMessages.one)
          } else if (name === '操作中') {
            return formatMessage(IntlMessages.operating) + '  ' + svcOthers
            + formatMessage(IntlMessages.one)
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: svcRunning, name: '运行中' },
          { value: svcStopped, name: '已停止' },
          { value: svcOthers, name: '操作中', selected: true },
        ],
        // data: seriesData,
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let containerOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '50%',
        top: 'middle',
        data: [{ name: '运行中' }, { name: '异常' }, { name: '操作中' }],
        formatter: function (name) {
          if (name === '运行中') {
            return formatMessage(IntlMessages.running) + '  ' + conRunning
            + formatMessage(IntlMessages.one)
          } else if (name === '异常') {
            return formatMessage(IntlMessages.abnormal) + conFailed
            + formatMessage(IntlMessages.one)
          } else if (name === '操作中') {
            return formatMessage(IntlMessages.operating) + '  ' + conOthers
            + formatMessage(IntlMessages.one)
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8', '#f6575e', '#2abe84'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data: [
          { value: conRunning, name: '运行中' },
          { value: conFailed, name: '异常' },
          { value: conOthers, name: '操作中', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let CPUOption = {
      title: {
        text: 'CPU',
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        width: '100px',
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let content = '';
          for (let i = 0; i < params.length; i++) {
            if (params[i].name) {
              content += "<div>" + CPUResourceName[params[i]['dataIndex']];
              break;
            }
          }
          for (let i = 0, key = {}; i < params.length; i++) {
            key = params[i];
            if (typeof key.value === 'undefined' || key.value === '-')
              key.value = formatMessage(IntlMessages.noData);
            content += key.seriesName + " : " + key.value + "%";
          }
          content += '</div>';

          //return出去后echarts会调用html()函数将content字符串代码化
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: CPUNameArr,
          splitLine: {
            "show": false
          },
          axisTick: {
            "show": false
          },
          splitArea: {
            "show": false
          },
          axisLabel: {
            "interval": 0,
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          max: 100,
          splitNumber: 2,
          interval: 50,
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        }
      ],
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: CPUUsedArr,
        }
      ]
    }
    let memoryOption = {
      title: {
        text: formatMessage(IntlMessages.memory),
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13,
          color: '#666'
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let content = '';
          for (let i = 0; i < params.length; i++) {
            if (params[i].name) {
              content += "<div>" + memoryResourceName[params[i]['dataIndex']];
              break;
            }
          }
          for (let i = 0, key = {}; i < params.length; i++) {
            key = params[i];
            if (typeof key.value === 'undefined' || key.value === '-')
              key.value = formatMessage(IntlMessages.noData);
            content += key.seriesName + " : " + key.value + "%";
          }
          content += '</div>';

          //return出去后echarts会调用html()函数将content字符串代码化
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: memoryNameArr,
          splitLine: {
            "show": false
          },
          axisTick: {
            "show": false
          },
          splitArea: {
            "show": false
          },
          axisLabel: {
            "interval": 0,
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          max: 100,
          splitNumber: 2,
          interval: 50,
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        }
      ],
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: memoryUsedArr,

        }
      ]
    }
    let diskOption = {
      title: {
        text: '磁盘',
        top: '15px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 13,
          color: '#666'
        }
      },
      color: ['#46b2fa'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (!clusterNodeSummary.storage || clusterNodeSummary.storage.length === 0) ? '{c}' : '{b} : {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: diskNameArr,
          splitLine: {
            "show": false
          },
          axisTick: {
            "show": false
          },
          splitArea: {
            "show": false
          },
          axisLabel: {
            "interval": 0,
            // rotate: 45,
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          max: 100,
          splitNumber: 2,
          interval: 50,
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        }
      ],
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 16,
          data: diskUsedArr,

        }
      ]
    }
    /* let statusOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : ({d}%)' //function (obj) {
        // if(obj.data.cpu)  {
        //   if (obj.name == '已使用') {
        //     return　`已使用${usedCPU}核`
        //   } else {
        //     return `可使用${((capacityCPU * 100 - usedCPU * 100)/100).toFixed(2)}核`
        //   }
        // }
        // if(obj.data.memory){
        //   if (obj.name == '已使用') {
        //     return  `已使用${usedMemory}GB`
        //   } else {
        //     return  `可使用${((capacityMemory * 100 - usedMemory * 100) / 100).toFixed(2)}GB`
        //   }
        // }
        // if(obj.data.volume) {
        //   if (obj.name == '已使用') {
        //     return `已使用${volumeUsed}GB`
        //   } else {
        //     return `可使用${((volumeCapacity * 100 - volumeUsed * 100 ) / 100).toFixed(2)}GB`
        //   }
        // }
        // }
      },
      // legend: {
      //   left: '50%',
      //   top: '50%',
      //   x: 'left',
      //   itemWidth: '48px',
      //   itemHeight: '31px',
      //   data: [{ name: 'cpu' }, { name: '内存' }, { name: '存储' }]
      // },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['17%', '50%'],
        data: [
          { value: cpuUsedPrecent, name: '已使用', selected: true, cpu: true },
          { value: 100 - cpuUsedPrecent, name: '可使用', cpu: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,

          },
          emphasis: {
            show: true,
            position: 'center',
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            },
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return 　`${usedCPU}核`
            //   } else {
            //     return `${((capacityCPU * 100 - usedCPU * 100)/100).toFixed(2)}核`
            //   }
            // },
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 7,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }, {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['50%', '50%'],
        data: [
          { value: memoryUsedPrecent, name: '已使用', selected: true, memory: true },
          { value: 100 - memoryUsedPrecent, name: '可使用', memory: true }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return `${usedMemory}GB`
            //   } else {
            //     return `${((capacityMemory * 100 - usedMemory * 100) / 100).toFixed(2)}GB`
            //   }
            // },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }, {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['19', '28'],
        center: ['83%', '50%'],
        data: [
          { value: volumeUsedPrecent, name: '已使用', selected: true, volume: true },
          { value: 100 - volumeUsedPrecent, name: '可使用', volume: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
            // formatter: function (param) {
            //   if (param.name == '已使用') {
            //     return `${volumeUsed}GB`
            //   } else {
            //     return `${((volumeCapacity * 100 - volumeUsed * 100 ) / 100).toFixed(2)}GB`
            //   }
            // },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#44b3fa', '#2abe84', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }]
    } */
    const img = userName.substr(0, 1).toUpperCase()
    const { isComputing, isApplication, isService, roleNameArr } = this.state
    const computeList = [
      {
        key: 'cpu',
        text: 'CPU(C)',
      }, {
        key: 'memory',
        text: `${formatMessage(IntlMessages.memory)}(GB)`,
      }, {
        key: 'storage',
        text: `${formatMessage(IntlMessages.storage)}(GB)`,
      }]
    const platformList = [
      {
        key: 'application',
        text: formatMessage(IntlMessages.apps),
      }, {
        key: 'service',
        text: formatMessage(IntlMessages.service),
      }, {
        key: 'container',
        text: formatMessage(IntlMessages.container),
      }, {
        key: 'volume',
        text: formatMessage(IntlMessages.volume),
      }, {
        key: 'snapshot',
        text: formatMessage(IntlMessages.snapshot),
      }, {
        key: 'configuration',
        text: formatMessage(IntlMessages.configuration),
      }]
    const serviceList = [
      {
        key: 'mysql',
        text: formatMessage(IntlMessages.mysql),
      }, {
        key: 'redis',
        text: formatMessage(IntlMessages.redis),
      },
      {
        key: 'zookeeper',
        text: formatMessage(IntlMessages.zookeeper),
      }, {
        key: 'elasticsearch',
        text: formatMessage(IntlMessages.elasticsearch),
      },
      // {
      //   key: 'etcd',
      //   text: 'Etcd集群 (个)'
      // }
      ]
    const spaceName = space.name || space.userName
    return (
      <div id='Ordinary'>
        <Row className="title">
          {
            this.props.userID === undefined
              ? spaceName === this.myProject
                ? ''
                : `${formatMessage(IntlMessages.project)} - `
              : `${formatMessage(IntlMessages.personalProject)} - `
          }
          {spaceName} - {clusterName}
        </Row>
        <Row className="content" gutter={16}>
          {SHOW_BILLING ?
            <Col span={6} className='clusterCost'>
              <Card
                title={formatMessage(IntlMessages.projectInfo)}
                bordered={false}
                bodyStyle={{ height: 220, padding: '30px 24px' }}
                extra={
                  spaceName !== this.myProject
                    ? this.props.userID === undefined
                      ? <Link to={`/tenant_manage/project_manage/project_detail?name=${this.props.projectName}`}>
                        <Button type="primary" size="small">
                          <FormattedMessage {...IntlMessages.projectDetail} />
                        </Button>
                      </Link>
                      : ''
                    : ''
                }
              >
                <div className='costInfo'>
                  <div className="projectUser">
                    <span className="project">
                      <FormattedMessage {...IntlMessages.projectName} />
                    </span>
                    <span>{spaceName}</span>
                    {/*{
                      spaceName === this.myProject
                        ? <span className="desc">
                          <FormattedMessage {...IntlMessages.personal} />
                        </span>
                        : this.props.userID === undefined
                          ? <span className="public">
                            <FormattedMessage {...IntlMessages.shared} />
                          </span>
                          : <span className="desc">
                            <FormattedMessage {...IntlMessages.personal} />
                          </span>
                    }*/}
                  </div>
                  <div className="projectRole">
                    <span className="project">
                      <FormattedMessage {...IntlMessages.projecRoles} />
                    </span>
                    {
                      spaceName === this.myProject || this.props.userID !== undefined
                        ? <span className="projectDesc">
                          <FormattedMessage {...IntlMessages.personalProjectNoRoles} />
                        </span>
                        : <Tooltip title={roleNameArr.length === 0 ? '- -' : roleNameArr.join('/ ')}>
                          <span className="projectName">{roleNameArr.length === 0 ? '- -' : roleNameArr.join('/ ')}</span>
                        </Tooltip>
                    }
                  </div>
                  {
                    billingEnabled &&
                    <div>
                      <div className='userCost'>
                        <div className="project">
                          {/* <i style={{ backgroundColor: '#46b2fa' }}></i> */}
                          {
                            this.state.isTeam
                              ? <FormattedMessage {...IntlMessages.projectBalance} />
                              : <FormattedMessage {...IntlMessages.myBalance} />
                          }
                        </div>
                        <span className='costNum'>
                        <Tooltip title={parseAmount(clusterNodeSpaceConsumption.balance).amount + 'T'}>
                          <span>{parseAmount(clusterNodeSpaceConsumption.balance).amount} T</span>
                        </Tooltip>
                      </span>
                        {/*<Link to='/account'><Button type='primary'>去充值</Button></Link>*/}
                      </div>
                      <div className='userCost'>
                        <div className="project">
                          {/* <i style={{ backgroundColor: '#28bd83' }}></i> */}
                          <FormattedMessage {...IntlMessages.todayConsumption} />
                        </div>
                        <span className='costNum'>
                        <Tooltip title={parseAmount(clusterNodeSpaceConsumption.consumption).amount + 'T'}>
                          <span>{parseAmount(clusterNodeSpaceConsumption.consumption).amount} T</span>
                        </Tooltip>
                          &nbsp;
                        <Tooltip title={<FormattedMessage {...IntlMessages.allClusters} />}>
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                        <Link to='/account/costCenter#consumptions' className="ant-btn ant-btn-primary">
                          <FormattedMessage {...IntlMessages.go} />
                        </Link>
                      </div>
                    </div>
                  }
                </div>
              </Card>
            </Col>
            :
            <Col span={6} className='clusterCost'>
              <Card
                title={formatMessage(IntlMessages.accountInfo)}
                bordered={false}
                bodyStyle={{ height: 220, padding: '36px 24px' }}
              >
                <div className='loginUser'>
                  <div className='logAvatar' style={{ float: 'none', margin: '0 auto' }}>
                    <Link to='/account'>
                      <span style={{ color: 'white' }}>{img}</span>
                      {/*<img alt={userName} src={`${AVATAR_HOST}${avatar}`} />*/}
                    </Link>
                  </div>
                </div>
                <div className="text-center" style={{ fontSize: 16, marginTop: 20 }}>
                  <Link to='/account'>
                    <p className="userName textoverflow">
                      {userName}
                    </p>
                  </Link>
                  <Tooltip title={email}>
                    <p className="textoverflow" style={{ marginTop: 5 }}>{email || '...'}</p>
                  </Tooltip>
                </div>

              </Card>
            </Col>
          }
          <Col span={6} className='quota'>
            <Card
              title={formatMessage(IntlMessages.resourceQuotaOverview)}
              bordered={false}
              bodyStyle={{ height: 220 }}
              extra={
                <Link to={spaceName === this.myProject
                  ? this.props.loginUser.role !== 2
                    ? '/account?tabs=quota'
                    : `/tenant_manage/user/${this.props.loginUser.userID}?tabs=quota`
                  : this.props.userID === undefined
                    ? `/tenant_manage/project_manage/project_detail?name=${this.props.projectName}&tabs=quota`
                    : `/tenant_manage/user/${this.props.userID}?tabs=quota`}
                >
                  <Button type="primary" size="small">
                    {
                      this.props.loginUser.role === 2
                        ? <FormattedMessage {...IntlMessages.setQuota} />
                        : <FormattedMessage {...IntlMessages.seeDetails} />
                    }
                  </Button>
                </Link>
              }
            >
              <Row className="radios">
                <RadioGroup size="small" onChange={(e) => this.onChange(e)} defaultValue="computing">
                  <Radio prefixCls="ant-radio-button" value="computing">
                    <FormattedMessage {...IntlMessages.computingResource} />
                  </Radio>
                  <Radio prefixCls="ant-radio-button" value="application">
                    <FormattedMessage {...IntlMessages.appManage} />
                  </Radio>
                  <Radio prefixCls="ant-radio-button" value="service">
                    <FormattedMessage {...IntlMessages.dbAndCache} />
                  </Radio>
                </RadioGroup>
              </Row>
              <div className="calculation" style={{ display: isComputing ? 'block' : 'none' }}>
                {
                  computeList.map((item, index) => (
                    <div className="info" key={`calculation-${index}`}>
                      <Row>
                        <Col span={4}>
                          <Tooltip title={item.text}>
                            <span className="item">{item.text}</span>
                          </Tooltip>
                        </Col>
                        <Col span={13}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={7}>
                          {this.renderProcessNumber(item.key, { left: 6, right: 18})}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
              <div className="application" style={{ overflowY: 'auto', display: isApplication ? 'block' : 'none' }}>
                {
                  platformList.map((item, index) => (
                    <div className="info" key={`application-${index}`}>
                      <Row>
                        <Col span={4}>
                          <Tooltip title={item.text}>
                            <span className="item">{item.text}</span>
                          </Tooltip>
                        </Col>
                        <Col span={16}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={4}>
                          {this.renderProcessNumber(item.key, { left: 9, right: 15})}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
              <div className="service" style={{ overflowY: 'auto', display: isService ? 'block' : 'none' }}>
                {
                  serviceList.map((item, index) => (
                    <div className="info" key={`service-${index}`}>
                      <Row>
                        <Col span={6}>
                          <Tooltip title={item.text}>
                            <span className="item">{item.text}</span>
                          </Tooltip>
                        </Col>
                        <Col span={14}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={4}>
                          {this.renderProcessNumber(item.key, { left: 14, right: 10})}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
            </Card>
          </Col>
          <Col span={6} className='clusterRecord'>
            <Card
              title={formatMessage(IntlMessages.todayClusterInfo)}
              bordered={false}
              bodyStyle={{ height: 220 }}
            >
              <div style={{ overflowY: 'auto', height: '172px' }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.createApp} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appCreate}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="volume-bind" className="icon"/>
                        <FormattedMessage {...IntlMessages.createService} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.svcCreate}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="storage-volume-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.createVolume} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.volumeCreate}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.stopApp} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appStop}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="volume-bind" className="icon"/>
                        <FormattedMessage {...IntlMessages.delService} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.svcDelete}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="storage-volume-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.delVolume} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.volumeDelete}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    {/* <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.updateApp} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appModify}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr> */}
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.startApp} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appStart}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.redeploy} />
                    </td>
                      <td className="recordNum">
                        {clusterOperations.appRedeploy}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
          <Col span={6} className='sysState'>
            <Spin spinning={isFetching}>
              <Card
                title={formatMessage(IntlMessages.sysStatus)}
                bordered={false}
                bodyStyle={{ height: 220 }}
              >
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <TenxIcon type="kubernetes" className="icon"/>
                        Kubernetes
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.k8s.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                     {clusterSysinfo.k8s.version}
                     </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="www" className="icon"/>
                        DNS
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.dns.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                     {clusterSysinfo.dns.version}
                     </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="engine" className="icon"/>
                        API Server
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.apiserver.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                     {clusterSysinfo.apiserver.version}
                     </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="lift-card-o" className="icon"/>
                        Monitor
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.monitor.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                     {clusterSysinfo.monitor.version}
                     </td>*/}
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="log" className="icon"/>
                        Logging
                    </td>
                      <td>
                        <SvcState currentState={clusterSysinfo.logging.status} />
                      </td>
                      {/*<td style={{ textAlign: 'right', paddingRight: 10 }}>
                     {clusterSysinfo.logging.version}
                     </td>*/}
                    </tr>
                  </tbody>
                </table>
              </Card>
            </Spin>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card
              title={formatMessage(IntlMessages.app)}
              bordered={false}
              bodyStyle={{ height: 180, padding: '0px' }}
            >
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              title={formatMessage(IntlMessages.serviceOnly)}
              bordered={false}
              bodyStyle={{ height: 180, padding: '0px' }}
            >
              <ReactEcharts
                notMerge={true}
                option={serviceOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              title={formatMessage(IntlMessages.containerOnly)}
              bordered={false}
              bodyStyle={{ height: 180, padding: '0px' }}
            >
              <ReactEcharts
                notMerge={true}
                option={containerOption}
                style={{ height: '180px' }}
                showLoading={isFetching}
              />
            </Card>
          </Col>
          <Col span={6} className='storage'>
            <Card
              title={formatMessage(IntlMessages.storageAndSnapshot)}
              bordered={false}
              bodyStyle={{ height: 180, padding: '0px 20px 0px 0px' }}
            >
              {/* <ProgressBox boxPos={boxPos} /> */}
              <Col span={10} className="storageImg">
                <img src={snapshot} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              </Col>
              <Col span={14} className='storageInf'>
                <div className="storageInfList">
                  <Row className='storageInfItem'>
                    <Col span={14}>
                      <FormattedMessage {...IntlMessages.sharedStorage} />
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      {this.state.publicCount}
                      <FormattedMessage {...IntlMessages.one} />
                    </Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={14}>
                      <FormattedMessage {...IntlMessages.rbdStorage} />
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      {this.state.memoryCount}
                      <FormattedMessage {...IntlMessages.one} />
                    </Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={14}>
                      <FormattedMessage {...IntlMessages.hostStorage} />
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      {this.state.hostCount}
                      <FormattedMessage {...IntlMessages.one} />
                    </Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={14}>
                      <FormattedMessage {...IntlMessages.rbdStorageSnapshot} />
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      {this.state.storageCount}
                      <FormattedMessage {...IntlMessages.one} />
                    </Col>
                  </Row>
                </div>
              </Col>
            </Card>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          <Col span={6} className='dataBase'>
            <Card
              title={formatMessage(IntlMessages.dbAndCache)}
              bordered={false}
              bodyStyle={{ height: 200 }}
            >
              {statefulAppMenus}
              <Row style={{ display: this.state.tab1 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeMySQL} alt="MySQL" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#2db7f5' }}></div>
                          <FormattedMessage {...IntlMessages.pending} />
                      </td>
                        <td className="dbNum">
                          {this.filterDbStatus()['Pending']}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#33b867' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {this.filterDbStatus()['Running']}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#FFBF00' }}></div>
                          <FormattedMessage {...IntlMessages.stopping} />
                      </td>
                        <td className="dbNum">
                          {this.filterDbStatus()['Stopping']}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f85a5a' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {this.filterDbStatus()['Stopped']}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
{/*
              <Row style={{ display: this.state.tab2 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeMongoCluster} alt="MongoCluster" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {mongoRunning}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {mongoStopped}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          <FormattedMessage {...IntlMessages.operating} />
                      </td>
                        <td className="dbNum">
                          {mongoOthers}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab3 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeRedis} alt="Redis" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {redisRunning}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {redisStopped}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          <FormattedMessage {...IntlMessages.operating} />
                      </td>
                        <td className="dbNum">
                          {redisOthers}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab4 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeZookeeper} alt="Zookeeper" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {zookeeperRunning}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {zookeeperStopped}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          <FormattedMessage {...IntlMessages.operating} />
                      </td>
                        <td className="dbNum">
                          {zookeeperOthers}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab5 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeElasticSearch} alt="ElasticSearch" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {elasticSearchRunning}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {elasticSearchStopped}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          <FormattedMessage {...IntlMessages.operating} />
                      </td>
                        <td className="dbNum">
                          {elasticSearchOthers}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ display: this.state.tab6 ? 'block' : 'none', height: 130 }}>
                <Col span={12} className='dbImg'>
                  <img src={homeEtcd} alt="Etcd" />
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.running} />
                      </td>
                        <td className="dbNum">
                          {etcdRunning}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#f6575e' }}></div>
                          <FormattedMessage {...IntlMessages.stopped} />
                      </td>
                        <td className="dbNum">
                          {etcdStopped}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#28bd83' }}></div>
                          <FormattedMessage {...IntlMessages.operating} />
                      </td>
                        <td className="dbNum">
                          {etcdOthers}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
*/}
            </Card>
          </Col>
          <Col span={18} className="hostState">
            <Card title={
              <span>
                <FormattedMessage {...IntlMessages.computingResourceUsage} />
                <div style={{ width: 30, display: 'inline-block' }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>
                Tips：<FormattedMessage {...IntlMessages.computingResourceUsageTip} />
                </span>
              </span>
            } bordered={false} bodyStyle={{ height: 200, padding: '0px 20px' }}>
              <Row gutter={16} style={{ height: 200 }}>
                <Col span={8}>
                  <ReactEcharts
                    notMerge={true}
                    option={CPUOption}
                    style={{ height: '200px' }}
                    showLoading={isFetching}
                  />
                </Col>
                <Col span={8}>
                  <div className="minvisible">
                    <Checkbox checked={!this.state.minvisible} onChange={this.handleMinVisible}>
                      <FormattedMessage {...IntlMessages.showMasterNode} />
                    </Checkbox>
                  </div>
                  <ReactEcharts
                    notMerge={true}
                    option={memoryOption}
                    style={{ height: '200px' }}
                    showLoading={isFetching}
                  />
                </Col>
                <Col span={8} style={{ borderLeft: '1px solid #e2e2e2', height: '200px' }}>
                  <Row style={{ fontSize: '14px', textAlign: 'center', height: 60, lineHeight: '60px' }}>
                    <FormattedMessage {...IntlMessages.nodeStatus} />
                  </Row>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#43b4f6' }}></div>
                          <FormattedMessage {...IntlMessages.nodesSum} />
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.total : 0}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#2abe84' }}></div>
                          <FormattedMessage {...IntlMessages.healthyNodesSum} />
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.health : 0}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="stateDot" style={{ backgroundColor: '#a2d8fa' }}></div>
                          <FormattedMessage {...IntlMessages.notEnabledNodesSum} />
                      </td>
                        <td className="hostNum">
                          {clusterNodeSummary.nodeInfo ? clusterNodeSummary.nodeInfo.unused : 0}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <MySpace intl={intl} spaceName={spaceName} />
      </div>
    )
  }
}

function setMap(map, key) {
  if (map.get(key) == undefined) {
    map.set(key, 1)
  } else {
    map.set(key, map.get(key) + 1)
  }
}

function getStatus(data) {
  let appMap = new Map()
  let svcMap = new Map()
  let podMap = new Map()

  for (let appName in data) {
    let services = data[appName].deployments
    let pods = data[appName].pods
    let status = getAppStatus(services)
    if (services) {
      setMap(appMap, status.phase)
      services.map(service => {
        status = getServiceStatus(service)
        setMap(svcMap, status.phase)
      })
      pods.map(pod => {
        status = getContainerStatus(pod)
        setMap(podMap, status.phase)
      })
    }
  }
  return { appMap, svcMap, podMap }
}

function getDbServiceStatus(data) {
  let dbServiceMap = new Map()
  dbServiceMap.set("mysql", new Map())
  dbServiceMap.set("mongo", new Map())
  dbServiceMap.set("redis", new Map())
  dbServiceMap.set("zookeeper", new Map())
  dbServiceMap.set("elasticsearch", new Map())
  dbServiceMap.set("etcd", new Map())

  if (data.petSets) {
    data.petSets.map(petSet => {
      let key = "unknown"
      if (petSet.objectMeta && petSet.objectMeta.labels
        && petSet.objectMeta.labels['system/petsetType']) {
        key = petSet.objectMeta.labels['system/petsetType']
      }

      let map = dbServiceMap.get(key)
      if (map && petSet.pods) {
        if (petSet.pods.failed != 0) {
          setMap(map, "failed")
        } else if (petSet.pods.pending != 0) {
          setMap(map, "pending")
        } else if (petSet.pods.running == petSet.pods.desired) {
          setMap(map, "running")
        } else {
          setMap(map, "unknown")
        }
      }
    })
  }
  return dbServiceMap
}

function mapStateToProp(state, props) {
  const { current, loginUser } = state.entities
  const { clusterID } = current.cluster
  const { userID } = current.space
  const { storage } = state
  const { projectName, name } = current.space
  let clusterOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
    volumeCreate: 0,
    volumeDelete: 0,
  }
  let clusterSysinfoData = {
    k8s: {
      version: "",
      status: ""
    },
    dns: {
      version: "",
      status: ""
    },
    apiserver: {
      version: "",
      status: ""
    },
    monitor: {
      version: "",
      status: ""
    },
    logging: {
      version: "",
      status: ""
    }
  }
  let clusterStorageData = {
    freeSize: 0,
    totalCnt: 0,
    usedCnt: 0,
    usedSize: 0,
  }
  let clusterAppStatusData = {
    appMap: new Map(),
    svcMap: new Map(),
    podMap: new Map(),
  }
  let clusterDbServicesData = new Map()
  clusterDbServicesData.set("mysql", new Map())
  clusterDbServicesData.set("mongo", new Map())
  clusterDbServicesData.set("redis", new Map())
  clusterDbServicesData.set("zookeeper", new Map())
  clusterDbServicesData.set("elasticsearch", new Map())
  clusterDbServicesData.set("etcd", new Map())

  let clusterNodeSummaryData = {
    nodeInfo: {
      total: 0,
      health: 0,
      unused: 0
    },
    cpu: [],
    memory: [],
    storage: [],
  }
  let clusterNodeSpaceConsumption = {
    balance: 0,
    consumption: 0,
  }
  let clusterSummaryInit = {
    capacity: {
      cpu: 1,
      memory: 1
    },
    used: {
      cpu: 0,
      memory: 0
    }
  }
  let clusterStaticSummary = {
    pod: {

    }
  }
  let volumeSummary = {
    used: '0',
    available: '0',
    total: '1',
    allocated: '0'
  }
  const { clusterOperations, clusterSysinfo, clusterStorage,
    clusterAppStatus, clusterDbServices, clusterNodeSummary, clusterInfo, clusterSummary } = state.overviewCluster
  const isFetching = clusterInfo.isFetching
  if (clusterSummary.result && clusterSummary.result.clusterSummary) {
    clusterSummaryInit = clusterSummary.result.clusterSummary
  }
  if (clusterSummary.result && clusterSummary.result.volumeSummary && clusterSummary.result.volumeSummary.total) {
    volumeSummary = clusterSummary.result.volumeSummary
  }
  if (clusterInfo.result && clusterInfo.result) {
    if (clusterInfo.result.operations) {
      if (clusterInfo.result.operations.app) {
        let data = clusterInfo.result.operations.app
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appModify) {
          clusterOperationsData.appModify = data.appModify
        }
        if (data.svcCreate) {
          clusterOperationsData.svcCreate = data.svcCreate
        }
        if (data.svcDelete) {
          clusterOperationsData.svcDelete = data.svcDelete
        }
        if (data.appStop) {
          clusterOperationsData.appStop = data.appStop
        }
        if (data.appStart) {
          clusterOperationsData.appStart = data.appStart
        }
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appRedeploy) {
          clusterOperationsData.appRedeploy = data.appRedeploy
        }
      }
      if (clusterInfo.result.operations.volume) {
        let data = clusterInfo.result.operations.volume
        if (data.volumeCreate) {
          clusterOperationsData.volumeCreate = data.volumeCreate
        }
        if (data.volumeDelete) {
          clusterOperationsData.volumeDelete = data.volumeDelete
        }
      }
    }
    if (clusterInfo.result.sysinfo) {
      let data = clusterInfo.result.sysinfo
      if (data.k8s) {
        if (data.k8s.version) {
          clusterSysinfoData.k8s.version = data.k8s.version
        }
        if (data.k8s.status) {
          clusterSysinfoData.k8s.status = data.k8s.status
        }
      }
      if (data.dns) {
        if (data.dns.version) {
          clusterSysinfoData.dns.version = data.dns.version
        }
        if (data.dns.status) {
          clusterSysinfoData.dns.status = data.dns.status
        }
      }
      if (data.apiserver) {
        if (data.apiserver.version) {
          clusterSysinfoData.apiserver.version = data.apiserver.version
        }
        if (data.apiserver.status) {
          clusterSysinfoData.apiserver.status = data.apiserver.status
        }
      }
      if (data.monitor) {
        if (data.monitor.version) {
          clusterSysinfoData.monitor.version = data.monitor.version
        }
        if (data.monitor.status) {
          clusterSysinfoData.monitor.status = data.monitor.status
        }
      }
      if (data.logging) {
        if (data.logging.version) {
          clusterSysinfoData.logging.version = data.logging.version
        }
        if (data.logging.status) {
          clusterSysinfoData.logging.status = data.logging.status
        }
      }
    }
    if (clusterInfo.result.storage) {
      let data = clusterInfo.result.storage
      if (data.freeSize) {
        clusterStorageData.freeSize = data.freeSize
      }
      if (data.totalCnt) {
        clusterStorageData.totalCnt = data.totalCnt
      }
      if (data.usedCnt) {
        clusterStorageData.usedCnt = data.usedCnt
      }
      if (data.usedSize) {
        clusterStorageData.usedSize = data.usedSize
      }
    }
    if (clusterInfo.result.appstatus) {
      let data = clusterInfo.result.appstatus
      clusterAppStatusData = getStatus(data)
    }
    if (clusterInfo.result.dbservices) {
      let data = clusterInfo.result.dbservices
      clusterDbServicesData = getDbServiceStatus(data)
    }
    if (clusterInfo.result.nodesummary) {
      clusterNodeSummaryData = clusterInfo.result.nodesummary
    }
    if (clusterInfo.result.spaceconsumption) {
      clusterNodeSpaceConsumption.balance = clusterInfo.result.spaceconsumption.balance
      clusterNodeSpaceConsumption.consumption = clusterInfo.result.spaceconsumption.consumption
    }
    if (clusterInfo.result.clusterStaticSummary) {
      clusterStaticSummary = clusterInfo.result.clusterStaticSummary
    }
  }
  const sharchList = storage.storageList[DEFAULT_IMAGE_POOL] || {}

  return {
    userID,
    clusterID,
    current,
    projectName,
    loginUser: loginUser.info,
    clusterOperations: clusterOperationsData,
    clusterSysinfo: clusterSysinfoData,
    clusterStorage: clusterStorageData,
    clusterAppStatus: clusterAppStatusData,
    clusterDbServices: clusterDbServicesData,
    clusterNodeSummary: clusterNodeSummaryData,
    clusterNodeSpaceConsumption: clusterNodeSpaceConsumption,
    volumeSummary,
    clusterSummary: clusterSummaryInit,
    clusterStaticSummary,
    isFetching,
    storageList: state.storage.storageList || [],
  }
}

export default connect(mapStateToProp, {
  fetchStorage,
  getClusterQuota,
  getClusterQuotaList,
  loadClusterInfo,
  loadClusterSummary,
  GetProjectsDetail,
  GetPrivilege,
  loadDbCacheList,
})(Ordinary)
