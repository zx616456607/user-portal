/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host modal component
 *
 * v0.1 - 2017-7-14
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Modal, Form, Select, Row,Col,Icon, Spin } from 'antd'
import find from 'lodash/find'
import { connect } from 'react-redux'
import { getFlavorList, getAZList, getImageList,  postVM } from '../../../actions/openstack/calculation_service'
import { loadNetworksList } from '../../../actions/openstack/networks'

import { IP_REGEX } from '../../../../constants/index'
import NotificationHandler from '../../../common/notification_handler'
const Option = Select.Option

class HostModal extends Component {
  constructor(props) {
    super()
    this.state = {}
  }
  componentWillMount() {
    this.loadConfiguration()
  }
  loadConfiguration() {
    const { getImageList, loadNetworksList, getFlavorList, getAZList } = this.props
    loadNetworksList()
    getFlavorList()
    getAZList()
    getImageList()
  }
  hostNameExists(rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value.length <3 || value.length > 32) {
      return callback('长度为3~32位字符')
    }
    const { servers } = this.props
    const result = servers.some(item => item.name == value)
    if(result) {
      return callback('主机名称已经存在')
    }
    let regx = new RegExp('^[a-zA-Z0-9]([a-zA-Z0-9_]*[a-zA-Z0-9])$')
    if(!regx.test(value)){
      return callback('数字和字母开头结尾，字母、下划线、数字组成')
    }
    callback()
  }
  getImages() {
    let { images } = this.props
    if (!images.result) return <Option key="notfound"></Option>
    images = images.result.images
    return images.map(image => {
      return <Option key={image.id} value={image.id}>{image.name}</Option>
    })
  }
  getAZ() {
    let { az } = this.props
    if (!az.result) return
    az = az.result.availabilityZoneInfo
    //return az.map(item => {
    //  return <Option value={item.zoneName} key={item.zoneName}>{item.zoneName}</Option>
    //})
    let options = []
    for(let i = 0; i < az.length; i++){
        options.push(<Option value={az[i].zoneName} key={az[i].zoneName}>{az[i].zoneName}</Option>)
    }
    return options
  }
  getNetworks() {
    let { networks } = this.props
    if (!networks.result) return <Option key="notfound"></Option>
    networks = networks.result.networks
    return networks.map(item => {
      return <Option key={item.id} value={item.id}>{item.name}</Option>
    })
  }
  selectConfig() {
    let { flavors } = this.props
    if (!flavors.result) return <Option key="notfound"></Option>
    flavors = flavors.result.flavors
    return flavors.map(item => {
      return <Option key={item.id} value={item.id}>{item.name}</Option>
    })
  }
  closeModal() {
    const { func, form } = this.props
    func.hostModalfunc(false)
    form.resetFields()
  }
  handModalOk() {
    const {form, func, postVM, getListCallback, hideHotModal } = this.props
    if(this.state.creating) return
    this.setState({
      creating: true
    })
    let { flavors, images } = this.props
    const notification = new NotificationHandler()
    form.validateFieldsAndScroll((errors,values) => {
      if (errors) {
        this.setState({
          creating: false
        })
        return
      }
      const image = values.imageProps
      const flavor = values.configProps
      images = images.result.images || []
      flavors = flavors.result.flavors || []
      const imageInfo = find(images, (item) => item.id == image)
      const flavorInfo = find(flavors, (item) => item.id == flavor)


      const needMinRam = imageInfo.minRam
      const needMinDisk = imageInfo.minDisk

      const ram = flavorInfo.ram
      const disk = flavorInfo.disk

      if(needMinRam > ram) {
        notification.error('所选配置不满足镜像最低内存需求')
        this.setState({
          creating: false
        })
        return
      }
      if(needMinDisk > disk) {
        notification.error('所选配置不满足镜像最低硬盘要求')
        this.setState({
          creating: false
        })
        return
      }
      const body = {
        name: values.hostName,
        flavorRef: values.configProps,
        imageRef: values.imageProps,
        availability_zone: values.areaProps,
        networks: [{
          uuid: values.networkProps
        }],
        security_groups: [
          {
            name: 'default'
          }
        ],
        adminPass: values.password,
        'OS-DCF:diskConfig': 'AUTO'
      }
      if(values.ipProps) {
        body.accessIPV4 = values.ipProps
      }
      const self = this
      notification.spin('创建云主机中，请稍后')
      postVM(body, {
        success: {
          func: () => {
            self.setState({
              creating: false
            })
            getListCallback()
            form.resetFields()
            hideHotModal()
            notification.close()
            notification.success('云主机创建成功')
          },
          isAsync: true
        },
        failed: {
          func:(res) => {
            self.setState({
              creating: false
            })
            notification.close()
            let message = '创建云主机失败'
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                const networkMessage = `Network ${values.networkProps} requires a subnet in order to boot instances on.`
                const ramMessage = `Quota exceeded for ram`
                const nameMessage = `Invalid input for field/attribute name.`
                const tooLongName = `is too long`
                const initalMmessage = res.message[keys[0]].message
                message = initalMmessage
                if(initalMmessage == networkMessage){
                  message = '当前网络没有子网络来启动实例'
                }
                if(initalMmessage.substring(0, 22) == ramMessage){
                  message = `所选配置不满足镜像最低内存需求`
                }

                if(initalMmessage.substring(0, 39) == nameMessage && initalMmessage.substring(initalMmessage.length - 11, initalMmessage.length) == tooLongName){
                  message = '主机名称不可用：主机名称过长'
                }
              } catch (err) {
                message = '创建云主机失败'
              }
            }
            notification.error(message)
          }
        }
      })
    })
  }
  render() {
    const { az, networks, flavors, visible } = this.props
    if (!visible) {
      return null
    }
    if(az.isFetching || networks.isFetching || flavors.isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    }
    const { validateFields, getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const hostProps = getFieldProps('hostName', {
      rules: [
        { required: true, message:'请输入主机名称'},
        { validator: (rule, value, callback) => this.hostNameExists(rule, value, callback) },
      ]
    })
    const configProps =  getFieldProps('configProps', {
      rules: [
        { required: true, whitespace: true, message: '请选择配置' },
      ]
    })
    const imageProps =  getFieldProps('imageProps', {
      rules: [
        { required: true, whitespace: true, message: '请选择镜像' },
      ]
    })
    const areaProps =  getFieldProps('areaProps', {
      rules: [
        { required: true, whitespace: true, message: '请选择区域' },
      ]
    })
    const appProps =  getFieldProps('appProps', {
      rules: [
        { whitespace: true, message: '请选择应用' },
      ]
    })
    const networkProps =  getFieldProps('networkProps', {
      rules: [
        { required: true, whitespace: true, message: '请选择网络' },
      ]
    })
    const ipProps =  getFieldProps('ipProps', {
      rules: [
        {
          validator: (rule, value, callback) => {
            if(value) {
              if(!IP_REGEX.test(value)) {
                return callback('请填入正确的IP地址')
              }
            }
            return callback()
          }
        }
      ]
    })
    const password = getFieldProps('password', {
      rules: [
        { required: true, message:'请填写登录密码' },
        {
          validator: (rule, value, callback) => {
            if(!value) {
              return callback()
            }
            const validatePassword = getFieldValue('validatePassword')
            validateFields(['validatePassword'], { force: true})
            return callback()
          }
        }
      ]
    })
    const validatePassword = getFieldProps('validatePassword', {
      rules: [
        { required: true, message:'请确认登录密码' },
        {
        validator: (rule, value, callback) => {
          if(!value) {
            return callback()
          }
          const password = getFieldValue('password')
          if(value != password ) {
            return callback('两次密码填写不一致')
          }
          return callback()
        }
      }]
    })
    return (
      <Modal title="创建云主机" visible={visible}
        className="hostModalForm create_modal_form"
        onCancel={()=> this.closeModal()}
        maskClosable={false}
        onOk={()=> this.handModalOk()}
      >
        <div className="info-row"><span className="front-border"></span>基本信息</div>
        <Form className="reset_form_item_label_style">
          <Form.Item label="主机名称" {...formItemLayout}>
            <Input placeholder="请输入主机名称" {...hostProps} style={{width: '100%'}}/>
          </Form.Item>
          <Form.Item label="镜像" {...formItemLayout}>
            <Select {...imageProps} placeholder="请选择镜像" getPopupContainer={()=> document.getElementsByClassName('reset_form_item_label_style')[0]}>
              {this.getImages()}
            </Select>
          </Form.Item>
          <Form.Item label="配置规格" {...formItemLayout}>
            <Select {...configProps} placeholder="请选择配置规格" getPopupContainer={()=> document.getElementsByClassName('reset_form_item_label_style')[0]}>
             {this.selectConfig()}
            </Select>
          </Form.Item>
          <Form.Item label="所属区域" {...formItemLayout}>
            <Select {...areaProps} placeholder="请选择所属区域" getPopupContainer={()=> document.getElementsByClassName('reset_form_item_label_style')[0]}>
              {this.getAZ()}
            </Select>
          </Form.Item>
         {/*<Form.Item label="所属应用" {...formItemLayout}>
            <Input  {...appProps} />
            <Button type="primary" className="appSelectBtn">选择</Button>
          </Form.Item>
          */}
          <div className="info-row"><span className="front-border"></span>网络设置</div>
          <Form.Item label="网络" {...formItemLayout} getPopupContainer={()=> document.getElementsByClassName('reset_form_item_label_style')[0]} >
            <Select {...networkProps} placeholder="请选择网络">
             {this.getNetworks()}
            </Select>
          </Form.Item>
          <Form.Item label="IP地址" {...formItemLayout}>
            <Input placeholder="请输入IP地址" {...ipProps} />
          </Form.Item>
          <Row>
            <Col span="5">
            </Col>
            <Col span="12" style={{color:'#999'}}> <Icon type="exclamation-circle-o" /> IP 地址也可在创建后，登录云主机设置</Col>
          </Row>
        <div className="info-row"><span className="front-border"></span>安全设置</div>
        <Form.Item label="登录密码" {...formItemLayout}>
        <Input type="password" placeholder="请输入登录密码" {...password} />
        </Form.Item>
        <Form.Item label="确认密码" {...formItemLayout}>
        <Input type="password"  placeholder="请输入登录密码" {...validatePassword} />
        </Form.Item>
        <Row>
        <Col span="5">
        </Col>
        </Row>

        </Form>
      </Modal>
    )

  }
}

function mapStateToProps(state) {
  let { images, networks, flavors, az } = state.openstack
  let defaultFlavors = {
    isFetching: false,
    result: {
      flavors: []
    }
  }
  let defaultNetworks = {
    isFetching: false,
    result: {
      networks: []
    }
  }
  let defaultAZ = {
    isFetching: false,
    result: {
      availabilityZoneInfo: []
    }
  }
  let defaultImages = {
    isFetching: false,
    result: {
      images: []
    }
  }
  if(!networks) {
    networks = defaultNetworks
  }
  if(!flavors) {
    flavors = defaultFlavors
  }
  if(!az) {
    az = defaultAZ
  }
  if(!images) {
    images = defaultImages
  }
  return {
    networks,
    az,
    images,
    flavors
  }
}
export default connect(mapStateToProps, {
  loadNetworksList,
  getAZList,
  getFlavorList,
  getImageList,
  postVM
})(Form.create()(HostModal))
