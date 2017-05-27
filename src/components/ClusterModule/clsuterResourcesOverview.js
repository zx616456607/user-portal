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
import { Row, Col, Card } from 'antd'
import './style/clusterResourcesOverview.less'
import ClusterInfo from './ClusterInfo'
import NetworkConfiguration from './NetworkConfiguration'
import cpuImg from '../../assets/img/integration/cpu.png'
import hostImg from '../../assets/img/integration/host.png'
import memoryImg from '../../assets/img/integration/memory.png'
import { NOT_AVAILABLE } from '../../constants'
import { camelize } from 'humps'
import ReactEcharts from 'echarts-for-react'


class ClusterResourcesOverview extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render(){
    const {
      intl, isFetching, nodes,
      clusterID, memoryMetric, cpuMetric,
      license, kubectlsPods, addNodeCMD,
      cluster, clusterSummary,
    } = this.props
    const { node, pod, resource } = clusterSummary.static || {}
    const { useRate } = clusterSummary.dynamic || {}
    let podPending = pod ? pod[camelize('Pending')] : NOT_AVAILABLE
    let podRunning = pod ? pod[camelize('Running')] : NOT_AVAILABLE
    let podUnNormal = (pod && pod.unNormal) ? pod.unNormal : NOT_AVAILABLE
    //if (pod) {
    //  pod.sum = pod[camelize('Failed')] + pod[camelize('Pending')] + pod[camelize('Running')] + pod[camelize('Unknown')]
    //  pod.unNormal = pod[camelize('Failed')] + pod[camelize('Unknown')]
    //}
    let containerOption = {
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name: '运行中'}, {name: '操作中'}, {name: '异   常'}],
        formatter: function (name) {
          if(name === '操作中'){
            return name + '  ' + podPending + ' 个'
          } else if (name === '运行中') {
            return  '运行中  '  + podRunning + ' 个'
          } else if (name === '异   常') {
            return name + '  ' + podUnNormal + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8','#2abe84','#f6575e'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:podRunning, name:'运行中'},
          {value:podPending, name:'操作中'},
          {value:podUnNormal, name:'异   常',selected:true},
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: true,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    return <div id="cluster__resourcesoverview">
      <ClusterInfo cluster={cluster}/>

      <NetworkConfiguration id="Network" cluster={cluster}/>

      <Row className="nodeList">
        <Col span={6} style={{padding:'0 8px'}}>
          <Card>
            <div className="title">主机</div>
            <div className="listImg">
              <img src={hostImg}/>
            </div>
            <ul className="listText">
              <li>
                <span className="itemKey primary">总数</span>
                <span>{node ? `${node.nodeSum} 个` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey ready">可调度数</span>
                <span>{node ? `${node.schedulable} 个` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey success">正常运行</span>
                <span>{node ? `${node.nodeRunning} 个` : NOT_AVAILABLE}</span>
              </li>
            </ul>
          </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
          <Card>
            <div className="title">CPU</div>
            <div className="listImg">
              <img src={cpuImg}/>
            </div>
            <ul className="listText">
              <li>
                <span className="itemKey primary">总数</span>
                <span>{resource ? `${resource.cupSum} 核` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey ready">已分配数</span>
                <span>{resource ? `${resource.allocatedCPU.toFixed(2)} 核` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey success">实际使用</span>
                <span>{useRate ? `${(useRate.cpu).toFixed(2)} %` : NOT_AVAILABLE}</span>
              </li>
            </ul>
          </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
          <Card>
            <div className="title">内存</div>
            <div className="listImg">
              <img src={memoryImg}/>
            </div>
            <ul className="listText">
              <li>
                <span className="itemKey primary">总量</span>
                <span>{resource ? `${Math.ceil(resource.memSumByKB / 1024 / 1024 * 100) / 100} G` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey ready">已分配量</span>
                <span>{resource ? `${Math.ceil(resource.allocatedMemByKB / 1024 / 1024 * 100) / 100} G` : NOT_AVAILABLE}</span>
              </li>
              <li>
                <span className="itemKey success">实际使用</span>
                <span>{useRate ? `${Math.ceil(useRate.mem * 100) / 100} G` : NOT_AVAILABLE}</span>
              </li>
            </ul>
          </Card>
        </Col>
        <Col span={6} style={{padding:'0 8px'}}>
          <Card>
            <div className="title">容器</div>
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