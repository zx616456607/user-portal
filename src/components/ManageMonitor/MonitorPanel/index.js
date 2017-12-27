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
import { Tabs, Button } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import './style/index.less'
import PanelContent from './PanelContent'
import PanelModal from './PanelModal'
import MonitorChartModal from './MonitorChartModal'

const TabPane = Tabs.TabPane;

class MonitorPanel extends React.Component {
  constructor(props) {
    super(props)
    this.add = this.add.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onEdit = this.onEdit.bind(this)
    this.remove = this.remove.bind(this)
    this.closePanelModal = this.closePanelModal.bind(this)
    this.openPanelModal = this.openPanelModal.bind(this)
    this.editPanel = this.editPanel.bind(this)
    this.openChartModal = this.openChartModal.bind(this)
    this.closeChartModal = this.closeChartModal.bind(this)
    this.newTabIndex = 0;
    let btnGroupFunc = {
      openModal: this.openPanelModal,
      openChartModal: this.openChartModal
    }
    const panes = [
      { 
        title: '出口监控', 
        content: <PanelContent
          currentPanel={{ title: '出口监控', key: '1' }}
          btnGroupFunc={btnGroupFunc}
        />, 
        key: '1' 
      }
    ];
    this.state = {
      activeKey: panes[0].key,
      panes,
    }
  }
  onChange(activeKey) {
    this.setState({ activeKey });
  }
  onEdit(targetKey, action) {
    this[action](targetKey);
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
  add(title) {
    let btnGroupFunc = {
      openModal: this.openPanelModal,
      openChartModal: this.openChartModal
    }
    const panes = this.state.panes;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ 
      title: title, 
      content: <PanelContent 
        currentPanel={{ title, key: activeKey }}
        btnGroupFunc={btnGroupFunc}/>, 
      key: activeKey });
    this.setState({ panes, activeKey });
  }
  editPanel(title, activeKey) {
    const panes = cloneDeep(this.state.panes);
    panes.forEach(item => {
      if (item.key === activeKey) {
        item.title = title
      }
    })
    this.setState({
      panes,
    })
  }
  
  remove(targetKey) {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  }
  
  openChartModal(currentChart) {
    this.setState({
      chartModal: true,
      currentChart,
    })
  }
  
  closeChartModal() {
    this.setState({
      chartModal: false,
      currentChart: null
    })
  }
  
  render() {
    const { panes, panelModal, currentPanel, chartModal, currentChart } = this.state
    const panelFunc = {
      closeModal: this.closePanelModal,
      addPanel: this.add,
      editPanel: this.editPanel,
      removePanel: this.remove,
    }
    const chartFunc = {
      closeModal: this.closeChartModal,
    }
    return (
      <div className="monitorPanel">
        <Button type="primary" size="large" className="addMonitorBtn pointer" onClick={() => this.openPanelModal(null)} icon="plus">添加监控</Button>
        {
          panelModal &&
          <PanelModal
            visible={panelModal}
            currentPanel={currentPanel}
            callbackFunc={panelFunc}
          />
        }
        {
          chartModal &&
          <MonitorChartModal
            visible={chartModal}
            currentChart={currentChart}
            chartFunc={chartFunc}
          />
        }
        <Tabs
          className="monitorTabs"
          hideAdd
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(MonitorPanel)