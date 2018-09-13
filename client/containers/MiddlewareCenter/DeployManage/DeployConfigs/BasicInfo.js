/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Basic info of app config
 *
 * @author zhangxuan
 * @date 2018-09-07
 */
import React from 'react'
import { Input, Form, Select } from 'antd'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import IntlMessage from '../../Intl'
import PanelHeader from './PanelHeader'
import * as middlewareActions from '../../../../actions/middlewareCenter'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../../src/constants/index'
import { appNameCheck } from '../../../../../src/common/naming_validation'

const FormItem = Form.Item
const Option = Select.Option

@connect(null, {
  checkAppClusterName: middlewareActions.checkAppClusterName,
})
export default class BasicInfo extends React.PureComponent {

  checkName = (_, value, callback) => {
    const { checkAppClusterName, clusterID, intl } = this.props
    const message = appNameCheck(value, intl.formatMessage(IntlMessage.clusterName))
    if (message !== 'success') {
      return callback(message)
    }
    clearTimeout(this.checkNameTimeout)
    this.checkNameTimeout = setTimeout(() => {
      checkAppClusterName(clusterID, value, {
        success: {
          func: res => {
            if (res.data) {
              callback(intl.formatMessage(IntlMessage.nameExisted))
            } else {
              callback()
            }
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            callback(intl.formatMessage(IntlMessage.nameCheckFailed))
          },
          isAsync: true,
        },
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }

  renderVersions = () => {
    const { currentApp } = this.props
    if (isEmpty(currentApp)) {
      return
    }
    const { versions } = currentApp
    const parseVersions = JSON.parse(versions)
    if (isEmpty(parseVersions)) {
      return
    }
    return parseVersions.map(item =>
      <Option key={`${item['版本']}/${item.mysqlVersion}`}>{item['版本']}</Option>
    )
  }

  render() {
    const { formItemLayout, intl, form } = this.props
    const { getFieldProps, isFieldValidating, getFieldError } = form
    return (
      <div>
        <PanelHeader
          title={intl.formatMessage(IntlMessage.basicInfoTitle)}
          isFirst
        />
        <div className="form-field-box">
          <FormItem
            label={intl.formatMessage(IntlMessage.clusterName)}
            {...formItemLayout}
            hasFeedback
            help={isFieldValidating('clusterName') ? '校验中...' : (getFieldError('clusterName') || []).join(', ')}
          >
            <Input
              {...getFieldProps('clusterName', {
                rules: [{
                  required: true,
                  message: intl.formatMessage(IntlMessage.clusterNameIsRequired),
                }, {
                  validator: this.checkName,
                }],
              })}
              placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.clusterName),
                tail: '',
              })}
            />
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.description)}
            {...formItemLayout}
          >
            <Input
              type={'textarea'}
              {...getFieldProps('description')}
              placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.description),
                tail: '',
              })}
            />
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.version)}
            {...formItemLayout}
          >
            <Select
              {...getFieldProps('version', {
                rules: [{
                  required: true,
                  message: intl.formatMessage(IntlMessage.versionIsRequired),
                }],
              })}
              placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                item: intl.formatMessage(IntlMessage.version),
              })}
            >
              {this.renderVersions()}
            </Select>
          </FormItem>
        </div>
      </div>
    )
  }
}
