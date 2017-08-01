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
import {fetchinfoList, getSearchList} from  '../../../actions/tenant_overview'
import CommonSearchInput from '../../../components/CommonSearchInput'

class AllPermissions extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      data: [],
      values: ''
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
        if(data[index].children.length !==0){
          return this.RowData(data[index].children)
        }
      })
      this.setState({
        data: children
      })
    }
  }

  handleSearch(value){
    const { getSearchList } = this.props
    let ID = value
    getSearchList ({
      id: ID
    },{
      success: {
        func: res => {
          if(res.data.code === 200){
            debugger
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
    const { fetchinfoList } = this.props
    fetchinfoList (null,{
      success: {
        func: res => {
          if(res.data.code === 200){
            this.RowData(res.data.data.permission)
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

  handleChange( filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  render(){
    const { data } = this.state
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [{
      title: '权限名称',
      dataIndex: 'title',
      key: 'title',
      width: '47%',
    }, {
      title: '权限描述',
      dataIndex: 'desc',
      key: 'desc',
      width: '38%',
    }, {
      title: '被角色引用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.citationtimes - b.citationtimes,
    }];

    return(
      <div id="AllPermissions">
        <Alert message={`所有权限是指平台上每个功能模块的权限细粒度划分，可以将若干个权限组合成一个角色，再在项目中添加相应的角色并关联对象（成员、团队）。系统管理员和团队管理员都有查看『所有权限』的权限。`}
          type="info" />
        <div className="operationBox">
          <div className='rightBox'>
              {/* <div className='littleLeft'>
                <i className='fa fa-search' />
              </div> */}
              <div className='littleRight'>
                {/* <Input
                  calssName="put bag"
                  size='large'
                  placeholder='请输入关键词搜索'
                  style={{paddingRight: '28px',width:'200px'}}
                  /> */}
                  <CommonSearchInput placeholder="请输入关键词搜索" size="large" onSearch={this.handleSearch.bind(this)}/>
              </div>
            </div>
          <Table pagination={false} columns={columns} dataSource={data} onChange={this.handleChange} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  fetchinfoList,
  getSearchList
})(AllPermissions)
