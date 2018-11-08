/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * system notice remove modal
 *
 * v0.1 - 2018-11-06
 * @author rensiwei
 */
import React from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import * as workOrderActions from '../../../actions/work_order'
import { Modal } from 'antd'
import NotificationHandler from '../../../../src/components/Notification'

const notify = new NotificationHandler()

class RemoveModal extends React.Component {
  state = {
    isBtnLoading: false,
  }
  componentDidMount() {}
  onOk = () => {
    this.setState({
      isBtnLoading: true,
    }, () => {
      const { deleteSystemNotice, onCancel, onOk, current } = this.props
      deleteSystemNotice({
        id: current.id,
      }, {
        success: {
          func: res => {
            if (res.statusCode === 200 || res.result.statusCode === 200) {
              notify.success('公告删除成功')
              onCancel()
              onOk && onOk()
              browserHistory.push({
                pathname: '/work-order/system-notice',
              })
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
        title="删除公告"
        onOk={this.onOk}
        onCancel={onCancel}
        visible={visible}
        confirmLoading={isBtnLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
          确定撤销并删除 {current.announcementName} ?
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
  deleteSystemNotice: workOrderActions.deleteSystemNotice,
})(RemoveModal)
