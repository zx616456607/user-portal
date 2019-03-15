/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * new alarm for overview
 *
 * @author Songsz
 * @date 2019-03-13
 *
*/

import React from 'react'
import IntlMessages from '../../../src/containers/IndexPage/Enterprise/Intl'
import { Card, Row, Timeline } from 'antd'
import homeNoWarn from '../../../src/assets/img/homeNoWarn.png'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import TimeHover from '@tenx-ui/time-hover/lib'
import './style/Alarm.less'
import { loadRecords } from '../../../src/actions/alert'
import NotificationStatus from '../../../src/components/ManageMonitor/NotificationStatus'
import { Link } from 'react-router'
import IntlMessage from '../../../src/containers/Application/intl'
import AlarmMessage from '../../../src/components/AppModule/AlarmModal/Intl'

function mapStateToProps(state) {
  const { records } = state.alert
  const { clusterID } = state.entities.current.cluster
  let recordsData = {
    total: 0,
    records: [],
  }
  if (records && records.result) {
    recordsData = records.result.data
  }
  return {
    records: recordsData,
    isFetching: records.isFetching,
    clusterID,
  }
}

@connect(mapStateToProps, {
  loadRecords,
})
class Alarm extends React.PureComponent {
  componentDidMount() {
    this.props.loadRecords({
      targetType: 0,
      cluster: this.props.clusterID,
    }, this.props.clusterID)
  }
  renderWarning = () => {
    const { intl: { formatMessage } } = this.props
    const data = this.props.records.records || []
    if (!data.length) {
      return (
        <div className="noWarnImg">
          <img src={homeNoWarn} alt="NoWarn" />
          <div><FormattedMessage {...IntlMessages.noSysAlarm} /></div>
        </div>
      )
    }
    return data.map((item, index) => (
      <Timeline.Item
        key={index}
        dot={<div className="warnDot"/>}
      >
        <div className="warnItem">
          <span className="firstRow">
            <span className="name">
              <Ellipsis tooltip={item.targetName}>
                { `${formatMessage(IntlMessage.service)}：${item.targetName}`}
              </Ellipsis>
            </span>
            <span className="type">{formatMessage(AlarmMessage.type)}：{formatMessage(IntlMessage.service)}</span>
          </span>
          <span className="secondRow">
            <Ellipsis>
              {item.triggerValue}
            </Ellipsis>
          </span>
          <span className="thirdRow">
            <TimeHover time={item.createTime}/>
            <NotificationStatus data={item.status}/>
          </span>
        </div>
      </Timeline.Item>
    ))
  }
  render() {
    const { intl: { formatMessage } } = this.props
    return (
      <div>
        <Card
          title={formatMessage(IntlMessages.alarm)}
          bordered={false}
          bodyStyle={{ height: 410 }}
        >
          <div className="overviewWarnListWrap">
            <Timeline className="warnList">
              {
                this.renderWarning()
              }
            </Timeline>
          </div>
          <Row className="overviewAlarmFooter">
            <Link to="/manange_monitor/alarm_record/resource">
              <FormattedMessage {...IntlMessages.seeMore} /> >>
            </Link>
          </Row>
        </Card>
      </div>
    )
  }
}

export default Alarm
