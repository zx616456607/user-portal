/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * EnviroDeployBox component
 * 
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form,Select,Input,InputNumber,Modal,Checkbox,Button,Card,Menu,Switch,Radio,Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/EnviroDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

let uuidEnviro = 0;
let MyComponentEnviro = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
  },
  add() {
    uuidEnviro++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(uuidEnviro);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
  },
  render : function() {
		const { getFieldProps, getFieldValue,getFieldsValue } = this.props.form;
  	getFieldProps('keys', {
      initialValue: [],
   	});
   	const formItems = getFieldValue('keys').map((k) => {
      return (
        <FormItem key={k}>
        	<li className="enviroDetail">
    				<div className="input">
        			<Input {...getFieldProps(`url${k}`, {
          			rules: [{
		              required: true,
		              whitespace: true,
		              message: '挂载路径呢?',
            		}],
          		})} className="composeUrl" type="text" />
        		</div>
						<div className="input">
							<Input {...getFieldProps(`url${k}`, {
          			rules: [{
		              required: true,
		              whitespace: true,
		              message: '挂载路径呢?',
            		}],
          		})} className="composeUrl" type="text" />
						</div>
						<div className="opera">
							<i className="fa fa-trash-o" onClick={() => this.remove(k)}></i>
						</div>
						<div style={{ clear:"both" }}></div>
      		</li>
        </FormItem>
      )});
	return (
		<div>
		  <ul>
	        { formItems }
		  </ul>
		  <div className="addBtn" onClick={this.add}>
	      <Icon type="plus-circle-o" />
	      <span>添加映射端口</span>
	    </div>
	  </div>
    );
  }
});	

let uuidPort = 0;
let MyComponentPort = React.createClass({	  
  propTypes : {
    config : React.PropTypes.array
  },
  remove(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
  },
  add() {
    uuidPort++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(uuidPort);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
  },
  render : function() {
		const { getFieldProps, getFieldValue,getFieldsValue } = this.props.form;
  	getFieldProps('keys', {
      initialValue: [],
   	});
   	const formItems = getFieldValue('keys').map((k) => {
      return (
        <FormItem key={k}>
        	<li className="portDetail">
    				<div className="input">
        			<Input {...getFieldProps(`url${k}`, {
          			rules: [{
		              required: true,
		              whitespace: true,
		              message: '挂载路径呢?',
            		}],
          		})} className="composeUrl" type="text" size="large"/>
        		</div>
        		<div className="protocol select">
        			<FormItem className="portGroupForm">
			        	<Select {...getFieldProps(`port${k}`, {
			        			rules: [{
				              required: true,
				              message: '选择配置组呢?',
		            		}],
			        		})}
			        		className="portGroup" size="large" >
									<Option value="http">Http</Option>
									<Option value="tcp">Tcp</Option>
									<Option value="udp">Udp</Option>
								</Select>
							</FormItem>
						</div>
						<div className="mapping">
							<Input {...getFieldProps(`url${k}`, {
          			rules: [{
		              required: true,
		              whitespace: true,
		              message: '挂载路径呢?',
            		}],
          		})} className="composeUrl" type="text" size="large" />
						</div>
						<div className="opera">
							<i className="fa fa-trash-o" onClick={() => this.remove(k)}></i>
						</div>
						<div style={{ clear:"both" }}></div>
      		</li>
        </FormItem>
      )});
	return (
		<div>
		  <ul>
	        { formItems }
		  </ul>
		  <div className="addBtn" onClick={this.add}>
	      <Icon type="plus-circle-o" />
	      <span>添加映射端口</span>
	    </div>
	  </div>
    );
  }
});		

MyComponentPort = createForm()(MyComponentPort);
MyComponentEnviro = createForm()(MyComponentEnviro);

class EnviroDeployBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }
  render() {
  	const parentScope = this.props.scope;
    return (
	  <div id="advanceBox">
	  	<div className="advanceBox">
	  		<div className="enviroBox">
	  			<span className="title">环境变量</span>
		     	<div className="enviroList">
		     		<div className="enviroTitle">
		     			<div className="enviroCommonTitle">
		     				<span>键</span>
		     			</div>
		     			<div className="enviroCommonTitle">
		     				<span>值</span>
		          </div>
		          <div className="enviroCommonTitle">
		          	<span>操作</span>
		          </div>
							<div style={{ clear:"both" }}></div>
		        </div>
		        <MyComponentEnviro />
		      </div>
	      </div>
	      <div className="portBox">
	      	<span className="title">映射端口</span>
		     	<div className="portList">
		     		<div className="portTitle">
		     			<div className="portCommonTitle">
		     				<span>容器端口</span>
		         	</div>
		        	<div className="protocol portCommonTitle">
		         		<span>协议</span>
		         	</div>
		         	<div className="mapping portCommonTitle">
		         		<span>映射主机端口</span>
		         	</div>
		         	<div className="portCommonTitle">
		         		<span>操作</span>
		         	</div>
							<div style={{ clear:"both" }}></div>
		        </div>
		        <MyComponentPort />
		      </div>
	      </div>
		  </div>
	  </div>
    )
  }
}

EnviroDeployBox.propTypes = {
}

EnviroDeployBox = createForm()(EnviroDeployBox);

export default EnviroDeployBox;