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


class ManageLabelModal extends Component {
  constructor(props){
    super(props)
    this.handleManageLabelOk = this.handleManageLabelOk.bind(this)
    this.handleManageLabelCancel = this.handleManageLabelCancel.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.state = {
      manageLabelModalVisible : this.props.manageLabelModal,
      userCreateLabel: {}
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.manageLabelModal !== nextProps.manageLabelModal){
      this.setState({
        manageLabelModalVisible : nextProps.manageLabelModal,
      })
    }
  }

  formTagContainer(){
    const { nodes, nodeName } = this.props
    if (!nodeName) return
    let arr = []
    for (let node in nodes) {
      if (camelize(nodeName.objectMeta.name) === node) {
        let carnode = nodes[node]
        for (let key in carnode) {
          arr.push(
            <Tag color="blue" className='tag' key={key}>
              <Tooltip title={key}>
                <span className='key'>{key}</span>
              </Tooltip>
              <span className='point'>：</span>
              <Tooltip title={carnode[key]}>
                <span className='value'>{carnode[key]}</span>
              </Tooltip>
            </Tag>
          )
        }
      }
    }

    return arr
  }


  handleManageLabelOk(){
    const { callback } = this.props
    this.setState({
      manageLabelModalVisible : false
    })
    callback(false)
  }

  handleManageLabelCancel(){
    const { callback } = this.props
    this.setState({
      manageLabelModalVisible : false
    })
    callback(false)
  }

  render(){
    const { userCreateLabel } = this.state
    console.log('userCreateLabel',userCreateLabel)
    const createLabel = ()=> {
      const label = []
      for (let key in userCreateLabel) {
        label.push(
          <Tag closable color="blue" className='tag' key={key}>
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
            {this.formTagContainer()}
            { createLabel() }
          </div>

          <div className='labelfooter'>
          <span className='labeldropdown' id="cluster__hostlist__manageLabelModal">
            <TagDropdown scope={this} labels={this.props.labels} isManage={true} footer={false} width={'120px'} context={"Modal"}/>
          </span>
            <span className='item'>或</span>
            <Form
              inline
              horizontal={true}
              className='labelform'
            >
              <Form.Item className='itemkey'>
                <Input placeholder="标签键"  />
              </Form.Item>
              <Form.Item className='itemkey'>
                <Input placeholder="标签值"/>
              </Form.Item>
            </Form>
            <Button icon='plus' size="large" className='itembutton' type="ghost" onClick={this.handleAddLabel}>新建标签</Button>
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

export default connect(mapStateToProps, {
})(ManageLabelModal)