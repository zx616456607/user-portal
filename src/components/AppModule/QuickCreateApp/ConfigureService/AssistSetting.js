/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: assist setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col, Input, Radio, Checkbox, Icon,
  Tooltip, Button,
} from 'antd'
import './style/AssistSetting.less'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group

const AssistSetting = React.createClass({
  getInitialState() {
    return {
      argsType: 'default',
    }
  },
  setArgsToDefault() {
    const { form, imageConfigs } = this.props
    const { setFieldsValue, getFieldValue } = form
    let { cmd } = imageConfigs
    const argsKeys = []
    const argsType = getFieldValue('argsType') || ''
    cmd = cmd || []
    cmd.forEach((args, index) => {
      argsKeys.push(index)
      const key = [ `args${index}_${argsType}` ]
      setFieldsValue({
        [key]: args,
      })
    })
    setFieldsValue({
      argsKeys,
      defaultArgsKeys: argsKeys,
    })
  },
  addArgs() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFieldsAndScroll } = form
    const argsType = getFieldValue('argsType') || ''
    let argsKeys = argsType === 'default' ? getFieldValue('defaultArgsKeys') || [] : getFieldValue('argsKeys') || []
    const validateFieldsKeys = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        validateFieldsKeys.push(`args${key.value}${argsType === 'default' ? '_' + argsType : ''}`)
      }
    })
    validateFieldsAndScroll(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = argsKeys[argsKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      argsKeys = argsKeys.concat({ value: uid })
      setFieldsValue({
        argsKeys,
      })
      setTimeout(()=> {
        document.getElementById(`args${uid}`).focus()
      },300)
    })
  },
  removeArgsKey(key) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const argsKeys = getFieldValue('argsKeys') || []
    setFieldsValue({
      argsKeys: argsKeys.map(_key => {
        if (_key.value === key) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    })
  },
  renderArgs() {
    // const { argsType } = this.state
    const { form, formItemLayout, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const argsType = getFieldValue('argsType') || ''
    const argsKeys = argsType === 'default' ? getFieldValue('defaultArgsKeys') || [] : getFieldValue('argsKeys') || []
    return argsKeys.map((key, index) => {
      if (key.deleted) {
        return null
      }
      const keyValue = key.value
      return (
        <Row key={`args${keyValue}${argsType === 'default' ? '_' + argsType : ''}`}>
          <Col span={formItemLayout.labelCol.span}></Col>
          <Col span={6}>
            <FormItem>
              <Input size="default" {...getFieldProps(`args${keyValue}${argsType === 'default' ? '_' + argsType : ''}`, {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage(IntlMessage.pleaseEnter, {
                      item: intl.formatMessage(IntlMessage.startCommand),
                      end: '',
                    }),
                  },
                ],
              })} disabled={argsType === 'default'}/>
            </FormItem>
          </Col>
          {
            (argsType !== 'default' && index > 0) && (
              <Col span={3} className="deleteArgs">
                <Tooltip title={intl.formatMessage(IntlMessage.delete)}>
                  <Button
                    type="dashed"
                    size="small"
                    onClick={this.removeArgsKey.bind(this, keyValue)}
                  >
                    <Icon type="delete" />
                  </Button>
                </Tooltip>
              </Col>
            )
          }
        </Row>
      )
    })
  },
  onArgsTypeChange(e) {
    const { form } = this.props
    const { setFieldsValue } = form
    const argsType = e.target.value
    this.setState({ argsType })
    setFieldsValue({
      argsType,
    })
  },
  render() {
    const { formItemLayout, form, intl } = this.props
    const { argsType } = this.state
    const { getFieldProps } = form
    const commandProps = getFieldProps('command')
    getFieldProps('defaultArgsKeys')
    const argsTypePorps = getFieldProps('argsType', {
      initialValue: 'default',
      onChange: e => this.setState({ argsType: e.target.value })
    })
    const imagePullPolicyProps = getFieldProps('imagePullPolicy', {
      initialValue: 'always',
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.plsSltImagePullPolicy)
        }
      ],
    })
    const timeZoneProps = getFieldProps('timeZone', {
      valuePropName: 'checked'
    })
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.assistSetting)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.assistSettingTip)}</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="assistConfigureService">
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label={intl.formatMessage(IntlMessage.entryPoint)}
              key="command"
            >
              <Input
                {...commandProps} size="large"
                placeholder={intl.formatMessage(IntlMessage.entryPointPlaceholder)}
              />
            </FormItem>
            <div className="args">
              <FormItem
                {...formItemLayout}
                label={intl.formatMessage(IntlMessage.startCommand)}
                key="args"
              >
                <RadioGroup {...argsTypePorps}>
                  <Radio value="default">{intl.formatMessage(IntlMessage.imageDefault)}</Radio>
                  <Radio value="DIY">{intl.formatMessage(IntlMessage.customize)}</Radio>
                </RadioGroup>
              </FormItem>
              <div className="argsList">
                {this.renderArgs()}
                {
                  argsType !== 'default' && (
                    <Row className="addArgs">
                      <Col span={formItemLayout.labelCol.span}></Col>
                      <Col>
                        <span onClick={this.addArgs}>
                          <Icon type="plus-circle-o" />
                          <span>{intl.formatMessage(IntlMessage.addStartCommand)}</span>
                        </span>
                      </Col>
                    </Row>
                  )
                }
              </div>
            </div>
            <FormItem
              {...formItemLayout}
              label={intl.formatMessage(IntlMessage.redeploy)}
              key="imagePullPolicy"
            >
              <RadioGroup {...imagePullPolicyProps}>
                <Radio value="IfNotPresent">{intl.formatMessage(IntlMessage.prioritizeLocalImage)}</Radio>
                <Radio value="Always">{intl.formatMessage(IntlMessage.pullCloudImage)}</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={intl.formatMessage(IntlMessage.timeZoneSetting)}
              key="timeZone"
              className="lastFormItem"
            >
              <Checkbox {...timeZoneProps}>{intl.formatMessage(IntlMessage.useHostTimeZone)}</Checkbox>
              <div className="tips">{intl.formatMessage(IntlMessage.timeZoneTip)}</div>
            </FormItem>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default injectIntl(AssistSetting, {
  withRef: true,
})
