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
import union from 'lodash/union'
import filter from 'lodash/filter'
import "./style/BindDomain.less"
import { serviceBindDomain, clearServiceDomain, deleteServiceDomain, loadServiceDetail, loadK8sService } from '../../../actions/services'
import NotificationHandler from '../../../components/Notification'
import { ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { injectIntl,FormattedMessage  } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'

const InputGroup = Input.Group
const CName_Default_Message = <FormattedMessage {...AppServiceDetailIntl.tipsaddDomainInfo}/>
let canAddDomain = true

class BindDomain extends Component {
  constructor(props) {
    super(props);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.state = {
      domainList: [],
      newValue: null,
      disabled: false,
      bindPort: 0,
      cnameNotice: ''
    }
  }
  componentWillMount() {
    this.getDomainList(this.props.service)
  }
  componentWillReceiveProps(nextProps) {
    // const { serviceDetailmodalShow, service } = nextProps
    if (this.props.isCurrentTab === false && nextProps.isCurrentTab === true) {
      const { serviceName, cluster, loadServiceDetail, loadK8sService } = this.props
      loadServiceDetail(cluster, serviceName, {
        success: {
          func: res => {
            this.getDomainList(res.data)
          },
          isAsync: true,
        },
      })
      loadK8sService(cluster, serviceName)
    }
    // if (!service) return
    // if (!serviceDetailmodalShow) {
    //   this.setState({
    //     domainList: [],
    //     newValue: null,
    //     disabled: false,
    //     bindPort: 0
    //   })
    //   return
    // }
    // this.getDomainList(service)
  }
  getDomainList(service) {
    if (!service) return
    const ports = service.portsForExternal
    if (!ports || ports.length === 0) {
      this.setState({
        containerPorts: []
      })
      return
    }
    let containerPorts = []
    ports.forEach(port => {
      containerPorts.push(port.port)
    })
    let domain = service.metadata.annotations
    const domainList = []
    if (!domain) domain = []
    else {
      domain = service.binding_domains
      if (domain) {
        domain = domain.split(',')
      } else {
        domain = []
      }
    }
    const scope = this
    var port = service.binding_port

    domain.forEach((item, index) => {
      let domain = item
      if(!domain) return
      domainList.push(
        <InputGroup key={domain} className="newDomain">
          <Input size="large" value={domain} disabled />
          <div className="ant-input-group-wrap">
            <Button className="addBtn" size="large" onClick={scope.deleteDomain.bind(scope, domain, port, index)}>
              <i className="fa fa-trash"></i>
            </Button>
          </div>
        </InputGroup>)
    })
    let cnameMessage = CName_Default_Message;
    if (domainList.length > 0) {
      cnameMessage = this.getCName(service);
    }
    this.setState({
      containerPorts: containerPorts,
      bindPort: containerPorts[0],
      domainList: domainList,
      cnameNotice: cnameMessage
    })
    if (port) {
      this.setState({
        disabled: true,
        bindPort: '' + port
      })
    } else {
      this.setState({
        disabled: false,
      })
   }
  }
  addDomain = () => {
    const { formatMessage } = this.props.intl
    if(!canAddDomain) return
    canAddDomain = false
    const serviceName = this.props.serviceName
    const cluster = this.props.cluster
    const port = this.state.bindPort
    const domain = this.state.newValue
    let notification = new NotificationHandler()
    if(this.state.domainList.length >= 10) {
      canAddDomain = true
      notification.error(formatMessage(AppServiceDetailIntl.atMost10DomainName))
      return
    }
    if (!/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?/.test(domain)) {
      canAddDomain = true
      notification.error(formatMessage(AppServiceDetailIntl.pleaseInputCorrectDomain))
      return
    }
    if (/:[0-9]+/.test(domain)) {
      notification.error(formatMessage(AppServiceDetailIntl.pleaseInputCorrectDomain))
      canAddDomain = true
      return
    }
    let isExists = this.state.domainList.some(item => {
      let d = item.props.children[0].props.value
      if (d === domain) {
        notification.error(formatMessage(AppServiceDetailIntl.alreadyBindTheDomain))
        canAddDomain = true
        return true
      }
      return false
    })
    if (isExists) return
    notification.spin(formatMessage(AppServiceDetailIntl.saveDomaining))
    const scope = this;
    this.props.bindDomain(cluster, serviceName, {
      port: parseInt(port),
      domain
    }, {
        success: {
          func() {
            //this function for user add new domain name
            let newList = cloneDeep(scope.state.domainList);
            let num = newList.length;
            canAddDomain = true
            newList.push(
              <InputGroup key={domain} className="newDomain">
                <Input size="large" value={domain} disabled />
                <div className="ant-input-group-wrap">
                  <Button className="addBtn" size="large" onClick={scope.deleteDomain.bind(scope, scope.state.newValue, port, num)}>
                    <i className="fa fa-trash"></i>
                  </Button>
                </div>
              </InputGroup>
            );
            let cname = '';
            if (newList.length > 0) {
              cname = scope.getCName();
            }
            scope.setState({
              domainList: newList,
              newValue: null,
              disabled: true,
              cnameNotice: cname
            });
            notification.close()
            notification.success(formatMessage(AppServiceDetailIntl.addDomainbindSuccess))
          }
        },
        failed: {
          func: error => {
            notification.close()
            canAddDomain = true
            if(error.message === 'Internal error occurred: domain is already bound') {
              notification.warn(formatMessage(AppServiceDetailIntl.alreadyBindTheDomain))
              return
            }
            notification.error(formatMessage(AppServiceDetailIntl.addDomainbindFailure))
          }
        }
      })
  }
  getCName(service) {
    const { formatMessage } = this.props.intl
    let cname = formatMessage(AppServiceDetailIntl.noProvideCNAMEinfo)
    if(!service) service = this.props.service
    if (this.props.bindingDomains) {
      let currentDomain = []
      try {
        currentDomain = JSON.parse(this.props.bindingDomains)
      } catch (e) {
        currentDomain = []
      }
      if (currentDomain.length > 0 && service.metadata) {
        cname = service.metadata.name + '-' + service.metadata.namespace + '.' + currentDomain[0]
      }
    }
    return cname
  }
  deleteDomain(domainName, port, index) {
    //this function for user delete domain name
    const { formatMessage } = this.props.intl
    let newList = cloneDeep(this.state.domainList);

    // reserve at least one port if https opened
    const { k8sService } = this.props
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_HTTPS] === 'true') {
      if (newList.length <= 1) {
        let notification = new NotificationHandler()
        notification.error(formatMessage(AppServiceDetailIntl.priorityCloseHTTP))
        return
      }
    }
    const self = this
    let notification = new NotificationHandler()
    notification.spin(formatMessage(AppServiceDetailIntl.deleteBindDomain))
    this.props.deleteServiceDomain(this.props.cluster, this.props.serviceName, {
      domain: domainName,
      port: parseInt(port)
    }, {
        success: {
          func() {
            for (let i = 0; i < newList.length; i++) {
              if (newList[i].props.children[0].props.value == domainName) {
                newList.splice(i, 1)
                break
              }
            }
            self.setState({
              domainList: newList
            });
            if (newList.length === 0) {
              self.setState({
                disabled: false,
                cnameNotice: CName_Default_Message
              })
            }
            notification.close()
            notification.success(formatMessage(AppServiceDetailIntl.deleteBindDomainSuccess))
          },
        },
        failed: {
          func: () => {
            notification.close()
            notification.error(formatMessage(AppServiceDetailIntl.deleteBindDomainFailure))
          }
        }
      })
  }
  onChangeInput(e) {
    this.setState({
      newValue: e.target.value
    });
  }
  selectPort(value) {
    this.setState({
      bindPort: value
    })
  }
  getPorts() {
    const containerPorts = this.state.containerPorts
    const Option = Select.Option
    return containerPorts.map((port, index) => {
      let portNumber = '' + port
      return (<Option value={portNumber} key={portNumber}>{port}</Option>)
    })
  }
  render() {
    const parentScope = this;
    const { formatMessage } = this.props.intl
    return (
      <div id="bindDomain">
        <Alert message={formatMessage(AppServiceDetailIntl.afterBindDomainInfo)} type="info" />
        <div className="titleBox">
          <div className="protocol commonTitle">
            <span>{formatMessage(AppServiceDetailIntl.servicePort)}</span>
          </div>
          <div className="domain commonTitle">
            <span>{formatMessage(AppServiceDetailIntl.domain)}</span>
          </div>
          <div className="tooltip commonTitle">
            <span>{formatMessage(AppServiceDetailIntl.CNAMEaddress)}</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <Card className="infoBox">
          <div className="protocol">
            <Select size="large" style={{ width: "90%" }} disabled={this.state.disabled} onChange={(value) => this.selectPort(value)} value={this.state.bindPort}>
              {this.getPorts()}
            </Select>
          </div>
          <div className="domain">
            <InputGroup className="newDomain">
              <Input size="large" onChange={this.onChangeInput} value={this.state.newValue} />
              <div className="ant-input-group-wrap">
                <Button className="addBtn" size="large" onClick={() => this.addDomain()}>
                  <i className="fa fa-plus"></i>
                </Button>
              </div>
            </InputGroup>
            {this.state.domainList}
          </div>
          <div className="tooltip">
            <span>{this.state.cnameNotice}</span>
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
function mapStateToProp(state, props) {
  const { cluster, serviceName } = props
  const defaultService = {
    isFetching: false,
    cluster,
    serviceName,
    service: {}
  }
  let k8sServiceData = undefined
  const {
    serviceDetail,
    k8sService,
  } = state.services
  const camelizedSvcName = camelize(serviceName)
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[camelizedSvcName]) {
    k8sServiceData = k8sService.data[camelizedSvcName]
  }
  let targetService
  if (serviceDetail[cluster] && serviceDetail[cluster][serviceName]) {
    targetService = serviceDetail[cluster][serviceName]
  }
  targetService = targetService || defaultService
  return {
    serviceDomainInfo: state.services.serviceDomainInformation,
    serviceBindDomain: state.services.serviceBindDomain,
    deleteDomainState: state.services.deleteDomain,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    service: targetService.service,
    k8sService: k8sServiceData,
  }
}
BindDomain = connect(mapStateToProp, {
  bindDomain: serviceBindDomain,
  clearServiceDomain: clearServiceDomain,
  deleteServiceDomain: deleteServiceDomain,
  loadServiceDetail: loadServiceDetail,
  loadK8sService: loadK8sService,
})(BindDomain)

export default injectIntl(BindDomain, { withRef: true })
