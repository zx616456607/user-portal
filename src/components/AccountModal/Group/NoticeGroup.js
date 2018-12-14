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
import { Button, Input, Table, Spin, Dropdown, Menu, Icon, Modal, Card, Tooltip } from 'antd'
import './style/NoticeGroup.less'
import QueueAnim from 'rc-queue-anim'
// import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import CreateAlarm from '../../AppModule/AlarmModal/CreateGroup'
// const InputGroup = Input.Group
import { loadNotifyGroups, deleteNotifyGroups } from '../../../actions/alert'
import { setCurrent } from '../../../actions/entities'
import NotificationHandler from '../../../components/Notification'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { formatDate, adjustBrowserUrl } from '../../../common/tools'
// import cloneDeep from 'lodash/cloneDeep'
import Title from '../../Title'
import TimeHover from '@tenx-ui/time-hover/lib'

class AlarmGroup extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.handSearch = this.handSearch.bind(this)
    this.state = {
      search: '',
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
    const { clusterID } = this.props.cluster
    if (!clusterID) {
      setTimeout(()=> {
        this.loadData({}, true)
      }, 1000)
      return
    }
    this.loadData({}, true)
  }
  loadData(query = {}, isFirstLoad) {
    const { loadNotifyGroups, cluster, location } = this.props
    const { clusterID } = cluster
    loadNotifyGroups("", clusterID, {
      success: {
        func: () => {
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            search: '',
          })
          adjustBrowserUrl(location, query, isFirstLoad)
        },
        isAsync: true,
      }
    })
  }
  dropdowns(record, group) {
    // Dropdown delete btn
    return (
      <Menu onClick={(record) => this.handleDropdownClick(record, group)}
        style={{ width: '80px' }}
      >
        <Menu.Item key="edit">
          修改
      </Menu.Item>
      </Menu>
    )
  }
  componentWillReceiveProps(nextProps) {
    let pre = this.props.space.spaceID
    let next = nextProps.space.spaceID;
    const { loadNotifyGroups } = this.props
    if (pre !== next) {
      loadNotifyGroups()
    }
  }
  // group must be an array. e.g. ['ID1'] or ['ID1', 'ID2']
  deleteGroup(rowSelection) {
    const clusterID = this.props.cluster.clusterID
    let notification = new NotificationHandler()
    if (!this.state.selectedRowKeys) {
      notification.error('请选择要删除的通知组')
    }
    const {
      deleteNotifyGroups,
    } = this.props

    // unselect all rows
    // this.setState({
    //   selectedRowKeys: [],
    // })
    deleteNotifyGroups(this.state.selectedRowKeys, clusterID,{
      success: {
        func: (result) => {
          this.closeDeleteModal()
          notification.success(`删除成功`)
          const { location } = this.props
          const { query } = location
          const { search } = this.state
          this.handSearch({ page: query.page || 1, search })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          this.closeDeleteModal()
          notification.error('删除失败', '请先取消策略对该通知组的引用，方可删除通知组')
        },
        isAsync: true
      }
    })
  }
  handleDropdownClick(record, group) {
    if (record.key == 'edit') {
      this.openModifyModal(group)
    }
  }
  openDeleteModal(e, groupIDs) {
    e.stopPropagation()
    if (!groupIDs) {
      new NotificationHandler().info('请先取消策略对该通知组的引用，方可删除通知组')
      return
    }
    this.setState({
      deleteModal: true,
      selectedRowKeys: groupIDs,
    })
  }
  closeDeleteModal() {
    this.setState({
      deleteModal: false,
      selectedRowKeys: [],
    })
  }
  openModifyModal(group) {
    if (!group.receivers.email) {
      group.receivers.email = []
    }
    if (!group.receivers.tel) {
      group.receivers.tel = []
    }
    this.setState({
      createGroup: false,
      modifyGroup: true,
      createModalTitle: '修改通知组',
      modifyingGroupInfo: group,
    })
  }

  getStragegies(strategies) {
    const _this = this;
    if (!strategies) {
      return '-'
    }
    let popover = '-'
    if (strategies.length > 0) {
      popover = strategies.map(function (item) {
        return <div className='alarmGroupItem'>
          <Link to={`/manange_monitor/alarm_setting/${encodeURIComponent(item.id)}?name=${item.name}&clusterID=${item.clusterID}`}>{item.name}</Link>
        </div>
      })
    }
    return (
      <div>
        {popover}
      </div>
    )
  }
  handSearch(query = { page: 1 }) {
    const { search } = this.state
    const { loadNotifyGroups, cluster, location } = this.props
    const { clusterID } = cluster
    loadNotifyGroups({name: search}, clusterID, {
      success: {
        func: () => {
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          }, () => {
            adjustBrowserUrl(location, { search, page: query.page })
          })
        },
        isAsync: true,
      }
    })
  }
  getSelectedGroups() {
    let groupIDs = []
    this.state.selectedRows.map(function (item) {
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
  showAlramGroup() {
    this.setState({
      createGroup: true,
      createModalTitle: '创建新通知组'
    })
  }
  handleCancel() {
    this.setState({
      createGroup: false,
      modifyGroup: false,
    });
  }
  getAutoScale = autoScale => {
    return autoScale && autoScale.length ? autoScale.map(item => {
      return <div>{item.name}</div>
    }) : '-'
  }
  onPageChange(page) {
    const { location } = this.props
    const { search } = this.state
    const query = {
      page,
      search,
    }
    adjustBrowserUrl(location, query)
  }

  render() {
    const { search } = this.state
    const { location } = this.props
    const { query = {} } = location
    if (!this.props.groups) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    const tableData = this.props.groups
    const modalFunc = {
      scope: this,
    }
    const tableColumns = [{
      title: '名称',
      dataIndex: 'name',
      width: '10%',
      render: (name,record) => <Link to={`/account/noticeGroup/${name}?id=${record.groupID}`}>{name}</Link>
    }, {
      title: '描述',
      dataIndex: 'desc',
      width: '8%',
      render: (text, record, index) => (
        <div className='Overflow'>
          <Tooltip title={record.desc} placement="topLeft">
            <span style={{ cursor: 'pointer' }}>{record.desc}</span>
          </Tooltip>
        </div>
      ),
    }, {
      // [LOT-3172] 分辨率1280*800下操作列被换行
      // 考虑邮箱与手机号展示相同的内容, 压缩邮箱宽度与手机号列同宽, 给操作列
      title: '邮箱',
      dataIndex: 'email',
      width: '12%',
      render: (email) => {
        email = email || []
        return email.length + ' 个'
      }
    }, {
      title: '手机号',
      dataIndex: 'tel',
      width: '12%',
      render: (tel) => {
        tel = tel || []
        return tel.length + ' 个'
      }
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '19%',
      render: text => <TimeHover time={text} />,
    }, {
      title: '告警策略',
      dataIndex: 'strategies',
      width: '12%',
      render: strategies => this.getStragegies(strategies)
    }, {
      title: '弹性伸缩策略',
      dataIndex: 'autoScaleStrategies',
      width: '12%',
      render: autoScale => this.getAutoScale(autoScale)
    }, {
      title: '操作',
      dataIndex: 'handle',
      width: '13%',
      render: (text, group) => {
        if (group.strategies.length > 0) {
          return (
            <Dropdown.Button type="ghost" overlay={this.dropdowns(text, group)} onClick={(e) => this.openDeleteModal(e, false)} className='disableBtn'>
              删除
            {/*<Tooltip title="请先取消策略对该通知组的引用，方可删除告警通知组">
            </Tooltip>*/}
            </Dropdown.Button>
          )
        }
        return (
          <Dropdown.Button type="ghost" overlay={this.dropdowns(text, group)} onClick={(e) => this.openDeleteModal(e, [group.groupID])} className="normalBtn">删除</Dropdown.Button>
        )
      }
    }]

    // this.props.groups.map(function(item, i) {
    //   tableData.push({
    //     key: i,
    //     name: item.name,
    //     desc: item.desc,
    //     email: item.receivers.email,
    //     createTime: formatDate(item.createTime),
    //     strategies: item.strategies,
    //     groupID: item.groupID,
    //   })
    // })

    const _this = this
    const clusterID = this.props.cluster.clusterID
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        _this.setState({
          selectedRows,
          selectedRowKeys,
        })
      },
      selectedRowKeys: this.state.selectedRowKeys,
    }
    const paginationProps = {
      simple: true,
      pageSize: 10,
      current: parseInt(query.page) || 1,
      onChange: page => this.onPageChange(page),
    }
    return (
      <QueueAnim className="alarmGroup">
        <div id="AlarmGroup" key="demo">
          <Title title="通知组" />
          <div className='alarmGroupHeader'>
            <Button size="large" type="primary" onClick={() => this.showAlramGroup()}>
              <i className="fa fa-plus" style={{ marginRight: '5px' }} />
              创建
            </Button>
            <Button size="large" type="ghost" onClick={() => this.handSearch({ search, page: parseInt(query.page || 1)})}><i className="fa fa-refresh" />刷新</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length === 0} onClick={(e) => this.openDeleteModal(e, this.getSelectedGroups())} type="ghost"><i className="fa fa-trash-o" aria-hidden="true"/>删除</Button>
            <Button size="large" disabled={this.state.selectedRowKeys.length !== 1} onClick={() => this.openModifyModal(this.getModifyingGroup())} type="ghost"><Icon type="edit"
              style={{ marginRight: 0 }}/>修改</Button>
            <div className="Search">
              <Input size="large" placeholder="搜索" id="AlarmGroupInput" onChange={(e) => this.setState({ search: e.target.value.trim()})} onPressEnter={() => this.handSearch({ page: 1 })} />
              <i className="fa fa-search" onClick={() => this.handSearch({ page: 1 })} />
            </div>
          </div>
          <Card className='alarmGroupContent'>
            <Table
              className="strategyTable"
              columns={tableColumns}
              dataSource={tableData}
              pagination={paginationProps}
              rowSelection={rowSelection}
              loading={this.props.isFetching}
              rowKey="groupID"
            >
            </Table>
            { tableData && tableData.length !== 0 &&<span className="pageCount">共计 {tableData.length} 条</span>}
          </Card>
          {(this.state.createGroup || this.state.modifyGroup) ?
          <Modal title={this.state.createModalTitle} onCancel={() => this.handleCancel()} visible={this.state.createGroup || this.state.modifyGroup}
            width={560}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
            style={{top:50}}
          >
            <CreateAlarm funcs={modalFunc}
              afterCreateFunc={() => this.props.loadNotifyGroups(search, clusterID)}
              afterModifyFunc={() => this.props.loadNotifyGroups(search, clusterID)}
              isModify={!!this.state.modifyGroup}
              data={this.state.modifyingGroupInfo}
              createGroup={this.state.createGroup}
            />
          </Modal>
          :null
          }
          <Modal title="删除通知组" visible={this.state.deleteModal}
            onCancel={() => this.closeDeleteModal()}
            onOk={() => this.deleteGroup(rowSelection)}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              通知组删除后，与之关联的策略将无法发送邮件告警，是否确定删除？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { groups } = state.alert
  const { cluster } = state.entities.current
  const { space } = state.entities.current
  const { teamClusters } = state.team
  if (!groups && !cluster && !teamClusters) {
    return props
  }

  let defaultData = {
    isFetching: false,
    result: { data: [] }
  }
  let defaultDatas = {
    result: { data: [] }
  }
  const { isFetching } = groups || defaultData
  const { result } = groups || defaultData
  let groupsData = result ? result.data : []
  let clusterResult = teamClusters.result || defaultDatas.result
  let clusterData = clusterResult ? clusterResult.data : []
  const groupsArr = []
  const groupArr = JSON.parse(JSON.stringify(groupsData))
  groupArr && groupArr.length && groupArr.forEach(el => {
    el.email = el.receivers.email
    el.tel = el.receivers.tel
    groupsArr.push(el)
  })
  return {
    space,
    isFetching,
    cluster,
    groups: groupsArr,
    data: clusterData
  }
}

export default connect(mapStateToProps, {
  loadNotifyGroups,
  deleteNotifyGroups,
  setCurrent
})(AlarmGroup)
