/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ServiceMeshSwitch.js page
 *
 * @author zhangtao
 * @date Wednesday July 25th 2018
 */
import React from 'react'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import { Card, Button, Switch } from 'antd'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { getDeepValue } from '../../../../client/util/util'
import * as projectActions from '../../../actions/serviceMesh'
import './style/ServiceMeshSwitch.less'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

const mapStatetoProps = (state) => {
  // const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const msaConfig = getDeepValue( state, ['entities','loginUser','info','msaConfig', 'url'])
  const clusterId = getDeepValue( state, ['entities','current','cluster', 'clusterID'] )
  const namespace = getDeepValue(state, ['entities','current','space', 'namespace' ]);
  const userName = getDeepValue(state, ['entities','current','space', 'userName' ]);
  return ({
    msaConfig, clusterId, namespace, userName
  })
}
class ServiceMeshSwitch extends React.Component {
  state = {
    ServiceMeshSwitch: false,
    checked: false,
    loading: false,
    switchValue: false, //根据后台api在didmount中更新它
    userrole: undefined, // 根据多个条件判断页面显示内容
  }
  componentDidMount = async () => {
    const { checkClusterIstio, ToggleAPPMesh, istioFlag = false, checkProInClusMesh } = this.props
    const { msaConfig, clusterId, serviceName, namespace, userName } = this.props
    if (!msaConfig) {
      this.setState({ userrole: 1 })
    }
    const result2 = await checkClusterIstio({ clusterID: clusterId })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    if (statusCode !== 200) {
      this.setState({ userrole: 2 })
      return
    }
    const newNameSpace = namespace || userName;
    const result1 = await checkProInClusMesh(clusterId, serviceName, { namespace: newNameSpace });
    const result1Data = getDeepValue(result1, ['response', 'result',]);
    if(result1Data.data === false){ // 判断当前项目是否开启了serviceMesh
      this.setState({ userType: 3 })
    }

    if (istioFlag == 'true') {
      this.setState({ switchValue: true, userrole: 5 })
      return
    }
    if(istioFlag === false){
      this.setState({ switchValue: false, userrole: 6 })
    }
  }
  onChange = (checked) => {
    this.setState({ checked: true, switchValue: checked })
  }
  buttonClick = async () => {
    const {switchValue} = this.state;
    const { ToggleAPPMesh, serviceName, clusterId, namespace, userName } = this.props
    const newNameSpace = namespace || userName;
    this.setState({ loading: true})
    await ToggleAPPMesh(clusterId,serviceName, { namespace: newNameSpace, status: switchValue} )
    this.setState({
      loading: false,
      checked: false,
    })
  }
  renderMesh() {
    const { userrole } = this.state
    const { formatMessage } = this.props.intl
    if (userrole === 1){
      return <span className="infoText">{formatMessage(AppServiceDetailIntl.currentPlatformNoConfigInfo)}</span>
    }
    if (userrole === 2) {
      return <span className="infoText">{formatMessage(AppServiceDetailIntl.currentPlatformNoInstallIstio)}</span>
    }
    if (userrole === 3) {
      return <span className="infoText">{`当前项目所在集群未允许服务启用服务网格，请联系项目管理员开通`}</span>
    }
    return null;
  }
  render() {
    let { initialSwitchValue } = this.props;
    const { checked, loading, switchValue, userrole } = this.state;
    initialSwitchValue = false;
    const { formatMessage } = this.props.intl
    return (
      <div className="ServiceMeshSwitch">
      <Card>
        <TenxPage>
          <div className="titleSpan">{formatMessage(AppServiceDetailIntl.serviceMesh)}</div>
          {this.renderMesh()}
          { (userrole === 6 || userrole === 5) &&
          <div>
            <div className={classNames("editTip",{'hide' : !checked})}>{formatMessage(AppServiceDetailIntl.changeNoEffect)}</div>
            <div className="operationWrap">
              <Button type="primary" disabled={!checked} onClick={this.buttonClick} loading={loading}>
                {formatMessage(AppServiceDetailIntl.appChange)}
              </Button>
              <div style={{ display: 'flex' }}>
              <div style={{ width: '50px'}}>
              <Switch
                checkedChildren={formatMessage(ServiceCommonIntl.open)}
                unCheckedChildren={formatMessage(ServiceCommonIntl.close)}
                key="switch" checked={switchValue}
                onChange={this.onChange}/>
              </div>
              {
                switchValue === false ?
                <span style={{ lineHeight: '24px' }}>{formatMessage(AppServiceDetailIntl.afterOpenServiceInfo)}</span> :
                <span style={{ lineHeight: '24px'}}>{formatMessage(AppServiceDetailIntl.projectOpenServiceMeshInfo)}</span>
              }
              </div>
            </div>
          </div>
          }
        </TenxPage>
      </Card>
      </div>
    )
  }
}

export default injectIntl(connect(mapStatetoProps, {
  checkClusterIstio: projectActions.checkClusterIstio,
  ToggleAPPMesh: projectActions.ToggleAPPMesh,
  checkProInClusMesh: projectActions.checkProInClusMesh,
})(ServiceMeshSwitch), { withRef: true, })