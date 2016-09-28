/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppDeployServiceModal component
 * 
 * v0.1 - 2016-09-23
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form,Switch,Select,Collapse,Dropdown,Modal,Checkbox,Button,Card,Menu,Input,InputNumber,Radio,Icon  } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import NormalDeployBox from './AppDeployComponents/NormalDeployBox.js'
import AssitDeployBox from './AppDeployComponents/AssitDeployBox.js'
import UsefulDeployBox from './AppDeployComponents/UsefulDeployBox.js'
import ComposeDeployBox from './AppDeployComponents/ComposeDeployBox.js'
import EnviroDeployBox from './AppDeployComponents/EnviroDeployBox.js'
import "./style/AppDeployServiceModal.less"

const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
    this.changeServiceState = this.changeServiceState.bind(this);     
    this.submitNewService = this.submitNewService.bind(this);
    this.state = {
    	composeType:"1",
    	stateService:false,
    	instanceNum:1,
    	runningCode:"1",
    	getImageType:"1",
    	currentDate:false,
    	getUsefulType:"null",
    	composeList:[],
    	enviroList:[],
    	portList:[]
    }
  }
  
  changeServiceState(e){
  	//the function for change user select service status open or not
		this.setState({
			stateService:e
  	});
  }
    
  submitNewService(e){
  	//the function for user submit new service
  	e.preventDefault();
  	this.props.form.validateFields((errors, values) => {
      console.log(errors)
      console.log(values)
    });
  	const scope = this.state;
  	let composeType = scope.composeType;
  	let instanceNum = scope.instanceNum;
  	console.log(scope)
  }
  
  render() {
  	const scope = this;
  	const parentScope = this.props.scope;
    return (
	  <div id="AppDeployServiceModal">
    	{/*<Form horizontal form={this.props.form}>*/}
    		<NormalDeployBox scope={scope} />
	      <Collapse>
	    		<Panel header={assitBoxTitle} key="1" className="assitBigBox">
					  <AssitDeployBox scope={scope} />
	    		</Panel>
	    		<Panel header={usefulBoxitle} key="2" className="usefulBigBox">
	          <UsefulDeployBox scope={scope} />
	    		</Panel>
	    		<Panel header={composeBoxTitle} key="3" className="composeBigBox">
	          <ComposeDeployBox scope={scope} />
	    		</Panel>
	    		<Panel header={advanceBoxTitle} key="4">
	      		<EnviroDeployBox scope={scope} /> 
	    		</Panel>
  		  </Collapse>
      	<div className="btnBox">
      		<Button className="cancelBtn" size="large" type="ghost" onClick={this.closeModal}>
      			取消
      		</Button>
	      	<Button className="createBtn" size="large" type="primary" onClick={this.submitNewService}>
	      		创建
	      	</Button>
      	</div>
	   {/*</Form>*/}
    </div>
    )
  }
}

const assitBoxTitle = (
	<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">辅助设置</span>
	      	  <span className="titleIntro">设置重启检查项目，如遇到检查项不满足，为自动保证服务高可用，将自动重启该服务</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
);
const usefulBoxitle = (
					<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">高可用</span>
	      	  <span className="titleIntro">设置重启检查项目，如遇到检查项不满足，为自动保证服务高可用，将自动重启该服务</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
);
const composeBoxTitle = (
					<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">配置管理</span>
	      	  <span className="titleIntro">满足您同意管理某些服务配置文件的需求，即：不用停止服务，即可变更多个容器内的配置文件</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
);
const advanceBoxTitle = (
					<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">高级设置</span>
	      	  <span className="titleIntro">在高级设置里,您可以链接其它已创建服务，环境变量配置，以及容器与主机端口的映射</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
);

AppDeployServiceModal.propTypes = {

}

AppDeployServiceModal = createForm()(AppDeployServiceModal);

export default AppDeployServiceModal

