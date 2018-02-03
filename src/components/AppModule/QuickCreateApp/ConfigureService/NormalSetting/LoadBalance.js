/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance
 *
 * v0.1 - 2018-01-17
 * @author Zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Select, Radio, Form,
  Button, Input, Row, Col 
} from 'antd'
import cloneDeep from 'lodash/cloneDeep'

import './style/LoadBalance.less'
import IngressModal from './IngressModal'
import { getLBList } from '../../../../../actions/load_balance'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

let uidd = 0

class LoadBalance extends React.Component {
  
  state = {
    
  }
  
  componentWillMount() {
    const { clusterID, getLBList } = this.props
    getLBList(clusterID)
  }
  
  checkLoadBalance = (rule, value, callback) => {
    if (!value) {
      return callback('请选择负载均衡')
    }
    callback()
  }
  
  addItem = configs => {
    const { editKey } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    
    const currentKeys = getFieldValue('lbKeys')
    const copyKey = editKey || ++ uidd
    this.setState({
      [`config-${copyKey}`]: configs
    })
    const { 
      httpSend, interval, fall, rise, sessionSticky, sessionPersistent, expectAlive,
      host, lbAlgorithm, monitorName, port,
    } = configs
    let body = {
      healthCheck: {
        httpSend,
        interval,
        fall,
        rise,
        sessionSticky,
        sessionPersistent,
        expectAlive
      },
      host,
      lbAlgorithm,
      displayName: monitorName,
      port
    }
    setFieldsValue({
      [`ingress-${copyKey}`]: body,
      [`displayName-${copyKey}`]: configs.monitorName,
      [`lbAlgorithm-${copyKey}`]: configs.lbAlgorithm,
      [`sessionPersistent-${copyKey}`]: configs.sessionSticky ? `已启用（${configs.sessionPersistent}s）` : '未启用',
      [`host-${copyKey}`]: configs.host,
      [`port-${copyKey}`]: configs.port
    })
    if (!editKey) {
      setFieldsValue({
        lbKeys: currentKeys.concat(uidd)
      })
    }
    this.setState({
      editKey: 0
    })
  }
  
  removeKey = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const cloneState = cloneDeep(this.state)
    delete cloneState[`config-key`]
    this.setState(cloneState)
    setFieldsValue({
      lbKeys: getFieldValue('lbKeys').filter(item => item !== key)
    })
  }
  openIngressModal = key => {
    this.setState({
      editKey: key,
      currentIngress: this.state[`config-${key}`],
      ingressVisible: true
    })
  }
  
  closeIngressModal = () => {
    this.setState({
      ingressVisible: false
    })
  }
  
  getIngressConfig = configs => {
    this.addItem(configs)
  }
  
  
  render() {
    const { ingressVisible, currentIngress } = this.state
    const { form, loadBalanceList } = this.props
    const { getFieldProps, getFieldValue } = form
    
    getFieldProps('lbKeys', {
      initialValue: [],
    });
    const lbSelectProps = getFieldProps('loadBalance', {
      rules: [
        {
          validator: this.checkLoadBalance
        }
      ]
    })
    const serviceList = getFieldValue('lbKeys').length ? getFieldValue('lbKeys').map((item, index, array) => {
        return (
          <Row className="serviceList" type="flex" align="middle" key={`service${item}`}>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`displayName-${item}`)} >
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`lbAlgorithm-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`sessionPersistent-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`host-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`port-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>   
              <Button type="dashed" key={`edit${item}`}
                      className="editServiceBtn" onClick={() => this.openIngressModal(item)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"/></Button>
              <Button type="dashed" icon="delete" key={`delete${item}`} onClick={() => this.removeKey(item)}/>
            </Col>
          </Row>
        )
      }):
      <Row className="serviceList hintColor noneService" type="flex" align="middle" justify="center">
        暂无监听配置
      </Row>
    return (
      <Row className="serviceCreateLb">
        {
          ingressVisible &&
          <IngressModal
            visible={ingressVisible}
            currentIngress={currentIngress}
            closeModal={this.closeIngressModal}
            callback={this.getIngressConfig}
          />
        }
        <Col span={20} offset={4}>
          <FormItem
            wrapperCol={{ span: 8 }}
          >
            <Select placeholder="选择应用负载均衡" {...lbSelectProps}>
              {
                (loadBalanceList || []).map(item => 
                  <Option key={item.metadata.name}>{item.metadata.annotations.displayName}</Option>
                )
              }
            </Select>
          </FormItem>
          <Button className="addConfig" type="ghost" icon="plus" onClick={() => this.openIngressModal(0)}>添加监听器配置</Button>
          <Row className="monitorConfigHeader">
            <Col span={4}>名称</Col>
            <Col span={4}>调度算法</Col>
            <Col span={4}>会话保持</Col>
            <Col span={4}>转发规则</Col>
            <Col span={4}>服务端口</Col>
            <Col span={4}>操作</Col>
          </Row>
          {serviceList}
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = state => {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceList } = loadBalance
  const { data } = loadBalanceList || { data: [] }
  return {
    clusterID,
    loadBalanceList: data
  }
}

export default connect(mapStateToProps, {
  getLBList
})(LoadBalance)