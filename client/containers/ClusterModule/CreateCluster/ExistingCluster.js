/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Existing Cluster
 *
 * @author zhangxuan
 * @date 2018-11-27
 */
import React from 'react'
import { Form, Input, Radio, Upload, Button, Icon } from 'antd'
import { FormattedMessage } from 'react-intl'
import intlMsg from '../../../../src/components/ClusterModule/indexIntl'
import './style/ExistingCluster.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

export default class ExistingCluster extends React.PureComponent {
  render() {
    const { intl, form, formItemLayout } = this.props
    const { getFieldProps, getFieldValue } = form
    const { formatMessage } = intl
    const authType = getFieldValue('authType')
    const clusterNamePorps = getFieldProps('clusterName', {
      rules: [
        { required: true, message: formatMessage(intlMsg.plsInputClusterName) },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 18) {
              return callback([ new Error(formatMessage(intlMsg.clusterNameErr)) ])
            }
            callback()
          },
        },
      ],
    })
    const apiHostPorps = getFieldProps('apiHost', {
      rules: [
        { required: true, whitespace: true, message: formatMessage(intlMsg.plsInputApiServer) },
        { validator: this.checkApiHost },
      ],
    })
    const apiTokenPorps = getFieldProps('apiToken', {
      rules: [
        { required: true, whitespace: true, message: formatMessage(intlMsg.plsInputApiToken) },
      ],
    })
    const descProps = getFieldProps('description', {
      rules: [
        { whitespace: true },
      ],
    })
    const uploadProps = {
      name: 'file',
      action: '/upload.do',
      headers: {
        authorization: 'authorization-text',
      },
    };
    return (
      <div className="existing-cluster">
        <FormItem
          label={<FormattedMessage {...intlMsg.clusterName} />}
          {...formItemLayout}
        >
          <Input
            {...clusterNamePorps} size="large"
          />
        </FormItem>
        <FormItem
          label={'API Host'}
          {...formItemLayout}
        >
          <Input
            {...apiHostPorps}
            placeholder={formatMessage(intlMsg.apiHostPlaceholder)}
          />
        </FormItem>
        <FormItem
          label={'认证方式'}
          {...formItemLayout}
        >
          <RadioGroup {...getFieldProps('authType', {
            initialValue: 'apiToken',
          })}>
            <Radio value={'apiToken'}>API Token</Radio>
            <Radio value={'kubeConfig'}>kubeConfig</Radio>
          </RadioGroup>
        </FormItem>
        {
          authType !== 'kubeConfig' ?
            <FormItem
              label={' '}
              {...formItemLayout}
            >
              <Input
                {...apiTokenPorps}
                placeholder={'请输入 API Token'}
              />
            </FormItem>
            :
            <FormItem
              label={' '}
              {...formItemLayout}
            >
              <Upload {...uploadProps}>
                <Button type="ghost">
                  <Icon type="upload" /> 上传文件
                </Button>
              </Upload>
            </FormItem>
        }
        <FormItem
          label={<FormattedMessage {...intlMsg.description} />}
          {...formItemLayout}
        >
          <Input
            {...descProps}
            type="textarea"
          />
        </FormItem>
      </div>
    )
  }
}
