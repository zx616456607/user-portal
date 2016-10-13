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
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NormalDeployBox from './AppDeployComponents/NormalDeployBox.js'
import AssitDeployBox from './AppDeployComponents/AssitDeployBox.js'
import UsefulDeployBox from './AppDeployComponents/UsefulDeployBox.js'
import ComposeDeployBox from './AppDeployComponents/ComposeDeployBox.js'
import EnviroDeployBox from './AppDeployComponents/EnviroDeployBox.js'
import "./style/AppDeployServiceModal.less"
const Deployment = require('../../../../kubernetes/objects/deployment')
const Service = require('../../../../kubernetes/objects/service')
const Panel = Collapse.Panel;
const createForm = Form.create;

class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
    this.submitNewService = this.submitNewService.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      instanceNum:1,
      composeType:"1",
      runningCode:"1",
      getImageType:"1",
      stateService:false,
      currentDate:false,
      volumeSwitch:false,
      getUsefulType:"null",
    }
  }
  componentWillMount() {
    
  }
  submitNewService(e,parentScope){
  	e.preventDefault();
    
  	const scope = this.state;
  	let composeType = scope.composeType;
    let portKey = this.props.form.getFieldValue('portKey')
    let envKey = this.props.form.getFieldValue('envKey')
    let volKey = this.props.form.getFieldValue('volKey')
    let serviceName = this.props.form.getFieldProps('name').value    //服务名
    let instanceNum = scope.instanceNum     //容器数量
    let imageVersion = this.props.form.getFieldProps('imageVersion').value    //镜像版本
    let volumeSwitch = this.props.form.getFieldProps('volumeSwitch').value //服务类型
    let volumePath = this.props.form.getFieldProps('volumePath').value   //服务路径
    let volumeName = this.props.form.getFieldProps('volumeName').value   //服务名称
    let volumeChecked = this.props.form.getFieldProps('volumeChecked').value   //服务只读
    let livePort = this.props.form.getFieldProps('livePort').value   //高可用端口
    let liveInitialDelaySeconds = this.props.form.getFieldProps('liveInitialDelaySeconds').value //首次延时
    let liveTimeoutSeconds = this.props.form.getFieldProps('liveTimeoutSeconds').value //检查超时
    let livePeriodSeconds = this.props.form.getFieldProps('livePeriodSeconds').value //检查间隔
    let livePath = this.props.form.getFieldProps('livePath').value //高可用路径
    let args = this.props.form.getFieldProps('args').value //高可用路径
    let image = parentScope.state.registryServer + '/' + parentScope.state.currentSelectedImage +':'+ imageVersion //镜像名称
    
    let deploymentList = new Deployment(serviceName)
    let serviceList = new Service(serviceName)
    
    var ImageConfig = {
      resources: {
        limits: {
          memory: "256Mi"
        },
        requests: {
          cpu: "60m",
          memory: "256Mi"
        }
      },
      cal:'1C/256M'
    };    //配置判断
    (function showConfig(composeType) {
      switch (composeType){
        case '1':
          ImageConfig={
            resources: {
              limits: {
                memory: "256Mi"
              },
              requests: {
                cpu: "60m",
                memory: "256Mi"
              }
            },
            cal:'1C/256M'
          }
          return
        case '2':
          ImageConfig = {
            resources: {
              limits: {
                memory: "512Mi"
              },
              requests: {
                cpu: "125m",
                memory: "512Mi"
              }
            },
            cal:'1C/512M'
          }
          return
        case '4':
          ImageConfig = {
            resources: {
              limits: {
                memory: "1024Mi"
              },
              requests: {
                cpu: "250m",
                memory: "1024Mi"
              }
            },
            cal:'1C/1G'
          }
          return
        case '8':
          ImageConfig = {
            resources: {
              limits: {
                memory: "2048Mi"
              },
              requests: {
                cpu: "500m",
                memory: "2048Mi"
              }
            },
            cal:'1C/2G'
          }
          return
        case '16':
          ImageConfig = {
            resources: {
              limits: {
                memory: "4096Mi"
              },
              requests: {
                cpu: "1000m",
                memory: "4096Mi"
              }
            },
            cal:'1C/4G'
          }
          return
        case '32':
          ImageConfig = {
            resources: {
              limits: {
                memory: "8192Mi"
              },
              requests: {
                cpu: "2000m",
                memory: "8192Mi"
              }
            },
            cal:'2C/8G'
          }
          return
        default :
          ImageConfig = {
            resources: {
              limits: {
                memory: "125Mi"
              },
              requests: {
                cpu: "60m",
                memory: "125Mi"
              }
            },
            cal:'1C/256M'
          }
          return
      }
    })(composeType)
    
    /*Deployment*/
    deploymentList.setReplicas(instanceNum)
    deploymentList.addContainer(serviceName, image)
    deploymentList.setContainerResources(serviceName, ImageConfig.resources.limits.memory)
    //ports
    if(portKey){
      this.props.form.getFieldValue('portKey').map((k) => {
        if(this.props.form.getFieldProps(`portUrl${k}`).value){
          serviceList.addPort(
            serviceName+'-'+k,
            this.props.form.getFieldProps(`portType${k}`).value.toUpperCase(),
            parseInt(this.props.form.getFieldProps(`portUrl${k}`).value),
            parseInt(this.props.form.getFieldProps(`targetPortUrl${k}`).value),
          )
        } else {
          serviceList.addPort(
            serviceName+'-'+k,
            this.props.form.getFieldProps(`portType${k}`).value.toUpperCase(),
            parseInt(this.props.form.getFieldProps(`targetPortUrl${k}`).value),
          )
        }
        deploymentList.addContainerPort(
          serviceName,
          parseInt(this.props.form.getFieldProps(`targetPortUrl${k}`).value),
          this.props.form.getFieldProps(`portType${k}`).value.toUpperCase()
        )
      })
    }
    //env
    if(envKey){
      this.props.form.getFieldValue('envKey').map((k) => {
        deploymentList.addContainerEnv(
          serviceName,
          this.props.form.getFieldProps(`envName${k}`).value ,
          this.props.form.getFieldProps(`envValue${k}`).value
        )
      })
    }
    //args 执行命令
    if(this.state.runningCode === '2'){
      deploymentList.addContainerArgs(serviceName, args)
    }
    //command
    //imagePullPolicy 重新部署
    if(scope.getImageType === '2'){
      deploymentList.setContainerImagePullPolicy(serviceName,'Always')
    } else {
      deploymentList.setContainerImagePullPolicy(serviceName)
    }
    //时区设置
    if(this.state.currentDate){
      deploymentList.syncTimeZoneWithNode(serviceName)
    }
    //volumes
    if(this.state.volumeSwitch){
      this.props.form.getFieldValue('volumeKey').map((k) => {
        if(volumeChecked){
          deploymentList.addContainerVolume(serviceName, {
            name: this.props.form.getFieldProps(`volName${k}`).value +'-'+k,
            fsType: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[0],
            image: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[1]
          }, {
            mountPath: '/test/mount',
            readOnly:true
          })
        } else {
          deploymentList.addContainerVolume(serviceName, {
            name: this.props.form.getFieldProps(`volName${k}`).value +'-'+k,
            fsType: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[0],
            image: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[1]
          }, {
            mountPath: '/test/mount',
          })
        }
      })
    }
    //livenessProbe 高可用
    if(this.state.getUsefulType !== 'null'){
      deploymentList.setLivenessProbe(serviceName, this.state.getUsefulType.toUpperCase(), {
        port: parseInt(livePort),
        path: livePath,
        initialDelaySeconds: liveInitialDelaySeconds,
        timeoutSeconds: liveTimeoutSeconds,
        periodSeconds: livePeriodSeconds
      })
    }
    /*Service*/
    let serviceConfig = {
      Service: deploymentList,
      Deployment: serviceList
    }
    const newService = {id:serviceName,name:serviceName,imageName:image,resource:ImageConfig.cal,inf:serviceConfig}
    const serviceScope = this.props.scope
    const newList = serviceScope.state.servicesList
    const newSeleList = serviceScope.state.selectedList
    serviceScope.state.servicesList.push(newService)
    if (!serviceScope.state.selectedList.includes(serviceName)) {
      serviceScope.state.selectedList.push(serviceName)
    }
    serviceScope.setState({
      servicesList: newList,
      selectedList: newSeleList
    })
    /*parentScope.setState({
      modalShow:false,
    });*/
    parentScope.setState({
      serviceModalShow:false
    })
  }
  closeModal(){
    const parentScope = this.props.scope;
    /*parentScope.setState({
      modalShow:false,

    });*/
    parentScope.setState({
      serviceModalShow:false
    })
  }
  render() {
  	const scope = this
  	const parentScope = this.props.scope
    const {servicesList} = parentScope.state.servicesList
    const {currentSelectedImage, registryServer} = parentScope.state
  
    return (
	  <div id="AppDeployServiceModal">
    	<Form horizontal form={this.props.form}>
    		<NormalDeployBox scope={scope} registryServer={registryServer} currentSelectedImage={currentSelectedImage} />
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

export default AppDeployServiceModal




// export default AppDeployServiceModal

