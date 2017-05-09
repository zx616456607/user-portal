/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Resources Overview component
 *
 * v0.1 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import './style/clusterResourcesOverview.less'
import cpuImg from '../../assets/img/integration/cpu.png'
import hostImg from '../../assets/img/integration/host.png'
import memoryImg from '../../assets/img/integration/memory.png'
import ReactEcharts from 'echarts-for-react'
import { NOT_AVAILABLE } from '../../constants'
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip,  Row, Col, Tabs } from 'antd'
class ClusterResourcesOverview extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render(){
    console.log('this.props=',this.props)
    const { clusterSummary } = this.props
    const { containerOption } = this.props
    const { node, resource} = clusterSummary.static || {}
    const { useRate } = clusterSummary.dynamic || {}
    return <div id="cluster__resourcesoverview">
      <Row className="nodeList">
        <Col span={6} style={{padding:'0 8px'}}>
        <Card>
        <div style={{textAlign:'left'}} className="title">主机</div>
         <ul className="listText">
         <li>
         <span className="itemKey primary">总数</span>
         <span className="amount">{node ? `${node.nodeSum}` : NOT_AVAILABLE}</span>
        </li>
        <li>
         <span className="itemKey success">正常运行</span>
         <span className="amount">{node ? `${node.nodeRunning}` : NOT_AVAILABLE}</span>
        </li>
        <li>
         <span className="itemKey ready">可调度数</span>
         <span className="amount">{node ? `${node.schedulable}` : NOT_AVAILABLE}</span>
        </li>
        </ul>
        </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
         <Card>
           <div style={{textAlign:'left'}} className="title">CPU(核)</div>
           <ul className="listText">
             <li>
               <span className="itemKey primary">总数</span>
               <span className="amount">{resource ? `${resource.cupSum}` : NOT_AVAILABLE}</span>
             </li>
             <li>
               <span className="itemKey success">已分配数</span>
               <span className="amount">{resource ? `${resource.allocatedCPU}` : NOT_AVAILABLE}</span>
             </li>
             <li>
               <span className="itemKey ready">实际使用</span>
               <span className="amount">{useRate ? `${(useRate.cpu).toFixed(2)} %` : NOT_AVAILABLE}</span>
             </li>
           </ul>
         </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
         <Card>
           <div style={{textAlign:'left'}} className="title">内存(G)</div>
           <ul className="listText">
             <li>
               <span className="itemKey primary">总量</span>
               <span className="amount">{resource ? `${Math.ceil(resource.memSumByKB / 1024 / 1024 * 100) / 100}` : NOT_AVAILABLE}</span>
             </li>
             <li>
               <span className="itemKey success">已分配量</span>
               <span className="amount">{resource ? `${Math.ceil(resource.allocatedMemByKB / 1024 / 1024 * 100) / 100}` : NOT_AVAILABLE}</span>
             </li>
             <li>
               <span className="itemKey ready">实际使用</span>
               <span className="amount">{useRate ? `${Math.ceil(useRate.mem * 100) / 100}` : NOT_AVAILABLE}</span>
             </li>
           </ul>
         </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
         <Card>
           <div style={{textAlign:'left'}} className="title">容器</div>
           <ReactEcharts
             notMerge={true}
             option={containerOption}
             style={{height:'150px'}}
             showLoading={false}
           />
         </Card>
        </Col>
      </Row>
    </div>
  }
}

export default ClusterResourcesOverview