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
import { connect } from 'react-redux'
import { Form, InputNumber, Select, Input } from 'antd'
import isEmpty from 'lodash/isEmpty'
import IntlMessage from '../../Intl'
import PanelHeader from './PanelHeader'
import './style/MysqlNode.less'
import * as clusterActions from '../../../../../src/actions/cluster'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

const FormItem = Form.Item
const Option = Select.Option

const mapStateToProps = (state, props) => {
  const { clusterID } = props
  const cephList = getDeepValue(state, [ 'cluster', 'clusterStorage', clusterID, 'cephList' ])
  return {
    cephList,
  }
}

@connect(mapStateToProps, {
  getClusterStorageList: clusterActions.getClusterStorageList,
})
export default class MysqlNode extends React.PureComponent {

  state = {
    readOnly: true,
  }

  componentDidMount() {
    const { clusterID, getClusterStorageList, form } = this.props
    getClusterStorageList(clusterID)
    form.setFieldsValue({
      blockStorageSize: 512,
    })
  }

  renderStorageCluster = () => {
    const { cephList } = this.props
    if (isEmpty(cephList)) {
      return
    }
    return cephList.map(item =>
      <Option key={item.metadata.name}>
        {item.metadata.annotations['system/scName']}
      </Option>
    )
  }

  render() {
    const { form, formItemLayout, intl } = this.props
    const { getFieldProps } = form
    return (
      <div className="mysql-node-config">
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
                  style={{ width: 200 }}
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
                  {this.renderStorageCluster()}
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
                    onChange: val => {
                      this.props.blockStorageChange(val)
                    },
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
              type="password"
              readOnly={!!this.state.readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
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
      </div>
    )
  }
}
