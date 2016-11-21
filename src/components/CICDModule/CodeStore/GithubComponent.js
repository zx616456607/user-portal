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
import { Alert, Icon, Menu, Button, Card, Input, Tabs, Tooltip, message, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'

import { connect } from 'react-redux'
import { getGithubList, searchGithubList, addGithubRepo , registryGithub } from '../../../actions/cicd_flow'

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

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
})

class GithubComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repokey: 'github'
    }
  }
  componentWillMount() {
    const self = this
    self.props.getGithubList('github', {
      success: {
        func: (res) => {
          if (res.data.total > 0) {
            let loadingList = {}
            for (let i = 0; i < res.data.results.length; i++) {
              loadingList[i] = false
            }
            self.setState({
              loadingList
            })
          }
        }
      }
    })

  }

  addBuild(item, index) {
    const loadingList = {}
    const self = this
    loadingList[index] = true
    this.setState({
      loadingList
    })
    this.props.addGithubRepo('github', item, {
      success: {
        func: () => {
          message.success('激活成功')
        }
      },
      failed: {
        func: (res) => {
          message.error(res.message)
          loadingList[index] = false
          self.setState({
            loadingList
          })
        }
      }
    })
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
    registryGithub('github', {
      success: {
        func: (res) => {
          window.location.href = res.data.results.url
        }
      }
    })
  }
  handleSearch(e) {
    const image = e.target.value
    this.props.searchGithubList(image)
  }
  changeSearch(e) {
    const image = e.target.value
    if (image == '') {
      this.props.searchGithubList(image)
    }
  }
  render() {
    const { githubList, formatMessage } = this.props
    const scope = this
    if (!githubList) {
      return (
        <div style={{ lineHeight: '150px', paddingLeft: '250px' }}>
          <Button type="primary" size="large" onClick={() => this.handSyncCode()}>授权同步代码源</Button>
        </div>
      )
    }
    let items = githubList.map((item, index) => {
      return (
        <div className='CodeTable' key={item.name} >
          <div className="name textoverflow">{item.name}</div>
          <div className="type">{item.private ? "private" : 'public'}</div>
          <div className="action">
            {item.status == 1 ?
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
      <QueueAnim key="github-Component" type="right" className='codelink'>
          <div className="tableHead">
            <Icon type="user" /> {this.props.users}
            <Tooltip placement="top" title={formatMessage(menusText.logout)}>
              <Icon type="logout" onClick={() => this.removeRepo()} style={{ margin: '0 20px' }} />
            </Tooltip>
            <Icon type="reload" />
            <div className="right-search">
              <Input className='searchBox' size="large" style={{ width: '180px' }} onChange={(e) => this.changeSearch(e)} onPressEnter={(e) => this.handleSearch(e)} placeholder={formatMessage(menusText.search)} type='text' />
              <i className='fa fa-search'></i>
            </div>
          </div>

          {items}

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
    users
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
  addGithubRepo
})(injectIntl(GithubComponent, {
  withRef: true,
}))