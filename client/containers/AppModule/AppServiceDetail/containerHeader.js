/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * ContainerInstance Header of AppDetailTab
 *
 * v0.1 - 2018-08-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Checkbox, Button } from 'antd'
import ContainerInstance from './ContainerInstance'
import ManualScaleModal from '../../../../src/components/AppModule/AppServiceDetail/ManualScaleModal'
import * as serviceAction from '../../../../src/actions/services'
import { FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerHeaderIntl'

class ContainerInstanceHeader extends React.Component {
  state = {
    isCheckIP: false,
    isFixed: false,
    notFixed: false,
    isSee: false,
    manualScaleModalShow: false,
  }

  componentDidMount() {
    const annotations = this.props.serviceDetail.spec.template
      && this.props.serviceDetail.spec.template.metadata.annotations || {}
    annotations.hasOwnProperty('cni.projectcalico.org/ipAddrs')
    && this.setState({ isCheckIP: true })
  }

  onChangeInstanceIP = e => {
    if (e.target.checked) {
      this.setState({
        isFixed: true,
        isCheckIP: true,
      })
    } else if (!e.target.checked) {
      this.setState({
        notFixed: true,
        isCheckIP: false,
      })
    }
  }

  onChangeVisible = () => {
    this.setState({
      isFixed: false,
      notFixed: false,
      isSee: false,
    })
  }

  onHandleCanleIp = v => {
    this.setState({
      isCheckIP: v,
    })
  }

  handleChangeVisible = () => {
    this.setState({
      manualScaleModalShow: !this.state.manualScaleModalShow,
    })
  }

  render() {
    const { isFixed, notFixed, isCheckIP, isSee, manualScaleModalShow } = this.state
    const { serviceDetail, containerNum, cluster,
      appName, service, loadAllServices, projectName } = this.props
    return (
      <div className="instanceHeader">
        <Button
          type="primary"
          disabled={isCheckIP}
          onClick={this.handleChangeVisible}
        >
          水平扩展 ({containerNum})
        </Button>
        <Button
          type="primary"
          disabled={isCheckIP}
          onClick={() => this.props.onTabClick('#autoScale')}
        >
          自动伸缩
        </Button>
        <Checkbox
          onChange={this.onChangeInstanceIP}
          checked={this.state.isCheckIP}
        >
          <FormattedMessage {...IntlMessages.fixedInstanceIP} />
        </Checkbox>
        <span
          className="seeConfig"
          onClick={() => this.setState({ isFixed: true, isSee: true })}
        >
          <FormattedMessage {...IntlMessages.viewConfiguredIP} />
        </span>
        { isCheckIP ? <div className="disAbled">已开启固定实例 IP，无法继续操作</div> : null }
        {
          (isFixed || notFixed) && <ContainerInstance
            configIP = {isFixed}
            notConfigIP = {notFixed}
            onChangeVisible = {this.onChangeVisible}
            onHandleCanleIp = {this.onHandleCanleIp}
            serviceDetail = {serviceDetail}
            serviceName={service}
            isCheckIP={isCheckIP}
            isSee = {isSee}
            containerNum={containerNum}
          />
        }
        {
          manualScaleModalShow && <ManualScaleModal
            handleChangeVisible={this.handleChangeVisible}
            cluster={cluster}
            appName={appName}
            visible={manualScaleModalShow}
            service={serviceDetail}
            serviceName={service}
            loadServiceList={loadAllServices}
            containerNum={containerNum}
            projectName={projectName}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
  services: { serviceDetail },
}) => {
  const cluster = current.cluster.clusterID
  const service = Object.keys(serviceDetail[cluster])[0]
  const appName = serviceDetail[cluster][service].service.metadata.labels['tenxcloud.com/appName']
  serviceDetail = serviceDetail[cluster][service].service
  const { projectName } = current.space
  return {
    cluster: current.cluster.clusterID,
    serviceDetail,
    service,
    appName,
    projectName,
  }
}

export default connect(mapStateToProps, {
  loadAllServices: serviceAction.loadAllServices,
  loadServiceContainerList: serviceAction.loadServiceContainerList,
})(ContainerInstanceHeader)
