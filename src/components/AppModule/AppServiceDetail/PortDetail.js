/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PortDetail component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Spin, Dropdown, Icon, Menu, Button, Select, Input, Form, Modal, Alert, Tooltip } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/PortDetail.less"
import { loadK8sService, clearK8sService, updateServicePort, loadServiceDetail } from '../../../actions/services'
import { isDomain } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import findIndex from 'lodash/findIndex'
import cloneDeep from 'lodash/cloneDeep'
import { ANNOTATION_HTTPS, SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import { camelize } from 'humps'
import { isResourcePermissionError } from '../../../common/tools'
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage  } from 'react-intl'

let uuid=0
let ob = {}
let defaultPort = []
let changeType = {}
let allPort = []
let allUsedPort = []
const notificationHandler = new NotificationHandler()

function validatePortNumber(proxyType, portNumber) {
  let minimumPort = 10000
  let maximumPort = 65535
  if (proxyType == SERVICE_KUBE_NODE_PORT) {
    // TODO: Make it configurealbe
    minimumPort = 30000
    maximumPort = 32766
  }
  if( portNumber < minimumPort || portNumber > maximumPort ) {
    return window._intl.formatMessage(AppServiceDetailIntl.portRange, { minimumPort, maximumPort })
  } else {
    return
  }
}

let MyComponent = React.createClass({
  getInitialState() {
    const { currentCluster, loginUser } = this.props
    return {
      // kube-nodeport doesn't support HTTP for now
      disableHTTP: !isDomain(currentCluster.bindingDomains) || (loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT)
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    const _this = this
    const { serviceName } = this.props
    this.props.loadK8sService(this.props.cluster, serviceName, {
      success: {
        func: (res) => {
          let openPort = []
          const defaultPortFields = {}
          const ports = res.data[camelize(serviceName)].spec.ports
          for(let i=0;i< ports.length; i++) {
            allPort.push(ports[i])
            openPort.push(false)
            uuid++
            Object.assign(defaultPortFields, {
              [`portName-${uuid}`]: ports[i].name
            })
          }
          let cut = openPort.length
          const { form } = this.props
          const keys = []
          let index = 0
          while(cut-- ) {
            index++
            keys.push(index)
          }
          form.setFieldsValue({
            keys,
            ...defaultPortFields,
          })
          _this.setState({
            openPort
          })
        }
      }
    })
  },
  componentWillUnmount() {
    this.props.clearK8sService()
    ob = {}
    uuid = 0
  },
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (this.props.isCurrentTab !== nextProps.isCurrentTab && !nextProps.isCurrentTab) {
      uuid = 0
      this.setState({
        newselectType: 0
      })
    }
    if (!(this.props.isCurrentTab === false && nextProps.isCurrentTab === true)) {
      return
    }
    if (!serviceDetailmodalShow) {
      ob = {}
      this.props.form.setFieldsValue({
        newKeys: []
      })
      this.setState({
        openPort: [],
        inPort: '1'
      })
      ob = {}
      return this.props.clearK8sService()
    }
    const { cluster, serviceName } = nextProps
    const _this = this
    this.props.loadK8sService(cluster, serviceName, {
      success: {
        func: (res) => {
          let openPort = []
          const defaultPortFields = {}
          const ports = res.data[camelize(serviceName)].spec.ports
          for(let i=0;i< ports.length; i++) {
            openPort.push(false)
            uuid++
            Object.assign(defaultPortFields, {
              [`portName-${uuid}`]: ports[i].name
            })
          }
          let cut = openPort.length
          const { form } = this.props
          const keys = []
          let index = 0
          while(cut-- ) {
            index++
            keys.push(index)
          }
          form.setFieldsValue({
            keys,
            newKeys: [],
            ...defaultPortFields,
          })
          _this.setState({
            openPort
          })
        }
      }
    })
  },
  handCancel(i) {
    // cancel action
    const openPort = {[i]: false}
    this.setState({
      openPort,
      selectType: 0,
      newselectType: 0
    })
  },
  checkPort(rule, value, callback, index){
    const { formatMessage } = this.props
    if(!value) return callback()
    const { form, loginUser } = this.props
    const { getFieldValue } = form
    if(index != undefined) {
      if(getFieldValue(`ssl${index}`) == 'HTTP') {
        return callback()
      }
    }
    if(!/^[0-9]+$/.test(value.trim())) {
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInputNumber)))
      return
    }
    const port = parseInt(value.trim())
    let msg = validatePortNumber(loginUser.info.proxyType, port)
    if (msg) {
      callback(new Error(msg))
      return
    }
    if(allPort.indexOf(port) >= 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.ThisPortAlreadyUsed)))
      return
    }
    return callback()
  },
  checkContainerPort(rule, value, callback) {
    const { formatMessage } = this.props
    if (!value) return callback()
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInputNumber)))
      return
    }
    const port = parseInt(value.trim())
    if (port < 1 || port > 65535) {
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInput165535)))
      return
    }
    if (allPort.indexOf(port) >= 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.ThisPortAlreadyOccupy)))
      return
    }
    return callback()
  },
  checkInputPort(rule, value, callback) {
    const { formatMessage } = this.props
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('newKeys')
    const lastOne = keys[keys.length - 1]
    if (getFieldValue(`newssl${lastOne}`) == 'HTTP') return callback()
    if (!value) return callback()
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInputNumber)))
      return
    }
    const port = parseInt(value.trim())
    const { loginUser } = this.props
    let msg = validatePortNumber(loginUser.info.proxyType, port)
    if (msg) {
      callback(new Error(msg))
      return
    }
    if (allUsedPort.indexOf(value.trim()) >= 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.ThisPortAlreadyOccupy)))
      return
    }
    return callback()
  },
  editPort(item, index) {
    const { bindHttpsStatus, formatMessage } = this.props
    const { newselectType } = this.state
    const { port } = item
    const { bindingPort, https } = bindHttpsStatus
    if (https && port == bindingPort) {
      return notificationHandler.info(formatMessage(AppServiceDetailIntl.closeHTTPEditThisPort))
    }
    if (newselectType) {
      return notificationHandler.info(formatMessage(AppServiceDetailIntl.saveEditPortThenEdit))
    }
    const openPort = {[index]: true}
    this.setState({
      openPort,
      inPort: '1',
      newselectType: 1,
    })
  },
  showModal(item, i) {
    const { form, k8sService, serviceName, formatMessage } = this.props
    const { getFieldValue } = form
    let keys = getFieldValue('keys')
    const port = getFieldValue(`port${keys[i]}`)
    let bindingPort = ''
    if (k8sService.isFetching === false && k8sService.data && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)].metadata.annotations) {
      bindingPort = k8sService.data[camelize(serviceName)].metadata.annotations.bindingPort || ''
    }
    if (k8sService.data[camelize(serviceName)].metadata.annotations[ANNOTATION_HTTPS] === 'true' && parseInt(port) === parseInt(bindingPort)) {
      const notification = new NotificationHandler()
      notification.error(formatMessage(AppServiceDetailIntl.closeHTTPSThenDeletePort))
      return
    }
    this.setState({
      delModal: true,
      index: i,
      item: item
    })
  },
  deletePort() {
    const i = this.state.index
    const { form, formatMessage } = this.props
    const { getFieldValue, setFieldsValue } = form
    let keys = getFieldValue('keys')
    if(keys.length <= 1) {
      const notification = new NotificationHandler()
      notification.warn(formatMessage(AppServiceDetailIntl.leastOnePort))
      return
    }
    const index = keys.indexOf(i+1)
    if(index < 0) return
    keys.splice(index, 1)
    setFieldsValue({
      keys
    })
    this.setState({
      delModal: false,
      item: null,
      i: -1
    })
    this.save()
  },
  remove(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('newKeys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    if(ob[k]) {
      ob[k] = false
    }
    // can use data-binding to set
    form.setFieldsValue({
      newKeys: keys,
    });
    this.setState({
      newselectType: 0
    })
  },
  add() {
    const { formatMessage } = this.props
    const { newselectType } = this.state
    if(newselectType) {
      return notificationHandler.info(formatMessage(AppServiceDetailIntl.saveEditPortThenAdd))
    }
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('newKeys');
    keys = keys.concat(uuid);
    setTimeout(() => {
      this.newPortOb.refs.input.focus()
    })
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      newKeys: keys,
    });
    this.setState({
      newselectType: 1
    })
  },
  save(index) {
    const { form, k8sService, loadServiceDetail, formatMessage } = this.props
    const keys = form.getFieldValue('keys')
    const body = []
    const self = this
    if (index !== undefined) {
      const modifyPort = form.getFieldValue(`port${keys[index]}`)
      const newProtocol = form.getFieldValue(`selectssl${keys[index]}`) ? form.getFieldValue(`selectssl${keys[index]}`) : form.getFieldValue(`ssl${keys[index]}`)
      const { k8sService, serviceName } = this.props
      let bindingPort = ''
      if (k8sService.isFetching === false && k8sService.data && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)].metadata.annotations) {
        bindingPort = k8sService.data[camelize(serviceName)].metadata.annotations.bindingPort || ''
      }
      if (k8sService.data[camelize(serviceName)].metadata.annotations[ANNOTATION_HTTPS] === 'true' && parseInt(modifyPort) === parseInt(bindingPort) && newProtocol.toUpperCase() !== 'HTTP') {
        const notification = new NotificationHandler()
        notification.error(formatMessage(AppServiceDetailIntl.closeHTTPSEditProtocol))
        return
      }
    }
    if(keys) {
      form.validateFieldsAndScroll((errors, values) => {
        if(errors) {
          return
        }
        const { updateServicePort, loadK8sService, loadServiceDetail } = self.props
        keys.forEach(key => {
          let protocol = form.getFieldValue(`selectssl${key}`) ?  form.getFieldValue(`selectssl${key}`) :  form.getFieldValue(`ssl${key}`)
          let port = form.getFieldValue(`changeinputPort${key}`) ? form.getFieldValue(`changeinputPort${key}`) : form.getFieldValue(`inputPort${key}`)
          const name = form.getFieldValue(`portName-${key}`)
          if(port) {
            port = parseInt(port)
          }
          if (parseInt(form.getFieldValue(`port${key}`)) && protocol) {
            body.push({
              ['container_port']: parseInt(form.getFieldValue(`port${key}`)),
              protocol: protocol === 'UDP' ? protocol : 'TCP',
              ['service_port']: port,
              name: `${protocol.toLowerCase()}-${name}`,
            })
          }
        })
        const newKeys = form.getFieldValue('newKeys')
        newKeys.forEach(key => {
          if (parseInt(form.getFieldValue(`newport${key}`)) && form.getFieldValue(`newssl${key}`)) {
            const protocol = form.getFieldValue(`newssl${key}`)
            const name = `${protocol.toLowerCase()}-${self.props.serviceName}-${key}`
            body.push({
              ['container_port']: parseInt(form.getFieldValue(`newport${key}`)),
              protocol: protocol === 'UDP' ? protocol : 'TCP',
              ['service_port']: parseInt(form.getFieldValue(`newinputPort${key}`)),
              name,
            })
          }
        })
        const { cluster, serviceName } = self.props
        const notification = new NotificationHandler()
        notification.spin(formatMessage(AppServiceDetailIntl.portUpdating))
        updateServicePort(cluster, serviceName, body, {
          success: {
            func: (res) => {
              loadServiceDetail(cluster, serviceName)
              loadK8sService(cluster, serviceName, {
                success: {
                  func: (res) => {self.setState({
                    inPort: '1',
                    openPort: []
                    })
                    ob = {}
                    const keys = []
                    for(let i=0;i< res.data[camelize(serviceName)].spec.ports.length; i++) {
                      keys.push(i + 1)
                    }
                    self.setState({
                      newselectType: 0,
                      selectType: 0
                    })
                    self.props.form.setFieldsValue({
                      keys,
                      newKeys: []
                    })
                    //self.props.loadData()
                  },
                  isAsync: true
                },
              })
              notification.close()
              notification.success(formatMessage(AppServiceDetailIntl.portUpdateSuccess))
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              if(isResourcePermissionError(result)){
                //403 没权限判断 在App/index中统一处理 这里直接返回
                return;
              }
              notification.error(result.message.message)
            }
          }
        })
      })
    }
  },
  inputPort(index, e) {
    const { form } = this.props
    if(!e) {
      const protocol = form.getFieldValue(`inputPort${index}`)
      if(protocol.toLowerCase() == 'http') {
        return
      }
    }
    if(e && e.toLowerCase() == 'http') {
      this.setState({
        inPort: 1
      })
      form.setFieldsValue({
        [`inputPort${index}`]: 80
      })
    } else {
      const selectType = this.state.selectType
      form.setFieldsValue({
        [`inputPort${index}`]: null,
        [`changeinputPort${index}`]: null
      })
      this.setState({
        inPort: selectType
      })
    }
  },
  changeType(e, index) {
    const protocol = this.props.form.getFieldValue(`selectssl${index}`)
    if(protocol.toLowerCase() == 'http') {
      this.setState({
        selectType: e
      })
      return
    } else {
      this.setState({ inPort: e, selectType: e })
      if (e == 2) {
        setTimeout(() => {
          document.getElementById(`changeinputPort${index}`).focus()
        })
      }
    }
  },
  newInputPort(index, e) {
    const { form } = this.props
    if(e && e.toLowerCase() == 'http') {
      ob[index] = false
      form.setFieldsValue({
        [`newinputPort${index}`]: '80'
      })
    } else {
      const selectType = this.state.newselectType
      form.setFieldsValue({
        [`newinputPort${index}`]: null
      })
      ob[index] = selectType == 2
    }
  },
  newChangeType(e, index) {
    const protocol = this.props.form.getFieldValue(`newssl${index}`)
    this.setState({
      newselectType: e
    })
    if(protocol.toLowerCase() == 'http') {
      ob[index] = false
      return
    } else {
      if(e == 2) {
        ob[index] = true
        setTimeout(() => {
          this.newInputPortOb.refs.input.focus()
        })
        return
      }
      this.props.form.setFieldsValue({[`newinputPort${index}`]: null})
      ob[index] = false
    }
  },
  render: function () {
    const { k8sService, formatMessage } = this.props
    const { disableHTTP } = this.state
    const { getFieldProps, getFieldValue, resetFields } = this.props.form
    const self = this
    if (k8sService.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!k8sService.data) {
      return (<div className='loadingBox'>
        {formatMessage(AppServiceDetailIntl.noPort)}
      </div>)
    }
    let property = Object.getOwnPropertyNames(k8sService.data)
    if (property.length === 0) {
      return (<div className='loadingBox'>
        {formatMessage(AppServiceDetailIntl.noPort)}
      </div>)
    }
    const service = k8sService.data[property[0]]
    if (!service.spec) {
      return (
        <div className='loadingBox'>
          {formatMessage(AppServiceDetailIntl.noPort)}
        </div>
      )
    }
    const ports = service.spec.ports
    const annotations = service.metadata.annotations
    let userPort = annotations['system/schemaPortname'] || []
    if(userPort) {
      userPort = userPort.split(',')
      userPort = userPort.map(item => {
        return item.split('/')
      })
    }
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          {formatMessage(AppServiceDetailIntl.noPort)}
        </div>
      )
    }
    getFieldProps('newKeys', {
      initialValue: [],
    });
    const formItems = []
    getFieldValue('newKeys').forEach((k) => {
      let rules = {}
      if(ob[k]) {
        rules = {
          required: true,
          whitespace: true,
          message: formatMessage(AppServiceDetailIntl.pleaseInputPort)
        }
      }
      formItems.push(
        <div className="portDetail" key={`list${k}`}>
          <div className="commonData">
            <Form.Item key={k}>
              <Input  {...getFieldProps(`newport${k}`, {
                ref : (instance) => this.newPortOb = instance,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: formatMessage(AppServiceDetailIntl.pleaseInputContainerPort),
                }, {validator: this.checkContainerPort}],
              })}  style={{ width: '80%', marginRight: 8 }}
              />
            </Form.Item>
          </div>
          <div className="commonData">
          <Form.Item  key={k}>
              <Select {...getFieldProps(`newssl${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: formatMessage(AppServiceDetailIntl.pleaseChoiceProtocolType),
                }],
                initialValue: (disableHTTP ? 'TCP' : 'HTTP'),
                onChange: (e) => self.newInputPort(k, e)
              })} style={{width:'80px'}}>
              <Select.Option key="TCP">TCP</Select.Option>
              <Select.Option key="UDP">UDP</Select.Option>
              <Select.Option disabled={disableHTTP} key='HTTP'>HTTP</Select.Option>
            </Select>
            </Form.Item>
          </div>
          <div className="commonData span2">
            <Select style={{ width:'90px', display: getFieldProps(`newssl${k}`).value == 'HTTP' ? 'none' : 'inline-block'}}  {...getFieldProps(`newserverPort${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                }],
                onChange: (e) => self.newChangeType(e, k),
                initialValue: formatMessage(AppServiceDetailIntl.dynamicGeneration)
              })} >
              <Select.Option key="1">{formatMessage(AppServiceDetailIntl.dynamicGeneration)}</Select.Option>
              <Select.Option key="2">{formatMessage(AppServiceDetailIntl.designatedPort)}</Select.Option>
            </Select>
            <span style={{display: getFieldProps(`newssl${k}`).value == 'HTTP' ? 'inline-block' : 'none'}}>80</span>
          </div>
          <div className="commonData span2">
            <Form.Item key={k} style={{position: 'relative'}}>
            <Input type='text' style={{width: '80px', marginLeft: '0px', display: ob[k] ? 'inline-block' : 'none'}} {...getFieldProps(`newinputPort${k}`, {ref: instance => this.newInputPortOb = instance,rules: [rules, {validator: this.checkInputPort}], initialValue: this.state.disableHTTP ? '': "80"})} />
            </Form.Item>
          </div>
          <div className="commonData span3">
            <Button type="primary" onClick={this.save}>{formatMessage(ServiceCommonIntl.save)}</Button>
            <Button type="ghost" style={{marginLeft:'6px'}} onClick={()=> this.remove(k)}>{formatMessage(ServiceCommonIntl.cancel)}</Button>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });

    const items = []
    allUsedPort = []
    allPort = []
    ports.forEach((item, index) => {
      const targetPort = findIndex(userPort, i => i[0] == item.name)
      if(targetPort < 0) return
      let target = userPort[targetPort]
      if(!target) return
      if(target[1].toLowerCase() == 'tcp' && target.length < 3) return
      const dropdown = (
        <Menu style={{width:'100px'}} onClick={()=> this.editPort(item, index)}>
          <Menu.Item key="1"><Icon type="edit" /> &nbsp;{formatMessage(ServiceCommonIntl.edit)}</Menu.Item>
        </Menu>
      )
      const actionText = (
        <Menu style={{width:'100px'}} onClick={()=> this.handCancel(index)}>
          <Menu.Item key="1"><Icon type="minus-circle-o" /> &nbsp;{formatMessage(ServiceCommonIntl.cancel)}</Menu.Item>
        </Menu>
      )
      allUsedPort.push(target[2])
      allPort.push(item.targetPort ? item.targetPort : '80')
      items.push (
        <div className="portDetail" key={item.name}>
          <div className="commonData">
            <Form.Item>
            <Input  type="hidden" {...getFieldProps(`port${index+1}`, {
              initialValue: item.targetPort
            })}/>
            <span>{item.targetPort}</span>
            </Form.Item>
          </div>
          <div className="commonData">
            <Form.Item>
            { this.state.openPort && this.state.openPort[index] ?
              <Select style={{width:'80px'}} {...getFieldProps(`selectssl${index+1}`, {
                initialValue: target[1],
                onChange: (e) => self.inputPort(index + 1, e)
                })} >
                <Select.Option key="TCP">TCP</Select.Option>
                <Select.Option key="UDP">UDP</Select.Option>
                <Select.Option disabled={disableHTTP} key="HTTP">HTTP</Select.Option>
              </Select>
              :
              <span><Input type="hidden" {...getFieldProps(`ssl${index+1}`, {
                initialValue: target[1]
              })}/>{target[1]}</span>
            }
           </Form.Item>
          </div>
          <div className="commonData span2">

            { this.state.openPort && this.state.openPort[index] ?
              getFieldProps(`selectssl${index+1}`).value == 'HTTP' ? <span>80</span> :
              <Select defaultValue={formatMessage(AppServiceDetailIntl.dynamicGeneration)} style={{width:'90px'}} onChange={(e)=> this.changeType(e, index + 1)}>
                <Select.Option key="1">{formatMessage(AppServiceDetailIntl.dynamicGeneration)}</Select.Option>
                <Select.Option key="2">{formatMessage(AppServiceDetailIntl.designatedPort)}</Select.Option>
              </Select>
              :
              <span><Input type="hidden" {...getFieldProps(`inputPort${index+1}`, {
                initialValue: target[1].toLowerCase() == 'http' ? 80 : target[2]
              })}/>{target[1].toLowerCase() == 'http' ? 80 : (target[2] || <span style={{color: '#fff'}}>-</span>)}</span>
            }

          </div>
          <div className="commonData span2">
            { this.state.openPort && this.state.openPort[index] && this.state.inPort =='2' ?
              <Form.Item style={{width: '90px', float: 'left', }}>
                <Input {...getFieldProps(`changeinputPort${index + 1}`, {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入容器端口',
                  }, {validator: (rule, value, callback) => this.checkPort(rule, value, callback, index+1)}]
                })}/>
               </Form.Item>
              :<span>&nbsp;</span>
            }
          </div>
          <div className="commonData span3">
            { this.state.openPort && this.state.openPort[index] ?
              <Dropdown.Button overlay={actionText} type="ghost" style={{width:'140px'}} onClick={() => {this.save(index)}}>
                  <Icon type="save" /> {formatMessage(ServiceCommonIntl.save)}
              </Dropdown.Button>
              :
              <Dropdown.Button overlay={dropdown} type="ghost" onClick={()=> this.showModal(item, index)} style={{width:'100px'}}>
                <Icon type="delete" />{formatMessage(ServiceCommonIntl.delete)}
              </Dropdown.Button >
            }
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    /*if(items.length == 0) return (
        <div className='loadingBox'>
            无端口
        </div>
    )*/
    return (
      <Card className="portList">
        {items}
        { formItems }
        <div className="pushRow">
         <a onClick={()=> this.add()}> <Icon type="plus" />{formatMessage(AppServiceDetailIntl.addPortMap)}</a>
        </div>
        <Modal title="删除端口操作" visible={this.state.delModal}
          onOk={() => this.deletePort()} onCancel={() => this.setState({ delModal: false })}
          >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {formatMessage(AppServiceDetailIntl.makeSureDeletePort,
              { targetPort: this.state.item ? this.state.item.targetPort : '' })}
          </div>
        </Modal>
      </Card>
    );
  }
});

function mapSateToProp(state) {
  const { loginUser } = state.entities
  return {
    loginUser: loginUser,
    k8sService: state.services.k8sService,
  }
}
MyComponent = Form.create()(MyComponent);

MyComponent = connect(mapSateToProp, {
  loadK8sService,
  clearK8sService,
  updateServicePort,
  loadServiceDetail,
})(MyComponent)

class PortDetail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { containerList, loading, currentCluster, bindHttpsStatus } = this.props
    const { formatMessage } = this.props.intl
    return (
      <div id="PortDetail">
        <Alert message={formatMessage(AppServiceDetailIntl.portDetailInfo)} type="info" />
        <div className="titleBox">
          <div className="commonTitle">
            {formatMessage(AppServiceDetailIntl.conatinerPort)}
          </div>
          <div className="commonTitle">
            {formatMessage(AppServiceDetailIntl.protocol)}<Tooltip title={formatMessage(AppServiceDetailIntl.commonTitleInfo)}>
              <Icon type="question-circle-o" />
            </Tooltip>
          </div>
          <div className="commonTitle span4">
            {formatMessage(AppServiceDetailIntl.servicePort)}
          </div>
          <div className="commonTitle span2">
            {formatMessage(ServiceCommonIntl.operation)}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent
          config={containerList}
          loading={loading}
          cluster={this.props.cluster}
          currentCluster={currentCluster}
          serviceName={this.props.serviceName}
          loadData = {this.props.loadData}
          serviceDetailmodalShow={this.props.serviceDetailmodalShow}
          bindHttpsStatus={bindHttpsStatus}
          isCurrentTab={this.props.isCurrentTab}
          formatMessage={formatMessage}
          />
      </div>
    )
  }
}

PortDetail.propTypes = {
  cluster: PropTypes.string.isRequired,
  currentCluster: PropTypes.object.isRequired,
  serviceName: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default injectIntl(PortDetail, { withRef: true })
