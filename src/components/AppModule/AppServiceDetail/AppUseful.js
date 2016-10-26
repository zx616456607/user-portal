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
import { Popconfirm, Alert, Card, Input, Button, Select, Switch } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import merge from 'lodash/merge'
import "./style/AppUseful.less"
import { changeServiceAvailability } from '../../../actions/services'


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
      submitInfo:{}
    }
  }
  componentWillMount() {
    const service = this.props.service
    if (!service.spec) return
    this.setLivenessProbe(service)
  }
  componentWillReviceProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (!service.spec) return
    if(serviceDetailmodalShow === this.props.serviceDetailmodalShow) return
    if (!serviceDetailmodalShow) {
      this.setState({

      })
      return
    }
    this.setLivenessProbe(nextProps.service)
  }
  setLivenessProbe(service) {
    let livenessProbe = service.spec.template.spec.containers[0].livenessProbe
    const currentUseful = !!livenessProbe
    if (!livenessProbe) {
      livenessProbe = { info: {} }
      if (service.metadata.annotations) {
        if (service.metadata.annotations['tenxcloud.com/livenessProbe']) {
          livenessProbe = JSON.parse(service.metadata.annotations['tenxcloud.com/livenessProbe'])
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
    } else if(livenessProbe.tcpSocket) {
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
    if(!value) {
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
    if(this.state.livenessProbe) {
      this.setState({
        submitInfo: Object.assign({}, this.state.livenessProbe)
      }) 
    }
  }
  onChange(e) {
    this.setState({
      checkType: e
    });
  }

  cancelSet() {
    this.setState({
      editFlag: true,
    })
    if(this.state.livenessProbe) {
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
    const submitInfo = this.state.submitInfo
    const propertys = Object.getOwnPropertyNames(submitInfo)
    const changeServiceAvailability = this.props.changeServiceAvailability
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    let options = {}
    const self = this
    if(self.state.checkType === 'http') {
      options.httpGet = {
        port: parseInt(submitInfo.info.port),
        path: submitInfo.info.path
      }
    } else {
      options.tcpSocket = {
        port: parseInt(submitInfo.info.port)
      }
    }
    options.initialDelaySeconds = parseInt(submitInfo.initialDelaySeconds)
    options.timeoutSeconds = parseInt(submitInfo.timeoutSeconds)
    options.periodSeconds = parseInt(submitInfo.periodSeconds)
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
    let mergeObj = {[property]: e.target.value}
    if(property === 'port' || property === 'path') {
      mergeObj = { info: {[property]: e.target.value}}
    }
    submitInfo = merge({}, submitInfo, mergeObj)
    this.setState({
      submitInfo
    })
  }
  checkSubmitInfo() {
    if(this.state.protocol === 'http') {

    }
  }
  render() {
    const { service } = this.props
    if(!service || !service.spec) {
      return (<div id="AppUseful"></div>)
    }
    let livenessProbe = this.state.livenessProbe
    let protocol = this.state.checkType
    const submitInfo = this.state.submitInfo
    return (
      <div id="AppUseful">
        <div className="operaBox">
          <span>设置高可用</span>
          <Switch checked={this.state.currentUseful} className="switch" defaultChecked={this.state.currentUseful} onChange={this.changeCheckType} disabled={this.state.switchDisable}/>
          <span className="status">{this.state.currentUseful ? "已开启" : "已关闭"}</span>
        </div>
        <div className="settingBox">
          <span className="titleSpan">配置信息</span>
          {this.state.editFlag ? (
            <div className="editBtn" onClick={this.startEdit}>
              <i className="fa fa-pencil-square-o"></i>
              <span className="editTitle">编辑</span>
              <div style={{ clear: "both" }}></div>
            </div>
          ) : null}
          <div style={{ clear: "both" }}></div>
          <Card className="setting" >
            <div className="title">
              <span>容器实例：&nbsp;&nbsp;{this.props.serviceName}</span>
            </div>
            <div className="select">
              <span>重启检查项：&nbsp;&nbsp;</span>
              <Select className="checkType" size="large" defaultValue={protocol} style={{ width: 80 }}
                onChange={this.onChange} disabled={this.state.editFlag} value={this.state.checkType}>
                <Option value="null">无</Option>
                <Option value="http">HTTP</Option>
                <Option value="tcp">TCP</Option>
              </Select>
            </div>
            {this.state.checkType == "http" ? [
              <div className="http">
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
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e)=> this.getInputInfo('port', e)}/>
                  </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e)=> this.getInputInfo('initialDelaySeconds', e)}/>&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e)=> this.getInputInfo('timeoutSeconds', e)}/>&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e)=> this.getInputInfo('periodSeconds', e)}/>&nbsp;&nbsp;s
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
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.info.path} onChange={(e)=> this.getInputInfo('path', e)}/>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
            {this.state.checkType == "tcp" ? [
              <div className="tcp">
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
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.info.port} onChange={(e)=> this.getInputInfo('port', e)}/>
                  </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.initialDelaySeconds} onChange={(e)=> this.getInputInfo('initialDelaySeconds', e)}/>&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.timeoutSeconds} onChange={(e)=> this.getInputInfo('timeoutSeconds', e)}/>&nbsp;&nbsp;s
                </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} value={submitInfo.periodSeconds} onChange={(e)=> this.getInputInfo('periodSeconds', e)}/>&nbsp;&nbsp;s
                </div>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            ] : null}
          </Card>
          {!this.state.editFlag ? [
            <div className="btnBox">
              <Button size="large" type="ghost" onClick={this.cancelSet}>
                取消
             </Button>
              <Button size="large" type="primary" onClick={this.confirmSet}>
                确认
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

export default connect(mapStateToProps, {
  changeServiceAvailability
})(AppUseful)