/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage list component
 *
 * v0.1 - 2017-6-30
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Table, Icon, Form, Radio, Button, Tabs, Card, Input, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import '../style/AppWrapManage.less'
import NotificationHandler from '../../../components/Notification'
import { formatDate } from '../../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'

import { wrapManageList, deleteWrapManage } from '../../../actions/app_center'
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const notificat = new NotificationHandler()

// file type
const wrapType = ['.jar','.war','.tar','.tar.gz','.zip']
const wrapTypelist = ['jar','war','tar','tar.gz','zip']


class WrapListTbale extends Component {
  constructor(props) {
    super()
    this.state = {
      selectedRowKeys: [],
      page: 1,
    }
  }
  getList = (e)=> {
    const inputValue = this.refs.wrapSearch.refs.input.value
    if (!e || inputValue == '') {
      this.loadData()
      return
    }
    const query = {
      filter: `fileName contains ${inputValue}`,
    }
    this.props.wrapManageList(query)
  }
  loadData(current) {
    current = current || this.state.page
    this.setState({page: current})
    let from = {
      from: (current-1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.space.namespace !== this.props.space.namespace) {
      this.loadData()
    }
  }

  deleteAction(status,id) {
    if (status) {
      id = [id]
      this.setState({delAll: true,id})
      return
    }
    this.setState({delAll: false})
  }
  deleteVersion = ()=> {
    // const notificat = new NotificationHandler()
    const { id,page } = this.state
    const { wrapList } = this.props
    this.setState({selectedRowKeys:[]})
    this.props.deleteWrapManage({ids: id},{
      success: {
        func:()=> {
          notificat.success('删除成功')
          let newPage = Math.floor((wrapList.total - id.length) / DEFAULT_PAGE_SIZE)
          if (newPage < page) {
            this.loadData(page -1)
            return
          }
          this.loadData(page)
        },isAsync: true
      },
      failed: {
        func: (err)=> {
          notificat.error('删除失败',err.message.message || err.message)
        }
      },
      finally: {
        func:()=> {
          this.deleteAction(false)
        }
      }
    })
  }
  render() {
    // jar war ,tar.gz zip
    const dataSource = this.props.wrapList
    const columns = [
      {
        title: '包名称',
        dataIndex: 'fileName',
        key: 'name',
        width: '20%',
        render: (text,row) => <a target="_blank" href={`${API_URL_PREFIX}/pkg/${row.id}`}>{text}</a>
      }, {
        title: '版本标签',
        dataIndex: 'fileTag',
        key: 'tag',
        width: '20%',
      }, {
        title: '包类型',
        dataIndex: 'fileType',
        key: 'type',
      }, {
        title: '上传时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        render: text => formatDate(text)
      }, {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        width:'150px',
        render: (e,row) => [
          <Button type="primary" key="1">部署</Button>,
          <Button key="2" style={{ marginLeft: 10 }} onClick={()=> this.deleteAction(true,row.id)}>删除</Button>
         ]
      }
    ]
    const paginationOpts = {
      size: "small",
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page,
      total: dataSource.total,
      onChange: current => this.loadData(current),
      showTotal: total => `共计： ${total} 条 `,
    }
    const _this = this
    const { func } = this.props
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const ids = selectedRows.map(row => {
          return row.id
        })
        _this.setState({ selectedRowKeys,id:ids })

        func && func.scope.setState({selectedRowKeys,id:ids})
      }
    }

    return (
      <Card className="wrap_content">
        <Table className="strategyTable" loading={this.props.isFetching} rowSelection={rowSelection} dataSource={dataSource.pkgs} columns={columns} pagination={paginationOpts} />
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={()=> this.deleteAction(false)}
          onOk={this.deleteVersion}
          >
          <div className="confirmText">确定要删除所选版本？</div>
        </Modal>
      </Card>

    )
  }
}

function mapStateToProps(state,props) {
  const { wrapList } = state.images
  const { current } = state.entities
  const { space } = current
  const list = wrapList || {}
  let datalist = {pkgs:[],total:0}
  if (list.result) {
    datalist = list.result.data
  }
  return {
    space,
    wrapList: datalist,
    isFetching: list.isFetching
  }
}

export default connect(mapStateToProps,{
  wrapManageList,
  deleteWrapManage,
})(WrapListTbale)