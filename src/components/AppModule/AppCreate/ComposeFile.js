/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ComposeFile component
 * 
 * v0.1 - 2016-09-20
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown,Modal,Checkbox,Button,Card,Menu,Input,Select , } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {createApp} from '../../../actions/app_manage'
import * as yaml from 'js-yaml'
const Option = Select.Option;

const operaMenu = (<Menu>
					  <Menu.Item key="0">
						重新部署
					  </Menu.Item>
					  <Menu.Item key="1">
						弹性伸缩
					  </Menu.Item>
					  <Menu.Item key="2">
						灰度升级
					  </Menu.Item>
					  <Menu.Item key="3">
						更改配置
					  </Menu.Item>
					</Menu>);

class ComposeFile extends Component {
  constructor(props) {
    super(props);
    this.subApp=this.subApp.bind(this)
    this.handleAppName=this.handleAppName.bind(this)
    this.handleCluster=this.handleCluster.bind(this)
    const serviceList = JSON.parse(localStorage.getItem('servicesList'))
    const desc = {
      "version": "1.0",
      "services": {}
    }
    serviceList.map(function (item) {
      console.log(item.inf);
      Object.assign(desc.services, item.inf)
    })
    this.state = {
      appName : '',
      appDesc: desc,
      appDescYaml: yaml.dump(desc),
      cluster: ''
    }
  }
  subApp(){
    const remark = ''
    const {appName, appDescYaml} = this.state
    console.log(appName);
    let appConfig={
      cluster:this.state.cluster,
      desc:appDescYaml,
      appName:appName,
      remark:remark,
    }
    let self = this
    this.props.createApp(appConfig, {
      success: {
        func: () => {
          self.setState({
            appName:''
          })
          console.log('sub')
          localStorage.removeItem('servicesList')
        },
        isAsync: true
      },
    })
    /*createApp('default',appName,desc,remark)
    console.log('sub');*/
    //localStorage.removeItem('servicesList')
  }
  handleAppName(e){
    this.setState({
      appName: e.target.value
    })
  }
  handleCluster(value) {
    console.log(`${value}`);
    this.setState({
      cluster: `${value}`
    })
    console.log(this.state.cluster);
  }
  
  render() {
    const {appName, appDescYaml} = this.state
  	const serviceList = JSON.parse(localStorage.getItem('servicesList'))
    const inf = JSON.stringify(serviceList[0].inf)
    console.log('-----local------');
    console.log(serviceList);
    console.log(serviceList[0].inf);
    console.log('-----local------');
  	const parentScope = this.props.scope;
  	const createModel = parentScope.state.createModel;
  	let backUrl = backLink(createModel);
    return (
	    <QueueAnim id="ComposeFile"
	      type="right"
	    >
	      <div className="ComposeFile" key="ComposeFile">
	        <div className="nameBox">
	          <span>应用名称</span>
	          <Input size="large" placeholder="起一个萌萌哒的名称吧~" onChange={this.handleAppName} value={appName}/>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="introBox">
	          <span>添加描述</span>
	          <Input size="large" placeholder="写一个萌萌哒的描述吧~" />
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="composeBox">
	          <div className="topBox">
	            <span>编排类型</span>
	            <span>tenxcloud.yaml</span>
	            <Button size="large" type="primary">
	              选择编排
	            </Button>
	            <div style={{ clear:"both" }}></div>
	          </div>
	          <div className="bottomBox">
	            <span>描述文件</span>
	            <div className="textareaBox">
	              <div className="operaBox">
	                <i className="fa fa-expand"></i>
	                <i className="fa fa-star-o"></i>
	              </div>
	              <textarea value={appDescYaml}></textarea>
	            </div>
	            <div style={{ clear:"both" }}></div>
	          </div>          
	        </div>
	        <div className="envirBox">
	          <span>部署环境</span>
	          <Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large" type="ghost">
	            请选择空间
	            <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>
	        {/*<Dropdown overlay={operaMenu} trigger={['click']}>
	          <Button size="large" type="ghost">
	            请选择集群
	            <i className="fa fa-caret-down"></i>
	          </Button>
	        </Dropdown>*/}
            <Select size="large" defaultValue="请选择集群" style={{ width: 200 }} onChange={this.handleCluster}>
              <Option value="cce1c71ea85a5638b22c15d86c1f61de">test</Option>
              <Option value="cce1c71ea85a5638b22c15d86c1f61df">产品环境</Option>
              <Option value="e0e6f297f1b3285fb81d27742255cfcf">SUSE</Option>
            </Select>
	        </div>
	        <div className="btnBox">
	          <Link to={`${backUrl}`}>
	            <Button size="large" type="primary" className="lastBtn">
	              上一步
	            </Button>
	          </Link>
	          {/*<Link to={`/app_manage`}>*/}
	            <Button size="large" type="primary" className="createBtn" onClick={this.subApp}>
	              创建
	            </Button>
	          {/*</Link>*/}
	        </div>
	      </div>  
        </QueueAnim>
    )
  }
}

ComposeFile.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state) {
  return {
    createApp: state.apps.createApp,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createApp: (appConfig, callback) => {
      dispatch(createApp(appConfig, callback))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ComposeFile, {
  withRef: true,
}))

function backLink(createModel){
	switch(createModel){
		case "fast":
		  return "/app_manage/app_create/fast_create";
		  break;
		case "store":
		  return "/app_manage/app_create/app_store";
		  break;
		case "layout":
		  return "/app_manage/app_create";
		  break;
	}
}
