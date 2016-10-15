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
import "./style/AppUseful.less"
const InputGroup = Input.Group;
const Option = Select.Option;

export default class AppUseful extends Component {
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
      editFlag: true
    }
  }

  changeCheckType(e) {
    this.setState({
      currentUseful: e
    });
  }

  startEdit() {
    this.setState({
      editFlag: false
    });
  }

  onChange(e) {
    this.setState({
      checkType: e
    });
  }

  cancelSet() {
    this.setState({
      editFlag: true
    });
  }

  confirmSet() {
    this.setState({
      editFlag: true
    });
  }

  render() {
    return (
      <div id="AppUseful">
        <div className="operaBox">
          <span>设置高可用</span>
          <Switch checked={this.state.currentUseful} className="switch" defaultChecked={this.state.currentUseful} onChange={this.changeCheckType} />
          <span className="status">{this.state.currentUseful ? "已开启" : "已关闭"}</span>
        </div>
        <div className="settingBox">
          <span className="titleSpan">配置信息</span>
          {this.state.editFlag ? [
            <div className="editBtn" onClick={this.startEdit}>
              <i className="fa fa-pencil-square-o"></i>
              <span className="editTitle">编辑</span>
              <div style={{ clear: "both" }}></div>
            </div>
          ] : null}
          <div style={{ clear: "both" }}></div>
          <Card className="setting">
            <div className="title">
              <span>容器实例：&nbsp;&nbsp;挺萌的应用</span>
            </div>
            <div className="select">
              <span>重启检查项：&nbsp;&nbsp;</span>
              <Select className="checkType" size="large" defaultValue="null" style={{ width: 80 }}
                onChange={this.onChange} disabled={this.state.editFlag}>
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
                    <Input type="text" disabled={this.state.editFlag} />
                  </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
		      			</div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
		      			</div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
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
                    <Input type="text" disabled={this.state.editFlag} />
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
                    <Input type="text" disabled={this.state.editFlag} />
                  </div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
		      			</div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
		      			</div>
                  <div className="commonInput">
                    <Input type="text" disabled={this.state.editFlag} />&nbsp;&nbsp;s
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

