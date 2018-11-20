/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Cloud env
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { browserHistory } from 'react-router'
import { Radio, Select } from 'antd'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const RadioMenus = [{
  key: 'disk',
  text: '硬盘',
}, {
  key: 'subnet',
  text: '子网',
}, {
  key: 'virtual',
  text: '虚拟网络',
}]

export default class CloudEnv extends React.PureComponent {
  constructor(props) {
    const { pathname } = props.location
    const pathArray = pathname.split('/')
    const lastRoute = pathArray[pathArray.length - 1]
    this.state = {
      value: lastRoute,
    }
  }

  radioChange = e => {
    const { value } = e.target
    this.setState({
      value,
    })
    browserHistory.push(`/cluster/integration/rightCloud/env/${value}`)
  }

  render() {
    const { value } = this.state
    const { children } = this.props
    return (
      <div className="layout-content">
        <div className="layout-content-btns">
          <Select
            style={{ width: 180 }}
            placeholder={'选择一个云环境'}
            size={'large'}
          >
            <Option key={'env1'}>环境1</Option>
            <Option key={'env2'}>环境2</Option>
          </Select>
          <RadioGroup onChange={this.radioChange} value={value} size={'large'}>
            {
              RadioMenus.map(item =>
                <RadioButton key={item.key} value={item.key}>{item.text}</RadioButton>,
              )
            }
          </RadioGroup>
        </div>
        {children}
      </div>
    )
  }
}
