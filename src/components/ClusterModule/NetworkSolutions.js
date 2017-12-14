/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Network Solutions component
 *
 * v0.1 - 2017-1-22
 * @author ZhangChengZheng
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Row, Col, Modal, Button, Tabs, Tooltip, Icon, Form, Input } from 'antd'
import './style/NetworkSolutions.less'
import { connect } from 'react-redux'
import { getNetworkSolutions } from '../../actions/cluster_node'
import { updateClusterConfig } from '../../actions/cluster'
import { loadTeamClustersList } from '../../actions/team'
import NotificationHandler from '../../components/Notification'
import { setCurrent } from '../../actions/entities'
import { genRandomString } from '../../common/tools'

const createOrder = `calicoctl create -f policy.yaml`
const deleteOrder = `calicoctl delete policy failsafe`
const yamlFile = `- apiVersion: v1
  kind: policy
  metadata:
    name: failsafe
  spec:
    selector: "all()"
    order: 0
    ingress:
    - action: allow
      protocol: tcp
      source:
        net: "192.168.1.0/24"
    - action: allow
      protocol: udp
      source:
        net: "192.168.1.0/24"`

class NetworkSolutions extends Component {
  constructor(props) {
    super(props)
    this.handlebodyTemplate = this.handlebodyTemplate.bind(this)
    this.handlefooterTemplate = this.handlefooterTemplate.bind(this)
    this.handleCurrentTemplate = this.handleCurrentTemplate.bind(this)
    this.confirmSettingPermsission = this.confirmSettingPermsission.bind(this)
    this.openPermissionModal = this.openPermissionModal.bind(this)
    this.copyOrder = this.copyOrder.bind(this)
    this.copyCloseOrder = this.copyCloseOrder.bind(this)
    this.closeHelpModal = this.closeHelpModal.bind(this)
    this.copyYmal = this.copyYmal.bind(this)
    this.state = {
      permissionVisible: false,
      confirmLoading: false,
      helpVisible: false,
      copyCMDSuccess: false,
      openInputId: `openPermissoionInput${genRandomString('0123456789', 4)}`,
      closeInputId: `closePermissoionInput${genRandomString('012345678', 4)}`,
      yamlTextarea: `yamlTextarea${genRandomString('012345678', 4)}`,
      activeKey: 'open',
      modalHelp: false,
      dnsId: 0,
      sketchVisible: false,
      deleteVisible: false,
    }
  }

  componentWillMount() {
    const { getNetworkSolutions, clusterID } = this.props
    getNetworkSolutions(clusterID)
  }

  handleCurrentTemplate(item) {
    if (item == 'macvlan') {
      return <span><i className="fa fa-check-circle-o check_icon" aria-hidden="true"></i>该集群已启用基于 Macvlan 的私有网络</span>
    }
    return <span><i className="fa fa-check-circle-o check_icon"
      aria-hidden="true"></i>该集群已启用基于 Calico BGP 协议的私有网络</span>
  }

  handlebodyTemplate() {
    const { clusterID, networksolutions, networkPolicySupported } = this.props
    if (!networksolutions[clusterID] || !networksolutions[clusterID].supported) {
      return
    }
    let arr = networksolutions[clusterID].supported.map((item, index) => {
      return <Row className='standard' key={'body' + item}
        style={{ borderBottom: item == 'calico' ? 'none' : '1px solid #e5e5e5' }}>
        <Col span="10">
          <Row>
            <Col span={5} className='item_header'>网络方案：</Col>
            <Col span={4} className='title'>{item}</Col>
            <Col span={15}>
              {
                item == networksolutions[clusterID].current
                  ? <span className='tips'>{this.handleCurrentTemplate(item)}</span>
                  : <span></span>
              }
            </Col>
          </Row>
        </Col>
        <Col className='seconditem' span="14">
          {
            (item == 'calico' && item == networksolutions[clusterID].current) && <span>
              <span className='item_header'>允许该集群用户变更 inbound 隔离策略：</span>
              <span>
                {
                  networkPolicySupported
                    ? '允许变更'
                    : '禁止变更'
                }
              </span>
              <span className='open_permission' onClick={this.openPermissionModal}>
                {
                  !networkPolicySupported
                    ? '[ 允许变更 ]'
                    : '[ 禁止变更 ]'
                }
              </span>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => this.setState({ helpVisible: true })}
              >
                帮助
              </Button>
            </span>
          }
        </Col>
      </Row>
    })
    return arr
  }

  handlefooterTemplate() {
    const { clusterID, networksolutions } = this.props
    if (!networksolutions[clusterID] || !networksolutions[clusterID].supported) {
      return
    }
    let arr = networksolutions[clusterID].supported.map((item, index) => {
      if (item == 'macvlan') {
        return <div className="standard" key={'footer' + item}>
          <div className="title">Macvlan</div>
          <div className="item"><i className="fa fa-square pointer" aria-hidden="true"></i>基于二层隔离，所以需要二层路由支持，对物理网络基础设施依赖程度最高，从逻辑和Kemel层来看隔离性和性能最优的方案
            ，大多数云服务商不支持，所以混合云上比较难以实现。
          </div>
          <div className="item seconditem"><i className="fa fa-square pointer" aria-hidden="true"></i>固定容器实例IP：即固定服务内『容器实例』的IP，且设有一定的超时时间，如容器重启、容器删除后服务重新扩容实例个数、容器重新部署，会在超时时间之内保证服务内容器实例IP不变。
          </div>
        </div>
      }
      if (item == 'calico') {
        return <div className="standard" key={'footer' + item}>
          <div className="title">Calico</div>
          <div className="item"><i className="fa fa-square pointer" aria-hidden="true"></i>基于BGP协议的路由方案，支持细致的ACL控制，适合对隔离要求比较严格的场景，因为不涉及到二层的支持，所以对混合云亲和度比较高。
          </div>
        </div>
      }
    })
    return arr
  }

  openPermissionModal() {
    this.setState({
      permissionVisible: true,
      confirmLoading: false,
    })
  }

  confirmSettingPermsission() {
    const {
      networkPolicySupported, updateClusterConfig,
      clusterID, loadTeamClustersList,
      space, setCurrent
    } = this.props
    let Noti = new NotificationHandler()
    this.setState({
      confirmLoading: true
    })
    let body = {
      networkPolicySupported: !networkPolicySupported
    }
    updateClusterConfig(clusterID, body, {
      success: {
        func: () => {
          let message = '关闭权限成功'
          if (body.networkPolicySupported) {
            message = '开启权限成功'
          }
          Noti.success(message)
          this.setState({
            permissionVisible: false,
            confirmLoading: false,
          })
          loadTeamClustersList(space.teamID, { size: 100 }, {
            success: {
              func: () => {
                const { result } = this.props
                for (let i = 0; i < result.data.length; i++) {
                  if (result.data[i].clusterID == clusterID) {
                    setCurrent({
                      cluster: result.data[i],
                    })
                    break
                  }
                }
              },
              isAsync: true,
            }
          })
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          this.setState({
            confirmLoading: false,
          })
          let message = '开启权限失败，请重试'
          if (body.networkPolicySupported) {
            message = '关闭权限失败，请重试'
          }
          if (res.message) {
            message = res.message
          }
          Noti.error(message)
        }
      }
    })
  }

  copyOrder() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById(this.state.openInputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  copyCloseOrder() {
    const code = document.getElementById(this.state.closeInputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  copyYmal() {
    const code = document.getElementById(this.state.yamlTextarea)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  closeHelpModal() {
    const { modalHelp } = this.state
    this.setState({
      helpVisible: false,
      modalHelp: false,
    })
    setTimeout(() => {
      this.setState({
        activeKey: 'open',
      })
    }, 1000)
    if (modalHelp) {
      this.setState({
        permissionVisible: true,
      })
    }
  }
  handleSketch() {
    this.setState({
      sketchVisible: true,
    })
  }
  handleSketchClose() {
    this.setState({
      sketchVisible: false,
    })
  }
  handleDelClose() {
    this.setState({
      deleteVisible: false,
    })
  }
  handleDelDNS() {
    this.setState({
      deleteVisible: true,
    })
  }
  handleRemove(k) {
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    })
    form.setFieldsValue({
      keys,
    })
  }
  handleAdd() {
    let { dnsId } = this.state
    dnsId++;
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(dnsId)
    form.setFieldsValue({
      keys,
    })
    this.setState({
      dnsId,
    })
  }

  render() {
    const { networkPolicySupported } = this.props
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('keys', {
      initialValue: [0],
    })

    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    }
    let images = [
      { src: require('../../assets/img/sketch.png') }
    ]
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <Form.Item className="dns-form" {...formItemLayout} label="DNS地址" key={k}>
          <div style={{ marginBottom: 10 }}>
            <Input {...getFieldProps(`name${k}`, {
              rules: [{
                required: true,
                message: 'DNS地址不能为空！',
              }],
            }) } placeholder="请输入DNS地址，例如 8.8.8.8" style={{ width: '35%', marginRight: 8 }}
            />
            <Button type="primary" icon="check">
            </Button>
            <Button className="btn-del" icon="cross" onClick={() => this.handleRemove(k)}>
            </Button>
          </div>
          <Input {...getFieldProps(`name${k}`, {
            rules: [{
              required: true,
              message: 'DNS地址不能为空！',
            }],
          }) } disabled placeholder="请输入DNS地址，例如 8.8.8.8" style={{ width: '35%', marginRight: 8 }}
          />
          <div className="dns-edit dns-operation">
            <Icon type="edit" />
          </div>
          <div className="dns-del dns-operation">
            <Icon type="delete" onClick={() => this.handleDelDNS()}/>
          </div>
        </Form.Item>
      )
    })

    return (
      <div id="networksolutions">
        <div className='header'>
          集群网络方案
        </div>
        <div className='body'>
          {this.handlebodyTemplate()}
        </div>
        <div className="footer">
          {this.handlefooterTemplate()}
        </div>
        <div className="bottom">
          <div className="header">外部DNS <span>配置需要访问的外部 DNS ，如公司内网 DNS 等，最多 3 个外部 DNS</span>
          <a onClick={() => this.handleSketch()}>查看示意图</a></div>
          <Form form={this.props.form}>
            {formItems}
            <a className="btn-add" onClick={() => this.handleAdd()}><Icon type="plus-circle-o" style={{ color: '#2db7f5' }} /> 添加DNS</a>
          </Form>
        </div>
        <Modal
          title={<span>{networkPolicySupported ? '禁止变更' : '允许变更'}</span>}
          visible={this.state.permissionVisible}
          closable={true}
          onOk={this.confirmSettingPermsission}
          onCancel={() => this.setState({ permissionVisible: false })}
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="set_permission_modal"
          okText={<span>{networkPolicySupported ? '确定' : '已添加，开启允许'}</span>}
          cancelText={<span>{networkPolicySupported ? '取消' : '尚未添加'}</span>}
        >
          {
            networkPolicySupported
              ? <div className='info_box_close'>
                <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
                <div>
                  将关闭『允许当前集群用户开启 inbound 隔离』的功能。
                </div>
              </div>
              : <div className='info_box'>
                <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
                <div>
                  将允许当前集群用户开启 inbound 隔离，请提前创建允许所有代理出口 ip/网段 访问集群服务的策略，具体查看
                  <span className='help_button' onClick={() => this.setState({
                    helpVisible: true,
                    modalHelp: true,
                    permissionVisible: false
                  })}>帮助</span>
                  信息。
                </div>
              </div>
          }
        </Modal>
        <Modal
          title="帮助"
          visible={this.state.helpVisible}
          closable={true}
          onOk={this.closeHelpModal}
          onCancel={this.closeHelpModal}
          maskClosable={false}
          wrapClassName="help_modal"
        >
          <div className='tips_area'>
            <div className='tips'>
              在 master 控制节点上，保存以下内容为 policy.yaml 到任意目录，注意修改 net 字段中的内容为主机节点的网段信息。
            </div>
          </div>
          <Tabs
            className='tabs_area'
            activeKey={this.state.activeKey}
            onChange={(key) => this.setState({ activeKey: key })}
          >
            <Tabs.TabPane key="open" tab="添加节点允许访问策略" className='height open_area'>
              <pre className='order create_area'>
                {yamlFile}
                <Tooltip title={this.state.copyCMDSuccess ? '复制成功' : '点击复制'}>
                  <a
                    className={this.state.copyCMDSuccess ? "actions copyBtn copy_icon" : "copyBtn copy_icon"}
                    onClick={this.copyYmal}
                    onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                  >
                    <Icon type="copy" />
                  </a>
                </Tooltip>
                <textarea
                  id={this.state.yamlTextarea}
                  style={{ position: "absolute", opacity: "0", top: '0' }}
                  value={yamlFile}
                />
              </pre>
              <div className='title'>在安装了 calicoctl 命令的 master 控制节点上运行以下命令：</div>
              <pre className='order'>
                {createOrder}
                <Tooltip title={this.state.copyCMDSuccess ? '复制成功' : '点击复制'}>
                  <a
                    className={this.state.copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                    onClick={this.copyOrder}
                    onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                  >
                    <Icon type="copy" style={{ marginLeft: 8 }} />
                  </a>
                </Tooltip>
                <input
                  id={this.state.openInputId}
                  style={{ position: "absolute", opacity: "0", top: '0' }}
                  value={createOrder}
                />
              </pre>
            </Tabs.TabPane>
            <Tabs.TabPane key="close" tab="关闭节点允许访问策略" className='height'>
              <div className='title'>在安装了 calicoctl 命令的 master 控制节点上运行以下命令：</div>
              <pre className='order'>
                {deleteOrder}
                <Tooltip title={this.state.copyCMDSuccess ? '复制成功' : '点击复制'}>
                  <a
                    className={this.state.copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                    onClick={this.copyCloseOrder}
                    onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                  >
                    <Icon type="copy" style={{ marginLeft: 8 }} />
                  </a>
                </Tooltip>
                <input
                  id={this.state.closeInputId}
                  style={{ position: "absolute", opacity: "0", top: '0' }}
                  value={deleteOrder}
                />
              </pre>
            </Tabs.TabPane>
          </Tabs>
        </Modal>
        <Modal title="删除" visible={this.state.deleteVisible}
          onCancel={() => this.handleDelClose()}
          onOk={() => this.handleOk()}>
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <span> 如果有服务使用了该DNS解析的域名，删除之后可能无法正常访问外部的服务，是否确定删除 ？</span>
          </div>
        </Modal>
        <Modal title="集群内服务访问其它服务 DNS 策略示意图" visible={this.state.sketchVisible}
          onCancel={() => this.handleSketchClose()}
          footer={[
            <Button key="back" type="primary" onClick={() => this.handleSketchClose()}>知道了</Button>,
          ]}>
          <img src={images[0].src} />
        </Modal>
      </div>
    )
  }
}

NetworkSolutions = Form.create()(NetworkSolutions)
function mapStateToProp(state, props) {
  const { entities } = state
  const { networksolutions } = state.cluster_nodes || {}
  let networkPolicySupported = false
  let clusterID
  let space = entities.current.space
  const { result } = state.team.teamClusters || {}
  if (entities.current && entities.current.cluster) {
    networkPolicySupported = entities.current.cluster.networkPolicySupported
    clusterID = entities.current.cluster.clusterID
  }
  return {
    networksolutions,
    clusterID,
    space,
    networkPolicySupported,
    result,
  }
}

export default connect(mapStateToProp, {
  getNetworkSolutions,
  updateClusterConfig,
  loadTeamClustersList,
  setCurrent,
})(NetworkSolutions)