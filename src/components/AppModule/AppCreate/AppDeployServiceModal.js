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
import { Switch,Select,Collapse,Dropdown,Modal,Checkbox,Button,Card,Menu,Input,InputNumber,Radio,Icon  } from 'antd'
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
    this.changeGetImageType = this.changeGetImageType.bind(this);
    this.changeUsefulType = this.changeUsefulType.bind(this);
    this.composeOnAdd = this.composeOnAdd.bind(this);
    this.composeOnRemove = this.composeOnRemove.bind(this);
    this.enviroOnAdd = this.enviroOnAdd.bind(this);
    this.enviroOnRemove = this.enviroOnRemove.bind(this);
    this.portOnAdd = this.portOnAdd.bind(this);
    this.portOnRemove = this.portOnRemove.bind(this);
    this.changeProtocol = this.changeProtocol.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
    	composeType:"1",
    	stateService:false,
    	runningCode:"1",
    	getImageType:"1",
    	getUsefulType:"null",
    	composeList:[],
    	enviroList:[],
    	portList:[]
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
  
  changeGetImageType(e){
  	//the function for change user get image type select local image or get image from the cloud
  	this.setState({
  		getImageType:e.target.value
  	});
  }
  
  changeUsefulType(e){
  	//the function for change user select useful type
  	this.setState({
  		getUsefulType:e.target.value
  	});
  }
  
  composeOnAdd() {
    const composeList = this.state.composeList;
    let scope = this;
    let index = composeList.length;
    composeList.push(
    	<li className="composeDetail" key={index}>
    		<div className="input">
        	<Input className="composeUrl" type="text" />
        </div>
        <div className="select">
	        <Select className="composeGroup" size="large" defaultValue="对，就选我，没毛病" style={{ width: 200 }} >
						<Option value="对，选楼下">对，选楼下</Option>
						<Option value="对，就选我，没毛病">对，就选我，没毛病</Option>
						<Option value="看啥，选楼上">看啥，选楼上</Option>
						<Option value="没毛病，选二楼">没毛病，选二楼</Option>
					</Select>
				</div>
				<div className="check">
					<Checkbox />&nbsp;&nbsp;全选<br />
					<Checkbox />&nbsp;&nbsp;选我一个好啦<br />
					<Checkbox />&nbsp;&nbsp;别选楼上<br />
					<Checkbox />&nbsp;&nbsp;一楼脑残<br />
					<Checkbox />&nbsp;&nbsp;都选我
				</div>
				<div className="opera">
					<i className="fa fa-trash-o" onClick={scope.composeOnRemove.bind(scope,index)}></i>
				</div>
				<div style={{ clear:"both" }}></div>
      </li>
    );
    this.setState({
      composeList: composeList
    });
  }
  
  composeOnRemove(index) {
    const composeList = this.state.composeList;
    composeList.splice(index, 1);
    this.setState({
      composeList: composeList
    });
  }
  
  enviroOnAdd() {
    const enviroList = this.state.enviroList;
    let scope = this;
    let index = enviroList.length;
    enviroList.push(
    	<li className="enviroDetail" key={index}>
    		<div className="input">
        	<Input className="composeUrl" type="text" />
        </div>
        <div className="input">
        	<Input className="composeUrl" type="text" />
        </div>
				<div className="opera">
					<i className="fa fa-trash-o" onClick={scope.enviroOnRemove.bind(scope,index)}></i>
				</div>
				<div style={{ clear:"both" }}></div>
      </li>
    );
    this.setState({
      enviroList: enviroList
    });
  }
  
  enviroOnRemove(index) {
    const enviroList = this.state.enviroList;
    enviroList.splice(index, 1);
    this.setState({
      enviroList: enviroList
    });
  }
  
  portOnAdd() {
    const portList = this.state.portList;
    let scope = this;
    let index = portList.length;
    portList.push(
    	<li className="portDetail" key={index}>
    		<div className="input">
        	<Input className="portUrl" type="text" />
        </div>
        <div className="protocol select">
	        <Select className="portGroup" size="large" defaultValue="http" onChange={this.changeProtocol} style={{ width: 200 }} >
						<Option value="http">Http</Option>
						<Option value="tcp">Tcp</Option>
						<Option value="udp">Udp</Option>
					</Select>
				</div>
				<div className="mapping select">
					<Select className="portGroup" size="large" defaultValue="对，就选我，没毛病" style={{ width: 200 }} >
						<Option value="对，选楼下">对，选楼下</Option>
						<Option value="对，就选我，没毛病">对，就选我，没毛病</Option>
						<Option value="看啥，选楼上">看啥，选楼上</Option>
						<Option value="没毛病，选二楼">没毛病，选二楼</Option>
					</Select>
				</div>
				<div className="opera">
					<i className="fa fa-trash-o" onClick={scope.portOnRemove.bind(scope,index)}></i>
				</div>
				<div style={{ clear:"both" }}></div>
      </li>
    );
    this.setState({
      portList: portList
    });
  }
  
  portOnRemove(index) {
    const portList = this.state.portList;
    portList.splice(index, 1);
    this.setState({
      portList: portList
    });
  }
  
  changeProtocol(e){
  	console.log(e);
  	console.log(this)
  }
  
  closeModal(){
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		modalShow:false
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
		      	  <InputNumber className="inputNum" size="large" min={1} max={100} />&nbsp;&nbsp;个
		          <div style={{ clear:"both" }}></div>
		      	</div>
	      	</div>
	      </div>
	      <Collapse>
	    		<Panel header={assitBoxTitle} key="1" className="assitBox">
					  <div>
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
						      </RadioGroup><br />
						      <Input className="entryInput" size="large" placeholder="你想执行什么!!!!" disabled={this.state.runningCode == "1" ? true:false} />
			          </div>
			          <div style={{ clear:"both" }}></div>
			        </div>
			        <div className="inputBox">
			          <span className="commonSpan">重新部署</span>
			          <div className="selectBox">
			          	<RadioGroup onChange={this.changeGetImageType} value={this.state.getImageType}>
						        <Radio key="a" value={"1"}>优先使用本地镜像</Radio>
						        <Radio key="b" value={"2"}>始终拉取云端该版本镜像</Radio>
						      </RadioGroup>
			          </div>
			          <div style={{ clear:"both" }}></div>
			        </div>
			        <div className="inputBox">
			          <span className="commonSpan">时区设置</span>
			          <div className="checkBox">
			          	<Checkbox /><span className="checkTitle">使用所在主机节点的时区</span><br />
			          	<span className="tooltip">选中后,可以保证容器始终与其所在的主机节点保持一致</span>
			          </div>
			          <div style={{ clear:"both" }}></div>
			        </div>
			      </div>
	    		</Panel>
	    		<Panel header={usefulBoxitle} key="2" className="usefulBigBox">
	          <div className="usefulBox">
	          	<RadioGroup onChange={this.changeUsefulType} value={this.state.getUsefulType}>
						    <Radio key="a" value={"null"}>无</Radio>
						    <Radio key="b" value={"http"}>http</Radio>
						    <Radio key="c" value={"tcp"}>tcp</Radio>
						  </RadioGroup>
		      	{this.state.getUsefulType == "http" ? [
		      		<div className="http">
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
		      	{this.state.getUsefulType == "tcp" ? [
		      		<div className="tcp">
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
	    		</Panel>
	    		<Panel header={composeBoxTitle} key="3" className="composeBigBox">
	          <div className="composeBox">
	          	<span className="title">配置目录</span>
	          	<div className="composeList">
	          		<div className="composeTitle">
	          			<div className="composeCommonTitle">
	          				<span>挂载目录</span>
	          			</div>
	          			<div className="composeCommonTitle">
	          				<span>配置组</span>
	          			</div>
	          			<div className="composeCommonTitle">
	          				<span>配置文件</span>
	          			</div>
	          			<div className="composeCommonTitle">
	          				<span>操作</span>
	          			</div>
									<div style={{ clear:"both" }}></div>
	          		</div>
	          		<ul>
	          			{this.state.composeList}
	          		</ul>
	          	</div>
	          	<div className="addBtn" onClick={this.composeOnAdd}>
	          		<Icon type="plus-circle-o" />
	          		<span>添加</span>
	          	</div>
		        </div>
	    		</Panel>
	    		<Panel header={advanceBoxTitle} key="4">
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
		          		<ul>
		          			{this.state.enviroList}
		          		</ul>
		          	</div>
		          	<div className="addBtn" onClick={this.enviroOnAdd}>
		          		<Icon type="plus-circle-o" />
		          		<span>增加环境变量</span>
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
		          		<ul>
		          			{this.state.portList}
		          		</ul>
		          	</div>
		          	<div className="addBtn" onClick={this.portOnAdd}>
		          		<Icon type="plus-circle-o" />
		          		<span>增加映射端口</span>
		          	</div>
	      			</div>
		      	</div>
	    		</Panel>
  		  </Collapse>
      	<div className="btnBox">
      		<Button className="cancelBtn" size="large" type="ghost" onClick={this.closeModal}>
      			取消
      		</Button>
      		<Link to={`/app_manage/app_create/compose_file`}>
	      		<Button className="createBtn" size="large" type="primary">
	      			创建
	      		</Button>
      		</Link>
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
