import React from 'react'
import './style/configManagement.less'
import { Form, Input, Button } from 'antd'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    sm: { span: 2 },
  },
  wrapperCol: {
    sm: { span: 18 },
  },
}
class ConfigManagement extends React.Component {
  state = {
    isEdit: false,
  }
  submitChange = () => {
    this.setState({
      isEdit: false,
    })
  }
  render() {
    return <div className="configManagement">
      <div className="title">配置管理</div>
      <div className="content">
        <Form>
          <FormItem
            {...formItemLayout}
            label="挂载目录"
          >
            <span>/etc/mysql</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="配置文件"
          >
            <span>mysql.conf</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="内容"
          >
            <div className="btnGroup">
              {
                !this.state.isEdit ?
                  <Button type="primary" onClick={() => this.setState({ isEdit: true })}>修改</Button>
                  :
                  <div>
                    <Button onClick={() => this.setState({ isEdit: false })}>取消</Button>
                    <Button type="primary" onClick={this.submitChange}>保存</Button>
                  </div>
              }
            </div>
            <Input type="textarea" disabled={!this.state.isEdit} rows={6}/>
          </FormItem>
        </Form>
      </div>
    </div>
  }
}

export default Form.create()(ConfigManagement)
