/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: advanced setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Form, Collapse, Row, Col, Input, Tooltip, Button, Icon,
  Select, Cascader,
} from 'antd'
import classNames from 'classnames'
import { appEnvCheck } from '../../../../common/naming_validation'
import { getSecrets } from '../../../../actions/secrets'
import './style/AdvancedSetting.less'
import intlMsg from './AdvancedSettingIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option

const AdvancedSetting = React.createClass({
  loadSecrets() {
    const { currentCluster, getSecrets } = this.props
    getSecrets(currentCluster.clusterID)
  },
  getInitialState(){
    return {
      activeKey: null,
    }
  },
  componentWillReceiveProps(nextProps){
    let nextKey = nextProps.AdvancedSettingKey
    let currentKey = this.props.AdvancedSettingKey
    if((nextKey == '1' || currentKey == '1') && this.state.activeKey !== '1'){
      this.setState({
        activeKey: '1'
      })
    }
  },
  addEnvKey() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFieldsAndScroll } = form
    let envKeys = getFieldValue('envKeys') || []
    const validateFieldsKeys = []
    envKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`envName${keyValue}`)
      validateFieldsKeys.push(`envValue${keyValue}`)
    })
    validateFieldsAndScroll(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = envKeys[envKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      envKeys = envKeys.concat({ value: uid })
      setFieldsValue({
        envKeys,
      })
      setTimeout(()=>{
        let input = document.getElementById(`envName${uid}`)
        input && input.focus()
      },0)
    })
  },
  removeEnvKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    setFieldsValue({
      envKeys: envKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    })
  },
  checkEnv(currentKey, rule, value, callback) {
    if (!value) {
      return callback()
    }
    const { form, intl: { formatMessage } } = this.props
    const { setFieldsValue, getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    let errorMsg = appEnvCheck(value, formatMessage(intlMsg.envVar))
    if (this.existKey && this.existKey.value !== currentKey.value) {
      form.validateFields([ `envName${this.existKey.value}` ], { force: true })
      this.existKey = null
    }
    if (errorMsg === 'success') {
      let isExist = false
      envKeys.every(key => {
        if (currentKey.value !== key.value) {
          const envNameKey = `envName${key.value}`
          const envName = getFieldValue(envNameKey)
          if (envName === value) {
            isExist = true
            return false
          }
          return true
        }
        return true
      })
      if (isExist) {
        this.existKey = currentKey
        return callback(formatMessage(intlMsg.keyExist, { value }))
      }
      return callback()
    }
    callback(errorMsg)
  },
  checkEnvValue(rule, value, callback) {
    const { isTemplate, intl: { formatMessage } } = this.props
    if (isTemplate) { // 模版创建和模版修改的时候需要限制环境变量的取值
      const reg = /^[A-Za-z0-9_\-\/.:\s]*$/
      if (!reg.test(value)) {
        return callback(formatMessage(intlMsg.envValueReg))
      }
      return callback()
    }
    callback()
  },
  renderEnvItem(key) {
    if (key.deleted) {
      return
    }
    const { form, secretsOptions, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const keyValue = key.value
    const envNameKey = `envName${keyValue}`
    const envValueTypeKey = `envValueType${keyValue}`
    const envValueKey = `envValue${keyValue}`
    const envNameProps = getFieldProps(envNameKey, {
      rules: [
        { required: true, message: formatMessage(intlMsg.plsIptKey) },
        { validator: this.checkEnv.bind(this, key) },
      ],
    })
    const envValueTypeProps = getFieldProps(envValueTypeKey, {
      initialValue: 'normal',
        onChange: type => {
          resetFields([ envValueKey ])
          type === 'secret' && this.loadSecrets()
      },
    })
    const envValueProps = getFieldProps(envValueKey, {
      rules: [{
        validator: this.checkEnvValue,
      }]
    })
    const envValueType = getFieldValue(envValueTypeKey)
    const envValueInputClass = classNames({
      hide: envValueType !== 'normal',
    })
    const envValueSelectClass = classNames('ant-input-wrapper ant-input-group secret-form-item', {
      hide: envValueType !== 'secret',
    })
    const envValueSelectPodKey = classNames('ant-input-wrapper ant-input-group secret-form-item', {
      hide: envValueType !== 'Podkey',
    }) 
    const selectBefore = (
      <Select
        {...envValueTypeProps}
        style={{ width: 86 }}
        size="default"
      >
        <Option value="normal"><FormattedMessage {...intlMsg.normalVar}/></Option>
        <Option value="secret"><FormattedMessage {...intlMsg.cryptographicVar}/></Option>
        <Option value="Podkey"><FormattedMessage {...intlMsg.Podkey}/></Option>
      </Select>
    )
    return (
      <Row className="configItem" key={`configItem${keyValue}`}>
        <Col span={8}>
          <FormItem>
            <Input size="default" disabled={key.disabled} placeholder={formatMessage(intlMsg.plsIptKey)} {...envNameProps} />
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem className={envValueInputClass}>
            <Input
              size="default"
              disabled={key.disabled}
              placeholder={formatMessage(intlMsg.plsIptValue)}
              {...envValueProps}
              addonBefore={selectBefore}
            />
          </FormItem>
          <span className={envValueSelectClass}>
            <span className="ant-input-group-addon">
              {selectBefore}
            </span>
            <FormItem className="ant-input-group-cascader">
              <Cascader
                size="default"
                {...envValueProps}
                placeholder={formatMessage(intlMsg.plsSlcCryptoObj)}
                options={secretsOptions}
              />
            </FormItem>
          </span>
          <span className={envValueSelectPodKey}>
            <span className="ant-input-group-addon">
              {selectBefore}
            </span>
            <FormItem className="ant-input-group-cascader">
              <Select 
                defaultValue="PodIP"
                className="PodKeySelect"
                {...envValueProps}
              >
                <Option value="POD_IP">PodIP</Option>
                <Option value="POD_NAME">PodName</Option>
                <Option value="NODE_IP">NodeIP</Option>
                <Option value="POD_NAMESPACE">PodNamespace</Option>
              </Select>
            </FormItem>
          </span>
        </Col>
        <Col span={4}>
          <Tooltip title={formatMessage(intlMsg.delete)}>
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              onClick={this.removeEnvKey.bind(this, keyValue)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  collapseChange(key){
    this.setState({
      activeKey: key
    })
  },
  render() {
    const { formItemLayout, form, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title"><FormattedMessage {...intlMsg.envVar}/></span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc"><FormattedMessage {...intlMsg.uEditEnvVar}/></div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="advancedConfigureService">
        <Collapse onChange={this.collapseChange} activeKey={this.state.activeKey}>
          <Panel header={header} key="1">
            <Row>
              <Col span={formItemLayout.labelCol.span} className="formItemLabel">
                <FormattedMessage {...intlMsg.envVar}/>
                <div className="tips">
                  <FormattedMessage {...intlMsg.cryptographicVar}/>&nbsp;
                  <a>
                    <Tooltip title={formatMessage(intlMsg.cryptographicVarTip)}>
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </a>
                </div>
              </Col>
              <Col span={formItemLayout.wrapperCol.span}>
                <div className="envConfig">
                  <Row className="configHeader">
                    <Col span={8}>
                      <FormattedMessage {...intlMsg.key}/>
                    </Col>
                    <Col span={12}>
                      <FormattedMessage {...intlMsg.value}/>
                    </Col>
                    <Col span={4}>
                      <FormattedMessage {...intlMsg.act}/>
                    </Col>
                  </Row>
                  <div className="configBody">
                    {envKeys.map(this.renderEnvItem)}
                    <span className="addEnv" onClick={this.addEnvKey}>
                      <Icon type="plus-circle-o" />
                      <span><FormattedMessage {...intlMsg.addEnvVar}/></span>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, secrets } = state
  const { current } = entities
  const { cluster } = current
  let secretsList = secrets.list[cluster.clusterID] || {}
  secretsList = secretsList.data || []
  const secretsOptions = secretsList.map(secret => ({
    value: secret.name,
    label: secret.name,
    disabled: !secret.data,
    children: !secret.data
      ? []
      : Object.keys(secret.data).map(key => ({
        value: key,
        label: key,
      }))
  }))
  if (secretsOptions.length === 0) {
    secretsOptions.push({
      value: 'empty',
      label: props.intl.formatMessage(intlMsg.noCryptoObj),
      disabled: true,
    })
  }
  return {
    currentCluster: cluster,
    secretsList,
    secretsOptions,
  }
}

export default connect(mapStateToProps, {
  getSecrets,
})(injectIntl(AdvancedSetting, {
  withRef: true,
}))
