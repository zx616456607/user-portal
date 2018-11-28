/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppDetail component
 *
 * v0.1 - 2016-09-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Card, Spin, Form, Input, Button, Icon } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppServiceList from './AppServiceList'
import AppGraph from './AppGraph'
import AppLog from './AppLog'
import './style/AppDetail.less'
import { formatDate } from '../../common/tools'
import { updateAppDesc, loadAppDetail } from '../../actions/app_manage'
import { loadAllServices } from '../../actions/services'
import { browserHistory } from 'react-router'
import AppStatus from '../TenxStatus/AppStatus'
import { parseAppDomain } from '../parseDomain'
import TipSvcDomain from '../TipSvcDomain'
import NotificationHandler from '../../components/Notification'
import AppServiceRental from './AppServiceDetail/AppServiceRental'
import AlarmStrategy from '../ManageMonitor/AlarmStrategy'
import Topology from '../../../client/containers/AppModule/AppServiceDetail/Topology'
import { loadServiceList } from '../../actions/services'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../constants'
import Title from '../Title'
import TenxIcon from '@tenx-ui/icon/es/_old'
import intlMsg from './AppDetailIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

const DEFAULT_TAB = '#service'
const TabPane = Tabs.TabPane
const createForm = Form.create;
const FormItem = Form.Item;

class AppDetail extends Component {
  constructor(props) {
    super(props)
    this.onTabClick = this.onTabClick.bind(this)
    this.onServicesChange = this.onServicesChange.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
      serviceList: null,
      availableReplicas: 0
    }
  }

  componentWillMount() {
    const { cluster, appName, loadAppDetail, loadAllServices } = this.props
    loadAppDetail(cluster, appName)
    loadAllServices(cluster, {
      pageIndex: 1,
      pageSize: 100,
    }).then(res => {
      this.setState({
        k8sServiceList: res.response.result.data.services.map(service => service.service)
      })
    })
    if (location.hash.length >1) {
      const _this = this
      const query = {
        page: DEFAULT_PAGE,
        size: DEFAULT_PAGE_SIZE,
      }
      this.props.loadServiceList(cluster,appName,query,{
        success:{
          func:(ret)=> {
            _this.onServicesChange(ret.data, ret.availableReplicas, ret.total)
          }
        }
      })

    }
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

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    // const { pathname } = this.props
    const pathname = location.pathname
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
    // if (activeTabKey == '#topology') {
    //   setTimeout(()=> window.frames['topology'].postMessage('topology',location.href),500)
    // }
  }

  // For change app status when service list change
  onServicesChange(serviceList, availableReplicas, total) {
    this.setState({
      serviceList,
      availableReplicas,
      total
    })
  }

  modifyDesc () {
    const { appName, cluster, intl: { formatMessage } } = this.props
    this.props.form.validateFields((errors, data) => {
      data.name = appName,
      data.cluster = cluster
      let notification = new NotificationHandler()
      this.props.updateAppDesc(data, {
        success: {
          func: () => {
            notification.success(formatMessage(intlMsg.appDescriptionScs))
            this.setState({
              editDesc: false,
              desc: data.desc
            })
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(formatMessage(intlMsg.appDescriptionFail))
          },
          isAsync: true
        }

      })
    })
  }

  cancelEdit() {
    this.setState({editDesc:false})
    this.props.form.resetFields()
  }

  render() {
    const { appName, app, isFetching, location, bindingDomains, bindingIPs, billingEnabled, intl: { formatMessage } } = this.props
    const { activeTabKey, serviceList, availableReplicas, total, k8sServiceList } = this.state
    if (isFetching || !app) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
   // const status = getAppStatus(serviceList || app.services)
    let updateDate = '-'
    if (app && app.services && app.services[0]) {
      updateDate = app.services[0].metadata.creationTimestamp
    }
    const appDomain = parseAppDomain(app, bindingDomains, bindingIPs)
    const descProps = this.props.form.getFieldProps('desc', {initialValue: this.state.desc || app.description})
    const currentApp = app
    currentApp.name = appName
    const isShow = activeTabKey === '#topology'
    return (
      <div id='AppDetail'>
        <Title title={formatMessage(intlMsg.appNameDetail, { appName })} />
        <QueueAnim className='demo-content'
          key='demo'
          type='right'
          >
          <div key="cb" className='cover'></div>
          <div key='ca' className='AppInfo' id='AppInfo'>
            <Card className='topCard'>
              <div className='imgBox'>
                <TenxIcon type="apps-o"/>
              </div>
              <div className='infoBox'>
                <p className='appTitle'>
                  {appName}
                </p>
                <div className='leftInfo'>
                  <div className='status'>
                    <FormattedMessage {...intlMsg.status}/>：
                    <div style={{ display: 'inline-block', position: 'relative' }}>
                      <AppStatus
                        app={
                          serviceList
                            ? { services: serviceList }
                            : app
                        }
                        smart={true} />
                    </div>
                  </div>
                  <div className='address appDetailDomain'>
                    <span className='title'><FormattedMessage {...intlMsg.address}/>：</span>
                    <div className='addressRight'>
                      <TipSvcDomain appDomain={appDomain} parentNode='appDetailDomain' />
                    </div>
                  </div>
                  <div className='service'>
                    <FormattedMessage {...intlMsg.server}/>：
                    {`${availableReplicas} / ${total}`}
                  </div>
                </div>
                <div className='middleInfo'>
                  <div className='createDate'>
                    <FormattedMessage {...intlMsg.create}/>：{formatDate(app.createTime || '')}
                  </div>
                  <div className='updateDate'>
                    <FormattedMessage {...intlMsg.update}/>：{updateDate === '-' ? updateDate : formatDate(updateDate || '')}
                  </div>
                </div>
                <div className='rightInfo'>
                  <Form horizontal>
                    <div className='introduction' style={{ height: '115px'}}>
                    <FormItem hasFeedback style={{ marginBottom: '0px'}}>
                      <FormattedMessage {...intlMsg.description}/>：
                      {this.state.editDesc ? null :
                        <Button size="default" type="ghost" style={{ float: 'right', top: '-8px' }} onClick={() => this.setState({editDesc:true})} disabled={this.state.editDesc}>
                          <Icon type="edit" /><FormattedMessage {...intlMsg.edit}/>
                        </Button>}
                      <br/>
                      <Input
                        type="textarea"
                        placeholder={formatMessage(intlMsg.plsIptAppDesc)}
                        {...descProps}
                        disabled={!this.state.editDesc}/>
                      {this.state.editDesc ?
                        <div className="editInfo">
                          <div style={{ lineHeight: '50px' }} className="text-center">
                            <Button type="ghost" style={{ marginRight: '10px' }} onClick={() => this.cancelEdit()}><FormattedMessage {...intlMsg.cancel}/></Button>
                            <Button type="primary" onClick={() => this.modifyDesc()}><FormattedMessage {...intlMsg.save}/></Button>
                          </div>
                        </div>: null}
                    </FormItem>
                    </div>
                  </Form>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div style={{ clear: 'both' }}></div>
            </Card>
            <Card className='bottomCard'>
              <Tabs
                tabPosition='top'
                defaultActiveKey={DEFAULT_TAB}
                onTabClick={this.onTabClick}
                activeKey={activeTabKey}
                >
                <TabPane tab={formatMessage(intlMsg.serverInstance)} key={DEFAULT_TAB} >
                  <AppServiceList
                    location={location}
                    k8sServiceList={k8sServiceList}
                    key='AppServiceList'
                    onServicesChange={this.onServicesChange}
                    appName={appName} />
                </TabPane>
                {/*<TabPane tab='应用拓扑' key='#topology' >应用拓扑</TabPane>*/}
                <TabPane tab={formatMessage(intlMsg.layoutFile)} key='#stack' >
                  <AppGraph key='AppGraph' cluster={this.props.cluster} appName={appName} /></TabPane>
                <TabPane tab={formatMessage(intlMsg.auditLog)} key='#logs' >
                  <AppLog key='AppLog'
                    cluster={this.props.cluster}
                    appName={appName} />
                </TabPane>
                {/*<TabPane tab='监控' key='#monitor' >*/}
                  {/*<AppMonitior*/}
                    {/*cluster={this.props.cluster}*/}
                    {/*appName={appName} />*/}
                {/*</TabPane>*/}
                { billingEnabled ?
                  [<TabPane tab={formatMessage(intlMsg.rentInfo)} key="#rentalInfo">
                    <AppServiceRental serviceName={appName} serviceDetail={app.services} />
                  </TabPane>,
                  <TabPane tab={formatMessage(intlMsg.alarmStg)} key="#strategy">
                    <AlarmStrategy createBy={'app'} appName={appName} cluster={this.props.cluster} currentApp={currentApp}/>
                  </TabPane>,
                  <TabPane tab={formatMessage(intlMsg.topology)} key="#topology">
                    {
                      isShow && <Topology
                        appName={appName}
                        cluster={this.props.cluster}
                        teamspace={this.props.teamspace}
                        userName={this.props.userName}
                      />
                    }
                  </TabPane>]
                :
                  [<TabPane tab={formatMessage(intlMsg.alarmStg)} key="#strategy">
                    <AlarmStrategy createBy={'app'} appName={appName} cluster={this.props.cluster} currentApp={currentApp}/>
                  </TabPane>,
                  <TabPane tab={formatMessage(intlMsg.topology)} key="#topology">
                    {
                      isShow && <Topology
                        appName={appName}
                        cluster={this.props.cluster}
                        teamspace={this.props.teamspace}
                        userName={this.props.userName}
                      />
                    }
                  </TabPane>]
                }
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

AppDetail = createForm()(injectIntl(AppDetail, {
  withRef: true,
}));

AppDetail.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  // app: PropTypes.object.isRequired,
  // isFetching: PropTypes.bool.isRequired,
  loadAppDetail: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { app_name } = props.params
  const { hash, pathname } = props.location
  const { cluster, space } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const { enabled: billingEnabled } = billingEnabled || { enabled: false }
  const defaultApp = {
    isFetching: false,
    cluster: cluster.clusterID,
    appName: app_name,
    app: {}
  }
  const {
    appDetail
  } = state.apps
  const { app, isFetching } = appDetail || defaultApp
  return {
    cluster: cluster.clusterID,
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    appName: app_name,
    app,
    isFetching,
    hash,
    pathname,
    teamspace: space.namespace,
    userName: space.userName,
    location: props.location,
    billingEnabled
  }
}

export default connect(mapStateToProps, {
  loadAppDetail,
  updateAppDesc,
  loadServiceList,
  loadAllServices
})(AppDetail)
