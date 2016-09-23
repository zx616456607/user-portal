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
import { Switch,Select,Collapse,Dropdown,Modal,Checkbox,Button,Card,Menu,Input,InputNumber,Radio  } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppDeployServiceModal.less"

const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioGroup = Radio.Group;

export default class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
    this.changeServiceState = this.changeServiceState.bind(this);
    this.selectComposeType = this.selectComposeType.bind(this);
    this.changeRunningCode = this.changeRunningCode.bind(this);
    this.state = {
    	composeType:"1",
    	stateService:false,
    	runningCode:"1"
    }
  }
  
  selectComposeType(type){
  	//the function for change user select compose file type
  	this.setState({
  		composeType:type
  	});
  }
  
  changeServiceState(e){
  	//the function for change user select service status open or not
		this.setState({
			stateService:e
  	});
  }
  
  changeRunningCode(e){
  	//the function for change user select image default code or set it by himself
  	this.setState({
  		runningCode:e.target.value
  	});
  }
  
  render() {
  	const parentScope = this.props.scope;
    return (
	    <div id="AppDeployServiceModal">
	      <div className="topBox">
	        <div className="inputBox">
	          <span className="commonSpan">服务名称</span>
	          <Input className="serviceNameInput" size="large" placeholder="起一个萌萌哒的名字吧~" />
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像地址</span>
	          <Input className="imageInput" size="large" placeholder="输入一个刻骨铭心的地址吧~" />
	          <Button className="checkBtn" size="large" type="primary">检查地址</Button>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像版本</span>
	          <Select className="imageTag" size="large" defaultValue="成熟的Linux" style={{ width: 200 }} >
			        <Option value="对，选楼下">对，选楼下</Option>
			        <Option value="成熟的Linux">成熟的Linux</Option>
			        <Option value="看啥，选楼上">看啥，选楼上</Option>
			        <Option value="没毛病，选二楼">没毛病，选二楼</Option>
		      	</Select>
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
	           		<Button type={this.state.composeType == "1" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"1")}>
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
	           		<Button type={this.state.composeType == "2" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"2")}>
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
	           		<Button type={this.state.composeType == "4" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"4")}>
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
	           		<Button type={this.state.composeType == "8" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"8")}>
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
	           		<Button type={this.state.composeType == "16" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"16")}>
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
	           		<Button type={this.state.composeType == "32" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"32")}>
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
	          	<span className="commonSpan">容器配置</span>
	          	<Switch className="changeBtn" defaultChecked={false}  onChange={this.changeServiceState} />
	          	<span className="stateSpan">{this.state.stateService ? "有状态服务":"无状态服务"}</span>
	          	{this.state.stateService ? [
	          		<div className="serviceOpen" key="had">
		          		<span className="url">/var/www/html</span>
		          		<Select className="imageTag" size="large" defaultValue="我就是最快的SSD" style={{ width: 200 }} >
						        <Option value="对，选楼下">对，选楼下</Option>
						        <Option value="我就是最快的SSD">我就是最快的SSD</Option>
						        <Option value="看啥，选楼上">看啥，选楼上</Option>
						        <Option value="没毛病，选二楼">没毛病，选二楼</Option>
					      	</Select>
					      	<Checkbox className="readOnlyBtn">只读</Checkbox>
					      	<i className="fa fa-refresh"></i>
					      	<i className="fa fa-trash"></i>
				      	</div>
	          	]:null}
	          	<div style={{ clear:"both" }}></div>
	          </div>
		      	<div className="containerNum">
		      	  <span className="commonSpan">容器数量</span>
		      	  <InputNumber className="inputNum" size="large" min={1} max={100000} />&nbsp;&nbsp;个
		          <div style={{ clear:"both" }}></div>
		      	</div>
	      	</div>
	      </div>
	      <Collapse>
	    		<Panel header={assitBoxTitle} key="1">
					  <div className="assitBox">
					  	<div className="inputBox">
			          <span className="commonSpan">进入点</span>
			          <Input className="entryInput" size="large" placeholder="找啊找啊在哪里进入啊~" />
			          <div style={{ clear:"both" }}></div>
			        </div>
			        <div className="inputBox">
			          <span className="commonSpan">执行命令</span>
			          <div className="selectBox">
			          	<RadioGroup onChange={this.changeRunningCode} value={this.state.runningCode}>
						        <Radio key="a" value={"1"}>镜像默认</Radio>
						        <Radio key="b" value={"2"}>自定义</Radio>
						      </RadioGroup>
			          </div>
			          <div style={{ clear:"both" }}></div>
			        </div>
			      </div>
	    		</Panel>
	    		<Panel header={usefulBoxitle} key="2">
	              <div className="usefulBox">bb
		      	  </div>
	    		</Panel>
	    		<Panel header={composeBoxTitle} key="3">
	              <div className="composeBox">bb
		          </div>
	    		</Panel>
	    		<Panel header={advanceBoxTitle} key="4">
	      		  <div className="advanceBox">cc
		      	  </div>
	    		</Panel>
  		  </Collapse>
      	  <div className="btnBox">
	      </div>
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
