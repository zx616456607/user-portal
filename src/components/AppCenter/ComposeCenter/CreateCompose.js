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
import { Form, Input, Button, Switch, Radio } from 'antd'
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
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeAttr = this.onChangeAttr.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      composeType: "stack",
      composeAttr: false
    }
  }
  
  onChangeType(e) {
    //this function for user change the compose type
    this.setState({
      composeType: e.target.value
    });
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
    const scope = this.props.scope;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input

        return;
      }
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
      scope.setState({
        createModalShow: false
      });
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
    return (
      <div id="createCompose" key="createCompose">
         <div className="commonInput">
          <div className="leftBox">
            <span className="title">编排名称</span>
          </div>
          <div className="rightBox">
            <FormItem hasFeedback style={{ width:"220px" }} >
              <Input {...nameProps} ref="nameInput" />
            </FormItem>
          </div>
          <div style={{ clear:"both" }}></div>
        </div>
        <div className="commonInput">
          <div className="leftBox">
            <span className="title">编排类型</span>
          </div>
          <div className="rightBox">
            <RadioGroup onChange={this.onChangeType} value={this.state.composeType}>
              <Radio key="a" value={"stack"}>stack</Radio>
              <Radio key="b" value={"pod"}>pod</Radio>
            </RadioGroup>
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
          <Input type="textarea" autosize={{ minRows: 10, maxRows: 30 }} />
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