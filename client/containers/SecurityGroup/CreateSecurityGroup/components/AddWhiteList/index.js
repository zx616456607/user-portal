/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Add White List
 *
 * v0.1 - 2018-07-24
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Input, Row, Col, Icon } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

// let uuid = 0
class AddWhiteList extends React.Component {
  state={
    uuid: 1,
  }
  componentDidMount() {
    // console.log( this.props )
    // const { type } = this.props
    // [type]uuid = uuid
  }

  remove = k => {
    const { uuid } = this.state
    const { form, type } = this.props
    // can use data-binding to get
    let keys = form.getFieldValue(`${type}`)
    keys = keys.filter(key => {
      return key !== k
    })
    // can use data-binding to set
    form.setFieldsValue({
      [type]: keys,
    })
    this.setState({
      uuid: uuid - 1,
    })
  }

  add = () => {
    const { uuid } = this.state
    const { form, type } = this.props
    // can use data-binding to get
    let keys = form.getFieldValue(`${type}`)
    keys = keys.concat(uuid)
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      [type]: keys,
    })
    this.setState({
      uuid: uuid + 1,
    })
  }

  relatedSelect = k => {
    const { form, type } = this.props
    const target = type === 'ingress' ? '来源' : '目标'
    const { getFieldValue, getFieldProps } = form
    switch (getFieldValue(`${type}${k}`)) {
      case ('CIDR'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}网络`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}网络， 如 10.10.2.0/24`}
          />
        </FormItem>
      case ('serviceName'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}服务`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}服务`}
          />
        </FormItem>
      case ('cluster'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}集群网络出口`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}集群网络出口`}
          />
        </FormItem>
      case ('load'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}应用负载均衡`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}应用负载均衡`}
          />
        </FormItem>
      case ('named'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}命名空间`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}命名空间`}
          />
        </FormItem>
      case ('sql'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}命名空间`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}命名空间`}
          />
        </FormItem>
      case ('redis'):
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${k}*`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target}命名空间`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target}命名空间`}
          />
        </FormItem>
      default:
        return
    }
  }

  render() {
    const { form, type } = this.props
    const isIngress = type === 'ingress'
    let selectData = [{ value: 'CIDR', inner: 'CIDR' },
      { value: 'serviceName', inner: '服务名称' },
      { value: 'cluster', inner: '集群网络出口' },
      { value: 'load', inner: '应用负载均衡' },
      { value: 'named', inner: '命名空间' }]
    if (!isIngress) {
      selectData = selectData.concat([{ value: 'redis', inner: 'Redis 集群' }, { value: 'sql', inner: 'MySQL 集群' }])
    }
    const { getFieldProps, getFieldValue } = form
    getFieldProps(`${type}`, {
      initialValue: [ ],
    })
    const formItems = getFieldValue(`${type}`).map(k => {
      return (
        <Row className="ingress">
          <Col span={4}></Col>
          <Col span={20} className="ingressForm">
            <FormItem key={`select${k}`}>
              <Select id="select" size="large"
                style={{ width: 120 }}
                {...getFieldProps(`${type}${k}`, {
                  rules: [{
                    required: true, message: '请选择',
                  }],
                  initialValue: 'CIDR',
                })}>
                {
                  selectData.map(item => {
                    return <Option value={item.value}>{item.inner}</Option>
                  })
                }
              </Select>
            </FormItem>
            { this.relatedSelect(k) }
            <Icon
              type="delete"
              className="deleteItem"
              onClick={() => this.remove(k)} />
          </Col>
        </Row>
      )
    })
    return <div>
      {formItems}
      <Row className="ingress">
        <Col span={4}></Col>
        <Col span={3} onClick={this.add} className="add">
          <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
          添加一个{ isIngress ? '来源' : '目标' }
        </Col>
      </Row>
    </div>
  }
}
export default connect()(AddWhiteList)
