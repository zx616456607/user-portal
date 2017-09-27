/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Cluster Storage component
 *
 * v0.1 - 2017-9-8
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Switch, Icon, Form, Select, Input, Button, Modal, Spin } from 'antd'
import { connect } from 'react-redux'
import './style/ClusterStorage.less'
import cloneDeep from 'lodash/cloneDeep'
import { IP_REGEX } from '../../../constants/index'
import CephImg from '../../assets/img/setting/globalconfigceph.png'
import HostImg from '../../assets/img/integration/host.png'
import NfsImg from '../../assets/img/cluster/nfs.png'
import yaml from 'js-yaml'
import StorageClass from '../../../kubernetes/objects/storageClass'
import Secret from '../../../kubernetes/objects/secret'
import NfsStorage from '../../../kubernetes/objects/nfsStorage'
import NfsDeplyment from '../../../kubernetes/objects/nfsDeplyment'
import { createCephStorage, getClusterStorageList, deleteStorageClass, updateStorageClass } from '../../actions/cluster'
import NotificationHandler from '../../components/Notification'

const FormItem = Form.Item
const Option = Select.Option
const Notification = new NotificationHandler()
let validating = false

class ClusterStorage extends Component {
  constructor(props) {
    super(props)
    this.hostChange = this.hostChange.bind(this)
    this.renderCephList = this.renderCephList.bind(this)
    this.renderNfsList = this.renderNfsList.bind(this)
    this.deleteNfs = this.deleteNfs.bind(this)
    this.loadClusterStorageList = this.loadClusterStorageList.bind(this)
    this.isExitName = this.isExitName.bind(this)
    this.validateAllName = this.validateAllName.bind(this)
    this.state = {
      hostChecked: true,
      deleteModalVisible: false,
      cephArray: {
        key: 0,
        listArray:[],
      },
      nfsArray: {
        key: 0,
        listArray: [],
      },
      currentItem: {},
    }
  }

  loadClusterStorageList(){
    const { getClusterStorageList, cluster } = this.props
    const clusterID = cluster.clusterID
    getClusterStorageList(clusterID, {
      success: {
        func: (res) => {
          const cephlist = res.data.cephlist
          const nfslist = res.data.nfslist
          let cephArray = []
          let nfsArray = []
          cephlist.forEach((cephItem, index) => {
            let item = {
              index,
              disabled: true,
              newAdd: false,
            }
            cephArray.push(item)
          })
          nfslist.forEach((nfstem, index) => {
            let item = {
              index,
              disabled: true,
              newAdd: false,
            }
            nfsArray.push(item)
          })
          this.setState({
            cephArray: {
              key: cephArray.length ? cephArray.length : -1,
              listArray: cephArray,
            },
            nfsArray: {
              key: nfsArray.length ? nfsArray.length : -1,
              listArray: nfsArray,
            }
          })
        }
      },
      failed: {
        func: (res) => {
          this.setState({
            cephArray: {
              key: -1,
              listArray: [],
            },
            nfsArray: {
              key: -1,
              listArray: [],
            }
          })
        }
      }
    })
  }

  componentWillMount() {
    this.loadClusterStorageList()
  }

  hostChange(checked){
    this.setState({
      hostChecked: checked,
    })
  }

  editCeph(item){
    const { cephArray } = this.state
    const newCephArray = cloneDeep(cephArray)
    const listArray = newCephArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        listArray[i].disabled = false
        break
      }
    }
    this.setState({
      cephArray: newCephArray
    })
  }

  formatMessage(initialMessage, res){
    let message = initialMessage
    if(res.message){
      message = res.message
    }
    if(res.message && res.message.message){
      message = res.message.message
    }
    return message
  }

  saveCeph(item){
    const { form, createCephStorage, cluster, updateStorageClass, clusterStorage } = this.props
    const { cephArray } = this.state
    const validateArray = [
      `RBD_name${item.index}`,
      `RBD_agent${item.index}`,
      `RBD_monitors${item.index}`,
      `RBD_adminId${item.index}`,
      `RBD_key${item.index}`
    ]
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const agent = values[`RBD_agent${item.index}`]
      const name = values[`RBD_name${item.index}`]
      const monitors = values[`RBD_monitors${item.index}`]
      const adminId =  values[`RBD_adminId${item.index}`]
      const pool = 'tenx-pool'
      const key = values[`RBD_key${item.index}`]
      const clusterID = cluster.clusterID
      if(item.newAdd){
        const secretName = 'ceph-secret'
        const storageClass = new StorageClass(agent, name, monitors, adminId, pool, secretName)
        const secret = new Secret(key, secretName)
        const template = []
        template.push(yaml.dump(storageClass))
        template.push(yaml.dump(secret))
        const body = {
          template: template.join('---\n')
        }
        createCephStorage(clusterID, {type: 'ceph'}, body, {
          success: {
            func: (res) => {
              Notification.success('添加 Ceph 分布式存储成功')
              this.loadClusterStorageList()
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 Ceph 分布式存储失败，请重试'
              message = this.formatMessage(message, res)
              Notification.error(message)
            }
          }
        })
        return
      }
      const cephListData = clusterStorage.cephList
      const secretName = cephListData[item.index].parameters.adminSecretName
      const storageClass = new StorageClass(agent, name, monitors, adminId, pool, secretName)
      const secret = new Secret(key, secretName)
      const template = []
      template.push(yaml.dump(storageClass))
      template.push(yaml.dump(secret))
      const body = {
        template: template.join('---\n')
      }
      return updateStorageClass(clusterID, {type: 'ceph'}, body, {
        success: {
          func: () => {
            Notification.success('修改 Ceph 分布式存储成功')
            this.loadClusterStorageList()
          },
          isAsync: true,
        },
        failed: {
          func: (res) =>  {
            let message = '修改 Ceph 分布式存储失败，请重试'
            message = this.formatMessage(message, res)
            Notification.error(message)
          }
        }
      })
    })
  }

  calcelCeph(item){
    const { cephArray } = this.state
    const { form } = this.props
    const newCephArray = cloneDeep(cephArray)
    const listArray = newCephArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        if(listArray[i].newAdd){
          listArray.splice(i, 1)
          break
        }
        form.resetFields([
          `RBD_name${item.index}`,
          `RBD_agent${item.index}`,
          `RBD_monitors${item.index}`,
          `RBD_adminId${item.index}`,
          `RBD_key${item.index}`
        ])
        listArray[i].disabled = true
        break
      }
    }
    this.setState({
      cephArray: newCephArray
    })
  }

  addCephItem(){
    const { cephArray } = this.state
    const newCephArray = cloneDeep(cephArray)
    const listArray = newCephArray.listArray
    const index = newCephArray.key
    newCephArray.key = index + 1
    listArray.push({
      index: index + 1,
      disabled: false,
      newAdd: true,
    })
    this.setState({
      cephArray: newCephArray,
    })
  }

  checkValue(value, callback){
    if(value.length < 3 || value.length > 63){
      return callback('长度为3～63个字符')
    }
    if(!/^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/.test(value)){
      return callback('可由数字、中划线组成，以字母开头，字母或者数字结尾')
    }
    return callback()
  }

  addNfsItem(){
    const { nfsArray } = this.state
    const newNfsArray = cloneDeep(nfsArray)
    const listArray = newNfsArray.listArray
    const index = newNfsArray.key
    newNfsArray.key = index + 1
    listArray.push({
      index: index + 1,
      disabled: false,
      newAdd: true,
    })
    this.setState({
      nfsArray: newNfsArray,
    })

  }

  renderCephList(){
    const { cephArray } = this.state
    const { clusterStorage } = this.props
    let isFetching = clusterStorage.isFetching
    if(isFetching){
      return <div className='wating_style'><Spin/></div>
    }
    if(!cephArray.listArray || !cephArray.listArray.length){
      return <div className='no_list'>该集群目前还没有添加 ceph 类型的存储</div>
    }
    const cephListData = clusterStorage.cephList
    const formItemLayout = {
    	labelCol: {span: 6},
    	wrapperCol: {span: 18}
    }
    const { form } = this.props
    const { getFieldProps } = form
    const listArray = cephArray.listArray
    let cephList = listArray.map(item => {
      const metadata = cephListData[item.index] ? cephListData[item.index].metadata : {}
      const parameters = cephListData[item.index] ? cephListData[item.index].parameters : {}
      const agentProps = 'tenxcloud.com/storageagent'
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className='list' key={ `ceph_list_${item.index}` }>
          <FormItem
            label="RBD 集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 RBD 集群名称'
              disabled={ item.disabled || !item.newAdd }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`RBD_name${item.index}`, {
                initialValue: metadata ? metadata.name : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群名称不能为空')
                    }
                    if(!/^[a-zA-Z0-9]([a-zA-Z_\-0-9]{1,34})[a-zA-Z0-9]$/.test(value)){
                      return callback('集群名称必须由数字、字母开头，长度为3到36位')
                    }
                    {/* this.validateAllName('ceph') */}
                    if(this.isExitName('ceph', item).cephIsExit){
                      return callback('集群名称已存在！')
                    }
                    this.checkValue(value,callback)
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="RBD agent 地址"
            key="agent_address"
            {...formItemLayout}
          >
            <Input
              placeholder='如：http://192.168.1.1:8011'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`RBD_agent${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations['tenxcloud.com/storageagent'] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('请输入agent地址')
                    }
                    if(!/^(http|https):\/\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5}$/.test(value)){
                      return callback('请输入正确的agent地址')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="RBD 集群配置"
            key="cluster_config"
            {...formItemLayout}
          >
            <Input
              placeholder='如：192.168.1.1:6789，如有多个monitor 节点，请使用英文逗号隔开'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`RBD_monitors${item.index}`, {
                initialValue: parameters ? parameters.monitors : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群配置不能为空')
                    }
                    if(!/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5}(,(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5})*$/.test(value)){
                      return callback('请输入合法的集群配置')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="RBD 认证用户"
            key="username"
            {...formItemLayout}
          >
            <Input
              placeholder='如： admin'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`RBD_adminId${item.index}`, {
                initialValue: parameters ? parameters.adminId : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('认证用户不能为空')
                    }
                    this.checkValue(value, callback)
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="RBD 用户认证密钥"
            key="password"
            {...formItemLayout}
          >
            <Input
              placeholder='请输入用户认证密钥'
              disabled={item.disabled}
              size="large"
              type="password"
              {...getFieldProps(`RBD_key${item.index}`, {
                initialValue: parameters ? parameters.key : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('用户认证密钥不能为空')
                    }
                    if(!/^[a-zA-Z0-9=]{4,63}$/.test(value)){
                      return callback('只能由数字、字母、=组成，长度为4～63个字符')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
        </div>
        <div className='handle_box'>
          {
            item.disabled
            ? <span>
                <Button
                  icon="edit"
                  size="large"
                  type="dashed"
                  className='left_button'
                  onClick={this.editCeph.bind(this, item)}
                />
                <Button
                  icon="delete"
                  className='right_button'
                  size="large"
                  type="dashed"
                  onClick={() => this.setState({
                    deleteModalVisible: true,
                    currentItem: {
                      type: 'ceph',
                      item: cephListData[item.index],
                    }
                  })}
                />
              </span>
            : <span>
                <Button
                  icon="check"
                  size="large"
                  className='left_button'
                  type="primary"
                  onClick={this.saveCeph.bind(this, item)}
                />
                 <Button
                   icon="cross"
                   className='right_button'
                   size="large"
                   onClick={this.calcelCeph.bind(this, item)}
                 />
              </span>
          }
        </div>
        <div className='check_box'></div>
      </div>

    })
    return cephList
  }

  editNfs(item){
    const { nfsArray } = this.state
    const newNfsArray = cloneDeep(nfsArray)
    const listArray = newNfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        listArray[i].disabled = false
        break
      }
    }
    this.setState({
      nfsArray: newNfsArray
    })
  }

  deleteNfs(item){
    const { nfsArray } = this.state
    const newNfsArray = cloneDeep(nfsArray)
    const listArray = newNfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(item && listArray[i].index == item.index){
        listArray.splice(i, 1)
        break
      }
    }
    this.setState({
      deleteModalVisible: false,
      nfsArray: newNfsArray
    })
  }

  saveNfs(item){
    const { form, createCephStorage, cluster, updateStorageClass, registryConfig } = this.props
    const { nfsArray } = this.state
    const validateArray = [
      `nfs_service_name${item.index}`,
      `nfs_service_adderss${item.index}`,
      `nfs_service_path${item.index}`
    ]
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const name = values[`nfs_service_name${item.index}`]
      const ip = values[`nfs_service_adderss${item.index}`]
      const path = values[`nfs_service_path${item.index}`]
      const server = registryConfig.server
      const serverArray = server.split('//')
      const image = `${serverArray[1]}/tenx_containers/nfs-client-provisioner:latest`
      const nfsStorage = new NfsStorage(name)
      const nfsDeployment = new NfsDeplyment(name, ip, path, image)
      const clusterID = cluster.clusterID
      const template = []
      template.push(yaml.dump(nfsStorage))
      template.push(yaml.dump(nfsDeployment))
      const body = {
        template: template.join('---\n')
      }
      // return
      if(item.newAdd){
        return createCephStorage(clusterID, {type: 'nfs'}, body, {
          success: {
            func: () => {
              Notification.success('添加 nfs 分布式存储成功')
              this.loadClusterStorageList()
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 nfs 分布式存储失败，请重试'
              message = this.formatMessage(message, res)
              Notification.error(message)
            }
          }
        })
      }
      return updateStorageClass(clusterID, {type: 'nfs'}, body, {
        success: {
          func: () => {
            Notification.success('修改 nfs 分布式存储成功')
            this.loadClusterStorageList()
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '修改 nfs 分布式存储失败，请重试'
            message = this.formatMessage(message, res)
            Notification.error(message)
          }
        }
      })
    })
  }

  cancelNfs(item){
    const { nfsArray } = this.state
    const { form } = this.props
    const newNfsArray = cloneDeep(nfsArray)
    const listArray = newNfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        if(listArray[i].newAdd){
          listArray.splice(i, 1)
          break
        }
        form.resetFields([
          `nfs_service_name${item.index}`,
          `nfs_service_adderss${item.index}`,
          `nfs_service_path${item.index}`
        ])
        listArray[i].disabled = true
        break
      }
    }
    this.setState({
      nfsArray: newNfsArray
    })
  }

  isExitName(type, config){
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    if(type == 'ceph'){
      let cephIsExit = false
      const { cephArray } = this.state
      const cephNameArray = []
      cephArray.listArray.forEach(item => {
        cephNameArray.push(`RBD_name${item.index}`)
      })
      const cephNameValues = getFieldsValue(cephNameArray)
      const currentValue = getFieldValue(`RBD_name${config.index}`)
      cephArray.listArray.forEach(item => {
        if(cephNameValues[`RBD_name${item.index}`] == currentValue && item.index !== config.index){
          cephIsExit = true
        }
      })
      return { cephIsExit }
    }
    if(type == 'nfs'){
      let nfsIsExit = false
      const { nfsArray } = this.state
      const nfsNameArray = []
      nfsArray.listArray.forEach(item => {
        nfsNameArray.push(`nfs_service_name${item.index}`)
      })
      const nfsNameValues = getFieldsValue(nfsNameArray)
      console.log('nfsNameValues=',nfsNameValues)
      const currentValue = getFieldValue(`nfs_service_name${config.index}`)
      console.log('currentValue=',currentValue)
      nfsArray.listArray.forEach(item => {
        if(nfsNameValues[`nfs_service_name${item.index}`] == currentValue && item.index !== config.index){
          nfsIsExit = true
        }
      })
      return { nfsIsExit }
    }
    return {
      cephIsExit: false,
      nfsIsExit: false,
    }
  }

  validateAllName(type){
    if(validating){
      return
    }
    validating = true
    const { form } = this.props
    const { cephArray, nfsArray } = this.state
    let validateArray = []
    if(type == 'ceph'){
      cephArray.listArray.forEach(item => {
        validateArray.push(`RBD_name${item.index}`)
      })
    } else if(type == 'nfs'){
      nfsArray.listArray.forEach(item => {
        validateArray.push(`nfs_service_name${item.index}`)
      })
    } else {
      validateArray = []
    }
    console.log('validateArray=',validateArray)
    form.validateFields(validateArray, (error, values) => {
      validating = false
    })
  }

  renderNfsList(){
    const { nfsArray } = this.state
    const { clusterStorage } = this.props
    let isFetching = clusterStorage.isFetching
    if(isFetching){
      return <div className='wating_style'><Spin /></div>
    }
    const listArray = nfsArray.listArray
    if(!listArray || !listArray.length){
      return <div className='no_list'>该集群目前还没有添加 nfs 类型的存储</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    const nfsListData = clusterStorage.nfsList
    let nfsList = listArray.map(item => {
      const metadata = nfsListData[item.index] ? nfsListData[item.index].metadata : {}
      const parameters = nfsListData[item.index] ? nfsListData[item.index].parameters : {}
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className='list' key={ `ceph_list_${item.index}` }>
          <FormItem
            label="nfs 服务名称"
            key="service_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 nfs 服务名称'
              disabled={ item.disabled || !item.newAdd }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`nfs_service_name${item.index}`, {
                initialValue: metadata ? metadata.name : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务名称不能为空')
                    }
                    if(!/^[a-zA-Z0-9]([a-zA-Z_\-0-9]{1,34})[a-zA-Z0-9]$/.test(value)){
                      return callback('服务名称必须由数字、字母开头，长度为3到36位')
                    }
                    {/* this.validateAllName('nfs') */}
                    if(this.isExitName('nfs', item).nfsIsExit){
                      return callback('服务名称已存在！')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="nfs 服务地址"
            key="service_address"
            {...formItemLayout}
          >
            <Input
              placeholder='如：192.168.1.1'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`nfs_service_adderss${item.index}`, {
                initialValue: parameters ? parameters.ip : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务地址不能为空')
                    }
                    if(!IP_REGEX.test(value)){
                      return callback('请输入正确的服务地址')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="服务挂载路径"
            key="service_path"
            {...formItemLayout}
          >
            <Input
              placeholder='如：/var/nfs'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`nfs_service_path${item.index}`, {
                initialValue: parameters ? parameters.path : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务挂载路径不能为空')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
        </div>
        <div className='handle_box'>
          {
            item.disabled
              ? <span>
                <Button
                  icon="edit"
                  size="large"
                  type="dashed"
                  className='left_button'
                  onClick={this.editNfs.bind(this, item)}
                />
                <Button
                  icon="delete"
                  className='right_button'
                  size="large"
                  type="dashed"
                  onClick={() => this.setState({
                    deleteModalVisible: true,
                    currentItem: {
                      type: 'nfs',
                      item: nfsListData[item.index]
                    }
                  })}
                />
              </span>
              : <span>
                <Button
                  icon="check"
                  size="large"
                  className='left_button'
                  type="primary"
                  onClick={this.saveNfs.bind(this, item)}
                />
                 <Button
                   icon="cross"
                   className='right_button'
                   size="large"
                   onClick={this.cancelNfs.bind(this, item)}
                 />
              </span>
          }
        </div>
        <div className="check_box"></div>
      </div>
    })
    return nfsList
  }

  confirmDelete(){
    const { currentItem } = this.state
    const { deleteStorageClass, cluster } = this.props
    const clusterID = cluster.clusterID
    const name = currentItem.item.metadata.name
    let type = 'Ceph'
    if(currentItem.type == 'nfs'){
      type = 'nfs'
    }
    deleteStorageClass(clusterID, name, {
      success: {
        func: () => {
          Notification.success(`删除 ${type} 存储设置成功`)
          this.setState({
            deleteModalVisible: false,
          })
          this.loadClusterStorageList()
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          let message = `删除 ${type} 存储设置失败，请重试`
          message = this.formatMessage(message, res)
          Notification.error(message)
        }
      }
    })
  }

  render() {
    const { hostChecked, deleteModalVisible } = this.state
    return(
      <div id='cluster_storage'>
        <div className='host'>
          <div className='header'>
            host&nbsp;(单节点独享型)
          </div>
          <div className="body">
            <div className="img_box host_img">
              <img src={HostImg} alt=""/>
            </div>
            <div className="container">
              <Switch
                checkedChildren="开"
                unCheckedChildren="关"
                className='switch_style'
                checked={hostChecked}
                onChange={this.hostChange}
              />
              <div className='tips'>
                {
                  hostChecked
                  ? <span>使用 host 存储模式，建议在高级设置中开启绑定节点来保持服务数据一致性</span>
                  : <span>未使用 host 存储模式</span>
                }
              </div>
            </div>
          </div>
          <div className="check_box"></div>
        </div>
        <div className='ceph'>
          <div className="header">
            Ceph&nbsp;分布式存储（单节点独享型）
          </div>
          <div className="body">
            <div className="img_box ceph_img">
              <img src={CephImg} alt=""/>
            </div>
            <div className="container">
              { this.renderCephList() }
              <div className='add_button' onClick={() => this.addCephItem()}>
                <Icon type="plus-circle-o" className='add_icon'/>添加存储
              </div>
            </div>
          </div>
          <div className="check_box"></div>
        </div>
        <div className='nfs'>
          <div className="header">
            nfs&nbsp;(多节点共享型)
          </div>
          <div className="body">
            <div className="img_box nfs_img">
              <img src={NfsImg} alt=""/>
            </div>
            <div className="container">
              {this.renderNfsList()}
              <div className='add_button' onClick={() => this.addNfsItem()}>
                <Icon type="plus-circle-o" className='add_icon'/>添加存储
              </div>
            </div>
            <div className="check_box"></div>
          </div>
        </div>

        <Modal
          title="删除存储配置"
          visible={deleteModalVisible}
          closable={true}
          onOk={() => this.confirmDelete()}
          onCancel={() => this.setState({deleteModalVisible:false})}
          width="570px"
          maskClosable={false}
          wrapClassName="delete_cluster_storage"
        >
        	<div className='tips'>
            <i className="fa fa-exclamation-triangle tips_icon" aria-hidden="true"></i>
            请注意，删除该类型存储会对该集群存储的使用有影响，
            删除后将不能基于该存储配置创建存储，请谨慎操作。
        	</div>
          <div className='confirm_tips'>
            <Icon type="question-circle-o" className='confirm_icon'/>
            是否确定移除该存储配置？
          </div>
        </Modal>
      </div>
    )
  }
}

ClusterStorage = Form.create()(ClusterStorage)

function mapStateToProp(state, props) {
  const { entities } = state
  const { cluster } = props
  const clusterID = cluster.clusterID
  const registryConfig = entities.loginUser.info.registryConfig
  let clusterStorage = {
    isFetching: false,
    cephList: [],
    nfsList: [],
  }
  if(state.cluster.clusterStorage && state.cluster.clusterStorage[clusterID]){
    clusterStorage = state.cluster.clusterStorage[clusterID]
  }
  return {
    clusterStorage,
    registryConfig,
  }
}

export default connect(mapStateToProp, {
  createCephStorage,
  getClusterStorageList,
  deleteStorageClass,
  updateStorageClass,
})(ClusterStorage)