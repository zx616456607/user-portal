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
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Menu, Button, InputNumber, Card, Form, Select, Input, Dropdown, Spin, Modal, Icon, Row, Col, Table, Progress, Tooltip } from 'antd'
import './style/clusterPlugin.less'
import './style/clusterLabelManege.less'
import { getClusterPlugins, updateClusterPlugins, initPlugins, loadClusterList } from '../../actions/cluster'
import NotificationHandler from '../../components/Notification'
import { PLUGIN_DEFAULT_CONFIG } from '../../constants/index'
import { camelize } from 'humps'
import { deleteMiddleware, updateMiddleware, createMiddleware } from '../../actions/cluster'
import { getAllClusterNodes } from '../../actions/cluster_node'
import openUrl from '../../assets/img/icon/openUrl.svg'
import get from 'lodash/get'
const Option = Select.Option
const exclamationIcon = (
  <Icon type="exclamation-circle-o" style={{ color: 'orange' }} />
)


class ClusterPlugin extends Component {
  constructor(prop) {
    super(prop)
    this.state = {
      maxCPU: 4,
      maxMem: 2048,
      data: [],
      currentCluster: '',
      allClusters: [],
    }
  }
  loadData() {
    const { getClusterPlugins } = this.props
    const { currentCluster } = this.state
    if (currentCluster) {
      getClusterPlugins(currentCluster, {
        success: {
          func: res => {
            if (Object.keys(res).length > 0) {
              this.setState({
                data: res[camelize(currentCluster)].data
              })
            }
          }
        }
      })
    }

  }
  componentWillMount() {
    const { getAllClusterNodes, loadClusterList } = this.props
    loadClusterList({}, {
      success: {
        func: res => {
          if(!!res && res.data && res.data[0]){
            const currentCluster = res.data[0].clusterID
            this.setState({
              currentCluster,
              allClusters: res.data,
            })
            getAllClusterNodes(currentCluster)
            this.loadData()
          }
        },
        isAsync: true,
      }
    })
  }
  onSelectChange = currentCluster => {
    this.setState({
      currentCluster
    }, async () => {
      await this.props.getAllClusterNodes(currentCluster)
      this.loadData()
    })
  }
  onChange(value) {
  }
  convertCPU(cpu) {
    if (cpu) {
      return (cpu / 1000).toFixed(1) + '核'
    }
    return '无限制'
  }
  convertMemory(memory) {
    if (!memory) return '无限制'
    let size = 'M'
    memory = memory / 1000
    if (memory > 1000) {
      size = 'G'
      memory = (memory / 1000).toFixed(0)
      return memory + size
    } else {
      return memory.toFixed(0) + size
    }
  }
  getStatusColor(status, name) {
    switch (status) {
      case 'normal': {
        return '#33b867'
      }
      case 'running': {
        return '#33b867'
      }
      case 'warning': {
        if (name == 'elasticsearch-logging-v1') {
          return '#33b867'
        }
        return '#F3575A'
      }
      case 'stopped': {
        return 'red'
      }
      case 'failed': {
        return 'red'
      }
      default:
        return 'orange'
    }
  }
  getStatusMessage(status, name) {
    switch (status) {
      case 'normal': {
        return '正常'
      }
      case 'uninstalled': {
        return '未安装'
      }
      case 'abnormal': {
        return '异常'
      }
      case 'warning': {
        if (name == 'elasticsearch-logging-v1') {
          return '正常'
        }
        return '报警'
      }
      case 'stopped': {
        return '已停止'
      }
      case 'pending': {
        return '启动中'
      }
      case 'running': {
        return '正常'
      }
      case 'failed': {
        return '启动失败'
      }
      default:
        return '未知'
    }
  }
  getTooltip(podBrief) {
    return `${podBrief.running} 运行，${podBrief.abnormal} 异常，${podBrief.pending} 启动中，${podBrief.failed} 启动失败`
  }
  getPluginStatus(podBrief, name) {
    if (!podBrief) {
      return null
    }
    const keys = Object.getOwnPropertyNames(podBrief)
    let replicas = 0
    let running = 0
    let pending = 0
    let failed = 0
    let abnormal = 0
    keys.forEach(key => {
      replicas += parseInt(podBrief[key])
      let num = parseInt(podBrief[key])
      switch (key) {
        case 'running': {
          running = num
          break
        }
        case 'pending': {
          pending = num
          break
        }
        case 'failed': {
          failed = num
          break
        }
        case 'abnormal': {
          abnormal = num
          break
        }
      }
    })
    if (running > 0) {
      return <div className="text">
        <div style={{ color: this.getStatusColor('running', name) }}><i className='fa fa-circle' />&nbsp;&nbsp; 正常</div>
        <div>{running == replicas ? "" : <Tooltip title={this.getTooltip(podBrief)}>{exclamationIcon}</Tooltip>}{running}/{replicas} 运行中</div>
      </div>
    }
    if (running == 0 && pending == 0 && abnormal != 0) {
      return <div className="text">
        <div style={{ color: this.getStatusColor('abnormal', name) }}><i className='fa fa-circle' />&nbsp;&nbsp; 异常</div>
        <div><Tooltip title={this.getTooltip(podBrief)}>{exclamationIcon}</Tooltip>&nbsp;{abnormal}/{replicas} 异常</div>
      </div>
    }
    if (running == 0 && pending != 0) {
      return <div className="text">
        <div><Progress percent={100} status="active" showInfo={false} style={{ width: '100px' }} />&nbsp;&nbsp;启动中</div>
        <div><Tooltip title={this.getTooltip(podBrief)}>{exclamationIcon}</Tooltip>&nbsp;{running}/{replicas} 启动中</div>
      </div>
    }
    if (failed == replicas || (running == 0 && pending == 0 && abnormal == 0)) {
      return <div className="text">
        <div style={{ color: this.getStatusColor('failed', name) }}><i className='fa fa-circle' />&nbsp;&nbsp; 启动失败</div>
        <div><Tooltip title={this.getTooltip(podBrief)}>{exclamationIcon}</Tooltip>&nbsp;{failed}/{replicas} 启动失败</div>
      </div>
    }
  }

  getStatusStyle(status, row) {
    if (status == '启动中') {
      return (<div className="text">
        <div style={{ color: this.getStatusColor(status.message, row.name) }}><i className='fa fa-circle' />&nbsp;&nbsp;{this.getStatusMessage(status.message, row.name)}</div>
        <Progress percent={100} status="active" />
      </div>)
    }
  }
  startPlugin(row, type) {
    const currentCluster = this.state.currentCluster
    const operation = type == 'stop' ? '停止' : '启动'
    const notify = new NotificationHandler()
    const pluginNames = row.pluginNames.join(',')
    notify.spin(`${operation}插件 ${pluginNames} 中`)
    this.props.updateMiddleware(row, type, {
      success: {
        func: () => {
          notify.close()
          notify.success(`${operation}插件 ${pluginNames} 成功`)
          this.props.getClusterPlugins(currentCluster)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error(`${operation}插件 ${pluginNames} 失败`)
        }
      }
    })

  }

  showCreateModal(row) {
    this.setState({
      currentPlugin: row,
      create: true
    })
  }

  getStateusForEvent(row) {
    if (row.status.message == 'uninstalled' && row.status.code == '503') {
      return (<Button type="primary" onClick={() => this.showCreateModal(row)}>安装插件</Button>)
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
  installPlugin() {
    const row = this.state.currentPlugin
    const notify = new NotificationHandler()
    if (row.status.code != 503 && row.status.message != 'uninstalled') {
      notify.error('该插件已安装')
      return
    }
    const { createMiddleware } = this.props
    const { currentCluster } = this.state
    const self = this
    notify.spin('安装插件中')
    createMiddleware(currentCluster, {
      pluginName: row.name,
      template: row.templateID,
    }, {
        success: {
          func: () => {
            notify.close()
            notify.success(`插件${row.name}安装成功`)
            self.loadData()
            this.setState({
              create: false
            })
            return
          },
          isAsync: true
        },
        failed: {
          func: (e) => {
            const code = get(e, [ 'statusCode' ])
            notify.close()
            if (code === 409) {
              notify.info(`上次删除正在进行中，请稍后重试`) 
            } else {
              notify.error(`插件${row.name}安装失败`)
            }
            this.setState({
              create: false
            })
            return
          }
        }
      })
  }

  resetPlugin(isReset) {
    if (this.state.currentPlugin) {
      this.setState({
        reset: false
      })
      const notify = new NotificationHandler()
      notify.spin('插件重新部署请求中')
      const { updateClusterPlugins } = this.props
      updateClusterPlugins(this.state.currentCluster, this.state.currentPlugin.name, {
        reset: true
      }, {
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
    if (this.state.currentPlugin) {
      const { form, updateClusterPlugins } = this.props
      this.setState({
        setModal: false
      })
      const self = this
      form.validateFields((err, value) => {
        if (err) {
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
        updateClusterPlugins(this.state.currentCluster, this.state.currentPlugin.name, {
          cpu,
          memory,
          hostName: hostName == 'random' ? '' : hostName
        }, {
            success: {
              func: () => {
                notify.close()
                form.resetFields()
                notify.success('插件配置更新成功')
                this.loadData()
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
    const { nodeList } = this.props
    const { currentCluster } = this.state
      if (JSON.stringify(nodeList) == '[]' || JSON.stringify(nodeList) == '{}' || nodeList.length < 1
        || !nodeList[currentCluster]) {
      return <div key="null"></div>
    }
    if (nodeList[currentCluster].isFetching) {
      return <Card key="Network" id="Network" className="ClusterInfo">
        <div className="h3">节点</div>
        <div className="loadingBox" style={{ height: '100px' }}><Spin size="large"></Spin></div>
      </Card>
    }
    const { clusters } = nodeList[currentCluster].nodes
    if (!clusters) {
      return <Option key="notclsuter">暂无数据</Option>
    }
    const nodes = nodeList[currentCluster].nodes.clusters.nodes.nodes
    const items = []
    items.push(<Option key={'random'} value={'random'}>随机调度</Option>)
    Array.isArray(nodes) && nodes.forEach(node => {
      if (!node.schedulable || node.isMaster) return
      return items.push(<Option key={node.objectMeta.name} value={node.objectMeta.name}>{node.objectMeta.name}</Option>)
    })
    return items
  }
  getTableItem() {
    const { data } = this.state
    const first = []
    const second = []
    const other = []
    if (data && data) {
      const plugins = data
      let pluginsNames = []
      for (let key in plugins) {
        pluginsNames.push(plugins[key])
      }
      pluginsNames.forEach(item => {
        if (!item.serviceInfo) {
          other.push(item)
          return
        }
        if (item.serviceInfo.isSystem && item.status.message != 'uninstalled') {
          first.push(item)
          return
        }
        if (item.serviceInfo.isSystem) {
          second.push(item)
          return
        }
        other.push(item)
      })
    }
    return first.concat(second, other)
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
    if (value > this.state.maxCPU) {
      this.setState({ inputCPU: this.state.maxCPU })
      notify.error('输入的CPU数值已超出节点最大数值')
      return
    }
    this.setState({ inputCPU: value })
  }
  handleMenuClick(key, row) {
    if (row.name == 'elasticsearch-logging' && key === 'deployIndextpl') {
      this.setState({
        deployIndex: true,
        pluginName: row.name
      })
      return
    }
    if (key === "reinstall") {
      this.setState({
        currentPlugin: row,
        reset: true,
        row: row
      })
      return
    }
    this.setState({
      key,
      plugins: row.name,
      action: true,
      row: row
    })
  }
  handPlugins() {
    const cluster = this.state.currentCluster
    const body = {
      pluginNames: Array.isArray(this.state.plugins) ? this.state.plugins : [this.state.plugins],
      cluster
    }
    setTimeout(() => {
      this.setState({ action: false })
    }, 300)
    const notify = new NotificationHandler()
    if (this.state.key == 'stop') {
      this.startPlugin(body, 'stop')
      return
    }
    if (this.state.key == 'start') {
      this.startPlugin(body, 'start')
      return
    }
    if (this.state.key == 'reinstall') {
      this.showResetModal(this.state.row)
      return
    }
    this.props.deleteMiddleware(body, {
      success: {
        func: () => {
          notify.success('卸载成功')
          this.props.getClusterPlugins(cluster)
        },
        isAsync: true
      }
    })
  }

  initPlugins() {
    const { initPlugins, getClusterPlugins } = this.props
    const { currentCluster, initing } = this.state
    if (initing) return
    this.setState({
      initing: true
    })
    const notify = new NotificationHandler()
    initPlugins(currentCluster, this.state.pluginName, {
      success: {
        func: () => {
          notify.success('安装索引模版成功')
          getClusterPlugins(currentCluster)
          this.setState({
            initing: false,
            deployIndex: false
          })
        },
        isAsync: true
      }
    })
  }


  render() {
    const { clusterPlugins, form, isFetching } = this.props
    const { currentCluster, allClusters } = this.state
    const { getFieldProps } = form
    const selectNode = getFieldProps('selectNode', {
      rules: [{
        validator: (rule, value, callback) => {
          if (!value) {
            return callback('请选择要部署的集群')
          }
          return callback()
        }
      }],
      initialValue: this.state.currentPlugin ? (this.state.currentPlugin.hostName ? this.state.currentPlugin.hostName : 'random') : '',
      onChange: (value) => {
        const { nodeList } = this.props
        if (nodeList) {
          let nodesDetail = nodeList[currentCluster]
          if (nodesDetail) {
            nodesDetail = nodesDetail.nodes.clusters.nodes.nodes
            let nodeDetail = {}
            let minCPU = Infinity
            let minMemory = Infinity
            if (value == 'random') {
              nodesDetail.forEach(node => {
                if (node.cPUAllocatable < minCPU) {
                  minCPU = node.cPUAllocatable
                }
                if (node.memoryAllocatable < minMemory) {
                  minMemory = node.memoryAllocatable
                }
              })
              this.setState({
                maxCPU: minCPU / 1000,
                maxMem: Math.floor(minMemory / 1000)
              })
              return
            }
            nodesDetail.some(node => {
              if (node.objectMeta.name == value) {
                nodeDetail = node
                return true
              }
              return false
            })
            this.setState({
              maxCPU: nodeDetail.cPUAllocatable / 1000,
              maxMem: Math.floor(nodeDetail.memoryAllocatable / 1000)
            })
          }
        }
      }
    })
    let currentMem = this.state.currentPlugin ? (this.state.currentPlugin.resourceRange.request.memory / 1000).toFixed(0) : 0

    if (isNaN(currentMem)) currentMem = 0
    const pluginMem = getFieldProps('pluginMem', {
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value > this.state.maxMem) {
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
    if (isNaN(currentCPU)) currentCPU = 0
    const pluginCPU = getFieldProps('pluginCPU', {
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value > this.state.maxCPU) {
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

    const labelcolumns = [
      {
        title: '插件名称',
        key: 'keys',
        dataIndex: 'name',
        width: '18%',
        render: text => text
      },
      {
        title: '插件状态',
        key: 'status',
        dataIndex: 'status',
        width: '16%',
        render: (status, row) => {
          if (row.podBrief && (status.message != 'uninstalled' && status.message != 'stopped')) {
            return this.getPluginStatus(row.podBrief, row.name)
          }
          return <div style={{ color: this.getStatusColor(status.message, row.name) }}><i className='fa fa-circle' />&nbsp;&nbsp;{this.getStatusMessage(status.message, row.name)}</div>
        }
      },
      {
        title: '资源限制',
        key: 'resourceRange',
        dataIndex: 'resourceRange',
        width: '17%',
        render: (plugin, row) => {
          return (
            <div><div>CPU：{this.convertCPU(plugin.request.cpu)}</div>
              <div>内存：{this.convertMemory(plugin.request.memory)}</div>
            </div>
          )
        }
      },
      {
        title: '所在节点',
        key: 'templateID',
        dataIndex: 'templateID',
        width: '13%',
        render: (text, row) => {
          return (
            <span>{row.hostName || '随机调度'}</span>
          )
        }
      },
      {
        title: '管理界面',
        key: 'web',
        dataIndex: 'web',
        width: '15%',
        render: (text, row) => {
          if (row.serviceInfo && row.serviceInfo.entryPoints && ['stopped', 'uninstalled'].indexOf(row.status.message) < 0) {
            let path = row.serviceInfo.entryPoints[0].path
            const port = row.serviceInfo.entryPoints[0].port
            if (path.indexOf('/') == 0) {
              path = path.substr(1)
            }
            if (path) {
              return (<a href={`/proxy/clusters/${currentCluster}/plugins/${row.name + (port ? ':' + port : '')}/${path}`} target="_blank"><img src={openUrl} className="openUrl" />打开界面</a>)
            }
            return (<a href={`/proxy/clusters/${currentCluster}/plugins/${row.name + (port ? ':' + port : '')}/`} target="_blank"><img src={openUrl} className="openUrl" />打开界面</a>)

          }
          return '--'
        }
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        render: (text, row) => {
          let menu
          if (row.status.message != 'uninstalled') {

          }
          if (row.status.message == 'stopped') {
            menu = (
              <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                <Menu.Item key="start">启动插件</Menu.Item>
                <Menu.Item key="delete">卸载插件</Menu.Item>
                { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall">重新部署</Menu.Item> }
              </Menu>
            )
          } else if (row.name == 'elasticsearch-logging') {
            menu = (
              <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                <Menu.Item key="stop">停止插件</Menu.Item>
                <Menu.Item key="delete">卸载插件</Menu.Item>
                {/*<Menu.Item key="deployIndextpl">部署索引模版</Menu.Item>*/}
                { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall">重新部署</Menu.Item> }
              </Menu>
            )
          } else {
            if (row.serviceInfo && row.serviceInfo.isDeamonSet === true) {
              menu = (
                <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                  <Menu.Item key="delete">卸载插件</Menu.Item>
                  { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall">重新部署</Menu.Item> }
                </Menu>
              )
            } else {
              menu = (
                <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                  <Menu.Item key="stop">停止插件</Menu.Item>
                  <Menu.Item key="delete">卸载插件</Menu.Item>
                  { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall">重新部署</Menu.Item> }
                </Menu>
              )
            }
          }
          // let menua
          // if (row.status.message == 'stopped') {
          //   menua = (
          //     <Menu className="Settingplugin">
          //       <Menu.Item onClick={(e) => this.hand设置插件leMenuClick(e.key, row)} key="start">启动插件</Menu.Item>
          //       <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="delete">卸载插件</Menu.Item>
          //       { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall" onClick={(e) => this.showResetModal(row)}>
          //         重新部署
          //       </Menu.Item> }
          //       {this.getStateusForEvent(row)}
          //     </Menu>
          //   )
          // } else {
          //   menua = (
          //     <Menu className="Settingplugin">
          //       <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="stop">停止插件</Menu.Item>
          //       <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="delete">卸载插件</Menu.Item>
          //       { !row.serviceInfo.isDeamonSet && <Menu.Item key="reinstall" onClick={(e) => this.showResetModal(row)}>
          //         重新部署
          //       </Menu.Item> }
          //       {this.getStateusForEvent(row)}
          //     </Menu>
          //   )
          // }
          const result = (row.serviceInfo && row.serviceInfo.isSystem)
            ? <div className="pluginAction">
              <span className="button">
                {this.getStateusForEvent(row)}
              </span>
              <Button style={{ backgroundColor: '#fff' }} onClick={() => this.showSetModal(row)} overlay={{}}>设置插件</Button>
            </div>
            : <div className="pluginAction">
              <div className="Settingplugina">
                <span className="button">
                  {this.getStateusForEvent(row)}
                </span>
                {row.status.message == 'uninstalled' ? '' : (
                row.name !== 'istio'
                  ?
                <Dropdown.Button onClick={() => this.showSetModal(row)} overlay={menu} type="ghost">
                  设置插件
                </Dropdown.Button>
                  :
                <Button type="ghost" onClick={() => this.handleMenuClick('delete', row)} overlay={{}}>卸载插件</Button>
                )}
              </div>
              {/* <div className="Settingpluginb">
                {row.status.message == 'uninstalled' ? '' : <Dropdown.Button onClick={() => this.showSetModal(row)} overlay={menu} type="ghost">
                  设置插件
               </Dropdown.Button>}
              </div> */}
              {/*<Button type="primary" onClick={() => this.showResetModal(row.name)} disabled={row.serviceInfo.isDeamonSet}>
                重新部署
              </Button>
              <Button className="setup" type="ghost" onClick={()=> this.showSetModal(row.name)}>设置</Button>*/}
            </div>
          return result
        }
      }
    ]
    const options = allClusters.map(item => {
      return (
        <Select.Option key={item.clusterID} value={item.clusterID}>
          {item.clusterName}
        </Select.Option>
      )
    })
    return (
      <div id="cluster_clusterplugin">
        <div className="alertRow">集群插件：使用以下插件可以分别使平台中的日志、发现服务、监控等可用；在这里可以重新部署插件，可以切换插件所在节点，还可以设置CPU、内存在集群中资源的限制。</div>

        <div className='ClusterListCard' id="cluster__labelmanage">
          <div className='operaBox'>
            <Select onChange={this.onSelectChange} size="large" style={{width: '200px', marginRight: '10px'}} value={currentCluster}>
              {options}
            </Select>
            <Button type="primary" size="large" onClick={() => this.loadData()} className='titlebutton'><i className='fa fa-refresh' /> 刷新</Button>
          </div>
          <br />
          <Table
            className="labelmanage__content"
            columns={labelcolumns}
            dataSource={this.getTableItem()}
            pagination={false}
            loading={isFetching}
          />
        </div>
        <Modal
          title={this.state.key == 'stop' ? '停止插件' : (this.state.key == 'start' ? '启动' : '卸载')}
          wrapClassName="vertical-center-modal"
          visible={this.state.action}
          onOk={() => this.handPlugins()}
          onCancel={() => this.setState({ action: false })}
        >
          <div className="confirmText">确定要{this.state.key == 'stop' ? '停止插件' : (this.state.key == 'start' ? '启动' : '卸载')} {this.state.plugins} 此插件吗?</div>
        </Modal>

        <Modal
          title={'安装索引模版'}
          wrapClassName="vertical-center-modal"
          visible={this.state.deployIndex}
          onOk={() => this.initPlugins()}
          onCancel={() => this.setState({ deployIndex: false })}
        >
          <div className="confirmText">确定要安装 elasticsearch-logging 索引模版吗?</div>
        </Modal>

        <Modal
          title="重新部署操作"
          wrapClassName="vertical-center-modal"
          visible={this.state.reset}
          onOk={() => this.resetPlugin()}
          onCancel={() => this.setState({ reset: false })}
        >
          <div className="confirmText">确定重新部署 {this.state.currentPlugin ? this.state.currentPlugin.name : ''} 插件吗?</div>
        </Modal>
        <Modal
          title="安装操作"
          wrapClassName="vertical-center-modal"
          visible={this.state.create}
          onOk={() => this.installPlugin()}
          onCancel={() => this.setState({ create: false })}
        >
          <div className="confirmText">确定安装 {this.state.currentPlugin ? this.state.currentPlugin.name : ''} 插件吗?</div>
        </Modal>
        <Modal
          title="设置节点及资源限制"
          wrapClassName="vertical-center-modal"
          visible={this.state.setModal}
          onOk={() => this.updateClusterPlugins()}
          onCancel={() => this.cancleSet()}
        >
          <div className="alertRow" style={{ fontSize: '12px' }}><div>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{ fontWeight: 'bold' }}>推荐使用默认设置</span>。</div>
            <div>设置为 <span style={{ fontWeight: 'bold' }}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</div></div>
          <Form>
            <Form.Item
              id="select"
              style={{ borderBottom: '1px solid #ededed', paddingBottom: '30px' }}
            >
              <span className="setLimit">选择节点</span>
              <Select {...selectNode} size="large" style={{ width: 200 }} disabled={this.state.currentPlugin && this.state.currentPlugin.serviceInfo.isDeamonSet}>
                {this.getSelectItem()}
              </Select>
            </Form.Item>
            <Form.Item>
              <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small" onClick={() => this.getDefaultConfig()}><Icon type="setting" />恢复默认设置</Button>
              <div style={{ marginLeft: '70px' }}>
                <InputNumber {...pluginCPU} style={{ width: 200 }} min={0} step={0.1} /> 核
                </div>
            </Form.Item>
            <Form.Item>
              <span style={{ marginLeft: '70px' }}>内存</span>
              <div style={{ marginLeft: '70px' }}>
                <InputNumber {...pluginMem} style={{ width: 200 }} min={0} step={1} /> M
                </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state) {
  // const { current } = state.entities
  // const { cluster } = current
  // const { clusterID } = cluster
  const defaultNodeList = {
    // [clusterID]: {
    //   isFetching: false,
    //   isEmptyObject: true,
    //   nodes: {}
    // }
  }
  let allNode = state.cluster_nodes.getAllClusterNodes
  // if (!allNode || !allNode[clusterID]) {
  //   allNode = defaultNodeList
  // }
  const defaultClusterPlugins = {

  }
  let isFetching = false
  let clusterPlugins = state.cluster.clusterPlugins && state.cluster.clusterPlugins.result
  if (!clusterPlugins) {
    clusterPlugins = defaultClusterPlugins
  }
  if (state.cluster.clusterPlugins) {
    isFetching = state.cluster.clusterPlugins.isFetching
  }
  return {
    nodeList: allNode,
    clusterPlugins,
    isFetching,
    // clusterID
  }
}

export default connect(mapStateToProp, {
  deleteMiddleware,
  updateMiddleware,
  createMiddleware,
  getClusterPlugins,
  updateClusterPlugins,
  getAllClusterNodes,
  initPlugins,
  loadClusterList
})(Form.create()(ClusterPlugin))

