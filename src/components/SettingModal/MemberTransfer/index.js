/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/9
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Transfer, } from 'antd'
import './style/MemberTransfer.less'
import { deleteTeam, createTeamspace, addTeamusers, removeTeamusers,
  loadTeamspaceList, loadTeamUserList, loadTeamClustersList } from '../../../actions/team'
import { loadUserList, createUser, deleteUser } from '../../../actions/user'
import { connect } from 'react-redux'

class MemberTransfer extends Component{
  constructor(props){
    super(props)
    this.state = {
    }
  }
  componentWillMount(){
    this.props.loadUserList({size:-1})
  }
  render(){
    const { onChange,targetKeys,userList,teamUserList } = this.props
    let teamUserIDList = []
    if(teamUserList.length !== 0){
      teamUserList.map((item,index) => {
        teamUserIDList.push(item.key)
      })
      if(userList.length !== 0){
        userList.filter(function (item) {
          return teamUserIDList.includes(item.key)
        })
      }
    }
    return (
      <div id='MemberTransfer'>
        <Row className="listTitle">
          <Col span={10}>成员名</Col>
          <Col span={14}>邮箱</Col>
        </Row>
        <Row className="listTitle" style={{left:393}}>
          <Col span={10}>成员名</Col>
          <Col span={14}>邮箱</Col>
        </Row>
        <Transfer
          dataSource={userList}
          showSearch
          listStyle={{
            width: 250,
            height: 300,
          }}
          operations={['添加', '移除']}
          targetKeys={targetKeys}
          onChange={onChange}
          titles={['筛选用户','已选择用户']}
          render={
            item => (
              <Row style={{display:'inline-block',width:'100%'}}>
                <Col span={10} style={{overflow:'hidden'}}>{item.title}</Col>
                <Col span={14} style={{overflow:'hidden'}}>{item.description}</Col>
              </Row>
            )
          }
        />
      </div>
    )
  }
}
function mapStateToProp(state,props) {
  console.log('state,,,',state);
  let teamUserList = []
  let userList = []
  console.log('state',state);
  const team = state.team
  const users = state.user.users
  if(team.teamusers){
    if(team.teamusers.result){
      const teamusers = team.teamusers.result.users
      teamusers.map((item,index) => {
        teamUserList.push(
          {
            key: item.userID,
            name: item.userName,
            tel: item.phone,
            email: item.email,
            style: item.role === 0?'普通成员':'系统管理员',
          }
        )
      })
    }
  }
  if(users){
    if(users.result){
      users.result.users.map((item,index) => {
        userList.push(
          {
            key: item.userID,
            title: item.userName,
            description: item.email
          }
        )
      })
    }
  }
  
  return {
    teamUserList: teamUserList,
    userList: userList,
  }
}
export default connect(mapStateToProp, {
  addTeamusers,
  loadUserList,
  removeTeamusers,
  loadTeamUserList,
})(MemberTransfer)