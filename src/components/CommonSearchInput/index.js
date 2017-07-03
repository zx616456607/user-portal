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
import { Button, Input, Select, } from 'antd'
import classNames from 'classnames'
const InputGroup = Input.Group;
import './style/commonSearchInput.less'
export default class CommonSearchInput extends Component{
  constructor(props) {
    super(props)
    this.state={
      value: '',
      focus: false,
    }
  }
  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }
  handleSearch() {
    if (this.props.onSearch) {
      this.props.onSearch(this.state.value);
      this.setState({value:''})
    }
  }
  render() {
    const { size, placeholder } = this.props;
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    return (
      <div className="ant-search-input-wrapper commonSearchInputWrapper">
        <InputGroup className={searchCls}>
          <Input placeholder={placeholder} size={size} value={this.state.value} onChange={this.handleInputChange.bind(this)}
                 onFocus={this.handleFocusBlur.bind(this)} onBlur={this.handleFocusBlur.bind(this)} onPressEnter={this.handleSearch.bind(this)}
          />
          <div className="ant-input-group-wrap">
            <Button icon="search" className={btnCls} size={size} onClick={this.handleSearch.bind(this)} />
          </div>
        </InputGroup>
      </div>
    );
  }
}