/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Thursday June 14th 2018
 */
import * as React from 'react'
import { Modal, Button, Form, Input, Table, Icon } from 'antd'
import PropTypes from 'prop-types'
import './style/index.less'

const FormItem = Form.Item
// 表单布局
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 16 },
}
const formItemLayoutLarge = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
}

const getcolums = () => {
  const columns = [{
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
  }, {
    title: '申请集群',
    dataIndex: 'aggregate',
    key: 'aggregate',
  }, {
    title: '已用',
    dataIndex: 'use',
    key: 'use',
  }, {
    title: '申请配额',
    dataIndex: 'applyLimit',
    key: 'applyLimit',
    render: (text, record) => <span className="appiyLimitNum">{record.applyLimit}</span>,
  }, {
    title: '审批',
    dataIndex: 'status',
    key: 'status',
    render: (text, record) => {
      let type = 'cross-circle'
      if (record.resource === 'pass') {
        type = 'check-circle'
      }
      return (
        <div>
          <span className="crossIcon"><Icon type={type} style={{ color: 'red' }}/></span>
          {/* TODOS 要icon */}
        </div>
      )
    },
  }]
  return columns
}

const data = [
  {
    key: '1',
    resource: 'pass',
    aggregate: '集群1',
    use: 1,
    applyLimit: -2,
  }, {
    key: '2',
    resource: 'notpass',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }, {
    key: '3',
    resource: 'notpass',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }, {
    key: '4',
    resource: 'notpass',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }]

class ApplayDetail extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    toggleVisable: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  }
  render() {
    const { visible, toggleVisable, record, title } = this.props
    // console.log('record', record)
    return (
      <Modal
        visible = {visible}
        title = {title}
        onCancel={ toggleVisable }
        footer={[
          <span className="ApplyDetail result-wrap">
            <span>审批结果:</span><span className="result">部分同意</span>
          </span>,
          <Button key="makeSure" type="primary" size="large" onClick={toggleVisable}>
              知道了
          </Button>,
        ]}
      >
        <div className="ApplyDetail">
          <FormItem
            label="申请项目" {...formItemLayout}
          >
            <Input value={record.item}/>
          </FormItem>
          <FormItem
            label="申请人" {...formItemLayout}
          >
            <Input value={'申请人'}/>
          </FormItem>
          <FormItem
            label="申请原因" {...formItemLayoutLarge}
          >
            <Input value={'babab'} type="textarea" rows={4}/>
          </FormItem>
          <Table columns={getcolums()} dataSource={data} pagination={false} size="small"
            scroll={{ y: 120 }}/>
        </div>
      </Modal>
    )
  }
}

export default ApplayDetail

