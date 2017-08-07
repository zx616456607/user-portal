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
    let notification = new NotificationHandler()
    let self = this
    const parentScope = this.props.scope
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
      const { cluster } = parentScope.props
      let configs = {
        groupName,
        cluster,
        configlabels:JSON.stringify(groupSort)
      }
      parentScope.setState({ createModal: false })
      parentScope.props.createConfigGroup(configs, {
        success: {
          func: () => {
            notification.success('创建成功')
            self.props.form.resetFields()
            parentScope.loadData()
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
    if (!value) {
      callback([new Error('请输入配置组分类')])
      return
    }
    callback()
  },
  handCancel(parentScope) {
     parentScope.configModal(false,false)
     this.props.form.resetFields()
  },
  render() {
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const nameProps = getFieldProps('newConfigName', {
      rules: [
        { validator: this.configNameExists },
      ],
    });
    const sortProps = getFieldProps('newConfigSort', {
      rules: [
        { message: '请选择分类', type: 'array' },
        { validator: this.configSortExists }
      ]
    })
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    let children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    return (
      <Modal
        title={parentScope.state.groupEdit ? "修改配置组" : '创建配置组'}
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
                <Select {...sortProps} tags multiple placeholder="请选择分类">
                  {children}
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="配置组名称"
                >
                <Input {...nameProps} type="text" id="newConfigName" onPressEnter={()=> this.btnCreateConfigGroup()} />
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