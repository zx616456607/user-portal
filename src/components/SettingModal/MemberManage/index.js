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
import { Row, Col, Button, Input, Select, Card, Icon, Table } from 'antd'

const Option = Select.Option

const data = [
  {key: '1',name: 'a',tel: 11,email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: 5,},
  {key: '2',name: 'ba',tel: 12,email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: 5,},
  {key: '3',name: 'caa',tel: 13,email: 'emaila@tenxcloud.com',style: '普通成员',team: '1',rest: 5,},
  {key: '4',name: 'daaa',tel: 14,email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: 5,},
  {key: '5',name: 'eaaaa',tel: 15,email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: 5,},
  {key: '6',name: 'f',tel: 16,email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: 5,},
  {key: '7',name: 'g',tel: 17,email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: 5,},
  {key: '8',name: 'h',tel: 18,email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: 5,},
  ];

let MemberTable =  React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
    };
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  },
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: '成员名',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      },
      {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '类型',
        dataIndex: 'style',
        key: 'style',
        filters: [
          { text: '团队管理员', value: '团队管理员' },
          { text: '普通成员', value: '普通成员' },
        ],
        filteredValue: filteredInfo.style,
        onFilter: (value, record) => record.style.indexOf(value) === 0,
      },
      {
        title: '团队',
        dataIndex: 'team',
        key: 'team',
      },
      {
        title: '余额',
        dataIndex: 'rest',
        key: 'rest',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => (
          <div>
            <Button icon="setting" className="setBtn">管理</Button>
            <Button icon="delete" className="delBtn">删除</Button>
          </div>
        ),
      },]
    if(notFound){
      return (
        <div>没有结果</div>
      )
    } else {
      return (
              <Table columns={columns}
                     dataSource={searchResult.length === 0?data : searchResult}
                     onChange={this.handleChange} />
      )
    }
  },
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
      notFound: false,
    }
  }
  handleInt(e){
    const { selecteValue } = this.state
    let value = e.target.value
    this.setState({
      searchValue: value
    })
  }
  handleSearch(){
    const { selecteData, searchValue, selecteValue } = this.state
    if(selecteData.length === 0){
      return
    } else {
      console.log('selecteData',selecteData);
      let result = []
      let searchResult= []
      selecteData.map((item,index) => {
        let flag = item.indexOf(searchValue)
        if(flag >= 0){
          result.push(item)
        }
        if(result.length === 0){
          this.setState({
            notFound: true
          })
        } else {
          this.setState({
            notFound: false
          })
        }
      })
      data.map((item) => {
        if(result.includes(item[`${selecteValue}`])){
          searchResult.push(item)
        }
      })
      this.setState({
        searchResult: searchResult
      })
    }
  }
  handleSelect(value){
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
            <MemberTable scope={scope}/>
          </Card>
        </Row>
      </div>
    )
  }
}