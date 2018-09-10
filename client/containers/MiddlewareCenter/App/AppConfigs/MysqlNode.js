/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Mysql node
 *
 * @author zhangxuan
 * @date 2018-09-08
 */
import React from 'react'
import TenxPage from '@tenx-ui/page'
import { Form, InputNumber, Select, Input } from 'antd'
import IntlMessage from '../../Intl'
import PanelHeader from './PanelHeader'
import './style/MysqlNode.less'

const FormItem = Form.Item
const Option = Select.Option

export default class MysqlNode extends React.PureComponent {
  render() {
    const { form, formItemLayout, intl } = this.props
    const { getFieldProps } = form
    return (
      <TenxPage inner className="mysql-node-config">
        <PanelHeader
          title={intl.formatMessage(IntlMessage.mysqlNodeTip)}
        />
        <div className="form-field-box">
          <FormItem
            label={intl.formatMessage(IntlMessage.blockStorage)}
            {...formItemLayout}
          >
            <div className="storage-select">
              <FormItem>
                <Select
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.blockStorageCluster),
                  })}
                  {...getFieldProps('blockStorageCluster', {
                    rules: [{
                      required: true,
                      message: intl.formatMessage(IntlMessage.blockStorageClusterIsRequired),
                    }],
                  })}
                >
                  <Option key={'cluster1'}>cluster1</Option>
                </Select>
              </FormItem>
            </div>
            <div className="storage-number">
              <FormItem>
                <InputNumber
                  min={512}
                  max={20480}
                  style={{ width: '100%' }}
                  {...getFieldProps('blockStorageSize', {
                    rules: [{
                      required: true,
                      message: intl.formatMessage(IntlMessage.blockStorageSizeIsRequired),
                    }],
                    initialValue: 512,
                  })}
                />
              </FormItem>
            </div>
            MB
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.databaseUsername)}
            {...formItemLayout}
          >
            <Input
              placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.databaseUsername),
                tail: '',
              })}
              {...getFieldProps('databaseUsername', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.databaseUsername),
                    tail: '',
                  }),
                }],
              })}
            />
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.password)}
            {...formItemLayout}
          >
            <Input
              placeholder={intl.formatMessage(IntlMessage.password)}
              {...getFieldProps('databasePassword', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.password),
                    tail: '',
                  }),
                }],
              })}
            />
          </FormItem>
        </div>
      </TenxPage>
    )
  }
}
