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
import utf8Bytes from 'utf8-bytes'

const notify = new NotificationHandler()
const FormItem = Form.Item

function noop() {
  return false
}

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
    const { closeModal, currentWrap, callback } = this.props
    const {  fileList } = this.state
    if (!fileList || !fileList.length) {
      notify.warn('请选择附件')
      return
    }
    if (fileList.length > 20) {
      notify.warn('上传附件数需在20个以内')
      return
    }
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('docs', file);
    });
    this.setState({
      confirmLoading: true
    })
    const _this = this
    notify.spin('文件上传中')
    fetch(`${API_URL_PREFIX}/pkg/${currentWrap.id}/docs`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }).then(function(response) {
      _this.setState({
        confirmLoading: false
      })
      if (response.status >= 400 && response.status < 500) {
        if (isResourcePermissionError(response)) {
          throwError(response)
          return
        }
        notify.warn('上传失败')
        return
      }
      notify.close()
      notify.success('上传成功')
      callback && callback()
      closeModal()
    }).catch(function() {
      _this.setState({
        confirmLoading: false
      })
      notify.close()
      notify.error('上传失败')
      closeModal()
    })
  }

  renderFooter = () => {
    const { confirmLoading } = this.state
    return [
      <Button type="ghost" disabled={confirmLoading} onClick={this.cancelModal}>取消</Button>,
      <Button type="primary" loading={confirmLoading} onClick={this.confirmModal}>确定</Button>
    ]
  }

  render() {
    const { fileList, confirmLoading } = this.state
    const { visible, form, currentWrap, space } = this.props
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
      disabled: confirmLoading,
      fileList,
      beforeUpload: file=> {
        const fileNameBytes = utf8Bytes(file.name)
        if (fileNameBytes.length > 256) {
          return notify.warn('文件名称不能超过 256 个字节')
        }
        this.setState(({ fileList }) => ({
            fileList: [...fileList, file]
        }))
        return false
      },
      onRemove: confirmLoading ? noop : (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      }
    };
    return (
      <Modal
        visible={visible}
        title="上传附件"
        closable={!confirmLoading}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        confirmLoading={confirmLoading}
        footer={this.renderFooter()}
      >
        <Form
          form={form}
        >
          <FormItem
            {...formItemLayout}
            label="相关附件"
          >
            <Upload {...props}>
              <Button type="ghost" style={{ marginRight: 10 }} disabled={confirmLoading}>
                添加附件
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
