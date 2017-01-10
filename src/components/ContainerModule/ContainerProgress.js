/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *  ContainerProgress
 *
 * v0.1 - 2017/1/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Table, Tooltip } from 'antd'
import './style/ContainerProgress.less'
import { connect } from 'react-redux'
import { getPodProcess } from '../../actions/app_manage'

const data = [
  {key:1,userName:1,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'R',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
  {key:2,userName:2,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'S',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh/bin/sh',},
  {key:3,userName:3,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'D',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh',},
  {key:4,userName:4,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'Z',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh/bin/sh/bin/sh/bin/sh/bin/sh',},
  {key:5,userName:5,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'T',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh/bin/sh/bin/sh',},
  {key:6,userName:6,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'t',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh',},
  {key:7,userName:7,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'W',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh',},
  {key:8,userName:8,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'X',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
  {key:9,userName:9,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'x',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh/bin/sh/bin/sh/bin/sh/bin/sh',},
  {key:10,userName:10,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'K',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
  {key:11,userName:11,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'W',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
  {key:12,userName:12,PID:1,CPU:9999,MEM:9999,vmSize:13,vmRSS:13,status:'P',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
]

class ContainerProgress extends Component{
  constructor(props){
    super(props)
    this.getDataSource = this.getDataSource.bind(this)
    this.renderStatus = this.renderStatus.bind(this)
    this.state = {
      
    }
  }
  getDataSource (data) {
    data.map((item,index) => {
      item.CPU = item.CPU/100 + '%'
      item.MEM = item.MEM/100 + '%'
      
    })
    return data
  }
  renderStatus (text) {
    let status = text
    let IconColor = '#999'
    switch (text) {
      case 'R' :
        status = 'R (运行)'
        IconColor = '#2fba66'
        break
      case 'S' :
        status = 'S (休眠)'
        IconColor = '#4cb3f7'
        break
      case 'D' :
        status = 'D (不可中断)'
        IconColor = '#666'
        break
      case 'Z' :
        status = 'Z (僵死)'
        IconColor = '#fcb25c'
        break
      case 'T' :
        status = 'T (停止或追踪停止)'
        IconColor = '#f85a59'
        break
      case 't' :
        status = 't (追踪停止)'
        IconColor = '#f85a59'
        break
      case 'W' :
        status = 'W (进入内存交换)'
        break
      case 'X' :
        status = 'X (退出)'
        IconColor = '#7272fb'
        break
      case 'x' :
        status = 'x (退出)'
        IconColor = '#7272fb'
        break
      default :
        status = '其他'
        IconColor = '#999'
        break
    }
    return (
      <div><i className="statusIcon" style={{backgroundColor:IconColor}}/>{status}</div>
    )
  }
  componentWillMount() {
    const { cluster, containerName, getPodProcess } = this.props
    getPodProcess(cluster, containerName)
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
        render: (text,record,index) => this.renderStatus(text)
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
            <Tooltip title={text} placement="topLeft">
              <span className='cmdTab'>{text}</span>
            </Tooltip>
          )
        },
      },
    ]
    
    return (
      <div id='ContainerProgress'>
        <span className="titleSpan">进程信息</span>
        <Table
          columns={columns}
          dataSource={this.getDataSource(this.props.processList)}
          pagination={false}
        />
      </div>
    )
  }
}
function mapStateToProps (state, props) {
  let processList = []
  const result = state.containers.containerProcess
  if (result && result.isFetching === false && result.result.data.code === 200) {
    processList = result.result.data.data
  }
  return {
    processList,
  }
}
export default connect(mapStateToProps,{
  getPodProcess,
})(ContainerProgress)