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
import { formatDate } from '../../common/tools'
import moment from 'moment'

const data = [
  {key:1,userName:1,PID:1,
    vmSize:13,vmRSS:13,
    status:'R',startTime:'11/11',cpuTime:'11/11',cmd:'/bin/sh',},
]

class ContainerProgress extends Component{
  constructor(props){
    super(props)
    this.getDataSource = this.getDataSource.bind(this)
    this.renderStatus = this.renderStatus.bind(this)
    this.bytesToSize = this.bytesToSize.bind(this)
    this.state = {

    }
  }
  bytesToSize(bytes) {
    if (bytes === 0) return '0 KB';
    let k = 1024,
      sizes = ['KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  }
  getDataSource (processList) {
    if (!Array.isArray(processList)) {
      return []
    }
    if(processList.length === 0){
      console.log('no')
      return
    }
    let items = JSON.parse(JSON.stringify(processList))
    console.log('processList',processList)
    items.map((item,index) => {
      item.cpuPercent = item.cpuPercent/100 + '%'
      item.memPercent = item.memPercent/100 + '%'
      item.vmSize = this.bytesToSize(item.vmSize)
      item.vmRSS = this.bytesToSize(item.vmRSS)
      item.startTime = formatDate(item.startTime)
      item.cpuTime = moment(item.cpuTime).format('HH:mm:ss')
    })
    return items
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
        dataIndex: 'pid',
        key: 'pid',
      },
      {
        title: 'CPU',
        dataIndex: 'cpuPercent',
        key: 'cpuPercent',
      },
      {
        title: 'MEM',
        dataIndex: 'memPercent',
        key: 'memPercent',
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
    const {processList} = this.props
    return (
      <div id='ContainerProgress'>
        <span className="titleSpan">进程信息</span>
        <Table
          columns={columns}
          dataSource={this.getDataSource(processList)}
          pagination={false}
        />
      </div>
    )
  }
}
function mapStateToProps (state, props) {
  let processList = []
  const result = state.containers.containerProcess
  try {
    processList = result.result.data.data
  }
  catch (e) {
    processList = []
  }
  return {
    processList,
  }
}
export default connect(mapStateToProps,{
  getPodProcess,
})(ContainerProgress)