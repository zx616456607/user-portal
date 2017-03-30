/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React, { Component } from 'react'
import { Radio, Input, InputNumber, Form, Select, Icon, Button, Modal } from 'antd'
import './style/AlarmModal.less'
import CreateAlarmGroup from './CreateGroup'
import NotificationHandler from '../../../common/notification_handler'

const Option = Select.Option
const RadioGroup = Radio.Group

let FistStop = React.createClass({
  fistStopName(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请输入名称'));
      return
    }
    console.log('fistStopName', value)
    callback()
  },
  fistStopType(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择类型'));
      return
    }
    console.log('fistStopType', value)
    callback()
  },
  fistStopApply(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择应用'));
      return
    }
    console.log('fistStopApplye', value)
    callback()
  },
  fistStopServer(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择服务'));
      return
    }
    console.log('fistStopServer', value)
    callback()
  },
  firstForm() {
    const { funcs, form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)
      funcs.nextStep(2) // go step 2

    })
  },
  render: function () {
    const { getFieldProps } = this.props.form;
    const { funcs } = this.props
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 },
    };
    const nameProps = getFieldProps('name', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopName }
      ],
    });
    const typeProps = getFieldProps('type', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopType }
      ],
    });
    const applyProps = getFieldProps('apply', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopApply }
      ],
    });
    const serverProps = getFieldProps('server', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopServer }
      ],
    });
    return (
      <Form className="paramsSetting">
        <Form.Item label="名称" {...formItemLayout}>
          <Input {...nameProps} />
        </Form.Item>
        <Form.Item label="类型" {...formItemLayout}>
          <Select placeholder="请选择类型" {...typeProps} >
            <Option value="5min">服务</Option>
          </Select>
        </Form.Item>
        <Form.Item label="监控对象" {...formItemLayout}>
          <Select placeholder="请选择应用" {...applyProps} style={{ width: 170 }} >
            <Option value="5min">5分钟</Option>

          </Select>
          <Select placeholder="请选择服务" {...serverProps} style={{ width: 170, marginLeft: 25 }} >
            <Option value="5min">50分钟</Option>

          </Select>
        </Form.Item>
        <Form.Item label="监控周期" {...formItemLayout}>
          <Select defaultValue="5min">
            <Option value="5min">5分钟</Option>
            <Option value="30min">30分钟</Option>
            <Option value="hour">一小时</Option>
          </Select>
        </Form.Item>
        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.cancelModal()}>取消</Button>
          <Button size="large" onClick={() => this.firstForm()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

FistStop = Form.create()(FistStop)

// two step in memory add rule
let memoryId = 0
let TwoStepMemory = React.createClass({
  addMemory() {
    const { form } = this.props;

    // console.log(form.validateFields)
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)
      memoryId++;
      // can use data-binding to get
      let memory = form.getFieldValue('memory');
      memory = memory.concat(memoryId);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        memory,
      });

    })

  },
  removeMemory(k) {
    const { form } = this.props;
    if (!k) return
    // can use data-binding to get
    let memory = form.getFieldValue('memory');
    memory = memory.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      memory,
    });
  },
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('memory', {
      initialValue: [],
    });
    const memoryItems = getFieldValue('memory').map((key) => {
      return (
        <div className="ruleItem" key={key}>
          <Form.Item>
            <Select placeholder="内存使用率" {...getFieldProps(`memory_name@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 135 }} >
              <Option value="5min">50分钟</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`memory_rule@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 80 }} >
              <Option value=">">></Option>
              <Option value="=">=</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`memory_data@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`memory_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
            </Select>
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={() => this.addMemory()} size="large" icon="plus"></Button>
            <Button type="ghost" onClick={() => this.removeMemory(key)} size="large" icon="cross"></Button>
          </span>
        </div>
      );
    });
    return (
      <div className="wrapForm">
        <div className="ruleItem">
          <Form.Item>
            <Select placeholder="内存使用率"  {...getFieldProps(`memory_name`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 135 }} >
              <Option value="5min">50分钟</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select  {...getFieldProps(`memory_rule`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择规则',
              }],
            }) } style={{ width: 80 }} >
              <Option value=">">></Option>
              <Option value="=">=</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`memory_size`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select  {...getFieldProps(`used_symbol`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择规则',
              }],
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
              <Option value="MB">MB</Option>
              <Option value="GB">GB</Option>
            </Select>
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={this.addMemory} size="large" icon="plus"></Button>
            {/*<Button type="ghost" onClick={() => this.removeRule()} size="large" icon="cross"></Button>*/}
          </span>
          <div className="notes"><Icon type="exclamation-circle-o" /> 内存使用率= 所有pod使用内存之和/内存资源总量</div>

        </div>
        {memoryItems}
      </div>
    )
  }
})

TwoStepMemory = Form.create()(TwoStepMemory)

// two step in cpu add rule
let uuid = 0;
// two step in network add rule
let networkId = 0
let TwoStepNetwork = React.createClass({
  addNetwork() {
    const { form } = this.props;
    // console.log(form.validateFields)
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)
      networkId++;
      // can use data-binding to get
      let network = form.getFieldValue('network');
      network = network.concat(networkId);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        network,
      });

    })
  },
  removeNetwok(k) {
    const { form } = this.props;
    if (!k) return
    // can use data-binding to get
    let network = form.getFieldValue('network');
    network = network.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      network,
    });
  },
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('network', {
      initialValue: [],
    });
    const networkItems = getFieldValue('network').map((key) => {
      return (
        <div className="ruleItem" key={key}>
          <Form.Item>
            <Select placeholder="下载流量" {...getFieldProps(`network_name@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 135 }} >
              <Option value="5min">50分钟</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`network_rule@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 80 }} >
              <Option value=">">></Option>
              <Option value="=">=</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`network_data@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`network_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
            }) } style={{ width: 80 }} >
              <Option value="GB">GB</Option>
              <Option value="MB">MB</Option>
              <Option value="Kbps">Kbps</Option>
            </Select>
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={() => this.addNetwork()} size="large" icon="plus"></Button>
            <Button type="ghost" onClick={() => this.removeNetwok(key)} size="large" icon="cross"></Button>
          </span>
        </div>
      );
    });
    return (
      <div className="wrapForm">
        <div className="ruleItem">
          <Form.Item>
            <Select placeholder="下载流量" {...getFieldProps(`network_name`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 135 }} >
              <Option value="5min">50分钟</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`network_rule`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择规则',
              }],
            }) } style={{ width: 80 }} >
              <Option value=">">></Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`network_data`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`network_symbol`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
            </Select>
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={() => this.addNetwork()} size="large" icon="plus"></Button>
            {/*<Button type="ghost" size="large" icon="cross"></Button>*/}
          </span>

        </div>
        {networkItems}
      </div>
    )
  }
})
TwoStepNetwork = Form.create()(TwoStepNetwork)

let TwoStop = React.createClass({
  getInitialState() {
    return {
      // newselectCpu: 1,
      typeProps_0: ['%']
    }
  },
  removeRule(k) {
    const { form } = this.props;
    let cpu = form.getFieldValue('cpu');
    if (cpu.length == 1) {
      new NotificationHandler().info('至少得有一项规则')
      return
    }
    // can use data-binding to get
    cpu = cpu.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      cpu,
    });
    // this.setState({
    //   newselectCpu: 0
    // })
  },
  addRule() {
    const _this = this
    const { form } = this.props;
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)
      uuid++;
      // can use data-binding to get
      let cpu = form.getFieldValue('cpu');
      let typeProps = `typeProps_${uuid}`
      _this.setState({[typeProps]: '%'})
      cpu = cpu.concat(uuid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        cpu,
      });

    })
    // console.log('this.state.newselectCpu',this.state.newselectCpu)
    // if (this.state.newselectCpu) return
    // this.setState({
    //   newselectCpu: 1
    // })
  },
  hnadRule() {
    // nextStep
    const { form, funcs } = this.props;
    // form.getFieldValue('cpu');
    console.log(form.getFieldValue('memory'))
    console.log('network', form.getFieldValue('network'))
    funcs.nextStep(3)
  },
  changeType(key, type) {
    let typeProps = `typeProps_${key}`
    if (type == 'download' || type == 'upload') {
      this.setState({[typeProps]: 'KB/s'})
      return
    }
    this.setState({[typeProps]: '%'})
  },
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('cpu', {
      initialValue: [0],
    });
    const cpuItems = getFieldValue('cpu').map((key) => {
      return (
        <div className="ruleItem" key={key}>
          <Form.Item>
            <Select {...getFieldProps(`used_name@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
              initialValue: 'CPU',
              onChange: (type)=> this.changeType(key, type)
            }) } style={{ width: 135 }} >
              <Option value="CPU">CPU利用率</Option>
              <Option value="memory">内存利用率</Option>
              <Option value="upload">上载流量</Option>
              <Option value="download">下载流量</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`used_rule@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
              initialValue: '>'
            }) } style={{ width: 80 }} >
              <Option value=">">></Option>
              <Option value="=">=</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`used_data@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
              initialValue: '0'
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            {/*<Select {...getFieldProps(`used_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
              initialValue: '%'
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
              <Option value="KB/s">KB/s</Option>
            </Select>*/}
            <Input style={{ width: 80 }} {...getFieldProps(`used_symbol@${key}`) } value={this.state[`typeProps_${key}`]} />
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
            <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
          </span>
        </div>
      );
    });

    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}

        {cpuItems}

        {/*----------- memory Item ---------------*/}
        {/*<TwoStepMemory />*/}

        {/*------------ network item ------------- */}
        {/*<TwoStepNetwork />*/}
        <div className="alertRule">
          <Icon type="exclamation-circle-o" /><a> CPU利用率</a>= 所有pod占用CPU之和/CPU资源总量
          <a style={{marginLeft: 20}}>内存使用率</a>= 所有pod占用内存之和/内存资源总量

        </div>
        {/*  footer btn */}
        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.nextStep(1)} type="primary">上一步</Button>
          <Button size="large" onClick={() => this.hnadRule()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

TwoStop = Form.create()(TwoStop)

class AlarmModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSendMeil: 1,
      createGroup: false, // create alarm group modal
    }
  }

  submitRule() {
    console.log('submit in---------')
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 },
    };
    const { funcs } = this.props
    console.log('step is:', funcs.scope.state)
    return (
      <div className="AlarmModal">
        <div className="topStep">
          <span className={funcs.scope.state.step >= 1 ? 'step active' : 'step'}><span className="number">1</span> 参数设置</span>
          <span className={funcs.scope.state.step > 1 ? 'step active' : 'step'}><span className="number">2</span> 告警规则</span>
          <span className={funcs.scope.state.step == 3 ? 'step active' : 'step'}><span className="number">3</span> 告警行为</span>
        </div>
        <div className="alarmContent">
          <div className={funcs.scope.state.step == 1 ? 'steps' : 'hidden'}>
            <FistStop funcs={funcs} />

          </div>
          <div className={funcs.scope.state.step == 2 ? 'steps' : 'hidden'}>
            <TwoStop funcs={funcs} />
          </div>
          <div className={funcs.scope.state.step == 3 ? 'steps' : 'hidden'}>
            <Form className="alarmAction">
              <Form.Item label="发送通知" {...formItemLayout} style={{ margin: 0 }}>
                <RadioGroup defaultValue={this.state.isSendMeil} >
                  <Radio key="a" value={1}>是</Radio>
                  <Radio key="b" value={2}>否</Radio>
                </RadioGroup>
              </Form.Item>
              <div className="tips" style={{ marginBottom: 20 }}><Icon type="exclamation-circle-o" /> 选择“是”，我们会向您发送监控信息和告警信息，选择“否”，我们将不会向你发送告警信息</div>
              <Form.Item label="告警通知组" {...formItemLayout}>
                <Select placeholder="请选择告警通知组" style={{ width: 170 }} >
                  <Option value="5min">50分钟</Option>

                </Select>
                <div style={{ marginTop: 10 }}>
                  <Button icon="plus" onClick={()=> funcs.scope.setState({ alarmModal: false,createGroup: true })} size="large" type="primary">新建组</Button>
                </div>
              </Form.Item>
            </Form>
            <div className="wrapFooter">
              <Button size="large" onClick={() => funcs.nextStep(2)} type="primary">上一步</Button>
              <Button size="large" onClick={() => this.submitRule()} type="primary">提交</Button>
            </div>
          </div>
        </div>
        <Modal title="创建新通知组" visible={this.state.createGroup}
          width={560}
          maskClosable={false}
          wrapClassName="AlarmModal"
          className="alarmContent"
          footer={null}
        >
          <CreateAlarmGroup funcs={funcs} />
        </Modal>

      </div>
    )
  }
}

export default AlarmModal