/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService rental component
 *
 * v0.1 - 2017-1-19
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Switch, Button, Tooltip, Form, Modal, Input } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadServiceDetail, loadK8sService, loadCertificates, updateCertificates, deleteCertificates, toggleHTTPs } from '../../../actions/services'
import NotificationHandler from '../../../components/Notification'
import './style/AppSettingsHttps.less'
import { CERT_REGEX, PRIVATE_KEY_REGEX, ANNOTATION_SVC_SCHEMA_PORTNAME, ANNOTATION_HTTPS } from '../../../../constants'
import { camelize } from 'humps'
import { isStandardMode } from '../../../common/tools.js'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import AppServiceRental from './AppServiceRental';

const FormItem = Form.Item
const createForm = Form.create

let UploadSslModal = React.createClass({
  certExists(rule, values, callback) {
    const { formatMessage } = this.props.intl
    if (!values) {
      callback([new Error(formatMessage(AppServiceDetailIntl.certificateContent))])
      return
    }
    if (!CERT_REGEX.test(values)) {
      callback([new Error(formatMessage(AppServiceDetailIntl.certificateFormatWrong))])
      return
    }
    callback()
  },
  privateExists(rule, values, callback) {
    const { formatMessage } = this.props.intl
    if (!values) {
      callback([new Error(formatMessage(AppServiceDetailIntl.pleaseInputKeyContent))])
      return
    }
    if (!PRIVATE_KEY_REGEX.test(values)) {
      callback([new Error(formatMessage(AppServiceDetailIntl.privateKeyFormatWrong))])
      return
    }
    callback()
  },
  handsubmit() {
    const { formatMessage } = this.props.intl
    this.props.form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
      const {
        cluster,
        serviceName,
        updateCertificates,
        loadCertificates,
        loadK8sService,
      } = this.props.scope.props
      const body = {
        certificate: values.cert,
        private_key: values.private,
      }
      updateCertificates(cluster, serviceName, body, {
        success: {
          func: () => {
            this.props.scope.setState({
              certificateExists: true,
              createModal: false,
            })
            loadCertificates(cluster, serviceName)
            loadK8sService(cluster, serviceName)
            new NotificationHandler().success(formatMessage(AppServiceDetailIntl.operationSuccess))
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = ''
            if (err.statusCode === 400) {
              msg = formatMessage(AppServiceDetailIntl.contentWrongReTry)
            }
            new NotificationHandler().error(formatMessage(AppServiceDetailIntl.operationFailure), msg)
          },
          isAsync: true
        }
      })
    })
  },
  restoreForm() {
    this.props.form.resetFields()
    this.props.scope.setState({createModal: false})
  },
  render() {
    const parentScope = this.props.scope
    const { getFieldProps } = this.props.form
    const { formatMessage } = this.props.intl
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const certContent = getFieldProps('cert', {
      rules: [
        { validator: this.certExists },
      ],
    })
    const privateContent = getFieldProps('private', {
      rules: [
        { validator: this.privateExists },
      ],
    })
    return (
      <Modal title={this.props.scope.state.certificateExists ?
        formatMessage(AppServiceDetailIntl.updateCertificate) : formatMessage(AppServiceDetailIntl.createCertificate)}
        visible={parentScope.state.createModal} className="createSslModal"
        onOk={()=> this.handsubmit()} onCancel={()=> this.restoreForm()}
        okText={this.props.scope.state.certificateExists ? formatMessage(AppServiceDetailIntl.update) :
        formatMessage(AppServiceDetailIntl.create)}
        >
        <Form horizontal>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.certificateType)}>
            <span>{formatMessage(AppServiceDetailIntl.serviceCertificate)}</span>
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.certificateContent)}>
            <Input type="textarea" {...certContent} placeholder={formatMessage(AppServiceDetailIntl.PEMToCode)}/>
            <a target="_blank" href="http://docs.tenxcloud.com/guide/service#https">
            {formatMessage(AppServiceDetailIntl.viewExample)}
            </a>
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.privateKeyContent)}>
            <Input type="textarea" {...privateContent} placeholder={formatMessage(AppServiceDetailIntl.PEMToCode)}/>
            <a target="_blank" href="http://docs.tenxcloud.com/guide/service#https">
            {formatMessage(AppServiceDetailIntl.viewExample)}
            </a>
          </FormItem>

        </Form>
      </Modal>
    )
  }
})

UploadSslModal = injectIntl(createForm()(UploadSslModal), { withRef: true, })

class AppSettingsHttps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabsActive: 1,
      statusText: '关闭',
      createModal: false,
      canOpenHttps: false,
      hasBindingDomainForHttp: false,
      detailModal: false,
      hasHTTPPort: false,
      certificateExists: false,
      httpsOpened: this.getHttpsSwitchState(props.k8sService),
      httpsStatusInited: false,
    }
    this.setHttpsSwitchState = this.setHttpsSwitchState.bind(this)
    this.getHttpsSwitchState = this.getHttpsSwitchState.bind(this)
  }
  componentWillMount() {
    const { serviceName, cluster, loadK8sService, loadServiceDetail, loadCertificates } = this.props
    const { formatMessage } = this.props.intl
    const { httpsOpened } = this.state
    loadK8sService(cluster, serviceName)
    loadServiceDetail(cluster, serviceName)
    const _this = this
    loadCertificates(cluster, serviceName, {
      success: {
        func: () => {
          _this.setState({certificateExists: true})
        }
      },
      failed: {
        func: (err) => {
          if (err.statusCode !== 404) {
            new NotificationHandler().error(formatMessage(AppServiceDetailIntl.getCertificateFailure))
          }
        },
        isAsync: true
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { deployment, k8sService, isCurrentTab, certificateExists, getInitHttpsStatus } = nextProps
    const k8sServiceOld = this.props.k8sService
    // get http port and binding domain info if reentry this tab
    if (this.props.isCurrentTab === false && nextProps.isCurrentTab === true) {
      const { serviceName, cluster, loadK8sService, loadServiceDetail } = this.props
      loadK8sService(cluster, serviceName)
      loadServiceDetail(cluster, serviceName)
    }
    const hasHTTPPort = this.hasHTTPPort(k8sService)
    const hasBindingDomainForHttp = this.hasBindingDomainForHttp(k8sService, deployment)
    this.setState({
      hasBindingDomainForHttp: hasBindingDomainForHttp,
      hasHTTPPort: hasHTTPPort,
      certificateExists: certificateExists,
      canOpenHttps: hasBindingDomainForHttp && hasHTTPPort && certificateExists,
    })
    if( this.props.isCurrentTab !== nextProps.isCurrentTab && nextProps.isCurrentTab){
      this.setHttpsSwitchState(k8sService)
    }
  }
  hasBindingDomainForHttp(k8sService, deployment) {
    if (!this.hasHTTPPort(k8sService)) {
      return false
    }
    const httpPorts = this.getHTTPPorts(k8sService)
    if (deployment.binding_port) {
      let bindingPorts = deployment.binding_port.split(',')
      // check if binding port is a http port
      for (let bindingPort of bindingPorts) {
        const found = httpPorts.some((port) => {
          return (parseInt(port) === parseInt(bindingPort))
        })
        if (found) {
          return true
        }
      }
    }
    return false
  }
  getHTTPPorts(k8sService) {
    let httpPorts = []
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]) {
      let userPort = k8sService.metadata.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]

      userPort = userPort.split(',')
      let httpPortNames = []
      for (let item of userPort) {
        const parts = item.split('/')
        if (parts[1].toUpperCase() === "HTTP") {
          httpPortNames.push(parts[0])
        }
      }
      for (let portName of httpPortNames) {
        for (let portInfo of k8sService.spec.ports) {
          if (portName === portInfo.name) {
            httpPorts.push(portInfo.port)
          }
        }
      }
    }
    return httpPorts
  }
  hasHTTPPort(k8sService) {
    const httpPorts = this.getHTTPPorts(k8sService)
    return httpPorts.length !== 0
  }
  toggleHttps(typ) {
    const { formatMessage } = this.props.intl
    const opText = typ ? formatMessage(ServiceCommonIntl.open) :  formatMessage(ServiceCommonIntl.close)
    const status = typ ? 'on' : 'off'
    const {
      cluster,
      serviceName,
    } = this.props
    if(!this.state.canOpenHttps){
      Modal.info({
        title: formatMessage(AppServiceDetailIntl.prompt),
        content: formatMessage(AppServiceDetailIntl.openHTTPSUploadCertificate),
      })
      return
    }
    this.props.toggleHTTPs(cluster, serviceName, status, {
      success: {
        func: () => {
          this.setState({
            httpsOpened: typ,
          })
          this.props.loadServiceDetail(cluster, serviceName)
          this.props.onSwitchChange(typ)
          new NotificationHandler().success(formatMessage(AppServiceDetailIntl.HTTPSSuccess, { opText }))
          this.setState({ statusText: opText })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          new NotificationHandler().error(formatMessage(AppServiceDetailIntl.HTTPSFailure, { opText }))
        },
        isAsync: true
      }
    })
  }
  targetTabs(e) {
    this.setState({
      tabsActive: e
    })
  }
  goLinks(key) {
    // setting ports || binddomain
    this.props.scope.setState({ activeTabKey: key })
  }
  setHttpsSwitchState(k8sService) {
    this.setState({
      httpsOpened: this.getHttpsSwitchState(k8sService),
    })
  }
  getHttpsSwitchState(k8sService) {
    let isOpen = false
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations[ANNOTATION_HTTPS] === 'true') {
      isOpen = true
    }
    return isOpen
  }
  deleteCertificates() {
    const {
      deleteCertificates,
      cluster,
      serviceName,
      loadCertificates,
    } = this.props
    const _this = this
    deleteCertificates(cluster, serviceName, {
      success: {
        func: () => {
          _this.setState({deleteModal: false, certificateExists: false})
          loadCertificates(cluster, serviceName, {
            failed: {
              func: (err) => {/* do nothing, just catch the error */},
              isAsync: true
            }
          })
          new NotificationHandler().success(formatMessage(AppServiceDetailIntl.deleteCertificateSuccess))
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          new NotificationHandler().error(formatMessage(AppServiceDetailIntl.deleteCertificateFailure))
        },
        isAsync: true
      }
    })
  }
   copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("httpsInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  render() {
    const {
      hasHTTPPort,
      hasBindingDomainForHttp,
    } = this.state
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const { formatMessage } = this.props.intl
    return (
      <div id="settingsHttps">
        <div className="topHead">
          {formatMessage(AppServiceDetailIntl.setHTTPS)}
          <Tooltip title={this.state.canOpenHttps ?
            formatMessage(AppServiceDetailIntl.HTTPAlreadyInfo, { statusText: this.state.statusText })
             : ''}>
            <Switch checkedChildren={formatMessage(ServiceCommonIntl.open)}
            unCheckedChildren={formatMessage(ServiceCommonIntl.close)} onChange={(e) => this.toggleHttps(e)} checked={this.state.httpsOpened} style={{ marginLeft: '40px' }} />
          </Tooltip>
        </div>
        <Card className="content">
          <div className="info commonBox">
            <div className="titleSpan">{formatMessage(AppServiceDetailIntl.setCondition)}</div>
            <div className="setting">
              <div className="commonTitle">{formatMessage(AppServiceDetailIntl.haveHTTPPort)}&nbsp;&nbsp;
                <Tooltip title={formatMessage(AppServiceDetailIntl.pleaseAddInPort)}><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasHTTPPort ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>{formatMessage(AppServiceDetailIntl.alreadyAdd)}</span> :
                <span className="links" onClick={() => this.goLinks('#visitType')}><Icon type="plus-circle-o" style={{ marginRight: '6px' }} />{formatMessage(AppServiceDetailIntl.goAdd)}</span>}
              </div>
              <div className="commonTitle">{formatMessage(AppServiceDetailIntl.haveHTTPportBindDomin)}&nbsp;&nbsp;
                <Tooltip title={formatMessage(AppServiceDetailIntl.pleaseBindDominAdd)}><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasBindingDomainForHttp ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>{formatMessage(AppServiceDetailIntl.alreadyBind)}</span> :
                <span className="links" onClick={() => this.goLinks('#binddomain')}><Icon type="link" style={{ marginRight: '6px' }} />{formatMessage(AppServiceDetailIntl.goBind)}</span>}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="hrs"></div>
            <div className="titleSpan">{formatMessage(AppServiceDetailIntl.certificate)}</div>
            <div className="certificate">
              <div className="headTab">
                <span className={this.state.tabsActive == 1 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(1)}>{formatMessage(AppServiceDetailIntl.useMySelfcertificate)}</span>
                {isStandardMode() ? <span className={this.state.tabsActive == 2 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(2)}>{formatMessage(AppServiceDetailIntl.useTenxCloudCertificate)}</span> : null}
              </div>
              <div className="tabsBody">
                <div className={this.state.tabsActive == 1 ? "tabs tabs-active" : 'tabs'}>
                  <Tooltip title={ (!hasHTTPPort || !hasBindingDomainForHttp) ? formatMessage(AppServiceDetailIntl.pleaseMeetaboveSerAdvantage) : '' }>
                    <Button size="large" disabled={!hasHTTPPort || !hasBindingDomainForHttp} onClick={()=> this.setState({createModal: true})}>
                      <Icon type="plus" />{this.state.certificateExists ?
                        formatMessage(AppServiceDetailIntl.update)
                        :
                        formatMessage(AppServiceDetailIntl.create)
                      }
                    </Button>
                  </Tooltip>
                  {this.state.certificateExists ?
                    [<div className="ant-table">
                      <table className="certificateTable">
                        <thead>
                          <tr>
                            <th>{formatMessage(ServiceCommonIntl.name)}</th>
                            <th>{formatMessage(ServiceCommonIntl.type)}</th>
                            <th>{formatMessage(AppServiceDetailIntl.startTime)}</th>
                            <th>{formatMessage(AppServiceDetailIntl.overdueTime)}</th>
                            <th>{formatMessage(ServiceCommonIntl.operation)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><a onClick={()=> this.setState({detailModal: true})}>{this.props.serviceName}</a></td>
                            <td>{formatMessage(AppServiceDetailIntl.serviceCertificate)}</td>
                            <td>{this.props.certificate.startTime}</td>
                            <td>{this.props.certificate.expireTime}</td>
                            <td> <Tooltip title={this.state.httpsOpened ?
                            formatMessage(AppServiceDetailIntl.pleaseCloseHTTPSDeleteCertificate)
                             : ''}><span className="cursor"><Icon onClick={()=> {this.state.httpsOpened || this.setState({deleteModal: true})}} type="delete" /></span></Tooltip></td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                    </div>]
                  :
                    <div className="alertTips">{formatMessage(AppServiceDetailIntl.useSelfSSLUploadCertificate)}</div>
                  }
                </div>

                <div className={this.state.tabsActive == 2 ? "tabs tabs-active" : 'tabs'}>
                  <Button size="large" disabled>{formatMessage(AppServiceDetailIntl.PleaseLookForward)}</Button>
                </div>

              </div>

            </div>
          </div>
        </Card>
        {/* 新建证书 */}
        <UploadSslModal scope={this} />
        {/* 证书详情 */}
        <Modal title={formatMessage(AppServiceDetailIntl.certificateDetail)} visible={this.state.detailModal} className="createSslModal"
        onCancel={()=> this.setState({detailModal: false})}
        footer={<Button type="primary" onClick={()=> this.setState({detailModal: false})} >{formatMessage(AppServiceDetailIntl.gotIt)}</Button>}
        >
        <Form horizontal>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.nameSpaceName, { space: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'})}>
            <span>{this.props.serviceName}</span>
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.certificateDetail)}>
            <span>{formatMessage(AppServiceDetailIntl.serviceCertificate)}</span>
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.certificateContent)} style={{margin:0}}>
            <div className="ant-input" style={{height:'200px', overflow:'auto',wordBreak:'break-word'}}>{this.props.certificate.pem}</div>
            <Tooltip title={this.state.copySuccess ? formatMessage(AppServiceDetailIntl.copySuccess) : formatMessage(AppServiceDetailIntl.clickCopy)}>
            <a  onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}><Icon type="copy" />{formatMessage(AppServiceDetailIntl.copy)}</a></Tooltip>
            <input className="httpsInput" style={{ position: "absolute", opacity: "0" }} defaultValue= {this.props.certificate.pem}/>
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.startTime)}>
            {this.props.certificate.startTime}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage(AppServiceDetailIntl.overdueTime)}>
            {this.props.certificate.expireTime}
          </FormItem>
        </Form>
      </Modal>
      <Modal title={formatMessage(AppServiceDetailIntl.deleteOperation)} visible={this.state.deleteModal}
        onCancel={()=> this.setState({deleteModal: false})}
        onOk={()=> this.deleteCertificates()}
        >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {formatMessage(AppServiceDetailIntl.makeSureDeleteCertificate, { serviceName: this.props.serviceName })}
        </div>
      </Modal>
        <div className="notice">{formatMessage(AppServiceDetailIntl.autoMoveToHttpsTips)}</div>
      </div>
    )
  }
}

AppSettingsHttps.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { serviceName } = props
  const camelizeSvcName = camelize(props.serviceName)
  const {
    serviceDetail,
    k8sService,
    certificates,
  } = state.services
  let deployment = {}
  if (serviceDetail && serviceDetail[cluster.clusterID] && serviceDetail[cluster.clusterID][serviceName] && serviceDetail[cluster.clusterID][serviceName].isFetching === false) {
    deployment = serviceDetail[cluster.clusterID][serviceName].service
  }

  let k8sServiceData = {}
  let getInitHttpsStatus = false
  if (k8sService && k8sService.isFetching === false) {
    getInitHttpsStatus = true
  }
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[camelizeSvcName]) {
    k8sServiceData = k8sService.data[camelizeSvcName]
  }
  let certificateExists = false
  let certificate = {}
  if (certificates && certificates.isFetching === false && certificates.result && certificates.result.data && certificates.result.statusCode === 200) {
    certificateExists = true
    certificate.startTime = certificates.result.data.certificate.starttime || ''
    certificate.expireTime = certificates.result.data.certificate.endtime || ''
    certificate.pem = certificates.result.data.pem || ''
  }
  return {
    resourcePrice: cluster.resourcePrice,
    k8sService: k8sServiceData,
    deployment,
    certificateExists,
    certificate,
    getInitHttpsStatus,
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadServiceDetail,
  loadK8sService,
  loadCertificates,
  updateCertificates,
  deleteCertificates,
  toggleHTTPs,
})(AppSettingsHttps), { withRef: true, })