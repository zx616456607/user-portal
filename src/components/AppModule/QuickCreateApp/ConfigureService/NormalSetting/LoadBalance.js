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
  Button, Input, Row, Col, Icon
} from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'

import './style/LoadBalance.less'
import IngressModal from './IngressModal'
import { getLBList, checkIngressNameAndHost } from '../../../../../actions/load_balance'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

let uidd = 0

class LoadBalance extends React.Component {

  state = {

  }

  componentWillMount() {
    const { clusterID, getLBList, form } = this.props
    getLBList(clusterID)
    const lbKeys = form.getFieldValue('lbKeys');
    if (lbKeys) {
      lbKeys.forEach(key => {
        const sourceOptons = form.getFieldValue(`ingress-${key}`)
        const targetOptions = cloneDeep(sourceOptons)
        delete targetOptions.healthCheck
        delete targetOptions.displayName
        targetOptions.monitorName = sourceOptons.displayName
        targetOptions.healthOptions = sourceOptons.healthCheck
        this.setState({
          [`config-${key}`]: targetOptions
        })
      })
    }
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
    const copyKey = editKey || uidd
    this.setState({
      [`config-${copyKey}`]: configs
    })
    const {
      healthCheck, healthOptions, host, lbAlgorithm, monitorName, port,
      sessionSticky, sessionPersistent
    } = configs
    let body = {
      host,
      lbAlgorithm,
      displayName: monitorName,
      port
    }
    if (sessionSticky) {
      body = Object.assign({}, body, {
        sessionSticky,
        sessionPersistent: `${sessionPersistent}s`
      })
    }
    if (healthCheck) {
      body = Object.assign({}, body, { healthCheck: healthOptions })
    }
    setFieldsValue({
      [`ingress-${copyKey}`]: body,
      [`displayName-${copyKey}`]: configs.monitorName,
      [`lbAlgorithm-${copyKey}`]: configs.lbAlgorithm,
      [`sessionPersistent-${copyKey}`]: configs.sessionSticky ? `已启用（${configs.sessionPersistent}s）` : '未启用',
      [`host-${copyKey}`]: configs.host || '未启用',
      [`port-${copyKey}`]: configs.port
    })
    if (!editKey && (editKey !== 0)) {
      setFieldsValue({
        lbKeys: currentKeys.concat(uidd ++)
      })
    } else {
      setFieldsValue({
        lbKeys: currentKeys.concat(editKey)
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
    const { getFieldValue } = this.props.form
    const lbKeys = getFieldValue('lbKeys')
    if (key || key === 0) {
      this.setState({
        editKey: key,
        currentIngress: this.state[`config-${key}`],
        ingressVisible: true
      })
    } else {
      let editKey = 0
      if (!isEmpty(lbKeys)) {
        let lbKeysLength = lbKeys.length
        let lastKey = lbKeys[lbKeysLength - 1]
        editKey = ++ lastKey
      }
      this.setState({
        editKey,
        currentIngress: null,
        ingressVisible: true
      })
    }
  }

  closeIngressModal = () => {
    this.setState({
      ingressVisible: false
    })
  }

  getIngressConfig = configs => {
    this.addItem(configs)
  }

  reloadLB = async () => {
    const { clusterID, getLBList } = this.props
    this.setState({
      lbLoading: true
    })
    const result = await getLBList(clusterID)
    if (result.error) {
      this.setState({
        lbLoading: false
      })
      return
    }
    this.setState({
      lbLoading: false
    })
  }
  render() {
    const { ingressVisible, currentIngress, lbLoading } = this.state
    const { form, loadBalanceList, checkIngressNameAndHost, clusterID, location, isTemplate } = this.props
    const { getFieldProps, getFieldValue } = form

    const templateDeploy = location.query.template && !isTemplate

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
            <Col span={4} className={templateDeploy ? 'hidden' : ''}>
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
            clusterID={clusterID}
            lbname={getFieldValue('loadBalance')}
            checkIngressNameAndHost={checkIngressNameAndHost}
          />
        }
        <Col span={20} offset={4}>
          <Row>
            <Col span={8}>
              <FormItem
                wrapperCol={{ span: 22 }}
              >
                <Select placeholder="选择应用负载均衡" {...lbSelectProps}>
                  {
                    (loadBalanceList || []).map(item =>
                      <Option key={item.metadata.name}>{item.metadata.annotations.displayName}</Option>
                    )
                  }
                </Select>
              </FormItem>
            </Col>
            <Col span={2}><Button type="ghost" size="large" onClick={this.reloadLB}>
              {lbLoading ? <Icon type="loading" /> : <Icon type="reload" />}</Button></Col>
            <Col span={3}><Button type="primary" size="large" onClick={() => window.open('/app_manage/load_balance') }>创建负载均衡</Button></Col>
          </Row>
          {
            !templateDeploy && getFieldValue('loadBalance') &&
            <Button className="addConfig" type="ghost" icon="plus" onClick={() => this.openIngressModal()}>添加监听器配置</Button>
          }
          {
            (getFieldValue('loadBalance') || templateDeploy) &&
            <Row className="monitorConfigHeader">
              <Col span={4}>名称</Col>
              <Col span={4}>调度算法</Col>
              <Col span={4}>会话保持</Col>
              <Col span={4}>转发规则</Col>
              <Col span={4}>服务端口</Col>
              {
                !templateDeploy &&
                <Col span={4}>操作</Col>
              }
            </Row>
          }
          {(getFieldValue('loadBalance') || templateDeploy) && serviceList}
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
  getLBList,
  checkIngressNameAndHost
})(LoadBalance)
