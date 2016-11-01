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
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'
import "./style/header.less"
import jsonp from 'jsonp'
import querystring from 'querystring'
import classNames from 'classnames'
import PopSelect from '../PopSelect/index'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option
const InputGroup = Input.Group
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
const operaMenu = (<Menu>
  <Menu.Item key="0">
    重新部署
  </Menu.Item>
  <Menu.Item key="1">
    弹性伸缩
  </Menu.Item>
  <Menu.Item key="2">
    灰度升级
  </Menu.Item>
  <Menu.Item key="3">
    更改配置
  </Menu.Item>
</Menu>)

let children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

class Top extends Component {
  constructor(props){
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSpaceMenu = this.handleSpaceMenu.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleFocusBlur = this.handleFocusBlur.bind(this)
    this.setCluster = this.setCluster.bind(this)
    this.state = {
      spaceVisible: false,
      value: '',
      focus: false,
    }
  }
  handleChange(e,value) {
    e.stopPropagation()
    return false
  }
  handleSpaceMenu({key}){
    //
  }
  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }
  handleFocusBlur(e) {
    
  }
  
  setCluster(value,option){
    window.localStorage.setItem('cluster',value)
  }
  
  render() {
    const { style, size, placeholder, } = this.props
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    })
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    })
    /*const spaceMenu = (
      <Menu onClick={this.handleSpaceMenu}>
        <Menu.Item key="0" style={{backgroundColor: '#e5e5e5',color: '#000'}}>
          <div>
            选择项目空间
          </div>
        </Menu.Item>
        <Menu.Item key="1" style={{borderBottom: '1px solid #e2e2e2'}}>
          <div className="ant-search-input-wrapper" style={{width: 120}}>
            <InputGroup className={searchCls}>
              <Input placeholder='查询'
                     value={this.state.value}
                     onChange={this.handleInputChange}
                     onFocus={this.handleFocusBlur}
                     onBlur={this.handleFocusBlur}
                     onPressEnter={this.handleSearch}
              />
              <div className="ant-input-group-wrap">
                <Button icon="search" className={btnCls} size={size} onClick={this.handleSearch} />
              </div>
            </InputGroup>
          </div>
        </Menu.Item>
        <Menu.Item key="2" style={{paddingLeft: 20}}>
          奔驰-CRM系统
        </Menu.Item>
        <Menu.Item key="3" style={{paddingLeft: 20}}>
          奔驰-OA系统
        </Menu.Item>
        <Menu.Item key="4" style={{paddingLeft: 20}}>
          奔驰-进销存系统
        </Menu.Item>
      </Menu>
    )*/

    const clusterPlaceholder = (
      <div className="placeholder">
        <i className="fa fa-sitemap" style={{marginRight: 5}}/>
        产品集群环境
      </div>
    )
    const spaceResultArr = ['奔驰-CRM系统','奔驰-OA系统','奔驰-进销存系统']
    const ClusterResultArr = ['test','产品环境','k8s 1.4']
    
    return (
      <div id="header">
        <div className="space">
          <div className="spaceTxt">
            <i className="fa fa-cube"/>
            <span style={{marginLeft: 5}}>空间</span>
          </div>
          <div className="spaceBtn">
            {/*<Dropdown overlay={spaceMenu}
                      trigger={['click']}
            >
              <a className="ant-dropdown-link" href="#">
                奔驰HRM系统
                <Icon type="down" />
              </a>
            </Dropdown>*/}
            <PopSelect btnStyle={false} resultArr={spaceResultArr} selectValue="奔驰HRM系统"/>
          </div>
        </div>
        <div className="cluster">
          <div className="clusterTxt">
            <i className="fa fa-sitemap"/>
            <span style={{marginLeft: 5}}>集群</span>
          </div>
          <div className="clusterBtn">
            <span style={{padding: '0 10px 5px 10px'}}>开发测试集群</span>
            <span>生产环境集群</span>
          </div>
          <div className="envirBox">
            <PopSelect btnStyle={true} resultArr={ClusterResultArr} selectValue="产品环境集群"/>
          </div>
        </div>
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
export default Top