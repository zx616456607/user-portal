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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import NormalDeployBox from './AppDeployComponents/NormalDeployBox.js'
import AssitDeployBox from './AppDeployComponents/AssitDeployBox.js'
import UsefulDeployBox from './AppDeployComponents/UsefulDeployBox.js'
import ComposeDeployBox from './AppDeployComponents/ComposeDeployBox.js'
import EnviroDeployBox from './AppDeployComponents/EnviroDeployBox.js'
import "./style/AppDeployServiceModal.less"
import { loadServiceList , createService } from '../../../actions/app_manage'

const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
       
    this.submitNewService = this.submitNewService.bind(this);
    this.state = {
    	composeType:"1",
    	stateService:false,
    	instanceNum:1,
    	runningCode:"1",
    	getImageType:"1",
    	currentDate:false,
    	getUsefulType:"null",
    	volumeMountList:[],
    	enviroList:[],
    	portList:[],
    }
  }
  componentWillMount() {
    const { cluster, appName, loadServiceList } = this.props
    /*loadServiceList(cluster, appName)*/
    this.setState = {}
  }
  
  submitNewService(e,parentScope){
  	//the function for user submit new service
  	e.preventDefault();
  	this.props.form.validateFields((errors, values) => {
      //console.log(errors)
      //console.log(values)
    });
  	const scope = this.state;
  	let composeType = scope.composeType;
    let getImageType = scope.getImageType === '2'
    let portKey = this.props.form.getFieldValue('portKey')
    let envKey = this.props.form.getFieldValue('envKey')
    let volKey = this.props.form.getFieldValue('volKey')
    
    if(portKey){
      this.props.form.getFieldValue('portKey').map((k) => {
        this.state.portList.push({"containerPort": this.props.form.getFieldProps(`portUrl${k}`).value })
      })
    }
    if(envKey){
      this.props.form.getFieldValue('envKey').map((k) => {
        this.state.enviroList.push({
          "name": this.props.form.getFieldProps(`envName${k}`).value ,
          "value": this.props.form.getFieldProps(`envValue${k}`).value
        })
      })
    }
    if(volKey){
      this.props.form.getFieldValue('volKey').map((k) => {
        this.state.volumeMountList.push({
          "name": this.props.form.getFieldProps(`volName${k}`).value ,
          "mountPath": this.props.form.getFieldProps(`volPath${k}`).value
        })
      })
    }
    var limits = {};
    (function showConfig(composeType) {
      switch (composeType){
        case '1':
          return limits={
            "cpu": "60m",
            "memory": "125Mi"
          }
        case '2':
          return limits={
            "cpu": "125m",
            "memory": "512Mi"
          }
        case '3':
          return limits={
            "cpu": "250m",
            "memory": "1024Mi"
          }
        case '4':
          return limits={
            "cpu": "500m",
            "memory": "2048Mi"
          }
        case '5':
          return limits={
            "cpu": "1000m",
            "memory": "4096Mi"
          }
        case '6':
          return limits={
            "cpu": "2000m",
            "memory": "8192Mi"
          }
        default :
          return limits={
            "cpu": "60m",
            "memory": "125Mi"
          }
      }
    })(composeType)
    
    let serviceName = this.props.form.getFieldProps('name').value    //服务名
    let instanceNum = scope.instanceNum;                             //容器数量
    let imageURL = this.props.form.getFieldProps('imageUrl').value   //镜像地址
    const volumeName = this.props.form.getFieldProps('volumeName').value //服务类型
    const livePort = this.props.form.getFieldProps('livePort').value //高可用端口
    const liveInitialDelaySeconds = this.props.form.getFieldProps('liveInitialDelaySeconds').value //首次延时
    const liveTimeoutSeconds = this.props.form.getFieldProps('liveTimeoutSeconds').value //检查超时
    const livePeriodSeconds = this.props.form.getFieldProps('livePeriodSeconds').value //检查间隔
    const livePath = this.props.form.getFieldProps('livePath').value //高可用路径
    
    const { volumeMountList,enviroList,portList } = this.state
    let serviceConfig = {
        [serviceName]: {
          "replicas": instanceNum,
          "containers": [
            {
              "name": serviceName,
              "image": imageURL,
              "ports": portList,
              "syncTimeZoneWithNode": getImageType,
              "env": enviroList,
              "volumeMounts": volumeMountList,
              "resources": {
                "limits": limits
              },
              "livenessProbe": {
                "httpGet": {
                  "path": livePath,
                  "port": livePort
                },
                "initialDelaySeconds": liveInitialDelaySeconds,
                "timeoutSeconds": liveTimeoutSeconds,
                "periodSeconds": livePeriodSeconds
              }
            }
          ],
          "volumes": [
            {
              "name": volumeName
            }
          ],
        },
    }
    
    // console.log('================');
    // console.log(serviceConfig);
    const newService = {id:serviceName,name:serviceName,imageName:'Linux',resource:'resource',inf:serviceConfig}
    
    
    let self = this
    this.props.createService('default','app_name',newService, {
      success: {
        func: () => {
          console.log('create');
          self.state={
            composeType:"1",
            stateService:false,
            instanceNum:1,
            runningCode:"1",
            getImageType:"1",
            currentDate:false,
            getUsefulType:"null",
            volumeMountList:[],
            enviroList:[],
            portList:[]
          }
          /*console.log(self);
          parentScope.props.scope.state.servicesList.push(newService)
          console.log(parentScope);
          console.log(parentScope.props.scope.state.servicesList);
          parentScope.setState({
            modalShow:false
          });*/
          //this.props.serviceList.push(newService)
          this.props.scope.props.scope.state.servicesList.push(newService)
          const newList = this.props.scope.props.scope.state.servicesList
          this.props.scope.props.scope.setState({
            servicesList: newList
          })
          console.log('newService =========');
          console.log(newList);
          console.log('newService =========');
          parentScope.setState({
            modalShow:false
          });
        },
        isAsync: true
      },
    })
  }
  closeModal(){
    //the function for close the deploy new service modal
    this.setState({
      modalShow:false
    });
  }
  render() {
  	const scope = this;
  	const parentScope = this.props.scope;
    const {createService,cluster,appName} = this.props
    const {servicesList} = parentScope.props.scope.state.servicesList
  
  
    return (
	  <div id="AppDeployServiceModal">
    	<Form horizontal form={this.props.form}>
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
	      	<Button className="createBtn" size="large" type="primary"
                  onClick={(e) => this.submitNewService(e,parentScope)}
                  servicesList={servicesList}>
	      		创建
	      	</Button>
      	</div>
	   </Form>
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
AppDeployServiceModal = createForm()(AppDeployServiceModal);
AppDeployServiceModal.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const app_name = 'test1'
  
  const defaultServices = {
    isFetching: false,
    cluster: 'default',
    appName: app_name,
    serviceList: []
  }
  const {
    services
  } = state
  let targetServices
  if (services['default'] && services['default'][app_name]) {
    targetServices = services['default'][app_name]
  }
  const { cluster, serviceList, isFetching } = targetServices || defaultServices
  return {
    cluster,
    appName: app_name,
    serviceList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  createService,loadServiceList
})(AppDeployServiceModal)




// export default AppDeployServiceModal

