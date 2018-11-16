/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * order delete modal
 *
 * v0.1 - 2018-11-15
 * @author rensiwei
 */
import React from 'react'
import { connect } from 'react-redux'
import * as workOrderActions from '../../../actions/work_order'
import { Modal } from 'antd'
import NotificationHandler from '../../../../src/components/Notification'

const notify = new NotificationHandler()

class DelModal extends React.Component {
  state = {
    isBtnLoading: false,
  }
  componentDidMount() {}
  onOk = () => {
    const { deleteWorkOrder } = this.props
    const { current, onOk } = this.props
    const id = current.id
    if (!id) return
    this.setState({
      isBtnLoading: true,
    }, () => {
      deleteWorkOrder(id, {
        success: {
          func: res => {
            if (res.result.statusCode === 200) {
              notify.success('工单删除成功')
              onOk()
            }
          },
          isAsync: true,
        },
        finally: {
          func: () => {
            this.setState({
              isBtnLoading: false,
            })
          },
        },
      })
    })
  }
  render() {
    const { onCancel, visible, current } = this.props
    const { isBtnLoading } = this.state
    return (
      <Modal
        title="删除工单"
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
        confirmLoading={isBtnLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
          确定删除工单 [{current.workorderName}] ?
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  const { loginUser = {} } = state.entities
  return {
    user: loginUser.info,
  }
}

export default connect(mapStateToProps, {
  deleteWorkOrder: workOrderActions.deleteWorkOrder,
})(DelModal)
