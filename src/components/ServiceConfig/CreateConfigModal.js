import { Button, Form, Input, Row, Col, Modal} from 'antd';
import React from 'react'
import { USERNAME_REG_EXP_NEW } from '../../constants'
import { validateK8sResource } from '../../common/naming_validation'
import NotificationHandler from '../../common/notification_handler'
const createForm = Form.create;
const FormItem = Form.Item;

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
      if (!validateK8sResource(groupName)) {
        notification.error('名称须以小写字母开头，由小写字母、数字和连字符（-）组成，且以小写字母或数字结尾，长度为 3-63 个字符')
        return
      }
      const { cluster } = parentScope.props
      let configs = {
        groupName,
        cluster
      }
      parentScope.setState({ createModal: false })
      parentScope.props.createConfigGroup(configs, {
        success: {
          func: () => {
            notification.success('创建成功')
            self.props.form.resetFields()
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

    })
  },

  configNameExists(rule, value, callback) {
    const form = this.props.form;
    if (!value) {
      callback([new Error('请输入配置组名称')])
      return
    }
    if (!validateK8sResource(groupName)) {
      notification.error('名称须以小写字母开头，由小写字母、数字和连字符（-）组成，且以小写字母或数字结尾，长度为 3-63 个字符')
      return
    }
    callback()
  },
  
  render() {
    const { getFieldProps } = this.props.form
    const parentScope = this.props.scope
    const nameProps = getFieldProps('newConfigName', {
      rules: [
        { validator: this.configNameExists },
      ],
    });

    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        title="创建配置组"
        wrapClassName="server-create-modal"
        maskClosable={false}
        visible={ parentScope.state.createModal }
        onOk={() => this.btnCreateConfigGroup()}
        onCancel={() => parentScope.configModal(false)}
        >
        <Form horizontal>
          <Row style={{ paddingTop: '10px' }}>
            <Col span="18">
              <FormItem
                {...formItemLayout}
                label="名称"
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