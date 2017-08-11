import { Button, Form, Input, Row, Col, Modal, Select } from 'antd';
import React from 'react'
import { USERNAME_REG_EXP_NEW } from '../../constants'
import { validateK8sResource } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

let CreateConfigModal = React.createClass({
  btnCreateConfigGroup() {
    const parentScope = this.props.scope
    const { currentGroup, groupEdit } = parentScope.state;
    const { updateConfigAnnotations } = this.props
    let notification = new NotificationHandler()
    let inputValue = document.getElementsByClassName('ant-select-search__field__mirror')[0].innerText
    let self = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const groupName = values.newConfigName
      const groupSort = values.newConfigSort.concat(inputValue && inputValue.trim())
      if (!validateK8sResource(groupName)) {
        notification.error('由小写字母、数字和连字符（-）组成')
        return
      }
      const { cluster } = parentScope.props
      let configs = {
        groupName: groupEdit ? currentGroup : groupName,
        cluster,
        configlabels:groupSort.toString()
      }
      if (!groupEdit) {
        parentScope.props.createConfigGroup(configs, {
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
              parentScope.setState({ createModal: false })
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
      } else {
       updateConfigAnnotations(configs,{
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
               case 403: errorText = '添加的配置过多'; break
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
    const form = this.props.form;
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
    callback()
  },
  configSortExists(rules, value, callback) {
    callback()
  },
  handCancel(parentScope) {
     parentScope.configModal(false,false)
     this.props.form.resetFields()
  },
  render() {
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const { configGroup, labelWithCount } = this.props
    const { currentGroup, groupEdit } = parentScope.state;
    let currentSortArray = []
    configGroup.length > 0 && configGroup.forEach(item => {
      if ((item.name === currentGroup) && item.annotations.length) {
        currentSortArray = item.annotations
      }
    })
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
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
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
        visible={ parentScope.state.createModal }
        onOk={() => this.btnCreateConfigGroup()}
        onCancel={() => this.handCancel(parentScope)}
        >
        <Form horizontal>
          <Row style={{ paddingTop: '10px' }}>
            <Col span="18">
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

export default CreateConfigModal