/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * network create modal
 *
 * v0.1 - 2017-7-18
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Card, Tabs, Select, Form,InputNumber, Modal, Radio, Checkbox } from 'antd'
import { connect } from 'react-redux'
import { DnsModal, HostRoutersModal, AddressPoolModal } from './HeightSetting'
import { getAZList } from '../../../actions/openstack/calculation_service'
import { loadNetworksList, createNetworks, createSubnets } from '../../../actions/openstack/networks'
import NotificationHandler from '../../../common/notification_handler'
import { IP_REGEX } from '../../../../constants'
import { checkName } from '../../../common/naming_validation'
import './style/index.less'

const notificat = new NotificationHandler()
const TabPane = Tabs.TabPane

class BaseSeting extends Component {
  constructor(props) {
    super(props)
  }
  getAZ() {
    let { az } = this.props
    if (!az.result) return
    az = az.result.availabilityZoneInfo
    return az.map(item => {
      return <Option value={item.zoneName} key={item.zoneName}>{item.zoneName}</Option>
    })
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 },
    }
    const { getFieldProps } = this.props.form
    const { id, editer }= this.props
    const netName = getFieldProps('netName', {
      rules: [
        { validator: checkName.bind(this)},
      ],
      // initialValue: editer ? id.name : undefined
    })
    const networkProps = getFieldProps('networkProps', {
      rules: [
        { required: false, message: '请选择网络类型' },
      ]
    })
    const macProps = getFieldProps('macProps', {
      rules: [
        { required: false, message: '请输入物理地址' },
      ]
    })
    const netcommmonProps = getFieldProps('netcommonProps', {
      rules: [
        { required:false, message: '请选择共享网络方式' },
      ],
      initialValue: false
    })
    const pxportProps = getFieldProps('pxportProps', {
      rules: [
        { message: '请选择外部网络方式' },
      ]
    })
    const netAZ = getFieldProps('netAZ', {
      rules: [
        { required: false, message: "请选择可用域" },
      ]
    })
    // [<Form.Item key="nettype" label="网络类型" {...formItemLayout}>
    //         <Select placeholder="请选择网络类型" {...networkProps}>
    //           <Select.Option value="flat">flat</Select.Option>
    //           <Select.Option value="vlan">vlan</Select.Option>
    //           <Select.Option value="vxlan">vxlan</Select.Option>
    //           <Select.Option value="gre">gre</Select.Option>
    //         </Select>
    //       </Form.Item>,
    return (
      <div>
        <Form.Item label="专有网络名称" {...formItemLayout}>
          <Input {...netName} placeholder="请输入网络名称" />
        </Form.Item>
        {/*<Form.Item label="可用域" {...formItemLayout}>
           <Select {...netAZ} placeholder="请选择可用域">
             {this.getAZ()}
            </Select>
        </Form.Item>*/}
        {/*!this.props.editer ?

          [<Form.Item key="macnet" label="物理网络" {...formItemLayout}>
            <Input {...macProps} placeholder="请输入物理网络" />
          </Form.Item>,
          /* <Form.Item key="shared" label="是否共享网络" {...formItemLayout}>
            <Select placeholder="请选择共享网络方式" {...netcommmonProps}>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>] }
          :null}
        */}
        {/* <Form.Item label="是否外部网络" {...formItemLayout}>
          <Select placeholder="请选择外部网络方式" {...pxportProps}>
            <Select.Option value={'true'}>是</Select.Option>
            <Select.Option value={'false'}>否</Select.Option>
          </Select>
        </Form.Item> */}
      </div>

    )
  }
}

// 子网络设置
class ChildSeting extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  checkCidrs(rule, value, callback) {
    if (!value) {
      return callback('错误')
    }
    if (!/^[0-9]+$/.test(value)) {
      return callback('错误')
    }
    callback()
  }

  changeotherCidr(rule,value, callback) {
    if (!value) {
      return callback('错误')
    }
    if (!/^\d+$/.test(value)) {
      return callback('错误')
    }
    if (value && value.length == 3) {
      switch (rule.field) {
        case 'otherCidr1': {
          document.getElementById('otherCidr2').focus()
          return callback()
        }
        case 'otherCidr2': {
          document.getElementById('otherCidr3').focus()
          return callback()
        }
        case 'otherCidr3': {
          document.getElementById('otherCidr4').focus()
          return callback()
        }
        default:
          document.getElementById('otherCidr5').focus()
          return callback()
      }

    }
    callback()
  }
  networkType() {
    const { funcModal,form }= this.props
    const { getFieldProps,getFieldValue } = form
    const networkType = getFieldProps('networkType',{
      initialValue: funcModal.scope.state.childType
    })

    if (funcModal.scope.state.childType == 'quick') {
      // const cidr1 = getFieldProps('cidr1',{
      //   initialValue: '192.168.'+ getFieldValue('cidr1_3')+'.0/24'
      // })
      // const cidr2 = getFieldProps('cidr2',{
      //   initialValue: '10.'+ getFieldValue('cidr2_2')+'.'+getFieldValue('cidr2_3')+'.'+getFieldValue('cidr2_4')+'/'+getFieldValue('cidr2_5')
      // })
      // const cidr3 = getFieldProps('cidr3',{
      //   initialValue: '172.16.'+getFieldValue('cidr2_3')+'.'+getFieldValue('cidr3_4')+'/'+getFieldValue('cidr3_5')
      // })
      return (
        <div className="otherCidr">
          <Radio.Group value={funcModal.scope.state.childRadio} onChange={(e) => funcModal.scope.setState({ childRadio: e.target.value })}>
            <Radio key="1" value={1}>
              <Input value="192" disabled={true} className="radioInput" />
              <span className="unit">.</span>
              <Input value="168" disabled={true} className="radioInput" />
              <span className="unit">.</span>

              <Form.Item style={{display:'inline-block',float:'none'}}>
              <InputNumber max={255} min={0} {...getFieldProps('cidr1_3',{initialValue:0})} className="radioInput" />
              </Form.Item>

              <span className="unit">.</span>
              <Input defaultValue="0" disabled={true} className="radioInput" />
              <span className="unit">/</span>
              <Input defaultValue="24" disabled={true} className="radioInput" />
              <Input style={{display:'none'}} {...getFieldProps('cidr1',{
                initialValue: '192.168.'+ getFieldValue('cidr1_3')+'.0/24'
              })} />
            </Radio>
            <Radio key="2" value={2}>
              <Input value="10" disabled={true} className="radioInput" />
              <span className="unit">.</span>

              <InputNumber max={255} min={0} {...getFieldProps('cidr2_2',{initialValue:0})} className="radioInput" />
              <span className="unit">.</span>

              <InputNumber max={255} min={0} {...getFieldProps('cidr2_3',{initialValue:0})} className="radioInput" />
              <span className="unit">.</span>

              <InputNumber max={255} min={0} {...getFieldProps('cidr2_4',{initialValue:0})} className="radioInput" />
              <span className="unit">/</span>

              <InputNumber max={32} min={1} {...getFieldProps('cidr2_5',{initialValue:24 })} className="radioInput" />
              <Input style={{display:'none'}} {...getFieldProps('cidr2',{
                initialValue: '10.'+ getFieldValue('cidr2_2')+'.'+getFieldValue('cidr2_3')+'.'+getFieldValue('cidr2_4')+'/'+getFieldValue('cidr2_5')
              })} />

            </Radio>
            <Radio key="3" value={3}>
              <Input value="172" disabled={true} className="radioInput" />
              <span className="unit">.</span>

              <Input value="16" disabled={true} className="radioInput" />
              <span className="unit">.</span>

              <InputNumber max={255} min={0} {...getFieldProps('cidr3_3',{initialValue:0})} className="radioInput" />
              <span className="unit">.</span>

              <InputNumber max={255} min={0}  {...getFieldProps('cidr3_4',{initialValue:0})} className="radioInput" />
              <span className="unit">/</span>

              <InputNumber max={32} min={1} {...getFieldProps('cidr3_5',{initialValue: 24})} className="radioInput" />
              <Input style={{display:'none'}} {...getFieldProps('cidr3',{
                initialValue: '172.16.'+ getFieldValue('cidr3_3')+'.'+ getFieldValue('cidr3_4')+ '/'+getFieldValue('cidr3_5')
              })} />
            </Radio>
          </Radio.Group>
        </div>
      )
    }
    return (
      <div className="otherCidr">
      <Radio.Group value={'other'} onChange={(e) => funcModal.scope.setState({ childRadio: e.target.value })}>
        <Radio key="1" value={'other'} checked={true}>
          <Form.Item style={{display:'inline-block',marginLeft:10}}>
          <InputNumber max={223} min={1} className="radioInput" {...getFieldProps('otherCidr1',{
            rules:[{validator: this.changeotherCidr}]
          })} />
          <span className="unit">.</span>
          </Form.Item>
          <Form.Item style={{display:'inline-block'}}>
          <InputNumber max={255} className="radioInput" {...getFieldProps('otherCidr2',{
            rules:[{validator: this.changeotherCidr}]
          })} />
          <span className="unit">.</span>
          </Form.Item>
          <Form.Item style={{display:'inline-block'}}>
          <InputNumber max={255} className="radioInput" {...getFieldProps('otherCidr3',{
            rules:[{validator: this.changeotherCidr}]
          })}/>
          <span className="unit">.</span>
          </Form.Item>
          <Form.Item style={{display:'inline-block'}}>
            <InputNumber max={255} className="radioInput" {...getFieldProps('otherCidr4',{
            rules:[{validator: this.changeotherCidr}]
            })}/>
            <span className="unit">/</span>
          </Form.Item>
          <Form.Item style={{display:'inline-block'}}>
            <InputNumber max={32} min={1} className="radioInput" {...getFieldProps('otherCidr5',{
            rules:[{validator: this.changeotherCidr}]
            })}/>
          </Form.Item>
        </Radio>
      </Radio.Group>
      </div>
    )
  }
  checkgatewayIp(rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value) {
      if (!IP_REGEX.test(value)){
        return callback('输入有误')
      }
    }
    callback()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    }
    const { getFieldProps,getFieldValue } = this.props.form;
    const { scope } = this.props.funcModal
    const netName = getFieldValue('netName') // not delete
    const childName = getFieldProps('childName', {
      initialValue: netName ? netName +'_default_subnet': 'default_subnet',
      rules: [{ validator: function(rule, value, callback) {
        if(!value){
          return callback('子网络名称不能为空')
        }
        if (value.length < 3 || value.length > 47) return callback('长度为3~47位字符')
        return callback()
      }}]
    })
    const gateway_ip = getFieldProps('gateway_ip',{
      rules:[
        {validator: this.checkgatewayIp}
      ]
    })
    return (
      <div>
        <Form.Item label="子网络名称" {...formItemLayout}>
          <Input {...childName} placeholder="请输入子网络名称" />
        </Form.Item>
        <Form.Item label="网络类型" {...formItemLayout} style={{marginBottom:20}}>
          <Radio.Group onChange={(e) => scope.setState({ childType: e.target.value })} value={scope.state.childType}>
            <Radio key="quick" value={"quick"}> 快速设置</Radio>
            <Radio key="other" value={"other"}> 自定义</Radio>
          </Radio.Group>
          {this.networkType()}
        </Form.Item>
        <Form.Item label="网关地址" {...formItemLayout}>
          <Input placeholder="请输入网关地址" {...gateway_ip} disabled={!getFieldValue('gateway')}/>
        </Form.Item>
        <div style={{color:'#999',paddingLeft:'21%',ineHeight:'normal'}}>该地址用于该私有网络内云主机的缺省网关，如不填系统将自动生成</div>
        <Form.Item label=" " {...formItemLayout}>
          <div><Checkbox {...getFieldProps('gateway')}/> 开启网关</div>
          <div><Checkbox defaultChecked={true} {...getFieldProps('dhcp',{initialValue: true})} /> 开启DHCP</div>
        </Form.Item>
      </div>
    )
  }
}

// 高级设置
class HeightSetings extends Component {
  constructor(props) {
    super()
    this.state = {
      dnsModal: false,
      hostRouterModal: false,
      addressPoolModal: false,
      dns: [],
      hostRouters:[],
      addressPool:[]
    }
    this.uuid = 0
    this.hostRouterUUID = 0
    this.addressPoolUUID = 0
    this.dnsModal = this.dnsModal.bind(this)
    this.addDns = this.addDns.bind(this)
  }
  addDns(dnsvalue) {
    const { form } = this.props

    this.uuid++
    // can use data-binding to get
    let keys = form.getFieldValue('keys')
    let dns = this.state.dns.concat([dnsvalue])
    this.setState({ dns })
    keys = keys.concat(this.uuid)
    form.setFieldsValue({
      keys,
    })
    this.setState({
      dnsModal: false
    })
  }
  deleteDns() {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    if(!keys || keys.length == 0)  return
    this.state.dns.splice(this.state.dns.length - 1)
    keys.splice(keys.length - 1)
    form.setFieldsValue({
      keys,
    })
  }
  addHostRouters(hostRouter) {
    const { form } = this.props
    this.hostRouterUUID++
    // can use data-binding to get
    let hostRouterKey = form.getFieldValue('hostRouterKey')
    let hostRouters = this.state.hostRouters.concat([hostRouter])
    this.setState({ hostRouters })
    hostRouterKey = hostRouterKey.concat(this.hostRouterUUID)
    form.setFieldsValue({
      hostRouterKey,
    })
    this.setState({
      hostRouterModal: false
    })
  }
  deleteHostRouters() {
    const { form } = this.props
    let hostRouterKey = form.getFieldValue('hostRouterKey')
    if (!hostRouterKey || hostRouterKey.length == 0) return
    this.state.hostRouters.splice(this.state.hostRouters.length - 1)
    hostRouterKey.splice(hostRouterKey.length - 1)
    form.setFieldsValue({
      hostRouterKey,
    })
  }
  addAddressPool(value) {
    const { form } = this.props
    this.addressPoolUUID++
    // can use data-binding to get
    let addressPoolKey = form.getFieldValue('addressPoolKey')
    let addressPool = this.state.addressPool.concat([value])
    this.setState({ addressPool })
    addressPoolKey = addressPoolKey.concat(this.addressPoolUUID)
    form.setFieldsValue({
      addressPoolKey,
    })
    this.setState({
      addressPoolModal: false
    })
  }
  deleteAddressPool() {
    const { form } = this.props
    let addressPoolKey = form.getFieldValue('addressPoolKey')
    if (!addressPoolKey || addressPoolKey.length == 0) return
    this.state.addressPool.splice(this.state.addressPool.length - 1)
    addressPoolKey.splice(addressPoolKey.length - 1)
    form.setFieldsValue({
      addressPoolKey,
    })
  }
  changeDns(id, num) {
    const value = document.getElementById(id + num).value
    if (!/^\d{3}$/.test(value)) {
      return
    }
    let values = parseInt(value)
    if (value && values.length == 3) {
      switch (num) {
        case '1': {
          document.getElementById(id + '2').focus()
          return
        }
        case '2': {
          document.getElementById(id + '3').focus()
          return
        }
        case '3': {
          document.getElementById(id + '4').focus()
          return
        }
        default: return
      }
    }
  }
  dnsModal(e) {
    this.setState({ dnsModal: e })
  }
  hostRouterModal(value) {
    this.setState({
      hostRouterModal: value
    })
  }
  addressPoolModal(value) {
    this.setState({
      addressPoolModal: value
    })
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    }
    const { getFieldProps } = this.props.form;
    const formItems = ()=> {
      if (this.state.dns.length == 0) {
        return (
          <Form.Item label="DNS服务器" {...formItemLayout}>
            <Card style={{padding: '0px', paddingLeft: '5px', height: '30px'}}>
              <p>可点击左下角 “＋”“－” 添加删减</p>
            </Card>
          </Form.Item>
        )
      }
      return this.state.dns.map((k, index) => {
        return (
          <Form.Item {...formItemLayout} label={index == 0 ? 'DNS服务器' : ''} style={index == 0 ? {} : {marginLeft: '108px'}}  key={`${index}-dns`}>
            <Input disabled={true} {...getFieldProps(`dns-${index}`,{initialValue: k.newdns1 + '.' + k.newdns2 + '.' + k.newdns3 + '.' + k.newdns4} )} style={{ width: '300px', marginRight: 8 }}
            />
          </Form.Item>
        )
      })
    }

    const hostRouters = () => {
      if (this.state.hostRouters.length == 0) {
        return (
          <Form.Item label="主机路由" {...formItemLayout}>
            <Card style={{ padding: '0px', paddingLeft: '5px', height: '30px' }}>
              <p>可点击左下角 “＋”“－” 添加删减</p>
            </Card>
          </Form.Item>
        )
      }
      return this.state.hostRouters.map((k, index) => {
        return (
          <Form.Item {...formItemLayout} label={index == 0 ? '主机路由' : ''} style={index == 0 ? {} : { marginLeft: '108px' }} key={`${index}-hostRouter`}>
            <Input {...getFieldProps(`hostRouters-${index}`, {
              initialValue: k.newHostRouter1 + '.' + k.newHostRouter2 + '.' + k.newHostRouter3 + '.' + k.newHostRouter4 + '/' + k.newHostRouter5 + '     下一跳：' + k.newHostRouter6 + '.' + k.newHostRouter7 + '.' + k.newHostRouter8 + '.' + k.newHostRouter9
            }) } disabled={true} style={{ width: '300px', marginRight: 8 }}
            />
          </Form.Item>
        )
      })
    }

    const addressPool = () => {
      if (this.state.addressPool.length == 0) {
        return (
          <Form.Item label="地址池" {...formItemLayout}>
            <Card style={{ padding: '0px', paddingLeft: '5px', height: '30px' }}>
              <p>可点击左下角 “＋”“－” 添加删减</p>
            </Card>
          </Form.Item>
        )
      }
      return this.state.addressPool.map((k, index) => {
        return (
          <Form.Item {...formItemLayout} label={index == 0 ? '地址池' : ''} style={index == 0 ? {} : { marginLeft: '108px' }} key={`${index}-addressPool`}>
            <Input {...getFieldProps(`addressPool-${index}`, {
              initialValue: '192.168.' + k.newAddressPool1 + '.' + k.newAddressPool2 + ' - ' + '192.168' + '.' + k.newAddressPool3 + '.' + k.newAddressPool4
            }) } disabled={true} style={{ width: '300px', marginRight: 8 }}
            />
          </Form.Item>
        )
      })
    }
    getFieldProps('keys', {
      initialValue: [],
    })
    getFieldProps('hostRouterKey', {
      initialValue: [],
    })
    getFieldProps('addressPoolKey', {
      initialValue: [],
    })

    const dnsCallback = {
      dnsModal: this.dnsModal,
      addDns: this.addDns
    }
    const hostROuterCallback = {
      hostRouterModal: this.hostRouterModal.bind(this),
      addHostRouters: this.addHostRouters.bind(this)
    }
    const addressPoolCallback = {
      addAddressPool: this.addAddressPool.bind(this),
      addressPoolModal: this.addressPoolModal.bind(this)
    }
    return (
      <div className="dnsServer" id="highSettingDnsServer">

        { formItems() }
        <div style={{ paddingLeft: '21%', marginBottom: 20 }}>
          <Button.Group>
            <Button type="primary" icon="plus" onClick={() => this.setState({ dnsModal: true })}></Button>
            <Button icon="minus" onClick={() => this.deleteDns()}></Button>
          </Button.Group>
        </div>

        { hostRouters()}
        <div style={{ paddingLeft: '21%', marginBottom: 20 }}>
          <Button.Group>
            <Button type="primary" icon="plus" onClick={() => this.setState({ hostRouterModal: true })}></Button>
            <Button icon="minus" onClick={() => this.deleteHostRouters()}></Button>
          </Button.Group>
        </div>

        {addressPool()}
        <div style={{ paddingLeft: '21%', marginBottom: 20 }}>
          <Button.Group>
            <Button type="primary" icon="plus" onClick={() => this.setState({ addressPoolModal: true })}></Button>
            <Button icon="minus" onClick={() => this.deleteAddressPool()}></Button>
          </Button.Group>
        </div>
        {
          this.state.dnsModal ?
          <DnsModal dnsModal={true} dnsCallback={dnsCallback} />
          :null
        }
        <HostRoutersModal hostRouterModal={this.state.hostRouterModal} hostRouterCallback={hostROuterCallback}/>
        <AddressPoolModal addressPoolCallback={addressPoolCallback} addressPoolModal={this.state.addressPoolModal}/>
        {/* <Modal title="添加DNS服务器" visible={this.state.dnsModal}
          className="create_modal_form"
          onCancel={()=> this.setState({dnsModal: false})}
          onOk={()=> this.addDns()}
         >
          <br />
           <Form.Item label="DNS服务器" {...formItemLayout}>
            <Input className="radioInput" id="newdns1" onChange={()=> this.changeDns('newdns','1')} />
            <span className="unit">.</span>
            <Input className="radioInput" id="newdns2" onChange={()=> this.changeDns('newdns','2')} />
            <span className="unit">.</span>
            <Input className="radioInput" id="newdns3" onChange={()=> this.changeDns('newdns','3')} />
            <span className="unit">.</span>
            <Input className="radioInput" id="newdns4" onChange={()=> this.changeDns('newdns','4')} />
           </Form.Item>

        </Modal> */}
      </div>
    )
  }
}

class CreateModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabs: '1',
      childRadio: 1,
      childType: 'quick'
    }
  }
  // componentWillMount() {
  //   this.props.getAZList()
  // }
  handCancel() {
    const { form, func } = this.props
    func.Modalfunc(false)
  }
  handOk() {
    const { form, func,loadNetworksList,editer } = this.props

    form.validateFields((errors, values) => {
      if (!!errors) {
        if (this.state.tabs == 2) {
          notificat.info('请在基本设置里输入网络名称')
        }
        return
      }

      const body = {
        network:{
          'name': values.netName,
          'admin_state_up': true,//管理网络的状态标识
          // 'qos_policy_id':null,//QoS策略ID
          'shared':false,// values.netcommonProps,//网络共享标识
        //  'availability_zone_hints':[values.netAZ],
         // 'availability_zones':[values.netAZ]
          //'provider:physical_network':values.macProps,//物理网络
          //'provider:network_type':values.networkProps,//网络类型
        }
      }
      let childCidr
      if (this.state.childType =='quick') {
        switch(this.state.childRadio) {
          case 1:{
            childCidr = values.cidr1
            break
          }
          case 2:{
            childCidr = values.cidr2
            break
          }
          case 3:{
            childCidr = values.cidr3
            break
          }
          default: values.cidr1
        }
      } else {
        childCidr = values.otherCidr1+'.'+values.otherCidr2+'.'+values.otherCidr3+'.'+values.otherCidr4+'/'+values.otherCidr5
      }
      let childBody = {
        cidr:  childCidr || "192.168.0.0/24",
        enable_dhcp: true,
        ip_version: 4,
        name: values.childName || body.network.name + "_default_subnet",
        gateway_ip: values.gateway_ip
      }
      const addressPoolKey = values.addressPoolKey
      const hostRouterKey = values.hostRouterKey
      const dnsKeys = values.keys
      let addressPool
      let hostRouter
      let dns
      if(addressPoolKey && addressPoolKey.length > 0) {
        addressPool = addressPoolKey.map((item, index) => {
          let pool = values[`addressPool-${index}`]
          pool = pool.split('-')
          const start  = pool[0].trim()
          const end = pool[1].trim()
          return {
            start,
            end
          }
        })
      }

      if(hostRouterKey && hostRouterKey.length > 0) {
        hostRouter = hostRouterKey.map((item, index) => {
          let router = values[`hostRouters-${index}`]
          router = router.split('下一跳：')
          const destination = router[0].trim()
          const nexthop = router[1].trim()
          return {
            destination,
            nexthop
          }
        })
      }
      if(dnsKeys && dnsKeys.length > 0) {
          dns = dnsKeys.map((item, index) => {
          return values[`dns-${index}`].trim()
        })
      }
      if(addressPool) {
        childBody.allocation_pools = addressPool
      }
      if (dns) {
        childBody.dns_nameservers = dns
      }
      if (hostRouter) {
        childBody.host_routes = hostRouter
      }
      if (values.dhcp !== undefined) {
        childBody.enable_dhcp = values.dhcp
      }
      if (!values.gateway) {
        delete childBody.gateway_ip
      }
      if (editer) {
        return
      }
      // return
      this.setState({ btnLoading: true })
      notificat.spin('网络创建中...')
      this.props.createNetworks(body,{
        success: {
          func: (res) => {
            childBody.network_id = res.network.id
            func.Modalfunc(false)
            this.props.createSubnets({ subnet: childBody }, {
              success: {
                func: () => {
                  notificat.success('创建网络成功')
                  loadNetworksList()
                },
                isAsync: true
              },
              failed:{
                func: (err)=> {
                  let message =''
                  if(err.message){
                    try{
                      const keys = Object.getOwnPropertyNames(err.message)
                      message = err.message[keys[0]].message
                      if(message.indexOf("Invalid input for operation: Subnet has a prefix length that is incompatible with DHCP service enabled.") >= 0) {
                        message = "当前填入的子网前缀和开启DHCP相冲突"
                      }
                      if(message.indexOf("Invalid input for operation: Gateway is not valid on subnet") >= 0) {
                        message = "所填网关地址对该子网无效"
                      }
                    }catch(error){
                      // message = '创建子网失败'
                    }
                    notificat.error('创建子网失败', message)
                  }
                }
              }
            })
            // form.resetFields()
          },
          isAsync: true
        },
        failed:{
          func:(err)=> {
            if(err.statusCode == 401) {
              notificat.info('登录超时')
              return
            }
            let message=''
            if(err.message) {
              try {
                const keys = Object.getOwnPropertyNames(err.message)
                message = err.message[keys[0]].message
              } catch (error) {
                // message
              }
            }
            notificat.error('创建失败',message)
          }
        },
        finally:{
          func:()=> {
            //func.Modalfunc(false)
            this.setState({btnLoading: false})
            notificat.close()
          }
        }
      })
    })
  }
  render() {
    const { func, visible, editer} = this.props
    const funcModal = {
      scope: this
    }
    return (
      <Modal visible={this.props.visible} title={editer ? '编辑网络':'创建网络'}
        onCancel={() => this.handCancel()}
        onOk={() => this.handOk()}
        className="create_modal_form"
        width={580}
        maskClosable={false}
        confirmLoading={this.state.btnLoading}
      >
        <Form className="reset_form_item_label_style">
           <Tabs activeKey={this.state.tabs} onChange={(tabs)=> this.setState({tabs})}>
           {/* <Tabs activeKey={this.state.tabs} > */}
            <TabPane tab="基本设置" key="1">
              <BaseSeting {...this.props} az={this.props.az}/>
            </TabPane>
             <TabPane tab="子网设置" key="2">
              <ChildSeting {...this.props} childRadio={this.state.childRadio} funcModal={funcModal}/>
            </TabPane>
            <TabPane tab="高级设置" key="3">
              <HeightSetings {...this.props} />
            </TabPane>
          </Tabs>

        </Form>
      </Modal>
    )
  }
}
CreateModal = Form.create()(CreateModal)

function mapStateToProps(state, props) {
  let defaultAZ = {
    isFetching: false,
    result: {
      availabilityZoneInfo: []
    }
  }
  let { az } = state.openstack
  if (!az) {
    az = defaultAZ
  }
  return {
    az
  }
}

export default connect(mapStateToProps,{
  loadNetworksList,
  createNetworks,
  createSubnets,
  getAZList
})(CreateModal)

