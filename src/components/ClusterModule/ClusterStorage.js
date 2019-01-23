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
import { Switch, Icon, Form, Select, Input, Button, Modal, Spin, Tooltip, Alart } from 'antd'
import { connect } from 'react-redux'
import './style/ClusterStorage.less'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import { IP_REGEX, IP_PATH_REGEX } from '../../../constants/index'
import CephImg from '../../assets/img/setting/globalconfigceph.png'
import HostImg from '../../assets/img/integration/host.png'
import NfsImg from '../../assets/img/cluster/nfs.png'
import GlusterImg from '../../assets/img/cluster/glusterfs.png'
import yaml from 'js-yaml'
import StorageClass from '../../../kubernetes/objects/storageClass'
import Secret from '../../../kubernetes/objects/secret'
import NfsStorage from '../../../kubernetes/objects/nfsStorage'
import GfsSecret from '../../../kubernetes/objects/gfsSecret'
import GfsStorage from '../../../kubernetes/objects/gfsStorage'
import NfsDeplyment from '../../../kubernetes/objects/nfsDeplyment'
import HostTemplate from '../../../kubernetes/objects/hostTemplate'
import { createCephStorage, getClusterStorageList, deleteStorageClass, updateStorageClass } from '../../actions/cluster'
import { getStorageClassType, setDefaultStorage } from '../../actions/storage'
import NotificationHandler from '../../components/Notification'
import { genRandomString } from '../../common/tools'

const FormItem = Form.Item
const Option = Select.Option
const PATH_REG = /^\//
const Notification = new NotificationHandler()
let validating = false
const RANDOM_KEY = '0123456789qwertyuioplkjhgfdsazxcvbnm'

function inputFocusMethod(node){
  node.focus();
  const value = node.value
  if(value){
    node.selectionStart = value.length
    node.selectionEnd = value.length
  }
}

class ClusterStorage extends Component {
  constructor(props) {
    super(props)
    this.renderCephList = this.renderCephList.bind(this)
    this.renderNfsList = this.renderNfsList.bind(this)
    this.deleteNfs = this.deleteNfs.bind(this)
    this.loadClusterStorageList = this.loadClusterStorageList.bind(this)
    this.isExitName = this.isExitName.bind(this)
    this.validateAllName = this.validateAllName.bind(this)
    this.loadStorageClassType = this.loadStorageClassType.bind(this)
    this.renderHostTips = this.renderHostTips.bind(this)
    this.onDefSetCancel = this.onDefSetCancel.bind(this)
    this.state = {
      hostChecked: true,
      hostIsFetching: true,
      hostVisible: false,
      loading: false,
      deleteModalVisible: false,
      cephArray: {
        key: 0,
        listArray:[],
      },
      nfsArray: {
        key: 0,
        listArray: [],
      },
      gfsArray: {
        key: 0,
        listArray: [],
      },
      currentItem: {},
      cephLoading: false,
      nfsLoading: false,
      gfsLoading: false,
      isShowSetDefaultModal: false,
      currType: "",
      defaultStorage: "",
      hostDir: '/usr/share/hostpath',
      initialHostDir: '/usr/share/hostpath',
      hostDirEditDisable: true
    }
  }

  loadStorageClassType(){
    const { getStorageClassType, cluster } = this.props
    const clusterID = cluster.clusterID
    getStorageClassType(clusterID, {
      success: {
        func: res => {
          const hostChecked = res.data.host
          this.setState({
            hostChecked,
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            hostIsFetching: false,
          })
        }
      }
    })
  }

  loadClusterStorageList(){
    const { getClusterStorageList, cluster } = this.props
    const clusterID = cluster.clusterID
    getClusterStorageList(clusterID, {
      success: {
        func: (res) => {
          const cephlist = res.data.cephList
          const nfslist = res.data.nfsList
          const gfslist = res.data.glusterfsList
          let cephArray = []
          let nfsArray = []
          let gfsArray = []
          this.setState({
            hostDir: res.data.hostList[0] && res.data.hostList[0].parameters.baseDir,
            initialHostDir: res.data.hostList[0] && res.data.hostList[0].parameters.baseDir
          })
          cephlist.forEach((cephItem, index) => {
            let isDefault = cephItem.metadata.labels["system/storageDefault"] === "true"
            let item = {
              index,
              disabled: true,
              seePwd: false,
              readOnly: true,
              isDefault,
            }
            cephArray.push(item)
          })
          nfslist.forEach((nfstem, index) => {
            let isDefault = nfstem.metadata.labels["system/storageDefault"] === "true"
            let item = {
              index,
              disabled: true,
              isDefault,
            }
            nfsArray.push(item)
          })
          gfslist.forEach((gfstem, index) => {
            let isDefault = gfstem.metadata.labels["system/storageDefault"] === "true"
            let item = {
              index,
              disabled: true,
              isDefault,
            }
            gfsArray.push(item)
          })
          this.setState({
            cephArray: {
              key: cephArray.length ? cephArray.length : -1,
              listArray: cephArray,
              list: cephlist,
            },
            nfsArray: {
              key: nfsArray.length ? nfsArray.length : -1,
              listArray: nfsArray,
              list: nfslist,
            },
            gfsArray: {
              key: gfsArray.length ? gfsArray.length : -1,
              listArray: gfsArray,
              list: gfslist,
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
    this.loadStorageClassType()
  }

  confirmSetHost(){
    const { createCephStorage, cluster, deleteStorageClass } = this.props
    const { hostChecked } = this.state
    const clusterID = cluster.clusterID
    if(hostChecked){
      deleteStorageClass(clusterID, 'host-storage' , {
        success: {
          func: () => {
            this.setState({
              hostChecked: false,
              hostVisible: false,
            })
            Notification.success('关闭 host 存储成功')
          }
        },
        failed: {
          func: res => {
            let message = '关闭 host 存储失败，请重试'
            if(res.message){
              message = res.message
            }
            Notification.warn(message)
          }
        },
        finally: {
          func: () => {
            this.setState({
              loading: false,
            })
          }
        }
      })
      return
    }
    const hostTemplate = new HostTemplate('/usr/share/hostpath')
    const body = {
      template: yaml.dump(hostTemplate)
    }
    createCephStorage(clusterID, {type: 'host'}, body, {
      success: {
        func: res => {
          this.setState({
            hostVisible: false,
            hostChecked: true,
          })
          Notification.success('开启 host 存储成功')
        }
      },
      failed: {
        func: res => {
          let message = '开启 host 存储失败，请重试'
          if(res.message){
            message = res.message
          }
          Notification.warn(message)
        }
      },
      finally: {
        func: () => {
          this.setState({
            loading: false,
          })
        }
      }
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
    setTimeout(() => {
      const id = `RBD_name${item.index}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
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
      `RBD_key${item.index}`,
      `RBD_radosgw${item.index}`,
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
      const radosgw = values[`RBD_radosgw${item.index}`]
      const clusterID = cluster.clusterID
      const cephList = clusterStorage.cephList || []
      let secretName = ''
      let cephName = ''
      if(item.newAdd){
        secretName = 'ceph-secret'
        cephName = `tenx-rbd-${genRandomString(RANDOM_KEY)}`
      } else {
        secretName = cephList[item.index].parameters.adminSecretName
        cephName = cephList[item.index].metadata.name
      }
      const config = {
        agent,
        name: cephName,
        scName: name,
        monitors,
        adminId,
        pool,
        secretName,
      }
      const storageClass = new StorageClass(config)
      if (!isEmpty(radosgw)) {
        storageClass.setRadosgw(radosgw)
      }
      const secret = new Secret(key, secretName)
      const template = []
      template.push(yaml.dump(storageClass))
      template.push(yaml.dump(secret))
      const body = {
        template: template.join('---\n')
      }
      this.setState({cephLoading: true})
      if(item.newAdd){
        createCephStorage(clusterID, {type: 'ceph'}, body, {
          success: {
            func: (res) => {
              Notification.success('添加 Ceph 存储配置成功')
              this.loadClusterStorageList()
              this.resetLoading('cephLoading')
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 Ceph 存储配置失败，请重试'
              message = this.formatMessage(message, res)
              Notification.warn(message)
              this.resetLoading('cephLoading')
            }
          }
        })
        return
      }
      return updateStorageClass(clusterID, {type: 'ceph'}, body, {
        success: {
          func: () => {
            Notification.success('修改 Ceph 存储配置成功')
            this.loadClusterStorageList()
            this.resetLoading('cephLoading')
          },
          isAsync: true,
        },
        failed: {
          func: (res) =>  {
            let message = '修改 Ceph 存储配置失败，请重试'
            message = this.formatMessage(message, res)
            Notification.warn(message)
            this.resetLoading('cephLoading')
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
          `RBD_key${item.index}`,
          `RBD_radosgw${item.index}`,
        ])
        listArray[i].disabled = true
        listArray[i].seePwd = false
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
      readOnly: true,
    })
    setTimeout(() => {
      const id = `RBD_name${index + 1}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
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

  addGlusterFSItem(){
    const { gfsArray } = this.state
    const newGfsArray = cloneDeep(gfsArray)
    const listArray = newGfsArray.listArray
    const index = newGfsArray.key
    newGfsArray.key = index + 1
    listArray.push({
      index: index + 1,
      disabled: false,
      newAdd: true,
    })
    setTimeout(() => {
      const id = `gfs_name${index + 1}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
    this.setState({
      gfsArray: newGfsArray,
    })

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
    setTimeout(() => {
      const id = `nfs_service_name${index + 1}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
    this.setState({
      nfsArray: newNfsArray,
    })

  }
  cephSeePwdType = (data) => {
    let { index, seePwd, disabled } = data
    if (disabled) return
    const { cephArray } = this.state
    const list = []
    cephArray.listArray.map(local => list.push(local.index !== index ? local : { ...local, seePwd: !seePwd }))
    this.setState({
      cephArray: {
        ...this.state.cephArray,
        listArray: list,
      },
    })
  }
  gfsSeePwdType = (data) => {
    let { index, seePwd, disabled } = data
    if (disabled) return
    const { gfsArray } = this.state
    const list = []
    gfsArray.listArray.map(local => list.push(local.index !== index ? local : { ...local, seePwd: !seePwd }))
    this.setState({
      gfsArray: {
        ...this.state.gfsArray,
        listArray: list,
      },
    })
  }
  setReadOnly = (data, readOnly) => {
    const { index, disabled } = data
    if (disabled) return
    const { cephArray } = this.state
    const list = []
    cephArray.listArray.map(local => list.push(local.index !== index ? local : { ...local, readOnly }))
    this.setState({
      cephArray: {
        ...this.state.cephArray,
        listArray: list,
      },
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
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className={item.isDefault ? 'list defaultStorage' : 'list'} key={ `ceph_list_${item.index}` }>
          { item.isDefault&&
          <div className="dafaultGroup">默认</div>
          }
          <FormItem
            label="集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 Ceph 集群名称'
              disabled={ item.disabled }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`RBD_name${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations[`system/scName`] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群名称不能为空')
                    }
                    if(!/^[\u4e00-\u9fa5|a-zA-Z_\-0-9]{3,36}$/.test(value)){
                      return callback('集群名称由数字、字母、下划线、汉字组成，长度为3到36位')
                    }
                    {/* this.validateAllName('ceph') */}
                    if(this.isExitName('ceph', item).cephIsExit){
                      return callback('集群名称已存在！')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="agent 地址"
            key="agent_address"
            {...formItemLayout}
          >
            <Input
              placeholder='如：http://192.168.1.123:8001'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`RBD_agent${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations['system/storageagent'] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('请输入agent地址')
                    }
                    if(!this.testAgent(value)){
                      return callback('请输入正确的agent地址')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="集群配置"
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
            label="radosgw 地址"
            key="radosgw"
            {...formItemLayout}
          >
            <Input
              placeholder='如：192.168.0.4:8080'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`RBD_radosgw${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations['radosgw'] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback() // 允许为空
                    }
                    if(!/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5}(,(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5})*$/.test(value)){
                      return callback('请输入正确的radosgw地址')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="认证用户"
            key="username"
            {...formItemLayout}
          >
            <Input
              placeholder='如： admin'
              disabled={item.disabled}
              size="large"
              autoComplete="on"
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
            label="用户认证密钥"
            key="password"
            {...formItemLayout}
          >
            <Input
              placeholder='请输入用户认证密钥'
              disabled={item.disabled}
              size="large"
              autoComplete="on"
              readOnly={item.readOnly}
              onFocus={() => this.setReadOnly(item, false)}
              onBlur={() => this.setReadOnly(item, true)}
              type={!item.disabled && item.seePwd ? 'text' : 'password' }
              {...getFieldProps(`RBD_key${item.index}`, {
                initialValue: parameters ? parameters.key : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('用户认证密钥不能为空')
                    }
                    if(value.length < 4 || value.length > 63){
                      return callback('长度为4～63个字符')
                    }
                    return callback()
                  }
                }]
              })}
            />
            <Icon
              className={item.disabled? "clusterStorageIconEyeDisabled" : "clusterStorageIconEye"}
              type={item.seePwd ? 'eye-o' : 'eye'}
              onClick={() => this.cephSeePwdType(item)}
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
              : <span className="btnContainer">
                <Spin spinning={this.state.cephLoading}>
                  <Button
                    icon="check"
                    size="large"
                    className='left_button'
                    type="primary"
                    onClick={this.saveCeph.bind(this, item)}
                  />
                </Spin>
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
    setTimeout(() => {
      const id = `nfs_service_name${item.index}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
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
    const { form, createCephStorage, cluster, updateStorageClass, registryConfig, clusterStorage } = this.props
    const { nfsArray } = this.state
    const validateArray = [
      `nfs_service_name${item.index}`,
      `nfs_service_adderss${item.index}`
    ]
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const name = values[`nfs_service_name${item.index}`]
      const ipWithPath = values[`nfs_service_adderss${item.index}`]
      let [ip, ...path] = ipWithPath.split('/')
      path = '/' + path.join('/')

      const server = registryConfig.server
      const serverArray = server.split('//')
      const image = `${serverArray[1]}/system_containers/nfs-client-provisioner:v5.2.0`
      const nfsList = clusterStorage.nfsList || []
      let nfsName = ''
      if(item.newAdd){
        nfsName = `tenx-nfs-${genRandomString(RANDOM_KEY)}`
      } else {
        const config = nfsList[item.index]
        nfsName = config.metadata.name
      }
      const nfsStorage = new NfsStorage(name, nfsName)
      const nfsDeployment = new NfsDeplyment(nfsName, ip, path, image)
      const clusterID = cluster.clusterID
      const template = []
      template.push(yaml.dump(nfsStorage))
      template.push(yaml.dump(nfsDeployment))
      const body = {
        template: template.join('---\n')
      }
      this.setState({nfsLoading: true})
      if(item.newAdd){
        return createCephStorage(clusterID, {type: 'nfs'}, body, {
          success: {
            func: () => {
              Notification.success('添加 NFS 存储配置成功')
              this.loadClusterStorageList()
              this.resetLoading('nfsLoading')
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 NFS 存储配置失败，请重试'
              message = this.formatMessage(message, res)
              Notification.warn(message)
              this.resetLoading('nfsLoading')
            }
          }
        })
      }
      return updateStorageClass(clusterID, {type: 'nfs'}, body, {
        success: {
          func: () => {
            Notification.success('修改 NFS 存储配置成功')
            this.loadClusterStorageList()
            this.resetLoading('nfsLoading')
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '修改 NFS 存储配置失败，请重试'
            message = this.formatMessage(message, res)
            Notification.warn(message)
            this.resetLoading('nfsLoading')
          }
        }
      })
    })
  }
  saveGfs(item){
    this.setState({
      gfsLoading: true,
    }, () => {
      const { form, createCephStorage, cluster, updateStorageClass, registryConfig, clusterStorage } = this.props
      const { gfsArray } = this.state
      const validateArray = [
        `gfs_name${item.index}`,
        `gfs_agent${item.index}`,
        `gfs_path${item.index}`,
        `gfs_adminId${item.index}`,
        `gfs_password${item.index}`
      ];
      form.validateFields(validateArray, (errors, values) => {
        if(!!errors){
          this.resetLoading();
          return
        }
        const name = values[`gfs_name${item.index}`] //集群名称
        const agent = values[`gfs_agent${item.index}`] //集群地址
        const path = values[`gfs_path${item.index}`] //集群id
        const adminId = values[`gfs_adminId${item.index}`] //认证用户 用户认证密钥
        const password = values[`gfs_password${item.index}`] //用户认证密钥

        const gfsList = clusterStorage.glusterfsList || []
        let gname = '', secretName, secretNamespace
        if(item.newAdd){
          gname = `tenx-glusterfs-${genRandomString(RANDOM_KEY)}`
        } else {
          gname = gfsList[item.index].metadata.name
          secretName = gfsList[item.index].parameters.secretName
          secretNamespace = gfsList[item.index].parameters.secretNamespace
        }
        const gfsStorage = new GfsStorage(gname, name, agent, path, adminId);
        //btoa base 64 加密
        //修改时传入secretName secretNamespace
        const gfsSecret = new GfsSecret(btoa(password), secretName, secretNamespace);

        const clusterID = cluster.clusterID
        const template = []
        template.push(yaml.dump(gfsStorage))
        template.push(yaml.dump(gfsSecret))
        const body = {
          template: template.join('---\n')
        }
        if(item.newAdd){
          return createCephStorage(clusterID, {type: 'glusterfs'}, body, {
            success: {
              func: () => {
                Notification.success('添加 GFS 存储配置成功')
                this.loadClusterStorageList()
                this.resetLoading();
              },
              isAsync: true,
            },
            failed: {
              func: (res) => {
                //let message = this.formatMessage(message, res)
                let message = this.getErrorMessage(res) || '添加 GFS 存储配置失败，请重试';
                Notification.warn(message)
                this.resetLoading();
              }
            }
          })
        }
        return updateStorageClass(clusterID, {type: 'glusterfs'}, body, {
          success: {
            func: () => {
              Notification.success('修改 GFS 存储配置成功')
              this.loadClusterStorageList()
              this.resetLoading();
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              //let message = this.formatMessage(message, res)
              let message = this.getErrorMessage(res) || '修改 GFS 存储配置失败，请重试';
              Notification.warn(message)
              this.resetLoading();
            }
          }
        })
      })
    })
  }

  resetLoading = (type ='gfsLoading') => {
    this.setState({
      [type]: false,
    })
  };
  getErrorMessage = (res) => {
    let message = "";
    if(typeof res.message === "object"){
      if(res.statusCode === 401 && res.message.reason === "GLUSTERFS_AUTH_FAILURE"){
        message = "由于用户名/密码不正确，连接失败";
      }
      if(res.statusCode === 500 && res.message.reason === "GLUSTERFS_AGENT_ADDRESS_ERROR"){
        message = "由于 agent 地址不正确，连接失败";
      }
      if(res.statusCode === 404 && res.message.reason === "GLUSTERFS_CLUSTER_NOT_FOUND"){
        message = "由于集群id不正确，连接失败";
      }
    }
    return message;
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
  cancelGfs(item){
    const { gfsArray } = this.state
    const { form } = this.props
    const newGfsArray = cloneDeep(gfsArray)
    const listArray = newGfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        if(listArray[i].newAdd){
          listArray.splice(i, 1)
          break
        }
        form.resetFields([
          `gfs_name${item.index}`,
          `gfs_agent${item.index}`,
          `gfs_path${item.index}`,
          `gfs_adminId${item.index}`,
          `gfs_password${item.index}`,
        ])
        listArray[i].disabled = true
        listArray[i].seePwd = false
        break
      }
    }
    this.setState({
      gfsArray: newGfsArray
    })
  }
  editGfs(item){
    const { gfsArray } = this.state
    const newGfsArray = cloneDeep(gfsArray)
    const listArray = newGfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        listArray[i].disabled = false
        break
      }
    }
    setTimeout(() => {
      const id = `gfs_name${item.index}`
      const node = document.getElementById(id)
      inputFocusMethod(node)
    }, 100)
    this.setState({
      gfsArray: newGfsArray
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
      const currentValue = getFieldValue(`nfs_service_name${config.index}`)
      nfsArray.listArray.forEach(item => {
        if(nfsNameValues[`nfs_service_name${item.index}`] == currentValue && item.index !== config.index){
          nfsIsExit = true
        }
      })
      return { nfsIsExit }
    }
    if(type == 'glusterfs'){
      let gfsIsExit = false
      const { gfsArray } = this.state
      const gfsNameArray = []
      gfsArray.listArray.forEach(item => {
        gfsNameArray.push(`gfs_name${item.index}`)
      })
      const gfsNameValues = getFieldsValue(gfsNameArray)
      const currentValue = getFieldValue(`gfs_name${config.index}`)
      gfsArray.listArray.forEach(item => {
        if(gfsNameValues[`gfs_name${item.index}`] == currentValue && item.index !== config.index){
          gfsIsExit = true
        }
      })
      return { gfsIsExit }
    }
    return {
      cephIsExit: false,
      nfsIsExit: false,
      gfsIsExit: false,
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
    } else if(type == 'gfs'){
      nfsArray.listArray.forEach(item => {
        validateArray.push(`gfs_name${item.index}`)
      })
    } else {
      validateArray = []
    }
    form.validateFields(validateArray, (error, values) => {
      validating = false
    })
  }
  testAgent(value) {
    return (
      /^(http|https):\/\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5}$/.test(value)
      ||
      /^(http|https):\/\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(value)
    )
  }
  renderGlusterFSList(){
    const { gfsArray } = this.state
    const { clusterStorage } = this.props
    let isFetching = clusterStorage.isFetching
    if(isFetching){
      return <div className='wating_style'><Spin /></div>
    }
    const listArray = gfsArray.listArray
    if(!listArray || !listArray.length){
      return <div className='no_list'>该集群目前还没有添加 GlusterFS 类型的存储</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    const gfsListData = clusterStorage.glusterfsList || []

    let gfsList = listArray.map(item => {
      const metadata = gfsListData[item.index] ? gfsListData[item.index].metadata : {}
      const parameters = gfsListData[item.index] ? gfsListData[item.index].parameters : {}
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className={item.isDefault  ? 'list defaultStorage' : 'list'} key={ `gfs_list_${item.index}` }>
          { item.isDefault&&
          <div className="dafaultGroup">默认</div>
          }
          <FormItem
            label="集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 GlusterFS 集群名称'
              disabled={ item.disabled }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`gfs_name${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations[`system/scName`] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群名称不能为空')
                    }
                    if(!/^[\u4e00-\u9fa5|a-zA-Z_\-0-9]{3,36}$/.test(value)){
                      return callback('集群名称由数字、字母、下划线、汉字组成，长度为3到36位')
                    }
                    {/* this.validateAllName('glusterfs') */}
                    if(this.isExitName('glusterfs', item).gfsIsExit){
                      return callback('集群名称已存在！')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="agent 地址"
            key="agent_address"
            {...formItemLayout}
          >
            <Input
              placeholder='如：http://192.168.1.123:8001'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`gfs_agent${item.index}`, {
                initialValue: parameters && parameters.resturl ? parameters.resturl : '',
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('请输入 agent 地址')
                    }
                    if(!this.testAgent(value)){
                      return callback('请输入正确的 agent 地址')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>

          <FormItem
            label="集群 ID"
            key="service_path"
            {...formItemLayout}
          >
            <Input
              placeholder='请输入集群 ID'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`gfs_path${item.index}`, {
                initialValue: parameters ? parameters.clusterid : '',
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群 ID 不能为空')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem
            label="认证用户"
            key="username"
            {...formItemLayout}
          >
            <Input
              placeholder='如： admin'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`gfs_adminId${item.index}`, {
                initialValue: parameters ? parameters.restuser : '',
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
            label="用户认证密钥"
            key="password"
            {...formItemLayout}
          >
            <Input
              placeholder='请输入用户认证密钥'
              disabled={item.disabled}
              size="large"
              type={!item.disabled && item.seePwd ? 'text' : 'password' }
              autoComplete="new-password"
              {...getFieldProps(`gfs_password${item.index}`, {
                initialValue: parameters ? parameters.key : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('用户认证密钥不能为空')
                    }
                    if(value.length < 4 || value.length > 64){
                      return callback('长度为4～64个字符')
                    }
                    return callback()
                  }
                }]
              })}
            />
            <Icon
              className={item.disabled? "clusterStorageIconEyeDisabled" : "clusterStorageIconEye"}
              type={item.seePwd ? 'eye-o' : 'eye'}
              onClick={() => this.gfsSeePwdType(item)}
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
                  onClick={this.editGfs.bind(this, item)}
                />
                <Button
                  icon="delete"
                  className='right_button'
                  size="large"
                  type="dashed"
                  onClick={() => this.setState({
                    deleteModalVisible: true,
                    currentItem: {
                      type: 'gfs',
                      item: gfsListData[item.index]
                    }
                  })}
                />
              </span>
              : <span className="btnContainer">
                  <Spin spinning={this.state.gfsLoading}>
                    <Button
                      icon="check"
                      size="large"
                      className='left_button'
                      type="primary"
                      onClick={this.saveGfs.bind(this, item)}
                    >
                    </Button>
                  </Spin>
                  <Button
                    icon="cross"
                    className='right_button'
                    size="large"
                    onClick={this.cancelGfs.bind(this, item)}
                  />
              </span>
          }
        </div>
        <div className="check_box"></div>
      </div>
    })
    return gfsList
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
        <div className={item.isDefault  ? 'list defaultStorage' : 'list'} key={ `nfs_list_${item.index}` }>
          { item.isDefault&&
          <div className="dafaultGroup">默认</div>
          }
          <FormItem
            label="nfs 服务名称"
            key="service_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 nfs 服务名称'
              disabled={ item.disabled }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`nfs_service_name${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations[`system/scName`] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务名称不能为空')
                    }
                    if(!/^[\u4e00-\u9fa5|a-zA-Z_\-0-9]{3,36}$/.test(value)){
                      return callback('集群名称由数字、字母、下划线、汉字组成，长度为3到36位')
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
              placeholder='如：192.168.1.1/var/nfs'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`nfs_service_adderss${item.index}`, {
                initialValue: !isEmpty(parameters) ? parameters.ip + parameters.path : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务地址不能为空')
                    }
                    if(!IP_PATH_REGEX.test(value)){
                      return callback('请输入正确的服务地址')
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
              : <span className="btnContainer">
                <Spin spinning={this.state.nfsLoading}>
                  <Button
                    icon="check"
                    size="large"
                    className='left_button'
                    type="primary"
                    onClick={this.saveNfs.bind(this, item)}
                  >
                  </Button>
                </Spin>
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
    if(currentItem.type == 'gfs'){
      type = 'glusterfs'
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
          Notification.warn(message)
        }
      }
    })
  }

  renderHostTips() {
    const { hostChecked, hostIsFetching } = this.state
    if (hostIsFetching) {
      return <Spin/>
    }
    return <div>
      <Switch
        checkedChildren="开"
        unCheckedChildren="关"
        className='switch_style'
        checked={hostChecked}
        onChange={() => this.setState({loading: false, hostVisible: true})}
      />
      <div className='tips'>
        {
          hostChecked
            ? <span>使用 host 存储模式，建议在高级设置中开启绑定节点来保持服务数据一致性</span>
            : <span>未使用 host 存储模式</span>
        }
      </div>
    </div>
  }
  openDefStoModal (currType) {
    let defSto
    this.state[currType + "Array"].list.map(o => {
      if(o.metadata.labels["system/storageDefault"] === "true") defSto = o
      return o
    })
    this.setState({
      isShowSetDefaultModal: true,
      currType,
      defaultStorage: defSto ? defSto.metadata.name : "",
    })
  }
  getModalContent(currType) {
    let title
    let label
    let alert
    switch(currType){
      case "ceph":
        title = "设置默认块存储集群"
        label = "默认块存储集群"
        alert = "设置一个默认的块存储集群，当创建独享型块存储时默认选择该存储集群"
        break;
      case "nfs":
        title = "设置默认NFS存储集群"
        label = "默认NFS存储集群"
        alert = "设置一个默认的NFS，当创建共享型 NFS 存储时默认选择该存储 server"
        break;
      case "gfs":
        title = "设置默认GlusterFS存储集群"
        label = "默认GlusterFS存储集群"
        alert = "设置一个默认的 GlusterFS，当创建共享型 GlusterFS 存储时默认选择该存储集群"
        break;
    }
    return {
      title,
      label,
      alert
    }
  }
  renderOpt(currType) {
    let options
    options = this.state[currType + "Array"].list.map(item => {
      const name = item.metadata.annotations["system/scName"]
      return <Option
        value={item.metadata.name}
        key={item.metadata.name}>
        {name}
      </Option>
    })
    return options
  }
  onDefSetok = () => {
    const { form, setDefaultStorage, cluster } = this.props
    const clusterID = cluster.clusterID
    const { currType } = this.state
    const { getFieldValue, validateFields } = form
    validateFields(["defaultSettingStorage"], (err, values) => {
      if(err)return
      let params = {
        clusterID,
        storageType: currType === 'gfs' ? 'glusterfs' : currType,
      }
      if(values.defaultSettingStorage){
        params.name = values.defaultSettingStorage
      } else {
        params.disableDefault = true
      }
      setDefaultStorage(params, {
        success: {
          func: res => {
            Notification.success((values.defaultSettingStorage ? "设置默认集群" : "清空默认集群") + "成功")
            this.onDefSetCancel()
            this.loadClusterStorageList()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            Notification.warn("设置默认集群失败")
          },
          isAsync: true,
        },
      })
    })
  }
  onDefSetCancel() {
    this.setState({
      isShowSetDefaultModal: false,
      currType: "",
      defaultStorage: "",
    })
  }
  // 编辑宿主机根目录
  hostDirEdit = e => {
    this.setState({
      hostDir: e.target.value
    })
  }
  hostDirEditEnable = () => {
    this.setState({
      hostDirEditDisable: false
    })
  }
  hostDirEditOk = () => {
    const { createCephStorage, cluster, form } = this.props
    const clusterID = cluster.clusterID
    const hostTemplate = new HostTemplate(this.state.hostDir)
    const body = {
      template: yaml.dump(hostTemplate)
    }
    form.validateFields([ 'serverDir' ], (err, values) => {
      if (err) return
      createCephStorage(clusterID, {type: 'host'}, body, {
        success: {
          func: () => {
            this.setState({
              hostDirEditDisable: true,
              initialHostDir: this.state.hostDir
            })
            Notification.success('修改宿主机根目录成功')
          }
        }
      }, 'PUT')
    })

  }
  hostDirEditCancel = () => {
    this.props.form.resetFields()
    this.setState({
      hostDirEditDisable: true
    })
  }
  testPath = (rule, value, callback) => {
    if (!value) {
      return callback('请输入server 共享目录')
    }
    if (!PATH_REG.test(value)) {
      return callback('请输入正确的路径')
    }
    callback()
  }

  render() {
    const { hostChecked, deleteModalVisible, hostVisible, loading,
      isShowSetDefaultModal, currType, defaultStorage
    } = this.state
    const { title, label, alert } = this.getModalContent(currType)
    const { getFieldProps, getFieldValue } = this.props.form
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    }

    const pathProps = getFieldProps('serverDir',{
      initialValue: this.state.initialHostDir,
      validate: [
        {
          rules: [
            {validator: this.testPath},
          ],
          trigger: ['onBlur', 'onChange'],
        }
      ],
      onChange: this.hostDirEdit
    })
    return(
      <div id='cluster_storage'>
        <div className='host'>
          <div className='header'>
            本地存储（hostPath）
          </div>
          <div className="body">
            <div className="img_box host_img">
              <img src={HostImg} alt=""/>
            </div>
            <div className="container">
              <div className="containerItem">
                <span>启用本地存储</span>
                <span>{ this.renderHostTips() }</span>
              </div>
              {
                this.state.hostChecked &&
                <Form className="containerItem formItem">
                  <FormItem label='宿主机根目录' {...formItemLayout}>
                    <Input {...pathProps} style={{ marginLeft: 5 }} disabled={this.state.hostDirEditDisable}/>
                  </FormItem>
                  {
                    this.state.hostDirEditDisable?
                      <Button
                        icon="edit"
                        size="large"
                        type="dashed"
                        className='operationBtn'
                        onClick={this.hostDirEditEnable}
                      />
                      :
                      <div className='operationBtn'>
                        <Button
                          icon="check"
                          size="large"
                          type="primary"
                          onClick={this.hostDirEditOk}
                        />
                        <Button
                          icon="cross"
                          size="large"
                          type="default"
                          onClick={this.hostDirEditCancel}
                        />
                      </div>
                  }
                </Form>
              }
            </div>
          </div>
          <div className="check_box"></div>
        </div>
        <div className='ceph'>
          <div className="header">
            块存储集群（rbd）- 独享型
            <div className="right">
              <Tooltip title='设置默认集群'>
                <Button icon="setting" className='settingDefalutStorage' onClick={() => this.openDefStoModal("ceph")}/>
              </Tooltip>
            </div>
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
            网络文件系统（NFS）- 共享型
            <div className="right">
              <Tooltip title='设置默认集群'>
                <Button icon="setting" className='settingDefalutStorage' onClick={() => this.openDefStoModal("nfs")}/>
              </Tooltip>
            </div>
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
        <div className='gfs'>
          <div className="header">
            分布式文件系统（GlusterFS）- 共享型
            <div className="right">
              <Tooltip title='设置默认集群'>
                <Button icon="setting" className='settingDefalutStorage' onClick={() => this.openDefStoModal("gfs")}/>
              </Tooltip>
            </div>
          </div>
          <div className="body">
            <div className="img_box nfs_img">
              <img src={GlusterImg} alt=""/>
            </div>
            <div className="container">
              { this.renderGlusterFSList() }
              <div className='add_button' onClick={() => this.addGlusterFSItem()}>
                <Icon type="plus-circle-o" className='add_icon'/>添加存储
              </div>
            </div>
          </div>
          <div className="check_box"></div>
        </div>

        <Modal
          title={hostChecked ? '关闭 host 存储' : '打开 host 存储'}
          visible={hostVisible}
          closable={true}
          onOk={() => this.confirmSetHost()}
          onCancel={() => this.setState({hostVisible: false})}
          width="570px"
          maskClosable={false}
          confirmLoading={loading}
          wrapClassName="set_host_memory"
        >
          <Icon type="question-circle-o" className='question_icon'/>
          您确定{ hostChecked ? '关闭 host 存储' : '打开 host 存储' }吗？
        </Modal>

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
        {
          isShowSetDefaultModal ?
            <Modal
              maskClosable={false}
              visible={isShowSetDefaultModal}
              title={title}
              wrapClassName="settingDefault"
              onCancel={this.onDefSetCancel}
              onOk={this.onDefSetok}
            >
              <div>
                <div className='alertRow'>{alert}</div>
              </div>
              <Form.Item
                label={label}
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
              >
                <Select
                  style={{width:'180px'}}
                  placeholder='选择默认集群'
                  {...getFieldProps('defaultSettingStorage',{
                    initialValue: defaultStorage ? defaultStorage : undefined,
                    onChange:value => this.setState({ defaultStorage: value })
                  })}
                >
                  {
                    this.renderOpt(currType)
                  }
                </Select>
                <Button style={{marginLeft: 5}} disabled={!!!defaultStorage} onClick={() => {
                  this.setState({
                    defaultStorage: ""
                  })
                  this.props.form.setFieldsValue({ defaultSettingStorage: undefined })
                }}>
                  清空设置
                </Button>
              </Form.Item>
            </Modal>
            :
            null
        }
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
    glusterfsList: [],
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
  getStorageClassType,
  setDefaultStorage,
})(ClusterStorage)
