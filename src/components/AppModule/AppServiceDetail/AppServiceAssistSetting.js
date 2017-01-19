/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * App service assist setting
 *
 * v0.1 - 2017-01-18
 * @author Zhangpc
 */
import React from 'react'
import { Card, Spin, Form, Input, Checkbox, Radio, Icon, } from 'antd'
import './style/AppServiceAssistSetting.less'
import { formatDate } from '../../../common/tools'
import { TENX_LOCAL_TIME_VOLUME } from '../../../../constants'

const createForm = Form.create
const FormItem = Form.Item
const RadioGroup = Radio.Group

let AppServiceAssistSetting = React.createClass({
  propTypes: {
    //
  },

  getInitialState() {
    return {}
  },

  renderCMD(container) {
    const { command } = container
    if (!command || command.length == 0) {
      return (
        <div className="empty">
          无
        </div>
      )
    }
    return command.map((cmd, index) => (
      <FormItem
        className="runningCodeForm"
        style={{paddingLeft:'120px'}}
        key={`cmd_${index}`}>
        <Input
          className="entryInput"
          size="large"
          value={cmd}
          disabled={true} />
      </FormItem>
    ))
  },

  renderArgs(container) {
    const { args } = container
    if (!args || args.length == 0) {
      return (
        <div className="empty">
          无
        </div>
      )
    }
    return args.map((arg, index) => (
      <FormItem
        className="runningCodeForm"
        style={{paddingLeft:'120px'}}
        key={`arg_${index}`}>
        <Input
          className="entryInput"
          size="large"
          value={arg}
          disabled={true} />
      </FormItem>
    ))
  },

  renderImagePullPolicy(container) {
    const { imagePullPolicy } = container
    let value = 0
    switch (imagePullPolicy) {
      case 'Always':
        value = 0
        break

      case 'Never':
        value = 1
        break

      case 'IfNotPresent':
        value = 2
        break

      default:
        break
    }
    return (
      <RadioGroup value={value}>
        <Radio disabled={true} key="IfNotPresent" value={2}>优先使用本地镜像</Radio>
        <Radio disabled={true} key="Never" value={1}>始终使用本地镜像</Radio>
        <Radio disabled={true} key="Always" value={0}>始终拉取云端该版本镜像</Radio>
      </RadioGroup>
    )
  },

  getLocaltime(container) {
    const { volumeMounts } = container
    let checked = false
    if (!volumeMounts || volumeMounts.length == 0) {
      return checked
    }
    const { name, hostPath } = TENX_LOCAL_TIME_VOLUME
    volumeMounts.every(volume => {
      if (volume.name == name && volume.mountPath == hostPath.path) {
        checked = true
        return false
      }
      return true
    })
    return checked
  },

  render() {
    const { isFetching, serviceDetail, form } = this.props
    const { getFieldProps } = form
    if (isFetching || !serviceDetail.metadata) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    const { spec } = serviceDetail
    const { containers } = spec.template.spec
    if (!containers || containers.length == 0) {
      return (
        <div className="loadingBox">
          无
        </div>
      )
    }
    return (
      <Card id="AppServiceAssistSetting">
        <div className="info commonBox">
          <span className="titleSpan">辅助设置</span>
          <div className="assitBox">
            <div>
              <div className="inputBox">
                <span className="commonSpan">进入点</span>
                {this.renderCMD(containers[0])}
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">启动命令</span>
                <div className="selectBox" style={{height: 'auto'}}>
                  {this.renderArgs(containers[0])}
                </div>

                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">重新部署</span>
                <div className="selectBox">
                  {this.renderImagePullPolicy(containers[0])}
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">时区设置</span>
                <div className="checkBox">
                  <Checkbox disabled={true} checked={this.getLocaltime(containers[0])} />
                  <span className="checkTitle">使用所在主机节点的时区</span><br />
                  <span className="tooltip">选中后，可以保证容器始终与其所在的主机节点保持一致</span>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }
})

AppServiceAssistSetting = createForm()(AppServiceAssistSetting)

export default AppServiceAssistSetting