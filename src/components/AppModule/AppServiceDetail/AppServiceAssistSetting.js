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
import { Card, Spin, Form, Input, Checkbox, Radio, Icon,Tooltip } from 'antd'
import './style/AppServiceAssistSetting.less'
import { formatDate } from '../../../common/tools'
import { TENX_LOCAL_TIME_VOLUME } from '../../../../constants'

import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'

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
    const { formatMessage } = this.props.intl
    const { command } = container
    if (!command || command.length == 0) {
      return (
        <div className="empty">
          {formatMessage(AppServiceDetailIntl.mirrorDefault)}
        </div>
      )
    }
    return command.map((cmd, index) => (
      <FormItem
        className="runningCodeForm"
        style={{paddingLeft:'100px'}}
        key={`cmd_${index}`}>
        <Tooltip title={cmd}>
        <Input
          className="entryInput"
          size="large"
          value={cmd}
          disabled={true} />
          </Tooltip>
      </FormItem>
    ))
  },

  renderArgs(container) {
    const { formatMessage } = this.props.intl
    const { args } = container
    if (!args || args.length == 0) {
      return (
        <div className="empty">
          {formatMessage(AppServiceDetailIntl.mirrorDefault)}
        </div>
      )
    }
    return args.map((arg, index) => (
      <FormItem
        className="runningCodeForm"
        style={{paddingLeft:'100px'}}
        key={`arg_${index}`}>
        <Tooltip title={arg}>
        <Input
          className="entryInput"
          size="large"
          value={arg}
          disabled={true} />
          </Tooltip>
      </FormItem>
    ))
  },

  renderImagePullPolicy(container) {
    const { formatMessage } = this.props.intl
    const { imagePullPolicy } = container
    return (
      <RadioGroup value={imagePullPolicy}>
        <Radio disabled={true} key="IfNotPresent" value="IfNotPresent">{formatMessage(AppServiceDetailIntl.priorityUseLocalMirror)}</Radio>
        {/*<Radio disabled={true} key="Never" value="Never">始终使用本地镜像</Radio>*/}
        <Radio disabled={true} key="Always" value="Always">{formatMessage(AppServiceDetailIntl.alwaysUseCloudMirror)}</Radio>
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
    const { formatMessage } = this.props.intl
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
          {formatMessage(ServiceCommonIntl.loading)}
        </div>
      )
    }
    return (
      <Card id="AppServiceAssistSetting">
        <div className="info commonBox">
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.assistConfig)}</span>
          <div className="assitBox">
            <div>
              <div className="inputBox">
                <span className="commonSpan">{formatMessage(AppServiceDetailIntl.intoPoint)}</span>
                {this.renderCMD(containers[0])}
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">{formatMessage(AppServiceDetailIntl.starCommand)}</span>
                <div className="selectBox" style={{height: 'auto'}}>
                  {this.renderArgs(containers[0])}
                </div>

                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">{formatMessage(AppServiceDetailIntl.redeploy)}</span>
                <div className="selectBox">
                  {this.renderImagePullPolicy(containers[0])}
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div className="inputBox">
                <span className="commonSpan">{formatMessage(AppServiceDetailIntl.timeZoneSet)}</span>
                <div className="checkBox">
                  <Checkbox disabled={true} checked={this.getLocaltime(containers[0])} />
                  <span className="checkTitle">{formatMessage(AppServiceDetailIntl.useHostNodeTimeZone)}</span><br />
                  <span className="tooltip">{formatMessage(AppServiceDetailIntl.choicePromiseContainerAndHostNode)}</span>
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

AppServiceAssistSetting = injectIntl(createForm()(AppServiceAssistSetting), { withRef: true,  })

export default AppServiceAssistSetting