/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ServiceMesh.js page
 *
 * @author zhangtao
 * @date Wednesday July 25th 2018
 */
import React, { PropTypes } from 'react'
import { Modal, Checkbox,Alert, Button } from 'antd'
import "./style/ServiceMeshForm.less"
export default class ServiceMeshForm extends React.Component {
  state = {
    Buttonloading: false,
    checked: false,
  }
  static propTypes = {
    ModalType: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    // onOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    SwitchOnChange: PropTypes.func.isRequired,
  }
  onCancel = () => {
    const { onClose, SwitchOnChange, ModalType } = this.props;
    onClose()
    setTimeout(() => {SwitchOnChange(!ModalType)}, 0)
    this.setState({ checked: false })
  }
  onOk = () => {
    const { onClose } = this.props
    this.setState({ Buttonloading: true })
    // TODO: 向后台发送请求
    setTimeout(() => {
      this.setState({ Buttonloading: false })
      onClose()
      this.setState({ checked: false })
    }, 1000)
  }
  onCheckBoxChange = e => {
    const { checked } = this.state
    this.setState({ checked: !checked  })
  }
  render() {
    const { ModalType, visible, onClose  } = this.props
    const { Buttonloading, checked } = this.state
    const openModle = (
      <Modal
        visible={visible}
        title={`项目开启服务网格`}
        onCancel={this.onCancel}
        onOk={this.onOk}
        confirmLoading={Buttonloading}
      >
        <div className="ServiceMeshForm">
        <Alert
          description={
          <div>
            <p>项目开启 service mesh 后，此项目中的所有服务均开启服务网格，项目中服务将由服务网格代理
            ，使用微服务中心提供的治理功能。
            </p>
            <p style={{ color: '#fdbd66' }}>确定是否为整个项目开启服务网格？</p>
          </div>
          }
          type="warning"
          showIcon
        />
        </div>
      </Modal>
    )
    const closeModle = (
      <Modal
        visible={visible}
        title={`项目关闭服务网格`}
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.onCancel}>取消</Button>,
          <Button key="submit" type="primary" size="large" loading={Buttonloading}
            onClick={this.onOk} disabled={!checked} >
            确定
          </Button>,
        ]}
      >
        <div className="ServiceMeshForm">
        <Alert
          description={
          <span>
            关闭 service mesh后，此项目中的服务将关闭服务网格，项目中服务将不再使用微服务中心提供的治理功能。
          </span>
          }
          type="warning"
          showIcon
        />
        <div style={{  marginTop: '16px'}}>
        <Checkbox checked={checked} onChange={this.onCheckBoxChange}>项目成员在服务维度开启的服务网格，将不被影响</Checkbox>
        </div>
        </div>
      </Modal>
    )
    if (ModalType === true){
      return (
          openModle
        )
    }else {
      return (
         closeModle
        )
    }
  }
}