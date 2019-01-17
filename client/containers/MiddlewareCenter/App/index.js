/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App middleware
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Button, Spin } from 'antd'
import { browserHistory } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import TenxPage from '@tenx-ui/page'
import { injectIntl } from 'react-intl'
import IntlMessage from '../Intl'
import AppClassify from './AppClassify'
import BPM_LOGO from '../../../assets/img/MiddlewareCenter/bpm-logo.png'
import MYSQL from '../../../../src/assets/img/database_cache/mysql.png'
import REDIS from '../../../../src/assets/img/database_cache/redis.jpg'
import ZOOKEEPER from '../../../../src/assets/img/database_cache/zookeeper.jpg'
import ELASTICSEARCH from '../../../../src/assets/img/database_cache/elasticsearch.jpg'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import * as middlewareActions from '../../../actions/middlewareCenter'
import * as databaseCacheActions from '../../../../src/actions/database_cache'
import Title from '../../../../src/components/Title'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import { RabbitmqVerticalColor as Rabbitmq } from '@tenx-ui/icon'
import './style/index.less'

const tempRabbitMqData = {
  abstract: '',
  comments: 'RabbitMQ是一个企业级的，真正具备低延迟、高并发、高可用、高可靠特性，可支撑万亿级数据洪峰的分布式消息中间件服务',
  createTime: '0001-01-01T00:00:00Z',
  description: '',
  iconID: '12',
  id: 'ACTID-2ynFyDVdkT8q',
  name: 'RabbitMQ集群',
  prices: '',
  versions: '',
}

const mapStateToProps = state => {
  const appClassifies = getDeepValue(state, [ 'middlewareCenter', 'appClassifies' ])
  const apps = getDeepValue(state, [ 'middlewareCenter', 'apps' ])
  const { cluster } = state.entities.current
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if (cluster.storageClassType) {
    defaultStorageClassType = cluster.storageClassType
  }

  return {
    appClassifies,
    apps,
    storageClassType: defaultStorageClassType,
    clusterID: cluster.clusterID,
  }
}

@connect(mapStateToProps, {
  getAppClassifies: middlewareActions.getAppClassifies,
  getMiddlewareApps: middlewareActions.getMiddlewareApps,
  setCurrentApp: middlewareActions.setCurrentApp,
  loadDbCacheList: databaseCacheActions.loadDbCacheList,
})
class App extends React.PureComponent {
  state = {
    apps: [],
    isFetching: false,
  }

  componentDidMount() {
    const { getAppClassifies } = this.props
    getAppClassifies()
    this.loadApps().then(res => {
      this.setState({
        isFetching: false,
      })
      if (res.response) {
        res.response.result.data.push(tempRabbitMqData)
        const apps = res.response.result.data
        this.setState({ apps })
      }
    })
  }

  loadApps = async query => {
    const { getMiddlewareApps } = this.props
    this.setState({
      isFetching: true,
    })
    return getMiddlewareApps(query)
  }

  classifyChange = currentClassify => {
    this.setState({
      currentClassify,
    })
    const { classifyName, id } = currentClassify
    const query = {
      filter: `classify_id,${id}`,
    }
    if (id === 'all') {
      delete query.filter
    }
    this.loadApps(query).then(res => {
      const { data } = res.response.result
      this.setState({
        isFetching: false,
        apps: id === 'all' || classifyName === '中间件' ? data.concat([ tempRabbitMqData ]) : data,
      })
    })
  }

  addPropsToItem = name => {
    const obj = {
      src: 'BPM_LOGO',
      className: 'app-logo',
    }
    switch (name) {
      case '炎黄BPM':
        obj.className = 'app-logo app-bpm'
        obj.src = BPM_LOGO
        obj.getData = true
        obj.type = 'bpm'
        obj.url = '/middleware_center/deploy/config'
        break
      case 'MySQL 集群':
        obj.src = MYSQL
        // obj.url = '/database_cache/mysql_cluster'
        obj.url = '/middleware_center/deploy/cluster-mysql-redis/mysql'
        obj.type = 'mysql'
        break
      case 'Redis 集群':
        obj.src = REDIS
        // obj.url = '/database_cache/redis_cluster'
        obj.type = 'redis'
        obj.url = '/middleware_center/deploy/cluster-mysql-redis/redis'
        break
      case 'ZooKeeper 集群':
        obj.src = ZOOKEEPER
        obj.type = 'zookeeper'
        obj.url = '/middleware_center/deploy/cluster-stateful/zookeeper'
        break
      case 'ElasticSearch 集群':
        obj.src = ELASTICSEARCH
        obj.type = 'elasticsearch'
        obj.url = '/middleware_center/deploy/cluster-stateful/elasticsearch'
        break
      case 'RabbitMQ集群':
        obj.src = ''
        obj.type = 'rabbitmq'
        obj.url = '/middleware_center/deploy/cluster-rabbitmq/rabbitmq'
        break
      default:
        break
    }
    return obj
  }

  renderAppList = () => {
    const { intl } = this.props
    const { apps, isFetching } = this.state
    if (isFetching) {
      return <div className="loadingBox"><Spin size="large"/></div>
    }
    return !isEmpty(apps) && apps.map(item => {
      const appInfo = this.addPropsToItem(item.name)
      return <div className="app-item">
        <div className="app-item-content">
          {
            item.name === 'RabbitMQ集群' ?
              <div className="tenx-icon">
                <Rabbitmq />
              </div>
              :
              <img className={appInfo.className} src={appInfo.src} alt="bpm-logo"/>
          }
        </div>
        <div className="app-item-footer">
          <div className="app-item-footer-left">
            <div className="app-name">{item.name}</div>
            <div className="app-desc">
              <Ellipsis lines={2}>
                <span>
                  {item.comments}
                </span>
              </Ellipsis>
            </div>
          </div>
          <Button
            className="deploy-btn"
            type={'ghost'}
            onClick={async () => {
              if (appInfo.getData) {
                await this.props.setCurrentApp(item)
              }
              browserHistory.push(`${appInfo.url}`)
            }}
          >
            {intl.formatMessage(IntlMessage.deploy)}
          </Button>
        </div>
      </div>
    })
  }

  render() {
    const { intl, appClassifies } = this.props
    const { currentClassify } = this.state
    return (
      <TenxPage className="middleware-center-apps">
        <Title title={intl.formatMessage(IntlMessage.app)}/>
        <QueueAnim>
          <div className="alertRow" key={'notice'}>
            {intl.formatMessage(IntlMessage.appPageTip)}
          </div>
          <AppClassify
            intl={intl}
            onChange={this.classifyChange}
            current={currentClassify}
            dataSource={appClassifies}
          />
          <div className="app-list-box">
            {this.renderAppList()}
          </div>
        </QueueAnim>
      </TenxPage>
    )
  }
}

export default injectIntl(App, {
  withRef: true,
})
