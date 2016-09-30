/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * NormalDeployBox component
 * 
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form,Select,Input,InputNumber,Modal,Checkbox,Button,Card,Menu,Switch } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/NormalDeployBox.less"
const createForm = Form.create;
const FormItem = Form.Item;

class NormalDeployBox extends Component {
  constructor(props) {
    super(props);
    this.selectComposeType = this.selectComposeType.bind(this);
    this.changeInstanceNum = this.changeInstanceNum.bind(this);
    this.changeServiceState = this.changeServiceState.bind(this);
    this.state = {
    	
    }
  }
  
  userExists(rule, value, callback) {
  	//this function for check user input new service new is exist or not
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (value === 'JasonWood') {
          callback([new Error('抱歉，该用户名已被占用。')]);
        } else {
          callback();
        }
      }, 800);
    }
  } 
  
  selectComposeType(type){
  	//the function for change user select compose file type
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		composeType:type
  	});
  }
  
  changeInstanceNum(e){
  	//the function for user set the max number of instance
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		instanceNum:e
  	});
  }
  
  changeServiceState(e){
    //the function for change user select service status open or not
    this.setState({
      stateService:e
    });
  }
  
  render() {
  	const parentScope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = parentScope.props.form;
  	const nameProps = getFieldProps('name', {
      rules: [
        { required: true, min: 3,max: 50, message: '服务名至少为 5 个字符' },
        { validator: this.userExists },
      ],
    });
    
    const imageUrlProps = getFieldProps('imageUrl', {
      rules: [
        { required: true, message: '请输入镜像地址' },
      ],
    });
    const selectProps = getFieldProps('select', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
    });
    const runningCodeProps = getFieldProps('select', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
    });
    
    return (
	  <div id="NormalDeployBox">
	  	{/*<Form horizontal form={parentScope.props.form}>*/}
	    	<div className="topBox">
	        <div className="inputBox">
	          <span className="commonSpan">服务名称</span>
	          <FormItem className="serviceNameForm" hasFeedback
          		help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}>
	          	<Input {...nameProps} className="serviceNameInput" size="large" placeholder="起一个萌萌哒的名字吧~" />
	            <div style={{ clear:"both" }}></div>
	          </FormItem>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像地址</span>
	          <FormItem className="iamgeUrlForm" hasFeedback>
		          <Input {...imageUrlProps} className="imageInput" size="large" placeholder="输入一个刻骨铭心的地址吧~" />
		          <div style={{ clear:"both" }}></div>
	          </FormItem>
	          <Button className="checkBtn" size="large" type="primary" onClick={this.checkImageUrl}>检查地址</Button>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像版本</span>
		        <FormItem className="imageTagForm">
		          <Select {...selectProps} className="imageTag" size="large" tyle={{ width: 200 }} >
				        <Option value="对，选楼下">对，选楼下</Option>
				        <Option value="成熟的Linux">成熟的Linux</Option>
				        <Option value="看啥，选楼上">看啥，选楼上</Option>
				        <Option value="没毛病，选二楼">没毛病，选二楼</Option>
			      	</Select>
		        </FormItem>
	          <div style={{ clear:"both" }}></div>
	        </div>
	      </div>
	      <div className="infoBox">
	      	<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">基本配置</span>
	      	  <span className="titleIntro">服务的计算资源、服务类型、以及实例个数等设置</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
	      	<div className="operaBox">
	      		<div className="selectCompose">
	           <span className="commonSpan">容器配置</span>
	           <ul className="composeList">
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "1" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"1")}>
	           			<div className="topBox">
	           				1X
	           			</div>
	           			<div className="bottomBox">
	           				<span>256M&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "2" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"2")}>
	           			<div className="topBox">
	           				2X
	           			</div>
	           			<div className="bottomBox">
	           				<span>512M&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "4" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"4")}>
	           			<div className="topBox">
	           				4X
	           			</div>
	           			<div className="bottomBox">
	           				<span>1GB&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "8" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"8")}>
	           			<div className="topBox">
	           				8X
	           			</div>
	           			<div className="bottomBox">
	           				<span>2GB&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "16" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"16")}>
	           			<div className="topBox">
	           				16X
	           			</div>
	           			<div className="bottomBox">
	           				<span>4GB&nbsp;内存</span><br />
	           				<span>1CPU</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "32" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"32")}>
	           			<div className="topBox">
	           				32X
	           			</div>
	           			<div className="bottomBox">
	           				<span>8GB&nbsp;内存</span><br />
	           				<span>2CPU</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<div style={{ clear:"both" }}></div>
	          	</ul>
	          	<div style={{ clear:"both" }}></div>
	          </div>
	          <div className="stateService">
	          	<span className="commonSpan">服务类型</span>
	          	<Switch className="changeBtn" defaultChecked={false}  onChange={this.changeServiceState} />
	          	<span className="stateSpan">{this.state.stateService ? "有状态服务":"无状态服务"}</span>
	          	{this.state.stateService ? [
	          		<div className="serviceOpen" key="had">
                  <FormItem>
                    <span className="url">/var/www/html</span>
                    <Select className="imageTag" size="large"
                            defaultValue="我就是最快的SSD"
                            style={{ width: 200 }}
                            {...getFieldProps('volumeName', {
                              rules: [{
                                required: true,
                                message: '选择配置组呢?',
                              }],
                            })}>
                      <Option value="对，选楼下">对，选楼下</Option>
                      <Option value="我就是最快的SSD">我就是最快的SSD</Option>
                      <Option value="看啥，选楼上">看啥，选楼上</Option>
                      <Option value="没毛病，选二楼">没毛病，选二楼</Option>
                    </Select>
                    <Checkbox className="readOnlyBtn">只读</Checkbox>
                    <i className="fa fa-refresh"></i>
                    <i className="fa fa-trash"></i>
                  </FormItem>
				      	</div>
	          	]:null}
	          	<div style={{ clear:"both" }}></div>
	          </div>
		      	<div className="containerNum">
		      	  <span className="commonSpan">容器数量</span>
		      	  <InputNumber className="inputNum" value={parentScope.state.instanceNum} onChange={this.changeInstanceNum}
		      	  	size="large" min={1} max={100} />&nbsp;&nbsp;个
		          <div style={{ clear:"both" }}></div>
		      	</div>
	      	</div>
	      </div>
      {/*</Form>*/}
	  </div>
    )
  }
}

NormalDeployBox.propTypes = {
}

NormalDeployBox = createForm()(NormalDeployBox);

export default NormalDeployBox;