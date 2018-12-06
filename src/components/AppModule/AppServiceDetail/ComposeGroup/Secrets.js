/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * service details: secret config map edit
 *
 * v0.1 - 2018-12-06
 * @author rensiwei
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Form, Row, Col, Icon, Input, Select, Radio, Tooltip, Button,
  Checkbox, Card,
} from 'antd'
import { updateServiceConfigGroup } from '../../../../actions/app_manage'
import { injectIntl } from 'react-intl'
import yaml from 'js-yaml'
import filter from 'lodash/filter'
import ServiceConfigMessage from '../../../../containers/Application/ServiceConfigIntl'
import './style/Config.less'
import Deployment from '../../../../../kubernetes/objects/deployment'
import NotificationHandler from '../../../../components/Notification'

const notification = new NotificationHandler()

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const PATH_REG = /^\//

class Secrets extends Component {
  state = {
    tempConfigs: [],
    btnLoading: false,
    isEdit: false,
  }
  componentDidMount() {
    const { service, secrets } = this.props
    const { volumes = [] } = service.spec.template.spec
    volumes.length > 0 && this.getSecretsConfigMap(secrets)
  }
  getSecretsConfigMap = (secretsList = []) => {
    const { service, form: { setFieldsValue } } = this.props
    const secretsConfigMap = []
    const { volumes = [] } = service.spec.template.spec
    volumes.forEach(v => {
      const { secret, name } = v
      if (secret) {
        const { secretName, items } = secret
        const volumeMount = filter(
          service.spec.template.spec.containers[0].volumeMounts,
          { name }
        )[0] || {}
        const currentSecret = filter(secretsList, { name: secretName })[0] || {}
        const currentSecretData = currentSecret.data || {}
        const config = {
          id: this.addIndex(),
          mountPath: volumeMount.mountPath,
          groupName: secretName,
        }
        if (items) {
          const configItems = items.map(({ key }) => ({
            key,
            value: currentSecretData[key],
          }))
          config.items = configItems
        }
        secretsConfigMap.push(config)
      }
    })
    this.setState({
      tempConfigs: secretsConfigMap,
    })
    setFieldsValue({
      secretConfigMapKeys: secretsConfigMap,
    })
    return secretsConfigMap
  }
  addIndex = () => {
    const { form: { setFieldsValue, getFieldValue } } = this.props
    const index = getFieldValue('index')
    const newIndex = index + 1
    setFieldsValue({
      index: newIndex,
    })
    return newIndex
  }
  onIsWholeDirChange = (i, currentConfigGroup, e) => {
    if (!currentConfigGroup) {
      return
    }
    const value = e.target.value
    e.target.checked = value
    this.handleSelectAll(i, currentConfigGroup, e)
  }
  onConfigGroupChange = (i, value) => {
    const { form, secretsList } = this.props
    const { getFieldValue } = form
    const secretConfigMapIsWholeDir = getFieldValue(`secretConfigMapIsWholeDir${i}`)
    if (secretConfigMapIsWholeDir) {
      const currentConfigGroup = this.getConfigGroupByName(secretsList, value)
      this.handleSelectAll(i, currentConfigGroup, { target: { checked: true } })
    }
  }
  getConfigGroupByName = (secretsList, secretConfigGroupName) => {
    let currentConfigGroup
    secretsList.every(item => {
      if (item.name === secretConfigGroupName) {
        currentConfigGroup = item
        return false
      }
      return true
    })
    return currentConfigGroup
  }
  checkPath = (keyValue, rule, value, callback) => {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if (!PATH_REG.test(value)) {
      return callback(intl.formatMessage(ServiceConfigMessage.plsEnterCorrectPath))
    }
    callback(this.checkVolumeMountPath(this.props.form, keyValue, value, 'secretConfigMap'))
  }

  checkVolumeMountPath = (form, index, value) => {
    const values = form.getFieldsValue()
    const {
      configMapKeys = [],
    } = values
    let error

    configMapKeys.every(item => {
      if (item.deleted) {
        return true
      }
      const id = item.id
      const configMapMountPath = values[`configMapMountPath${id}`]
      if ((id !== index) && value === configMapMountPath) {
        error = '已填写过该路径'
        return false
      }
      return true
    })
    return error
  }
  renderConfigMapItem = () => {
    const { form, secretsList, defaultSelectValue, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const { isEdit } = this.state
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []

    return secretConfigMapKeys.map(item => {
      const i = item.id
      const secretConfigMapSubPathValuesKey = `secretConfigMapSubPathValues${i}`
      if (item.deleted) {
        getFieldProps(secretConfigMapSubPathValuesKey)
        return
      }
      const secretConfigMapMountPathKey = `secretConfigMapMountPath${i}`
      const secretConfigMapIsWholeDirKey = `secretConfigMapIsWholeDir${i}`
      const secretConfigGroupNameKey = `secretConfigGroupName${i}`
      const secretConfigGroupName = getFieldValue(secretConfigGroupNameKey)
      // const secretConfigMapIsWholeDir = getFieldValue(secretConfigMapIsWholeDirKey)
      const currentConfigGroup = this.getConfigGroupByName(secretsList,
        secretConfigGroupName || item.groupName)
      const datas = currentConfigGroup ? Object.keys(currentConfigGroup.data || {}) : []
      let configMapSubPathOptions = []
      let isWhole = item.items && item.items.length
      if (currentConfigGroup) {
        configMapSubPathOptions = datas.map(key => {
          return {
            label: key,
            value: key,
          }
        })
      }
      if (isWhole) {
        for (let j = 0; j < datas.length; j++) {
          const temp = filter(item.items, { key: datas[j] })
          if (!temp) {
            isWhole = false
            break
          }
        }
      }
      const secretConfigMapMountPathProps = getFieldProps(secretConfigMapMountPathKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigMessage.pleaseEnter, {
              item: intl.formatMessage(ServiceConfigMessage.mountDirectory),
              end: '',
            }),
          },
          { validator: (rule, value, callback) => this.checkPath(i, rule, value, callback) },
        ],
        initialValue: item.mountPath,
      })
      const secretConfigMapIsWholeDirProps = getFieldProps(secretConfigMapIsWholeDirKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigMessage.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigMessage.coverageMethod),
            }),
          },
        ],
        onChange: e => this.onIsWholeDirChange(i, currentConfigGroup, e),
        initialValue: !!isWhole || false,
      })
      const secretConfigGroupNameProps = getFieldProps(secretConfigGroupNameKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigMessage.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigMessage.configGroup),
            }),
          },
        ],
        onChange: value => this.onConfigGroupChange(i, value),
        initialValue: item.groupName || defaultSelectValue,
      })
      const secretConfigMapSubPathValuesProps = getFieldProps(secretConfigMapSubPathValuesKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigMessage.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigMessage.configGroupFile),
            }),
          },
        ],
        onChange: arr => {
          this.props.form.setFieldsValue({
            [secretConfigMapIsWholeDirKey]: datas.length === arr.length,
          })
        },
        initialValue: item.items && item.items.length ? item.items.map(ii => ii.key) : [],
      })
      return (
        <Row className="configMapItem" key={`configMapItem${i}`}>
          <Col span={5}>
            <FormItem>
              <Input
                disabled={!isEdit}
                type="textarea" size="default"
                placeholder={intl.formatMessage(ServiceConfigMessage.mountPathPlaceholder)}
                {...secretConfigMapMountPathProps}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem>
              <RadioGroup
                disabled={!isEdit}
                {...secretConfigMapIsWholeDirProps}>
                <Radio key="severalFiles" value={false}>
                  {intl.formatMessage(ServiceConfigMessage.mountSeveralEncryptedFiles)}&nbsp;
                  <Tooltip width="200px" title={intl.formatMessage(ServiceConfigMessage.mountEncryptedTooltip)}>
                    <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                  </Tooltip>
                </Radio>
                <Radio key="wholeDir" value={true}>
                  {intl.formatMessage(ServiceConfigMessage.mountConfigGroup)}&nbsp;
                  <Tooltip width="200px" title={intl.formatMessage(ServiceConfigMessage.mountEncryptedTooltip)}>
                    <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                  </Tooltip>
                </Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem>
              <Select
                disabled={!isEdit}
                placeholder={intl.formatMessage(ServiceConfigMessage.configGroup)}
                {...secretConfigGroupNameProps}>
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
              !currentConfigGroup ?
                <FormItem>
                  {intl.formatMessage(ServiceConfigMessage.pleaseSelect, {
                    item: intl.formatMessage(ServiceConfigMessage.configGroup),
                  })}
                </FormItem>
                :
                (
                  <div>
                    <FormItem>
                      <Checkbox
                        disabled={!isEdit}
                        onChange={e => this.handleSelectAll(i, currentConfigGroup, e)}
                        checked={this.getSelectAllChecked(i, currentConfigGroup)}
                      >
                        {intl.formatMessage(ServiceConfigMessage.selectAll)}
                      </Checkbox>
                    </FormItem>
                    <FormItem>
                      <CheckboxGroup
                        disabled={!isEdit}
                        {...secretConfigMapSubPathValuesProps}
                        options={configMapSubPathOptions}
                      />
                      <div className="clearBoth"></div>
                    </FormItem>
                  </div>
                )
            }
          </Col>
          <Col span={3}>
            <Tooltip title={intl.formatMessage(ServiceConfigMessage.delete)}>
              <Button
                disabled={!isEdit}
                className="deleteBtn"
                type="dashed"
                size="small"
                onClick={this.removeConfigMapKey.bind(this, i)}
              >
                <Icon type="delete" />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      )
    })
  }
  addConfigMapKey = () => {
    const { form, defaultSelectValue } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []
    const validateFieldsKeys = []
    secretConfigMapKeys.forEach(item => {
      if (item.deleted) {
        return
      }
      const id = item.id
      validateFieldsKeys.push(`secretConfigMapMountPath${id}`)
      validateFieldsKeys.push(`secretConfigMapIsWholeDir${id}`)
      validateFieldsKeys.push(`secretConfigGroupName${id}`)
      const secretConfigGroupName = getFieldValue(`secretConfigGroupName${id}`)
      if (secretConfigGroupName) {
        validateFieldsKeys.push(`secretConfigMapSubPathValues${id}`)
      }
    })
    validateFields(validateFieldsKeys, errors => {
      if (errors) {
        return
      }
      const id = this.addIndex()
      setFieldsValue({
        secretConfigMapKeys: [].concat(secretConfigMapKeys, [{ id }]),
        [`secretConfigMapIsWholeDir${id}`]: false,
        [`secretConfigGroupName${id}`]: defaultSelectValue,
      })
    })
  }
  removeConfigMapKey = id => {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, resetFields } = form
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys') || []
    setFieldsValue({
      secretConfigMapKeys: secretConfigMapKeys.map(item => {
        if (item.id === id) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          item.deleted = true
          resetFields([
            `secretConfigMapMountPath${id}`,
            `secretConfigMapIsWholeDir${id}`,
            `secretConfigGroupName${id}`,
            `secretConfigMapSubPathValues${id}`,
          ])
        }
        return item
      }),
    })
  }
  handleSelectAll = (i, currentConfigGroup, e) => {
    const { form } = this.props
    const { setFieldsValue } = form
    const checked = e.target.checked
    if (!checked) {
      setFieldsValue({
        [`secretConfigMapSubPathValues${i}`]: [],
        [`secretConfigMapIsWholeDir${i}`]: checked,
      })
      return
    }
    const secretConfigMapSubPathValues = Object.keys(currentConfigGroup.data || {})
    setFieldsValue({
      [`secretConfigMapSubPathValues${i}`]: secretConfigMapSubPathValues,
      [`secretConfigMapIsWholeDir${i}`]: checked,
    })
  }
  getSelectAllChecked = (keyValue, currentConfigGroup) => {
    const { form } = this.props
    const { getFieldValue } = form

    if (!currentConfigGroup) {
      return false
    }
    const allConfigMapSubPathValues = Object.keys(currentConfigGroup.data || {})
    const secretConfigMapSubPathValues = getFieldValue(`secretConfigMapSubPathValues${keyValue}`) || []
    if (allConfigMapSubPathValues.length === secretConfigMapSubPathValues.length) {
      return true
    }
    return false
  }
  onSubmit = () => {
    const { form: { validateFields }, updateServiceConfigGroup, clusterID,
      service: { metadata: { name: serviceName } }, cb } = this.props
    validateFields((err, values) => {
      if (err) return
      const temp = this.getBody(values, serviceName)
      const volumes = temp.spec.template.spec.volumes
      const body = {
        spec: {
          template: {
            spec: {
              volumes: volumes ? volumes.map(item => {
                item.defaultMode = 420
                return item
              }) : [],
              containers: temp.spec.template.spec.containers,
            },
          },
        },
      }
      this.setState({
        btnLoading: true,
      }, () => {
        updateServiceConfigGroup(clusterID, 'Deployment', serviceName, yaml.dump(body), {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                notification.success('配置组修改成功')
                this.setState({
                  isEdit: false,
                })
                cb && cb()
              }
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              notification.warn('配置组修改失败')
            },
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
          },
        })
      })
    })
  }
  getBody = (values, serviceName) => {
    const { form: { getFieldValue }, service } = this.props
    const deployment = new Deployment(serviceName)
    deployment.spec.template.spec.containers = service.spec.template.spec.containers.map(item => {
      return {
        name: item.name,
        image: item.image,
        ports: item.ports,
        args: item.args,
        volumeMounts: [],
      }
    })
    const secretConfigMapKeys = getFieldValue('secretConfigMapKeys')
    // 设置加密配置目录
    const wholeDir = {}
    if (secretConfigMapKeys) {
      secretConfigMapKeys.map(item => {
        if (!item.deleted) {
          const id = item.id
          const secretConfigMapMountPath = values[`secretConfigMapMountPath${id}`]
          const secretConfigMapIsWholeDir = values[`secretConfigMapIsWholeDir${id}`]
          const secretConfigGroupName = values[`secretConfigGroupName${id}`]
          const secretConfigMapSubPathValues = values[`secretConfigMapSubPathValues${id}`]
          const volume = {
            name: `secret-volume-${id}`,
            secret: {
              secretName: secretConfigGroupName,
            },
          }
          Object.assign(wholeDir, {
            [volume.name]: secretConfigMapIsWholeDir,
          })
          volume.secret.items = (secretConfigMapSubPathValues || []).map(value => {
            return {
              key: value,
              path: value,
            }
          })
          const volumeMounts = []
          volumeMounts.push({
            name: `secret-volume-${id}`,
            mountPath: secretConfigMapMountPath,
            readOnly: true,
          })
          deployment.addContainerVolume(serviceName, volume, volumeMounts, true)
        }
        return item
      })
    }
    return deployment
  }
  reset = () => {
    const { form: { setFieldsValue, resetFields } } = this.props
    const { tempConfigs } = this.state
    resetFields()
    setFieldsValue({
      secretConfigMapKeys: tempConfigs || [],
    })
    this.setState({
      isEdit: false,
    })
  }
  render() {
    const { form, intl } = this.props
    const { getFieldProps } = form
    const { btnLoading, isEdit } = this.state
    getFieldProps('secretConfigMapKeys')
    getFieldProps('index', {
      initialValue: -1,
    })
    return (
      <Card className="secret-config-map">
        <Form>
          <div className="editBtn">
            <Button type="ghost" onClick={() => { this.setState({ isEdit: true }) }}>编辑</Button>
          </div>
          <Row>
            <Col span={24}>
              <div className="configMap">
                <Row className="configMapHeader">
                  <Col span={5}>
                    {intl.formatMessage(ServiceConfigMessage.mountDirectory)}
                  </Col>
                  <Col span={6}>
                    {intl.formatMessage(ServiceConfigMessage.coverageMethod)}
                  </Col>
                  <Col span={5}>
                    {intl.formatMessage(ServiceConfigMessage.configGroup)}
                  </Col>
                  <Col span={5}>
                    {intl.formatMessage(ServiceConfigMessage.secretFile)}
                  </Col>
                  <Col span={3}>
                    {intl.formatMessage(ServiceConfigMessage.operate)}
                  </Col>
                </Row>
                <div className="configMapBody">
                  { this.renderConfigMapItem() }
                  {
                    isEdit ?
                      <div>
                        <span className="addConfigMap" onClick={this.addConfigMapKey}>
                          <Icon type="plus-circle-o" />
                          <span>{intl.formatMessage(ServiceConfigMessage.addConfigDir)}</span>
                        </span>
                        <div className="editBtns">
                          <Button type="ghost" onClick={() => !btnLoading && this.reset()}>取消</Button>
                          <Button loading={btnLoading} type="primary" onClick={this.onSubmit}>保存</Button>
                        </div>
                      </div>
                      :
                      null
                  }
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }
}

const mapStateToProps = state => {
  const { entities, secrets } = state
  const { current } = entities
  const { cluster } = current
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
    clusterID: cluster.clusterID,
    defaultSelectValue,
    secretsList,
  }
}

export default connect(mapStateToProps, {
  updateServiceConfigGroup,
})(Form.create()(injectIntl(Secrets, {
  withRef: true,
})))
