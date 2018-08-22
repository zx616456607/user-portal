/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group: create modal
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { Row, Icon, Input, Form, Modal, Spin, Button, Tooltip, Upload } from 'antd'
import NotificationHandler from '../../components/Notification'
import ConfigFileContent from './ConfigFileContent'

const FormItem = Form.Item
const createForm = Form.create

let UpdateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: '请上传文件或直接输入内容'
    }
  },
  editConfigFile(group) {
    const parentScope = this.props.scope
    const _this = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { type, updateKeyIntoSecret } = this.props
      if (type === 'secrets') {
        return updateKeyIntoSecret(values)
      }
      let notification = new NotificationHandler()
      const groups = {
        group, name: parentScope.state.configName,
        cluster: parentScope.props.cluster,
        desc: values.configDesc
      }
      parentScope.props.updateConfigName(groups, {
        success: {
          func: () => {
            parentScope.setState({
              modalConfigFile: false,
            })
            _this.setState({
              filePath: "请上传文件或直接输入内容"
            })
            setTimeout(() => _this.props.form.resetFields())
            notification.success('修改配置文件成功')
          },
          isAsync: true
        }
      })
    })
  },
  configDescExists(rule, value, callback) {
    const form = this.props.form;
    if (!value) {
      this.setState({
        filePath: '请上传文件或直接输入内容'
      })
      callback([new Error('内容不能为空，请重新输入内容')])
      return
    }
    callback()
  },
  closeModal() {
    const parentScope = this.props.scope
    this.props.form.resetFields()
    parentScope.setState({modalConfigFile:false, updateConfigFileModalVisible: false})
    this.setState({
      filePath: '请上传文件或直接输入内容'
    })
  },
  beforeUpload(file) {
    const fileInput = this.uploadInput.refs.upload.refs.inner.refs.file
    const fileType = fileInput.value.substr(fileInput.value.lastIndexOf('.') + 1)
    const notify = new NotificationHandler()
    if(!/xml|json|conf|config|data|ini|txt|properties|yaml|yml/.test(fileType)) {
      notify.info('目前仅支持 properties/xml/json/conf/config/data/ini/txt/yaml/yml 格式', true)
      return false
    }
    const self = this
    const fileName = fileInput.value.substr(fileInput.value.lastIndexOf('\\') + 1)
    self.setState({
      disableUpload: true,
      filePath: '上传文件为 ' + fileName
    })
    notify.spin('读取文件内容中，请稍后')
    const fileReader = new FileReader()
    fileReader.onerror = function(err) {
      self.setState({
        disableUpload: false,
      })
      notify.close()
      notify.error('读取文件内容失败')
    }
    fileReader.onload = function() {
      self.setState({
        disableUpload: false
      })
      notify.close()
      notify.success('文件内容读取完成')
      self.props.form.setFieldsValue({
        configDesc: fileReader.result.replace(/\r\n/g, '\n')
      })
    }
    fileReader.readAsText(file)
    return false
  },
  render() {
    const { type, form } = this.props
    const { getFieldProps } = form
    const parentScope = this.props.scope
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const descProps = getFieldProps('configDesc', {
      rules: [
        { validator: this.configDescExists },
      ],
      initialValue: parentScope.state.configtextarea
    })
    return(
      <Modal
        title={`修改${type === 'secrets' ? '加密对象': '配置文件'}`}
        wrapClassName="configFile-create-modal"
        className="configFile-modal"
        visible={this.props.modalConfigFile}
        onOk={() => this.editConfigFile(parentScope.props.groupname)}
        onCancel={() => this.closeModal() }
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={{ color: "#16a3ea", height: '35px' }}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
            即将保存一个配置文件，您可以在创建应用 → 添加服务时，关联使用该配置
            {
              type === 'secrets'
              ? '即将保存一个加密对象，您可以在创建应用→添加服务时，配置管理或环境变量使用该对象'
              : '即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置'
            }
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label="名称">
              <Input type="text" disabled value={parentScope.state.configName}/>
            </FormItem>
            <FormItem>
              <Upload beforeUpload={(file) => this.beforeUpload(file)} showUploadList={false} ref={(instance) => this.uploadInput = instance}>
                <span style={{width: '325px', display:'inline-block'}}>{this.state.filePath}</span>
                <Button type="ghost" style={{marginLeft: '10px'}} disabled={this.state.disableUpload}>
                  <Icon type="upload" /> 读取文件内容
                </Button>
              </Upload>
            </FormItem>
            <FormItem {...formItemLayout} label="内容">
              <ConfigFileContent
                descProps={descProps} />
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

UpdateConfigFileModal = createForm()(UpdateConfigFileModal)

export default UpdateConfigFileModal
