/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Cluster config
 *
 * @author zhangxuan
 * @date 2018-11-28
 */
import React from 'react'
import { Form, Input } from 'antd'
import TenxIcon from '@tenx-ui/icon/es/_old'
import '@tenx-ui/icon/assets/index.css'
import './style/ClusterConfig.less'
import { IP_REGEX } from '../../../../../constants'

const FormItem = Form.Item

export default class ClusterConfig extends React.PureComponent {
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldProps } = form
    return (
      <div className="cluster-config">
        <FormItem
          label={'Kubernetes 版本'}
          {...formItemLayout}
        >
          <span><TenxIcon type="tag"/> v 1.12.0</span>
        </FormItem>
        <FormItem
          label={'Docker 版本'}
          {...formItemLayout}
        >
          <span>
            <TenxIcon type="tag"/> v 1v17.03.2-ce
            <span className="hintColor">为了给您使用高可靠的docker版本，我们在安装过程中会卸载已安装的docker。</span>
          </span>
        </FormItem>
        <FormItem
          label={'网络方案'}
          {...formItemLayout}
        >
          <span>Calico</span>
        </FormItem>
        <FormItem
          label={'网络规划'}
          {...formItemLayout}
        >
          <div className="network-plan-box">
            <span>Pod 网络 CIDR</span>
            <span>Service CIDR</span>
          </div>
        </FormItem>
        <FormItem
          label={' '}
          {...formItemLayout}
        >
          <div className="network-plan-box">
            <FormItem>
              <Input
                placeholder={'172.31.0.0/16'}
                {...getFieldProps('podCidr', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '不能为空',
                  }, {
                    pattern: IP_REGEX,
                    message: '格式不正确',
                  }],
                })}
              />
            </FormItem>
            <FormItem>
              <Input
                placeholder={'10.96.0.0/12'}
                {...getFieldProps('serviceCidr', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '不能为空',
                  }, {
                    pattern: IP_REGEX,
                    message: '格式不正确',
                  }],
                })}
              />
            </FormItem>
          </div>
        </FormItem>
        <FormItem
          label={' '}
          {...formItemLayout}
        >
          <div className="hintColor">
            请填写有效的私有网，不能与 VPC 及 VPC 内已有 Kubernetes 集群使用的网段重复，创建成功后不能修改，Service 地址段也不能和 Pod 地址段重复
          </div>
        </FormItem>
      </div>
    )
  }
}
