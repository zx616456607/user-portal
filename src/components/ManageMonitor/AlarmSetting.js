import React from 'react'
import { Switch, Route } from 'react-router'

import TenxTab from './component/TenxTab'

const tab1 = () => (
  <div>
    tab1
  </div>
)
const tabs = [
  {
    text: '资源告警',
    key: '/manange_monitor/alarm_setting/resource'
  }, {
    text: '日志告警',
    key: '/manange_monitor/alarm_setting/log'
  },
]
class AlarmSettingIndex extends React.Component {
  render () {
    const { location, children } = this.props
    return (
      <TenxTab tabs={tabs} location={location}>
        {children}
      </TenxTab>
    )
  }
}


export default AlarmSettingIndex