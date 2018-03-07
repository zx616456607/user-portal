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
import { validateServiceConfigFile } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'

const FormItem = Form.Item
const createForm = Form.create

let CreateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: '请上传文件或直接输入内容'
    }
  },
  componentDidMount() {
    const configName = document.getElementById('configName')
    configName && configName.focus()
  },
  configNameExists(rule, value, callback) {
    const form = this.props.form;
    if (!value) {
      callback([new Error('请输入配置文件名称')])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback([new Error('配置文件名称长度为 3-63 个字符')])
      return
    }
    if(/^[\u4e00-\u9fa5]+$/i.test(value)){
      callback([new Error('名称由英文、数字、点、下\中划线组成, 且名称和后缀以英文或数字开头和结尾')])
      return
    }
    if (!validateServiceConfigFile(value)) {
      callback([new Error('名称由英文、数字、点、下\中划线组成, 且名称和后缀以英文或数字开头和结尾')])
      return
    }
    callback()
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

  createConfigFile(group) {
    const parentScope = this.props.scope
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { type, addKeyIntoSecret } = this.props
      if (type === 'secrets') {
        return addKeyIntoSecret(values)
      }
      let configfile = {
        group,
        cluster: parentScope.props.cluster.clusterID,
        name: values.configName,
        desc: values.configDesc
      }
      let self = this
      // const {parentScope} = this.props
      let notification = new NotificationHandler()
      parentScope.props.createConfigFiles(configfile, {
        success: {
          func: () => {
            notification.success('创建配置文件成功')
            setTimeout(() => self.props.form.resetFields(), 0)
            parentScope.props.addConfigFile(configfile)
            self.setState({
              filePath: '请上传文件或直接输入内容'
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            let errorText
            switch (res.message.code) {
              case 403: errorText = '添加配置文件过多'; break
              case 409: errorText = '配置已存在'; break
              case 500: errorText = '网络异常'; break
              case 412: return
              default: errorText = '缺少参数或格式错误'
            }
            self.setState({
              filePath: '请上传文件或直接输入内容'
            })
            notification.error('添加配置文件失败', errorText)
          }
        }
      })
      parentScope.setState({
        modalConfigFile: false,
      })
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
        disableUpload: false,
      })
      notify.close()
      notify.success('文件内容读取完成')
      self.props.form.setFieldsValue({
        configDesc: fileReader.result.replace(/\r\n/g, '\n'),
        configName: fileName.split('.')[0]
      })
    }
    fileReader.readAsText(file)
    return false
  },
  cancelModal(e) {
    const parentScope = this.props.scope
    this.setState({
      filePath: '请上传文件或直接输入内容'
    })
    this.props.form.resetFields()
    parentScope.createConfigModal(e, false)
  },
  render() {
    const { type, form } = this.props
    const { getFieldProps } = form
    const parentScope = this.props.scope
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const nameProps = getFieldProps('configName', {
      rules: [
        { validator: this.configNameExists },
      ],
    });
    const descProps = getFieldProps('configDesc', {
      rules: [
        { validator: this.configDescExists },
      ]
    });
    return(
      <Modal
        title={`添加${type === 'secrets' ? '加密对象': '配置文件'}`}
        wrapClassName="configFile-create-modal"
        className="configFile-modal"
        visible={parentScope.state.modalConfigFile}
        onOk={() => this.createConfigFile(this.props.groupName)}
        onCancel={(e) => this.cancelModal(e)}
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={{ color: "#16a3ea", height: '35px' }}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
            {
              type === 'secrets'
              ? '即将保存一个加密对象，您可以在创建应用→添加服务时，配置管理或环境变量使用该对象'
              : '即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置'
            }
          </div>
          <Form horizontal>
            <FormItem>
              <Upload beforeUpload={(file) => this.beforeUpload(file)} showUploadList={false} style={{marginLeft: '38px'}} ref={(instance) => this.uploadInput = instance}>
                <Button type="ghost" style={{marginLeft: '5px'}} disable={this.state.disableUpload}>
                  <Icon type="upload" /> 读取文件内容
                </Button>
                <span style={{width: '325px', display:'inline-block', textAlign: 'right'}}>{this.state.filePath}</span>
              </Upload>
            </FormItem>
            <FormItem  {...formItemLayout} label="名称">
              <Input
                type="text"
                {...nameProps}
                className="nameInput"
                placeholder={
                  type === 'secrets'
                  ? '如 My-PassWord'
                  : '如 My-Config'
                }
              />
            </FormItem>
            <FormItem {...formItemLayout} label="内容">
              <Input type="textarea" style={{ minHeight: '300px' }} {...descProps}/>
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

CreateConfigFileModal = createForm()(CreateConfigFileModal)

export default CreateConfigFileModal
