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
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { API_URL_PREFIX } from '../../constants'

import { wrapManageList, deleteWrapManage, uploadWrap } from '../../actions/app_center'
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane
let uploadFile = false // in upload file name
const notificat = new NotificationHandler()

// file type
const wrapType = ['.jar','.war','.tar','.tar.gz','.zip']
const wrapTypelist = ['jar','war','tar','tar.gz','zip']

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
      this.setState({fileCallback: false})
    }
  }
  handleSubmit() {
    const { func,form } = this.props
    if (!uploadFile && this.state.type === 'local') {
      notificat.info('请选择文件')
      return
    }
    form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }

      if(this.state.type === 'local' && this.state.resolve) {
        this.state.resolve(true)
        const fileCallback = notificat.spin('上传中...')
        this.setState({fileCallback:fileCallback})
        return
      }
      let fileType = 'war'
      let isType = false
      wrapType.every((types, index)=> {
        if (values.protocolUrl.lastIndexOf(types)> -1) {
          fileType = wrapTypelist[index]
          isType = true
          return false
        }
        return true
      })
      if (!isType) {
        notificat.error('上传文件地址格式错误', '支持：'+ wrapTypelist.join(', '))
        return
      }
      const body = {
        fileName:values.wrapName,
        fileTag: values.versionLabel,
        fileType: fileType,
        body:{
          sourceURL: values.protocolUrl,
          userName: values.username,
          password: values.password
        }
      }
      this.setState({fileCallback: true})
      func.uploadWrap(body,{
        success:{
          func:()=> {
            const notificat = new NotificationHandler()
            notificat.success('上传成功')
            func.getList()
            func.uploadModal(false)
            uploadFile = false

          },
          isAsync: true
        },
        failed:{
          func:(err)=> {
            if (err.message.code == 409) {
              notificat.error('上传失败','远程上传的文件和本地的包名称已存在')
              return
            }
            if (err.message.code == 400) {
              notificat.error('上传失败','用户名或密码错误')
              return
            }
            notificat.error('上传失败',err.message.message || err.message)
          }
        },
        finally: {
          func:() => {
            this.setState({fileCallback: false})
          }
        }

      })

      // "sourceURL": "xxxx",
      //   "userName": "xxxxx"
      //   "password": "xxxxx"

    });
  }
  changeprotocol = (e) => {
    this.setState({protocol: e.target.value})
  }
  changeTabs = (type)=> {
    this.setState({type})
  }

  validateName = (rule, value, callback)=> {
    if (!value) {
      return callback('请输入包名称')
    }
    if (value.length <3 || value.length >64) {
      return callback('包名称长度为3~64位字符')
    }
    if (!/^[A-Za-z0-9]+[A-Za-z0-9_-]+[A-Za-z0-9]$/.test(value)) {
      return callback('以英文字母和数字开头中间可[-_]')
    }
    this.setState({fileName: value})
    return callback()
  }
  validateVersion = (rule, value, callback)=> {
    if(!value) {
      return callback('请输入版本')
    }
    if (value.length >64) {
      return callback('包名称长度为1~64位字符')
    }
    if (!/^[A-Za-z0-9]+[A-Za-z0-9_-]+[A-Za-z0-9]$/.test(value)) {
      return callback('以英文字母和数字开头中间可[-_]')
    }
    this.setState({fileTag: value})
    return callback()
  }

  render() {
    const { form, func } = this.props
    const { type,fileType,fileName,fileTag } = this.state
    const isReq = type =='local' ? false : true
    const wrapName = form.getFieldProps('wrapName',{
      rules: [
        { whitespace: true },
        {validator: this.validateName}
      ]
    })
    const versionLabel = form.getFieldProps('versionLabel',{
      rules: [
        { whitespace: true },
        {validator: this.validateVersion}
      ],
    })
    const protocolUrl = form.getFieldProps('protocolUrl',{
      rules: [{required: isReq,whitespace: true, message: '请输入远程地址'}]
    })
    const username = form.getFieldProps('username',{
      rules: [{whitespace: true }]
    })
    const password = form.getFieldProps('password',{
      rules: [{whitespace: true }]
    })
    const formItemLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 18 },
    }
    const self = this
    // const fileName = form.getFieldValue('wrapName')
    // const fileTag = form.getFieldValue('versionLabel')
    const actionUrl = `${API_URL_PREFIX}/${fileName}/${fileTag}/${fileType}`
    const selfProps = {
      name: 'pkg',
      action: actionUrl,
      beforeUpload(file) {
        if (!fileName || !fileTag) {
          notificat.info('请先输入包名称和版本标签')
          return false
        }
        // x-tar x-gzip zip java-archive war=''
        let fileType = 'war'
        let isType = false
        wrapType.every((type, index)=> {
          if (file.name.lastIndexOf(type) > -1) {
            isType = true
            fileType = wrapTypelist[index]
            return false
          }
          return true
        })

        if (!isType) {
          notificat.error('上传文件格式错误', '支持：'+ wrapTypelist.join(', '))
          return false
        }
        self.setState({fileType})
        uploadFile = file.name // show upload file name
        // return true
        return new Promise((resolve, reject) => {
          self.setState({
            resolve: resolve
          })
        })
      },
      onChange(e) {
        const notificat = new NotificationHandler()
        if (e.file.status == 'done') {
          self.state.fileCallback()
          notificat.success('上传成功')
          uploadFile = false
          func.uploadModal(false)
          func.getList()
        }
      }
    }
    return (
      <Modal title="上传包文件" visible={this.props.visible}
        onCancel={() => func.uploadModal(false)}
        onOk={()=> this.handleSubmit()}
        maskClosable={false}
        okText="立即提交"
        className="uploadModal"
        confirmLoading={this.state.fileCallback}
        >
        <Form>
          <Form.Item {...formItemLayout} label="应用包名称">
              <Input {...wrapName} placeholder="请输入名称" />
          </Form.Item>

          <Form.Item {...formItemLayout} label="版本标签">
              <Input {...versionLabel} placeholder="请输入版本标签来标记此次上传文件" />
          </Form.Item>
          <Tabs defaultActiveKey="local" onChange={this.changeTabs} size="small">
            <TabPane tab="本地上传" key="local">
              <div className="dragger">
                <Dragger {...selfProps}>
                  拖动文件到这里以上传，或点击 <a>选择文件</a>
                  {uploadFile ? <div>文件名称：{uploadFile}</div>: null}
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
                <Input {...protocolUrl} placeholder="请输入远程文件地址，如 ftp://server.helloworld.jar" />
              </Form.Item>
              {this.state.protocol === 'ftp'?
              [<Form.Item {...formItemLayout} label="用户名" key="ftp">
                <Input {...username} style={{ width: '200px' }} placeholder="请输入用户名" />
              </Form.Item>,
              <Form.Item {...formItemLayout} label="密码" key="pass">
                <Input {...password} style={{ width: '200px' }} placeholder="请输入密码" />
              </Form.Item>]
              :null
              }
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

  uploadModal = (modal) => {
    this.setState({ uploadModal: modal })
    setTimeout(()=> {
      document.getElementById('wrapName').focus()
    },200)
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
    this.setState({selectedRowKeys:[]})
    this.props.deleteWrapManage({ids: id},{
      success: {
        func:()=> {
          notificat.success('删除成功')
          if (this.props.wrapList.total - 10 <= id.length) {
            this.loadData(page -1)
          }
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
      total: dataSource.total,
      onChange: current => this.loadData(current),
      showTotal: total => `共计： ${total} 条 `,
    }
    const funcCallback = {
      uploadModal: this.uploadModal,
      getList: this.getList,
      uploadWrap: this.props.uploadWrap
    }
    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const ids = selectedRows.map(row => {
          return row.id
        })
        _this.setState({ selectedRowKeys,id:ids })
      }
    }

    return (
      <QueueAnim>
        <Title title="应用包管理" />
        <div key="wrap_list" id="app_wrap_manage">
          <div className="btnRow">
            <Button size="large" type="primary" icon="plus" onClick={() => this.uploadModal(true)}>上传包文件</Button>
            <Button size="large" style={{ margin: '0 10px' }} onClick={()=> this.getList()}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button size="large" onClick={()=> this.setState({delAll: true})} icon="delete" style={{ marginRight: '10px' }} disabled={this.state.selectedRowKeys.length == 0}>删 除</Button>
            <Input size="large" onPressEnter={()=> this.getList(true)} style={{ width: 180 }} placeholder="请输入包名称或标签搜索" ref="wrapSearch" />
            <i className="fa fa-search btn-search" onClick={()=> this.getList(true)}/>
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
  uploadWrap
})(WrapManage)