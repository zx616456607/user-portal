/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host Resise component
 *
 * v0.1 - 2017-7-15
 * @author Baiyu
 */

import React,{ Component } from 'react'
import {  Modal, Form, Select } from 'antd'
import { connect } from 'react-redux'
import find from 'lodash/find'
import { updateVM } from '../../../actions/openstack/calculation_service'
import NotificationHander from '../../../common/notification_handler'
const Option = Select.Option

class Resise extends Component {
  constructor(props) {
    super()
    this.state = {
      resizing: false
    }
  }
  hostNameExists(rule, value, callback) {
    if (!value) {
      return callback('请选择主机')
    }
    callback()
  }
  oldConfig() {
    const { flavors,form } = this.props
    if(flavors.result && flavors.result.flavors) {
      const configProps =  form.getFieldValue('configProps')
      const list =  flavors.result.flavors.filter(item => {
        if (item.id === configProps) {
          return true
        }
        return false
      })
      if (list.length >0) {
        return <Option key={list[0].id} value={list[0].id}>{list[0].name}</Option>
      }
    }
    return []
  }
  selectConfig() {
    let { flavors, currentHost,form } = this.props
    let currentId = 0
    const configProps =  form.getFieldValue('configProps')
    if (!currentHost && !configProps) return
    if (!currentHost && configProps) {
      currentHost = {
        flavor:{id: configProps}
      }
    }
    if(flavors.result && flavors.result.flavors) {
      flavors.result.flavors.every(item => {
        if (currentHost.flavor.id == item.id) {
          currentId = Number(item.name.split('-')[2])
          return false
        }
        return true
      })
      return flavors.result.flavors.map(item => {
        let disabled
        if (currentId > Number(item.name.split('-')[2])) {
          disabled = true
        }
        return <Option key={item.id} disabled={disabled} value={item.id}>{item.name}</Option>
      })
    }
    return []
  }
  closeModal() {
    const { func, form } = this.props
    func.resiseModalfunc(false)
    form.resetFields()
  }
  handResiseOk() {
    this.setState({
      resizing: true
    })
    let {form, func, resizeCallback, updateVM, images, currentHost, flavors} = this.props
    form.validateFieldsAndScroll((errors,values) => {
      if (errors) {
        this.setState({
          resizing: false
        })
        return
      }
      const image = currentHost.image.id
      const flavor = values.newConfigProps
      images = images.result.images || []
      flavors = flavors.result.flavors || []
      const imageInfo = find(images, (item) => item.id == image)
      const flavorInfo = find(flavors, (item) => item.id == flavor)


      const needMinRam = imageInfo.minRam
      const needMinDisk = imageInfo.minDisk

      const ram = flavorInfo.ram
      const disk = flavorInfo.disk

      if (needMinRam > ram) {
        notification.error('所选配置不满足镜像最低内存需求')
        this.setState({
          resizing: false
        })
        return
      }
      if (needMinDisk > disk) {
        notification.error('所选配置不满足镜像最低硬盘要求')
        this.setState({
          resizing: false
        })
        return
      }

      const notif = new NotificationHander()
      notif.spin('修改云主机配置中')
      updateVM(values.hostID, 'resize',{
        resize: {
          "flavorRef" : values.newConfigProps,
          "OS-DCF:diskConfig": "AUTO"
        }
      }, {
        success: {
          func: () => {
            this.setState({
              resizing: false,
              visible: false
            })
            notif.close()
            notif.success('修改云主机配置请求已提交')
            if(resizeCallback) {
              resizeCallback()
            }
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              resizing: false
            })
            notif.close()
            let message = `修改云主机配置失败`
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                message = `修改云主机配置失败`
              }
            }
            notif.error(message)
          }
        }
      })

    })
  }
  hostList() {
    const { servers } = this.props
    if(servers && servers.servers) {
      return servers.servers.map(server => {
        return <Option key={server.id} value={server.id}>{server.name}</Option>
      })
    }
    return []
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    }

    const { visible,func, currentHost } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, setFieldsValue } = this.props.form;
    let hostProps = getFieldProps('hostID', {
      initialValue: '',
      rules: [
        { validator: this.hostNameExists },
        { required: true, whitespace: true,}
      ],
      onChange: (value) => {
        const { servers } = this.props
        if(servers && servers.servers) {
          const selectServer = find(servers.servers, item => item.id == value)
          setFieldsValue({
            configProps: selectServer.flavor.id
          })
        }
      }
    })
    let configProps =  getFieldProps('configProps', {
      initialValue: '',
      rules: [
        { required: true, whitespace: true, message: '请选择配置' },
      ]
    })
    if(currentHost) {
      hostProps = getFieldProps('hostID', {
        initialValue: currentHost.id,
        rules: [
          { required: true, whitespace: true,}
        ]
      })
      configProps =  getFieldProps('configProps', {
        initialValue: currentHost.flavor.id,
        rules: [
          { required: true, whitespace: true, message: '请选择配置' },
        ]
      })
    }

    const newConfigProps =  getFieldProps('newConfigProps', {
      rules: [
        { required: true, whitespace: true, message: '请选择配置' },
      ]
    })

    return (
      <Modal title="升降配" visible={visible}
        className="ResiseForm hostModalForm"
        onCancel={()=> this.closeModal()}
        onOk={()=> this.handResiseOk()}
        confirmLoading={this.state.resizing}
      >
        <Form>
          <Form.Item label="主机名称" {...formItemLayout}>
           <Select placeholder="请输入主机名称"  {...hostProps}>
             {this.hostList()}
           </Select>
          </Form.Item>
          <Form.Item label="更改前配置规格" {...formItemLayout} >
            <Select {...configProps} disabled={true}>
              {this.oldConfig()}
            </Select>
          </Form.Item>
          <Form.Item label="变更后配置规格" {...formItemLayout}>
            <Select {...newConfigProps}>
              {this.selectConfig()}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    )

  }
}

function mapStateToProps(state, props) {
  let { images, host, networks, flavors, az } = state.openstack
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
  const { currentProject } = state.entities.loginUser.info
  const project = currentProject ? currentProject : ''
  let defaultServers = {
    isFetching: false,
    servers: []
  }
  return {
    networks,
    az,
    images,
    flavors,
    project,
    servers: host
  }
}

export default connect(mapStateToProps, {
  updateVM
})(Form.create()(Resise))
