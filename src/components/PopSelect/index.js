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
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.state = {
      selectValue: '',
      focus: false,
      list: [],
      visible: props.spacesVisible,
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
      item.index = item.name.indexOf(value)
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
      selectValue: item.name,
    })
    const { onChange } = this.props
    if (onChange) {
      onChange(item)
    }
  }
  componentWillMount() {
    const { selectValue, list } = this.props
    this.setState({
      list,
      selectValue
    })
  }
  componentWillReceiveProps(nextProps) {
    const { visible, list, selectValue } = nextProps
    this.setState({
      visible,
      list,
      selectValue: (selectValue ? selectValue : this.state.selectValue)
    })
  }
  handleVisibleChange(visible) {
    this.setState({ visible })
  }
  render() {
    const { title, btnStyle, loading } = this.props
    const { selectValue } = this.state
    const text = <span className="PopSelectTitle">{title}</span>
    let searchList = (
      this.state.list.length === 0 ?
        <div>无匹配结果</div>
        :
        this.state.list.map((item) => {
          return (
            <li
              key={item.name}
              className="searchItem"
              onClick={() => this.setValue(item)}>
              {item.name}
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
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <div className="PopSelect">
        <Popover
          placement="bottomLeft"
          title={text}
          content={content}
          trigger="click"
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          getTooltipContainer={() => document.getElementsByClassName('PopSelect')[0]}>
          {
            btnStyle ?
              <Button className='popBtn'>
                <i className="fa fa-sitemap icon" />
                {selectValue}
                <Icon type="down" className={rotate} />
              </Button> :
              <a className="ant-dropdown-link lineBtn" href="#">
                {selectValue}
                <Icon type="down" className={rotate} />
              </a>
          }
        </Popover>
      </div>
    )
  }
}