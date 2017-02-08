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
import NotificationHandler from '../../../common/notification_handler'
import './style/AppSettingsHttps.less'
import { CERT_REGEX, PRIVATE_KEY_REGEX, ANNOTATION_SVC_SCHEMA_PORTNAME, ANNOTATION_HTTPS } from '../../../../constants'

const FormItem = Form.Item
const createForm = Form.create

let UploadSslModal = React.createClass({
  // nameExists(rule, values, callback) {
  //   if (!values) {
  //     callback([new Error('请输入证书名称')])
  //     return
  //   }
  //   callback()
  // },
  certExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入证书内容')])
      return
    }
    if (!CERT_REGEX.test(values)) {
      callback([new Error('证书格式错误')])
      return
    }
    callback()
  },
  privateExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入密钥内容')])
      return
    }
    if (!PRIVATE_KEY_REGEX.test(values)) {
      callback([new Error('私钥格式错误')])
      return
    }
    callback()
  },
  handsubmit() {
    this.props.form.validateFields((error, values)=> {
      if (!!error) {
        console.log('error', error)
        return
      }
      this.props.scope.setState({
        certContent: values.cert,
        keyContent: values.private,
        createModal: false,
        modified: true
      })
      new NotificationHandler().success('格式验证通过，请保存')
    })
  },
  render() {
    const parentScope = this.props.scope
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const nameProps = getFieldProps('sslName', {
      rules: [
        { validator: this.nameExists },
      ],
    })
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
      <Modal title={this.props.scope.state.certificateExists ? "更新证书" : "新建证书"} visible={parentScope.state.createModal} className="createSslModal"
        onOk={()=> this.handsubmit()} onCancel={()=> parentScope.setState({createModal: false})} 
        okText={this.props.scope.state.certificateExists ? "更新" : "创建"}
        >
        <Form horizontal>
          {/*<FormItem
            {...formItemLayout}
            label="证书名称"
            >
            <Input {...nameProps} type="text" className="SslName" placeholder="请输入名称" />
          </FormItem>*/}
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书内容">
            <Input type="textarea" {...certContent}/>
            <a>查看样例</a>
          </FormItem>
          <FormItem {...formItemLayout} label="密钥内容">
            <Input type="textarea" {...privateContent}/>
            <a>查看样例</a>
          </FormItem>

        </Form>
      </Modal>
    )
  }
})

UploadSslModal = createForm()(UploadSslModal)

class AppSettingsHttps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabsActive: 1,
      statusText: '关闭',
      targeStatus: false,
      createModal: false,
      hasBindingDomainForHttp: false,
      detailModal: false,
      hasHTTPPort: false,
      certificateExists: false,
      modified: false,
      firstEntry: true,
      setting: false,
      modifying: false,
      httpsOpened: false,
      certContent: '',
      keyContent: '',
    }
  }
  componentWillMount() {
    const { serviceName, cluster, loadK8sService, loadServiceDetail, loadCertificates } = this.props
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
            new NotificationHandler().error('获取证书失败')
          }
        },
        isAsync: true
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { deployment, k8sService, isCurrentTab, certificateExists } = nextProps
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
      targeStatus: hasBindingDomainForHttp && hasHTTPPort,
      firstEntry: false,
      certificateExists: certificateExists,
    })
    this.setHttpsSwitchState(k8sService)
    
  }
  hasBindingDomainForHttp(k8sService, deployment) {
    if (!this.hasHTTPPort(k8sService)) {
      return false
    }
    const httpPorts = this.getHTTPPorts(k8sService)
    if (deployment.bindingPort) {
      let bindingPorts = deployment.bindingPort.split(',')
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
  modifyHttps() {
    this.setState({ modifying: true })
  }
  changeSwitch(e) {
    this.setState({ statusText: e ? '开启' : '关闭', setting: e })
    if (!e) {
      const {
        cluster,
        serviceName,
      } = this.props
      this.props.toggleHTTPs(cluster, serviceName, 'off', {
        success: {
          func: () => {
            this.setState({
              httpsOpened: false,
            })
            new NotificationHandler().success('HTTPS关闭成功')
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            new NotificationHandler().error('HTTPS关闭失败，请重试')
          },
          isAsync: true
        }
      })
    }
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
    let isOpen = false
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations
      && k8sService.metadata.annotations[ANNOTATION_HTTPS] && k8sService.metadata.annotations[ANNOTATION_HTTPS] === 'true') {
      isOpen = true
      this.setState({
        httpsOpened: isOpen,
      })
    }
  }
  modifyCert() {
    const {
      certContent,
      keyContent,
    } = this.state
    if (!certContent || !keyContent) {
      new NotificationHandler().info('请先点击下方更新，去填写证书')
      return
    }
    if (!CERT_REGEX.test(certContent)) {
      new NotificationHandler().error('操作失败', '证书格式错误，请修改后重试')
      return
    }
    if (!PRIVATE_KEY_REGEX.test(keyContent)) {
      new NotificationHandler().error('操作失败', '密钥格式错误，请修改后重试')
      return
    }
    const {
      cluster,
      serviceName,
      updateCertificates,
      loadCertificates,
    } = this.props
    const body = {
      certificate: certContent,
      private_key: keyContent,
    }
    updateCertificates(cluster, serviceName, body, {
      success: {
        func: () => {
          this.setState({
            modifying: false,
          })
          loadCertificates(cluster, serviceName)
          new NotificationHandler().success('证书更新成功')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          let msg = ''
          if (err.statusCode === 400) {
            msg = '内容错误请重试'
          }
          new NotificationHandler().error('操作失败', msg)
        },
        isAsync: true
      }
    })
  }
  headActionfunc() {
    if (this.state.setting) {
      return (
        <span style={{ marginLeft: '50px' }}>
          <Button type="primary" onClick={() => {this.saveCertAndOpen()}}>开启并保存</Button>
          <Button onClick={() => this.setState({ targeStatus: false, setting: false, })} style={{ marginLeft: '10px' }}>取消</Button>
        </span>
      )
    }
    else {
      return (
        <span>
          {/*svg ><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#settingsIcon"></use></svg>*/}
          {this.state.modifying || <Tooltip title={`HTTPS已${this.state.statusText}`}><Switch checkedChildren="开" unCheckedChildren="关" onChange={(e) => this.changeSwitch(e)} checked={this.state.httpsOpened} style={{ marginLeft: '40px' }} /></Tooltip>}
          {this.state.httpsOpened && ( this.state.modifying ? 
          <span style={{ marginLeft: '50px' }}>
            <Button type="primary" onClick={() => {this.modifyCert()}}>保存</Button>
            <Button style={{ marginLeft: '10px' }} onClick={() => {this.setState({modifying: false})}}>取消</Button>
          </span>
          : <span className="settingsIcon" onClick={() => this.modifyHttps()}><svg ><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#settingsIcon"></use></svg></span>)}
        </span>
      )
    }
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
          new NotificationHandler().success('删除证书成功')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          new NotificationHandler().error('删除证书失败，请重试')
        },
        isAsync: true
      }
    })
  }
  saveCertAndOpen() {
    const {
      certContent,
      keyContent,
      certificateExists,
      modified,
    } = this.state
    // 证书存在时且没有更新时，前端无法取得密钥内容，所以不进行格式验证
    if (!certificateExists || modified) {
      if (!certContent) {
        new NotificationHandler().info('请先点击下方新建，去填写证书')
        return
      }
      if (!CERT_REGEX.test(certContent)) {
        new NotificationHandler().error('操作失败', '证书格式错误，请修改后重试')
        return
      }
      if (!PRIVATE_KEY_REGEX.test(keyContent)) {
        new NotificationHandler().error('操作失败', '密钥格式错误，请修改后重试')
        return
      }
    }
    const {
      cluster,
      serviceName,
      updateCertificates,
      loadCertificates,
    } = this.props
    const body = {
      certificate: certContent,
      private_key: keyContent,
    }
    return new Promise((resolve, reject) => {
      // 已存在并且没有修改表示不需要更新证书只需要开启HTTPS
      if (certificateExists && !modified) {
        resolve()
        return
      }
      updateCertificates(cluster, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              certificateExists: true,
              modified: false,
              certContent: false,
              keyContent: false
            })
            loadCertificates(cluster, serviceName)
            resolve()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = ''
            if (err.statusCode === 400) {
              msg = '内容错误请重试'
            }
            new NotificationHandler().error('操作失败', msg)
            reject()
          },
          isAsync: true
        }
      })
    }).then(() => {
      return new Promise((resolve, reject) => {
        this.props.toggleHTTPs(cluster, serviceName, 'on', {
          success: {
            func: () => {
              this.setState({
                httpsOpened: true,
                setting: false,
              })
              new NotificationHandler().success('HTTPS开启成功')
              resolve()
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              new NotificationHandler().error('操作失败，请重试')
              reject()
            },
            isAsync: true
          }
        })
      })
    })
  }
  render() {
    let  tipText = "请先满足上边的设置条件", disableUploadBtn = true
    if ((this.state.setting || this.state.modifying) && (this.state.hasHTTPPort && this.state.hasBindingDomainForHttp)) {
      tipText = ''
    }
    else if (!this.state.httpsOpened && !this.state.setting) {
      tipText = '请点击切换开关'
    }
    else if (this.state.httpsOpened && !this.state.modifying) {
      tipText = '请点击齿轮图标'
    }
    if (this.state.setting || this.state.modifying) {
      disableUploadBtn = false
    }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <div id="settingsHttps">
        <div className="topHead">
          设置HTTPS
          {this.headActionfunc()}
        </div>
        <Card className="content">
          <div className="info commonBox">
            <div className="titleSpan">设置条件</div>
            <div className="setting">
              <div className="commonTitle">是否已有http端口&nbsp;&nbsp;
                <Tooltip title="请在端口中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasHTTPPort ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已添加</span> : 
                <span className="links" onClick={() => this.goLinks('#ports')}><Icon type="plus-circle-o" style={{ marginRight: '6px' }} />去添加</span>}
              </div>
              <div className="commonTitle">是否在http端口绑定域名&nbsp;&nbsp;
                <Tooltip title="请在绑定域名中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasBindingDomainForHttp ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已绑定</span> : 
                <span className="links" onClick={() => this.goLinks('#binddomain')}><Icon type="link" style={{ marginRight: '6px' }} />去绑定</span>}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="hrs"></div>
            <div className="titleSpan">证书</div>
            <div className="certificate">
              <div className="headTab">
                <span className={this.state.tabsActive == 1 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(1)}>使用自有证书</span>
                <span className={this.state.tabsActive == 2 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(2)}>使用Tenxcloud提供的信任证书</span>
              </div>
              <div className="tabsBody">
                <div className={this.state.tabsActive == 1 ? "tabs tabs-active" : 'tabs'}>
                  <Tooltip title={ tipText }><Button size="large" disabled={disableUploadBtn} onClick={()=> this.setState({createModal: true})}><Icon type="plus" />{this.state.certificateExists ? '更新' : '新建'}</Button></Tooltip>
                  {this.state.certificateExists ? 
                    [<div className="ant-table">
                      <table className="certificateTable">
                        <thead>
                          <tr>
                            <th>名称</th>
                            <th>类型</th>
                            <th>开启时间</th>
                            <th>过期时间</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><a onClick={()=> this.setState({detailModal: true})}>{this.props.serviceName}</a></td>
                            <td>服务器证书</td>
                            <td>{this.props.certificate.startTime}</td>
                            <td>{this.props.certificate.expireTime}</td>
                            <td> <span className="cursor"><Icon onClick={()=> this.setState({deleteModal: true})} type="delete" /></span></td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                    </div>]
                  :
                    <div className="alertTips">Tips：使用自有的 ssl 证书则需要上传您的证书至该服务</div>
                  }
                </div>

                <div className={this.state.tabsActive == 2 ? "tabs tabs-active" : 'tabs'}>
                  <Button size="large" disabled>敬请期待</Button>
                </div>

              </div>

            </div>
          </div>
        </Card>
        {/* 新建证书 */}
        <UploadSslModal scope={this} />
        {/* 证书详情 */}
        <Modal title="证书详情" visible={this.state.detailModal} className="createSslModal"
        onCancel={()=> this.setState({detailModal: false})} 
        footer={<Button type="primary" onClick={()=> this.setState({detailModal: false})} >知道了</Button>}
        >
        <Form horizontal>
          <FormItem {...formItemLayout} label="证书名称">
            <span>{this.props.serviceName}</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书内容">
            <Input type="textarea" value={this.props.certificate.pem}/>
          </FormItem>
          <FormItem {...formItemLayout} label="启用时间">
            {this.props.certificate.startTime}
          </FormItem>
          <FormItem {...formItemLayout} label="过期时间">
            {this.props.certificate.expireTime}
          </FormItem>
        </Form>
      </Modal>
      <Modal title="删除操作" visible={this.state.deleteModal}
        onCancel={()=> this.setState({deleteModal: false})}
        onOk={()=> this.deleteCertificates()}
        >
        <div id="StateBtnModal">
          <div className="confirm"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您是否确定删除证书：{this.props.serviceName}</div>
        </div>
      </Modal>
        <div className="notice">注：HTTPS启动，则停止原有的HTTP服务</div>
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
  if (k8sService && k8sService.isFetching === false && k8sService.data && k8sService.data[serviceName]) {
    k8sServiceData = k8sService.data[serviceName]
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
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail,
  loadK8sService,
  loadCertificates,
  updateCertificates,
  deleteCertificates,
  toggleHTTPs,
})(AppSettingsHttps)