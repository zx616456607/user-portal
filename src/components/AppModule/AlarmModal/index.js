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
import { validateK8sResourceForServiceName } from '../../../common/naming_validation'

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
      newselectCpu: 1
    }
  },
  removeRule(k) {
    const { form } = this.props;
    if (!k) return
    // can use data-binding to get
    let cpu = form.getFieldValue('cpu');
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
    const { form } = this.props;
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)
      uuid++;
      // can use data-binding to get
      let cpu = form.getFieldValue('cpu');
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
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('cpu', {
      initialValue: [],
    });
    const cpuItems = getFieldValue('cpu').map((key) => {
      return (
        <div className="ruleItem" key={key}>
          <Form.Item>
            <Select placeholder="CPU利用率" {...getFieldProps(`used_name@${key}`, {
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
            <Select {...getFieldProps(`used_rule@${key}`, {
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
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`used_data@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`used_symbol@${key}`, {
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
            <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
            <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
          </span>
        </div>
      );
    });

    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}
        <div className="ruleItem">
          <Form.Item>
            <Select placeholder="CPU利用率" {...getFieldProps(`used_name`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择类型',
              }],
            }) } style={{ width: 135, }} >
              <Option value="5min">50分钟</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`used_rule`, {
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
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100" {...getFieldProps(`used_data`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入数值',
              }],
            }) } style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`used_symbol`, {
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
            <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
            {/*<Button type="ghost" onClick={() => this.removeRule()} size="large" icon="cross"></Button>*/}
          </span>
          <div className="notes"><Icon type="exclamation-circle-o" /> CPU利用率= 所有pod占用CPU之和/CPU资源总量</div>
        </div>
        {cpuItems}

        {/*----------- memory Item ---------------*/}
        <TwoStepMemory />

        {/*------------ network item ------------- */}
        <TwoStepNetwork />
        <div className="alertRule">
          <Icon type="exclamation-circle-o" />
          公有云标准版用户可以创建两条策略，每条策略两条规则，公有云专业版和私有云用户没有限制
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

// create alarm group from
let mid = 0
let AlarmGroup = React.createClass({
  getInitialState() {
    return {
      isAddEmail: 1
    }
  },
  removeEmail(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: 1})
  },
  addEmail() {
    console.log(this.state)
    if (!this.state.isAddEmail) return
    const { form } = this.props
    // form.validateFields((error, values) => {
    //   if (!!error) {
    //     return
    //   }
    //   console.log('vaelue', values)

    // })
    mid++;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(mid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: false})
  },
  addRuleEmail(rule, value, callback) {
    if(!Boolean(value)) {
      callback(new Error('请输入邮箱地址'))
      return
    }
    callback()
  },
  ruleEmail() {
    // send rule email
  },
  emailName(rule, value, callback) {
    // top email rule name
    if (!Boolean(value)) {
      callback(new Error('请输入名称'))
      return
    }
    if (value.length < 3 || value.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  },
  submitAddEmail() {
    // submit add email modal
    // console.log('getFielsv',this.props.form.getFieldsValue());
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        console.log('error is')
        return
      }
      console.log('submitVaelue', values)

    })
  },
  handCancel() {
    const {funcs,form } = this.props
     funcs.scope.setState({ createGroup: false, alarmModal: true})
     form.resetFields()
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('keys', {
      initialValue: [],
    });
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div key={k} style={{clear:'both'}}>
        <Form.Item style={{float:'left'}}>
          <Input {...getFieldProps(`email${k}`, {
            rules: [{
              whitespace: true,
            },
            {validator: this.addRuleEmail}
            ],
          }) } style={{ width: '150px', marginRight: 8 }}
          />
        </Form.Item>
          <Input placeholder="备注"size="large" style={{ width: 100,  marginRight: 8 }} />
          <Button type="primary" size="large" onClick={()=> this.ruleEmail()}>验证邮箱</Button>
          <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removeEmail(k)}>取消</Button>
        </div>
      );
    });
    return (
      <Modal title="创建新列表" visible={funcs.scope.state.createGroup}
          width={580}
          maskClosable={false}
          wrapClassName="AlarmModal"
          className="alarmContent"
          onCancel={() =>this.handCancel()}
          onOk={()=> this.submitAddEmail()}
        >
        <Form className="alarmAction" form={this.props.form}>
          <Form.Item label="名称" {...formItemLayout} >
            <Input {...getFieldProps(`emailName`, {
            rules: [{ whitespace: true },
              { validator: this.emailName}
            ]}) }
          />
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout} >
            <Input type="textarea" {...getFieldProps(`emailDesc`, {
            rules: [{ whitespace: true },
            ]}) }/>
          </Form.Item>
          <div className="lables">
            <div className="keys">
              邮箱
            </div>
            <div className="emaillItem" >

              {formItems}
              <div style={{clear:'both'}}><a onClick={() => this.addEmail()}><Icon type="plus-circle-o" /> 添加邮箱</a></div>
            </div>
          </div>

        </Form>
      </Modal>
    )
  }
})

AlarmGroup = Form.create()(AlarmGroup)

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
    console.log('step is:', funcs.scope.state.step)
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
                  <Button icon="plus" onClick={() => funcs.scope.setState({ createGroup: true, alarmModal: false })} size="large" type="primary">新建组</Button>
                </div>
              </Form.Item>
            </Form>
            <div className="wrapFooter">
              <Button size="large" onClick={() => funcs.nextStep(2)} type="primary">上一步</Button>
              <Button size="large" onClick={() => this.submitRule()} type="primary">提交</Button>
            </div>
          </div>
        </div>

        <AlarmGroup funcs={funcs} />

      </div>
    )
  }
}

export default AlarmModal