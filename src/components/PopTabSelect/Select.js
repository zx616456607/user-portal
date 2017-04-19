/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Tab select
 *
 * v0.1 - 2017-04-18
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Input, Button, Popover, Menu, Tabs } from 'antd'
import classNames from 'classnames'
import { genRandomString } from '../../common/tools'
import './style/Select.less'

const InputGroup = Input.Group
const MenuItem = Menu.Item
const MenuGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

export default class PopTabSelect extends Component {
  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.node,
    onChange: PropTypes.func,
    notFoundContent: PropTypes.string,
  }

  static defaultProps = {
    notFoundContent: '无记录',
  }

  constructor(props) {
    super()
    this.state = {
      visible: false,
      inputValue: '',
      selectValue: '',
    }
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.filterOption = this.filterOption.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this.renderOptionsFromChildren = this.renderOptionsFromChildren.bind(this)
  }

  handleVisibleChange(visible) {
    this.setState({ visible })
  }

  handleSearch(e) {
    this.setState({
      inputValue: e.target.value,
    })
  }

  filterOption(value) {
    return value.indexOf(this.state.inputValue) > -1
  }

  getLableFromChild(child) {
    const props = child.props
    if (typeof props.children === 'string') {
      return props.children
    }
    return props.label
  }

  handleSelect(obj, tabKey) {
    const { onChange } = this.props
    const { key, item } = obj
    let label = this.getLableFromChild(item)
    let groupKey = item.props.groupKey
    if (!label) {
      label = key
    }
    onChange && onChange(key, tabKey, groupKey)
    this.setState({
      selectValue: label,
      visible: false,
    })
  }

  renderOptions() {
    return this.renderOptionsFromChildren(this.props.children, true)
  }

  renderOptionsFromChildren(children, showNotFound, groupKey) {
    const _options = []
    if (!children) {
      return _options
    }
    React.Children.forEach(children, (child) => {
      if (child.type.isTab) {
        this.isTab = true
        const innerMenus = this.renderOptionsFromChildren(child.props.children, true)
        let title = child.props.title
        let key = child.key
        if (!key && typeof title === 'string') {
          key = title
        } else if (!title && key) {
          title = key
        }
        _options.push(
          <TabPane key={key} tab={title}>
            <Menu onClick={(obj) => this.handleSelect(obj, key)}>{innerMenus}</Menu>
          </TabPane>
        )
        return
      }
      if (child.type.isSelectOptionGroup) {
        this.isSelectOptionGroup = true
        let label = child.props.label
        let key = child.key
        if (!key && typeof label === 'string') {
          key = label
        } else if (!label && key) {
          label = key
        }
        const innerItems = this.renderOptionsFromChildren(child.props.children, true, key)
        if (innerItems.length) {
          _options.push(
            <MenuGroup key={key} title={label}>
              {innerItems}
            </MenuGroup>
          )
        }
        return
      }
      let childValue = child.props.value
      let childLabel = child.props.label
      if (typeof child.props.children === 'string') {
        childLabel = child.props.children
      }

      if (this.filterOption(childValue)) {
        _options.push(
          <MenuItem key={childValue || childLabel} groupKey={groupKey} {...child.props}>
            {childLabel || childValue}
          </MenuItem>
        )
      }
    })
    if (!_options.length && showNotFound) {
      return (
        <MenuItem key="NOT_FOUND" value="NOT_FOUND" disabled={true}>
          {this.props.notFoundContent}
        </MenuItem>
      )
    }
    return _options
  }

  render() {
    const {
      value,
      placeholder,
      options,
    } = this.props
    const {
      visible,
      selectValue,
    } = this.state
    const classArrow = classNames({
      'ant-cascader-picker-arrow': true,
      'ant-cascader-picker-arrow-expand': visible,
      'anticon': true,
      'anticon-down': true,
    })
    const _options = this.renderOptions() || options
    const content = (
      <div className="popTabSelectContent">
        <div className="search">
          <InputGroup className="ant-search-input">
            <Input onPressEnter={this.handleSearch} onChange={this.handleSearch} />
            <div className="ant-input-group-wrap">
              <Button icon="search" className="ant-search-btn" />
            </div>
          </InputGroup>
        </div>
        <div className="options">
        {
          this.isTab
          ? <Tabs>{_options}</Tabs>
          : <Menu onClick={this.handleSelect}>{_options}</Menu>
        }
        </div>
      </div>
    )
    const popSelectId = `popTabSelect-${genRandomString(6)}`
    return (
      <div className="popTabSelect" id={popSelectId}>
        <Popover
          content={content}
          trigger="click"
          overlayClassName="popTabSelectCard"
          placement="bottomLeft"
          getTooltipContainer={() => document.getElementById(popSelectId)}
          visible={visible} onVisibleChange={this.handleVisibleChange}
        >
          <span className="ant-cascader-picker">
            <span className="ant-input-wrapper">
              <input type="text" className="ant-input ant-cascader-input"
                readonly placeholder={placeholder}
                style={{marginTop: '0px'}}
              />
            </span>
            {/*<span className="ant-cascader-picker-label">{value || selectValue}</span>*/}
            <span className="ant-cascader-picker-label">{selectValue || value}</span>
            <i className={classArrow}></i>
          </span>
        </Popover>
      </div>
    )
  }
}