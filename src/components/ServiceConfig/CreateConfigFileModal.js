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
import { connect } from 'react-redux'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { isResourcePermissionError } from '../../common/tools'
import { checkConfigNameExistence, dispatchCreateConfig } from "../../actions/configs"
// import { createSecretsConfig } from '../../actions/secrets_devops'
import { createSecret } from '../../actions/secrets'

import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import ConfigFileContent from './ConfigFileContent'

const FormItem = Form.Item
const createForm = Form.create

let CreateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: (<span style={{width:'100%'}}>
                  <div>请上传文件或直接输入内容</div>
                  <div>目前仅支持 properties/xml/json/conf/config/data/ini/txt/yaml/yml 格式</div>
                </span>),
      tempConfigDesc: "", // 缓存 便于切换之后回写
      method: 1,
    }
  },
  componentDidMount() {
    const configName = document.getElementById('configName')
    configName && configName.focus()
  },
  configNameExists(rule, value, callback) {
    const { checkConfigNameExistence, type, data, activeGroupName,
      configNameList, form} = this.props
    const _that = this
    if (!value) {
      callback([new Error('请输入配置文件名称')])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback([new Error('配置文件名称长度为 3-63 个字符')])
      return
    }
    if(/^[\u4e00-\u9fa5]+$/i.test(value)){
      callback([new Error('名称由英文、数字、点、下\中划线组成，且名称和后缀以英文或数字开头和结尾')])
      return
    }
    if (!validateServiceConfigFile(value)) {
      callback([new Error('名称由英文、数字、点、下\中划线组成，且名称和后缀以英文或数字开头和结尾')])
      return
    }
    clearTimeout(this.checkNameTimer)
    this.checkNameTimer = setTimeout(()=>{
      if(type === 'secrets' && !!data && !!activeGroupName) {
        const group = filter(data, { name: activeGroupName })[0]
        if(!!group && !!group.data && !!group.data[value]){
          callback([new Error('该名称已存在')])
        }else{
          callback()
        }
      } else {
        filter(configNameList, { name: value })[0] ? callback([new Error('该名称已存在')]) : callback()
      }
    },ASYNC_VALIDATOR_TIMEOUT)
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
    const { createConfig, scope: parentScope, createSecret,
      activeGroupName, dispatchCreateConfig } = this.props
    const { method } = this.state
    let arr = [ 'name', 'data' ]
    if (method === 1) {
      // arr = []
    } else if (method === 2) {
      arr = [ 'defaultBranch', 'projectId', 'filePath' ].concat(arr)
    }
    this.props.form.validateFields(arr, (errors, values) => {
      if (!!errors) {
        return
      }
      const tempValues = cloneDeep(values)
      if (tempValues.enable === true) {
        tempValues.enable = 1
      } else {
        tempValues.enable = 0
      }

      const { type, cluster, addKeyIntoSecret } = this.props
      let configfile = {
        group,
        cluster,
        name: tempValues.name,
        data: tempValues.data
      }
      const body = {}
      if (method === 2) {
        body.name = tempValues.name
        body.data = tempValues.data
        body.projectId = tempValues.projectId
        body.defaultBranch = tempValues.defaultBranch
        body.filePath = tempValues.filePath
        body.enable = tempValues.enable
      } else {
        body.groupFiles = tempValues.data
      }

      let self = this
      // const {parentScope} = this.props
      let notification = new NotificationHandler()
      if (type === 'secrets') {
        return addKeyIntoSecret({
          configName: values.name,
          configDesc: tempValues.data,
        })
      }
      //parentScope.props.createConfigFiles(configfile, {
      dispatchCreateConfig(configfile, body, {
        success: {
          func: () => {
            notification.success('创建配置文件成功')
            self.setState({
              filePath: '请上传文件或直接输入内容'
            })
            parentScope.setState({
              modalConfigFile: false,
            })
            setTimeout(() => self.props.form.resetFields(), 0)
            parentScope.props.addConfigFile(configfile)
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            let errorText
            if(isResourcePermissionError(res)){
              //403 没权限判断 在App/index中统一处理 这里直接返回
              return;
            }
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
    })
  },
  cancelModal(e) {
    const parentScope = this.props.scope
    this.setState({
      filePath: '请上传文件或直接输入内容'
    })
    this.props.form.resetFields()
    parentScope.createConfigModal(e, false)
  },
  onConfigChange(tempConfigDesc) {
    this.setState({
      tempConfigDesc
    })
  },
  getMethod(method) {
    this.setState({ method })
  },
  render() {
    const { type, form, configNameList, scope: parentScope } = this.props
    const { getFieldProps,isFieldValidating,getFieldError } = form
    const { filePath, tempConfigDesc } = this.state
    const configFileTipStyle = {
      color: "#16a3ea",
      height: '35px',
      lineHeight:'35px',
      border:'1px dashed #85d7fd',
      backgroundColor:'#d9edf6',
      borderRadius:'6px',
      textAlign:'center',
      paddingRight:'10px'
    }
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.configNameExists },
      ],
    });
    const descProps = getFieldProps('data', {
      rules: [
        { validator: this.configDescExists },
      ],
      onChange:this.onConfigChange
    });
    return(
      <Modal
        title={`添加${type === 'secrets' ? '加密对象': '配置文件'}`}
        wrapClassName="configFile-create-modal"
        className="configFile-modal"
        visible={this.props.visible}
        onOk={() => this.createConfigFile(this.props.groupName)}
        onCancel={(e) => this.cancelModal(e)}
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={configFileTipStyle}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle" style={{ marginRight: "10px" }} />
            {
              type === 'secrets'
              ? '即将保存一个加密对象，您可以在创建应用→添加服务时，配置管理或环境变量使用该对象'
              : '即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置'
            }
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label="名称">
              <Input
                className="configName"
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
              <ConfigFileContent
                getMethod={this.getMethod}
                configNameList={configNameList}
                filePath={filePath}
                form={form}
                tempConfigDesc={tempConfigDesc}
                descProps={descProps} />
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

CreateConfigFileModal = createForm()(CreateConfigFileModal)

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    cluster: cluster.clusterID
  }
}
export default connect(mapStateToProps,{
  checkConfigNameExistence, dispatchCreateConfig, createSecret
})(CreateConfigFileModal)
