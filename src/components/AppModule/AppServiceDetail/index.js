/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService component
 *
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerList from './AppContainerList'
import AppServiceDetailInfo from './AppServiceDetailInfo'
import ComposeGroup from './ComposeGroup'
import BindDomain from './BindDomain'
import PortDetail from './PortDetail'
import AppUseful from './AppUseful'
import AppServiceLog from './AppServiceLog'
import AppServiceEvent from './AppServiceEvent'
import { loadServiceDetail } from '../../../actions/services'
import './style/AppServiceDetail.less'

const TabPane = Tabs.TabPane;
const operaMenu = (<Menu>
  <Menu.Item key="0">
    重新部署
            </Menu.Item>
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
</Menu>);

function loadData(props) {
  const { cluster, serviceName, loadServiceDetail } = props
  document.title = `${serviceName} 服务详情页 | 时速云`
  loadServiceDetail(cluster, serviceName)
}

class AppServiceDetail extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
  }

  closeModal() {
    const {scope} = this.props
    scope.setState({
      modalShow: false
    });
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

  render() {
    const { scope, serviceDetailmodalShow, serviceDetail, isFetching } = this.props;
    const service = scope.state.currentShowInstance;
    return (
      <div id="AppServiceDetail">
        <div className="titleBox">
          <i className="closeBtn fa fa-times" onClick={this.closeModal}></i>
          <div className="imgBox">
            <img src="/img/test/github.jpg" />
          </div>
          <div className="infoBox">
            <p className="instanceName">
              {service.metadata.name}
            </p>
            <div className="leftBox">
              <span className="status">
                运行状态&nbsp;:&nbsp;
              <span className={service.status == "1" ? "normal" : "error"}>
                  {service.status == "1" ? "运行中" : "异常"}
                </span>
              </span>
              <br />
              <span>
                地址&nbsp;:&nbsp;{service.serviceIP}
              </span>
              <br />
              <span>
                容器实例&nbsp;:&nbsp;3/3
            </span>
            </div>
            <div className="rightBox">
              <Button className="loginBtn" type="primary">
                <svg className="terminal">
                  <use xlinkHref="#terminal" />
                </svg>
                登录终端
            </Button>
              <Dropdown overlay={operaMenu} trigger={['click']}>
                <Button type="ghost" size="large" className="ant-dropdown-link" href="#">
                  更多 <i className="fa fa-caret-down"></i>
                </Button>
              </Dropdown>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="bottomBox">
          <div className="siderBox">
            <Tabs
              tabPosition="left"
              defaultActiveKey="1"
              >
              <TabPane tab="容器实例" key="1">
                <ContainerList serviceName={service.metadata.name} cluster={service.cluster} serviceDetailmodalShow={serviceDetailmodalShow} />
              </TabPane>
              <TabPane tab="基础信息" key="2">
                <AppServiceDetailInfo serviceDetail={serviceDetail} loading={isFetching} />
              </TabPane>
              <TabPane tab="配置组" key="3"><ComposeGroup /></TabPane>
              <TabPane tab="绑定域名" key="4"><BindDomain /></TabPane>
              <TabPane tab="端口" key="5"><PortDetail /></TabPane>
              <TabPane tab="高可用" key="6"><AppUseful /></TabPane>
              <TabPane tab="监控" key="7">监控</TabPane>
              <TabPane tab="日志" key="8"><AppServiceLog serviceName={service.metadata.name} cluster={service.clusterr}/></TabPane>
              <TabPane tab="事件" key="9"><AppServiceEvent serviceName={service.metadata.name} cluster={service.cluster} /></TabPane>
            </Tabs>
          </div>
          <div className="contentBox">
          </div>
        </div>
      </div>
    )
  }
}

AppServiceDetail.propTypes = {
  loadServiceDetail: PropTypes.func.isRequired,
  service: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
  const { scope } = props
  const currentShowInstance = scope.state.currentShowInstance
  const { cluster, metadata } = currentShowInstance
  const serviceName = metadata ? metadata.name : ''
  const defaultService = {
    isFetching: false,
    cluster,
    serviceName,
    service: {}
  }
  const {
    serviceDetail
  } = state.services
  let targetService
  if (serviceDetail[cluster] && serviceDetail[cluster][serviceName]) {
    targetService = serviceDetail[cluster][serviceName]
  }
  const { service, isFetching } = targetService || defaultService
  return {
    cluster,
    serviceName,
    serviceDetail: service,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceDetail
})(AppServiceDetail)