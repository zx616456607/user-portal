import { Button, Form, Input, Row, Col, Modal, Select } from 'antd'
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { USERNAME_REG_EXP_NEW, ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import { isResourcePermissionError } from '../../common/tools'
import { validateK8sResource } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'
import { setConfigMapLabel } from '../../actions/configs'
import filter from 'lodash/filter'
import serviceIntl from './intl/serviceIntl'
import indexIntl from './intl/indexIntl'
const createForm = Form.create
const FormItem = Form.Item
const Option = Select.Option

let CreateConfigModal = React.createClass({
  btnCreateConfigGroup() {
    const { cluster, scope: parentScope, setConfigMapLabel, intl } = this.props
    const { formatMessage } = intl
    const { currentGroup, groupEdit } = parentScope.state
    const { updateConfigAnnotations } = this.props
    let notification = new NotificationHandler()
    let self = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const groupName = values.newConfigName
      const groupSort = values.newConfigSort
      if (!validateK8sResource(groupName)) {
        notification.error(formatMessage(serviceIntl.errorK8sMessage))
        return
      }
      let configs = {
        groupName: groupEdit ? currentGroup : groupName,
        cluster,
        configlabels: groupSort.toString()
      }
      if (!groupEdit) {
        // data: configMaps -> configs -> revert configs
        parentScope.props.createConfigGroup(configs, { // cluster, { name: groupName, configlabels: groupSort, data: []}, {
          success: {
            func: () => {
              notification.success(formatMessage(serviceIntl.createSucc))
              self.props.form.resetFields()
              parentScope.loadData()
              parentScope.setState({ createModal: false })
            },
            isAsync: true
          },
          failed: {
            func: res => {
              // parentScope.setState({ createModal: false })
              let errorText
              if (isResourcePermissionError(res)) {
                //403 没权限判断 在App/index中统一处理 这里直接返回
                return
              }
              switch (res.message.code) {
                case 409:
                  errorText = formatMessage(serviceIntl.error409Message);break
                case 500:
                  errorText = formatMessage(serviceIntl.error500Message);break
                default:
                  errorText = formatMessage(serviceIntl.defaultErrorMessage)
              }
              Modal.error({
                title: formatMessage(indexIntl.createGroup),
                content: <h3>{errorText}</h3>
              })
            }
          }
        })
      } else {
        updateConfigAnnotations(configs, {
          // setConfigMapLabel(currentGroup, cluster, { configlabels: groupSort }, {
          success: {
            func: res => {
              notification.success(formatMessage(serviceIntl.editClassSucc))
              self.props.form.resetFields()
              parentScope.loadData()
              parentScope.setState({ createModal: false })
            },
            isAsync: true
          },
          failed: {
            func: res => {
              parentScope.setState({ createModal: false })
              let errorText
              switch (res.message.code) {
                case 403:
                  errorText = formatMessage(serviceIntl.error403Message);;break
                case 409:
                  errorText = formatMessage(serviceIntl.error409Message);;break
                case 500:
                  errorText = formatMessage(serviceIntl.error500Message);;break
                default:
                  errorText = formatMessage(serviceIntl.defaultErrorMessage)
              }
              Modal.error({
                title: formatMessage(serviceIntl.editConfigGroupClass),
                content: <h3>{errorText}</h3>
              })
            }
          }
        })
      }
    })
  },

  configNameExists(rule, value, callback) {
    const { scope: parentScope, intl } = this.props
    const { formatMessage } = intl
    const { checkConfigNameExistence, cluster } = parentScope.props
    const { groupEdit } = parentScope.state
    if (groupEdit) {
      return callback()
    }
    if (!value) {
      callback([new Error(formatMessage(indexIntl.checkNameErrorMsg01))])
      return
    }
    if (value.length < 3 || value.length > 63) {
      callback(formatMessage(indexIntl.checkNameErrorMsg02))
      return
    }
    if (!/^[a-z]/.test(value)) {
      callback(formatMessage(indexIntl.checkNameErrorMsg03))
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback(formatMessage(indexIntl.checkNameErrorMsg04))
      return
    }
    if (!validateK8sResource(value)) {
      callback(formatMessage(indexIntl.checkNameErrorMsg05))
      return
    }
    clearTimeout(this.configNameTimeout)
    this.configNameTimeout = setTimeout(() => {
      checkConfigNameExistence(cluster, value, {
        success: {
          func: res => {
            if (res.data.existence) {
              callback(formatMessage(indexIntl.checkNameErrorMsg06))
            } else {
              callback()
            }
          },
          isAsync: true
        },
        failed: {
          func: res => {
            callback(res.message.message || res.message)
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  configSortExists(rules, value, callback) {
    callback()
  },
  handCancel(parentScope) {
    parentScope.configModal(false, false)
    this.props.form.resetFields()
  },
  render() {
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue } = this.props.form
    const parentScope = this.props.scope
    const { configGroup, labelWithCount, visible, intl } = this.props
    const { formatMessage } = intl
    const { currentGroup, groupEdit } = parentScope.state
    const curr = filter(configGroup, { name: currentGroup })[0]
    let currentSortArray = [] // curr && curr.configlabels || []
    configGroup.length > 0 && configGroup.forEach(item => {
      if (item.name === currentGroup && item.annotations && item.annotations.length) {
        currentSortArray = item.annotations
      }
    })
    const nameProps = getFieldProps('newConfigName', {
      rules: [{ validator: this.configNameExists }],
      initialValue: groupEdit ? currentGroup : ''
    })
    const sortProps = getFieldProps('newConfigSort', {
      rules: [{ message: formatMessage(serviceIntl.needClassifyMsg), type: 'array' }, { validator: this.configSortExists }],
      initialValue: groupEdit ? currentSortArray : []
    })
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    let children = []
    labelWithCount.length > 0 && labelWithCount.forEach(item => {
      children.push(<Option key={item.labelName}>{item.labelName}</Option>)
    })
    return <Modal title={groupEdit ? formatMessage(serviceIntl.editConfigGroupClass) : formatMessage(indexIntl.createGroup)} wrapClassName="server-create-modal" maskClosable={false} visible={visible} onOk={() => this.btnCreateConfigGroup()} onCancel={() => this.handCancel(parentScope)}>
        <Form horizontal>
          <Row style={{ paddingTop: '10px' }}>
            <Col span="19">
              <FormItem {...formItemLayout} label={formatMessage(serviceIntl.groupClassify)}>
                <Select {...sortProps} tags multiple placeholder={formatMessage(serviceIntl.classifyPlaceholder)} notFoundContent="">
                  {children}
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label={formatMessage(indexIntl.configGroupName)} hasFeedback={!!getFieldValue('newConfigName')} help={isFieldValidating('newConfigName') ? formatMessage(serviceIntl.checkouting) : (getFieldError('newConfigName') || []).join(', ')}>
                <Input {...nameProps} disabled={groupEdit} type="text" id="newConfigName" onPressEnter={() => this.btnCreateConfigGroup()} />
              </FormItem>
            </Col>

          </Row>
        </Form>
      </Modal>
  }
})

CreateConfigModal = createForm()(CreateConfigModal)

function mapStateToProps(state, props) {
  const { entities, secrets, apps } = state
  const { current } = entities
  const { cluster } = current
  return {
    cluster: cluster.clusterID
  }
}

export default connect(mapStateToProps, {
  setConfigMapLabel
})(injectIntl(CreateConfigModal, {
  withRef: true
}))