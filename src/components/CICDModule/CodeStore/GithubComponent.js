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
import { getGithubList, searchGithubList, addGithubRepo, notGithubProject, registryGithub, syncRepoList } from '../../../actions/cicd_flow'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
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
    let notification = new NotificationHandler()
    item.repoUser = repoUser
    this.props.scope.props.addGithubRepo(item, {
      success: {
        func: () => {
          notification.success('激活成功')
          loadingList[index] = false
          self.setState({
            loadingList
          })
        }
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
    let notification = new NotificationHandler()
    parentScope.props.notGithubProject(users, id, {
      success: {
        func: () => {
          notification.success('解除激活成功')
        }
      },
      failed: {
        func: (res) => {
          if (res.statusCode == 400) {
            notification.error('该项目正在被TenxFlow引用，请解除引用后重试')
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
    if (data) {
      items = data.map((item, index) => {
        return (
          <div className='CodeTable' key={item.name} >
            <div className="name textoverflow">{item.name}</div>
            <div className="type">{item.private ? "private" : 'public'}</div>
            <div className="action">
              {(item.managedProject && item.managedProject.active == 1) ?
                <span><Button type="ghost" disabled>已激活</Button>
                  <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>解除</a></span>
                :
                <Tooltip placement="right" title="可构建项目">
                  <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index, repoUser)} >激活</Button>
                </Tooltip>
              }
            </div>

          </div>
        );
      });
    }
    return (
      <QueueAnim type="right" key="detail-list">
        {items}
      </QueueAnim>
    )
  }
}

class GithubComponent extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this)
    this.searchClick = this.searchClick.bind(this)
    this.state = {
      repokey: 'github',
      currentSearch: ''
    }
  }

  loadData() {
    const self = this
    this.props.getGithubList('github', {
      success: {
        func: (res) => {
          if (res.data.hasOwnProperty('results')) {
            const users = res.data.results[Object.keys(res.data.results)[0]].user
            self.setState({ users })
          }
        }
      }
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.loadData()
      return
    }
  }

  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    Modal.confirm({
      title: '注销代码源',
      content: '您是否确认要注销这项代码源',
      onOk() {
        scope.props.deleteRepo(repoItem)
      },
      onCancel() { },
    });
  }

  handSyncCode() {
    const { registryGithub } = this.props
    let notification = new NotificationHandler()
    notification.spin(`正在执行中...`)
    registryGithub('github', {
      success: {
        func: (res) => {
          notification.close()
          window.location.href = res.data.results.url
        }
      }
    })
  }
  handleSearch(e) {
    const image = e.target.value
    const users = this.state.users
    this.setState({
      currentSearch: image
    })
    this.props.searchGithubList(users, image)
  }
  changeSearch(e) {
    const image = e.target.value
    const users = this.state.users
    this.setState({
      currentSearch: image
    })
    if (image == '') {
      this.props.searchGithubList(users, image)
    }
  }
  searchClick() {
    const image = this.state.currentSearch
    const users = this.state.users
    this.props.searchGithubList(users, image)
  }
  syncRepoList() {
    const types = this.state.repokey
    this.props.syncRepoList(types)
  }
  changeList(e) {
    this.setState({
      users: e
    })
  }
  render() {
    const { githubList, formatMessage, isFetching} = this.props
    const scope = this
    let codeList = []
    if (!githubList) {
      return (
        <div style={{ lineHeight: '150px', paddingLeft: '40%', paddingBottom: '16px' }}>
          <Button type="primary" size="large" onClick={() => this.handSyncCode()}>授权、同步 GitHub 代码源</Button>
        </div>
      )
    }
    if (Object.keys(githubList).length > 0) {
      for (let i in githubList) {
        codeList.push(
          <TabPane tab={<span><Icon type="user" />{i}</span>} key={i}>
            <CodeList scope={scope} isFetching={isFetching} repoUser={i} data={githubList[i]} />
          </TabPane>
        )
      }

    }
    {/* let items = githubList.map((item, index) => {
      return (
        <div className='CodeTable' key={item.name} >
          <div className="name textoverflow">{item.name}</div>
          <div className="type">{item.private ? "private" : 'public'}</div>
          <div className="action">
            {(item.managedProject && item.managedProject.active == 1) ?
              <span><Button type="ghost" disabled>已激活</Button>
                <a onClick={() => this.notActive(item.managedProject.id, index)} style={{ marginLeft: '15px' }}>解除</a></span>
              :
              <Tooltip placement="right" title="可构建项目">
                <Button type="ghost" loading={scope.state.loadingList ? scope.state.loadingList[index] : false} onClick={() => this.addBuild(item, index)} >激活</Button>
              </Tooltip>
            }
          </div>

        </div>
      );
    });
    */}
    return (
      <QueueAnim key="github-Component" type="right" className='codelink'>
        <div className="tableHead">
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={() => this.removeRepo()} style={{ margin: '0 20px' }} />
          </Tooltip>
          <Icon type="reload" onClick={() => this.syncRepoList()} />
          <div className="right-search">
            <Input className='searchBox' size="large" style={{ width: '180px' }} onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search' onClick={this.searchClick}></i>
          </div>
        </div>

        <Tabs onChange={(e) => this.changeList(e)}>
          {codeList}
        </Tabs>

      </QueueAnim>
    );
  }
}


function mapStateToProps(state, props) {
  const defaultValue = {
    githubList: [],
    isFetching: false
  }
  const { githubRepo} = state.cicd_flow
  const { githubList, isFetching, users} = githubRepo || defaultValue
  return {
    githubList,
    isFetching,
    users,
    currentSpace: state.entities.current.space.namespace
  }
}

GithubComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  registryGithub: PropTypes.func.isRequired,
  getGithubList: PropTypes.func.isRequired,
  searchGithubList: PropTypes.func.isRequired,
  addGithubRepo: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  registryGithub,
  getGithubList,
  searchGithubList,
  addGithubRepo,
  notGithubProject,
  syncRepoList
})(injectIntl(GithubComponent, {
  withRef: true,
}))