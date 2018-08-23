/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * ContainerInstance Header of AppDetailTab
 *
 * v0.1 - 2018-08-23
 * @author lvjunfeng
 */

import React from 'react'
import { Button, Checkbox } from 'antd'
import ContainerInstance from './ContainerInstance'

class ContainerInstanceHeader extends React.Component {
  state = {
    isCheckIP: false,
    isFixed: false,
    notFixed: false,
  }

  componentDidMount() {
    const annotations = this.props.serviceDetail.spec
      && this.props.serviceDetail.spec.template.metadata.annotations
      || {}
    annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')
    && this.setState({ isCheckIP: true })
  }

  onChangeInstanceIP = e => {
    if (e.target.checked) {
      this.setState({
        isFixed: true,
      })
    } else if (!e.target.checked) {
      this.setState({
        notFixed: true,
      })
    }
  }

  onChangeVisible = v => {
    this.setState({
      isFixed: false,
      notFixed: false,
      isCheckIP: v,
    })
  }

  render() {
    const { isFixed, notFixed } = this.state
    const { serviceDetail } = this.props
    return (
      <div className="instanceHeader">
        <Button type="primary">水平扩展</Button>
        <Button type="primary" onClick={() => this.props.onTabClick('#autoScale')}>自动伸缩</Button>
        <Checkbox
          onChange={this.onChangeInstanceIP}
          checked={this.state.isCheckIP}
        >
          固定实例IP
        </Checkbox>
        <span>查看配置的IP</span>
        {
          (isFixed || notFixed) && <ContainerInstance
            configIP = {isFixed}
            notConfigIP = {notFixed}
            onChangeVisible = {this.onChangeVisible}
            serviceDetail = {serviceDetail}
          />
        }
      </div>
    )
  }
}

export default ContainerInstanceHeader
