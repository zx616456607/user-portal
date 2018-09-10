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
import { Row, Icon, Input, Form, Modal, Spin, Button, Tooltip, Upload } from 'antd'
import NotificationHandler from '../../components/Notification'
import ConfigFileContent from './ConfigFileContent'
import { getConfig, updateConfig } from '../../actions/configs'
import { getSecretsConfig } from '../../actions/secrets_devops'

import  cloneDeep from 'lodash/cloneDeep'

const FormItem = Form.Item
const createForm = Form.create

let UpdateConfigFileModal = React.createClass({
  getInitialState() {
    return {
      filePath: '请上传文件或直接输入内容',
      tempConfigDesc: '',
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
    const parentScope = this.props.scope
    const { updateConfig } = this.props
    const _this = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const tempValues = cloneDeep(values)
      if (tempValues.enable === true) {
        tempValues.enable = 1
      } else {
        tempValues.enable = 0
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
      const query = {
        configmap_name: group,
        cluster_id: parentScope.props.cluster,
        config_name: parentScope.state.configName,
      }
      const body = tempValues
      updateConfig(query, body, {
      // parentScope.props.updateConfigName(groups, {
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
  render() {
    const { type, form, scope } = this.props
    const { getFieldProps } = form
    const { filePath, tempConfigDesc } = this.state
    const parentScope = scope
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const descProps = getFieldProps('data', {
      rules: [
        { validator: this.configDescExists },
      ],
      initialValue: parentScope.state.configtextarea
    })
    const nameProps = getFieldProps('name', {
      initialValue: parentScope.state.configName
    });
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
              <Input
                className="configName" type="text" disabled {...nameProps}/>
            </FormItem>
            <FormItem {...formItemLayout} label="内容">
              <ConfigFileContent
                filePath={filePath}
                form={form}
                tempConfigDesc={tempConfigDesc}
                method={this.props.method}
                defaultData={this.props.defaultData}
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
})(UpdateConfigFileModal)

