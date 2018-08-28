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
    isSee: false,
  }

  componentDidMount() {
    const annotations = this.props.serviceDetail.metadata.annotations || {}
    annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')
    && this.setState({ isCheckIP: true })
  }

  onChangeInstanceIP = e => {
    if (e.target.checked) {
      this.setState({
        isFixed: true,
        isCheckIP: true,
      })
    } else if (!e.target.checked) {
      this.setState({
        notFixed: true,
        isCheckIP: false,
      })
    }
  }

  onChangeVisible = () => {
    this.setState({
      isFixed: false,
      notFixed: false,
      isSee: false,
    })
  }

  onHandleCanleIp = v => {
    this.setState({
      isCheckIP: v,
    })
  }

  render() {
    const { isFixed, notFixed, isCheckIP, isSee } = this.state
    const { serviceDetail, containerNum } = this.props
    return (
      <div className="instanceHeader">
        <Button type="primary">水平扩展 ({containerNum})</Button>
        <Button type="primary" onClick={() => this.props.onTabClick('#autoScale')}>自动伸缩</Button>
        <Checkbox
          onChange={this.onChangeInstanceIP}
          checked={this.state.isCheckIP}
        >
          固定实例IP
        </Checkbox>
        <span
          className="seeConfig"
          onClick={() => this.setState({ isFixed: true, isSee: true })}
        >
          查看配置的IP
        </span>
        {
          (isFixed || notFixed) && <ContainerInstance
            configIP = {isFixed}
            notConfigIP = {notFixed}
            onChangeVisible = {this.onChangeVisible}
            onHandleCanleIp = {this.onHandleCanleIp}
            serviceDetail = {serviceDetail}
            isCheckIP={isCheckIP}
            isSee = {isSee}
            containerNum={containerNum}
          />
        }
      </div>
    )
  }
}

export default ContainerInstanceHeader
