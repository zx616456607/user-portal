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
import { Row, Col, Card, Button, Select, Radio, Icon, Modal, Tooltip, Form, Input } from 'antd'
import { Link } from 'react-router'
import classNames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import "./style/VisitType.less"
import { setServiceProxyGroup, loadAllServices, loadServiceDetail, updateServicePort, loadK8sService } from '../../../actions/services'
import { getServiceLBList, unbindIngressService } from '../../../actions/load_balance'
import { getProxy } from '../../../actions/cluster'
import NotificationHandler from '../../../common/notification_handler'
import { parseServiceDomain } from '../../parseDomain'
import Ports from '../QuickCreateApp/ConfigureService/NormalSetting/Ports'
import {isResourcePermissionError} from "../../../common/tools";
import findIndex from "lodash/findIndex";
const RadioGroup = Radio.Group;
const Option = Select.Option;
const notification = new NotificationHandler()

const MAPPING_PORT_SPECIAL = 'special'

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
      privateNet: undefined,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      initValue: undefined,
      initGroupID:undefined,
      initSelect: undefined,
      isLbgroupNull: false,
      activeKey: 'netExport'
    }
  }
  async componentWillMount() {
    const {
      service, bindingDomains, bindingIPs, getProxy, cluster,
      getServiceLBList, form
    } = this.props;
    if (service.lbgroup && service.lbgroup.id === 'mismatch') {
      this.setState({
        isLbgroupNull: true
      })
    } else {
      this.setState({
        isLbgroupNull: false
      })
    }
    getServiceLBList(cluster, service.metadata.name)
    form.setFieldsValue({
      portsKeys: [{value: 0}]
    })
    await this.setPortsToForm(this.props)
    this.getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs)
  }
  async componentWillReceiveProps(nextProps) {
    let preShow = this.props.serviceDetailmodalShow;
    let preName = this.props.service.metadata && this.props.service.metadata.name
    let preTab = this.props.isCurrentTab
    const { serviceDetailmodalShow, service, bindingDomains, bindingIPs,cluster, getProxy, form, isCurrentTab} = nextProps;
    if (!serviceDetailmodalShow && preShow ) {
      this.setState({
        disabled: true,
        forEdit:false,
        value: undefined,
        initValue: undefined,
        initGroupID: undefined,
        initSelect: undefined,
        initSelectDics: undefined,
        addrHide:undefined,
        isLbgroupNull: false
      });
      form.setFieldsValue({
        groupID:undefined,
      })
    }
    if (((preTab !== isCurrentTab) || (!preShow && serviceDetailmodalShow))) {
      if (service.lbgroup && service.lbgroup.id === 'mismatch') {
        this.setState({
          isLbgroupNull: true
        })
      } else {
        this.setState({
          isLbgroupNull: false
        })
      }
      await this.setPortsToForm(nextProps)
      this.getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs)
    }
  }
  setPortsToForm = async (props) => {
    const { loadK8sService, cluster, service, k8sService, form } = props
    await loadK8sService(cluster, service.metadata.name)
    if (isEmpty(k8sService) || isEmpty(k8sService.data)) {
      return
    }
    const { spec, metadata } =  k8sService.data[camelize(service.metadata.name)]
    const { ports } = spec
    if (isEmpty(ports)) {
      return
    }
    const portsKeys = []
    const annotations = metadata.annotations
    let userPort = annotations['tenxcloud.com/schemaPortname']
    if (!userPort) {
      return
    }
    if(userPort) {
      userPort = userPort.split(',')
      userPort = userPort.map(item => {
        return item.split('/')
      })
    }
    ports.forEach((item, index) => {
      const portKey = `port${index}`
      const portProtocolKey = `portProtocol${index}`
      const mappingPortTypeKey = `mappingPortType${index}`
      const mappingPortKey = `mappingPort${index}`
      portsKeys.push({
        value: index
      })
      form.setFieldsValue({
        [portKey]: item.targetPort,
        [portProtocolKey]: item.protocol,
        [mappingPortTypeKey]: MAPPING_PORT_SPECIAL,
        [mappingPortKey]: userPort[index][2]
      })
    })
    form.setFieldsValue({
      portsKeys
    })
  }
  isHasLbDomain = () => {
    const { svcDomain } = this.state
    let hasLbDomain = false
    if (isEmpty(svcDomain)) {
      return this.setState({ hasLbDomain })
    }
    hasLbDomain = svcDomain.some(item => item.isLb)
    this.setState({
      hasLbDomain
    })
  }
  getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs) {
    const { form, k8sService } = this.props
    const { setFieldsValue } = form
    const k8sSer = k8sService.data[camelize(service.metadata.name)]
    this.setState({
      svcDomain:parseServiceDomain(service,bindingDomains,bindingIPs, k8sSer)
    }, this.isHasLbDomain)
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
                privateNet: true,
                addrHide:false
              },()=>{
                this.selectProxyArr('private', true)
              })
            } else if (service.lbgroup&&service.lbgroup.type === 'public'){
              this.setState({
                initValue: 1,
                initSelectDics: false,
                initGroupID: service.lbgroup&&service.lbgroup.id,
                groupID: service.lbgroup&&service.lbgroup.id,
                privateNet: false,
                addrHide:false
              },()=>{
                this.selectProxyArr('public', true)
              })
            } else {
              setFieldsValue({
                accessMethod: 'Cluster'
              })
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
        addrHide: true,
      })
    }
    if (service.lbgroup&&service.lbgroup.id === 'mismatch') {
      this.setState({
        initValue:-1,
        addrHide: true,
        initSelectDics: true
      })
    }
  }
  selectProxyArr(type, flag) {
    const { form } = this.props;
    const { proxyArr,initGroupID } = this.state;
    let data = proxyArr.slice(0)
    let selectData = data.filter((item)=>{
      return !type || item.id === initGroupID
    })
    data = data.filter((item)=>{
      return !type || item.type === type
    })
    let accessMethod = 'Cluster'
    if (type === 'public') {
      accessMethod = 'PublicNetwork'
    } else if (type === 'private') {
      accessMethod = 'InternalNetwork'
    }
    form.setFieldsValue({
      accessMethod,
    })
    this.setState({
      currentProxy: data,
      initSelect: selectData
    },()=>{
      if (this.state.currentProxy.length > 0) {
        this.setState({
          deleteHint: true
        })
        form.setFieldsValue({
          groupID: flag ? initGroupID : this.state.currentProxy[0].id
        })
      } else {
        this.setState({
          deleteHint: false
        })
        form.setFieldsValue({
          groupID: undefined
        })
      }
    })
  }
  onChange(e) {
    let value = e.target.value;
    let flag;
    if (value === 1) {
      flag = 'public'
      this.setState({
        value: value,
        selectDis: false,
        initSelectDics:false
      });
      this.selectProxyArr(flag, false)
    } else if (value === 2) {
      flag = 'private'
      this.setState({
        value: value,
        selectDis: false,
        initSelectDics:false
      });
      this.selectProxyArr(flag, false)
    } else {
      this.info()
      this.setState({
        selectDis:true,
        value: 3,
        deleteHint: true
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
    const { value } = this.state;
    const { service, setServiceProxyGroup, cluster, form, loadAllServices, loadServiceDetail } = this.props;

    let val = value
    form.validateFields((errors,values)=>{
      if (!!errors) {
        return;
      }
      if(!val) {
        val = this.state.initValue
      }
      let groupID = 'none'
      if(val !== 3) {
        groupID = values.groupID;
        if (groupID === undefined) {
          return notification.info('请选择网络出口')
        }
      }
      notification.spin('保存更改中')
      setServiceProxyGroup({
        cluster,
        service: service.metadata.name,
        groupID
      },{
        success: {
          func: (res) => {
            loadAllServices(cluster, {
              pageIndex: 1,
              pageSize: 10,
            })
            loadServiceDetail(cluster, service.metadata.name)
            this.updatePorts()
            notification.close()
            notification.success('出口方式更改成功')
            this.setState({
              disabled: true,
              forEdit:false,
              isLbgroupNull: false
            });
            if (val === 3) {
              this.setState({
                addrHide: true,
              })
            } else if (val ===1) {
              this.setState({
                privateNet:false,
                addrHide: false
              })
            } else {
              this.setState({
                privateNet:true,
                addrHide: false
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notification.close()
            notification.warn('更改出口方式失败', res.message.message || res.message)
          }
        }
      })
    })

  }
  updatePorts = async () => {
    const {form, updateServicePort, cluster, service} = this.props
    const {getFieldValue} = form
    const portsKeys = getFieldValue('portsKeys')
    const body = []
    portsKeys.forEach(item => {
      let protocol = getFieldValue(`portProtocol${item.value}`)
      let port = getFieldValue(`mappingPort${item.value}`)
      if(port) {
        port = parseInt(port)
      }
      body.push({
        ['container_port']: parseInt(getFieldValue(`port${item.value}`)),
        protocol,
        ['service_port']: port
      })
    })
    const serviceName = service.metadata.name
    const result = await updateServicePort(cluster, serviceName, body)
    if (result.error) {
      notification.close()
      const { statusCode, message } = result.error
      if (statusCode === 403) {
        isResourcePermissionError(result.error)
        return
      }
      notification.warn(message.message || message)
      return
    }
    notification.close()
    notification.success('端口更新成功')
  }
  cancelEdit() {
    const { initValue, initSelect } = this.state;
    this.selectProxyArr(initSelect && initSelect[0] && initSelect[0].type, true)
    const { form } = this.props;
    this.setState({
      disabled: true,
      forEdit:false,
      value: initValue,
    });
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
  domainComponent = (index, item) => {
    const { copyStatus } = this.state;
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
  domainList(isInterPort, isLb) {
    const { svcDomain } = this.state;
    return svcDomain && svcDomain.map((item,index)=>{
      if (isLb && item.isLb) {
        return this.domainComponent(index, item)
      }
      if (item.isInternal === isInterPort) {
        return this.domainComponent(index, item)
      }
    })
  }
  tabChange = activeKey => {
    this.setState({
      activeKey,
      forEdit: false,
      disabled: true
    })
  }

  renderIngresses = () => {
    const { LBList } = this.props
    if (!LBList || !LBList.length) {
      return <div className="hintColor noLB">未绑定负载均衡器</div>
    }
    return LBList.map(item => {
      return (
        <Row type="flex" align="middle" className="LBList">
          <Col span={8}><Input value={item.displayName} disabled style={{ width: '90%' }}/></Col>
          <Col span={4}>
            <Button type="primary" onClick={() => this.openModal(item)}>
              解绑负载均衡
            </Button>
          </Col>
          <Col span={4}><Link to={`app_manage/load_balance/balance_config?name=${item.name}&displayName=${item.displayName}`}>前往修改监听</Link></Col>
        </Row>
      )
    })
  }

  openModal = ingress => {
    this.setState({
      currentLB: ingress,
      unbindVisible: true
    })
  }

  cancelModal = () => {
    this.setState({
      unbindVisible: false,
      confirmLoading: false
    })
  }

  confirmModal = () => {
    const { unbindIngressService, getServiceLBList, cluster, service } = this.props
    const { currentLB } = this.state
    let notify = new NotificationHandler()
    this.setState({
      confirmLoading: true
    })
    notify.spin('解绑中')
    unbindIngressService(cluster, currentLB.name, service.metadata.name, {
      success: {
        func: () => {
          getServiceLBList(cluster, service.metadata.name)
          notify.close()
          notify.success('解绑成功')
          this.setState({
            confirmLoading: false,
            unbindVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          notify.warn('解绑失败', res.message.message || res.message)
          this.setState({
            confirmLoading: false,
          })
        }
      }
    })
  }
  render() {
    const { form, service, currentCluster } = this.props;
    const { getFieldProps } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const {
      value, disabled, forEdit, selectDis, deleteHint,privateNet,
      addrHide, currentProxy, initGroupID, initValue, initSelectDics,
      isLbgroupNull, activeKey, unbindVisible, confirmLoading, currentLB,
      hasLbDomain
    } = this.state;
    const imageComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "netExport"
    })
    const appComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "loadBalance"
    })
    const selectGroup = getFieldProps("groupID", {
      rules:[
        { required: deleteHint && value !== 3 ? true : false, message: "请选择网络出口" }
      ],
      initialValue: initGroupID
    })
    const proxyNode = currentProxy.length > 0 ? currentProxy.map((item,index)=>{
        return (
          <Option key={item.id} value={item.id}>{item.name}</Option>
        )
    }):null
    return (
      <Card id="visitTypePage">
        <Modal
          title='解绑负载均衡'
          visible={unbindVisible}
          onCancle={this.cancelModal}
          onOk={this.confirmModal}
          confirmLoading={confirmLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            <span> {`确定要将服务${service.metadata.name}从负载均衡器${currentLB && currentLB.displayName}上解绑？`}</span>
          </div>
        </Modal>
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">服务访问方式</div>
          <div className="visitTypeInnerBox">
            <ul className='tabs_header_style visitTypeTabs'>
              <li className={imageComposeStyle}
                  onClick={this.tabChange.bind(this, "netExport")}
              >
                集群网络出口
              </li>
              <li className={appComposeStyle}
                  onClick={this.tabChange.bind(this, "loadBalance")}
              >
                应用负载均衡
              </li>
            </ul>
            <div className={classNames("radioBox", {'hide': activeKey === 'loadBalance'})}>
              <div className="btnBox">
                {
                  forEdit ? [
                      <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>,
                      <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>
                    ] :
                    <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
                }
              </div>
              <RadioGroup onChange={this.onChange.bind(this)} value={value || initValue}>
                <Radio key="a" value={1} disabled={disabled}>可公网访问</Radio>
                <Radio key="b" value={2} disabled={disabled}>内网访问</Radio>
                <Radio key="c" value={3} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  value === 1 ? '服务可通过公网访问，选择一个网络出口；':''
                }
                {
                  value === 2 ? '服务可通过内网访问，选择一个网络出口；':''
                }
                {
                  value === 3 ? '服务仅提供给集群内其他服务访问；':''
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': selectDis || initSelectDics})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled} placeholder='选择网络出口'
                          getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                  >
                    {proxyNode}
                  </Select>
                </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': !isLbgroupNull})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>已选网络出口已被管理员删除，请选择其他网络出口或访问方式</div>
              <Ports
                {...{form, formItemLayout, currentCluster}}
                isTemplate={false}
                forDetail={true}
                disabled={!forEdit}
              />
            </div>
            <div className={classNames('loadBalancePart',{'hide': activeKey === 'netExport'})}>
              {this.renderIngresses()}
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <dl className={classNames("addrListBox",{'hide':addrHide})}>
              <dt className="addrListTitle"><Icon type="link"/>{privateNet ? '内网' : '公网'}地址</dt>
              {this.domainList(false)}
            </dl>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>集群内访问地址</dt>
              {this.domainList(true)}
            </dl>
            <dl className={classNames("addrListBox", { hide: !hasLbDomain })}>
              <dt className="addrListTitle"><Icon type="link"/>负载均衡器访问地址</dt>
              {this.domainList(false, true)}
            </dl>
          </div>
        </div>
      </Card>
    )
  }
}

function mapSateToProp(state) {
  const { loadBalance, entities, services } = state
  const { current } = entities
  const { serviceLoadBalances } = loadBalance
  const { data: LBList } = serviceLoadBalances || { data: [] }
  const { k8sService } = services
  return {
    bindingDomains: current.cluster.bindingDomains,
    bindingIPs: current.cluster.bindingIPs,
    LBList,
    currentCluster: current.cluster,
    k8sService,
  }
}

VisitType = connect(mapSateToProp, {
  setServiceProxyGroup,
  getProxy,
  loadAllServices,
  loadServiceDetail,
  getServiceLBList,
  unbindIngressService,
  updateServicePort,
  loadK8sService
})(Form.create()(VisitType))
export default VisitType;
