/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  RedisDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Modal, Button, Icon, Input, message, Spin, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbCacheList } from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import './style/RedisCluster.less'

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentDatabase: database
    })
  },
  render: function () {
    const { config, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0) {
      return (
        <div className='loadingBox'>
          <span>暂无数据</span>
        </div>
      )
    }
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src='/img/test/redis.jpg' />
              <div className='detailName'>
                {item.serivceName}
              </div>
              <div className='detailName'>
                <Button type='ghost' size='large' onClick={this.showDetailModal.bind(this, item.serivceName)}><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span><span className='normal'>暂时未知</span><div style={{ clear: 'both' }}></div></li>
              <li>
                <span className='listKey'>地址</span>
                <span className='listLink'>
                  <Tooltip placement="topLeft" title={item.objectMeta.name + '.' + item.objectMeta.namespace + '.svc.cluster.local'}>
                    <span>{item.objectMeta.name + '.' + item.objectMeta.namespace + '.svc.cluster.local'}</span>
                  </Tooltip>
                </span>
                <div style={{ clear: 'both' }}></div>
              </li>
              <li><span className='listKey'>副本数</span>{item.pods.pending + item.pods.running}/{item.pods.desired}个<div style={{ clear: 'both' }}></div></li>
              <li><span className='listKey'>存储大小</span>{item.volumeSize ? item.volumeSize :'0'} M<div style={{ clear: 'both' }}></div></li>
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

class RedisDatabase extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.state = {
      detailModal: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false
    }
  }

  componentWillMount() {
    document.title = 'Redis集群 | 时速云';
    const { loadDbCacheList, cluster } = this.props
    loadDbCacheList(cluster, 'redis')
  }
  componentDidMount() {
    const _this = this
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data
          })
        }
      }
    })
  }
  createDatabaseShow() {
    //this function for user show the modal of create database
    this.setState({
      CreateDatabaseModalShow: true
    });
  }

  render() {
    const parentScope = this;
    const { isFetching, databaseList } = this.props;
    return (
      <QueueAnim id='RedisDatabase' type='right'>
        <div className='databaseCol' key='RedisDatabase'>
          <div className='databaseHead'>
            <Button type='primary' size='large' onClick={this.createDatabaseShow}>
              <i className='fa fa-plus' />&nbsp;Redis集群
          </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: 200 }} />
              <i className="fa fa-search" />
            </span>
          </div>
          <MyComponent scope={parentScope} isFetching={isFetching} config={databaseList} />
        </div>
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => { this.setState({ detailModal: false }) } }
          >
          <ModalDetail scope={parentScope} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal'
          title='创建数据库集群'
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateDatabase scope={parentScope} dbservice={this.state.dbservice} database={'redis'} />
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultRedisList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: []
  }

  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.redis || defaultRedisList
  return {
    // cluster: cluster.clusterID,
    cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',// @todo default 
    database,
    databaseList: databaseList,
    isFetching,
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
  loadMyStack
})(RedisDatabase)