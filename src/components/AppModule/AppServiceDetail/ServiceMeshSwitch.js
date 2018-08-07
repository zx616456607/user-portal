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
@connect(mapStatetoProps, {
  checkClusterIstio: projectActions.checkClusterIstio,
  ToggleAPPMesh: projectActions.ToggleAPPMesh,
})
export default class ServiceMeshSwitch extends React.Component {
  state = {
    ServiceMeshSwitch: false,
    checked: false,
    loading: false,
    switchValue: false, //根据后台api在didmount中更新它
    userrole: undefined, // 根据多个条件判断页面显示内容
  }
  componentDidMount = async () => {
    const { checkClusterIstio, ToggleAPPMesh, istioFlag = false } = this.props
    const { msaConfig, clusterId, serviceName } = this.props
    if (!msaConfig) {
      this.setState({ userrole: 1 })
    }
    const result2 = await checkClusterIstio({ clusterID: clusterId })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    if (statusCode !== 200) {
      this.setState({ userrole: 2 })
      return
    }
    // const newNameSpace = namespace || userName;
    // const result1 = await checkAPPInClusMesh(clusterId, serviceName, { namespace: newNameSpace });
    // const result1Data = getDeepValue(result1, ['response', 'result',]);
    console.log('istioFlag',typeof  istioFlag);
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
    if (userrole === 1){
      return <span className="infoText">当前平台未配置微服务治理套件，请联系基础设施管理员配置</span>
    }
    if (userrole === 2) {
      return <span className="infoText">当前集群未安装 istio，请联系基础设施管理员安装</span>
    }
    return null;
  }
  render() {
    let { initialSwitchValue } = this.props;
    const { checked, loading, switchValue, userrole } = this.state;
    initialSwitchValue = false;
    console.log('userrole', userrole);
    return (
      <div className="ServiceMeshSwitch">
      <Card>
        <TenxPage>
          <div className="titleSpan">服务网格</div>
          {this.renderMesh()}
          { (userrole === 6 || userrole === 5) &&
          <div>
            <div className={classNames("editTip",{'hide' : !checked})}>修改尚未更新，请点击"应用修改"使之生效</div>
            <div className="operationWrap">
              <Button type="primary" disabled={!checked} onClick={this.buttonClick} loading={loading}>
                应用修改
              </Button>
              <div style={{ display: 'flex' }}>
              <div style={{ width: '50px'}}>
              <Switch checkedChildren="开" unCheckedChildren="关" key="switch" checked={switchValue}
                onChange={this.onChange}/>
              </div>
              {
                switchValue === false ?
                <span style={{ lineHeight: '24px' }}>开通后， 此服务将由服务网格代理，使用微服务中心提供的治理功能</span> :
                <span style={{ lineHeight: '24px'}}>当前项目已经开通服务网格，此服务将默认开启状态，服务将由服务网格代理，使用微服务中心提供的治理功能</span>
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