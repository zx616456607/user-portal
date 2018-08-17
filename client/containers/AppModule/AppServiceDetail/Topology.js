/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Topology component
 *
 * v0.1 - 2018-
 * @author
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
      rankdir: 'LR',
      nodesep: 150,
      edgesep: 150,
      ranksep: 300,
      marginx: 100,
      marginy: 100,
    },
    loading: false,
  }

  componentDidMount = async () => {
    const { nodes, edges } = await this.getInitialData()
    // const { nodes, edges } = formateNodesEdges(this.onClickNode);
    this.setState({
      nodes,
      edges,
    })
  }

  getInitialData = async () => {
    const { getTopologyPodList, getTopologyServiceList, cluster, appName } = this.props
    const podResult = await getTopologyPodList(cluster, appName)
    const pod = podResult.response.result.items[0]
    const nodes = []
    const edges = []
    const servciceResult = await getTopologyServiceList(cluster, appName)
    const service = servciceResult.response.result.items[0]
    nodes.push({
      id: service.metadata.name,
      label: service.metadata.name,
      labelMinor: service.spec.clusterIP,
      width: 100,
      height: 50,
      size: 130,
      // onClick,
      isAnimated: true,
      shape: 'square',
      // TenxNode: TenxNodeFactory(' ', service.metadata.name, service.spec.clusterIP),
      color: '#5db75d',
      labelOffset: 10,
    })
    nodes.push({
      id: pod.metadata.name,
      label: pod.metadata.name,
      labelMinor: pod.spec.nodeName,
      width: 50,
      height: 50,
      size: 130,
      // onClick: this.onClick,
      isAnimated: true,
      shape: 'square',
      // TenxNode: TenxNodeFactory(' ', pod.metadata.name, pod.spec.nodeName),
      color: '#5db75d',
      labelOffset: 20,
    })
    // edges.push({
    //   source: pod.metadata.name,
    //   target: service.metadata.name,
    //   // withArrow: true,
    //   arrowOffset: 10,
    //   // label: 'pod',
    //   isAnimated: true,
    // })
    edges.push({
      source: service.metadata.name,
      target: pod.metadata.name,
      // withArrow: true,
      arrowOffset: 25,
      // label: 'service',
      isAnimated: true,
      // color: '#5db75d',
    })
    return { nodes, edges }
  }
  onClickNode = (lname, e) => {
    e.stopPropagation();
    const { nodes } = this.state;
    const newNodes = [ ...nodes ]
    newNodes.forEach(n => {
      if (n.active !== undefined) {
        delete n.active;
      }
      if (n.id === lname) {
        n.active = true;
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
