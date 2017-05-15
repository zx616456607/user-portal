/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Manage Label component
 *
 * v0.1 - 2017-3-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Modal, Tag, Tooltip, Form, Button, Input } from 'antd'
import { connect  } from 'react-redux'
import TagDropdown from './TagDropdown'
import { camelize } from 'humps'
import { getClusterLabel, addLabels, editNodeLabels, getNodeLabels } from '../../actions/cluster_node'
import { KubernetesValidator } from '../../common/naming_validation'
import cloneDeep from 'lodash/cloneDeep'
import NotificationHandler from '../../common/notification_handler'



class ManageLabelModal extends Component {
  constructor(props){
    super(props)
    this.handleManageLabelOk = this.handleManageLabelOk.bind(this)
    this.handleManageLabelCancel = this.handleManageLabelCancel.bind(this)
    this.state = {
      manageLabelModalVisible : this.props.manageLabelModal,
      userCreateLabel: this.props.userCreateLabel || {},
      isLoad: false,// first data in nodes
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.manageLabelModal !== nextProps.manageLabelModal){
      this.setState({
        manageLabelModalVisible : nextProps.manageLabelModal,
      })
      const { nodes, nodeName } = nextProps
      if (nextProps.manageLabelModal && !this.state.isLoad) {
        for (let node in nodes) {
          if (node == camelize(nodeName)) {
            this.setState({userCreateLabel: nodes[node]})
            return
          }
        }
      }
      if (nextProps.isNode && nextProps.manageLabelModal) {
        this.props.getClusterLabel(nextProps.clusterID)
        this.setState({userCreateLabel: nextProps.userCreateLabel})
      }
    }
    const { nodeName } = this.props
    if (!nodeName) return
    if (nextProps.nodeName && nextProps.nodeName !== nodeName) {
      this.loadNodeLabels(nextProps)
    }
  }

  loadNodeLabels(props) {
    const { clusterID, nodeName } = props
    const _this = this
    if (!nodeName) return
    this.props.getNodeLabels(clusterID,nodeName,{
      success:{
        func:(ret)=> {
          _this.setState({userCreateLabel: ret,isLoad: true})
        }
      }
    })
  }

  handleClose(key,value) {
    const userCreateLabel = cloneDeep(this.state.userCreateLabel)
    for (let lab in userCreateLabel) {
      if (lab === key && userCreateLabel[key] === value) {
        delete userCreateLabel[lab]
        this.setState({userCreateLabel})
      }
    }
  }


  handleManageLabelOk(){
    const { callback, labels, editNodeLabels, clusterID, nodeName } = this.props
    const { userCreateLabel } = this.state
    const _this = this
    const body ={
      node:nodeName,
      labels:userCreateLabel,
      cluster:clusterID,
    }
    const notificat = new NotificationHandler()
    editNodeLabels(body,{
      success:{
        func:(ret)=> {
          _this.setState({userCreateLabel:ret})
          notificat.success('操作成功！')
          _this.loadNodeLabels(_this.props)
        },
        isAsync:true
      },
      failed: {
        func:(ret)=> {
          notificat.error('操作失败！',ret.message.message || ret.message)
        }
      }
    })
    this.setState({
      manageLabelModalVisible : false
    })
    callback(false)
  }

  handleManageLabelCancel(){
    const { callback } = this.props
    this.setState({
      manageLabelModalVisible : false,
    })
    const _this = this
    callback(false)
    // setTimeout(()=> {
    //   _this.setState({userCreateLabel:{}})
    // },500)
  }
  checkKey(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签键'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error('以英文字母开头和结尾'))
      return
    }
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    callback()
  }
  checkValue(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签值'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error('以英文字母开头和结尾'))
      return
    }
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    callback()
  }

  handleAddLabel() {
   const { form, addLabels, clusterID } = this.props
   const _this = this
   form.validateFields((errors,values)=> {
     if (errors) {
       return
     }
     values.target = 'node'
     let createLabel = cloneDeep(_this.state.userCreateLabel)
     createLabel[values.key] = values.value
     addLabels([values],clusterID,{
       success:{
         func:(ret)=> {
           _this.setState({userCreateLabel:createLabel})
           form.resetFields()
         }
       },
       failed: {
         func:(res)=> {
          new NotificationHandler().error('添加标签失败',res.message.message || res.message)
         }
       }
     })
   })
  }
  render(){
    const { userCreateLabel } = this.state

    const { getFieldProps } = this.props.form
    const createLabel = ()=> {
      const label = []
      for (let key in userCreateLabel) {
        label.push(
          <Tag closable color="blue" className='tag' key={key} afterClose={() => this.handleClose(key, userCreateLabel[key])}>
              <Tooltip title={key}>
                <span className='key'>{key}</span>
              </Tooltip>
              <span className='point'>：</span>
              <Tooltip title={userCreateLabel[key]}>
                <span className='value'>{userCreateLabel[key]}</span>
              </Tooltip>
          </Tag>
        )
      }

      return label
    }

    return(
      <div>
        <Modal
          title="管理标签"
          visible={this.state.manageLabelModalVisible}
          onOk={this.handleManageLabelOk}
          onCancel={this.handleManageLabelCancel}
          wrapClassName="manageLabelModal"
          width="585px"
          maskClosable={false}
        >
          <div className='labelcontainer'>
            { createLabel() }
          </div>

          <div className='labelfooter'>
          <span className='labeldropdown' id="cluster__hostlist__manageLabelModal">
            <TagDropdown scope={this} labels={this.props.labels} isManage={true} footer={this.props.footer} width={'120px'} context={"Modal"}/>
          </span>
            <span className='item'>或</span>
            <Form
              inline
              horizontal={true}
              className='labelform'
            >
              <Form.Item className='itemkey'>
                <Input {...getFieldProps(`key`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkKey
                  }],
                })} placeholder="标签键"  />
              </Form.Item>
              <Form.Item className='itemkey'>
                <Input {...getFieldProps(`value`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkValue
                  }],
                })} placeholder="标签值"/>
              </Form.Item>
            </Form>
            <Button icon='plus' size="large" className='itembutton' type="ghost" onClick={()=> this.handleAddLabel()}>新建标签</Button>
          </div>
        </Modal>
      </div>
    )
  }
}


function mapStateToProps(state,props) {
  const { clusterLabel } = state.cluster_nodes
  const cluster = props.clusterID
  if (!clusterLabel[cluster]) {
    return props
  }

  let { result } = clusterLabel[cluster]
  if (!result) {
    result = {nodes:[]}
  }
  return {
    nodes:result.nodes,
    labels:result.summary
  }
}
ManageLabelModal = Form.create()(ManageLabelModal)

export default connect(mapStateToProps, {
  getClusterLabel,
  addLabels,
  editNodeLabels,
  getNodeLabels
})(ManageLabelModal)