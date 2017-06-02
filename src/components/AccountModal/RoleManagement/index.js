import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Alert, Col, Form, Input, Icon, Button, Radio, Modal, InputNumber, Pagination, Select } from 'antd'
import './style/RoleManagement.less'
class RoleManagement extends Component {
  
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
                <Button type='primary' size='large'>
                  <Icon type="plus" />创建角色
                </Button>
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
                  placeholder='按应用名搜索'
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
      </div>
      )
  }  
}
export default RoleManagement