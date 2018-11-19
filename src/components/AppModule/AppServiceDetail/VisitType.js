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
import { Row, Col, Card, Button, Select, Radio, Icon, Modal, Tooltip, Form, Input, Spin } from 'antd'
import { Link, browserHistory } from 'react-router'
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
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getDeepValue } from "../../../../client/util/util"
import * as serviceMeshActions from '../../../actions/serviceMesh'
import VisitTypeAddressTable from './VisitTypeAddressTable'

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
      activeKey: 'netExport',
      agentValue: 'inside',
      serviceIstioEnabled: undefined, //默认显示原来的显示方式
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
    const agentType = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'agentType' ])
    if (agentType) {
      this.setState({
        agentValue: agentType,
      })
    }
    getServiceLBList(cluster, service.metadata.name)
    form.setFieldsValue({
      portsKeys: [{value: 0}]
    })
    await this.setPortsToForm(this.props)
    this.getDomainAndProxy(getProxy,service,cluster,bindingDomains,bindingIPs)
  }
  componentDidMount() {
    this.reloadServiceMesh()
  }
  reloadServiceMesh = async () => {
    const { clusterId, serviceName } = this.props
    const result3 = await this.props.checkAPPInClusMesh(clusterId, null, serviceName)
    const { pods = {}, noPodServices = {} } = result3.response.result
    const podsIstio = Object.values(pods)
    const { serviceIstioEnabled} = podsIstio[0] || {}
    this.setState({serviceIstioEnabled: !!serviceIstioEnabled}) // 当服务开启了Istio时, 不显示原来的内容, 显示文本提示
    const noPodServicesFlag = noPodServices[serviceName]
    if (noPodServicesFlag === true) { // 当服务停止时使用
      this.setState({serviceIstioEnabled: true})
    }
    if (noPodServicesFlag === false) {
      this.setState({ serviceIstioEnabled: false })
    }
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
    // if (isCurrentTab) {
    //   this.reloadServiceMesh()
    // }
  }
  setPortsToForm = async (props) => {
    const { loadK8sService, cluster, service, k8sService, form } = props
    await loadK8sService(cluster, service.metadata.name)
    if (isEmpty(k8sService) || isEmpty(k8sService.data) || (service.lbgroup || {}).type === 'none') {
      return
    }
    const { spec, metadata } =  k8sService.data[camelize(service.metadata.name)]
    const { ports } = spec
    if (isEmpty(ports)) {
      return
    }
    const portsKeys = []
    const annotations = metadata.annotations
    let userPort = annotations['system/schemaPortname']
    if (!userPort && isEmpty(ports)) {
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
      })
      if (userPort) {
        form.setFieldsValue({
          [mappingPortTypeKey]: MAPPING_PORT_SPECIAL,
          [mappingPortKey]: userPort[index][2]
        })
      }
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
    const { formatMessage } = this.props.intl
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
          return notification.info(formatMessage(AppServiceDetailIntl.pleaseChoiceNetPort))
        }
      }
      notification.spin(formatMessage(AppServiceDetailIntl.saveChanging))
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
            notification.success(formatMessage(AppServiceDetailIntl.outputTypeChange))
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
            notification.warn(formatMessage(AppServiceDetailIntl.changeOutputTypeFailure), res.message.message || res.message)
          }
        }
      })
    })

  }
  updatePorts = async () => {
    const {form, updateServicePort, cluster, service} = this.props
    const { formatMessage } = this.props.intl
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
    notification.success(formatMessage(AppServiceDetailIntl.PortChangeSuccess))
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
    const { formatMessage } = this.props.intl
    Modal.info({
      title: <div className="deleteHintTitle">{formatMessage(AppServiceDetailIntl.pleaseAttentionPortWillRelease)}</div>,
      width: 460,
      onOk() {},
    });
  }
  domainComponent = (index, item) => {
    const { copyStatus } = this.state;
    const { formatMessage } = this.props.intl
    return (
      <dd key={index} className="addrList">
        {formatMessage(AppServiceDetailIntl.containerPort)}：{item.interPort}
        <span className="domain">{item.domain}</span>
        <Tooltip placement='top' title={copyStatus ? formatMessage(AppServiceDetailIntl.copySuccess)
          :
          formatMessage(AppServiceDetailIntl.clickCopy)}>
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
      if (item.isInternal === isInterPort && !isLb) {
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
    const { LBList = [] } = this.props
    const { agentValue } = this.state
    const { formatMessage } = this.props.intl
    const copyList = LBList.map(_item => Object.assign({}, _item, { agentType: _item.agentType || 'outside' }))
    return copyList.filter(_item => _item.agentType === agentValue).map(item => {
      return (
        <Row type="flex" align="middle" className="LBList">
          <Col span={8}><Input value={item.displayName} disabled style={{ width: '90%' }}/></Col>
          <Col span={5}>
            <Button type="ghost" className="unbundleBtn" onClick={() => this.openModal(item)}>
              {formatMessage(AppServiceDetailIntl.removeLoadBalance)}
            </Button>
          </Col>
          <Col span={4}><Link to={`app_manage/load_balance/balance_config?name=${item.name}&displayName=${item.displayName}`}>
          {formatMessage(AppServiceDetailIntl.gotoModifyMonitor)}
          </Link></Col>
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
    const { formatMessage } = this.props.intl
    const { currentLB, agentValue } = this.state
    let notify = new NotificationHandler()
    this.setState({
      confirmLoading: true
    })
    notify.spin(formatMessage(AppServiceDetailIntl.removing))
    unbindIngressService(cluster, currentLB.name, service.metadata.name, agentValue, {
      success: {
        func: () => {
          getServiceLBList(cluster, service.metadata.name)
          notify.close()
          notify.success(formatMessage(AppServiceDetailIntl.removeSuccess))
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
          notify.warn(formatMessage(AppServiceDetailIntl.removeFailure), res.message.message || res.message)
          this.setState({
            confirmLoading: false,
          })
        }
      }
    })
  }

  agentChange = e => {
    this.setState({
      agentValue: e.target.value,
    })
  }
  render() {
    const { form, service, currentCluster } = this.props;
    const { getFieldProps } = form;
    const { formatMessage } = this.props.intl
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const {
      value, disabled, forEdit, selectDis, deleteHint,privateNet,
      addrHide, currentProxy, initGroupID, initValue, initSelectDics,
      isLbgroupNull, activeKey, unbindVisible, confirmLoading, currentLB,
      hasLbDomain, agentValue
    } = this.state;
    const imageComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "netExport"
    })
    const appComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "loadBalance"
    })
    let selectGroup
    if ((value || initValue) !== 3) {
      selectGroup = getFieldProps("groupID", {
        rules:[
          { required: deleteHint && value !== 3 ? true : false, message: formatMessage(AppServiceDetailIntl.pleaseChoiceNetPort) }
        ],
        initialValue: initGroupID
      })
    }
    const proxyNode = currentProxy.length > 0 ? currentProxy.map((item,index)=>{
        return (
          <Option key={item.id} value={item.id}>{item.name}</Option>
        )
    }):null
    return (
      <Card id="visitTypePage">
        <Modal
          title={formatMessage(AppServiceDetailIntl.removeLoadBalance)}
          visible={unbindVisible}
          onCancel={this.cancelModal}
          onOk={this.confirmModal}
          confirmLoading={confirmLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            <span>{formatMessage(AppServiceDetailIntl.makeSureRemoveLoadBalance,
               { name: service.metadata.name, displayName: currentLB && currentLB.displayName })}</span>
          </div>
        </Modal>
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">{formatMessage(AppServiceDetailIntl.ServiceVisitManner)}</div>
          {
          this.state.serviceIstioEnabled === false &&
          <div className="visitTypeInnerBox">
            <ul className='tabs_header_style visitTypeTabs'>
              <li className={imageComposeStyle}
                  onClick={this.tabChange.bind(this, "netExport")}
              >
                {formatMessage(AppServiceDetailIntl.clusterNerOutput)}
              </li>
              <li className={appComposeStyle}
                  onClick={this.tabChange.bind(this, "loadBalance")}
              >
                {formatMessage(AppServiceDetailIntl.appLoadBalance)}
              </li>
            </ul>
            <div className={classNames("radioBox", {'hide': activeKey === 'loadBalance'})}>
              <div className="btnBox">
                {
                  forEdit ? [
                      <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>{formatMessage(ServiceCommonIntl.cancel)}</Button>,
                      <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>{formatMessage(ServiceCommonIntl.save)}</Button>
                    ] :
                    <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>{formatMessage(ServiceCommonIntl.edit)}</Button>
                }
              </div>
              <RadioGroup onChange={this.onChange.bind(this)} value={value || initValue}>
                <Radio key="a" value={1} disabled={disabled}>{formatMessage(AppServiceDetailIntl.publicNetWorkVisit)}</Radio>
                <Radio key="b" value={2} disabled={disabled}>{formatMessage(AppServiceDetailIntl.intranetVisit)}</Radio>
                <Radio key="c" value={3} disabled={disabled}>{formatMessage(AppServiceDetailIntl.onlyClusterVisit)}</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  value === 1 ? formatMessage(AppServiceDetailIntl.visitServiceByPublicNetWork):''
                }
                {
                  value === 2 ? formatMessage(AppServiceDetailIntl.visitServiceByIntranet):''
                }
                {
                  value === 3 ? formatMessage(AppServiceDetailIntl.ServiceProvideOtherServiceVisit):''
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': selectDis || initSelectDics})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled} placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceNetPort)}
                          getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                  >
                    {proxyNode}
                  </Select>
                </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': !isLbgroupNull})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>
                {formatMessage(AppServiceDetailIntl.deleteByAdminPleaseChoiceOtherManner)}
              </div>
              <Ports
                {...{form, formItemLayout, currentCluster}}
                isTemplate={false}
                forDetail={true}
                disabled={!forEdit}
              />
            </div>
            <div className={classNames('loadBalancePart',{'hide': activeKey === 'netExport'})}>
              <Button style={{ marginBottom: 16 }} type={'primary'} onClick={() => browserHistory.push('/app_manage/load_balance')}>
                {formatMessage(AppServiceDetailIntl.bindLoadbalance)}
              </Button>
              <RadioGroup value={agentValue} onChange={this.agentChange}>
                <Radio value="inside">{formatMessage(AppServiceDetailIntl.loadBalanceInCluster)}</Radio>
                <Radio value="outside">{formatMessage(AppServiceDetailIntl.loadBalanceOutCluster)}</Radio>
              </RadioGroup>
              {this.renderIngresses()}
            </div>
          </div>
          }
          {
            this.state.serviceIstioEnabled === true &&
          <span style={{ color:"#ccc", paddingLeft:16}} >
            已开启服务网格, 服务的访问方式在【治理-服务网格】-【路由管理】的路由规则中设置
          </span>
          }
          {
            this.state.serviceIstioEnabled === undefined &&
            <Spin/>
          }
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">{formatMessage(AppServiceDetailIntl.visitAddress)}</div>
          <VisitTypeAddressTable
          addrHide={addrHide}
          privateNet={privateNet}
          svcDomain={this.state.svcDomain}
          hasLbDomain={hasLbDomain}
          serviceIstioEnabled={this.state.serviceIstioEnabled}
          currentCluster={currentCluster}
          service={service}
          getServiceListServiceMeshStatus={this.props.getServiceListServiceMeshStatus}
          msaUrl={this.props.msaUrl}
          namespace={this.props.namespace}
          />
          {/* <table className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <dl className={classNames("addrListBox",{'hide':addrHide})}>
              <dt className="addrListTitle">
                {privateNet ?
                formatMessage(AppServiceDetailIntl.intranet)
                :
                formatMessage(AppServiceDetailIntl.publicNetWork)
                }
                {formatMessage(AppServiceDetailIntl.address)}
              </dt>
              {this.domainList(false)}
            </dl>
            <dl className="addrListBox">
              <dt className="addrListTitle">{formatMessage(AppServiceDetailIntl.visitAddressInCluster)}</dt>
              {this.domainList(true)}
            </dl>
            <dl className={classNames("addrListBox", { hide: !hasLbDomain })}>
              <dt className="addrListTitle">{formatMessage(AppServiceDetailIntl.loadBalanceVisitAddress)}</dt>
              {this.domainList(false, true)}
            </dl>
          </table> */}
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
  const clusterId = getDeepValue( state, ['entities','current','cluster', 'clusterID'] )
  const { entities: { loginUser: { info: { msaConfig: {url:msaUrl} = {} } } = {} } = {} } = state
  return {
    bindingDomains: current.cluster.bindingDomains,
    bindingIPs: current.cluster.bindingIPs,
    LBList,
    currentCluster: current.cluster,
    k8sService,
    clusterId,
    msaUrl,
    namespace: current.space.namespace
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
  loadK8sService,
  checkAPPInClusMesh: serviceMeshActions.checkAPPInClusMesh,
  getServiceListServiceMeshStatus: serviceMeshActions.getServiceListServiceMeshStatus
})(Form.create()(VisitType))
export default injectIntl(VisitType,{withRef: true,});
