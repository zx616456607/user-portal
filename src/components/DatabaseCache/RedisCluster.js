/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  RedisDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 * update by Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Modal, Button, Icon, Input, Spin, Tooltip } from 'antd'
import { loadGlobalConfig } from '../../../src/actions/global_config'
import { injectIntl } from 'react-intl'
import { loadDbCacheList ,searchDbservice} from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools.js'
import './style/RedisCluster.less'
import redisImg from '../../assets/img/database_cache/redis.jpg'
import noDbImgs from '../../assets/img/database_cache/no_redis.png'
import Title from '../Title'
import ResourceBanner from '../TenantManage/ResourceBanner/index'
import AutoBackupModal from '../../../client/components/AutoBackupModal'
import { autoBackupSet, autoBackupDetele, checkAutoBackupExist } from '../../../client/actions/backupChain'
import { browserHistory } from "react-router";
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    browserHistory.push(`/middleware_center/deploy/cluster/detail/redis/${database.objectMeta.name}`)
  },
  //自动备份开关
  autoBackupSwitch: function(item) {
    this.props.setAutoBackup(item)
  },
  render: function () {
    const { config, isFetching, uninstalledPlugin, plugin, title } = this.props;
    const canCreate = this.props.canCreate

    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config ||config.length == 0) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 Redis 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=>     browserHistory.push('/middleware_center/deploy/cluster-mysql-redis/redis/database_cache')} disabled={!canCreate || uninstalledPlugin}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    const statusText = status => {
      switch(status) {
        case 'Pending':
          return '启动中'
        case 'Success':
          return '启动成功'
        case 'Running':
          return '运行中'
        case 'Stopping':
          return '停止中'
        case 'Stopped':
          return '已停止'
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
            color: '#2db7f5',
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
    // 最新创建的在第一个
    config.sort((a, b) => Date.parse(b.objectMeta.creationTimestamp) - Date.parse(a.objectMeta.creationTimestamp))
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={redisImg} />
              <div className='detailName'>
                <Ellipsis>
                  {item.objectMeta.name}
                </Ellipsis>
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
                <span className='listKey'>创建日期</span>
                <span>{formatDate(item.objectMeta.creationTimestamp, 'YYYY-MM-DD')}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.storage ? item.storage.replace('Mi','MB').replace('Gi','GB'): '-'}</li>
              <li className="auto-backup-switch"><span className='listKey'>自动备份</span>
                <span>{item.cronBackup? '开启': '关闭'}</span>
                {/*<div className="opacity-switch"  onClick={() => this.autoBackupSwitch(item)}></div>*/}
                {/*<Switch checkedChildren="开"*/}
                        {/*unCheckedChildren="关"*/}
                        {/*checked={item.cronBackup}*/}
                {/*/>*/}
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

const notification = new NotificationHandler()

class RedisDatabase extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.clusterRefresh = this.clusterRefresh.bind(this);
    this.handSearch = this.handSearch.bind(this);
    this.state = {
      search: '',
      detailModal: false,
      putVisible: false,
      currentDatabase: null,
      autoBackupModalShow: false,
      hadSetAutoBackup: false,
      days: [ '0', '1', '2', '3', '4', '5', '6' ],
      daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
      hour: '1',
      minutes: '0',
      currentClusterNeedBackup: '',
      aleradySetAuto: [],
      autoBackupSwitch: false,
      uninstalledPlugin: false, //是否未安装插件
      plugin: '',
    }
  }

  clusterRefresh() {
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
    loadDbCacheList(cluster, 'redis', {
      success: {
        func: () => {
          const { search } = this.state
          if (search) {
            return this.handSearch()
          }
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if (err.statusCode === 404 && err.message.details) {
            const { kind } = err.message.details
            const reg = /cluster-operator/g
            if (reg.test(kind)) {
              this.setState({
                uninstalledPlugin: true,
                plugin: kind
              })
            }
          }
        }
      }

    })
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    // 获取集群列表
    loadDbCacheList(cluster, 'redis', {
      failed: {
        func: err => {
          if (err.statusCode === 404 && err.message.details) {
            const { kind } = err.message.details
            const reg = /cluster-operator/g
            if (reg.test(kind)) {
              this.setState({
                uninstalledPlugin: true,
                plugin: kind
              })
            }
          }
        }
      }
    })
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
  }
  componentWillReceiveProps(nextProps) {
    const { form, current} = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheList(current.cluster.clusterID, 'redis')
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
    browserHistory.push('/middleware_center/deploy/cluster-mysql-redis/redis/database_cache')
  }
  handSearch() {
    const { search } = this.state
    this.props.searchDbservice('redis', search)
  }
  onAutoBackup = item => {
    const { checkAutoBackupExist, cluster } = this.props
    this.setState({
      autoBackupModalShow: true,
      currentClusterNeedBackup: item,
      hadSetAutoBackup: item.cronBackup
    })
  }
  setAutobackupSuccess = () => {
    const { loadDbCacheList, cluster, database } = this.props
    loadDbCacheList(cluster, database)
    this.setState({
      autoBackupModalShow: false,
    })
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterProxy, storageClassType, loadDbCacheList, cluster, chartRepoConfig } = this.props;
    const { uninstalledPlugin, plugin } = this.state
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    const currentCluster = this.props.current.cluster
    let canCreate = true
    if (!storageClassType.private) { canCreate = false; title = '尚未配置块存储集群，暂不能创建'}
    if (!chartRepoConfig || !chartRepoConfig.url) { canCreate = false; title = '尚未配置Chart Repo，暂不能创建'}
    if (uninstalledPlugin) {
      title = `${plugin} 插件未安装`
    }
    return (
      <QueueAnim id='redisDatabase' type='right'>
        <div className='databaseCol' key='RedisDatabase'>
          <Title title="Redis" />
          <div className='databaseHead'>
          <ResourceBanner resourceType='redis'/>
            { mode === standard ? <div className='alertRow'>您的 Redis 集群创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate || uninstalledPlugin}>
              <i className='fa fa-plus' />&nbsp;Redis集群
          </Button></Tooltip>
            <Button className="button_refresh" size='large' onClick={this.clusterRefresh} disabled={!canCreate}>
              <i className='fa fa-refresh' />&nbsp;刷 新
            </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px' }} ref="redisRef" onChange={(e)=>this.setState({search: e.target.value.trim()})} onPressEnter={(e)=> this.handSearch(e)}/>
              <i className="fa fa-search cursor" onClick={()=> this.handSearch()} />
            </span>
          </div>
          <MyComponent
            scope={_this}
            isFetching={isFetching}
            setAutoBackup={this.onAutoBackup}
            title={title}
            storageClassType={storageClassType}
            autoBackupList = {this.state.aleradySetAuto}
            config={databaseList}
            canCreate={canCreate}
            uninstalledPlugin = {uninstalledPlugin}
            plugin = {plugin}
          />
        </div>
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => {
            this.setState({ detailModal: false })
            loadDbCacheList(cluster, 'redis')
          } }
          >
          {
            this.state.detailModal && <ModalDetail scope={_this} putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
          }
        </Modal>
        {
          this.state.autoBackupModalShow &&
            <AutoBackupModal
              isShow={this.state.autoBackupModalShow}
              closeModal={() => this.setState({
                autoBackupModalShow: false,
              })}
              hadSetAutoBackup={this.state.hadSetAutoBackup}
              onSubmitSuccess={this.setAutobackupSuccess}
              databaseInfo={this.state.currentClusterNeedBackup}
              database={this.props.database}
            />
        }

      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { info } = state.entities.loginUser
  const { chartRepoConfig } = info
  const defaultRedisList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: [],
  }

  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.redis || defaultRedisList
  const { current } = state.entities
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
    // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',// @todo default
    current,
    database,
    databaseList: databaseList,
    isFetching,
    clusterProxy,
    storageClassType: defaultStorageClassType,
    chartRepoConfig,
  }
}

RedisDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

RedisDatabase = injectIntl(RedisDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
  autoBackupSet,
  autoBackupDetele,
  checkAutoBackupExist,
  loadGlobalConfig,
})(RedisDatabase)
