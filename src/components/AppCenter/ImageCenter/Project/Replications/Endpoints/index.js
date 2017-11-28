/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Endpoint component of replications
 *
 * v0.1 - 2017-11-27
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import { Table, Button, Modal, Alert } from 'antd'
import CommonSearchInput from '../../../../../CommonSearchInput'
import NotificationHandler from '../../../../../Notification'
import {
  getTargets,
  deleteTargetById,
  createTargetStore,
  updateTargetById,
  getTargetPolicies,
  validationNewTargetStore,
  validationOldTargetStore,
} from '../../../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../../../constants'
import { formatDate } from '../../../../../../common/tools'
import UpsertModal from './UpsertModal'
import './style/index.less'

class Endpoints extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchInput: '',
      deleteModal: false,
      currentRow: {},
      delBtnLoading: false,
      upsertModal: false,
      upsertBtnLoading: false,
      mode: 'create',
      updateTargetDisabled: false,
    }
    this.loadTargets = this.loadTargets.bind(this)
    this.delTarget = this.delTarget.bind(this)
    this.onUpsertModalOk = this.onUpsertModalOk.bind(this)
    this.updateTarget = this.updateTarget.bind(this)
  }

  componentWillMount() {
    this.loadTargets()
  }

  loadTargets(query) {
    const { getTargets } = this.props
    const { searchInput } = this.state
    getTargets(DEFAULT_REGISTRY, { name: searchInput }, query)
  }

  delTarget() {
    const { deleteTargetById } = this.props
    const { currentRow } = this.state
    this.setState({
      delBtnLoading: true,
    })
    const notification = new NotificationHandler()
    deleteTargetById(DEFAULT_REGISTRY, currentRow.id, {
      success: {
        func: () => {
          notification.success(`删除目标 ${currentRow.name} 成功`)
          this.setState({
            deleteModal: false,
          })
          this.loadTargets()
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error('删除目标失败')
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            delBtnLoading: false,
          })
        }
      }
    })
  }

  onUpsertModalOk(body) {
    const { createTargetStore, updateTargetById } = this.props
    const { mode, currentRow } = this.state
    this.setState({
      upsertBtnLoading: true,
    })
    const notification = new NotificationHandler()
    if (mode === 'create') {
      createTargetStore(DEFAULT_REGISTRY, body, {
        success: {
          func: () => {
            this.loadTargets()
            this.setState({
              upsertModal: false,
            })
            notification.success('添加目标成功')
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notification.error('添加目标失败')
          },
        },
        finally: {
          func: () => this.setState({ upsertBtnLoading: false })
        },
      })
      return
    }

    updateTargetById(DEFAULT_REGISTRY, currentRow.id, body, {
      success: {
        func: () => {
          this.loadTargets()
          this.setState({
            upsertModal: false,
          })
          notification.success('修改目标成功')
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error('修改目标失败')
        },
      },
      finally: {
        func: () => this.setState({ upsertBtnLoading: false })
      },
    })
  }

  updateTarget(currentRow) {
    const { getTargetPolicies } = this.props
    this.setState({
      mode: 'edit',
      upsertModal: true,
      updateTargetDisabled: false,
      currentRow,
    })
    getTargetPolicies(DEFAULT_REGISTRY, currentRow.id, {
      success: {
        func: res => {
          if (res.data && res.data.length > 0) {
            this.setState({
              updateTargetDisabled: true,
            })
          }
        },
        // isAsync: true,
      },
    })
  }

  render() {
    const { targets, validationNewTargetStore, validationOldTargetStore } = this.props
    const { isFetching, data } = targets
    const {
      searchInput, deleteModal, currentRow, delBtnLoading,
      mode, upsertModal, upsertBtnLoading, updateTargetDisabled,
    } = this.state
    const columns = [{
      title: '目标名',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '目标 URL',
      dataIndex: 'endpoint',
      key: 'endpoint',
    }, {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      render: text => formatDate(text),
    }, {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: text => formatDate(text),
    }, {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, row) => (
        <div className="row-actions">
          <Button
            type="primary"
            onClick={this.updateTarget.bind(this, row)}
          >
            编辑
          </Button>
          <Button onClick={() => this.setState({ deleteModal: true, currentRow: row })}>
          删除
          </Button>
        </div>
      )
    }]

    return (
      <div className="replications-endpoints">
        <div className="actions">
          <Button
            type="primary"
            size="large"
            onClick={() => this.setState({
              mode: 'create',
              upsertModal: true,
              updateTargetDisabled: false,
            })}
          >
            <i className="fa fa-plus" /> 目标
          </Button>
          <Button
            size="large"
            onClick={this.loadTargets}
          >
            <i className="fa fa-refresh" /> 刷新
          </Button>
          <CommonSearchInput
            placeholder="输入目标名搜索"
            size="large"
            onChange={searchInput => this.setState({ searchInput })}
            onSearch={name => this.loadTargets({ name })}
          />
        </div>
        <Table
          dataSource={data || []}
          columns={columns}
          pagination={false}
          loading={isFetching}
          rowKey={row => row.id}
        />
        <Modal
          visible={deleteModal}
          title="删除目标"
          onCancel={() => this.setState({ deleteModal: false })}
          onOk={this.delTarget}
          confirmLoading={delBtnLoading}
        >
          <div className="confirmText">
          确认删除目标 {currentRow.name}？
          </div>
        </Modal>
        {
          upsertModal &&
          <UpsertModal
            mode={mode}
            visible={upsertModal}
            onCancel={() => this.setState({ upsertModal: false })}
            currentRow={currentRow}
            onOk={this.onUpsertModalOk}
            confirmLoading={upsertBtnLoading}
            disabled={updateTargetDisabled}
            func={{
              validationNewTargetStore,
              validationOldTargetStore,
            }}
          />
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor } = state
  return {
    targets: harbor.targets || {},
  }
}

export default connect(mapStateToProps, {
  getTargets,
  deleteTargetById,
  createTargetStore,
  updateTargetById,
  getTargetPolicies,
  validationNewTargetStore,
  validationOldTargetStore,
})(Endpoints)
