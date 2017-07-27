/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-06-02
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Row, Table, Alert, Col, Transfer, Form, Menu, Input, Icon, Button, Dropdown, Modal, InputNumber, Pagination, Select, Card, Checkbox, Tooltip } from 'antd'
import './style/RoleManagement.less'
import { ListRole } from '../../../actions/role'
import { formatDate } from '../../../common/tools'

const Option = Select.Option

let RoleManagement = React.createClass({
  getInitialState() {
    return {
      visible: false,
      mockData: [],
      targetKeys: [],
      selectedRowKeys: [],
      editrole: false,
      Viewpermissions:false,
      Deleteroles:false,
      mockData: [],
      targetKeys: [],
      sortedInfo: null,
      filteredInfo: null,
    };
  },
  componentWillMount(){
    this.loadListRole()
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
  onhandleChange(targetKeys, direction, moveKeys) {
    this.setState({ targetKeys });
  },
  handleOk() {
    this.setState({
      visible: false,
      editrole: false,
      Viewpermissions: false,
      Deleteroles:false,
    });
  },
  handleCancel() {
    this.setState({
      visible: false,
      editrole: false,
      Viewpermissions: false,
      Deleteroles:false,
    });
  },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  },
  handleChange( filters, sorter) {
    this.setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  },
  setAgeSort(e) {
    e.preventDefault();
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  },
  loadListRole(){
    const { ListRole } = this.props
    ListRole()
  },
  handleRole(item, obj){
    console.log('obj=',obj)
    console.log('item=',item)
    switch(obj.key){
      case 'editRole':
        this.setState({
          editrole: true
        })
        return
      case 'deleteRole':
        this.setState({
          Deleteroles: true
        })
        return
    }
  },
  render() {
    const { roleList } = this.props
    const dropdown = (
        <Menu style={{ width: '115px' }}>
          <Menu.Item key='stopApp'>
            <span onClick={()=> this.setState({editrole:true})} ><Icon type="edit" /> 编辑角色</span>
          </Menu.Item>
          <Menu.Item key='deleteApp'>
            <span onClick={()=> this.setState({Deleteroles:true})} ><Icon type="delete" /> 删除</span>
          </Menu.Item>
        </Menu>
      );
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [{
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width:'28%',
    }, {
      title: '已引用项目',
      dataIndex: 'Referencedproject',
      key: 'Referencedproject',
      width:'30%',
    }, {
      title: '已引用项目中是否保留改角色',
      key: 'operation',
      render: (text, record) => (
        <span>
          <Checkbox >项目中保留</Checkbox>
          <Checkbox >彻底删除</Checkbox>
        </span>
      ),
    }];

    const data = [{
      key: '1',
      name: '开发',
      user: '3',
    }, {
      key: '2',
      name: '测试',
      user: '4',
    }, {
      key: '3',
      name: '团队管理员',
      user: '3',
    }];
    const menu = (
      <Menu>
        <Menu.Item key="1">编辑角色</Menu.Item>
        <Menu.Item key="2">删除</Menu.Item>
      </Menu>
)

    let roledata = []
    let dropDown = []
    if(roleList.data){
      roledata = roleList.data.items
      dropDown = roledata.map((item, index) => {
        return <Menu style={{ width: '115px' }} key={'handleRole' + index } onClick={this.handleRole.bind(this, item)}>
          <Menu.Item key='editRole'>
            <Icon type="edit" /> 编辑角色
          </Menu.Item>
          <Menu.Item key='deleteRole'>
            <Icon type="delete" /> 删除
          </Menu.Item>
        </Menu>
      })
    }

    const rolecolumns = [{
      title: '角色名称',
      dataIndex: 'name',
      width:'13%',
      render: (text, record, index) => <div className='roleName' onClick={() => browserHistory.push(`/tenant_manage/rolemanagement/rolename/${record.id}`)}>{text}</div>
    }, {
      title: '创建人',
      dataIndex: 'user',
      width:'14%',
    }, {
      title: '权限个数',
      dataIndex: 'count',
      width:'14%',
      key:'Numbers',
      sorter: (a, b) => a.count - b.count,
    },{
      title: '被项目引用次数',
      dataIndex: 'projectCount',
      width:'16%',
      sorter: (a, b) => a.projectCount - b.projectCount,
    }, {
      title: '创建时间 / 更新时间',
      dataIndex: 'createdTime',
      width:'20%',
      filters: [{
        text: '2017',
        value: '2017',
      }, {
        text: '2016',
        value: '2016',
      }],
      onFilter: (value, record) => record.Times.indexOf(value) === 0,
      render: (text, record, index) => <div>
        <span className='createdTime'>{formatDate(record.createdTime)}</span><br/>
        <span className='updatedTime'>{formatDate(record.updatedTime)}</span>
      </div>
    }, {
      title: '操作',
      dataIndex: 'comment',
      render: (text, record, index) => <div>
         {
           //dropDown[index]
          text == '研'
          ? <Button type="primary" onClick={() => browserHistory.push(`/tenant_manage/rolemanagement/rolename/${record.id}`)}><Icon type="eye" />查看权限</Button>
          : <Dropdown.Button overlay={dropDown} type="ghost" onClick={() => browserHistory.push(`/tenant_manage/rolemanagement/rolename/${record.id}`)}>
              <Icon type="eye" />
              查看权限
          </Dropdown.Button>
        }
      </div>
    }];

    let totleNum = 0
    if(roleList.data){
      totleNum = roleList.data.total
    }

    const selectBefore = (
      <Select className="bag" defaultValue="jsmt" style={{width:'80px'}}>
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
              <i className="fa fa-plus" aria-hidden="true" style={{marginRight: '8px'}}></i>创建角色
            </Button>
            <Button className="bag" type='ghost' size='large' onClick={this.loadListRole}>
              <i className='fa fa-refresh' />刷新
            </Button>
            <Button className="bag" type='ghost' disabled={!hasSelected} size='large'>
              <i className='fa fa-trash-o' />删除
            </Button>
          </div>
          <div className='rightBox'>
            <div className='littleLeft'>
              <i className='fa fa-search' />
            </div>
            <div className='littleRight'>
              <Input
                className="put bag"
                addonBefore={selectBefore}
                size='large'
                placeholder='请输入关键词搜索'
                style={{paddingRight: '28px',width:'180px'}}/>
            </div>
          </div>
          {
            roleList.data
            ? <div className='pageBox'>
              <span className='totalPage'>共计 { totleNum } 条</span>
            </div>
            : null
          }
          <div className='clearDiv'></div>
        </div>
        <div className='appBox'>
          <Table
            rowSelection={rowSelection}
            columns={rolecolumns}
            dataSource={data}
            onChange={this.handleChange}
            pagination={{simple: true}}
            loading={roleList.isFetching}
          />
        </div>

        <Modal
          width="650px"
          title="创建角色"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName='createRole'
        >
          <Form>
            <Form.Item
              label="角色名称"
              labelCol={{span: 4}}
              wrapperCol={{span: 12}}
            >
              <Input placeholder='请填写角色名称'/>
            </Form.Item>
            <Form.Item
              label="备注"
              labelCol={{span: 4}}
              wrapperCol={{span: 12}}
            >
              <Input/>
            </Form.Item>
          </Form>
          <div className="createRoles"><sapn className="PermissionSelection">权限选择</sapn>
            <Transfer
              operations={['添加', '移除']}
              dataSource={this.state.mockData}
              targetKeys={this.state.targetKeys}
              onChange={this.onhandleChange}
              render={item => item.title}
            />
          </div>
        </Modal>

        <Modal title="查看权限" visible={this.state.Viewpermissions} footer={<Button type="primary" onClick={this.handleOk}>知道了</Button>} onCancel={this.handleCancel} >
          <p className="createRolesa">角色名称<Input style={{width:'50%',marginLeft:'50px'}} placeholder="请填写角色名称"/></p>
          <p className="createRoles">备注<Input style={{width:'50%',marginLeft:'73px'}}/></p>
          <p>对话框的内容</p>
        </Modal>

        <Modal width="650px" title="编辑角色" visible={this.state.editrole} onOk={this.handleOk} onCancel={this.handleCancel} >
          <p className="createRolesa">角色名称<Input style={{width:'50%',marginLeft:'50px'}} placeholder="请填写角色名称"/></p>
          <p className="createRoles">备注<Input style={{width:'50%',marginLeft:'73px'}}/></p>
          <p className="createRoles"><sapn className="PermissionSelection">权限选择</sapn>
            <Transfer
            operations={['添加', '移除']}
            dataSource={this.state.mockData}
            targetKeys={this.state.targetKeys}
            onChange={this.onhandleChange}
            render={item => item.title}/>
          </p>
        </Modal>

        <Modal title="删除角色操作" visible={this.state.Deleteroles} onOk={this.handleOk} onCancel={this.handleCancel} >
          <div className="createRolesa"><div className="mainbox"><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>将永久删除以下角色以及该角色所关联的对象，您确定要删除以下角色么？</div></div>
          <div className="createRoles"><Table columns={columns} dataSource={data} pagination={false} /></div>
        </Modal>
      </div>
    )
  }
})

function mapStateToProps(state, props){
  const { role, entities } = state
  const { roleList } = role
  const { loginUser } = entities
  return {
    roleList,
  }
}


export default connect(mapStateToProps, {
  ListRole
})(RoleManagement)