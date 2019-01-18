/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 13th 2018
 */
import * as React from 'react'
import { Form, Button, Select, Modal, Input, Card, Row, Col, Icon,
  Checkbox, notification } from 'antd'
// import { getClusterQuotaList, getGlobaleQuotaList, getDevopsGlobaleQuotaList } from '../../../../../src/actions/quota'
import * as quotaActions from '../../../../../src/actions/quota'
// import { getProjectVisibleClusters } from '../../../../../src/actions/project'
import * as projectActions from '../../../../../src/actions/project'
// import { applayResourcequota } from '../../../../../client/actions/applyLimit'
import * as applyLimitActions from '../../../../../client/actions/applyLimit'
import './style/index.less'
import { connect } from 'react-redux'
// import { REG } from '../../../../../src/constants'
import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
// import { getResourceDefinition } from '../../../../../src/actions/quota'
import QueueAnim from 'rc-queue-anim'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
// import { getProjectVisibleClusters } from '../../../../../src/actions/project'
// import { templateNameCheck } from '../../../../../src/common/naming_validation'
// const Option = Select.Option
// const OptGroup = Select.OptGroup

const createForm = Form.create
const FormItem = Form.Item

// 表单格式
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 11 },
}
const formItemLayoutLarge = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
}
// 表单验证定制函数
const rulesFormat = message => {
  const rule = [{
    required: true,
    whitespace: true,
    message,
  }]
  return rule
}

// 表单强制验证函数
const forceVerification = ({ getFieldsValue, validateFields }) => {
  const newforceUpdateAggregate = []
  const formVlaue = getFieldsValue()
  const forceUpdate = formVlaue.keys.map(value => {
    return `resource${value}`
  })
  formVlaue.keys.forEach(valueItem => {
    if (Object.keys(formVlaue).includes(`aggregate${valueItem}`)) {
      newforceUpdateAggregate.push(`aggregate${valueItem}`)
    }
  })
  validateFields(forceUpdate, { force: true })
  if (!isEmpty(newforceUpdateAggregate)) {
    validateFields(newforceUpdateAggregate, { force: true })
  }
}

// 如果当前资源为全局资源则返回ture, 如果不是则返回false
const findAllresource = (key, globalResource) => {
  let flag = false
  for (const o of Object.values(globalResource)) {
    if (o === key) {
      flag = true
    }
  }
  return flag
}

// 将可选择集群整理成jsx
const fromatChoiceClusters = choiceClusters => {
  if (!isEmpty(choiceClusters) && !isEmpty(choiceClusters.data)) {
    return choiceClusters.data.map(o => {
      return (
        <Select.Option value={o.clusterID} key={o.clusterName}>{o.clusterName}</Select.Option>
      )
    })
  }
  return null

}
// // 根据集群名称查询集群id
// const findChoiceClusersId = (name, choiceClusters) => {
//   if (!isEmpty(choiceClusters) && !isEmpty(choiceClusters.data)) {
//     for (const o of choiceClusters.data) {

//       if (o.clusterName === name) {
//         return o.clusterID
//       }
//     }
//   }
// }
const filterKey = [ 'cpu', 'memory', 'storage' ]
const setFormItem = ({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
  checkResourceKindState, choiceClusters, getClusterQuotaListSelect, definitions,
  self }) => {
  // console.log('checkResourceKindState', checkResourceKindState)
  // const { getFieldsValue } = self.props.form
  // console.log('getFieldsValue', getFieldsValue())
  const { personNamespace, resourceType, clusterIDParams } = self.props
  const { globalResource } = self.state
  if (resourceType !== undefined && globalResource !== undefined &&
     checkResourceKindState[0] === undefined) {
    checkResourceKind(resourceType, 0)
  }
  const cluserIndex = (getFieldValue('item') === personNamespace || getFieldValue('item') === '我的个人项目')
    ? 'default' : getFieldValue('item')
  getFieldProps('keys', {
    initialValue: [ 0 ],
  })
  const formItem = getFieldValue('keys').map((k, index) => {
    // const clusterID = getFieldValue(`aggregate${k}`)
    const num = getDeepValue(self.state.currentQuotaList, [ k, getFieldValue(`resource${k}`) ])
    const numSet = getDeepValue(self.state.currentQuotaSet, [ k, getFieldValue(`resource${k}`) ])
    return (
      // <QueueAnim key={k}>
      <div key={`item${k}`}>
        <Row type="flex">
          <Col span={5}>
            <div className="resource-wrap">
              <FormItem key={k} >
                <Select {...getFieldProps(`resource${k}`, // { rules: rulesFormat('请选择资源') }
                  {
                    rules: [
                      {
                        validator: (rules, value, callback) =>
                          self.checkGolobalValueRepetition(rules, value, callback, k),
                        trigger: [ 'onBlur', 'onChange' ],
                      },
                    ],
                    initialValue: index === 0 && resourceType,
                  }
                )}
                placeholder="请选择资源"
                onSelect = { value => checkResourceKind(value, k)}
                disabled = { isEmpty(getFieldValue('item')) }
                dropdownMatchSelectWidth = {false}
                >
                  {
                    definitions && definitions.map(o => {
                      return (
                        <Select.OptGroup key={o.resourceName}>
                          {
                            (o.children || []).map(i => {
                              return <Select.Option key={i.resourceType} value={i.resourceType}>
                                { i.resourceType === 'cpu' &&
                                  `${i.resourceName} (C)`
                                }{
                                  (i.resourceType === 'memory' || i.resourceType === 'storage') &&
                                  `${i.resourceName} (GB)`
                                }{
                                  (!filterKey.includes(i.resourceType)) &&
                                  `${i.resourceName} (个)`
                                }
                              </Select.Option>
                            })
                          }
                        </Select.OptGroup>
                      )
                    })
                  }
                </Select>
              </FormItem>
            </div>
          </Col>
          <Col span={5}>
            <div className="resource-wrap">
              {
                checkResourceKindState[k] ?
                  (
                    <span className="allResource">项目全局资源</span>
                  ) : (
                    <FormItem key={k} >
                      <Select {...getFieldProps(`aggregate${k}`, // { rules: rulesFormat('请选择集群') }
                        {
                          rules: [
                            {
                              validator: (rules, value, callback) =>
                                self.checkCluserValueRepetition(rules, value, callback, k),
                              trigger: [ 'onBlur', 'onChange' ],
                            },
                          ],
                          initialValue: index === 0 && clusterIDParams,
                        }
                      )}
                      placeholder="请选择集群"
                      disabled={!getFieldValue(`resource${k}`) }
                      onSelect={ clusterID => getClusterQuotaListSelect(clusterID, k) }
                      >
                        {fromatChoiceClusters(choiceClusters[cluserIndex])}
                      </Select>
                    </FormItem>
                  )
              }
            </div>
          </Col>
          <Col span={3}>
            <div className="resource-wrap useNum">{num}</div>
          </Col>
          <Col span={5}>
            <div className="resource-wrap applyNum">
              <FormItem key={k} >
                {
                  getFieldValue(`noLimit${k}`) ?
                    <Input disabled={ getFieldValue(`noLimit${k}`) }
                      {...getFieldProps(`numberNotUse${k}`, { initialValue: '无限制' }) }
                    />
                    :
                    <Input disabled={ getFieldValue(`noLimit${k}`) }
                      {...getFieldProps(`number${k}`, {
                        rules: [
                          {
                            validator: (rules, value, callback) =>
                              self.globalValueCheck(rules, value, callback),
                            trigger: [ 'onBlur', 'onChange' ],
                          },
                        ],
                        initialValue: numSet,
                      }
                      ) }
                    />
                }
              </FormItem>
            </div>
          </Col>
          <Col span={4}>
            <div className="resource-wrap">
              <FormItem key={k}>
                <Checkbox {...getFieldProps(`noLimit${k}`, { initialValue: numSet === null, valuePropName: 'checked' })}
                >无限制</Checkbox>
              </FormItem>
            </div>
          </Col>
          <Col span={2}>
            <div className="resource-wrap useNum">
              <Icon onClick={() => removeFunction(k)} type="delete" />
            </div>
          </Col>
        </Row>
      </div>
      // </QueueAnim>
    )
  })
  return formItem
}

class ApplyForm extends React.Component {
  state = {
    applayLoading: false, // 申请loading状态
    checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
    clusterQuotaList: {}, // 当前资源使用量
    globaleQuotaList: {}, //  当前全局资源使用量
    globalResource: undefined, // 此列表表中的资源是全局资源apiServer相关
    globaleDevopsQuotaList: undefined, // 此列表表中的资源是全局资源devops相关
    definitions: undefined, // 此列表显示后台定义的资源列表
    currentQuotaList: [{}], // 当前每个条目的资源使用情况
    currentQuotaSet: [{}], // 当前每个条目的资源设置量
  }
  uuid = 0 // id号
  definitionsSet = {} // 初始化所有资源设置量为无限制状态
  remove = k => {
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
    const { form } = this.props
    const { checkResourceKindState } = this.state
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      keys,
    })
    delete currentQuotaList[k]
    delete currentQuotaSet[k]
    const quota = compact(currentQuotaList)
    const quotaSet = compact(currentQuotaSet)
    delete checkResourceKindState[k]
    const newCheckResourceKindState = compact(checkResourceKindState)
    this.setState({ checkResourceKindState: newCheckResourceKindState, currentQuotaList: quota,
      currentQuotaSet: quotaSet },
    forceVerification(this.props.form)
    )
  }
  add = () => {
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
    this.uuid++
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(this.uuid)
    form.setFieldsValue({
      keys,
    })
    currentQuotaList[this.uuid] = {}
    currentQuotaSet[this.uuid] = {}
    this.setState({ currentQuotaList, currentQuotaSet })
  }
  componentDidMount = () => {
    const { displayNameText, displayName } = this.props
    let newdisplayName = displayName
    if (displayName === '我的个人项目') {
      newdisplayName = 'default'
    }
    if (displayNameText) {
      this.loadResourceDefinitioList(newdisplayName)
    }
  }
  handleSubmit = () => {
    const { applayResourcequota, setApplayVisable, personNamespace,
      getResourceDefinition } = this.props
    // const { getFieldValue } = this.props.form
    const { globalResource } = this.state
    const { resetFields } = this.props.form
    this.props.form.validateFields((errors, value) => {
      if (errors) {
        notification.warn({
          message: '申请填写有误',
        })
        return
      }
      let query
      let headerText
      if (value.item === '我的个人项目') {
        headerText = 'default'
      } else {
        headerText = value.item
      }
      if (value.item !== personNamespace) {
        query = { header: { teamspace: headerText } }
      }
      const formValue = {
        comment: value.applyReason,
        applyDetails: {
          global: {},
        },
      }
      // const cluserIndex = (getFieldValue('item') === personNamespace || getFieldValue('item') === '我的个人项目')
      //   ? 'default' : getFieldValue('item')
      for (const key of value.keys) {
        // let indexName = findChoiceClusersId(value[`aggregate${key}`], choiceClusters)
        // console.log('choiceClusters', choiceClusters)
        // let indexName = choiceClusters[cluserIndex].clusterID
        let indexName = value[`aggregate${key}`]
        if (findAllresource(value[`resource${key}`], globalResource)) { // 如果是全局资源
          indexName = 'global'
        }
        let indexValue = value[`number${key}`]
        if (value[`noLimit${key}`]) {
          indexValue = null
        }
        if (isEmpty(formValue.applyDetails[indexName])) {
          formValue.applyDetails[indexName] = {}
        }
        formValue.applyDetails[indexName][value[`resource${key}`]] = parseFloat(indexValue)
      }
      this.setState({ applayLoading: true })
      // console.log('formValue', formValue)
      applayResourcequota(query, formValue, {
        success: {
          func: () => {
            resetFields() // 重置表单
            this.setState({ // 重置state
              applayLoading: false, // 申请loading状态
              checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
              clusterQuotaList: {}, // 当前资源使用量
              globaleQuotaList: {}, //  当前全局资源使用量
              globalResource: undefined, // 此列表表中的资源是全局资源
              definitions: undefined, // 此列表显示后台定义的资源列表
              currentQuotaList: [{}],
              currentQuotaSet: [{}],
            })
            this.uuid = 0
            this.setState({
              applayLoading: false,
            })
            setApplayVisable('success')
            // 加载请选择资源的选项
            getResourceDefinition({
              success: {
                func: result => {
                  const resourceList = result.data
                  this.setState({
                    globalResource: resourceList.globalResource,
                    definitions: resourceList.definitions,
                  })
                },
                isAsync: true,
              },
            })
          },
          isAsync: true,
        },
      })
    })
  }
  getClusterQuotaListSelect = async (clusterID, k) => {
    // console.log('clusterID', clusterID)
    const { getClusterQuotaList, personNamespace, getClusterQuota } = this.props
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
    const { getFieldValue } = this.props.form
    let value = getFieldValue('item')
    if (value === '我的个人项目') {
      value = 'default'
    }
    const header = { header: { teamspace: value } }
    const query = { id: clusterID }
    if (personNamespace !== value) {
      Object.assign(query, header)
    }
    getClusterQuotaList(query, {
      success: {
        func: res => {
          Object.assign(currentQuotaList[k], res.data)
          this.setState({ currentQuotaList }, forceVerification(this.props.form))
        },
        isAsync: true,
      },
    })
    // 获取集群资源设置的量
    const quotaSet = await getClusterQuota(query)
    Object.assign(currentQuotaSet[k], this.definitionsSet, quotaSet.response.result.data)
    this.setState({ currentQuotaSet })
  }
  checkResourceKind = async (value, key) => {
    const { checkResourceKindState, globalResource } = this.state
    // console.log('globalResource', globalResource)
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const { getGlobaleQuotaList, personNamespace, getDevopsGlobaleQuotaList, getClusterQuotaList,
      getGlobaleQuota, getDevopsGlobaleQuotaSet } = this.props
    const { getFieldValue } = this.props.form
    let itemValue = getFieldValue('item')

    if (itemValue === '我的个人项目') {
      itemValue = 'default'
      // itemValue = encodeURI(itemValue)
    }
    let query = {}
    if (personNamespace !== itemValue) {
      query = { header: { teamspace: itemValue } }
    }
    const ResourceKind = findAllresource(value, globalResource)
    checkResourceKindState[key] = ResourceKind

    if (ResourceKind) { // 如果是全局资源
      getGlobaleQuotaList(query, {
        success: {
          func: res => {
            Object.assign(currentQuotaList[key], res.data)
            this.setState({ currentQuotaList })
          },
          isAsync: true,
        },
      })
      getDevopsGlobaleQuotaList(query, {
        success: {
          func: res => {
            Object.assign(currentQuotaList[key], res.result)
            this.setState({ currentQuotaList })
          },
          isAsync: true,
        },
      })
      // 获取passApi 中的全局资源
      // 获取devopsApi 中的全局资源
      const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
      const passQuoatSet = await getGlobaleQuota(query)
      const formatepassQuotaSet = passQuoatSet.response.result.data || {}
      const devopsQuotaSet = await getDevopsGlobaleQuotaSet(query)
      const formatedevopsQuotaSet = devopsQuotaSet.response.result.result || {}
      Object.assign(currentQuotaSet[key], this.definitionsSet, formatepassQuotaSet,
        formatedevopsQuotaSet)
      this.setState({ currentQuotaSet })
      return
    }
    // 如果已经选择了集群, 那么向后端请求集群资源使用量
    const clusterID = getFieldValue(`aggregate${key}`)
    const newQuery = cloneDeep(query)
    const clusterIDQuery = { id: clusterID }
    Object.assign(clusterIDQuery, newQuery)
    if (clusterID) {
      getClusterQuotaList(clusterIDQuery, {
        success: {
          func: res => {
            Object.assign(currentQuotaList[key], res.data)
            this.setState({ currentQuotaList }, forceVerification(this.props.form))
          },
          isAsync: true,
        },
      })
      const { getClusterQuota } = this.props
      const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
      const passClusterQuotaSet = await getClusterQuota(clusterIDQuery)
      const formatepassClusterQuotaSet = passClusterQuotaSet.response.result.data || {}
      Object.assign(currentQuotaSet[key], this.definitionsSet, formatepassClusterQuotaSet)
      this.setState({ currentQuotaSet })
    }
  }
  checkPrime = (rule, value, callback, num = 1) => {
    if (value < num) {
      callback(new Error(`配额数量不得小于${num}`))
    } else {
      callback()
    }
  }
  loadResourceDefinitioList = async value => {
    const { getResourceDefinition, getClusterQuotaList, personNamespace, getGlobaleQuotaList,
      getDevopsGlobaleQuotaList, getProjectVisibleClusters } = this.props
    const { checkResourceKindState } = this.state
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const { getFieldsValue } = this.props.form
    // 加载请选择资源的选项
    getResourceDefinition({
      success: {
        func: result => {
          const resourceList = result.data
          for (const resource of resourceList.definitions) {
            for (const child of (resource.children || [])) {
              this.definitionsSet[child.resourceType] = null
            }
          }
          this.setState({
            globalResource: resourceList.globalResource,
            definitions: resourceList.definitions,
          })
        },
        isAsync: true,
      },
    })
    // 加载项目所在集群个数
    let newVluae
    if (value === personNamespace) {
      newVluae = 'default'
    } else {
      newVluae = value
    }
    getProjectVisibleClusters(newVluae)
    // 如果已经选择了集群, 那么向后端请求集群资源使用量
    const formValue = getFieldsValue()
    let teamspace
    if (personNamespace !== value) { // 个人项目
      teamspace = value
    }
    for (const key of formValue.keys) {
      if (formValue[`aggregate${key}`] && formValue[`resource${key}`]) {
        const clusterIDQuery = { id: formValue[`aggregate${key}`] }
        if (teamspace) {
          clusterIDQuery.header = { teamspace }
        }
        getClusterQuotaList(clusterIDQuery, {
          success: {
            func: res => {
              Object.assign(currentQuotaList[key], res.data)
              this.setState({ currentQuotaList })
            },
            isAsync: true,
          },
        })
        const { getClusterQuota } = this.props
        const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
        const passClusterQuotaSet = await getClusterQuota(clusterIDQuery)
        const formatepassClusterQuotaSet = passClusterQuotaSet.response.result.data || {}
        Object.assign(currentQuotaSet[key], this.definitionsSet, formatepassClusterQuotaSet)
        this.setState({ currentQuotaSet })
      }
      let query = {}
      if (personNamespace !== value) {
        query = { header: { teamspace: value } }
      }
      const ResourceKind = checkResourceKindState[key]
      if (ResourceKind) { // 如果是全局资源
        getGlobaleQuotaList(query, {
          success: {
            func: res => {
              Object.assign(currentQuotaList[key], res.data)
              this.setState({ currentQuotaList })
            },
            isAsync: true,
          },
        })
        getDevopsGlobaleQuotaList(query, {
          success: {
            func: res => {
              Object.assign(currentQuotaList[key], res.result)
              this.setState({ currentQuotaList })
            },
          },
          isAsync: true,
        })
        const { getGlobaleQuota, getDevopsGlobaleQuotaSet } = this.props
        const currentQuotaSet = cloneDeep(this.state.currentQuotaSet)
        const passQuoatSet = await getGlobaleQuota(query)
        const formatepassQuotaSet = passQuoatSet.response.result.data || {}
        const devopsQuotaSet = await getDevopsGlobaleQuotaSet(query)
        const formatedevopsQuotaSet = devopsQuotaSet.response.result.result || {}
        Object.assign(currentQuotaSet[key], this.definitionsSet, formatepassQuotaSet,
          formatedevopsQuotaSet)
        this.setState({ currentQuotaSet })
      }
    }
  }
  cancealWindow = () => {
    const { resetFields } = this.props.form
    const { cancelApplayVisable, displayNameText } = this.props
    cancelApplayVisable()
    resetFields() // 重置表单
    if (displayNameText === undefined) {
      this.setState({ // 重置state
        applayLoading: false, // 申请loading状态
        checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
        clusterQuotaList: {}, // 当前资源使用量
        globaleQuotaList: {}, //  当前全局资源使用量
        globalResource: undefined, // 此列表表中的资源是全局资源
        definitions: undefined, // 此列表显示后台定义的资源列表
        currentQuotaList: [{}],
        currentQuotaSet: [{}],
      })
    }
    this.uuid = 0
  }
  globalValueCheck = (rules, value, callback) => {
    if (!value) {
      return callback('不能为空')
    }
    if (parseInt(value) === 0) {
      return callback('不能为零')
    }
    // const reg = /^[1-9]*[1-9][0-9]*$/
    const reg = /^\d+$/
    if (!reg.test(value)) {
      return callback('请填整数')
    }
    // const newValue = parseInt(value)
    // if (newValue < 0 || newValue > 999) {
    //   return callback('配额数量需在0-999之间')
    // }
    callback()
  }
  checkGolobalValueRepetition = (rules, value, callback, k) => {
    const { checkResourceKindState } = this.state
    // console.log('checkResourceKindState', checkResourceKindState)
    const { getFieldsValue } = this.props.form
    const formVlaue = getFieldsValue()
    // console.log('getFieldsValue', formVlaue)
    if (!value) {
      return callback('不能为空')
    }
    for (const keys of formVlaue.keys) {
      if (k === keys) {
        continue
      }
      if (checkResourceKindState[k]) {
        if (value === formVlaue[`resource${keys}`]) {
          callback('有重复项')
        }
      }
    }
    callback()
  }
  checkCluserValueRepetition = (rules, value, callback, k) => {
    // const { checkResourceKindState } = this.state
    // console.log('checkResourceKindState', checkResourceKindState)
    const { getFieldsValue } = this.props.form
    const formVlaue = getFieldsValue()
    if (!value) {
      callback('不能为空')
    }
    for (const keys of formVlaue.keys) {
      if (k === keys) {
        continue
      }
      if (value === formVlaue[`aggregate${keys}`] &&
      formVlaue[`resource${k}`] === formVlaue[`resource${keys}`]) {
        callback('有重复项')
      }
    }
    callback()
  }
  render() {
    const { applayLoading, checkResourceKindState, clusterQuotaList, globaleQuotaList, definitions,
      globaleDevopsQuotaList,
    } = this.state
    const { applayVisable, projectName, choiceClusters,
      displayName } = this.props
    const { getFieldProps, getFieldValue } = this.props.form
    const removeFunction = this.remove
    const checkResourceKind = this.checkResourceKind
    const quotalList = { ...clusterQuotaList, ...globaleQuotaList, ...globaleDevopsQuotaList }
    // console.log('quotalList', quotalList)
    const checkPrime = this.checkPrime
    const getClusterQuotaListSelect = this.getClusterQuotaListSelect
    const self = this
    // console.log('currentQuotaList', currentQuotaList);
    // console.log('definitions', definitions);
    // console.log('this.definitionsSet', this.definitionsSet);
    return (
      <Modal
        visible = {applayVisable}
        title="申请提高项目资源配额"
        onCancel={ this.cancealWindow }
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.cancealWindow}>取消</Button>,
          <Button key="submit" type="primary" size="large" loading={applayLoading}
            onClick={this.handleSubmit}>
              申 请
          </Button>,
        ]}
        width="700"
      >
        <div className="ApplyForm">
          <Form horizontal form={this.props.form}>
            <FormItem
              {...formItemLayout}
              label="项目"
            >
              <Select
                {...getFieldProps('item', { rules: rulesFormat('请选择要申请配额的项目'),
                  initialValue: displayName,
                })}
                placeholder="选择申请配额的项目"
                onSelect = { value => this.loadResourceDefinitioList(value) }
              >
                {
                  projectName.map(o =>
                    <Select.Option value={o.projectName} key="o">
                      {o.name}
                    </Select.Option>)
                }
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayoutLarge}
              label="申请原因"
            >
              <Input {...getFieldProps('applyReason', { rules: rulesFormat('请填写申请原因') })}
                placeholder="必填" type="textarea" rows={3} />
            </FormItem>
            <QueueAnim>
              <div key="card">
                <Card
                  title={
                    <Row type="flex">
                      <Col span={5}><span className="cardItem">资源</span></Col>
                      <Col span={5}><span className="cardItem">选择集群</span></Col>
                      <Col span={4}><span className="cardItem">已使用</span></Col>
                      <Col span={5}><span className="cardItem">配额</span></Col>
                      <Col span={4}><span className="cardItem"></span></Col>
                    </Row>
                  }
                >
                  {setFormItem({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
                    checkResourceKindState, quotalList, choiceClusters, checkPrime,
                    getClusterQuotaListSelect, definitions, self,
                  })}
                </Card>
              </div>
            </QueueAnim>
            <div className="addBtn" onClick={this.add}>
              <Icon type="plus-circle-o"/><span>添加申请</span>
            </div>
            {/* <Alert message="配额数量不得小于已使用配额数量" type="error" showIcon /> */}
          </Form>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  const data = state.projectAuthority.projectList.data
  const { current } = state.entities
  const { clusterID } = current.cluster
  const projectName = []
  const personNamespace = state.entities.loginUser.info.namespace
  if (isArray(data) && !isEmpty(data)) {
    data.forEach(o => {
      const managerValue = o.outlineRoles || []
      const flag = managerValue.includes('manager')
      if (flag) {
        projectName.push({ projectName: o.projectName, name: o.name })
      }
    })
  }
  const choiceClusters = state.projectAuthority.projectVisibleClusters // 所有集群列表
  return {
    projectName, clusterID, choiceClusters, personNamespace,
  }
}

export default connect(mapStateToProps, {
  getClusterQuotaList: quotaActions.getClusterQuotaList,
  getGlobaleQuotaList: quotaActions.getGlobaleQuotaList,
  getProjectVisibleClusters: projectActions.getProjectVisibleClusters,
  applayResourcequota: applyLimitActions.applayResourcequota,
  getResourceDefinition: quotaActions.getResourceDefinition,
  getDevopsGlobaleQuotaList: quotaActions.getDevopsGlobaleQuotaList,
  getGlobaleQuota: quotaActions.getGlobaleQuota, // 获取非devops的全局资源设置量
  getClusterQuota: quotaActions.getClusterQuota, // 获取非devops的集群相关设置量
  getDevopsGlobaleQuotaSet: quotaActions.getDevopsGlobaleQuotaSet, // 获取devops相关全局资源设置量
})(createForm()(ApplyForm))
