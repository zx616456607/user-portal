/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-07-28
 * @author ZhaoYanBei
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Row, Table, Alert, Col, Tree, Form, Menu, Input, Icon, Button, Dropdown, Modal, InputNumber, Pagination, Select, Card, Checkbox, Tooltip } from 'antd'
import './style/RoleManagement.less'
import { ListRole, CreateRole, GetRole, DeleteRole } from '../../../actions/role'
import { Permission } from '../../../actions/permission'
import { formatDate } from '../../../common/tools'
import SearchInput from '../../SearchInput'
import Roleitem from './RoleEditManage/index.js'
import NotificationHandler from '../../../components/Notification'
import QueueAnim from 'rc-queue-anim'
import CreateRoleModal from './RoleEditManage/index.js'
import Roles from './../ProjectManage/CreateRole'


const Option = Select.Option

class RoleManagement extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      //visible: false,
      selectedRowKeys: [],
      Viewpermissions:false,
      Deleteroles:false,
      mockData: [],
      targetKeys: [],
      sortedInfo: null,
      filteredInfo: null,

      roleData: [],
      visible: false,
      roelItems: [],
      roleItemTitle: '',
      roleSize: [],
      isAdd: false,
      loading: true,

      id: '',
      count: 0,
      isChecked: true,

      characterModal: false,
      perData: [],
    }
  }

  componentWillMount(){
    this.loadData()
  }

  componentDidMount(){
    this.setState({
      loading: true
    })
  }
  /**
   * 加载数据
   */
  loadData(){
    const { ListRole } = this.props
    ListRole(null,{
      success: {
        func: res => {
          if(res.data.code === 200){
            this.setState({
              loading: false,
              roleData: res.data.data.items,
              roleSize: res.data.data.size,
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          //
        },
        isAsync: true,
      }
    })
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }
  handleChange( filters, sorter) {
    this.setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  }
  setAgeSort(e) {
    e.preventDefault();
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  }
  loadListRole(){
    const { ListRole } = this.props
    ListRole()
  }

  handleSearch(){

  }

  /**
   * 编辑与删除
   * @param {*} item
   */
  handleRole(item, value){
    switch(value.key){
      case 'edit':
        this.setState({
          roelItems: item,
          visible: true,
          isAdd: false,
          roleItemTitle: '编辑角色'
        })
        return
      case 'del':
        this.setState({
          Deleteroles: true
        })
        this.handleDelRole(item.id, item.projectCount)
        return
    }
  }

  /**
   * 添加角色
   * @param {*} state
   */
  addRoleInfo(state){
    const { CreateRole } = this.props
    let notification = new NotificationHandler()
    let res = {
      name: state.name,
      comment: state.comment,
      permission: state.ary
    }
    CreateRole(null,{
      success: {
        func: res => {
          if(res.data.code === 200){
            notification.success(`创建角色成功`)
          }
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          notification.error(`创建角色失败`)
        },
        isAsync: true,
      }
    })
  }

  /**
   * 删除角色
   * @param {*} id
   */
  handleDelRole(id,count){
    this.setState({
      Deleteroles: true,
      id: id,
      count: count,
    })
  }

  /**
   * 查看权限信息
   * @param {*} id
   */
  handleGetRoleJu(info){
    this.setState({
      Viewpermissions: true
    })
    const { GetRole } = this.props
    let res = {
      ID: info.id
    }
    // GetRole({ res },{
    //   success: {
    //     func: res => {
    //       if(res.code === 200){

    //       }
    //     },
    //     isAsync: true
    //   },
    //   failed: {
    //     func: res => {

    //     },
    //     isAsync: true
    //   }
    // })
  }

  /**
   * SHow角色
   */
  handleRoleitem(){
    this.setState({
      //visible: true,
      characterModal: true,
      isAdd: true,
      roleItemTitle: '创建角色'
    })
  }

  /**
   * 删除角色权限
   */
  handleCheck(e){
    console.log(e.target.checked)
  }

  /**
   * 确认删除角色
   */
  handleOkDel(e){
    const { DeleteRole } = this.props
    const { id, isChecked } = this.state
    let notification = new NotificationHandler()
    notification.spin(`删除中...`)//${this.state.Name}
    let res = {
      id: id,
      state: isChecked
    }
    DeleteRole({ res },{
      success: {
        func: res => {
          if(res.data.code === 200){
            notification.close()
            notification.success(`删除成功`)
            this.setState({
              Deleteroles: false
            })
            this.loadData()
          }
        },
        isAsync: true
      },
      failed: {
        func: err => {
          notification.close()
          notification.success(`删除失败`)
        },
        isAsync: true
      }
    })
  }

  /**
   * 是否项目中保留
   * @param {*} e
   */
  handleChecked(e){
    this.setState({
      isChecked: e.target.checked
    })
  }

  /**
   * 角色权限
   */
  getPermissionInfo(){
    const { Permission } = this.props
    permission(null,{
      success: {
        func: res => {
          if(res.code === 200){
            this.generateDatas(res.code.data)
            this.setState({
              perData: res.data,
              isPermission: true
            })
          }
        }
      }
    })
  }

  generateDatas(_tns){
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: `${key}`})
      children.push(key);
      checkedKeysDetail.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index].children&&(tns[index].children.length !== null)) {
        return this.generateDatas(tns[index].children);
      }
    });
  };

  /**
   * 关闭
   */
  handleCancel(){
    this.setState({
      Deleteroles: false
    })
  }

  render() {
    const { form } = this.props
    const { roleData, roleSize, Viewpermissions, visible, roleItemTitle, roelItems, isAdd, mockData
    , targetKeys, loading } = this.state
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
          <Checkbox>项目中保留</Checkbox>
          <Checkbox>彻底删除</Checkbox>
        </span>
      ),
    }];
    let dropDown = []
    if(true){
      dropDown = roleData.map((item, index) => {
        return <Menu style={{ width: '115px' }} key={'handleRole' + index } onClick={this.handleRole.bind(this, item)}>
          <Menu.Item key='edit'>
            <Icon type="edit" /> 编辑角色
          </Menu.Item>
          <Menu.Item key='del'>
            <Icon type="delete" /> 删除
          </Menu.Item>
        </Menu>
      })
    }
    const rolecolumns = [{
      title: '角色名称',
      dataIndex: 'name',
      width:'13%',
      render: (text, record, index) =>
        <Link to ={`/tenant_manage/rolemanagement/rolename/${record.id}`}>
          <div className='roleName'>
            {/* () => browserHistory.push(`/tenant_manage/rolemanagement/rolename/12`) */}
            <a href='#'>{text}</a>
          </div>
        </Link>
    }, {
      title: '创建人',
      dataIndex: 'creator',
      width:'14%',
      id: 'id'
    }, {
      title: '权限个数',
      dataIndex: 'permissionCount',
      width:'14%',
      key:'Numbers',
      sorter: (a, b) => a.permissionCount - b.permissionCount,
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
          ? <Button type="primary" onClick={this.handleGetRoleJu.bind(this, record)}><Icon type="eye"/>查看权限</Button>
          : <Dropdown.Button overlay={dropDown[index]} type="ghost">
              <Icon type="eye" />
              查看权限
          </Dropdown.Button>
        }
      </div>
    }]
    const searchIntOption = {
      addBefore: [
        { key: 'jsmt', value: '角色名称' },
        { key: 'cjr', value: '创建人' },
      ],
      defaultSearchValue: 'name',
      placeholder: '请输入关键词搜索',
    }

    const selectBefore = (
      <Select className="bag" defaultValue="jsmt" style={{width:'80px'}}>
        <Option value="jsmt">角色名称</Option>
        <Option value="cjr">创建人</Option>
      </Select>
    )
    const scope = this

    return(
      <QueueAnim className="RoleManagement">
        <div id="RoleManagement">
        <Alert message={`角色是指一组权限的集合，您可以创建一个有若干权限的角色，在某项目中添加角色并为该角色关联对象（成员或团队）。系统管理员和团队管理员都有创建和管理所有角色的权限。`}
          type="info" />
        <div className='operationBox'>
          <div className='leftBox'>
            <Button onClick={ this.handleRoleitem.bind(this) } type='primary' size='large'>
              <i className="fa fa-plus" aria-hidden="true" style={{marginRight: '8px'}}></i>创建角色
            </Button>
            <Button className="bag" type='ghost' size='large' onClick={this.loadData.bind(this)}>
              <i className='fa fa-refresh' />刷新
            </Button>
            {/* <Button className="bag" type='ghost' disabled={!hasSelected} size='large'>
              <i className='fa fa-trash-o' />删除
            </Button> */}
          </div>
          {/* <div className='rightBox'>
            <div className='littleLeft'>
              <i className='fa fa-search' onClick={this.handleSearch} />
            </div>
            <div className='littleRight'>
              <Input
                className="put bag"
                addonBefore={selectBefore}
                size='large'
                placeholder='请输入关键词搜索'
                style={{paddingRight: '28px',width:'180px'}}/>
            </div>
          </div> */}
          <SearchInput scope={scope} searchIntOption={searchIntOption} />
          <div className='pageBox'>
            <span className='totalPage'>共计{ roleData.length }条</span>
          </div>
           {/* {
            roleData.data
            ? <div className='pageBox'>
              <span className='totalPage'>共计 { roleData.data.size } 条</span>
            </div>
            : null
          } */}
          <div className='clearDiv'></div>
        </div>
        <div className='appBox'>
          {/* rowSelection={rowSelection} */}
          <Table
            columns={rolecolumns}
            dataSource={roleData}
            onChange={this.handleChange.bind(this)}
            pagination={{simple: true}}
            loading={loading}
          />
        </div>
        {/* <Roleitem
          scope={this}
          visible={visible}
          roleTitle={roleItemTitle}
          isAdd={isAdd}
          data={roelItems}
          mockData={mockData}
          targetKeys={targetKeys}
          addRole={this.addRoleInfo.bind(this)}
        >
        </Roleitem> */}
        <Row>
          <Modal title="删除角色操作" visible={this.state.Deleteroles} onOk={this.handleOkDel.bind(this)} onCancel={this.handleCancel.bind(this)} >
             <div className="createRolesa">
              <div className="mainbox">
                <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
                <span>默认在引用该角色的项目中保留该角色，否则将彻底删除该角色。是否确定删除该角色？</span>
              </div>
            </div>
            <div className="createRoles" style={{marginTop: 20}}>
               {/* <Table columns={columns}  pagination={false}/> */}
               {/* dataSource={data} */}
              <Row>
                  <Checkbox checked={this.state.isChecked} onChange={this.handleChecked}>
                    项目中保留
                    <span>（已引用项目 { this.state.count } 个）</span>
                  </Checkbox>
              </Row>
            </div>
          </Modal>
        </Row>
        {
          this.state.characterModal ?
          <CreateRoleModal
            visible = {this.state.characterModal}
            title = {this.state.roleItemTitle}
            form = {form}
            scope = {this}
            characterModal = {this.state.characterModal}
            loadData = {this.loadData.bind(this)}
        /> : ''
        }
         <Modal title="查看权限" visible={this.state.Viewpermissions} footer={<Button type="primary" onClick={this.handleOk}>知道了</Button>} onCancel={this.handleCancel} >
          <p className="createRolesa">角色名称<Input style={{width:'50%',marginLeft:'50px'}} placeholder="请填写角色名称"/></p>
          <p className="createRoles">备注<Input style={{width:'50%',marginLeft:'73px'}}/></p>
          <div className="authChoose">
          <span>已有权限</span>
          <div className="authBox inlineBlock">
            <div className="authTitle clearfix"><div className="pull-right">共<span style={{color:'#59c3f5'}}>0</span> 个</div></div>
            <div className="treeBox">
              {
                <Tree
                  checkable
                  onExpand={() => this.onExpand()} expandedKeys={this.state.expandedKeys}
                  autoExpandParent={this.state.autoExpandParent}
                  onCheck={() => this.onCheck()} checkedKeys={this.state.checkedKeys}
                  onSelect={() => this.onSelect()} selectedKeys={this.state.selectedKeys}
                >
                </Tree>
              }
            </div>
          </div>
        </div>
        </Modal>
      </div>
      </QueueAnim>
    )
  }
}
RoleManagement = Form.create()(RoleManagement)
function mapStateToProps(state, props){
  const { role, entities } = state
  const { loginUser } = entities
  let roleList = []
  return{}
}

export default connect(mapStateToProps, {
  ListRole,
  GetRole,
  CreateRole,
  DeleteRole,
  Permission,
})(RoleManagement)