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
import intlMsg from './ResourcesOverviewIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

class ResourcesOverview extends React.Component {
  state = {
    loading: false,
  }

  getEchartsOptions = ({ data, tooltip, color, unit }) => {
    const { intl: { formatMessage } } = this.props
    return ({
      tooltip: tooltip || {
        trigger: 'item',
        formatter: `{b} : {c} ${unit || formatMessage(intlMsg.a)} ({d}%)`
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data: data.map(({ name }) => ({ name })),
        formatter: function (name) {
          for (const item of data) {
            if (item.name === name) {
              return `${name}  ${item.value} ${unit || formatMessage(intlMsg.a)}`
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
  }

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
    const { clusterSummary, intl: { formatMessage } } = this.props
    const { node = {}, pod, resource } = clusterSummary.static || {}
    const { useRate } = clusterSummary.dynamic || {}
    // container
    const podPending = pod ? pod[camelize('Pending')] : NOT_AVAILABLE
    const podRunning = pod ? pod[camelize('Running')] : NOT_AVAILABLE
    const podUnNormal = (pod && pod.unNormal) ? pod.unNormal : 0
    const containerOption = this.getEchartsOptions({
      data: [
        { value: podRunning, name: formatMessage(intlMsg.running) },
        { value: podPending, name:formatMessage(intlMsg.inOperation) },
        { value: podUnNormal, name: formatMessage(intlMsg.abnormal), selected:true },
      ],
    })
    const cardTitle = <div>
      <FormattedMessage {...intlMsg.resourceAllocation}/>
      <Checkbox onChange={this.onCheckChange} disabled={this.state.loading}>
        <FormattedMessage {...intlMsg.onlyComputedNode}/>&nbsp;
        <Tooltip title={formatMessage(intlMsg.nodeType)}>
          <Icon type="question-circle-o" />
        </Tooltip>
      </Checkbox>
    </div>
    return <Card title={cardTitle} className="resources-overview">
      <Row gutter={16}>
        <Col span={6}>
          <div className="title"><FormattedMessage {...intlMsg.hostStatus}/></div>
          <div className="listImg">
            <img src={hostImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary justify">{formatMessage(intlMsg.total)}</span>
              <span>{node ? `${node.nodeSum} ${formatMessage(intlMsg.a)}` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey ready"><FormattedMessage {...intlMsg.adjustableDegree}/></span>
              <span>{node ? `${node.schedulable} ${formatMessage(intlMsg.a)}` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey success"><FormattedMessage {...intlMsg.normalOperation}/></span>
              <span>{node ? `${node.nodeRunning} ${formatMessage(intlMsg.a)}` : NOT_AVAILABLE}</span>
            </li>
          </ul>
        </Col>
        <Col span={6}>
          <div className="title"><FormattedMessage {...intlMsg.CPUDistribution}/></div>
          <div className="listImg">
            <img src={cpuImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary justify"><FormattedMessage {...intlMsg.total}/></span>
              <span>{resource ? `${resource.cupSum} ${formatMessage(intlMsg.core)}` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey ready"><FormattedMessage {...intlMsg.allocatedNumber}/></span>
              <span>{resource ? `${resource.allocatedCPU.toFixed(2)} ${formatMessage(intlMsg.core)}` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey success"><FormattedMessage {...intlMsg.actualUsage}/></span>
              <span>{useRate ? `${(useRate.cpu).toFixed(2)} %` : NOT_AVAILABLE}</span>
            </li>
          </ul>
        </Col>
        <Col span={6}>
          <div className="title"><FormattedMessage {...intlMsg.memoryAllocated}/></div>
          <div className="listImg">
            <img src={memoryImg}/>
          </div>
          <ul className="listText">
            <li>
              <span className="itemKey primary justify"><FormattedMessage {...intlMsg.totalAmount}/></span>
              <span>{resource ? `${Math.ceil(resource.memSumByKB / 1024 / 1024 * 100) / 100} G` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey ready"><FormattedMessage {...intlMsg.allocatedAmount}/></span>
              <span>{resource ? `${Math.ceil(resource.allocatedMemByKB / 1024 / 1024 * 100) / 100} G` : NOT_AVAILABLE}</span>
            </li>
            <li>
              <span className="itemKey success"><FormattedMessage {...intlMsg.actualUsage}/></span>
              <span>{useRate ? `${Math.ceil(useRate.mem * 100) / 100} G` : NOT_AVAILABLE}</span>
            </li>
          </ul>
        </Col>
        <Col span={6}>
          <div className="title"><FormattedMessage {...intlMsg.container}/></div>
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
})(injectIntl(ResourcesOverview, {
  withRef: true,
}))
