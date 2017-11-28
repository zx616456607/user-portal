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
import { getTargets, deleteTargetById } from '../../../../../../actions/harbor'
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
      mode: 'create',
    }
    this.loadTargets = this.loadTargets.bind(this)
    this.delTarget = this.delTarget.bind(this)
    this.onUpsertModalOk = this.onUpsertModalOk.bind(this)
  }

  componentWillMount() {
    this.loadTargets()
  }

  loadTargets() {
    const { getTargets } = this.props
    getTargets(DEFAULT_REGISTRY)
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
    console.log(body)
  }

  render() {
    const { targets } = this.props
    const { isFetching, data } = targets
    const {
      searchInput, deleteModal, currentRow, delBtnLoading,
      mode, upsertModal,
    } = this.state

    const dataSource = (data || []).filter(item => item.name.indexOf(searchInput) > -1)

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
            onClick={() => this.setState({
              mode: 'edit',
              upsertModal: true,
              currentRow: row,
            })}
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
            onClick={() => this.setState({ mode: 'create', upsertModal: true })}
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
          />
        </div>
        <Table
          dataSource={dataSource}
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
})(Endpoints)
