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
import { Modal, Checkbox, Button, Card, Menu ,Popconfirm } from 'antd'
import { Link , browserHistory} from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppAddServiceModal from './AppAddServiceModal'
import AppDeployServiceModal from './AppDeployServiceModal'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { parseAmount } from '../../../common/tools.js'

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
  deleteService() {
    const { serverName } = this.state
    const self = this
    this.setState({delModal: false})
    const oldList = self.props.scope.state.servicesList
    const newList = oldList.filter((item) => item.name !== serverName)
    const oldSeleList = self.props.scope.state.selectedList
    const newSeleList = oldSeleList.filter((item) => item !== serverName)
    this.props.scope.setState({
      servicesList: newList,
      selectedList: newSeleList
    })
    localStorage.setItem('servicesList', JSON.stringify(newList))
    localStorage.setItem('selectedList', JSON.stringify(newSeleList))

  }
  checkService(name, inf, imageName) {
    let registryServer
    if(imageName) {
      let start = imageName.indexOf('/')
      let end = imageName.lastIndexOf(':')
      registryServer = imageName.substring(0, start)
      imageName = imageName.substring(start + 1, end)
    }
    this.props.scope.setState({
      serviceModalShow: true,
      checkInf: inf,
      isCreate: false,
      currentSelectedImage: imageName,
      registryServer
    })
  }
  render() {
    const  config = this.props.scope.state.servicesList;
    const items = config.map((item) => {
      return (
        <div key={item.id} className={this.checkedFunc(item.id) ? "selectedService serviceDetail" : "serviceDetail"}>
          <div className="selectIconTitle commonData">
            &nbsp;
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
          <div className="resource commonData" style={{paddingLeft:'15px'}}>
            {item.inf.Deployment.spec.replicas}
          </div>
          <div className="opera commonData">
            <Button className="viewBtn" type="ghost" size="large" onClick={() => this.checkService(item.name, item.inf, item.imageName)}>
              <i className="fa fa-eye" />&nbsp;
              <span>查看</span>
            </Button>
            <Button type="ghost" size="large" onClick={() => this.setState({delModal: true, serverName: item.name})}>
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
        <Modal title="删除服务操作" visible={this.state.delModal}
          onOk={()=> this.deleteService()} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除这1个服务?</div>
        </Modal>
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
      visible: false
    }
  }

  componentWillMount() {
    let forCacheServiceList = localStorage.getItem('forCacheServiceList');
    if(!forCacheServiceList) {      
      localStorage.removeItem('servicesList')
      localStorage.removeItem('selectedList')
      localStorage.setItem('forCacheServiceList', false)
    }
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
    const {registryServer, imageName, other} = this.props
    if (registryServer && imageName) {
      this.setState({
        serviceModalShow: true,
        registryServer,
        currentSelectedImage: imageName,
        other
      })
    }
    if (this.props.location.query.query) {
      this.setState({modalShow: true})
    }
  }
  componentDidMount() {
    if (window.previousLocation === "/app_manage/app_create") {
      this.setState({ modalShow: true })
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
    setTimeout(function() {
      document.getElementById('soImageName').focus()
    },100)
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
    if (this.state.servicesList.length <= 0) {
      Modal.warning({
        title: '选择服务',
        content: '请选择至少一个服务才能创建',
      });
      return
    }
    if (this.state.servicesList.length > 0) {
     // 直接执行下一步
      localStorage.setItem('servicesList', JSON.stringify(this.state.servicesList))
      let tempList = this.state.servicesList.map((service) => {
        return service.id;
      })
      localStorage.setItem('selectedList', JSON.stringify(tempList))
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
    let serviceName = selectedList.map(service => {
      return service
    })
    if(serviceName.length <= 0) return
    const self = this
    this.setState({delAllModal: false})
    let newServiceList = servicesList.filter(function(service) {
      return !selectedList.includes(service.id)
    })
    self.setState({
      servicesList: newServiceList,
      selectedList: []
    })

  }
  formetServer(size) {
    const { resourcePrice } = this.props.cluster
    if (!resourcePrice) return 0
    switch(size) {
      case '1C/256M':
        return resourcePrice['1x']
      case '1C/512M':
        return resourcePrice['2x']
      case '1C/1G':
        return resourcePrice['4x']
      case '1C/2G':
        return resourcePrice['8x']
      case '1C/4G':
        return resourcePrice['16x']
      case '2C/8G':
        return resourcePrice['32x']
      default:
        return resourcePrice['1x'];
    }
  }

  formetPrice() {
    //  返回计算后单价
    const { servicesList } = this.state
    const priceArr = []
    servicesList.forEach((list, index)=> {
      priceArr.push(this.formetServer(servicesList[index].resource) * (servicesList[index].inf.Deployment.spec.replicas))//number
    })
    let result = 0;
    for(let i = 0; i < priceArr.length; i++) {
      result += priceArr[i];
    }
    return result
  }
  countSize() {
  // 返回 服务数量
     const { servicesList } = this.state
    const priceArr = []
    servicesList.forEach((list, index)=> {
      priceArr.push(servicesList[index].inf.Deployment.spec.replicas )//number
    })
    let result = 0;
    for(let i = 0; i < priceArr.length; i++) {
      result += priceArr[i];
    }
    return result
  }
  countConfig() {
    const { servicesList } = this.state
    let priceArr =[],unit ={}
    servicesList.forEach((list, index)=> {
      priceArr.push({
        cpu: parseInt(list.resource.split('/')[0]) * list.inf.Deployment.spec.replicas,
        memory: parseInt(list.inf.Deployment.spec.template.spec.containers[0].resources.requests.memory)  * list.inf.Deployment.spec.replicas
      })
    })
    let cpuNumber = 0, memory = 0
    for(let i = 0; i < priceArr.length; i++) {
      cpuNumber += priceArr[i].cpu;
      memory += priceArr[i].memory;
    }
    return unit = {
      cpu: cpuNumber,
      memory
    }
  }
  render() {
    const parentScope = this
    const { servicesList, isFetching , cluster} = this.props
    const price = this.props.cluster.resourcePrice
    const configData = this.countConfig()
    let hourPrice = this.formetPrice()
    const countPrice = parseAmount(hourPrice *24 *30, 4) // * hourPrice 上下的顺序不能乱了
    hourPrice = parseAmount(hourPrice, 4)
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
            {this.state.selectedList.length >0 ?
              <Button size="large" type="ghost" onClick={()=> this.setState({delAllModal: true})}>
                <i className="fa fa-trash" />&nbsp;
                删除
              </Button>
              :
              <Button size="large" type="ghost" disabled={true}>
                <i className="fa fa-trash" />&nbsp;
                删除
              </Button>
            }
          </div>
          <div className="dataBox">
            <div className="titleBox">
              <div className="selectIconTitle commonData">
                &nbsp;
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
              <div className="resource commonData">
                容器数量
              </div>
              <div className="opera commonData">
                操作
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={parentScope} loading={isFetching} config={this.state.servicesList} />
          </div>
          <div className="modal-price">
            <div className="price-left">
              <span className="keys">计算资源：<span className="unit">{configData.cpu}C/{configData.memory /1024 }G </span></span>
            </div>
            <div className="price-unit">合计：<span className="unit">{ countPrice.unit =='￥'? '￥':'' }</span>
              <span className="unit blod">{ hourPrice.amount }{ countPrice.unit =='￥'? '':'T' }/小时</span>
              <span className="unit monthUnit">（约：{ countPrice.fullAmount }/月）</span>
            </div>
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
          <Modal title="删除服务操作" visible={this.state.delAllModal}
          onOk={()=> this.delAllSelected()} onCancel={()=> this.setState({delAllModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除这 {this.state.selectedList.length}个服务?</div>
        </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { query } = props.location
  const {imageName, registryServer, other} = query
  const { cluster } = state.entities.current
  return {
    imageName,
    registryServer,
    cluster,
    other
  }
}



export default connect(mapStateToProps)(injectIntl(ServiceList, {
  withRef: true,
}))
