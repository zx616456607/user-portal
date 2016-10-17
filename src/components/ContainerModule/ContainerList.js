/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerList component
 *
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tooltip, Checkbox, Card, Menu, Dropdown, Button, Input, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerList.less'
import { loadContainerList } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'
import { tenxDateFormat } from '../../common/tools.js'

function loadData(props) {
  const { cluster } = props
  props.loadContainerList(cluster)
}

const ButtonGroup = Button.Group

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  checkedFunc: function (e) {
    //check this item selected or not
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      return true;
    } else {
      return false;
    }
  },
  onchange: function (e, event) {
    event.stopPropagation();
    //single item selected function
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList
    });
  },
  containerOperaClick: function (item, e) {
    //this function for user click opera menu
  },
  selectContainerDetail: function (e) {
    //this function for user click app detail ,and then this app will be selected
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList
    });
  },
  render: function () {
    const { config, loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className="loadingBox">
          暂无数据
        </div>
      )
    }
    var items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.containerOperaClick.bind(this, item)}
          style={{ width: "100px" }}
          >
          <Menu.Item key="1">
            停止容器
          </Menu.Item>
          <Menu.Item key="2">
            删除
          </Menu.Item>
          <Menu.Item key="3">
            查看架构图
          </Menu.Item>
          <Menu.Item key="4">
            查看编排
          </Menu.Item>
        </Menu>
      );
      return (
        <div className={this.checkedFunc(item.metadata.name) ? "selectedContainer containerDetail" : "containerDetail"}
          key={item.metadata.name}
          onClick={this.selectContainerDetail.bind(this, item.metadata.name)}
          >
          <div className="selectIconTitle commonData">
            <Checkbox checked={this.checkedFunc(item.metadata.name)} onChange={() => this.onchange(item.metadata.name)}></Checkbox>
          </div>
          <div className="containerName commonData">
            <Tooltip placement="topLeft" title={item.metadata.name}>
              <Link to={`/app_manage/container/${item.metadata.name}`} >
                {item.metadata.name}
              </Link>
            </Tooltip>
          </div>
          <div className="containerStatus commonData">
            <i className={item.status.phase == 'Running' ? "normal fa fa-circle" : "error fa fa-circle"}></i>
            <span className={item.status.phase == 'Running' ? "normal" : "error"} >{item.status.phase}</span>
          </div>
          <div className="serviceName commonData">
            <Tooltip placement="topLeft" title={item.metadata.labels.appName ? item.metadata.labels.appName : ""}>
              <span>{item.metadata.labels.appName || '-'}</span>
            </Tooltip>
          </div>
          <div className="imageName commonData">
            <Tooltip placement="topLeft" title={item.images.join(', ')}>
              <span>{item.images.join(', ')}</span>
            </Tooltip>
          </div>
          <div className="visitIp commonData">
            <Tooltip placement="topLeft" title={item.status.podIP}>
              <span>{item.status.podIP}</span>
            </Tooltip>
            <br />
            <Tooltip placement="topLeft" title={item.serviceIPOutput || '-'}>
              <span>{item.serviceIPOutput || '-'}</span>
            </Tooltip>
          </div>
          <div className="createTime commonData">
            <Tooltip placement="topLeft" title={tenxDateFormat(item.metadata.creationTimestamp)}>
              <span>{tenxDateFormat(item.metadata.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className="actionBox commonData">
            <Dropdown.Button overlay={dropdown} type="ghost">
              <svg className="terminal">
                <use xlinkHref="#terminal" />
              </svg>
              <span style={{ marginLeft: "20px" }}>终端</span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: "both", width: "0" }}></div>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
      </div>
    );
  }
})

class ContainerList extends Component {
  constructor(props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList: []
    }
  }

  componentWillMount() {
    document.title = '容器列表 | 时速云'
    loadData(this.props)
  }

  allSelectedChecked() {
    const { containerList } = this.props
    if (this.state.selectedList.length == containerList.length && containerList.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  onchange() {
    //select title checkbox
    let newList = new Array()
    const { containerList } = this.props
    if (this.state.selectedList.length == containerList.length) {
      //had select all item,turn the selectedlist to null
      newList = [];
    } else {
      //select some item or nothing,turn the selectedlist to selecet all item
      for (let elem of containerList) {
        newList.push(elem.metadata.name);
      }
    }
    this.setState({
      selectedList: newList
    });
  }

  render() {
    const parentScope = this
    const { cluster, containerList, isFetching } = this.props
    return (
      <QueueAnim
        className="ContainerList"
        type="right"
        >
        <div id="ContainerList" key="ContainerList">
          <div className="operationBox">
            {/*<div className="leftBox">
              <Button type="primary" size="large"><i className="fa fa-power-off"></i>重启容器</Button>
              <Button type="ghost" size="large"><i className="fa fa-stop"></i>停止容器</Button>
              <Button type="ghost" size="large"><i className="fa fa-trash-o"></i>删除容器</Button>
            </div>*/}
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search"></i>
              </div>
              <div className="littleRight">
                <Input placeholder="输入容器名搜索" />
              </div>
            </div>
            <div className="clearDiv"></div>
          </div>
          <Card className="containerBox">
            <div className="containerTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox checked={this.allSelectedChecked()} onChange={() => this.onchange()}></Checkbox>
              </div>
              <div className="containerName commonTitle">
                容器名称
            </div>
              <div className="containerStatus commonTitle">
                状态
            </div>
              <div className="serviceName commonTitle">
                所属应用
            </div>
              <div className="imageName commonTitle">
                镜像
            </div>
              <div className="visitIp commonTitle">
                访问地址
            </div>
              <div className="createTime commonTitle">
                创建时间
              <i className="fa fa-sort"></i>
              </div>
              <div className="actionBox commonTitle">
                操作
            </div>
            </div>
            <MyComponent config={containerList} loading={isFetching} scope={parentScope} />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

ContainerList.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultContainers = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    containerList: []
  }
  const {
    containerItems
  } = state.containers
  const { cluster, containerList, isFetching } = containerItems[DEFAULT_CLUSTER] || defaultContainers

  return {
    cluster,
    containerList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerList
})(ContainerList)