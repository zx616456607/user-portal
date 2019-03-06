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
import { Radio } from 'antd'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import './style/CloudEnv.less'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const HOST_MENU = {
  key: 'host',
  text: '主机管理',
}
const DISK_MENU = {
  key: 'disk',
  text: '硬盘',
}
const SUBNET_MENU = {
  key: 'subnet',
  text: '子网',
}
/*const VIRTUAL_MENU = {
  key: 'virtual',
  text: '虚拟网络',
}*/
const NETWORK_MENU = {
  key: 'network',
  text: '网络管理',
}
const RadioMenus = {
  1455: [ // 天熠云
    HOST_MENU,
    DISK_MENU,
    SUBNET_MENU,
    // VIRTUAL_MENU, 目前云星未提供该接口
  ],
  1457: [
    HOST_MENU,
    DISK_MENU,
    NETWORK_MENU,
  ],
}
const mapStateToProps = state => {
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  return {
    currentEnv,
  }
}
@connect(mapStateToProps)
export default class CloudEnv extends React.PureComponent {
  constructor(props) {
    const { pathname } = props.location
    const pathArray = pathname.split('/')
    const lastRoute = pathArray[pathArray.length - 1]
    this.state = {
      value: lastRoute,
    }
  }

  async componentDidMount() {
    this.radioChange('host')
  }

  componentWillReceiveProps(nextProps) {
    const { currentEnv: newEnv } = nextProps
    const { currentEnv: oldEnv } = this.props
    if (oldEnv !== newEnv) {
      this.radioChange('host')
    }
  }

  radioChange = value => {
    this.setState({
      value,
    })
    browserHistory.push(`/cluster/integration/rightCloud/env/${value}`)
  }

  renderRadioGroup = () => {
    const { value } = this.state
    const { location, currentEnv } = this.props
    const { query } = location
    const finialMenus = RadioMenus[currentEnv]
    if (query.vpcId) {
      return
    }
    return <RadioGroup onChange={e => this.radioChange(e.target.value)} value={value} size={'large'}>
      {
        finialMenus.map(item =>
          <RadioButton key={item.key} value={item.key}>
            {item.text}
          </RadioButton>,
        )
      }
    </RadioGroup>
  }

  back = () => {
    browserHistory.push('/cluster/integration/rightCloud/env/network')
  }

  renderReturnBtn = () => {
    const { location } = this.props
    const { pathname, query } = location
    if (pathname.includes('subnet') && query.vpcId) {
      return <div className="return-box">
        <ReturnButton onClick={this.back}>返回网络管理</ReturnButton>
        <span className="first-title">网络详情（子网）</span>
      </div>
    }
  }

  render() {
    const { children } = this.props
    return (
      <div className="cloud-env-manage">
        <div>
          <div style={{ marginBottom: 20 }}>
            {this.renderReturnBtn()}
          </div>
          {this.renderRadioGroup()}
          {children}
        </div>
      </div>
    )
  }
}
