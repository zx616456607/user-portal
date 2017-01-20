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
import { Form, Switch, Select, Collapse, Dropdown, Modal, Checkbox, Button, Card, Menu, Input, InputNumber, Radio, Icon, notification } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NormalDeployBox from './AppDeployComponents/NormalDeployBox'
import AssitDeployBox from './AppDeployComponents/AssitDeployBox'
import UsefulDeployBox from './AppDeployComponents/UsefulDeployBox'
import ComposeDeployBox from './AppDeployComponents/ComposeDeployBox'
import EnviroDeployBox from './AppDeployComponents/EnviroDeployBox'
import "./style/AppDeployServiceModal.less"
import { connect } from 'react-redux'
import { parseAmount } from '../../../common/tools.js'
import { CREATE_APP_ANNOTATIONS, DEFAULT_REGISTRY } from '../../../constants'
const DEFAULT_COMPOSE_TYPE = '2'
const Deployment = require('../../../../kubernetes/objects/deployment')
const Service = require('../../../../kubernetes/objects/service')
const Panel = Collapse.Panel;
const createForm = Form.create;
const FormItem = Form.Item;
let noPortFlag = false;
let noArgsAndCommandFlag = false;

let AppDeployServiceModal = React.createClass({
  propTypes: {
    cluster: PropTypes.object.isRequired,
    serviceList: PropTypes.array,
  },
  getInitialState: function () {
    return {
      composeType: DEFAULT_COMPOSE_TYPE,
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
      if (livenessProbe.httpGet) {
        form.setFieldsValue({
          httpLivePort: livenessProbe.httpGet.port,
          httpLivePath: livenessProbe.httpGet.path,
          httpLiveInitialDelaySeconds: livenessProbe.initialDelaySeconds,
          httpLiveTimeoutSeconds: livenessProbe.timeoutSeconds,
          httpLivePeriodSeconds: livenessProbe.periodSeconds
        })
        return 'http'
      } else if (livenessProbe.tcpSocket) {
        form.setFieldsValue({
          tcpLivePort: livenessProbe.tcpSocket.port,
          tcpLiveInitialDelaySeconds: livenessProbe.initialDelaySeconds,
          tcpLiveTimeoutSeconds: livenessProbe.timeoutSeconds,
          tcpLivePeriodSeconds: livenessProbe.periodSeconds
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
  validCMD(rule, value, callback) {
    if(!value) {
      callback(new Error('请填写启动命令'))
      return
    }
    return callback()
  },
  setArg() {
    const { scope } = this.props
    const { form } = this.props
    if(this.props.scope.state.isCreate) return
    const args = scope.state.checkInf.Deployment.spec.template.spec.containers[0].args
    if (args && args.length > 0) {
      form.setFieldsValue({
        args: args
      })
    }
    let config = this.props.tagConfig[DEFAULT_REGISTRY]
    if(!config || config.isFetching) {
      return
    }
    const { getFieldValue, setFieldsValue, getFieldProps } = form
    const tag = config.configList.tag
    config = config.configList[tag]
    let defaultArg = config.cmd
    if(!args || args.length <= 0) {
      this.setState({
        runningCode: '1'
      })
      return
    }
    const cmdKey = []
    const userCMDKey = []
    const self = this
    args.forEach((arg, index) => {
      userCMDKey.push(index + 1)
      setFieldsValue({[`userCMD${index + 1}`]: arg})
    })
    if(!defaultArg) defaultArg = []
    defaultArg.forEach((arg, index) => {
      cmdKey.push(index + 1)
      setFieldsValue({[`cmd${index + 1}`]: arg})
    })
    setFieldsValue({
      cmdKey: cmdKey,
      userCMDKey: userCMDKey
    })
    if(args.length != defaultArg.length) {
      this.setState({
        runningCode: '2'
      })
      form.setFieldsValue({
        runningCode: '2'
      })
      return
    }
    const isDefault = args.some(arg => {
      return defaultArg.indexOf(arg) >= 0
    })
    if(isDefault) {
      this.setState({
        runningCode: '1'
      })
      form.setFieldsValue({
       runningCode: '1'
      })
    } else {
      this.setState({
        runningCode: '2'
      })
      form.setFieldsValue({
        runningCode: '2'
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
    const entryInput = scope.state.checkInf.Deployment.spec.template.spec.containers[0].command
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
    this.setEnv(env, form)
    this.setPorts(ports, ServicePorts, form, annotations)
    this.setState({
      composeType: this.limits(),
    })
  },
  componentWillMount() {
    noPortFlag = false;
    noArgsAndCommandFlag = false;
    document.title = '部署应用 | 时速云'
    if (!this.props.scope.state.isCreate) {
      this.setForm()
    }
  },
  componentWillReceiveProps(nextProps) {
    noPortFlag = false;
    noArgsAndCommandFlag = false;
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

    let httpLivePort = getFieldProps('httpLivePort').value   //高可用端口
    let httpLiveInitialDelaySeconds = getFieldProps('httpLiveInitialDelaySeconds').value //首次延时
    let httpLiveTimeoutSeconds = getFieldProps('httpLiveTimeoutSeconds').value //检查超时
    let httpLivePeriodSeconds = getFieldProps('httpLivePeriodSeconds').value //检查间隔
    let httpLivePath = getFieldProps('httpLivePath').value //高可用路径
    let tcpLivePort = getFieldProps('tcpLivePort').value   //高可用端口
    let tcpLiveInitialDelaySeconds = getFieldProps('tcpLiveInitialDelaySeconds').value //首次延时
    let tcpLiveTimeoutSeconds = getFieldProps('tcpLiveTimeoutSeconds').value //检查超时
    let tcpLivePeriodSeconds = getFieldProps('tcpLivePeriodSeconds').value //检查间隔

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
    if (Boolean(portKey) && portKey.length > 0) {
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
    } else {
      notification['warning']({
        message: '创建服务：高级设置',
        description: '映射端口数量最少为一个！',
      });
      noPortFlag = true;
      return;
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
    //due to entry point and start command must be have last one
    //so we check both of them, if both of them is null, we will callback error
    let checkArgsFlag = true;//for check args is null or not
    let checkCommandFlag = true;//for check command is null or not
    //args 执行命令
    if (this.state.runningCode === '1') {
      if (getFieldValue('cmdKey')) {
        const args = getFieldValue('cmdKey').map(i => {
          if (!Boolean(getFieldValue(`cmd${i}`)) || getFieldValue(`cmd${i}`).length == 0) {
            checkArgsFlag = false;
          }
          return getFieldValue(`cmd${i}`)
        })
        deploymentList.addContainerArgs(serviceName, args)
      } else {
        checkArgsFlag = false;
      }
    } else {
      if(getFieldValue('userCMDKey')) {
        const args = getFieldValue('userCMDKey').map(i => {
          if (!Boolean(getFieldValue(`userCMD${i}`)) || getFieldValue(`userCMD${i}`).length == 0) {
            checkArgsFlag = false;
          }
          return getFieldValue(`userCMD${i}`)
        })
        deploymentList.addContainerArgs(serviceName, args)
      } else {
        checkArgsFlag = false;
      }
    }
    //command
console.log(command)
    if (command && command != "") {
      deploymentList.addContainerCommand(serviceName, command)
    } else {
      checkCommandFlag = false;
    }
    if(!checkCommandFlag && !checkArgsFlag) {
      noArgsAndCommandFlag = true;
      notification['warning']({
        message: '创建服务：辅助设置',
        description: '进入点与启动命令至少定义其中一个！',
      });
      return;
    }
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
           // name: volumeInfo[0] + '-' + k,
            name: 'volume-' + k,
            image: volumeInfo[0],
            fsType: volumeInfo[1]
          }, {
              mountPath: getFieldProps(`volumePath${k}`).value,
              readOnly: true
            })
        } else {
          deploymentList.addContainerVolume(serviceName, {
            name: 'volume-' + k,
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
      if(getFieldValue('getUsefulType') == 'http') {
        deploymentList.setLivenessProbe(serviceName, getFieldValue('getUsefulType').toUpperCase(), {
          port: parseInt(httpLivePort),
          path: httpLivePath,
          initialDelaySeconds: parseInt(httpLiveInitialDelaySeconds),
          timeoutSeconds: parseInt(httpLiveTimeoutSeconds),
          periodSeconds: parseInt(httpLivePeriodSeconds)
        })
      } else {
        //tcp
        deploymentList.setLivenessProbe(serviceName, getFieldValue('getUsefulType').toUpperCase(), {
          port: parseInt(tcpLivePort),
          path: httpLivePath,
          initialDelaySeconds: parseInt(tcpLiveInitialDelaySeconds),
          timeoutSeconds: parseInt(tcpLiveTimeoutSeconds),
          periodSeconds: parseInt(tcpLivePeriodSeconds)
        })
      }
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
      composeType: DEFAULT_COMPOSE_TYPE,
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
      if(!noPortFlag && !noArgsAndCommandFlag) {
        this.props.form.resetFields()
        parentScope.setState({
          serviceModalShow: false,
          deployServiceModalShow: false, // for add service
        })
      }
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
      composeType: DEFAULT_COMPOSE_TYPE,
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
    const price = this.props.cluster.resourcePrice
    const instanceNum = this.props.form.getFieldValue('instanceNum') // 数量
    const scope = this
    const parentScope = this.props.scope
    const {currentSelectedImage, registryServer, isCreate, other} = parentScope.state
    const { form, serviceOpen } = this.props
    const { composeType, disable } = this.state
    const unitPrice = parseAmount(price[this.state.composeType+'x'], 4)
    const hourPrice = parseAmount(price[this.state.composeType+'x'] * instanceNum, 4)
    const countPrice = parseAmount(price[this.state.composeType+'x'] * instanceNum * 24 * 30, 4) // 24h * 30d

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
            setArg={()=> this.setArg()}
            />
          <Collapse>
            <Panel header={assitBoxTitle} key="1" className="assitBigBox">
              <AssitDeployBox scope={scope} form={form} serviceOpen={this.props.serviceOpen}/>
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
            <div className="modal-price">
              <div className="price-left">
                <span className="keys">实例：<span className="unit">{ unitPrice.fullAmount}</span>/小时</span>
              </div>
              <div className="price-unit">合计：<span className="unit">{ countPrice.unit =='￥'? '￥':'' }</span>
                <span className="unit blod">{ hourPrice.amount }{ countPrice.unit =='￥'? '':'T' }/小时</span> &nbsp;
                <span className="unit">（约：{ countPrice.fullAmount }/月）</span>
              </div>
            </div>
            <div className="text-center">
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

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const parentScope = props.scope
  const {other} = parentScope.state
  if(props.other) {
    return {
      tagConfig: state.getImageTagConfig.otherTagConfig,
      cluster,
    }
  }
  return {
    tagConfig: state.getImageTagConfig.imageTagConfig,
    cluster
  }
}

AppDeployServiceModal = connect(mapStateToProps, {

})(AppDeployServiceModal)

AppDeployServiceModal = createForm()(AppDeployServiceModal);

export default AppDeployServiceModal

