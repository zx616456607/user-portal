/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppUseful component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Popconfirm, Alert, Card, Input, Button, Select, Switch, message, InputNumber, Tooltip, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import merge from 'lodash/merge'
import "./style/AppUseful.less"
import { changeServiceAvailability } from '../../../actions/services'
import NotificationHandler from '../../../components/Notification'
import { isStorageUsed } from '../../../common/tools'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'

const InputGroup = Input.Group;
const Option = Select.Option;

class AppUseful extends Component {
  constructor(props) {
    super(props);
    this.changeCheckType = this.changeCheckType.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.cancelSet = this.cancelSet.bind(this);
    this.confirmSet = this.confirmSet.bind(this);
    this.state = {
      currentUseful: false,
      checkType: "null",
      editFlag: true,
      switchDisable: false,
      haveRBDVolume: false,
      submitInfo: {}
    }
  }
  componentWillMount() {
    const service = this.props.service
    if (!service.spec) return
    this.setState({
        haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
    })
    this.setLivenessProbe(service)
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (!service.spec) return
    if (!serviceDetailmodalShow) {
      this.setState({
        currentUseful: false,
        checkType: "null",
        editFlag: true,
        switchDisable: false,
        submitInfo: {},
        livenessProbe: {},
        haveRBDVolume: false,
      })
      return
    }
    this.setState({
        haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
    })
    this.setLivenessProbe(nextProps.service, serviceDetailmodalShow)
  }
  setLivenessProbe(service, serviceDetailmodalShow) {
    if (this.state.submitInfo && this.state.submitInfo.info) return
    let livenessProbe = service.spec.template.spec.containers[0].livenessProbe
    const currentUseful = !!livenessProbe
    if (!livenessProbe) {
      livenessProbe = { info: {} }
      if (service.metadata.annotations) {
        if (service.metadata.annotations['system/livenessProbe']) {
          livenessProbe = JSON.parse(service.metadata.annotations['system/livenessProbe'])
        }
      }
    }
    if (livenessProbe.httpGet) {
      livenessProbe.info = livenessProbe.httpGet
    } else if (livenessProbe.tcpSocket) {
      livenessProbe.info = livenessProbe.tcpSocket
    }

    let protocol = 'null'
    if (livenessProbe.httpGet) {
      protocol = 'http'
    } else if (livenessProbe.tcpSocket) {
      protocol = 'tcp'
    } else {
      this.setState({
        switchDisable: true
      })
    }
    this.setState({
      currentUseful: currentUseful,
      livenessProbe: livenessProbe,
      checkType: protocol,
      submitInfo: Object.assign({}, livenessProbe)
    })
  }
  changeCheckType(value) {
    const changeServiceAvailability = this.props.changeServiceAvailability
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    changeServiceAvailability(cluster, serviceName, value)
    this.setState({
      currentUseful: value
    });
    if (!value) {
      const livenessProbe = Object.assign({}, this.state.livenessProbe)
      this.setState({
        submitInfo: livenessProbe
      })
    }
  }

  startEdit() {
    this.setState({
      editFlag: false,
      switchDisable: true
    });
    if (this.state.livenessProbe) {
      this.setState({
        submitInfo: Object.assign({}, this.state.livenessProbe)
      })
    }
  }
  onChange(e) {
    this.setState({
      checkType: e
    });
    setTimeout(() => {
      let portInput = document.getElementById('portInput');
      portInput && portInput.focus()
    }, 500)
  }

  cancelSet() {
    this.setState({
      editFlag: true,
    })
    if (this.state.livenessProbe.initialDelaySeconds) {
      const livenessProbe = Object.assign({}, this.state.livenessProbe)
      this.setState({
        switchDisable: false,
        submitInfo: livenessProbe
      })
    } else {
      this.setState({
        switchDisable: true,
        checkType: 'null'
      })
    }

  }

  confirmSet() {
    const { formatMessage } = this.props.intl
    const submitInfo = this.state.submitInfo
    const propertys = Object.getOwnPropertyNames(submitInfo)
    let notification = new NotificationHandler()
    if (!submitInfo.info.port) {
      notification.error(formatMessage(AppServiceDetailIntl.pleaseAddPort))
      return
    }
    if (submitInfo.info.port < 1 || submitInfo.info.port > 65535) {
      notification.error(formatMessage(AppServiceDetailIntl.portOnlyInput165535Number))
      return
    }
    if (submitInfo.initialDelaySeconds && submitInfo.initialDelaySeconds < 0) {
      notification.error(formatMessage(AppServiceDetailIntl.firstCheckNoNegative))
      return
    }
    if (submitInfo.timeoutSeconds && submitInfo.timeoutSeconds < 1) {
      notification.error(formatMessage(AppServiceDetailIntl.checkTimeOutNoLessThanOne))
      return
    }
    if (submitInfo.periodSeconds && submitInfo.periodSeconds < 1) {
      notification.error(formatMessage(AppServiceDetailIntl.checkIntervalNoLessThanOne))
      return
    }
    if (submitInfo.info.path) {
      const reg = /^(\/)/
      if (!reg.test(submitInfo.info.path)) {
        return notification.error('路径必须以 / 开头')
      }
    }
    // if(this.state.checkType === 'http') {
    //   if(propertys.length < 4 || !submitInfo.info.path || !submitInfo.info.path) {
    //     notification.error('信息填写不全')
    //     return
    //   }
    // }
    // if(this.state.checkType === 'tcp') {
    //   if (propertys.length < 4) {
    //     notification.error('信息填写不全')
    //     return
    //   }
    // }
    if (this.state.checkType === 'null') {
      const changeServiceAvailability = this.props.changeServiceAvailability
      const cluster = this.props.cluster
      const serviceName = this.props.serviceName
      changeServiceAvailability(cluster, serviceName, false)
      this.setState({
        currentUseful: false,
        switchDisable: true,
        editFlag: true
      })
      return
    }
    const changeServiceAvailability = this.props.changeServiceAvailability
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    let options = {}
    const self = this
    if (self.state.checkType === 'http') {
      options.httpGet = {
        port: parseInt(submitInfo.info.port),
        path: submitInfo.info.path ? submitInfo.info.path : ''
      }
    } else {
      options.tcpSocket = {
        port: parseInt(submitInfo.info.port)
      }
    }
    options.initialDelaySeconds = submitInfo.initialDelaySeconds ? parseInt(submitInfo.initialDelaySeconds) : 0
    options.timeoutSeconds = submitInfo.timeoutSeconds ? parseInt(submitInfo.timeoutSeconds) : 1
    options.periodSeconds = submitInfo.periodSeconds ? parseInt(submitInfo.periodSeconds) : 10
    options.successThreshold = parseInt(submitInfo.successThreshold)
    options.failureThreshold = parseInt(submitInfo.failureThreshold)
    changeServiceAvailability(cluster, serviceName, options, {
      success: {
        func() {
          self.setState({
            editFlag: true,
            switchDisable: false,
            livenessProbe: Object.assign({}, submitInfo)
          });
        }
      }
    })
  }
  getInputInfo(property, e) {
    let submitInfo = this.state.submitInfo
    let mergeObj = { [property]: e }
    if (property === 'port') {
      mergeObj = { info: { [property]: e } }
    }
    if (property === 'path') {
      mergeObj = { info: { [property]: e.target.value } }
    }
    submitInfo = merge({}, submitInfo, mergeObj)
    this.setState({
      submitInfo
    })
  }
  checkSubmitInfo() {
    if (this.state.protocol === 'http') {

    }
  }
  render() {
    const { service } = this.props
    const { formatMessage } = this.props.intl
    if (!service || !service.spec) {
      return (<div id="AppUseful"></div>)
    }
    let livenessProbe = this.state.livenessProbe
    let protocol = this.state.checkType
    const submitInfo = this.state.submitInfo
    const sucText = 'successThreshold 探测失败后，再次探测成功最少连续如下次数认为健康（默认为 1，活跃度必须为 1 且最小值为 1）'
    const failText = 'failureThreshold 探测失败阈值，失败如下次数，将认为不健康（默认为 3，最小值为1） '
    return (
      <div id="AppUseful">
        <div className="operaBox">
          <span>{formatMessage(AppServiceDetailIntl.SetHighAvailability)}</span>
          <span style={{marginLeft:'40px'}}>
            <Switch value={this.state.currentUseful}
              checkedChildren={formatMessage(ServiceCommonIntl.open)}
              unCheckedChildren={formatMessage(ServiceCommonIntl.close)}
              className="switch"
              defaultChecked={this.state.currentUseful}
              onChange={this.changeCheckType} disabled={this.state.switchDisable} />
            <span className="tips">{false ? formatMessage(AppServiceDetailIntl.mountStorageServiceInfo) : ""}</span>
          </span>
        </div>
        <div className="settingBox">
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.configMessage)}</span>
          {this.state.editFlag ? (
            <div className="editBtn" onClick={this.startEdit}>
              <i className="fa fa-pencil-square-o"></i>
              <span className="editTitle">{formatMessage(ServiceCommonIntl.edit)}</span>
              <div style={{ clear: "both" }}></div>
            </div>
          ) : null}
          <span className="switchToAlarm" onClick={() => this.props.onTabClick('#strategy')} >设置告警</span>
          <div style={{ clear: "both" }}></div>
          <Card className="setting" >
            <div className="title">
              <span>{formatMessage(AppServiceDetailIntl.containerObject)}：&nbsp;&nbsp;{this.props.serviceName}</span>
            </div>
            <div className="select">
              <span>{formatMessage(AppServiceDetailIntl.rebootCheckItem)}:&nbsp;&nbsp;</span>
              <Select className="checkType" size="large" defaultValue={protocol} style={{ width: 80 }}
                onChange={this.onChange} disabled={this.state.editFlag} value={this.state.checkType}>
                <Option value="null">{formatMessage(AppServiceDetailIntl.empty)}</Option>
                <Option value="http">HTTP</Option>
                <Option value="tcp">TCP</Option>
              </Select>
            </div>
            {this.state.checkType == "http" ? [
              <div className="http">
                <div className="title">
                  <div className="httpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.port)}</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.firstCheckTimeout)}</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.checkTimeOut)}</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.checkInterval)}</span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <div className="commonInput">
                    <InputNumber id="portInput" type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e) => this.getInputInfo('port', e)} />
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e) => this.getInputInfo('initialDelaySeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e) => this.getInputInfo('timeoutSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e) => this.getInputInfo('periodSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="title">
                  <div className="httpcommonTitle httpcommonTitleLarge">
                    <span>{formatMessage(AppServiceDetailIntl.Path)}</span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>
                      健康阀值
                      <Tooltip placement="top" title={sucText}>
                        <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                      </Tooltip>
                    </span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>
                      不健康阀值
                      <Tooltip placement="top" title={failText}>
                        <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                      </Tooltip>
                    </span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  {/* <span style={{ float: "left", marginLeft: "10px" }}>/</span> */}
                  <div className="commonInput commonInputLarge">
                    <Input type="text" disabled={this.state.editFlag}
                      value={submitInfo.info.path}
                        // && submitInfo.info.path.length > 0
                        // && submitInfo.info.path[0] === '/' ? submitInfo.info.path.substr(1)
                        // : submitInfo.info.path}
                      onChange={(e) => this.getInputInfo('path', e)} />
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text"
                      disabled={this.state.editFlag}
                      value={submitInfo.successThreshold}
                      onChange={(e) => this.getInputInfo('successThreshold', e)}
                      min={1}
                    />
                    &nbsp;&nbsp;次成功
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text"
                      disabled={this.state.editFlag}
                      value={submitInfo.failureThreshold}
                      onChange={(e) => this.getInputInfo('failureThreshold', e)}
                      min={1}
                    />
                    &nbsp;&nbsp;次失败
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
            {this.state.checkType == "tcp" ? [
              <div className="tcp">
                <div className="title">
                  <div className="tcpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.port)}</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.firstCheckTimeout)}</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.checkTimeOut)}</span>
                  </div>
                  <div className="tcpcommonTitle">
                    <span>{formatMessage(AppServiceDetailIntl.checkInterval)}</span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <div className="commonInput">
                    <InputNumber id="portInput" type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e) => this.getInputInfo('port', e)} />
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e) => this.getInputInfo('initialDelaySeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e) => this.getInputInfo('timeoutSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <InputNumber type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e) => this.getInputInfo('periodSeconds', e)} />&nbsp;&nbsp;s
                </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="title">
                  <div className="httpcommonTitle">
                    <span>
                      健康阀值
                      <Tooltip placement="top" title={sucText}>
                        <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                      </Tooltip>
                    </span>
                  </div>
                  <div className="httpcommonTitle">
                    <span>
                      不健康阀值
                      <Tooltip placement="top" title={failText}>
                        <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                      </Tooltip>
                    </span>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div className="input">
                  <div className="commonInput">
                    <InputNumber type="text"
                      disabled={this.state.editFlag}
                      value={submitInfo.successThreshold }
                      onChange={(e) => this.getInputInfo('successThreshold', e)}
                      min={1}
                    />
                    &nbsp;&nbsp;次成功
                  </div>
                  <div className="commonInput">
                    <InputNumber type="text"
                      disabled={this.state.editFlag}
                      value={submitInfo.failureThreshold}
                      onChange={(e) => this.getInputInfo('failureThreshold', e)}
                      min={1}
                    />
                    &nbsp;&nbsp;次失败
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
          </Card>
          {!this.state.editFlag ? [
            <div className="btnBox">
              <Button size="large" type="ghost" onClick={this.cancelSet}>
                {formatMessage(ServiceCommonIntl.cancel)}
             </Button>
              <Button size="large" type="primary" onClick={this.confirmSet}>
                {formatMessage(ServiceCommonIntl.confirm)}
             </Button>
            </div>
          ] : null}
        </div>
      </div>


    )
  }
}

function mapStateToProps(state) {
  return {
    serviceAvailability: state.services.serviceAvailability
  }
}

export default injectIntl(connect(mapStateToProps, {
  changeServiceAvailability
})(AppUseful), { withRef: true, })
