/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * kaypair create modal
 *
 * v0.1 - 2017-10-12
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Modal,Input,Button, Form } from 'antd'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'
import { checkName } from '../../../common/naming_validation'
import { CreateKeypair } from '../../../actions/openstack/lb'
// import './style/index.less'
const notificat = new NotificationHandler()

class CreateModal extends Component {
  constructor(props) {
    super(props)
    this.okText = props.upload ?'上传':'创建'
    this.state ={
      success: false
    }
  }
  componentWillMount() {

  }
  componentDidMount() {
    document.getElementById('keypairName').focus()
  }
  handCancel() {
    const { form, func } = this.props
    func.Modalfunc(false)
  }
  handOk() {

    const { func, form,upload } = this.props
    let validator = ['keypairName']
    if (upload) {
      validator = validator.concat('public_key')
    }
    form.validateFields(validator,(error,values)=> {
      if (error) return
      const body = {
        "keypair": {
          "name": values.keypairName,
        }
      }
      if (upload) {
        body.keypair.public_key = values.public_key
      }
      this.setState({createing: true})
      notificat.spin(this.okText +'中...')
      this.props.CreateKeypair(body,{project: this.props.project},{
        success:{
          func: (res) => {
            notificat.success(this.okText +'成功')
            this.setState({success: true,keypair: res.keypair})
          }
        },
        failed:{
          func:(res)=> {
            let message =''
            try {
              message = res.message[Object.keys(res.message)[0]].message

            } catch (error) {

            }
            notificat.error(this.okText+'失败',message)
          }
        }
        ,
        finally:{
          func: ()=> {
            notificat.close()
            this.setState({createing: false})
          }
        }
      })
    })
  }
  render() {
    const { func, form,upload } = this.props
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const keypairName= form.getFieldProps('keypairName',{
      rules:[{validator: checkName.bind(this)}]
    })
    const public_key= form.getFieldProps('public_key',{
      rules:[{ required: true,max: 500,message:'请填写公钥，最多可填写500位字符' }]
    })
    const { keypair,success } = this.state

    if (success) {
      return (
        <Modal title="这是您新的密钥对，复制这些信息并安全保存" visible={true}
          onCancel={()=> {this.handCancel();func.loadData()} }
          footer={
          <Button size="large" type="primary" onClick={()=> {this.handCancel();func.loadData()} }>确定</Button>}
          >
          <Form className="reset_form_item_label_style">
            <Form.Item label="密钥对名称" {...formItemLayout}>
              <Input value={keypair.name} />
            </Form.Item>
            <Form.Item label="指纹" {...formItemLayout}>
              <Input  value={keypair.fingerprint}/>
            </Form.Item>
            <Form.Item label="公钥" {...formItemLayout}>
              <Input type="textarea" value={keypair.publicKey} style={{width:'100%',height:'150px',resize:'none'}}/>
            </Form.Item>
            { !upload &&
            <Form.Item label="私钥" {...formItemLayout}>
              <Input type="textarea" value={keypair.privateKey}style={{width:'100%',height:'150px',resize:'none'}}/>
            </Form.Item>
            }

          </Form>
        </Modal>
      )
    }
    return (
      <Modal visible={true}
        title={this.okText+'密钥对'}
        okText={this.okText}
        onCancel={() => this.handCancel()}
        onOk={() => this.handOk()}
        className="create_modal_form"
        maskClosable={false}
        confirmLoading={this.state.createing}
        >
        <Form className="reset_form_item_label_style">
          <Form.Item label="密钥对名称" {...formItemLayout}>
            <Input {...keypairName} placeholder="请输入密钥对名称" />
          </Form.Item>
          { upload &&
            <Form.Item label="公钥" {...formItemLayout}>
            <Input {...public_key} type="textarea" style={{width:'100%',height:'180px',resize:'none'}} placeholder="请输入公钥信息" />
          </Form.Item>
          }
        </Form>
      </Modal>
    )
  }
}

CreateModal = Form.create()(CreateModal)
export default connect(null,{
  CreateKeypair
})(CreateModal)

