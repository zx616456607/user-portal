/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: secret config map setting for service
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Form, Collapse, Row, Col, Icon, Input, Select, Radio, Tooltip, Button,
  Checkbox,
} from 'antd'
import classNames from 'classnames'
import includes from 'lodash/includes'
import { getSecrets } from '../../../../../actions/secrets'
// import { getSecrets } from '../../../../../actions/secrets_devops'

import { checkVolumeMountPath } from '../../utils'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const PATH_REG = /^\//

const SecretsConfigMap = React.createClass({
  loadSecrets() {
    const { currentCluster, getSecrets } = this.props
    getSecrets(currentCluster.clusterID)
  },
  onIsWholeDirChange(keyValue, currentConfigGroup, e) {
    if (!currentConfigGroup) {
      return
    }
    const value = e.target.value
    e.target.checked = value
    this.handleSelectAll(keyValue, currentConfigGroup, e)
  },
  onConfigGroupChange(keyValue, value) {
    const { form, secretsList } = this.props
    const { getFieldValue } = form
    const secretConfigMapIsWholeDir = getFieldValue(`secretConfigMapIsWholeDir${keyValue}`)
    if (secretConfigMapIsWholeDir) {
      const currentConfigGroup = this.getConfigGroupByName(secretsList, value)
      this.handleSelectAll(keyValue, currentConfigGroup, { target: { checked: true } })
    }
  },
  getConfigGroupByName(secretsList, secretConfigGroupName) {
    let currentConfigGroup
    secretsList.every(item => {
      if (item.name === secretConfigGroupName) {
        currentConfigGroup = item
        return false
      }
      return true
    })
    return currentConfigGroup
  },
  checkPath(keyValue, rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if (!PATH_REG.test(value)) {
      return callback(intl.formatMessage(IntlMessage.plsEnterCorrectPath))
    }
    callback(checkVolumeMountPath(this.props.form, keyValue, value, 'secretConfigMap'))
  },
  renderConfigMapItem(key) {
    const { form, secretsList, defaultSelectValue, location, isTemplate, intl } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    const templateDeploy = location.query.template && !isTemplate
    const keyValue = key.value
    const secretConfigMapSubPathValuesKey = `secretConfigMapSubPathValues${keyValue}`
    if (key.deleted) {
      // fix issue http://jira.tenxcloud.com/browse/CRYSTAL-4604
      // set secretConfigMapSubPathValues to unrequired
      getFieldProps(secretConfigMapSubPathValuesKey)
      return
    }
    const secretConfigMapMountPathKey = `secretConfigMapMountPath${keyValue}`
    const secretConfigMapIsWholeDirKey = `secretConfigMapIsWholeDir${keyValue}`
    const secretConfigGroupNameKey = `secretConfigGroupName${keyValue}`
    const secretConfigGroupName = getFieldValue(secretConfigGroupNameKey)
    const secretConfigMapIsWholeDir = getFieldValue(secretConfigMapIsWholeDirKey)
    const currentConfigGroup = this.getConfigGroupByName(secretsList, secretConfigGroupName)
    let configMapSubPathOptions = []
    let subPathValue
    if (templateDeploy) {
      subPathValue = getFieldValue(secretConfigMapSubPathValuesKey)
      configMapSubPathOptions = subPathValue
    }
    if (currentConfigGroup) {
      configMapSubPathOptions = Object.keys(currentConfigGroup.data || {}).map(key => {
        return {
          label: key,
          value: key,
        }
      })
    }
    const secretConfigMapMountPathProps = getFieldProps(secretConfigMapMountPathKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseEnter, {
            item: intl.formatMessage(IntlMessage.mountDirectory),
            end: '',
          })
        },
        { validator: this.checkPath.bind(this, keyValue) },
      ],
    })
    const secretConfigMapIsWholeDirProps = getFieldProps(secretConfigMapIsWholeDirKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.coverageMethod),
          })
        },
      ],
      onChange: this.onIsWholeDirChange.bind(this, keyValue, currentConfigGroup),
    })
    const secretConfigGroupNameProps = getFieldProps(secretConfigGroupNameKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.configGroup),
          })
        }
      ],
      onChange: this.onConfigGroupChange.bind(this, keyValue),
      initialValue: defaultSelectValue
    })
    const secretConfigMapSubPathValuesProps = getFieldProps(secretConfigMapSubPathValuesKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.configGroupFile),
          })
        }
      ],
    })
    return (
      <Row className="configMapItem" key={`configMapItem${keyValue}`}>
        <Col span={5}>
          <FormItem>
            <Input
              type="textarea" size="default"
              placeholder={intl.formatMessage(IntlMessage.mountPathPlaceholder)}
              {...secretConfigMapMountPathProps}
            />
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem>
            <RadioGroup {...secretConfigMapIsWholeDirProps}>
              <Radio key="severalFiles" value={false}>
                {intl.formatMessage(IntlMessage.mountSeveralEncryptedFiles)}&nbsp;
                <Tooltip width="200px" title={intl.formatMessage(IntlMessage.mountEncryptedTooltip)}>
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
              <Radio key="wholeDir" value={true}>
                {intl.formatMessage(IntlMessage.mountConfigGroup)}&nbsp;
                <Tooltip width="200px" title={intl.formatMessage(IntlMessage.mountEncryptedTooltip)}>
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem>
            <Select placeholder={intl.formatMessage(IntlMessage.configGroup)} {...secretConfigGroupNameProps}>
              {
                secretsList.map(group =>
                  <Option
                    key={group.name}
                    disabled={!group.data || Object.keys(group.data).length === 0}
                  >
                    {group.name}
                  </Option>
                )
              }
            </Select>
          </FormItem>
        </Col>
        <Col span={5}>
          {
            !currentConfigGroup && !templateDeploy
            ? <FormItem>
                {intl.formatMessage(IntlMessage.pleaseSelect, {
                  item: intl.formatMessage(IntlMessage.configGroup),
                })}
              </FormItem>
            : (
              <div>
                <FormItem>
                  <Checkbox
                    onChange={this.handleSelectAll.bind(this, keyValue, currentConfigGroup)}
                    checked={this.getSelectAllChecked(keyValue, currentConfigGroup)}
                    disabled={secretConfigMapIsWholeDir}
                  >
                    {intl.formatMessage(IntlMessage.selectAll)}
                  </Checkbox>
                </FormItem>
                <FormItem>
                  <CheckboxGroup
                    {...secretConfigMapSubPathValuesProps}
                    options={configMapSubPathOptions}
                    disabled={secretConfigMapIsWholeDir}
                  />
                  <div className="clearBoth"></div>
                </FormItem>
              </div>
            )
          }
        </Col>
        <Col span={3}>
          <Tooltip title={intl.formatMessage(IntlMessage.delete)}>
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              onClick={this.removeConfigMapKey.bind(this, keyValue)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  addConfigMapKey() {
    this.loadSecrets()
    const { form, defaultSelectValue } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []
    const validateFieldsKeys = []
    secretConfigMapKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`secretConfigMapMountPath${keyValue}`)
      validateFieldsKeys.push(`secretConfigMapIsWholeDir${keyValue}`)
      validateFieldsKeys.push(`secretConfigGroupName${keyValue}`)
      const secretConfigGroupName = getFieldValue(`secretConfigGroupName${keyValue}`)
      if (secretConfigGroupName) {
        validateFieldsKeys.push(`secretConfigMapSubPathValues${keyValue}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = secretConfigMapKeys[secretConfigMapKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      secretConfigMapKeys = secretConfigMapKeys.concat({ value: uid })
      setFieldsValue({
        secretConfigMapKeys,
        [`secretConfigMapIsWholeDir${uid}`]: false,
        [`secretConfigGroupName${uid}`]: defaultSelectValue
      })
    })
  },
  removeConfigMapKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, resetFields } = form
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []
    setFieldsValue({
      secretConfigMapKeys: secretConfigMapKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
          resetFields([
            `secretConfigMapMountPath${keyValue}`,
            `secretConfigMapIsWholeDir${keyValue}`,
            `secretConfigGroupName${keyValue}`,
            `secretConfigMapSubPathValues${keyValue}`,
          ])
        }
        return _key
      })
    })
  },
  handleSelectAll(keyValue, currentConfigGroup, e) {
    const { form } = this.props
    const { setFieldsValue } = form
    const checked = e.target.checked
    if (!checked) {
      setFieldsValue({
        [`secretConfigMapSubPathValues${keyValue}`]: [],
      })
      return
    }
    const secretConfigMapSubPathValues = Object.keys(currentConfigGroup.data || {})
    setFieldsValue({
      [`secretConfigMapSubPathValues${keyValue}`]: secretConfigMapSubPathValues,
    })
  },
  getSelectAllChecked(keyValue, currentConfigGroup) {
    const { form, location, isTemplate } = this.props
    const { getFieldValue } = form
    const templateDeploy = location.query.template && !isTemplate

    if (templateDeploy) {
      return true
    }
    if (!currentConfigGroup) {
      return false
    }
    const allConfigMapSubPathValues = Object.keys(currentConfigGroup.data || {})
    const secretConfigMapSubPathValues = getFieldValue(`secretConfigMapSubPathValues${keyValue}`) || []
    if (allConfigMapSubPathValues.length === secretConfigMapSubPathValues.length) {
      return true
    }
    return false
  },
  render() {
    const { formItemLayout, form, location, isTemplate, intl } = this.props
    const { getFieldValue, getFieldProps } = form
    getFieldProps('secretConfigMapKeys')
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []
    const templateDeploy = location.query.template && !isTemplate
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.configManage)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.secretConfigTip)}</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <Row className="secret-config-map">
        <Col span={formItemLayout.labelCol.span} className="formItemLabel">
          {intl.formatMessage(IntlMessage.secretConfig)}&nbsp;
          <a>
            <Tooltip title={intl.formatMessage(IntlMessage.secretConfigTooltip)}>
              <Icon type="question-circle-o" />
            </Tooltip>
          </a>
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <div className="configMap">
            <Row className="configMapHeader">
              <Col span={5}>
                {intl.formatMessage(IntlMessage.mountDirectory)}
              </Col>
              <Col span={6}>
                {intl.formatMessage(IntlMessage.coverageMethod)}
              </Col>
              <Col span={5}>
                {intl.formatMessage(IntlMessage.configGroup)}
              </Col>
              <Col span={5}>
                {intl.formatMessage(IntlMessage.secretFile)}
              </Col>
              <Col span={3}>
                {intl.formatMessage(IntlMessage.operate)}
              </Col>
            </Row>
            <div className="configMapBody">
              {secretConfigMapKeys.map(this.renderConfigMapItem)}
              <span className="addConfigMap" onClick={this.addConfigMapKey}>
                <Icon type="plus-circle-o" />
                <span>{intl.formatMessage(IntlMessage.addConfigDir)}</span>
              </span>
            </div>
          </div>
        </Col>
      </Row>
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
  let defaultSelectValue
  secretsList.every(secret => {
    if (secret.data && Object.keys(secret.data).length > 0) {
      defaultSelectValue = secret.name
      return false
    }
    return true
  })
  return {
    currentCluster: cluster,
    defaultSelectValue: defaultSelectValue,
    secretsList,
  }
}

export default connect(mapStateToProps, {
  getSecrets,
})(injectIntl(SecretsConfigMap, {
  withRef: true,
}))
