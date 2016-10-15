/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * BindDomain component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Alert, Card, Input, Button, Select } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/BindDomain.less"
const InputGroup = Input.Group;

export default class BindDomain extends Component {
  constructor(props) {
    super(props);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.state = {
      domainList: [],
      newValue: null
    }
  }

  addDomain() {
    //this function for user add new domain name
    const scope = this;
    let newList = this.state.domainList;
    let num = newList.length;
    newList.push(
      <InputGroup className="newDomain">
        <Input size="large" value={this.state.newValue} disabled />
        <div className="ant-input-group-wrap">
          <Button className="addBtn" size="large" onClick={this.deleteDomain.bind(scope, this.state.newValue, num)}>
            <i className="fa fa-trash"></i>
          </Button>
        </div>
      </InputGroup>
    );
    this.setState({
      domainList: newList,
      newValue: null
    });
  }

  deleteDomain(domainName, index) {
    //this function for user delete domain name
    let newList = this.state.domainList;
    newList.splice(index, 1);
    this.setState({
      domainList: newList
    });
  }

  onChangeInput(e) {
    this.setState({
      newValue: e.target.value
    });
  }

  render() {
    const parentScope = this;
    return (
      <div id="bindDomain">
        <Alert message='Tips:添加域名绑定后，需要在域名服务器上，将指定域名的CNAME指向下面表格中系统生成的"CNAME地址"' type="info" />
        <div className="titleBox">
          <div className="protocol commonTitle">
            <span>服务端口</span>
          </div>
          <div className="domain commonTitle">
            <span>域名</span>
          </div>
          <div className="tooltip commonTitle">
            <span>CNAME地址</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <Card className="infoBox">
          <div className="protocol">
            <Select size="large" defaultValue="8080" style={{ width: "90%" }}>
              <Option value="8080">8080</Option>
              <Option value="1234">1234</Option>
              <Option value="8888">8888</Option>
              <Option value="12306">12306</Option>
            </Select>
          </div>
          <div className="domain">
            <InputGroup className="newDomain">
              <Input size="large" onChange={this.onChangeInput} value={this.state.newValue} />
              <div className="ant-input-group-wrap">
                <Button className="addBtn" size="large" onClick={this.addDomain}>
                  <i className="fa fa-plus"></i>
                </Button>
              </div>
            </InputGroup>
            {this.state.domainList}
          </div>
          <div className="tooltip">
            <span>提示：添加域名后，CNAME地址会出现在这里</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </Card>
      </div>
    )
  }
}

BindDomain.propTypes = {
  //
}
