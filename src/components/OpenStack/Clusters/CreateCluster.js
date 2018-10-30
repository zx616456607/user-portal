/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * cluster create modal
 *
 * v0.1 - 2017-9-20
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Card, Select,Radio, Form,InputNumber, Modal } from 'antd'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'
import { checkName } from '../../../common/naming_validation'
import { getClusterBaymodel,createCluster,getKeypairList } from '../../../actions/openstack/lb'

const notificat = new NotificationHandler()

class CreateModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      template: [],
      keyList:[]
    }
    this.baymodels = {
      flavor_id:'',
      coe:''
    }
  }
  componentWillMount() {
    this.loadData(this.props.project)
  }
  loadData(project){
    this.props.getClusterBaymodel({project: project}, {
      success:{
        func:(res)=> {
          this.setState({template: res.baymodels || []})
        }
      }
    })
    this.props.getKeypairList({project: project}, {
      success:{
        func:(res)=> {
          this.setState({keyList: res.keypairs || []})
        }
      }
    })
  }
  handCancel() {
    const { form, func } = this.props
    func.Modalfunc(false)
  }
  handOk() {
    const { func, form } = this.props
    form.validateFields((error,values)=> {
      if (error) return
      values.bay_create_timeout = '60'
      this.setState({createing: true})
      notificat.spin('创建中...')
      this.props.createCluster(values,{project: this.props.project},{
        success:{
          func:()=> {
            func.Modalfunc(false)
            notificat.success('创建成功')
          },
          isAsync: true
        },
        failed:{
          func:(res)=> {
            let message=''
            try {
              message = res.message.errors[0].detail
            } catch (error) {
            }
            notificat.error('创建失败',message)

          }
        },
        finally:{
          func:()=> {
            notificat.close()
            this.setState({createing: false})
          }
        }
      })
    })
  }
  render() {
    const { func, form } = this.props
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const clusterName= form.getFieldProps('name',{
      rules:[{validator: checkName.bind(this)}]
    })
    const template= form.getFieldProps('baymodel_id',{
      rules:[{required: true}],
      onChange:(value)=> {
        this.state.template.every(item => {
          if (item.uuid === value) {
            const flavorids = item.flavorId.split('-')
            this.baymodels.coe = item.coe
            this.baymodels.flavor_id = '虚拟内核'+ flavorids[0] + ' 虚拟内存 ' +flavorids[1] + 'MB 本地磁盘 '+flavorids[2] +'GB'
            return false
          }
          return true
        })
      }
    })
    const secretKey= form.getFieldProps('keypair',{
      rules:[{required: true}]
    })
    const master= form.getFieldProps('master_count',{
      rules:[{required: true,message:'Master节点个数必须在该范围内:1~50'}],
      initialValue:1
    })
    const slave= form.getFieldProps('node_count',{
      rules:[{required: true,message:'Slave节点个数必须在该范围内:1~50'}],
      initialValue:1
    })
    // const password= form.getFieldProps('current_user_password',{
    //   rules:[{required: true}]
    // })
    const isAllip= form.getFieldProps('l2_only',{
      rules:[{required: true}],
      initialValue: false
    })
    return (
      <Modal visible={true}
        title="创建集群"
        onCancel={() => this.handCancel()}
        onOk={() => this.handOk()}
        className="create_modal_form"
        maskClosable={false}
        confirmLoading={this.state.createing}
      >
        <Form className="reset_form_item_label_style">
          <Form.Item label="名称" {...formItemLayout}>
            <Input {...clusterName}/>
          </Form.Item>
          <Form.Item label="集群模板" {...formItemLayout}>
            <Select {...template}>
              {this.state.template.map(item=> {
                return <Select.Option key={item.uuid}>{item.name}</Select.Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label="密钥对" {...formItemLayout}>
            <Select {...secretKey}>
              {this.state.keyList.map(item=> {
                return <Select.Option key={item.keypair.name}>{item.keypair.name}</Select.Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label="COE引擎" {...formItemLayout}>
            <div>{this.baymodels.coe}</div>
          </Form.Item>
          <Form.Item label="Master节点配置" {...formItemLayout}>
            <div>{this.baymodels.flavor_id}</div>
          </Form.Item>
          <Form.Item label="Master节点数目" {...formItemLayout}>
            <InputNumber {...master} min={1} max={50} style={{width:'40%'}} />
          </Form.Item>
          <Form.Item label="Slave节点配置" {...formItemLayout}>
            <div>{this.baymodels.flavor_id}</div>
          </Form.Item>
          <Form.Item label="Slave节点数目" {...formItemLayout}>
            <InputNumber {...slave} min={1} max={50} style={{width:'40%'}}  />
          </Form.Item>
          {/* <Form.Item label="当前用户密码" {...formItemLayout}>
            <Input  {...password} placeholder="请输入当前用户密码"/>
          </Form.Item> */}
          {/* <Form.Item label={<div>是否分配公网IP<div>到所有节点</div></div>} {...formItemLayout}>
            <RadioGroup {...isAllip}>
              <Radio key="1" value={false}>是</Radio>
              <Radio key="2" value={true}>否</Radio>
            </RadioGroup>
          </Form.Item> */}
        </Form>
      </Modal>
    )
  }
}
CreateModal = Form.create()(CreateModal)

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps,{
  getClusterBaymodel,
  createCluster,
  getKeypairList,
})(CreateModal)

