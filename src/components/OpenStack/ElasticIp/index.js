/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * elastic ip list component
 *
 * v0.1 - 2017-8-14
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Card, Table, Dropdown, Menu, Modal, Row, Col, Select, InputNumber, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import './style/Ip.less'
import {
  loadNetworksList,
  loadFloatipsList,
  createFloatips,
  deleteFloatips,
  manageFloatips,
  getRouterList,
  editRouter,
  clearFloatips
} from '../../../actions/openstack/networks'

import NotificationHander from '../../../common/notification_handler'
// import liberate from '../../../assets/img/icon/liberate.svg'
// import Title from '../../Title'
const notificat = new NotificationHander()

class ElasticIP extends Component {
  constructor(props) {
    super()
    this.state = {
      networkUnit: 1,
      currentEntity: {},
      routerList: [],// router list
    }
  }
  componentWillMount() {
    this.loadData()
  }

  componentWillUnmount() {
    this.props.clearFloatips()
  }
  loadData = () => {
    this.props.loadNetworksList()
    this.setState({isFetching: true})
    this.props.loadFloatipsList({
      success: {
        func: (res) => {
          this.setState({ floatingips: res.floatingips })
        }
      },
      failed: {
        func: (res) => {
          let message = ''
          if (res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              // message = ``
            }
          }
          notificat.error('获取列表失败', message)
        }
      },
      finally: {
        func: () => {
          this.setState({isFetching: false})
        }
      }
    })
  }
  loadRouter() {

    const { getRouterList } = this.props
    getRouterList({
      success: {
        func: (res) => {
          let routerList = res.routers
          this.setState({
            routerList: routerList
          })
        }
      }
    })
  }
  searchIP() {
    const searchName = document.getElementById('searchInput').value
    if (!searchName || searchName == '') {
      this.setState({ floatingips: this.props.floatingips })
      return
    }
    const newfloat = this.props.floatingips.filter(item => {
      const search = new RegExp(searchName)
      if (search.test(item.floatingIpAddress)) {
        return true
      }
      return false
    })
    this.setState({ floatingips: newfloat })
  }

  hostModalfunc = (visible) => {
    this.setState({ bindHost: visible })
  }
  resiseModalfunc = (e) => {
    this.setState({ resiseModal: e })
  }
  showConfirmModal(item, row) {
    this.setState({
      [item.key]: true,
      currentEntity: row,
    })
    if (item.key === 'bindModal') {
      this.loadRouter()
    }
  }
  menuAction(row) {
    if (row.status !== 'DOWN') {
      return
    }
    if (row.instanceName) {
      Modal.warning({
        title: '警告',
        content: '绑定中的浮动IP不可以直接释放！'
      })
      return
    }
    this.setState({ deleteMoal: true, currentEntity: row })
  }
  hanldCreateIp() {

    const { network, networkUnit } = this.state
    let networkId = network
    if (!network) {
      networkId = this.props.networksList[0].id
    }
    const body = {
      "floatingip": {
        "floating_network_id": networkId,
        // "bandwidth": networkUnit
      }
    }
    notificat.spin('创建中...')
    this.setState({ createing: true })
    this.props.createFloatips(body, {
      success: {
        func: (res) => {
          this.loadData()
          notificat.success('创建成功', 'IP: ' + res.floatingip.floatingIpAddress, 10)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message = ''
          if (res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              // message = ``
            }
          }
          notificat.error('创建失败', message)
        }
      },
      finally: {
        func: () => {
          this.setState({ create: false, createing: false })
          notificat.close()
        }
      }
    })
  }
  deleteAction() {
    this.setState({ deleteing: true })
    notificat.spin('释放IP中...')
    this.props.deleteFloatips(this.state.currentEntity.id, {
      success: {
        func: () => {
          notificat.success('操作成功')
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message = ''
          if (res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              // message = ``
            }
          }
          notificat.error('操作失败', message)
        }
      },
      finally: {
        func: () => {
          notificat.close()
          this.setState({ deleteing: false, deleteMoal: false })
        }
      }
    })
  }
  // upstream bind func
  handFloatIp(e) {

    const { vm, currentEntity } = this.state
    let text = '解绑'
    let type = 'notModal'
    let host = currentEntity.instanceId
    let body = {
      removeFloatingIp: { address: currentEntity.floatingIpAddress }
    }
    if (e == 'bind') {
      text = '绑定'
      type = 'bindHost'
      host = vm
      if (!this.state.vm) {
        notificat.info('请选择云主机')
        return
      }
      body = {
        addFloatingIp: { address: currentEntity.floatingIpAddress }
      }
    }
    notificat.spin(`${text}中...`)
    this.setState({ floating: true })
    this.props.manageFloatips(host, body, {
      success: {
        func: () => {
          notificat.success(`${text}成功`)
          this.setState({ [type]: false, vm: null, binding: false })
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message = ''
          try {
            message = typeof res.message == 'string' ? res.message : res.message.badRequest.message
          } catch (err) {

          }
          notificat.error(`${text}失败`, message)
        }
      },
      finally: {
        func: () => {
          notificat.close()
          this.setState({ floating: false, binding: false })
        }
      }
    })
  }
  menu(row) {
    return <Menu onClick={(item) => this.showConfirmModal(item, row)} style={{ width: 100 }}>
      <Menu.Item key="bindModal" disabled={!(row.status == 'DOWN')}>绑定到路由</Menu.Item>
      <Menu.Item key="bindHost" disabled={!(row.status == 'DOWN')}>绑定到云主机</Menu.Item>
      <Menu.Item key="notModal" disabled={row.status == 'DOWN'}>解绑</Menu.Item>
    </Menu>
  }
  netOpction = () => {
    const result = []
    this.props.networksList.forEach(item => {
      if (item["router:external"]) {
        result.push(<Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)
      }
    })
    return result
  }
  hostList = () => {
    return this.props.host.map(item => {
      return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
    })
  }
  routerSelect() {
    let selectList = []
    this.state.routerList.forEach(item => {
      if (!item.networkInfo) {
        selectList.push(<Select.Option key={`${item.id}`}>{item.name}</Select.Option>)
      }
    })
    return selectList
  }

  createBtn() {

    this.setState({ create: true })
  }
  actionCallback(innerText) {
    let callback = {
      success: {
        func: () => {
          notificat.success(`${innerText}成功`)
          this.setState({
            bindHost: false,
            bindModal: false,
            notModal: false,
            routerId: null,
          })
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message
          try {
            message = res.message.NeutronError.message
          } catch (error) {

          }
          notificat.error(`${innerText}失败`, message)
        }
      },
      finally: {
        func: () => {
          this.setState({ binding: false })
        }
      }
    }
    return callback
  }
  binFloatIpin(type) {
    const { currentEntity, routerId } = this.state
    if (!routerId) {
      notificat.info('请选择路由器')
      return
    }
    let params = {
      "router": {
        "external_gateway_info": {
          "network_id": currentEntity.floatingNetworkId,
          "external_fixed_ips": [
            {
              "ip_address": currentEntity.floatingIpAddress
            }
          ]
        }
      }
    }
    this.setState({ binding: true })
    this.props.editRouter(routerId, params,
      this.actionCallback('绑定路由器')
    )
  }
  notBind() {
    const { currentEntity } = this.state
    let params = {
      "router": {
        "external_gateway_info": {}
      }
    }
    this.setState({ binding: true })
    if (!currentEntity.instanceName) {
      // has instanceName in not bind router
      this.props.editRouter(currentEntity.routerId, params,
        this.actionCallback('解绑路由器')
      )
      return
    }
    this.handFloatIp()
  }
  render() {
    const { networksList } = this.props
    const { floatingips } = this.state
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: '25%'
        //render: (text,row) => <Link to={`/base_station/host/${row.name}`}>{text}</Link>
      },
      {
        title: '绑定资源',
        dataIndex: 'instanceName',
        key: 'bind',
        width: '35%',
        render: (text, record) => {
          if (record.status == 'DOWN') {
            return '未绑定'
          }
          if (record.status == 'ERROR') {
            return '异常'
          }
          if (text) {
            return <div>云主机 {text}</div>
          }
          return '非云主机'
        }
      },
      {
        title: 'IP地址',
        dataIndex: camelize('floating_ip_address'),
        key: 'ip',
        width: '13%'
      }, {
        title: '带宽(Mbps)',
        dataIndex: camelize('bandwidth'),
        key: 'createAt',
        width: '12%'
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: '100px',
        render: (text, row) => {
          if (row.status !== 'DOWN') {
            return <Tooltip title="释放需要解除已有绑定">
              <Dropdown.Button overlay={this.menu(row)} onClick={() => this.menuAction(row)} type="ghost" trigger={['click']}>释放</Dropdown.Button>
            </Tooltip>
          }
          return <Dropdown.Button overlay={this.menu(row)} onClick={() => this.menuAction(row)} type="ghost" trigger={['click']}>释放</Dropdown.Button>
        }
      }
    ]
    const paginationOpts = {
      simple: true,
      pageSize: 10,
    }
    const funcCallback = {
      hostModalfunc: this.hostModalfunc
    }
    const resiseCallback = {
      resiseModalfunc: this.resiseModalfunc
    }

    return (
      <div id="openstack">
        <div className="top-row">
          <Button type="primary" size="large" onClick={() => this.createBtn()}><i className="fa fa-plus" aria-hidden="true"></i> 申请</Button>
          <Button type="ghost" size="large" onClick={() => this.loadData()}><i className='fa fa-refresh' /> 刷新</Button>
          <Input placeholder="请输入IP进行搜索" size="large" id="searchInput" style={{ width: 180 }} onPressEnter={() => this.searchIP()} />
          <i className='fa fa-search btn-search' onClick={() => this.searchIP()}></i>
        </div>
        <Card id="elasticIP-body" className="host-list">
          <Table
            dataSource={floatingips}
            columns={columns}
            pagination={paginationOpts}
            loading={this.state.isFetching} className="strategyTable"
          />
          {floatingips && floatingips.length > 0 ?
            <span className="pageCount">共计 {floatingips.length} 条</span>
            : null
          }
        </Card>

        <Modal title="释放操作"
          visible={this.state.deleteMoal}
          confirmLoading={this.state.deleteing}
          onCancel={() => this.setState({ deleteMoal: false })}
          onOk={() => this.deleteAction()}
          maskClosable={false}
        >
          <div className="alertRow">{`确定要释放IP ${this.state.currentEntity ? this.state.currentEntity.floatingIpAddress : ''} ?`}</div>
        </Modal>
        {this.state.create ?
          <Modal title="申请弹性IP"
            visible={true}
            maskClosable={false}
            confirmLoading={this.state.createing}
            onCancel={() => this.setState({ create: false })}
            onOk={() => this.hanldCreateIp()}
          >
            <Row>
              <Col span="5" style={{ lineHeight: '35px' }}>IP池</Col>
              <Col span="16">
                <Select defaultValue={networksList[0].name} onChange={(value) => this.setState({ network: value })} placeholder="请选择网络" style={{ width: '100%' }} size="large">
                  {this.netOpction()}
                </Select>
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={5} style={{ lineHeight: '35px' }}>带宽(Mbps)</Col>
              <Col span={16}>
                <InputNumber size="large" onChange={(value) => this.setState({ networkUnit: value })} min={1} max={100} step={1} defaultValue={1} style={{ width: 100 }} />
              </Col>
            </Row>
          </Modal>
          : null
        }
        {this.state.bindHost ?
          <Modal title="绑定到云主机"
            visible={true}
            onCancel={() => this.setState({ bindHost: false })}
            onOk={() => this.handFloatIp('bind')}
            maskClosable={false}
            confirmLoading={this.state.floating}
          >
            <Row>
              <Col span="5" style={{ lineHeight: '35px' }}>IP地址</Col>
              <Col span="16">
                <Input size="large" value={this.state.currentEntity.floatingIpAddress} disabled={true} />
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={5} style={{ lineHeight: '35px' }}>云主机</Col>
              <Col span={16}>
                <Select placeholder="请选择云主机" onChange={(e) => this.setState({ vm: e })} size="large" style={{ width: '100%' }}>
                  {this.hostList()}
                  {/* host.servers */}
                </Select>
              </Col>
            </Row>
          </Modal>
          : null
        }
        {this.state.bindModal ?
          <Modal title="绑定到路由"
            visible={true}
            onCancel={() => this.setState({ bindModal: false })}
            onOk={() => this.binFloatIpin('router')}
            maskClosable={false}
            confirmLoading={this.state.binding}
          >
            <Row>
              <Col span="5" style={{ lineHeight: '35px' }}>IP地址</Col>
              <Col span="16">
                <Input size="large" value={this.state.currentEntity.floatingIpAddress} disabled={true} />
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={5} style={{ lineHeight: '35px' }}>路由器</Col>
              <Col span={16}>
                <Select placeholder="请选择路由器" onChange={(e) => this.setState({ routerId: e })} size="large" style={{ width: '100%' }}>
                  {this.routerSelect()}
                  {/* router .servers */}
                </Select>
              </Col>
            </Row>
          </Modal>
          : null
        }
        {
          this.state.notModal ?
            <Modal title="解除绑定"
              maskClosable={false}
              visible={true}
              onCancel={() => this.setState({ notModal: false })}
              onOk={() => this.notBind()}
              confirmLoading={this.state.binding}
            >
              <div className="alertRow">您选择了：{this.state.currentEntity.floatingIpAddress}
                <div>确定要解绑定操作？可能会断开已绑定资源的网络。</div>
              </div>
            </Modal>
            : null
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { floatips } = state.openstack
  const { result } = floatips || {}
  let floatingips = []
  let isFetching = false
  let host = []
  if (result && result.floatingips) {
    floatingips = result.floatingips
    host = result.vm
  }
  if (floatips) {
    isFetching = floatingips.isFetching
  }
  const { networks } = state.openstack
  let networksList = []
  if (networks && networks.result) {
    networksList = networks.result.networks
  }

  return {
    isFetching,
    floatingips,
    networksList,
    host,
  }
}

export default connect(mapStateToProps, {
  loadFloatipsList,
  createFloatips,
  deleteFloatips,
  loadNetworksList,
  // getVMList,
  manageFloatips,
  getRouterList,
  editRouter,
  clearFloatips
})(ElasticIP)
