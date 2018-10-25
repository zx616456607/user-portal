/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * create loadBalancer modal component
 *
 * v0.1 - 2017-10-23
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Input,InputNumber, Modal, Form,Select,Button } from 'antd'
import { connect } from 'react-redux'
import { getLbDescriptName,createopenstackRealLB } from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'

class CrateLb extends Component {
  constructor(props) {
    super()
    this.state ={
      descript:[],
      descriptName:false,// detail button
    }
  }
  componentWillMount() {
    this.props.getLbDescriptName({
      success:{
        func:(res)=> {
          if (res.vnfDescriptors) {
            this.setState({descript:res.vnfDescriptors})
          }
        }
      }
    })
  }
  comfirmCreate() {
    const { form, createopenstackRealLB,func,type } = this.props
    form.validateFields((errors,values) => {
      if(!!errors){
        return
      }
      this.setState({
        loadingCreate: true
      })
      const notify =  new NotificationHandler()
      notify.spin('创建负载均衡中')
      values.name = type + values.name
      createopenstackRealLB(values, {
        success: {
          func:() => {
            notify.close()
            notify.success('创建负载均衡成功')
            func.loadData()
            func.scope.setState({
              createVisible: false
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            notify.close()
            let message = '创建负载均衡失败，请稍后重试'
            if(res.message){
              let initialMessage = res.message
              if(initialMessage.substring(0, 15) == "Invalid network"){
                message = '网络不可用，请重新选择网络'
              } else {
                message = res.message
              }
            }
            notify.error(message)

          }
        },
        finally:{
          func:() => {
            this.setState({
              loadingCreate: false
            })
          }
        }
      })
    })
  }
  openDetail() {
    let detail ={}
    this.state.descript.every((list)=> {
      if (list.name === this.state.descriptName) {
        detail = list
        return false
      }
      return true
    })
    Modal.success({
      title:'详细信息',
      width:'650px',
      style:{top:'30px'},
      content: <div style={{whiteSpace:'pre',height:'500px',overflow: 'scroll'}}>{JSON.stringify(detail, null, 3)}</div>
    })
  }
  checkBalancerName = (rule,value,callback) => {
    if(!value) return callback('VNF名称不能为空')
    if (value.length <2 ) return callback('至少要输入2位字符')
    if (value.length > 30) return callback('最多可填30位字符')
    if (this.props.data) {
      let hasName
      this.props.data.every((item)=> {
        if (item.name == value) {
          hasName = true
          return false
        }
        return true
      })
      if (hasName) {
        return callback('名称已存在，请重新输入')
      }
    }
    return callback()
  }
  render() {
    const { form,func } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 }
    }
    const loadBalancerNameProps = form.getFieldProps('name',{
      rules: [{ validator: this.checkBalancerName}]
    })
    const _this = this
    const descriptProps = form.getFieldProps('vnf_descriptor_name', {
      rules: [{ required: true, message:'请选择Descriptor名称'}],
      onChange:(item)=> {
        _this.setState({descriptName: item})
      }
    })
    const countProps = form.getFieldProps('vnf_count',{
      rules: [{ required: true, message:'请输入VNF数量'}],
      initialValue:1
    })
    return (
      <Modal
        title="创建负载均衡"
        visible={true}
        onOk={()=> this.comfirmCreate()}
        onCancel={() => {func.scope.setState({ createVisible: false })}}
        width='570px'
        maskClosable={false}
        confirmLoading={this.state.loadingCreate}
        wrapClassName="reset_form_item_label_style"
        >
        <Form>
          <Form.Item
            {...formItemLayout}
            label="VNF名称"
          >
            <Input placeholder='请输入VNF名称' {...loadBalancerNameProps}/>
          </Form.Item>
          <Form.Item {...formItemLayout}
            label="VNF Descriptor名称">
            <Select {...descriptProps} placeholder="请选择Descriptor名称">
              {this.state.descript.map(item => {
                return(
                  <Select.Option key={item.name}>{item.name}</Select.Option>
                )
              })}
            </Select>
            { !!this.state.descriptName &&
              <div style={{position:'absolute',right:'-75px',top:'0px'}}><Button type="ghost" onClick={()=> this.openDetail()} size="large" >详情</Button></div>
            }
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label="VNF数量"
            >
            <InputNumber {...countProps} min={1} max={128} step={1}/>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default connect(null,{
  getLbDescriptName,
  createopenstackRealLB
})(Form.create()(CrateLb))