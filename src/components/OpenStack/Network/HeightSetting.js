/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * network create modal
 *
 * v0.1 - 2017-7-18
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Modal,Form } from 'antd'
// import { IP_REGEX } from '../../../../constants'
// import { connect } from 'react-redux'
// 高级设置
class DnsModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // dnsModal: false
    }
  }
  componentWillMount() {
    setTimeout(()=> {
      document.getElementById('newdns1').focus()
    },300)
  }
  addDns() {
    const { form,dnsCallback } = this.props
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      form.resetFields()
      dnsCallback.addDns(values)
    })
  }
  changeDns(rule,value,callback) {
    if (!value) {
      return callback('请输入')
    }
    let values = parseFloat(value)
    if (!/^\d+$/.test(values)) {
      callback('请输入数字')
      return
    }
    if(value < 0 || value > 255) {
      return callback('0至255')
    }
    if (value && value.length ==3) {
      switch(rule.field) {
        case 'newdns1':{
          document.getElementById('newdns2').focus()
          return callback()
        }
        case 'newdns2':{
          document.getElementById('newdns3').focus()
          return callback()
        }
        case 'newdns3':{
          document.getElementById('newdns4').focus()
          return callback()
        }
        default:return callback()
      }

    }
    return callback()
  }
  closeDns() {
    this.props.dnsCallback.dnsModal(false)
    const {form } = this.props
    form.resetFields()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const { getFieldProps, getFieldValue} = this.props.form;

    const newdns1 = getFieldProps('newdns1', {
      rules: [
        { validator: this.changeDns },
      ]
    })
    const newdns2 = getFieldProps('newdns2', {
      rules: [
        { validator: this.changeDns },
      ]
    })
    const newdns3 = getFieldProps('newdns3', {
      rules: [
        { validator: this.changeDns },
      ]
    })
     const newdns4 = getFieldProps('newdns4', {
      rules: [
        { validator: this.changeDns },
      ]
    })

    return (
      <Modal title="添加DNS服务器" visible={this.props.dnsModal}
        className="create_modal_form"
        onCancel={()=>this.closeDns() }
        onOk={()=> this.addDns()}
        >
        <Form inline>
          <Form.Item label="DNS服务器">
            <Input className="radioInput" {...newdns1} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newdns2} />
            <span className="unit">.</span>
          </Form.Item>

          <Form.Item>
            <Input className="radioInput"  {...newdns3} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newdns4}/>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

class HostRoutersModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // dnsModal: false
    }
  }
  addHostRouterModal() {
    const { form,hostRouterCallback } = this.props
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      form.resetFields()
      hostRouterCallback.addHostRouters(values)
    })
  }
  changeHostRouter(rule,value,callback) {
    if (!value) {
      return callback('请输入')
    }
    let values = parseFloat(value)
    if (!/^\d+$/.test(values)) {
      callback('请输入数字')
      return
    }
    if(value < 0 || value > 255) {
      return callback('0至255')
    }
    if (value && value.length ==3) {
      switch(rule.field) {
        case 'newHostRouter1':{
          document.getElementById('newHostRouter2').focus()
          return callback()
        }
        case 'newHostRouter2':{
          document.getElementById('newHostRouter3').focus()
          return callback()
        }
        case 'newHostRouter3': {
          document.getElementById('newHostRouter4').focus()
          return callback()
        }
        case 'newHostRouter4': {
          document.getElementById('newHostRouter5').focus()
          return callback()
        }
        case 'newHostRouter5': {
          document.getElementById('newHostRouter6').focus()
          return callback()
        }
        case 'newHostRouter6': {
          document.getElementById('newHostRouter7').focus()
          return callback()
        }
        case 'newHostRouter7': {
          document.getElementById('newHostRouter8').focus()
          return callback()
        }
        case 'newHostRouter8': {
          document.getElementById('newHostRouter9').focus()
          return callback()
        }
        default:return callback()
      }

    }
    return callback()
  }
  closeHostRouterModal() {
    this.props.hostRouterCallback.hostRouterModal(false)
    const {form } = this.props
    form.resetFields()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const { getFieldProps, getFieldValue} = this.props.form;

    const newHostRouter1 = getFieldProps('newHostRouter1', {
      rules: [
        { validator: this.changeHostRouter },
      ]
    })
    const newHostRouter2 = getFieldProps('newHostRouter2', {
      rules: [
        { validator: this.changeHostRouter },
      ]
    })
    const newHostRouter3 = getFieldProps('newHostRouter3', {
      rules: [
        { validator: this.changeHostRouter },
      ]
    })
     const newHostRouter4 = getFieldProps('newHostRouter4', {
      rules: [
        { validator: this.changeHostRouter },
      ]
    })
     const newHostRouter5 = getFieldProps('newHostRouter5', {
       rules: [
         { validator: this.changeHostRouter },
       ]
     })
     const newHostRouter6 = getFieldProps('newHostRouter6', {
       rules: [
         { validator: this.changeHostRouter },
       ]
     })
     const newHostRouter7 = getFieldProps('newHostRouter7', {
       rules: [
         { validator: this.changeHostRouter },
       ]
     })
     const newHostRouter8 = getFieldProps('newHostRouter8', {
       rules: [
         { validator: this.changeHostRouter },
       ]
     })
     const newHostRouter9 = getFieldProps('newHostRouter9', {
       rules: [
         { validator: this.changeHostRouter },
       ]
     })


    return (
      <Modal title="添加主机路由" visible={this.props.hostRouterModal}
        className="create_modal_form"
        onCancel={()=>this.closeHostRouterModal() }
        onOk={()=> this.addHostRouterModal()}
        width={580}
        >
        <Form inline>
          <Form.Item label="DNS服务器">
            <Input className="radioInput" {...newHostRouter1} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newHostRouter2} />
            <span className="unit">.</span>
          </Form.Item>

          <Form.Item>
            <Input className="radioInput"  {...newHostRouter3} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newHostRouter4}/>
          </Form.Item>
          /
          <Form.Item>
            <Input style={{marginLeft: '5px'}} className="radioInput"  {...newHostRouter5}/>
          </Form.Item>
          <p><br /></p>
          <Form.Item label="下一跳">
            <Input className="radioInput" {...newHostRouter6} style={{marginLeft: '24px'}}/>
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newHostRouter7} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newHostRouter8} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newHostRouter9}/>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

class AddressPoolModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // dnsModal: false
    }
  }
  addAddressPoolModal() {
    const { form, addressPoolCallback } = this.props
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      form.resetFields()
      addressPoolCallback.addAddressPool(values)
    })
  }
  changeAddressPool(rule,value,callback) {
    if (!value) {
      return callback('请输入')
    }
    let values = parseFloat(value)
    if (!/^\d+$/.test(values)) {
      callback('请输入数字')
      return
    }
    if(value < 0 || value > 255) {
      return callback('0至255')
    }
    if (value && value.length ==3) {
      switch(rule.field) {
        case 'newAddressPool1':{
          document.getElementById('newAddressPool2').focus()
          return callback()
        }
        case 'newAddressPool2':{
          document.getElementById('newAddressPool3').focus()
          return callback()
        }
        case 'newAddressPool3': {
          document.getElementById('newAddressPool4').focus()
          return callback()
        }
      }
    }
    return callback()
  }
  closeAddressPoolModal() {
    this.props.addressPoolCallback.addressPoolModal(false)
    const {form } = this.props
    form.resetFields()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const { getFieldProps, getFieldValue} = this.props.form;

    const newAddressPool1 = getFieldProps('newAddressPool1', {
      rules: [
        { validator: this.changeAddressPool },
      ]
    })
    const newAddressPool2 = getFieldProps('newAddressPool2', {
      rules: [
        { validator: this.changeAddressPool },
      ]
    })
    const newAddressPool3 = getFieldProps('newAddressPool3', {
      rules: [
        { validator: this.changeAddressPool },
      ]
    })
     const newAddressPool4 = getFieldProps('newAddressPool4', {
      rules: [
        { validator: this.changeAddressPool },
      ]
    })

    return (
      <Modal title="添加地址池" visible={this.props.addressPoolModal}
        className="create_modal_form heightSettingAddressPool"
        onCancel={()=>this.closeAddressPoolModal() }
        onOk={()=> this.addAddressPoolModal()}
        width={760}
        >
        <Form inline>
          <Form.Item label="地址池">
            <Input className="radioInput" value="192" disabled={true}/>
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  value="168" disabled={true}/>
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newAddressPool1} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newAddressPool2} style={{marginRight: '5px'}}/>
          </Form.Item>
          -
          <Form.Item>
            <Input style={{marginLeft: '5px'}} className="radioInput"  value="192" disabled={true}/>
          </Form.Item>
          <Form.Item >
            <Input className="radioInput" value="168" disabled={true}/>
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newAddressPool3} />
            <span className="unit">.</span>
          </Form.Item>
          <Form.Item>
            <Input className="radioInput"  {...newAddressPool4} />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}


DnsModal = Form.create()(DnsModal)
HostRoutersModal = Form.create()(HostRoutersModal)
AddressPoolModal = Form.create()(AddressPoolModal)
export {
  DnsModal,
  HostRoutersModal,
  AddressPoolModal
}