/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 13th 2018
 */
import * as React from 'react'
// import { connect } from 'react-redux'
import { Button, Modal, Alert } from 'antd'
import ApplayDetail from './ApplayDetail'
import PropTypes from 'prop-types'
import './style/index.less'
import { connect } from 'react-redux'
import { deleteResourcequota } from '../../../../actions/applyLimit'
import { REG } from '../../../../../src/constants'
class Operation extends React.Component {
  static propTypes = {
    condition: PropTypes.string,
  }
  state = {
    relealVisable: false, // 撤销申请弹出框标志位
    relealLoading: false, // 撤销申请过程中的loading
    detailVisable: false, // 详情弹出框标志位
    clearVisable: false, // 清除申请记录标志位
    clearLoading: false, // 清楚申请过程中的loading
  }
  setRelealVisable = () => {
    const { relealVisable } = this.state
    this.setState({ relealVisable: !relealVisable })
  }
  relealApply = () => {
    // 向后台发送撤销请求, 成功后
    this.setState({ relealLoading: true })
    const { reloadApplyRecord, deleteResourcequota } = this.props
    // 向后台验证
    const { record } = this.props

    deleteResourcequota(record.id, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              relealVisable: false,
              relealLoading: false,
            })
            reloadApplyRecord()
          }
        },
        isAsync: true,
      },
    })
  }
  toggleDetailVisable = () => {
    const { detailVisable } = this.state
    this.setState({
      detailVisable: !detailVisable,
    })
  }
  toggleClearVisable = () => {
    const { clearVisable } = this.state
    this.setState({
      clearVisable: !clearVisable,
    })
  }
  clearRecord = () => {
    const { clearVisable } = this.state
    this.setState({
      clearLoading: true,
    })
    setTimeout(() => {
      this.setState({
        clearLoading: false,
        clearVisable: !clearVisable,
      })
    }, 2000)
  }
  render() {
    const { condition, record } = this.props
    const { relealVisable, relealLoading, detailVisable, clearLoading, clearVisable } = this.state
    return (
      <div className="content-btns Operation">
        {
          condition !== 'notCondition' ?
            [
              <Button type="primary" onClick={this.toggleDetailVisable}>查看审批详情</Button>,
              <Button onClick={this.toggleClearVisable}>清除申请记录</Button>,
            ] : [
              <Button onClick={this.setRelealVisable}>撤销申请</Button>,
            ]
        }
        <Modal
          visible = {relealVisable}
          title="撤销申请"
          onCancel={ this.setRelealVisable }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={this.setRelealVisable}>
              取消
            </Button>,
            <Button key="submit" type="primary" size="large" loading={relealLoading}
              onClick={this.relealApply}>
              确 定
            </Button>,
          ]}
        >
          <Alert message="撤销该申请后, 该申请将不会发送给系统管理员, 确定撤销此次申请?"
            type="warning" showIcon />
        </Modal>
        <ApplayDetail title="资源配额申请详情" visible={detailVisable} toggleVisable={this.toggleDetailVisable}
          record={record}/>
        <Modal
          visible = {clearVisable}
          title="清除申请记录"
          onCancel={ this.toggleClearVisable }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={this.toggleClearVisable}>
              取消
            </Button>,
            <Button key="submit" type="primary" size="large" loading={clearLoading}
              onClick={this.clearRecord}>
              确 定
            </Button>,
          ]}
        >
          <Alert message="清除申请记录后将无法恢复, 确定清除申请记录?"
            type="warning" showIcon />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const resourcequoteRecord = state.applyLimit.resourcequoteRecord
  // const namespace = state.entities.loginUser.info.namespace
  return {
    resourcequoteRecord,
  }
}

export default connect(mapStateToProps, {
  deleteResourcequota,
})(Operation)
