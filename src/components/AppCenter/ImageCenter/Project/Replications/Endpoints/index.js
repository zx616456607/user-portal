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
import { Table, Button, Modal, Alert, Pagination } from 'antd'
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
import TimeHover from '@tenx-ui/time-hover/lib'
import Ellipsis from '@tenx-ui/ellipsis/lib'

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
      currentPage: 1,
    }
    this.loadTargets = this.loadTargets.bind(this)
    this.delTarget = this.delTarget.bind(this)
    this.onUpsertModalOk = this.onUpsertModalOk.bind(this)
    this.updateTarget = this.updateTarget.bind(this)
  }

  componentWillMount() {
    this.loadTargets()
  }

  loadTargets(query = {}) {
    const { getTargets, harbor } = this.props
    const { searchInput } = this.state
    if (searchInput) {
      query = Object.assign(query, {name: searchInput})
    }
    query.harbor = harbor
    getTargets(DEFAULT_REGISTRY, query)
  }

  delTarget() {
    const { deleteTargetById, harbor } = this.props
    const { currentRow } = this.state
    this.setState({
      delBtnLoading: true,
    })
    const notification = new NotificationHandler()
    deleteTargetById(harbor, DEFAULT_REGISTRY, currentRow.id, {
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
        func: err => {
          if (err.statusCode === 412) {
            notification.error('无法删除正在使用的目标')
            this.setState({
              deleteModal: false,
            })
            return
          }
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
    const { createTargetStore, updateTargetById, harbor } = this.props
    const { mode, currentRow } = this.state
    this.setState({
      upsertBtnLoading: true,
    })
    const notification = new NotificationHandler()
    if (mode === 'create') {
      createTargetStore(harbor, DEFAULT_REGISTRY, body, {
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
          func: (err) => {
            const { statusCode } = err
            if (statusCode === 409) {
              return notification.error('目标名或目标 URL 已存在')
            }
            notification.error('添加目标失败')
          },
        },
        finally: {
          func: () => this.setState({ upsertBtnLoading: false })
        },
      })
      return
    }

    updateTargetById(harbor, DEFAULT_REGISTRY, currentRow.id, body, {
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
        func: err => {
          const { statusCode } = err
          if (statusCode === 409) {
            return notification.error('目标名或目标 URL 已存在')
          }
          notification.error('修改目标失败')
        },
      },
      finally: {
        func: () => this.setState({ upsertBtnLoading: false })
      },
    })
  }

  updateTarget(currentRow) {
    const { getTargetPolicies, harbor } = this.props
    this.setState({
      mode: 'edit',
      upsertModal: true,
      updateTargetDisabled: false,
      currentRow,
    })
    getTargetPolicies(harbor, DEFAULT_REGISTRY, currentRow.id, {
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

  handlePager = currentPage => {
    this.setState({ currentPage })
  }

  render() {
    const { targets, validationNewTargetStore, validationOldTargetStore, harbor } = this.props
    const { isFetching, data } = targets
    const {
      searchInput, deleteModal, currentRow, delBtnLoading,
      mode, upsertModal, upsertBtnLoading, updateTargetDisabled, currentPage,
    } = this.state
    const columns = [{
      title: '目标名',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '目标 URL',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: '20%',
      render: text => <span>
          <Ellipsis
            tooltip={`${server}/${row.name}`}
          >
            {text}
          </Ellipsis>
        </span>,
    }, {
      title: '验证远程证书',
      dataIndex: 'insecure',
      key: 'insecure',
      render: text => <span>{(!text).toString()}</span>,
    }, {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      render: text => <TimeHover time={text} />,
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
    let listData = data ? data : []
    const total = listData.length
    const pagination = {
      simple: true,
      total,
      current: currentPage,
      pageSize: 10,
      onChange: this.handlePager,
    }
    listData = listData.length < 10 ?
      listData
      : listData.slice((currentPage - 1) * 10, currentPage * 10)
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
          <span className="pageList">
            <span className="total">共 {total} 条</span>
            <Pagination {...pagination}/>
          </span>
        </div>
        <Table
          dataSource={listData}
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
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
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
            harbor={harbor}
          />
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities } = state

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    targets: stateHarbor.targets || {},
    harbor,
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
