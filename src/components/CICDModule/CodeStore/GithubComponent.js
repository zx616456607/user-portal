/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * codeRepo component
 *
 * v0.1 - 2016-10-31
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Form, Icon, Menu, Button, Card, Input, Tabs, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link, browserHistory } from 'react-router'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { connect } from 'react-redux'
import { parseQueryStringToObject } from '../../../common/tools'
import {
  getGithubList,
  searchGithubList,
  addGithubRepo,
  notGithubProject,
  registryGithub,
  syncRepoList,
  githubConfig,
  authGithubList,
  getUserInfo,
} from '../../../actions/cicd_flow'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import NotificationHandler from '../../../components/Notification'

const TabPane = Tabs.TabPane
const FormItem = Form.Item
const createForm = Form.create
const notification = new NotificationHandler()
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 18},
  }
}
const menusText = defineMessages({
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  publicKey: {
    id: 'CICD.TenxStorm.publicKey',
    defaultMessage: '公钥授权',
  },
  back: {
    id: 'CICD.TenxStorm.back',
    defaultMessage: '返回',
  },
  creageCodeStore: {
    id: 'CICD.TenxStorm.creageCodeStore',
    defaultMessage: '关联代码仓库',
  },
  logout: {
    id: 'CICD.TenxStorm.logout',
    defaultMessage: '注销',
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制',
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功',
  },
  sureCancellationCode: {
    id: 'CICD.TenxStorm.sureCancellationCode',
    defaultMessage: '您是否确认要注销这项代码源',
  },
  notSrc: {
    id: 'CICD.TenxStorm.notSrc',
    defaultMessage: '地址不能为空',
  },
  errorSrc: {
    id: 'CICD.TenxStorm.errorSrc',
    defaultMessage: '地址输入有误',
  },
  syncCode: {
    id: 'CICD.TenxStorm.syncCode',
    defaultMessage: '同步代码源项目结构',
  },
})


class CodeList extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    const loadingList = {}
    const data = this.props.data
    if (data) {
      for (let i = 0; i < data.length; i++) {
        loadingList[i] = false
      }
      this.setState({
        loadingList
      })
    }
  }

  // let CodeList = React.createClass({

  addBuild(item, index, repoUser) {
    const loadingList = {}
    const self = this
    loadingList[index] = true
    this.setState({
      loadingList
    })

    item.repoUser = repoUser
    this.props.scope.props.addGithubRepo('github',item, {
      success: {
        func: () => {
          notification.success('激活成功')
          if(window.location.search && window.location.search.indexOf('redirect=/devops/build_image/tenx_flow_build') >= 0) {
            const queryObj = parseQueryStringToObject(window.location.search)
            if(queryObj.redirect) {
              if(queryObj.showCard) {
                browserHistory.push(queryObj.redirect + '&showCard=' + queryObj.showCard)
                return
              }
              browserHistory.push(queryObj.redirect)
            }
            return
          }
          loadingList[index] = false
          self.setState({
            loadingList
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          notification.error('激活失败', res.message)
          loadingList[index] = false
          self.setState({
            loadingList
          })
        }
      }
    })
  }
  notActive(id, index) {
    const parentScope = this.props.scope
    const loadingList = {}
    const users = parentScope.state.users
    loadingList[index] = false
    this.setState({
      loadingList
    })

    parentScope.props.notGithubProject(users, id,'github', {
      success: {
        func: () => {
          notification.success('解除激活成功')
        }
      },
      failed: {
        func: (res) => {
          if (res.statusCode == 400) {
            notification.error('该项目正在被流水线任务引用，请解除引用后重试')
          } else {
            notification.error('解除激活失败')
          }
        }
      }
    })
  }

  render() {
    const { data, isFetching, repoUser } = this.props
    const scope = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let items = []
    if (data && data[0]) {
      items = data.map((item, index) => {
        return (
          <div className='CodeTable' key={item.projectId} >
            <div className="name textoverflow">{item.name}</div>
            <div className="type">{item.private ? "private" : 'public'}</div>
            <div className="action">
              {(item.managedProject && item.managedProject.active == 1) ?
                <span><Button type="ghost" disabled>已激活</Button>
                  <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>解除</a></span>
                :
                <Tooltip placement="right" title="可构建项目">
                  <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index, repoUser)} >{ window.location.search && window.location.search.indexOf('redirect=/devops/build_image/tenx_flow_build') >= 0 ? '激活并构建' : '激活'}</Button>
                </Tooltip>
              }
            </div>

          </div>
        );
      });
    }
    if (data.length ==0) {
      items = (<div className="ant-table-placeholder"><i className="anticon anticon-frown"></i>暂无数据</div>)
    }
    return (
      <div className="githubList">
        {items}
      </div>
    )
  }
}

class GithubComponent extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this)
    this.searchClick = this.searchClick.bind(this)
    this.state = {
      repokey: props.typeName,
      authorizeModal: false,
      currentSearch: '',
      copySuccess:false,
      githubConfigModal: false,
      githubConfigLoading: false,
    }
  }
  auth() {
    const { code, state } = this.props.scope.props.location.query
    if(code && state) {
      this.props.authGithubList('github', { code: code}, {
        success: {
          func: () => {
            setTimeout(() => {
              this.props.getUserInfo('github', {
                failed: () => {}
              })
            })
          }
        },
        failed: {
          func: err => {
            if(err.statusCode === 400) {
              if(err.message.message === 'The code passed is incorrect or expired.') {
                notification.success('已经授权')
                setTimeout(() => {
                  this.props.getGithubList('github', {
                    success: {
                      func: () => {
                        setTimeout(() => {
                          this.props.getUserInfo('github', {
                            failed: () => {}
                          })
                        })
                      }
                    }
                  })
                })
                return
              }
              if(err.message.message === 'The client_id and/or client_secret passed are incorrect.') {
                notification.warn('输入的ClientID或者ClientSecret有误')
                return
              }
              notification.warn('clientId, clientSecret, redirectUrl 其中有参数为空')
              return
            }
            if(err.statusCode === 500) {
              notification.warn('未知错误')
              return
            }
          }
        }
      })
    }
  }
  loadData() {
    const { typeName, getUserInfo } = this.props
    const { code, state } = this.props.scope.props.location.query
    if(code && state) {
      this.auth()
      return
    }
    this.props.getGithubList(typeName, {
      success: {
        func: () => {
          setTimeout(() => {
            getUserInfo('github', {
              failed: () => {}
            })
          })
        }
      },
      failed: {
        func:err => {
          if (err.message.message === 'access_token is empty. please check client_id, client_secret.') {
            notification.warn('请重新配置')
          }
          // 如果请求失败了，说明有可能没授权，所以尝试授权
          setTimeout(() => {
            this.auth()
          })
        }
      }
    })
  }
  componentWillMount() {
    this.loadData()
  }

  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    this.setState({removeModal: false})
    scope.props.deleteRepo(repoItem)
  }
  handSyncCode() {
    const { registryGithub, typeName} = this.props
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList || !typeList.includes(typeName)) {
      parentScope.setState({typeVisible: true})
      return
    }

    notification.spin(`正在执行中...`)
    this.setState({loading: true})
    registryGithub(typeName, {
      success: {
        func: (res) => {
          // notification.close()
          window.location.href = res.data.results.url
        }
      },
      failed: {
        func: (res) => {
          notification.close()
          notification.error('授权失败', res.message)
        }
      }
    })
  }
  showGithubConfig() {
    this.setState({
      githubConfigModal: true
    })
  }
  testChinese = (rule, value, callback) => {
    if(new RegExp("[\\u4E00-\\u9FFF]+","g").test(value)) {
      return callback('不得包含汉字')
    }else {
      callback()
    }
  }
  confirmAuth = () => {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }else {
        this.setState({
          githubConfigLoading: true,
        })
        const { githubConfig } = this.props
        const body = {
          private: 1,
          repo_type: "github",
          address: "https://github.com",
          clientId: values.clientId.trim(),
          clientSecret: values.clientSecret.trim(),
          redirectUrl: `${window.location.protocol}//${window.location.host}/devops/codestore/add`,
        }

        githubConfig('github', body, {
          success:{
            func: res => {
              if(res.data.status === 200) {
                notification.success('配置成功')
                this.setState({
                  githubConfigLoading: false,
                  githubConfigModal: false,
                  hasBeenConfiged: true,
                },() => {
                  window.location.href = res.data.results.url
                })

              }
            }
          },
          failed: {
            func: err => {
              notification.warn(err.message.message)
              this.setState({
                githubConfigModal: false,
                githubConfigLoading: false,
              })
            }
          }
        })
      }
    })
  }
  returnDefaultTooltip() {
    setTimeout(() => {
      this.setState({
        copySuccess: false
      });
    }, 500);
  }
  // 复制homepageUrl
  copyHomepageUrl = className => {
    let code = document.getElementsByClassName(`${className}`);
    code[0].select();
    document.execCommand("Copy", false);
    this.setState({
      copySuccess: true
    });
  }
  handleSearch(e) {
    const image = e.target.value
    const users = this.state.users
    this.setState({
      currentSearch: image
    })
    this.props.searchGithubList(users, image, this.props.typeName)
  }
  changeSearch(e) {
    const image = e.target.value
    const { users } = this.props
    this.setState({
      currentSearch: image
    })
    this.props.searchGithubList(users, image, this.props.typeName)
  }

  searchClick() {
    const image = this.state.currentSearch
    const users = this.state.users
    this.props.searchGithubList(users, image, 'github')
  }
  syncRepoList() {
    const { syncRepoList } = this.props
    const types = this.props.scope.state.repokey
    notification.spin(`正在执行中...`)
    syncRepoList(types, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码同步成功`)
        },
        isAsync: true
      }
    })
  }
  registryRepo() {
    const url = this.state.regUrl
    const token = this.state.regToken
    const { formatMessage } = this.props

    if (!url) {
      notification.info(formatMessage(menusText.notSrc))
      return
    }
    if (!token) {
      notification.info('Private Token不能为空')
      return
    }
    if (!(/^http:|^https:/).test(url)) {
      notification.info(formatMessage(menusText.errorSrc))
      return
    }
    const config = {
      url,
      token,
      type: this.props.scope.state.repokey
    }
    this.setState({
      loading: true
    })
    const self = this
    notification.spin(`代码仓库添加中...`)
    this.props.scope.props.registryRepo(config, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码仓库添加成功`)
          self.setState({
            authorizeModal: false,
            regUrl: '',
            regToken: ''
          })
          self.props.scope.props.getRepoList(config.type)
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          let message = err.message
          if (message && message.message) {
            message = message.message
          }
          notification.close()
          if (err.statusCode === 412) {
            notification.error(`代码仓库添加失败`, '不允许添加此类型的代码仓库！')
          } else {
            notification.error(`代码仓库添加失败`, '仓库地址或者私有Token有误！')
          }
          self.setState({ loading: false })
        }
      }
    })
  }
  validateLength = (value, length, callback) => {
    if(value.length < length) {
      return callback(`长度不能小于${length}字符`)
    }else if(value.length > length) {
      return callback(`长度不能大于${length}字符`)
    }else {
      callback()
    }

  }
  clientIdLength = (rule, value, callback) => {
    this.validateLength(value, 20, callback)
  }
  clientSecretLength = (rule, value, callback) => {
    this.validateLength(value, 40, callback)
  }

  render() {
    const { githubList, formatMessage, isFetching, typeName, repoUser} = this.props
    const { getFieldProps } = this.props.form
    const clientIdProps = getFieldProps('clientId', {
      validate: [
        {
          rules: [
            { required: true, message: '请输入Client ID' },
          ],
          trigger: ['onBlur', 'onChange'],
        },
        {
          rules: [
            { validator: this.testChinese },
          ],
          trigger: ['onBlur', 'onChange'],
        },
        {
          rules: [
            { validator: this.clientIdLength },
          ],
          trigger: ['onBlur', 'onChange'],
        },
      ],
    })
    const clientSecretProps = getFieldProps('clientSecret', {
      validate: [
        {
          rules: [
            { required: true, message: '请输入Client Secret' },
          ],
          trigger: ['onBlur', 'onChange'],
        },
        {
          rules: [
            { validator: this.testChinese },
          ],
          trigger: ['onBlur', 'onChange'],
        },
        {
          rules: [
            { validator: this.clientSecretLength },
          ],
          trigger: ['onBlur', 'onChange'],
        },
      ],
    })
    const scope = this

    if (!githubList) {
      if (typeName === 'github') {
        return (
          <div style={{ lineHeight: '100px', paddingLeft: '130px', paddingBottom: '16px' }}>
            <Button type="primary" size="large" style={{ width: 196 }} onClick={() => this.showGithubConfig()} disabled = {isFetching}>{isFetching? '加载中...' : '授权、同步 GitHub  代码源'}</Button>
            <Modal title={'选择代码源'}
                   visible={this.state.githubConfigModal}
                   onCancel={()=> this.setState({githubConfigModal: false}) }
                   footer={[
                     <Button type="default" size="large" key="cancel" onClick={()=> this.setState({githubConfigModal: false})}>取消</Button>,
                     <Button type="primary" size="large" key="ok" onClick={this.confirmAuth} loading={this.state.githubConfigLoading}>确定授权</Button>
                   ]} >
              <div className="content-wrapper">
                <h3 className="title">1、设置GitHub应用</h3>
                <div className="content">
                  <p className="indent-content">
                    <h4>① 标准GitHub，<a href="https://github.com/settings/developers" target="_blank">点击此处</a> 在弹出的新窗口中进行应用设置。</h4>
                  </p>
                  <p className="indent-content">
                    <h4>② 点击 "Register new application" 并填写表单内容:</h4>
                    <div className="indent-content-inner">
                      <input className="homePage" value={`${window.location.protocol}//${window.location.host}`}/>
                      <input className="authorization" value={`${window.location.protocol}//${window.location.host+window.location.pathname}`}/>
                      <p className="applicationName">Application name: 任何您喜欢的应用名称, 例如 My app</p>
                      <p className="homePageUrl">
                        Homepage URL:
                        <span className="url">{`${window.location.protocol}//${window.location.host}`}</span>
                        <Tooltip title={this.state.copySuccess ? "复制成功" : "点击复制"}>
                          <TenxIcon type="copy"
                            className='copy'
                            onClick={() => {this.copyHomepageUrl('homePage')}}
                            onMouseLeave={this.returnDefaultTooltip}
                          />
                        </Tooltip>
                      </p>
                      <p>Application description: 任何你喜欢的描述，可选</p>
                      <p className="authorizationUrl">Authorization callback URL:
                        <span className="url">{`${window.location.protocol}//${window.location.host+window.location.pathname}`}</span>
                        <Tooltip title={this.state.copySuccess ? "复制成功" : "点击复制"}>
                          <TenxIcon
                            type="copy"
                            className='copy'
                            onClick={() => {this.copyHomepageUrl('authorization')}}
                            onMouseLeave={this.returnDefaultTooltip}
                          />
                        </Tooltip>
                      </p>
                    </div>
                  </p>
                  <p className="indent-content">
                    <h4>③ 点击 "Register Application"</h4>
                  </p>
                </div>
                <h3 className="secondTitle">2、 设置 CI/CD 使用上一步中的 GitHub 应用验证</h3>
                <div className="tip">（将新创建 GitHub 应用的 Client ID 和 Secret 复制粘贴到下方的对应输入框中）</div>
                <Form className="content setCicd">
                  <FormItem label="Client ID" {...formItemLayout} hasFeedback>
                    <Input placeholder="请输入Client ID" {...clientIdProps} id="clientId" size="default"/>
                  </FormItem>
                  <FormItem label="Client Secret" {...formItemLayout} hasFeedback>
                    <Input placeholder="请输入Client Secret" {...clientSecretProps} size="default"/>
                  </FormItem>
                </Form>
              </div>
            </Modal>
          </div>
        )
      }
    }

    return (
      <div key="github-Component" type="right" className='codelink'>
        <div className="tableHead">
          <Icon type="user" />
          <span>{repoUser.username}</span>
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.setState({removeModal: true})} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Tooltip placement="top" title={formatMessage(menusText.syncCode)}>
            <Icon type="reload" onClick={() => this.syncRepoList()}  />
          </Tooltip>
          <div className="right-search">
            <Input className='searchBox' size="large" style={{ width: '180px', paddingRight:'28px'}} onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search' onClick={this.searchClick}></i>
          </div>
        </div>
        <div>
          <CodeList scope={scope} isFetching={isFetching} repoUser={this.props.user} data={githubList} />
        </div>
        <Modal title="注销代码源操作" visible={this.state.removeModal}
               onOk={()=> this.removeRepo()} onCancel={()=> this.setState({removeModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>
            注销该代码仓库，已激活的代码项目将『解除激活』，关联流水线、第三方工具可能失效无法继续执行, 确认注销该代码仓库？
          </div>
        </Modal>
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  const { githubRepo, userInfo } = state.cicd_flow
  const { cicdApi } = state.entities.loginUser.info
  const { isFetching } = githubRepo
  let repoUser = {
    depot: '',
    url: null,
    username: ''
  }
  if(userInfo.github) {
    repoUser = userInfo.github.repoUser
  }
  return {
    githubList: githubRepo['github']? githubRepo['github'].githubList: false,
    isFetching,
    cicdApi,
    user:githubRepo['github']? githubRepo['github'].users : '',
    repoUser
  }
}

GithubComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  registryGithub: PropTypes.func.isRequired,
  getGithubList: PropTypes.func.isRequired,
  searchGithubList: PropTypes.func.isRequired,
  addGithubRepo: PropTypes.func.isRequired
}
const FormGithubComponent = createForm()(GithubComponent)
export default connect(mapStateToProps, {
  registryGithub,
  getGithubList,
  searchGithubList,
  addGithubRepo,
  notGithubProject,
  syncRepoList,
  githubConfig,
  authGithubList,
  getUserInfo
})(injectIntl(FormGithubComponent, {
  withRef: true,
}))
