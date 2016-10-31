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
import { Alert, Menu, Button, Card, Input, Dropdown, Modal ,message, Spin} from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CreateCompose from './CreateCompose.js'
import './style/PrivateCompose.less'
import { loadMyStack , deleteMyStack , createStack} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'


const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group
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
    defaultMessage: '时间',
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
    defaultMessage: '编辑服务',
  },
  deleteService: {
    id: 'AppCenter.ComposeCenter.Stack.deleteService',
    defaultMessage: '删除服务',
  },
  createCompose: {
    id: 'AppCenter.ComposeCenter.Stack.createCompose',
    defaultMessage: '创建编排',
  },
  tooltipsFirst: {
    id: 'AppCenter.ComposeCenter.Stack.tooltipsFirst',
    defaultMessage: '目前时速云支持两种类型的服务编排服务：',
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


const MyList = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  menuClick: function (key) {
    //this function for user delete select image
    const scope = this
    const config ={registry: DEFAULT_REGISTRY, id: key.id}
    Modal.confirm({
      title: `删除编排 `,
      content: <h3>{`您确定要删除编排 ${key.name}`}</h3>,
      onOk() {
        scope.props.deleteMyStack(config, {
          success: {
            func: ()=>{
              message.success('删除成功')
              // scope.props.loadMyStack(DEFAULT_REGISTRY)
            },
            isAsync: true
          }
        })
      },
      onCancel() { },
    })

  },
  showImageDetail: function (id) {
    //this function for user select image and show the image detail info
    const scope = this.props.scope;
    scope.setState({
      imageDetailModalShow: true,
      imageDetailModalShowId: id
    });
  },
  render: function () {
    const config = this.props.config;
    const isFetching = this.props.isFetching
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0) {
      return (
        <div className="notData">您还没有编排，去创建一个吧！</div>
      )
    }
    let items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.menuClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key={`id1=${item.id}`}>
            <FormattedMessage {...menusText.editService} />
          </Menu.Item>
          <Menu.Item key={`id2=${item.id}`}>
            <FormattedMessage {...menusText.deleteService} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='composeDetail' key={item.id} >
          <div className='name textoverflow'>
            <span className='maxSpan'>{item.name}</span>
          </div>
          <div className='attr'>{item.owner}</div>
          <div className='type'>
            {item.isPublic == 1 ? 
              <span key={item.id + 'unlock'} className='publicAttr'><i className='fa fa-unlock-alt'></i>&nbsp;<FormattedMessage {...menusText.publicType} /></span>
              :
              <span key={item.id + 'lock'} className='privateAttr'><i className='fa fa-lock'></i>&nbsp;<FormattedMessage {...menusText.privateType} /></span>
            }
          </div>
         
          <div className='image textoverflow'>
            <span className='maxSpan'>{item.description}</span>
          </div>
          <div className='time textoverflow'>
            <span>{item.createTime}</span>
          </div>
          <div className='opera'>
            <Dropdown.Button overlay={dropdown} type='ghost'>
              <FormattedMessage {...menusText.deployService} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='composeList'>
        {items}
      </div>
    );
  }
});

class PrivateCompose extends Component {
  constructor(props) {
    super(props);
    this.openCreateModal = this.openCreateModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      createModalShow: false
    }
  }
  componentWillMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY);
  }
  filterAttr(e) {
    //this function for user filter different attr
  }

  filterType(e) {
    //this function for user filter different type
  }
  
  openCreateModal(){
    //this function for user open the create compose modal
    this.setState({
      createModalShow: true
    });
  }
  
  closeImageDetailModal(){
   //this function for user close create compose modal
   this.setState({
    createModalShow: false
   });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const rootScope = this.props.scope;
    const scope = this;
    const attrDropdown = (
      <Menu onClick={this.filterAttr.bind(this)}
        style={{ width: '100px' }}
        >
        <Menu.Item key='1'>
          <FormattedMessage {...menusText.publicType} />
        </Menu.Item>
        <Menu.Item key='2'>
          <FormattedMessage {...menusText.privateType} />
        </Menu.Item>
      </Menu>
    );
    return (
      <QueueAnim className='PrivateCompose'
        type='right'
        >
        <div id='PrivateCompose' key='PrivateCompose'>
          <Alert type='info' message={
            <div>
              <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
              <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
              <p><FormattedMessage {...menusText.tooltipsThird} /></p>
              <p><FormattedMessage {...menusText.tooltipsForth} /></p>
            </div>
          } />
          <Card className='PrivateComposeCard'>
            <div className='operaBox'>
              <Button className='addBtn' size='large' type='primary' onClick={this.openCreateModal}>
                <i className='fa fa-plus'></i>&nbsp;
                <FormattedMessage {...menusText.createCompose} />
              </Button>
              <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' />
              <i className='fa fa-search'></i>
            </div>
            <div className='titleBox'>
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='attr'>
                <Dropdown overlay={attrDropdown} trigger={['click']} getPopupContainer={() => document.getElementById('PrivateCompose')}>
                  <div>
                    <FormattedMessage {...menusText.author} />&nbsp;
                    <i className='fa fa-filter'></i>
                  </div>
                </Dropdown>
              </div>
              <div className="type">
                <span><FormattedMessage {...menusText.composeAttr} /></span>
              </div>
              <div className='image'>
                <FormattedMessage {...menusText.desc} />
              </div>
              <div className='time'>
                <FormattedMessage {...menusText.time} />
              </div>
              <div className='opera'>
                <FormattedMessage {...menusText.opera} />
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <MyList scope={rootScope} isFetching={this.props.isFetching} loadMyStack={this.props.loadMyStack} deleteMyStack={this.props.deleteMyStack} config={this.props.myStackList} />
          </Card>
        </div>
        <Modal
          visible={this.state.createModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeImageDetailModal}
        >
          <CreateCompose scope={scope} loadMyStack={this.props.loadMyStack} createStack= {this.props.createStack} registry={this.props.registry} />
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

  return {
    myStackList,
    isFetching,
    registry,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadMyStack: (DEFAULT_REGISTRY) => {
      dispatch(loadMyStack(DEFAULT_REGISTRY))
    },
    deleteMyStack: (id, callback) => {
      dispatch(deleteMyStack(id, callback))
    },
    createStack: (obj, callback) => {
      dispatch(createStack(obj, callback))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PrivateCompose, {
  withRef: true,
}))