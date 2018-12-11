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
      label: <div title={deployment.metadata.name}>{deployment.metadata.name}</div>,
      labelMinor: deployment.metadata.annotations.allocatedIP,
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
          label: <div title={item.metadata.name}>{item.metadata.name}</div>,
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
    return (
      <div id="Topology" className="Topology">
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
