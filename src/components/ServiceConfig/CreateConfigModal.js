
import { Modal, Button,Input, Form } from 'antd'
import React from 'react'

import { USERNAME_REG_EXP_NEW } from '../../constants'


let CreateConfigModal = React.createClass({
  getInitialState() {
    return {
      myTextInput: '',
    }
  },
  createModalInput(e) {
    this.setState({
      myTextInput: e.target.value
    })
  },
  btnCreateConfigGroup() {
    let notification = new NotificationHandler()
    let groupName = this.state.myTextInput
    const parentScope = this.props.scope
    if (!groupName) {
      notification.error('请输入配置组名称')
      return
    }
    if (!validateK8sResource(groupName)) {
      notification.error('名称须以字母开头，由小写英文字母、数字和连字符（-）组成，长度为 3-63 个字符')
      return
    }
    let self = this
    const { cluster } = parentScope.props
    let configs = {
      groupName,
      cluster
    }
    this.props.scope.setState({ createModal: false})
    parentScope.props.createConfigGroup(configs, {
      success: {
        func: () => {
          notification.success('创建成功')
          self.setState({
            myTextInput: ''
          })
          parentScope.props.loadConfigGroup(cluster)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let errorText
          switch (res.message.code) {
            case 403: errorText = '添加的配置过多'; break
            case 409: errorText = '配置组已存在'; break
            case 500: errorText = '网络异常'; break
            default: errorText = '缺少参数或格式错误'
          }
          Modal.error({
            title: '创建配置组',
            content: (<h3>{errorText}</h3>),
          });
        }
      }
    })

  },
  configNameExists(rule, value, callback) {
    console.log('value', value)
    if (!value) {
      callback([new Error('请输入配置组名称')])
      return
    }
    const { checkTeamName } = this.props.funcs
    if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback(new Error('以[a~z]开头，允许[0~9]、[-]，长度5~40个字符'))
      return
    }
    callback()
    return
  },
  render () {
    console.log('comsofjsdojdosfjosfjdsfdfjols', this.props)
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.configNameExists },
      ],
    })
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    }
    return (
      <Modal
        title="创建配置组"
        wrapClassName="server-create-modal"
        maskClosable={false}
        visible={this.props.scope.state.createModal}
        onOk={() => this.btnCreateConfigGroup()}
        onCancel={(e) => parentScope.configModal(false)}
        >
        <Form horizontal key='modalForm'>
          <Form.Item
            {...formItemLayout}
            label="名称"
            hasFeedback
            key='nameInputForm'
            >
            <Input type="text" {...nameProps} id="newConfigName" autoComplete='off' size="large" style={{ width: '80%' }}  value={this.state.myTextInput} onPressEnter={() => this.btnCreateConfigGroup()} onChange={(e) => this.createModalInput(e)} />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
})

CreateConfigModal = createForm()(CreateConfigModal)

export default CreateConfigModal