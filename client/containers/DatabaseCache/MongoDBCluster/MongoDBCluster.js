/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { Modal, Button, Icon, Input, Spin, Tooltip } from 'antd'
import { loadDbCacheList, searchDbservice } from '../../../../src/actions/database_cache'
import { loadMyStack } from '../../../../src/actions/app_center'
import { getProxy } from '../../../../src/actions/cluster'
import { DEFAULT_REGISTRY } from '../../../../src/constants'
import NotificationHandler from '../../../../src/components/Notification'
import { formatDate } from '../../../../src/common/tools.js'
import './style/MongoDBCluster.less'
import mongoDBImg from '../../../assets/img/MiddlewareCenter/mongoDB.jpg'
import noDbImgs from '../../../../src/assets/img/database_cache/no_mysql.png'
import Title from '../../../../src/components/Title'
import ResourceBanner from '../../../../src/components/TenantManage/ResourceBanner/index'
import AutoBackupModal from '../../../components/AutoBackupModal'
const notification = new NotificationHandler()
class MyComponent extends React.Component {
  showDetailModal = database => {
    browserHistory.push(`/middleware_center/deploy/cluster/detail-mongodb/mongodbreplica/${database.objectMeta.name}`)
  }

  render() {
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
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    if ((config && config.length === 0) || !config) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 MongoDB 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={() => browserHistory.push('/middleware_center/deploy/cluster-mongodb/mongodb/database_cache')} disabled={!canCreate || uninstalledPlugin}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    const statusText = status => {
      switch (status) {
        case 'Pending':
          return '启动中'
        case 'Stopping':
          return '停止中'
        case 'Stopped':
          return '已停止'
        case 'Running':
          return '运行中'
        default:
          return '未知'
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
    config
      .sort((a, b) =>
        Date.parse(b.objectMeta.creationTimestamp)
        - Date.parse(a.objectMeta.creationTimestamp))
    const items = config.map((item, index) => {
      return (
        <div className="List" key={index}>
          <div className="list-wrap">
            <div className="detailHead">
              <div className="imgBox">
                <img src={mongoDBImg} />
              </div>
              <Tooltip title={item.objectMeta.name} placement="topLeft">
                <div className="detailName">
                  {item.objectMeta.name}
                </div>
              </Tooltip>
              <div className="status">
                <span className="listKey">状态:</span>
                <span className="normal" style={style(item.status)}>
                  <i className="fa fa-circle"></i>
                  {statusText(item.status)} </span>
              </div>

              <div className="detailName">
                <Button type="ghost" size="large" onClick={this.showDetailModal.bind(this, item)}><Icon type="bars" />展开详情</Button>
              </div>
            </div>
            <ul className="detailParse">
              <li><span className="listKey">副本数</span>{`${item.currentReplicas}/${item.replicas}`}个</li>
              <li>
                <span className="listKey">创建日期</span>
                <span>{formatDate(item.objectMeta.creationTimestamp, 'YYYY-MM-DD')}</span>
              </li>
              <li><span className="listKey">存储大小</span>{item.storage ? item.storage.replace('Mi', 'MB').replace('Gi', 'GB') : '-'}</li>
              {/* <li className="auto-backup-switch"><span className="listKey">自动备份</span>
                <span>{item.cronBackup ? '开启' : '关闭'}</span>
              </li>*/}
            </ul>
          </div>
        </div>
      );
    });
    return (
      <div className="layoutBox">
        {items}
      </div>
    );
  }
}

class MongoDBCluster extends React.Component {
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
      uninstalledPlugin: false, // 是否未安装插件
      plugin: '',
    }
  }
  refreshDatabase() {
    const _this = this
    const { loadDbCacheList, cluster } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: res => {
          _this.setState({
            dbservice: res.data.data.templates,
          })
        },
      },
    })
    loadDbCacheList(cluster, 'mongodbreplica', {
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
                plugin: kind,
              })
            }
          }
        },
      },
    })
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy } = this.props
    if (cluster === undefined) {
      notification.error('请选择集群', 'invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, 'mongodbreplica', {
      failed: {
        func: err => {
          if (err.statusCode === 404 && err.message.details) {
            const { kind } = err.message.details
            const reg = /cluster-operator/g
            if (reg.test(kind)) {
              this.setState({
                uninstalledPlugin: true,
                plugin: kind,
              })
            }
          }
        },
      },
    })
    // 获取集群列表

  }
  componentDidMount() {
    const _this = this
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: res => {
          _this.setState({
            dbservice: res.data.data.templates,
          })
        },
      },
    })
  }
  componentWillReceiveProps(nextProps) {
    const { current } = nextProps
    if (current.space.namespace === this.props.current.space.namespace &&
      current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheList(current.cluster.clusterID, 'mongodbreplica')
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({ putVisible: false })
    }
    return nextState
  }
  putModal() {
    this.setState({
      putVisible: !this.state.putVisible,
    })
  }
  createDatabaseShow() {
    browserHistory.push('/middleware_center/deploy/cluster-mongodb/mongodb/database_cache')
  }
  handSearch() {
    const { search } = this.state
    this.props.searchDbservice('mongodbreplica', search)
  }

  onAutoBackup = item => {
    this.setState({
      autoBackupModalShow: true,
      currentClusterNeedBackup: item,
      hadSetAutoBackup: item.cronBackup,
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
    const { isFetching, databaseList, storageClassType, loadDbCacheList, cluster } = this.props
    const { uninstalledPlugin, plugin } = this.state
    /*
    const standard = require('../../../../configs/constants').STANDARD_MODE
    const mode = require('../../../../configs/model').mode
*/
    let title = ''
    let canCreate = true
    if (!storageClassType.private) canCreate = false
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (uninstalledPlugin) {
      title = `${plugin} 插件未安装`
    }

    return (
      <QueueAnim id="mongoDatabase" type="right">
        <div className="databaseCol" key="mongoDatabase">
          <Title title="MongoDB" />
          <div className="databaseHead">
            <ResourceBanner resourceType="mongodbreplica"/>
            <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={this.createDatabaseShow} disabled={!canCreate || uninstalledPlugin}>
              <i className="fa fa-plus" />&nbsp;MongoDB集群
            </Button>
            </Tooltip>
            <Button className="button_refresh" size="large" onClick={this.refreshDatabase} disabled={!canCreate}>
              <i className="fa fa-refresh" />&nbsp;刷 新
            </Button>
            <span className="rightSearch">
              <Input size="large"
                placeholder="搜索"
                style={{ width: '180px', paddingRight: '28px' }}
                onChange={e => this.setState({ search: e.target.value.trim() })}
                onPressEnter={() => this.handSearch()} />
              <i className="fa fa-search cursor" onClick={() => this.handSearch()}/>
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
          className= "AppServiceDetail" transitionName= "move-right"
          onCancel={() => {
            this.setState({ detailModal: false })
            loadDbCacheList(cluster, 'mongodbreplica')
          }}
        >

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

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  const defaultMysqlList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'mongodbreplica',
    databaseList: [],
  }

  const { current } = state.entities
  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.mongodbreplica || defaultMysqlList
  const teamCluster = state.team.teamClusters
  const clusterProxy = state.cluster.proxy.result || {}
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if (cluster.storageClassType) {
    defaultStorageClassType = cluster.storageClassType
  }
  return {
    cluster: cluster.clusterID,
    current,
    database,
    databaseList,
    isFetching,
    teamCluster,
    clusterProxy,
    storageClassType: defaultStorageClassType,
  }
}

MongoDBCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired,
}


export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
})(MongoDBCluster)
