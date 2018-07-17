/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * label module
 *
 * v0.1 - 2018-07-11
 * @author rensiwei
 */



import React, { Component } from 'react'
import { Table, Button, Popover, Input, Icon } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import { connect } from 'react-redux'
import TenxIcon from '@tenx-ui/icon'
import Editor from './Editor'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { loadLabelList, updateLabel, createLabel, setImageLabel } from '../../../../../actions/harbor'
import NotificationHandler from '../../../../../components/Notification'
import filter from 'lodash/filter'

const notification = new NotificationHandler()
const colors = [
  '#872ED8', '#AE64F4', '#4067FF', '#548CFE', '#2DB8F4',
  '#2BCFE5', '#00D183', '#27E09A', '#54C41A', '#83D167',
  '#FCBB00', '#F9B659', '#FF6A00', '#FF8A67', '#F5232B',
  '#F95561', '#EC3195', '#FB7F9E', '#687689', '#AABAC4',
]
const data = [
  {
    id: "1",
    name: "全局",
    color: "#ed22ad",
    description: "desc",
    creation_time: "2018-05-05 18:00:00",
    scope: "g"
  },
  {
    id: "2",
    name: "局部",
    color: "#ed22ad",
    description: "desc",
    creation_time: "2018-05-05 18:00:00",
    scope: "p"
  },
]
for(var i = 3; i < 100; i++){
  data.push({
    id: i,
    name: "局部" + i,
    color: "#ed22ad",
    description: "desc",
    creation_time: "2018-05-05 18:00:00",
    scope: "p"
  })
}
class Project extends Component {
  state = {
    color: 'orange',
    selectedRows: [],
    isShowEditor: true,
    current: {},
    currPage: 1,
  }
  componentDidMount() {
    this.loadData()
  }
  handleColorChange = ({ hex: color }) => {
    console.log(color)
    this.setState({
      color,
    })
  }
  onRowChange = (selectedRowKeys, selectedRows) => {
    const { isShowEditor } = this.state
    // if (isShowEditor) return
    this.setState({
      selectedRows,
    })
  }
  loadData = () => {
    const { loadLabelList, harbor, scope, projectId } = this.props
    const query = {
      harbor,
      scope,
    }
    if(scope === "p"){
      query.projectId = projectId
    }
    loadLabelList(DEFAULT_REGISTRY, query).then((e) => {
      console.log('loadData', e)
    })
  }
  edit = () => {
    const { selectedRows, current } = this.state
    if (selectedRows.length === 1){
      this.setState({
        isShowEditor: true,
        current: selectedRows[0],
      })
    } else if(selectedRows.length === 0) {
      notification.warn('请选择一个标签')
    }
  }
  del = () => {
    const { selectedRows, current } = this.state
    if (selectedRows.length === 1){

    } else {
      notification.warn('请选择标签')
    }
  }
  add = () => {
    this.setState({
      current: {},
      isShowEditor: true,
    })
  }
  onEditorOk = params => {
    const { current } = this.state
    const { createLabel, updateLabel, harbor } = this.props
    if (!!current.id) {
      const temp = {
        id: current.id,
        label: params,
      }
      updateLabel(harbor, DEFAULT_REGISTRY, temp, {
        succecc: {
          func: res => {
            console.log(res)
          }
        },
        failed: {
          func: err => {
            console.log(err)
          }
        },
      })
    } else {
      createLabel(harbor, DEFAULT_REGISTRY, params, {
        succecc: {
          func: res => {
            console.log(res)
          }
        },
        failed: {
          func: err => {
            console.log(err)
          }
        },
      })
      data.push(params)
    }
    this.onEditorCancel()
  }
  onEditorCancel = () => {
    this.setState({
      isShowEditor: false,
    })
  }
  onTableChange = (pageination) => {
    this.setState({
      currPage: pageination.current
    })
  }
  render() {
    const { color, selectedRows, isShowEditor, current, currPage } = this.state
    const { scope } = this.props
    const columns = [
      {
        title: '标签',
        width: '33%',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div className="tag" style={{ backgroundColor: record.color }}>
            {record.scope === 'g' ? <TenxIcon type="global-tag" /> : <TenxIcon type="tag" />}
            {text}
          </div>
        ),
      },
      {
        title: '描述',
        width: '33%',
        dataIndex: 'desc',
        key: 'desc',
      },
      {
        title: '创建时间',
        width: '33%',
        dataIndex: 'creation_time',
        key: 'creation_time',
      },
    ]
    const rowSelection = {
      selectedRows,
      onChange: this.onRowChange,
    }
    const tempData = filter(data, { scope })
    const total = tempData.length
    const pagination = {
      simple: true,
      current: currPage,
      defaultPageSize: 10,
      total,
    }
    const btnDisabled = !selectedRows.length
    return (
      <QueueAnim className='LabelModule'>
        <div key="main">
          <div className="topRow">
            <Button type="primary" size="large" onClick={this.add}><i className='fa fa-plus'/>&nbsp;新建标签</Button>
            <Button type="ghost" size="large" onClick={this.loadData}><i className='fa fa-refresh'/>&nbsp;刷新</Button>
            <Button disabled={selectedRows.length !== 1} type="ghost" size="large" onClick={this.edit}><i className='fa fa-edit'/>&nbsp;编辑</Button>
            <Button disabled={btnDisabled} type="ghost" size="large" onClick={this.del}><Icon type="delete" />删除</Button>
            <Input
              placeholder="按标签名称搜索"
              className="search"
              size="large"
              value={this.state.searchInput}
              onChange={e => this.setState({ searchInput: e.target.value })}
              onPressEnter={this.searchProjects}
            />
            <i className="fa fa-search" onClick={this.searchProjects}></i>
            {
              total ? <div className="total">共计 {total} 条</div> : null
            }
          </div>
          {
            isShowEditor ?
              <Editor
                current={current}
                onOk={this.onEditorOk}
                onCancel={this.onEditorCancel}
              />
              :
              null
          }
          <Table
            pagination={pagination}
            columns={columns}
            dataSource={tempData}
            rowKey={row => row.id}
            rowSelection={rowSelection}
            onChange={this.onTableChange}
          />
        </div>
      </QueueAnim>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { entities } = state;
  const { harbor: harbors } = entities.current.cluster;
  const harbor = harbors[0]
  return {
    harbor,
  };
};

export default connect(mapStateToProps,  {
  loadLabelList,
  updateLabel,
  createLabel,
  setImageLabel
})(Project)
