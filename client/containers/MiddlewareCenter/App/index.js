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
import './style/index.less'
import { injectIntl } from 'react-intl'
import IntlMessage from '../Intl'
import AppClassify from './AppClassify'
import BPM_LOGO from '../../../assets/img/MiddlewareCenter/bpm-logo.png'
import MYSQL from '../../../../src/assets/img/database_cache/mysql.png'
import REDIS from '../../../../src/assets/img/database_cache/redis.jpg'
import ZOOKEEPER from '../../../../src/assets/img/database_cache/zookeeper.jpg'
import ELASTICSEARCH from '../../../../src/assets/img/database_cache/elasticsearch.jpg'
import { getDeepValue } from '../../../util/util'
import * as middlewareActions from '../../../actions/middlewareCenter'
import Title from '../../../../src/components/Title'
import Ellipsis from '@tenx-ui/ellipsis/lib'

const mapStateToProps = state => {
  const appClassifies = getDeepValue(state, [ 'middlewareCenter', 'appClassifies' ])
  const apps = getDeepValue(state, [ 'middlewareCenter', 'apps' ])
  return {
    appClassifies,
    apps,
  }
}

@connect(mapStateToProps, {
  getAppClassifies: middlewareActions.getAppClassifies,
  getMiddlewareApps: middlewareActions.getMiddlewareApps,
  setCurrentApp: middlewareActions.setCurrentApp,
})
class App extends React.PureComponent {
  state = {}

  componentDidMount() {
    const { getAppClassifies } = this.props
    getAppClassifies()
    this.loadApps()
  }

  loadApps = query => {
    const { getMiddlewareApps } = this.props
    getMiddlewareApps(query)
  }

  classifyChange = currentClassify => {
    this.setState({
      currentClassify,
    })
    const { id } = currentClassify
    const query = {
      filter: `classify_id,${id}`,
    }
    if (id === 'all') {
      delete query.filter
    }
    this.loadApps(query)
  }

  showItemPhoto = name => {
    const obj = {
      src: 'BPM_LOGO',
      className: 'app-logo',
    }
    switch (name) {
      case '炎黄BPM':
        obj.className = 'app-logo app-bpm'
        obj.src = BPM_LOGO
        obj.getData = true
        obj.url = '/middleware_center/deploy/config'
        break
      case 'MySQL 集群':
        obj.src = MYSQL
        obj.url = '/middleware_center/deploy/cluster/mysql'
        break
      case 'Redis 集群':
        obj.src = REDIS
        obj.url = '/middleware_center/deploy/cluster/redis'
        break
      case 'ZooKeeper 集群':
        obj.src = ZOOKEEPER
        obj.url = '/database_cache/zookeeper_cluster'
        break
      case 'ElasticSearch 集群':
        obj.src = ELASTICSEARCH
        obj.url = '/database_cache/elasticsearch_cluster'
        break
      default :
        break
    }
    return obj
  }

  renderAppList = () => {
    const { intl, apps } = this.props
    const { data, isFetching } = apps

    if (isFetching) {
      return <div className="loadingBox"><Spin size="large"/></div>
    }
    return !isEmpty(data) && data.map(item => {
      const appInfo = this.showItemPhoto(item.name)
      return <div className="app-item">
        <div className="app-item-content">
          <img className={appInfo.className} src={appInfo.src} alt="bpm-logo"/>
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
