/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceList component
 *
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Checkbox, Button, Card, Menu } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import AppAddServiceModal from './AppAddServiceModal'
import AppDeployServiceModal from './AppDeployServiceModal'
import "./style/ServiceList.less"

class MyComponent extends Component {
  constructor(props) {
    super(props)
    this.deleteService = this.deleteService.bind(this)
    this.checkService = this.checkService.bind(this)
    this.state = {
      serviceModalShow: false
    }
  }
  checkedFunc(e) {
    //check this item selected or not
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    let checked = false
    if (oldList.includes(e)) {
      checked = !checked
    }
    return checked
  }
  onchange(e) {
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
  }
  modalShow(instanceId) {
    //close model function
    const {scope} = this.props;
    scope.setState({
      modalShow: true,
      currentShowInstance: instanceId
    });
  }
  deleteService(name) {
    const oldList = this.props.scope.state.servicesList
    const newList = oldList.filter((item) => item.name !== name)
    const oldSeleList = this.props.scope.state.selectedList
    const newSeleList = oldSeleList.filter((item) => item !== name)
    this.props.scope.setState({
      servicesList: newList,
      selectedList: newSeleList
    })
    localStorage.setItem('servicesList', JSON.stringify(newList))
    localStorage.setItem('selectedList', JSON.stringify(newSeleList))
  }
  checkService(name, inf) {
    console.log(name);
    this.props.scope.setState({
      serviceModalShow: true,
      checkInf: inf,
      checkState: '修改'
    })
    console.log('inf', inf);
  }
  render() {
    var config = this.props.scope.state.servicesList;
    var items = config.map((item) => {
      return (
        <div key={item.id} className={this.checkedFunc(item.id) ? "selectedService serviceDetail" : "serviceDetail"}>
          <div className="selectIconTitle commonData">
            <Checkbox checked={this.checkedFunc(item.id)} onChange={() => this.onchange(item.id)} />
          </div>
          <div className="name commonData">
            <span className="viewSpan" onClick={this.modalShow.bind(this, item)}>
              {item.name}
            </span>
          </div>
          <div className="image commonData">
            {item.imageName}
          </div>
          <div className="resource commonData">
            {item.resource}
          </div>
          <div className="opera commonData">
            <Button className="viewBtn" type="ghost" size="large" onClick={() => this.checkService(item.name, item.inf)}>
              <i className="fa fa-eye" />&nbsp;
              查看
            </Button>
            <Button type="ghost" size="large" onClick={() => this.deleteService(item.name)}>
              <i className="fa fa-trash" />&nbsp;
              删除
            </Button>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="serviceList">
        {items}
      </div>
    );
  }
}

export default class ServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.subServicesList = this.subServicesList.bind(this);
    this.delServicesList = this.delServicesList.bind(this);
    this.state = {
      modalShow: false,
      selectedList: [],
      servicesList: [],
      serviceModalShow: false,
      currentSelectedImage: null,
      registryServer: null,
      checkState: '创建',
      checkInf: null,
    }
  }

  closeModal() {
    this.setState({
      modalShow: false
    });
  }

  openModal() {
    this.setState({
      modalShow: true
    });
  }

  allSelectedChecked() {
    if ((this.state.selectedList.length == this.state.servicesList.length) && (this.state.servicesList.length !== 0)) {
      return true;
    } else {
      return false;
    }
  }

  onchange() {
    //select title checkbox
    let newList = new Array();
    if (this.state.selectedList.length == this.state.servicesList.length) {
      newList = [];
    } else {
      for (let elem of this.state.servicesList) {
        newList.push(elem.id);
      }
    }
    this.setState({
      selectedList: newList
    });
  }
  subServicesList() {
    localStorage.setItem('servicesList', JSON.stringify(this.state.servicesList))
    localStorage.setItem('selectedList', JSON.stringify(this.state.selectedList))
  }
  delServicesList() {
    localStorage.removeItem('servicesList');
    localStorage.removeItem('selectedList');
  }
  componentWillMount() {
    const serviceList = JSON.parse(localStorage.getItem('servicesList'))
    if (serviceList) {
      this.setState({
        servicesList: serviceList
      })
    }
    const selectedList = JSON.parse(localStorage.getItem('selectedList'))
    if (selectedList) {
      this.setState({
        selectedList: selectedList
      })
    }
  }

  render() {
    const parentScope = this
    const { servicesList, isFetching} = this.props
    return (
      <QueueAnim id="ServiceList"
        type="right"
        >
        <div className="ServiceList" key="ServiceList">
          <div className="operaBox">
            <Button type="primary" size="large" onClick={this.openModal}>
              <i className="fa fa-plus" />&nbsp;
               添加服务
            </Button>
            <Button size="large" type="ghost">
              <i className="fa fa-trash" />&nbsp;
              删除
            </Button>
          </div>
          <div className="dataBox">
            <div className="titleBox">
              <div className="selectIconTitle commonData">
                <Checkbox checked={this.allSelectedChecked()} onChange={() => this.onchange()} />
              </div>
              <div className="name commonData">
                服务名称
              </div>
              <div className="image commonData">
                镜像
              </div>
              <div className="resource commonData">
                计算资源
              </div>
              <div className="opera commonData">
                操作
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={parentScope} loading={isFetching} config={this.state.servicesList} />
          </div>
          <div className="btnBox">
            <Link to={`/app_manage/app_create`}>
              <Button type="primary" size="large" onClick={this.delServicesList}>
                上一步
            </Button>
            </Link>
            <Link to={`/app_manage/app_create/compose_file`}>
              <Button type="primary" size="large" onClick={this.subServicesList}>
                下一步
            </Button>
            </Link>
          </div>
          <Modal title="添加服务"
            visible={this.state.modalShow}
            className="AppAddServiceModal"
            onCancel={this.closeModal}
            >
            <AppAddServiceModal scope={parentScope} />
          </Modal>
          <Modal
            visible={this.state.serviceModalShow}
            className="AppServiceDetail"
            transitionName="move-right"
            >
            <AppDeployServiceModal scope={parentScope} servicesList={servicesList} checkInf={this.state.checkInf} serviceOpen={this.state.serviceModalShow} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ServiceList.propTypes = {
  cluster: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  servicesList: PropTypes.array.isRequired,
}

