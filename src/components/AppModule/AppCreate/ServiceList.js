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
import { Modal, Checkbox, Button, Card, Menu ,Popconfirm, Form} from 'antd'
import { Link , browserHistory} from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppAddServiceModal from './AppAddServiceModal'
import AppDeployServiceModal from './AppDeployServiceModal'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/ServiceList.less"
const createForm = Form.create;


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
    const self = this
    Modal.confirm({
      title: '您是否确认要删除这1个服务',
      content: `${name}`,
      onOk() {
        const oldList = self.props.scope.state.servicesList
        const newList = oldList.filter((item) => item.name !== name)
        const oldSeleList = self.props.scope.state.selectedList
        const newSeleList = oldSeleList.filter((item) => item !== name)
        self.props.scope.setState({
          servicesList: newList,
          selectedList: newSeleList
        })
        localStorage.setItem('servicesList', JSON.stringify(newList))
        localStorage.setItem('selectedList', JSON.stringify(newSeleList))
      },
      onCancel() { },
    })
  }
  checkService(name, inf, imageName) {
    console.log(imageName)
    let registryServer
    if(imageName) {
      let start = imageName.indexOf('/')
      let end = imageName.lastIndexOf(':')
      registryServer = imageName.substring(0, start)
      imageName = imageName.substring(start + 1, end)
    }
    console.log(imageName)
    console.log(registryServer)
    this.props.scope.setState({
      serviceModalShow: true,
      checkInf: inf,
      isCreate: false,
      currentSelectedImage: imageName,
      registryServer
    })
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
            <Button className="viewBtn" type="ghost" size="large" onClick={() => this.checkService(item.name, item.inf, item.imageName)}>
              <i className="fa fa-eye" />&nbsp;
              <span>查看</span>
            </Button>
            <Button type="ghost" size="large" onClick={() => this.deleteService(item.name)}>
              <i className="fa fa-trash" />&nbsp;
              <span>删除</span>
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

class ServiceList extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.delServicesList = this.delServicesList.bind(this);
    this.delAllSelected = this.delAllSelected.bind(this);
    this.state = {
      modalShow: false,
      selectedList: [],
      servicesList: [],
      serviceModalShow: false,
      currentSelectedImage: null,
      registryServer: null,
      isCreate: true,
      checkInf: null,
      visible: true
    }
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
    const { getFieldProps } = this.props.form
    const {registryServer, imageName, other} = this.props
    if (registryServer && imageName) {
      this.setState({
        serviceModalShow: true,
        registryServer,
        currentSelectedImage: imageName,
        other
      })
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

  godeploystack(visible) {
    if (!visible) {
      this.setState({ visible });
      return;
    }
    if (this.state.servicesList.length >0) {
     // 直接执行下一步
      localStorage.setItem('servicesList', JSON.stringify(this.state.servicesList))
      localStorage.setItem('selectedList', JSON.stringify(this.state.selectedList))
      browserHistory.push(`/app_manage/app_create/compose_file?query=fast_create`)
    } else {
      this.setState({ visible });  // 进行确认
    }
  }

  delServicesList() {
    localStorage.removeItem('servicesList');
    localStorage.removeItem('selectedList');
  }
  delAllSelected() {
    let selectedList = this.state.selectedList
    let servicesList = this.state.servicesList
    let newServiceList = servicesList.filter(function (service) {
      return !selectedList.includes(service.id)
    })
    this.setState({
      servicesList: newServiceList,
      selectedList: []
    })
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
            <Button size="large" type="ghost" onClick={this.delAllSelected}>
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
            </Link>
            <Popconfirm title="您还未添加服务，是否打开服务框进行选择！"
              visible={this.state.visible} onVisibleChange={(e)=> this.godeploystack(e)}
              onConfirm={()=>this.setState({modalShow: true})}>
              <Button type="primary" size="large">
                下一步
              </Button>
            </Popconfirm>
          </div>
          <Modal title="添加服务"
            visible={this.state.modalShow}
            className="AppAddServiceModal"
            wrapClassName="appAddServiceModal"
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

function mapStateToProps(state, props) {
  const { query } = props.location
  const {imageName, registryServer, other} = query
  return {
    imageName,
    registryServer,
    other
  }
}



export default connect(mapStateToProps)(injectIntl(createForm()(ServiceList), {
  withRef: true,
}))