/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/3
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Input, Select, } from 'antd'
import './style/SearchInput.less'
import { connect } from 'react-redux'
import { loadUserList } from '../../actions/user'

const Option = Select.Option

class SearchInput extends Component{
  constructor(props){
    super(props)
    this.handleInt = this.handleInt.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.state = {
      selecteValue: '',
      searchValue: '',
    }
  }
  handleInt(e){
    let { searchIntOption } = this.props
    const { selecteValue } = this.state
    const { addBefore, defaultValue,defaultSearchValue } = searchIntOption
    let value = ''
    if(addBefore){
      value = defaultValue ? defaultValue : addBefore[0].key
    } else {
      value = defaultSearchValue
    }
    if(selecteValue === ''){
      this.setState({
        selecteValue: value,
      })
    }
    this.setState({
      searchValue: e.target.value
    })
  }
  getFilterField(selecteValue) {
    let field = selecteValue
    if (selecteValue == "name") {
      field = "userName"
    } else if (selecteValue == "tel") {
      field = "phone"
    }
    return field
  }
  handleSearch(){
    const { searchValue, selecteValue } = this.state
    let { scope } = this.props
    const { searchResult, pageSize, sort } = scope.state
    let filter = this.getFilterField(selecteValue) + "," + searchValue
    this.props.loadUserList({
      pageSize,
      page: 1,
      sort,
      filter,
    },{
      success:{
        func: () => {
          console.log('search !!');
          scope.setState({
            page: 1,
            filter,
          })
        },
        isAsync:true
      }
    })
  }
  handleSelect(value){
    this.setState({
      selecteValue:value,
    })
  }
  render(){
    let { searchIntOption, } = this.props
    
    if(!searchIntOption){
      searchIntOption = {
        placeholder: '请输入关键词搜索',
      }
    }
    const { addBefore, defaultValue, placeholder, width, position, } = searchIntOption
    if(addBefore){
      let selectBefore = (
        <Select defaultValue={defaultValue ? defaultValue : addBefore[0].key}
                style={{ width: 80 }}
                onChange={this.handleSelect}>
          {
            addBefore.map((item,index) => {
              return (
                <Option value={item.key}>{item.value}</Option>
              )
            })
          }
        </Select>)
      return (
        <div id='SearchInput' style={{width: `${width?width:'280px'}`,float: `${position?position:'right'}`}}>
          <div className="ant-search-input-wrapper search">
            <Input addonBefore={selectBefore}
                   placeholder={placeholder?placeholder:"请输入关键词搜索"}
                   onChange={this.handleInt}
                   onPressEnter={this.handleSearch}/>
            <div className="ant-input-group-wrap">
              <Button icon="search"
                      className='ant-search-btn searchBtn'
                      onClick={this.handleSearch} />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div id='SearchInput' style={{width: `${width?width:'200px'}`,float: `${position?position:'right'}`}}>
          <div className="ant-search-input-wrapper search">
            <Input placeholder={placeholder?placeholder:"请输入关键词搜索"}
                   onChange={this.handleInt}
                   onPressEnter={this.handleSearch}/>
            <div className="ant-input-group-wrap">
              <Button icon="search"
                      className='ant-search-btn searchBtn'
                      onClick={this.handleSearch} />
            </div>
          </div>
        </div>
      )
    }
  }
}

function mapStateToProp(state) {
  return {
    
  }
}

export default connect(mapStateToProp, {
  loadUserList,
})(SearchInput)