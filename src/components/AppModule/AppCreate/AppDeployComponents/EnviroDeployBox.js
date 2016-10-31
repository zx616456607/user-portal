/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EnviroDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/EnviroDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
let uuidPort = 0;
let uuidEnviro = 0;

let MyComponentEnviro = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { getFieldProps, getFieldValue, getFieldsValue } = this.props.parentScope.props.form;
    const { form } = this.props.parentScope.props;
    let envKey = form.getFieldValue('envKey');
    envKey = envKey.filter((key) => {
      return key !== k;
    })
    form.setFieldsValue({
      envKey,
    })
    
  },
  add() {
    uuidEnviro++;
    const { form } = this.props.parentScope.props;
    let envKey = form.getFieldValue('envKey');
    envKey = envKey.concat(uuidEnviro);
    form.setFieldsValue({
      envKey,
    });
  },
  render: function () {
    const { form } = this.props
    const { getFieldProps, getFieldValue, getFieldsValue } = form;
    getFieldProps('envKey', {
      initialValue: [],
    });

    const formItems = getFieldValue('envKey').map((k) => {
      return (
        <FormItem key={`env${k}`}>
          <li className="enviroDetail">
            <div className="input">
              <Input {...getFieldProps(`envName${k}`, {}) } className="composeUrl" type="text" />
            </div>
            <div className="input">
              <Input {...getFieldProps(`envValue${k}`, {}) } className="composeUrl" type="text" />
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)}/>
            </div>
            <div style={{ clear: "both" }}></div>
          </li>
        </FormItem>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        <div className="addBtn" onClick={this.add}>
          <Icon type="plus-circle-o" />
          <span>添加环境变量</span>
        </div>
      </div>
    );
  }
});

let MyComponentPort = React.createClass({
  getInitialState: function () {
    return {
      addDis: false,
      intDis: false,
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props
    let portKey = form.getFieldValue('portKey');
    portKey = portKey.filter((key) => {
      return key !== k;
    });
    if (form.getFieldValue('portKey').length === 0) {
      this.props.parentScope.setState({
        disable: true,
      })
    } else {
      form.getFieldValue('portKey').map((k) => {
        const value = form.getFieldProps(`targetPortUrl${k}`).value
        form.setFieldsValue({
          [`targetPortUrl${k}`]: value
        })
      })
    }
    form.setFieldsValue({
      portKey,
    })
  },
  add() {
    uuidPort++;
    const { form } = this.props.parentScope.props;
    let portKey = form.getFieldValue('portKey');
    portKey = portKey.concat(uuidPort);
    form.setFieldsValue({
      portKey,
    });
  },
  portsExists(rule, value, callback) {
    const {getFieldValue, getFieldProps} = this.props.form
    if (!value) {
      callback([new Error('抱歉，必须填端口.')])
      this.setState({
        addDis: true,
      })
      return
    } else {
      setTimeout(() => {
        if (isNaN(Number(value))) {
          callback([new Error('抱歉，该端口不合法.')])
          this.setState({
            addDis: true,
          })
          return
        } else {
          var i = 0
          getFieldValue('portKey').map((k) => {
            if(value === getFieldProps(`targetPortUrl${k}`).value){
              i++
              if(i>1){
                callback([new Error('抱歉，端口名称重复.')])
                
                this.setState({
                  addDis: true,
                })
                return
              }
            }
          })
          this.setState({
            addDis: false,
          })
          callback()
        }
      }, 800)
    }
  },
  render: function () {
    const { form, parentScope } = this.props
    const { intDis } = this.state
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    getFieldProps('portKey', {
      initialValue: [],
    })
    const formItems = getFieldValue('portKey').map((k) => {
      return (
        <div key={`port${k}`}>
          <li className="portDetail">
            <div className="input">
              <FormItem hasFeedback
                help={isFieldValidating(`targetPortUrl${k}`) ? '校验中...' : (getFieldError(`targetPortUrl${k}`) || []).join(', ')}>
                <Input {...getFieldProps(`targetPortUrl${k}`, {
                  rules: [{ validator: this.portsExists },],
                }) } className="composeUrl" type="text" size="large"/>
              </FormItem>
            </div>
            <div className="protocol select">
              <FormItem className="portGroupForm">
                <Select {...getFieldProps(`portType${k}`,{
                  rules: [{
                    required: true,
                    message: '请选择端口类型',
                  },]
                })}
                  showSearch
                  optionFilterProp="children"
                  notFoundContent="无法找到"
                  className="portGroup" size="large">
                  <Option value="http">Http</Option>
                  <Option value="tcp">Tcp</Option>
                  <Option value="udp">Udp</Option>
                </Select>
              </FormItem>
            </div>
            <div className="mapping">
              <Input {...getFieldProps(`portUrl${k}`, {}) } className="composeUrl" type="text" size="large" />
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)} />
            </div>
            <div style={{ clear: "both" }}></div>
          </li>
        </div>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        {/*{
          getFieldValue('portKey').length === 0 ?
            <div className="addBtn">
              <Button type="primary" onClick={this.add}>
                <Icon type="plus-circle-o" />
                <span>添加映射端口</span>
              </Button>
            </div> :
            <div className="addBtn">
              <Button disabled={parentScope.state.disable} type="primary" onClick={this.add}>
                <Icon type="plus-circle-o" />
                <span>添加映射端口</span>
              </Button>
            </div>
        }*/}
        <div className="addBtn">
          <Button type="primary" onClick={this.add} disabled={this.state.addDis}>
            <Icon type="plus-circle-o" />
            <span>添加映射端口</span>
          </Button>
        </div>
      </div>
    );
  }
});

let EnviroDeployBox = React.createClass({
  render: function () {
    const { form,disAdd } = this.props
    const parentScope = this.props.scope;
    return (
      <div id="advanceBox">
        <div className="advanceBox">
          <div className="enviroBox">
            <span className="title">环境变量</span>
            <div className="enviroList">
              <div className="enviroTitle">
                <div className="enviroCommonTitle">
                  <span>键</span>
                </div>
                <div className="enviroCommonTitle">
                  <span>值</span>
                </div>
                <div className="enviroCommonTitle">
                  <span>操作</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponentEnviro parentScope={parentScope} form={form}/>
            </div>
          </div>
          <div className="portBox">
            <span className="title">映射端口</span>
            <div className="portList">
              <div className="portTitle">
                <div className="portCommonTitle">
                  <span>容器端口</span>
                </div>
                <div className="protocol portCommonTitle">
                  <span>协议</span>
                </div>
                <div className="mapping portCommonTitle">
                  <span>映射主机端口</span>
                </div>
                <div className="portCommonTitle">
                  <span>操作</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponentPort parentScope={parentScope} form={form}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default EnviroDeployBox;