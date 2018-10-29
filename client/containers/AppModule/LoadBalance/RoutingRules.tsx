/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Ingress routing rules
 *
 * @author zhangxuan
 * @date 2018-10-16
 */

import React from 'react'
import { Row, Col, Button, Form, Icon, Select, Input } from 'antd'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import './style/RoutingRules.less'
import { sleep } from '../../../../src/common/tools'
import { CONNECT_FLAG } from '../../../../src/constants'

const FormItem = Form.Item
const Option = Select.Option

let uidd = 0

interface IProps {
  form: Object,
  hasBundleService: boolean,
  currentIngress?: Object,
}

export default class RoutingRules extends React.PureComponent<any, IProps> {

  state = {}

  componentDidMount() {
    this.initialRules()
  }

  componentWillUnmount() {
    uidd = 0
  }

  initialRules = () => {
    const { currentIngress } = this.props
    if (isEmpty(currentIngress)) {
      return
    }
    const { shunts } = currentIngress
    if (isEmpty(shunts)) {
      return
    }
    const ruleKeys: number[] = []
    const formObj = {}
    const defaultRules: object[] = []
    const ruleServices: string[] = []
    shunts.forEach(item => {
      const { type, name, value, regex, serviceInfos } = item
      serviceInfos.forEach(svc => {
        const { name: svcName, port } = svc
        uidd ++
        ruleKeys.push(uidd)
        const connectSvc = svcName + CONNECT_FLAG + port
        const currentFields = {
          [`rule-service-${uidd}`]: connectSvc,
          [`rule-type-${uidd}`]: type,
          [`rule-name-${uidd}`]: name,
          [`rule-regex-${uidd}`]: JSON.stringify(regex),
          [`rule-value-${uidd}`]: value,
        }
        Object.assign(formObj, currentFields)
        defaultRules.push(currentFields)
        ruleServices.push(connectSvc)
      })
    })
    const { form } = this.props
    const { setFieldsValue } = form
    this.setState({
      ruleServices,
      defaultRules,
    })
    setFieldsValue({
      ruleKeys,
      ...formObj,
    })
  }

  renderHintText = () => {
    const { hasBundleService } = this.props
    if (hasBundleService) {
      return '匹配规则的请求将分发到相应的服务中，不匹配规则的请求将分发到该监听器绑定的其他服务中（按原有权重比例）'
    }
    return '请先绑定后端服务'
  }

  renderRuleService = () => {
    const { ruleServices } = this.state
    return ruleServices.map(item => {
      const [svcName, portValue] = item.split(CONNECT_FLAG)
      return <Option
        key={item}
      >
        {`${svcName}（${portValue}）`}
      </Option>
    })
  }

  setRuleService = () => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    const serviceWithPort: string [] = []
    const existService: string [] = []
    keys.forEach(_key => {
      const serviceName = getFieldValue(`service-${_key}`)
      if (!existService.includes(serviceName)) {
        existService.push(serviceName)
      }
    })
    existService.forEach(svc => {
      keys.forEach(key => {
        const svcName = getFieldValue(`service-${key}`)
        const portValue = getFieldValue(`port-${key}`)
        const connectString = `${svcName}${CONNECT_FLAG}${portValue}`
        if (!serviceWithPort.includes(connectString) && svcName === svc) {
          serviceWithPort.push(connectString)
        }
      })
    })
    this.setState({
      ruleServices: serviceWithPort,
    })
  }

  editItem = key => {
    this.setState({
      [`rule-edit-${key}`]: true,
    })
  }

  removeKey = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    setFieldsValue({
      ruleKeys: getFieldValue('ruleKeys').filter(item => item !== key),
    })
  }

  cancelEdit = key => {
    const { defaultRules } = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    this.setState({
      [`rule-edit-${key}`]: false,
    })
    if (!defaultRules[key - 1]) {
      return
    }
    setFieldsValue({
      [`rule-service-${key}`]: defaultRules[key - 1][`rule-service-${key}`],
      [`rule-type-${key}`]: defaultRules[key - 1][`rule-type-${key}`],
      [`rule-name-${key}`]: defaultRules[key - 1][`rule-name-${key}`],
      [`rule-regex-${key}`]: defaultRules[key - 1][`rule-regex-${key}`],
      [`rule-value-${key}`]: defaultRules[key - 1][`rule-value-${key}`],
    })
  }

  confirmEdit = async key => {
    const { getRuleErrors } = this.props
    const errors = getRuleErrors(key)
    if (!isEmpty(errors)) {
      return
    }
    const result = await this.validateNewItem(key)
    if (!result) {
      return
    }
    this.setState({
      [`rule-edit-${key}`]: false,
    })
  }

  setValueError = async (_value, typeKey, _key) => {
    const { form } = this.props
    const { getFieldValue, setFields, getFieldError } = form
    const ruleKeys = getFieldValue('ruleKeys')
    const typeArray = ['service', 'type', 'name', 'regex', 'value']
    if (!isEmpty(ruleKeys)) {
      let errorMsg: string = ''
      let existed = false
      let svcName = getFieldValue(`rule-service-${_key}`)
      let type = getFieldValue(`rule-type-${_key}`)
      let name = getFieldValue(`rule-name-${_key}`)
      let regex = getFieldValue(`rule-regex-${_key}`)
      let value = getFieldValue(`rule-value-${_key}`)
      switch (typeKey) {
        case 'service':
          svcName = _value
          errorMsg = '服务名称重复'
          break
        case 'type':
          type = _value
          errorMsg = '类型重复'
          break
        case 'name':
          name = _value
          errorMsg = '匹配键重复'
          break
        case 'regex':
          regex = _value
          errorMsg = '匹配规则重复'
          break
        case 'value':
          value = _value
          errorMsg = '匹配值重复'
          break
        default:
          break
      }
      ruleKeys.filter(key => key !== _key).forEach(key => {
        const serviceName = getFieldValue(`rule-service-${key}`)
        const ruleType = getFieldValue(`rule-type-${key}`)
        const ruleName = getFieldValue(`rule-name-${key}`)
        const ruleRegex = getFieldValue(`rule-regex-${key}`)
        const ruleValue = getFieldValue(`rule-value-${key}`)
        if (serviceName === svcName && ruleType === type &&
          ruleName === name && ruleRegex === regex && ruleValue === value) {
          existed = true
        }
      })
      interface IvalueObj {
        [propName: string]: any,
      }
      const valueObj: IvalueObj = {
        [`rule-${typeKey}-${_key}`]: {
          errors: null,
          value: _value,
        },
      }
      if (existed) {
        valueObj[`rule-${typeKey}-${_key}`].errors = [errorMsg]
        await sleep()
        setFields(valueObj)
        return
      }
      const clearError = {}
      typeArray.filter(key => key !== typeKey).forEach(item => {
        Object.assign(clearError, {
          [`rule-${item}-${_key}`]: {
            errors: getFieldError(`rule-${item}-${_key}`),
            value: getFieldValue(`rule-${item}-${_key}`),
          },
        })
      })
      await sleep()
      setFields(clearError)
    }
  }

  renderRuleList = () => {
    const { form, currentIngress } = this.props
    const { getFieldValue, getFieldProps } = form
    const ruleKeys = getFieldValue('ruleKeys')
    if (isEmpty(ruleKeys)) {
      return <div className="hintColor noRules">
        暂无路由规则
      </div>
    }
    return ruleKeys.map(key =>
      <Row className="ruleList" type={'flex'} align={'middle'} key={`rule${key}`}>
        <Col span={4}>
          <FormItem>
            <Select
              disabled={currentIngress && !this.state[`rule-edit-${key}`]}
              placeholder="请选择服务"
              {...getFieldProps(`rule-service-${key}`, {
                rules: [
                  {
                    required: true,
                    message: '请选择服务',
                  },
                ],
                onChange: value => this.setValueError(value, 'service', key),
              })}
            >
              {this.renderRuleService()}
            </Select>
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <Select
              disabled={currentIngress && !this.state[`rule-edit-${key}`]}
              placeholder={'请选择类型'}
              {...getFieldProps(`rule-type-${key}`, {
                rules: [
                  {
                    required: true,
                    message: '请选择类型',
                  },
                ],
                onChange: value => this.setValueError(value, 'type', key),
              })}
            >
              <Option key={'header'}>Header</Option>
              <Option key={'query'}>Query</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <Input
              disabled={currentIngress && !this.state[`rule-edit-${key}`]}
              placeholder={'请输入键'}
              {...getFieldProps(`rule-name-${key}`, {
                rules: [
                  {
                    required: true,
                    message: '请输入键',
                    whitespace: true,
                  },
                ],
                onChange: e => this.setValueError(e.target.value, 'name', key),
              })}
            />
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <Select
              disabled={currentIngress && !this.state[`rule-edit-${key}`]}
              {...getFieldProps(`rule-regex-${key}`, {
                initialValue: 'false',
                onChange: value => this.setValueError(value, 'regex', key),
              })}
            >
              <Option key={false}>完全匹配</Option>
              <Option key>正则匹配</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <FormItem>
              <Input
                disabled={currentIngress && !this.state[`rule-edit-${key}`]}
                placeholder={'请输入值'}
                {...getFieldProps(`rule-value-${key}`, {
                  rules: [
                    {
                      required: true,
                      message: '请输入值',
                      whitespace: true,
                    },
                  ],
                  onChange: e => this.setValueError(e.target.value, 'value', key),
                })}
              />
            </FormItem>
          </FormItem>
        </Col>
        <Col span={4}>
          {this.state[`rule-edit-${key}`] ?
              [
                <Button
                  type="ghost"
                  key={`cancel${key}`}
                  className="cancelEditBtn"
                  onClick={() => this.cancelEdit(key)}
                >
                  <Icon type="cross" />
                </Button>,
                <Button
                  type="primary"
                  key={`confirm${key}`}
                  className="confirmEditBtn"
                  onClick={() => this.confirmEdit(key)}
                >
                  <Icon type="check" />
                </Button>,
              ]
              :
              [
                currentIngress &&
                <Button
                  type="dashed"
                  key={`edit${key}`}
                  className="editServiceBtn"
                  onClick={() => this.editItem(key)}
                >
                  <i className="fa fa-pencil-square-o" aria-hidden="true"/>
                </Button>,
                <Button type="dashed" icon="delete" key={`delete${key}`} onClick={() => this.removeKey(key)}/>,
              ]}
        </Col>
      </Row>,
    )
  }

  validateNewItem = async (key?: string) => {
    const { form } = this.props
    const { getFieldValue, validateFields } = form
    const ruleKeys = getFieldValue('ruleKeys')
    let endIndexValue = ruleKeys[ruleKeys.length - 1]
    if (key) {
      endIndexValue = key
    }
    const validateArray = [
      `rule-service-${endIndexValue}`,
      `rule-type-${endIndexValue}`,
      `rule-name-${endIndexValue}`,
      `rule-regex-${endIndexValue}`,
      `rule-value-${endIndexValue}`,
    ]
    let validateFlag = true
    validateFields(validateArray, errors => {
      if (!!errors) {
        validateFlag = false
        return
      }
    })
    await sleep()
    return validateFlag
  }

  addRules = async () => {
    const { form, currentIngress, getRuleErrors } = this.props
    const { getFieldValue, setFieldsValue } = form
    const ruleKeys = getFieldValue('ruleKeys')
    if (!isEmpty(ruleKeys)) {
      const errors = getRuleErrors()
      if (!isEmpty(errors)) {
        return
      }
      const result = await this.validateNewItem()
      if (!result) {
        return
      }
    }
    uidd ++
    if (currentIngress) {
      this.setState({
        [`rule-edit-${uidd}`]: true,
      })
    }
    setFieldsValue({
      ruleKeys: ruleKeys.concat(uidd),
    })
    this.setRuleService()
  }

  render() {
    const { hasBundleService, form } = this.props
    const { getFieldProps } = form
    getFieldProps('ruleKeys', {
      initialValue: [],
    });
    return (<FormItem
      label={'路由规则'}
      labelCol={{ span: 3 }}
      wrapperCol={{ span: 20 }}
      className={'routingRulesItem'}
    >
      <div>
        <Button
          className={classNames({ addRulesBtn: hasBundleService })}
          type={'ghost'}
          icon={'plus'}
          disabled={!hasBundleService}
          onClick={this.addRules}
        >
          添加规则
        </Button>
        <div className="hintColor rulesHint">
          <Icon type="info-circle-o" /> {this.renderHintText()}</div>
        <Row className="routingRuleHeader">
          <Col span={4}>服务（端口）</Col>
          <Col span={4}>规则类型</Col>
          <Col span={4}>匹配键</Col>
          <Col span={4}>匹配规则</Col>
          <Col span={4}>匹配值</Col>
          <Col span={4}>操作</Col>
        </Row>
        {this.renderRuleList()}
      </div>
    </FormItem>)
  }
}
