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
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { Modal, Button, Icon, Row, Col, Input, Spin, Tooltip, Switch } from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbCacheList, searchDbservice } from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools.js'
import './style/MysqlCluster.less'
import mysqlImg from '../../assets/img/database_cache/mysql.png'
import noDbImgs from '../../assets/img/database_cache/no_mysql.png'
import Title from '../Title'
import ResourceBanner from '../TenantManage/ResourceBanner/index'
import AutoBackupModal from '../../../client/components/AutoBackupModal'
const notification = new NotificationHandler()
let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
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
    const { config, isFetching, uninstalledPlugin, plugin } = this.props;
    let title = ''
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (uninstalledPlugin) {
      title = `${plugin} 插件未安装`
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
          <div>还没有 MySQL 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> browserHistory.push('/middleware_center/deploy/cluster-mysql-redis/mysql/database_cache')} disabled={!canCreate || uninstalledPlugin}>创建集群</Button></Tooltip></div>
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
      // 是否允许开启自动备份
      const shoulldAutoBackup = item.objectMeta.annotations['system/daasBackupMaster'] && item.objectMeta.annotations['system/daasBackupMaster'] !== ''
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={mysqlImg} />
              <Tooltip title={item.objectMeta.name} placement="topLeft">
                <div className='detailName'>
                  {item.objectMeta.name}
                </div>
              </Tooltip>
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
                {/*{*/}
                  {/*shoulldAutoBackup || item.cronBackup?*/}
                    {/*<div className="opacity-switch" onClick={() => this.autoBackupSwitch(item)}></div>*/}
                    {/*:*/}
                    {/*<Tooltip title="无任何备份链，手动备份后，可设置自动备份">*/}
                      {/*<div className="opacity-switch banned"></div>*/}
                    {/*</Tooltip>*/}
                {/*}*/}
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
      dbservice: [],
      search: '',
      hadSetAutoBackup: false,
      autoBackupModalShow: false,
      days: [ '0', '1', '2', '3', '4', '5', '6' ],
      daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
      hour: '1',
      minutes: '0',
      currentClusterNeedBackup: '',
      aleradySetAuto: [],
      autoBackupSwitch: false,
      uninstalledPlugin: false, //是否未安装插件
      plugin: ''
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
    const { teamCluster } = this.props

  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy } = this.props
    if (cluster == undefined) {
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, 'mysql', {
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
    browserHistory.push('/middleware_center/deploy/cluster-mysql-redis/mysql/database_cache')
  }
  handSearch() {
    const { search } = this.state
    this.props.searchDbservice('mysql', search)
  }

  onAutoBackup = item => {
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
    const { isFetching, databaseList, clusterProxy, storageClassType, loadDbCacheList, cluster } = this.props;
    const { uninstalledPlugin, plugin } = this.state
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    let canCreate = true
    if (!storageClassType.private) canCreate = false
    if(!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (uninstalledPlugin) {
      title = `${plugin} 插件未安装`
    }

    return (
      <QueueAnim id='mysqlDatabase' type='right'>
        <div className='databaseCol' key='mysqlDatabase'>
          <Title  title="MySQL" />
          <div className='databaseHead'>
            <ResourceBanner resourceType='mysql'/>
            { mode === standard ? <div className='alertRow'>您的 MySql 集群 创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate || uninstalledPlugin}>
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
          <MyComponent
            scope={_this}
            setAutoBackup={this.onAutoBackup}
            isFetching={isFetching}
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
            loadDbCacheList(cluster, 'mysql')
          } }
          >
          {
            this.state.detailModal &&
            <ModalDetail
              detailModal={this.state.detailModal}
              scope={_this}
              putVisible={ _this.state.putVisible }
              database={this.props.database}
              currentData={this.state.currentData}
              dbName={this.state.currentDatabase}
            />
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
})(MysqlCluster)
