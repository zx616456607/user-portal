/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PrivateCompose component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Dropdown, Modal, Spin, Table, Pagination } from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CreateCompose from './CreateCompose.js'
import './style/PrivateCompose.less'
import { loadMyStack, loadStackDetail, deleteMyStack, createStack, updateStack } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import { calcuDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'

const menusText = defineMessages({
  composeAttr: {
    id: 'AppCenter.ComposeCenter.Stack.composeAttr',
    defaultMessage: '属性',
  },
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
  editService: {
    id: 'AppCenter.ComposeCenter.Stack.editService',
    defaultMessage: '编辑编排',
  },
  deleteService: {
    id: 'AppCenter.ComposeCenter.Stack.deleteService',
    defaultMessage: '删除编排',
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

class PrivateCompose extends Component {
  constructor(props) {
    super(props);
    this.actionStack = this.actionStack.bind(this)
    this.deleteAction = this.deleteAction.bind(this)
    this.changePage = this.changePage.bind(this)
    this.state = {
      createModalShow: false,
      stackItem: '',
      delModal: false,
      stackItemName: '',
      pagination:{},
      currentPage:1,
      pageSize:10
    }
  }

  componentWillMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY, { filter:'owned' }
    );
  }

  componentWillReceiveProps(nextProps) {
    const { space } = nextProps
    if (space.namespace !== this.props.space.namespace) {
      this.props.loadMyStack(DEFAULT_REGISTRY, { filter:'owned' })
    }
  }

  detailModal(modal) {
    //this function for user open the create compose modal
    this.setState({
      createModalShow: modal
    });
    if (modal) {
      this.setState({
        stackItem: ''
      })
    }
    setTimeout(()=> {
      document.getElementById('name').focus()
    },300)

  }

  actionStack(item) {
    const list = item.key.split('&')[0]
    const { loadStackDetail, myStackList } = this.props
    if (list == 'edit') {
      const Index = parseInt(item.key.split('@')[1])
      const Id = item.key.match(/(.+&)(.+)(\?.+)/)[2]
      loadStackDetail(Id, {
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
        stackItem:myStackList.templates[Index]
      });
      return
    }
    //this function for user delete select image
    this.setState({delModal: true, stackItemName: item})
  }

  deleteAction() {
    const item = this.state.stackItemName
    const config = {
      registry: DEFAULT_REGISTRY,
      id: item.key.match(/(.+&)(.+)(\?.+)/)[2]
    }
    const stack = item.key.split("@")[1]
    let notification = new NotificationHandler()
    notification.spin(`删除编排 ${stack} 中...`)
    this.setState({delModal: false})
    this.props.deleteMyStack(config, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除编排 ${stack} 成功`)
          this.props.loadMyStack(//删除后刷新数据
            DEFAULT_REGISTRY,
            {
              from:(this.state.currentPage - 1)* this.state.pageSize,
              size:this.state.pageSize,
              filter:'owned'
            }
          );
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`删除编排 ${stack} 失败`)
        },
        isAsync: true
      }
    })
  }

  changePage(page,count){
    this.props.loadMyStack(
      DEFAULT_REGISTRY,
      {
        from:(page - 1) * count,
        size: this.state.pageSize,
        filter:'owned'
      }
    );
    this.setState({
      currentPage:page
    })

  }

  render() {
    const { formatMessage } = this.props.intl;
    const { myStackList,isFetching } = this.props;
    const { count, templates,total } = myStackList;
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
    const rootScope = this.props.scope;
    const scope = this;
    const menu = templates.map((item, index) => {
      return <Menu onClick={this.actionStack} style={{ width: '100px' }} >
        <Menu.Item key={`edit&${item.id}?@${index}`}>编辑编排</Menu.Item>
        <Menu.Item key={`delete&${item.id}?@${item.name}`}>删除编排</Menu.Item>
      </Menu>
    })
    const columns = [
      {
        title:menusText.name.defaultMessage,
        width: '20%',
        className: 'name',
        dataIndex:'name',
      },
      {
        title:menusText.author.defaultMessage,
        width: '15%',
        className: 'creator',
        dataIndex:'owner',
      },
      {
        title:menusText.composeAttr.defaultMessage,
        width: '15%',
        className: 'attr',
        dataIndex:'isPublic',
        render: (text, record, index) =><div>
          {text == 1
            ? <span key={record.id + 'unlock'} className='publicAttr'><i className='fa fa-unlock-alt'></i>&nbsp;<FormattedMessage {...menusText.publicType} /></span>
            : <span key={record.id + 'lock'} className='privateAttr'><i className='fa fa-lock'></i>&nbsp;<FormattedMessage {...menusText.privateType} /></span>
          }
        </div>
      },
      {
        title:menusText.desc.defaultMessage,
        width: '20%',
        className: 'des',
        dataIndex:'description',
      },
      {
        title:menusText.time.defaultMessage,
        width: '15%',
        className: 'createTime',
        dataIndex:'createTime',
        render: (time) => <div>{calcuDate(time)}</div>
      },
      {
        title:menusText.opera.defaultMessage,
        width: '15%',
        className: 'handle',
        dataIndex:'handle',
        render: (text, record, index) => <div><Dropdown.Button overlay={menu[index]}
         onClick={()=>browserHistory.push(`/workloads/Deployment/yamlEditor/createWorkLoad?templateid=${record.id}`)}
         type='ghost'>部署服务</Dropdown.Button></div>
      },
    ]
    return (
      <QueueAnim className='PrivateCompose'
        type='right'
      >
        <div id='PrivateCompose' key='PrivateCompose'>
          <div className='alertRow'>
            <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
            <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
            <p><FormattedMessage {...menusText.tooltipsThird} /></p>
            <p><FormattedMessage {...menusText.tooltipsForth} /></p>
          </div>
          <div className='operaBox'>
            <Button className='addBtn' size='large' type='primary' onClick={() => this.detailModal(true)}>
              <i className='fa fa-plus'></i>&nbsp;
              <FormattedMessage {...menusText.createCompose} />
            </Button>
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
          </div>
          <div className='composeListContainer'>

          <Table
            columns={columns}
            dataSource={templates}
            simple={true}
            loading={isFetching}
            pagination={false}
          >
          </Table>
          </div>
        </div>
        <Modal
          visible={this.state.createModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={() => this.detailModal(false)}
          maskClosable={false}
        >
          {
            this.state.createModalShow &&
            <CreateCompose
              type="owned"
              scope={scope}
              parentState={this.state}
              loadMyStack={this.props.loadMyStack}
              updateStack={this.props.updateStack}
              createStack={this.props.createStack}
              registry={this.props.registry}
            />
          }
           </Modal>

        <Modal
          title="删除编排操作"
          visible={this.state.delModal}
          onOk={()=> this.deleteAction()}
          onCancel={()=> this.setState({delModal: false})}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            您确定要删除编排 {this.state.stackItemName ? this.state.stackItemName.key.split('@')[1]: null} ?
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

PrivateCompose.propTypes = {
  intl: PropTypes.object.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    myStackList: [],
  }
  const { stackCenter } = state.images
  const { myStackList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages
  const { space } = state.entities.current

  return {
    myStackList: myStackList,
    isFetching,
    registry,
    space,
  }
}

export default connect(mapStateToProps, {
  loadMyStack,
  deleteMyStack,
  createStack,
  updateStack,
  loadStackDetail
})(injectIntl(PrivateCompose, {
  withRef: true,
}))
