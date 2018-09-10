import { Button, Form, Input, Row, Col, Modal, Select } from 'antd';
import React from 'react'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import { isResourcePermissionError } from '../../common/tools'
import { validateK8sResource } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'
import { setConfigMapLabel } from '../../actions/configs'
import filter from 'lodash/filter'
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

let CreateConfigModal = React.createClass({
  btnCreateConfigGroup() {
    const { cluster, scope: parentScope, setConfigMapLabel } = this.props
    const { currentGroup, groupEdit } = parentScope.state;
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
        notification.error('由小写字母、数字和连字符（-）组成')
        return
      }
      let configs = {
        // groupName: groupEdit ? currentGroup : groupName,
        // cluster,
        // configlabels:groupSort.toString()
      }
      if (!groupEdit) {
        // data: configMaps -> configs
        parentScope.props.createConfigGroup(cluster, { name: groupName, configlabels: groupSort, data: []}, {
          success: {
            func: () => {
              notification.success('创建成功')
              self.props.form.resetFields()
              parentScope.loadData()
              parentScope.setState({ createModal: false })
            },
            isAsync: true
          },
          failed: {
            func: (res) => {
              // parentScope.setState({ createModal: false })
              let errorText
              if(isResourcePermissionError(res)){
                //403 没权限判断 在App/index中统一处理 这里直接返回
                return;
              }
              switch (res.message.code) {
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
      } else {
       // updateConfigAnnotations(configs,{
        setConfigMapLabel(currentGroup, cluster, { configlabels: groupSort }, {
          success: {
            func: res => {
              notification.success('修改分类成功')
              self.props.form.resetFields()
              parentScope.loadData()
              parentScope.setState({createModal: false})
            },
            isAsync: true
          },
          failed: {
            func: (res) => {
              parentScope.setState({ createModal: false })
              let errorText
              switch (res.message.code) {
                case 403: errorText = '未授权修改配置分类'; break
                case 409: errorText = '配置组已存在'; break
                case 500: errorText = '网络异常'; break
                default: errorText = '缺少参数或格式错误'
              }
              Modal.error({
                title: '修改分类',
                content: (<h3>{errorText}</h3>),
              });
            }
          }
        })
      }
    })
  },

  configNameExists(rule, value, callback) {
    const parentScope = this.props.scope
    const { checkConfigNameExistence, cluster } = parentScope.props
    const { groupEdit } = parentScope.state;
    if (groupEdit) {
      return callback()
    }
    if (!value) {
      callback([new Error('请输入配置组名称')])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback('名称长度为 3-63 个字符')
      return
    }
    if(!/^[a-z]/.test(value)){
      callback('名称须以小写字母开头')
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback('名称须以小写字母或数字结尾')
      return
    }
    if (!validateK8sResource(value)) {
      callback('由小写字母、数字和连字符（-）组成')
      return
    }
    clearTimeout(this.configNameTimeout)
    this.configNameTimeout = setTimeout(() => {
      checkConfigNameExistence(cluster, value, {
        success: {
          func: res => {
            if (res.data.existence) {
              callback('配置组名称重复')
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
     parentScope.configModal(false,false)
     this.props.form.resetFields()
  },
  render() {
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue } = this.props.form
    const parentScope = this.props.scope
    const { configGroup, labelWithCount, visible } = this.props
    const { currentGroup, groupEdit } = parentScope.state;
    const curr = filter(configGroup, { name: currentGroup })[0]
    let currentSortArray = curr && curr.configlabels || []
    // configGroup.length > 0 && configGroup.forEach(item => {
    //   if ((item.name === currentGroup) && item.annotations && item.annotations.length) {
    //     currentSortArray = item.annotations
    //   }
    // })
    const nameProps = getFieldProps('newConfigName', {
      rules: [
        { validator: this.configNameExists },
      ],
      initialValue: groupEdit ? currentGroup : ''
    });
    const sortProps = getFieldProps('newConfigSort', {
      rules: [
        { message: '请选择分类', type: 'array' },
        { validator: this.configSortExists }
      ],
      initialValue:groupEdit ? currentSortArray : []
    })
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    let children = [];
    labelWithCount.length > 0 && labelWithCount.forEach(item => {
      children.push(<Option key={item.labelName}>{item.labelName}</Option>);
    })
    return (
      <Modal
        title={groupEdit ? "修改分类" : '创建配置组'}
        wrapClassName="server-create-modal"
        maskClosable={false}
        visible={visible}
        onOk={() => this.btnCreateConfigGroup()}
        onCancel={() => this.handCancel(parentScope)}
        >
        <Form horizontal>
          <Row style={{ paddingTop: '10px' }}>
            <Col span="19">
              <FormItem
                {...formItemLayout}
                label="配置分类"
              >
                <Select {...sortProps} tags multiple placeholder="输入内容查找或创建分类" notFoundContent="">
                  {children}
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="配置组名称"
                hasFeedback={!!getFieldValue('newConfigName')}
                help={isFieldValidating('newConfigName') ? '校验中...' : (getFieldError('newConfigName') || []).join(', ')}
                >
                <Input {...nameProps} disabled={groupEdit} type="text" id="newConfigName" onPressEnter={()=> this.btnCreateConfigGroup()} />
              </FormItem>
            </Col>

          </Row>
        </Form>
      </Modal>
    );
  },
});

CreateConfigModal = createForm()(CreateConfigModal)

function mapStateToProps(state, props) {
  const { entities, secrets, apps } = state
  const { current } = entities
  const { cluster } = current
  return {
    cluster: cluster.clusterID,
  }
}

export default connect(mapStateToProps, {
  setConfigMapLabel,
})(CreateConfigModal)

