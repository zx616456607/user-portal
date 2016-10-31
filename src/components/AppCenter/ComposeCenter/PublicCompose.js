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
import { Alert, Menu, Button, Card, Input, Dropdown, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/PublicCompose.less"
import { loadStack } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

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


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  menuClick: function (id) {
    //this function for user delete select image

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
    const config = this.props.config
    if (config.length == 0) {
      return(
        <div className="notData">您还没有编排，去创建一个吧！</div>
      )
    }
    let items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.menuClick.bind(this, item)}
          style={{ width: "100px" }}
          >
          <Menu.Item key="1">
            <FormattedMessage {...menusText.editService} />
          </Menu.Item>
          <Menu.Item key="2">
            <FormattedMessage {...menusText.deleteService} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="composeDetail" key={item.id} >
          <div className="name textoverflow">
            <span className="maxSpan">{item.name}</span>
          </div>
          <div className="type">
            {/* <span>{(item.type ==1) ? <FormattedMessage {...menusText.publicType} /> : <FormattedMessage {...menusText.privateType} />}</span> */}
            {item.owner}
          </div>
          <div className="image textoverflow">
            <span className="maxSpan">{item.description}</span>
          </div>
          <div className="time textoverflow">
            {item.createTime}
          </div>
          <div className="opera">
            <Dropdown.Button overlay={dropdown} type="ghost">
              <FormattedMessage {...menusText.deployService} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className="composeList">
        {items}
      </div>
    );
  }
});

class PublicCompose extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  componentWillMount() {
    this.props.loadStack(DEFAULT_REGISTRY);
  }
  filterAttr(e) {
    //this function for user filter different attr
  }

  filterType(e) {
    //this function for user filter different type
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this.props.scope;
    const typeDropdown = (
      <Menu onClick={this.filterType.bind(this)}
        style={{ width: "100px" }}
        >
        <Menu.Item key="1">
          酱油
       </Menu.Item>
        <Menu.Item key="2">
          又一瓶酱油
       </Menu.Item>
      </Menu>
    );
    return (
      <QueueAnim className="PublicCompose"
        type="right"
        >
        <div id="PublicCompose" key="PublicCompose">
          <Alert type="info" message={
            <div>
              <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
              <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
              <p><FormattedMessage {...menusText.tooltipsThird} /></p>
              <p><FormattedMessage {...menusText.tooltipsForth} /></p>
            </div>
          } />
          <Card className="PublicComposeCard">
            <div className="operaBox">
              <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" />
              <i className="fa fa-search"></i>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="titleBox">
              <div className="name">
                <FormattedMessage {...menusText.name} />
              </div>
              <div className="type">
                <Dropdown overlay={typeDropdown} trigger={['click']} getPopupContainer={() => document.getElementById("PublicCompose")}>
                  <div>
                    <FormattedMessage {...menusText.author} />&nbsp; <i className="fa fa-filter"></i>
                  </div>
                </Dropdown>
              </div>
              <div className="image">
                <FormattedMessage {...menusText.desc} />
              </div>
              <div className="time">
                <FormattedMessage {...menusText.time} />
              </div>
              <div className="opera">
                <FormattedMessage {...menusText.opera} />
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={scope} config={this.props.stackList} />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

PublicCompose.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    stackList: [],

  }
  const { stackCenter } = state.images
  const { stackList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages

  return {
    stackList,
    isFetching,
    registry,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadStack: (DEFAULT_REGISTRY) => {
      dispatch(loadStack(DEFAULT_REGISTRY))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PublicCompose, {
  withRef: true,
}))