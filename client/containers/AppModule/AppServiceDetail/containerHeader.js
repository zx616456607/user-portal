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
import { getDeepValue } from '../../../util/util'

class ContainerInstanceHeader extends React.Component {
  state = {
    isCheckIP: false,
    isFixed: false,
    notFixed: false,
    isSee: false,
    manualScaleModalShow: false,
    isDisScaling: false,
  }

  componentDidMount() {
    const { cluster, loadAutoScale } = this.props
    const ipv4 = getDeepValue(this.props.serviceDetail, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
    const name = getDeepValue(this.props.serviceDetail, [ 'metadata', 'name' ])
    ipv4 && this.setState({ isCheckIP: true })
    name && loadAutoScale(cluster, name, {
      success: {
        func: res => {
          if (!isEmpty(res.data)) {
            this.setState({
              isDisScaling: true,
            })
          }
        },
      },
    })
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
    const { isDisScaling, isFixed, notFixed, isCheckIP, isSee, manualScaleModalShow } = this.state
    const { serviceDetail, containerNum, cluster,
      appName, service, loadAllServices, projectName, loadServiceContainerList } = this.props
    const bpmQuery = this.props.appCenterChoiceHidden ? 'filter=label,system/appcenter-cluster' : null
    return (
      <div className="instanceHeader" >
        { !this.props.appCenterChoiceHidden &&
          <Button
            type="primary"
            size="large"
            disabled={isCheckIP}
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
          disabled={isCheckIP}
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
          isCheckIP
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
  loadAutoScale: serviceAction.loadAutoScale,
  loadAllServices: serviceAction.loadAllServices,
  loadServiceContainerList: serviceAction.loadServiceContainerList,
  loadServiceDetail: serviceAction.loadServiceDetail,
})(ContainerInstanceHeader)
