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
  //table列配置
  getColumns (role,state) {
    console.log(role);
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter} = this.state
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
          width: '25%',
          render: (text, record, index) => (
            <div>{text}</div>
          )
        },
        {
          title: '手机',
          dataIndex: 'tel',
          key: 'tel',
          width: '25%'
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          width: '25%'
        },
        {
          title: '角色',
          dataIndex: 'role',
          key: 'role',
          width: '25%'
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
          <div>{text}</div>
        )
      },
      {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
        width: '20%'
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
          state ?
            <Button className="tabOptBtn hoverRed" icon="cross" onClick={() => this.handleCancelInvite(record.key)}>取消邀请</Button>:
            <Button className="tabOptBtn hoverRed" icon="delete" onClick={() => this.handleRemoveMember(record.key)}>移除</Button>
        )
      },
    ]
  }
  componentWillMount() {
    
  }
  
  render() {
    const scope = this
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter} = this.state
    const { teamName, teamID, currentRole } = this.props
    //邀请中状态
    let inviting = true
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
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={data} onChange={this.handleTableChange} pagination={pagination}/>
              </Card>
            </div>:
            <div>
              <Alert message="这里展示了该团队的团队成员信息，作为创建者您可管理团队、邀请新成员、解散团队、移除团队成员和跳转到“我的账户”。" />
              <Row className="memberOption">
                <Button icon='logout' className='quitTeamBtn' onClick={() => this.handleQuiteTeam(teamID)}>
                  退出团队
                </Button>
                <Button icon='pay-circle-o' className='rechargeBtn' onClick={() => this.handleClickRecharge(teamID)}>
                  去充值
                </Button>
              </Row>
              <Card className="content">
                <Table columns={this.getColumns(currentRole,inviting)} dataSource={data} onChange={this.handleTableChange} pagination={false}/>
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
  return {
    teamName: team_name,
    teamID: team_id,
    currentRole,
  }
}
export default connect(mapStateToProp, {
  
})(TeamDetail)