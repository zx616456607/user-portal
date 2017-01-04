/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AssitDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AssitDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
let AssitDeployBox = React.createClass({
  changeRunningCode(e) {
    //the function for change user select image default code or set it by himself
    const parentScope = this.props.scope;
    parentScope.setState({
      runningCode: e.target.value
    });
  },

  changeGetImageType(e) {
    //the function for change user get image type select local image or get image from the cloud
    const parentScope = this.props.scope;
    parentScope.setState({
      getImageType: e.target.value
    });
  },

  changeCurrentDate(e) {
    //the function for user select get datetime from the local host or use it's own time
    const parentScope = this.props.scope;
    parentScope.setState({
      currentDate: e.target.checked
    });
  },

  render:function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = form
    return (
      <div id="AssitDeployBox">
        <div className="assitBox">
          <div>
            <div className="inputBox">
              <span className="commonSpan">进入点</span>
              <Input className="entryInput"
                size="large"
                placeholder="配置容器启动后执行的命令"
                {...getFieldProps('entryInput') }
                />
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">启动命令</span>
              <div className="selectBox">
                <FormItem>
                  <RadioGroup
                    {...getFieldProps('runningCode', {
                      initialValue: '1',
                      onChange: this.changeRunningCode
                    }) }
                    >
                    <Radio key="a" value={"1"}>镜像默认</Radio>
                    <Radio key="b" value={"2"}>自定义</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem className="runningCodeForm" hasFeedback>
                  <Input
                    {...getFieldProps('args', {}) }
                    className="entryInput" size="large"
                    disabled={parentScope.state.runningCode == "1" ? true : false} />
                </FormItem>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">重新部署</span>
              <div className="selectBox">
                <RadioGroup onChange={this.changeGetImageType} value={parentScope.state.getImageType}>
                  <Radio key="a" value={"1"}>优先使用本地镜像</Radio>
                  <Radio key="b" value={"2"}>始终拉取云端该版本镜像</Radio>
                </RadioGroup>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="inputBox">
              <span className="commonSpan">时区设置</span>
              <div className="checkBox">
                <Checkbox value={parentScope.state.currentDate} onChange={this.changeCurrentDate} /><span className="checkTitle">使用所在主机节点的时区</span><br />
                <span className="tooltip">选中后，可以保证容器始终与其所在的主机节点保持一致</span>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default AssitDeployBox;