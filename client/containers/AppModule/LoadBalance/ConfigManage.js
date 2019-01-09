/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Configuration manage
 *
 * v0.1 - 2018-12-29
 * @author zhangxuan
 */

import React from 'react'
import { Form } from 'antd'
import Editor from '../../../components/EditorModule'

const FormItem = Form.Item

export default class ConfigManage extends React.PureComponent {
  componentDidMount() {
    const { config, form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      config: JSON.stringify(config, null, 2),
    })
  }
  render() {
    const { formItemLayout, form, readOnly } = this.props
    const { getFieldProps, getFieldValue } = form
    return (
      <div>
        <FormItem
          label={'配置文件'}
          {...formItemLayout}
        >
          <div>Nginx 配置（用以覆盖默认配置）</div>
        </FormItem>
        <FormItem
          label={'配置内容'}
          {...formItemLayout}
        >
          <Editor
            readOnly={readOnly}
            mode={'json'}
            title={'JSON'}
            style={{ minHeight: 200 }}
            {...getFieldProps('config')}
            value={getFieldValue('config') || ''}
            // options={{
            //   readOnly,
            // }}
          />
        </FormItem>
      </div>
    )
  }
}
