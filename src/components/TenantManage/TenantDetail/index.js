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
import { Row, Table, Alert, Col, Transfer, Form, Menu, Input, Icon, Button, Dropdown, Modal, InputNumber, Pagination, Select, Card, Checkbox, Tooltip } from 'antd'
import './style/TenantDetail.less'

let TenantDetail = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
      Removerol: false,
      Removepermis: false,
    };
  },
  handleChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  },
  clearFilters(e) {
    e.preventDefault();
    this.setState({ filteredInfo: null });
  },
  clearAll(e) {
    e.preventDefault();
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
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
    this.setState({
      Removerol: false,
      Removepermis: false,
    });
  },
  handleCancel() {
    this.setState({
      Removerol: false,
      Removepermis: false,
    });
  },
  render() {
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
    let { sortedInfo, filteredInfo } = this.state;
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
    const jurisdictions = [{
      title: '权限名称',
      dataIndex: 'Permissionname',
      key: 'Permissionname',
      width: '40%',
    }, {
      title: '权限描述',
      dataIndex: 'Permissiondescription',
      key: 'Permissiondescription',
      width: '30%',
    }, {
      title: '操作',
      dataIndex: 'address',
      key: 'address',
      width: '30%',
      render: (text, record) => (
        <span>
          <Button onClick={()=> this.setState({Removepermis:true})} type="ghost">移除权限</Button>
        </span>
      ),
    }];
    const jurisdictiondata = [{
      key: 1,
      Permissionname: '应用管理',
      Permissiondescription: '应用管理',
      children: [{
        key: 12,
        Permissionname: '应用、服务、容器',
        Permissiondescription: '应用、服务、容器',
        children: [{
          key: 121,
          Permissionname: '查看',
          Permissiondescription: '查看',
        }],
      }, {
        key: 13,
        Permissionname: '存储',
        Permissiondescription: '存储',
        children: [{
          key: 131,
          Permissionname: '存储创建',
          Permissiondescription: '存储创建',
        },{
          key: 132,
          Permissionname: '存储删除',
          Permissiondescription: '存储删除',
        }],
      }],
    },{
      key: 2,
      Permissionname: '交付中心',
      Permissiondescription: '交付中心',
    }];
    return(
      <div id="TenantDetail">
        <Row>
          <Link className="back" to="/tenant_manage/rolemanagement">
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </Link>
          <span className="Title">系统管理员</span>
        </Row>
        <div className='lastDetails'>
          <div className='title'>角色基本信息</div>
          <div className='container'>
            <div className="lastSyncInfo">
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'><div>角色名称</div></Col>
                <Col span={21} className='item_content'>研发</Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'>创建时间</Col>
                <Col span={21} className='item_content'>2017-03-27 15:14:02</Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={3} className='item_title'>备注</Col>
                <Col span={21} className='item_content'>这是一只小黄鱼 <Icon type="edit" /></Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='lastDetails lastDetailtable' style={{width:'49%',float:'left'}} >
          <div className='title'>权限 （ <span>10个</span> ）<Button className="Editroles" type="ghost">编辑角色</Button></div>
          <div className='container'>
            <div className="lastSyncInfo">
              <Table scroll={{y:300}} columns={jurisdictions} pagination={false} dataSource={jurisdictiondata} />
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
        <Modal title="移除权限" visible={this.state.Removepermis} onOk={this.handleOk} onCancel={this.handleCancel} >
          <p className="createRol"><div className="mainbox"><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>从该角色中移除权限<span style={{color:'red'}}>（创建应用）</span>后，关联该角色的对象（成员／团队）在引用该角色的项目中无此项权限</div></p>
          <p className="createRoles">确定从<span className="Specialcolor">角色xxx</span>移除改权限？</p>
        </Modal>
      </div>
    )
  } 
})
export default TenantDetail