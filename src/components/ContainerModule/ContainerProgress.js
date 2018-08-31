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
import { FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerDetailIntl'

class ContainerProgress extends Component{
  constructor(props){
    super(props)
    this.getDataSource = this.getDataSource.bind(this)
    this.renderStatus = this.renderStatus.bind(this)
    this.renderCmd = this.renderCmd.bind(this)
    this.state = {

    }
  }
  bytesToSize(bytes) {
    if (bytes === 0) return '0 KB'
    let k = 1024
    let sizes = ['KB', 'MB', 'GB', 'TB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  }
  getDataSource (processList) {
    if (!Array.isArray(processList)) {
      return []
    }
    if(processList.length === 0){
      return []
    }
    let items = JSON.parse(JSON.stringify(processList))
    items.map((item,index) => {
      item.cpuPercent = item.cpuPercent/100 + '%'
      item.memPercent = item.memPercent/100 + '%'
      item.vmSize = this.bytesToSize(item.vmSize)
      item.vmRSS = this.bytesToSize(item.vmRSS)
      item.startTime = formatDate(item.startTime)
      item.cpuTime = this.formatSeconds(item.cpuTime)
    })
    return items
  }
  formatSeconds (time) {
    let h = parseInt(time / 3600)
    if (h < 10) {
      h = "0" + h
    }
    let m = parseInt((time - h*3600) / 60)
    if (m < 10) {
      m = "0" + m
    }
    let s = parseInt((time - h*3600) % 60)
    if (s < 10) {
      s = "0" + s
    }
    let length = h + ":" + m + ":" + s
    if (time >= 0) {
      return length
    } else {
      return "-"
    }
  }
  renderStatus (text) {
    const { formatMessage } = this.props.intl
    let status = text
    let IconColor = '#999'
    switch (text) {
      case 'R' :
        status = formatMessage(IntlMessages.pRunning)
        IconColor = '#2fba66'
        break
      case 'S' :
        status = formatMessage(IntlMessages.pSleeping)
        IconColor = '#4cb3f7'
        break
      case 'D' :
        status = formatMessage(IntlMessages.pUninterruptible)
        IconColor = '#666'
        break
      case 'Z' :
        status = formatMessage(IntlMessages.pDead)
        IconColor = '#fcb25c'
        break
      case 'T' :
        status = formatMessage(IntlMessages.pStop)
        IconColor = '#f85a59'
        break
      case 't' :
        status = formatMessage(IntlMessages.pTrackStop)
        IconColor = '#f85a59'
        break
      case 'W' :
        status = formatMessage(IntlMessages.pMemorySwap)
        break
      case 'X' :
        status = formatMessage(IntlMessages.pExit)
        IconColor = '#7272fb'
        break
      case 'x' :
        status = formatMessage(IntlMessages.pLowerExit)
        IconColor = '#7272fb'
        break
      default :
        status = formatMessage(IntlMessages.pOther)
        IconColor = '#999'
        break
    }
    return (
      <div><i className="statusIcon" style={{backgroundColor:IconColor}}/>{status}</div>
    )
  }
  renderCmd (text) {
    return (
      <Tooltip title={text} placement="topLeft">
        <div className='cmdTab'>
          {text}
        </div>
      </Tooltip>
    )
  }
  componentWillMount() {
    const { cluster, containerName, getPodProcess, container } = this.props
    const podContainers = container && container.spec && container.spec.containers || []
    const fistPodContainerName = podContainers[0] && podContainers[0].name
    getPodProcess(cluster, containerName, { container: fistPodContainerName })
  }

  render(){
    const { formatMessage } = this.props.intl
    const columns = [
      {
        title: formatMessage(IntlMessages.pUser),
        dataIndex: 'userName',
        key: 'userName',
        width:'7%',
      },
      {
        title: 'PID',
        dataIndex: 'pid',
        key: 'pid',
        width:'6%'
      },
      {
        title: 'CPU',
        dataIndex: 'cpuPercent',
        key: 'cpuPercent',
        width:'7%'
      },
      {
        title: formatMessage(IntlMessages.virtualMemory),
        dataIndex: 'vmSize',
        key: 'vmSize',
        width:'11%'
      },
      {
        title: formatMessage(IntlMessages.physicalMemory),
        dataIndex: 'vmRSS',
        key: 'vmRSS',
        width:'11%'
      },
      {
        title: formatMessage(IntlMessages.pStatus),
        dataIndex: 'status',
        key: 'status',
        render: (text,record,index) => this.renderStatus(text),
        width:'13%'
      },
      {
        title: formatMessage(IntlMessages.pStartTime),
        dataIndex: 'startTime',
        key: 'startTime',
        width:'140px',
      },
      {
        title: formatMessage(IntlMessages.pCpuTime),
        dataIndex: 'cpuTime',
        key: 'cpuTime',
        width:'12%'
      },
      {
        title: formatMessage(IntlMessages.pCmd),
        dataIndex: 'cmd',
        key: 'cmd',
        width: '18%',
        render: (text,record,index) => this.renderCmd(text),
      },
    ]
    const { processList, isFetching } = this.props
    return (
      <div id='ContainerProgress'>
        <span className="titleSpan">
          <FormattedMessage {...IntlMessages.pInfo} />
        </span>
        <Table
          columns={columns}
          dataSource={this.getDataSource(processList)}
          pagination={false}
          loading={isFetching}
        />
      </div>
    )
  }
}
function mapStateToProps (state, props) {
  const { containerName } = props
  const { containers } = state
  const { containerProcess } = containers
  const { isFetching = true } = containerProcess
  const processList = containerProcess[containerName]
  return {
    processList,
    isFetching,
  }
}
export default connect(mapStateToProps,{
  getPodProcess,
})(ContainerProgress)