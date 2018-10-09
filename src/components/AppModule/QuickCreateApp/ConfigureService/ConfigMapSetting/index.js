/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: config map setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Form, Collapse, Row, Col, Icon, Input, Select, Radio, Tooltip, Button, Checkbox, Cascader
} from 'antd'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import { loadConfigGroup, configGroupName, checkConfigNameExistence } from '../../../../../actions/configs'
import { getSecrets } from '../../../../../actions/secrets'
import SecretsConfigMap from './Secrets'
import './style/ConfigMapSetting.less'
import {validateK8sResource} from "../../../../../common/naming_validation";
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../../constants'
import { checkVolumeMountPath } from '../../utils'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const PATH_REG = /^\//
const TEMPLATE_EDIT_HASH = '#edit-template';

const ConfigMapSetting = React.createClass({
  componentDidMount() {
    this.loadConfigGroups()
  },
  componentDidUpdate() {
    this.addClick()
  },
  loadConfigGroups() {
    const { currentCluster, loadConfigGroup } = this.props
    loadConfigGroup(currentCluster.clusterID)
  },
  addClick() {
    const { getFieldValue } = this.props.form
    let configMapKeys = getFieldValue('configMapKeys') || []
    let number = configMapKeys.length -1
    let picker = document.getElementsByClassName('ant-cascader-input')[number]
    if (picker) {
      picker.addEventListener('click',()=>{
        setTimeout(()=>{
          this.addSelectTitle(number)
        },0)
      })
    }
  },
  addSelectTitle(number) {
    const { intl } = this.props
    let selectBox = document.getElementsByClassName('ant-cascader-menus')[number]
    if (!selectBox) return
    if (!selectBox.getElementsByClassName('titleBox').length) {
      let titleBox = document.createElement('div')
      titleBox.setAttribute('class','titleBox')
      let labelBox = document.createElement('span')
      labelBox.innerHTML = intl.formatMessage(IntlMessage.configClassify)
      let groupBox = document.createElement('span')
      groupBox.innerHTML = intl.formatMessage(IntlMessage.configGroup)
      titleBox.appendChild(labelBox)
      titleBox.appendChild(groupBox)
      selectBox.insertBefore(titleBox,selectBox.childNodes[0])
    }
  },
  onIsWholeDirChange(keyValue, currentConfigGroup, e) {
    if (!currentConfigGroup) {
      return
    }
    const value = e.target.value
    e.target.checked = value
    this.handleSelectAll(keyValue, currentConfigGroup, e)
  },
  isGroupNameExists(value, key) {
    const { form } = this.props
    const { getFieldValue } = form
    const configMapKeys = getFieldValue('configMapKeys')
    if (isEmpty(configMapKeys)) {
      return false
    }
    return configMapKeys.filter(_key => _key.value !== key).some(_key => {
      const configGroupName = getFieldValue(`configGroupName${_key.value}`)
      if (!isEmpty(configGroupName) && value === configGroupName[1]) {
        return true
      }
      return false
    })
  },
  configGroupNameCheck(rule, value, callback, key) {
    const { currentCluster, checkConfigNameExistence, intl } = this.props
    const { clusterID } = currentCluster
    if (Array.isArray(value)) {
      const isExists = this.isGroupNameExists(value[1], key)
      if (isExists) {
        return callback(intl.formatMessage(IntlMessage.nameExisted, {
          item: intl.formatMessage(IntlMessage.configGroup),
        }))
      }
      return callback()
    }
    if (!value) {
      callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.configGroupName),
        end: '',
      }))
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback(intl.formatMessage(IntlMessage.configGroupLengthLimit))
      return
    }
    if(!/^[a-z]/.test(value)){
      callback(intl.formatMessage(IntlMessage.configGroupStartLimit))
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback(intl.formatMessage(IntlMessage.configGroupEndLimit))
      return
    }
    if (!validateK8sResource(value)) {
      callback(intl.formatMessage(IntlMessage.configGroupComposeLimit))
      return
    }
    clearTimeout(this.configGroupNameTimeout)
    this.configGroupNameTimeout = setTimeout(() => {
      checkConfigNameExistence(clusterID, value, {
        success: {
          func: res => {
            if (res.data.existence) {
              callback(intl.formatMessage(IntlMessage.nameExisted, {
                item: intl.formatMessage(IntlMessage.configGroup),
              }))
            } else {
              callback()
            }
          },
          isAsync: true
        },
        failed: {
          func: res => {
            callback(res.message.message || res.message)
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  onConfigGroupChange(keyValue, value) {
    const { form, configGroupList } = this.props
    const { getFieldValue } = form
    const configMapIsWholeDir = getFieldValue(`configMapIsWholeDir${keyValue}`)
    if (configMapIsWholeDir) {
      const currentConfigGroup = this.getConfigGroupByName(configGroupList, value [1])
      if (!currentConfigGroup) {
        return
      }
      this.handleSelectAll(keyValue, currentConfigGroup, { target: { checked: true } })
    }
  },
  getConfigGroupByName(configGroupList, configGroupName) {
    let currentConfigGroup
    configGroupList.every(item => {
      if (item.name === configGroupName) {
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
    callback(checkVolumeMountPath(this.props.form, keyValue, value, 'configMap'))
  },
  renderConfigMapItem(key) {
    const { form, configGroupList, selectOptions, defaultSelectValue, location, isTemplate, intl } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue, isFieldValidating, getFieldError } = form
    const templateDeploy = location.query.template && !isTemplate
    const keyValue = key.value
    const configMapSubPathValuesKey = `configMapSubPathValues${keyValue}`
    if (key.deleted) {
      // fix issue http://jira.tenxcloud.com/browse/CRYSTAL-4604
      // set configMapSubPathValues to unrequired
      getFieldProps(configMapSubPathValuesKey)
      return
    }
    const configMapMountPathKey = `configMapMountPath${keyValue}`
    const configMapIsWholeDirKey = `configMapIsWholeDir${keyValue}`
    const configGroupNameKey = `configGroupName${keyValue}`
    const configGroupName = getFieldValue(configGroupNameKey)
    const configMapErrorFields = getFieldValue('configMapErrorFields')
    const configMapIsWholeDir = getFieldValue(configMapIsWholeDirKey)
    const currentConfigGroup = this.getConfigGroupByName(configGroupList, configGroupName && configGroupName[1])
    const existentConfigMap = getFieldValue('existentConfigMap')
    let isExisted = false
    if (!isEmpty(existentConfigMap) && existentConfigMap.includes(configGroupName.toString())) {
      isExisted = true
    }
    let configMapSubPathOptions = []
    let subPathValue
    if (templateDeploy) {
      subPathValue = getFieldValue(configMapSubPathValuesKey)
      configMapSubPathOptions = subPathValue
    } else {
      if (currentConfigGroup) {
        configMapSubPathOptions = currentConfigGroup.configs.map(config => {
          return {
            label: config.name,
            value: config.name,
          }
        })
      }
    }
    const configMapMountPathProps = getFieldProps(configMapMountPathKey, {
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
    const configMapIsWholeDirProps = getFieldProps(configMapIsWholeDirKey, {
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
    const configGroupNameProps = getFieldProps(configGroupNameKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.configGroup)
          })
        },
        { validator: (rules, value, callback) => this.configGroupNameCheck(rules, value, callback, keyValue) }
      ],
      onChange: this.onConfigGroupChange.bind(this, keyValue),
      initialValue: defaultSelectValue
    })
    const configMapSubPathValuesProps = getFieldProps(configMapSubPathValuesKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.configGroupFile),
          })
        }
      ],
    })
    const isInput = templateDeploy && (!isEmpty(configMapErrorFields) && configMapErrorFields.includes(configGroupNameKey)) || isExisted
    return (
      <Row className="configMapItem" key={`configMapItem${keyValue}`}>
        <Col span={5}>
          <FormItem>
            <Input
              type="textarea" size="default"
              placeholder={intl.formatMessage(IntlMessage.mountPathPlaceholder)}
              {...configMapMountPathProps} disabled={templateDeploy}
            />
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem>
            <RadioGroup {...configMapIsWholeDirProps} disabled={templateDeploy}>
              <Radio key="severalFiles" value={false}>
                {intl.formatMessage(IntlMessage.mountSeveralFiles)}&nbsp;
                <Tooltip width="200px" title={intl.formatMessage(IntlMessage.mountSeveralTooltip)}>
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
              <Radio key="wholeDir" value={true}>
                {intl.formatMessage(IntlMessage.mountConfigGroup)}&nbsp;
                <Tooltip width="200px" title={intl.formatMessage(IntlMessage.mountConfigGroupTooltip)}>
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem
            hasFeedback={isInput && !!getFieldValue(configGroupNameKey)}
            help={isInput ?
              isFieldValidating(configGroupNameKey) ?
                `${intl.formatMessage(IntlMessage.validating)}...` :
                (getFieldError(configGroupNameKey) || []).join(', ') :
                (getFieldError(configGroupNameKey) || []).join(', ')
            }
          >
            {
              isInput
                ?
                <Input
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.configGroup),
                    end: '',
                  })}
                  {...configGroupNameProps}
                  disabled={isExisted}
                />
                :
                <Cascader
                  displayRender={label=> label.join('：')}
                  options={selectOptions}
                  placeholder={`${intl.formatMessage(IntlMessage.configClassify)}:${intl.formatMessage(IntlMessage.configGroup)}`}
                  {...configGroupNameProps}/>
            }
          </FormItem>
        </Col>
        <Col span={5}>
          {
            !currentConfigGroup && !templateDeploy
            ? <FormItem>{intl.formatMessage(IntlMessage.pleaseSelect, { item: intl.formatMessage(IntlMessage.configGroup)})}</FormItem>
            : (
              <div>
                <FormItem>
                  <Checkbox
                    onChange={this.handleSelectAll.bind(this, keyValue, currentConfigGroup)}
                    checked={this.getSelectAllChecked(keyValue, currentConfigGroup)}
                    disabled={templateDeploy}
                  >
                    {intl.formatMessage(IntlMessage.selectAll)}
                  </Checkbox>
                </FormItem>
                <FormItem>
                  <CheckboxGroup
                    {...configMapSubPathValuesProps}
                    options={configMapSubPathOptions}
                    disabled={templateDeploy}
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
              className={classNames("deleteBtn", {'hidden': templateDeploy})}
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
    const { form, defaultSelectValue } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let configMapKeys = getFieldValue('configMapKeys') || []
    const validateFieldsKeys = []
    configMapKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`configMapMountPath${keyValue}`)
      validateFieldsKeys.push(`configMapIsWholeDir${keyValue}`)
      validateFieldsKeys.push(`configGroupName${keyValue}`)
      const configGroupName = getFieldValue(`configGroupName${keyValue}`)
      if (configGroupName) {
        validateFieldsKeys.push(`configMapSubPathValues${keyValue}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      this.loadConfigGroups()
      const key = configMapKeys[configMapKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      configMapKeys = configMapKeys.concat({ value: uid })
      setFieldsValue({
        configMapKeys,
        [`configMapIsWholeDir${uid}`]: false,
        [`configGroupName${uid}`]: defaultSelectValue
      })
    })
  },
  removeConfigMapKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, resetFields } = form
    const configMapKeys = getFieldValue('configMapKeys') || []
    setFieldsValue({
      configMapKeys: configMapKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
          resetFields([
            `configMapMountPath${keyValue}`,
            `configMapIsWholeDir${keyValue}`,
            `configGroupName${keyValue}`,
            `configMapSubPathValues${keyValue}`,
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
        [`configMapSubPathValues${keyValue}`]: [],
      })
      return
    }
    const configMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    setFieldsValue({
      [`configMapSubPathValues${keyValue}`]: configMapSubPathValues,
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
    const allConfigMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    const configMapSubPathValues = getFieldValue(`configMapSubPathValues${keyValue}`) || []
    if (allConfigMapSubPathValues.length === configMapSubPathValues.length) {
      return true
    }
    return false
  },
  render() {
    const { formItemLayout, form, location, isTemplate, intl } = this.props
    const { getFieldValue, getFieldProps } = form
    getFieldProps('configMapKeys')
    const configMapKeys = getFieldValue('configMapKeys') || []

    const templateDeploy = location.query.template && !isTemplate

    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.configManage)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.configManageTip)}</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="configMapConfigureService">
        <Collapse>
          <Panel header={header}>
            <Row>
              <Col span={formItemLayout.labelCol.span} className="formItemLabel">
                {intl.formatMessage(IntlMessage.normalConfig)}
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
                      {intl.formatMessage(IntlMessage.configFiles)}
                    </Col>
                    <Col span={3} className={classNames({'hidden': templateDeploy})}>
                      {intl.formatMessage(IntlMessage.operate)}
                    </Col>
                  </Row>
                  <div className="configMapBody">
                    {configMapKeys.map(this.renderConfigMapItem)}
                    <span className={classNames("addConfigMap", {'hidden': templateDeploy})} onClick={this.addConfigMapKey}>
                      <Icon type="plus-circle-o" />
                      <span>{intl.formatMessage(IntlMessage.addConfigDir)}</span>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            <SecretsConfigMap
              form={form}
              formItemLayout={formItemLayout}
              {...{location, isTemplate}}
            />
          </Panel>
        </Collapse>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, configReducers } = state
  const { current } = entities
  const { cluster } = current
  const { configGroupList } = configReducers
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: [],
  }
  const { configGroup } = configGroupList[cluster.clusterID] || defaultConfigList
  let labels = []
  configGroup.length > 0 && configGroup.forEach(item => {
    if (item.annotations.length) {
      labels = labels.concat(item.annotations)
    } else if (!labels.includes('未分类配置组')) {
      labels = labels.concat(['未分类配置组'])
    }
  })
  let selectOptions = []
  for (let i = 0; i < labels.length; i++) {
    let count = 0
    let temp = labels[i]
    for (let j = 0; j < labels.length; j++) {
      if (temp === labels[j]) {
        count++
        labels[j] = -1
      }
    }
    if (temp !== -1) {
      selectOptions.push({
        value: temp,
        label: temp,
        count: count,
        title: temp
      })
    }
  }
  selectOptions.forEach(item => {
    let children = []
    configGroup.forEach(record => {
      if (includes(record.annotations,item.value) || (!record.annotations.length && item.value === '未分类配置组')) {
        children.push({
          value: record.name,
          label: record.name,
          disabled: record.size ? false : true,
          title: record.size ? record.name : '未包含任何配置文件'
        })
      }
    })
    Object.assign(item,{children})
  })
  let defaultSelectValue = []
  for (let i = 0; i < selectOptions.length; i++) {
    let flag = false
    let child = selectOptions[i].children
    for (let j = 0; j <child.length; j++) {
      if (!child.disabled) {
        defaultSelectValue.push(selectOptions[i].value,child[j].value)
        flag = true
      }
      if (flag) {
        break
      }
    }
    if (flag) {
      break
    }
  }
  return {
    currentCluster: cluster,
    configGroupList: (configGroupList[cluster.clusterID] ? configGroupList[cluster.clusterID].configGroup : []),
    selectOptions,
    defaultSelectValue
  }
}

export default connect(mapStateToProps, {
  loadConfigGroup,
  configGroupName,
  getSecrets,
  checkConfigNameExistence
})(injectIntl(ConfigMapSetting, {
  withRef: true,
}))
