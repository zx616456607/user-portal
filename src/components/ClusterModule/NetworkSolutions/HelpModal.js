import React, { Component } from 'react'
import { Checkbox, Row, Col, Modal, Button, Tabs, Tooltip, Icon, Form, Input } from 'antd'
import { genRandomString } from '../../../common/tools'

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
        net: "192.168.1.0/24"
---
- apiVersion: v1
  kind: policy
  metadata:
    name: k8s-policy-no-match
  spec:
    egress:
    - action: pass
      destination: {}
      source: {}
    ingress:
    - action: pass
      destination: {}
      source: {}
    order: 2000
    selector: has(calico/k8s_ns)`

export default class HelpModal extends Component {
  state = {
    activeKey: 'open',
    copyCMDSuccess: false,
    yamlTextarea: `yamlTextarea${genRandomString('012345678', 4)}`,
    openInputId: `openPermissoionInput${genRandomString('0123456789', 4)}`,
    closeInputId: `closePermissoionInput${genRandomString('012345678', 4)}`,
  }

  onCancel = () => {
    this.setState({
      activeKey: 'open',
    }, () => {
      this.props.closeHelpModal()
    })
  }
  copyOrder = () => {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById(this.state.openInputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  copyCloseOrder = () => {
    const code = document.getElementById(this.state.closeInputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  copyYmal = () => {
    const code = document.getElementById(this.state.yamlTextarea)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }
  render() {
    const { helpVisible, closeHelpModal, isNotMasterNode } = this.props
    const { activeKey, copyCMDSuccess, yamlTextarea, openInputId, closeInputId } = this.state
    return (
      <Modal
        title="帮助"
        visible={helpVisible}
        closable={true}
        onOk={this.onCancel}
        onCancel={this.onCancel}
        maskClosable={false}
        wrapClassName="help_modal"
      >
        <div className='tips_area'>
          <div className='tips'>
            在{ isNotMasterNode ? '内网代理节点' : ' master 控制节点' }上，保存以下内容为 policy.yaml 到任意目录，注意修改 net 字段中的内容为主机节点的网段信息。
          </div>
        </div>
        <Tabs
          className='tabs_area'
          activeKey={activeKey}
          onChange={(key) => this.setState({ activeKey: key })}
        >
          <Tabs.TabPane key="open" tab="添加节点允许访问策略" className='height open_area'>
            <pre className='order create_area'>
              {yamlFile}
              <Tooltip title={copyCMDSuccess ? '复制成功' : '点击复制'}>
                <a
                  className={copyCMDSuccess ? "actions copyBtn copy_icon" : "copyBtn copy_icon"}
                  onClick={this.copyYmal}
                  onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                >
                  <Icon type="copy" />
                </a>
              </Tooltip>
              <textarea
                id={yamlTextarea}
                style={{ position: "absolute", opacity: "0", top: '0' }}
                value={yamlFile}
              />
            </pre>
            <div className='title'>在安装了 calicoctl 命令的{ isNotMasterNode ? '内网代理节点' : ' master 控制节点' }上运行以下命令：</div>
            <pre className='order'>
              {createOrder}
              <Tooltip title={copyCMDSuccess ? '复制成功' : '点击复制'}>
                <a
                  className={copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                  onClick={this.copyOrder}
                  onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                >
                  <Icon type="copy" style={{ marginLeft: 8 }} />
                </a>
              </Tooltip>
              <input
                id={openInputId}
                style={{ position: "absolute", opacity: "0", top: '0' }}
                value={createOrder}
              />
            </pre>
          </Tabs.TabPane>
          <Tabs.TabPane key="close" tab="关闭节点允许访问策略" className='height'>
            <div className='title'>在安装了 calicoctl 命令的{ isNotMasterNode ? '内网代理节点' : ' master 控制节点' }上运行以下命令：</div>
            <pre className='order'>
              {deleteOrder}
              <Tooltip title={copyCMDSuccess ? '复制成功' : '点击复制'}>
                <a
                  className={copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                  onClick={this.copyCloseOrder}
                  onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }), 500)}
                >
                  <Icon type="copy" style={{ marginLeft: 8 }} />
                </a>
              </Tooltip>
              <input
                id={closeInputId}
                style={{ position: "absolute", opacity: "0", top: '0' }}
                value={deleteOrder}
              />
            </pre>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    )
  }
}