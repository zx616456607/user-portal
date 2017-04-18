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
  }

  static defaultProps = {
    //
  }

  constructor(props) {
    super()
    this.state = {
      visible: false,
    }
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this.renderOptionsFromChildren = this.renderOptionsFromChildren.bind(this)
  }

  handleVisibleChange(visible) {
    this.setState({ visible })
  }

  handleSearch() {
    //
  }

  renderOptions() {
    return this.renderOptionsFromChildren(this.props.children)
  }

  renderOptionsFromChildren(children, showNotFound) {
    const _options = []
    if (!children) {
      return _options
    }
    React.Children.forEach(children, (child) => {
      if (child.type.isTab) {
        this.isTab = true
        const innerMenus = this.renderOptionsFromChildren(child.props.children, false)
        if (innerMenus.length) {
          let title = child.props.title
          let key = child.key
          if (!key && typeof title === 'string') {
            key = title
          } else if (!title && key) {
            title = key
          }
          _options.push(
            <TabPane key={key} tab={title}>
              <Menu>{innerMenus}</Menu>
            </TabPane>
          )
        }
        return
      }
      if (child.type.isSelectOptionGroup) {
        const innerItems = this.renderOptionsFromChildren(child.props.children, false)
        if (innerItems.length) {
          let label = child.props.label
          let key = child.key
          if (!key && typeof label === 'string') {
            key = label
          } else if (!label && key) {
            label = key
          }
          _options.push(<MenuGroup key={key} title={label}>
            {innerItems}
          </MenuGroup>)
        }
        return
      }
      const childValue = child.props.value
      _options.push(
        <MenuItem key={childValue} {...child.props}>
          {childValue}
        </MenuItem>
      )
    })
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
    } = this.state
    const classArrow = classNames({
      'ant-cascader-picker-arrow': true,
      'ant-cascader-picker-arrow-expand': visible,
      'anticon': true,
      'anticon-down': true,
    })
    const _options = this.renderOptions() || options
    const content = (
      <div>
        <div className="search">
          <InputGroup className="ant-search-input">
            <Input onPressEnter={this.handleSearch} />
            <div className="ant-input-group-wrap">
              <Button icon="search" className="ant-search-btn" />
            </div>
          </InputGroup>
        </div>
        {
          this.isTab
          ? <Tabs>{_options}</Tabs>
          : <Menu>{_options}</Menu>
        }
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
                value={value} readonly placeholder={placeholder}
              />
            </span>
            <span className="ant-cascader-picker-label"></span>
            <i className={classArrow}></i>
          </span>
        </Popover>
      </div>
    )
  }
}