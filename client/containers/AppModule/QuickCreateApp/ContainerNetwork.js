/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Container network
 *
 * @author zhangxuan
 * @date 2018-09-18
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Form, Collapse, Row, Col, Input, Button,
  Icon,
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import IntlMessage from '../../../../src/containers/Application/ServiceConfigIntl'
import { FormattedMessage } from 'react-intl'
import './style/ContainerNetwork.less'
import { IP_ALIASES, IP_REGEX, HOSTNAME_SUBDOMAIN } from '../../../../constants'
import FlowContainer from './FlowContainer'

const Panel = Collapse.Panel
const FormItem = Form.Item

let uidd = 0

const mapStateToProps = (state, { isTemplate, location }) => ({
  isTemplateDeploy: !isTemplate && location.query.template,
})
@connect(mapStateToProps)
export default class ContainerNetwork extends React.PureComponent {
  static propTypes = {
    forDetail: PropTypes.bool, // 是否用与服务详情页面
    intl: PropTypes.object, // 国际化
    form: PropTypes.object.isRequired,
    formItemLayout: PropTypes.object.isRequired, // 表单布局
    setParentState: PropTypes.func, // 更新父组件 state
  }
  state = {
    activeKey: null,
  }

  componentDidUpdate() {
    const { getFieldValue } = this.props.form
    const keys = getFieldValue('aliasesKeys')
    if (!isEmpty(keys)) {
      uidd = keys[keys.length - 1]
    }
  }

  componentWillUnmount() {
    uidd = 0
  }

  collapseChange = key => {
    this.setState({
      activeKey: key,
    })
  }

  isAliasesExist = (alases, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('aliasesKeys')
    if (isEmpty(keys)) {
      return false
    }
    return keys.filter(_key => _key !== key).some(_key => {
      const existAliases = getFieldValue(`hostAliases-${_key}`)
      if (existAliases === alases) {
        return true
      }
      return false
    })
  }

  hostAliasesCheck = (rules, value, callback, key) => {
    const { intl } = this.props
    if (value && value.length > 63) {
      return callback(intl.formatMessage(IntlMessage.hostAliasesLengthLimit))
    }
    if (this.isAliasesExist(value, key)) {
      return callback(intl.formatMessage(IntlMessage.hostAliasesExist))
    }
    callback()
  }

  addAliases = () => {
    const { form, setParentState } = this.props
    const { getFieldValue, validateFields, setFieldsValue } = form
    const aliasesKeys = getFieldValue('aliasesKeys')
    const validateArray = []
    !isEmpty(aliasesKeys) && aliasesKeys.forEach(key => {
      const ipHost = `ipHost-${key}`
      const hostAliases = `hostAliases-${key}`
      validateArray.push(ipHost, hostAliases)
    })
    setParentState && setParentState(true)
    validateFields(validateArray, errors => {
      if (errors) {
        return
      }
      uidd++
      setFieldsValue({
        aliasesKeys: aliasesKeys.concat(uidd),
      })
    })
  }

  removeItem = key => {
    const { setParentState, form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const aliasesKeys = getFieldValue('aliasesKeys')
    const setKeys = new Set(aliasesKeys)
    setParentState && setParentState(true)
    setKeys.delete(key)
    setFieldsValue({
      aliasesKeys: [ ...setKeys ],
    })
  }

  renderAliases = () => {
    const { form, intl, setParentState, isTemplateDeploy } = this.props
    const { getFieldValue, getFieldProps } = form
    const keys = getFieldValue('aliasesKeys')
    const originalAliasesKeys = getFieldValue('originalAliasesKeys')
    if (isEmpty(keys)) {
      return
    }
    // http://jira.tenxcloud.com/browse/KAN-689
    const disabledDelete = isTemplateDeploy && originalAliasesKeys && (keys.length === 1)
    return keys.map(key =>
      <Row className="aliases-list" type="flex" align="top" key={`aliases-${key}`}>
        <Col span={6}>
          <FormItem>
            <Input
              placeholder={intl.formatMessage(IntlMessage.ipHostPlaceholder)}
              {...getFieldProps(`ipHost-${key}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage(IntlMessage.ipHostIsRequired),
                }, {
                  pattern: IP_REGEX,
                  message: intl.formatMessage(IntlMessage.ipHostRegMeg),
                }],
                onChange: () => setParentState && setParentState(true),
              })}
            />
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem>
            <Input
              placeholder={intl.formatMessage(IntlMessage.hostAliasesPlaceholder)}
              {...getFieldProps(`hostAliases-${key}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  pattern: IP_ALIASES,
                  message: intl.formatMessage(IntlMessage.hostAliasesRegMeg),
                }, {
                  validator: (rules, value, callback) =>
                    this.hostAliasesCheck(rules, value, callback, key),
                }],
                onChange: () => setParentState && setParentState(true),
              })}
            />
          </FormItem>
        </Col>
        <Col span={4} offset={2}>
          <Button type="dashed" icon="delete" disabled={disabledDelete} onClick={() => this.removeItem(key)}/>
        </Col>
      </Row>
    )
  }

  hostnameCheck = (rules, value, callback) => {
    const { intl, isTemplateDeploy, form: { getFieldValue } } = this.props
    if (!value && isTemplateDeploy && getFieldValue('originalHostname')) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.hostName),
        end: '',
      }))
    }
    if (value && !HOSTNAME_SUBDOMAIN.test(value)) {
      return callback(intl.formatMessage(IntlMessage.hostnameRegMsg))
    }
    callback()
  }

  subdomainCheck = (rules, value, callback) => {
    const { intl, isTemplateDeploy, form: { getFieldValue } } = this.props
    if (!value && isTemplateDeploy && getFieldValue('originalSubdomain')) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.subdomain),
        end: '',
      }))
    }
    if (value && !HOSTNAME_SUBDOMAIN.test(value)) {
      return callback(intl.formatMessage(IntlMessage.subdomainRegMsg))
    }
    callback()
  }

  renderContent = () => {
    const { intl, formItemLayout, form, setParentState, isTemplateDeploy } = this.props
    const { getFieldProps } = form
    return <div className="container-network">
      <Row key="hostname" className="host-row">
        <Col className="formItemLabel label" span={formItemLayout.labelCol.span}>
          <div>{intl.formatMessage(IntlMessage.hostName)}</div>
          <div className="hintColor" style={{ fontSize: 12 }}>
            {intl.formatMessage(IntlMessage.setHostname)}
          </div>
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <FormItem>
            <Col span={6}>
              <FormItem>
                <Input
                  {...getFieldProps('hostname', {
                    rules: [{
                      validator: this.hostnameCheck,
                    }],
                    onChange: () => setParentState && setParentState(true),
                  })}
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: 'hostname',
                    end: '',
                  })}
                />
              </FormItem>
            </Col>
            <Col span={10} offset={2}>
              <FormItem
                style={{ lineHeight: '20px' }}
                label={intl.formatMessage(IntlMessage.subdomain)}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                <Input
                  {...getFieldProps('subdomain', {
                    rules: [{
                      validator: this.subdomainCheck,
                    }],
                    onChange: () => setParentState && setParentState(true),
                  })}
                  placeholder={intl.formatMessage(IntlMessage.subdomainPlaceholder)}
                />
              </FormItem>
            </Col>
          </FormItem>
        </Col>
      </Row>
      <Row key="hostAliases">
        <Col className="formItemLabel label" span={formItemLayout.labelCol.span}>
          <div>
            {intl.formatMessage(IntlMessage.setHostAliases)}
          </div>
          <div className="hintColor" style={{ fontSize: 12 }}>
            {intl.formatMessage(IntlMessage.hostAliasesTip)}
          </div>
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <Row className="container-network-header">
            <Col key="ip" span={6}>{intl.formatMessage(IntlMessage.ipHost)}</Col>
            <Col key="aliases" span={6}>{intl.formatMessage(IntlMessage.hostAliases)}</Col>
            <Col key="operate" span={4} offset={2}>{intl.formatMessage(IntlMessage.operate)}</Col>
          </Row>
          {this.renderAliases()}
        </Col>
        <Col span={formItemLayout.wrapperCol.span} offset={formItemLayout.labelCol.span}>
          <div className="addAliases" onClick={this.addAliases}>
            <Icon type="plus-circle-o" />
            {intl.formatMessage(IntlMessage.addHostAliases)}
          </div>
        </Col>
      </Row>
      <FlowContainer
        setParentState={this.props.setParentState}
        cluster={this.props.cluster}
        serviceDetail={this.props.serviceDetail}
        form={this.props.form}
        isTemplateDeploy={isTemplateDeploy}
      />
    </div>
  }
  render() {
    const { activeKey } = this.state
    const { formItemLayout, form, forDetail } = this.props
    const { getFieldProps } = form
    getFieldProps('aliasesKeys', {
      initialValue: [],
    })
    if (forDetail) {
      return this.renderContent()
    }
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"/>
            <span className="title"><FormattedMessage {...IntlMessage.containerNetwork}/></span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc"><FormattedMessage {...IntlMessage.containerNetworkTip}/></div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div className="container-network">
        <Collapse onChange={this.collapseChange} activeKey={activeKey}>
          <Panel header={header}>
            {this.renderContent()}
          </Panel>
        </Collapse>
      </div>
    )
  }
}
