/* Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * AppServiceDetailInfo component
 *
 * v0.1 - 2019-03-08
 * @author zhangtao
 */

import * as React from 'react'
import { Form, Row, Col, Dropdown, Menu, Icon, Input, Button, Select, Cascader, Tooltip, notification } from 'antd'
import get from 'lodash/get'
import { connect } from 'react-redux'
import './style/EnvComponent.less'
import { editServiceEnv } from '../../../actions/services'
import { getSecrets } from '../../../actions/secrets'
import { PodKeyMapping } from '../../../constants'
import TenxIcon from '@tenx-ui/icon/es/_old'
import classNames from 'classnames'

function AppButton({
    disabled,
    loading,
    onClick
}) {
    return (
        <div className="AppButton">
        <span className="titleSpan">环境变量</span>
        <div className={classNames("editTip",{'hide' : disabled})}>修改尚未更新，请点击"应用修改"使之生效</div>
        <div className='save_box'>
          <Button size="large" type="primary"
                  disabled={disabled}
                  loading={loading}
                  onClick={onClick} className='title_button'>
            应用修改
        </Button>
        </div>
        </div>
    )
}

function findShowPodKey(fieldPath) {
    for(let key in  PodKeyMapping) {
    if (PodKeyMapping[key] === fieldPath) {
        return key
    }}
}
const FormItem = Form.Item
const Option = Select.Option
class EnvComponent extends React.Component {
  id = 0;
  state = {
    containers: [],
    currentEditor: [],
    disabled: true,
    loading: false,
  }
  componentDidMount() {
    const containers = get(this.props.serviceDetail, 'spec.template.spec.containers[0].env', [])
    const newContainers = containers.map((node) => {
        const newNode = {...node}
        newNode.saved = true
        return newNode
    })
    this.setState({ containers: newContainers })
    this.props.getSecrets(this.props.currentCluster.clusterID)
  }
  handleDelete = (index) => {
    const newContainers = [...this.state.containers]
    newContainers.splice(index, 1)
    this.setState({ containers: newContainers, disabled: false })
  }
  handleEdit = index => {
    const newSet = new Set(this.state.currentEditor)
    newSet.add(index)
    this.setState({ currentEditor: [...newSet] })
  }
  cancel = (index) => {
    const newSet = new Set(this.state.currentEditor)
    newSet.delete(index)
    this.setState({ currentEditor: [...newSet] })
    if (!this.state.containers[index].saved) {
        const newContainers = [...this.state.containers]
        newContainers.splice(index, 1)
        this.setState({ containers: newContainers })
    }
  }
  save = (index) => {
    this.props.form.validateFields( (errors, values) => {
        errors = errors || {}
        const lintError = Object.keys(errors).filter((name) => name.includes(''+index))
        if (lintError.length !== 0) return
        const addItem = {
            name: values[`name${index}`],
            saved: true,
        }
        if (values[`envValueType${index}`] === 'normal') {
            addItem.value = values[`envValue-N${index}`]
            addItem.type = 'normal'
        }
        if (values[`envValueType${index}`] === 'secret') {
            addItem.valueFrom = {
                secretKeyRef: {
                    key:  values[`envValue-S${index}`][0],
                    name: values[`envValue-S${index}`][1],
                }
            }
            addItem.type = 'secret'
        }
        if (values[`envValueType${index}`] === 'Podkey') {
            addItem.valueFrom = {
                fieldRef: {
                    fieldPath:  PodKeyMapping[values[`envValue-P${index}`]]
                }
            }
            addItem.type = 'Podkey'
        }
        const newContainers = [...this.state.containers ]
        newContainers.splice(index, 1, addItem)
        this.setState({ containers: newContainers })
        const newSet = new Set(this.state.currentEditor)
        newSet.delete(index)
        this.setState({ currentEditor: [...newSet], disabled: false })
    })
  }
  addEnv = (e) => {
    e.preventDefault()
    const newState = new Set(this.state.currentEditor)
    newState.add(this.state.containers.length)
    this.setState({currentEditor: [ ...newState ] })
    this.setState({ containers: [...this.state.containers, { name: undefined, value: undefined }] })
  }
  onAppClick = async () => {
    const { cluster, serviceDetail } = this.props
    const postData = []
    this.state.containers.forEach((node) => {
      if (node.type === 'secret' || node.type === 'Podkey') {
        postData.push({
          name: node.name,
          value: '',
          valueFrom: node.valueFrom
        })
      } else {
        postData.push({
          name: node.name,
          value: node.value
        })
      }
    })
    const body = {
      clusterId : cluster,
      service : serviceDetail.metadata.name,
      arr : postData
    }
    this.setState({ loading: true })
    await this.props.editServiceEnv(body)
    this.setState({ loading: false, disabled: true })
    notification.success({ message: '更改环境变量成功' })
  }
  render() {
    return(
      <div className="EnvComponent">
        <AppButton
         disabled={this.state.disabled}
         loading={this.state.loading}
         onClick={this.onAppClick}
          />
        <Form inline className="EnvForm">
          <Row className="EnvTableTitle">
            <Col span={6}>变量名</Col><Col span={10}>变量值</Col><Col span={8}>操作</Col>  
          </Row>
          {
            this.state.containers.map((node, index) => {
              if( this.state.currentEditor.includes(index) ) {
               return <MyForm 
               form={this.props.form} 
               index={index}
               cancel={this.cancel}
               save={this.save}
               node={node}
               containers={this.state.containers}
               secretsOptions={this.props.secretsOptions}
               />
              }
              return (
                <Row>
                  <Col span={6}>
                    {node.name}
                  </Col>
                  <Col span={10}>
                    { (!node.type || node.type === 'normal') ? 
                      <span>{node.value}</span> :
                      node.type === 'secret' ? 
                      <span>
                        <Tooltip title={'加密变量'} placement="top">
                          <a><i className="fa fa-key" /></a>
                        </Tooltip>
                        &nbsp;
                        {`${node.valueFrom.secretKeyRef.key}/${node.valueFrom.secretKeyRef.name}`}
                      </span> :
                      node.type === 'Podkey' ? 
                      <span>
                        <Tooltip title={'Pod 字段'} placement="top">
                          <span><TenxIcon type='PodKey'/></span>
                        </Tooltip>
                        &nbsp;
                        {findShowPodKey(node.valueFrom.fieldRef.fieldPath)}
                      </span>
                      : ''
                    }
                  </Col>
                  <Col>
                    {
                        <Dropdown.Button
                         type="ghost" 
                         overlay={
                          <Menu style={{width:'100px'}} onClick={() => this.handleEdit(index)}>
                            <Menu.Item key="1"><Icon type="edit" />&nbsp;编辑</Menu.Item>
                          </Menu>
                         } 
                         className='editButton' 
                         onClick={() => this.handleDelete(index)}>
                        <Icon type="delete" />删除
                      </Dropdown.Button>
                    }
                  </Col>
                </Row>
              )
            })
          }
        </Form>
        <div className="pushRow">
          <a onClick={this.addEnv}><Icon type="plus" />添加环境变量</a>
        </div>
      </div>
    )
  }
}

class MyForm extends React.Component {
  checkName = (rule, value, callback) => {
    const names = this.props.containers
    .map(({ name }) => name)
    .filter((_, index) => index !== this.props.index)
    if (names.includes(value)) return callback('变量名不能重复')
    callback()
  }
  render() {
    const getFieldProps = this.props.form.getFieldProps
    const index = this.props.index
    const CascaderInitValue = get(this.props.node, 'valueFrom.secretKeyRef.key') ? 
    [get(this.props.node, 'valueFrom.secretKeyRef.key'), get(this.props.node, 'valueFrom.secretKeyRef.name')]
    : []
    
    return (
        <Row>
        <Col span={6}>
        <FormItem>
          <Input 
            type="name" 
            {...getFieldProps(`name${index}`, {
              initialValue: this.props.node.name,
              rules: [
                {
                  required: true,
                  message: '变量名不能为空'
                },
                { validator: this.checkName },
              ],
            })} 
            placeholder="请填写变量名"
          />
        </FormItem>
        </Col>
        <Col span={10}>
            <FormItem>
            <Select
                style={{ width: '82' }}
                className="oneSelect"
              {
                ...getFieldProps(`envValueType${index}`, {
                    initialValue: this.props.node.type || "normal",
                    onChange: () => {
                      this.props.form.resetFields([`envValue${index}`]) 
                    },
                  })
              }
              size="default"
            >
              <Option value="normal">普通变量</Option>
              <Option value="secret">加密变量</Option>
              <Option value="Podkey">Pod 字段</Option>
            </Select>
            </FormItem>
            {
                this.props.form.getFieldValue(`envValueType${index}`) === 'normal' && 
                <FormItem>
                <Input
                  className="envInput"
                  {...getFieldProps(`envValue-N${index}`, {
                    initialValue: this.props.node.value,
                    rules: [
                      {
                        required: true,
                        message: '值不能为空'
                      },
                    ],
                  })}
                  placeholder="请填写值"
                />
                </FormItem>
            }{
                this.props.form.getFieldValue(`envValueType${index}`) === 'secret' &&
                <FormItem>
                <Cascader
                  className="EnvCascader"
                  {...getFieldProps(`envValue-S${index}`, {
                    initialValue: CascaderInitValue,
                    rules: [
                      {
                        required: true,
                        message: '值不能为空'
                      },
                    ],
                  })}
                  options={this.props.secretsOptions}
                  placeholder="请选择加密对象"
                />
                </FormItem>
            }{
                this.props.form.getFieldValue(`envValueType${index}`) === 'Podkey' &&
                <FormItem>
                <Select 
                style={{ width: 140 }}
                defaultValue="PodIP"
                className="PodKeySelect"
                {...getFieldProps(`envValue-P${index}`, {
                    initialValue: findShowPodKey(get(this.props.node, 'valueFrom.fieldRef.fieldPath')) || 'POD_IP',
                  })}
              >
                <Option value="POD_IP">PodIP</Option>
                <Option value="POD_NAME">PodName</Option>
                <Option value="NODE_IP">NodeIP</Option>
                <Option value="POD_NAMESPACE">PodNamespace</Option>
              </Select>
              </FormItem>
            }
        </Col>
        <Col span={8}>
          <Button type="primary" onClick={() => this.props.save(index)} style={{ marginRight: 4 }}>保存</Button>
          <Button onClick={() => this.props.cancel(index)}>取消</Button>
        </Col>
      </Row>
    )
  }
}

function mapStateToProp(state, props){
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
    const secretsOptions = secretsList.map(secret => ({
      value: secret.name,
      label: secret.name,
      disabled: !secret.data,
      children: !secret.data
        ? []
        : Object.keys(secret.data).map(key => ({
          value: key,
          label: key,
        }))
    }))
    if (secretsOptions.length === 0) {
      secretsOptions.push({
        value: 'empty',
        value: '无加密对象',
        disabled: true,
      })
    }
    return {
      currentCluster: cluster,
      secretsList,
      secretsOptions,
    }
  }

  EnvComponent = connect(mapStateToProp, {
    editServiceEnv,
    getSecrets,
  })(EnvComponent)

EnvComponent = Form.create()(EnvComponent)
export default EnvComponent