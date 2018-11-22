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
import { Alert, Modal, Table, Icon, Form, Radio, Button, Tabs, Card, Input, Upload, Select, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Title from '../Title'
import './style/AppWrapManage.less'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { API_URL_PREFIX, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import { isResourcePermissionError, toQuerystring } from '../../common/tools'
import WrapListTable from './AppWrap/WrapListTable'
import { throwError } from '../../actions'
import { wrapManageList, deleteWrapManage, uploadWrap, checkWrapName } from '../../actions/app_center'
import ResourceBanner from '../../components/TenantManage/ResourceBanner/index'
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane
let uploadFile = false // in upload file name
const notificat = new NotificationHandler()
import { ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
// file type
const wrapType = ['.jar', '.war', '.tar', '.tar.gz', '.zip']
const wrapTypelist = ['jar', 'war']

class UploadModal extends Component {
  constructor(props) {
    super()
    let type = 'remote'
    if (!!props.loginUser.ftpConfig.addr) {
      type = 'local'
    }
    this.state = {
      protocol: 'ftp',
      type,
      fileType: 'jar'
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.props.form.resetFields()
      this.setState({ fileCallback: false, isPublished: false })
    }
  }
  handleSubmit() {
    const { func, form } = this.props
    if (!uploadFile && this.state.type === 'local') {
      notificat.info('请选择文件')
      return
    }
    // local upload
    let validateFields = ['wrapName', 'versionLabel']
    // remote http upload
    if (this.state.type !== 'local') {
      validateFields.push('protocolUrl')
      // remote ftp upload
      if (this.state.protocol == 'ftp') {
        validateFields.push('username', 'password')
      }
    }
    form.validateFields(validateFields, (errors, values) => {
      if (!!errors) {
        return;
      }
      const notificat = new NotificationHandler()
      if (this.state.type === 'local' && this.state.resolve) {
        this.state.resolve(true)
        const fileCallback = notificat.spin('上传中...')
        this.setState({ fileCallback: fileCallback })
        return
      }
      let isType = values.protocolUrl.match(/\.(jar|war)$/)
      if (!isType) {
        notificat.error('上传文件地址格式错误', '支持：' + wrapTypelist.join('、') + '文件格式')
        return
      }
      const query = {
        filename: values.wrapName,
        filetag: values.versionLabel,
        filetype: isType[1],
        originalfile: isType[0],
      }
      const body = {
        sourceURL: values.protocolUrl,
        userName: values.username,
        password: values.password
      }

      const fileCallback = notificat.spin('上传中...')

      this.setState({ fileCallback: fileCallback })

      func.uploadWrap(query, body, {
        success: {
          func: () => {
            const notificat = new NotificationHandler()
            notificat.success('上传成功')
            func.getList()
            func.uploadModal(false)
            uploadFile = false

          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            if (err.message.code == 409) {
              notificat.error('上传失败', '远程上传的文件和本地的包名称已存在')
              return
            }
            if (err.message) {
              if (err.message.message == 'LOGIN_ERROR') {
                notificat.error('上传失败', '用户名或密码错误')
                return
              }
              if (err.message.message == 'NETWORK_ERROR') {
                notificat.error('上传失败', '地址有误')
                return
              }
              if (err.message.message == 'NO_SUCH_FILE') {
                notificat.error('上传失败', '未找到文件')
                return
              }
            }
            if (err.message.code !== UPGRADE_EDITION_REQUIRED_CODE) {
              notificat.error('上传失败', err.message.message || err.message)
            }
          }
        },
        finally: {
          func: () => {
            this.state.fileCallback()
            this.setState({ fileCallback: false })
          }
        }

      })

      // "sourceURL": "xxxx",
      //   "userName": "xxxxx"
      //   "password": "xxxxx"

    });
  }
  changeprotocol = (e) => {
    this.setState({ protocol: e.target.value })
    this.props.form.resetFields(['protocolUrl'])
  }
  changeTabs = (type) => {
    this.setState({ type })
  }
  checkNameVersion = () => {
    const { form, func } = this.props
    const wrapName = form.getFieldValue('wrapName')
    const labelVersion = form.getFieldValue('versionLabel')
    if (!wrapName) return
    if (!labelVersion) return

    const query = {
      filter: `fileName contains ${wrapName}`,
    }
    let isEq = false
    let isPublished = false
    clearTimeout(this.wrapNameCheckTimeout)
    this.wrapNameCheckTimeout = setTimeout(() => func.checkWrapName(query, {
      success: {
        func: ret => {
          if (Array.isArray(ret.data.pkgs)) {
            ret.data.pkgs.every(item => {
              if (item.fileTag == labelVersion && item.fileName == wrapName) {
                isEq = true
                if (item.publishStatus === 1) {
                  isPublished = true
                }
                return false
              }
              return true
            })
          }
          if (isEq) {
            notificat.info('应用包名称和版本重复，继续上传会覆盖原有的')
          }
          this.setState({
            isPublished
          })
        }
      }
    }), ASYNC_VALIDATOR_TIMEOUT)
  }
  validateName = (rule, value, callback) => {
    if (!value) {
      return callback('请输入包名称')
    }
    if (value.length < 3 || value.length > 64) {
      return callback('包名称长度为3~64位字符')
    }
    if (!/^[A-Za-z0-9]+[A-Za-z0-9_-]+[A-Za-z0-9]$/.test(value)) {
      return callback('以英文字母和数字开头中间可[-_]')
    }
    this.setState({ fileName: value })
    this.checkNameVersion()
    return callback()
  }
  validateVersion = (rule, value, callback) => {
    if (!value) {
      return callback('请输入版本')
    }
    if (!/^([a-z0-9]+((?:[._]|__|[-]*)[a-z0-9]+)*)?$/.test(value)) {
      return callback('由小写字母或数字开头和结尾中间可[._-]')
    }
    if (value.length > 128) {
      return callback('最多只能为128个字符')
    }
    this.setState({ fileTag: value })
    this.checkNameVersion()
    return callback()
  }
  checkedUrl = (rule, value, callback) => {
    if (!value) {
      return callback('请输入地址')
    }
    if (/^https:/.test(value)) {
      return callback('暂不支持https')
    }
    let protocol = 'ftp'
    if (this.state.protocol !== 'ftp') {
      protocol = 'http'
      if (!/^http:\/\/?/.test(value)) {
        return callback(`请以http协议开头，如：${protocol}://www.demo.com/app.jar`)
      }
    } else {
      if (!/^ftp:\/\/?/.test(value)) {
        return callback(`请以ftp协议开头，如：${protocol}://www.demo.com/app.jar`)
      }
    }
    let fileType = value.match(/\.(jar|war)$/)
    if (!fileType) {
      return callback(`文件格式错误，如：${protocol}://www.demo.com/app.jar`)
    }
    return callback()
  }
  render() {
    const { form, func, loginUser, space } = this.props
    const { fileType, fileName, fileTag, isPublished, originalfile } = this.state
    // const isReq = type =='local' ? false : true
    const wrapName = form.getFieldProps('wrapName', {
      rules: [
        { whitespace: true },
        { validator: this.validateName }
      ]
    })
    const versionLabel = form.getFieldProps('versionLabel', {
      rules: [
        { whitespace: true },
        { validator: this.validateVersion }
      ],
    })
    const protocolUrl = form.getFieldProps('protocolUrl', {
      rules: [
        { validator: this.checkedUrl }
      ]
    })
    const username = form.getFieldProps('username', {
      rules: [{ whitespace: true }]
    })
    const password = form.getFieldProps('password', {
      rules: [{ whitespace: true }]
    })
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    }
    const self = this
    let headers = {}
    if (space.userName) {
      // 个人项目
      headers = { onbehalfuser: space.userName }
    }
    if (space.namespace !== 'default') {
      // 共享项目
      headers = { teamspace: space.namespace }
    }
    // const fileName = form.getFieldValue('wrapName')
    // const fileTag = form.getFieldValue('versionLabel')
    let query = {
      filename: fileName,
      filetag: fileTag,
      filetype: fileType,
      originalfile,
    }
    const actionUrl = `${API_URL_PREFIX}/pkg/local?${toQuerystring(query)}`
    const selfProps = {
      name: 'pkg',
      action: actionUrl,
      headers,
      beforeUpload(file) {
        // x-tar x-gzip zip java-archive war=''
        // let fileType = 'war'
        let isType = false

        isType = file.name.match(/\.(jar|war)$/)
        if (!isType) {
          notificat.error('上传文件格式错误', '支持：' + wrapTypelist.join('、') + '文件格式')
          return false
        }
        self.setState({ originalfile: file.name.split('.')[0], fileType: isType[1] })
        uploadFile = file.name // show upload file name
        // return true
        return new Promise((resolve, reject) => {
          self.setState({
            resolve: resolve
          })
        })
      },
      onChange(e) {
        if (e.file.status == 'done') {
          self.state.fileCallback()
          notificat.success('上传成功')
          uploadFile = false
          func.uploadModal(false)
          func.getList()
        }
        if (e.file.status == 'error') {
          self.state.fileCallback()
          let message = e.file.response.message
          if (typeof e.file.response.message == 'object') {
            message = JSON.stringify(e.file.response.message)
            if (e.file.response.statusCode == UPGRADE_EDITION_REQUIRED_CODE || isResourcePermissionError(e.file.response)) {
              func.throwError(e.file.response)
            }
          } else {
            notificat.error('上传失败', message)
          }
          uploadFile = false
          func.uploadModal(false)
        }
      }
    }
    const ftpConfiged = !!loginUser.ftpConfig.addr
    // const defaultActiveKey = ftpConfiged ? 'local' : 'remote'
    return (
      <Modal title="上传包文件" visible={this.props.visible}
        onCancel={() => func.uploadModal(false)}
        onOk={() => this.handleSubmit()}
        maskClosable={false}
        okText="立即提交"
        className="uploadModal"
        confirmLoading={!!this.state.fileCallback}
      >
        <Form>
          <Form.Item {...formItemLayout} label="应用包名称">
            <Input {...wrapName} placeholder="请输入应用包名称" />
          </Form.Item>

          <Form.Item {...formItemLayout} label="版本标签">
            <Input {...versionLabel} placeholder="请输入版本标签来标记此次上传文件" />
          </Form.Item>
          {
            isPublished &&
            <div className="failedColor publishedHint"><Icon type="exclamation-circle-o" /> 注意：该应用包已发布至商店，本次上传将下架原版本，需重新发布</div>
          }
          {
            !ftpConfiged &&
            <Alert message="系统尚未配置 FTP 服务，不能使用本地上传，请联系系统管理员" type="info" showIcon closable />
          }
          <Tabs defaultActiveKey={this.state.type} onChange={this.changeTabs} size="small">
            <TabPane
              tab="本地上传"
              key="local"
              disabled={!ftpConfiged}
            >
              <div className="dragger">
                <Dragger {...selfProps}>
                  拖动文件到这里以上传，或点击 <a>选择文件</a>
                  <div style={{ color: '#999' }}>支持上传 jar、war 格式包文件，建议包文件小于300M</div>
                  {uploadFile ? <div>文件名称：{uploadFile}</div> : null}
                </Dragger>
              </div>
            </TabPane>
            <TabPane tab="远程上传" key="remote">
              <Form.Item {...formItemLayout} label="协议">
                <RadioGroup onChange={this.changeprotocol} value={this.state.protocol}>
                  <Radio key="ftp" value="ftp">ftp</Radio>
                  <Radio key="http" value="http">http</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item {...formItemLayout} label={<span><span style={{ color: 'red', fontFamily: 'SimSun' }}>*</span> 地址</span>}>
                <Input {...protocolUrl} placeholder={`请输入远程文件地址，如 ${this.state.protocol}://www.demo.com/app.jar`} />
              </Form.Item>
              {this.state.protocol === 'ftp' ?
                [<Form.Item {...formItemLayout} label="用户名" key="ftp">
                  <Input {...username} style={{ width: '200px' }} placeholder="请输入用户名" />
                </Form.Item>,
                <Form.Item {...formItemLayout} label="密码" key="pass">
                  <Input {...password} style={{ width: '200px' }} placeholder="请输入密码" />
                </Form.Item>]
                : null
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
    super(props)
    this.state = {
      selectedRowKeys: [],
      page: 1,
      id: [],
      isRefresh: false,
      uploadModal: this.props.location.query['is_show'] === "1" ? true : false,
    }
  }
  getList = (e) => {
    const value = this.refs.wrapSearch.refs.input.value
    const inputValue = value.trim()
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
    this.setState({ page: current })
    let from = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }
  componentWillMount() {
    this.loadData()
  }
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.space.namespace !== this.props.space.namespace) {
  //     this.loadData()
  //   }
  // }

  callbackRowSelection = (id, RowKeys) => {
    this.setState({
      id,
      selectedRowKeys: RowKeys,
    })
  }

  callbackRefresh = () => {
    this.setState({
      isRefresh: false
    })
  }
  callbackRowKeys = () => {
    this.setState({
      selectedRowKeys: []
    })
  }
  callbackRow = (RowKeys, id, Template, fileType) => {
    this.setState({
      selectedRowKeys: RowKeys,
      id,
      defaultTemplate: Template,
      version: null,
      fileType,
    })
  }
  callbackRows = (RowKeys, id, fileType) => {
    this.setState({
      selectedRowKeys: RowKeys,
      id,
      fileType,
    })
  }

  uploadModal = (modal) => {
    this.setState({ uploadModal: modal })
    if (!!modal) {
      setTimeout(() => {
        document.getElementById('wrapName').focus()
      }, 200)

    }
  }
  deleteAction(status, id) {
    if (status) {
      id = [id]
      this.setState({ delAll: true, id })
      return
    }
    this.setState({ delAll: false })
  }
  deleteVersion = () => {
    // const notificat = new NotificationHandler()
    const { id, page } = this.state
    const { wrapList } = this.props
    const filePkgNames = []
    wrapList.pkgs.forEach(item => {
      if (id.includes(item.id)) {
        filePkgNames.push(item.fileName)
      }
    })
    this.setState({ selectedRowKeys: [] })
    this.props.deleteWrapManage({ ids: id, filePkgNames }, {
      success: {
        func: () => {
          notificat.success('删除成功')
          let newPage = Math.floor((wrapList.total - id.length) / DEFAULT_PAGE_SIZE)
          if (newPage < page) {
            this.loadData(page - 1)
            return
          }
          this.loadData(page)
        }, isAsync: true
      },
      failed: {
        func: (err) => {
          notificat.error('删除失败', err.message.message || err.message)
        }
      },
      finally: {
        func: () => {
          this.deleteAction(false)
        }
      }
    })
  }
  goDeploy(fileName) {
    // /app_manage/app_create/quick_create#configure-service
    browserHistory.push('/app_manage/deploy_wrap?fileName=' + fileName)
  }
  deleteHint() {
    Modal.info({
      title: '只有未发布、已拒绝、已下架的应用包可被删除'
    })
  }
  showDeleteModal() {
    const { wrapList } = this.props
    const { id } = this.state
    const hasPublishWrap = wrapList.pkgs.some(item => id.includes(item.id) && (![0, 3, 4].includes(item.publishStatus)))
    if (hasPublishWrap) {
      return this.deleteHint()
    }
    this.setState({ delAll: true })
  }
  handleRefresh() {
    this.setState({ isRefresh: true })
    this.getList(true)
  }
  render() {
    const { location } = this.props
    const funcCallback = {
      uploadModal: this.uploadModal,
      getList: this.getList,
      uploadWrap: this.props.uploadWrap,
      checkWrapName: this.props.checkWrapName,
      throwError: this.props.throwError
    }
    const func = {
      // id: this.state.id,
      scope: this,
      goDeploy: this.goDeploy,
      location
    }
    return (
      <QueueAnim>
        <Title title="应用包管理" />
        <div key="wrap_list" id="app_wrap_manage">
          <ResourceBanner resourceType='applicationPackage'/>
          <div className="btnRow">
            <Button size="large" type="primary" icon="upload" onClick={() => this.uploadModal(true)}>上传包文件</Button>
            <Button className="refreshBtn" size="large" style={{ margin: '0 10px' }} onClick={() => this.handleRefresh()}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button className="refreshBtn" size="large" onClick={() => this.showDeleteModal()} icon="delete" style={{ marginRight: '10px' }} disabled={this.state.selectedRowKeys.length == 0}>删 除</Button>
            <Input size="large" onPressEnter={() => this.getList(true)} style={{ width: 180 }} placeholder="请输入包名称搜索" ref="wrapSearch" />
            <i className="fa fa-search btn-search" onClick={() => this.getList(true)} />
          </div>
          <Card className="wrap_content">
            <WrapListTable currentType="trad" isRefresh={this.state.isRefresh} callback={this.callbackRefresh}
              callbackRowKeys={this.callbackRowKeys} callbackRowSelection={this.callbackRowSelection} func={func}
              callbackRow={this.callbackRow} callbackRows={this.callbackRows} rowCheckbox={true} selectedRowKeys={this.state.selectedRowKeys} />
          </Card>
        </div>

        <UploadForm
          func={funcCallback}
          visible={this.state.uploadModal}
          loginUser={this.props.loginUser}
          space={this.props.space}
        />
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={() => this.deleteAction(false)}
          onOk={this.deleteVersion}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            确定要删除所选版本？
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { loginUser, current } = state.entities
  const { wrapList } = state.images
  const list = wrapList || {}
  let datalist = { pkgs: [], total: 0 }
  if (list.result) {
    datalist = list.result.data
  }
  return {
    wrapList: datalist,
    loginUser: loginUser.info,
    space: current.space
  }
}

export default connect(mapStateToProps, {
  wrapManageList,
  deleteWrapManage,
  uploadWrap,
  checkWrapName,
  throwError
})(WrapManage)
