/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance config
 *
 * v0.1 - 2019-01-02
 * @author zhangxuan
 */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Button, Spin } from 'antd'
import ConfigManage from './ConfigManage'
import './style/LBDetailConfig.less'
import * as LoadBalanceActions from '../../../../src/actions/load_balance'
import { getDeepValue } from '../../../util/util'
import Notification from '../../../../src/components/Notification'

const notify = new Notification()

const mapStateToProps = state => {
  const config = getDeepValue(state, [ 'loadBalance', 'loadBalanceConfig' ])
  const { data, isFetching } = config || { data: {}, isFetching: true }
  return {
    config: data,
    isFetching,
  }
}
@connect(mapStateToProps, {
  editLBConfig: LoadBalanceActions.editLBConfig,
  getLBConfig: LoadBalanceActions.getLBConfig,
})
class LBDetailConfig extends React.PureComponent {

  state = {

  }

  componentDidMount() {
    this.loadConfig()
  }

  loadConfig = () => {
    const { getLBConfig, clusterID, name, lbDetail, location } = this.props
    const { agentType } = getDeepValue(lbDetail.deployment, [ 'metadata', 'labels' ])
    const { displayName } = location.query
    getLBConfig(clusterID, name, displayName, agentType)
  }

  toggleBtns = () => {
    this.setState(({ isEdit }) => ({
      isEdit: !isEdit,
    }))
    if (this.state.isEdit) {
      this.loadConfig()
    }
  }

  handleConfirm = async () => {
    const { editLBConfig, form, clusterID, location, lbDetail, name } = this.props
    const { displayName } = location.query
    const { agentType } = getDeepValue(lbDetail.deployment, [ 'metadata', 'labels' ])
    const { validateFields } = form
    validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        loading: true,
      })
      const body = {
        config: JSON.parse(values.config),
      }
      const result = await editLBConfig(clusterID, name, displayName, agentType, body)
      if (result.error) {
        this.setState({
          loading: false,
        })
        return notify.warn('修改配置失败')
      }
      this.loadConfig()
      this.setState({
        loading: false,
      })
      this.toggleBtns()
      notify.success('修改配置成功')
    })
  }

  renderHeaderBtns = () => {
    const { isEdit, loading } = this.state
    return (
      <div className="config-header-btns">
        {
          isEdit ? [
            <Button type={'ghost'} key={'cancel'} size={'large'} onClick={this.toggleBtns}>取消</Button>,
            <Button
              type={'primary'}
              key={'save'} size={'large'}
              onClick={this.handleConfirm}
              loading={loading}
            >
              保存配置
            </Button>,
          ] : <Button type={'primary'} size={'large'} onClick={this.toggleBtns}>修改配置</Button>
        }
      </div>
    )
  }

  render() {
    const { isEdit } = this.state
    const { form, config, isFetching } = this.props
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 10 },
    }
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    return (
      <div className="loadbalance-config">
        {this.renderHeaderBtns()}
        <ConfigManage
          {...{
            form,
            formItemLayout,
            config,
            readOnly: !isEdit,
          }}
        />
      </div>
    )
  }
}

export default Form.create()(LBDetailConfig)
