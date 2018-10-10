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
import { Card, Button, Switch, Modal, Alert, Radio, notification } from 'antd'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { getDeepValue } from '../../../../client/util/util'
import * as projectActions from '../../../actions/serviceMesh'
import './style/ServiceMeshSwitch.less'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
const RadioGroup = Radio.Group

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
    switchValue: undefined, //根据后台api在didmount中更新它 // 四种状态: 1: 开启, 2: 正在开启, 3: 关闭, 4: 正在关闭, 其他状态均为未定义状态
    userrole: undefined, // 根据多个条件判断页面显示内容
    modalVisible: false, // 开启modal
  }
  componentDidMount = () => {
    this.reload()
  }
  reload = async () => {
    const { checkClusterIstio, checkProInClusMesh, checkAPPInClusMesh } = this.props
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
    const result1 = await checkProInClusMesh(newNameSpace, clusterId);
    const {istioEnabled = false} = result1.response.result
    if(istioEnabled === false){ // 判断当前项目是否开启了serviceMesh
      return this.setState({ userrole: 3 })
    }
    // 判断当前服务or应用是否开启了istio
    const result3 = await checkAPPInClusMesh(clusterId, null, serviceName)
    const { pods = {} } = result3.response.result
    const podsIstio = Object.values(pods)
    const podsIstioEnableAll = podsIstio.every(({ istioOn }) => istioOn) // 所有pod是否均开启istio
    const podsIstioDisableAll = podsIstio.every(({ istioOn }) => !istioOn) // 所有pod是否均未开启istio
    if (podsIstioEnableAll) {
      this.setState({switchValue: 1})
    }
    if (podsIstioDisableAll) {
      this.setState({switchValue: 3})
    }
    if (!podsIstioEnableAll && !podsIstioDisableAll && podsIstio[0].serviceIstioEnabled === true) {
      this.setState({ switchValue: 2 })
    }
    if (!podsIstioEnableAll && !podsIstioDisableAll && podsIstio[0].serviceIstioEnabled === false) {
      this.setState({ switchValue: 4 })
    }
    if (podsIstio[0].serviceIstioEnabled === true) {
      this.setState({ userrole: 5 })
    }
    if (podsIstio[0].serviceIstioEnabled === false) {
      this.setState({ userrole: 6 })
    }
  }
  buttonClick = async () => {
    this.setState({modalVisible: true})
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
    let { initialSwitchValue, rebootShining, namespace, userName, serviceName, activeKey } = this.props;
    const { switchValue, userrole } = this.state;
    initialSwitchValue = false;
    const { formatMessage } = this.props.intl
    //如果期望的istio状态与实际的istio状态不一致, 需要让重新部署按钮闪动, 这里发送了一个不同的aciton
    if ((switchValue === 1 && userrole === 6) || (switchValue === 3 && userrole === 5)) {
      rebootShining(true)
    } else {
      rebootShining(false)
    }
    if (activeKey === "#serviceMeshSwitch" &&  !this.timer ) {
      this.timer = setInterval(this.reload, 4000)
    }
    if (activeKey !== "#serviceMeshSwitch") {
      clearInterval(this.timer)
      this.timer = undefined
    }
    return (
      <div className="ServiceMeshSwitch">
      <Card>
        <TenxPage>
          <div className="titleSpan">{formatMessage(AppServiceDetailIntl.serviceMesh)}</div>
          {this.renderMesh()}
          { (userrole === 6 || userrole === 5) &&
          <div>
            <div className="operationWrap">
              <Button type="primary" onClick={this.buttonClick} >
                修改状态
              </Button>
              <div style={{ display: 'flex' }}>
              <div style={{ width: '80px'}}>
              {/* <Switch
                checkedChildren={formatMessage(ServiceCommonIntl.open)}
                unCheckedChildren={formatMessage(ServiceCommonIntl.close)}
                key="switch" checked={switchValue}
                onChange={this.onChange}/> */}
              服务网格状态:
              </div>
              {
                userrole === 5 &&
                <span>
                  <IstioFlag status={switchValue}/>
                  <span className="tipinfo">已开启服务网格，重启服务后生效</span>
                </span>
              }
              {
                userrole === 6 &&
                <span>
                  <IstioFlag status={switchValue}/>
                  <span className="tipinfo">已关闭服务网格，重启服务后生效</span>
                </span>
              }
              </div>
            </div>
          </div>
          }
        </TenxPage>
        <ServiceMeshForm
        initialIstioValue={switchValue} visible={this.state.modalVisible}
        cancelModal={() => this.setState({ modalVisible: false })}
        ToggleAPPMesh={this.props.ToggleAPPMesh}
        clusterId={this.props.clusterId}
        serviceName={serviceName}
        onOk={() => {}}
        reload={this.reload}
        />
      </Card>
      </div>
    )
  }
}

export default injectIntl(connect(mapStatetoProps, {
  checkClusterIstio: projectActions.checkClusterIstio,
  ToggleAPPMesh: projectActions.ToggleAPPMesh,
  checkProInClusMesh: projectActions.checkProInClusMesh,
  checkAPPInClusMesh: projectActions.checkAPPInClusMesh,
  rebootShining: projectActions.rebootShining,
})(ServiceMeshSwitch), { withRef: true, })

function IstioFlag({ status }) {
  return (
    <span>
      {
        status === 1 && <span className="openIstioTip">开启</span>
      }
      {
        status ===3 && <span className="closeIstioTip">关闭</span>
      }
      {
        status === 2 && <span className="openIstioTip">正在开启...</span>
      }
      {
        status === 4 && <span className="closeIstioTip">正在关闭...</span>
      }
    </span>
  )
}


class ServiceMeshForm extends React.Component {
  constructor(props) {
    super()
    this.state = {
      istioValue: undefined,
      buttonLoading: false,
    }
  }
  RadioChange = e => {
    this.setState({
      istioValue: e.target.value,
    });
  }
  onOk = async () => {
    const { ToggleAPPMesh, clusterId, serviceName, reload } = this.props
    const { istioValue } = this.state
    if (istioValue === undefined) {
      return notification.warn({
        message: '请选择开启/关闭服务',
      })
    }
    this.setState({ buttonLoading: true })
    try{
      await ToggleAPPMesh(clusterId, serviceName, { istio: istioValue ? 'enabled': 'disable' })
      this.props.cancelModal()
      this.setState({ buttonLoading: false })
      reload();
    }catch(e) {
      notification.error({
        message: '开启/关闭服务网格出错!',
      })
    }
  }
  render() {
    const { initialIstioValue } = this.props
    return (
      <Modal
      visible={this.props.visible}
      title={`服务网格状态`}
      onCancel={this.props.cancelModal}
      onOk={this.onOk}
      confirmLoading={this.state.buttonLoading}
    >
      <div className="ServiceMeshForm">
      <Alert
        description={
        <div>
          <p>开启 / 关闭服务网格后, 需要重启服务才能生效。
          </p>
        </div>
        }
        type="info"
        showIcon
      />
      </div>
          <RadioGroup onChange={this.RadioChange} value={this.state.istioValue}>
            <Radio key="a" value={true}>开启服务网格</Radio>
            <Radio key="b" value={false}>关闭服务网格</Radio>
          </RadioGroup>
          <div style={{ color: '#ccc', marginTop: 12 }}>
          开启后，此服务将由服务网格代理，使用微服务中心提供的治理功能。
          服务的访问方式可在路由规则中设置
      </div>
    </Modal>
    )
  }
}