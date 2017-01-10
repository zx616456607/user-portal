/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/1/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Table, Tooltip } from 'antd'
import './style/ContainerProgress.less'
import {connect} from 'react-redux'

const data = [
  {userName:1,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'R',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
]

class ContainerProgress extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  componentWillMount() {
    
  }
  render(){
    const columns = [
      {
        title: '用户名',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: 'PID',
        dataIndex: 'PID',
        key: 'PID',
      },
      {
        title: 'CPU',
        dataIndex: 'CPU',
        key: 'CPU',
      },
      {
        title: 'MEM',
        dataIndex: 'MEM',
        key: 'MEM',
      },
      {
        title: '占用虚拟内存',
        dataIndex: 'vmSize',
        key: 'vmSize',
      },
      {
        title: '占用物理内存',
        dataIndex: 'vmRSS',
        key: 'vmRSS',
      },
      {
        title: '进程状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '启动时间',
        dataIndex: 'startTime',
        key: 'startTime',
      },
      {
        title: '使用CPU时间',
        dataIndex: 'cpuTime',
        key: 'cpuTime',
      },
      {
        title: '命令',
        dataIndex: 'cmd',
        key: 'cmd',
        render: (text,record,index) => {
          return (
            <Tooltip title={text}>
              <span>{text}</span>
            </Tooltip>
          )
        }
      },
    ]
    
    return (
      <div id='ContainerProgress'>
        <span className="titleSpan">进程信息</span>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  return {
    
  }
}
export default connect(mapStateToProps,{
  
})(ContainerProgress)