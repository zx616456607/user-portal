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
import { Form, Switch, Select, Collapse, Dropdown, Modal, Checkbox, Button, Card, Menu, Input, InputNumber, Radio, Icon } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NormalDeployBox from './AppDeployComponents/NormalDeployBox'
import AssitDeployBox from './AppDeployComponents/AssitDeployBox'
import UsefulDeployBox from './AppDeployComponents/UsefulDeployBox'
import ComposeDeployBox from './AppDeployComponents/ComposeDeployBox'
import EnviroDeployBox from './AppDeployComponents/EnviroDeployBox'
import "./style/AppDeployServiceModal.less"
import { connect } from 'react-redux'
import { CREATE_APP_ANNOTATIONS } from '../../../constants'

const Deployment = require('../../../../kubernetes/objects/deployment')
const Service = require('../../../../kubernetes/objects/service')
const Panel = Collapse.Panel;
const createForm = Form.create;
const FormItem = Form.Item;

let AppDeployServiceModal = React.createClass({
  propTypes: {
    cluster: PropTypes.string.isRequired,
    serviceList: PropTypes.array.isRequired,
  },
  getInitialState: function () {
    return {
      composeType: "1",
      runningCode: "1",
      getImageType: "1",
      stateService: false,
      currentDate: false,
      checkInf: null,
      disable: true,
      serNameErrState: '',
      disAdd: false,
    };
  },
  limits() {
    switch (this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].resources.limits.memory) {
      case '256Mi':
        return '1'
      case '512Mi':
        return '2'
      case '1024Mi':
        return '4'
      case '2048Mi':
        return '8'
      case '4096Mi':
        return '16'
      case '8192Mi':
        return '32'
      default:
        return '1'
    }
  },
  volumeSwitch(volumeMounts, form) {
    if (volumeMounts) {
      if (volumeMounts.length !== 0) {
        if (volumeMounts.length === 1) {
          if (volumeMounts[0].name === "tenxcloud-time-zone") {
            return false
          }
          return true
        }
        return true
      }
    }
    return false
  },
  getUsefulType(livenessProbe, form) {
    if (livenessProbe) {
      form.setFieldsValue({
        liveInitialDelaySeconds: livenessProbe.initialDelaySeconds,
        liveTimeoutSeconds: livenessProbe.timeoutSeconds,
        livePeriodSeconds: livenessProbe.periodSeconds,
      })
      if (livenessProbe.httpGet) {
        form.setFieldsValue({
          livePort: livenessProbe.httpGet.port,
          livePath: livenessProbe.httpGet.path,
        })
        return 'http'
      } else if (livenessProbe.tcpSocket) {
        form.setFieldsValue({
          livePort: livenessProbe.tcpSocket.port,
        })
        return 'tcp'
      }
    }
  },
  setEnv(env, form) {
    const envArr = []
    if (env) {
      env.map(function (item, index) {
        envArr.push((index + 1));
        form.setFieldsValue({
          envKey: envArr,
          ['envName' + (index + 1)]: item.name,
          ['envValue' + (index + 1)]: item.value,
        })
      })
    }
  },
  setPorts(ports, ServicePorts, form, annotations) {
    //this function for init port to form
    const portsArr = [] 
    if (!!ports && ports.length > 0 && !!annotations) {
      let tempAnnotations = annotations;
      let protocolList = tempAnnotations['tenxcloud.com/schemaPortname'].split(',');
      ports.map(function (item, index) {
        let protocol = null;
        let name = null;
        let proxyPort = null;
        ServicePorts.map((port) => {
          if(port.targetPort == item.containerPort) {
            name = port.name;
          }
        })
        protocolList.map((protocolDetail) => {
          if(protocolDetail.indexOf(name + "/") > -1) {
            let portDetail = protocolDetail.split('/')
            if (portDetail.length == 2) {
              protocol = portDetail[1]
            } else if (portDetail.length == 3) {
              protocol = portDetail[1]
              proxyPort = portDetail[2]
            }
          }
        });
        portsArr.push((index + 1));
        form.setFieldsValue({
          portKey: portsArr,
          ['targetPortUrl' + (index + 1)]: item.containerPort,
          ['portType' + (index + 1)]: protocol,
        })
        form.setFieldsValue({
          ['portUrl' + (index + 1)]: proxyPort,
        })
        if(protocol == 'TCP') {
          if (proxyPort) {
            form.setFieldsValue({
              ['portTcpType' + (index + 1)]: 'special',
            })
          } else {
            form.setFieldsValue({
              ['portTcpType' + (index + 1)]: 'auto',
            })
          }

        }
      })
    }
  },
  setForm() {
    const { scope } = this.props
    const { form } = this.props
    const { annotations } = this.props.scope.state.checkInf.Service.metadata;
    const volumeMounts = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].volumeMounts
    const livenessProbe = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].livenessProbe
    const env = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].env
    const ports = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].ports
    const ServicePorts = this.props.scope.state.checkInf.Service.spec.ports
    const volumes = this.props.scope.state.checkInf.Deployment.spec.template.spec.volumes
    let imageVersion = scope.state.checkInf.Deployment.spec.template.spec.containers[0].image.split(':')[1]
    const entryInput = scope.state.checkInf.Deployment.spec.template.spec.containers[0].commands
    const args = scope.state.checkInf.Deployment.spec.template.spec.containers[0].args
    form.setFieldsValue({
      name: scope.state.checkInf.Service.metadata.name,
      imageVersion: imageVersion,
      instanceNum: scope.state.checkInf.Deployment.spec.replicas,
      volumeSwitch: this.volumeSwitch(volumeMounts, form),
      getUsefulType: this.getUsefulType(livenessProbe, form),
      volumeMounts: volumeMounts,
      volumes: volumes
    })
    if (volumes) {
      let isHaveVolume = volumes.some(volume => {
        if (!volume.configMap) return true
      })
      if (isHaveVolume) {
        form.setFieldsValue({
          volumeSwitch: true
        })
      } else {
        form.setFieldsValue({
          volumeSwitch: false
        })
      }
    } else {
      form.setFieldsValue({
        volumeSwitch: false
      })
    }
    if (entryInput && entryInput != '') {
      form.setFieldsValue({
        entryInput: entryInput.join(' ')
      })
    }
    if (args && args != '') {
      form.setFieldsValue({
        args: args.join(' ')
      })
      // Set the customized radio and enable the input
      form.setFieldsValue({
       runningCode: "2"
      })
      this.setState({
        runningCode: "2"
      })
    }
    this.setEnv(env, form)
    this.setPorts(ports, ServicePorts, form, annotations)
    this.setState({
      composeType: this.limits(),
    })
  },
  componentWillMount() {
    document.title = '部署应用 | 时速云'
    if (!this.props.scope.state.isCreate) {
      this.setForm()
    }
  },
  componentWillReceiveProps(nextProps) {
    const {serviceOpen} = nextProps
    if (serviceOpen != this.props.serviceOpen && serviceOpen) {
      if (serviceOpen) {
        if (!this.props.scope.state.isCreate) {
          this.setForm()
        }
      }
    }
  },
  submitNewService() {
    const parentScope = this.props.scope
    const scope = this.state;
    const {getFieldValue, getFieldProps} = this.props.form
    let composeType = scope.composeType;
    let portKey = getFieldValue('portKey')
    let envKey = getFieldValue('envKey')
    let volKey = getFieldValue('volKey')
    let instanceNum = getFieldValue('instanceNum')     //容器数量
    let serviceName = getFieldProps('name').value    //服务名
    let imageVersion = getFieldProps('imageVersion').value    //镜像版本
    let volumeSwitch = getFieldProps('volumeSwitch').value //服务类型

    let livePort = getFieldProps('livePort').value   //高可用端口
    let liveInitialDelaySeconds = getFieldProps('liveInitialDelaySeconds').value //首次延时
    let liveTimeoutSeconds = getFieldProps('liveTimeoutSeconds').value //检查超时
    let livePeriodSeconds = getFieldProps('livePeriodSeconds').value //检查间隔
    let livePath = getFieldProps('livePath').value //高可用路径
    let command = getFieldProps('entryInput').value // 入口命令
    let args = getFieldProps('args').value //启动命令参数
    //let config = getFileProps('config').value
    const { registryServer, currentSelectedImage } = parentScope.state
    let image = registryServer + '/' + currentSelectedImage + ':' + imageVersion //镜像名称
    let deploymentList = new Deployment(serviceName)
    let serviceList = new Service(serviceName, this.props.cluster)

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
      cal: '1C/256M'
    }; //配置判断
    (function showConfig(composeType) {
      switch (composeType) {
        case '1':
          ImageConfig = {
            resources: {
              limits: {
                memory: "256Mi"
              },
              requests: {
                cpu: "60m",
                memory: "256Mi"
              }
            },
            cal: '1C/256M'
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
            cal: '1C/512M'
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
            cal: '1C/1G'
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
            cal: '1C/2G'
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
            cal: '1C/4G'
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
            cal: '2C/8G'
          }
          return
        default:
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
            cal: '1C/256M'
          }
          return
      }
    })(composeType)
    /*Deployment*/
    deploymentList.setReplicas(instanceNum)
    deploymentList.addContainer(serviceName, image)
    deploymentList.setContainerResources(serviceName, ImageConfig.resources.limits.memory)
    //ports
    if (portKey) {
      getFieldValue('portKey').map((k, index) => {
        let portType = getFieldProps(`portType${k}`).value;
        let newIndex = index + 1;
        // Fill in the service port info
        serviceList.addPort(
          serviceName + '-' + newIndex,
          getFieldProps(`portType${k}`).value.toUpperCase(),
          parseInt(getFieldProps(`targetPortUrl${k}`).value),
          parseInt(getFieldProps(`targetPortUrl${k}`).value) // Use the same port as container port by default
        )
        if(portType == 'HTTP') {
          // Add port annotation in advance
          serviceList.addPortAnnotation(serviceName + '-' + newIndex, portType)
        } else if(portType == 'TCP'){
          let tcpType = getFieldProps(`portTcpType${k}`).value;
          if(tcpType == 'auto') {
            // Leave port empty
            serviceList.addPortAnnotation(serviceName + '-' + newIndex, portType)
          } else if(tcpType == 'special') {
            // Add the port annotation
            let portUrl = getFieldProps(`portUrl${k}`).value;
            serviceList.addPortAnnotation(serviceName + '-' + newIndex, portType, portUrl)
          } else {
            // undefined
            serviceList.addPortAnnotation(serviceName + '-' + newIndex, portType)
          }
        }
        if (getFieldProps(`portType${k}`).value) {
          deploymentList.addContainerPort(
            serviceName,
            parseInt(getFieldProps(`targetPortUrl${k}`).value),
            getFieldProps(`portType${k}`).value.toUpperCase()
          )
        }
      })
    }
    //env
    if (envKey) {
      getFieldValue('envKey').map((k) => {
        deploymentList.addContainerEnv(
          serviceName,
          getFieldProps(`envName${k}`).value,
          getFieldProps(`envValue${k}`).value
        )
      })
    }
    //args 执行命令
    if (this.state.runningCode === '2') {
      deploymentList.addContainerArgs(serviceName, args)
    }
    if (command && command != "") {
      deploymentList.addContainerCommand(serviceName, command)
    }
    //command
    //imagePullPolicy 重新部署
    if (scope.getImageType === '2') {
      deploymentList.setContainerImagePullPolicy(serviceName, 'Always')
    } else {
      deploymentList.setContainerImagePullPolicy(serviceName)
    }
    //时区设置
    if (this.state.currentDate) {
      deploymentList.syncTimeZoneWithNode(serviceName)
    }
    //volumes
    if (getFieldValue('volumeSwitch')) {
      const cluster = this.props.cluster
      getFieldValue('volumeKey').map((k) => {
        let volumeChecked = getFieldProps(`volumeChecked${k}`).value   //服务只读
        let volumeInfo = getFieldProps(`volumeName${k}`).value
        if (!volumeInfo) {
          return
        }
        if(!getFieldProps(`volumePath${k}`).value){
          return
        }
        volumeInfo = volumeInfo.split('/')
        if (volumeChecked) {
          deploymentList.addContainerVolume(serviceName, {
            name: volumeInfo[0] + '-' + k,
            image: volumeInfo[0],
            fsType: volumeInfo[1]
          }, {
              mountPath: getFieldProps(`volumePath${k}`).value,
              readOnly: true
            })
        } else {
          deploymentList.addContainerVolume(serviceName, {
            name: volumeInfo[0] + '-' + k,
            image: volumeInfo[0],
            fsType: volumeInfo[1]
          }, {
              mountPath: getFieldProps(`volumePath${k}`).value,
            })
        }
      })
    }
    //配置文件
    if (getFieldValue('volKey') && getFieldValue('volKey') !== 'null') {
      let totalNumber = getFieldValue('volKey')
      totalNumber.forEach(item => {
        const vol = getFieldValue(`vol${item}`)
        const volPath = getFieldValue(`volPath${item}`)
        if (!vol) return
        if(!volPath) return
        if (vol.length <= 0) return
        deploymentList.addContainerVolume(serviceName, {
          name: `configmap-volume-${item}`,
          configMap: vol,
        }, {
            mountPath: volPath
          })
      })
    }
    //livenessProbe 高可用
    if ((getFieldValue('getUsefulType') !== 'null') && (getFieldValue('getUsefulType'))) {
      deploymentList.setLivenessProbe(serviceName, getFieldValue('getUsefulType').toUpperCase(), {
        port: parseInt(livePort),
        path: livePath,
        initialDelaySeconds: parseInt(liveInitialDelaySeconds),
        timeoutSeconds: parseInt(liveTimeoutSeconds),
        periodSeconds: parseInt(livePeriodSeconds)
      })
    }

    /*Service*/
    let serviceConfig = {
      Service: serviceList,
      Deployment: deploymentList,
    }
    const newService = { id: serviceName, name: serviceName, imageName: image, resource: ImageConfig.cal, inf: serviceConfig }
    const newList = parentScope.state.servicesList
    const newSeleList = parentScope.state.selectedList
    parentScope.state.servicesList.push(newService)
    if (!parentScope.state.selectedList.includes(serviceName)) {
      parentScope.state.selectedList.push(serviceName)
    }
    parentScope.setState({
      servicesList: newList,
      selectedList: newSeleList
    })
    // for add service
    const { onSubmitAddService } = this.props
    if (onSubmitAddService) {
      onSubmitAddService(serviceConfig)
    }
    this.props.form.resetFields()
    this.setState({
      composeType: "1",
      runningCode: "1",
      getImageType: "1",
      stateService: false,
      currentDate: false,
      checkInf: null,
      disable: true,
      serNameErrState: '',
    })
  },
  handleSubBtn(e) {
    const parentScope = this.props.scope
    const { form } = this.props
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    e.preventDefault()
    form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      if (parentScope.state.isCreate) {
        this.submitNewService()
      } else {
        const reviseServiceName = parentScope.state.checkInf.Service.metadata.name
        parentScope.state.selectedList.map((service, index) => {
          if (service === reviseServiceName) {
            parentScope.state.selectedList.splice(index, 1)
          }
        })
        parentScope.state.servicesList.map((service, index) => {
          if (service.id === reviseServiceName) {
            parentScope.state.servicesList.splice(index, 1)
          }
        })
        this.submitNewService()
      }
      this.props.form.resetFields()
      parentScope.setState({
        serviceModalShow: false,
        deployServiceModalShow: false, // for add service
      })
    })
  },
  closeModal() {
    const parentScope = this.props.scope;
    parentScope.setState({
      serviceModalShow: false,
      deployServiceModalShow: false, // for add service
    })
    this.props.form.resetFields()
    this.setState({
      composeType: "1",
      runningCode: "1",
      getImageType: "1",
      stateService: false,
      currentDate: false,
      checkInf: null,
      disable: true,
      serNameErrState: '',
    })
  },
  render: function () {
    const scope = this
    const parentScope = this.props.scope
    const {currentSelectedImage, registryServer, isCreate, other} = parentScope.state
    const { form, serviceOpen } = this.props
    const { composeType, disable } = this.state
    return (
      <div id="AppDeployServiceModal">
        <Form horizontal onSubmit={this.handleForm} >
          <NormalDeployBox
            scope={scope}
            registryServer={registryServer}
            currentSelectedImage={currentSelectedImage}
            serviceOpen={this.props.serviceOpen}
            isCreate={isCreate}
            composeType={composeType}
            form={form}
            cluster={this.props.cluster}
            other={other}
            />
          <Collapse>
            <Panel header={assitBoxTitle} key="1" className="assitBigBox">
              <AssitDeployBox scope={scope} form={form} />
            </Panel>
            <Panel header={usefulBoxitle} key="2" className="usefulBigBox">
              <UsefulDeployBox scope={scope} form={form} />
            </Panel>
            <Panel header={composeBoxTitle} key="3" className="composeBigBox">
              <ComposeDeployBox scope={scope} form={form} cluster={this.props.cluster} serviceOpen={this.props.serviceOpen} />
            </Panel>
            <Panel header={advanceBoxTitle} key="4">
              <EnviroDeployBox scope={scope} form={form} />
            </Panel>
          </Collapse>
          <div className="btnBox">
            <Button className="cancelBtn" size="large" type="ghost" onClick={this.closeModal}>
              取消
            </Button>
            <Button className="createBtn" size="large" type="primary"
              onClick={(e) => this.handleSubBtn(e)}
              htmlType="submit"
              >
              {parentScope.state.isCreate ? '创建' : '修改'}
            </Button>
          </div>
        </Form>
      </div>
    )
  }
})
const assitBoxTitle = (
  <div className="commonTitle">
    <div className="line"></div>
    <span className="titleSpan">辅助设置</span>
    <span className="titleIntro">一些常用的辅助设置：①容器进入点；②启动执行命令；③重新部署所用镜像；④容器时区设置</span>
    <div style={{ clear: "both" }}></div>
  </div>
);
const usefulBoxitle = (
  <div className="commonTitle">
    <div className="line"></div>
    <span className="titleSpan">高可用</span>
    <span className="titleIntro">设置重启检查项目，如遇到检查项不满足，为自动保证服务高可用，将自动重启该服务</span>
    <div style={{ clear: "both" }}></div>
  </div>
);
const composeBoxTitle = (
  <div className="commonTitle">
    <div className="line"></div>
    <span className="titleSpan">配置管理</span>
    <span className="titleIntro">满足您统一管理某些服务配置文件的需求，即：不用停止服务，即可变更多个容器内的配置文件</span>
    <div style={{ clear: "both" }}></div>
  </div>
);
const advanceBoxTitle = (
  <div className="commonTitle">
    <div className="line"></div>
    <span className="titleSpan">高级设置</span>
    <span className="titleIntro">在高级设置里，您可以链接其它已创建服务，环境变量配置，以及容器与主机端口的映射</span>
    <div style={{ clear: "both" }}></div>
  </div>
);

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    cluster,
  }
}

AppDeployServiceModal = connect(mapStateToProps, {
  //
})(AppDeployServiceModal)

AppDeployServiceModal = createForm()(AppDeployServiceModal);

export default AppDeployServiceModal

