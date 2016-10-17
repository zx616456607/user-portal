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

const Deployment = require('../../../../kubernetes/objects/deployment')
const Service = require('../../../../kubernetes/objects/service')
const Panel = Collapse.Panel;
const createForm = Form.create;

class AppDeployServiceModal extends Component {
  constructor(props) {
    super(props);
    this.submitNewService = this.submitNewService.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setForm = this.setForm.bind(this);
    this.limits = this.limits.bind(this);
    this.volumeSwitch = this.volumeSwitch.bind(this);
    this.getUsefulType = this.getUsefulType.bind(this);
    this.setEnv = this.setEnv.bind(this);
    this.setPorts = this.setPorts.bind(this);
    this.handleSubBtn = this.handleSubBtn.bind(this);
    this.state = {
      composeType: "1",
      runningCode: "1",
      getImageType: "1",
      stateService: false,
      currentDate: false,
      checkInf: null,
    }
  }
  limits () {
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
  }
  volumeSwitch (volumeMounts, form) {
    if (volumeMounts) {
      console.log('1');
      if (volumeMounts.length !== 0) {
        if (volumeMounts.length === 1) {
          if (volumeMounts[0].name === "tenxcloud-time-zone") {
            return false
          } else {
            console.log('2');
            form.setFieldsValue({
              volumeName1: 'volumeName1 ext4 1024M'
            })
            return true
          }
        } else {
          console.log('3');
          volumeMounts.map((k) => {
            form.setFieldsValue({
              ['volumeName' + `${k}`]: 'volumeName1 ext4 1024M'
            })
          })

          return true
        }
      }
    }
  }
  getUsefulType (livenessProbe, form) {
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
        console.log('tcp');
        form.setFieldsValue({
          livePort: livenessProbe.tcpSocket.port,
        })
        return 'tcp'
      }
    }
  }
  setEnv (env, form) {
    const envArr = []
    if (env) {
      console.log('env------');
      console.log(env);
      console.log('env------');
      env.map(function (item, index) {
        console.log('index', index);
        console.log('envName' + (index + 1));
        envArr.push((index + 1));
        form.setFieldsValue({
          envKey: envArr,
          ['envName' + (index + 1)]: item.name,
          ['envValue' + (index + 1)]: item.value,
        })
      })

      console.log('envKey', form.getFieldValue('envKey'));
    }
  }
  setPorts (ports, ServicePorts, form) {
    const portsArr = []
    if (ports) {
      console.log('ports------');
      ports.map(function (item, index) {
        portsArr.push((index + 1));
        form.setFieldsValue({
          portKey: portsArr,
          ['targetPortUrl' + (index + 1)]: item.containerPort,
          ['portType' + (index + 1)]: item.protocol,
        })
        if (ServicePorts[index].port) {
          form.setFieldsValue({
            ['portUrl' + (index + 1)]: ServicePorts[index].port,
          })
        }
      })
      console.log('envKey', form.getFieldValue('envKey'));
    }
  }
  setForm () {
    const { scope } = this.props
    const { form } = this.props
    const volumeMounts = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].volumeMounts
    const livenessProbe = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].livenessProbe
    const env = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].env
    const ports = this.props.scope.state.checkInf.Deployment.spec.template.spec.containers[0].ports
    const ServicePorts = this.props.scope.state.checkInf.Service.spec.ports
    form.setFieldsValue({
      name: scope.state.checkInf.Service.metadata.name,
      imageVersion: scope.state.checkInf.Deployment.spec.template.spec.containers[0].image.split(':')[1],
      instanceNum: scope.state.checkInf.Deployment.spec.replicas,
      volumeSwitch: this.volumeSwitch(volumeMounts, form),
      getUsefulType: this.getUsefulType(livenessProbe, form),
    })
    this.setEnv(env, form)
    this.setPorts(ports, ServicePorts, form)
    this.setState({
      composeType: this.limits(),
    })
  }
  componentWillMount () {
    if (this.props.scope.state.checkState === '修改') {
      this.setForm()
    }
  }
  componentWillUpdate (nextProps, nextState) {
    const {serviceOpen} = nextProps
    if (serviceOpen == this.props.serviceOpen) {
      return
    }
    if (serviceOpen) {
      if (this.props.scope.state.checkState === '修改') {
        this.setForm()
      }
    }
  }
  submitNewService (parentScope) {
    const scope = this.state;
    let composeType = scope.composeType;
    let portKey = this.props.form.getFieldValue('portKey')
    let envKey = this.props.form.getFieldValue('envKey')
    let volKey = this.props.form.getFieldValue('volKey')
    let instanceNum = this.props.form.getFieldValue('instanceNum')     //容器数量
    let serviceName = this.props.form.getFieldProps('name').value    //服务名
    let imageVersion = this.props.form.getFieldProps('imageVersion').value    //镜像版本
    let volumeSwitch = this.props.form.getFieldProps('volumeSwitch').value //服务类型
    let volumeChecked = this.props.form.getFieldProps('volumeChecked').value   //服务只读
    let livePort = this.props.form.getFieldProps('livePort').value   //高可用端口
    let liveInitialDelaySeconds = this.props.form.getFieldProps('liveInitialDelaySeconds').value //首次延时
    let liveTimeoutSeconds = this.props.form.getFieldProps('liveTimeoutSeconds').value //检查超时
    let livePeriodSeconds = this.props.form.getFieldProps('livePeriodSeconds').value //检查间隔
    let livePath = this.props.form.getFieldProps('livePath').value //高可用路径
    let args = this.props.form.getFieldProps('args').value //高可用路径
    let image = parentScope.state.registryServer + '/' + parentScope.state.currentSelectedImage + ':' + imageVersion //镜像名称

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
      cal: '1C/256M'
    };    //配置判断
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
        this.props.form.getFieldValue('portKey').map((k) => {
          if (this.props.form.getFieldProps(`portUrl${k}`).value) {
            serviceList.addPort(
              serviceName + '-' + k,
              this.props.form.getFieldProps(`portType${k}`).value.toUpperCase(),
              parseInt(this.props.form.getFieldProps(`portUrl${k}`).value),
              parseInt(this.props.form.getFieldProps(`targetPortUrl${k}`).value),
            )
          } else {
            serviceList.addPort(
              serviceName + '-' + k,
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
      if (envKey) {
        this.props.form.getFieldValue('envKey').map((k) => {
          deploymentList.addContainerEnv(
            serviceName,
            this.props.form.getFieldProps(`envName${k}`).value,
            this.props.form.getFieldProps(`envValue${k}`).value
          )
        })
      }
      //args 执行命令
      if (this.state.runningCode === '2') {
        deploymentList.addContainerArgs(serviceName, args)
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
      if (this.props.form.getFieldValue('volumeSwitch')) {
        this.props.form.getFieldValue('volumeKey').map((k) => {
          if (volumeChecked) {
            deploymentList.addContainerVolume(serviceName, {
              name: this.props.form.getFieldProps(`volName${k}`).value + '-' + k,
              fsType: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[0],
              image: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[1]
            }, {
                mountPath: '/test/mount',
                readOnly: true
              })
          } else {
            deploymentList.addContainerVolume(serviceName, {
              name: this.props.form.getFieldProps(`volName${k}`).value + '-' + k,
              fsType: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[0],
              image: this.props.form.getFieldProps(`volumeName${k}`).value.split('/')[1]
            }, {
                mountPath: '/test/mount',
              })
          }
        })
      }
      //livenessProbe 高可用
      if ((this.props.form.getFieldValue('getUsefulType') !== 'null') && (this.props.form.getFieldValue('getUsefulType'))) {
        console.log('this.props.form.getFieldValue', this.props.form.getFieldValue('getUsefulType'));
        deploymentList.setLivenessProbe(serviceName, this.props.form.getFieldValue('getUsefulType').toUpperCase(), {
          port: parseInt(livePort),
          path: livePath,
          initialDelaySeconds: liveInitialDelaySeconds,
          timeoutSeconds: liveTimeoutSeconds,
          periodSeconds: livePeriodSeconds
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
      this.props.form.resetFields()
  }
  handleSubBtn (e,parentScope) {
    e.preventDefault()
    if (parentScope.state.checkState === '创建') {
      this.submitNewService(parentScope)
    } else {
      const reviseServiceName = parentScope.state.checkInf.Service.metadata.name
      parentScope.state.selectedList.map((service,index) => {
        if(service === reviseServiceName){
          parentScope.state.selectedList.splice(index,1)
        }
      })
      parentScope.state.servicesList.map((service,index) => {
        if(service.id === reviseServiceName){
          parentScope.state.servicesList.splice(index,1)
        }
      })
      this.submitNewService(parentScope)
    }
    parentScope.setState({
      serviceModalShow: false
    })
  }
  closeModal () {
    const parentScope = this.props.scope;
    parentScope.setState({
      serviceModalShow: false
    })
    this.props.form.resetFields()
    this.setState({
      composeType: "1",
      runningCode: "1",
      getImageType: "1",
      stateService: false,
      currentDate: false,
      checkInf: null,
    })
  }
  render() {
    const scope = this
    const parentScope = this.props.scope
    const {servicesList} = parentScope.state.servicesList
    const {currentSelectedImage, registryServer, checkState} = parentScope.state
    const { form, serviceOpen } = this.props
    return (
      <div id="AppDeployServiceModal">
        <Form horizontal form={form}>
          <NormalDeployBox
            scope={scope} registryServer={registryServer}
            currentSelectedImage={currentSelectedImage}
            serviceOpen={serviceOpen} checkState={checkState}
            />
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
              onClick={(e) => this.handleSubBtn(e, parentScope)}
              servicesList={servicesList}>
              {parentScope.state.checkState}
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
AppDeployServiceModal = createForm()(AppDeployServiceModal);
AppDeployServiceModal.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceList: PropTypes.array.isRequired,
}

export default AppDeployServiceModal

