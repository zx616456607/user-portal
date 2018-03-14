/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  searchInput
 *
 * v0.1 - 2018/3/9
 * @author zhangxuan
 */

import React, { Component } from 'react';
import { Input, Select } from 'antd';
import * as PropTypes from 'prop-types';
const Option = Select.Option;
import './style/index.less';

interface IProps {
  value: string;
  placeholder: string;
  size?: string; // one of ['large', 'default', 'small']
  style?: object;
  onChange?(value: string);
  onSearch(value: string);
}

export default class CommonSearchInput extends Component<IProps> {

  handleInputChange = e => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.target.value);
    }
  }

  handleFocusBlur = e => {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }

  handleSearch = () => {
    const { value, onSearch } = this.props;
    if (onSearch) {
      onSearch(value);
    }
  }

  render() {
    const { size, placeholder, style, value } = this.props;
    return (
      <div className="ant-search-input-wrapper commonSearchInputWrapper" style={style}>
        <Input
          placeholder={placeholder}
          size={size}
          value={value}
          onChange={this.handleInputChange}
          onFocus={this.handleFocusBlur}
          onBlur={this.handleFocusBlur}
          onPressEnter={this.handleSearch}
        />
        <i className="fa fa-search searchIcon verticalCenter pointer" onClick={this.handleSearch}/>
      </div>
    );
  }
}
