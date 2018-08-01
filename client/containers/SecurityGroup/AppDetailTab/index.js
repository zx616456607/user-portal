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
import * as serviceAction from '../../../../src/actions/app_manage'
import Notification from '../../../../src/components/Notification'
import * as securityActions from '../../../actions/securityGroup'

const notification = new Notification()
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
    listData: [],
  }

  componentDidMount() {
    const { getServiceReference, cluster, form, serviceDetail, getSecurityGroupList } = this.props
    form.setFieldsValue({ name: 'serviceName' })
    const query = {
      service: Object.keys(serviceDetail[cluster])[ 0 ],
    }
    getServiceReference(cluster, query, {
      success: {
        func: res => {
          this.setState({
            listData: res,
          })
        },
      },
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取安全组列表数据出错', message.message)
        },
      },
    })
    getSecurityGroupList(cluster, {

    })
  }

  relatedGroup = () => {
    this.setState({
      relatedVisible: !this.state.relatedVisible,
    })
  }

  render() {
    const { relatedVisible, listData } = this.state
    const { form, selectData } = this.props
    const { getFieldProps } = form
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
          title="关联安全组"
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
                {...getFieldProps('target', {
                  rules: [{
                    required: true,
                    message: '请选择服务',
                  }],
                })}
              >
                {
                  selectData.map(item => {
                    return <Option value={item.metaName} key={item.metaName}>{item.name}</Option>
                  })
                }
              </Select>
            </FormItem>
          </div>
        </Modal>
        <QueueAnim>
          <div className="securityTit" key="securityTit">安全组 (防火墙)</div>
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

const mapStateToProps = ({
  entities: { current },
  services: { serviceDetail },
  securityGroup: { getSecurityGroupList: { data } },
}) => {
  const selectData = []
  data && data.map(item => selectData.push({
    name: item.metadata.annotations['policy-name'],
    metaName: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    serviceDetail,
    selectData,
  }
}

export default connect(mapStateToProps, {
  getServiceReference: serviceAction.getServiceReference,
  getSecurityGroupList: securityActions.getSecurityGroupList,
})(Form.create()(SecurityGroupTab))
