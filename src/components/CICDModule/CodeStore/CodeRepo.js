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
import { Form, Icon, Button, Input, Tabs, Tooltip, Checkbox, Modal, Spin } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CodeRepo.less'
import { parseQueryStringToObject } from '../../../common/tools'
import { getRepoType, getRepoList, addCodeRepo, notActiveProject, deleteRepo, registryRepo, syncRepoList, searchCodeRepo, getUserInfo } from '../../../actions/cicd_flow'
import GithubComponent from './GithubComponent'
import GogsComponent from './GogsComponent'
import SvnComponent from './SvnComponent'
import NotificationHandler from '../../../components/Notification'
import Title from '../../Title'

const TabPane = Tabs.TabPane
const FormItem = Form.Item
const createForm = Form.create
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
  syncCode: {
    id: 'CICD.TenxStorm.syncCode',
    defaultMessage: '同步代码',
  },
  SuccessfulActivation: {
    id: 'CICD.TenxStorm.SuccessfulActivation',
    defaultMessage: '激活成功',
  },
  CancellationCode: {
    id: 'CICD.TenxStorm.CancellationCode',
    defaultMessage: '注销代码源',
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
  UndoSuccessful: {
    id: 'CICD.TenxStorm.UndoSuccessful',
    defaultMessage: '撤消成功',
  }
})

const MyComponent = React.createClass({
  propTypes: {
  },
  getInitialState() {
    return {
      copySuccess: false, keyModal: false,
      regUrl: '',
      regToken: ''
    }
  },
  componentWillMount() {
    console.log(window.location.host,window.location.protocol,)
    const {getRepoList, getUserInfo} = this.props.scope.props
    const self = this.props.scope
    getRepoList('gitlab', {
      success: {
        func: (res) => {
          if (res.data.total && res.data.total > 0) {
            let loadingList = {}
            self.props.getUserInfo('gitlab')
            for (let i = 0; i < res.data.results.length; i++) {
              loadingList[i] = false
            }
            self.setState({
              loadingList
            })
          }
        },
        isAsync: true
      }
    })
  },
  copyItemKey() {
    const scope = this;
    let code = document.getElementsByClassName("KeyCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  addBuild(item, index) {
    const parentScope = this.props.scope
    const loadingList = {}
    const self = this
    loadingList[index] = true
    parentScope.setState({
      loadingList
    })
    let notification = new NotificationHandler()
    parentScope.props.addCodeRepo('gitlab', item, {
      success: {
        func: (res) => {
          const { formatMessage } = self.props
          notification.success(formatMessage(menusText.SuccessfulActivation))
          if (res.data.warnings) {
            notification.warn('公钥或WebHook未设置成功，请手动设置')
          }
          if(window.location.search && window.location.search.indexOf('redirect=/ci_cd/build_image/tenx_flow_build') >= 0) {
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
        },
        isAsync: true
      }
    })
  },
  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    this.setState({removeModal: false})
    scope.props.deleteRepo(repoItem)
  },
  registryRepo() {
    const url = this.state.regUrl
    const token = this.state.regToken
    const { formatMessage } = this.props
    let notification = new NotificationHandler()
    if (!url) {
      notification.info(formatMessage(menusText.notSrc))
      return
    }
    if (!token) {
      notification.info('Private Token不能为空')
      return
    }
    if (!(/^http:|^https:/).test(url)) {
      notification.info(formatMessage(menusText.errorSrc) + '，以http://或者https://开头')
      return
    }
    const config = {
      url,
      token,
      type: this.props.typeName
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
            regToken: '',
            loading: false
          })
          self.props.scope.props.getRepoList(config.type)
          self.props.scope.props.getUserInfo(config.type)
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
  },
  syncRepoList() {
    const types = this.props.scope.state.repokey
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    this.props.scope.props.syncRepoList(types, {
      success: {
        func: () => {
          notification.close()
          notification.success(`代码同步成功`)
        },
        isAsync: true
      }
    })
  },
  handleSearch(e) {
    const parentScope = this.props.scope
    const codeName = e.target.value
    parentScope.props.searchCodeRepo(codeName, this.props.typeName)
  },
  changeSearch(e) {
    const codeName = e.target.value
    if (codeName == '') {
      const parentScope = this.props.scope
      parentScope.props.searchCodeRepo(codeName, this.props.typeName)
    }
  },
  notActive(id, index) {
    const parentScope = this.props.scope
    const {formatMessage} = this.props
    const loadingList = {}
    loadingList[index] = false
    parentScope.setState({
      loadingList
    })
    let notification = new NotificationHandler()
    parentScope.props.notActiveProject(id, this.props.typeName, {
      success: {
        func: () => {
          notification.success(formatMessage(menusText.UndoSuccessful))
        }
      },
      failed: {
        func: (err) => {
          if (err && err.statusCode === 400 && err.message && err.message.message.indexOf('remove the reference') > 0 ) {
            var result = err.message.message.match(/.*'(.*)'/)
            notification.error('构建任务 ' + result[1] + ' 正在使用该代码仓库，请移除对应关联后重试.')
            return
          }
          notification.error('撤销代码仓库失败：' + JSON.stringify(err))
        }
      }
    })
  },
  showGtilabModal() {
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList.includes('gitlab')) {
      parentScope.setState({typeVisible: true})
      return
    }
    this.setState({ authorizeModal: true })
    setTimeout(function(){
      document.getElementById('gitlab').focus()
    },0)
  },
  changeUrl(e) {
    this.setState({ regUrl: e.target.value })
  },
  changeToken(e) {
    this.setState({ regToken: e.target.value })
  },
  closeAddGitlabModal() {
    //this function for close modal and set from to null
    this.setState({
      authorizeModal: false,
      regUrl: '',
      regToken: ''
    })
  },
  render: function () {
    const { config, scope, formatMessage, isFetching} = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    if (!config) {
      return (
        <div style={{ lineHeight: '100px', paddingLeft: '140px', paddingBottom: '16px' }}>
          <Button type="primary" size="large" onClick={() => this.showGtilabModal() }>添加 GitLab 代码仓库</Button>
          <Modal title="添加 GitLab 代码仓库" visible={this.state.authorizeModal} maskClosable={false}
            onCancel={this.closeAddGitlabModal}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ authorizeModal: false }) } }>取消</Button>,
              <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.registryRepo()}>确定</Button>,
            ]}
            >
            <div>
              <p style={{ lineHeight: '30px' }}>仓库地址：<span>（如 http://gitlab.demo.com）</span>
                <Input placeholder="http://*** | https://***" id="gitlab" onChange={this.changeUrl} value={this.state.regUrl} size="large" />
              </p>
              <p style={{ lineHeight: '30px' }}>Private Token：<span>（位于 Profile Settings → Account）</span>
                <Input placeholder="Private Token: " size="large" onChange={this.changeToken} value={this.state.regToken} />
              </p>
            </div>
          </Modal>
        </div>
      )
    }

    let items = config.length > 0 && config.map((item, index) => {
      return (
        <div className='CodeTable' key={item.name} >
          <div className="name textoverflow">{item.name}</div>
          <div className="type">{item.private ? "private" : "public"}</div>
          <div className="action">
            {(item.managedProject && item.managedProject.active == 1) ?
              <span><Button type="ghost" disabled>已激活</Button>
                <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>撤销</a></span>
              :
              <Tooltip placement="right" title="可构建项目">
                <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index)} >{ window.location.search && window.location.search.indexOf('redirect=/ci_cd/build_image/tenx_flow_build') >= 0 ? '激活并构建' : '激活'}</Button>
              </Tooltip>
            }
          </div>

        </div>
      );
    });
    if (config.length ==0) {
      items = (<div className="ant-table-placeholder"><i className="anticon anticon-frown"></i>暂无数据</div>)
    }
    return (
      <div className='codelink'>
        <div className="tableHead">
          <Icon type="user" /> {this.props.repoUser ? this.props.repoUser.username : ''}
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.setState({removeModal: true})} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Tooltip placement="top" title={formatMessage(menusText.syncCode)}>
            <Icon type="reload" onClick={() => this.syncRepoList()}  />
          </Tooltip>
          <Tooltip title={this.props.repoUser ? this.props.repoUser.url : ''}>
            <Icon type="link" style={{ margin: '0 20px' }} />
          </Tooltip>
          <div className="right-search">
            <Input className='searchBox' size="large" onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} style={{ width: '180px', paddingRight:'28px'}} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'>  </i>
          </div>
        </div>
        {/*  @project  Head end    */}

        {items}
        <Modal title="注销代码源操作" visible={this.state.removeModal}
          onOk={()=> this.removeRepo()} onCancel={()=> this.setState({removeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i> {formatMessage(menusText.sureCancellationCode)}?</div>
        </Modal>
      </div>
    );
  }
});

class CodeRepo extends Component {
  constructor(props) {
    super(props);
    const type = location.search ? location.search.split('?')[1] : 'gitlab'
    if (type) {
      this.state = {
        repokey: type,
        copySuccess:false,
      }
    }

  }
  componentWillMount () {
    const _this = this
    const {getRepoList, getUserInfo} = this.props
    this.props.getRepoType({
      success: {
        func: (res) => {
          _this.setState({typeList: res.data})
        //  this.loadData(res.data[0])
        },
        isAsync: true
      }
    })
  }
  loadData(repo) {
    const {getRepoList, getUserInfo} = this.props
    const self = this
    getRepoList(repo, {
      success: {
        func: (res) => {
          if (res.data.total > 0) {
            let loadingList = {}
            self.props.getUserInfo(repo)
            for (let i = 0; i < res.data.results.length; i++) {
              loadingList[i] = false
            }
            self.setState({
              loadingList
            })
          }
        },
        isAsync: true
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      // this.loadData()
      return
    }
  }
  formetRepoType(type) {
    switch(type) {
      case 'github':
        return 'GitHub'
      case 'gitlab':
        return 'GitLab'
      case 'gogs':
        return 'Gogs'
      default:
        return 'SVN'
    }
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
  testChinese = (rule, value, callback) => {
    if(new RegExp("[\\u4E00-\\u9FFF]+","g").test(value)) {
      return callback('不得包含汉字')
    }else {
      callback()
    }
  }
  confirmAuth = () => {
    this.props.form.validateFields((errors, values) => {
      console.log(errors);
      if (!!errors) {

        return;
      }else {
        this.setState({typeVisible: false})
      }
      console.log('Submit!!!');

      console.log(values);
    });

  }
  render() {
    const { cicdApi } = this.props;
    const { formatMessage } = this.props.intl;
    const { getFieldProps } = this.props.form
    const scope = this;
    const gitlabBud = (
      <span className="section">
        <i className="icon gitlab"></i>
        GitLab
      </span>
    )
    const githubBud = (
      <span className="section">
        <i className="icon github"></i>
        GitHub
      </span>
    )
    const svnBud = (
      <span className="section">
        <i className="icon svn"></i>
        SVN
      </span>
    )
    const bibucketBud = (
      <span className="section">
        <i className="icon bibucket"></i>
        <span className="node-number">10</span>
        bibucket
      </span>
    )
    const gogsBud = (
      <span className="section">
        <i className="icon gogs"></i>
        Gogs
      </span>
    )

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
      ],
    })
    return (
      <QueueAnim id='codeRepo'
        type='right'
        >
        <Title title="代码仓库" />
        <div className="codeContent">
          <div className='headBox'>
            <Link to="/ci_cd">
              <i className='fa fa-arrow-left' />&nbsp;
              <FormattedMessage {...menusText.back} />
            </Link>
            <p className="topText"><FormattedMessage {...menusText.creageCodeStore} /></p>
          </div>
          <div className="card-container">
            <p style={{ paddingLeft: '36px', lineHeight: '40px' }}>选择代码源</p>
            <Tabs type="card" onChange={(e) => this.setState({ repokey: e }) } activeKey={this.state.repokey}>
              <TabPane tab={gitlabBud} key="gitlab"><MyComponent typeName='gitlab' formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} repoUser={this.props.repoUser} config={this.props.repoList} /></TabPane>
              <TabPane tab={gogsBud} key="gogs"><GogsComponent typeName="gogs" formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope}/></TabPane>
              <TabPane tab={svnBud} key="svn"><SvnComponent formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} /></TabPane>
              <TabPane tab={githubBud} key="github"><GithubComponent typeName="github" formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} /></TabPane>
            </Tabs>
          </div>

          <Modal title={'选择代码源'} visible={this.state.typeVisible}
            onCancel={()=> this.setState({typeVisible: false}) }
            footer={[
              <Button type="default" size="large" key="cancel" onClick={()=> this.setState({typeVisible: false})}>取消</Button>,
              <Button type="primary" size="large" key="ok" onClick={this.confirmAuth}>确定授权</Button>
            ]} >
            <div className="content-wrapper">
              <h3 className="title">1、设置GitHub应用</h3>
              <div className="content">
                <p className="indent-content">
                  <h4>① 标准GitHub，<a href="https://github.com/settings/developers" target="blank">点击此处</a> 在弹出的新窗口中进行应用设置。</h4>
                  <div className="indent-content-inner">企业版GitHub，请登录你的账号，点击Settings，然后点击Applications进行设置。</div>
                </p>
                <p className="indent-content">
                  <h4>② 点击 "Register new application" 并填写表单内容:</h4>
                  <div className="indent-content-inner">
                    <p>Application name: 任何您喜欢的应用名称, 例如 My app</p>
                    <p className="homePageUrl">
                      Homepage URL:
                      <input className="homePage" value={`${window.location.protocol}//${window.location.host}`}/>

                      <Tooltip title={this.state.copySuccess ? "复制成功" : "点击复制"}>
                        <svg className='copy' onClick={() => {this.copyHomepageUrl('homePage')}} onMouseLeave={this.returnDefaultTooltip}>
                          <use xlinkHref='#appcentercopy' />
                        </svg>
                      </Tooltip>

                    </p>
                    <p>Application description: 任何你喜欢的描述，可选</p>
                    <p className="authorizationUrl">Authorization callback URL:
                      <input className="authorization" value={`${cicdApi.protocol}://${cicdApi.host}/api/auth-callback`}/>

                      <Tooltip title={this.state.copySuccess ? "复制成功" : "点击复制"}>
                        <svg className='copy' onClick={() => {this.copyHomepageUrl('authorization')}} onMouseLeave={this.returnDefaultTooltip}>
                          <use xlinkHref='#appcentercopy' />
                        </svg>
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
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultValue = {
    gitlab: {
      repoList: []
    },
    isFetching: false
  }
  const { codeRepo, userInfo } = state.cicd_flow
  const { cicdApi } = state.entities.loginUser.info
  const defaultUser = {
    repoUser: {
      username: '',
      depot: '',
      url: ''
    }
  }
  const { repoList, isFetching } = codeRepo.gitlab || defaultValue
  const { repoUser } = userInfo.gitlab || defaultUser
  return {
    repoList,
    isFetching,
    repoUser,
    cicdApi,
    currentSpace: state.entities.current.space.namespace
  }
}

CodeRepo.propTypes = {
  intl: PropTypes.object.isRequired,
  getRepoList: PropTypes.func.isRequired,
  addCodeRepo: PropTypes.func.isRequired,
  deleteRepo: PropTypes.func.isRequired
}
const FormCodeRepo = createForm()(CodeRepo)
export default connect(mapStateToProps, {
  getRepoType,
  getRepoList,
  addCodeRepo,
  deleteRepo,
  registryRepo,
  syncRepoList,
  searchCodeRepo,
  getUserInfo,
  notActiveProject
})(injectIntl(FormCodeRepo, {
  withRef: true
}));

