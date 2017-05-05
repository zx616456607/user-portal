/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Card, Button, Tooltip, Icon, Input, Select, Spin, Menu, Dropdown, Switch, Tag, Modal, Form } from 'antd'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {  getAllClusterNodes, getKubectlsPods } from '../../actions/cluster_node'
import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import TagDropdown from './tagDropdown'

import './style/hostList.less'
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'
const SubMenu = Menu.SubMenu;

function diskFormat(num) {
  if (num < 1024) {
    return num + 'KB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'MB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'GB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  return num + 'TB'
}

function getContainerNum(name, podList) {
  //this function for return the container num of node
  let num;
  podList.map((pod) => {
    if (pod.name == name) {
      num = pod.count;
    }
  });
  return num;
}

function cpuUsed(cpuTotal, cpuMetric, name) {
  name = camelize(name)
  if (!cpuMetric || !cpuMetric[name]) {
    return NOT_AVAILABLE
  }
  return `${cpuMetric[name].toFixed(2)}%`
}

function memoryUsed(memoryTotal, memoryMetric, name) {
  name = camelize(name)
  if (!memoryMetric || !memoryMetric[name]) {
    return NOT_AVAILABLE
  }
  let metric = memoryMetric[name]
  metric = metric / 1024 / memoryTotal * 100
  metric = `${metric.toFixed(2)}%`
  return metric
}

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope } = this.props;
    const { clusterID, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: () => {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? '开启调度成功' : '关闭调度成功');
          nodeList.map((item) => {
            if (item.objectMeta.name == node) {
              item.schedulable = e;
            }
          });
          scope.setState({
            nodeList: nodeList
          })
        },
        isAsync: true
      }
    })
  },
  ShowDeleteClusterNodeModal(node) {
    //this function for delete cluster node
    const { scope } = this.props;
    scope.setState({
      deleteNode: node,
      deleteNodeModal: true
    })
  },
  render: function () {
    const { isFetching, containerList, nodeList, cpuMetric, memoryMetric, clusterID, license } = this.props
    const root = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (nodeList.length === 0) {
      return (
        <div style={{ lineHeight: '100px', height: '200px', paddingLeft: '30px' }}>您还没有主机，去创建一个吧！</div>
      )
    }
    const maxNodes = license[camelize('max_nodes')]
    let items = nodeList.map((item, index) => {
      const dropdown = (
        <Menu disabled={item.isMaster ? true : false}
          onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
          style={{ width: '100px' }}
        >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={index} >
          {/*<div className='podDetail' key={`${item.objectMeta.name}-${index}`} >*/}
          <div className='name commonTitle'>
            <Link to={`/cluster/${clusterID}/${item.objectMeta.name}`}>{item.objectMeta.name}</Link>
          </div>
          <div className='status commonTitle'>
            <span className={item.ready == 'True' ? 'runningSpan' : 'errorSpan'}><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>
          </div>
          <div className='role commonTitle'>
            <Tooltip title={item.isMaster ? MASTER : SLAVE}>
              <span>{item.isMaster ? MASTER : SLAVE}</span>
            </Tooltip>
          </div>
          <div className='container commonTitle'>
            <span>{getContainerNum(item.objectMeta.name, containerList)}</span>
          </div>
          <div className='cpu commonTitle'>
            <div className='topSpan'>{item[camelize('cpu_total')] / 1000}核</div>
            <div className='bottomSpan'>{cpuUsed(item[camelize('cpu_total')], cpuMetric, item.objectMeta.name)}</div>
          </div>
          <div className='memory commonTitle'>
            <div className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</div>
            <div className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</div>
          </div>
          <div className='disk commonTitle'>
            <div className='topSpan'>{'-'}</div>
            <div className='bottomSpan'>{'-'}</div>
          </div>
          <div className='schedule commonTitle'>
            <Switch
              className='switchBox'
              defaultChecked={item.schedulable}
              checkedChildren='开'
              unCheckedChildren='关'
              disabled={index >= maxNodes}
              onChange={this.changeSchedulable.bind(root, item.objectMeta.name)} />
            <span className='scheduleSpan'>
              {
                item.schedulable
                  ? (
                    <span>
                      正常调度&nbsp;
                    <Tooltip title={`允许分配新容器`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )
                  : (
                    <span>
                      暂停调度&nbsp;
                    <Tooltip title={`不允许分配新容器，正常运行的不受影响`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )
              }
            </span>
          </div>
          <div className='runningTime commonTitle'>
            <Tooltip title={calcuDate(item.objectMeta.creationTimestamp)}>
              <span>{calcuDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='startTime commonTitle'>
            <Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>
              <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='opera commonTitle'>
            <Dropdown.Button type="ghost" overlay={dropdown} onClick={() => browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='imageList'>
        {items}
      </div>
    );
  }
});


class hostList extends Component {
  constructor(props) {
    super(props)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.state = {
      addClusterOrNodeModalVisible:false,
      nodeList: [],
      podCount: [],
      currentContainer:[],
      manageLabelContainer:[],
      manageLabelModal : false
    }
  }

  loadData() {
    const { clusterID } = this.props
    this.props.getAllClusterNodes(clusterID, {
      success: {
        func: (result) => {
          let nodeList = result.data.clusters.nodes.nodes;
          let podCount = result.data.clusters.podCount;
          this.setState({
            nodeList: nodeList,
            podCount: podCount
          })
        },
        isAsync: true
      }
    })
    this.props.getKubectlsPods(clusterID)
  }
  componentWillMount() {
    this.loadData()
  }
  searchNodes() {
    //this function for search nodes
    let search = document.getElementsByClassName('searchInput')[0].value
    const { nodes } = this.props;
    if (search.length == 0) {
      this.setState({
        nodeList: nodes.nodes
      })
      return;
    }
    let nodeList = [];
    nodes.nodes.map((node) => {
      if (node.objectMeta.name.indexOf(search) > -1) {
        nodeList.push(node);
      }
    });
    this.setState({
      nodeList: nodeList
    });
  }
  openTerminalModal(item, e) {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state;
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods.result
    if (!pods || pods.length === 0) {
      notification.warn('没有可用终端节点，请联系管理员')
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
  formMenudata(){
    return  <Menu onClick={this.handlelabelvalue} className='selectMenu' >
      <Menu.Item className='selectMenutitle'>
        <div>标签键</div>
      </Menu.Item>
      <Menu.Divider />
      <SubMenu title="key(系统)">
        <Menu.Item className='selectMenutitle'>
          <div>标签值</div>
        </Menu.Item>
        <Menu.Item className='selectMenuSecond'>
          <Tooltip title="vlaue2017123123131312">
            <div className='name'>vlaue2017123123131312</div>
          </Tooltip>
          <div className='num'>(<span>10</span>)</div>
          <div className='select'><Icon type="check-circle-o" /></div>
        </Menu.Item>
        <Menu.Item className='selectMenuSecond'>
          <Tooltip title="vlaue2016">
            <div className='name'>vlaue2016</div>
          </Tooltip>
          <div className='num'>(<span>8</span>)</div>
          <div className='select'><Icon type="check-circle-o" /></div>
        </Menu.Item>
      </SubMenu>
      <SubMenu title="key1">
        <Menu.Item className='selectMenutitle'>
          <div>标签值</div>
        </Menu.Item>
        <Menu.Item className='selectMenuSecond'>
          <Tooltip title="vlaue2018">
            <div className='name'>vlaue2018</div>
          </Tooltip>
          <div className='num'>(<span>8</span>)</div>
          <div className='select'><Icon type="check-circle-o" /></div>
        </Menu.Item>
        <Menu.Item className='selectMenuSecond'>
          <Tooltip title="vlaue2019">
            <div className='name'>vlaue2019</div>
          </Tooltip>
          <div className='num'>(<span>8</span>)</div>
          <div className='select'><Icon type="check-circle-o"/></div>
        </Menu.Item>
      </SubMenu>
      <Menu.Divider />
      <Menu.Item>
        <Icon type="plus" style={{marginRight:6}}/>
        创建标签
      </Menu.Item>
      <Menu.Item>
        <span onClick={this.handleManageLabel}>
          <Icon type="setting" style={{marginRight:6}}/>
          标签管理
        </span>
      </Menu.Item>
    </Menu>
  }

  handlelabelvalue(item, key, keyPath){
    console.log('item=',item)
    console.log('key=',key)
    console.log('keyPath=',keyPath)
  }

  handleManageLabel(){
    this.setState({
      manageLabelModal : true
    })
  }

  handleManageLabelOk(){
    this.setState({
      manageLabelModal : false
    })
  }

  handleManageLabelCancel(){
    this.setState({
      manageLabelModal : false
    })
  }

  handleAddLabel(key,value){
    console.log('key')
    console.log('value')
    return <div>
      <Tag closable color="blue"><span>key</span><span>value</span></Tag>
    </div>
  }

  formManegeLabelContainerTag(){
    const { manageLabelContainer } = this.state
    if(manageLabelContainer.length == 0){
      return <div>暂无标签</div>
    }
  }
  render() {
    const { addNodeCMD } = this.props
    const TagHTML = <TagDropdown footer={false}/>
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Button
            className='addPodBtn'
            size='large'
            type='primary'
            onClick={()=> this.handleAddClusterNode()}
          >
            <Icon type='plus' />
            <span>添加主机节点</span>
          </Button>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <svg>
              <use xlinkHref='#terminal' />
            </svg>
            <span>终端 | 集群管理</span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={() => this.loadData()}>
            <i className='fa fa-refresh' /> 刷新
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' size='large' placeholder='搜索' type='text' onPressEnter={() => this.searchNodes()} />
            <Icon type="search" className="fa" onClick={() => this.searchNodes()} />
          </span>
          <span className='selectlabel' id="cluster__hostlist__selectlabel">
            <Dropdown overlay={this.formMenudata()} getPopupContainer={() => document.getElementById('cluster__hostlist__selectlabel')}>
              <Button type="ghost" style={{ marginLeft: 8 }} size="large">
                <i className="fa fa-tag selectlabeltag" aria-hidden="true"></i>
                标签
                <Icon type="down" />
              </Button>
            </Dropdown>
          </span>
          <span className='selectedroom'>
            <span className='selectedroomdiv'>
              <Tag closable color="blue">蓝色</Tag>
              <Tag closable color="green">绿色</Tag>
              <Tag closable color="yellow"><a href="https://github.com/ant-design/ant-design/issues/1862">黄色</a></Tag>
              <Tag closable color="red">红色</Tag>
            </span>
          </span>
        </div>
        <div className='dataBox'>
          <div className='titleBox'>
            <div className='name commonTitle'>
              <span>主机名称</span>
            </div>
            <div className='status commonTitle'>
              <span>状态</span>
            </div>
            <div className='role commonTitle'>
              <span>节点角色</span>
            </div>
            <div className='container commonTitle'>
              <span>容器数</span>
            </div>
            <div className='cpu commonTitle'>
              <span>CPU</span>
            </div>
            <div className='memory commonTitle'>
              <span>内存</span>
            </div>
            <div className='disk commonTitle'>
              <span>磁盘</span>
            </div>
            <div className='schedule commonTitle'>
              <span>调度状态</span>
            </div>
            <div className='runningTime commonTitle'>
              <span>运行时间</span>
            </div>
            <div className='startTime commonTitle'>
              <span>启动时间</span>
            </div>
            <div className='opera commonTitle'>
              <span>操作</span>
            </div>
          </div>
          <div className='datalist'>
            <MyComponent {...this.props} nodeList={this.state.nodeList} />
          </div>
        </div>
      </Card>

      <Modal
        title="创建标签"
        visible={this.state.createLabelModal}
      >

      </Modal>

      <Modal
        title="管理标签"
        visible={true}
        onOk={this.handleManageLabelOk}
        onCancel={this.handleManageLabelCancel}
        wrapClassName="manageLabelModal"
        width="570px"
      >
        <div className='labelcontainer'>
          {this.formManegeLabelContainerTag()}
        </div>

        <div className='labelfooter'>
          <span className='labeldropdown' id="cluster__hostlist__manageLabelModal">
            <Dropdown overlay={TagHTML} getPopupContainer={() => document.getElementById('cluster__hostlist__manageLabelModal')}>
            <Button type="ghost" size="large">
              选择已有节点
              <Icon type="down" />
            </Button>
          </Dropdown>
          </span>
          <span className='item'>或</span>
          <Form
            inline
            horizontal={true}
            className='labelform'
          >
            <Form.Item className='itemkey'>
              <Input placeholder="标签键" />
            </Form.Item>
            <Form.Item className='itemkey'>
              <Input placeholder="标签值"/>
            </Form.Item>
          </Form>
          <Button icon='plus' size="large" className='itembutton' type="ghost" onClick={this.handleAddLabel}>新建标签</Button>
        </div>
      </Modal>
      <AddClusterOrNodeModal
        title="添加主机节点"
        visible={this.state.addClusterOrNodeModalVisible}
        closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
        CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
        bottomContent={<p>注意：新添加的主机需要与 Master 节点同一内网，可互通</p>} />
    </div>
  }
}

function mapStateToProps(state, props) {
  const pods = {
    nodes: {},
    isFetching: false
  }
  const clusterID = props.cluster.clusterID
  const { getAllClusterNodes, kubectlsPods, addNodeCMD } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  const targetAllClusterNodes = getAllClusterNodes[clusterID]
  const { isFetching } = targetAllClusterNodes || pods
  const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  const { cpuMetric, memoryMetric, license } = data
  const nodes = data.clusters ? data.clusters.nodes : []
  return {
    nodes,
    cpuMetric,
    memoryMetric,
    license,
    isFetching,
    kubectlsPods,
    addNodeCMD: addNodeCMD[clusterID] || {},
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  addTerminal,
  getKubectlsPods
})(injectIntl(hostList, {
  withRef: true,
}))
