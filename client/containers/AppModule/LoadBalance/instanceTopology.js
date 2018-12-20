/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * loadBanlance Topology component
 *
 * v0.1 - 2018-08-15
 * @author lvjunfeng
 */

import React from 'react'
import RelationChart from '@tenx-ui/relation-chart'
import { Button, Row, Col } from 'antd'
import { browserHistory } from 'react-router'
import './style/instanceTopology.less'

class Topology extends React.Component {
  state = {
    nodes: [],
    edges: [],
    config: {
      rankdir: 'TB',
      // nodesep: 50,
      edgesep: 200,
      // ranksep: 100,
      marginx: 100,
      marginy: 100,
    },
    loading: false,
  }

  componentDidMount = () => {
    const { nodes, edges } = this.getInitialData()
    this.setState({
      nodes,
      edges,
    })
  }

  getInitialData = () => {
    const { deployment, pods } = this.props.detail
    const nodes = []
    const edges = []
    nodes.push({
      id: deployment.metadata.name,
      label: <div title={deployment.metadata.name} className="text-overflow">
        {deployment.metadata.name}
      </div>,
      labelMinor: deployment.metadata.labels.agentType === 'HAOutside' ?
        `${deployment.metadata.annotations.allocatedIP} (vip)`
        : deployment.metadata.annotations.allocatedIP,
      width: 50,
      height: 50,
      size: 80,
      isAnimated: true,
      shape: 'square',
      color: '#5db75d',
      onClick: this.onClickNode,
    })
    pods.forEach(item => {
      if (item.metadata.labels.name === deployment.metadata.name) {
        nodes.push({
          id: item.metadata.name,
          label: <div title={item.metadata.name} className="text-overflow">
            {item.metadata.name}
          </div>,
          labelMinor: item.status.podIP || 'None',
          width: 50,
          height: 50,
          // size: 130,
          isAnimated: true,
          shape: 'circle',
          color: '#5db75d',
          onClick: this.onClickNode,
        })
        edges.push({
          source: item.metadata.labels.name,
          target: item.metadata.name,
          // withArrow: true,
          // arrowOffset: 38,
          // label: 'service',
          isAnimated: true,
          // color: '#5db75d',
        })
      }
    })
    return { nodes, edges }
  }

  onClickNode = (lname, e) => {
    e.stopPropagation();
    const { nodes } = this.state;
    const newNodes = [ ...nodes ]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active
      }
      if (n.id === lname) {
        n.active = true
      }
    })
    this.setState({ nodes: newNodes })
  }

  onRelationChartClick = () => {
    const { nodes } = this.state
    const newNodes = [ ...nodes ]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
    })
    this.setState({ nodes: newNodes })
  }

  render() {
    const { config, nodes, edges, loading } = this.state
    const { name, annotations: { displayName },
      labels: { agentType } } = this.props.detail.deployment.metadata
    const isHA = agentType === 'HAInside' || agentType === 'HAOutside'
    return (
      <div id="Topology" className="instanceTopology">
        <div className="topoTitle">
          <Row>
            <Col className="ant-col-6 title">{isHA && '多实例 (高可用)' || '单实例 (非高可用)' }</Col>
            {
              isHA ?
                <Col span={6}>
                  <Button
                    type="primary"
                    onClick={() => browserHistory.push(`/net-management/appLoadBalance/editLoadBalance?name=${name}&displayName=${displayName}`) }
                  >
                    扩展实例数
                  </Button>
                </Col>
                : null
            }
          </Row>
        </div>
        <RelationChart
          graphConfigs={config}
          nodes={nodes}
          edges={edges}
          loading = {loading}
          onSvgClick = {this.onRelationChartClick}
          SvgHeight = {'420px'}
        />
      </div>
    )
  }
}

export default Topology
