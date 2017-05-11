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
import TagDropdown from './TagDropdown'

class ManageLabelModal extends Component {
  constructor(props){
    super(props)
    this.handleManageLabelOk = this.handleManageLabelOk.bind(this)
    this.handleManageLabelCancel = this.handleManageLabelCancel.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.state = {
      manageLabelModalVisible : this.props.manageLabelModal,
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
    let arr = []
    for(let i=0;i<30;i++){
      arr.push(<Tag closable color="blue" className='tag' key={i}>
        <Tooltip title='key1'>
          <span className='key'>key1</span>
        </Tooltip>
        <span className='point'>:</span>
        <Tooltip title='value2017'>
          <span className='value'>value2017</span>
        </Tooltip>
      </Tag>)
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
          </div>

          <div className='labelfooter'>
          <span className='labeldropdown' id="cluster__hostlist__manageLabelModal">
            <TagDropdown footer={false} width={'120px'} context={"Modal"}/>
          </span>
            <span className='item'>或</span>
            <Form
              inline
              horizontal={true}
              className='labelform'
            >
              <Form.Item className='itemkey'>
                <Input placeholder="标签键" />
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

export default ManageLabelModal;

