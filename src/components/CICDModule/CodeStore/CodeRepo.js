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
import { Alert, Icon, Menu, Button, Card, Input, Tabs, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CodeRepo.less'
import { getRepoList, addCodeRepo, notActiveProject, deleteRepo, registryRepo, syncRepoList, searchCodeRepo, getUserInfo } from '../../../actions/cicd_flow'
import GithubComponent from './GithubComponent'
import SvnComponent from './SvnComponent'
import NotificationHandler from '../../../common/notification_handler'

const TabPane = Tabs.TabPane

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
    defaultMessage: '创建代码仓库',
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
        }
      }
    })
  },
  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    const { formatMessage } = this.props
    Modal.confirm({
      title: formatMessage(menusText.CancellationCode),
      content: formatMessage(menusText.sureCancellationCode),
      onOk() {
        scope.props.deleteRepo(repoItem)
      },
      onCancel() { },
    });
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
          notification.error(`代码仓库添加失败`, '仓库地址或者私有Token有误！')
          self.setState({ loading: false })
        }
      }
    })
  },
  syncRepoList() {
    const types = this.props.scope.state.repokey
    this.props.scope.props.syncRepoList(types)
  },
  handleSearch(e) {
    const parentScope = this.props.scope
    const codeName = e.target.value
    parentScope.props.searchCodeRepo(codeName)
  },
  changeSearch(e) {
    const codeName = e.target.value
    if (codeName == '') {
      const parentScope = this.props.scope
      parentScope.props.searchCodeRepo(codeName)
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
    parentScope.props.notActiveProject(id, {
      success: {
        func: () => {
          notification.success(formatMessage(menusText.UndoSuccessful))
        }
      }
    })
  },
  changeUrl(e) {
    this.setState({ regUrl: e.target.value })
  },
  changeToken(e) {
    this.setState({ regToken: e.target.value })
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
        <div style={{ lineHeight: '150px', paddingLeft: '250px' }}>
          <Button type="primary" size="large" onClick={() => { this.setState({ authorizeModal: true }) } }>添加 Gitlab 代码仓库</Button>
          <Modal title="添加 Gitlab 代码仓库" visible={this.state.authorizeModal}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={() => { this.setState({ authorizeModal: false }) } }>取消</Button>,
              <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.registryRepo()}>确定</Button>,
            ]}
            >
            <div style={{ padding: "0 20px" }}>
              <p style={{ lineHeight: '30px' }}>仓库地址：
                <Input placeholder="http://*** | https://***" onChange={this.changeUrl} value={this.state.regUrl} size="large" />
              </p>
              <p style={{ lineHeight: '30px' }}>Private Token:
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
          <div className="type">{item.type == false ? "public" : "private"}</div>
          <div className="action">
            {(item.managedProject && item.managedProject.active == 1) ?
              <span><Button type="ghost" disabled>已激活</Button>
                <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>撤销</a></span>
              :
              <Tooltip placement="right" title="可构建项目">
                <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index)} >激活</Button>
              </Tooltip>
            }
          </div>

        </div>
      );
    });
    return (
      <div className='codelink'>
        <div className="tableHead">
          <Icon type="user" /> {this.props.repoUser ? this.props.repoUser.username : ''}
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.removeRepo()} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Tooltip placement="top" title={formatMessage(menusText.syncCode)}>
            <Icon type="reload" onClick={this.syncRepoList} />
          </Tooltip>
          <div className="right-search">
            <Input className='searchBox' size="large" onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} style={{ width: '180px' }} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'>  </i>
          </div>
        </div>
        {/*  @project  Head end    */}

        {items}

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
        repokey: type
      }
    }
  }

  componentWillMount() {
    document.title = '关联代码库 | 时速云';
    const {getRepoList } = this.props
    const self = this
    getRepoList('gitlab', {
      success: {
        func: (res) => {
          if (res.data.total > 0) {
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

  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const gitlabBud = (
      <span className="section">
        <i className="icon gitlab"></i>
        gitlab
      </span>
    )
    const githubBud = (
      <span className="section">
        <i className="icon github"></i>
        github
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
    return (
      <QueueAnim id='codeRepo'
        type='right'
        >
        <div className="codeContent">
          <div className='headBox'>
            <Link to="/ci_cd">
              <i className='fa fa-arrow-left' />&nbsp;
              <FormattedMessage {...menusText.back} />
            </Link>
            <p className="topText"><FormattedMessage {...menusText.creageCodeStore} /></p>
          </div>
          <div>
            <div className="card-container">
              <p style={{ paddingLeft: '36px', lineHeight: '40px' }}>选择代码源</p>
              <Tabs type="card" onChange={(e) => { this.setState({ repokey: e }) } } activeKey={this.state.repokey}>
                <TabPane tab={gitlabBud} key="gitlab"><MyComponent formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} repoUser={this.props.repoUser} config={this.props.repoList} /></TabPane>
                <TabPane tab={githubBud} key="github"><GithubComponent formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} /></TabPane>
                <TabPane tab={svnBud} key="svn"><SvnComponent formatMessage={formatMessage} isFetching={this.props.isFetching} scope={scope} /></TabPane>

              </Tabs>
            </div>
          </div>

        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultValue = {
    repoList: [],
    isFetching: false
  }
  const { codeRepo, userInfo} = state.cicd_flow
  const defaultUser = {
    username: '',
    depot: ''
  }
  const { repoList, isFetching } = codeRepo || defaultValue
  const { repoUser } = userInfo || defaultUser
  return {
    repoList,
    isFetching,
    repoUser
  }
}

CodeRepo.propTypes = {
  intl: PropTypes.object.isRequired,
  getRepoList: PropTypes.func.isRequired,
  addCodeRepo: PropTypes.func.isRequired,
  deleteRepo: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  getRepoList,
  addCodeRepo,
  deleteRepo,
  registryRepo,
  syncRepoList,
  searchCodeRepo,
  getUserInfo,
  notActiveProject
})(injectIntl(CodeRepo, {
  withRef: true,
}));

