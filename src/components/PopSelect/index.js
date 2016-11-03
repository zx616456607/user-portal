/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, Spin } from 'antd'
import './style/PopSelect.less'
import classNames from 'classnames'

export default class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.setValue = this.setValue.bind(this)
    this.state = {
      spaceVisible: false,
      selectValue: '',
      focus: false,
      list: [],
    }
  }
  handleSearch(e) {
    let value = e.target.value
    const { list } = this.state
    if (!this.props.list) {
      this.setState({
        list: cpList
      })
    }
    let cpList = this.props.list.filter(item => {
      item.index = item.spaceName.indexOf(value)
      if (item.index > -1) {
        return item
      }
    })
    const sortList = function (a, b) {
      return a.index - b.index
    }
    cpList.sort(sortList)
    this.setState({
      list: cpList
    })
  }
  setValue(item) {
    this.setState({
      selectValue: item.spaceName,
    })
    this.props.onChange(item)
  }
  componentWillMount() {
    const { selectValue, list } = this.props
    this.setState({
      list,
      selectValue
    })
  }
  componentWillReceiveProps(nextProps) {
    const { selectValue, list } = nextProps
    this.setState({
      list
    })
  }
  render() {
    const { btnStyle, loading } = this.props
    const { selectValue } = this.state
    const text = <span className="PopSelectTitle">选择项目空间</span>
    let searchList = (
      this.state.list.length === 0 ?
        <div>无匹配结果</div>
        :
        this.state.list.map((item) => {
          return (
            <li
              key={item.spaceName}
              className="searchItem"
              onClick={() => this.setValue(item)}>
              {item.spaceName}
            </li>
          )
        })
    )
    if (loading) {
      searchList = <Spin />
    }
    const content = (
      <div className="PopSelectContent">
        <div className="ant-search-input-wrapper searchInt">
          <div>
            用户空间
          </div>
          <Input.Group className='ant-search-input'>
            <Input placeholder='查询' onChange={this.handleSearch} />
            <div className="ant-input-group-wrap">
              <Button className='ant-search-btn'>
                <Icon type="search" />
              </Button>
            </div>
          </Input.Group>
        </div>
        <div>
          <ul className="searchList">
            {searchList}
          </ul>
        </div>
      </div>
    )
    return (
      <div className="PopSelect">
        <Popover placement="bottomLeft" title={text} content={content} trigger="click"
          getTooltipContainer={() => document.getElementsByClassName('PopSelect')[0]}>
          {
            btnStyle ?
              <Button className='popBtn'>
                <i className="fa fa-sitemap" style={{ float: 'left', marginTop: '3px' }} />
                {selectValue}
                <Icon type="down" />
              </Button> :
              <a className="ant-dropdown-link lineBtn" href="#">
                {selectValue}
                <Icon type="down" />
              </a>
          }
        </Popover>
      </div>
    )
  }
}