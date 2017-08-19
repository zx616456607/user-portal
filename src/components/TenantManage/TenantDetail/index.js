/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-06-07
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Row, Table, Col, Spin, Form, Menu, Input, Icon, Button, Tree, Modal, InputNumber, Pagination, Select, Card, Checkbox, Tooltip } from 'antd'
import './style/TenantDetail.less'
import { GetRole, UpdateRole, RemovePermissionRole } from '../../../actions/role'
import { Permission } from '../../../actions/permission'
import QueueAnim from 'rc-queue-anim'
import { formatDate } from '../../../common/tools'
import Notification from '../../Notification/index'
import TreeComponent from '../../TreeComponent/index'
import { REG } from '../../../constants'
import CreateRoleModal from '../RoleManagement/RoleEditManage/index.js'
import NotificationHandler from '../../../components/Notification'

const TreeNode = Tree.TreeNode

let TenantDetail = React.createClass({
  getInitialState() {
    return {
      detailValue: '',
      roleDetail:[],
      isShowIco: false,
      filteredInfo: null,
      sortedInfo: null,
      Removerol: false,
      Removepermis: false,
      addpermission:false,
      characterModal: false,
      roleModalVisible:false,
      removePermissionName: '',
      removePermissionTree: [],
      defaultExpandedKeys: [],
      permissionDatasource: [],
    };
  },
  componentWillMount(){
    const { params } = this.props
    let roleId = params.id
    this.loadData(roleId)
  },
  loadData(roleId){
    const { GetRole } = this.props
    GetRole({ roleId },{
      success: {
        func: res => {
          if(REG.test(res.data.code)){
            this.RowData(res.data.data.permissions)
            this.setState({
              roleDetail: res.data.data,
            })
          }
        },
        isAsync: true
      }
    })
  },
  RowData(data){
    if(data){
      const children = []
      for(let i = 0; i < data.length; i++){
        let RowData = data[i]
        RowData = Object.assign(RowData,{title: RowData.desc, key: RowData.id})
        children.push(RowData)
      }

      children.forEach((key, index) => {
        if(data[index]["children"] !== undefined){
          if (data[index].children.length !== 0) {
            return this.RowData(data[index].children);
          }
        }
      })
      this.setState({
        permissionDatasource: children
      })
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  },
  setAgeSort(e) {
    e.preventDefault();
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'Referencetime',
      },
    });
  },
  handleOk() {
    const { form } = this.props
    const { getFieldValue, validateFields } = form
    let validataArray = ['roleName', 'roleComment']
    validateFields(validataArray, (err, values) => {
      if(err){
        return
      }
      return
    })
    this.setState({
      Removerol: false,
      Removepermis: false,
      addpermission:false,
      roleModalVisible:false,
    });
  },
  handleCancel() {
    this.setState({
      Removerol: false,
      Removepermis: false,
      addpermission:false,
      roleModalVisible:false,
    });
  },
  removePermissionButton(record){
    let linearArray = this.transformLinearArray([record])
    let idArray = []
    linearArray.forEach(item => {
      idArray.push(item.id)
    })
    this.setState({
      Removepermis: true,
      removePermissionName: record.desc,
      removePermissionTree: [record],
      defaultExpandedKeys: idArray
    })
  },
  transformLinearArray(array){
    let LinearArray = []
    const func = data => data.forEach(item => {
      LinearArray.push(item)
      if(item.children){
        func(item.children)
      }
    })
    func(array)
    return LinearArray
  },
  confirmRemovePermission(){
    const { defaultExpandedKeys } = this.state
    const { RemovePermissionRole, params, GetRole } = this.props
    let Notifi = new Notification()
    let roleId = params.id
    let bodys = {
      pids: defaultExpandedKeys
    }
    RemovePermissionRole({
      id: roleId,
      bodys
    }, {
      success: {
        func: (res) => {
          if(REG.test(res.data.code)){
            Notifi.success('移除权限成功')
            this.loadData(roleId)
            this.setState({
              Removepermis: false
            })
          }
        },
        isAsync: true
      },
      failed: () => {
        Notifi.error('移除权限失败，请重试')
      }
    })
  },
  handleIcon(e){
    this.setState({
      isShowIco: true
    })
  },
  handleColse(e){
    this.setState({
      isShowIco: false
    })
  },
  handleBtn(){
    this.setState({
      characterModal: true
    })
  },
  handleChanges(e){
    this.setState({
      detailValue: e.target.values
    })
  },
  handleItem(){
    const { UpdateRole, params } = this.props
    const { detailValue, roleDetail } = this.state
    let notification = new NotificationHandler()
    let body = {
      name: roleDetail.name,
      comment: detailValue
    }
    UpdateRole({
      id: params.id,
      body
      },{
        success:{
          func: (res) => {
            if(REG.test(res.data.code)){
              notification.success("修改成功")
              this.loadData(params.id)
            }
          }
        },
        failed: {
        func: (err) => {
          notification.close()
          notification.error(err)
        },
        isAsync: true
      }
    })
  },
  render() {
    const { params, form, permissionList } = this.props
    const { getFieldProps } = form
    const data = [{
      key: '1',
      Projectname: '项目1',
      Referencetime: '2017-03-28 14:31:35',
    }, {
      key: '2',
      Projectname: '项目1',
      Referencetime: '2017-03-28 14:31:35',
    }, {
      key: '3',
      Projectname: '项目1',
      Referencetime: '2017-03-28 14:31:35',
    }, {
      key: '4',
      Projectname: '项目1',
      Referencetime: '2017-03-28 14:31:35',
    },{
      key: '5',
      Projectname: '项目1',
      Referencetime: '2017-03-28 14:31:35',
    }];
    let { roleDetail, sortedInfo, filteredInfo, removePermissionName, removePermissionTree, permissionDatasource, defaultExpandedKeys } = this.state;

    let outPermission = {}
    let outPermissionInfo = outPermission.permission
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [{
      title: '引用项目名',
      dataIndex: 'Projectname',
      key: 'Projectname',
      width:'20%',
    }, {
      title: '引用时间',
      dataIndex: 'Referencetime',
      key: 'Referencetime',
      width:'40%',
      sorter: (a, b) => a.Referencetime - b.Referencetime,
      sortOrder: sortedInfo.columnKey === 'Referencetime' && sortedInfo.order,
    }, {
      title: '操作',
      dataIndex: 'address',
      key: 'address',
      width:'40%',
      render: (text, record) => (
        <span>
          <Button style={{marginRight:'10px'}} type="primary">进入项目</Button>
          <Button onClick={()=> this.setState({Removerol:true})} type="ghost">移除角色</Button>
        </span>
      ),
    }];
    const permissionColumns = [{
      title: '权限名称',
      dataIndex: 'desc',
      key: 'desc',
      width: '40%',
    }, {
      title: '操作',
      key: 'handle',
      width: '30%',
      render: (text, record, index) => (
        <span>
          <Button onClick={this.removePermissionButton.bind(this, record)} type="ghost">移除权限</Button>
        </span>
      ),
    }];
    const Rcolumns = [{
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    }]
    const scope = this

    return(
    <QueueAnim className='TenantDetail'>
      <div id="TenantDetail">
        <Row>
          <Link className="back" to="/tenant_manage/rolemanagement">
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </Link>
          <span className="Title">角色详情（{roleDetail.name}）</span>
        </Row>
        <div className='lastDetails'>
          <div className='title'>角色基本信息</div>
          <div className='container'>
            <div className="lastSyncInfo">
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'><div>角色名称</div></Col>
                <Col span={21} className='item_content'>{roleDetail.name}</Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'>创建时间</Col>
                <Col span={21} className='item_content'>{formatDate(roleDetail.createdTime)}</Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'>备注</Col>
                {
                  <Col span={21} className='item_content'>
                    <div className="edit_desc" >
                      <div>
                        <Input
                        disabled = {!this.state.isShowIco}
                        style={{ width:145}}
                        type="textarea"
                        onChange={this.handleChanges}
                        {...getFieldProps(`comment`, {
                            initialValue: roleDetail.comment
                        })}
                        />
                        {
                          this.state.isShowIco ?
                          <div className="comment">
                            <Icon className="ico" type="minus-circle-o" style={{fontSize:20,margin:9}} onClick={() => this.handleColse()}/>
                            <Icon className="ico" type="save" style={{fontSize:20}} onClick={() => this.handleItem()}/>
                          </div> :
                          <Icon type="edit" style={{marginLeft:'4px'}} onClick={() => this.handleIcon()}/>
                        }
                      </div>
                    </div>
                  </Col>
                }
              </Row>
            </div>
          </div>
        </div>
        <div className='lastDetails lastDetailtable' style={{width:'49%',float:'left'}} >
          <div className='title'>权限 （ <span>{permissionDatasource.length}个</span> ）
            <Button
            className="Editroles"
            type="ghost"
            onClick={() => this.handleBtn()}
            >编辑角色</Button></div>
            {
              this.state.characterModal ?
              <CreateRoleModal
              visible = {this.state.characterModal}
              title = "编辑角色"
              form = {form}
              scope = {scope}
              isAdd = {false}
              roleId = {params.id}
              characterModal = {this.state.characterModal}
              detail = {() => this.loadData()}
              isDetail = {true}
              /> : ''
            }
          <div className='container'>
            <div className="lastSyncInfo">
              <Table
                scroll={{y:300}}
                columns={permissionColumns}
                pagination={false}
                dataSource={permissionDatasource}
              />
            </div>
          </div>
        </div>
        <div className='lastDetails lastDetailtable' style={{width:'49%',float:'right'}} >
          <div className='title'>项目引用记录</div>
          <div className='container referencerecord'>
            <div className="lastSyncInfo">
              <Table columns={columns} dataSource={data} onChange={this.handleChange} />
            </div>
          </div>
        </div>
        <Modal title="移除角色" visible={this.state.Removerol} onOk={this.handleOk} onCancel={this.handleCancel} >
          <p className="createRol"><div className="mainbox"><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>从项目xxx中移除该角色后与该角色相关联的所有成员及团队将从项目中移除，确定从项目xxx中移除该角色？</div></p>
        </Modal>
        <Modal
          width="765px"
          title="编辑角色"
          visible={this.state.roleModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrapClassName='roleDetail_editRole'
        >
           {/* <AddOrEditRole
            roleInfo={roleInfo}
            permissonInfo={permissonInfo}
            outPermissionInfo={outPermissionInfo}
            scope={scope}
            permissionList={permissionList}
            form={form}
          /> */}
        </Modal>
        <Modal title="移除权限"
          visible={this.state.Removepermis}
          onOk={this.confirmRemovePermission}
          onCancel={this.handleCancel}
          wrapClassName='removePermission'
        >
          <div className="createRol">
            <div className="mainbox">
              <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
              <p>从该角色中移除权限 <p className="pName" style={{color:'red'}}>（{removePermissionName}）</p>后，关联该角色的对象在引用该角色的项目中无此项权限</p>
            </div>
          </div>
          <div className="tips">
            确定从<span className="Specialcolor"> 角色{roleDetail.name} </span>中移除以下权限？
          </div>
          <div className='treeContainer'>
            <Table
            rowKey="id"
            scroll={{y:'150'}}
            size="small"
            pagination={false}
            columns={Rcolumns}
            defaultExpandedRowKeys= {defaultExpandedKeys}
            dataSource={removePermissionTree}/>
          </div>
        </Modal>
        <Modal
          title="编辑权限"
          visible={this.state.addpermission}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <TreeComponent />
        </Modal>
      </div>
    </QueueAnim>
    )
  }
})

TenantDetail = Form.create()(TenantDetail)

function mapStateToProps(state, props){
  return {}

}
export default connect(mapStateToProps, {
  GetRole,
  UpdateRole,
  Permission,
  RemovePermissionRole,
})(TenantDetail)