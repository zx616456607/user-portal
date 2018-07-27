/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * SecurityGroup of AppDetailTab
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { connect } from 'react-redux'
import { Card, Button, Table, Modal, Form, Input, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'

const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
  colon: false,
}

class SecurityGroupTab extends React.Component {

  state={
    relatedVisible: false,
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ name: 'serviceName' })
  }

  relatedGroup = () => {
    this.setState({
      relatedVisible: !this.state.relatedVisible,
    })
  }

  render() {
    const { relatedVisible } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    const listData = [
      {
        name: '0.0',
        key: '15a245saa',
      }, {
        name: '*.*',
        key: '525525',
      }, {
        name: '0.0',
        key: '152s45sda',
      }, {
        name: '*.*',
        key: '525come',
      },
    ]
    const columns = [
      {
        title: '安全组名称',
        key: 'name',
        dataIndex: 'name',
        width: '55%',
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '40%',
        render: (key, record) => <Button type="ghost" onClick={() => this.deleteItem(record)}>移除关联</Button>,
      }]
    return (
      <Card id="securityTab">
        <Modal
          title="删除操作"
          visible={relatedVisible}
          onOk={this.relatedGroup}
          onCancel={this.relatedGroup}
        >
          <div className="relateCont">
            <FormItem
              label="服务名称"
              {...formItemLayout}>
              <Input
                disabled
                style={{ width: 300 }}
                {...getFieldProps('name')}
              />
            </FormItem>
            <FormItem
              label="安全组"
              {...formItemLayout}
            >
              <Select
                multiple
                size="large"
                style={{ width: 300 }}
                // onChange={handleSelectChange}
                {...getFieldProps('target', {
                  rules: [{
                    required: true,
                    message: '请选择服务',
                  }],
                  initialValue: 'lucy',
                })}
              >
                <Option value="jack">jack</Option>
                <Option value="lucy">lucy</Option>
                <Option value="yiminghe">yiminghe</Option>
              </Select>
            </FormItem>
          </div>
        </Modal>
        <QueueAnim>
          <div className="securityTit" key="securityTit">安全组</div>
          <div className="securityCont" key="securityCont">
            <p className="securityText">
              当前集群默认 ( namespace | 项目 ) 间互通， 可以通过配置安全组来管理服务安全策略
            </p>
            <div className="securityBtn">
              <Button type="primary" onClick={this.relatedGroup}>
                <i className="fa fa-plus"/>
                关联安全组
              </Button>
              <Button
                type="ghost"
                onClick={this.loadData}>
                <i className="fa fa-refresh"/>
                刷新
              </Button>
            </div>
            <Table
              className="securityTable"
              columns={columns}
              dataSource={listData}
              pagination={false}
              // loading={ isFetching }
            />
          </div>
        </QueueAnim>
      </Card>
    )
  }
}
export default connect()(Form.create()(SecurityGroupTab))
