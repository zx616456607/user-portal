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
import QueueAnim from 'rc-queue-anim'
import isCidr from 'is-cidr'
const FormItem = Form.Item
const Option = Select.Option
const imgSrc = [
  { src: require('../../../../../assets/img/SecurityGroup/ingress.png') },
  { src: require('../../../../../assets/img/SecurityGroup/egress.png') },
]

class AddWhiteList extends React.Component {
  state={
    uuid: 0,
  }
  componentDidMount() {
    const { ln, type, form } = this.props
    const { setFieldsValue } = form
    ln && this.setState({
      uuid: ln.length,
    })
    if (type === 'ingress' && ln && ln.length) {
      const num = ln.length
      const ingressArr = []
      for (let i = 0; i < num; i++) {
        ingressArr.push(i)
      }
      setFieldsValue({
        ingress: ingressArr,
      })
      ln.map((item, ind) => {
        switch (item.type) {
          case 'service':
            return setFieldsValue({
              [`ingress${ind}`]: 'service',
              [`ingressservice${ind}`]: item.serviceName,
            })
          case 'namespace':
            return setFieldsValue({
              [`ingress${ind}`]: 'namespace',
              [`ingressnamespace${ind}`]: item.namespace,
            })
          case 'cidr':
            return setFieldsValue({
              [`ingress${ind}`]: 'cidr',
              [`ingresscidr${ind}`]: item.cidr,
              [`ingresscidr${ind}except`]: item.except[0] || null,
            })
          case 'ingress':
            return setFieldsValue({
              [`ingress${ind}`]: 'ingress',
              [`ingressingress${ind}`]: item.ingressId,
            })
          case 'haproxy':
            return setFieldsValue({
              [`ingress${ind}`]: 'haproxy',
            })
          default:
            return null
        }
      })
    }
    if (type === 'egress' && ln && ln.length) {
      const eNum = ln.length
      const egressArr = []
      for (let i = 0; i < eNum; i++) {
        egressArr.push(i)
      }
      setFieldsValue({
        egress: egressArr,
      })
      ln.map((item, ind) => {
        switch (item.type) {
          case 'service':
            return setFieldsValue({
              [`egress${ind}`]: 'service',
              [`egressservice${ind}`]: item.serviceName,
            })
          case 'namespace':
            return setFieldsValue({
              [`egress${ind}`]: 'namespace',
              [`egressnamespace${ind}`]: item.namespace,
            })
          case 'cidr':
            return setFieldsValue({
              [`egress${ind}`]: 'cidr',
              [`egresscidr${ind}`]: item.cidr,
              [`egresscidr${ind}except`]: item.except[0] || null,
            })
          default:
            return null
        }
      })
    }
  }

  remove = k => {
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

  checkCidr = (rule, value, callback) => {
    if (!value) {
      return callback()
    }
    if (!isCidr(value)) {
      return callback('请输入正确的 cidr')
    }
    callback()
  }

  relatedSelect = (k, isIngress) => {
    const { form, type } = this.props
    const target = isIngress ? '来源' : '目标'
    const { getFieldValue, getFieldProps } = form
    const option = getFieldValue(`${type}${k}`)
    switch (option) {
      case 'cidr':
        return <span className="typeCidr">
          <FormItem>
            <Input {...getFieldProps(`${type}${option}${k}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: `请输入要放通的${target}网络`,
              }, {
                validator: this.checkCidr,
              }],
            })}
            style={{ width: 280 }}
            placeholder={`请输入要放通的${target}网络， 如 10.10.2.0/24`}
            />
          </FormItem>
          <span>除去</span>
          <FormItem className="execptCidr">
            <Input
              {...getFieldProps(`${type}${option}${k}except`, {
                rules: [{
                  validator: this.checkCidr,
                }],
              })}
              style={{ width: 212 }}
              placeholder="如 10.10.2.0/16"
            />
          </FormItem>
        </span>
      case 'service':
        return <FormItem>
          <Input {...getFieldProps(`${type}${option}${k}`, {
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
      case 'haproxy':
        return <FormItem>
          <Input {...getFieldProps(`${type}${option}${k}`, {
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
      case 'ingress':
        return <FormItem>
          <Input {...getFieldProps(`${type}${option}${k}`, {
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
      case 'namespace':
        return <span className="typeCidr">
          <FormItem>
            <Input {...getFieldProps(`${type}${option}${k}`, {
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
          <FormItem>
            <Input
              {...getFieldProps(`${type}${option}${k}server`)}
              style={{ width: 250 }}
              placeholder="服务1，服务2"
            />
          </FormItem>
        </span>
      case 'mysql':
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${option}${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target} Mysql 集群`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target} Mysql 集群`}
          />
        </FormItem>
      case 'redis':
        return <FormItem key={`*${k}`}>
          <Input {...getFieldProps(`${type}${option}${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请输入要放通的${target} Redis 集群`,
            }],
          })}
          style={{ width: 280 }}
          placeholder={`请输入要放通的${target} Redis 集群`}
          />
        </FormItem>
      default:
        return null
    }
  }

  render() {
    const { form, type } = this.props
    const isIngress = type === 'ingress'
    let selectData = [{ value: 'cidr', inner: 'CIDR' },
      { value: 'service', inner: '服务名称' },
      { value: 'namespace', inner: '命名空间' }]
    if (isIngress) {
      selectData = selectData.concat([
        { value: 'haproxy', inner: '集群网络出口' },
        { value: 'ingress', inner: '应用负载均衡' },
      ])
    } else {
      selectData = selectData.concat([
        { value: 'redis', inner: 'Redis 集群' },
        { value: 'mysql', inner: 'MySQL 集群' },
      ])
    }
    const { getFieldProps, getFieldValue } = form
    getFieldProps(`${type}`, {
      initialValue: [],
    })
    const imgurl = isIngress && imgSrc[0].src || imgSrc[1].src
    const formItems = getFieldValue(`${type}`).map(k => {
      return (
        <Row className="ingress" key={k}>
          <Col span={4}></Col>
          <Col span={20} className="ingressForm">
            <FormItem key={`select${k}`}>
              <Select id="select" size="large"
                style={{ width: 120 }}
                {...getFieldProps(`${type}${k}`, {
                  rules: [{
                    required: true, message: '请选择',
                  }],
                  initialValue: 'cidr',
                })}>
                {
                  selectData.map((item, ind) => {
                    return <Option value={item.value} key={ind}>{item.inner}</Option>
                  })
                }
              </Select>
            </FormItem>
            <div className="second">{ this.relatedSelect(k, isIngress) }</div>
            <Icon
              type="delete"
              className="deleteItem"
              onClick={() => this.remove(k)} />
          </Col>
        </Row>
      )
    })
    return <div>
      <QueueAnim type={[ 'scale', 'scale' ]}>
        {
          formItems.length > 0 ?
            formItems :
            <Row className="ingress" key={type}>
              <Col span={4}></Col>
              <Col span={8}>
                <div className="addCol"><img src={imgurl} alt="无白名单"/></div>
                <p>{ type } 无白名单，该策略 { type } 隔离不生效</p>
              </Col>
            </Row>
        }
      </QueueAnim>
      <Row className="ingress">
        <Col span={4}></Col>
        {
          formItems.length > 0 ?
            <Col span={3}>
              <span onClick={this.add} className="add">
                <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
                添加一个{ isIngress ? '来源' : '目标' }
              </span>
            </Col> :
            <Col span={8} className="addCol">
              <span onClick={this.add} className="add">
                <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
                添加一个{ isIngress ? '来源' : '目标' }
              </span>
            </Col>
        }

      </Row>
    </div>
  }
}
export default connect()(AddWhiteList)
