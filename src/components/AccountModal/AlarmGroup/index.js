/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *  server and app some port in card
 *
 * v0.1 - 2017/03/24
 * @author Zhangchengzheng
 */

'use strict'
import React, { Component } from 'react'
import { Button, Input, Table, Dropdown, Menu, Icon, Popover, Modal, Form, Card, Pagination } from 'antd'
import './style/AlarmGroup.less'
import QueueAnim from 'rc-queue-anim'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import CreateAlarm from '../../AppModule/AlarmModal/CreateGroup'
const InputGroup = Input.Group
import { loadNotifyGroups, deleteNotifyGroups } from '../../../actions/alert'
import NotificationHandler from '../../../common/notification_handler'
import { connect } from 'react-redux'
import moment from 'moment'

class AlarmGroup extends Component {
  constructor(props) {
    super(props)
     this.state = {
        createGroup: false,
        deleteModal: false,
        deletingGroupIDs: [],
        createModalTitle: '创建新通知组',
        selectedRowKeys: [],
        selectedRows: [],
        modifyGroup: false,
        modifyingGroupInfo: {},
     }
  }
  componentWillMount() {
    document.title = '告警通知组 | 时速云'
    const { loadNotifyGroups } = this.props
    loadNotifyGroups()
  }
  dropdowns (record, group){
    // Dropdown delete btn
    return(
      <Menu onClick={(record)=> this.handleDropdownClick(record, group)}
          style={{ width: '80px' }}
      >
      <Menu.Item key="delete">
        <span>删除</span>
      </Menu.Item>
      <Menu.Item key="edit">
        <span>修改</span>
      </Menu.Item>
    </Menu>
    )
  }

  // group must be an array. e.g. ['ID1'] or ['ID1', 'ID2']
  deleteGroup(rowSelection) {
    if (!this.state.deletingGroupIDs) {
      let notification = new NotificationHandler()
      notification.error('请选择要删除的通知组')
    }
    const {
      deleteNotifyGroups,
      loadNotifyGroups,
    } = this.props

    // unselect all rows
    this.setState({
      selectedRowKeys: [],
    })
    let notification = new NotificationHandler()
    deleteNotifyGroups(this.state.deletingGroupIDs, {
      success: {
        func: (result) => {
          this.closeDeleteModal()
          notification.success(`删除成功`)
          loadNotifyGroups()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          this.closeDeleteModal()
          notification.error(`删除失败`)
        },
        isAsync: true
      }
    })
  }
  handleDropdownClick(record, group) {
    if (record.key == 'delete') {
      this.openDeleteModal([group.groupID])
    } else if (record.key == 'edit') {
      this.openModifyModal(group)
    }
  }
  openDeleteModal(groupIDs) {
    this.setState({
      deleteModal: true,
      deletingGroupIDs: groupIDs,
    })
  }
  closeDeleteModal() {
    this.setState({
      deleteModal: false,
      deletingGroupIDs: [],
    })
  }
  openModifyModal(group) {
    this.setState({
      createGroup: false,
      modifyGroup: true,
      createModalTitle: '修改通知组',
      modifyingGroupInfo: group,
    })
  }
  getGroupEmails(emails){
    if (!emails) {
      return null
    }
    let popover = null
    if (emails.length > 1) {
      const content = emails.map(function(item) {
        return <div className='alarmGroupContentEmailPopOveritem'>{item.addr}<span className='alarmGroupContentEmailPopOverspan'>(备注:{item.desc})</span></div>
      })
      popover =  (
        <Popover placement="rightTop" content={content} trigger="click">
          <svg className='more' >
            <use xlinkHref='#more'/>
          </svg>
        </Popover>
      )
    }

    return (
      <div>
        {emails.length > 0 && `${emails[0].addr}(${emails[0].desc})`}
        {popover}
      </div>
    )
  }

  getStragegies(strategies) {
    if (!strategies) {
      return null
    }
    let popover = null
    if (strategies.length > 1) {
      const content = strategies.map(function(item, i) {
        return <div className='alarmGroupContentRealtionPopOveritem'>关联策略 {`${i + 1}：${item.name}`}</div>
      })
      popover = (
        <Popover placement="rightTop" content={content} trigger="click">
          <svg className='more' >
            <use xlinkHref='#more' />
          </svg>
        </Popover>
      )
    }
    return (
      <div>
        {strategies.length > 0 ? `${strategies[0].name}` : null}
        {popover}
      </div>
    )
  }
  handSearch() {
    let search = document.getElementById('AlarmGroupInput').value.trim()
    const { loadNotifyGroups } = this.props
    loadNotifyGroups(search)
  }
  getSelectedGroups() {
    let groupIDs = []
    this.state.selectedRows.map(function(item) {
      groupIDs.push(item.groupID)
    })
    return groupIDs
  }
  getModifyingGroup() {
    if (this.state.selectedRows.length !== 1) {
      const notification = new NotificationHandler()
      notification.error('请先选择一个组')
      return
    }
    return this.state.selectedRows[0]
  }
  render() {
    const modalFunc=  {
      scope : this,
    }
    const tableColumns = [{
      title:'名称',
      dataIndex:'name',
      width:'10%',
    },{
      title:'描述',
      dataIndex:'desc',
      width:'16%',
    },{
      title:'邮箱',
      dataIndex:'email',
      width:'30%',
      render:emails => this.getGroupEmails(emails)
    },{
      title:'创建时间',
      dataIndex:'createTime',
      width:'20%',
    },{
      title:'关联策略',
      dataIndex:'strategies',
      width:'15%',
      render:strategies => this.getStragegies(strategies)
    },{
      title:'操作',
      dataIndex:'handle',
      width:'10%',
      render:(text, group) => <Dropdown.Button type="ghost" overlay={ this.dropdowns(text, group) } onClick={()=> this.openDeleteModal([group.groupID])}>删除</Dropdown.Button>
    }]

    let tableData = []
    this.props.groups.map(function(item, i) {
      tableData.push({
        key: i,
        name: item.name,
        desc: item.desc,
        email: item.receivers.email,
        createTime: moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
        strategies: item.strategies,
        groupID: item.groupID,
      })
    })

    const _this = this
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        _this.setState({
          selectedRows,
          selectedRowKeys,
        })
      },
      selectedRowKeys: this.state.selectedRowKeys,
    }

    return (
      <QueueAnim  className="alarmGroup">
        <div id="AlarmGroup" key="demo">
          <div className='alarmGroupHeader'>
            <Button size="large" type="primary" icon="plus" onClick={()=> this.setState({createGroup:true, createModalTitle: '创建新通知组'})}>创建</Button>
            <Button size="large" icon="reload" type="ghost" onClick={() => this.props.loadNotifyGroups()}>刷新</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length === 0} icon="delete" onClick={()=> this.openDeleteModal(this.getSelectedGroups())} type="ghost">删除</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length !== 1} icon="edit" onClick={() => this.openModifyModal(this.getModifyingGroup())} type="ghost">修改</Button>
            <div className="Search">
              <Input size="large" id="AlarmGroupInput" onPressEnter={()=> this.handSearch()} />
              <i className="fa fa-search" onClick={()=> this.handSearch()} />
            </div>
          </div>
          <Card className='alarmGroupContent'>
            <Table
              className="strategyTable"
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              rowSelection={rowSelection}
            >
            </Table>
          </Card>
          <Modal title={this.state.createModalTitle} visible={this.state.createGroup || this.state.modifyGroup}
            width={560}
            maskClosable={false}
            closable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}
            afterCreateFunc={() => this.props.loadNotifyGroups()}
            afterModifyFunc={() => this.props.loadNotifyGroups()}
            isModify={!!this.state.modifyGroup}
            data={this.state.modifyingGroupInfo}
            />
          </Modal>
          <Modal title="删除通知组" visible={this.state.deleteModal}
            onCancel={()=> this.closeDeleteModal()}
            onOk={()=> this.deleteGroup(rowSelection)}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>告警通知组删除后，与之关联的策略将无法发送邮件告警，是否确定删除？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  let groupsData = []
  if (state.alert.groups.isFetching === false && state.alert.groups.result.code === 200 && state.alert.groups.result.data) {
    groupsData = state.alert.groups.result.data
  }
  return {
    groups: groupsData,
  }
}

export default connect(mapStateToProps, {
  loadNotifyGroups,
  deleteNotifyGroups,
})(AlarmGroup)