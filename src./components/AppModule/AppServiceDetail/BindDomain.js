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
import { Alert, Card, Input, Button, Select, message } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import union from 'lodash/union'
import filter from 'lodash/filter'
import "./style/BindDomain.less"
import { loadServiceDomain, serviceBindDomain, clearServiceDomain, deleteServiceDomain} from '../../../actions/services'
const InputGroup = Input.Group;

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
      bindPort: 0
    }
  }
  componentWillMount() {
    this.getDomainList(this.props.service)
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if(!service.spec) return
    if (!serviceDetailmodalShow) {
      this.setState({
        domainList: [],
        newValue: null,
        disabled: false,
        bindPort: 0
      })
      return
    }
    this.getDomainList(service)
  }
  getDomainList(service) {
    if(!service.spec) return
    const containers = service.spec.template.spec.containers
    if (!containers || containers.length === 0) {
      this.setState({
        containerPorts: []
      })
      return
    }
    let containerPorts = []
    containers.forEach(container => {
      let ports = container.ports
      if (ports && ports.length > 0) {
        containerPorts = union(containerPorts, ports)
      }
    })
    containerPorts = containerPorts.map(containerPort => {
      return containerPort.containerPort
    })
    let domain = service.metadata.annotations
    const domainList = []
    if (!domain) domain = []
    else {
      domain = service.metadata.annotations.boundDomains
      if (domain) {
        domain = domain.split(',')
      } else {
        domain = []
      }
    }
    const scope = this
    var port;

    domain.forEach((item, index) => {
      let domain = item
      if (item.indexOf(':') >= 0) {
        port = domain.match(/:[0-9]+/)
        port = port[port.length - 1].replace(':', '')
        domain = domain.replace(/:[0-9]+/, '')
      }
      domainList.push(
        <InputGroup className="newDomain">
          <Input size="large" value={domain} disabled />
          <div className="ant-input-group-wrap">
            <Button className="addBtn" size="large" onClick={scope.deleteDomain.bind(scope, domain, port, index) }>
              <i className="fa fa-trash"></i>
            </Button>
          </div>
        </InputGroup>)
    })
    this.setState({
      containerPorts: containerPorts,
      bindPort: containerPorts[0],
      domainList: domainList,
      existsDomain: domain
    })
    if (port) {
      this.setState({
        disabled: true,
        bindPort: port
      })
    }
  }
  addDomain() {
    const serviceName = this.props.serviceName
    const cluster = this.props.cluster
    const port = this.state.bindPort
    const domain = this.state.newValue
    if(!/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?/.test(domain)) {
      message.error('请填写正确的域名')
      return
    }
    if(/:[0-9]+/.test(domain)) {
      message.error('请填写正确的域名')
      return
    }
    let isExists = this.state.existsDomain.some(item => {
      item = item.replace(/:[0-9]+/, '')
      if(item === domain) {
        message.error('已经绑定过该域名')
        return false
      }
      return true
    })
    if(this.state.existsDomain.length === 0) isExists = true
    if(!isExists) return
    const scope = this;
    this.props.bindDomain(cluster, serviceName, {
      port: parseInt(port),
      domain 
    }, {
      success: {
        func() {
          //this function for user add new domain name
          let newList = scope.state.domainList;
          let num = newList.length;
          newList.push(
            <InputGroup className="newDomain">
              <Input size="large" value={scope.state.newValue} disabled />
              <div className="ant-input-group-wrap">
                <Button className="addBtn" size="large" onClick={scope.deleteDomain.bind(scope, scope.state.newValue, port, num) }>
                  <i className="fa fa-trash"></i>
                </Button>
              </div>
            </InputGroup>
          );
          scope.setState({
            domainList: newList,
            newValue: null,
            disabled: true
          });
        }
      }
    })
  }
  deleteDomain(domainName, port, index) {
    //this function for user delete domain name
    let newList = this.state.domainList;
    const self = this
    this.props.deleteServiceDomain(this.props.cluster, this.props.serviceName, {
      domain: domainName,
      port: parseInt(port)
    }, {
      success: {
        func() {
          newList.splice(index, 1);
          self.setState({
            domainList: newList
          });
          if(newList.length === 0) {
            self.setState({
              disabled: false
            })
          }
        },
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
      return (<Option value={port} key={port}>{port}</Option>)
    })
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
            <Select size="large"  style={{ width: "90%" }} disabled={this.state.disabled} onChange={(value) => this.selectPort(value)} defaultValue={this.state.bindPort}>
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
function mapStateToProp(state) {
  return {
    serviceDomainInfo: state.services.serviceDomainInformation,
    serviceBindDomain: state.services.serviceBindDomain,
    deleteDomainState: state.services.deleteDomain
  }
}
BindDomain = connect(mapStateToProp, {
  loadServiceDomainInfo: loadServiceDomain,
  bindDomain: serviceBindDomain,
  clearServiceDomain: clearServiceDomain,
  deleteServiceDomain: deleteServiceDomain
})(BindDomain)

export default BindDomain