/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, } from 'antd'
import './style/TeamDetail.less'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadTeamUserListStd } from '../../../../actions/team'

const data = [
  {key: '1',name: 'zhaoxy1',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '2',name: 'zhaoxy2',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '3',name: 'zhaoxy3',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '4',name: 'zhaoxy4',tel: '123',email:'1111@tenxcloud.com',role:1},
]
class TeamDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTableChange = this.handleTableChange.bind(this)
    this.getSort = this.getSort.bind(this)
    this.handleSortMemberName = this.handleSortMemberName.bind(this)
    this.getColumns = this.getColumns.bind(this)
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      sortMemberName: false,
      sort: 'a,teamName',
      filter: '',
      pageSize: 5,
      page: 1,
      current: 1,
    }
  }
  handleTableChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  }
  handleSortMemberName() {
    const { sortMemberName } = this.state
    let sort = this.getSort(!sortMemberName, 'memberName')
    //loadTeamUserListStd(teamID, { sort })
    this.setState({
      sortMemberName: !sortMemberName,
      sort,
    })
  }
  getColumns (role,state) {
    console.log(role);
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter} = this.state
    if(role === 0){
      return [
        {
          title: (
            <div onClick={this.handleSortMemberName}>
              成员名
              <div className="ant-table-column-sorter">
              <span className={sortMemberName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
                <span className={!sortMemberName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
              </div>
            </div>
          ),
          dataIndex: 'name',
          key: 'name',
          className: 'memberName',
          width: '33%',
          render: (text, record, index) => (
            <div>{text}</div>
          )
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          width: '33%'
        },
        {
          title: '角色',
          dataIndex: 'role',
          key: 'role',
          width: '33%'
        },
      ]
    }
    return [
      {
        title: (
          <div onClick={this.handleSortMemberName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={sortMemberName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!sortMemberName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'memberName',
        width: '20%',
        render: (text, record, index) => (
          <div>{text}</div>
        )
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '20%'
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: '20%'
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        width: '20%',
        className: 'tabOpt',
        render: (text, record, index) => (
        index === 0?
          <Button className="tabOptBtn" icon="setting">账号设置</Button>
          :
          state ?
            <Button className="tabOptBtn hoverRed" icon="cross">取消邀请</Button>:
            <Button className="tabOptBtn hoverRed" icon="delete">移除</Button>
        )
      },
    ]
  }
  componentWillMount() {
    const { loadTeamUserListStd, teamID, } = this.props
    loadTeamUserListStd(teamID, { sort: 'a,userName', size: 100, page: 1 })  
  }
  
  render() {
    const scope = this
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter} = this.state
    const { teamName, teamID, currentRole, teamUserList } = this.props
    let inviting = true //邀请中状态
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const pagination = {
      simple: {true},
      total: 1,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: this.state.current,
      onShowSizeChange(current, pageSize) {
        this.setState({
          page: current,
          pageSize: pageSize,
          current: 1,
        })
      },
      onChange(current) {
        this.setState({
          page: current,
          pageSize: this.state.pageSize,
          current: current,
        })
      },
    }
    
    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20 }}>
          <Link className="back" to="/account/team">返回</Link>
          <span className="title">
            { teamName }
          </span>
        </Row>
        {
          currentRole === 0?
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为普通成员您可退出团队。" />
              <Row className="memberOption">
                <Button icon='logout' className='quitTeamBtn'>
                  退出团队
                </Button>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={pagination}/>
              </Card>
            </div>:
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为创建者您可管理团队、邀请新成员、解散团队、移除团队成员和跳转到“我的账户”。" />
              <Row className="memberOption">
                <Button icon='logout' className='quitTeamBtn'>
                  退出团队
                </Button>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={pagination}/>
              </Card>
            </div>
        }
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { team_id, team_name } = props.params
  let currentRole = 0
  console.log('props',props);
  console.log('state',state);
  const { loginUser } = state.entities
  if(loginUser.info){
    currentRole = loginUser.info.role
    console.log('currentRolecurrentRole',currentRole);
  }

  let teamUserList = []
  const { teamusersStd } = state.team
  if (teamusersStd) {
    if (teamusersStd.result) {
      const teamusers = teamusersStd.result.users
      teamusers.map((item, index) => {
        if (item.userName == loginUser.info.userName) {
          teamUserList.splice(0, 0,
            {
              key: item.email,
              name: item.userName,
              tel: item.phone,
              email: item.email,
              role: item.isCreator ? "创建者" : "普通成员",
            }
          )
        } else {
          teamUserList.push(
            {
              key: item.email,
              name: item.userName,
              tel: item.phone,
              email: item.email,
              role: item.isCreator ? "创建者" : "普通成员",
            }
          )
        }
      })

      const invitedUsers = teamusersStd.result.invitedUsers
      invitedUsers.map((item, index) => {
        teamUserList.push(
          {
            key: item,
            name: "等待接受邀请中...",
            tel: "",
            email: item,
          }
        )
      })
    }
  }
  return {
    teamName: team_name,
    teamID: team_id,
    currentRole,
    teamUserList,
  }
}
export default connect(mapStateToProp, {
  loadTeamUserListStd,
})(TeamDetail)