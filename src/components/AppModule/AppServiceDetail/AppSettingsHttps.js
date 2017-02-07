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
const CERT_REGEX = /.*/
const PRIVATE_KEY_REGEX = /.*/

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
      })
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
      <Modal title="新建证书" visible={parentScope.state.createModal} className="createSslModal"
        onOk={()=> this.handsubmit()} onCancel={()=> parentScope.setState({createModal: false})} 
        okText="创建"
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
      detailModal: false,
      hasBindingDomain: false,
      hasHTTPPort: false,
      certificateExists: false,
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
    const { deployment, k8sService, isCurrentTab } = nextProps
    // get http port and binding domain info if reentry this tab
    if (this.props.isCurrentTab === false && nextProps.isCurrentTab === true) {
      const { serviceName, cluster, loadK8sService, loadServiceDetail } = this.props
      loadK8sService(cluster, serviceName)
      loadServiceDetail(cluster, serviceName)
    }
    const hasHTTPPort = this.hasHTTPPort(k8sService, deployment)
    const hasBindingDomain = deployment && deployment.bindingDomains
    this.setState({ 
      hasBindingDomain: hasBindingDomain,
      hasHTTPPort: hasHTTPPort,
      targeStatus: hasBindingDomain && hasHTTPPort,
      firstEntry: false,
    })

  }
  hasHTTPPort(k8sService, deployment) {
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations && k8sService.metadata.annotations['tenxcloud.com/schemaPortname'] && deployment.bindingPort) {
      let userPort = k8sService.metadata.annotations['tenxcloud.com/schemaPortname']
      let bindingPorts = deployment.bindingPort.split(',')
      let tmp = []
      bindingPorts.map(port => {
        const p = parseInt(port)
        if (!isNaN(p)) {
          tmp.push(p)
        }
      })
      bindingPorts = tmp

      userPort = userPort.split(',')
      for (let item of userPort) {
        const parts = item.split('/')
        for (let port of bindingPorts) {
          for (let portInService of k8sService.spec.ports) {
            if (portInService.port === port) {
              if (parts[0] === portInService.name && parts[1].toUpperCase() === "HTTP") {
                return true
              }
            }
          }
        }
      }
    }
    return false
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
  setHttpsSwitchState() {
    const {
      k8sService,
    } = this.props
    let isOpen = false
    if (k8sService && k8sService.metadata && k8sService.metadata.annotations
      && k8sService.metadata.annotations['tenxcloud.com/https'] && k8sService.metadata.annotations['tenxcloud.com/https'] == true) {
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
      this.setHttpsSwitchState()
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
    } = this.props
    deleteCertificates(cluster, serviceName, {
      success: {
        func: () => {
          this.setState({
            certificateExists: false,
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
    } = this.state
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
    return new Promise((resolve, reject) => {
      updateCertificates(cluster, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              certificateExists: true,
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
              new NotificationHandler().success('操作成功')
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
    let  tipText = "请先满足上边的设置条件", tipStatus = true
    if (this.state.hasHTTPPort && this.state.hasBindingDomain) {
      tipText = ''
      tipStatus = false
    }
    if (!this.state.setting) {
      tipText = '请点击切换开关'
      tipStatus = true
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
              <div className="commonTitle">是否绑定域名&nbsp;&nbsp;
                <Tooltip title="请在绑定域名中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasBindingDomain ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已绑定</span> : 
                <span className="links" onClick={() => this.goLinks('#binddomain')}><Icon type="link" style={{ marginRight: '6px' }} />去绑定</span>}
              </div>
              <div className="commonTitle">是否已有http端口&nbsp;&nbsp;
                <Tooltip title="请在端口中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                {this.state.hasHTTPPort ?
                <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已添加</span> : 
                <span className="links" onClick={() => this.goLinks('#ports')}><Icon type="plus-circle-o" style={{ marginRight: '6px' }} />去添加</span>}
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
                  {/* 满足条件则不 提示 */}
                  <Tooltip title={ tipText }><Button size="large" disabled={tipStatus} onClick={()=> this.setState({createModal: true})}><Icon type="plus" />{this.state.certificateExists ? '重新新建' : '新建'}</Button></Tooltip>
                  {this.state.certificateExists ? 
                    [<Button size="large" onClick={()=> this.deleteCertificates()} style={{marginLeft:'8px'}}>删除</Button>,
                    <div className="ant-table">
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
                        <tr>
                          <td><a onClick={()=> this.setState({detailModal: true})}>test</a></td>
                          <td>服务器证书</td>
                          <td>2017-2-1</td>
                          <td>2027-3-1</td>
                          <td> <Icon type="delete" /></td>
                        </tr>
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
            <span>test</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="证书内容">
            <Input type="textarea"/>
          </FormItem>
          <FormItem {...formItemLayout} label="启用时间">
            2017-2-3
          </FormItem>
          <FormItem {...formItemLayout} label="过期时间">
            2017-2-9
          </FormItem>
        </Form>
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
  if (certificates && certificates.isFetching === false && certificates.result && certificates.result.statusCode === 200) {
    certificateExists = true
    certificate.startTime = 'starttime'
    certificate.expireTime = 'expireTime'
    certificate.data = certificates.result.data || 'testdata'
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