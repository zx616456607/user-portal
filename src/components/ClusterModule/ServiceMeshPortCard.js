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
import intlMsg from './NetworkConfigurationIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import TenxIcon from '@tenx-ui/icon/es/_old'

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
class ServiceMeshPortCard extends React.Component {
  state = {
    addMeshPortVisiblity: false,
    setDefaultPortvisible: false,
    ServiceMeshPortList: [],
    istioFlag: false,
    // nodeArray: [],
    nodes: [],
  }
  async componentDidMount() {
    const {cluster: { clusterID } = {}} = this.props
    const result2 = await this.props.checkClusterIstio({ clusterID }, {
      failed: {
        func: () => {
          // notification.destroy()
          // notification.warn('请安装 Istio 插件')
        }
      }
    })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    if (statusCode !== 200) {
      this.setState({ istioFlag: true })
    }
    await this.reload()
  }
  reload = async () => {
    const { getServiceMeshPortList, cluster: { clusterID } = {} } = this.props
    let result
    try {
      result = await getServiceMeshPortList(clusterID)
    } catch(e) {
      notification.warn(this.props.intl.formatMessage(intlMsg.gainServiceMeshPortListFailure))
    }
    const { result:ServiceMeshPortList} = result.response
    this.setState({  ServiceMeshPortList: Object.values(ServiceMeshPortList) })
    this.props.loadData()
    // try {
    //   const result = await this.props.getServiceMeshClusterNode(clusterID)
    //   const { availability: nodeArray = [] } = result.response.result
    //   // nodes
    //   this.setState({ nodeArray })
    //   } catch(e) { notification.error(this.props.intl.formatMessage(intlMsg.loadNodedataFailure)) }
  }
  render(){
    const { cluster: { clusterID } = {} } = this.props
    return(
      <QueueAni>
        { this.state.istioFlag ?
          <div key="noIstioInfo" className="noIstioInfo">
              {/* <Alert
                // message="集群尚未安装Istio, 暂不能添加"
                description={this.props.intl.formatMessage(intlMsg.clusterNoIstioNOAdd)}
                type="warning"
                showIcon
              /> */}
              <TenxNoBar text={this.props.intl.formatMessage(intlMsg.clusterNoIstioNOAdd)}/>
          </div>
          :
        <div key="ServiceMeshPortCard" className="ServiceMeshPortCard">
          <div className="operationBar">
            <Button type="primary" onClick={() => this.setState({ addMeshPortVisiblity: true })}>
              {this.props.intl.formatMessage(intlMsg.addMeshPort)}
            </Button>
            {/* <Button onClick={() => this.setState({ setDefaultPortvisible: true })}><Icon type="setting" />设置</Button> */}
            { this.state.addMeshPortVisiblity &&
            <AddMeshNetPort
              visible={this.state.addMeshPortVisiblity}
              self={this} reload={this.reload}
              // getServiceMeshClusterNode={this.props.getServiceMeshClusterNode}
              loadData={this.props.loadData}
              clusterID = {clusterID}
              createServiceMeshPort = {this.props.createServiceMeshPort}
              alreadyUseName={this.state.ServiceMeshPortList.map(({ name }) => name )}
              nodeArray={this.props.nodeList}
              formatMessage={this.props.intl.formatMessage}
              />
            }
            <SetDefaultPort visible={this.state.setDefaultPortvisible} self={this}/>
          </div>
          {
            this.state.ServiceMeshPortList.length === 0 ?
            <div className="loading" >{this.props.intl.formatMessage(intlMsg.noMeshPortConfig)}</div>
            :
             this.state.ServiceMeshPortList.map((initialValue) =>
            <ServicePortCar
            initialValue={initialValue}
            alreadyUseName={this.state.ServiceMeshPortList.map(({ name }) => name )}
            clusterID = {clusterID}
            deleteServiceMeshPort={this.props.deleteServiceMeshPort}
            reload={this.reload}
            nodeArray ={this.props.nodeList}
            updateServiceMeshPort = {this.props.updateServiceMeshPort}
            formatMessage={this.props.intl.formatMessage}
            />
          )
          }
        </div>
        }
    </QueueAni>
    )
  }
}

const ServiceMeshPortCardIntl = injectIntl(ServiceMeshPortCard, {
  withRef: true,
})
export default ServiceMeshPortCardIntl

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
    this.props.form.validateFields(async (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({ edit:false })
      const body = {
        nodeNames: values.node,
        exposedIPs: [values.portIp]  // 这个是可有可无
      }
      try {
        await this.props.updateServiceMeshPort(this.props.clusterID,hashedName, body)
      } catch(e) { notification.error(this.props.formatMessage(intlMsg.editMeshPortFailure)) }
        await this.props.reload()
        notification.success(this.props.formatMessage(intlMsg.editMeshPortSuccess))
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
      formatMessage={this.props.formatMessage}
      />
      {
        !this.state.edit ?
      <BottomButton
        leftText={<span><Icon type="edit" />
          <span style={{marginLeft: '8px'}}>{this.props.formatMessage(intlMsg.editConfig)}</span>
        </span>}
        leftfunc={() => {
          this.setState({ edit: true })
          this.props.reload()
        }}
        rightText={<span><Icon type="delete" />
          <span style={{marginLeft: '8px'}}>{this.props.formatMessage(intlMsg.delete)}</span>
        </span>}
        rightfunc = {() => this.setState({ deletevisible: true })}
      /> :
      <BottomButton
        leftText={<span><Icon type="cross" />
          <span style={{marginLeft: '8px'}}>{this.props.formatMessage(intlMsg.cancel)}</span>
        </span>}
        leftfunc={this.onCancel}
        rightText={<span ><Icon type="check" />
          <span style={{marginLeft: '8px'}}>{this.props.formatMessage(intlMsg.save)}</span>
        </span>}
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
      formatMessage={this.props.formatMessage}
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
    } catch(e) {  notification.error(this.props.formatMessage(intlMsg.deleteServiceMeshPortFailure)) }
    this.setState({ loading: false })
    this.props.self.setState({ deletevisible: false })
    await this.props.reload()
  }
  render(){
    const { visible, self } = this.props
    return(
      <Modal
    title={this.props.formatMessage(intlMsg.deleteServiceMeshPort)}
    visible={visible}
    onOk={this.handleOk}
    onCancel={() => self.setState({ deletevisible: false })}
    confirmLoading={this.state.loading}
  >
  <div className="DeleteMeshForm">
    {/* <Alert
      description={
        <span >
          <p>{this.props.formatMessage(intlMsg.DeleteMeshFormInfoOne)}</p>
        </span>
      }
      type="warning" showIcon
    /> */}
    <TenxAlertBar text={this.props.formatMessage(intlMsg.DeleteMeshFormInfoOne)} />
    <div className="info">
    <FormattedMessage {...intlMsg.deleteServiceMeshPortConfig }
      values={{ serviceMesh: this.props.initialValue.name }}/>
    </div>
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
      return callback(this.props.formatMessage(intlMsg.onlyIncloudNumberAndalphabet))
    }
    if (this.props.alreadyUseName.includes(value)){
      return callback(this.props.formatMessage(intlMsg.thisNameAlreadyBeUsed))
    }
    callback()
  }
  render(){
    const { getFieldProps } = this.props.form;
    const { disabled = true } = this.props
    const { nameDisabled = false } = this.props
    const { formItemLayout:innerFormItemLayout = formItemLayout  } = this.props
    const { initialValue: { name, exposedIPs:[exposedIPsOne] = [], nodeNames= [] } = {} } = this.props
    return (
      <div className="FormInner">
      <Form form={this.props.form}>
      <FormItem
        {...innerFormItemLayout}
        label={this.props.formatMessage(intlMsg.name)}
      >
        <Input
        {...getFieldProps('name', {
          initialValue: name,
          rules: [{
            required: true,
            message: this.props.formatMessage(intlMsg.nameNotEmpty),
          },
          {
            validator: this.validatorfunc,
            trigger: [ 'onBlur', 'onChange' ],
          }],
        })}
        placeholder={this.props.formatMessage(intlMsg.pleaseInputServiceMeshName)}
        disabled={nameDisabled}/>
      </FormItem>
      <FormItem
        {...innerFormItemLayout}
        label={<span className="innerSpanWapper">
          <span className="innerSpan">{this.props.formatMessage(intlMsg.choiceNode)}</span>
          <Tooltip title={this.props.formatMessage(intlMsg.choiceMoreNodesHighAvailability)}>
            <Icon type="question-circle-o" />
          </Tooltip>
          </span>}
      >
        <Select placeholder={this.props.formatMessage(intlMsg.pleaseChoiceNode)} multiple  disabled={disabled}
         {...getFieldProps('node', { initialValue: nodeNames,
          rules: [{
            required: true,
            message: '请选择节点',
          },] })}
         >
            {
             this.props.nodeArray.map(item =>
              <Option disabled={item.unavailableReason} key={item.metadata.name}>{item.metadata.name}</Option>)
            }
        </Select>
      </FormItem>
      <FormItem
        {...innerFormItemLayout}
        label={<span className="innerSpanWapper">
          <span className="innerSpan">{this.props.formatMessage(intlMsg.PortIP)}</span>
            <Tooltip title={this.props.formatMessage(intlMsg.ServiceExportPortIP)}>
            <Icon type="question-circle-o" />
            </Tooltip>
          </span>}
      >
        <Input
        {...getFieldProps('portIp', { initialValue: exposedIPsOne,
        rules: [{
          required: true,
          whitespace: true,
          message: this.props.formatMessage(intlMsg.PleaseInputExportPortIp),
        }, {
          pattern: IP_REGEX,
          message: this.props.formatMessage(intlMsg.IPAddressWrong),
        }]
      })}
        placeholder={this.props.formatMessage(intlMsg.PleaseInputExportPortIp)}
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
      } catch(e) { notification.error(this.props.formatMessage(intlMsg.createMeshPortFailure)) }
        await this.props.reload()
    });

  }
  async componentDidMount() {
    this.props.loadData()
  }
  onCancel = () => {
    this.props.self.setState({ addMeshPortVisiblity: false })
    this.props.form.resetFields()
  }
  render() {
    return (
      <Modal
      title={this.props.formatMessage(intlMsg.addServiceMeshPort)}
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onCancel}
      confirmLoading={this.state.loading}
    >
      <FormInner
      disabled={false}
      formItemLayout={AddMeshformItemLayout}
      form={this.props.form}
      nodeArray={this.props.nodeArray}
      alreadyUseName={this.props.alreadyUseName}
      formatMessage={this.props.formatMessage}
      />
    </Modal>
    )
  }
}

const DefaultformItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 10 },
}

// TODO: 设置默认网格出口的功能 后端提议并经产品确认后, 决定先不做, 所以以下代码并未调试,
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

function TenxAlertBar({text = '-'}) {
  return (
    <div className='TenxAlertBar'>
    <i className="fa fa-exclamation-triangle warningIcon" aria-hidden="true"
    style={{ top: '24px' }}></i>
    <div>{text}</div>
  </div>
  )
}

function TenxNoBar({ text }) {
  return <div className='TenxNoBar'>
    <TenxIcon type="warning" className="icon"/>
    {/* <i className="fa fa-exclamation-triangle warningIcon" aria-hidden="true"
    style={{ top: '24px' }}></i> */}
    <span>{typeof text === 'string' ? text : '-' }</span>
  </div>
}
