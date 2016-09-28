/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * UsefulDeployBox component
 * 
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form,Select,Input,InputNumber,Modal,Checkbox,Button,Card,Menu,Switch,Radio } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/UsefulDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class UsefulDeployBox extends Component {
  constructor(props) {
    super(props);
    this.changeUsefulType = this.changeUsefulType.bind(this);
    this.state = {
      
    }
  }
  
  changeUsefulType(e){
  	//the function for user select different userful type
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		getUsefulType:e.target.value
  	});
  }
  
  render() {
  	const parentScope = this.props.scope;
  	const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
  	const runningCodeProps = getFieldProps('imageUrl', {
      rules: [
        { required: true, message: '请输入自定义执行命令' },
      ],
    });
    return (
	  <div id="UsefulDeployBox">
	    <Form horizontal form={parentScope.props.form}>
	    	<div className="usefulBox">
	        <RadioGroup onChange={this.changeUsefulType} value={parentScope.state.getUsefulType}>
					  <Radio key="a" value={"null"}>无</Radio>
					  <Radio key="b" value={"http"}>http</Radio>
					  <Radio key="c" value={"tcp"}>tcp</Radio>
					</RadioGroup>
		      {parentScope.state.getUsefulType == "http" ? [
		      	<div className="http" key="http">
		      		<div className="title">
		      			<div className="httpcommonTitle">
		      				<span>端口</span>
		      			</div>
		      			<div className="httpcommonTitle">
		      				<span>首次检查延时</span>
		      			</div>
		      			<div className="httpcommonTitle">
		      				<span>检查超时</span>
		      			</div>
		      			<div className="httpcommonTitle">
		      				<span>检查间隔</span>
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      		<div className="input">
		      			<div className="commonInput">
		      				<Input type="text" />
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      		<div className="title">
		      			<div className="httpcommonTitle">
		      				<span>Path路径</span>
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      		<div className="input">
		      			<span style={{float:"left",marginLeft:"10px"}}>/</span>
		      			<div className="commonInput">
		      				<Input type="text" />
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      	</div>
		      ]:null}
		      {parentScope.state.getUsefulType == "tcp" ? [
		      	<div className="tcp" key="tcp">
		      		<div className="title">
		      			<div className="tcpcommonTitle">
		      				<span>端口</span>
		      			</div>
		      			<div className="tcpcommonTitle">
		      				<span>首次检查延时</span>
		      			</div>
		      			<div className="tcpcommonTitle">
		      				<span>检查超时</span>
		      			</div>
		      			<div className="tcpcommonTitle">
		      				<span>检查间隔</span>
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      		<div className="input">
		      			<div className="commonInput">
		      				<Input type="text" />
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div className="commonInput">
		      				<Input type="text" />&nbsp;&nbsp;s
		      			</div>
		      			<div style={{ clear:"both" }}></div>
		      		</div>
		      	</div>
		      ]:null}
		      </div>
	    </Form>
	  </div>
    )
  }
}

UsefulDeployBox.propTypes = {
}

UsefulDeployBox = createForm()(UsefulDeployBox);

export default UsefulDeployBox;