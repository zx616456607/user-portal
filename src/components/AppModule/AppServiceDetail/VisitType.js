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
import { Alert, Card, Input, Button, Select, Radio, Icon, Modal, Tooltip, Form } from 'antd'
import { Link } from 'react-router'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import "./style/VisitType.less"
import { setServiceProxyGroup } from '../../../actions/services'
import { loadAllServices } from '../../../actions/services'
import { getProxy } from '../../../actions/cluster'
import NotificationHandler from '../../../common/notification_handler'
import { parseServiceDomain } from '../../parseDomain'
const RadioGroup = Radio.Group;
const Option = Select.Option;
class VisitType extends Component{
  constructor(props) {
    super(props)
    this.state = {
      value: undefined,
      disabled:true,
      forEdit: false,
      selectDis: false,
      deleteHint: true,
      svcDomain: [],
      copyStatus: false,
      isInternal: undefined,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      selectValue: '',
      groupID: undefined,
      initValue: undefined,
      initGroupID:undefined
    }
  }
  componentWillMount() {
    const { service, bindingDomains, bindingIPs, getProxy, cluster } = this.props;
    this.setState({
      svcDomain:parseServiceDomain(service,bindingDomains,bindingIPs)
    })
    
    if (service.lbgroup&&service.lbgroup.type === 'none') {
      this.setState({
        initValue: 3,
        initSelectDics: true,
        addrHide: true
      })
      return
    }
    
    if (service.lbgroup&&service.lbgroup.id === 'mismatch') {
      this.setState({
        initValue:-1,
        addrHide: true,
        initSelectDics: true,
      })
    }
    getProxy(cluster,true,{
      success: {
        func: (res) => {
          this.setState({
            proxyArr:res[camelize(cluster)].data
          },()=>{
            if (service.lbgroup&&service.lbgroup.type === 'private') {
              this.setState({
                initValue: 2,
                initSelectDics: false,
                initGroupID: service.lbgroup&&service.lbgroup.id,
                isInternal: true
              })
              this.selectProxyArr('private')
            } else if (service.lbgroup&&service.lbgroup.type === 'public'){
              this.setState({
                initValue: 1,
                initSelectDics: false,
                initGroupID: service.lbgroup&&service.lbgroup.id,
                isInternal: false
              })
              this.selectProxyArr('public')
            }
          })
        },
        isAsync: true
      },
    })
  }
  componentWillReceiveProps(nextProps) {
    let preShow = this.props.serviceDetailmodalShow;
    let preTab  = this.props.isCurrentTab
    const { serviceDetailmodalShow, isCurrentTab, service, bindingDomains, bindingIPs,cluster, getProxy} = nextProps;
    
    if ((!serviceDetailmodalShow && preShow )|| (!isCurrentTab && preTab)) {
      //this.cancelEdit()
      this.setState({
        disabled: true,
        forEdit:false,
        value: undefined,
        groupID: undefined,
        initValue: undefined,
        initGroupID: undefined
      });
    }
    if (service.metadata.name === this.props.service.metadata.name) {
      return
    }
      this.setState({
        svcDomain:parseServiceDomain(service,bindingDomains,bindingIPs)
      })
      getProxy(cluster,true,{
        success: {
          func: (res) => {
            this.setState({
              proxyArr:res[camelize(cluster)].data
            },()=>{
              if (service.lbgroup&&service.lbgroup.type === 'private') {
                this.setState({
                  initValue: 2,
                  initSelectDics: false,
                  initGroupID: service.lbgroup&&service.lbgroup.id,
                  isInternal: true
                })
                this.selectProxyArr('private')
              } else if (service.lbgroup&&service.lbgroup.type === 'public'){
                this.setState({
                  initValue: 1,
                  initSelectDics: false,
                  initGroupID: service.lbgroup&&service.lbgroup.id,
                  isInternal: false
                })
                this.selectProxyArr('public')
              }
            })
        
          },
          isAsync: true
        },
      })
      if (service.lbgroup&&service.lbgroup.type === 'none') {
        this.setState({
          initValue: 3,
          initSelectDics: true,
          addrHide: true
        })
      }
      if (service.lbgroup&&service.lbgroup.id === 'mismatch') {
        this.setState({
          initValue:-1,
          addrHide: true,
          initSelectDics: true,
        })
      }
    
  }
  selectProxyArr(type) {
    const { proxyArr } = this.state;
    let data = proxyArr.slice(0)
    data = data.filter((item)=>{
      return !type || item.type === type
    })
    this.setState({
      currentProxy: data
    })
  }
  onChange(e) {
    const { form } = this.props;
    let value = e.target.value;
    let flag;
    if (value === 1) {
      flag = 'public'
      this.setState({
        value: value,
        selectDis: false,
        selectValue: null,
        groupID:undefined,
        initSelectDics:false
      });
      this.selectProxyArr(flag)
    } else if (value === 2) {
      flag = 'private'
      this.setState({
        value: value,
        selectDis: false,
        selectValue: null,
        groupID:undefined,
        initSelectDics:false
      });
      this.selectProxyArr(flag)
    } else {
      this.info()
      this.setState({
        selectDis:true,
        value: 3,
      })
    }
    // form.resetFields([ 'groupID' ])
    form.setFieldsValue({
      groupID:undefined
    })
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit:true
    });
  }
  saveEdit() {
    const { value } = this.state;
    const { service, setServiceProxyGroup, cluster, form, loadAllServices } = this.props;
    let val = value
    if(!val) {
      val = this.state.initValue
    }
    let groupID = 'none'
    if(val !== 3) {
      groupID = form.getFieldValue('groupID')
    }
    const notification = new NotificationHandler()
    notification.spin('保存中更改中')
    setServiceProxyGroup({
      cluster,
      service: service.metadata.name,
      groupID
    },{
      success: {
        func: (res) => {
            notification.close()
            notification.success('出口方式更改成功')
            this.setState({
              disabled: true,
              forEdit:false
            });
            if (val === 3) {
              this.setState({
                addrHide: true,
              })
            } else if (val ===1) {
              this.setState({
                isInternal:false,
                addrHide: false
              })
            } else {
              this.setState({
                isInternal:true,
                addrHide: false
              })
            }
        },
        isAsync: true
      }
    })
  }
  cancelEdit() {
    const { initValue, initGroupID, value, groupID } = this.state;
    const { form } = this.props;
    this.setState({
      disabled: true,
      forEdit:false,
      value: initValue,
      groupID: initGroupID
    },()=>{
      form.setFieldsValue({
        groupID: this.state.groupID
      })
    });
  }
  handleChange(value) {
    this.setState({
      groupID: value,
      selectValue: value
    })
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
    const { service, form } = this.props;
    const { getFieldProps } = form;
    const { value, disabled, forEdit, selectDis, deleteHint, svcDomain, copyStatus,isInternal, addrHide, currentProxy, selectValue, initGroupID, initValue, initSelectDics, proxyArr } = this.state;
    let validator = (rule, value, callback) => callback()
    if(value == 2) {
      validator = (rule, value, callback) => {
        if(!value) {
          return callback('请选择网络出口')
        }
        return callback()
      }
    }
    const selectGroup = getFieldProps("groupID", {
      rules:[{
        validator
      }],
      initialValue: initGroupID
    })
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
    const clusterAdd = svcDomain && svcDomain.map((item,index)=>{
        if (item.isInternal === true) {
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
    const proxyNode = currentProxy.length > 0 ? currentProxy.map((item,index)=>{
        return (
          <Option key={item.id}>{item.name}</Option>
        )
    }):null
    return (
      <Card id="visitTypePage">
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">服务访问方式</div>
          <div className="visitTypeInnerBox">
            {
              forEdit ? [
                <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>,
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>
              ] :
              <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={value || initValue}>
                <Radio key="a" value={1} disabled={disabled}>可公网访问</Radio>
                <Radio key="b" value={2} disabled={disabled}>内网访问</Radio>
                <Radio key="c" value={3} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  value === 1 ? '服务可通过公网访问；“确保集群内节点有外网宽带，否则创建服务失败”；选择一个公用网络出口':''
                }
                {
                  value === 2 ? '服务可通过内网访问；':''
                }
                {
                  value === 3 ? '服务仅提供给集群内其他服务访问；':''
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': selectDis || initSelectDics})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled}
                          getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                  >
                    {proxyNode}
                  </Select>
                </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': deleteHint})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>该网络出口已被管理员删除，请选择其他网络出口或方式</div>
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <dl className={classNames("addrListBox",{'hide':addrHide})}>
              <dt className="addrListTitle"><Icon type="link"/>{isInternal ? '内网' : '公网'}地址</dt>
              {domainList}
            </dl>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>集群内访问地址</dt>
              {clusterAdd}
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
  setServiceProxyGroup,
  getProxy,
  loadAllServices
})(Form.create()(VisitType))
export default VisitType;