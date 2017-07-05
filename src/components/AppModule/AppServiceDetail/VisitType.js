/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * VisitType component
 *
 * v0.1 - 2017-07-04
 * @author zhangxuan
 */

import React, { Component } from 'react'
import { Alert, Card, Input, Button, Select,form, Radio, Icon, Modal, Tooltip } from 'antd'
import { Link } from 'react-router'
import classNames from 'classnames'
import { connect } from 'react-redux'
import "./style/VisitType.less"
import { loadServiceDomain, serviceBindDomain, clearServiceDomain, deleteServiceDomain, loadServiceDetail, loadK8sService } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler'
import { parseServiceDomain } from '../../parseDomain'
const RadioGroup = Radio.Group;
const Option = Select.Option;
class VisitType extends Component{
  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      disabled:true,
      forEdit: false,
      selectDis: false,
      deleteHint: true,
      svcDomain: [],
      copyStatus: false,
      isInternal: false
    }
  }
  componentWillMount() {
    const { service, bindingDomains, bindingIPs } = this.props;
    console.log('parse=============')
    console.log(parseServiceDomain(service,bindingDomains,bindingIPs))
    this.setState({
      svcDomain:parseServiceDomain(service,bindingDomains,bindingIPs)
    })
  }
  onChange(e) {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
      selectDis: false
    });
    if (e.target.value === 3){
      this.info()
      this.setState({
        selectDis:true
      })
    }
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit:true
    });
  }
  saveEdit() {
    this.setState({
      disabled: true,
      forEdit:false
    });
  }
  cancelEdit() {
    this.setState({
      disabled: true,
      forEdit:false
    });
  }
  handleChange(value) {
    console.log(value)
  }
  copyTest() {
    let target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  startCopyCode(domain){
    let target = document.getElementsByClassName('copyTest')[0];
    target.value = domain;
  }
  returnDefaultTooltip() {
    this.setState({
      copyStatus: false
    })
  }
  info() {
    Modal.info({
      title: <div className="deleteHintTitle">请注意若将访问方式切换为【仅在集群内访问】，已映射的服务端口将会被释放</div>,
      width: 460,
      
      onOk() {},
    });
  }
  render() {
    const { value, disabled, forEdit, selectDis, deleteHint, svcDomain, copyStatus,isInternal } = this.state;
    const domainList = svcDomain && svcDomain.map((item,index)=>{
      if (item.isInternal === isInternal) {
        return (
          <dd key={index} className="addrList">
            容器端口：{item.interPort}
            <span className="domain">{item.domain}</span>
            <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
              <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this, item.domain)} onClick={this.copyTest.bind(this)}/>
            </Tooltip>
          </dd>
        )
      }
    })
    return (
      <Card id="visitTypePage">
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">集群访问方式</div>
          <div className="visitTypeInnerBox">
            {
              forEdit ? [
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>,
                <Button key="cancel" type="primary" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>
              ] :
              <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={value}>
                <Radio key="a" value={1} disabled={disabled}>可公网访问</Radio>
                <Radio key="b" value={2} disabled={disabled}>内网访问</Radio>
                <Radio key="c" value={3} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">服务可通过公网访问；“确保集群内节点有外网宽带，否则创建服务失败”；选择一个公用网络出口</p>
              <div className={classNames("inlineBlock selectBox",{'hide': selectDis})}>
                <Select defaultValue="lucy" size="large" style={{ width: 180 }} onChange={this.handleChange.bind(this)} disabled={disabled}>
                  <Option key="jack" value="jack">Jack</Option>
                  <Option key="lucy" value="lucy">Lucy</Option>
                  <Option key="disabled" value="disabled">Disabled</Option>
                  <Option key="yiminghe" value="yiminghe">yiminghe</Option>
                </Select>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': deleteHint})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>该网络出口已被管理员删除，请选择其他网络出口或方式</div>
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>出口地址</dt>
              {domainList}
            </dl>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>集群内访问地址</dt>
              {domainList}
            </dl>
          </div>
        </div>
      </Card>
    )
  }
}

function mapSateToProp(state) {
  return {
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
  }
}

VisitType = connect(mapSateToProp, {
})(VisitType)
export default VisitType;