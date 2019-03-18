/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * service details: config map edit
 *
 * v0.1 - 2018-12-05
 * @author rensiwei
 */

import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Row, Col, Button, Input, Form, Icon, Cascader, Radio, Tooltip, Checkbox, Card } from 'antd'
import NotificationHandler from '../../../../../src/components/Notification'
import ServiceConfigIntl from '../../../../../src/containers/Application/ServiceConfigIntl'
import { validateK8sResource } from '../../../../../src/common/naming_validation'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../../src/constants'
import { updateServiceConfigGroup } from '../../../../../src/actions/app_manage'
import Deployment from '../../../../../kubernetes/objects/deployment'
import { NO_CLASSIFY, CONFIGMAP_CLASSIFY_CONNECTION } from '../../../../../src/constants'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import yaml from 'js-yaml'
import './style/Config.less'

const notification = new NotificationHandler()

const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

class Config extends Component {
  state = {
    isEdit: false,
    btnLoading: false,
    tempConfigs: [],
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
  componentDidMount() {
    this.loadData()
  }
  loadData = () => {
    const { template, groupWithLabels,
      form: { setFieldsValue } } = this.props
    const config = []
    const volumes = template.spec.volumes
    let index = 0
    const container = template.spec.containers[0]
    // const configMapKeys = []

    if (volumes) {
      volumes.forEach(volume => {
        let labels = [] // 配置分类
        if (volume.configMap) { // 普通配置 反之加密配置
          const idx = Number(volume.name.split('-').pop())
          if (idx > index) {
            index = idx
          }
          groupWithLabels.map(item => {
            if (item.name === volume.configMap.name) {
              labels = item.annotations
            }
            return item
          })
          const volumeMount = filter(container.volumeMounts, { name: volume.name })[0]
          if (!volumeMount) return
          // configMapKeys.push({
          //   value: index,
          // })
          const label = labels[0] ? labels[0] : '未分类配置组'
          const group = volume.configMap.name
          const isHasSub = Boolean(volumeMount.subPath)
          config.push({
            id: volume.name.split('-').pop(),
            mountPath: isHasSub ? (() => {
              const temp = volumeMount.mountPath.split('/')
              temp.pop()
              return temp.join('/')
            })() : volumeMount.mountPath,
            isHasSub,
            group,
            file: volume.configMap.items,
            labels,
            defaultConfigName: [ label, group ],
          })
        }
        return volume
      })
    }
    this.setState({
      tempConfigs: config,
    })
    setFieldsValue({
      configMapKeys: config,
      index,
    })
  }
  getCurrConfigGroup = configGroupName => {
    let currentConfigGroup
    const { groupWithLabels } = this.props
    groupWithLabels.every(item => {
      if (item.name === configGroupName) {
        currentConfigGroup = item
        return false
      }
      return true
    })
    return currentConfigGroup
  }
  renderConfigMapItem = () => {
    const { intl, // onItemClick,
      selectOptions, defaultSelectValue,
      form: { getFieldProps, getFieldError, getFieldValue } } = this.props
    const { isEdit } = this.state
    const configMapKeys = getFieldValue('configMapKeys') || []
    return configMapKeys.map(item => {
      const i = item.id
      // if (item.deleted) return null
      const configMapMountPathKey = `configMapMountPath${i}` // 挂载目录
      const configMapIsWholeDirKey = `configMapIsWholeDir${i}` // 整体 局部
      const configGroupNameKey = `configGroupName${i}` // 配置组
      const configGroupName = getFieldValue(configGroupNameKey)
      const currentConfigGroup =
        this.getCurrConfigGroup((configGroupName && configGroupName[1]) || item.group)
      const configMapSubPathValuesKey = `configMapSubPathValues${i}`
      let configMapSubPathOptions = []
      if (currentConfigGroup) {
        configMapSubPathOptions = currentConfigGroup.configs.map(config => {
          return {
            label: config.name,
            value: config.name,
          }
        })
      }
      const configMapMountPathProps = getFieldProps(configMapMountPathKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigIntl.pleaseEnter, {
              item: intl.formatMessage(ServiceConfigIntl.mountDirectory),
              end: '',
            }),
          },
          { validator: (rule, value, callback) => this.checkPath(rule, value, callback, i) },
        ],
        initialValue: item.mountPath || '',
      })
      const configMapIsWholeDirProps = getFieldProps(configMapIsWholeDirKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigIntl.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigIntl.coverageMethod),
            }),
          },
        ],
        onChange: e => this.onIsWholeDirChange(i, currentConfigGroup, e),
        initialValue: item.isHasSub === true || item.isHasSub === false ?
          !item.isHasSub
          :
          undefined,
      })
      const configGroupNameProps = getFieldProps(configGroupNameKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigIntl.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigIntl.configGroup),
            }),
          },
          { validator: (rules, value, callback) =>
            this.configGroupNameCheck(rules, value, callback, i) },
        ],
        onChange: value => this.onConfigGroupChange(i, value),
        initialValue: item.defaultConfigName || defaultSelectValue,
      })
      const configMapSubPathValuesProps = getFieldProps(configMapSubPathValuesKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(ServiceConfigIntl.pleaseSelect, {
              item: intl.formatMessage(ServiceConfigIntl.configGroupFile),
            }),
          },
        ],
        initialValue: item.file && item.file.length ? item.file.map(file => file.path) : [],
      })
      return <div className={item.deleted ? 'hide' : ''}>
        <Row className="configMapItem" key={`configMapItem${i}`}>
          <Col span={5}>
            <FormItem>
              <Input
                disabled={!isEdit}
                type="textarea" size="default"
                placeholder={intl.formatMessage(ServiceConfigIntl.mountPathPlaceholder)}
                {...configMapMountPathProps}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem>
              <RadioGroup disabled={!isEdit} {...configMapIsWholeDirProps}>
                <Radio key="severalFiles" value={false}>
                  {intl.formatMessage(ServiceConfigIntl.mountSeveralFiles)}&nbsp;
                  <Tooltip width="200px" title={intl.formatMessage(ServiceConfigIntl.mountSeveralTooltip)}>
                    <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                  </Tooltip>
                </Radio>
                <Radio key="wholeDir" value={true}>
                  {intl.formatMessage(ServiceConfigIntl.mountConfigGroup)}&nbsp;
                  <Tooltip width="200px" title={intl.formatMessage(ServiceConfigIntl.mountConfigGroupTooltip)}>
                    <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                  </Tooltip>
                </Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem
              help={(getFieldError(configGroupNameKey) || []).join(', ')}
            >
              {
                <Cascader
                  disabled={!isEdit}
                  displayRender={label => label.join('：')}
                  options={selectOptions}
                  placeholder={`${intl.formatMessage(ServiceConfigIntl.configClassify)}:${intl.formatMessage(ServiceConfigIntl.configGroup)}`}
                  {...configGroupNameProps}/>
              }
            </FormItem>
          </Col>
          <Col span={5}>
            {
              !currentConfigGroup ?
                <FormItem>
                  {intl.formatMessage(ServiceConfigIntl.pleaseSelect,
                    { item: intl.formatMessage(ServiceConfigIntl.configGroup) }
                  )}
                </FormItem>
                :
                (
                  <div>
                    <FormItem>
                      <span>
                        <Checkbox
                          onChange={e => this.handleSelectAll(i, currentConfigGroup, e)}
                          checked={this.getSelectAllChecked(i, currentConfigGroup)}
                          disabled={!isEdit}
                        >
                          {intl.formatMessage(ServiceConfigIntl.selectAll)}
                        </Checkbox>
                      </span>
                    </FormItem>
                    <FormItem>
                      <CheckboxGroup
                        {...configMapSubPathValuesProps}
                        options={configMapSubPathOptions}
                        disabled={!isEdit}
                      />
                      <div className="clearBoth"></div>
                    </FormItem>
                  </div>
                )
            }
          </Col>
          <Col span={3}>
            <Tooltip title={intl.formatMessage(ServiceConfigIntl.delete)}>
              <Button
                className="deleteBtn"
                type="dashed"
                size="small"
                onClick={() => this.removeConfigMapKey(i)}
                disabled={!isEdit}
              >
                <Icon type="delete" />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </div>
    })
  }
  checkPath(rule, value, callback, i) {
    const { intl, form } = this.props
    if (!value) {
      return callback()
    }
    if (!/^\//.test(value)) {
      return callback(intl.formatMessage(ServiceConfigIntl.plsEnterCorrectPath))
    }
    callback(this.checkVolumeMountPath(form, i, value))
  }
  checkVolumeMountPath = (form, index, value) => {
    const values = form.getFieldsValue()
    const {
      configMapKeys = [],
    } = values
    let error

    // 1.检查配置文件路径
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
  onIsWholeDirChange = (i, currentConfigGroup, e) => {
    if (!currentConfigGroup) {
      return
    }
    const value = e.target.value
    e.target.checked = value
    this.handleSelectAll(i, currentConfigGroup, e)
  }
  isGroupNameExists = (value, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const configMapKeys = getFieldValue('configMapKeys')
    if (isEmpty(configMapKeys)) {
      return false
    }
    return configMapKeys.filter(_key => _key.id !== key).some(_key => {
      const configGroupName = getFieldValue(`configGroupName${_key.id}`)
      if (!isEmpty(configGroupName) && value === configGroupName[1] && !_key.deleted) {
        return true
      }
      return false
    })
  }
  configGroupNameCheck(rule, value, callback, i) {
    const { checkConfigNameExistence, intl, clusterID } = this.props
    if (Array.isArray(value)) {
      const isExists = this.isGroupNameExists(value[1], i)
      if (isExists) {
        return callback(intl.formatMessage(ServiceConfigIntl.nameExisted, {
          item: intl.formatMessage(ServiceConfigIntl.configGroup),
        }))
      }
      return callback()
    }
    if (!value) {
      callback(intl.formatMessage(ServiceConfigIntl.pleaseEnter, {
        item: intl.formatMessage(ServiceConfigIntl.configGroupName),
        end: '',
      }))
      return
    }
    if (value.length < 3 || value.length > 63) {
      callback(intl.formatMessage(ServiceConfigIntl.configGroupLengthLimit))
      return
    }
    if (!/^[a-z]/.test(value)) {
      callback(intl.formatMessage(ServiceConfigIntl.configGroupStartLimit))
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback(intl.formatMessage(ServiceConfigIntl.configGroupEndLimit))
      return
    }
    if (!validateK8sResource(value)) {
      callback(intl.formatMessage(ServiceConfigIntl.configGroupComposeLimit))
      return
    }
    clearTimeout(this.configGroupNameTimeout)
    this.configGroupNameTimeout = setTimeout(() => {
      checkConfigNameExistence(clusterID, value, {
        success: {
          func: res => {
            if (res.data.existence) {
              callback(intl.formatMessage(ServiceConfigIntl.nameExisted, {
                item: intl.formatMessage(ServiceConfigIntl.configGroup),
              }))
            } else {
              callback()
            }
          },
          isAsync: true,
        },
        failed: {
          func: res => {
            callback(res.message.message || res.message)
          },
          isAsync: true,
        },
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  removeConfigMapKey = i => {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const configMapKeys = getFieldValue('configMapKeys') || []
    setFieldsValue({
      configMapKeys: configMapKeys.map(item => {
        if (item.id === i) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          item.deleted = true
          // resetFields([
          //   `configMapMountPath${i}`,
          //   `configMapIsWholeDir${i}`,
          //   `configGroupName${i}`,
          //   `configMapSubPathValues${i}`,
          // ])
        }
        return item
      }),
    })
  }

  getSelectAllChecked = (i, currentConfigGroup) => {
    const { form } = this.props
    const { getFieldValue } = form
    if (!currentConfigGroup) {
      return false
    }
    const allConfigMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    const configMapSubPathValues = getFieldValue(`configMapSubPathValues${i}`) || []
    if (allConfigMapSubPathValues.length === configMapSubPathValues.length) {
      return true
    }
    return false
  }
  onConfigGroupChange = (i, value) => {
    const { form, groupWithLabels } = this.props
    const { getFieldValue } = form
    const configMapIsWholeDir = getFieldValue(`configMapIsWholeDir${i}`)
    const currentConfigGroup = filter(groupWithLabels, { name: value })[0]
    if (configMapIsWholeDir) {
      if (!currentConfigGroup) {
        return
      }
      this.handleSelectAll(i, currentConfigGroup, { target: { checked: true } })
    }
  }
  handleSelectAll = (i, currentConfigGroup, e) => {
    const { form } = this.props
    const { setFieldsValue } = form
    const checked = e.target.checked
    if (!checked) {
      setFieldsValue({
        [`configMapSubPathValues${i}`]: [],
      })
      return
    }
    const configMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    setFieldsValue({
      [`configMapSubPathValues${i}`]: configMapSubPathValues,
    })
  }
  addConfig = () => {
    const { form, defaultSelectValue } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    const configMapKeys = getFieldValue('configMapKeys') || []
    const validateFieldsKeys = []
    configMapKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const i = key.id
      validateFieldsKeys.push(`configMapMountPath${i}`)
      validateFieldsKeys.push(`configMapIsWholeDir${i}`)
      validateFieldsKeys.push(`configGroupName${i}`)
      const configGroupName = getFieldValue(`configGroupName${i}`)
      if (configGroupName) {
        validateFieldsKeys.push(`configMapSubPathValues${i}`)
      }
    })
    validateFields(validateFieldsKeys, errors => {
      if (errors) {
        return
      }
      const id = this.addIndex()
      setFieldsValue({
        configMapKeys: [].concat(configMapKeys, [{ id }]),
        [`configMapIsWholeDir${id}`]: false,
        [`configGroupName${id}`]: defaultSelectValue,
      })
    })
  }
  onSubmit = () => {
    const { form: { validateFields, getFieldValue, getFieldsValue },
      updateServiceConfigGroup, clusterID,
      service: { metadata: { name: serviceName } }, cb } = this.props
    const arr = []
    const configMapKeys = getFieldValue('configMapKeys') || []
    configMapKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const i = key.id
      arr.push(`configMapMountPath${i}`)
      arr.push(`configMapIsWholeDir${i}`)
      arr.push(`configGroupName${i}`)
      const configGroupName = getFieldValue(`configGroupName${i}`)
      if (configGroupName) {
        arr.push(`configMapSubPathValues${i}`)
      }
    })
    validateFields(arr, err => {
      if (err) return
      const values = getFieldsValue()
      const temp = this.getBody(values, serviceName)
      const volumes = temp.spec.template.spec.volumes
      temp.spec.template.spec.containers.forEach(item => {
        delete item.args
      })
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
                this.loadData()
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
    const configMapKeys = getFieldValue('configMapKeys')
    // 设置普通配置目录
    const wholeDir = {}
    if (configMapKeys) {
      configMapKeys.forEach(item => {
        // if (item.deleted !== true) {
        const id = item.id
        const configMapMountPath = values[`configMapMountPath${id}`] || ''
        const configMapIsWholeDir = values[`configMapIsWholeDir${id}`] || ''
        const configGroupName = values[`configGroupName${id}`] || ''
        const configMapSubPathValues = values[`configMapSubPathValues${id}`] || ''
        let volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${id}`
        if (Array.isArray(configGroupName)) {
          if (configGroupName[0] !== '未分类配置组') {
            volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${id}`
          }
        } else {
          volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${id}`
        }
        const volume = {
          name: volumeName,
          configMap: {
            name: Array.isArray(configGroupName) ? configGroupName[1] : configGroupName,
            items: configMapSubPathValues ? configMapSubPathValues.map(value => {
              return {
                key: value,
                path: value,
              }
            }) : [],
          },
        }
        if (item.deleted) {
          volume.$patch = 'delete'
        }
        const volumeMounts = []
        if (configMapIsWholeDir) {
          Object.assign(wholeDir, {
            [volumeName]: true,
          })
          const temp = {
            mountPath: configMapMountPath,
          }
          if (item.deleted) {
            temp.$patch = 'delete'
          }
          volumeMounts.push(temp)
        } else {
          Object.assign(wholeDir, {
            [volumeName]: false,
          })
          configMapSubPathValues.map(value => {
            const temp = {
              name: volumeName,
              mountPath: configMapMountPath +
              (configMapMountPath.endsWith('/') ? '' : '/') + value,
              subPath: value,
            }
            if (item.deleted) {
              temp.$patch = 'delete'
            }
            volumeMounts.push(temp)
            return value
          })
        }
        deployment.addContainerVolume(serviceName, volume, volumeMounts, configMapIsWholeDir)
        // }
      })
    }
    return deployment
  }
  reset = () => {
    const { form: { setFieldsValue, resetFields } } = this.props
    const { tempConfigs } = this.state
    resetFields()
    setFieldsValue({
      configMapKeys: tempConfigs || [],
    })
    this.setState({
      isEdit: false,
    })
  }
  render() {
    const { intl, form } = this.props
    const { getFieldProps } = form
    const { isEdit, btnLoading } = this.state
    getFieldProps('configMapKeys')
    getFieldProps('index', { initialValue: 0 })
    return (
      <Card className="composegroup_config">
        <Form>
          <div className="editBtn">
            <Button type="ghost" onClick={() => { this.setState({ isEdit: true }) }}>编辑</Button>
          </div>
          <Row className="configMapHeader">
            <Col span={5}>
              {intl.formatMessage(ServiceConfigIntl.mountDirectory)}
            </Col>
            <Col span={6}>
              {intl.formatMessage(ServiceConfigIntl.coverageMethod)}
            </Col>
            <Col span={5}>
              {intl.formatMessage(ServiceConfigIntl.configGroup)}
            </Col>
            <Col span={5}>
              {intl.formatMessage(ServiceConfigIntl.configFiles)}
            </Col>
            <Col span={3}>
              {intl.formatMessage(ServiceConfigIntl.operate)}
            </Col>
          </Row>
          <div className="configMapBody">
            {
              this.renderConfigMapItem()
            }
            {
              isEdit ?
                <div>
                  <span className="addConfigMap" onClick={this.addConfig}>
                    <Icon type="plus-circle-o" />
                    <span>{intl.formatMessage(ServiceConfigIntl.addConfigDir)}</span>
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
        </Form>
      </Card>
    )
  }
}

const mapStateToProps = state => {
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
      labels = labels.concat([ '未分类配置组' ])
    }
  })
  const selectOptions = []
  for (let i = 0; i < labels.length; i++) {
    let count = 0
    const temp = labels[i]
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
        count,
        title: temp,
      })
    }
  }
  selectOptions.forEach(item => {
    const children = []
    configGroup.forEach(record => {
      if (includes(record.annotations, item.value) || (!record.annotations.length && item.value === '未分类配置组')) {
        children.push({
          value: record.name,
          label: record.name,
          disabled: !record.size,
          title: record.size ? record.name : '未包含任何配置文件',
        })
      }
    })
    Object.assign(item, { children })
  })
  const defaultSelectValue = []
  for (let i = 0; i < selectOptions.length; i++) {
    let flag = false
    const child = selectOptions[i].children
    for (let j = 0; j < child.length; j++) {
      if (!child.disabled) {
        defaultSelectValue.push(selectOptions[i].value, child[j].value)
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
    clusterID: cluster.clusterID,
    selectOptions,
    defaultSelectValue,
  }
}

export default connect(mapStateToProps, {
  updateServiceConfigGroup,
})(Form.create()(injectIntl(Config, {
  withRef: true,
})))
