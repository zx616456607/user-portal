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
import { getClusterQuotaList, getGlobaleQuotaList } from '../../../../../src/actions/quota'
import { getProjectVisibleClusters } from '../../../../../src/actions/project'
import { applayResourcequota } from '../../../../../client/actions/applyLimit'
import './style/index.less'
import { connect } from 'react-redux'
import { REG } from '../../../../../src/constants'
import _ from 'lodash'
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

// 返回资源选项
const formateOpt = () => {
  const ciList = [
    {
      key: 'cached_volumes',
      text: '缓存卷 (个)',
    },
    {
      key: 'tenxflow',
      text: '流水线 (个)',
    },
    {
      key: 'jieduan',
      text: '阶段 (个)',
    },
    {
      key: 'subTask',
      text: '任务 (个)',
    },
    {
      key: 'dockerfile',
      text: 'Dockerfile (个)',
    },
  ]
  const cdList = [
    {
      key: 'orchestrationTemplate',
      text: '编排文件 (个)',
    },
    {
      key: 'applicationPackage',
      text: '应用包 (个)',
    }, {
      key: 'applicationTemplate',
      text: '应用模板 (个)',
    }, {
      key: 'stage',
      text: '阶段 (个)',
    }, {
      key: 'cacheVolume',
      text: '缓存卷 (个)',
    },
  ]

  const computeList = [
    {
      key: 'cpu',
      text: 'CPU (C)',
    },
    {
      key: 'memory',
      text: '内存 (GB)',
    },
    {
      key: 'storage',
      text: '磁盘 (GB)',
    },
  ]

  const platformList = [
    {
      key: 'application',
      text: '应用 (个)',
    }, {
      key: 'service',
      text: '服务 (个)',
    }, {
      key: 'container',
      text: '容器 (个)',
    }, {
      key: 'volume',
      text: '存储 (个)',
    }, {
      key: 'snapshot',
      text: '快照 (个)',
    }, {
      key: 'configuration',
      text: '服务配置 (个)',
    }, {
      key: 'secret',
      text: '加密服务配置 (个)',
    }, {
      key: 'loadbalance',
      text: '应用负载均衡（个）',
    }, {
      key: 'autoScale',
      text: '自动伸缩策略 (个)',
    },
    // {
    //   key: 'chuantongyingyong',
    //   text: '传统应用 (个)',
    // },
    // {
    //   key: 'chuantongyingyonghuanjing',
    //   text: '传统应用环境 (个)',
    // },
  ]

  const serviceList = [
    {
      key: 'mysql',
      text: 'MySQL集群 (个)',
    }, {
      key: 'redis',
      text: 'Redis集群 (个)',
    }, {
      key: 'zookeeper',
      text: 'Zookeeper集群 (个)',
    }, {
      key: 'elasticsearch',
      text: 'ElasticSearch集群 (个)',
    },
  ]
  const formateToReactNode = (arr, title) => {
    return (
      <Select.OptGroup key ={ title }>
        {
          arr.map(o => {
            return <Select.Option value={o.key} key={o.key}>{o.text}</Select.Option>
          })
        }
      </Select.OptGroup>
    )
  }
  const cicdNode = formateToReactNode(ciList.concat(cdList), 'CI/CD')
  const computerNode = formateToReactNode(computeList, '计算资源')
  const platformNode = formateToReactNode(platformList, '应用管理')
  const serviceNode = formateToReactNode(serviceList, '数据库与缓存')
  return { cicdNode, computerNode, platformNode, serviceNode }
}

// 如果当前资源为全局资源则返回ture, 如果不是则返回false
const findAllresource = key => {
  const allResource = [ // 如果选中的key是这里的一个,则为全局资源
    'tenxflow', // 流水线
    'subTask', // 子任务
    'dockerfile', // Dockerfile
    'registryProject', // 镜像仓库组
    'registry', // 镜像仓库
    'orchestrationTemplate', // 编排文件
    'applicationPackage', // 应用包
    'applicationTemplate', // 应用模板
    'stage', // 阶段
    'cacheVolume', // 缓存卷
  ]
  return allResource.indexOf(key) > -1
}

// 将可选择集群整理成jsx
const fromatChoiceClusters = choiceClusters => {
  if (!_.isEmpty(choiceClusters) && !_.isEmpty(choiceClusters.data)) {
    return choiceClusters.data.map(o => {
      return (
        <Select.Option value={o.clusterName} key={o.clusterName}>{o.clusterName}</Select.Option>
      )
    })
  }
  return null

}
// 根据集群名称查询集群id
const findChoiceClusersId = (name, choiceClusters) => {
  if (!_.isEmpty(choiceClusters) && !_.isEmpty(choiceClusters.data)) {
    for (const o of choiceClusters.data) {

      if (o.clusterName === name) {
        return o.clusterID
      }
    }
  }
}

const setFormItem = ({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
  checkResourceKindState, quotalList, choiceClusters }) => {

  getFieldProps('keys', {
    initialValue: [ 0 ],
  })
  const formItem = getFieldValue('keys').map(k => {
    const num = quotalList[getFieldValue(`resource${k}`)] || 0
    return (
      <Row type="flex">
        <Col span={6}>
          <div className="resource-wrap">
            <FormItem key={k} >
              <Select {...getFieldProps(`resource${k}`, { rules: rulesFormat('请选择资源') })}
                placeholder="请选择资源"
                onSelect = { value => checkResourceKind(value, k) }
              >
                { formateOpt().platformNode }
                { formateOpt().cicdNode }
                { formateOpt().computerNode }
                { formateOpt().serviceNode }
              </Select>
            </FormItem>
          </div>
        </Col>
        <Col span={6}>
          <div className="resource-wrap">
            {
              checkResourceKindState[k] ?
                (
                  <span className="allResource">项目全局资源</span>
                ) : (
                  <FormItem key={k}>
                    <Select {...getFieldProps(`aggregate${k}`, { rules: rulesFormat('请选择集群') })}
                      placeholder="请选择集群"
                    >
                      {/* <Option value="devAggregate">开发集群</Option>
                <Option value="Allaggregate">项目全局资源</Option> */}
                      {fromatChoiceClusters(choiceClusters)}
                    </Select>
                  </FormItem>
                )
            }
          </div>
        </Col>
        <Col span={4}>
          <div className="resource-wrap useNum">{quotalList[getFieldValue(`resource${k}`)]}</div>
        </Col>
        <Col span={5}>
          <div className="resource-wrap applyNum">
            <FormItem key={k}>
              <Tooltip title={ `配额数量不小于${num}`}>
                <InputNumber min={num} disabled={ getFieldValue(`noLimit${k}`) }

                  {...getFieldProps(`number${k}`, { initialValue: (getFieldValue(`noLimit${k}`) ? undefined : num),
                    // rules: [{ validator: checkPrime }],
                  })}
                  placeholder={ getFieldValue(`noLimit${k}`) ? '无限制' : `当前配额 ${num}`}
                />
              </Tooltip>
            </FormItem>
          </div>
        </Col>
        <Col span={1}>
          <div className="resource-wrap">
            <FormItem key={k}>
              <Checkbox {...getFieldProps(`noLimit${k}`, { initialValue: false, valuePropName: 'checked' })}></Checkbox>
            </FormItem>
          </div>
        </Col>
        <Col span={2}>
          <div className="resource-wrap useNum">
            <Icon onClick={() => removeFunction(k)} type="delete" />
          </div>
        </Col>
      </Row>
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
    this.props.form.validateFields((errors, value) => {
      if (errors) {
        notification.warn({
          message: '表单验证错误',
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
        let indexName = findChoiceClusersId(value[`aggregate${key}`], choiceClusters)
        if (findAllresource(value[`resource${key}`])) { // 如果是全局资源
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
  getClusterQuotaList = value => {
    const { getClusterQuotaList, getGlobaleQuotaList, clusterID, personNamespace } = this.props
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
    // getProjectVisibleClusters()
  }
  checkResourceKind = (value, key) => {
    const { checkResourceKindState } = this.state
    checkResourceKindState[key] = findAllresource(value)
    this.setState({ checkResourceKindState })
  }
  checkPrime = (rule, value, callback, num = 1) => {
    if (value < num) {
      callback(new Error(`配额数量不得小于${num}`))
    } else {
      callback()
    }
  }
  render() {
    const { applayLoading, checkResourceKindState, clusterQuotaList, globaleQuotaList } = this.state
    const { applayVisable, setApplayVisable, projectName, choiceClusters,
      personNamespace } = this.props
    const { getFieldProps, getFieldValue } = this.props.form
    const removeFunction = this.remove
    const checkResourceKind = this.checkResourceKind
    const quotalList = { ...clusterQuotaList, ...globaleQuotaList }
    const checkPrime = this.checkPrime
    return (
      <Modal
        visible = {applayVisable}
        title="申请提高项目资源配额"
        onCancel={ setApplayVisable }
        footer={[
          <Button key="back" type="ghost" size="large" onClick={setApplayVisable}>取消</Button>,
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
                onSelect={ value => this.getClusterQuotaList(value) }
              >
                <Select.Option value={personNamespace}>我的个人项目</Select.Option>
                <Select.OptGroup key="共享项目">
                  {
                    projectName.map(o =>
                      <Select.Option value={o} key="o">
                        {o}
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
            { getFieldValue('item') &&
            <Card
              title={
                <Row type="flex">
                  <Col span={6}><span className="cardItem">资源</span></Col>
                  <Col span={6}><span className="cardItem">选择集群</span></Col>
                  <Col span={6}><span className="cardItem">已使用</span></Col>
                  <Col span={6}><span className="cardItem">配额</span></Col>
                </Row>
              }
            >
              {setFormItem({ getFieldProps, getFieldValue, removeFunction, checkResourceKind,
                checkResourceKindState, quotalList, choiceClusters, checkPrime })}
            </Card>
            }
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
      projectName.push(o.namespace)
    })
  }
  const choiceClusters = state.projectAuthority.projectVisibleClusters.default
  return {
    projectName, clusterID, choiceClusters, personNamespace,
  }
}

export default connect(mapStateToProps, {
  getClusterQuotaList,
  getGlobaleQuotaList,
  getProjectVisibleClusters,
  applayResourcequota,
})(createForm()(ApplyForm))
