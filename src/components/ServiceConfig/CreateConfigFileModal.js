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
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { isResourcePermissionError } from '../../common/tools'
import { checkConfigNameExistence, dispatchCreateConfig } from "../../actions/configs"
// import { createSecretsConfig } from '../../actions/secrets_devops'
import { createSecret } from '../../actions/secrets'
import indexIntl from './intl/indexIntl.js'
import serviceIntl from './intl/serviceIntl.js'

import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import ConfigFileContent from './ConfigFileContent'

const FormItem = Form.Item
const createForm = Form.create

let CreateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: (<span style={{width:'100%'}}>
                  <div>{this.props.intl.formatMessage(indexIntl.filePathHint1)}</div>
                  <div>{this.props.intl.formatMessage(indexIntl.filePathHint2)}</div>
                </span>),
      tempConfigDesc: "", // 缓存 便于切换之后回写
      method: 1,
      nameDisabled: false,
    }
  },
  componentDidMount() {
    const configName = document.getElementById('configName')
    configName && configName.focus()
  },
  configNameExists(rule, value, callback) {
    const { intl } = this.props
    const { formatMessage } = intl
    const { checkConfigNameExistence, type, data, activeGroupName,
      configNameList, form} = this.props
    const _that = this
    if (!value) {
      callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg1))])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg2))])
      return
    }
    if(/^[\u4e00-\u9fa5]+$/i.test(value)){
      callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg3))])
      return
    }
    if (!validateServiceConfigFile(value)) {
      callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg4))])
      return
    }
    clearTimeout(this.checkNameTimer)
    this.checkNameTimer = setTimeout(()=>{
      if(type === 'secrets' && !!data && !!activeGroupName) {
        const group = filter(data, { name: activeGroupName })[0]
        if(!!group && !!group.data && !!group.data[value]){
          callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg5))])
        }else{
          callback()
        }
      } else {
        filter(configNameList, { name: value })[0] ? callback([new Error(formatMessage(indexIntl.checkConfigNameErrorMsg5))]) : callback()
      }
    },ASYNC_VALIDATOR_TIMEOUT)
  },
  configDescExists(rule, value, callback) {
    const form = this.props.form;
    const formatMessage = this.props.intl
    if (!value) {
      this.setState({
        filePath: formatMessage(indexIntl.filePathHint1)
      })
      callback([new Error(formatMessage(indexIntl.checkConfigDescErrorMsg))])
      return
    }
    callback()
  },

  createConfigFile(group) {
    const { createConfig, scope: parentScope, createSecret,
      activeGroupName, dispatchCreateConfig, intl } = this.props
    const { formatMessage } = intl
    const { method } = this.state
    let arr = [ 'name', 'data' ]
    if (method === 1) {
      // arr = []
    } else if (method === 2) {
      arr = [ 'defaultBranch', 'projectId', 'projectName', 'filePath', 'enable' ].concat(arr)
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
        data: tempValues.data,
        projectName: tempValues.projectName,
        defaultBranch: tempValues.defaultBranch,
      }
      let body = {}
      let secret_body = {}
      if (method === 2) {
        body = tempValues
        secret_body = body
      } else {
        body.desc = tempValues.data
        secret_body = {
          key: tempValues.name,
          value: tempValues.data,
        }
      }

      let self = this
      // const {parentScope} = this.props
      let notification = new NotificationHandler()
      if (type === 'secrets') {
        return addKeyIntoSecret(secret_body)
      }
      //parentScope.props.createConfigFiles(configfile, {
      dispatchCreateConfig(configfile, body, {
        success: {
          func: () => {
            notification.success(formatMessage(intl.createConfigSucc))
            self.setState({
              filePath: formatMessage(intl.filePathHint1)
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
              case 403: errorText = formatMessage(indexIntl.createConfig403Error); break
              case 409: errorText = formatMessage(indexIntl.createConfig409Error); break
              case 500: errorText = formatMessage(indexIntl.createConfig500Error); break
              case 412: return
              default: errorText = formatMessage(serviceIntl.defaultErrorMessage)
            }
            self.setState({
              filePath: formatMessage(indexIntl.filePathHint1)
            })
            notification.error(formatMessage(indexIntl.createConfigErrorTitle), errorText)
          }
        }
      })
    })
  },
  cancelModal(e) {
    const parentScope = this.props.scope
    this.setState({
      filePath: formatMessage(indexIntl.filePathHint1)
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
    this.setState({ method, nameDisabled: method === 2 })
  },
  render() {
    const { type, form, configNameList, scope: parentScope } = this.props
    const { getFieldProps,isFieldValidating,getFieldError } = form
    const { filePath, tempConfigDesc, nameDisabled } = this.state
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
        title={formatMessage(indexIntl.createConfigModalTitle, { name: type === 'secrets' ? '加密对象': '配置文件'})}
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
              ? formatMessage(indexIntl.secretAlert)
              : formatMessage(indexIntl.serviceAlert)
            }
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label={formatMessage(indexIntl.configName)}>
              <Input
                disabled={nameDisabled}
                className="configName"
                type="text"
                {...nameProps}
                className="nameInput"
                placeholder={
                  type === 'secrets'
                  ? formatMessage(indexIntl.configNamePlaceHolder, { name : 'My-PassWord'})
                  : formatMessage(indexIntl.configNamePlaceHolder, { name : 'My-Config'})
                }

              />
            </FormItem>
            <FormItem {...formItemLayout} label={formatMessage(indexIntl.configDesc)}>
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
})(injectIntl(CreateConfigFileModal, {
  withRef: true,
}))
