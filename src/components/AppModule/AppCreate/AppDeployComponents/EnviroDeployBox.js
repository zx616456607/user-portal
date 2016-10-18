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

let uuidEnviro = 0;
let MyComponentEnviro = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { getFieldProps, getFieldValue, getFieldsValue } = this.props.parentScope.props.form;
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let envKey = form.getFieldValue('envKey');
    envKey = envKey.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      envKey,
    });
  },
  add() {
    uuidEnviro++;
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let envKey = form.getFieldValue('envKey');
    envKey = envKey.concat(uuidEnviro);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      envKey,
    });
  },
  render: function () {
    const { getFieldProps, getFieldValue, getFieldsValue } = this.props.parentScope.props.form;
    getFieldProps('envKey', {
      initialValue: [],
    });

    const formItems = getFieldValue('envKey').map((k) => {
      return (
        <FormItem key={`env${k}`}>
          <li className="enviroDetail">
            <div className="input">
              <Input {...getFieldProps(`envName${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '挂载路径呢?',
                }],
              }) } className="composeUrl" type="text" />
            </div>
            <div className="input">
              <Input {...getFieldProps(`envValue${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '挂载路径呢?',
                }],
              }) } className="composeUrl" type="text" />
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)}></i>
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

let uuidPort = 0;
let MyComponentPort = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props.parentScope.props;
    let portKey = form.getFieldValue('portKey');
    portKey = portKey.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      portKey,
    });
    if(this.props.parentScope.props.form.getFieldValue('portKey').length === 0){
      this.props.parentScope.setState({
        disable: true,
      })
    }
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
    if (!value) {
      callback()
    } else {
      setTimeout(() => {
        if (isNaN(Number(value))) {
          console.log('value',typeof (parseInt(value)))
          callback([new Error('抱歉，该服务名称不合法.')])
          this.props.parentScope.setState({
            disable: true,
          })
        } else {
          callback()
        }
      }, 800)
    }
  },
  render: function () {
    const { getFieldProps, getFieldValue,isFieldValidating,getFieldError } = this.props.parentScope.props.form;
    getFieldProps('portKey', {
      initialValue: [],
    });
    const formItems = getFieldValue('portKey').map((k) => {
      return (
        <FormItem key={`port${k}`}>
          <li className="portDetail">
            <div className="input">
              <FormItem hasFeedback
                        help={isFieldValidating(`targetPortUrl${k}`) ? '校验中...' : (getFieldError(`targetPortUrl${k}`) || []).join(', ')}>
                <Input {...getFieldProps(`targetPortUrl${k}`, {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '必须填写端口',
                  },{ validator: this.portsExists },],
                })} className="composeUrl" type="text" size="large" />
              </FormItem>
            </div>
            <div className="protocol select">
              <FormItem className="portGroupForm">
                <Select {...getFieldProps(`portType${k}`)}
                  className="portGroup" size="large">
                  <Option value="http">Http</Option>
                  <Option value="tcp">Tcp</Option>
                  <Option value="udp">Udp</Option>
                </Select>
              </FormItem>
            </div>
            <div className="mapping">
              <Input {...getFieldProps(`portUrl${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '挂载路径呢?',
                }],
              }) } className="composeUrl" type="text" size="large" />
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)}></i>
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
          <span>添加映射端口</span>
        </div>
      </div>
    );
  }
});

MyComponentPort = createForm()(MyComponentPort);
MyComponentEnviro = createForm()(MyComponentEnviro);

let EnviroDeployBox = React.createClass({
  render:function () {
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
              <MyComponentEnviro parentScope={parentScope} />
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
              <MyComponentPort parentScope={parentScope} />
            </div>
          </div>
        </div>
      </div>
    )
  }
})


EnviroDeployBox = createForm()(EnviroDeployBox);

export default EnviroDeployBox;