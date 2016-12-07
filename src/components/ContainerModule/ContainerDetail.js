/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerDetail component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown, Tabs, Card, Menu, Button, Spin, Modal, message } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerDetailInfo from "./ContainerDetailInfo.js"
import ContainerLogs from "./ContainerLogs"
import ContainerEvents from "./ContainerEvents"
import "./style/ContainerDetail.less"
import { loadContainerDetail, deleteContainers } from '../../actions/app_manage'
import ContainerMonitior from './ContainerMonitior'
import TerminalModal from '../TerminalModal'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { formatDate } from '../../common/tools'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
const ButtonGroup = Button.Group
const confirm = Modal.confirm

function loadData(props) {
  const { cluster, containerName } = props
  props.loadContainerDetail(cluster, containerName)
}

class ContainerDetail extends Component {
  constructor(props) {
    super(props)
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.deleteContainer = this.deleteContainer.bind(this)
    this.state = {
      currentKey: "1",
      TerminalLayoutModal: false,
      currentContainer: null,
    }
  }

  componentWillMount() {
    const { containerName } = this.props
    document.title = `容器 ${containerName} | 时速云`
    loadData(this.props)
  }
  closeTerminalLayoutModal() {
    //this function for user close the terminal modal
    this.setState({
      TerminalLayoutModal: false
    });
  }
  openTerminalModal(item, e) {
    //this function for user open the terminal modal
    e.stopPropagation();
    this.setState({
      currentContainer: item,
      TerminalLayoutModal: true
    });
  }
  deleteContainer() {
    const { containerName, cluster, deleteContainers } = this.props
    confirm({
      title: `您是否确认要重新分配 ${containerName} 这个容器`,
      onOk() {
        return new Promise((resolve) => {
          const hide = message.loading('正在保存中...', 0)
          deleteContainers(cluster, [containerName], {
            success: {
              func: () => {
                hide()
                message.success(`容器 ${containerName} 已成功重新分配`)
                browserHistory.push('/app_manage/container')
              },
              isAsync: true
            },
            failed: {
              func: () => {
                hide()
                message.error(`容器 ${containerName} 重新分配失败`)
              }
            }
          })
          resolve()
        });
      },
      onCancel() { },
    })
  }
  render() {
    const parentScope = this
    const { containerName, isFetching, container, cluster } = this.props
    const { children } = this.props
    const { currentKey } = this.state
    if (isFetching || !!!container || !!!container.metadata) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!container.status) {
      container.status = {}
    }
    const operaMenu = (
      <Menu>
        <Menu.Item key="0" disabled={true}>
          <i className="fa fa-stop" style={{ marginRight: "10px" }}></i>停止
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="ContainerDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div className="cover"></div>
          <div key="ca" className="containerInfo" id='containerInfo'>
            <Card className="topCard">
              <div className="imgBox">
                <img src="/img/default.png" />
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  {containerName}
                </p>
                <div className="leftInfo">
                  <div className="status">
                    运行状态&nbsp;:
                    <span style={{ position: 'relative', top: '-5px' }}>
                      <ContainerStatus container={container} smart={true} />
                    </span>
                  </div>
                  <div className="address">
                    地址&nbsp;:&nbsp; {container.status.podIP}
                  </div>
                </div>
                <div className="middleInfo">
                  <div className="createDate">
                    创建&nbsp;:&nbsp; {formatDate(container.metadata.creationTimestamp || '')}
                  </div>
                  {/*<div className="updateDate">
                      更新&nbsp;:&nbsp;{container.metadata.creationTimestamp}
                    </div>*/}
                </div>
                <div className="rightInfo">
                  <div className="actionBox commonData">
                    <Button type="primary" className="viewBtn" size='large'
                      onClick={(e) => this.openTerminalModal(container, e)}>
                      <svg className="terminal">
                        <use xlinkHref="#terminal" />
                      </svg>
                      登录终端
                    </Button>
                    <Dropdown.Button
                      onClick={this.deleteContainer} size='large'
                      overlay={operaMenu} type="ghost">
                      <i className="fa fa-power-off"></i>&nbsp;重新分配
                    </Dropdown.Button>
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div style={{ clear: "both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey="1"
                >
                <TabPane tab="容器配置" key="1" >
                  <ContainerDetailInfo key="ContainerDetailInfo" container={container} />
                </TabPane>
                <TabPane tab="监控" key="2" >
                  <ContainerMonitior key="ContainerMonitior" containerName={containerName} cluster={cluster} />
                </TabPane>
                <TabPane tab="日志" key="3" >
                  <ContainerLogs
                    key="ContainerLogs"
                    containerName={containerName}
                    serviceName={container.metadata.labels.name}
                    cluster={cluster} />
                </TabPane>
                <TabPane tab="事件" key="4" >
                  <ContainerEvents key="ContainerEvents" containerName={containerName} cluster={cluster} />
                </TabPane>
              </Tabs>
            </Card>
          </div>
          <Modal
            visible={this.state.TerminalLayoutModal}
            className='TerminalLayoutModal'
            transitionName='move-down'
            onCancel={this.closeTerminalLayoutModal}
            >
            <TerminalModal scope={parentScope} config={this.state.currentContainer} show={this.state.TerminalLayoutModal} />
          </Modal>
        </QueueAnim>
      </div>
    )
  }
}

ContainerDetail.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerName: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  container: PropTypes.object.isRequired,
  loadContainerDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { container_name } = props.params
  const { cluster } = state.entities.current
  const defaultContainer = {
    isFetching: false,
    cluster: cluster.clusterID,
    containerName: container_name,
    container: {}
  }
  const {
    containerDetail
  } = state.containers
  const { container, isFetching } = containerDetail[cluster.clusterID] || defaultContainer

  return {
    containerName: container_name,
    cluster: cluster.clusterID,
    isFetching,
    container
  }
}

export default connect(mapStateToProps, {
  loadContainerDetail,
  deleteContainers,
})(ContainerDetail)
