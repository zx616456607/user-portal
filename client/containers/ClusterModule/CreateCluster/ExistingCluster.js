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
import isEmpty from 'lodash/isEmpty'
import intlMsg from '../../../../src/components/ClusterModule/indexIntl'
import './style/ExistingCluster.less'
import NotificationHandler from '../../../../src/components/Notification'
import { API_URL_PREFIX } from '../../../../src/constants'
import { URL_REGEX } from '../../../../constants'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const notify = new NotificationHandler()

export default class ExistingCluster extends React.PureComponent {

  state = {
    fileList: [],
  }

  deleteFile = e => {
    e.stopPropagation()
    const { setFields } = this.props.form
    this.setState({
      fileList: [],
    })
    setFields({
      upload: {
        value: '',
        errors: [ '请上传文件' ],
      },
    })
  }

  checkApiHost = (rule, value, callback) => {
    if (!value) {
      callback()
      return
    }
    if (!URL_REGEX.test(value)) {
      callback([ new Error(this.props.intl.formatMessage(intlMsg.apiHostValidatorErr)) ])
      return
    }
    callback()
  }

  render() {
    const { fileList } = this.state
    const { intl, form, formItemLayout, callbackFunc } = this.props
    const { getFieldProps, getFieldValue, setFields } = form
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
    const descProps = getFieldProps('description', {
      rules: [
        { whitespace: true },
      ],
    })
    const uploadProps = {
      name: 'kubeconfig',
      multiple: false,
      showUploadList: false,
      data: {
        clusterName: getFieldValue('clusterName'),
        apiHost: getFieldValue('apiHost'),
        description: getFieldValue('description'),
      },
      action: `${API_URL_PREFIX}/clusters/add/kubeconfig`,
      fileList: fileList || [],
      beforeUpload: file => {
        this.setState({
          fileList: [ file ],
        })
        setFields({
          upload: {
            value: file,
            errors: [],
          },
        })
        return new Promise(resolve => {
          callbackFunc(resolve)
        })
      },
      onChange: e => {
        if (e.file.status === 'done') {
          notify.success('创建集群成功')
          return
        }
        if (e.file.status === 'error') {
          const message = e.file.response.message
          notify.warn('创建集群失败', message)
        }
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
            placeholder={formatMessage(intlMsg.plsInputClusterName)}
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
                {...getFieldProps('apiToken', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: formatMessage(intlMsg.plsInputApiToken),
                  }],
                })}
                placeholder={'请输入 API Token'}
              />
            </FormItem>
            :
            <FormItem
              label={' '}
              {...formItemLayout}
            >
              <Upload {...uploadProps} {...getFieldProps('upload', {
                rules: [{
                  required: true,
                  message: '请上传文件',
                }],
              })}>
                <Button type="primary">
                  <Icon type="upload" /> 上传文件
                </Button>
                {
                  !isEmpty(fileList) ?
                    <span className="file-box">
                      <Icon type="file-text"/> 文件名称：{fileList[0].name}
                      <Icon type="delete" onClick={this.deleteFile} className="pointer"/>
                    </span>
                    : null
                }
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
            placeholder={'请输入描述'}
          />
        </FormItem>
      </div>
    )
  }
}
