/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PublicCompose component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Dropdown, Modal, Table, Spin, Pagination } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/PublicCompose.less"
import { loadStack, loadStackDetail } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import { calcuDate } from '../../../common/tools'
import CreateCompose from './CreateCompose'

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ComposeCenter.Stack.search',
    defaultMessage: '搜索',
  },
  delete: {
    id: 'AppCenter.ComposeCenter.Stack.delete',
    defaultMessage: '删除',
  },
  type: {
    id: 'AppCenter.ComposeCenter.Stack.type',
    defaultMessage: '类型',
  },
  name: {
    id: 'AppCenter.ComposeCenter.Stack.name',
    defaultMessage: '编排名称',
  },
  publicType: {
    id: 'AppCenter.ComposeCenter.Stack.publicType',
    defaultMessage: '公开',
  },
  privateType: {
    id: 'AppCenter.ComposeCenter.Stack.privateType',
    defaultMessage: ' 私有',
  },
  time: {
    id: 'AppCenter.ComposeCenter.Stack.time',
    defaultMessage: '创建时间',
  },
  opera: {
    id: 'AppCenter.ComposeCenter.Stack.opera',
    defaultMessage: '操作',
  },
  desc: {
    id: 'AppCenter.ComposeCenter.Stack.desc',
    defaultMessage: '描述',
  },
  author: {
    id: 'AppCenter.ComposeCenter.Stack.author',
    defaultMessage: '创建者',
  },
  deployService: {
    id: 'AppCenter.ComposeCenter.Stack.deployService',
    defaultMessage: '部署服务',
  },
  showService: {
    id: 'AppCenter.ComposeCenter.Stack.showService',
    defaultMessage: '查看服务',
  },
  createCompose: {
    id: 'AppCenter.ComposeCenter.Stack.createCompose',
    defaultMessage: '创建编排',
  },
  tooltipsFirst: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsFirst',
    defaultMessage: '平台上的编排文件支持原生 Kubernetes 的资源定义方式，并支持服务之间的编排部署自动化，从而帮助开发者和运维人员创建并管理新一代的基于容器技术的微服务架构应用。',
  },
  tooltipsSecond: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsSecond',
    defaultMessage: '[1] Pod 编排，适用于紧耦合的服务组，保证一组服务始终部署在同一节点，并可以共享网络空间和存储卷',
  },
  tooltipsThird: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsThird',
    defaultMessage: '[2] Stack 编排，设计上与 Docker Compose 相似，但可以支持跨物理节点的服务之间通过 API 进行网络通信 ',
  },
  tooltipsForth: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsForth',
    defaultMessage: '* 以上两种编排均支持用 yaml 文件描述多个容器及其之间的关系，定制各个容器的属性，并可一键部署运行',
  }
})

class PublicCompose extends Component {
  constructor(props) {
    super(props)
    this.actionStack = this.actionStack.bind(this)
    this.state = {
      stackItemContent: '',
      createModalShow: false,
      stackItem: '',
      pageSize:10,
      currentPage:1
    }
  }

  componentWillMount() {
    this.props.loadStack(DEFAULT_REGISTRY)
  }

  componentWillReceiveProps(nextProps) {
    const { space } = nextProps
    if (space.namespace !== this.props.space.namespace) {
      this.props.loadStack(DEFAULT_REGISTRY)
    }
  }
  changePage(page){
    this.props.loadStack(
      DEFAULT_REGISTRY,
      {
        from:(page - 1) * this.state.pageSize,
        size:this.state.pageSize
      }
    );
    this.setState({
      currentPage:page
    })

  }
  actionStack(itemId, itemIndex) {
    const { loadStackDetail, stackList } = this.props
    loadStackDetail(itemId, {
      success: {
        func: (res) => {
          this.setState({
            stackItemContent: res.data.data.content
          })
        }
      }
    })
    this.setState({
      createModalShow: true,
      stackItem: stackList.templates[itemIndex]
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { stackList,isFetching } = this.props
    const { count, templates, total } = stackList;
    const loadingStyle = {
      width: 50,
      height: 50,
      lineHeight: 50,
      position: 'fixed',
      top:0,
      left:0,
      right:0,
      bottom:0,
      margin:'auto',
      textAlign: 'center'
    }

    if(!templates){
      return <div className='loadingBox'  style = {loadingStyle}><Spin></Spin></div>
    }
    const menu = templates.map((item, index) => {
      return <Menu onClick={()=> browserHistory
        .push(`/workloads/Deployment/yamlEditor/createWorkLoad/?templateid=${item.id}`)}
                   style={{ width: '100px' }}>
        <Menu.Item key={`&${item.id}`}>
          <FormattedMessage {...menusText.deployService} />
        </Menu.Item>
      </Menu>
    })
    const columns = [
      {
        title: menusText.name.defaultMessage,
        dataIndex: 'name',
        width: '20%',
        className: 'name',
      },
      {
        title: menusText.author.defaultMessage,
        dataIndex: 'owner',
        width: '15%',
        className: 'type',
      },
      {
        title: menusText.desc.defaultMessage,
        dataIndex: 'description',
        width: '25%',
        className: 'image',
      },
      {
        title: menusText.time.defaultMessage,
        dataIndex: 'createTime',
        width: '15%',
        className: 'time',
        render: (createTime) => <div>{calcuDate(createTime)}</div>
      },
      {
        title: menusText.opera.defaultMessage,
        dataIndex: 'handle',
        width: '20%',
        className: 'opera',
        render: (text, record, index) => <div><Dropdown.Button onClick={()=> this.actionStack(record.id, index)} overlay={menu[index]} type='ghost'>查看编排</Dropdown.Button></div>
      },
    ]
    return (
      <QueueAnim className="PublicCompose"
        type="right"
      >
        <div id="PublicCompose" key="PublicCompose">
          <div  className='alertRow'>
            <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
            <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
            <p><FormattedMessage {...menusText.tooltipsThird} /></p>
            <p><FormattedMessage {...menusText.tooltipsForth} /></p>
          </div>
          <div className='operaBox'>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'>共 { total } 条</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  total={total}
                  pageSize={this.state.pageSize}
                  current={this.state.currentPage}
                  onChange={(page)=>{ this.changePage(page,count) }}
                  // onShowSizeChange={this.onShowSizeChange}
                  />
              </div>
            </div>}
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='PublicComposeList'>
            <Table
              columns={columns}
              dataSource={templates}
              loading={isFetching}
              pagination={false}
            ></Table>
          </div>
        </div>
        <Modal
          visible={this.state.createModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={() => this.detailModal(false)}
          maskClosable={false}
        >
          <CreateCompose type='public' scope={this} parentState={this.state} loadMyStack={this.props.loadMyStack} readOnly={true} registry={this.props.registry} />
        </Modal>
      </QueueAnim>
    )
  }
}

PublicCompose.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStack: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    stackList: [],
  }
  const { stackCenter } = state.images
  const { stackList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages
  const { space } = state.entities.current

  return {
    stackList: stackList,
    isFetching,
    registry,
    space,
  }
}

export default connect(mapStateToProps, {
  loadStack,
  loadStackDetail
})(injectIntl(PublicCompose, {
  withRef: true,
}))
