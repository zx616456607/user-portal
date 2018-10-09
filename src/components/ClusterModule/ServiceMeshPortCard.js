/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ServiceMeshPortCard.js page
 *
 * @author zhangtao
 * @date Saturday September 29th 2018
 */
import React from 'react'
import QueueAni from 'rc-queue-anim'
import { Button, Icon, Form, Input, Tooltip, Select, Modal, Alert } from 'antd'
import './style/ServiceMeshPortCard.less'

export default class ServiceMeshPortCard extends React.Component {
  state = {
    addMeshPortVisiblity: false,
    setDefaultPortvisible: false,
  }
  render(){
    return(
      <QueueAni>
        <div key="ServiceMeshPortCard" className="ServiceMeshPortCard">
          <div className="operationBar">
            <Button type="primary" onClick={() => this.setState({ addMeshPortVisiblity: true })}>
              <Icon type="plus" />添加网格出口
            </Button>
            <Button onClick={() => this.setState({ setDefaultPortvisible: true })}><Icon type="setting" />设置</Button>
            <AddMeshNetPort visible={this.state.addMeshPortVisiblity} self={this}/>
            <SetDefaultPort visible={this.state.setDefaultPortvisible} self={this}/>
          </div>
          <ServicePortCar/>
        </div>
    </QueueAni>
    )
  }
}


function NoteIcon({title, hidden = false}) {
  return(
    <div className="NoteIcon" style={{ visibility: hidden ? "hidden":"initial" }}>
      <div className="parallelogram1"></div>
      <div className="parallelogram"></div>
      <div className="title">{title}</div>
    </div>
  )
}

function BottomButton({
  leftText = '-',
  rightText = '-',
  leftfunc = ()=> {},
  rightfunc = () => {},
}) {
  return (
    <div className="BottomButton">
      <div onClick={leftfunc}>{leftText}</div>
      <div onClick={rightfunc}>{rightText}</div>
      <div className="inter"></div>
    </div>
  )
}
class ServicePortCar extends React.Component {
  state = {
    edit: false, // 默认是非编辑状态
    deletevisible: false, //删除弹框标志位
  }
  render() {
    return(
      <div className="ServicePortCar">
      <NoteIcon title={`默认`}/>
      <FormInner disabled={!this.state.edit}/>
      {
        !this.state.edit ?
      <BottomButton
        leftText={<span><Icon type="edit" /><span style={{marginLeft: '8px'}}>编辑配置</span></span>}
        leftfunc={() => this.setState({ edit: true })}
        rightText={<span><Icon type="delete" /><span style={{marginLeft: '8px'}}>删除</span></span>}
        rightfunc = {() => this.setState({ deletevisible: true })}
      /> :
      <BottomButton
        leftText={<span><Icon type="cross" /><span style={{marginLeft: '8px'}}>取消</span></span>}
        leftfunc={() => this.setState({ edit: false })}
        rightText={<span ><Icon type="check" /><span style={{marginLeft: '8px'}}>保存</span></span>}
      />
      }
      <DeleteMeshForm visible={this.state.deletevisible} self={this}/>
    </div>
    )
  }
}

function DeleteMeshForm({
  visible,
  self,
}) {
  return (
    <Modal
    title="删除服务网格出口"
    visible={visible}
    onOk={this.handleOk}
    onCancel={() => self.setState({ deletevisible: false })}
  >
  <div className="DeleteMeshForm">
    <Alert
      description={
        <span >
          <p>1. 删除该服务网格出口后, 已使用此出口的网关, 以及关联的路由规则中的服务将不能通过此网络出口被访问</p>
          <p>2. 此服务网格出口为默认出口, 删除后, 创建网关时, 将不提供默认的服务网格出口, 建议重新设置默认出口</p>
        </span>
      }
      type="warning" showIcon
    />
    <div className="info">是否确定删除xxx服务网格出口?</div>
  </div>
  </Modal>
  )
}

const Option = Select.Option
const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
class FormInner extends React.Component {
  render(){
    const { getFieldProps } = this.props.form;
    const { disabled = true } = this.props
    const { formItemLayout:innerFormItemLayout = formItemLayout  } = this.props
    return (
      <div className="FormInner">
      <Form onSubmit={this.handleSubmit}>
      <FormItem
        {...innerFormItemLayout}
        label="名称"
      >
        <Input {...getFieldProps('name', { initialValue: '' })} placeholder="请输入服务网格的名称"
        disabled={disabled}/>
      </FormItem>
      <FormItem
        {...innerFormItemLayout}
        label={<span className="innerSpanWapper">
          <span className="innerSpan">选择节点</span>
          <Tooltip title="选择多个节点时高可用">
            <Icon type="question-circle-o" />
          </Tooltip>
          </span>}
      >
        <Select placeholder="请选择节点" multiple  disabled={disabled}>
            <Option value="china">中国</Option>
            <Option value="use">美国</Option>
            <Option value="japan">日本</Option>
            <Option value="korean">韩国</Option>
            <Option value="Thailand">泰国</Option>
        </Select>
      </FormItem>
      <FormItem
        {...innerFormItemLayout}
        label={<span className="innerSpanWapper">
          <span className="innerSpan">出口 IP</span>
            <Tooltip title="服务对外的出口 IP">
            <Icon type="question-circle-o" />
            </Tooltip>
          </span>}
      >
        <Input {...getFieldProps('portIp', { initialValue: '' })} placeholder="请输入出口Ip地址"
         disabled={disabled}
          />
      </FormItem>
    </Form>
    </div>
    )
  }
}
FormInner = Form.create()(FormInner);

const AddMeshformItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
}
class AddMeshNetPort extends React.Component {
  render() {
    const { self } = this.props;
    return (
      <Modal
      title="添加服务网格出口"
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={() => self.setState({ addMeshPortVisiblity: false })}
    >
      <FormInner disabled={false} formItemLayout={AddMeshformItemLayout}/>
    </Modal>
    )
  }
}

const DefaultformItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 10 },
}
class SetDefaultPort extends React.Component {
  render() {
    const { self } = this.props;
    return (
      <Modal
      title="设置默认服务网格出口"
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={() => self.setState({ setDefaultPortvisible: false })}
    >
      <div className="SetDefaultPort">
      <Alert message="设置一个默认的服务网格出口, 当创建网关时, 默认选择该出口" type="info" banner={true}/>
      <FormItem
        {...DefaultformItemLayout}
        label={<span className="innerSpanWapper">
          <span className="innerSpan">默认服务网格出口</span>
          </span>}
      >
        <Select placeholder="请选择默认网格出口" style={{ width: '100%' }} >
            <Option value="china">中国</Option>
            <Option value="use">美国</Option>
            <Option value="japan">日本</Option>
            <Option value="korean">韩国</Option>
            <Option value="Thailand">泰国</Option>
        </Select>
      </FormItem>
      </div>
    </Modal>
    )
  }
}