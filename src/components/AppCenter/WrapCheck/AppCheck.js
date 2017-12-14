/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Check
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Dropdown, Menu, Modal, Form, Input } from 'antd'
import './style/AppCheck.less'
import CommonSearchInput from '../../CommonSearchInput'
import TenxStatus from '../../TenxStatus/index'
import { getWrapPublishList, passWrapPublish, refuseWrapPublish } from '../../../actions/app_center'
import { formatDate } from '../../../common/tools'
import { API_URL_PREFIX } from '../../../constants'
import NotificationHandler from '../../../components/Notification'

const FormItem = Form.Item

class WrapCheckTable extends React.Component {
  constructor(props) {
    super(props)
    this.getWrapStatus = this.getWrapStatus.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.checkApprove = this.checkApprove.bind(this)
    this.state = {
      approveVisible: false
    }
  }
  getWrapStatus(status){
    let phase
    let progress = {status: false};
    switch(status) {
      case 1:
        phase = 'Published'
        break
      case 2:
        phase = 'CheckPass'
        break
      case 3:
        phase = 'CheckReject'
        break
      case 4:
        phase = 'OffShelf'
        break
      case 8:
        phase = 'WaitForCheck'
        break
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  onTableChange(pagination) {
    const { updateParentPage } = this.props
    const page = pagination.current
    updateParentPage(page)
  }
  handleSort(sortStr) {
    const { updateParentSort, updateParentPublishTime, publish_time } = this.props
    let sortOrder = this.getSortOrder(publish_time)
    updateParentPublishTime(!publish_time, () => updateParentSort(sortStr, sortOrder))
  }
  getSortOrder(flag) {
    let str = 'asc'
    if (flag) {
      str = 'desc'
    }
    return str
  }
  handleButtonClick(record) {
    const { passPublish } = this.props
    if (record.publishStatus !== 8) {
      Modal.info({
        title: '只有待审核状态的应用才能进行通过和拒绝操作'
      });
      return
    }
    const body = {
      filePkgName: record.fileName
    }
    passPublish(record.id, body)
  }
  handleMenuClick(e, record) {
    switch(e.key) {
      case 'refuse':
        this.setState({
          currentWrap: record,
          approveVisible: true
        }, () => {
          let input = document.getElementById('approve')
          input && input.focus()
        })
        break
    }
  }
  
  confirmModal() {
    const { refusePublish, form } = this.props
    const { currentWrap } = this.state
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { approve } = values
      const body = {
        approve_message: approve,
        filePkgName: currentWrap.fileName
      }
      refusePublish(currentWrap.id, body).then(() => {
        this.setState({
          approveVisible: false
        })
        form.resetFields()
      })
    })
  }
  
  cancelModal() {
    const { form } = this.props
    this.setState({
      approveVisible: false
    })
    form.resetFields()
  }
  
  checkApprove(rule, value, callback) {
    let newValue = value && value.trim()
    if (!newValue) {
      return callback('请输入拒绝理由')
    }
    callback()
  }
  render() {
    const { wrapPublishList, publish_time, form } = this.props
    const { getFieldProps } = form
    const { approveVisible } = this.state
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: wrapPublishList && wrapPublishList.total,
    }
    const columns = [{
      title: '状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: '10%',
      render: this.getWrapStatus
    }, {
      title: '应用包名称',
      dataIndex: 'fileName',
      key: 'fileName',
      width: '10%',
    }, {
      title: '分类名称',
      dataIndex: 'classifyName',
      key: 'classifyName',
      width: '10%',
    }, {
      title: '发布名称',
      dataIndex: 'fileNickName',
      key: 'fileNickName',
      width: '10%',
    }, {
      title: '应用包描述',
      dataIndex: 'description',
      key: 'description',
      width: '10%',
    }, {
      title: '发布者',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: '10%',
    }, {
      title: (
        <div onClick={() => this.handleSort('publish_time')}>
          提交时间
          <div className="ant-table-column-sorter">
            <span
              className={publish_time === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
              title="↑">
              <i className="anticon anticon-caret-up"/>
            </span>
            <span
              className={publish_time === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
              <i className="anticon anticon-caret-down"/>
            </span>
          </div>
        </div>
      ),
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: '20%',
      render: text => formatDate(text)
    }, {
      title: '操作',
      key: 'operation',
      width: '20%',
      render: (text, record) => {
        const menu = (
          <Menu style={{ width: 80 }} onClick={e => this.handleMenuClick(e, record)}>
            <Menu.Item key="refuse" disabled={record.publishStatus !== 8}>拒绝</Menu.Item>
            <Menu.Item key="download" disabled={![8, 2].includes(record.publishStatus)}>
              {
                ![8, 2].includes(record.publishStatus) ? '下载'
                  :
                  <a target="_blank" href={`${API_URL_PREFIX}/pkg/${record.originId}`}>下载</a>
              }
            </Menu.Item>
          </Menu>
        );
        return(
          <div>
            <Dropdown.Button onClick={() => this.handleButtonClick(record)} overlay={menu} type="ghost">
              通过
            </Dropdown.Button>
          </div>
        )
      }
    }]
    return (
      <div className="wrapCheckTableBox">
        <Modal
          title="拒绝理由"
          visible={approveVisible}
          onOk={this.confirmModal}
          onCancel={this.cancelModal}
        >
          <Form
            horizontal
            form={form}
          >
            <FormItem>
              <Input
                {...getFieldProps('approve', {
                  rules: [
                    {
                      validator: this.checkApprove
                    }
                  ]
                })}
                type="textarea" 
                rows={4} 
                placeholder="请输入拒绝理由"/>
            </FormItem>
          </Form>
        </Modal>
        <Table
          className="wrapCheckTable"
          dataSource={wrapPublishList && wrapPublishList.pkgs}
          columns={columns}
          onChange={this.onTableChange}
          pagination={pagination}
        />
      </div>
    )
  }
}

WrapCheckTable = Form.create()(WrapCheckTable)

class WrapCheck extends React.Component {
  constructor(props) {
    super(props)
    this.getWrapPublishList = this.getWrapPublishList.bind(this)
    this.passPublish = this.passPublish.bind(this)
    this.refusePublish = this.refusePublish.bind(this)
    this.updateParentPage = this.updateParentPage.bind(this)
    this.updateParentFilter = this.updateParentFilter.bind(this)
    this.updateParentSort = this.updateParentSort.bind(this)
    this.updateParentPublishTime = this.updateParentPublishTime.bind(this)
    this.state = {
      current: 1,
      filterName: undefined,
      sort_by: undefined,
      sort_order: undefined,
      publish_time: undefined
    }
  }
  componentWillMount() {
    const { activeKey } = this.props
    if (activeKey === 'app') {
      this.getWrapPublishList()
    }
  }
  getWrapPublishList() {
    const { current, filterName, sort_by, sort_order } = this.state
    const { getWrapPublishList } = this.props
    let query = {
      from: (current - 1) * 10,
      size: 10
    }
    if (filterName) {
      Object.assign(query, { filter: `fileName contains ${filterName}` })
    }
    if (sort_by) {
      Object.assign(query, { sort_by })
    }
    if (sort_order) {
      Object.assign(query, { sort_order })
    }
    getWrapPublishList(query)
  }
  refreshData() {
    this.setState({
      filterName: '',
      sort_by: '',
      sort_order: '',
      publish_time: '',
    }, this.getWrapPublishList)
  }
  updateParentPage(page) {
    this.setState({
      current: page
    }, this.getWrapPublishList)
  }
  updateParentFilter(name) {
    this.setState({
      filterName:name
    }, this.getWrapPublishList)
  }
  updateParentSort(sort_by, sort_order) {
    this.setState({
      sort_by: sort_by,
      sort_order: sort_order
    }, this.getWrapPublishList)
  }
  updateParentPublishTime(time, callback) {
    this.setState({
      publish_time: time
    }, callback)
  }
  passPublish(pkgID, body) {
    const { passWrapPublish } = this.props
    let notify = new NotificationHandler()
    notify.spin('通过中')
    passWrapPublish(pkgID, body, {
      success: {
        func: () => {
          notify.close()
          notify.success('通过审批成功')
          this.getWrapPublishList()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          notify.error(`通过审批失败\n,${res.message}`)
        }
      }
    })
  }
  refusePublish(pkgID, body) {
    const { refuseWrapPublish } = this.props
    let notify = new NotificationHandler()
    notify.spin('拒绝中')
    return new Promise((resolve, reject) => {
      refuseWrapPublish(pkgID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success('拒绝审批成功')
            this.getWrapPublishList()
            resolve()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            notify.error(`拒绝审批失败\n${res.message ? res.message: ''}`)
            reject(res.message ? res.message : '拒绝审批失败')
          }
        }
      })
    })
  }
  render() {
    const { wrapPublishList } = this.props
    const { filterName, publish_time } = this.state
    return (
      <QueueAnim className="wrapCheck">
        <div className="wrapCheckHead" key="wrapCheckHead">
          <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData()}>
            <i className='fa fa-refresh'/> 刷新
          </Button>
          <CommonSearchInput
            ref="tableChild"
            size="large"
            placeholder="按应用包或发布名称搜索"
            style={{ width: 200 }}
            value={filterName}
            onSearch={value => this.updateParentFilter(value)}
          />
          <span className="total verticalCenter">共 {wrapPublishList && wrapPublishList.total} 条</span>
        </div>
        <WrapCheckTable
          key="wrapCheckTable"
          wrapPublishList={wrapPublishList}
          publish_time={publish_time}
          updateParentPublishTime={this.updateParentPublishTime}
          passPublish={this.passPublish}
          refusePublish={this.refusePublish}
          updateParentPage={this.updateParentPage}
          updateParentSort={this.updateParentSort}
        />
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { images } = state
  const { wrapPublishList } = images
  const { result } = wrapPublishList || { result: {}}
  const { data } = result || { data: [] }
  return {
    wrapPublishList: data
  }
}

export default connect(mapStateToProps, {
  getWrapPublishList,
  passWrapPublish, 
  refuseWrapPublish
})(WrapCheck)