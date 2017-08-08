/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Modal for deleted users
 *
 * v0.1 - 2017-08-08
 * @author Zhangpc
 */

import React from 'react'
import { Modal, Pagination, Spin } from 'antd'
import { connect } from 'react-redux'
import CommonSearchInput from '../../CommonSearchInput'
import { getDeletedUsers } from '../../../actions/user'
import './style/DeletedUsersModal.less'

class DeletedUsersModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
    }

    this.loadData = this.loadData.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.DEFAULT_QUERY = {
      from: 0,
      size: 20,
      sort: 'a,userName',
    }
  }

  loadData(query) {
    const { getDeletedUsers } = this.props
    getDeletedUsers(Object.assign({}, this.DEFAULT_QUERY, query))
  }

  componentWillMount() {
    // this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps
    if (visible && !this.props.visible) {
      this.loadData()
    }
  }

  onPageChange(page) {
    this.setState({ page })
    const from = this.DEFAULT_QUERY.size * (page - 1)
    this.loadData({ from })
  }

  onSearch(value) {
    value = value.trim()
    const filter = `userName,${value}`
    this.loadData({ filter })
  }

  render() {
    const { isFetching, deletedUsers, total } = this.props
    const { page } = this.state
    return (
      <Modal
        {...this.props}
        title="已删除成员"
      >
        <div className="deletedUserModalBody">
          <div className="deletedUserModalHeader">
            <div className="deletedUserModalHeaderLeft">
              {/* <Checkbox>全选</Checkbox> */}
              <CommonSearchInput placeholder="请输入成员名搜索" onSearch={this.onSearch}/>
            </div>
            <div className="deletedUserModalHeaderRight">
              <Pagination
                simple
                current={page}
                pageSize={this.DEFAULT_QUERY.size}
                total={total}
                onChange={this.onPageChange}
              />
            </div>
          </div>
          {
            isFetching && (
              <div className="loadingBox"><Spin /></div>
            )
          }
          {
            !isFetching && (
              <div className="deletedUserModalContent">
                <ul>
                  {
                    deletedUsers.map(user => (
                      <li className="nameLi" key={user.userName} title={user.userName}>
                        <div className="nameDiv">
                          { user.userName }
                        </div>
                      </li>
                    ))
                  }
                  {
                    deletedUsers.length === 0 && '暂无记录'
                  }
                </ul>
              </div>
            )
          }
          </div>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  const { deletedUsers } = state.user
  const { isFetching, result } = deletedUsers
  return {
    isFetching,
    deletedUsers: result && result.data.users || [],
    total: result && result.data.listMeta.total || 0,
  }
}

export default connect(mapStateToProps, {
  getDeletedUsers,
})(DeletedUsersModal)
