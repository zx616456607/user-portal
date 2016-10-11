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
import { DEFAULT_CLUSTER } from '../../../constants'
import { cloneDeep } from 'lodash'
import container from '../../../../templates/k8s/container.json'
import deployment from '../../../../templates/k8s/deployment.json'
import pod from '../../../../templates/k8s/pod.json'
import service from '../../../../templates/k8s/service.json'


const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
       
    this.submitNewService = this.submitNewService.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
      depPortList:[],
    }
  }
  componentWillMount() {
    
  }
  
  submitNewService(e,parentScope){
  	//the function for user submit new service
  	e.preventDefault();
  	this.props.form.validateFields((errors, values) => {
  	  
    });
  
    let appObj = cloneDeep(app)
    let containerObj = cloneDeep(container)
    let deploymentObj = cloneDeep(deployment)
    let podObj = cloneDeep(pod)
    let serviceObj = cloneDeep(service)
    
  	const scope = this.state;
  	let composeType = scope.composeType;
    let portKey = this.props.form.getFieldValue('portKey')
    let envKey = this.props.form.getFieldValue('envKey')
    let volKey = this.props.form.getFieldValue('volKey')
  
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
    };
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
  
    let serviceName = this.props.form.getFieldProps('name').value    //服务名
    let volumeChecked = this.props.form.getFieldProps('volumeChecked')    //服务类型只读
    let instanceNum = scope.instanceNum;                             //容器数量
    //let imageURL = this.props.form.getFieldProps('imageUrl').value   //镜像地址
    let imageVersion = this.props.form.getFieldProps('imageVersion').value    //镜像版本
    let volumeSwitch = this.props.form.getFieldProps('volumeSwitch').value //服务类型
    let volumePath = this.props.form.getFieldProps('volumePath').value   //服务路径
    let volumeName = this.props.form.getFieldProps('volumeName').value   //服务名称
    const livePort = this.props.form.getFieldProps('livePort').value   //高可用端口
    const liveInitialDelaySeconds = this.props.form.getFieldProps('liveInitialDelaySeconds').value //首次延时
    const liveTimeoutSeconds = this.props.form.getFieldProps('liveTimeoutSeconds').value //检查超时
    const livePeriodSeconds = this.props.form.getFieldProps('livePeriodSeconds').value //检查间隔
    const livePath = this.props.form.getFieldProps('livePath').value //高可用路径
    const { volumeMountList,enviroList,portList,depPortList } = this.state
    
    if(portKey){
      this.props.form.getFieldValue('portKey').map((k) => {
        if(this.props.form.getFieldProps(`portUrl${k}`).value){
          this.state.portList.push({
            'name': serviceName+'-'+k,
            'targetPort': this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
            'ports': this.props.form.getFieldProps(`portUrl${k}`).value
          })
          this.state.depPortList.push({
            'name': 'hhhh',
            'containerPort': this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
          })
        } else {
          this.state.portList.push({
            'name': 'hhhh',
            'targetPort': this.props.form.getFieldProps(`targetPortUrl${k}`).value
          })
          this.state.depPortList.push({
            'name': 'hhhh',
            'containerPort': this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
          })
        }
      })
    }
    if(envKey){
      this.props.form.getFieldValue('envKey').map((k) => {
        this.state.enviroList.push({
          'name': this.props.form.getFieldProps(`envName${k}`).value ,
          'value': this.props.form.getFieldProps(`envValue${k}`).value
        })
      })
    }
    if(volKey){
      this.props.form.getFieldValue('volKey').map((k) => {
        this.state.volumeMountList.push({
          'name': this.props.form.getFieldProps(`volName${k}`).value ,
          'mountPath': this.props.form.getFieldProps(`volPath${k}`).value
        })
      })
    }
    console.log(this.props.form.getFieldValue('volumeKey'));
    console.log(volumeSwitch);
    if(volumeSwitch){
      this.props.form.getFieldValue('volumeKey').map((k) => {
        this.state.volumeMountList.push({
          'name': this.props.form.getFieldProps(`volName${k}`).value +'-'+k,
          'mountPath': this.props.form.getFieldProps(`volPath${k}`).value
        })
      })
    }
    
    serviceObj.metadata.name = serviceName //服务名称
    //containerObj.image = imageURL+':'+imageVersion   //镜像地址
    containerObj.resources = ImageConfig.resources   //容器配置
    //服务类型
    if(volumeSwitch){
      Object.assign(serviceConfig,{
        "volumes": [
          {
            "name": volumeName
          }
        ]
      })
      Object.assign(containerObj,{
        "volumeMounts": volumeMountList
      })
    }
    
    
    let serviceConfig = {
        [serviceName]: {
          "replicas": instanceNum,
          "containers": [
            {
              "name": serviceName,
              "image": '',
              "resources": {
                "limits": ImageConfig.limits
              },
            }
          ],
        },
    }
    let serviceConfigService = {
      kind: 'Service',
      apiVersion: 'v1',
      metadata:{name: serviceName},
      spec: {
        selector: {name: serviceName},
      }
    }
    let serviceConfigDeployment = {
      kind: 'Deployment',
      apiVersion: 'v1',
      metadata:{name: serviceName},
      spec: {
        replicas: instanceNum,
        template: {
          metadata: {
            name: serviceName
          },
          labels: {
            name: serviceName
          },
          spec: {
            containers: [
              {
                name: serviceName,
                image: ''+':'+imageVersion,
                imagePullPolicy : 'is'
              },
            ]
          }
        }
      },
      
    }
    
    //
    if(this.state.getUsefulType === 'http'){
      Object.assign(serviceConfig[serviceName].containers[0],{
        "livenessProbe": {
          "httpGet": {
            "path": livePath,
            "port": livePort
          },
          "initialDelaySeconds": liveInitialDelaySeconds,
          "timeoutSeconds": liveTimeoutSeconds,
          "periodSeconds": livePeriodSeconds
        }
      })
    } else if(this.state.getUsefulType === 'tcp') {
      Object.assign(serviceConfig[serviceName].containers[0],{
        "livenessProbe": {
          "tcpSocket": {
            "port": livePort
          },
          "initialDelaySeconds": liveInitialDelaySeconds,
          "timeoutSeconds": liveTimeoutSeconds,
          "periodSeconds": livePeriodSeconds
        }
      })
    }
    //
    if(enviroList.length !== 0){
      Object.assign(serviceConfig[serviceName].containers[0],{
        "env": enviroList,
      })
    }
    //容器端口
    if(portList.length !== 0){
      Object.assign(serviceConfig[serviceName].containers[0],{
        ports: portList,
      })
    }
    //
    if(portList.length !== 0){
      Object.assign(serviceConfigService.spec,{
        ports: portList,
      })
      Object.assign(serviceConfigDeployment.spec.template.spec.containers[0],{
        ports: depPortList,
      })
    }
    
    //
    if(volumeMountList.length !== 0){
      Object.assign(serviceConfig[serviceName].containers[0],{
        "volumeMounts": volumeMountList,
      })
    }
    //重新部署
    if(scope.getImageType === '2'){
      serviceConfig[serviceName].containers[0].imagePullPolicy = 'Always'
    }
    if(scope.getImageType === '1'){
      serviceConfigDeployment.spec.template.spec.containers[0].imagePullPolicy = 'Always'
    }
    
    console.log('ServiceConfig=================');
    console.log(serviceConfig);
    console.log('ServiceConfig=================');
    console.log('serviceConfigService=================');
    console.log(serviceConfigService);
    console.log('serviceConfigService=================');
    console.log('serviceConfigDeployment=================');
    console.log(serviceConfigDeployment);
    console.log('serviceConfigDeployment=================');
    
    
    
    const newService = {id:serviceName,name:serviceName,imageName:'',resource:ImageConfig.cal,inf:serviceConfig}
    const serviceScope = this.props.scope.props.scope
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
    parentScope.setState({
      modalShow:false
    });
  }
  closeModal(){
    const parentScope = this.props.scope;
    //the function for close the deploy new service modal
    parentScope.setState({
      modalShow:false
    });
  }
  render() {
  	const scope = this;
  	const parentScope = this.props.scope;
    const {createService,cluster,appName} = this.props
    const {servicesList} = parentScope.props.scope.state.servicesList
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

function mapStateToProps(state, props) {
  const app_name = 'test1'
  
  const defaultServices = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    appName: app_name,
    serviceList: []
  }
  const {
    services
  } = state
  let targetServices
  if (services[DEFAULT_CLUSTER] && services[DEFAULT_CLUSTER][app_name]) {
    targetServices = services[DEFAULT_CLUSTER][app_name]
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

