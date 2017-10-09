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
import { Row, Table, Alert, Col, Form, Input, Button, Radio, Modal, InputNumber } from 'antd'
import './style/AllPermissions.less'
import {Permission, RetrievePermission} from  '../../../actions/permission'
import CommonSearchInput from '../../../components/CommonSearchInput'
import QueueAnim from 'rc-queue-anim'

class AllPermissions extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      data: [],
      values: '',
      loading: true
    }
  }

  componentWillMount(){
    this.getLists()
  }

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
        data: children,
        loading: false
      })
    }
  }

  handleSearch(value){
    const { RetrievePermission } = this.props
    let ID = value
    RetrievePermission ({
      id: ID
    },{
      success: {
        func: res => {
          if(res.data.code === 200){
            let obj = '', result = []
            obj = {'key': res.data.data.id, 'title':res.data.data.desc, 'desc': res.data.data.desc, 'count': res.data.data.count}
            result.push(obj)
            this.setState({
              data: result
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: err => {
          //
        },
        isAsync: true,
      }
    })
  }

  getLists(){
    const { Permission } = this.props
    Permission (null,{
      success: {
        func: res => {
          if(res.data.code === 200){
            this.RowData(res.data.data.permissions)
          }
        },
        isAsync: true,
      },
    })
  }

  handleChange( filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  render(){
    const { data, loading } = this.state
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [{
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: '47%',
    }, {
      title: '权限描述',
      dataIndex: 'desc',
      key: 'desc',
      width: '30%',
    }, {
      title: '被角色引用次数',
      dataIndex: 'count',
      key: 'count',
      code: 'code',
      render: (text, record) => (
        <div>{record.code !== '' ? text : '-'}</div>
      )
    }];

    return(
      <QueueAnim className="AllPermissions">
        <div id="AllPermissions">
          <Alert message={`所有权限是指平台上每个功能模块权限的细粒度划分，可以将若干个权限组合成一个角色，再在项目中添加相应的角色并关联对象（成员、团队成员）。`}
          type="info" />
        <div className="operationBox">
          {/*<div className='rightBox'>
               <div className='littleLeft'>
                <i className='fa fa-search' />
              </div>
              <div className='littleRight'>
                  <Input
                  calssName="put bag"
                  size='large'
                  placeholder='请输入关键词搜索'
                  style={{paddingRight: '28px',width:'200px'}}
                  /> 
                  <CommonSearchInput placeholder="请输入关键词搜索" size="large" onSearch={this.handleSearch.bind(this)}/>
              </div>
            </div>*/}
          <Table pagination={false} columns={columns} dataSource={data} onChange={this.handleChange} loading={loading}/>
        </div>
      </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  Permission,
  RetrievePermission
})(AllPermissions)
