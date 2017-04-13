/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * alerm strategy component
 *
 * v0.1 - 2017-3-3
 * @author BaiYu
 */

import React, { Component } from 'react'
import { getSettingList, deleteSetting, updateEnable } from '../../actions/alert'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { calcuTime, formatDate } from '../../common/tools'
import { Icon, Button, Input, InputNumber, Select, Table, Dropdown, Modal, Menu, Pagination } from 'antd'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import './style/AlarmStrategy.less'
import NotificationHandler from '../../common/notification_handler'

function loadStrategy(scope) {
  // this func is load strategy data
  scope.setState({ deleteModal: false, btnAll: true, strategyID:[] })
  const { getSettingList, nodeName, cluster, appName, serviceName } = scope.props
  let body = {
    targetType: 0,
    targetName: serviceName,
    from: (scope.state.currentPage -1) * DEFAULT_PAGE_SIZE,
    size: DEFAULT_PAGE_SIZE
  }
  if (appName) {
    body = {
      appName
    }
  }
  if (nodeName) {
    body.targetType = 1
    body.targetName= nodeName
  }
  getSettingList(cluster,body, {
    failed: {
      func: ()=> {
        new NotificationHandler().error('获取策略失败')
      }
    }
  })
}

class AlarmStrategy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      btnAll: true,
      deleteModal: false,
      currentPage: DEFAULT_PAGE,
      size:DEFAULT_PAGE_SIZE,
    }
  }
  componentWillMount() {
    loadStrategy(this)
  }
  onPageChange(page) {
    if(page == this.state.currentPage) return
    this.setState({
      currentPage: page
    })
    const { getSettingList, cluster } = this.props
    getSettingList(cluster, {
      from: (page-1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    })
  }
  hnadDelete(e, record) {
    console.log('key is', e.key, record)
    switch(e.key) {
      case 'delete': {
        this.setState({deleteModal: true, strategyID: [record.strategyID]})
        return
      }
      case 'stop':{
        this.setState({enable: 'stop',strategyID: [record.strategyID]})
        return
      }
      case 'start':{
        this.setState({enable: 'start',strategyID: [record.strategyID]})
        return
      }
      default: return false
    }
  }
  dropdowns(record) {
    // Dropdown delete btn
    return (
      <Menu onClick={(key) => this.hnadDelete(key, record)}
        style={{ width: '80px' }}
      >
        <Menu.Item key="delete">
          <span>删除</span>
        </Menu.Item>
        <Menu.Item key="edit">
          <span>修改</span>
        </Menu.Item>
        <Menu.Item disabled={(record.enable ==0)} key="stop">
          <span>停用</span>
        </Menu.Item>
        <Menu.Item disabled={(record.enable ==1)} key="start">
          <span>启用</span>
        </Menu.Item>

      </Menu>

    )
  }
  handDelete() {
    const { strategyID } = this.state
    const _this = this
    const notifcation = new NotificationHandler()
    this.props.deleteSetting(this.props.cluster, strategyID, {
      success: {
        func:()=> {
          notifcation.success('删除策略成功')
         loadStrategy(_this)
        },
        isAsync: true
      }
    })
  }
  handEnable() {
    const { strategyID, enable } = this.state
    const _this = this
    let enables = enable == 'start' ? 1: 0
    const noticeText = enable== 'start' ? '策略启动中...':'策略停止中...'
    const body = {
      strategies:[{
        enable: enables,
        strategyID: strategyID.toString()
      }]
    }
    const notifcation = new NotificationHandler()
    notifcation.spin(noticeText)
    this.props.updateEnable(this.props.cluster, body, {
      success: {
        func: ()=> {
          notifcation.close()
          loadStrategy(_this)
        },
        isAsync: true
      },
      failed: {
        func: ()=> {
          notifcation.close()
          notifcation.error('策略修改失败！')
        }
      }
    })
    _this.setState({enable: false})
  }
  handClickRow(e) {
    console.log('eee',e,this.props.strategys)

  }
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'strategyName',
        key: 'strategyName',
        render: text => <a href="#">{text}</a>,
      },
      {
        title: '状态',
        dataIndex: 'enable',
        key: 'enable',
        render: text => {
          if (text == 1) {
            return <div style={{ color: '#33b867' }}><i className="fa fa-circle" /> &nbsp;启用</div>
          }
          if (text == 0) {
            return <div style={{ color: '#f23e3f' }}><i className="fa fa-circle" /> &nbsp;停用</div>
          }
          return <div style={{ color: '#FAB35B' }}><i className="fa fa-circle" /> &nbsp;告警</div>
        }
      },
      {
        title: '监控周期',
        dataIndex: 'repeatInterval',
        render: (text) => calcuTime(text)
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
        render: (text) => formatDate(text)
      },
      {
        title: '最后修改人',
        dataIndex: 'updater',
        key: 'updater',
      },
      {
        title: '操作',
        dataIndex: 'name',
        key: 'action',
        render: (text, record) => {
          return <Dropdown.Button type="ghost" onClick={()=> this.setState({lookModel: true})} overlay={this.dropdowns(record)}>忽略</Dropdown.Button>
        }
      }
    ];

    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys:`, selectedRowKeys, 'selectedRows: ', selectedRows);
        let btnAll = true

        if (selectedRows.length > 0) {
          btnAll = false
        }
        const strategyID = selectedRows.map((list)=> {
          return list.strategyID
        })
        _this.setState({ btnAll, strategyID, selectedRowKeys})
      }
    }
    const { total } = this.props.data || 0
    const { currentPage, size } = this.state
    return (
      <div className="alarmStrategy">
        <div className="topRow">
          <Button size="large" type="primary" onClick={()=>　loadStrategy(this)}><i className="fa fa-refresh" /> 刷新</Button>
          <Button icon="delete" size="large" type="ghost" onClick={() => this.setState({ deleteModal: true })} disabled={this.state.btnAll}>删除</Button>
        </div>
        <div className='pageBox'>
          <span className='totalPage'>共计 {total} 条</span>
          <Pagination
            simple
            className='inlineBlock'
            onChange={(page)=> this.onPageChange(page)}
            current={currentPage}
            pageSize={size}
            total={total} />
        </div>
        <Table className="strategyTable" onRowClick={(e)=> this.handClickRow(e)} rowSelection={rowSelection} columns={columns} dataSource={this.props.strategys} pagination={false} loading={this.props.isFetching} />
        <Modal title="删除策略" visible={this.state.deleteModal}
          onCancel={() => this.setState({ deleteModal: false })}
          onOk={() => this.handDelete()}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{ marginRight: 10 }}></i>策略删除后将不再发送邮件告警，是否确定删除？</div>
        </Modal>
        <Modal title="忽略" visible={this.state.lookModel}
          onOk={()=> this.handOverlook()} onCancel={()=> this.setState({lookModel: false})}
          okText="提交"
        >
          <div className="alertRow">注意：在忽略时间内我们将不会发送告警邮件通知！</div>
          <div className="modalParams">
            <span className="keys">忽略时长</span>
            <InputNumber size="large" min={1} style={{margin:'0 10px'}}/>
            <Select style={{width: 80}} size="large" defaultValue={'minute'}>
              <Option value="hour">小时</Option>
              <Option value="minute">分钟</Option>
              <Option value="second">秒</Option>
            </Select>
          </div>
        </Modal>
        {/* start or stop modal  */}
        <Modal title={this.state.enable =='start' ? '启用策略': '停止策略'} visible={this.state.enable ? true : false}
        onCancel={()=> this.setState({enable: false})}
        onOk={()=> this.handEnable()}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您是否确定要{this.state.enable =='start' ? '启用':'停止'}此策略 ?</div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { settingList } = state.alert
  if (!settingList) {
    return props
  }
  let defaultData = {
    data: {
      total: 0,
      strategys: []
    }
  }
  const { data } = settingList.result || defaultData
  const { strategys } = data

  return {
    data,
    isFetching:　settingList.isFetching,
    strategys
  }
}

export default connect(mapStateToProps, {
  getSettingList,
  deleteSetting,
  updateEnable, // start or stop
})(AlarmStrategy)