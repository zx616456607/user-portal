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
import { Switch, Icon, Form, Select, Input, Button, Modal } from 'antd'
import { connect } from 'react-redux'
import './style/ClusterStorage.less'
import cloneDeep from 'lodash/cloneDeep'
import { IP_REGEX } from '../../../constants/index'
import CephImg from '../../assets/img/setting/globalconfigceph.png'
import HostImg from '../../assets/img/integration/host.png'
import NfsImg from '../../assets/img/cluster/nfs.png'

const FormItem = Form.Item
const Option = Select.Option

class ClusterStorage extends Component {
  constructor(props) {
    super(props)
    this.hostChange = this.hostChange.bind(this)
    this.renderCephList = this.renderCephList.bind(this)
    this.renderNfsList = this.renderNfsList.bind(this)
    this.deleteNfs = this.deleteNfs.bind(this)
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

  componentWillMount() {
    this.setState({
      cephArray: {
        key: 0,
        listArray:[{
          index: 0,
          disabled: true,
          newAdd: false,
        }],
      },
      nfsArray: {
        key: 0,
        listArray: [{
          index: 0,
          disabled: true,
          newAdd: false,
        }],
      },
    })
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

  deleteCeph(item){
    const { cephArray } = this.state
    const newCephArray = cloneDeep(cephArray)
    const listArray = newCephArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(item && listArray[i].index == item.index){
        listArray.splice(i, 1)
        break
      }
    }
    this.setState({
      deleteModalVisible: false,
      cephArray: newCephArray
    })
  }

  saveCeph(item){
    const { form } = this.props
    const { cephArray } = this.state
    const validateArray = [
      `RBD_cluster_name${item.index}`,
      `RBD_agent_adderss${item.index}`,
      `RBD_cluster_config${item.index}`,
      `RBD_username${item.index}`,
      `RBD_password${item.index}`
    ]
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      console.log('values=',values)
      const newCephArray = cloneDeep(cephArray)
      const listArray = newCephArray.listArray

      for(let i = 0; i < listArray.length; i++){
        if(listArray[i].index == item.index){
          listArray[i].disabled = true
          listArray[i].newAdd = false
          break
        }
      }
      this.setState({
        cephArray: newCephArray
      })
    })
  }

  calcelCeph(item){
    const { cephArray } = this.state
    const newCephArray = cloneDeep(cephArray)
    const listArray = newCephArray.listArray
    
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        if(listArray[i].newAdd){
          listArray.splice(i, 1)
          break
        }
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
    if(!cephArray.listArray.length){
      return <div className='no_list'>该集群目前还没有添加 ceph 类型的存储</div>
    }
    const formItemLayout = {
    	labelCol: {span: 6},
    	wrapperCol: {span: 18}
    }
    const { form } = this.props
    const { getFieldProps } = form
    const listArray = cephArray.listArray
    let cephList = listArray.map(item => {
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className='list' key={ `ceph_list_${item.index}` }>
          <FormItem
            label="RBD 集群名称"
            key="cluster_name"
            { ...formItemLayout }
          >
            <Input
              placeholder='请输入 RBD 集群名称'
              disabled={ item.disabled }
              size="large"
              className='formItem_child_style'
              {...getFieldProps(`RBD_cluster_name${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群名称不能为空')
                    }
                    return callback()
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
              {...getFieldProps(`RBD_agent_adderss${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('请输入agent地址')
                    }
                    if(
                      !/^(http|https):\/\/([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value)
                      && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)
                    ){
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
              {...getFieldProps(`RBD_cluster_config${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('集群配置不能为空')
                    }
                    if(
                      !/^([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5}){0,1}?(,([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5}){0,1})*$/.test(value)
                      && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(,[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?)*$/.test(value)
                    ){
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
              {...getFieldProps(`RBD_username${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('认证用户不能为空')
                    }
                    return callback()
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
              {...getFieldProps(`RBD_password${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('用户认证密钥不能为空')
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
                      item,
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
    const { form } = this.props
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
      const newNfsArray = cloneDeep(nfsArray)
      const listArray = newNfsArray.listArray
      for(let i = 0; i < listArray.length; i++){
        if(listArray[i].index == item.index){
          listArray[i].disabled = true
          listArray[i].newAdd = false
          break
        }
      }
      this.setState({
        nfsArray: newNfsArray
      })
    })
  }

  cancelNfs(item){
    const { nfsArray } = this.state
    const newNfsArray = cloneDeep(nfsArray)
    const listArray = newNfsArray.listArray
    for(let i = 0; i < listArray.length; i++){
      if(listArray[i].index == item.index){
        if(listArray[i].newAdd){
          listArray.splice(i, 1)
          break
        }
        listArray[i].disabled = true
        break
      }
    }
    this.setState({
      nfsArray: newNfsArray
    })
  }

  renderNfsList(){
    const { nfsArray } = this.state
    const listArray = nfsArray.listArray
    if(!listArray.length){
      return <div className='no_list'>该集群目前还没有添加 nfs 类型的存储</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    let nfsList = listArray.map(item => {
      return <div className='list_container' key={`list_container${item.index}`}>
        <div className='list' key={ `ceph_list_${item.index}` }>
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
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务名称不能为空')
                    }
                    //if(!/^[a-zA-Z0-9]([a-zA-Z_0-9]{1, 34})[a-zA-Z0-9]$/.test(value)){
                    //  return callback('服务名称必须由数字、字母开头，长度为3到36位')
                    //}
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
                initialValue: undefined,
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
            label="如：/var/nfs"
            key="service_path"
            {...formItemLayout}
          >
            <Input
              placeholder='请输入服务挂在路径'
              disabled={item.disabled}
              size="large"
              {...getFieldProps(`nfs_service_path${item.index}`, {
                initialValue: undefined,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('服务挂在路径不能为空')
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
                      item: item
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

  confirmDelte(){
    const { currentItem } = this.state
    if(currentItem.type == 'ceph'){
      return this.deleteCeph(currentItem.item)
    }
    if(currentItem.type == 'nfs'){
      return this.deleteNfs(currentItem.item)
    }
    this.setState({
      deleteModalVisible: false,
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
          onOk={() => this.confirmDelte()}
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

  return {

  }
}

export default connect(mapStateToProp, {

})(ClusterStorage)