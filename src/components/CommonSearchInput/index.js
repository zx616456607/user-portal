/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  searchInput
 *
 * v0.1 - 2017/6/28
 * @author zhangxuan
 */


import React, { Component } from 'react'
import { Input, Select, } from 'antd'
const Option = Select.Option;
import './style/commonSearchInput.less'
export default class CommonSearchInput extends Component{
  constructor(props) {
    super(props)
    this.state={
      value: '',
      focus: false,
      currentOption: ''
    }
  }
  componentWillMount() {
    const { selectProps } = this.props;
    if (!selectProps) return
    if (selectProps.defaultValue) {
      this.setState({
        currentOption: selectProps.defaultValue
      })
    } else if (selectProps.selectOptions){
      this.setState({
        currentOption: selectProps.selectOptions[0].key
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { modalStatus, selectProps, clearInput, value } = nextProps;
    if (!modalStatus && this.props.modalStatus && selectProps) {
      if (selectProps.defaultValue) {
        this.setState({
          currentOption: selectProps.defaultValue
        })
      } else if (selectProps.selectOptions){
        this.setState({
          currentOption: selectProps.selectOptions[0].key
        })
      }
    }
    if (clearInput) {
      this.setState({
        value: ''
      })
    }
    if (value !== this.props.value) {
      this.setState({value})
    }
  }
  handleInputChange(e) {
    const { onChange } = this.props;
    this.setState({
      value: e.target.value,
    });
    if (onChange) {
      onChange(e.target.value)
    }
  }
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }
  handleSearch() {
    if (this.props.onSearch) {
      this.props.onSearch(this.state.value);
    }
  }
  selectChange(value) {
    const { getOption } = this.props;
    if (getOption) {
      getOption(value)
    }
    this.setState({
      currentOption: value
    })
  }
  render() {
    const { size, placeholder, selectProps, style } = this.props;
    const selectBefore = (
      <Select defaultValue={selectProps && selectProps.defaultValue} value={this.state.currentOption}
              style={{ width: selectProps && selectProps.selectWidth ? selectProps.selectWidth : '80px' }}
              onChange={this.selectChange.bind(this)}
      >
        {
          selectProps && selectProps.selectOptions.map(item => {
            return <Option key={item.key} value={item.key}>{item.value}</Option>
          })
        }
      </Select>
    );
    return (
      <div className="ant-search-input-wrapper commonSearchInputWrapper" style={style}>
        <Input placeholder={placeholder} size={size} value={this.state.value} onChange={this.handleInputChange.bind(this)}
               onFocus={this.handleFocusBlur.bind(this)} onBlur={this.handleFocusBlur.bind(this)} onPressEnter={this.handleSearch.bind(this)}
               addonBefore={selectProps ? selectBefore : null}
        />
        <i className='fa fa-search searchIcon verticalCenter pointer' onClick={this.handleSearch.bind(this)}/>
      </div>
    );
  }
}