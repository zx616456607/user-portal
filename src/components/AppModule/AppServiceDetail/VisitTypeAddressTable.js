/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * VisitTypeTable.js page
 *
 * @author zhangtao
 * @date Tuesday October 23rd 2018
 */
import React from 'react'
import { Table, Tooltip, Icon, Spin } from 'antd'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import './style/VisitTypeAddressTable.less'
import {API_URL_PREFIX } from '../../../constants'
import { toQuerystring } from '../../../common/tools'

function formateColumns(self, formatMessage){
  const columns = [{
    title: '访问方式',
    dataIndex: 'visitType',
  }, {
    title: '容器端口',
    dataIndex: 'containerPort',
  }, {
    title: '访问地址',
    dataIndex: 'visitAddress',
    render: (text) => {
      return <span className="addrList">
      {text}
      <Tooltip placement='top' title={self.state.copyStatus ? formatMessage(AppServiceDetailIntl.copySuccess)
          :
          formatMessage(AppServiceDetailIntl.clickCopy)}>
          <Icon type="copy"
            onMouseLeave={() => self.setState({ copyStatus: false })}
            onMouseEnter={() => self.startCopyCode(text)}
            onClick={self.copyTest}/>
        </Tooltip>
      </span>
    }
  }];
  return columns
}


function formateDate({addrHide, privateNet, hasLbDomain, svcDomain = []}, formatMessage) {
  const lbDomain = svcDomain.filter(({isLb}) => isLb)[0] || {}
  const notAboutCluster = svcDomain.filter(({isInternal}) => !isInternal)[0] || {}
  const AboutCluster = svcDomain.filter(({isInternal}) => isInternal)[0] || {}
  const date =
    [{
      key:"1",
      visitType:
      privateNet ? formatMessage(AppServiceDetailIntl.intranet) :
      formatMessage(AppServiceDetailIntl.publicNetWork),
      containerPort: notAboutCluster.interPort || '-',
      visitAddress: notAboutCluster.domain || '-',

    },{
      key:"2",
      visitType: formatMessage(AppServiceDetailIntl.visitAddressInCluster),
      containerPort: AboutCluster.interPort || '-',
      visitAddress: AboutCluster.domain || '-',

    },{
      key:"3",
      visitType: formatMessage(AppServiceDetailIntl.loadBalanceVisitAddress),
      containerPort: lbDomain.interPort || '-',
      visitAddress: lbDomain.domain || '-',
    }]
  return date.filter(({ key }) => {
    if (addrHide && key=== '1') return false
    if (!hasLbDomain && key==='3') return false
    return true
  })
}

class VisitTypeAddressTable extends React.Component {
  state = {
    copyStatus: false,
    referencedComponent: undefined,
  }
  startCopyCode = (text) => {
    console.log('text', text)
    let target = document.getElementsByClassName('copyTest')[0];
    target.value = text;
  }
  copyTest = () => {
    let target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  async componentDidMount() {
    const { currentCluster: {clusterID} = {}, service:{ metadata: { name } = {} } = {}, } = this.props
    const serviceResult =
    await this.props.getServiceListServiceMeshStatus(clusterID, name, {withAccessPoints:'tenx'}
    )
    const { result = {} } = serviceResult.response
    const { referencedComponent } = Object.values(result)[0] || {}
    this.setState({ referencedComponent })
  }
  render(){
    const { formatMessage, } = this.props.intl;
    const { namespace, currentCluster: {clusterID} = {} } = this.props;
    const self = this
  return (
    <div className="VisitTypeAddressTable">
    {
    this.props.serviceIstioEnabled === false &&
    <div>
    <Table columns={formateColumns(self, formatMessage)} pagination={false} dataSource={formateDate(this.props, formatMessage)}/>
    <input type="text" className="copyTest" style={{opacity:0}}/>
    </div>
    }
    {
    this.props.serviceIstioEnabled === true && this.state.referencedComponent !== undefined &&
    <span style={{ color:"#ccc", paddingLeft:16}} >
      <span>服务已开启服务网格, 服务的访问地址请在【治理-服务网格】-【组件管理】的</span>
      <a
      target="_blank"
      rel="noopener noreferrer"
      href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({
        redirect: encodeURIComponent(`${this.props.msaUrl}/service-mesh/component-management/component/detail`),
        userquery: encodeURIComponent(`name=${this.state.referencedComponent}&namespace=${namespace}&clusterID=${clusterID}`),
         })}`}>
      {`「${this.state.referencedComponent}组件」`}</a>
      <span>详情中获取</span>
    </span>
    }
    {
      this.props.serviceIstioEnabled === true && this.state.referencedComponent == undefined &&
      <span style={{ color:"#ccc", paddingLeft:16}} >
        <span>将服务绑定组件后，在详情中查看</span>
        <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({
          redirect: encodeURIComponent(`${this.props.msaUrl}/service-mesh/component-management`),
          userquery: encodeURIComponent(`namespace=${namespace}&clusterID=${clusterID}`),
       })}`}
        >
        「去绑定组件」</a>
      </span>
    }
    {
      this.props.serviceIstioEnabled === undefined &&
      <Spin/>
    }
    </div>
  )}
}

export default injectIntl(VisitTypeAddressTable,{withRef: true,});