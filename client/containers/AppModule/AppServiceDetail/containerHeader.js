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
import isEmpty from 'lodash/isEmpty'
import { FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerHeaderIntl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { getServiceStatus } from '../../../../src/common/status_identify'

class ContainerInstanceHeader extends React.Component {
  state = {
    isCheckIP: false,
    isFixed: false,
    notFixed: false,
    isSee: false,
    manualScaleModalShow: false,
    isDisScaling: false,
    extendNum: undefined, // macvlan 扩展数量限制
  }

  componentDidMount() {
    const { cluster, loadAutoScale, currentNetType, serviceDetail } = this.props
    if (currentNetType === 'calico') {
      const ipv4 = getDeepValue(serviceDetail, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      ipv4 && this.setState({ isCheckIP: true })
    } else if (currentNetType === 'macvlan') {
      const isFixIp = getDeepValue(serviceDetail, [ 'spec', 'template', 'metadata', 'annotations', 'system/reserved-ips' ])
      isFixIp && this.setState({ isCheckIP: true, extendNum: this.getExtendNum(isFixIp) })
    }
    const name = getDeepValue(this.props.serviceDetail, [ 'metadata', 'name' ])
    name && loadAutoScale(cluster, name, {
      success: {
        func: res => {
          if (!isEmpty(res.data) && getDeepValue(res, [ 'data', 'metadata', 'annotations', 'status' ]) === 'RUN') {
            this.setState({
              isDisScaling: true,
            })
          }
        },
      },
    })
  }

  getExtendNum = value => value.split(',').length

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

  dealWithExtendNum = () => {
    const { currentNetType, serviceDetail } = this.props
    if (currentNetType === 'macvlan') {
      const isFixIp = getDeepValue(serviceDetail, [ 'spec', 'template', 'metadata', 'annotations', 'system/reserved-ips' ])
      isFixIp && this.setState({ extendNum: this.getExtendNum(isFixIp) })
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
    const { isDisScaling, isFixed, notFixed, isCheckIP, isSee,
      manualScaleModalShow } = this.state
    const { serviceDetail, containerNum, cluster, currentNetType,
      appName, service, loadAllServices, projectName, loadServiceContainerList } = this.props
    const status = getServiceStatus(serviceDetail)
    const bpmQuery = this.props.appCenterChoiceHidden ? 'filter=label,system/appcenter-cluster' : null
    let canExtend = isCheckIP
    if (currentNetType === 'macvlan') {
      // canExtend = isCheckIP && extendNum <= containerNum || false
      canExtend = false
    }
    return (
      <div className="instanceHeader" >
        { !this.props.appCenterChoiceHidden &&
          <Button
            type="primary"
            size="large"
            disabled={canExtend || status.phase === 'RollingUpdate'}
            onClick={this.handleChangeVisible}
          >
            <FormattedMessage {...IntlMessages.scaling} /> ({containerNum})
          </Button>
        }
        {
          !this.props.appCenterChoiceHidden &&
        <Button
          type="primary"
          size="large"
          disabled={(currentNetType !== 'macvlan' && isCheckIP) || status.phase === 'RollingUpdate'}
          onClick={() => this.props.onTabClick('#autoScale')}
        >
          <FormattedMessage {...IntlMessages.autoScaling} />
        </Button>
        }
        {
          <Button
            type="ghost"
            size="large"
            onClick={() => {
              loadServiceContainerList(cluster, service, { projectName }, bpmQuery);
              this.props.loadIstioflag()
            }
            }
          >
            <i className="fa fa-refresh" /> <FormattedMessage {...IntlMessages.refresh} />
          </Button>
        }
        {
          !this.props.appCenterChoiceHidden &&
         <Checkbox
           onChange={this.onChangeInstanceIP}
           checked={isCheckIP}
         >
           <FormattedMessage {...IntlMessages.fixedInstanceIP} />
         </Checkbox>
        }
        {
          !this.props.appCenterChoiceHidden &&
          <span
            className="seeConfig"
            onClick={() => this.setState({ isFixed: true, isSee: true })}
          >
            <FormattedMessage {...IntlMessages.viewConfiguredIP} />
          </span>
        }
        {
          isCheckIP && currentNetType !== 'macvlan'
            ? <div className="disAbled"><FormattedMessage {...IntlMessages.fixedIPTips} /></div>
            : null
        }
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
            dealWithExtendNum={this.dealWithExtendNum}
          />
        }
        {
          manualScaleModalShow && <ManualScaleModal
            handleChangeVisible={this.handleChangeVisible}
            disableScale={isDisScaling}
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
  cluster_nodes: { networksolutions },
}) => {
  const cluster = current.cluster.clusterID
  const service = Object.keys(serviceDetail[cluster])[0]
  const appName = serviceDetail[cluster][service].service.metadata.labels['system/appName']
  serviceDetail = serviceDetail[cluster][service].service
  const { projectName } = current.space
  return {
    cluster,
    serviceDetail,
    service,
    appName,
    projectName,
    currentNetType: networksolutions[cluster].current,
  }
}

export default connect(mapStateToProps, {
  loadAutoScale: serviceAction.loadAutoScale,
  loadAllServices: serviceAction.loadAllServices,
  loadServiceContainerList: serviceAction.loadServiceContainerList,
  loadServiceDetail: serviceAction.loadServiceDetail,
})(ContainerInstanceHeader)
