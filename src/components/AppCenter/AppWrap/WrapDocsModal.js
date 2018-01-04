/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Documents modal
 *
 * v0.1 - 2018-01-03
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Upload, Button } from 'antd'
import NotificationHandler from '../../../components/Notification'
import { API_URL_PREFIX } from '../../../constants'
import { isResourcePermissionError } from '../../../common/tools'
import { throwError } from '../../../actions'

const notify = new NotificationHandler()
const FormItem = Form.Item

const docsTypelist = ['docx', 'xlsx', 'doc', 'xls']

class WrapDocsModal extends React.Component {
  constructor() {
    super()
    this.cancelModal = this.cancelModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
  }
  
  state = {
    fileList: []
  }
  
  cancelModal() { 
    const { closeModal } = this.props
    closeModal()
  }
  
  confirmModal() {
    const {  fileList } = this.state
    if (!fileList || !fileList.length) {
      notify.warn('请选择附件')
      return
    }
    if (fileList.length > 20) {
      notify.warn('上传附件数需在20个以内')
      return 
    }
    fileList.forEach(item => {
      this.state[`${item.uid}-resolve`](true)
    })
  }
  
  render() {
    const { fileList, confirmLoading } = this.state
    const { visible, form, currentWrap, space, closeModal, callback, throwError } = this.props
    let fileName = ''
    if (fileList && fileList.length) {
      fileName = fileList[0]['name']
    }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }
    let headers = {}
    if (space && space.userName) {
      // 个人项目
      headers = {onbehalfuser: space.userName}
    }
    if (space && space.namespace !== 'default') {
      // 共享项目
      headers = {teamspace: space.namespace}
    }
    const props = {
      name: 'docs',
      headers,
      action: `${API_URL_PREFIX}/pkg/${currentWrap.id}/docs?file=${fileName}`,
      multiple: true,
      fileList,
      beforeUpload: (file)=> {
        let isType
        
        isType = file.name.toLowerCase().match(/\.(docx|xlsx|doc|xls)$/)
  
        if (!isType) {
          notify.error('上传文件格式错误', '支持：'+ docsTypelist.join('、')+'文件格式')
          return false
        }
        let newList = {
          uid: file.uid,
          name: file.name,
          size: file.size,
          type: file.type
        }
        this.setState(preState => ({
            fileList: [...preState.fileList, file]
        }))
        return new Promise(resolve => {
          this.setState({
            [`${file.uid}-resolve`]: resolve
          })
        })
      },
      onChange: e => {
        this.setState({
          fileList: e.fileList
        })
        if (e.file.status === 'uploading') {
          this.setState({
            confirmLoading: true
          })
        }
        if (e.file.status === 'done') {
          notify.success('上传成功')
          callback && callback()
          closeModal()
          this.setState({
            confirmLoading: false
          })
        }
        if (e.file.status === 'error') {
          let message = e.file.response.message
          if (typeof message === 'object') {
            if (isResourcePermissionError(e.file.response)) {
              throwError(e.file.response)
            }
          } else {
            notify.info(message)
          }
          this.setState({
            confirmLoading: false
          })
        }
      }
    };
    return (
      <Modal
        visible={visible}
        title="上传文件"
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        confirmLoading={confirmLoading}
      >
        <Form
          form={form}
        >
          <FormItem
            {...formItemLayout}
            label="相关文件"
          >
            <Upload {...props}>
              <Button type="ghost" style={{ marginRight: 10 }}>
                添加文件
              </Button>
              <span className="hintColor">
              如测试用例.xlsx/功能测试.docx...等
              </span>
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

WrapDocsModal = Form.create()(WrapDocsModal)

function mapStateToProps(state) {
  const { current } = state
  return {
    space: current && current.space
  }
}
export default connect(mapStateToProps, {
  throwError
})(WrapDocsModal)
