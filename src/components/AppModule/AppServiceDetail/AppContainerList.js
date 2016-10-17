/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppDetail component
 *
 * v0.1 - 2016-09-13
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Button, Card, Menu, Spin, Tooltip } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/AppContainerList.less'
import { loadServiceContainerList } from '../../../actions/services'

const testData = []

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
  onchange: function (e) {
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
  modalShow: function (instanceId) {
    //close model function
    const {scope} = this.props;
    scope.setState({
      modalShow: true,
      currentShowInstance: instanceId
    });
  },
  render: function () {
    const {config, loading} = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <span>无容器实例</span>
      )
    }
    const items = config.map((item) => {
      return (
        <div className="containerDetail" key={item.metadata.name}>
          {/*(<div className="selectIconTitle commonData">
        <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
      </div>)*/}
          <div className="name commonData" style={{ marginLeft: 24 }} >
            <Tooltip placement="topLeft" title={item.metadata.name} >
              <span className="viewBtn" onClick={this.modalShow.bind(this, item)}>
                {item.metadata.name}
              </span>
            </Tooltip>
          </div>
          <div className="status commonData">
            <i className={item.status.phase == 'Running' ? "normal fa fa-circle" : "error fa fa-circle"}></i>
            &nbsp;{item.status.phase}
          </div>
          <div className="image commonData">
            <Tooltip placement="topLeft" title={item.images.join(', ') ? item.images.join(', ') : ""} >
              <span>{item.images.join(', ') || '-'}</span>
            </Tooltip>
          </div>
          <div className="address commonData">
            <span>内&nbsp;:&nbsp;{item.status.podIP}</span>
            <span>外&nbsp;:&nbsp;{item.address || '-'}</span>
          </div>
          <div className="createTime commonData">
            {item.metadata.creationTimestamp}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="containerList">
        {items}
      </div>
    );
  }
});

function loadData(props) {
  const { cluster, serviceName, loadServiceContainerList } = props
  loadServiceContainerList(cluster, serviceName)
}

class AppContainerList extends Component {
  constructor(props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList: []
    }
  }

  allSelectedChecked() {
    if (this.state.selectedList.length == testData.length) {
      return true;
    } else {
      return false;
    }
  }

  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (serviceDetailmodalShow) {
      loadData(nextProps)
    }
  }

  onchange() {
    //select title checkbox
    let newList = new Array();
    if (this.state.selectedList.length == testData.length) {
      //had select all item,turn the selectedlist to null
      newList = [];
    } else {
      //select some item or nothing,turn the selectedlist to selecet all item
      for (let elem of testData) {
        newList.push(elem.id);
      }
    }
    this.setState({
      selectedList: newList
    });
  }

  render() {
    const parentScope = this;
    const { containerList, isFetching } = this.props
    return (
      <div id="AppContainerList">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          {/*(<div className="operaBox">
          <div className="leftBox">
            <Button type="primary" size="large">
              <i className="fa fa-play"></i>
              启动
            </Button>
            <Button size="large">
              <i className="fa fa-stop"></i>
              停止
            </Button>
            <Button size="large">
              <i className="fa fa-trash"></i>
              删除
            </Button>
          </div>
          <div className="rightBox">
            <span>共&nbsp;{testData.length} 容器</span>
            <span>已选中的容器({this.state.selectedList.length}个)</span>
          </div>
          <div style={{ clear:"both" }}></div>
        </div>)*/}
          <Card className="dataBox">
            <div className="titleBox">
              {/*(<div className="selectIconTitle commonData">
            <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
          </div>)*/}
              <div className="name commonData" style={{ marginLeft: 24 }} >
                名称
          </div>
              <div className="status commonData">
                运行状态
          </div>
              <div className="image commonData">
                镜像
          </div>
              <div className="address commonData">
                地址
          </div>
              <div className="createTime commonData">
                创建时间
          </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={parentScope} config={containerList} loading={isFetching} />
          </Card>
        </QueueAnim>
      </div>
    )
  }
}

AppContainerList.propTypes = {
  cluster: PropTypes.string.required,
  serviceName: PropTypes.string.required,
  loadServiceContainerList: PropTypes.func.isRequired,
  containerList: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
  const { cluster, serviceName } = props
  const defaultServices = {
    isFetching: false,
    cluster,
    serviceName,
    containerList: []
  }
  const {
    serviceContainers
  } = state.services
  let targetContainers
  if (serviceContainers[cluster] && serviceContainers[cluster][serviceName]) {
    targetContainers = serviceContainers[cluster][serviceName]
  }
  const { containerList, isFetching } = targetContainers || defaultServices
  return {
    cluster,
    serviceName,
    containerList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceContainerList
})(AppContainerList)