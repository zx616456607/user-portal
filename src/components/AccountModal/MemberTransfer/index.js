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
import { Row, Col, Transfer,Checkbox, Cascader, Form } from 'antd'
import './style/MemberTransfer.less'
import { addTeamusers, removeTeamusers } from '../../../actions/team'
import { loadUserList } from '../../../actions/user'
import { connect } from 'react-redux'
const FormItem = Form.Item;

class MemberTransfer extends Component{
  constructor(props){
    super(props)
    this.filterOption = this.filterOption.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.state = {
      projectList: []
    }
  }
  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  }
  componentWillMount(){
    const { loadUserList } = this.props;
    loadUserList({size: 0})
    ListProjects({},{
      success:{
        func: (result)=>{
          if (result.statusCode === 200) {
            this.setState({projectList:result.data})
          }
        },
        isAsync:true
      }
    })
  }
  renderItem(item){
    return(
      <Row key={`${item && item.key}`} style={{display:'inline-block',width:'100%'}}>
        <Col span={9} style={{overflow:'hidden',whiteSpace: "nowrap",textOverflow: 'ellipsis'}}>{item && item.title}</Col>
        <Col span={12} style={{overflow:'hidden',whiteSpace: "nowrap",textOverflow: 'ellipsis'}}>{item && item.description}</Col>
      </Row>
    )
  }
  selectedChange(value,option) {
  }
  render(){
    const { onChange, targetKeys, userList } = this.props
    const { getFieldProps } = this.props.form;
    const areaData = [{
      value: 'shanghai',
      label: '上海',
      children: [{
        value: 'shanghaishi',
        label: '上海市'
      }],
    }];
    return (
      <div id='MemberTransfer'>
        <Row className="listTitle">
          <Col span={14}>成员名</Col>
          <Col span={10}>邮箱</Col>
        </Row>
        <Row className="listTitle" style={{left:375}}>
          <Col span={14}>成员名</Col>
          <Col span={10}>邮箱</Col>
        </Row>
        {
          userList.length > 0 &&
          <Transfer
            dataSource={userList}
            showSearch
            filterOption={this.filterOption.bind(this)}
            listStyle={{
              width: 250,
              height: 300,
            }}
            operations={['添加', '移除']}
            targetKeys={targetKeys}
            onChange={onChange}
            titles={['筛选用户','已选择用户']}
            rowKey={item => item && item.key}
            render={this.renderItem.bind(this)}
          />
        }
        <div className="addMemberToProject hidden">
          <Form className="addMemberForm">
            <FormItem
              className="isAdd"
            >
              <Checkbox className="ant-checkbox-vertical">选择添加的成员可能参与的项目</Checkbox>
              <div className="isAddHint">此处可批量添加到项目中并授予在项目中的角色，也可后续添加到其他项</div>
            </FormItem>
            <FormItem
              className="chooseProject"
              label="选择项目及项目中的角色"
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
            >
              <Cascader
                style={{ width: 200 }}
                options={areaData}
                {...getFieldProps('area')}
                placeholder="选择项目及角色"
                onChange={(value,option)=>this.selectedChange(value,option)}
              />
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  let userList = []
  const users = state.user.users
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
    userList: userList
  }
}
export default connect(mapStateToProp, {
  addTeamusers,
  loadUserList,
  removeTeamusers,
})(Form.create()(MemberTransfer))