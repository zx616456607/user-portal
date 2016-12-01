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
import Content from './Content'

export default class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.setValue = this.setValue.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.state = {
      focus: false,
      visible: props.visible,
    }
  }

  setValue(item) {
    const { onChange } = this.props
    if (onChange) {
      onChange(item)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps
    this.setState({
      visible,
    })
  }

  handleVisibleChange(visible) {
    this.setState({ visible })
  }

  render() {
    const { title, btnStyle, loading, special, selectValue, list } = this.props
    const text = <span className="PopSelectTitle">{title}</span>
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <div className="PopSelect">
        <Popover
          placement="bottomLeft"
          title={text}
          content={
            <Content
              list={list}
              onChange={this.setValue}
              loading={loading}
              special={special}
              />
          }
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
                <Icon type="down" className={rotate} style={{float:'right',marginLeft:'10px'}}/>
              </a>
          }
        </Popover>
      </div>
    )
  }
}