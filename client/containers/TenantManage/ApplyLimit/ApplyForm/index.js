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
import { REG } from '../../../../../src/constants'
import _ from 'lodash'
import { getResourceDefinition } from '../../../../../src/actions/quota'
import QueueAnim from 'rc-queue-anim'
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
  if (!_.isEmpty(choiceClusters) && !_.isEmpty(choiceClusters.data)) {
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
//   if (!_.isEmpty(choiceClusters) && !_.isEmpty(choiceClusters.data)) {
//     for (const o of choiceClusters.data) {

//       if (o.clusterName === name) {
//         return o.clusterID
//       }
//     }
//   }
// }

const setFormItem = ({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
  checkResourceKindState, quotalList, choiceClusters, getClusterQuotaList, definitions }) => {

  getFieldProps('keys', {
    initialValue: [ 0 ],
  })
  const formItem = getFieldValue('keys').map(k => {
    const clusterID = getFieldValue(`aggregate${k}`)
    const num = (clusterID || checkResourceKindState[k]) ? quotalList[getFieldValue(`resource${k}`)] : undefined
    return (
      <QueueAnim>
        <div key="item">
          <Row type="flex">
            <Col span={5}>
              <div className="resource-wrap">
                <FormItem key={k} >
                  <Select {...getFieldProps(`resource${k}`, { rules: rulesFormat('请选择资源') })}
                    placeholder="请选择资源"
                    onSelect = { value => checkResourceKind(value, k)}
                    disabled = { _.isEmpty(getFieldValue('item')) }
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
                          onSelect={ clusterID => getClusterQuotaList(clusterID) }
                        >
                          {fromatChoiceClusters(choiceClusters)}
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
                  <Tooltip title={ !_.isEmpty(num) ? `配额数量不小于${num}` : '' }>
                    <InputNumber min={num} disabled={ getFieldValue(`noLimit${k}`) }

                      {...getFieldProps(`number${k}`, { initialValue: (!_.isEmpty(getFieldValue(`noLimit${k}`)) ? undefined : num),
                        // rules: [{ validator: checkPrime }],
                      })}
                      placeholder={ getFieldValue(`noLimit${k}`) ? '无限制' : (!_.isEmpty(num) && `当前配额 ${num}`) }
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
      </QueueAnim>
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
  }
  uuid = 0 // id号
  remove = k => {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      keys,
    })
  }
  add = () => {
    this.uuid++
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(this.uuid)
    form.setFieldsValue({
      keys,
    })
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
        if (_.isEmpty(formValue.applyDetails[indexName])) {
          formValue.applyDetails[indexName] = {}
        }
        formValue.applyDetails[indexName][value[`resource${key}`]] = indexValue
      }
      this.setState({ applayLoading: true })
      applayResourcequota(query, formValue, {
        success: {
          func: res => {
            if (REG.test(res.code)) {
              resetFields() // 重置表单
              this.setState({ // 重置state
                applayLoading: false, // 申请loading状态
                checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
                clusterQuotaList: {}, // 当前资源使用量
                globaleQuotaList: {}, //  当前全局资源使用量
                globalResource: undefined, // 此列表表中的资源是全局资源
                definitions: undefined, // 此列表显示后台定义的资源列表
              })
              this.setState({
                applayLoading: false,
              })
              setApplayVisable('success')
            }
          },
          isAsync: true,
        },
      })
    })
  }
  getClusterQuotaList = clusterID => {
    const { getClusterQuotaList, personNamespace } = this.props
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
          if (REG.test(res.code)) {
            this.setState({
              clusterQuotaList: res.data,
            })
          }
        },
        isAsync: true,
      },
    })
    // getProjectVisibleClusters()
  }
  checkResourceKind = (value, key) => {
    const { checkResourceKindState, globalResource } = this.state
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
    this.setState({ checkResourceKindState })

    if (ResourceKind) { // 如果是全局资源
      getGlobaleQuotaList(query, {
        success: {
          func: res => {
            if (REG.test(res.code)) {
              this.setState({
                globaleQuotaList: res.data,
              })
            }
          },
          isAsync: true,
        },
      })
      getDevopsGlobaleQuotaList(query, {
        success: {
          func: res => {
            this.setState({
              globaleDevopsQuotaList: res.result,
            })
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
            if (REG.test(res.code)) {
              this.setState({
                clusterQuotaList: res.data,
              })
            }
          },
          isAsync: true,
        },
      })
    }
  }
  checkPrime = (rule, value, callback, num = 1) => {
    if (value < num) {
      callback(new Error(`配额数量不得小于${num}`))
    } else {
      callback()
    }
  }
  loadResourceDefinitioList = () => {
    const { getResourceDefinition } = this.props
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
      },
      isAsync: true,
    })
  }
  cancealWindow = () => {
    const { resetFields } = this.props.form
    const { setApplayVisable } = this.props
    setApplayVisable()
    resetFields() // 重置表单
    this.setState({ // 重置state
      applayLoading: false, // 申请loading状态
      checkResourceKindState: {}, // 当前选中的资源类型, 默认为集群相关
      clusterQuotaList: {}, // 当前资源使用量
      globaleQuotaList: {}, //  当前全局资源使用量
      globalResource: undefined, // 此列表表中的资源是全局资源
      definitions: undefined, // 此列表显示后台定义的资源列表
    })
  }
  render() {
    const { applayLoading, checkResourceKindState, clusterQuotaList, globaleQuotaList, definitions,
      globaleDevopsQuotaList,
    } = this.state
    const { applayVisable, projectName, choiceClusters,
      personNamespace } = this.props
    const { getFieldProps, getFieldValue } = this.props.form
    const removeFunction = this.remove
    const checkResourceKind = this.checkResourceKind
    const quotalList = { ...clusterQuotaList, ...globaleQuotaList, ...globaleDevopsQuotaList }
    const checkPrime = this.checkPrime
    const getClusterQuotaList = this.getClusterQuotaList
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
                {...getFieldProps('item', { rules: rulesFormat('请选择要申请配额的项目') })}
                placeholder="选择申请配额的项目"
                onSelect = { this.loadResourceDefinitioList }
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
                    getClusterQuotaList, definitions,
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
  if (_.isArray(data) && !_.isEmpty(data)) {
    data.forEach(o => {
      projectName.push({ projectName: o.projectName, name: o.name })
    })
  }
  const choiceClusters = state.projectAuthority.projectVisibleClusters.default // 所有集群列表
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
