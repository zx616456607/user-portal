/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerGraph component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { DatePicker } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { formateDate } from '../../common/tools'
import "./style/ContainerGraph.less"
import { loadContainerLogs } from '../../actions/app_manage'

class ContainerGraph extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDate: formateDate(new Date(), 'YYYY-MM-DD'),
      pageIndex: 1,
      pageSize: 50
    }
  }
  componentWillMount() {
    const cluster = this.props.cluster
    const containerName = this.props.containerName
    this.props.loadContainerLogs(cluster, containerName, {
      size: 50
    })
    this.setState({
      pageIndex: 1
    })
  }
  moutseRollLoadLogs() {
    const cluster = this.props.cluster
    const containerName =  this.props.containerName
    this.props.loadContainerLogs(cluster, containerName, {
      from: (pageIndex - 1) * pageSize,
      size: pageSize,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate
    })
  }
  changeCurrentDate(data) {
    const cluster = this.props.cluster
    const containerName = this.props.containerName
    this.setState({
      currentDate: format(date, 'YYYY-MM-DD')
    })
    this.prop.loadContainerLogs(cluster, containerName, {
      from: (pageIndex - 1) * pageSize,
      size: pageSize
    })
    this.setState({
      pageIndex: 1
    })
  }
  getLogs() {
    const cluster = this.props.cluster
    if(!this.props.containerLogs[cluster].logs) {
      return ''
    }
    const logs = this.props.containerLogs[cluster].logs.data
    if(!logs) return ''
    return logs.map(log => {
       <span>{log.log}</span>
    })
  }
  render() {
    return (
      <div id="ContainerGraph">
        <div className="bottomBox"
          <div className="introBox">
            <div className="operaBox">
              <i className="fa fa-expand"></i>
              <i className="fa fa-refresh"></i>
              <DatePicker className="datePicker" onChange={(date)=> this.changeCurrentDate(date)} value={this.state.currentDate}/>
            </div>
            <div className="infoBox">
            { this.getLogs() }
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    containerLogs: state.containers.containerLogs
  }
}
ContainerGraph = connect(mapStateToProps, {
  loadContainerLogs
})(ContainerGraph)
export default ContainerGraph