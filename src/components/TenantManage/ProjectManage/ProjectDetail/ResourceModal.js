/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Project Detail
 *
 * v0.1 - 2018-04-18
 * @author rensiwei
 */

import React, { Component } from 'react'
import { Modal, Button } from 'antd'

class ResourceModal extends Component {
  state={
    currentStep: 0,
    confirmLoading: false,
  }
  nextStep = () => {
    this.setState({
      currentStep: 1
    })
  }
  returnStep = () => {
    this.setState({
      currentStep: 0
    })
  }
  formSubmit = () => {
    this.setState({
      confirmLoading: true,
    })
  }
  modalCancel = () => {
    this.props.onCancel();
    this.setState({
      currentStep: 0,
      confirmLoading: false,
    })
  }
  render(){
    const footer = (() => {
      return (
        <div>
          <Button onClick={() => {!!!this.props.isModalFetching && !!!isResFetching && this.modalCancel()}}>取消</Button>
          {
            this.state.currentStep === 0 ?
              <Button type="primary" onClick={this.nextStep}>下一步</Button>
              :
              [
              <Button type="primary" onClick={this.returnStep}>上一步</Button>,
              <Button type="primary" onClick={this.formSubmit} loading={this.props.confirmLoading}>保存</Button>
              ]
          }
        </div>
      )
    })();
    return (
      <Modal
        visible={this.props.visible}
        footer={footer}
        title="编辑权限"
      >
        <ul className="stepBox">
          <li className={"active"}>
            <span>1</span>
            选择资源
          </li>
          <li className={this.state.currentStep == 1 ? "active" : ""}>
            <span>2</span>
            选择权限
          </li>
        </ul>
      </Modal>
    )
  }
  componentDidMount = () => {
    this.props.currResourceType;
  }
}

function mapStateToThirdProp(state, props) {
  return {}
}
export default ResourceModal = connect(mapStateToThirdProp, {
  getfuwu,
})(ResourceModal)