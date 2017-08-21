/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Modal for delete single user
 *
 * v0.1 - 2017-08-21
 * @author Zhangpc
 */

import React from 'react'
import { Row, Col, Table, Modal, Button, Spin, Menu } from 'antd'
import { camelize } from 'humps'
import { connect } from 'react-redux'
import { loadUserTeams, loadAllUserList } from '../../../actions/user'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import CommonSearchInput from '../../CommonSearchInput'
import './style/DeleteUserModal.less'

class DeleteUserModal extends React.Component {
  constructor(props) {
    super(props)
    this.onUserSelectChange = this.onUserSelectChange.bind(this)
    this.loadData = this.loadData.bind(this)
    this.loadTeamsOfUser = this.loadTeamsOfUser.bind(this)
    this.onTeamClick = this.onTeamClick.bind(this)
    this.searchUser = this.searchUser.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.state = {
      delErrorMsg: null,
      delBtnLoading: false,
      copyStatus: false,
      // teamsOfUsers: {},
      userSelectedRowKeys: {},
      selectTeamKeys: [],
      users: [],
    }
    // this.teamsOfUsers = {}
    this.users = []
  }

  loadData(nextProps) {
    const { loadUserTeams, currentUser } = nextProps || this.props
    loadUserTeams(currentUser.key, { size: 0 }, {
      success: {
        func: res => {
          const { teams } = res
          if (!teams || teams.length === 0) {
            return
          }
          this.setState({
            selectTeamKeys: [ teams[0].teamID ]
          })
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { visible, currentUser, loadAllUserList } = nextProps
    if (visible && !this.props.visible) {
      this.loadData(nextProps)
      loadAllUserList({
        success: {
          func: res => {
            this.setState({
              users: res.users,
            })
            this.users = res.users
          }
        }
      })
    }
  }

  loadTeamsOfUser() {
    //
  }

  onUserSelectChange(selectedRowKeys) {
    const { userSelectedRowKeys, selectTeamKeys } = this.state
    userSelectedRowKeys[selectTeamKeys[0]] = selectedRowKeys
    this.setState({
      userSelectedRowKeys
    })
  }

  returnDefaultTooltip() {
    setTimeout(() => {
      this.setState({
        copyStatus: false
      })
    }, 500)
  }

  copyText() {
    let target = document.getElementById('delErrorMsg')
    target.select()
    document.execCommand('Copy', false)
    this.setState({
      copyStatus: true
    })
  }

  delMember() {
    const { scope } = this.props
    const record = this.currentUser
    if (record.style === "系统管理员") {
      confirm({
        title: '不能删除系统管理员',
      });
      return
    }
    this.setState({ delBtnLoading: true })
    let notification = new NotificationHandler()
    const { page, pageSize, filter, sort } = scope.state
    scope.props.deleteUser(record.key, {
      success: {
        func: () => {
          notification.success('删除成功！')
          scope.props.loadUserList({
            page: page,
            size: pageSize,
            sort: sort,
            filter: filter,
          })
          this.setState({ delModal: false, delErrorMsg: null })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          this.setState({
            delErrorMsg: err.message,
          })
          notification.error('删除失败！')
        }
      },
      finally: {
        func: () => {
          this.setState({ delBtnLoading: false })
        }
      }
    })
  }

  onTeamClick({item, key, keyPath}) {
    console.log('key======')
    console.log(key)
  }

  onCancel() {
    this.props.onCancel()
    this.setState({
      delErrorMsg: null,
      copyStatus: false,
      userSelectedRowKeys: {},
      selectTeamKeys: [],
    })
  }

  searchUser(value) {
    const { users } = this.state
    if (value) {
      value = value.trim()
    }
    if (!value) {
      this.setState({
        users: this.users,
      })
      return
    }
    this.setState({
      users: this.users.filter(user => user.userName.indexOf(value) > -1),
    })
  }

  render() {
    const { visible, teams, currentUser } = this.props
    const { userSelectedRowKeys, delBtnLoading, delErrorMsg, users, selectTeamKeys } = this.state
    let selectedRowKeys = userSelectedRowKeys[selectTeamKeys[0]] || []
    if (selectedRowKeys.length === 0 && currentUser) {
      selectedRowKeys.push(currentUser.key)
    }
    console.log('selectedRowKeys', selectedRowKeys)
    const userRowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: this.onUserSelectChange,
    }
    const filterKey = [
      { text: '普通成员', value: 0 },
      { text: '系统管理员', value: ROLE_SYS_ADMIN }
    ]
    const deleteUserTableColumns = [{
      title: '成员',
      dataIndex: 'userName',
      key: 'userName',
      width: '60%',
    }, {
      title: '类型',
      dataIndex: 'role',
      key: 'role',
      filters: filterKey,
      onFilter: (value, record) => {
        if (typeof record.role === 'undefined') {
          return value == 0
        }
        return record.role == value
      },
      width: '40%',
      render: (text, record, index) => {
        if (record.role === ROLE_TEAM_ADMIN) {
          return '团队管理员'
        }
        if (record.role === ROLE_SYS_ADMIN) {
          return '系统管理员'
        }
        return '普通成员'
      }
    }]
    return (
      <Modal title="删除成员操作"
        visible={visible}
        onCancel={this.onCancel}
        wrapClassName="deleteUserModal"
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.onCancel}
          >
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={delBtnLoading}
            onClick={() => this.delMember()}
          >
            确 定
          </Button>,
        ]}
      >
      {
        (delBtnLoading && !delErrorMsg) && (
          <div className="loadingBox"><Spin size="large" /></div>
        )
      }
      {
        (!delBtnLoading && !delErrorMsg) && (
          <div>
            <Row className="alertRow warningRow">
              <Col span={2} className="alertRowIcon">
                <i className="fa fa-exclamation-triangle" aria-hidden="true" />
              </Col>
              <Col span={22}>
                删除后可在已删除成员表单中查看，此操作不可恢复，且平台上不能再次创建同名成员
              </Col>
            </Row>
            {
              teams && teams.length > 0 && (
                <div>
                  <div className="handOverTeamTips">
                    该成员为以下团队管理员，需要转让团队后方可删除
                  </div>
                  <Row gutter={16} className="handOverTeam">
                    <Col span={6}>
                      <div className="teamList">
                        <div className="teamListTitle">
                          团队（{teams.length}）
                        </div>
                        <div className="teamListBody">
                          <Menu
                            className="teamListBody"
                            mode="inline"
                            onClick={this.onTeamClick}
                            selectedKeys={this.state.selectTeamKeys}
                            onSelect={({ selectedKeys }) => this.setState({ selectTeamKeys: selectedKeys })}
                          >
                            {
                              teams.map(team => (
                                <Menu.Item
                                  key={team.teamID}
                                >
                                  {team.teamName}
                                </Menu.Item>
                              ))
                            }
                          </Menu>
                        </div>
                      </div>
                    </Col>
                    <Col span={18}>
                      <div className="memberList">
                        <div className="memberListTitle">
                          <CommonSearchInput onChange={this.searchUser} placeholder="请输入搜索内容"/>
                        </div>
                        <Table
                          columns={deleteUserTableColumns}
                          size="middle"
                          dataSource={users}
                          pagination={false}
                          scroll={{ y: 196 }}
                          rowSelection={userRowSelection}
                          rowKey={record => record.userID}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              )
            }
            {/* <div className="modalColor">
              <i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>
              您是否确定要删除成员 {userManageName} ?
            </div> */}
          </div>
        )
      }
      {
        (!delBtnLoading && delErrorMsg) && (
          <div>
            <Row className="alertRow warningRow">
              <Col span={2} className="alertRowIcon">
                <i className="fa fa-exclamation-triangle" aria-hidden="true" />
              </Col>
              <Col span={22} className="alertRowDesc">
                删除该成员任务失败，请查看以下日志
              </Col>
            </Row>
            <div className="delErrorMsg">
              <div className="delErrorMsgHeader" gutter={16}>
                <div className="delErrorMsgText">日志</div>
                <div className="delErrorMsgIcon">
                  <input style={{opacity:0}} id="delErrorMsg" value={delErrorMsg} />
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      onMouseLeave={this.returnDefaultTooltip}
                      onClick={this.copyText}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className="delErrorMsgBody">
                <pre>
                  {delErrorMsg}
                </pre>
              </div>
            </div>
          </div>
        )
      }
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  let teamsData = []
  const { userTeams } = state.user
  if (userTeams.result) {
    if (userTeams.result.teams) {
      // @Todo need api support
      // teamsData = userTeams.result.teams.filter(team => team.isAdmin)
      teamsData = userTeams.result.teams
    }
  }
  return {
    teams: teamsData,
  }
}

export default connect(mapStateToProps, {
  loadUserTeams,
  loadAllUserList,
})(DeleteUserModal)