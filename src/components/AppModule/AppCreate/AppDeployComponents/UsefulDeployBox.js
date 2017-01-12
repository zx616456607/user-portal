/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * UsefulDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/UsefulDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

let UsefulDeployBox = React.createClass({
  render:function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = form
    const runningCodeProps = getFieldProps('imageUrl', {});
    const httpLivePort = getFieldProps('httpLivePort', {});
    const httpLiveInitialDelaySeconds = getFieldProps('httpLiveInitialDelaySeconds', {});
    const httpLiveTimeoutSeconds = getFieldProps('httpLiveTimeoutSeconds', { });
    const httpLivePeriodSeconds = getFieldProps('httpLivePeriodSeconds', {});
    const httpLivePath = getFieldProps('httpLivePath', {});
    const tcpLivePort = getFieldProps('tcpLivePort', {});
    const tcpLiveInitialDelaySeconds = getFieldProps('tcpLiveInitialDelaySeconds', {});
    const tcpLiveTimeoutSeconds = getFieldProps('tcpLiveTimeoutSeconds', {});
    const tcpLivePeriodSeconds = getFieldProps('tcpLivePeriodSeconds', {});
    return (
      <div id="UsefulDeployBox">
        <div className="usefulBox">
          <FormItem>
            <RadioGroup
              {...getFieldProps('getUsefulType', {
                initialValue: 'null',
              }) }
              >
              <Radio key="a" value={"null"}>无</Radio>
              <Radio key="b" value={"http"}>HTTP</Radio>
              <Radio key="c" value={"tcp"}>TCP</Radio>
            </RadioGroup>
          </FormItem>
          { getFieldValue('getUsefulType') == "http" ? [
            <div className="http" key="http">
              <div className="title">
                <div className="httpcommonTitle">
                  <span>端口</span>
                </div>
                <div className="httpcommonTitle">
                  <span>首次检查延时</span>
                </div>
                <div className="httpcommonTitle">
                  <span>检查超时</span>
                </div>
                <div className="httpcommonTitle">
                  <span>检查间隔</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="input">
                <div className="commonInput">
                  <Input type="text" size="large" {...httpLivePort} />
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...httpLiveInitialDelaySeconds} />&nbsp;&nbsp;s
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...httpLiveTimeoutSeconds} />&nbsp;&nbsp;s
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...httpLivePeriodSeconds} />&nbsp;&nbsp;s
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="title">
                <div className="httpcommonTitle">
                  <span>Path路径</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="input">
                <span style={{ float: "left", marginLeft: "10px" }}>/</span>
                <div className="commonInput">
                  <Input type="text" size="large" {...httpLivePath} />
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
          ] : null}
          { getFieldValue('getUsefulType') == "tcp" ? [
            <div className="tcp" key="tcp">
              <div className="title">
                <div className="tcpcommonTitle">
                  <span>端口</span>
                </div>
                <div className="tcpcommonTitle">
                  <span>首次检查延时</span>
                </div>
                <div className="tcpcommonTitle">
                  <span>检查超时</span>
                </div>
                <div className="tcpcommonTitle">
                  <span>检查间隔</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="input">
                <div className="commonInput">
                  <Input type="text" size="large" {...tcpLivePort} />
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...tcpLiveInitialDelaySeconds} />&nbsp;&nbsp;s
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...tcpLiveTimeoutSeconds} />&nbsp;&nbsp;s
                </div>
                <div className="commonInput">
                  <Input type="text" size="large" {...tcpLivePeriodSeconds} />&nbsp;&nbsp;s
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
          ] : null}
        </div>
      </div>
    )
  }
})

export default UsefulDeployBox;