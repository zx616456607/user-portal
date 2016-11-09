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
      mockData: [],
    }
  }
  getMock() {
    const { teamUserList, userList} = this.props
    console.log('userList',userList);
    userList.filter(function (item) {
      return teamUserList.includes(item)
    })
    console.log('userListuserList',userList);
    this.setState({
      mockData:userList,
    })
  }
  
  componentWillMount(){
    this.props.loadUserList({size:0})
  }
  componentDidMount(){
    this.getMock()
  }
  render(){
    const { onChange,targetKeys } = this.props
    return (
      <div id='MemberTransfer'>
        <Row className="listTitle">
          <Col span={10}>成员名</Col>
          <Col span={12}>所属团队</Col>
        </Row>
        <Row className="listTitle" style={{left:393}}>
          <Col span={10}>成员名</Col>
          <Col span={12}>所属团队</Col>
        </Row>
        <Transfer
          dataSource={this.state.mockData}
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
    team.teamusers.map((item,index) => {
      teamUserList.push(
        {
          key: index,
          title: '',
          description: '',
          name: 'pupumeng',
          tel: '11111111',
          email: '123@123.com',
          style: '创业者',
        }
      )
    })
  }
  if(users){
    if(users.result){
      users.result.users.map((item,index) => {
        userList.push(
          {
            key: item.userID,
            title: item.userID,
            description: item.userID
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