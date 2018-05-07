/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * ResourcesOverview of cluster
 *
 * 2018-05-07
 * @author zhangpc
 */

import React from 'react'
import { Row, Col, Card, Checkbox, Icon, Tooltip } from 'antd'
import ReactEcharts from 'echarts-for-react'
import { camelize } from 'humps'
import { NOT_AVAILABLE } from '../../constants'
import './style/ResourcesOverview.less'
import cpuImg from '../../assets/img/integration/cpu.png'
import hostImg from '../../assets/img/integration/host.png'
import memoryImg from '../../assets/img/integration/memory.png'
import { connect } from 'react-redux'
import { getClusterSummary } from '../../actions/cluster'

class ResourcesOverview extends React.Component {
  state = {
    loading: false,
  }

  getEchartsOptions = ({ data, tooltip, color, unit }) => ({
    tooltip: tooltip || {
      trigger: 'item',
      formatter: `{b} : {c} ${unit || '个'} ({d}%)`
    },
    legend: {
      orient : 'vertical',
      left : '50%',
      top : 'middle',
      data: data.map(({ name }) => ({ name })),
      formatter: function (name) {
        for (const item of data) {
          if (item.name === name) {
            return `${name}  ${item.value} ${unit || '个'}`
          }
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
    color: color || ['#46b3f8','#2abe84','#f6575e'],
    series: {
      type:'pie',
      selectedMode: 'single',
      avoidLabelOverlap: false,
      hoverAnimation: false,
      selectedOffset: 0,
      radius: ['32', '45'],
      center: ['25%', '50%'],
      data,
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
  })

  onCheckChange = async (e) => {
    this.setState({ loading: true })
    const query = {
      excludeTainted: e.target.checked,
    }
    const { cluster, getClusterSummary } = this.props
    try {
      await getClusterSummary(cluster.clusterID, query)
      this.setState({ loading: false })
    } catch (error) {
      this.setState({ loading: false })
    }
  }

  render() {
    const { clusterSummary } = this.props
    const { node = {}, pod, resource } = clusterSummary.static || {}
    const { useRate } = clusterSummary.dynamic || {}
    // container
    const podPending = pod ? pod[camelize('Pending')] : NOT_AVAILABLE
    const podRunning = pod ? pod[camelize('Running')] : NOT_AVAILABLE
    const podUnNormal = (pod && pod.unNormal) ? pod.unNormal : 0
    const containerOption = this.getEchartsOptions({
      data: [
        { value: podRunning, name:'运行中' },
        { value: podPending, name:'操作中' },
        { value: podUnNormal, name:'异   常', selected:true },
      ],
    })
    const cardTitle = <div>
      集群资源分配情况
      <Checkbox onChange={this.onCheckChange} disabled={this.state.loading}>
        仅显示计算节点&nbsp;
        <Tooltip title="计算节点指的是去除添加了 taint 的 node 节点">
          <Icon type="question-circle-o" />
        </Tooltip>
      </Checkbox>
    </div>
    return <Card title={cardTitle} className="resources-overview">
      <Row gutter={16}>
        <Col span={6}>
          <div className="title">主机状态</div>
          <div className="listImg">
            <img src={hostImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary">总&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数</span>
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
        </Col>
        <Col span={6}>
          <div className="title">CPU 分配</div>
          <div className="listImg">
            <img src={cpuImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary">总&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数</span>
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
        </Col>
        <Col span={6}>
          <div className="title">内存分配</div>
          <div className="listImg">
            <img src={memoryImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary">总&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;量</span>
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
        </Col>
        <Col span={6}>
          <div className="title">容器</div>
          <ReactEcharts
            notMerge={true}
            option={containerOption}
            style={{height:'150px'}}
            showLoading={false}
          />
        </Col>
      </Row>
    </Card>
  }
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps,  {
  getClusterSummary,
})(ResourcesOverview)
