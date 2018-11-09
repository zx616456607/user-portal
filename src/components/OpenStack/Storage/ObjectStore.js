/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Object store component
 *
 * v0.1 - 2017-7-15
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Form, Icon, Card } from 'antd'
import { connect } from 'react-redux'
import './style/ObjectStore.less'
import { browserHistory } from 'react-router'
import { getObjectStorageList, createObjectStorage,
  deleteObjectStorage, clearObjectStorageList } from '../../../actions/openstack/openstack_storage'
import NotificationHandler from '../../../common/notification_handler'
const Noti = new NotificationHandler()

class ObjectStore extends Component {
  constructor(props) {
    super(props)
    // this.selectTableRow = this.selectTableRow.bind(this)
    this.refreshLoadObjectStore = this.refreshLoadObjectStore.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.openCreateModal = this.openCreateModal.bind(this)
    this.confirmCreate = this.confirmCreate.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.checkObjectName = this.checkObjectName.bind(this)
    this.deleteObjectStoreItem = this.deleteObjectStoreItem.bind(this)
    this.state = {
      selectedRowKeys: [],
      tableDataSource: [],
      createVisible: false,
      confirmLoading: false,
      deleteVisible: false,
      searchValue: '',
      currentItem: {},
    }
  }

  componentWillMount() {
    this.loadData()
  }
  // componentWillUnmount() {
    // this.props.clearObjectStorageList()
  // }
  loadData() {
    this.refreshLoadObjectStore()
  }

  // selectTableRow(selectedRowKeys) {
  //   this.setState({
  //     selectedRowKeys,
  //   })
  // }

  openCreateModal() {

    const { form } = this.props
    form.resetFields()
    this.setState({
      createVisible: true
    })
  }

  refreshLoadObjectStore() {

    const { getObjectStorageList } = this.props
    getObjectStorageList({
      success: {
        func: (res) => {
          this.setState({
            tableDataSource: res.list,
            selectedRowKeys: []
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            searchValue: '',
          })
        }
      }
    })
  }


  searchInput() {

    const { objectStorageList } = this.props
    const { searchValue } = this.state

    if(!searchValue){
      this.setState({
        tableDataSource: objectStorageList.result
      })
      return
    }
    const newList = objectStorageList.result.filter( list => {
      const search = new RegExp(searchValue)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      tableDataSource: newList
    })
  }

  searchChange(e){
    const value = e.target.value
    this.setState({
      searchValue: value
    })
  }

  deleteObjectStoreItem() {
    const { deleteObjectStorage } = this.props
    const { currentItem } = this.state

    let query = {
      dir: currentItem.name
    }
    this.setState({
      confirmLoading: true
    })
    deleteObjectStorage(query, {
      success: {
        func: () => {
          this.refreshLoadObjectStore()
          this.setState({
            deleteVisible: false,
            confirmLoading: false,
          })
          Noti.success('删除对象目录成功')
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.setState({
            confirmLoading: false,
          })
          if(res.statusCode == 409){
            return Noti.error('当前对象目录下，存在子目录，请先删除子目录')
          }
          Noti.error('删除对象目录失败',res.message.Code || '')
        }
      }
    })
  }

  confirmCreate() {

    const { form, createObjectStorage } = this.props

    this.setState({
      confirmLoading: true
    })
    form.validateFields((errors,values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false
        })
        return
      }
      let body = {
        dir: values.objectName
      }
      createObjectStorage(body,{
        success: {
          func: () => {
            this.refreshLoadObjectStore()
            Noti.success('创建对象目录成功')
            this.setState({
              confirmLoading: false,
              createVisible: false,
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            let message = '创建对象目录失败，请重试'
            this.setState({
              confirmLoading: false,
            })
            if(res.message) {
              try {
                message = res.message.Code || res.message.code
              } catch (err) {
                message = '创建对象目录失败，请重试'
              }
            }
            Noti.error(message)
          }
        }
      })
    })
  }

  checkObjectName(rule, value, callback){
    const { objectStorageList } = this.props
    let regx = new RegExp('^\\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?)*$')
    if(!value){
      return callback("对象名称不能为空")
    }
    if(!regx.test(value)){
      return callback('文件名为字母、数字开头和结尾，中间可[-_.]')
    }
    if (value.length <3 || value.length > 32) {
      return callback('长度为3~32位字符')
    }
    let list = objectStorageList.result
    for(let i = 0; i < list.length; i++){
      if(value == list[i].name){
        return callback('对象名已存在')
      }
    }
    return callback()
  }

  render() {
    const { selectedRowKeys,tableDataSource } = this.state
    const { objectStorageList } =this.props
    const isFetching = objectStorageList.isFetching
    const { form } = this.props
    const { getFieldProps } = form
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.selectTableRow
    // }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    }
    let tableData = []
    tableDataSource.forEach(item => {
      if(item.name.indexOf('/') < 0) {
        tableData.push(item)
      }
    })
    const columns = [
      {
        title: '对象目录名称',
        dataIndex: 'name',
        width: '40%',
        render: (text,record) => <div onClick={() => browserHistory.push(`/base_station/storage/detial?dir=${record.name}`)}
          className='loadBalancerName'>{text}</div>
      },{
        title: '目录大小',
        dataIndex: 'bytes',
        width: '40%',
        render: (text) => <div>{(text/1024).toFixed(2)} KB</div>
      },{
        title: '操作',
        width: '20%',
        render: (text,record,index) => <div>
          <Button type="ghost" onClick={() => this.setState({deleteVisible: true, currentItem: record, confirmLoading: false})}>删除</Button>
        </div>
      }
    ]
    const objectNameProps = getFieldProps('objectName',{
      rules: [{ validator: this.checkObjectName }]
    })
    const objectPublicProps = getFieldProps('objectPublic',{
      initialValue: false
    })
    return (
      <div id='object_store'>
        <div className='handleBox'>
          <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
            <i className="fa fa-plus " aria-hidden="true"></i> 创建对象目录
          </Button>
          <Button className='buttonMarign' type="ghost" size="large" onClick={this.refreshLoadObjectStore}>
            <i className="fa fa-refresh " aria-hidden="true"></i> 刷新
          </Button>
          {/* <Button className='buttonMarign' size="large" onClick={this.deleteObjectStore}
            disabled={!selectedRowKeys.length}>
            <i className="fa fa-trash-o " aria-hidden="true"></i>
            删除
          </Button> */}
          <div className='searchDiv'>
            <Input placeholder='请输入对象名搜索' onPressEnter={this.searchInput} className='searchBox' size="large" onChange={this.searchChange} id="objectSearch"/>
            <i className="fa fa-search searchIcon" aria-hidden="true" onClick={this.searchInput}></i>
          </div>
          {
            tableData.length
            ? <div className='totleNum'>
              共计 {tableData.length} 条
            </div>
            : null
          }
        </div>
        <div className='tableBox'>
          <Card className="tabCard">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ simple: true }}
              loading={isFetching}
              className="strategyTable"
            />

          </Card>
        </div>
        <Modal
          title="创建对象目录"
          visible={this.state.createVisible}
          closable={true}
          onOk={this.confirmCreate}
          onCancel={() => this.setState({ createVisible: false })}
          width='550px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_object_directory"
        >
          <Form>
            <Form.Item
              {...formItemLayout}
              label="对象目录名称"
            >
              <Input placeholder='请输入对象名称' {...objectNameProps}/>
            </Form.Item>
            {/*<Form.Item
              {...formItemLayout}
              label="公有"
              className='public'
            >
              <Checkbox {...objectPublicProps}></Checkbox>
            </Form.Item>*/}
          </Form>
          <div className='tips'>
            <Icon type="exclamation-circle-o tipsIcon"/>
            注：对象目录的概念相当于window的文件夹或者Linux的目录，区别在于对象目录不可以嵌套。
          </div>
        </Modal>

        <Modal
          title="删除对象"
          visible={this.state.deleteVisible}
          closable={true}
          onOk={this.deleteObjectStoreItem}
          onCancel={() => {this.setState({deleteVisible: false})}}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName=""
        >
          <div style={{wordBreak: 'break-all'}}>
            您确认删除目录 <span style={{color: '#2DB7F5'}}>{this.state.currentItem.name}</span> 吗？
          </div>
        </Modal>
      </div>
    )
  }
}

ObjectStore = Form.create()(ObjectStore)

function mapStateToProp(state,props) {
  const { openstack_storage } = state
  let objectStorageList = {
    isFetching: true,
    result: []
  }
  if(openstack_storage.objectStorageList){
    objectStorageList = openstack_storage.objectStorageList
  }

  return {
    objectStorageList,
  }
}

export default connect(mapStateToProp,{
  getObjectStorageList,
  createObjectStorage,
  deleteObjectStorage,
  clearObjectStorageList
})(ObjectStore)