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
import InviteNewMemberModal from '../../InviteNewMemberModal'
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
    this.handleRemoveMember = this.handleRemoveMember.bind(this)
    this.handleCancelInvite = this.handleCancelInvite.bind(this)
    this.handleClickRecharge = this.handleClickRecharge.bind(this)
    this.handleQuiteTeam = this.handleQuiteTeam.bind(this)
    this.handleDelTeam = this.handleDelTeam.bind(this)
    this.handleAddNewMember = this.handleAddNewMember.bind(this)
    this.closeInviteModal = this.closeInviteModal.bind(this)

    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      sortMemberName: false,
      sort: 'a,teamName',
      filter: '',
      pageSize: 5,
      page: 1,
      current: 1,
      showInviteModal: false,
    }
  }
  //表单变化(排序,删选)
  handleTableChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }
  //排序规则
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  }
  //团队成员名排序
  handleSortMemberName() {
    const { sortMemberName } = this.state
    let sort = this.getSort(!sortMemberName, 'memberName')
    //loadTeamUserListStd(teamID, { sort })
    this.setState({
      sortMemberName: !sortMemberName,
      sort,
    })
  }
  //移除成员
  handleRemoveMember (memberID) {
    console.log('handleRemoveMember--memberID',memberID)
  }
  //取消邀请
  handleCancelInvite (memberID) {
    console.log('handleCancelInvite--memberID',memberID)
  }
  //去充值
  handleClickRecharge (teamID) {
    console.log('handleClickRecharge--teamID',teamID)
  }
  //退出团队
  handleQuiteTeam (teamID) {
    console.log('handleQuiteTeam--teamID',teamID)
  }
  //解散团队
  handleDelTeam (teamID) {
    console.log('handleDelTeam--teamID',teamID)
  }
  //添加新成员
  handleAddNewMember (teamID) {
    console.log('handleAddNewMember--teamID',teamID)
    this.setState({
      showInviteModal: true,
    })
  }
  //关闭邀请新成员弹窗
  closeInviteModal() {
    this.setState({
      showInviteModal: false,
    })
  }
  //table列配置
  getColumns (role,inviteState) {
    console.log(role);
    let { sortedInfo, filteredInfo, sortMemberName, sort, filter } = this.state
    //普通成员
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
            index === 0 ?
            <div>{text}(我)</div>:
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
    //创建者
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
          index === 0 ?
          <div>{text}(我)</div>:
          inviteState ?
          <div>{text} (接收邀请中 ...)</div>:
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
        index === 0 ?
          <Link to='/account'>
            <Button className="tabOptBtn" icon="setting">账号设置</Button>
          </Link>
          :
          inviteState ?
            <Button className="tabOptBtn hoverRed" icon="cross" onClick={() => this.handleCancelInvite(record.key)}>取消邀请</Button>:
            <Button className="tabOptBtn hoverRed" icon="delete" onClick={() => this.handleRemoveMember(record.key)}>移除</Button>
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
    const { teamName, teamID, currentRole, teamUserList, showInviteModal } = this.props
    let inviting = true //邀请中状态
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    
    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20 }}>
          <Link className="back" to="/account/team">返回</Link>
          <span className="title">
            { teamName }
          </span>
        </Row>
        {
          currentRole === 0 ?
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为普通成员您可退出团队。" />
              <Row className="memberOption">
                <Button icon='logout' className='quitTeamBtn' onClick={() => this.handleQuiteTeam(teamID)}>
                  退出团队
                </Button>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={false}/>
              </Card>
            </div>:
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为创建者您可管理团队、邀请新成员、解散团队、移除团队成员和跳转到“我的账户”。" />
              <Row className="memberOption">
                <Button icon='plus' className='quitTeamBtn' onClick={() => this.handleAddNewMember(teamID)}>
                  邀请新成员
                </Button>
                <InviteNewMemberModal
                  visible={ showInviteModal }
                  closeInviteModal={this.closeInviteModal}
                  teamID={teamID}
                />
                <Button icon='logout' className='delTeamBtn' onClick={() => this.handleDelTeam(teamID)}>
                  解散团队
                </Button>
                <Button icon='pay-circle-o' className='rechargeBtn' onClick={() => this.handleClickRecharge(teamID)}>
                  去充值
                </Button>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={teamUserList} onChange={this.handleTableChange} pagination={false}/>
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