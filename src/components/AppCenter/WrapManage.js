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
import { Modal, Table, Icon, Form, Radio, Button, Tabs, Card, Input, Upload, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Title from '../Title'
import './style/AppWrapManage.less'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE} from '../../../constants'

import { wrapManageList, deleteWrapManage ,downloadWrap} from '../../actions/app_center'
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane
let uploadFile = false // in upload file name

// file type
const wrapType = ['.jar','.war','.tar.gz','.zip']
const wrapTypelist = ['jar','war','tar.gz','zip']

class UploadModal extends Component {
  constructor(props) {
    super()
    this.state = {
      protocol: 'ftp',
      type: 'local',
      fileType: 'jar'
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.props.form.resetFields()
    }
  }
  handleSubmit() {
    const { func,form } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      // if(this.state.resolve) {
      //   this.state.resolve(true)
      // }
      func.uploadModal(false)
      func.getList()

    });
  }
  changeprotocol = (e) => {
    this.setState({protocol: e.target.value})
  }
  changeTabs = (type)=> {
    this.setState({type})
  }
  wraptypeList() {
    return wrapTypelist.map(types => {
      return <Select.Option value={types}>{types}</Select.Option>
    })
  }
  validateVersion(rule, value, callback) {
    if(!value) {
      return callback('请输入版本')
    }
    return callback()
  }
  validateType(e) {
    this.setState({fileType: e})
  }
  render() {
    const { form, func} = this.props
    const { type,fileType } = this.state
    const isReq = type =='local' ? false : true
    const wrapName = form.getFieldProps('wrapName',{
      rules: [{required: true,whitespace: true, message: '请输入包名称'}]
    })
    const versionLabel = form.getFieldProps('versionLabel',{
      rules: [
        {required: true, whitespace: true, message: '请输入版本'},
        // {validator: this.validateVersion}
      ],

    })
    const protocolUrl = form.getFieldProps('protocolUrl',{
      rules: [{required: isReq,whitespace: true, message: '请输入远程地址'}]
    })
    const formItemLayout = {
      labelCol: { span: 5},
      wrapperCol: { span: 18 },
    }
    const self = this
    const fileName = form.getFieldValue('wrapName')
    const fileTag = form.getFieldValue('versionLabel')
    const actionUrl = `/api/v2/${fileName}/${fileTag}/${fileType}`
    const selfProps = {
      name: 'file',
      action: actionUrl,
      beforeUpload(file) {
        const notificat = new NotificationHandler()
        if (!fileName || !fileTag) {
          notificat.info('请先输入包名称和版本标签')
          return false
        }
        // form.validateFields((err, value) => {
          // if(err) return false
          let isType = false
          wrapType.every(type => {
            if (file.name.indexOf(type) > -1) {
              isType = true
              return false
            }
            return true
          })
          if (!isType) {
            notificat.error('上传文件格式错误', '支持有：jar, tar.gz, war, zip')
            return false
          }
          return true
          // return new Promise((resolve, reject) => {
          //   self.setState({
          //     resolve: resolve
          //   })
          // })

        // })
      }
    }
    return (
      <Modal title="上传包文件" visible={this.props.visible}
        onCancel={() => func.uploadModal(false)}
        onOk={()=> this.handleSubmit()}
        maskClosable={false}
        okText="立即提交"
        className="uploadModal"
        >
        <Form>
          <Form.Item {...formItemLayout} label="应用包名称">
              <Input {...wrapName} placeholder="请输入名称来标记此次上传文件" style={{ width: '300px' }} />
          </Form.Item>
          <Form.Item {...formItemLayout} label="应用包格式">
            <Select defaultValue={wrapTypelist[0]} style={{ width: '300px' }} onChange={(e) => this.validateType(e)}>
              { this.wraptypeList() }
            </Select>
          </Form.Item>
          <Form.Item {...formItemLayout} label="版本标签">
              <Input {...versionLabel} placeholder="请输入版本标签来标记此次上传文件" style={{ width: '300px' }} />
          </Form.Item>
          <br />
          <Tabs defaultActiveKey="local" onChange={this.changeTabs} size="small">
            <TabPane tab="本地上传" key="local">
              <div className="dragger">
                <Dragger {...selfProps}>
                  拖动文件到这里以上传，或点击 <a>选择文件</a>
                </Dragger>
              </div>
            </TabPane>
            <TabPane tab="远程上传" key="remote">
              <Form.Item {...formItemLayout} label="协议">
              <RadioGroup onChange={this.changeprotocol} value={this.state.protocol}>
                <Radio key="ftp" value="ftp">ftp</Radio>
                <Radio key="http|https" value="http|https">http | https</Radio>
              </RadioGroup>
              </Form.Item>
              <Form.Item {...formItemLayout} label="地址">
                <Input {...protocolUrl} style={{ width: '300px' }} placeholder="请输入远程文件地址，如 ftp://server.helloworld.jar" />
              </Form.Item>
              <Form.Item {...formItemLayout} label="用户名">
                <Input style={{ width: '200px' }} placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item {...formItemLayout} label="密码">
                <Input style={{ width: '200px' }} placeholder="请输入密码" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    )
  }
}

const UploadForm = Form.create()(UploadModal)

class WrapManage extends Component {
  constructor(props) {
    super()
    this.state = {
      selectedRowKeys: []
    }
  }
  getList = (e)=> {
    if (!e || e.target.value == '') {
      this.props.wrapManageList()
      return
    }
    const query = {
      filter: `fileName contains ${e.target.value}`,
    }
    this.props.wrapManageList(query)
  }
  queryList = (e)=> {
    this.props.wrapManageList(e)
  }
  componentWillMount() {
    this.getList()
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.space.namespace !== this.props.space.namespace) {
      this.getList()
    }
  }

  uploadModal = (modal) => {
    this.setState({ uploadModal: modal })
    setTimeout(()=> {
      document.getElementById('wrapName').focus()
    },200)
  }
  deleteAction(status,id) {
    id = [id] || null
    this.setState({delAll: status,id})
  }
  deleteVersion = ()=> {
    const notificat = new NotificationHandler()
    const { id } = this.state
    this.props.deleteWrapManage({ids: id},{
      success: {
        func:()=> {
          notificat.success('删除成功')
          this.getList()
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
        render: (text,row) => <a onClick={()=> this.props.downloadWrap(row.id)}>{text}</a>
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
      total: dataSource.total,
      // onChange: current => func.loadData({ page: current }),
      showTotal: total => `共计： ${total} 条 `,
    }
    const funcCallback = {
      uploadModal: this.uploadModal,
      getList: this.getList
    }
    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        // const strategyID = selectedRows.map((list)=> {
        //   return list.strategyID
        // })
        _this.setState({ selectedRowKeys })
      }
    }

    return (
      <QueueAnim>
        <Title title="应用包管理" />
        <div key="wrap_list" id="app_wrap_manage">
          <div className="btnRow">
            <Button size="large" type="primary" icon="plus" onClick={() => this.uploadModal(true)}>上传包文件</Button>
            <Button size="large" style={{ margin: '0 10px' }} onClick={()=> this.getList()}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button size="large" onClick={()=> this.deleteAction(true)} icon="delete" style={{ marginRight: '10px' }} disabled={this.state.selectedRowKeys.length == 0}>删 除</Button>
            <Input size="large" onPressEnter={(e)=> this.getList(e)} style={{ width: 180 }} placeholder="请输入包名称或标签搜索" ref="wrapSearch" />
            <i className="fa fa-search btn-search" onClick={()=> this.getList()}/>
          </div>
          <Card className="wrap_content">
            <Table className="strategyTable" loading={this.props.isFetching} rowSelection={rowSelection} dataSource={dataSource.pkgs} columns={columns} pagination={paginationOpts} />
          </Card>
        </div>

        <UploadForm func={funcCallback} visible={this.state.uploadModal}/>
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={()=> this.deleteAction(false)}
          onOk={this.deleteVersion}
          >
          <div className="confirmText">确定要删除所选版本？</div>
        </Modal>
      </QueueAnim>
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
  const { query, pathname } = props.location
  let { page,size } = query
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
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
  downloadWrap
})(WrapManage)