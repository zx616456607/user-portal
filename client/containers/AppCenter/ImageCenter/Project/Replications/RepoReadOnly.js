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
import { Button, Form, Checkbox } from 'antd'

const FormItem = Form.Item;


class RepoReadOnly extends React.Component {

  render() {
    const { getFieldProps,
      // getFieldValue
    } = this.props.form
    const isEpual = true // getFieldValue('isRead') === xxx
    return <div className="">
      <div className="ant-form-item">
        <Button
          type="primary"
          disabled={isEpual}
          // onClick={}
        >
          保存
        </Button>
      </div>
      <FormItem>
        <Checkbox
          {...getFieldProps('isRead', {
            initialValue: false,
            valuePropName: 'checked',
          })}
        >
          无限制
        </Checkbox>
      </FormItem>
      <div>
        选中，表示正在维护状态，不可删除仓库及标签,也不可以推送镜像。
      </div>
    </div>
  }
}

export default Form.create()(RepoReadOnly)
