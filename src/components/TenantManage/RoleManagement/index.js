/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-06-02
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Row, Alert, Col, Transfer, Form, Menu, Input, Icon, Button, Dropdown, Modal, InputNumber, Pagination, Select, Card, Checkbox, Tooltip } from 'antd'
import './style/RoleManagement.less'

let MyComponent = React.createClass({
  render: function(){
    const dropdown = (
        <Menu style={{ width: '130px' }}>
          <Menu.Item key='stopApp'>
            <span><Icon type="edit" /> 编辑角色</span>
          </Menu.Item>
          <Menu.Item key='deleteApp'>
            <span><Icon type="delete" /> 删除</span>
          </Menu.Item>
        </Menu>
      );
    return (
      <div className='dataBox'>
        <div className="appDetail">
          <div className='selectIconTitle commonData'>
            <Checkbox/>
          </div>
          <div className='appName commonData'>
            <Tooltip>
              <Link to="##">
                系统管理员
              </Link>
            </Tooltip>
          </div>
          <div className='appStatus commonData'>
            系统默认
          </div>
          <div className='containerNum commonData'>
            2
          </div>
          <div className='visitIp commonData appListDomain'>
            3
          </div>
          <div className='createTime commonData'>
            <Tooltip calssName="">
              <span>2017-03-20 19:00:26</span>
            </Tooltip>
            <Tooltip>
              <span>2017-03-20 19:00:26</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button overlay={dropdown} type='ghost'>
              <Icon type="eye-o" />查看拓扑图
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both', width: '0' }}></div>
        </div>
      </div>
    )
  }
})

let RoleManagement = React.createClass({
  getInitialState() {
    return { 
      visible: false,
      mockData: [],
      targetKeys: [] 
    };
  },
  componentDidMount() {
    this.getMock();
  },
  getMock() {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  },
  handleChange(targetKeys, direction, moveKeys) {
    console.log(targetKeys, direction, moveKeys);
    this.setState({ targetKeys });
  },
  handleOk() {
    this.setState({
      visible: false,
    });
  },
  handleCancel() {
    this.setState({
      visible: false,
    });
  },
  render() {
    const selectBefore = (
      <Select className="bag" defaultValue="jsmt">
        <Option value="jsmt">角色名称</Option>
        <Option value="cjr">创建人</Option>
      </Select>
    );
    return(
      <div id="RoleManagement">
        <Alert message={`角色是指一组权限的集合，您可以创建一个有若干权限的角色，在某项目中添加角色并为该角色关联对象（成员或团队）。系统管理员和团队管理员都有创建和管理所有角色的权限。`}
          type="info" />
          <div className='operationBox'>
            <div className='leftBox'>
                <Button onClick={()=> this.setState({visible:true})} type='primary' size='large'>
                  <Icon type="plus" />创建角色
                </Button>
                <Modal width="50%" title="创建角色" visible={this.state.visible}
                  onOk={this.handleOk} onCancel={this.handleCancel}>
                  <p className="createRoles">角色名称<Input style={{width:'50%',marginLeft:'50px'}}/></p>
                  <p className="createRoles">备注<Input style={{width:'50%',marginLeft:'73px'}}/></p>
                  <p className="createRoles">权限选择
                    <Transfer
                    
                    dataSource={this.state.mockData}
                    targetKeys={this.state.targetKeys}
                    onChange={this.handleChange}
                    render={item => item.title}/>
                  </p>
                </Modal>
              <Button className="bag" type='ghost' size='large'>
                <i className='fa fa-refresh' />刷新
              </Button>
              <Button className="bag" type='ghost' size='large'>
                <i className='fa fa-trash-o' />删除
              </Button>
            </div>
            <div className='rightBox'>
              <div className='littleLeft'>
                <i className='fa fa-search' />
              </div>
              <div className='littleRight'>
                <Input
                  calssName="put bag"
                  addonBefore={selectBefore}
                  size='large'
                  placeholder='请输入关键词搜索'
                  style={{paddingRight: '28px',width:'180px'}}/>
              </div>
            </div>
            <div className='pageBox'>
              <span className='totalPage'>共计 1 条</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock' />
              </div>
            </div>
            <div className='clearDiv'></div>
          </div>
          <Card className='appBox'>
            <div className='appTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox/>
              </div>
              <div className='appName commonTitle'>
                角色名称
              </div>
              <div className='appStatus commonTitle'>
                创建人
              </div>
              <div className='containerNum commonTitle'>
                权限个数
                  <div className="ant-table-column-sorter">
                  <span className="Numtop">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className="Numbot">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='visitIp commonTitle'>
                被项目引用次数
                <div className="ant-table-column-sorter">
                  <span className="Numtop" title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className="Numbot" title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='createTime commonTitle'>
                创建时间 / 更新时间 <Icon type="filter" />
              </div>
              <div className='actionBox commonTitle'>
                操作
              </div>
            </div>
            <MyComponent/>
            <MyComponent/>
          </Card>
      </div>
    )
  }  
})
export default RoleManagement