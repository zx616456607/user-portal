/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * router detail component
 *
 * v0.1 - 2017-12-29
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Modal, Card, Table,Row,Col,Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
// import Title from '../../Title'
import {
  getChildRouter,getSubnetsRouter,
  addRouterSubnet,removeRouterSubnet
 } from '../../../../actions/openstack/networks'
import { connect } from 'react-redux'
// import TimeControl from '../../Metrics/TimeControl'
// import '../style/HostDetail.less'
import NotificationHandler from '../../../../common/notification_handler'
const notificat = new NotificationHandler()

class RouterDetail extends Component {
  constructor(props) {
    super()
    this.state ={
      dataSource:[],
      selectedRowKeys: []
    }
  }
  componentWillMount() {
    this.loadData()
  }
  loadData() {
    const { params,location } = this.props
    const project = location.query.project
    this.setState({isFetching: true})
    this.props.getChildRouter({project},params.name,{
      success:{
        func:(res)=> {
          let dataSource = res.router.subnet || []
          this.setState({
            dataSource,
            routerName: res.router.name,
            routerId:res.router.id
          })
        }
      },
      finally:{
        func:()=> {
          this.setState({isFetching: false})
        }
      }
    })
  }
  componentDidMount() {
    this.props.getSubnetsRouter(null,{
      success:{
        func:(res)=> {
          this.setState({subnets:res.subnets})
        }
      },
      failed:{
        func:()=> {
          this.setState({subnets:[]})
        }
      }
    })
  }
  subnetList() {
    return this.state.subnets.map( item => {
      return <Select.Option key={item.id}>{item.name}: {item.cidr}</Select.Option>
    })
  }
  appSubnet() {
    if (!this.state.selected) {
      notificat.info('请选择子网')
      return
    }
    this.setState({adding: true})
    let query = {
      routerId: this.state.routerId,
      subnetId: this.state.selected
    }
    this.props.addRouterSubnet(query,this.actionCallback('连接'))
  }
  removeSubnet() {
    this.setState({adding: true})
    let query = {
      routerId: this.state.routerId,
      subnetId: this.state.selectedRow[0].id
    }
    this.props.removeRouterSubnet(query,this.actionCallback('断开'))
  }
  actionCallback(text) {
    return {
      success:{
        func:()=> {
          notificat.success(text + '子网成功')
          this.setState({
            addModal: false,
            removeModal: false,
            selectedRowKeys:[],
            selected: false
          })
          this.loadData()
        },
        isAsync: true
      },
      failed:{
        func:(res)=> {
          let message = ''
          try {
            message = res.message.NeutronError.message
          } catch (error) {

          }
          notificat.error(text +'子网失败',message)
        }
      },
      finally:{
        func:()=> {
          this.setState({adding: false})
        }
      }
    }
  }
  render() {
    const { dataSource } = this.state
    const columns = [
      {
        title: '网络名称',
        dataIndex: 'name',
        key: 'names',
        width:'20%',
        render:text => {
          return text.split('_default')[0]
        }
      }, {
        title: '子网名称',
        dataIndex: 'childName',
        key: 'childName',
        width:'25%',
        render: (text,row)=> {
          return row.name
        }
      },{
        title: '网络地址',
        dataIndex: 'cidr',
        key: 'cidr',
        width:'15%',
      },{
        title: '网关IP',
        dataIndex: 'gatewayIp',
        key: 'gateway_ip',
        width:'15%',
      }, {
        title: '固定IP',
        dataIndex: 'test',
        key: 'test',
        width:'20%',
        render:(text,row) => row.gatewayIp
      }
    ]
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange:(selectedRowKeys,selectedRow)=> {
        this.setState({selectedRowKeys,selectedRow})
      }
    }
    return (
      <QueueAnim id="host" >
        <div className="host-body" key="routerDetail" style={{padding:20}}>
          <div className="clearfix">
            <span className="back" onClick={() => browserHistory.push('/base_station/net?activeTab=router')}>
              <span className="backjia"></span>
              <span className="btn-back">返回</span>
            </span>
          </div>
          <br />
          <div className="host-list" style={{background:'white',padding:'20px 20px 50px 20px',borderRadius:5}}>
            <div>
              <Button type="primary" onClick={()=> this.setState({addModal: true})} size="large" icon="plus-circle-o">连接子网</Button>
              <Button size="large"
                disabled={!(this.state.selectedRowKeys.length ==1)}
                onClick={()=> this.setState({removeModal: true})}
                style={{margin:'0 8px'}} icon="minus-circle-o">断开子网</Button>
              <Button size="large" onClick={()=> this.loadData()}>刷新</Button>
            </div>

            <Table
              dataSource={dataSource}
              rowSelection={rowSelection}
              columns={columns}
              pagination={ false }
              loading={this.state.isFetching}
              className='reset_antd_Table_header_style'
            />
            {/* {dataSource && dataSource.length >0?
              <span className="pageCount" style={{position:'absolute',right:'170px',top:'10px'}}>共计 {dataSource.length} 条</span>
              :null
            } */}
          </div>
        </div>
        { this.state.addModal &&
          <Modal title="连接子网" visible={true}
            onCancel={()=> this.setState({addModal: false})}
            onOk={()=> this.appSubnet()}
            confirmLoading={this.state.adding}
            >
            <Row style={{margin:'10px 0'}}>
              <Col span="4" style={{lineHeight:'30px'}}>路由器名称</Col>
              <Col span="18"><Input disabled={true} size="large" value={this.state.routerName} /></Col>
            </Row>
            <Row style={{margin:'20px 0'}}>
              <Col span="4" style={{lineHeight:'30px'}}>子网</Col>
              <Col span="18">
                <Select placeholder="请选择子网" size="large" style={{width: '100%'}} onChange={(id)=> this.setState({selected:id})}>
                  { this.subnetList() }
                </Select>
              </Col>
            </Row>
          </Modal>
        }
        { this.state.removeModal &&
          <Modal title="断开子网连接"
            visible={true}
            onCancel={()=> this.setState({removeModal: false})}
            okText="断开连接"
            onOk={()=> this.removeSubnet()}
            confirmLoading={this.state.adding}
            >
            <div className="alertRow">您已经选择了 {this.state.selectedRow.map(item => item.name.split('_default')[0]).join('，')}。<br/>请再次确认您的选择，断开网络操作无法恢复。</div>
          </Modal>
        }
      </QueueAnim>
    )

  }
}


export default connect(null, {
  getChildRouter,
  getSubnetsRouter,
  addRouterSubnet,
  removeRouterSubnet
})(RouterDetail)