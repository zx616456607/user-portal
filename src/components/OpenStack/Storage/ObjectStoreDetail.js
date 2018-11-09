/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Object store detail component
 *
 * v0.1 - 2017-7-15
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Table, Input, Dropdown, Menu, Form, Modal, Icon, Upload, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import './style/ObjectStoreDetail.less'
import {
  getObjectStorageDetailList,
  deleteObjectStorage,
  createObjectStorage,
} from '../../../actions/openstack/openstack_storage'
import NotificationHandler from '../../../common/notification_handler'
import ObjectCopy from './ObjectCopy'

const dataObj = {
  name: ''
}

class ObjectStoreDetail extends Component {
  constructor(props) {
    super(props)
    this.openUploadModal = this.openUploadModal.bind(this)
    this.openDownloadModal = this.openDownloadModal.bind(this)
    this.refreshObjectStoreDetail = this.refreshObjectStoreDetail.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.selectTableRow = this.selectTableRow.bind(this)
    this.confirmUpload = this.confirmUpload.bind(this)
    this.deleteObjectStorageSub = this.deleteObjectStorageSub.bind(this)
    this.openCreateModal = this.openCreateModal.bind(this)
    this.confirmCreate = this.confirmCreate.bind(this)
    this.checkObjectName = this.checkObjectName.bind(this)
    this.state = {
      tableDataSource: [],
      selectedRowKeys: [],
      uploadVisible: false,
      uploadLoading: false,
      deleteVisible: false,
      createVisible: false,
      confirmLoading: false,
      searchValue: '',
      selectRow:{},
      currentItem: {},
    }
  }

  componentWillMount() {
    this.refreshObjectStoreDetail()
  }

  openUploadModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      uploadVisible: true,
      update: false,
      uploadLoading: false,
    })
  }

  openDownloadModal() {
    const { location } = this.props
    const { selectedRowKeys, tableDataSource } = this.state
    let item = tableDataSource[selectedRowKeys[0]]
    if(selectedRowKeys.length > 1){
      Modal.info({
        title: '提示',
        content: (
          <div>
            目前不支持同时下载多个文件。
          </div>
        ),
        onOk() {},
      });
      return
    }
    let lastWord = item.name.substring(item.name.length - 1, item.name.length)
    if(lastWord === '/'){
      Modal.info({
        title: '提示',
        content: (
          <div>
            文件目录不能下载，请重新选择。
          </div>
        ),
        onOk() {},
      });
      return
    }
    let name = location.query.dir
    let locationHost = window.location.host
    let protocol = window.location.protocol
    let str = `${protocol}//${locationHost}/api/v2/puhua/object_storage/object/download?dir=${name}/${item.name}`
    window.open(str)
  }

  refreshObjectStoreDetail() {

    const { getObjectStorageDetailList, location } = this.props
    let name = encodeURIComponent(location.query.dir)
    getObjectStorageDetailList(name,{
      success: {
        func: (res) => {
          this.setState({
            tableDataSource: res.detail,
            selectedRowKeys: [],
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            searchValueL: ''
          })
        }
      }
    })
  }

  searchChange(e){

    const value = e.target.value
    this.setState({
      searchValue: value
    })
  }

  searchInput(e) {

    const { searchValue } = this.state
    const { objectStorageDetailList } = this.props
    if(!searchValue){
      this.setState({
        tableDataSource: objectStorageDetailList.result
      })
    }
    const newList = objectStorageDetailList.result.filter( list => {
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

  selectTableRow(selectedRowKeys,selectRow) {
    this.setState({
      selectedRowKeys,
      selectRow:selectRow[0] || {}
    })
  }

  deleteObjectStorageSub(){

    const { deleteObjectStorage, location } = this.props
    const { currentItem } = this.state
    let Noti = new NotificationHandler()
    let name = location.query.dir
    let str = `${name}/${currentItem.name}`
    let query = {
      dir: str
    }
    this.setState({
      confirmLoading: true
    })
    deleteObjectStorage(query, {
      success: {
        func: () => {
          Noti.success('删除对象目录成功')
          this.refreshObjectStoreDetail()
          this.setState({
            confirmLoading: false,
            deleteVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          let message = '删除对象目录失败，请重试'
          this.setState({
            confirmLoading: false,
          })
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              message = '删除对象目录失败，请重试'
            }
          }
          Noti.error(message)
        }
      }
    })
  }

  menuClick(obj,item) {
    switch(item.key){
      case 'copy':
        return
      case 'delete':
        return this.deleteObjectStorageSub(obj)
      default:
        return
    }
  }

  confirmUpload() {
    const { form, location } = this.props
    let name = location.query.dir
    let validataArray = ['file', 'objectName']
    form.validateFields(validataArray, (errors,values) => {
      if(!!errors){
        return
      }
      this.setState({
        uploadLoading: true,
      })
      let objectName = values.objectName
      dataObj.name = `${name}/${objectName}`
      this.state.resolve()
    })
  }

  openCreateModal(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      createVisible: true,
      confirmLoading: false,
    })
  }

  confirmCreate(){
    const { form, createObjectStorage, location } = this.props
    let Noti = new NotificationHandler()
    let name = location.query.dir
    this.setState({
      confirmLoading: true
    })
    let validataArray = ['objectNames']
    form.validateFields(validataArray, (errors,values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false
        })
        return
      }
      let str = `${name}/${values.objectNames}/`
      if(values.objectNames.substring(values.objectNames.length - 1, values.objectNames.length) === '/'){
        str = `${name}/${values.objectNames}`
      }
      let body = {
        dir: str
      }
      createObjectStorage(body,{
        success: {
          func: () => {
            this.refreshObjectStoreDetail()
            Noti.success('创建对象目录成功')
            this.setState({
              confirmLoading: false,
              createVisible: false,
              selectedRowKeys:[],
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
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                message = '创建对象目录失败，请重试'
              }
            }
            Noti.erros(message)
          }
        }
      })
    })
  }

  checkObjectName(rule, value, callback){
    const { objectStorageDetailList } = this.props
    let regx = new RegExp('^\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])$')
    if(!value){
      return callback('请填写对象名称')
    }
    if(!regx.test(value)){
      return callback('对象名称由字母、下划线组成')
    }
    let list = objectStorageDetailList.result
    for(let i = 0; i < list.length; i++){
      if(value == list[i].name){
        return callback('文件名已存在')
      }
    }
    return callback()
  }
  dropdownAction(item) {
    this.setState({[item.key]: true,update: true})
  }
  handAction = (type,e) => {
    this.setState({[type]:e })
  }
  render() {
    const { selectedRowKeys,tableDataSource,update } = this.state
    const { form, location, objectStorageDetailList } = this.props
    let isFetching = objectStorageDetailList.isFetching
    const { getFieldProps } = form
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectTableRow
    }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 }
    }
    //let item = tableDataSource.map((item,index) => {
    //  return <Menu style={{ width: '80px' }} onClick={this.menuClick.bind(this, item)} key={'menu' + index}>
    //    <Menu.Item key="copy">复制</Menu.Item>
    //    <Menu.Item key="delete">删除</Menu.Item>
    //  </Menu>
    //})
    let parentDirectory = location.query.dir
    const columns = [
      {
        title: '对象名称',
        dataIndex: 'name',
        width: '40%',
        //render: (text, record, index) => {
        //  let str = `/base_station/storage/detail?dir=${parentDirectory}/${record.name}`
        //  return <div className='loadBalancerName' onClick={() => browserHistory.push(str)}>{text}</div>}
      },{
        title: '对象大小',
        dataIndex: 'bytes',
        width: '30%',
        render: (text) => <div>{(text/1024).toFixed(2)} KB</div>
      },{
        title: '操作',
        dataIndex: 'handle',
        width: '30%',
        render: (text, record) => <Button type="ghost" onClick={() => {this.setState({deleteVisible: true, currentItem: record, confirmLoading: false})}}>删除</Button>
      }
    ]
    const fileProps = getFieldProps('file',{
      rules: [{required: true, message:'请选择要上传的文件'}]
    })
    const objectNameProps = getFieldProps('objectName',{
      rules: [{
        validator: (rule, value, callback) => {
          let regx = new RegExp('^\\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?)*$')
          if (!value) {
            return callback('请填写对象名称')
          }
          if (value.length <2 || value.length > 32) {
            return callback('长度为2~32位字符')
          }
          if (!regx.test(value)) {
            return callback('对象名称由字母、数字开头和结尾，中间可[-_.]')
          }
          const result = objectStorageDetailList.result.some( item => item.name == value )
          if (!update && result) {
            return callback('对象名称已存在')
          }
          return callback()
        }
      }],
      initialValue: update ? this.state.selectRow.name: undefined
    })
    const formItemLayoutTwo = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    }
    const objectNamePropss = getFieldProps('objectNames',{
      rules: [{ validator: this.checkObjectName }]
    })
    const objectPublicProps = getFieldProps('objectPublic',{
      initialValue: false
    })
    const self = this
    const updateUrl = update ?'/update':''
    const UploadProps = {
      name: 'file',
      action: '/api/v2/puhua/object_storage/object' + updateUrl,// or update
      data: dataObj,
      showUploadList: false,
      beforeUpload(file){
        self.setState({file: file.name})
        form.setFieldsValue({
          file: file.name
        })
        return new Promise((resolve, reject) => {
          self.setState({
            resolve: resolve
          })
        })
      },
      onChange(info) {
        let Noti = new NotificationHandler()
        if (info.file.status === 'done') {
          Noti.success('上传成功')
          self.refreshObjectStoreDetail()
          self.setState({
            uploadVisible: false,
            uploadLoading: false,
            file: null,
            update: false
          })
        } else if (info.file.status === 'error') {
          Noti.error(`上传失败`);
          self.setState({
            uploadLoading: false,
          })
        }
      },
    }

    const func ={
      handAction:this.handAction,
      scope: this
    }
    const menu = (
      <Menu onClick={(key)=> this.dropdownAction(key)}>
        <Menu.Item key="uploadVisible" disabled={this.state.selectedRowKeys.length >1 || !this.state.selectedRowKeys.length}>更新对象</Menu.Item>
        <Menu.Item key="storageCopy" disabled={this.state.selectedRowKeys.length >1 || !this.state.selectedRowKeys.length }>复制对象</Menu.Item>
      </Menu>
    )
    return (
      <div id='object_store_detail'>
        <div className='detail_header'>
          <span className="back" onClick={() => {browserHistory.push(`/base_station/storage?from=objectDetail`)}}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
          <div className='info_name_box'>
            <div className='info_name'>对象目录:
              <Tooltip title={parentDirectory}>
                <span> {parentDirectory}</span>
              </Tooltip>
              </div>
          </div>
        </div>
        <div className='detail_body'>
          <div className='handle_box'>
            {/*<Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
              <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>
              创建对象目录
            </Button>*/}
            <Button type="primary" className='buttonMarign' size="large" onClick={this.openUploadModal}>
              <i className="fa fa-cloud-upload buttonIcon" aria-hidden="true"></i>
              上传对象
            </Button>
            <Button type="primary" className='buttonMarign' size="large" onClick={this.openDownloadModal} disabled={!selectedRowKeys.length}>
              <i className="fa fa-cloud-download buttonIcon" aria-hidden="true"></i>
              下载对象
            </Button>
            <Dropdown overlay={ menu } trigger={['click']}>
              <Button size="large" type="ghost">更多 <Icon type="down" /></Button>
            </Dropdown>
            <span className='buttonMarign'></span>
            <Button type="ghost" className='buttonMarign' size="large" onClick={this.refreshObjectStoreDetail}>
              <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>
              刷新
            </Button>
            {/* <Button className='buttonMarign' size="large" onClick={this.deleteObjectStore}
              disabled={!selectedRowKeys.length}>
              <i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>
              删除
            </Button> */}
            <div className='searchDiv'>
              <Input placeholder='请输入对象名搜索' onPressEnter={this.searchInput} className='searchBox' size="large" onChange={this.searchChange} id="detailSearch"/>
              <i className="fa fa-search searchIcon" aria-hidden="true" onClick={this.searchInput}></i>
            </div>
            {
              tableDataSource.length
              ? <div className='totleNum'>
                共计 { tableDataSource.length } 条
              </div>
              : null
            }
          </div>
          <div className='table_box'>
            <Table
              columns={columns}
              dataSource={tableDataSource}
              rowSelection={rowSelection}
              pagination={{ simple: true }}
              loading={isFetching}
            />
          </div>
        </div>
        {
          this.state.uploadVisible ?
          <Modal
            title={`${this.state.update ? '更新':'上传'}对象`}
            visible={this.state.uploadVisible}
            onOk={this.confirmUpload}
            onCancel={() => this.setState({ uploadVisible: false ,update: false,uploadLoading: false,file:null})}
            width='550px'
            maskClosable={false}
            confirmLoading={this.state.uploadLoading}
            wrapClassName="upload_object"
            >
            <Form>
              <Form.Item
                {...formItemLayout}
                label="选择文件"
                className='select_file'
              >
                <Input placeholder='请选择文件' value={this.state.file}/>
                <Input placeholder='请选择文件' type="hidden" {...fileProps}/>
                <Upload {...UploadProps}>
                  <Button type="primary" className='select_button'>
                  选择
                  </Button>
                </Upload>

              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="对象名称"
              >
                <Input placeholder='请输入对象名' {...objectNameProps} disabled={this.state.update} />
              </Form.Item>
            </Form>
          </Modal>
          :null
        }

        <Modal
          title="创建对象目录"
          visible={this.state.createVisible}
          closable={true}
          onOk={this.confirmCreate}
          onCancel={() => this.setState({ createVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_object_directory"
        >
          <Form>
            <Form.Item
              {...formItemLayoutTwo}
              label="对象目录名称"
            >
              <Input placeholder='请输入对象名称' {...objectNamePropss}/>
            </Form.Item>
            {/*<Form.Item
              {...formItemLayoutTwo}
              label="公有"
              className='public'
            >
              <Checkbox {...objectPublicProps}></Checkbox>
            </Form.Item>*/}
          </Form>
          <div className='tips'>
            <Icon type="exclamation-circle-o tipsIcon"/>
            注：对象目录的概念相当于window的文件夹或者Linux的目录，区别在于对象目录不可以嵌套，但是您可以在一个目录下面创建多个子目录。您也可以设置对象目录的访问属性，如果设置为公有，用户可以通过公共URL来使用对象目录中的对象。
          </div>
        </Modal>

        <Modal
        	title="删除对象"
        	visible={this.state.deleteVisible}
        	closable={true}
        	onOk={this.deleteObjectStorageSub}
        	onCancel={() => {this.setState({deleteVisible: false})}}
        	width='570px'
        	maskClosable={false}
        	confirmLoading={this.state.confirmLoading}
        	wrapClassName=""
        >
        	<div className="alertRow" style={{wordBreak: 'break-all'}}>
            您确认删除对象 <span style={{color: '#2DB7F5'}}>{this.state.currentItem.name}</span> 吗？
        	</div>
        </Modal>
        {
          this.state.storageCopy ?
          <ObjectCopy dataList={ tableDataSource } func={ func } currentPathName={this.state.selectRow} currentPath={this.props.pathDir} />
          :null
        }

      </div>
    )
  }
}

ObjectStoreDetail = Form.create()(ObjectStoreDetail)

function mapStateToProp(state, props) {
  const { location } = props
  const { openstack_storage } = state
  let name = location.query.dir
  let objectStorageDetailList = {
    isFetching: true,
    result: []
  }
  if(openstack_storage.objectStorageDetailList[name]){
    objectStorageDetailList = openstack_storage.objectStorageDetailList[name]
  }
  return {
    objectStorageDetailList,
    pathDir: name
  }
}

export default connect(mapStateToProp, {
  getObjectStorageDetailList,
  deleteObjectStorage,
  createObjectStorage,
})(ObjectStoreDetail)