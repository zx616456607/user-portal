/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor panel component
 *
 * v0.1 - 2017-12-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Button, Spin } from 'antd'
import './style/index.less'
import PanelContent from './PanelContent'
import PanelModal from './PanelModal'
import MonitorChartModal from './MonitorChartModal'
import { getPanelList, createPanel, updatePanel, getChartList } from '../../../actions/manage_monitor'

const TabPane = Tabs.TabPane;

class MonitorPanel extends React.Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.closePanelModal = this.closePanelModal.bind(this)
    this.openPanelModal = this.openPanelModal.bind(this)
    this.openChartModal = this.openChartModal.bind(this)
    this.closeChartModal = this.closeChartModal.bind(this)
    this.onChange = this.onChange.bind(this)
    this.getPanes = this.getPanes.bind(this)
    this.state = {
      activeKey: ''
    }
  }
  
  componentDidMount() {
    const { getPanelList, clusterID, getChartList } = this.props
    getPanelList(clusterID, {
      success: {
        func: res => {
          const panels = res.data.panels
          if (panels && panels.length) {
            this.setState({
              activeKey: panels[0]['iD']
            })
            getChartList(clusterID, {
              panel_id: panels[0]['iD']
            })
          }
        },
        isAsync: true
      }
    })
  }
  
  getPanes() {
    const { getPanelList, clusterID } = this.props
    getPanelList(clusterID)
  }
  
  onChange(activeKey) {
    const { getChartList, clusterID } = this.props
    this.setState({ activeKey });
    getChartList(clusterID, {
      panel_id: activeKey
    })
  }
  openPanelModal(currentPanel) {
    this.setState({
      panelModal: true,
      currentPanel,
    })
  }
  closePanelModal() {
    this.setState({
      panelModal: false,
      currentPanel: null
    })
  }
  
  openChartModal(panel_id,currentChart) {
    this.setState({
      chartModal: true,
      currentChart,
      panel_id
    })
  }
  
  closeChartModal() {
    this.setState({
      chartModal: false,
      currentChart: null
    })
  }
  
  render() {
    const { panels, clusterID, isFetching } = this.props
    const { activeKey, panelModal, currentPanel, chartModal, currentChart, panel_id } = this.state
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    const panelFunc = {
      closeModal: this.closePanelModal,
      getPanes: this.getPanes,
      currentPanel,
      visible: panelModal,
      clusterID,
      activeKey
    }
    const chartFunc = {
      closeModal: this.closeChartModal,
      visible: chartModal,
      currentChart,
      panel_id,
      clusterID
    }
    const contentFunc = {
      openModal: this.openPanelModal, 
      openChartModal: this.openChartModal,
      clusterID,
      activeKey
    }
    return (
      <div className="monitorPanel">
        <Button type="primary" size="large" className="addMonitorBtn pointer" onClick={() => this.openPanelModal(null)} icon="plus">添加监控面板</Button>
        {
          panelModal &&
          <PanelModal
            {...panelFunc}
          />
        }
        {
          chartModal &&
          <MonitorChartModal
            {...chartFunc}
          />
        }
        {
          panels && panels.length &&
          <Tabs
            className="monitorTabs"
            hideAdd
            onChange={this.onChange}
            activeKey={activeKey}
            type="editable-card"
          >
            {
              panels.map(pane => <TabPane tab={pane.name} key={pane.iD}>{<PanelContent currentPanel={pane} {...contentFunc}/>}</TabPane>)
            }
          </Tabs>
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { entities, manageMonitor } = state
  const { cluster } = entities.current
  const { clusterID } = cluster
  const { monitorPanel } = manageMonitor
  const { panels, isFetching } = monitorPanel || { panels: {}}
  return {
    clusterID,
    panels,
    isFetching
  }
}

export default connect(mapStateToProps, {
  getPanelList,
  createPanel, 
  updatePanel,
  getChartList
})(MonitorPanel)