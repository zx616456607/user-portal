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
import { Form, Input, Checkbox } from 'antd'
import TenxIcon from '@tenx-ui/icon/es/_old'
import '@tenx-ui/icon/assets/index.css'
import './style/ClusterConfig.less'
import { CIDR_REGEX } from '../../../../../constants'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'

const FormItem = Form.Item

export default class ClusterConfig extends React.PureComponent {

  componentDidMount() {
    const { serviceProviderData, form } = this.props
    form.setFieldsValue({
      autoSelect: serviceProviderData.autoSelect,
    })
  }

  autoSelectChange = e => {
    const { serviceProviderData, updateParentState } = this.props
    updateParentState({
      serviceProviderData: {
        ...serviceProviderData,
        autoSelect: e.target.checked,
      },
    })
  }

  cidrChange = (e, key) => {
    const { serviceProviderData, updateParentState } = this.props
    updateParentState({
      serviceProviderData: {
        ...serviceProviderData,
        [key]: e.target.value,
      },
    })
  }

  render() {
    const { formItemLayout, form, serviceProviderData, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    const autoSelect = getFieldValue('autoSelect')
    return (
      <div className="cluster-config">
        <FormItem
          label={formatMessage(intlMsg.k8sVersion)}
          {...formItemLayout}
        >
          <span><TenxIcon type="tag"/> v 1.12.3</span>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.dockerVersion)}
          {...formItemLayout}
        >
          <span>
            <TenxIcon type="tag"/> v 18.06.1-ce
            <span className="hintColor">{formatMessage(intlMsg.dockerTip)}</span>
          </span>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.networkSolution)}
          {...formItemLayout}
        >
          <span>Calico</span>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.networkLayout)}
          {...formItemLayout}
          style={{ marginBottom: 0 }}
        >
          <Checkbox
            {...getFieldProps('autoSelect', {
              valuePropName: 'checked',
              initialValue: serviceProviderData.autoSelect,
              onChange: this.autoSelectChange,
            })}
          >
            {formatMessage(intlMsg.autoSelect)}
          </Checkbox>
        </FormItem>
        {
          !autoSelect &&
          [
            <FormItem
              key={'network-plan-title'}
              label={' '}
              {...formItemLayout}
              style={{ marginBottom: 0 }}
            >
              <div className="network-plan-box">
                <span>{formatMessage(intlMsg.networkCidr)}</span>
                <span>Service CIDR</span>
              </div>
            </FormItem>,
            <FormItem
              key={'network-plan-content'}
              label={' '}
              {...formItemLayout}
            >
              <div className="network-plan-box">
                <FormItem
                  style={{ width: 141 }}
                >
                  <Input
                    placeholder={'172.31.0.0/16'}
                    {...getFieldProps('podCIDR', {
                      initialValue: serviceProviderData.podCIDR,
                      rules: [{
                        pattern: CIDR_REGEX,
                        message: formatMessage(intlMsg.incorrectFormat),
                      }],
                      onChange: e => this.cidrChange(e, 'podCIDR'),
                    })}
                  />
                </FormItem>
                <FormItem
                  style={{ width: 141 }}>
                  <Input
                    placeholder={'10.96.0.0/12'}
                    {...getFieldProps('serviceCIDR', {
                      initialValue: serviceProviderData.serviceCIDR,
                      rules: [{
                        pattern: CIDR_REGEX,
                        message: formatMessage(intlMsg.incorrectFormat),
                      }],
                      onChange: e => this.cidrChange(e, 'serviceCidr'),
                    })}
                  />
                </FormItem>
              </div>
            </FormItem>,
            <FormItem
              key={'network-plan-tip'}
              label={' '}
              {...formItemLayout}
            >
              <div className="hintColor">
                {formatMessage(intlMsg.networkPlanTip)}
              </div>
            </FormItem>,
          ]
        }
      </div>
    )
  }
}
