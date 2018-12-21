/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Tab List component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tabs } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import ClusterResourcesOverview from './clsuterResourcesOverview'
import HostList from './hostList'
import ClusterLabelManage from './clusterLabelManage'
import NetworkSolutions from './NetworkSolutions'
import ClusterStorage from './ClusterStorage'
import { injectIntl, FormattedMessage } from 'react-intl'
import {
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
  getClusterLabel,
  getAllClusterNodes,
} from '../../actions/cluster_node'
import { getClusterSummary } from '../../actions/cluster'
import { addTerminal } from '../../actions/terminal'
import './style/clusterTabList.less'
import NotificationHandler from '../../components/Notification'
import { camelize } from 'humps'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import CreateAlarm from '../AppModule/AlarmModal'
import CreateGroup from '../AppModule/AlarmModal/CreateGroup'
import TenxIcon from '@tenx-ui/icon/es/_old'
import intlMsg from './indexIntl'
import ClusterSet from './ClusterSet'
import ClusterSysServiceManage from '../../../client/containers/ClusterSysServiceManage'

const TabPane = Tabs.TabPane;

class ClusterTabList extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.openTerminalModal = this.openTerminalModal.bind(this);
    this.handleAddClusterNode = this.handleAddClusterNode.bind(this)
    this.copyAddNodeCMD = this.copyAddNodeCMD.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.handleCallbackActiveKey = this.handleCallbackActiveKey.bind(this)
    this.state = {
      currentContainer: [],
      addClusterOrNodeModalVisible: false,
      deleteNode: null,
      copyAddNodeSuccess: false,
      step: 1,// create alarm modal step
      TabsactiveKey: 1,
    }
  }

  loadData(props) {
    const { clusterID, getKubectlsPods, cluster } = props || this.props
    if (cluster.createStatus !== 3) {
      getKubectlsPods(clusterID)
    }
  }

  componentWillMount() {
    const { getAllClusterNodes, clusterID, location, cluster } = this.props
    if (cluster.createStatus !== 3) {
      getAllClusterNodes(clusterID)
    }
    this.setState({
      TabsactiveKey: 1,
    })
    if (location.query.tab === 'cluster_set') {
      this.setState({
        TabsactiveKey: location.query.tab,
      })

    }
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { clusterID } = nextProps
    if (clusterID === this.props.clusterID) {
      return
    }
    this.loadData(nextProps)
  }

  async componentDidMount() {
    const { clusterID, getAddNodeCMD, getClusterSummary, location, cluster } = this.props
    if(location &&　location.query.from == "clusterDetail"){
      this.setState({
        TabsactiveKey: "host"
      })
    }
    if(location &&　location.query.from === 'sysServiceManageDetail'){
      this.setState({
        TabsactiveKey: "sysServiceManage"
      })
    }
    const key = window.location.hash && window.location.hash.split('#')[1].split('/')[1]
    if (key){
      this.handleTabsSwitch(key)
    }
    if (cluster.createStatus !== 3) {
      getAddNodeCMD(clusterID)
    }
    await getClusterSummary(clusterID)
  }

  copyAddNodeCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById('addClusterOrNodeCMDInput')
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyAddNodeSuccess: true
    })
  }


  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }

  openTerminalModal() {
    const { kubectlsPods, addTerminal, clusterID, intl: { formatMessage } } = this.props
    let { currentContainer } = this.state;
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods
    if (!pods || pods.length === 0) {
      notification.warn(formatMessage(intlMsg.noAvailableTermNode))
      return
    }
    let randomPodNum = Math.ceil(Math.random() * pods.length)
    if (randomPodNum === 0) randomPodNum = 1
    currentContainer = [{
      metadata: {
        namespace,
        name: pods[randomPodNum - 1]
      }
    }]
    addTerminal(clusterID, currentContainer[0])
    this.setState({
      currentContainer,
    })
  }

  handleAddClusterNode() {
    this.setState({
      addClusterOrNodeModalVisible: true,
    })
  }

  handleTabsSwitch(key) {
    this.setState({
      TabsactiveKey: key
    })
    if (key === 'labels') {
      this.props.getClusterLabel(this.props.clusterID)
    }
  }

  handleCallbackActiveKey(type,labels) {
    let summary = labels || []
    this.setState({
      TabsactiveKey: type,
      summary
    })
  }

  render() {
    const {
      intl, isFetching, nodes,
      clusterID, memoryMetric, cpuMetric,
      license, kubectlsPods, addNodeCMD,
      cluster, clusterSummary,
    } = this.props
    const { formatMessage } = intl;
    const { podCount, deleteNode, copyAddNodeSuccess, TabsactiveKey } = this.state;
    const rootscope = this.props.scope;
    const scope = this;
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    const maxNodes = license && license[camelize('max_nodes')]
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    return (
      <QueueAnim className='clusterTabListBox'
        type='right'
        >
        <div id='clusterTabList'>
          <Tabs activeKey={TabsactiveKey} onChange={this.handleTabsSwitch}>

            <TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="instrument-o"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.sourceOverview}/></span></div>} key="1">
            <ClusterResourcesOverview
              cluster={cluster}
              clusterSummary={clusterSummary}
            />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="hostlists-o"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.hostList}/></span></div>} key="host">
              <HostList
                cluster={cluster}
                clusterID={clusterID}
                summary={this.state.summary}
                callbackActiveKey={this.handleCallbackActiveKey}
                activeKey={TabsactiveKey}
                license={license}
              />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="tag-right"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.labelManage}/></span></div>} key="labels">
              <ClusterLabelManage callbackActiveKey={this.handleCallbackActiveKey}  clusterID={clusterID} />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="network"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.networkSolution}/></span></div>} key="5">
              <NetworkSolutions
                cluster={cluster}
                clusterID={clusterID}
              />
            </TabPane>
            <TabPane
              tab={<div className='tablepanediv'>
                <i className="fa fa-hdd-o size" aria-hidden="true"/>
                <span className="tablepanespan"><FormattedMessage {...intlMsg.clusterStorage}/></span>
              </div>}
              key="cluster_storage"
            >
              <ClusterStorage
                cluster={cluster}
              />
            </TabPane>
            <TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="setting-o"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.clusterSet}/></span></div>}
               key="cluster_set">
            <ClusterSet
              cluster={cluster}
            />
            </TabPane>
            {/*<TabPane tab={<div className='tablepanediv'>
              <TenxIcon type="AppsO"/>
              <span className='tablepanespan'><FormattedMessage {...intlMsg.sysServiceManage}/></span></div>}
                     key="sysServiceManage">
              <ClusterSysServiceManage
                cluster={cluster}
              />
            </TabPane>*/}
          </Tabs>

          <AddClusterOrNodeModal
            title={formatMessage(intlMsg.addHostNode)}
            visible={this.state.addClusterOrNodeModalVisible}
            closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
            CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
            bottomContent={<p><FormattedMessage {...intlMsg.addClusterOrNodeNote}/></p>} />

          <Modal title={formatMessage(intlMsg.createAlarmStrategy)} visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal:false})}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}/>
          </Modal>
          {/* 通知组 */}
          <Modal title={formatMessage(intlMsg.createNewNotiGroup)} visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc}/>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ClusterTabList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  // const pods = {
  //   nodes: {},
  //   isFetching: false
  // }
  const clusterID = props.cluster.clusterID
  // const { getAllClusterNodes, kubectlsPods, addNodeCMD } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  // const targetAllClusterNodes = getAllClusterNodes[clusterID]
  // const { isFetching } = targetAllClusterNodes || pods
  // const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  // const { cpuMetric, memoryMetric, license } = data
  // const nodes = data.clusters ? data.clusters.nodes : []
  return {
  //   nodes,
  //   cpuMetric,
  //   memoryMetric,
  //   license,
  //   isFetching,
    clusterID,
  //   kubectlsPods: (kubectlsPods ? kubectlsPods.result : {}) || {},
  //   addNodeCMD: addNodeCMD[clusterID] || {},
    clusterSummary: (clusterSummary && clusterSummary[clusterID] ? clusterSummary[clusterID].summary : {}) || {},
  }
}

export default connect(mapStateToProps, {
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
  getClusterSummary,
  addTerminal,
  getClusterLabel,
  getAllClusterNodes,
})(injectIntl(ClusterTabList, {
  withRef: true,
}))
