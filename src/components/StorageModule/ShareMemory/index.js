/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Form, Select, Icon } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import cloneDeep from 'lodash/cloneDeep'

const FormItem = Form.Item
const Option = Select.Option

class ShareMemory extends Component {
  constructor(props) {
    super(props)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.tableRowClick = this.tableRowClick.bind(this)
    this.state = {
      selectedRowKeys: [],
      createShareMemoryVisible: false,
      confirmLoading: false,
      deleteModalVisible: false,
    }
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  reloadDate(){

  }

  deleteItem(){
    const { selectedRowKeys } = this.state
    if(!selectedRowKeys.length){
      return
    }
    this.setState({
      confirmLoading: false,
      deleteModalVisible: true,
    })
  }

  confirmDeleteItem(){
    this.setState({
      confirmLoading: false,
      deleteModalVisible: false,
    })
  }

  tableRowClick(record, index) {
    const { selectedRowKeys } = this.state
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    if(newSelectedRowKeys.indexOf(index) > -1){
      newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(index), 1)
    } else {
      newSelectedRowKeys.push(index)
    }
    this.setState({
      selectedRowKeys: newSelectedRowKeys
    })
  }

  renderTableDataSource(){
    const arr = []
    for(let i = 0; i < 15; i++){
      const item = {
        key: i,
        name: `name${i}`,
        server: `192.168.1.${i}`,
        type: 'nfs',
        shareService: i,
        createTime: `${i}个月前`
      }
      arr.push(item)
    }
    return arr
  }

  openCreateModal(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      createShareMemoryVisible: true,
      confirmLoading: false,
    })
  }

  confirmCreateShareMemory(){
    const { form } = this.props
    const viladateArray = [
      'type',
      'server',
      'name'
    ]
    this.setState({
      confirmLoading: true,
    })
    form.validateFields(viladateArray, (errors, values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false,
        })
        return
      }
      this.setState({
        confirmLoading: false,
        createShareMemoryVisible: false,
      })
    })
  }

  render() {
    const { form } = this.props
    const { selectedRowKeys, createShareMemoryVisible,
      confirmLoading, deleteModalVisible,
    } = this.state
    const { getFieldProps } = form
    const columns = [
      {
        key: 'name',
        title: '存储名称',
        dataIndex: 'name',
        width: '20%',
        render: (text, record, index) => <div
          className='storage_name'
          onClick={() => browserHistory.push(`/app_manage/shareMemory/${text}`)}
        >
          {text}
          </div>
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: '20%',
      },
      {
        key: 'server',
        title: '存储 server',
        dataIndex: 'server',
        width: '20%',
      },
      {
        key: 'shareService',
        title: '共享服务',
        dataIndex: 'shareService',
        width: '20%',
        sorter: (a, b) => a - b,
      },
      {
        key: 'createTime',
        title: '创建时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter: (a, b) => a - b,
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const dataSource = this.renderTableDataSource()
    let isFetching = false
    const formItemLayout = {
    	labelCol: {span: 5},
    	wrapperCol: {span: 16}
    }
    return(
      <QueueAnim className='share_memory'>
        <div id='share_memory' key="share_memory">
          <div className='alertRow'>
            共享型存储支持多个容器实例同时对同一个共享目录经行读写操作
          </div>
          <div className='data_container'>
            <div className='handle_box'>
              <Button
                type="primary"
                size='large'
                className='button_margin'
                onClick={() => this.openCreateModal()}
              >
                <i className="fa fa-plus button_icon" aria-hidden="true"></i>
                创建共享存储
              </Button>
              <Button
                size="large"
                className='button_margin'
                onClick={() => this.reloadDate()}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"></i>
                刷新
              </Button>
              <Button
                size="large"
                icon="delete"
                className='button_margin'
                onClick={() => this.deleteItem()}
                disabled={!selectedRowKeys.length}
              >
                删除
              </Button>
              <div className='search_box'>
                <Input
                  size="large"
                  placeholder="按存储名称搜索"
                />
                <i className="fa fa-search search_icon" aria-hidden="true"></i>
              </div>
              {
                dataSource.length
                ? <div className='totle_num'>共计 {dataSource.length} 条</div>
                : null
              }
            </div>
            <div className="table_container">
              <Table
              	columns={columns}
              	dataSource={dataSource}
              	rowSelection={rowSelection}
              	pagination={{ simple: true }}
              	loading={isFetching}
                onRowClick={this.tableRowClick}
              />
            </div>
          </div>

          <Modal
          	title="删除操作"
          	visible={deleteModalVisible}
          	closable={true}
          	onOk={() => this.confirmDeleteItem()}
          	onCancel={() =>  this.setState({deleteModalVisible: false})}
          	width="570px"
          	maskClosable={false}
          	confirmLoading={confirmLoading}
          	wrapClassName="delete_share_memory_modal"
          >
          	<div className='warning_tips'>
              <Icon type="question-circle-o" className='question_icon'/> 
              确定要删出这 {selectedRowKeys.length} 个存储目录吗？
          	</div>
          </Modal>

          <Modal
          	title="创建共享存储目录"
          	visible={createShareMemoryVisible}
          	closable={true}
          	onOk={() => this.confirmCreateShareMemory()}
          	onCancel={() => this.setState({createShareMemoryVisible: false})}
          	width="570px"
          	maskClosable={false}
          	confirmLoading={confirmLoading}
          	wrapClassName="create_share_memory_path"
          >
          	<Form>
              <FormItem
                label="存储类型"
                {...formItemLayout}
              >
                <Select
                  placeholder='请选择类型'
                  disabled={true}
                  {...getFieldProps('type', {
                    initialValue: 'nfs'
                  })}
                  style={{width: 160, marginRight: 20}}
                >
                  <Option key="nfs" value="nfs">nfs</Option>
                </Select>
                <FormItem
                  style={{width: 160, float: 'right'}}
                >
                  <Select
                    placeholder='请选择一个server'
                    {...getFieldProps('server', {
                      rules: [{
                        required: true,
                        message: 'server不能为空'
                      }]
                    })}
                  >
                    <Option value="1" key="1">192.168.1.1</Option>
                    <Option value="2" key="2">192.168.1.2</Option>
                    <Option value="3" key="3">192.168.1.3</Option>
                  </Select>
                </FormItem>
              </FormItem>
              <FormItem
                label="存储名称"
                {...formItemLayout}
              >
                <Input
                  placeholder="请输入存储名称"
                  {...getFieldProps('name', {
                    rules: [{
                      validator: (rule, value, callback) => {
                        if(!value){
                          return callback('存储名称不能为空')
                        }
                        return callback()
                      }
                    }]
                  })}
                />
              </FormItem>
          	</Form>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ShareMemory = Form.create()(ShareMemory)

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(ShareMemory)