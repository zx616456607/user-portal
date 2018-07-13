/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * BackupStrategy Component
 *
 * @author songsz
 * @date 2018-06-08
 */
import React from 'react'
import { Button } from 'antd'

const ButtonGroup = Button.Group
export const weeks = [{
  en: 'Sunday',
  cn: '星期天',
}, {
  en: 'Monday',
  cn: '星期一',
}, {
  en: 'Tuesday',
  cn: '星期二',
}, {
  en: 'Wednesday',
  cn: '星期三',
}, {
  en: 'Thursday',
  cn: '星期四',
}, {
  en: 'Friday',
  cn: '星期五',
}, {
  en: 'Saturday',
  cn: '星期六',
}]
export default class Index extends React.PureComponent {
  state = {
    weeksSelected: [ false, false, false, false, false, false, false ],
    timeList: [{
      key: new Date().getTime(),
      value: null,
    }],
    type: 'Full',
  }
  componentDidUpdate() {
    const { value } = this.props
    this.setState({ ...value })
  }
  _setState = states => this.setState({ ...states }, () => {
    const { onChange } = this.props
    onChange && onChange(this.state)
  })
  _onWeekChange = (week, index) => {
    const { weeksSelected } = this.state
    const localWeeks = JSON.parse(JSON.stringify(weeksSelected))
    localWeeks[index] = localWeeks[index] ? false : week.en
    this._setState({
      weeksSelected: localWeeks,
    })
    this.props.setPeriod(localWeeks)
  }
  render() {
    const { weeksSelected } = this.state
    return (
      <div className="container">
        <ButtonGroup>
          {
            weeks.map((week, index) => (
              <Button
                key={week.en}
                type={weeksSelected[index] ? 'primary' : 'default'}
                onClick={() => this._onWeekChange(week, index)}
              >
                {week.cn}
              </Button>
            ))
          }
        </ButtonGroup>
      </div>
    )
  }
}
