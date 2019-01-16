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
import { Card, Button, Switch, Modal, Alert, Radio, notification, Icon } from 'antd'
import classNames from 'classnames'
import { connect } from 'react-redux'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
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
    const { pods = {}, noPodServices = {} } = result3.response.result
    const noPodServicesFlag = noPodServices[serviceName]
    const podsIstio = Object.values(pods)
    const podsIstioEnableAll = podsIstio.every(({ istioOn }) => istioOn) // 所有pod是否均开启istio
    const podsIstioDisableAll = podsIstio.every(({ istioOn }) => !istioOn) // 所有pod是否均未开启istio
    if (podsIstioEnableAll) {
      this.setState({switchValue: 1})
    }
    if (podsIstioDisableAll) {
      this.setState({switchValue: 3})
    }
    const { serviceIstioEnabled } = podsIstio[0] || {}
    if (!podsIstioEnableAll && !podsIstioDisableAll && serviceIstioEnabled === true) {
      this.setState({ switchValue: 2 })
    }
    if (!podsIstioEnableAll && !podsIstioDisableAll && serviceIstioEnabled === false) {
      this.setState({ switchValue: 4 })
    }
    if (serviceIstioEnabled === true) {
      this.setState({ userrole: 5 })
    }
    if (serviceIstioEnabled === false) {
      this.setState({ userrole: 6 })
    }
    if (noPodServicesFlag === true) {
      this.setState({ switchValue:1, userrole:5 })
    }
    if (noPodServicesFlag === false) {
      this.setState({ switchValue:3, userrole:6 })
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
      return <span className="infoText">{formatMessage(AppServiceDetailIntl.currentProjectNotAllowServiceMesh)}</span>
    }
    return null;
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  render() {
    let { initialSwitchValue, rebootShining, namespace, userName, serviceName, activeKey } = this.props;
    const { switchValue, userrole } = this.state;
    initialSwitchValue = false;
    const { formatMessage } = this.props.intl
    // //如果期望的istio状态与实际的istio状态不一致, 需要让重新部署按钮闪动, 这里发送了一个不同的aciton
    // if ((switchValue === 1 && userrole === 6) || (switchValue === 3 && userrole === 5)) {
    //   rebootShining(true)
    // } else {
    //   rebootShining(false)
    // }
    if (activeKey === "#serviceMeshSwitch" &&  !this.timer ) {
      this.timer = setInterval(this.reload, 15000)
    }
    if (activeKey !== "#serviceMeshSwitch") {
      clearInterval(this.timer)
      this.timer = undefined
    }
    return (
      <div className="ServiceMeshSwitch">
      <Card>
        <TenxPage>
          <div className="titleSpan">
          {formatMessage(AppServiceDetailIntl.serviceMesh)}</div>
          {this.renderMesh()}
          { (userrole === 6 || userrole === 5) &&
          <div>
            <div className="operationWrap">
              <Button type="primary" onClick={this.buttonClick} >
                {formatMessage(AppServiceDetailIntl.changeStatus)}
              </Button>
              <div style={{ display: 'flex' }}>
              <div style={{ width: '80px'}}>
              {/* <Switch
                checkedChildren={formatMessage(ServiceCommonIntl.open)}
                unCheckedChildren={formatMessage(ServiceCommonIntl.close)}
                key="switch" checked={switchValue}
                onChange={this.onChange}/> */}
              {formatMessage(AppServiceDetailIntl.serviceMeshStatue)}
              </div>
              {
                userrole === 5 &&
                <span>
                  <IstioFlag status={switchValue} formatMessage={formatMessage} />
                  {
                    switchValue === 2 &&
                    <span className="tipinfo">
                    <Icon type="info-circle-o" />
                    <span style={{ paddingLeft: 4 }}>
                    {formatMessage(AppServiceDetailIntl.rebootingServiceInfo)}
                    </span>
                    </span>
                  }
                </span>
              }
              {
                userrole === 6 &&
                <span>
                  <IstioFlag status={switchValue} formatMessage={formatMessage} />
                  {
                    switchValue === 4 &&
                    <span className="tipinfo">
                    <Icon type="info-circle-o" />
                    <span style={{ paddingLeft: 4 }}>
                    {formatMessage(AppServiceDetailIntl.rebootingServiceInfo)}
                    </span>
                    </span>
                  }
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
        formatMessage={this.props.intl.formatMessage}
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

function IstioFlag({ status, formatMessage }) {
  return (
    <span>
      {
        status === 1 && <span className="openIstioTip">{formatMessage(AppServiceDetailIntl.open)}</span>
      }
      {
        status ===3 && <span className="closeIstioTip">{formatMessage(AppServiceDetailIntl.close)}</span>
      }
      {
        status === 2 && <span className="openIstioTip">{formatMessage(AppServiceDetailIntl.opening)}</span>
      }
      {
        status === 4 && <span className="closeIstioTip">{formatMessage(AppServiceDetailIntl.closeing)}</span>
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.initialIstioValue !== this.props.initialIstioValue
    || nextProps.initialIstioValue !== this.state.istioValue) {
      if (nextProps.initialIstioValue === 3) {
        return this.setState({ istioValue: false })
      }
      if (nextProps.initialIstioValue === 1) {
        return this.setState({ istioValue: true })
      }
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
        message: this.props.formatMessage(AppServiceDetailIntl.pleaseChoiceOpenOrCloseService),
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
        message: this.props.formatMessage(AppServiceDetailIntl.openOrCloseServiceMeshWrong),
      })
    }
  }
  render() {
    return (
      <Modal
      visible={this.props.visible}
      title={this.props.formatMessage(AppServiceDetailIntl.serviceMeshStatus)}
      onCancel={this.props.cancelModal}
      onOk={this.onOk}
      confirmLoading={this.state.buttonLoading}
    >
      <div className="ServiceMeshForm">
      <Alert
        description={
        <div>
          <p>{this.props.formatMessage(AppServiceDetailIntl.openCloseServiceMeshNeedReboot)}
          </p>
        </div>
        }
        type="info"
        showIcon
      />
      </div>
          <RadioGroup onChange={this.RadioChange} value={this.state.istioValue}
          >
            <Radio key="a" value={true}>
              {this.props.formatMessage(AppServiceDetailIntl.openServiceMesh)}
            </Radio>
            <Radio key="b" value={false}>
              {this.props.formatMessage(AppServiceDetailIntl.closeServiceMesh)}
            </Radio>
          </RadioGroup>
          <div style={{ color: '#ccc', marginTop: 12 }}>
          { this.state.istioValue &&
          <span>{this.props.formatMessage(AppServiceDetailIntl.afterOpenServiceMeshInfo)}</span>}
          { !this.state.istioValue &&
          <span>{this.props.formatMessage(AppServiceDetailIntl.closedOnlyVistorWithinCluster)}</span> }
          </div>
    </Modal>
    )
  }
}