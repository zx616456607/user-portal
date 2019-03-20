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
import { Tabs, Card, Menu, Button, Spin, Modal } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerDetailInfo from "./ContainerDetailInfo.js"
import ContainerLogs from "./ContainerLogs"
import ContainerEvents from "./ContainerEvents"
import ContainerProgress from './ContainerProgress'
import "./style/ContainerDetail.less"
import { loadContainerDetail, deleteContainers } from '../../actions/app_manage'
import { addTerminal } from '../../actions/terminal'
import ContainerMonitior from './ContainerMonitior'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { formatDate } from '../../common/tools'
import NotificationHandler from '../../components/Notification'
import Title from '../Title'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerDetailIntl'
import Ellipsis from '@tenx-ui/ellipsis/lib'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm
const DEFAULT_TAB = '#configs'

function loadData(props) {
  const { cluster, containerName } = props
  props.loadContainerDetail(cluster, containerName)
}

class ContainerDetail extends Component {
  constructor(props) {
    super(props)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.deleteContainer = this.deleteContainer.bind(this)
    this.onTabClick = this.onTabClick.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
      currentContainer: null,
    }
  }

  componentWillMount() {
    loadData(this.props)
  }

  // For tab select
  componentWillReceiveProps(nextProps) {
    let { hash } = nextProps
    if (hash === this.props.hash) {
      return
    }
    if (!hash) {
      hash = DEFAULT_TAB
    }
    this.setState({
      activeTabKey: hash
    })
  }

  openTerminalModal(item, e) {
    e.stopPropagation();
    const { cluster, addTerminal } = this.props
    addTerminal(cluster, item)
  }

  deleteContainer() {
    const { containerName, cluster, deleteContainers } = this.props
    const { formatMessage } = this.props.intl
    confirm({
      title: formatMessage(IntlMessages.delContainerConfirm, { containerName }),
      onOk() {
        return new Promise((resolve) => {
          let notification = new NotificationHandler()
          notification.spin(formatMessage(IntlMessages.containerDeleting, { containerName }))
          deleteContainers(cluster, [containerName], {}, {
            success: {
              func: () => {
                notification.close()
                notification.success(formatMessage(IntlMessages.containerDeleted, { containerName }))
                browserHistory.push('/app_manage/container')
              },
              isAsync: true
            },
            failed: {
              func: () => {
                notification.close()
                notification.error(formatMessage(IntlMessages.containerDeleteFailed, { containerName }))
              }
            }
          })
          resolve()
        });
      },
      onCancel() { },
    })
  }

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    const { pathname } = this.props
    this.setState({
      activeTabKey
    })
    if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }
    browserHistory.push({
      pathname,
      hash: activeTabKey
    })
  }

  render() {
    const parentScope = this
    const { containerName, isFetching, container, cluster, intl, children } = this.props
    const { formatMessage } = intl
    const { activeTabKey } = this.state
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
          <i className="fa fa-stop" style={{ marginRight: "10px" }}></i>
          <FormattedMessage {...IntlMessages.stop} />
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="ContainerDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <Title title={formatMessage(IntlMessages.title, { containerName })} />
          <div className="cover"></div>
          <div key="ca" className="containerInfo" id='containerInfo'>
            <Card className="topCard">
              <div className="imgBox">
                <TenxIcon type='gear'/>
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  {containerName}
                </p>
                <div className="leftInfo">
                  <div className="status">
                    <FormattedMessage {...IntlMessages.status} />
                    <span style={{ position: 'relative' }}>
                      <ContainerStatus container={container} smart={true} />
                    </span>
                  </div>
                  <div className="address">
                    <FormattedMessage {...IntlMessages.address} />
                    <span className="ipAddress">
                      <Ellipsis tooltip={container.status.podIP} lines={1}>
                        <span>{container.status.podIP}</span>
                      </Ellipsis>
                    </span>
                  </div>
                </div>
                <div className="middleInfo">
                  <div className="createDate">
                    <FormattedMessage {...IntlMessages.createTime} />
                    {formatDate(container.metadata.creationTimestamp || '')}
                  </div>
                  {/*<div className="updateDate">
                      更新：{container.metadata.creationTimestamp}
                    </div>*/}
                </div>

                <div className="rightInfo">
                  <div className="actionBox commonData">
                    <Button type="primary" className="viewBtn" size='large'
                      onClick={(e) => this.openTerminalModal(container, e)}>
                      <TenxIcon type='terminal'/>
                      <FormattedMessage {...IntlMessages.loginTerminal} />
                    </Button>
                    <Button
                      onClick={this.deleteContainer} size='large' type="ghost">
                      <i className='fa fa-undo' />&nbsp;
                      <FormattedMessage {...IntlMessages.deleteContainer} />
                    </Button>
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div style={{ clear: "both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey={DEFAULT_TAB}
                activeKey={activeTabKey}
                onTabClick={this.onTabClick}
                >
                <TabPane
                  tab={<FormattedMessage {...IntlMessages.configs} />}
                  key="#configs"
                >
                  <ContainerDetailInfo key="#configs" container={container} intl={intl} />
                </TabPane>
                <TabPane
                  tab={<FormattedMessage {...IntlMessages.monitor} />}
                  key="#monitor"
                >
                  <ContainerMonitior key="#monitor" containerName={containerName} cluster={cluster} intl={intl} />
                </TabPane>
                <TabPane
                  tab={<FormattedMessage {...IntlMessages.logs} />}
                  key="#logs"
                >
                  <ContainerLogs
                    key="#logs"
                    containerName={containerName}
                    serviceName={container.metadata.labels.name}
                    cluster={cluster}
                    tabKey="#logs"
                    intl={intl}
                    activeTabKey={activeTabKey} />
                </TabPane>
                <TabPane
                  tab={<FormattedMessage {...IntlMessages.events} />}
                  key="#events"
                >
                  <ContainerEvents key="#events" containerName={containerName} cluster={cluster} intl={intl} />
                </TabPane>
                <TabPane
                  tab={<FormattedMessage {...IntlMessages.progress} />}
                  key="#progress"
                >
                  <ContainerProgress key="#progress" containerName={containerName} container={container} cluster={cluster} intl={intl} />
                </TabPane>
              </Tabs>
            </Card>
          </div>
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
  const { params, location } = props
  const { container_name } = params
  const { pathname, hash } = location
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
    pathname,
    hash,
    containerName: container_name,
    cluster: cluster.clusterID,
    isFetching,
    container
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadContainerDetail,
  deleteContainers,
  addTerminal,
})(ContainerDetail), {
  withRef: true,
})
