/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateCompose component
 *
 * v0.1 - 2016-10-15
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Input, Button, Switch, Radio , message} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/CreateCompose.less"

const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class CreateCompose extends Component {
  constructor(props) {
    super(props);
    this.onChangeAttr = this.onChangeAttr.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      composeType: "stack",
      composeAttr: false
    }
  }
  
  
  onChangeAttr(e) {
    //this function for user change the compose attr
    this.setState({
      composeAttr: e
    });
  }
  
  handleReset(e) {
    //this function for user close add other image space modal
    e.preventDefault();
    this.props.form.resetFields();
    const scope = this.props.scope;
    scope.setState({
      createModalShow: false
    });
  }
  
  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const parentScope = this.props.scope;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      const scope = this
      const registry = this.props.registry
      const config = {
        'is_public': this.state.composeAttr ? 1 : 2,
        'content': values.textarea,
        'name': values.name
      }
      // return
      this.props.createStack(config, {
        success: {
          func: ()=>{
            parentScope.props.loadMyStack(registry)
            parentScope.setState({
              createModalShow: false
            });
            message.success('创建成功！')
            scope.props.form.resetFields();
          },
          isAsync: true
        },
        failed: {
          func: (err)=>{
            message.error(err.message)
          }
        }
      })
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
    });
  }
  
  render() {
    const scope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入用户名' }
      ],
    });
    const textareaProps = getFieldProps('textarea', {
      rules: [
        { required: true, message: '真的不打算写点什么吗？' },
      ],
    });
    return (
      <div id="createCompose" key="createCompose">
         <div className="commonInput">
          <div className="leftBox">
            <span className="title">编排名称</span>
          </div>
          <div className="rightBox">
            <FormItem hasFeedback style={{ width:"220px" }} >
              <Input {...nameProps} name="name" ref="nameInput" />
            </FormItem>
          </div>
          <div style={{ clear:"both" }}></div>
        </div>
        <div className="commonInput">
          <div className="leftBox">
            <span className="title">编排属性</span>
          </div>
          <div className="rightBox">
            <Switch checkedChildren={'公开'} unCheckedChildren={'私有'} defaultChecked={ this.state.composeAttr } onChange={this.onChangeAttr} />
          </div>
          <div style={{ clear:"both" }}></div>
        </div>
      <div className="commonInput composeText">
        <div className="leftBox">
        <span className="title">描述文件</span>
        </div>
        <div className="rightBox">
          <FormItem hasFeedback>
          <Input type="textarea" {...textareaProps} name="textarea" autosize={{ minRows: 10, maxRows: 30 }} />
          </FormItem>
        </div>
        <div style={{ clear:"both" }}></div>
      </div>
      <div className="btnBox">
        <Button size="large" onClick={ this.handleReset } style={{ marginRight:"15px" }}>
        取消
        </Button>
        <Button size="large" type="primary" onClick={ this.handleSubmit }>
        确定
        </Button>
      </div>
      </div>
    )
  }
}

CreateCompose.propTypes = {

}

CreateCompose = createForm()(CreateCompose);

CreateCompose = connect()(CreateCompose);

export default CreateCompose;