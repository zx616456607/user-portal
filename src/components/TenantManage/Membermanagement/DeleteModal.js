/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Modal for delete user
 *
 * v0.1 - 2017-07-13
 * @author Zhangpc
 */

import React from 'react'
import { Row, Col, InputNumber, Table, Modal, Button, Checkbox } from 'antd'
import { camelize } from 'humps'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import './style/DeleteModal.less'

export default class DeleteModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      users: [],
      reCheck: false,
      loading: false,
    }
  }

  componentDidMount() {
    this.setState({
      loading: true,
    })
    this.props.loadUserList({size: 0}, {
      success: {
        func: res => {
          this.setState({
            users: res.users,
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            loading: false,
          })
        }
      }
    })
  }

  onRowClick = record => {
    let { selectedRowKeys } = this.state
    const namespace = record.namespace
    const index = selectedRowKeys.indexOf(namespace)
    let newSelectedRowKeys = []
    if (index > -1) {
      selectedRowKeys.splice(index, 1)
    } else {
      selectedRowKeys = selectedRowKeys.concat(namespace)
    }
    this.setState({
      selectedRowKeys,
    })
  }

  render() {
    const { onCancel, onOk, loginUser } = this.props
    const { selectedRowKeys, number, users, reCheck, loading } = this.state
    const loginUserRole = loginUser.role
    const getRecordDisabledCheck = record => {
      if (loginUserRole === ROLE_SYS_ADMIN) {
        return false
      }
      if (loginUserRole === ROLE_TEAM_ADMIN) {
        return record.role === ROLE_SYS_ADMIN
      }
      return true
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedRowKeys => this.setState({ selectedRowKeys }),
      getCheckboxProps: record => ({
        disabled: getRecordDisabledCheck(record), // 配置无法勾选的列
      }),
    }
    let teamAdminCount = 0
    let sysAdminCount = 0
    selectedRowKeys.map(key => {
      users.every(user => {
        if (user.namespace === key) {
          if (user.role === ROLE_TEAM_ADMIN) {
            teamAdminCount ++
          } else if (user.role === ROLE_SYS_ADMIN) {
            sysAdminCount ++
          }
          return false
        }
        return true
      })
    })
    const columns = [{
      title: '成员名',
      dataIndex: 'userName',
      width: '40%',
    }, {
      title: '所属团队',
      dataIndex: 'teamCount',
      width: '30%',
      render: text => text || '-',
    }, {
      title: '参与项目',
      dataIndex: camelize('project_count'),
      width: '30%',
      render: text => text || '-',
    }]
    return (
      <Modal
        {...this.props}
        title="批量删除成员 (@Todo: 缺批量删除 api)"
        wrapClassName="DeleteModal"
        footer={[
          <div key="number" className="selectedNumber">
            {
              selectedRowKeys.length > 0 && (
                <span>
                  已选中<span className="number">{selectedRowKeys.length}</span>个
                </span>
              )
            }
          </div>,
          <Button key="back" type="ghost" size="large" onClick={onCancel}>取 消</Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={onOk.bind(this, selectedRowKeys, number)}
            disabled={selectedRowKeys.length === 0 || !reCheck}
          >
            确 认
          </Button>
        ]}
      >
        <Row className="alertRow warningRow marginBottom">
          <Col span={2} className="alertRowIcon">
            <i className="fa fa-exclamation-triangle" aria-hidden="true" />
          </Col>
          <Col span={22}>
            将永久删除以下用户，包括所有用户数据以及用户内联策略，
            {
              (teamAdminCount > 0 || sysAdminCount > 0) &&
              '其中有'
            }
            {
              sysAdminCount > 0 &&
              <span>
                <span className="number">
                  {sysAdminCount}
                </span>
                个系统管理员
              </span>
            }
            {
              (teamAdminCount > 0 && sysAdminCount > 0) &&
              '和'
            }
            {
              teamAdminCount > 0 &&
              <span>
                <span className="number">
                  {teamAdminCount}
                </span>
                个团队管理员
              </span>
            }
            {
              (teamAdminCount > 0 || sysAdminCount > 0) &&
              '，'
            }
            删除的用户数据无法恢复。您确定要删除以下用户？
          </Col>
        </Row>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          pagination={false}
          scroll={{y: 300}}
          onRowClick={this.onRowClick}
          className="marginBottom"
          rowKey={record => record.namespace}
          loading={loading}
        />
        <Row className="reCheck" checked={reCheck} onChange={e => this.setState({reCheck: e.target.checked})}>
          <Checkbox>选中此框以确认您要删除这些用户</Checkbox>
        </Row>
      </Modal>
    )
  }
}
