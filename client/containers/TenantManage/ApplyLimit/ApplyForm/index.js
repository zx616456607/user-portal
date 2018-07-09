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
import { Form, Button, Select, Modal, Input, Card, Row, Col, Icon, InputNumber,
  Tooltip, Checkbox, notification } from 'antd'
import { getClusterQuotaList, getGlobaleQuotaList, getDevopsGlobaleQuotaList } from '../../../../../src/actions/quota'
import { getProjectVisibleClusters } from '../../../../../src/actions/project'
import { applayResourcequota } from '../../../../../client/actions/applyLimit'
import './style/index.less'
import { connect } from 'react-redux'
// import { REG } from '../../../../../src/constants'
import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import { getResourceDefinition } from '../../../../../src/actions/quota'
import QueueAnim from 'rc-queue-anim'
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

const setFormItem = ({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
  checkResourceKindState, choiceClusters, getClusterQuotaListSelect, definitions,
  self }) => {

  getFieldProps('keys', {
    initialValue: [ 0 ],
  })
  const formItem = getFieldValue('keys').map(k => {
    // const clusterID = getFieldValue(`aggregate${k}`)
    const num = self.state.currentQuotaList[k][getFieldValue(`resource${k}`)]
    const numWord = !getFieldValue(`noLimit${k}`) ? num : '无限制'
    return (
      // <QueueAnim key={k}>
      <div key={`item${k}`}>
        <Row type="flex">
          <Col span={5}>
            <div className="resource-wrap">
              <FormItem key={k} >
                <Select {...getFieldProps(`resource${k}`, { rules: rulesFormat('请选择资源') })}
                  placeholder="请选择资源"
                  onSelect = { value => checkResourceKind(value, k)}
                  disabled = { isEmpty(getFieldValue('item')) }
                >
                  {
                    definitions && definitions.map(o => {
                      return (
                        <Select.OptGroup key={o.resourceName}>
                          {
                            o.children.map(i =>
                              <Select.Option key={i.resourceType} value={i.resourceType}>
                                {i.resourceName}
                              </Select.Option>
                            )
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
                    <FormItem key={k}>
                      <Select {...getFieldProps(`aggregate${k}`, { rules: rulesFormat('请选择集群') })}
                        placeholder="请选择集群"
                        disabled={!getFieldValue(`resource${k}`) }
                        onSelect={ clusterID => getClusterQuotaListSelect(clusterID, k) }
                      >
                        {fromatChoiceClusters(choiceClusters[getFieldValue('item')])}
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
              <FormItem key={k}>
                <Tooltip title={ !isEmpty(num) ? `配额数量不小于${num}` : '' }>
                  <InputNumber min={num + 1} disabled={ getFieldValue(`noLimit${k}`) }
                    {...getFieldProps(`number${k}`, { initialValue: numWord }) }
                  />
                </Tooltip>
              </FormItem>
            </div>
          </Col>
          <Col span={4}>
            <div className="resource-wrap">
              <FormItem key={k}>
                <Checkbox {...getFieldProps(`noLimit${k}`, { initialValue: false, valuePropName: 'checked' })}>无限制</Checkbox>
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
  }
  uuid = 0 // id号
  remove = k => {
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      keys,
    })
    delete currentQuotaList[k]
    const quota = compact(currentQuotaList)
    this.setState({ currentQuotaList: quota })
  }
  add = () => {
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    this.uuid++
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(this.uuid)
    form.setFieldsValue({
      keys,
    })
    currentQuotaList[this.uuid] = {}
    this.setState({ currentQuotaList })
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
    const { choiceClusters, applayResourcequota, setApplayVisable, personNamespace } = this.props
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
      if (value.item !== personNamespace) {
        query = { header: { teamspace: value.item } }
      }
      const formValue = {
        comment: value.applyReason,
        applyDetails: {
          global: {},
        },
      }
      for (const key of value.keys) {
        // let indexName = findChoiceClusersId(value[`aggregate${key}`], choiceClusters)
        let indexName = choiceClusters.data[0].clusterID
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
        formValue.applyDetails[indexName][value[`resource${key}`]] = indexValue
      }
      this.setState({ applayLoading: true })
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
            })
            this.setState({
              applayLoading: false,
            })
            setApplayVisable('success')
          },
          isAsync: true,
        },
      })
    })
  }
  getClusterQuotaListSelect = (clusterID, k) => {
    const { getClusterQuotaList, personNamespace } = this.props
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const { getFieldValue } = this.props.form
    const value = getFieldValue('item')
    const header = { header: { teamspace: value } }
    const query = { id: clusterID }
    if (personNamespace !== value) {
      Object.assign(query, header)
    }
    getClusterQuotaList(query, {
      success: {
        func: res => {
          Object.assign(currentQuotaList[k], res.data)
          this.setState({ currentQuotaList })
        },
        isAsync: true,
      },
    })
  }
  checkResourceKind = (value, key) => {
    const { checkResourceKindState, globalResource } = this.state
    const currentQuotaList = cloneDeep(this.state.currentQuotaList)
    const { getGlobaleQuotaList, personNamespace, getDevopsGlobaleQuotaList, getClusterQuotaList,
    } = this.props
    const { getFieldValue } = this.props.form
    const itemValue = getFieldValue('item')
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
      return
    }
    // 如果已经选择了集群, 那么向后端请求集群资源使用量
    const clusterID = getFieldValue(`aggregate${key}`)
    const clusterIDQuery = { id: clusterID }
    if (clusterID) {
      getClusterQuotaList(clusterIDQuery, {
        success: {
          func: res => {
            Object.assign(currentQuotaList[key], res.data)
            this.setState({ currentQuotaList })
          },
          isAsync: true,
        },
      })
    }
    // this.setState({ currentQuotaList })
  }
  checkPrime = (rule, value, callback, num = 1) => {
    if (value < num) {
      callback(new Error(`配额数量不得小于${num}`))
    } else {
      callback()
    }
  }
  loadResourceDefinitioList = value => {
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
      }
    }
  }
  cancealWindow = () => {
    const { resetFields } = this.props.form
    const { cancelApplayVisable } = this.props
    cancelApplayVisable()
    resetFields() // 重置表单
    this.setState({ // 重置state
      applayLoading: false, // 申请loading状态
      checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
      clusterQuotaList: {}, // 当前资源使用量
      globaleQuotaList: {}, //  当前全局资源使用量
      globalResource: undefined, // 此列表表中的资源是全局资源
      definitions: undefined, // 此列表显示后台定义的资源列表
      currentQuotaList: [{}],
    })
  }
  render() {
    const { applayLoading, checkResourceKindState, clusterQuotaList, globaleQuotaList, definitions,
      globaleDevopsQuotaList,
    } = this.state
    const { applayVisable, projectName, choiceClusters,
      personNamespace, displayNameText } = this.props
    const { getFieldProps, getFieldValue } = this.props.form
    const removeFunction = this.remove
    const checkResourceKind = this.checkResourceKind
    const quotalList = { ...clusterQuotaList, ...globaleQuotaList, ...globaleDevopsQuotaList }
    // console.log('quotalList', quotalList)
    const checkPrime = this.checkPrime
    const getClusterQuotaListSelect = this.getClusterQuotaListSelect
    const self = this
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
                  initialValue: displayNameText,
                })}
                placeholder="选择申请配额的项目"
                onSelect = { value => this.loadResourceDefinitioList(value) }
              >
                <Select.Option value={personNamespace}>我的个人项目</Select.Option>
                <Select.OptGroup key="共享项目">
                  {
                    projectName.map(o =>
                      <Select.Option value={o.projectName} key="o">
                        {o.name}
                      </Select.Option>)
                  }
                </Select.OptGroup>
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayoutLarge}
              label="申请原因"
            >
              <Input {...getFieldProps('applyReason', { rules: rulesFormat('请填写申请原因') })}
                placeholder="必填" type="textarea" rows={4} />
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
                      <Col span={4}><span className="cardItem">限制</span></Col>
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
  getClusterQuotaList,
  getGlobaleQuotaList,
  getProjectVisibleClusters,
  applayResourcequota,
  getResourceDefinition,
  getDevopsGlobaleQuotaList,
})(createForm()(ApplyForm))
