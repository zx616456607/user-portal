/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* RepoReadOnly(tab) for RepoManager
 *
 * v0.1 - 2018-11-26
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Button, Form, Checkbox } from 'antd'
import * as harborAction from '../../../../../../src/actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../../../src/constants'
import NotificationHandler from '../../../../../../src/components/Notification'

const FormItem = Form.Item;
const notification = new NotificationHandler()

class RepoReadOnly extends React.Component {

  componentDidMount() {
    this.getSysteminfo()
  }

  getSysteminfo() {
    const { loadSysteminfo } = this.props
    loadSysteminfo(DEFAULT_REGISTRY)
  }

  handleOk = () => {
    const { updateConfigurations, harbor, form } = this.props
    const read_only = form.getFieldValue('isReadOnly')
    const msg = `该镜像仓库${read_only ? '设置为' : '取消'}只读模式`
    notification.spin('修改中')
    updateConfigurations(harbor, DEFAULT_REGISTRY, { read_only }, {
      success: {
        func: () => {
          notification.close()
          notification.success(msg)
          this.getSysteminfo()
        },
        isAsync: true,
      },
      failed: {
        func: res => {
          let message = msg + '失败'
          if (res.statusCode && res.statusCode === 403) {
            message = '没有权限对仓库组进行更改'
          }
          notification.close()
          notification.warn(message)
        },
      },
    })
  }

  render() {
    const { form, systeminfo } = this.props
    const { getFieldProps, getFieldValue } = form
    const readOnly = systeminfo && systeminfo.readOnly || false
    const isEpual = typeof getFieldValue('isReadOnly') === 'boolean' ?
      getFieldValue('isReadOnly') === readOnly
      : true
    return <div style={{ paddingLeft: 20, paddingTop: 5 }}>
      <FormItem>
        <Checkbox
          {...getFieldProps('isReadOnly', {
            initialValue: readOnly,
            valuePropName: 'checked',
          })}
        >
          <span style={{ fontSize: 14, display: 'inline-block', marginRight: 40, color: '#666' }}>
            镜像仓库只读
          </span>
          <span style={{ color: '#ccc' }}>
            选中，表示正在维护状态，不可删除仓库及标签,也不可以推送镜像。
          </span>
        </Checkbox>
      </FormItem>
      <div className="ant-form-item">
        <Button
          type="primary"
          size="large"
          disabled={isEpual}
          onClick={this.handleOk}
        >
          保存
        </Button>
      </div>
    </div>
  }
}


const mapStateToProps = ({
  entities: { current: { cluster: { harbor } } },
  harbor: { systeminfo },
}) => ({
  harbor: harbor && harbor.length && harbor[0] || '',
  systeminfo: systeminfo.default && systeminfo.default.info || {},
})

export default connect(mapStateToProps, {
  updateConfigurations: harborAction.updateConfigurations,
  loadSysteminfo: harborAction.loadSysteminfo,
})(Form.create()(RepoReadOnly))
