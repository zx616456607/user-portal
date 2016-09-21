import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import { Checkbox,Card,Menu,Dropdown,Button,Icon ,Modal ,Input, Slider, InputNumber, Row, Col} from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/storage.less'

const data = [
  {
    id:"1",
    name:"test1",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"13",
    name:"sfsd",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"12",
    name:"www",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"15",
    name:"tenxlolud",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"17",
    name:"wwwwwwwfs",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  }
];

let  MyComponent = React.createClass({
  propTypes: {
   config: React.PropTypes.array
  },
  render : function() {
	let config = this.props.config;
	let items = config.map((item) => {
	  return (
	    <div className="appDetail" key={item.name}>
			<div className="selectIconTitle commonData">
			  <Checkbox onChange={()=>this.onchange()}></Checkbox>
			</div>
			<div className="name commonData">
		      <Link to={`/app_manage/storage/${item.id}`} >
	    	    {item.name}
		      </Link>
			</div>
			<div className="appStatus commonData">
			  <i className={item.status == 1 ? "normal fa fa-circle":"error fa fa-circle"}></i>
			  <span className={item.status == 1 ? "normal":"error"} >{item.status == 1 ? "正常":"异常"}</span>
			</div>
			<div className="formet commonData">
			  {item.formet}
			</div>
			<div className="forin commonData">
			  {item.forin}
			</div>
			<div className="appName commonData">
			  {item.appName}
			</div>
			<div className="size commonData">
			  {item.size}
			</div>
			<div className="createTime commonData">
			  {item.createTime}
			</div>
			<div className="actionBox commonData">
			 <Button className="btn-warning"> 格式化</Button>
			 <Button className="btn-success"> 扩容</Button>
			</div>
			<div style={{clear:"both",width:"0"}}></div>
		</div>
      );
	});
	return (
	  <div className="dataBox">
        { items }
	  </div>
    );
  }
});
export default class Storage extends Component {
	constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
		this.onChange = this.onChange.bind(this)
    this.state = {
      inputValue: 0,
			visible: false
    }
  }
	onChange(value) {
    this.setState({
      inputValue: value,
    });
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  handleOk() {
    this.setState({
      visible: false,
    });
  }
  handleCancel() {
    this.setState({
      visible: false,
  	});
  }
  render() {
    return (
        <QueueAnim className ="AppList"  type = "right">
          <div id="AppList" key = "AppList">
      	    <div className="operationBox">
	          <div className="leftBtn">
	      	    <Button type="primary" size="large" onClick={this.showModal}><Icon type="plus" />创建储存</Button>
	      	    <Button type="ghost" className="stopBtn" size="large"><Icon type="delete" />删除</Button>
							<Modal title="创建储存卷" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel} okText="OK" cancelText="Cancel">
								<Row style={{height:'40px'}}>
									<Col span="3" className="text-center" style={{lineHeight:'30px'}}>名称</Col>
									<Col span="12"><Input placeholder="输入名称" /></Col>
								</Row>
								<Row style={{height:'40px'}}>
									<Col span="3" className="text-center" style={{lineHeight:'30px'}}>大小</Col>
									<Col span="12">
									<Slider min={1} max={1024} onChange={this.onChange} value={this.state.inputValue} />
									</Col>
									<Col span="8">
									<InputNumber min={1} max={1024} style={{ marginLeft: '16px' }} value={this.state.inputValue} onChange={this.onChange}/>
									<span style={{paddingLeft: 10}} >MB</span>
									</Col>
								</Row>
							</Modal>
	          </div>
	        <div className="rightBox">
	      	  <div className="littleLeft">
	      	    <i className="fa fa-search"></i>
	      	  </div>
	      	  <div className="littleRight">
	      	    <input placeholder="输入应用名搜索" />
	      	  </div>
	        </div>
	        <div className="clearDiv"></div>
      	  </div>
      	  <Card className="storageList appBox">
      	    <div className="appTitle">
							<div className="selectIconTitle commonTitle">
								<Checkbox onChange={this.onAllChange}></Checkbox>
							</div>
							<div className="name commonTitle">存储名称</div>
							<div className="appStatus commonTitle">状态</div>
							<div className="formet commonTitle">格式</div>
							<div className="forin commonTitle">容器挂载点</div>
							<div className="appName commonTitle">应用名称</div>
							<div className="size commonTitle">大小</div>
							<div className="createTime commonTitle">创建时间</div>
							<div className="actionBox commonTitle">操作</div>
      	    </div>
      	    <MyComponent config = {data}  />
      	  </Card>
        </div>
      </QueueAnim>
    )
  }
}