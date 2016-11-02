/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React,{ Component } from 'react'
import './style/MemberManage.less'
import { Row, Col, Button, Input, Select, Card, Icon } from 'antd'

const Option = Select.Option

const data = [
  {name: 'a',tel: '11',email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: 5,},
  {name: 'b',tel: '22',email: 'emailb@tenxcloud.com',style: '普通成员',team: '2',rest: 5,},
  {name: 'c',tel: '33',email: 'emailc@tenxcloud.com',style: '普通成员',team: '3',rest: 5,},
  {name: 'd',tel: '44',email: 'emaild@tenxcloud.com',style: '普通成员',team: '4',rest: 5,},
  {name: 'e',tel: '55',email: 'emaile@tenxcloud.com',style: '普通成员',team: '5',rest: 5,},
  {name: 'f',tel: '66',email: 'emailf@tenxcloud.com',style: '普通成员',team: '6',rest: 5,},
  {name: 'g',tel: '77',email: 'emailg@tenxcloud.com',style: '团队管理员',team: '7',rest: 5,},
  {name: 'h',tel: '88',email: 'emailh@tenxcloud.com',style: '团队管理员',team: '8',rest: 5,},
]

let MemberTitle = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    return (
      <Row className="memberTitle">
        <Col span={3}>
          <div style={{display:'inline-block',paddingRight: 6,float: 'left'}}>
            成员名
          </div>
          <div className="sortIcon">
            <Icon type="caret-up" />
            <Icon type="caret-down" />
          </div>
        </Col>
        <Col span={3}>手机</Col>
        <Col span={4}>邮箱</Col>
        <Col span={3}>
          类型
          <Icon type="filter" />
        </Col>
        <Col span={3}>团队</Col>
        <Col span={3}>余额</Col>
        <Col span={5}>操作</Col>
      </Row>
    )
  }
})

let MemberItem = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    const { data, searchResult, selecteValue, searchValue, scope } = this.props
    console.log('searchResult',searchResult);
    let memberData = []
    if(searchValue === ''){
      memberData = data
    }
    if(searchResult.length === 0){
      return (
        <div>没有找到</div>
      )
    } else {
      console.log('render memberData');
      data.map((item,index) => {
        if(searchResult.includes(item[`${selecteValue}`])){
          console.log('item',item);
          memberData.push(item)
        }
        
      })
    }
    console.log('memberData last !',memberData);
    const memberItems = memberData.map((item,index) => {
      return (
        <Row className="memberItem">
          <Col span={3}>{item.name}</Col>
          <Col span={3}>{item.tel}</Col>
          <Col span={4}>{item.email}</Col>
          <Col span={3}>{item.style}</Col>
          <Col span={3}>{item.team}</Col>
          <Col span={3}>{item.rest}T币</Col>
          <Col span={5}>
            <Button icon="setting" className="setBtn">管理</Button>
            <Button icon="delete" className="delBtn">删除</Button>
          </Col>
        </Row>
      )
    })
    return(
      <div>
        { memberItems }
      </div>
    )
  }
})

export default class MemberManage extends Component {
  constructor(props){
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleInt = this.handleInt.bind(this)
    this.state = {
      selecteData: [],
      selecteValue: '',
      searchValue: '',
      searchResult: [],
    }
  }
  handleInt(e){
    const { selecteValue } = this.state
    let value = e.target.value
    if(selecteValue === ''){
      const selecteData = []
      data.map((item,index) => {
        selecteData.push(item['name'])
      })
      this.setState({
        selecteData: selecteData
      })
    }
    this.setState({
      searchValue: value
    })
  }
  handleSearch(){
    const { selecteData, searchValue, } = this.state
    if(selecteData.length === 0){
      return
    } else {
      console.log('selecteData',selecteData);
      const result = []
      selecteData.map((item,index) => {
        let flag = item.indexOf(searchValue)
        if(flag >= 0){
          result.push(item)
        }
      })
      this.setState({
        searchResult: result
      })
    }
  }
  handleSelect(value){
    console.log('value',value);
    const selecteData = []
    data.map((item,index) => {
      console.log('item',item[`${value}`]);
      selecteData.push(item[`${value}`])
    })
    this.setState({
      selecteValue:value,
      selecteData: selecteData
    })
  }
  componentWillMount(){
    this.setState({
      data: data,
      selecteData: [],
      searchResult: data,
    })
  }
  render(){
    const { data, selecteData, searchResult, selecteValue, searchValue } = this.state
    const scope = this
    const selectBefore = (
      <Select defaultValue="name" style={{ width: 80 }} onChange={this.handleSelect}>
        <Option value="name">用户名</Option>
        <Option value="team">团队</Option>
        <Option value="tel">手机号</Option>
        <Option value="email">邮箱</Option>
      </Select>
    )
    return (
      <div id="MemberManage">
        <Row>
          <Button type="primary" size="large">
            <i className="fa fa-plus"/>
            添加新成员
          </Button>
          <div className="ant-search-input-wrapper search">
            <Input addonBefore={selectBefore}
                   placeholder="请输入关键词搜索"
                   onChange={this.handleInt}
                   onPressEnter={this.handleSearch}/>
            <div className="ant-input-group-wrap">
              <Button icon="search"
                      className='ant-search-btn searchBtn'
                      onClick={this.handleSearch} />
            </div>
          </div>
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTitle />
            <MemberItem data={ data }
                        scope={scope}
                        searchResult={searchResult}
                        selecteValue={selecteValue}
                        searchValue={searchValue}/>
          </Card>
        </Row>
      </div>
    )
  }
}