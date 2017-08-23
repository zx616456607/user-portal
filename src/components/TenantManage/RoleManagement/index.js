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
import { ListRole, CreateRole, GetRole, DeleteRole, UpdateRole } from '../../../actions/role'
import { Permission } from '../../../actions/permission'
import { formatDate } from '../../../common/tools'
import SearchInput from './SearchInfo/index'
import Roleitem from './RoleEditManage/index.js'
import NotificationHandler from '../../../components/Notification'
import QueueAnim from 'rc-queue-anim'
import CreateRoleModal from './RoleEditManage/index.js'
import Roles from './../ProjectManage/CreateRole'
import { REG } from '../../../constants/index.js'


const Option = Select.Option

class RoleManagement extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      selectedRowKeys: [],
      Viewpermissions:false,
      Deleteroles:false,
      targetKeys: [],
      roleData: [],
      visible: false,
      roelItems: [],
      roleItemTitle: '',
      isAdd: false,
      loading: true,
      id: '',
      roleId: '',
      count: 0,
      isChecked: true,
      characterModal: false,
      perData: [],
      allPermission: [],
      checkedKeys: [],
      name:'',
      comment:'',
      autoExpandParent: true
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
          if(REG.test(res.data.code)){
            this.setState({
              loading: false,
              roleData: res.data.data.items,
              //roleSizeroleSize: res.data.data.size,
            })
          }
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
      //sortedInfo: sorter,
      //filteredInfo: filters,
    });
  }
  loadListRole(){
    const { ListRole } = this.props
    ListRole()
  }
  /**
   * 编辑与删除
   * @param {*} item
   */
  handleRole(item, value){
    switch(value.key){
      case 'edit':
        this.setState({
          characterModal: true,
          isAdd: false,
          roleItemTitle: '编辑角色',
          roleId: item.id,
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
   * 查看权限
   * @param {*} id
   */
  handleGetRoleJu(record){
    this.setState({
      Viewpermissions: true,
    })
    const { GetRole } = this.props
    GetRole({ roleId: record.id },{
      success: {
        func: res => {
          if(REG.test(res.data.code)){
            let aryID = []
            if( res.data.data.permissions){
              for(let i = 0;i < res.data.data.permissions.length; i++){
                aryID.push(`${res.data.data.permissions[i].id}`)
              }
            }

            this.setState({
              name: res.data.data.name,
              comment:res.data.data.comment,
              allPermission: res.data.data.permissions,
              checkedKeys: aryID
            })
          }
        },
        isAsync: true
      }
    })
  }

  /**
   * 关闭权限
   */
  handleClose(){
    this.setState({
      Viewpermissions: false
    })
  }

  onCheck(checkedKeys) {
    this.setState({
      checkedKeys
    });
  }

  /**
   *
   */
  handleOk(){
    this.setState({
      Viewpermissions: false
    })
  }
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  /**
   * 添加角色
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
   * 刷新
   */
  handleRefresh(){
    this.setState({
      loading: true
    })
    this.loadData()
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
          if(REG.test(res.data.code)){
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
          if(REG.test(res.code)){
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

  /**
   * 模糊搜索
   * @param {*} data
   */
  handleSearch(data){
    this.setState({
      roleData: data ? data.items : []
    })
  }

  render() {
    const TreeNode = Tree.TreeNode;
    const { form } = this.props
    const { roleData, Viewpermissions, visible, roleItemTitle, roelItems, isAdd, roleId,
      targetKeys, loading, allPermission, checkedKeys } = this.state
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
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
    if(roleData){
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
      // filters: [
      //   { text: '2017', value: '2017' },
      //   { text: '2016', value: '2016' }
      // ],
      // onFilter: (value, record) => record.Times.indexOf(value) === 0,
      sorter: (a, b) => a.createdTime - b.createdTime,
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
          text == '研'?
          <Button type="primary" onClick={this.handleGetRoleJu.bind(this, record)}><Icon type="eye"/>查看权限</Button> :
          <Dropdown.Button overlay={dropDown[index]} type="ghost" onClick={this.handleGetRoleJu.bind(this, record)}>
            <Icon type="eye" />查看权限
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
    const loop = data => data.map((item) => {
      if (item["children"] !== undefined) {
        return (
          <TreeNode key={item.id} title={item.name} disableCheckbox>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={item.name} disableCheckbox/>;
    });
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
            <Button className="bag" type='ghost' size='large' onClick={() => this.handleRefresh()}>
              <i className='fa fa-refresh' />刷新
            </Button>
            {/* <Button className="bag" type='ghost' disabled={!hasSelected} size='large'>
              <i className='fa fa-trash-o' />删除
            </Button> */}
          </div>
          <SearchInput scope={scope} searchIntOption={searchIntOption} Search ={this.handleSearch.bind(this)} />
          <div className='pageBox'>
            <span className='totalPage'>共计{ roleData ? roleData.length : 0}条</span>
          </div>
          {/* <div className='clearDiv'></div> */}
        </div>
        <div className='appBox'>
          <Table
            columns={rolecolumns}
            dataSource={roleData}
            onChange={this.handleChange.bind(this)}
            pagination={{simple: true}}
            loading={loading}
          />
        </div>
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
            isAdd = {isAdd}
            roleId = {roleId}
            isDetail = {false}
            characterModal = {this.state.characterModal}
            loadData = {this.loadData.bind(this)}
        /> : ''
        }
        <Row>
        <Modal title="查看权限" visible={Viewpermissions} onCancel={this.handleClose.bind(this)} footer={<Button type="primary" onClick={this.handleOk.bind(this)} >知道了</Button>}>
            <p>角色名称
              <Input className="inp" value={this.state.name} disabled/>
            </p>
            <p>备注
              <Input className="inp" style={{marginLeft:53}} value={this.state.comment} disabled/>
            </p>
            <div className="authChoose" style={{marginTop: 10}}>
              <span>已有权限</span>
              <div className="authBox">
                <div className="authTitle clearfix"><div className="pull-left">共<span style={{color:'#59c3f5'}}>{allPermission ? allPermission.length : 0}</span> 个</div></div>
                <div className="treeBox">
                  {
                    allPermission &&
                    <Tree
                      checkable
                      autoExpandParent={this.state.autoExpandParent}
                      onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                      onCancel={this.handleClose.bind(this)}
                      onOk={this.handleOk.bind(this)}
                    >
                      {loop(allPermission)}
                    </Tree>
                  }
                </div>
              </div>
            </div>
        </Modal>
        </Row>
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
  UpdateRole,
  Permission,
})(RoleManagement)