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
import TenxPage from '@tenx-ui/page'
import { Input, Form } from 'antd'
import IntlMessage from '../../Intl'
import PanelHeader from './PanelHeader'

const FormItem = Form.Item

export default class BasicInfo extends React.PureComponent {
  render() {
    const { formItemLayout, intl, form } = this.props
    const { getFieldProps } = form
    return (
      <TenxPage inner>
        <PanelHeader
          title={intl.formatMessage(IntlMessage.basicInfoTitle)}
        />
        <div className="form-field-box">
          <FormItem
            label={intl.formatMessage(IntlMessage.clusterName)}
            {...formItemLayout}
          >
            <Input
              {...getFieldProps('clusterName', {
                rules: [{
                  required: true,
                  message: intl.formatMessage(IntlMessage.clusterNameIsRequired),
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
            <Input
              {...getFieldProps('version', {
                rules: [{
                  required: true,
                  message: intl.formatMessage(IntlMessage.versionIsRequired),
                }],
              })}
              placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.version),
                tail: '',
              })}
            />
          </FormItem>
        </div>
      </TenxPage>
    )
  }
}
