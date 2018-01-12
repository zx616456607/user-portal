/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScaleList
 *
 * v0.1 - 2018-01-12
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Icon, Pagination } from 'antd'
import SearchInput from '../../CommonSearchInput'

import './style/index.less'

class LoadBalance extends React.Component {
  state = {
    
  }
  componentWillMount() {
    
  }
  
  render() {
    return (
      <div className="loadBalance layout-content">
        <div className="layout-content-btns">
          <Button type="primary" size="large" icon="plus">创建负载均衡</Button>
          <Button type="ghost" size="large"><i className='fa fa-refresh' /> 刷新</Button>
          <Button type="ghost" size="large" icon="delete">删除</Button>
          <SearchInput
            placeholder="请输入关键词搜索"
            size="large"
          />
          <Pagination
            simple
            className="page-box"
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(LoadBalance)