/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceEvent component
 *
 * v0.1 - 2018-08-16
 * @author ZhouHaitao
 */
import React from 'react'

import { Card, Spin } from 'antd'
import { connect } from 'react-redux'
import * as eventActions from '../../../../src/actions/database_cache'
import { calcuDate } from '../../../../src/common/tools.js'
import CommonStatus from '../../../../src/components/CommonStatus'
import './style/DatabaseEvent.less'

class MyComponent extends React.Component {
  render() {
    const { isFetching, config } = this.props;
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    if (config.length === 0 || !config) {
      return (
        <div className="loadingBox">
          暂无数据
        </div>
      )
    }
    const items = config.reverse().map(item => {
      return <div className="eventDetail" key={item.id}>
        <div className="iconBox">
          <div className="line"></div>
          <div className={item.type === 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
          </div>
        </div>
        <div className="infoBox">
          <div className="status">
            <span className="commonSpan">
              <CommonStatus status={item.type} content={item.reason} />
            </span>
          </div>
          <div className="message">
            消息&nbsp;:&nbsp;{item.message}
          </div>
          <div className="createTime">
            <span className="commonSpan">
              {calcuDate(item.firstTimestamp)}
            </span>
          </div>
        </div>
        <div style={{ clear: 'both' }}></div>
      </div>
    })
    return (
      <div className="logBox">
        {items}
      </div>
    )
  }
}

class DatabaseEvent extends React.Component {
  state = {
    list: [],
    isFetching: false,
  }
  componentDidMount() {
    const { loadDbEvents, database, cluster, databaseInfo } = this.props
    this.setState({
      isFetching: true,
    })
    loadDbEvents(cluster, database, databaseInfo.objectMeta.name, {
      success: {
        func: res => {
          this.setState({
            isFetching: false,
            list: res.data.events,
          })
        },
      },
    });
  }

  render() {
    const { isFetching, list } = this.state;
    return (
      <Card id="DatabaseEvent">
        <MyComponent
          isFetching={isFetching}
          config={list}/>
      </Card>
    )
  }
}


export default connect(() => {}, {
  loadDbEvents: eventActions.loadDbEvents,
})(DatabaseEvent)
