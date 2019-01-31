/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  StatefulCluster module
 *
 * v2.0 - 2016-10-18
 * @author Lizhen
 * update by Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Icon, Input, Spin, Tooltip } from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbCacheList, searchDbservice } from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools.js'
import './style/MysqlCluster.less'
import zkImg from '../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../assets/img/database_cache/etcd.jpg'
import noZookeeper from '../../assets/img/database_cache/no_zookeeper.png'
import noElasticSearch from '../../assets/img/database_cache/no_elasticsearch.png'
import noEtcd from '../../assets/img/database_cache/no_etcd.png'
import ResourceBanner from '../TenantManage/ResourceBanner/index'
import Title from '../Title'
import {browserHistory} from "react-router";

const clusterTable = {
  zookeeper: {
    displayName: 'ZooKeeper',
    image: zkImg,
    noDBImage: noZookeeper,
  },
  elasticsearch: {
    displayName: 'ElasticSearch',
    image: esImg,
    noDBImage: noElasticSearch,
  },
  mongodb: {
    displayName: 'MongoDB',
  },
  etcd: {
    displayName: 'Etcd',
    image: etcdImg,
    noDBImage: noEtcd,
  },
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    clusterType: React.PropTypes.string,
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase: database.objectMeta.name
    })
  },
  render: function () {
    const { config, isFetching, clusterType, database } = this.props;
    const listImg = () => {
      switch (database) {
        case 'zookeeper':
          return zkImg
        case 'elasticsearch':
          return esImg
      }
    }
    const canCreate = this.props.canCreate
    const literal = clusterTable[clusterType]
    let title = ''
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
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
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config || config.length == 0) {
      return (
        <div className="text-center">
          <img src={literal.noDBImage} />
          <div>还没有 {literal.displayName} 集群，创建一个！ <Tooltip title={title} placement="right">
            <Button type="primary" size="large"
              onClick={() => browserHistory.push(`/middleware_center/deploy/cluster-stateful/${clusterType}/database_cache`)}
              disabled={!canCreate}>创建集群</Button>
          </Tooltip>
          </div>
        </div>
      )
    }
    // 最新创建的在第一个
    config.sort((a, b) => Date.parse(b.objectMeta.creationTimestamp) - Date.parse(a.objectMeta.creationTimestamp))
    let items = config.map((item, index) => {
      const storageSize = item.storage //存储大小
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={listImg()} />
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
              <li><span className='listKey'>存储大小</span>{storageSize ? storageSize.replace('Mi','MB').replace('Gi','GB'): '0'}</li>
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

class StatefulCluster extends Component {
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
    }
  }
  clusterRefresh() {
    const _this = this
    const { loadDbCacheList, cluster, clusterType, getProxy } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })
    getProxy(cluster)
    loadDbCacheList(cluster, clusterType, {
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
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, clusterType, getProxy } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群', 'invalid cluster ID')
      return
    }
    getProxy(cluster)
    loadDbCacheList(cluster, clusterType)
  }
  componentDidMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { clusterType, current } = nextProps
    if (clusterType !== this.props.clusterType) {
      this.props.loadDbCacheList(current.cluster.clusterID, clusterType)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({ putVisible: false })
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
    browserHistory.push(`/middleware_center/deploy/cluster-stateful/${this.props.clusterType}/database_cache`)
  }

  handSearch() {
    const clusterType = this.props.clusterType
    const { search } = this.state
    this.props.searchDbservice(clusterType, search)
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterType, storageClassType, database } = this.props;
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    const currentCluster = this.props.current.cluster
    const literal = clusterTable[clusterType]
    let canCreate = true
    if (!storageClassType.private) canCreate = false
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    return (
        <div id='mysqlDatabase' key={`${clusterType}DataBase`}>
          <div className='databaseCol' key={literal.displayName}>
            <Title title={literal.displayName} />
            <div className='databaseHead'>
              {
                clusterType === 'zookeeper' && <ResourceBanner resourceType='zookeeper'/>
              }
              {
                 clusterType === 'elasticsearch' && <ResourceBanner resourceType='elasticsearch'/>
              }
              {mode === standard ?
                <div className='alertRow'>您的 {literal.displayName} 集群创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> :
                <div></div>}
              <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
                <span><i className='fa fa-plus' />&nbsp;{literal.displayName}集群</span>
              </Button></Tooltip>
              <Button className="button_refresh" size='large' onClick={this.clusterRefresh} disabled={!canCreate}>
                <i className='fa fa-refresh' />&nbsp;刷 新
              </Button>
              <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight: '28px' }} ref="searchInput"
                     onChange={(e) => this.setState({ search: e.target.value.trim()})}
                     onPressEnter={() => this.handSearch()} />
              <i className="fa fa-search cursor" onClick={() => this.handSearch()} />
            </span>
            </div>
            <MyComponent scope={_this} isFetching={isFetching} config={databaseList} clusterType={clusterType} canCreate={canCreate} database={database} />
          </div>
          <Modal visible={this.state.detailModal}
                 className='AppServiceDetail' transitionName='move-right'
                 onCancel={() => {
                   this.setState({ detailModal: false })
                 }}
          >
            {
              this.state.detailModal &&
              <ModalDetail scope={_this} putVisible={_this.state.putVisible} database={this.props.database}
                           currentData={this.state.currentData} dbName={this.state.currentDatabase} />
            }
          </Modal>
        </div>
    )
  }
}

function mapStateToProps(state, props) {
  const clusterType = /(?:^|\s)\/database_cache\/(.*?)_cluster(?:\s|$)/g.exec(props.location.pathname)[1]
  const { cluster } = state.entities.current
  const defaultList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: clusterType,
    databaseList: [],
  }
  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList[clusterType] || defaultList
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
    current,
    database,
    databaseList: databaseList,
    isFetching,
    clusterType,
    clusterProxy,
    storageClassType: defaultStorageClassType
  }
}

StatefulCluster.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

StatefulCluster = injectIntl(StatefulCluster, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
})(StatefulCluster)
