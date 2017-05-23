/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster plugin component
 *
 * v2.2 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Link ,browserHistory} from 'react-router'
import { connect } from 'react-redux'
import { Menu, Button, InputNumber, Card, Form, Select, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip,  Row, Col, Tabs } from 'antd'
import './style/clusterPlugin.less'
import { getClusterPlugins, updateClusterPlugins } from  '../../actions/cluster'
import NotificationHandler from '../../common/notification_handler'
import { PLUGIN_DEFAULT_CONFIG } from '../../constants/index'
import { getAllClusterNodes } from '../../actions/cluster_node'


class ClusterPlugin extends Component{
  constructor(prop) {
    super(prop)
    this.state = {
      maxCPU: 4,
      maxMem: 2048
    }
  }
  loadData() {
    const { getClusterPlugins, cluster } = this.props
    if(cluster) {
      getClusterPlugins(cluster.clusterID)
    }

  }
  componentWillMount() {
    this.loadData()
  }
  onChange(value) {
  }
  convertCPU(cpu) {
    if(cpu){
      return (cpu / 1000).toFixed(1) + '核'
    }
    return '无限制'
  }
  convertMemory(memory) {
    if(!memory) return '无限制'
    let size = 'M'
    memory = memory / 1024
    if(memory > 1024) {
      size = 'G'
      memory = (memory / 1024).toFixed(0)
      return memory + size
    } else {
      return memory.toFixed(0) + size
    }
  }
  getStatusColor(status, name) {
    switch(status) {
      case 'OK': {
        return '#33b867'
      }
      case 'Warning': {
        if(name == 'elasticsearch-logging') {
          return '#33b867'
        }
        return '#f23e3f'
      }
      default:
        return 'orange'
    }
  }
  getStatusMessage(status) {
    switch (status) {
      case 'OK': {
        return '正常'
      }
      case 'Warning': {
        return '异常'
      }
      case 'pending': {
        return '启动中'
      }
      default:
        return '未知'
    }
  }
  showResetModal(plugin) {
    this.setState({
      currentPlugin: plugin,
      reset: true
    })
  }
  showSetModal(plugin) {
    this.setState({
      currentPlugin: plugin,
      setModal: true
    })
  }
  resetPlugin(isReset) {
    if(this.state.currentPlugin) {
      this.setState({
        reset: false
      })
      const notify =  new NotificationHandler()
      notify.spin('插件重新部署请求中')
      const { cluster, updateClusterPlugins } = this.props
      updateClusterPlugins(cluster.clusterID, this.state.currentPlugin.name,{
        reset: true
      },  {
        success: {
          func: () => {
            notify.close()
            notify.success('插件重新部署请求成功')
            this.loadData()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.error('插件重新部署请求失败')
          }
        }
      })
    }
  }
  updateClusterPlugins() {
    if(this.state.currentPlugin) {
      const { cluster, form, updateClusterPlugins } = this.props
      this.setState({
        setModal: false
      })
      const self = this
      form.validateFields((err, value) => {
        if(err) {
          return
        }
        this.setState({
          setModal: false
        })
        const notify = new NotificationHandler()
        const { getFieldValue } = form
        const cpu = getFieldValue('pluginCPU')
        const memory = getFieldValue('pluginMem')
        const hostName = getFieldValue('selectNode')
        notify.spin('更新插件配置中')
        updateClusterPlugins(cluster.clusterID, this.state.currentPlugin.name, {
          cpu,
          memory,
          hostName: hostName == 'random' ? '' : hostName
        }, {
          success: {
            func: () => {
              notify.close()
              form.resetFields()
              notify.success('插件配置更新成功')
              self.loadData()
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notify.close()
              notify.error('插件配置更新失败')
            }
          }
        })
      })
    }
  }
  getDefaultConfig() {
    const { form } = this.props
    const pluginName = this.state.currentPlugin.name
    const pluginCPU = PLUGIN_DEFAULT_CONFIG[pluginName] ? PLUGIN_DEFAULT_CONFIG[pluginName].cpu : 0
    const pluginMem = PLUGIN_DEFAULT_CONFIG[pluginName] ? PLUGIN_DEFAULT_CONFIG[pluginName].memory : 0
    form.setFieldsValue({
      pluginMem,
      pluginCPU
    })
  }
  getSelectItem() {
    const { nodeList, cluster } = this.props
    const clusterID = cluster.clusterID
    if(nodeList.isEmptyObject) {
      return <div key="null"></div>
    }
    if(nodeList[clusterID].isFetching) {
      return <Card id="Network" className="ClusterInfo">
        <div className="h3">节点</div>
        <div className="loadingBox" style={{height:'100px'}}><Spin size="large"></Spin></div>
        </Card>
    }
    const nodes = nodeList[clusterID].nodes.clusters.nodes.nodes
    const items = []
    items.push(<Option key={'random'} value={'random'}>随机调度</Option>)
    nodes.forEach(node => {
      return items.push(<Option key={node.objectMeta.name} value={node.objectMeta.name}>{node.objectMeta.name}</Option>)
    })
    return items
  }
  getTableItem() {
    const { clusterPlugins } = this.props
    const items = []
    const self = this
    if (clusterPlugins && clusterPlugins.result) {
      const plugins = clusterPlugins.result.data
      const pluginsNames = Object.getOwnPropertyNames(plugins)
      pluginsNames.forEach(name => {
        const plugin = plugins[name]
        items.push(<div className='podDetail'>
          <div className='name commonTitle'>
            <Link>{plugin.name}</Link>
          </div>
          <div className='status commonTitle'>
            <span  style={{color: self.getStatusColor(plugin.status.message, plugin.name)}}><i className='fa fa-circle' />&nbsp;&nbsp;{self.getStatusMessage(plugin.status.message)}</span>
          </div>
          <div className='resources commonTitle'>
            <div style={{lineHeight:'40px',height:30}}>CPU：{self.convertCPU(plugin.resourceRange.request.cpu)}</div>
            <div style={{lineHeight:'normal'}}>内存：{self.convertMemory(plugin.resourceRange.request.memory)}</div>
          </div>
          <div className='locationNode commonTitle'>
            <span>{plugin.hostName || '随机调度'}</span>
          </div>
          <div className='operation commonTitle'>
            <Button type="primary" onClick={() => self.showResetModal(plugin)}>重新部署</Button>
            <Button className="setup" type="ghost" onClick={()=> self.showSetModal(plugin)}>设置</Button>
          </div>
        </div>)
      })
    }
    return items
  }
  cancleSet() {
    const { form } = this.props
    this.setState({
      setModal: false
    })
    form.resetFields()
  }
  setInputCPU(value) {
    const notify = new NotificationHandler()
    if(value > this.state.maxCPU) {
      this.setState({ inputCPU: this.state.maxCPU})
      notify.error('输入的CPU数值已超出节点最大数值')
      return
    }
    this.setState({ inputCPU: value})
  }
  render(){
    const { clusterPlugins, form } = this.props
    if(clusterPlugins.isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const { getFieldProps } = form
    const selectNode = getFieldProps('selectNode', {
      rules: [{
        validator: (rule, value, callback) => {
          if(!value) {
            return callback('请选择要部署的集群')
          }
          return callback()
        }
      }],
      initialValue: this.state.currentPlugin ? (this.state.currentPlugin.hostName ? this.state.currentPlugin.hostName : 'random') : '',
      onChange: (value) => {
        const { cluster } = this.props
        const { nodeList } = this.props
        if(nodeList) {
          let nodesDetail = nodeList[cluster.clusterID]
          console.log(nodesDetail)
          if(nodesDetail) {
            nodesDetail = nodesDetail.nodes.clusters.nodes.nodes
            let nodeDetail = {}
            let minCPU = Infinity
            let minMemory = Infinity
            if(value == 'random') {
              nodesDetail.forEach(node => {
                if(node.cPUAllocatable < minCPU) {
                  minCPU = node.cPUAllocatable
                }
                if(node.memoryAllocatable < minMemory) {
                  minMemory = node.memoryAllocatable
                }
              })
              this.setState({
                maxCPU: minCPU / 1000,
                maxMem: Math.floor(minMemory / 1024 )
              })
              return
            }
            nodesDetail.some(node => {
              if(node.objectMeta.name == value) {
                nodeDetail = node
                return true
              }
              return false
            })
            this.setState({
              maxCPU: nodeDetail.cPUAllocatable / 1000,
              maxMem: Math.floor(nodeDetail.memoryAllocatable / 1024)
            })
          }
        }
      }
    })
    let currentMem = this.state.currentPlugin ? (this.state.currentPlugin.resourceRange.request.memory / 1024).toFixed(0) : 0

    if(isNaN(currentMem)) currentMem = 0
    const pluginMem = getFieldProps('pluginMem' , {
      rules: [
        {
          validator: (rule, value, callback) => {
            if(value > this.state.maxMem) {
              const notify = new NotificationHandler()
              form.setFieldsValue({
                pluginMem: this.state.maxMem
              })
              notify.error('输入的内存数值超过所选节点最大内存')
            }
            return callback()
          }
        }
      ],
      initialValue: currentMem
    })
    let currentCPU = this.state.currentPlugin ? (this.state.currentPlugin.resourceRange.request.cpu / 1000).toFixed(1) : '0'
    if(isNaN(currentCPU)) currentCPU = 0
    const pluginCPU = getFieldProps('pluginCPU' , {
      rules: [
        {
          validator: (rule, value, callback) => {
            if(value > this.state.maxCPU) {
              const notify = new NotificationHandler()
              form.setFieldsValue({
                pluginCPU: this.state.maxCPU
              })
              notify.error('输入的CPU数值超过所选节点最大CPU')
            }
            return callback()
          }
        }
      ],
      initialValue: currentCPU
    })
    return <Form><div id="cluster_clusterplugin">
      <div className="alertRow">集群插件：使用以下插件可以分别使平台中的日志、发现服务、监控等可用；在这里可以重新部署插件，可以切换插件所在节点，还可以设置CPU、内存在集群中资源的限制。</div>
      <Card className='ClusterListCard'>
      <div className='dataBox'>
          <div className='titleBox'>
            <div className='name commonTitle'>
              <span>插件名称</span>
            </div>
            <div className='status commonTitle'>
              <span>插件状态</span>
            </div>
            <div className='resources commonTitle'>
              <span>资源限制</span>
            </div>
            <div className='locationNode commonTitle'>
              <span>所在节点</span>
            </div>
            <div className='operation commonTitle'>
              <span>操作</span>
            </div>
          </div>
             <Modal
                title="重新部署操作"
                wrapClassName="vertical-center-modal"
                visible={this.state.reset}
                onOk={() => this.resetPlugin() }
                onCancel={() => this.setState({reset:false})}
                >
                <div className="confirmText">确定重新部署 {this.state.currentPlugin ? this.state.currentPlugin.name : ''} 插件吗?</div>
              </Modal>
              <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setModal}
                onOk={() => this.updateClusterPlugins()}
                onCancel={() => this.cancleSet()}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <span className="setLimit">选择节点</span>
                  <Select {...selectNode} size="large" style={{width: 200}}>
                    { this.getSelectItem()}
                  </Select>
                </Form.Item>
                <Form.Item>
                 <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small" onClick={() => this.getDefaultConfig()}><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                   <InputNumber {...pluginCPU}  style={{width: 200}} min={0} step={0.1}/> 核
                  </p>
               </Form.Item>
               <Form.Item>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft: '70px'}}>
                  <InputNumber {...pluginMem} style={{width: 200}} min={0} step={1} /> M
                  </p>
                </Form.Item>
                </Modal>
          <div className='datalist'>
            {this.getTableItem()}
          </div>
        </div>
        </Card>
      </div>
      </Form>
  }
}

function mapStateToProp(state) {
  const defaultNodeList = {isFetching: false, isEmptyObject: true}
  let allNode = state.cluster_nodes.getAllClusterNodes
  if(!allNode) {
    allNode = defaultNodeList
  }
  const defaultClusterPlugins = {
    isFetching: false
  }
  const cluster = state.entities.current.cluster
  let clusterPlugins = state.cluster.clusterPlugins
  if(!clusterPlugins) {
    clusterPlugins = defaultClusterPlugins
  }
  return {
    nodeList: allNode,
    cluster,
    clusterPlugins
  }
}

export default connect(mapStateToProp, {
  getClusterPlugins,
  updateClusterPlugins
})(Form.create()(ClusterPlugin))

