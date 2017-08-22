/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/8/11
 * @author ZhaoYanBei
 */
import React, { Component } from 'react'
import { Button, Input, Select } from 'antd'
import './style/SearchInput.less'
import { connect } from 'react-redux'
import { REG } from '../../../../constants'
import { GetRole, GetSearchList } from '../../../../actions/role'

const Option = Select.Option

class SearchInput extends React.Component{
  constructor(props){
    super(props)
    this.handleInt = this.handleInt.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSelect = this.handleSelect.bind(this)

    let { searchIntOption } = this.props
    const { defaultSearchValue } = searchIntOption
    this.state = {
      selecteValue: defaultSearchValue,
      searchValue: '',
    }
  }
  handleInt(e){
    let { searchIntOption } = this.props
    const { selecteValue } = this.state
    const { addBefore, defaultSearchValue } = searchIntOption
    let value = ''
    if(addBefore){
      //value = defaultValue ? defaultValue : addBefore[0].key
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
    if (selecteValue == "jsmt") {
      field = "name"
    } else if (selecteValue == "cjr") {
      field = "creator"
    }
    return field
  }
  handleSearch(){
    const { searchValue, selecteValue } = this.state
    let { scope, total, Search } = this.props
    const { searchResult, pageSize, sort } = scope.state
    let filter = this.getFilterField(selecteValue) + "," + searchValue
    this.props.GetSearchList({
      value: filter
    },{
      success: {
        func: res => {
          if(REG.test(res.data.code)){
            Search(res.data.data)
          }
        }
      }
    })
  }
  handleSelect(value){
    this.setState({
      selecteValue:value,
    })
  }
  render(){
    let { searchIntOption, total} = this.props
    let {searchValue} = this.state
    if(!searchIntOption){
      searchIntOption = {
        placeholder: '请输入关键词搜索',
      }
    }
    const defaultStyle = {
      width: 200,
      float: 'right'
    }
    const { addBefore, placeholder} = searchIntOption
    if(addBefore){
      let selectBefore = (
        <Select className="Searchcategory" defaultValue={addBefore[0].key}
          style={{ width: 80}}
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
        <div id='SearchInput' style={{width:280}}>
          <div className='littleLeft'>
            <i className='fa fa-search' onClick={this.handleSearch}/>
          </div>
          <div className='littleRight'>
            <Input
              addonBefore={selectBefore}
              size='large'
              onChange={this.handleInt}
              placeholder={placeholder?placeholder:"请输入关键词搜索"}
              onPressEnter={this.handleSearch}
              value={searchValue}
            />
          </div>
        </div>
      )
    } else {
      return (
        <div id='SearchInput'>
          <div className='littleLeft'>
            <i className='fa fa-search' onClick={this.handleSearch}/>
          </div>
          <div className='littleRight'>
            <Input
              size='large'
              onChange={this.handleInt}
              placeholder={placeholder?placeholder:"请输入关键词搜索"}
              onPressEnter={this.handleSearch}
              style={{paddingRight: '28px'}}
            />
          </div>
        </div>
      )
    }
  }
}

function mapStateToProp(state) {
  let total = 0
  const users = state.user.users
  if (users.result) {
    if (users.result.total) {
      total = users.result.total
    }
  }

  return {
    total
  }
}

export default connect(mapStateToProp, {
  GetRole,
  GetSearchList
})(SearchInput)