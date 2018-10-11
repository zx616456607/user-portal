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
import { Button, Icon, Form, Input, Tooltip, Select, Modal, Alert, Spin } from 'antd'
import './style/ServiceMeshPortCard.less'
import NoteIcon from './NoteIcon'
import { connect } from 'react-redux'
import * as serviceMeshActions from '../../actions/serviceMesh'
import { IP_REGEX } from '../../../constants'
import { getDeepValue } from '../../../client/util/util'
import NotificationHandler from '../../../src/components/Notification'
const notification = new NotificationHandler()

const mapStateToProps = state => {
  return {
  }
}
@connect(mapStateToProps,{
  getServiceMeshPortList: serviceMeshActions.getServiceMeshPortList,
  getServiceMeshPort: serviceMeshActions.getServiceMeshPort,
  createServiceMeshPort: serviceMeshActions.createServiceMeshPort,
  updateServiceMeshPort: serviceMeshActions.updateServiceMeshPort,
  deleteServiceMeshPort: serviceMeshActions.deleteServiceMeshPort,
  getServiceMeshClusterNode: serviceMeshActions.getServiceMeshClusterNode,
  checkClusterIstio: serviceMeshActions.checkClusterIstio,
})
export default class ServiceMeshPortCard extends React.Component {
  state = {
    addMeshPortVisiblity: false,
    setDefaultPortvisible: false,
    ServiceMeshPortList: [],
    istioFlag: false,
    nodeArray:{},
  }
  async componentDidMount() {
    const {cluster: { clusterID } = {}} = this.props
    const result2 = await this.props.checkClusterIstio({ clusterID })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    if (statusCode !== 200) {
      this.setState({ istioFlag: true })
    }
    try {
      const result = await this.props.getServiceMeshClusterNode(clusterID)
      const { availability: nodeArray = {} } = result.response.result
      this.setState({ nodeArray })
      } catch(e) { notification.error('加载节点数据失败!') }
    await this.reload()
  }
  reload = async () => {
    const { getServiceMeshPortList, cluster: { clusterID } = {} } = this.props
    let result
    try {
      result = await getServiceMeshPortList(clusterID)
    } catch(e) {
      notification.error('获取服务网格出口列表失败',)
    }
    const { result:ServiceMeshPortList} = result.response
    this.setState({  ServiceMeshPortList: Object.values(ServiceMeshPortList) })
  }
  render(){
    const { cluster: { clusterID } = {} } = this.props
    return(
      <QueueAni>
        { this.state.istioFlag ?
          <div key="noIstioInfo" className="noIstioInfo">
              <Alert
                // message="集群尚未安装Istio, 暂不能添加"
                description="集群尚未安装Istio, 暂不能添加"
                type="warning"
                showIcon
              />
          </div>
          :
        <div key="ServiceMeshPortCard" className="ServiceMeshPortCard">
          <div className="operationBar">
            <Button type="primary" onClick={() => this.setState({ addMeshPortVisiblity: true })}>
              <Icon type="plus" />添加网格出口
            </Button>
            {/* <Button onClick={() => this.setState({ setDefaultPortvisible: true })}><Icon type="setting" />设置</Button> */}
            <AddMeshNetPort
              visible={this.state.addMeshPortVisiblity}
              self={this} reload={this.reload}
              // getServiceMeshClusterNode={this.props.getServiceMeshClusterNode}
              clusterID = {clusterID}
              createServiceMeshPort = {this.props.createServiceMeshPort}
              alreadyUseName={this.state.ServiceMeshPortList.map(({ name }) => name )}
              nodeArray={this.state.nodeArray}
              />
            <SetDefaultPort visible={this.state.setDefaultPortvisible} self={this}/>
          </div>
          {
            this.state.ServiceMeshPortList.length === 0 ?
            <div className="loading" >暂无网格出口配置</div>
            :
             this.state.ServiceMeshPortList.map((initialValue) =>
            <ServicePortCar
            initialValue={initialValue}
            alreadyUseName={this.state.ServiceMeshPortList.map(({ name }) => name )}
            clusterID = {clusterID}
            deleteServiceMeshPort={this.props.deleteServiceMeshPort}
            reload={this.reload}
            nodeArray ={this.state.nodeArray}
            updateServiceMeshPort = {this.props.updateServiceMeshPort}
            />
          )
          }
        </div>
        }
    </QueueAni>
    )
  }
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
@Form.create()
class ServicePortCar extends React.Component {
  state = {
    edit: false, // 默认是非编辑状态
    deletevisible: false, //删除弹框标志位
  }
  onCancel = () => {
    this.setState({ edit: false })
    this.props.form.resetFields()
  }
  onSave = () => {
    const hashedName = this.props.initialValue.hashedName
    this.setState({ edit:false })
    this.props.form.validateFields(async (errors, values) => {
      if (!!errors) return
      const body = {
        nodeNames: values.node,
        exposedIPs: [values.portIp]  // 这个是可有可无
      }
      try {
        await this.props.updateServiceMeshPort(this.props.clusterID,hashedName, body)
      } catch(e) { notification.error('编辑网格出口失败') }
        await this.props.reload()
        notification.info('编辑网格出口配置成功')
    });
  }
  render() {
    return(
      <div className="ServicePortCar">
      <NoteIcon title={`默认`} hidden={true}/>
      <FormInner disabled={!this.state.edit}
      nameDisabled={true}
      form={this.props.form}
      initialValue={this.props.initialValue}
      alreadyUseName={this.props.alreadyUseName}
      nodeArray={this.props.nodeArray}
      />
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
        leftfunc={this.onCancel}
        rightText={<span ><Icon type="check" /><span style={{marginLeft: '8px'}}>保存</span></span>}
        rightfunc={this.onSave}
      />
      }
      <DeleteMeshForm
      visible={this.state.deletevisible}
      self={this}
      clusterID={this.props.clusterID}
      initialValue = {this.props.initialValue}
      deleteServiceMeshPort={this.props.deleteServiceMeshPort}
      reload={this.props.reload}
      />
    </div>
    )
  }
}

class DeleteMeshForm extends React.Component {
  state = {
    loading: false
  }
  handleOk =async () => {
    this.setState({ loading: true })
    const { clusterID, initialValue} = this.props
    try{
    await this.props.deleteServiceMeshPort(clusterID, initialValue.hashedName)
    } catch(e) {  notification.error('删除服务网格出口失败') }
    this.setState({ loading: false })
    this.props.self.setState({ deletevisible: false })
    await this.props.reload()
  }
  render(){
    const { visible, self } = this.props
    return(
      <Modal
    title="删除服务网格出口"
    visible={visible}
    onOk={this.handleOk}
    onCancel={() => self.setState({ deletevisible: false })}
    confirmLoading={this.state.loading}
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
    <div className="info">{`是否确定删除${this.props.initialValue.name}服务网格出口?`}</div>
  </div>
  </Modal>
    )
  }
}

const Option = Select.Option
const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};


class FormInner extends React.Component {
  validatorfunc = (rule, value, callback) => {
    // 当编辑时. 不验证名称,应为此时名称不允许修改
    if (this.props.nameDisabled) return callback()
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
      return callback('仅能包含字母或数组且不能以数字开头')
    }
    if (this.props.alreadyUseName.includes(value)){
      return callback('此名称已被使用!')
    }
    callback()
  }
  render(){
    const { getFieldProps } = this.props.form;
    const { disabled = true } = this.props
    const { nameDisabled = false } = this.props
    const { formItemLayout:innerFormItemLayout = formItemLayout  } = this.props
    const { initialValue: { name, exposedIPs:[exposedIPsOne] = [], nodeNames= [] } = {} } = this.props
    // initialValue
    /*
     {
       name: string,
       node: object,
       ip: []
     }
    */
    return (
      <div className="FormInner">
      <Form form={this.props.form}>
      <FormItem
        {...innerFormItemLayout}
        label="名称"
      >
        <Input
        {...getFieldProps('name', {
          initialValue: name,
          rules: [{
            required: true,
            message: '名称不能为空',
          },
          {
            validator: this.validatorfunc,
            trigger: [ 'onBlur', 'onChange' ],
          }],
        })}
        placeholder="请输入服务网格的名称"
        disabled={nameDisabled}/>
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
        <Select placeholder="请选择节点" multiple  disabled={disabled}
         {...getFieldProps('node', { initialValue: nodeNames })}>
            {
              Object.entries(this.props.nodeArray || {}).map(([key, value]) =>
              <Option value={key} disabled={!value} key={key}>{key}</Option>)
            }
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
        <Input
        {...getFieldProps('portIp', { initialValue: exposedIPsOne,
        rules: [{
          required: true,
          whitespace: true,
          message: '请输入出口IP地址',
        }, {
          pattern: IP_REGEX,
          message: 'IP地址格式不正确',
        }]
      })}
        placeholder="请输入出口Ip地址"
         disabled={disabled}
          />
      </FormItem>
    </Form>
    </div>
    )
  }
}

const AddMeshformItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
}

@Form.create()
class AddMeshNetPort extends React.Component {
  state = {
    // nodeArray:{},
    loading: false,
  }
  handleOk = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (!!errors) return
      this.setState({loading: true})
      const body = {
        nodeNames: values.node,
        name: values.name,
        exposedIPs: [values.portIp]  // 这个是可有可无
      }
      try {
        await this.props.createServiceMeshPort(this.props.clusterID, body)
        this.setState({ loading: false })
        this.props.self.setState({ addMeshPortVisiblity: false })
        this.props.form.resetFields()
      } catch(e) { notification.error('创建网格出口失败') }
        await this.props.reload()
    });

  }
  // async componentDidMount() {
  //   try {
  //   const result = await this.props.getServiceMeshClusterNode(this.props.clusterID)
  //   const { availability: nodeArray = {} } = result.response.result
  //   this.setState({ nodeArray })
  //   } catch(e) { notification.error('加载节点数据失败!') }
  // }
  onCancel = () => {
    this.props.self.setState({ addMeshPortVisiblity: false })
    this.props.form.resetFields()
  }
  render() {
    return (
      <Modal
      title="添加服务网格出口"
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onCancel}
      confirmLoading={this.state.loading}
    >
      <FormInner
      disabled={false}
      formItemLayout={AddMeshformItemLayout}
      form={this.props.form}
      nodeArray = {this.props.nodeArray}
      alreadyUseName={this.props.alreadyUseName}
      />
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