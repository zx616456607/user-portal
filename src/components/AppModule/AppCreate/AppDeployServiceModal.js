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
      volumesList:[],
    	enviroList:[],
    	portList:[],
      depPortList:[],
      annotationsList:{},
      volumeSwitch:false,
    }
  }
  componentWillMount() {
    
  }
  
  submitNewService(e,parentScope){
  	//the function for user submit new service
  	e.preventDefault();
  	this.props.form.validateFields((errors, values) => {
  	  
    });
  
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
    let instanceNum = scope.instanceNum;                             //容器数量
    //let imageURL = this.props.form.getFieldProps('imageUrl').value   //镜像地址
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
    
    const { volumeMountList,volumesList,enviroList,portList,depPortList,annotationsList } = this.state
    
    if(portKey){
      this.props.form.getFieldValue('portKey').map((k) => {
        if(this.props.form.getFieldProps(`portUrl${k}`).value){
          if(this.props.form.getFieldProps(`portType${k}`).value === 'udp'){
            this.state.portList.push({
              name: serviceName+'-'+k,
              targetPort: this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
              port: this.props.form.getFieldProps(`portUrl${k}`).value,
              protocol: 'UDP'
            })
          } else {
            this.state.portList.push({
              name: serviceName+'-'+k,
              targetPort: this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
              port: this.props.form.getFieldProps(`portUrl${k}`).value,
              protocol: 'TCP'
            })
          }
        } else {
          if(this.props.form.getFieldProps(`portType${k}`).value === 'udp'){
            this.state.portList.push({
              name: serviceName+'-'+k,
              targetPort: this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
              protocol: 'UDP'
            })
          } else {
            this.state.portList.push({
              name: serviceName+'-'+k,
              targetPort: this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
              protocol: 'TCP'
            })
          }
        }
        if(this.props.form.getFieldProps(`portType${k}`).value === 'udp'){
          this.state.depPortList.push({
            'containerPort': this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
            'protocol' : 'UDP'
          })
          Object.assign(this.state.annotationsList,{
            [serviceName+'-'+k] : 'UDP'
          })
        } else {
          this.state.depPortList.push({
            'containerPort' : this.props.form.getFieldProps(`targetPortUrl${k}`).value ,
            'protocol' : 'TCP'
          })
          Object.assign(this.state.annotationsList,{
            [serviceName+'-'+k] :'TCP'
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
        this.state.volumesList.push({
          'name': this.props.form.getFieldProps(`volName${k}`).value ,
          'mountPath': this.props.form.getFieldProps(`volPath${k}`).value
        })
      })
    }
    
    if(this.state.volumeSwitch){
      this.props.form.getFieldValue('volumeKey').map((k) => {
        if(volumeChecked){
          this.state.volumeMountList.push({
            name: 'volume-'+k,
            mountPath: '/var/www/html',
            readOnly: true,
          })
        } else {
          this.state.volumeMountList.push({
            'name': this.props.form.getFieldProps(`volName${k}`).value +'-'+k,
            'mountPath': '/var/www/html',
          })
        }
        this.state.volumesList.push({
          name: 'volume-'+k,
          fsType: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[0],
          image: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[1]
        })
      })
    }
    
    //containerObj.image = imageURL+':'+imageVersion   //镜像地址
    
    /*container*/
    //name
    containerObj.name = serviceName
    //image
    containerObj.image = parentScope.state.currentSelectedImage + '/' + parentScope.state.registryServer +':'+ imageVersion
    //ports 容器端口
    if(portList.length !== 0){
      Object.assign(containerObj,{
        ports: depPortList,
      })
    }
    //环境变量
    if(enviroList.length !== 0){
      Object.assign(containerObj,{
        env: enviroList,
      })
    }
    //resources 容器配置
    containerObj.resources = ImageConfig.resources
    //args 执行命令
    if(this.state.runningCode === '2'){
      containerObj.args = [args]
    }
    //imagePullPolicy 重新部署
    if(scope.getImageType === '2'){
      containerObj.imagePullPolicy = 'is'
    }
    //volumeMounts 服务类型
    if(this.state.volumeSwitch){
      Object.assign(containerObj,{
        volumeMounts: volumeMountList
      })
    }
    //livenessProbe
    if(this.state.getUsefulType === 'http'){
      Object.assign(containerObj,{
        livenessProbe: {
          httpGet: {
            port: livePort,
            path: livePath,
          },
          initialDelaySeconds: liveInitialDelaySeconds,
          timeoutSeconds: liveTimeoutSeconds,
          periodSeconds: livePeriodSeconds
        }
      })
    } else if(this.state.getUsefulType === 'tcp') {
      Object.assign(containerObj,{
        livenessProbe: {
          tcpSocket: {
            port: livePort
          },
          initialDelaySeconds: liveInitialDelaySeconds,
          timeoutSeconds: liveTimeoutSeconds,
          periodSeconds: livePeriodSeconds
        }
      })
    }
    console.log('containerObj------------------');
    console.log(containerObj);
    console.log('containerObj------------------');
    /*pod*/
    podObj.spec.containers.push(containerObj)
    //name
    podObj.metadata.labels.name = serviceName
    //volumes
    if(this.state.volumeSwitch){
      podObj.spec.volumes = volumesList
    }
    //时区设置
    if(this.state.currentDate){
      Object.assign(podObj.spec.volumes,{
        name: "tenxcloud-time-zone",
        hostPath: {
          path: "/etc/localtime"
        }
      })
      Object.assign(containerObj.volumeMounts,{
        "name": "tenxcloud-time-zone",
        "mountPath": "/etc/localtime",
        "readOnly": true
      })
    }
    
    /*Deployment*/
    deploymentObj.spec.template = podObj
    //metadata
    deploymentObj.metadata.name = serviceName
    deploymentObj.metadata.labels.name = serviceName
    //replicas
    deploymentObj.spec.replicas = instanceNum
    //selector
    deploymentObj.spec.selector.name = serviceName
    console.log('deploymentObj------------------');
    console.log(deploymentObj);
    console.log('deploymentObj------------------');
    /*Service*/
    //服务名称
    serviceObj.metadata.name = serviceName
    serviceObj.metadata.labels.name = serviceName
    //
    serviceObj.metadata.annotations = annotationsList
    serviceObj.spec.ports = portList
    console.log('serviceObj------------------');
    console.log(serviceObj);
    console.log('serviceObj------------------');
    
    /*let serviceConfig = {
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
    }*/
    let serviceConfig = {
      Service: serviceObj,
      Deployment: deploymentObj
    }
    console.log('serviceConfig------------------');
    console.log(serviceConfig);
    console.log('serviceConfig------------------');
  
    const newService = {id:serviceName,name:serviceName,imageName:containerObj.image,resource:ImageConfig.cal,inf:serviceConfig}
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

