/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Modal, Button, Icon, Row, Col, InputNumber, Input, Spin, Tooltip, Switch } from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbCacheList , searchDbservice } from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools.js'
import './style/MysqlCluster.less'
import mysqlImg from '../../assets/img/database_cache/mysql.png'
import noDbImgs from '../../assets/img/database_cache/no_mysql.png'
import Title from '../Title'
import ResourceBanner from '../TenantManage/ResourceBanner/index'
import yaml from "js-yaml";
import BackupStrategy from '../../../client/containers/DatabaseCache/BackupStrategy'
import { updateAutoBackupSet, autoBackupSet, autoBackupDetele } from '../../../client/actions/backupChain'
const notification = new NotificationHandler()
let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    console.log(database);
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase: database.objectMeta.name
    })
  },
  //自动备份开关
  autoBackupSwitch: function(item) {
    this.props.setAutoBackup(item)
  },

  render: function () {
    const canCreate = this.props.canCreate
    const { config, isFetching } = this.props;
    let title = ''
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 MySQL 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createDatabaseShow()} disabled={!canCreate}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    const statusText = status => {
      switch(status) {
        case 'Pending':
          return '启动中'
        case 'Stopping':
          return '停止中'
        case 'Stopped':
          return '已停止'
        case 'Running':
          return '运行中'
      }
    }
    const style = status => {
      switch (status) {
        case 'Stopped':
          return {
            color: '#f85a5a',
          }
        case 'Stopping':
          return {
            color: '#ffbf00',
          }
        case 'Pending':
          return {
            color: '#ffbf00',
          }
        case 'Running':
          return {
            color: '#5cb85c',
          }
        default:
          return {
            color: '#cccccc',
          }
      }
    }
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={mysqlImg} />
              <div className='detailName'>
                {item.objectMeta.name}
              </div>
              <div className="status">
                <span className='listKey'>状态:</span>
                <span className='normal' style={style(item.status)}>
                  <i className="fa fa-circle"></i>
                  {statusText(item.status)} </span>
              </div>

              <div className='detailName'>
                <Button type='ghost' size='large' onClick={this.showDetailModal.bind(this, item)}><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>副本数</span>{`${item.currentReplicas}/${item.replicas}`}个</li>
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.storage ? item.storage.replace('Mi','MB').replace('Gi','GB'): '0'}</li>
              <li className="auto-backup-switch"><span className='listKey'>自动备份</span>
                <div className="opacity-switch" onClick={() => this.autoBackupSwitch(item)}></div>
                <Switch checkedChildren="开"
                        unCheckedChildren="关"
                        checked={item.cronBackup}
                />
              </li>
            </ul>
          </div>
        </div>
      );
    });
    return (
      <div className='layoutBox'>
        {items}
      </div>
    );
  }
});

class MysqlCluster extends Component {
  constructor(props) {
    super(props)
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.refreshDatabase = this.refreshDatabase.bind(this);
    this.handSearch = this.handSearch.bind(this);
    this.state = {
      detailModal: false,
      putVisible: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false,
      dbservice: [],
      search: '',
      autoBackupModalShow: false,
      days: [ '0', '1', '2', '3', '4', '5', '6' ],
      daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
      hour: '1',
      minutes: '0',
      currentClusterNeedBackup: '',
      aleradySetAuto: [],
      autoBackupSwitch: false
    }
  }
  refreshDatabase() {
    const _this = this
    const { loadDbCacheList, cluster } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })
    loadDbCacheList(cluster, 'mysql', {
      success: {
        func: () => {
          const { search } = this.state
          if (search) {
            return this.handSearch()
          }
        },
        isAsync: true,
      }
    })
    const { teamCluster } = this.props
    if(teamCluster && teamCluster.result && teamCluster.result.data && location.search == '?createDatabase'){
      _this.setState({
        CreateDatabaseModalShow: true,
      })
    }
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy } = this.props
    if (cluster == undefined) {

      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, 'mysql')
    // 获取集群列表

  }
  componentDidMount() {
    const _this = this
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })

    const { teamCluster } = this.props
    if(teamCluster && teamCluster.result && teamCluster.result.data && location.search == '?createDatabase'){
      _this.setState({
        CreateDatabaseModalShow: true,
      })
      setTimeout(() => {
        document.getElementById('dbName').focus()
      },100)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { current} = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheList(current.cluster.clusterID, 'mysql')
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({putVisible: false})
    }
    return nextState
  }
  putModal() {
    this.setState({
      putVisible: !this.state.putVisible
    })
  }
  createDatabaseShow() {
    //this function for user show the modal of create database
    this.setState({
      CreateDatabaseModalShow: true
    }, () => {
      document.getElementById('dbName').focus()
    });
  }
  handSearch() {
    const { search } = this.state
    this.props.searchDbservice('mysql', search)
  }
  // 自动备份弹窗组件
  autoBackupModal = () => {
    const {
      database, cluster,
      autoBackupSet, updateAutoBackupSet, autoBackupDetele, loadDbCacheList,
    } = this.props
    const databaseInfo = this.state.currentClusterNeedBackup
    // 获取选择备份周期
    const selectPeriod = (week, index) => {
      const { days } = this.state
      const localWeeks = JSON.parse(JSON.stringify(days))
      localWeeks[index] = localWeeks[index] ? false : week.en
      // 转换周期格式（仅天）参考格式： http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html
      const newDays = localWeeks.filter(v => !!v)
      if (newDays[0] === '0') {
        newDays.push(newDays.shift())
      }
      this.setState({
        days: localWeeks,
        daysConvert: newDays,
      })
      // console.log(period)
    }
    // 确定
    const handleAutoBackupOk = () => {
      const { hour, minutes, daysConvert } = this.state
      // const schedule = `${minutes} ${hour} * * ${daysConvert.join(',').replace(/,/g, ' ')}`
      const schedule = `${minutes} ${hour} * * ${daysConvert.join(',')}`
      if (!this.state.autoBackupSwitch) {
        // 如果开关关闭，说明要关闭自动备份
          autoBackupDetele(cluster, database, databaseInfo.objectMeta.name, {
            success: {
              func: () => {
                notification.success('关闭自动备份成功')
                setTimeout(() => loadDbCacheList(cluster, 'mysql'))
              },
            },
            failed: {
              func: () => {
                notification.warn('关闭自动备份失败')
              },
            },
          })

      } else {
        const postData = { schedule }
        // 如果已经设置过自动备份，说明要修改，调用修改接口
        if (this.state.hadSetAutoBackup) {
          updateAutoBackupSet(cluster, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                notification.success('修改自动备份成功')
                setTimeout(() => loadDbCacheList(cluster, 'mysql'))
              },
            },
          })
        } else {
          // 否则是已经关闭了自动备份，需要调用设置接口
          autoBackupSet(cluster, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                notification.success('设置自动备份成功')
                setTimeout(() => loadDbCacheList(cluster, 'mysql'))
              },
            },
            failed: {
              func: () => {
                notification.warn('设置自动备份失败')
              },
            },
          })
        }
      }
      this.setState({
        autoBackupModalShow: false,
      })
    }

    const statusSwitch = val => {
      this.setState({
        autoBackupSwitch: val,
      })

      // console.log(val)
    }
    // 获取小时
    const hour = h => {
      this.setState({ hour: `${h}` })
      // console.log(time)
    }
    // 获取分钟
    const minutes = m => {
      this.setState({ minutes: `${m}` })
      // console.log(time)
    }
    return databaseInfo && <Modal
      visible={this.state.autoBackupModalShow}
      title={database === 'redis' ? '设置自动全量备份' : '设置自动差异备份（基于当前链）'}
      onOk={handleAutoBackupOk}
      onCancel={() => this.setState({
        autoBackupModalShow: false,
      })}
      width={650}
    >
      <div className="autoContent">
        <Row className="item">
          <Col span={4} className="title">备份集群</Col>
          <Col span={19} push={1}>{databaseInfo.objectMeta.name}</Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">状态</Col>
          <Col span={19} push={1}>
            <Switch checkedChildren="开" onChange={statusSwitch} unCheckedChildren="关" checked={this.state.autoBackupSwitch} />
          </Col>
        </Row>
        {
          this.state.autoBackupSwitch &&
          <div>
            <Row className="item">
              <Col span={4} className="title">备份周期</Col>
              <Col span={19} push={1}>
                <BackupStrategy weeksSelected={this.state.days} setPeriod={selectPeriod}/>
              </Col>
            </Row>
            <Row className="item">
              <Col span={4} className="title">备份时间</Col>
              <Col span={19} push={1}>
                <div>
                  <InputNumber min={0} max={24} defaultValue={1} onChange={hour} />
                  <span className="text">时</span>
                  <InputNumber min={0} max={60} defaultValue={0} onChange={minutes} />
                  <span className="text">分</span>
                </div>
              </Col>
            </Row>
          </div>
        }
      </div>
    </Modal>
  }
  onAutoBackup = item => {
    this.setState({
      autoBackupModalShow: true,
      currentClusterNeedBackup: item,
      autoBackupSwitch: item.cronBackup
    })
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterProxy, storageClassType } = this.props;
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    const currentCluster = this.props.current.cluster
    let canCreate = true
    if (!storageClassType.private) canCreate = false
    if(!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    return (
      <QueueAnim id='mysqlDatabase' type='right'>
        <div className='databaseCol' key='mysqlDatabase'>
          <Title  title="MySQL" />
          <div className='databaseHead'>
            <ResourceBanner resourceType='mysql'/>
            { mode === standard ? <div className='alertRow'>您的 MySql 集群 创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
              <i className='fa fa-plus' />&nbsp;MySQL集群
          </Button>
          </Tooltip>
            <Button className="button_refresh" size='large' onClick={this.refreshDatabase} disabled={!canCreate}>
              <i className='fa fa-refresh' />&nbsp;刷 新
            </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px'}} ref="mysqlRef" onChange={(e)=>this.setState({search: e.target.value.trim()})} onPressEnter={()=> this.handSearch()} />
              <i className="fa fa-search cursor" onClick={()=> this.handSearch()}/>
            </span>
          </div>
          <MyComponent scope={_this} setAutoBackup={this.onAutoBackup} isFetching={isFetching} config={databaseList} canCreate={canCreate}/>
        </div>
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => { this.setState({ detailModal: false }) } }
          >
          <ModalDetail detailModal={this.state.detailModal} scope={_this}  putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal' maskClosable={false} width={600}
          title='创建MySQL集群'
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateDatabase scope={_this} dbservice={this.state.dbservice} database='mysql' clusterProxy={clusterProxy} visible={this.state.CreateDatabaseModalShow}/>
        </Modal>
        { this.autoBackupModal() }
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultMysqlList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'mysql',
    databaseList: []
  }
  const defaultConfig = {
    isFetching: false,
  }
  const { current } = state.entities
  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.mysql || defaultMysqlList
  const teamCluster = state.team.teamClusters
  let clusterProxy = state.cluster.proxy.result || {}
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false
  }
  if(cluster.storageClassType){
    defaultStorageClassType = cluster.storageClassType
  }
  return {
    cluster: cluster.clusterID,
    // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',
    current,
    database,
    databaseList: databaseList,
    isFetching,
    teamCluster,
    clusterProxy,
    storageClassType: defaultStorageClassType,
  }
}

MysqlCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

MysqlCluster = injectIntl(MysqlCluster, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
  autoBackupSet, // 设置自动备份
  autoBackupDetele, // 关闭定时备份
  updateAutoBackupSet, // 修改定时备份
})(MysqlCluster)
