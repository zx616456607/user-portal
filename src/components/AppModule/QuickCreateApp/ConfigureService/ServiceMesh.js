/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * serviceMesh.js page
 *
 * @author zhangtao
 * @date Wednesday July 25th 2018
 */
import React from 'react';
import { connect } from "react-redux";
import { Switch,Form } from 'antd';
// import {
//   ROLE_SYS_ADMIN, // 系统管理员
//   ROLE_PLATFORM_ADMIN, // 平台管理员
//   ROLE_BASE_ADMIN, // 基础设施管理员
//  } from '../../../../../constants'
import "./style/ServiceMesh.less"
import { getDeepValue } from '../../../../../client/util/util'
import * as projectActions from '../../../../actions/serviceMesh'

const FormItem = Form.Item

const mapStateToprops = (state) => {
  // const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const msaConfig = getDeepValue( state, ['entities','loginUser','info','msaConfig', 'url'])
  const clusterId = getDeepValue( state, ['entities','current','cluster', 'clusterID'] )
  const namespace = getDeepValue(state, ['entities','current','space', 'namespace' ]);
  const userName = getDeepValue(state, ['entities','current','space', 'userName' ]);
  return ({
    msaConfig, clusterId, namespace, userName
  })
}
@connect(mapStateToprops,{
  checkProInClusMesh: projectActions.checkProInClusMesh,
  checkClusterIstio: projectActions.checkClusterIstio,
})
export default class ServiceMesh extends React.Component {
  state = {
    userrole: undefined,
    checked: false,
  }
  componentDidMount = async () => {
    const { checkProInClusMesh, checkClusterIstio } = this.props
    const { msaConfig, clusterId, namespace, userName } = this.props
    if(!msaConfig) {
      this.setState({ userrole: 1 })
      return
    }
    const result2 = await checkClusterIstio({ clusterID: clusterId })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    console.log('statusCode', statusCode)
    if (statusCode !== 200) {
      this.setState({ userrole: 2 })
      return
    }
    const newNameSpace = namespace || userName;
    const result1 = await checkProInClusMesh({ clusterID: clusterId, namespace: newNameSpace });
    console.log('result1', result1)
    const result1Data = getDeepValue(result1, ['response', 'result',]);
    console.log('result1Data', result1Data)
    if (result1Data.data === true) {
      this.setState({ userrole: 3 })
      return
    }
    if(result1Data.data === false){
      this.setState({ userrole: 4 })
    }
  }
  renderMesh() {
    const { userrole, checked } = this.state
    const form = this.props.form
    const { getFieldProps } = form;
    const checkedmeshProps = getFieldProps('serviceMesh', {
      valuePropName: 'checked',
      initialValue: checked,
    })
    if (userrole === 1){
      return <span className="infoText">当前平台未配置微服务治理套件，请联系基础设施管理员配置</span>

    }
    if (userrole === 2) {
      return <span className="infoText">当前集群未安装 istio，请联系基础设施管理员安装</span>
    }
    if (userrole === 3 || userrole === 4) {
      return [
        <Switch {...checkedmeshProps} checkedChildren="开" unCheckedChildren="关" key="switch" disabled={checked}/>,
        <span key="span" className="infoText">
        {
          checked ?
          <span>当前项目已经开通服务网格，此服务将默认开启状态，服务将由服务网格代理，使用微服务中心
          提供的治理功能</span>
          :
          <span>开通后, 此服务将由服务网格代理, 使用微服务中心提供的治理功能</span>
        }
        </span>
      ]
    }
    return null;

  }
  render () {
    const { formItemLayout } = this.props;
    return (
      <FormItem
        {...formItemLayout}
        label="启用服务网格"
        key="serviceMesh"
        className="serviceMesh"
      >
        {this.renderMesh()}
      </FormItem>
    )
  }
}