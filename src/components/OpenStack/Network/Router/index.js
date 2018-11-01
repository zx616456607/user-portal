/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * router list component
 *
 * v0.1 - 2017-12-27
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input,Form, Card, Table, Dropdown,Menu,Modal, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  getRouterList,
  createRouter,
  deleteRouter,
  editRouter,
  loadFloatipsList
 } from '../../../../actions/openstack/networks'
// import '../../style/Host.less'
import NotificationHandler from '../../../../common/notification_handler'
import { getAZList } from '../../../../actions/openstack/calculation_service'
import { checkName } from '../../../../common/naming_validation'

const Option = Select.Option
const Noti = new NotificationHandler()
class Routers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      confirmLoading: false,
      currentItem: {}
    }
    this.request = false
  }
  componentWillMount() {
    this.loadData()
  }

  loadData(e) {

    const { getRouterList } = this.props
    this.setState({isFetching: true})
    getRouterList({
      success: {
        func: (res) => {
          let routerList = res.routers
          this.setState({
            dataSource: routerList,
            bakList:routerList
          })
        }
      },
      finally:{
        func:()=> {
          this.setState({isFetching: false})
          if (e) {
            this.setState({searchValue: ''})
          }
        }
      }
    })
    if (this.request === false) {
      this.props.getAZList()
    }
    this.props.loadFloatipsList()
  }
  getAZ() {
    let { az } = this.props
    if (!az.result) return
    az = az.result.availabilityZoneInfo
    return az.map(item => {
      return <Option value={item.zoneName} key={item.zoneName}>{item.zoneName}</Option>
    })
  }
  actionCallback(innerText) {
    let callback = {
      success:{
        func:()=> {
          Noti.success(`${innerText}成功`)
          this.setState({
            create: false,
            editor: false,
            setRouter: false,
            clearRouter: false,
          })
          this.loadData()
        },
        isAsync: true
      },
      failed:{
        func:(res) => {
          let message
          try {
            message = res.message.NeutronError.message
          } catch (error) {

          }
          Noti.error(`${innerText}失败`,message)
        }
      },
      finally:{
        func:()=> {
          this.setState({createing: false,confirmLoading: false})
        }
      }
    }
    return callback
  }
  hanldCreate() {
    const { form } = this.props
    const { editor,create,currentItem } = this.state
    let validators = ['routerName','netAZ']
    if (editor) {
      validators= ['routerName']
    }
    form.validateFields(validators,(errors,values)=> {
      if (errors) return
      const body = {
        "router": {
          "name": values.routerName,
          "availability_zone_hints":[`${values.netAZ}`]
        }
      }
      this.setState({createing: true})
      if (!editor) {
        this.props.createRouter(body,this.actionCallback('创建'))
        return
      }
      let params = {
        router:{name:values.routerName}
      }
      this.props.editRouter(currentItem.id,params,
        this.actionCallback('修改')
      )
    })
  }
  deleteMoalfunc() {
    const { currentItem } = this.state
    this.setState({
      confirmLoading: true,
    })
    this.props.deleteRouter(currentItem.id,{
      success:{
        func:()=> {
          Noti.success('删除成功')
          this.loadData()
          this.setState({deleteMoal: false})
        },
        isAsync: true
      },
      failed:{
        func:(res)=> {
          let message
          try {
            message = res.message.NeutronError.message
          } catch (error) {

          }
          Noti.error(`删除失败`,message)
        }
      },
      finally: {
        func:()=> {
          this.setState({
            confirmLoading: false,
          })
        }
      }
    })
  }
  routerAction(e) {
    const { currentItem,selectIp } = this.state
    let innerText = '绑定'
    if (!selectIp && e === 'set') {
      Noti.info('请选择浮动IP')
      return
    }
    let params = {
      "router": {
        "external_gateway_info": {
          "network_id": this.state.selectId,
          "external_fixed_ips": [
            {
              "ip_address": selectIp
            }
          ]
        }
      }
    }
    if (e=='clear') {
      innerText = '清除'
      params = {
        "router": {
          "external_gateway_info": {}
        }
      }
    }
    this.setState({confirmLoading: true})
    this.props.editRouter(currentItem.id,params,
      this.actionCallback(innerText)
    )
  }
  searchInputChange = e => {
    let value = e.target.value
    this.setState({
      searchValue: value
    })
  }

  searchInput = () => {
    const { searchValue,bakList } = this.state

    if(!searchValue){
      this.setState({
        dataSource: bakList
      })
    }
    const newList = bakList.filter( list => {
      const search = new RegExp(searchValue)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      dataSource: newList
    })
  }

  createBtn() {
    this.setState({create: true})
  }
  showConfirmModal(menu,row) {
    if(menu.key === 'set') {
      this.setState({setRouter: true,currentItem: row})
      return
    }
    this.setState({clearRouter: true,currentItem: row})
  }
  menu (row){
    return <Menu onClick={(item) => this.showConfirmModal(item, row)} style={{width:80}}>
      <Menu.Item key="set" disabled={!!row.externalGatewayInfo}>设置网关</Menu.Item>
      <Menu.Item key="clear" disabled={!row.externalGatewayInfo}>清除网关</Menu.Item>
    </Menu>
  }
  changeFloatIP(e) {
    const float = e.split('@')
    this.setState({selectId:float[0],selectIp:float[1]})
  }
  flotipList() {
    const { floatingips } = this.props
    if (!Array.isArray(floatingips)) return
    let ipList = []
    floatingips.forEach(item => {
      if (item.status === 'DOWN') {
        ipList.push( <Select.Option key={`${item.floatingNetworkId}@${item.floatingIpAddress}`}>{item.floatingIpAddress}</Select.Option>)
      }
    })
    return ipList
  }
  menuAction(row) {
    this.setState({
      currentItem: row,
      editor: true,
      create: true
    })
  }
  render() {
    const { dataSource } = this.state
    const { form } = this.props
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 },
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'names',
        width:'30%',
        render: (name,record) => {
          return <Link to={`/OpenStack/router/${record.id}`}>{name}</Link>
        }
      }, {
        title: '可用域',
        dataIndex: 'availabilityZoneHints',
        key: 'availability_zone_hints',
        width:'20%',
        render: text=> {
          if (!text.length) {
            return '-'
          }
          return text
        }
      }, {
        title: '外部网络',
        dataIndex: 'externalGatewayInfo',
        key: 'externalGatewayInfo',
        width:'25%',
        render: (text,row) => {
          if (text) {
            let wrapNetname=''
            try {
              wrapNetname = row.networkInfo.name

            } catch (error) {
            }
            return wrapNetname += " ( " +text.externalFixedIps.map(item=> item.ipAddress).join(',') +' )'
          }
          return '-'
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row)=> {
          return <div>
            <Button style={{marginRight:8}} onClick={()=> this.setState({currentItem:row,deleteMoal: true})}>删除</Button>
            <Button type="primary" style={{marginRight:8}} onClick={()=> this.menuAction(row)}>编辑</Button>
            {/* <Dropdown.Button
              overlay={this.menu(row)} onClick={()=> this.menuAction(row)}
              type="primary" trigger={['click']}>编辑
            </Dropdown.Button> */}
          </div>
        }
      }
    ]
    const paginationOpts = {
      simple: true
    }
    const routerName = form.getFieldProps('routerName', {
      rules: [
        { validator: checkName.bind(this)},
      ]
    })
    const netAZ = form.getFieldProps('netAZ', {
      rules: [
        { required: true, message: "请选择可用域" },
      ]
    })
    return (
      <QueueAnim id="openstack">
        <div className="top-row" style={{paddingLeft: '0', marginTop: 0}} size="large">
          <Button type="primary" size="large" onClick={()=> this.createBtn()}>
            <i className="fa fa-plus" aria-hidden="true"></i> 创建路由器
          </Button>
          <Button type="ghost" size="large" onClick={()=> this.loadData(true)}><i className='fa fa-refresh' /> 刷新</Button>
          <Input size="large" placeholder="请输入路由器名搜索" style={{width:180}} value={this.state.searchValue} onPressEnter={this.searchInput} onChange={this.searchInputChange}/>
          <i className="fa fa-search btn-search" onClick={this.searchInput}/>
        </div>
        <Card key="router" id="router" className="host-list">
          <div id="host-body">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={ paginationOpts }
              loading={this.state.isFetching}
              className='strategyTable'
            />
            {dataSource && dataSource.length >0?
              <span className="pageCount">共计 {dataSource.length} 条</span>
              :null
            }
          </div>
        </Card>
        {this.state.create &&
          <Modal title={this.state.editor ? '编辑路由器':'创建路由器'}
            visible={true}
            maskClosable={false}
            confirmLoading={this.state.createing}
            onCancel={()=> this.setState({create: false})}
            onOk={()=> this.hanldCreate()}
            wrapClassName="reset_form_item_label_style"
            >
            <Form>
              <div style={{height:10}}></div>
              <Form.Item {...formItemLayout} label="路由器名称">
                <Input {...routerName} placeholder="请输入路由器名称" />
              </Form.Item>
              {!this.state.editor &&
                <Form.Item label="可用域" {...formItemLayout}>
                  <Select {...netAZ} placeholder="请选择可用域">
                    {this.getAZ()}
                    </Select>
                </Form.Item>
              }
            </Form>
          </Modal>
        }
        <Modal title="删除操作"
          visible={this.state.deleteMoal}
          onCancel={()=> this.setState({deleteMoal: false})}
          onOk={()=> this.deleteMoalfunc()}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="alertRow">确定要删除路由器 <span style={{color: '#2DB7F5'}}>{this.state.currentItem.name}</span> 吗？</div>
        </Modal>
        { this.state.setRouter &&
          <Modal title="设置路由器网关"
            visible={this.state.setRouter}
            onCancel={()=> this.setState({setRouter: false})}
            onOk={()=> this.routerAction('set')}
            confirmLoading={this.state.confirmLoading}
          >
            <div className="alertRow">如果没有可用的浮动IP，请前往计算资源中的浮动IP选单中申请一个浮动IP</div>
            浮动IP: <Select size="large" placeholder="请选择浮动IP" onChange={(e)=> this.changeFloatIP(e)} style={{width:'80%',marginLeft: 10}}>
              {this.flotipList()}
            </Select>
          </Modal>
        }
        <Modal title="清除路由器网关"
          visible={this.state.clearRouter}
          onCancel={()=> this.setState({clearRouter: false})}
          onOk={()=> this.routerAction('clear')}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="alertRow">
          您选择了 {this.state.currentItem.name} 进行网关清除。
          请确认您的选择，清除路由器网关操作后路由器所连接的网络将无法访问外网</div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  const { openstack } = state
  let ycProjects = state.user.ycProjects || {}
  const { floatips } = openstack
  const { result} = floatips || {}
  let floatingips=[]
  let isFetching = false
  let host = []
  if (result && result.floatingips) {
    floatingips = result.floatingips
  }
  let defaultAZ = {
    isFetching: false,
    result: {
      availabilityZoneInfo: []
    }
  }
  let { az } = openstack
  if (!az) {
    az = defaultAZ
  }
  if(ycProjects.result) {
    ycProjects.projects = ycProjects.result.projects
  }
  return {
    ycProjects,
    floatingips,
    az
  }

}
Routers = Form.create()(Routers)

export default connect(mapStateToProps, {
  getRouterList,
  createRouter,
  deleteRouter,
  editRouter,
  loadFloatipsList,
  getAZList
})(Routers)