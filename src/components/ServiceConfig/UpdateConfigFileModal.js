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
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Row, Icon, Input, Form, Modal, Spin, Button, Tooltip, Upload } from 'antd'
import NotificationHandler from '../../components/Notification'
import ConfigFileContent from './ConfigFileContent'
import { getConfig, updateConfig, dispatchUpdateConfig } from '../../actions/configs'
import { getSecretsConfig } from '../../actions/secrets_devops'
import indexIntl from './intl/indexIntl'

import  cloneDeep from 'lodash/cloneDeep'

const FormItem = Form.Item
const createForm = Form.create

let UpdateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: this.props.intl.formatMessage(indexIntl.filePathHint1),
      tempConfigDesc: '',
      method: this.props.defaultData && JSON.stringify(this.props.defaultData) !== "{}"
      && !!this.props.defaultData.projectId ? 2 : 1,
      nameDisabled: false,
    }
  },
  // componentWillReceiveProps(next){
  //   if(next.modalConfigFile) {
  //     const { getConfig, cluster, scope: parentScope } = next
  //     getConfig({
  //       configmap_name: parentScope.props.groupname,
  //       cluster_id: cluster,
  //       config_name: parentScope.state.configName,
  //     })
  //   }
  // },
  editConfigFile(group) {
    let notification = new NotificationHandler()
    const parentScope = this.props.scope
    const { dispatchUpdateConfig, intl } = this.props
    const { formatMessage } = intl
    const _this = this
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
      const { type, updateKeyIntoSecret } = this.props
      const tempValues = cloneDeep(values)

      if (tempValues.enable === true || tempValues.enable === 1) {
        tempValues.enable = 1
      } else {
        tempValues.enable = 0
      }

      let secret_body = {}
      const groups = {
        group,
        name: parentScope.state.configName,
        cluster: parentScope.props.cluster,
        desc: values.configDesc
      }
      // const query = {
      //   configmap_name: group,
      //   cluster_id: parentScope.props.cluster,
      //   config_name: parentScope.state.configName,
      // }
      let body = tempValues
      if (method === 2) {
        secret_body = body
      } else {
        body = { desc: tempValues.data }
        secret_body = {
          key: tempValues.name,
          value: tempValues.data,
        }
      }
      if (type === 'secrets') {
        return updateKeyIntoSecret(secret_body)
      }
      // updateConfig(query, body, {
      dispatchUpdateConfig(groups, body, {
        success: {
          func: () => {
            parentScope.setState({
              modalConfigFile: false,
              defaultData: {},
            })
            _this.setState({
              filePath: formatMessage(indexIntl.filePathHint1)
            })
            setTimeout(() => _this.props.form.resetFields())
            notification.success(formatMessage(indexIntl.updateConfigSucc))
          },
          isAsync: true
        }
      })
    })
  },
  configDescExists(rule, value, callback) {
    const { intl, form } = this.props
    const { formatMessage } = intl
    if (!value) {
      this.setState({
        filePath: formatMessage(indexIntl.filePathHint1)
      })
      callback([new Error(formatMessage(indexIntl.checkConfigDescErrorMsg))])
      return
    }
    callback()
  },
  closeModal() {
    const parentScope = this.props.scope
    const formatMessage = this.props.intl.formatMessage
    this.props.form.resetFields()
    parentScope.setState({modalConfigFile:false, updateConfigFileModalVisible: false, defaultData: {}})
    this.setState({
      filePath: formatMessage(indexIntl.filePathHint1)
    })
  },
  getMethod(method) {
    this.setState({ method }) // , nameDisabled: method === 2 })
  },
  render() {
    const { type, form, scope, defaultData, modalConfigFile, intl } = this.props
    const { formatMessage } = intl
    const { getFieldProps } = form
    const { filePath, tempConfigDesc, method, nameDisabled } = this.state
    const parentScope = scope
    const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } }
    const descProps = getFieldProps('data', {
      rules: [
        { validator: this.configDescExists },
      ],
      initialValue: parentScope.state.configtextarea || defaultData.data
    })
    const nameProps = getFieldProps('name', {
      initialValue: parentScope.state.configName
    });
    return(
      <Modal
        title={formatMessage(indexIntl.update) + (type === 'secrets' ? formatMessage(indexIntl.serectObj): formatMessage(indexIntl.configFile))}
        wrapClassName="configFile-create-modal"
        className="configFile-modal"
        visible={modalConfigFile}
        onOk={() => this.editConfigFile(parentScope.props.groupname)}
        onCancel={() => this.closeModal() }
        width="600px"
        >
        <div className="configFile-inf" style={{ padding: '0 10px' }}>
          <div className="configFile-tip" style={{ color: "#16a3ea", height: '35px' }}>
            &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
            {
              type === 'secrets'
              ? formatMessage(indexIntl.secretAlert)
              : formatMessage(indexIntl.serviceAlert)
            }
          </div>
          <Form horizontal>
            <FormItem  {...formItemLayout} label={
              <Tooltip title={formatMessage(indexIntl.configName)}>
                <span className="textoverflow">{formatMessage(indexIntl.configName)}</span>
              </Tooltip>
            }>
              <Input
                disabled={nameDisabled}
                className="configName" type="text" disabled {...nameProps}/>
            </FormItem>
            <FormItem {...formItemLayout} label={
              <Tooltip title={formatMessage(indexIntl.configDesc)}>
                <span className="textoverflow">{formatMessage(indexIntl.configDesc)}</span>
              </Tooltip>
            }>
              <ConfigFileContent
                isUpdate={true}
                getMethod={this.getMethod}
                filePath={filePath}
                form={form}
                tempConfigDesc={tempConfigDesc}
                method={method}
                defaultData={defaultData}
                descProps={descProps} />
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

UpdateConfigFileModal = createForm()(UpdateConfigFileModal)

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    cluster: cluster.clusterID
  }
}
export default connect(mapStateToProps,{
  getConfig,
  getSecretsConfig,
  updateConfig,
  dispatchUpdateConfig,
})(injectIntl(UpdateConfigFileModal, {
  withRef: true,
}))

