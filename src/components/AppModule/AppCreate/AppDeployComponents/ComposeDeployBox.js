/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

let uuid = 0;

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      volKey,
    });
  },
  add() {
    uuid++;
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      volKey,
    });
  },
  render: function () {
    //const parentScope = this.props.scope;
    //console.log(this.props.parentScope);
    const { getFieldProps, getFieldValue, } = this.props.parentScope.props.form;
    getFieldProps('volKey', {
      initialValue: [],
    });
    console.log(getFieldValue('volKey'));
    const formItems = getFieldValue('volKey').map((k) => {
      return (
        <FormItem key={`vol${k}`}>
          <li className="composeDetail">
            <div className="input">
              <Input {...getFieldProps(`volPath${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '挂载路径呢?',
                }],
              }) } className="portUrl" type="text" />
            </div>
            <div className="protocol select">
              <div className="portGroupForm">
                <Select {...getFieldProps(`volName${k}`, {
                  rules: [{
                    required: true,
                    message: '选择配置组呢?',
                  }],
                }) }
                  className="composeGroup" size="large" >
                  <Option value="http">Http</Option>
                  <Option value="tcp">Tcp</Option>
                  <Option value="udp">Udp</Option>
                </Select>
              </div>
            </div>
            <div className="check">
              <Checkbox />&nbsp;&nbsp;全选<br />
              <Checkbox />&nbsp;&nbsp;选我一个好啦<br />
              <Checkbox />&nbsp;&nbsp;别选楼上<br />
              <Checkbox />&nbsp;&nbsp;一楼脑残<br />
              <Checkbox />&nbsp;&nbsp;都选我
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
          <span>添加</span>
        </div>
      </div>
    );
  }
});

MyComponent = createForm()(MyComponent);
let ComposeDeployBox = React.createClass({
  render:function () {
    const parentScope = this.props.scope;
    return (
      <div id="ComposeDeployBox">
        {/*<Form horizontal form={this.props.form}>*/}
        <div className="composeBox">
          <span className="title">配置目录</span>
          <div className="composeList">
            <div className="composeTitle">
              <div className="composeCommonTitle">
                <span>挂载目录</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置组</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置文件</span>
              </div>
              <div className="composeCommonTitle">
                <span>操作</span>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent parentScope={parentScope} />
          </div>
        </div>
        {/*</Form>*/}
      </div>
    )
  }
})

ComposeDeployBox = createForm()(ComposeDeployBox);

export default ComposeDeployBox;