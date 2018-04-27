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
import HostTemplate from '../../../kubernetes/objects/hostTemplate'
import { createCephStorage, getClusterStorageList, deleteStorageClass, updateStorageClass } from '../../actions/cluster'
import { getStorageClassType } from '../../actions/storage'
import NotificationHandler from '../../components/Notification'

const FormItem = Form.Item
const Option = Select.Option
const Notification = new NotificationHandler()
let validating = false

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
            Notification.error(message)
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
    const hostTemplate = new HostTemplate()
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
          Notification.error(message)
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
      const id = `RBD_agent${item.index}`
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
      const cephList = clusterStorage.cephList || []
      let secretName = ''
      let cephName = ''
      if(item.newAdd){
        let index = cephList.length
        secretName = 'ceph-secret'
        cephName = `tenx-rbd${index}`
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
      const secret = new Secret(key, secretName)
      const template = []
      template.push(yaml.dump(storageClass))
      template.push(yaml.dump(secret))
      const body = {
        template: template.join('---\n')
      }
      if(item.newAdd){
        createCephStorage(clusterID, {type: 'ceph'}, body, {
          success: {
            func: (res) => {
              Notification.success('添加 Ceph 存储配置成功')
              this.loadClusterStorageList()
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 Ceph 存储配置失败，请重试'
              message = this.formatMessage(message, res)
              Notification.error(message)
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
          },
          isAsync: true,
        },
        failed: {
          func: (res) =>  {
            let message = '修改 Ceph 存储配置失败，请重试'
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

  addGlusterFSItem(){debugger
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
      const id = `gfs_service_name${index + 1}`
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
        <div className='list' key={ `ceph_list_${item.index}` }>
          <FormItem
            label="集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 Ceph 集群名称'
              disabled={ item.disabled || !item.newAdd }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`RBD_name${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations[`tenxcloud.com/scName`] : undefined,
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
            label="认证用户"
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
            label="用户认证密钥"
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
                    if(value.length < 4 || value.length > 63){
                      return callback('长度为4～63个字符')
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
    setTimeout(() => {
      const id = `nfs_service_adderss${item.index}`
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
      const nfsList = clusterStorage.nfsList || []
      let index = nfsList.length
      let nfsName = ''
      if(item.newAdd){
        nfsName = `tenx-nfs${index}`
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
      if(item.newAdd){
        return createCephStorage(clusterID, {type: 'nfs'}, body, {
          success: {
            func: () => {
              Notification.success('添加 NFS 存储配置成功')
              this.loadClusterStorageList()
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 NFS 存储配置失败，请重试'
              message = this.formatMessage(message, res)
              Notification.error(message)
            }
          }
        })
      }
      return updateStorageClass(clusterID, {type: 'nfs'}, body, {
        success: {
          func: () => {
            Notification.success('修改 NFS 存储配置成功')
            this.loadClusterStorageList()
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '修改 NFS 存储配置失败，请重试'
            message = this.formatMessage(message, res)
            Notification.error(message)
          }
        }
      })
    })
  }
  saveGfs(item){
    //todo save Gfs
    const { form, createCephStorage, cluster, updateStorageClass, registryConfig, clusterStorage } = this.props
    const { gfsArray } = this.state
    const validateArray = [
      `gfs_service_name${item.index}`,
      `gfs_service_agent${item.index}`,
      `gfs_service_path${item.index}`,
      `gfs_service_adminId${item.index}`,
      `gfs_service_key${item.index}`
    ];
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const name = values[`gfs_service_name${item.index}`]
      const ip = values[`gfs_service_adderss${item.index}`]
      const path = values[`gfs_service_path${item.index}`]
      const server = registryConfig.server
      const serverArray = server.split('//')
      const image = `${serverArray[1]}/tenx_containers/gfs-client-provisioner:latest`
      const gfsList = clusterStorage.gfsList || []
      let index = gfsList.length
      let gfsName = ''
      if(item.newAdd){
        gfsName = `tenx-gfs${index}`
      } else {
        const config = gfsList[item.index]
        gfsName = config.metadata.name
      }
      const gfsStorage = new NfsStorage(name, gfsName)
      const gfsDeployment = new NfsDeplyment(gfsName, ip, path, image)
      const clusterID = cluster.clusterID
      const template = []
      template.push(yaml.dump(gfsStorage))
      template.push(yaml.dump(gfsDeployment))
      debugger
      const body = {
        template: template.join('---\n')
      }
      if(item.newAdd){
        return createCephStorage(clusterID, {type: 'gfs'}, body, {
          success: {
            func: () => {
              Notification.success('添加 GFS 存储配置成功')
              this.loadClusterStorageList()
            },
            isAsync: true,
          },
          failed: {
            func: (res) => {
              let message = '添加 GFS 存储配置失败，请重试'
              message = this.formatMessage(message, res)
              Notification.error(message)
            }
          }
        })
      }
      return updateStorageClass(clusterID, {type: 'gfs'}, body, {
        success: {
          func: () => {
            Notification.success('修改 GFS 存储配置成功')
            this.loadClusterStorageList()
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '修改 GFS 存储配置失败，请重试'
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
  cancelGfs(item){

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
    } else if(type == 'gfs'){
      nfsArray.listArray.forEach(item => {
        validateArray.push(`gfs_service_name${item.index}`)
      })
    } else {
      validateArray = []
    }
    console.log('validateArray=',validateArray)
    form.validateFields(validateArray, (error, values) => {
      validating = false
    })
  }

  renderGlusterFSList(){
    debugger
    const { gfsArray } = this.state
    const { clusterStorage } = this.props
    let isFetching = clusterStorage.isFetching
    if(isFetching){
      return <div className='wating_style'><Spin /></div>
    }
    const listArray = gfsArray.listArray
    if(!listArray || !listArray.length){
      return <div className='no_list'>该集群目前还没有添加 gfs 类型的存储</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    const gfsListData = clusterStorage.gfsList || []
    let gfsList = listArray.map(item => {
      const metadata = gfsListData[item.index] ? gfsListData[item.index].metadata : {}
      const parameters = gfsListData[item.index] ? gfsListData[item.index].parameters : {}
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className='list' key={ `ceph_list_${item.index}` }>
          <FormItem
            label="集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 GlusterFS 集群名称'
              disabled={ item.disabled || !item.newAdd }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`gfs_service_name${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations[`tenxcloud.com/scName`] : undefined,
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
            label="集群地址"
            key="agent_address"
            {...formItemLayout}
          >
            <Input
              placeholder='如：http://192.168.1.123:8001'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`gfs_service_agent${item.index}`, {
                initialValue: metadata && metadata.annotations ? metadata.annotations['tenxcloud.com/storageagent'] : undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('请输入集群地址')
                    }
                    if(!/^(http|https):\/\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]{1,5}$/.test(value)){
                      return callback('请输入正确的集群地址')
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
              {...getFieldProps(`gfs_service_path${item.index}`, {
                initialValue: parameters ? parameters.path : undefined,
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
              {...getFieldProps(`gfs_service_adminId${item.index}`, {
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
              type="password"
              {...getFieldProps(`gfs_service_key${item.index}`, {
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
              : <span>
                <Button
                  icon="check"
                  size="large"
                  className='left_button'
                  type="primary"
                  onClick={this.saveGfs.bind(this, item)}
                />
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
                initialValue: metadata && metadata.annotations ? metadata.annotations[`tenxcloud.com/scName`] : undefined,
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

  render() {
    const { hostChecked, deleteModalVisible, hostVisible, loading } = this.state
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
              { this.renderHostTips() }
            </div>
          </div>
          <div className="check_box"></div>
        </div>
        <div className='ceph'>
          <div className="header">
            块存储集群（rbd）- 独享性
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
            网络文件系统（NFS）- 共享性
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
        <div className='ceph'>
          <div className="header">
            分布式文件系统集群（GlusterFS）- 共享性
          </div>
          <div className="body">
            <div className="img_box ceph_img">
              <img src={CephImg} alt=""/>
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
    gfsLust: [],
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
})(ClusterStorage)