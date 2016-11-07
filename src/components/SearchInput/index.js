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

const Option = Select.Option

export default class SearchInput extends Component{
  constructor(props){
    super(props)
    this.handleInt = this.handleInt.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.state = {
      selecteData: [],
      selecteValue: '',
      searchValue: '',
    }
  }
  handleInt(e){
    let { data, searchIntOption } = this.props

    const { selecteValue } = this.state
    const { addBefore, defaultValue,defaultSearchValue } = searchIntOption
    let value = ''
    if(addBefore){
      value = defaultValue ? defaultValue : addBefore[0].key
    } else {
      value = defaultSearchValue
    }
      if(selecteValue === ''){
        const selecteData = []
        data.map((item,index) => {
          selecteData.push(item[`${value}`])
        })
        this.setState({
          selecteValue: value,
          selecteData: selecteData
        })
      }
    this.setState({
      searchValue: e.target.value
    })
  }
  handleSearch(){
    const { selecteData, searchValue, selecteValue } = this.state
    let { data, scope } = this.props

    if(selecteData.length === 0){
      return
    } else {
      let result = []
      let searchResult= []
      selecteData.map((item,index) => {
        let flag = item.indexOf(searchValue)
        if(flag >= 0){
          result.push(item)
        }
        if(result.length === 0){
          scope.setState({
            notFound: true
          })
        } else {
          scope.setState({
            notFound: false
          })
        }
      })
      data.map((item) => {
        if(result.includes(item[`${selecteValue}`])){
          searchResult.push(item)
        }
      })
      scope.setState({
        searchResult: searchResult
      })
    }
  }
  handleSelect(value){
    const { data } = this.props

    const selecteData = []
    data.map((item,index) => {
      selecteData.push(item[`${value}`])
    })
    this.setState({
      selecteValue:value,
      selecteData: selecteData
    })
  }
  render(){
    let { searchIntOption } = this.props
    
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