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
import { Table, Button, Popover, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import { connect } from 'react-redux'
import TenxIcon from '@tenx-ui/icon'
import Editor from './Editor'
import { BlockPicker, TwitterPicker, SketchPicker } from 'react-color'
import { loadProjectList } from '../../../../../actions/harbor'
import NotificationHandler from '../../../../../components/Notification'

const notification = new NotificationHandler()
const colors = [
  '#872ED8', '#AE64F4', '#4067FF', '#548CFE', '#2DB8F4',
  '#2BCFE5', '#00D183', '#27E09A', '#54C41A', '#83D167',
  '#FCBB00', '#F9B659', '#FF6A00', '#FF8A67', '#F5232B',
  '#F95561', '#EC3195', '#FB7F9E', '#687689', '#AABAC4',
]
class Project extends Component {
  state = {
    color: 'orange',
    selectedRowKeys: [],
    isShowEditor: true,
    current: {},
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
    if (isShowEditor) return
    this.setState({
      selectedRowKeys,
      current: selectedRows[0] || {},
    })
  }
  loadData = () => {
    console.log('loadData')
  }
  edit = () => {
    const { selectedRowKeys, current } = this.state
    if (selectedRowKeys.length === 1){
      this.setState({
        isShowEditor: true,
        current,
      })
    } else if(selectedRowKeys.length === 0) {
      notification.warn('请选择标签')
    }
  }
  del = () => {
    const { selectedRowKeys, current } = this.state
    if (selectedRowKeys.length === 1){

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
  onEditorOk = data => {
    console.log(data)
  }
  onEditorCancel = () => {
    this.setState({
      isShowEditor: false,
    })
  }
  render() {
    const { color, selectedRowKeys, isShowEditor, current } = this.state
    const picker = <TwitterPicker
        style={{ width: 205, }}
        colors={colors}
        color={color}
        triangle="hide"
        onChangeComplete={this.handleColorChange} />
    const columns = [
      {
        title: '标签',
        width: '33%',
        dataIndex: 'tag',
        key: 'tag',
        render: (text, record) => (
          <div className="tag" style={{ backgroundColor: record.color }}>
            {record.type === 'global' ? <TenxIcon type="tag_global" /> : <TenxIcon type="tag_part" />}
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
        dataIndex: 'createTime',
        key: 'createTime',
      },
    ]
    const data = [
      {
        tag: "全局",
        color: "#ed22ad",
        desc: "desc",
        createTime: "2018-05-05 18:00:00",
        type: "global"
      },
      {
        tag: "局部",
        color: "#ed22ad",
        desc: "desc",
        createTime: "2018-05-05 18:00:00",
        type: "part"
      },
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowChange,
    }
    const btnDisabled = !selectedRowKeys.length
    return (
      <QueueAnim className='LabelModule'>
        <div style={{width: 100, height: 100, backgroundColor: color, position: 'relative', marginBottom: '10px'}}>
          <span style={{position: 'absolute', left: 50, top: 50, transform: 'translate(-50%, -50%)', color: 'white'}}>text</span>
        </div>
        <div key="main">
          <div className="topRow">
            <Button type="primary" size="large" onClick={this.add}><i className='fa fa-tag'/>&nbsp;新建标签</Button>
            <Button type="ghost" size="large" onClick={this.loadData}><i className='fa fa-refresh'/>&nbsp;刷新</Button>
            <Button disabled={btnDisabled} type="ghost" size="large" onClick={this.edit}><i className='fa fa-edit'/>&nbsp;编辑</Button>
            <Button disabled={btnDisabled} type="ghost" size="large" onClick={this.del}><i className='fa fa-del'/>&nbsp;删除</Button>
            <Input
              placeholder="按标签名称搜索"
              className="search"
              size="large"
              value={this.state.searchInput}
              onChange={e => this.setState({ searchInput: e.target.value })}
              onPressEnter={this.searchProjects}
            />
            <i className="fa fa-search" onClick={this.searchProjects}></i>
            <Popover overlayClassName="labelmodule_picker" placement="bottom" content={picker} trigger="click">
              <Button size="large" type="primary" className="pickerBtn">picker</Button>
            </Popover>
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
            columns={columns}
            dataSource={data}
            rowKey={row => row.tag}
            rowSelection={rowSelection}
          />
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities } = state
  return {
    entities,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
})(Project)
