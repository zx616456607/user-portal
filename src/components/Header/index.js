/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppSider component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Select, Input, Button } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import jsonp from 'jsonp'
import querystring from 'querystring'
import classNames from 'classnames'

const Option = Select.Option
const menusText = defineMessages({
  doc: {
    id: 'Header.menu.doc',
    defaultMessage: '文档',
  },
  user: {
    id: 'Header.menu.user',
    defaultMessage: '用户',
  },
  userMenu1: {
    id: 'Header.menu.user.menu1',
    defaultMessage: '第一个菜单项',
  },
  userMenu2: {
    id: 'Header.menu.user.menu2',
    defaultMessage: '第二个菜单项',
  },
  userMenu3: {
    id: 'Header.menu.user.menu3',
    defaultMessage: '第三个菜单项（不可用）',
  }
})

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a target="_blank" href="http://www.alipay.com/">
        <FormattedMessage {...menusText.userMenu1} />
      </a>
    </Menu.Item>
    <Menu.Item key="1">
      <a target="_blank" href="http://www.taobao.com/">
        <FormattedMessage {...menusText.userMenu2} />
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3" disabled>
      <FormattedMessage {...menusText.userMenu3} />
    </Menu.Item>
  </Menu>
)

let timeout;
let currentValue;

function fetch(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;
  
  function fake() {
    const str = querystring.encode({
      code: 'utf-8',
      q: value,
    })
    jsonp(`http://suggest.taobao.com/sug?${str}`, (err, d) => {
      if (currentValue === value) {
        const result = d.result;
        const data = [];
        result.forEach((r) => {
          data.push({
            value: r[0],
            text: r[0],
          });
        });
        callback(data);
      }
    });
  }
  timeout = setTimeout(fake, 300);
}

export default class Top extends Component {
  constructor(props){
    super(props)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleFocusBlur = this.handleFocusBlur.bind(this)
    this.handleSpaceMenu = this.handleSpaceMenu.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.state = {
      data: [
        {
          value: '奔驰-CRM系统',
          text: '奔驰-CRM系统'
        },
        {
          value: '奔驰-OA系统',
          text: '奔驰-OA系统'
        },
        {
          value: '奔驰-进销存系统',
          text: '奔驰-进销存系统'
        },
      ],
      value: '',
      focus: false,
      spaceVisible: false,
    }
  }
  handleSearchChange(value) {
    console.log('value',value);
    this.setState({
      value,
      spaceVisible: true,
    });
    fetch(value, (data) => this.setState({ data }));
  }
  handleSubmit() {
    console.log('输入框内容是: ', this.state.value);
  }
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }
  handleSpaceMenu(e){
    if(e.key === '2'){
      this.setState({
        spaceVisible: false
      })
    }
  }
  handleVisibleChange(flag) {
    this.setState({
      spaceVisible: flag
    })
  }
  render() {
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    const spaceMenu = (
      <Menu onClick={this.handleSpaceMenu}>
        <Menu.Item key="0">
          选择项目空间
        </Menu.Item>
        <Menu.Item key="1">
          <div className="ant-search-input-wrapper" style={this.props.style}>
            <Input.Group className={searchCls}>
              <Select
                combobox
                value={this.state.value}
                placeholder={this.props.placeholder}
                notFoundContent=""
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onChange={this.handleSearchChange}
                onFocus={this.handleFocusBlur}
                onBlur={this.handleFocusBlur}
              >
                {options}
              </Select>
              <div className="ant-input-group-wrap">
                <Button className={btnCls} onClick={this.handleSubmit}>
                  <Icon type="search" />
                </Button>
              </div>
            </Input.Group>
          </div>
        </Menu.Item>
        <Menu.Divider />
      </Menu>
    )
    return (
      <div id="header">
        <div>
          <Icon type="chrome" />
          空间
        </div>
        <Dropdown overlay={spaceMenu}
                  trigger={['click']}
                  visible={this.state.spaceVisible}
                  onVisibleChange={this.handleVisibleChange}
                  getPopupContainer={() => document.getElementById('header')}>
          <Button type="ghost" style={{ marginLeft: 8 }}>
            按钮
            <Icon type="down" />
          </Button>
        </Dropdown>
        <div className="rightBox">
          <div className="docBtn">
            <FormattedMessage {...menusText.doc} />
          </div>
          <Dropdown overlay={menu}>
            <div className="ant-dropdown-link userBtn">
              <FormattedMessage {...menusText.user} />
              <Icon type="down" />
            </div>
          </Dropdown>
        </div>
      </div>
    )
  }
}