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



class ClusterPlugin extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }
  getInitialState() {
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
      return (cpu / 1000).toFixed(2) + '核'
    }
    return '-'
  }
  convertMemory(memory) {
    if(!memory) return '-'
    let size = 'M'
    memory = memory / 1024
    if(memory > 1024) {
      size = 'G'
      memory = memory / 1024
    }
    return memory.toFixed(2) + size
  }
  getStatusColor(status) {
    switch(status) {
      case 'OK': {
        return '#33b867'
      }
      case 'Warning': {
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
      form.validateFields((err, value) => {
        if(err) {
          return
        }

      })
    }
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
            <span  style={{color: self.getStatusColor(plugin.status.message)}}><i className='fa fa-circle' />&nbsp;&nbsp;{self.getStatusMessage(plugin.status.message)}</span>
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
  render(){
    const { clusterPlugins } = this.props
    if(clusterPlugins.isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
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
      <p>确定重新部署 {this.state.currentPlugin ? this.state.currentPlugin.name : ''} 插件吗?</p>
                </Modal>
                  <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setModal}
                onOk={() => this.setState({setUpd:false})}
                onCancel={() => this.setState({setModal:false})}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  label="选择节点"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <Select id="select" size="large" defaultValue="lucy" style={{width: 200,marginLeft:'20px'}}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>disabled</Option>
                    <Option value="yiminghe">yiminghe</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small"><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                    <InputNumber style={{width: 200}} min={0.1} max={4} step={0.1}/> 核
                  </p>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft:'70px'}}>
                    <Input style={{width: 200}}/> M
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
  const defaultClusterPlugins = {
    isFetching: false
  }
  const cluster = state.entities.current.cluster
  let clusterPlugins = state.cluster.clusterPlugins
  if(!clusterPlugins) {
    clusterPlugins = defaultClusterPlugins
  }
  return {
    cluster,
    clusterPlugins
  }
}

export default connect(mapStateToProp, {
  getClusterPlugins,
  updateClusterPlugins
})(Form.create()(ClusterPlugin))

