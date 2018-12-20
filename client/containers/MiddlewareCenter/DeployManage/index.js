/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Deploy manage
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim';
import { Button, Input, Tooltip, notification, Icon, Spin } from 'antd'
import * as databaseCacheActions from '../../../../src/actions/database_cache'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import * as mcActions from '../../../actions/middlewareCenter'
import NOCLUSTER from '../../../../src/assets/img/no-clusters.png'
import mysqlImg from '../../../../src/assets/img/database_cache/mysql.png'
import redisImg from '../../../../src/assets/img/database_cache/redis.jpg'
import zkImg from '../../../../src/assets/img/database_cache/zookeeper.jpg'
import esImg from '../../../../src/assets/img/database_cache/elasticsearch.jpg'
import bpmLogo from '../../../assets/img/MiddlewareCenter/bpm-logo.png'
import { RabbitmqVerticalColor as Rabbitmq } from '@tenx-ui/icon'
import './styles/index.less'

import Title from '../../../../src/components/Title'
import { formatDate } from '../../../../src/common/tools';

const mapStateToProps = state => {
  const { cluster } = state.entities.current
  const { databaseAllList } = state.databaseCache
  const AppClusterList = state.middlewareCenter.AppClusterList
  return {
    cluster: cluster.clusterID,
    AppClusterList,
    databaseAllList,
  }
}


@connect(mapStateToProps, {
  loadAppClusterList: mcActions.loadAppClusterList,
  deleteAppsCluster: mcActions.deleteAppsCluster,
  restartAppsCluster: mcActions.restartAppsCluster,
  startApps: mcActions.startApps,
  stopApps: mcActions.stopApps,
  loadDbCacheList: databaseCacheActions.loadDbCacheList,
  searchDbservice: databaseCacheActions.searchDbservice,
})
class DeployMange extends React.PureComponent {
  state = {
    searchFont: 'appName', // 前置条件
    searchInputValue: null, // 搜索内容
    searchFontChoice: 'appName', // 搜索框前的下拉选项
    searchInputDisabled: false, // 搜索期间禁止再次搜索
    filterActive: 'BPM', // 默认筛选条件
    dataList: [],
  }
  componentDidMount() {
    const { state } = this.props.location
    const { active } = state || { active: 'BPM' }
    this.setState({
      filterActive: active,
    })
    this.loadDataByType(active)
    if (active === 'BPM') {
      this.loadData()
    }
  }
  loadData = async () => {
    const { loadAppClusterList, cluster } = this.props
    const result = await loadAppClusterList(cluster, null, { failed: {} })
    const { error } = result
    if (error) {
      notification
        .error({ message: 'bpm-operator插件未安装', description: '请联系基础设施管理员安装！' })
    }
  }
  searchFontChoice = value => {
    this.setState({ searchFontChoice: value })
  }
  searchApps = () => {
    const { filterActive, searchInputValue } = this.state
    this.props.searchDbservice(filterActive, searchInputValue)

    // console.log(this.state.searchFontChoice, this.state.searchInputValue)
  }
  loadDataByType = async type => {
    const { loadDbCacheList, cluster } = this.props
    await loadDbCacheList(cluster, type)
    const { databaseAllList } = this.props
    this.setState({
      dataList: databaseAllList[type].databaseList && databaseAllList[type].databaseList
        .sort((a, b) => Date.parse(b.objectMeta.creationTimestamp) -
          Date.parse(a.objectMeta.creationTimestamp)),
    })

  }
  filterClick = type => {
    this.setState({ filterActive: type, dataList: [] })
    if (type !== 'BPM') {
      this.loadDataByType(type)
    } else {
      this.loadData()
    }
    // console.log(type)
  }
  renderImage = type => {
    switch (type) {
      case 'BPM':
        return bpmLogo
      case 'mysql':
        return mysqlImg
      case 'redis':
        return redisImg
      case 'elasticsearch':
        return esImg
      case 'zookeeper':
        return zkImg
      default:
        return ''
    }
  }
  statusText = status => {
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
        return ''
    }
  }
  style = status => {
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
  renderListItem = item => {
    const { filterActive } = this.state
    let detailPath = ''
    switch (filterActive) {
      case 'rabbitmq':
        detailPath = `/middleware_center/deploy/cluster/detail-rabbitmq/${this.state.filterActive}/${item.objectMeta.name}`
        break
      case 'BPM':
        detailPath = `/middleware_center/deploy/detail/${item.clusterName}`
        break
      default:
        detailPath = `/middleware_center/deploy/cluster/detail/${this.state.filterActive}/${item.objectMeta.name}`
    }
    if (filterActive === 'BPM') {

      return <div className="list" key={item.clusterName}>
        <div className="list-wrap">
          <div className="detailHead">
            <div className="img-wrapper">
              <img src={this.renderImage(this.state.filterActive)}/>
            </div>
            <Tooltip title={item.clusterName} placement="topLeft">
              <div className="detailName">
                {item.clusterName}
              </div>
            </Tooltip>
            <div className="status">
              <span className="listKey">状态:</span>
              <span className="normal" style={this.style(item.status)}>
                <i className="fa fa-circle"></i>
                {this.statusText(item.status)}
              </span>
            </div>

            <div className="detailName">
              <Link to={detailPath}>
                <Button type="ghost" size="large"><Icon type="bars" />展开详情</Button>
              </Link>
            </div>
          </div>
          <ul className="detailParse">
            <li>
              <span className="listKey">创建日期</span>
              <span>{formatDate(item.createTime, 'YYYY-MM-DD')}</span>
            </li>
            <li><span className="listKey">应用版本</span>{item.version}</li>

          </ul>
        </div>
      </div>
    }
    return <div className="list" key={item.objectMeta.name}>
      <div className="list-wrap">
        <div className="detailHead">

          {
            filterActive === 'rabbitmq' ?
              <div className="icon">
                <Rabbitmq/>
              </div>
              :
              <img src={this.renderImage(this.state.filterActive)} />
          }
          <Tooltip title={item.objectMeta.name} placement="topLeft">
            <div className="detailName">
              {item.objectMeta.name}
            </div>
          </Tooltip>
          <div className="status">
            <span className="listKey">状态:</span>
            <span className="normal" style={this.style(item.status)}>
              <i className="fa fa-circle"></i>
              {this.statusText(item.status)}
            </span>
          </div>

          <div className="detailName">
            <Link to={detailPath}>
              <Button type="ghost" size="large"><Icon type="bars" />展开详情</Button>
            </Link>
          </div>
        </div>
        <ul className="detailParse">
          <li><span className="listKey">副本数</span>{`${item.currentReplicas}/${item.replicas}`}个</li>
          <li>
            <span className="listKey">创建日期</span>
            <span>{formatDate(item.objectMeta.creationTimestamp, 'YYYY-MM-DD')}</span>
          </li>
          <li><span className="listKey">存储大小</span>{item.storage ? item.storage.replace('Mi', 'MB').replace('Gi', 'GB') : '-'}</li>
          {
            (filterActive !== 'rabbitmq' && filterActive !== 'rabbitmq') &&
              <li className="auto-backup-switch">
                <span className="listKey">自动备份</span>
                <span>{item.cronBackup ? '开启' : '关闭'}</span>
              </li>
          }
        </ul>
      </div>
    </div>
  }
  renderData = () => {
    const { filterActive } = this.state
    const { databaseAllList } = this.props
    const currentData = databaseAllList[filterActive] && databaseAllList[filterActive].databaseList
    if (databaseAllList[filterActive] && databaseAllList[filterActive].bak.length === 0) {
      return (
        <div className="showNothing">
          <div>
            <div className="btnPrompt">
              <img src={NOCLUSTER} title="noclusters" alt="noclusters" />
            </div>
            <div className="btnPrompt">
              当前还未部署任何服务&nbsp;&nbsp;
              <Button
                type="primary"
                onClick={() => browserHistory.push('middleware_center/app')}
              >
                创建
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return <div>
      {
        currentData && currentData.map(v => {
          return this.renderListItem(v)
        })
      }
    </div>
  }
  refrash = () => {
    if (this.state.filterActive === 'BPM') {
      this.loadData()
    } else {
      this.loadDataByType(this.state.filterActive)
    }
  }
  render() {
    const { searchInputValue, searchInputDisabled,
      filterActive } = this.state
    const { databaseAllList } = this.props
    const isFetching = databaseAllList[filterActive] && databaseAllList[filterActive].isFetching
    const filterActiveClass = option => classNames({
      option: true,
      filterActive: filterActive === option,
    })
    return (
      <QueueAnim className="DeployManageWrapper layout-content">
        <Title key="title" title={'部署管理'}/>
        <div key="topInfo" className="topInfo">
          服务目录 一个中间件与大数据的完整交付平台，包含云化的中间件、大数据应用的全生命周期管理。
        </div>
        <div>
          <div className="operationBox" key="operationBox">
            <Button type="ghost" size="large" onClick={() => this.refrash()}>
              <i className="fa fa-refresh" /> 刷新
            </Button>
            <div className="searchWraper">
              { /* <Select defaultValue="appName" style={{ width: 90 }} onChange={this.searchFontChoice}
                size="large">
                <Option value="clusterName">集群名称</Option>
                <Option value="appName">应用名称</Option>
              </Select>*/}
              <div className="rightBox">
                <div className="littleLeft" onClick={this.searchApps}>
                  <i className="fa fa-search" />
                </div>
                <div className="littleRight">
                  <Input
                    size="large"
                    onChange={e => {
                      this.setState({
                        searchInputValue: e.target.value,
                      })
                    } }
                    value={searchInputValue}
                    placeholder={'按应用名搜索'}
                    style={{ paddingRight: '28px' }}
                    disabled={searchInputDisabled}
                    onPressEnter={this.searchApps} />
                </div>
              </div>
            </div>
          </div>
          <span className="filter" key="filter">
            <span>筛选:</span>
            <span className={filterActiveClass('BPM')} onClick={ () => { this.filterClick('BPM') } }>炎黄BPM</span>
            <span className={filterActiveClass('rabbitmq')} onClick={ () => { this.filterClick('rabbitmq') } }>RabbitMQ</span>
            <span className={filterActiveClass('mysql')} onClick={ () => { this.filterClick('mysql') } }>MySQL</span>
            <span className={filterActiveClass('redis')} onClick={ () => { this.filterClick('redis') } }>Redis</span>
            <span className={filterActiveClass('zookeeper')} onClick={ () => { this.filterClick('zookeeper') } }>ZooKeeper</span>
            <span className={filterActiveClass('elasticsearch')} onClick={ () => { this.filterClick('elasticsearch') } }>ElasticSearch</span>
          </span>
          <div className="content">
            {
              isFetching ?
                <div className="loading"><Spin/></div>
                :
                this.renderData()
            }
          </div>
        </div>
      </QueueAnim>
    )
  }
}

export default DeployMange
