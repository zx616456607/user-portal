/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Right cloud
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import { Spin, Tabs } from 'antd'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import './style/index.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import isEmpty from 'lodash/isEmpty';

const TabPane = Tabs.TabPane;

const mapStateToProps = state => {
  const envs = getDeepValue(state, ['rightCloud', 'envs', 'data', 'data'])
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  const { isFetching } = state.rightCloud.envs
  return {
    envs: envs || [],
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  cloudEnvList: rcIntegrationActions.cloudEnvList,
  cloudEnvChange: rcIntegrationActions.cloudEnvChange,
})
class RightCloud extends React.PureComponent {
  state = {
    activeKey: '',
  }

  async componentDidMount() {
    await this.props.cloudEnvList()
    const { envs } = this.props
    if (isEmpty(envs)) {
      return
    }
    const firstEnv = envs[0]
    this.tabChange(firstEnv.id)
  }

  back = () => {
    browserHistory.push('/cluster/integration')
  }

  tabChange = tab => {
    const { cloudEnvChange } = this.props
    this.setState({
      activeKey: tab,
    })
    cloudEnvChange(Number(tab))
  }

  render() {
    const { activeKey } = this.state
    const { children, envs, isFetching, currentEnv } = this.props
    if (isFetching || !currentEnv) {
      return <div className="loadingBox">
        <Spin size="large" />
      </div>
    }
    return (
      <QueueAnim className={'layout-content right-cloud'}>
        <div key={'header'} className={'layout-content-btns'}>
          <ReturnButton onClick={this.back}>返回集成中心</ReturnButton>
          <span className="first-title">混合云管控系统集成</span>
        </div>
        <div key={'body'} className={'layout-content-body'}>
          <Tabs onChange={this.tabChange} activeKey={activeKey}>
            {
              envs.map(item =>
                <TabPane tab={item.cloudEnvName} key={item.id}/>,
              )
            }
          </Tabs>
          {children}
        </div>
      </QueueAnim>
    )
  }
}

export default RightCloud
