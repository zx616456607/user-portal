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
import { Modal, Checkbox,Alert, Button, Radio, Row, Col, notification } from 'antd'
import { connect } from 'react-redux'
import * as SEMeshActions from '../../../../actions/serviceMesh'
import "./style/ServiceMeshForm.less"

const RadioGroup = Radio.Group
const mapStatetoProps = () => ({})
@connect(mapStatetoProps,{
  ToggleServiceMesh: SEMeshActions.ToggleServiceMesh
})
export default class ServiceMeshForm extends React.Component {
  state = {
    Buttonloading: false,
    checked: false,
    openAllServiceMesh: true,
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
    this.setState({ checked: false, openAllServiceMesh: true },
    () => SwitchOnChange(!ModalType))
  }
  onOk = async (status) => {
    const { onClose, ToggleServiceMesh, clusterId, namespace } = this.props
    const { openAllServiceMesh } = this.state
    this.setState({ Buttonloading: true })
    try{
      await ToggleServiceMesh(namespace, clusterId,
        {
          istio: status === 'on' ? 'enabled' : 'disabled',
          existingServicesOff: openAllServiceMesh,
        })
        this.props.reload()
    } catch(e) {
      notification.error({
        message: '操作羡慕服务网格开关失败',
      })
    }
    onClose()
    this.setState({ checked: false, openAllServiceMesh: true, Buttonloading: false})
  }
  onCheckBoxChange = e => {
    const { checked } = this.state
    this.setState({ checked: !checked  })
  }
  openAllServiceMesh = e => {
    this.setState({
      openAllServiceMesh: e.target.value,
    });
  }
  render() {
    const { ModalType, visible, onClose  } = this.props
    const { Buttonloading, checked } = this.state
    const openModle = (
      <Modal
        visible={visible}
        title={`项目开启服务网格`}
        onCancel={this.onCancel}
        onOk={() => this.onOk('on')}
        confirmLoading={Buttonloading}
      >
        <div className="ServiceMeshForm open">
        <Alert
          description={
          <div>
            <p>开启后, 允许为该项目的该集群下的服务开启/关闭服务网格
            </p>
          </div>
          }
          type="info"
          showIcon
        />
        </div>
        <div style={{ marginTop: 24 }}>设置「已有服务」的服务网格状态</div>
        <Row style={{ marginTop: 12 }}>
          <Col span={24}>
            <RadioGroup onChange={this.openAllServiceMesh} value={this.state.openAllServiceMesh}>
              <Radio key="a" value={true}>全部关闭服务网格</Radio>
              <Radio key="b" value={false}>全部开启服务网格</Radio>
            </RadioGroup>
            <div style={{ color: '#ccc', marginTop: 12 }}>
            {
              this.state.openAllServiceMesh ?
              <span>{'若关闭已有服务的服务网格, 项目对应的集群中的服务将自动执行滚动发布'}</span>
              :
              <span>{'将项目&集群下已有的全部服务的服务网格开启, 若手动关闭过某服务的服务网格，系统将自动重启该服务'}</span>
            }
            </div>
          </Col>
        </Row>
      </Modal>
    )
    const closeModle = (
      <Modal
        visible={visible}
        title="关闭操作"
        onCancel={this.onCancel}
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.onCancel}>取消</Button>,
          <Button key="submit" type="primary" size="large" loading={Buttonloading}
            onClick={() => this.onOk('off')} >
            确定
          </Button>,
        ]}
      >
        <div className="ServiceMeshForm close">
          <div>
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
          </div>
          <div>
            关闭后，该项目的{this.props.clusterName}集群下服务将不能使用服务网格功能。已开启服务网格的服务将在下次重建后关闭服务网格。
            <div>确认是否关闭</div>
          </div>
{/*          <Alert
          description={
          <span>
            {`关闭后，该项目的${this.props.clusterName}集群下服务将不能使用服务网格功能。已开启服务网格的服务将在下次重建后关闭服务网格。`}
          </span>
          }
          type="info"
          showIcon
        />*/}
{/*        <div style={{  marginTop: '16px'}}>
        <Checkbox checked={checked} onChange={this.onCheckBoxChange}>确认是否关闭?</Checkbox>
        </div>*/}
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
