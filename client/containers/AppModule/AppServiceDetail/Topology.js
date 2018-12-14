/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Topology component
 *
 * v0.1 - 2018-08-15
 * @author lvjunfeng
 */

import React from 'react'
import RelationChart from '@tenx-ui/relation-chart'
import { connect } from 'react-redux'
import * as topologyAction from '../../../actions/appDetailTopology'
import './styles/Topology.less'

class Topology extends React.Component {

  state = {
    nodes: [],
    edges: [],
    config: {
      rankdir: 'TB',
      nodesep: 200,
      edgesep: 200,
      // ranksep: 100,
      marginx: 100,
      marginy: 100,
    },
    loading: false,
  }

  componentDidMount = async () => {
    const { nodes, edges } = await this.getInitialData()
    this.setState({
      nodes,
      edges,
    })
  }

  getInitialData = async () => {
    const { getTopologyPodList, getTopologyServiceList, cluster, appName } = this.props
    const podResult = await getTopologyPodList(cluster, appName)
    const pod = podResult.response.result.items
    const nodes = []
    const edges = []
    const servciceResult = await getTopologyServiceList(cluster, appName)
    const service = servciceResult.response.result.items
    service.forEach(item => {
      nodes.push({
        id: item.metadata.name,
        label: <div title={item.metadata.name}>{item.metadata.name}</div>,
        labelMinor: item.spec.clusterIP,
        width: 50,
        height: 50,
        size: 80,
        isAnimated: true,
        shape: 'square',
        color: '#5db75d',
        onClick: this.onClickNode,
      })
      pod.forEach(ele => {
        if (item.metadata.name === ele.metadata.labels['system/svcName']) {
          nodes.push({
            id: ele.metadata.name,
            label: <div title={ele.metadata.name}>{ele.metadata.name}</div>,
            labelMinor: ele.spec.nodeName || 'None',
            width: 50,
            height: 50,
            // size: 130,
            isAnimated: true,
            shape: 'circle',
            color: '#5db75d',
            onClick: this.onClickNode,
          })
          edges.push({
            source: ele.metadata.labels.name,
            target: ele.metadata.name,
            // withArrow: true,
            // arrowOffset: 38,
            // label: 'service',
            isAnimated: true,
            // color: '#5db75d',
          })
        }
      })
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

  onChange = e => {
    let config = this.state.config
    try {
      config = JSON.parse(e.target.value)
    } catch (error) {
      //
    }
    this.setState({
      config,
    })
  }

  onClick = () => {
    const { loading: newloading } = this.state
    this.setState({ loading: !newloading })
  }

  onRelationChartClick = () => {
    const { nodes } = this.state;
    const newNodes = [ ...nodes ];
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

const mapStateToProps = ({
  entities: { current },
  apps: { appDetail },
}) => {
  return {
    cluster: current.cluster.clusterID,
    appName: appDetail.app.name,
  }
}

export default connect(mapStateToProps, {
  getTopologyPodList: topologyAction.getTopologyPodList,
  getTopologyServiceList: topologyAction.getTopologyServiceList,
})(Topology)
