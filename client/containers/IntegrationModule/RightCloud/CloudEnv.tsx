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
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Radio, Select, Spin } from 'antd'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import { getDeepValue } from '../../../util/util'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const RadioMenus = [{
  key: 'disk',
  text: '硬盘',
}, {
  key: 'subnet',
  text: '子网',
  disabled: true,
}, {
  key: 'virtual',
  text: '虚拟网络',
  disabled: true,
  }]

const mapStateToProps = state => {
  const envs = getDeepValue(state, ['rightCloud', 'envs', 'data'])
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  const { isFetching } = state.rightCloud.envs
  return {
    envs: envs || [],
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  cloudEnvList: rcIntegrationActions.cloudEnvList,
  cloudEnvChange: rcIntegrationActions.cloudEnvChange,
})
export default class CloudEnv extends React.PureComponent {
  constructor(props) {
    const { pathname } = props.location
    const pathArray = pathname.split('/')
    const lastRoute = pathArray[pathArray.length - 1]
    this.state = {
      value: lastRoute,
    }
  }

  componentDidMount() {
    this.props.cloudEnvList()
  }

  radioChange = e => {
    const { value } = e.target
    this.setState({
      value,
    })
    browserHistory.push(`/cluster/integration/rightCloud/env/${value}`)
  }

  handleEnv = env => {
    const { cloudEnvChange } = this.props
    cloudEnvChange(env)
  }

  render() {
    const { value } = this.state
    const { children, currentEnv, isFetching, envs } = this.props
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large" />
      </div>
    }
    return (
      <div className="layout-content">
        <div className="layout-content-btns">
          <Select
            style={{ width: 180 }}
            placeholder={'选择一个云环境'}
            size={'large'}
            value={currentEnv}
            onSelect={this.handleEnv}
          >
            {
              envs.map(env =>
                <Option
                  value={env.id}
                  key={env.id}
                >
                  {env.cloudEnvName}
                </Option>,
              )
            }
          </Select>
          <RadioGroup onChange={this.radioChange} value={value} size={'large'}>
            {
              RadioMenus.map(item =>
                <RadioButton disabled={item.disabled} key={item.key} value={item.key}>
                  {item.text}
                </RadioButton>,
              )
            }
          </RadioGroup>
        </div>
        {children}
      </div>
    )
  }
}
