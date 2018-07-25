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
import './style/ServiceMeshSwitch.less'

export default class ServiceMeshSwitch extends React.Component {
  state = {
    ServiceMeshSwitch: false,
    checked: false,
    loading: false,
    switchValue: false, //根据后台api在didmount中更新它
  }
  onChange = (checked) => {
    this.setState({ checked: true, switchValue: checked })
  }
  buttonClick = () => {
    this.setState({ loading: true})
    // TODO: 执行后台操作
    setTimeout(()=> {
      this.setState({
        loading: false,
        checked: false,
      })
    },1000)
  }
  render() {
    let { initialSwitchValue } = this.props;
    const { checked, loading, switchValue } = this.state;
    initialSwitchValue = false;
    return (
      <div className="ServiceMeshSwitch">
      <Card>
        <TenxPage>
          <div className="titleSpan">服务网格</div>
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
        </TenxPage>
      </Card>
      </div>
    )
  }
}