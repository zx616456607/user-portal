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

const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option

const AdvancedSetting = React.createClass({
  componentWillMount() {
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
  checkEnv(rule, value, callback) {
    if (!value) {
      return callback()
    }
    let errorMsg = appEnvCheck(value, '环境变量');
    if (errorMsg === 'success') {
      return callback()
    }
    callback(errorMsg)
  },
  renderEnvItem(key) {
    if (key.deleted) {
      return
    }
    const { form, secretsOptions } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const keyValue = key.value
    const envNameKey = `envName${keyValue}`
    const envValueTypeKey = `envValueType${keyValue}`
    const envValueKey = `envValue${keyValue}`
    const envNameProps = getFieldProps(envNameKey, {
      rules: [
        { required: true, message: '请填写键' },
        { validator: this.checkEnv },
      ],
    })
    const envValueTypeProps = getFieldProps(envValueTypeKey, {
       initialValue: 'normal',
       onChange: () => resetFields([ envValueKey ]),
    })
    const envValueProps = getFieldProps(envValueKey, {
       rules: [
         { required: true, message: '请填写值' }
       ],
    })
    const envValueType = getFieldValue(envValueTypeKey)
    const envValueInputClass = classNames({
      hide: envValueType !== 'normal',
    })
    const envValueSelectClass = classNames('ant-input-wrapper ant-input-group', {
      hide: envValueType !== 'secret',
    })
    const selectBefore = (
      <Select
        {...envValueTypeProps}
        style={{ width: 80 }}
        size="default"
      >
        <Option value="normal">普通变量</Option>
        <Option value="secret">加密变量</Option>
      </Select>
    )
    return (
      <Row className="configItem" key={`configItem${keyValue}`}>
        <Col span={8}>
          <FormItem>
            <Input size="default" disabled={key.disabled} placeholder="请填写键" {...envNameProps} />
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem>
            <span className={envValueInputClass}>
              <Input
                size="default"
                disabled={key.disabled}
                placeholder="请填写值"
                {...envValueProps}
                addonBefore={selectBefore}
              />
            </span>
            <span className={envValueSelectClass}>
              <span className="ant-input-group-addon">
                {selectBefore}
              </span>
              <Cascader
                {...envValueProps}
                placeholder="请选择加密对象"
                options={secretsOptions}
              />
            </span>
          </FormItem>
        </Col>
        <Col span={4}>
          <Tooltip title="删除">
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
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    const envKeys = getFieldValue('envKeys') || []
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">环境变量</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">您可以在这里修改环境变量配置</div>
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
                环境变量
                <div className="tips">
                  加密变量&nbsp;
                  <a>
                    <Tooltip title="加密变量将通过读取加密配置 Secret 的方式，将需要加密的变量映射至对应键，如：变量键为 DB_PASSWD 值选择加密变量 Token/passwd 则映射结果为 DB_PASSWD:[Token/passwd 的值]">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </a>
                </div>
              </Col>
              <Col span={formItemLayout.wrapperCol.span}>
                <div className="envConfig">
                  <Row className="configHeader">
                    <Col span={8}>
                      键
                    </Col>
                    <Col span={12}>
                      值
                    </Col>
                    <Col span={4}>
                      操作
                    </Col>
                  </Row>
                  <div className="configBody">
                    {envKeys.map(this.renderEnvItem)}
                    <span className="addEnv" onClick={this.addEnvKey}>
                      <Icon type="plus-circle-o" />
                      <span>添加环境变量</span>
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
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: [],
  }
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
  return {
    currentCluster: cluster,
    secretsList,
    secretsOptions,
  }
}

export default connect(mapStateToProps, {
  getSecrets,
})(AdvancedSetting)
