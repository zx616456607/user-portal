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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import * as projectActions from '../../../../actions/serviceMesh'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

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
  toggleCreateAppMeshFlag: projectActions.toggleCreateAppMeshFlag,
})
class ServiceMesh extends React.Component {
  state = {
    userrole: undefined,
    checked: false,
  }
  componentDidMount = async () => {
    const { checkProInClusMesh, checkClusterIstio } = this.props
    const { msaConfig, clusterId, namespace, userName } = this.props
    const serviceMeshChoice = this.props.form.getFieldValue('serviceMesh')
    this.props.toggleCreateAppMeshFlag(serviceMeshChoice ? true : false) // 复位访问方式
    if(!msaConfig) {
      this.setState({ userrole: 1 })
      return
    }
    const result2 = await checkClusterIstio({ clusterID: clusterId })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    if (statusCode !== 200) {
      this.setState({ userrole: 2 })
      return
    }
    const newNameSpace = namespace || userName;
    const result1 = await checkProInClusMesh(newNameSpace, clusterId);
    const {istioEnabled = false} = result1.response.result
    if(istioEnabled === false){ // 判断当前项目是否开启了serviceMesh
      return this.setState({ userrole: 3 })
    }
    if(istioEnabled === true){
      return this.setState({ userrole: 4 })
    }
  }
  onChange = (value) => {
    if(value) {
      this.props.form.setFieldsValue({accessMethod: 'Cluster'}) // 当打开服务网格时, 默认是使用仅在集群内访问
    }
    this.setState({ checked: value })
    this.props.toggleCreateAppMeshFlag(value)
  }
  renderMesh() {
    const { userrole, checked } = this.state
    const { intl } = this.props
    const form = this.props.form
    const { getFieldProps } = form;
    const checkedmeshProps = getFieldProps('serviceMesh', {
      valuePropName: 'checked',
      // initialValue: checked,
      onChange: this.onChange
    })
    if (userrole === 1){
      return <span className="infoText"><FormattedMessage {...IntlMessage.noMsaSuiteTip}/></span>

    }
    if (userrole === 2) {
      return <span className="infoText"><FormattedMessage {...IntlMessage.noIstioTip}/></span>
    }
    if (userrole === 3) {
      return <span className="infoText">当前项目所在集群未允许服务启用服务网格，请联系项目管理员开通</span>
    }
    if (userrole === 4) {
      return [
        <Switch
          {...checkedmeshProps}
          checkedChildren={intl.formatMessage(IntlMessage.open)}
          unCheckedChildren={intl.formatMessage(IntlMessage.close)}
          key="switch"
          // disabled={checked}
        />,
        <span key="span" className="infoText">
        {
          checked ?
          <span>{'当前项目的集群已经开通服务网格，此服务将默认开启状态，服务将由服务网格代理，使用微服务中心提供的治理功能'}</span>
          :
          <span>{'开通后，此服务将由服务网格代理，使用微服务中心提供的治理功能'}</span>
        }
        </span>
      ]
    }
    return null;

  }
  render () {
    const { formItemLayout, intl } = this.props;
    return (
      <FormItem
        {...formItemLayout}
        label={intl.formatMessage(IntlMessage.enableServiceMesh)}
        key="serviceMesh"

      >
      <div className="serviceMesh">
        {this.renderMesh()}
      </div>
      </FormItem>
    )
  }
}

export default injectIntl(ServiceMesh, {
  withRef: true,
})
