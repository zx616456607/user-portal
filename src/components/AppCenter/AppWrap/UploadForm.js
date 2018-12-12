/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * apppkg upload form
 *
 * v0.1 - 2018-12-12
 * @author rensiwei
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Alert, Modal, Icon, Form, Radio, Tabs, Input, Upload, Button } from 'antd'
import { API_URL_PREFIX, UPGRADE_EDITION_REQUIRED_CODE, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { isResourcePermissionError, toQuerystring } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import { throwError } from '../../../actions'
import { uploadWrap, checkWrapName, updatePkg } from '../../../actions/app_center'
import './style/UploadForm.less'

const notify = new NotificationHandler()

// const wrapType = [ '.jar', '.war', '.tar', '.tar.gz', '.zip' ]
const wrapTypelist = [ 'jar', 'war' ]
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane

let uploadFile = false // in upload file name
class UploadModal extends Component {
  constructor(props) {
    super()
    let type = 'remote'
    if (props.loginUser.ftpConfig.addr) {
      type = 'local'
    }
    this.state = {
      protocol: 'ftp',
      type,
      fileType: 'jar',
      isEq: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.props.form.resetFields()
      this.setState({ fileCallback: false, isPublished: false })
    }
  }
  handleSubmit() {
    const { func, form, uploadWrap, updatePkg, onCancel, currentRow } = this.props
    if (!uploadFile && this.state.type === 'local') {
      notify.info('请选择文件')
      return
    }
    // local upload
    const validateFields = [ 'wrapName', 'versionLabel' ]
    // remote http upload
    if (this.state.type !== 'local') {
      validateFields.push('protocolUrl')
      // remote ftp upload
      if (this.state.protocol === 'ftp') {
        validateFields.push('username', 'password')
      }
    }
    form.validateFields(validateFields, (errors, values) => {
      if (errors) {
        return
      }
      if (this.state.type === 'local' && this.state.resolve) {
        this.state.resolve(true)
        const fileCallback = notify.spin('上传中...')
        this.setState({ fileCallback })
        return
      }
      const isType = values.protocolUrl.match(/\.(jar|war)$/)
      if (!isType) {
        notify.warn('上传文件地址格式错误', '支持：' + wrapTypelist.join('、') + '文件格式')
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
        password: values.password,
      }

      const fileCallback = notify.spin('上传中...')

      this.setState({ fileCallback })
      const { isEdit } = this.props
      if (isEdit) {
        const temp = values.protocolUrl.split('/')
        const originalfile = temp[temp.lengh - 1].split('.')[0]
        updatePkg(currentRow.id, {
          originalfile,
        }, body, {
          success: {
            func: () => {
              notify.success('上传成功')
              func.getList()
              onCancel()
              uploadFile = false
            },
            isAsync: true,
          },
          failed: {
            func: err => {
              if (err.message.code === 409) {
                notify.warn('上传失败', '远程上传的文件和本地的包名称已存在')
                return
              }
              if (err.message) {
                if (err.message.message === 'LOGIN_ERROR') {
                  notify.warn('上传失败', '用户名或密码错误')
                  return
                }
                if (err.message.message === 'NETWORK_ERROR') {
                  notify.warn('上传失败', '地址有误')
                  return
                }
                if (err.message.message === 'NO_SUCH_FILE') {
                  notify.warn('上传失败', '未找到文件')
                  return
                }
              }
              if (err.message.code !== UPGRADE_EDITION_REQUIRED_CODE) {
                notify.warn('上传失败', err.message.message || err.message)
              }
            },
          },
          finally: {
            func: () => {
              this.state.fileCallback()
              this.setState({ fileCallback: false })
            },
          },
        })
        return
      }
      uploadWrap(query, body, {
        success: {
          func: () => {
            notify.success('上传成功')
            func.getList()
            onCancel()
            uploadFile = false
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.message.code === 409) {
              notify.warn('上传失败', '远程上传的文件和本地的包名称已存在')
              return
            }
            if (err.message) {
              if (err.message.message === 'LOGIN_ERROR') {
                notify.warn('上传失败', '用户名或密码错误')
                return
              }
              if (err.message.message === 'NETWORK_ERROR') {
                notify.warn('上传失败', '地址有误')
                return
              }
              if (err.message.message === 'NO_SUCH_FILE') {
                notify.warn('上传失败', '未找到文件')
                return
              }
            }
            if (err.message.code !== UPGRADE_EDITION_REQUIRED_CODE) {
              notify.warn('上传失败', err.message.message || err.message)
            }
          },
        },
        finally: {
          func: () => {
            this.state.fileCallback()
            this.setState({ fileCallback: false })
          },
        },

      })

      // "sourceURL": "xxxx",
      //   "userName": "xxxxx"
      //   "password": "xxxxx"

    })
  }
  changeprotocol = e => {
    this.setState({ protocol: e.target.value })
    this.props.form.resetFields([ 'protocolUrl' ])
  }
  changeTabs = type => {
    this.setState({ type })
  }
  checkNameVersion = () => {
    const { form, checkWrapName } = this.props
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
    this.wrapNameCheckTimeout = setTimeout(() => checkWrapName(query, {
      success: {
        func: ret => {
          if (Array.isArray(ret.data.pkgs)) {
            ret.data.pkgs.every(item => {
              if (item.fileTag === labelVersion && item.fileName === wrapName) {
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
            notify.info('应用包名称和版本重复')
            // notify.info('应用包名称和版本重复，继续上传会覆盖原有的')
          }
          this.setState({
            isEq,
            isPublished,
          })
        },
      },
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
    const { isEdit } = this.props
    if (!isEdit) {
      this.checkNameVersion()
    }
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
    const { isEdit } = this.props
    if (!isEdit) {
      this.checkNameVersion()
    }
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
    const fileType = value.match(/\.(jar|war)$/)
    if (!fileType) {
      return callback(`文件格式错误，如：${protocol}://www.demo.com/app.jar`)
    }
    return callback()
  }
  render() {
    const { form, func, loginUser, space, throwError,
      isEdit, visible, onCancel, currentRow } = this.props
    const { fileType, fileName, fileTag, isPublished, originalfile, isEq } = this.state
    // const isReq = type =='local' ? false : true
    const wrapName = form.getFieldProps('wrapName', {
      rules: [
        { whitespace: true },
        { validator: this.validateName },
      ],
      initialValue: isEdit ? currentRow.fileName : '',
    })
    const versionLabel = form.getFieldProps('versionLabel', {
      rules: [
        { whitespace: true },
        { validator: this.validateVersion },
      ],
      initialValue: isEdit ? currentRow.fileTag : '',
    })
    const protocolUrl = form.getFieldProps('protocolUrl', {
      rules: [
        { validator: this.checkedUrl },
      ],
    })
    const username = form.getFieldProps('username', {
      rules: [{ whitespace: true }],
    })
    const password = form.getFieldProps('password', {
      rules: [{ whitespace: true }],
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
    const query = {
      filename: fileName,
      filetag: fileTag,
      filetype: fileType,
      originalfile,
    }
    const actionUrl = isEdit ? `${API_URL_PREFIX}/pkg/${currentRow.id}/local?${toQuerystring({ originalfile })}` : `${API_URL_PREFIX}/pkg/local?${toQuerystring(query)}`
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
          notify.warn('上传文件格式错误', '支持：' + wrapTypelist.join('、') + '文件格式')
          return false
        }
        self.setState({ originalfile: file.name.split('.')[0], fileType: isType[1] })
        uploadFile = file.name // show upload file name
        // return true
        return new Promise(resolve => {
          self.setState({
            resolve,
          })
        })
      },
      onChange(e) {
        if (e.file.status === 'done') {
          self.state.fileCallback()
          notify.success('上传成功')
          uploadFile = false
          onCancel()
          func.getList()
        }
        if (e.file.status === 'error') {
          self.state.fileCallback()
          // let message = e.file.response.message
          if (typeof e.file.response.message === 'object') {
            // message = JSON.stringify(e.file.response.message)
            if (e.file.response.statusCode === UPGRADE_EDITION_REQUIRED_CODE ||
              isResourcePermissionError(e.file.response)) {
              throwError(e.file.response)
            } else {
              notify.warn('上传失败')
            }
          } else {
            notify.warn('上传失败')
            // notify.warn('上传失败', message)
          }
          // uploadFile = false
          // onCancel()
        }
      },
    }
    const ftpConfiged = !!loginUser.ftpConfig.addr
    // const defaultActiveKey = ftpConfiged ? 'local' : 'remote'
    return (
      <Modal
        title={isEdit ? '更新应用包' : '上传包文件'}
        visible={visible}
        // onOk={() => this.handleSubmit()}
        maskClosable={false}
        okText="立即提交"
        wrapClassName="uploadModal"
        footer={
          // 0: 'Unpublished'
          // 3: 'CheckReject'
          // 4: 'OffShelf'
          <div>
            <Button type="ghost" onClick={onCancel}>取消</Button>
            <Button disabled={isEdit && [ 0, 3, 4 ].indexOf(currentRow.publishStatus) < 0 || isEq} type="primary" onClick={() => this.handleSubmit()}>立即提交</Button>
          </div>
        }
        confirmLoading={!!this.state.fileCallback}
      >
        {
          isEdit &&
          <Alert message="应用包处于“未发布” “已拒绝” “已下架”状态时, 允许更新应用包" type="info" />
        }
        <Form>
          <Form.Item {...formItemLayout} label="应用包名称">
            <Input disabled={isEdit} {...wrapName} placeholder="请输入应用包名称" />
          </Form.Item>

          <Form.Item {...formItemLayout} label="版本标签">
            <Input disabled={isEdit} {...versionLabel} placeholder="请输入版本标签来标记此次上传文件" />
          </Form.Item>
          {
            isEq &&
            <div className="failedColor publishedHint"><Icon type="exclamation-circle-o" /> 注意：该应用包版本已存在，无法继续上传</div>
          }
          {/* {
            isPublished &&
            <div className="failedColor publishedHint"><Icon type="exclamation-circle-o" /> 注意：该应用包已发布至商店，本次上传将下架原版本，需重新发布</div>
            // <div className="failedColor publishedHint"><Icon type="exclamation-circle-o" /> 注意：该应用包已发布至商店，本次上传将下架原版本，需重新发布</div>
          } */}
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
                [
                  <Form.Item {...formItemLayout} label="用户名" key="ftp">
                    <Input {...username} style={{ width: '200px' }} placeholder="请输入用户名" />
                  </Form.Item>,
                  <Form.Item {...formItemLayout} label="密码" key="pass">
                    <Input {...password} style={{ width: '200px' }} placeholder="请输入密码" />
                  </Form.Item>,
                ]
                : null
              }
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  const { loginUser, current } = state.entities
  return {
    loginUser: loginUser.info,
    space: current.space,
  }
}

export default connect(mapStateToProps, {
  uploadWrap,
  updatePkg,
  checkWrapName,
  throwError,
})(Form.create()(UploadModal))
