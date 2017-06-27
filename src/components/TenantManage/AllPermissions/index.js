/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-06-12
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Table, Alert, Col, Form, Input, Button, Radio, Modal, InputNumber } from 'antd'
import './style/AllPermissions.less'

let AllPermissions =  React.createClass ({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
    };
  },
  handleChange( filters, sorter) {
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
        columnKey: 'citationtimes',
      },
    });
  },
  render() {
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [{
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: '47%',
    }, {
      title: '权限描述',
      dataIndex: 'describe',
      key: 'describe',
      width: '38%',
    }, {
      title: '被角色引用次数',
      dataIndex: 'citationtimes',
      key: 'citationtimes',
      sorter: (a, b) => a.citationtimes - b.citationtimes,
    }];

    const data = [{
      key: 1,
      name: 'a',
      describe: 32,
      citationtimes: 1,
      children: [{
        key: 11,
        name: 'aa',
        describe: 33,
        citationtimes: 3,
      }, {
        key: 12,
        name: 'ab',
        describe: 33,
        citationtimes: 2,
        children: [{
          key: 121,
          name: 'aba',
          describe: 33,
          citationtimes: 4,
        }],
      }, {
        key: 13,
        name: 'ac',
        describe: 33,
        citationtimes: 3,
        children: [{
          key: 131,
          name: 'aca',
          describe: 33,
          citationtimes: 3,
          children: [{
            key: 1311,
            name: 'acaa',
            describe: 33,
            citationtimes: 2,
          }, {
            key: 1312,
            name: 'acab',
            describe: 33,
            citationtimes: 1,
          }],
        }],
      }],
    }, {
      key: 2,
      name: 'b',
      describe: 32,
      citationtimes: 2,
    }];
    return (
      <div id="AllPermissions">
        <Alert message={`所有权限是指平台上每个功能模块的权限细粒度划分，可以将若干个权限组合成一个角色，再在项目中添加相应的角色并关联对象（成员、团队）。系统管理员和团队管理员都有查看『所有权限』的权限。`}
          type="info" />
        <div className="operationBox">
          <div className='rightBox'>
              <div className='littleLeft'>
                <i className='fa fa-search' />
              </div>
              <div className='littleRight'>
                <Input
                  calssName="put bag"
                  size='large'
                  placeholder='请输入关键词搜索'
                  style={{paddingRight: '28px',width:'200px'}}/>
              </div>
            </div>
          <Table pagination={false} columns={columns} dataSource={data} onChange={this.handleChange} />
        </div>
        
      </div>
    )
  }
})
export default AllPermissions