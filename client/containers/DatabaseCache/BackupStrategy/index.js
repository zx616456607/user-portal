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
  en: '0',
  cn: '星期天',
}, {
  en: '1',
  cn: '星期一',
}, {
  en: '2',
  cn: '星期二',
}, {
  en: '3',
  cn: '星期三',
}, {
  en: '4',
  cn: '星期四',
}, {
  en: '5',
  cn: '星期五',
}, {
  en: '6',
  cn: '星期六',
}]
export default class Index extends React.PureComponent {
  state = {
    weeksSelected: [ '0', '1', '2', '3', '4', '5', '6' ],
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
    this.props.setPeriod(week, index)
  }
  render() {
    const { weeksSelected } = this.props
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
