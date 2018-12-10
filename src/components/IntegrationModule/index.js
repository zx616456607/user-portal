/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Integration index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { getAllIntegration } from '../../actions/integration'
import { getConfigByType, saveGlobalConfig } from '../../actions/global_config'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Alert, Card, Spin, Input, Modal, Row, Col, Icon, notification } from 'antd'
import './style/Integration.less'
import IntegrationDetail from './IntegrationDetail'
import CreateVSphereModal from './CreateVSphereModal'
import OpenstackSetting from './OpenstackSetting'
import vmwareImg from '../../assets/img/appstore/vmware.svg'
import cephImg from '../../assets/img/appstore/ceph.svg'
import openstackImg from '../../assets/img/appstore/easystack.svg'
import TerraformImg from '../../assets/img/appstore/terraform.svg'
import htzyImg from '../../assets/img/appstore/right-cloud.svg'
import Title from '../Title'
import Ceph from './Ceph'
import filter from 'lodash/filter'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE

let standardFlag = (mode == standard ? true : false);

const menusText = defineMessages({
  tooltips: {
    id: 'Integration.IntegrationIndex.tooltips',
    defaultMessage: '集成中心提供了业内主流的基础管理软件和开发者工具集合，您可以在这里一键集成安装，并且在当前控制台完成所有应用的安装、卸载以及对应功能的管理。',
  },
  allApps: {
    id: 'Integration.IntegrationIndex.allApps',
    defaultMessage: '全部应用',
  },
  installedApps: {
    id: 'Integration.IntegrationIndex.installedApps',
    defaultMessage: '已安装应用',
  },
  deletedApps: {
    id: 'Integration.IntegrationIndex.deletedApps',
    defaultMessage: '已卸载应用',
  },
  appType: {
    id: 'Integration.IntegrationIndex.appType',
    defaultMessage: '应用分类：',
  },
  showAppDetail: {
    id: 'Integration.IntegrationIndex.showAppDetail',
    defaultMessage: '进入应用',
  },
  running: {
    id: 'Integration.IntegrationIndex.running',
    defaultMessage: '安装中...',
  },
  uninstall: {
    id: 'Integration.IntegrationIndex.uninstall',
    defaultMessage: '集成安装',
  },
  installedFlag: {
    id: 'Integration.IntegrationIndex.installedFlag',
    defaultMessage: '已安装',
  },
  createTitle: {
    id: 'Integration.IntegrationIndex.createTitle',
    defaultMessage: '集成安装',
  },
  commingSoon: {
    id: 'Integration.IntegrationIndex.commingSoon',
    defaultMessage: '敬请期待',
  },
})

class Integration extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.closeCreateIntegration = this.closeCreateIntegration.bind(this);
    this.openCreateIntegration = this.openCreateIntegration.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      currentIntegration: null,
      createIntegrationModal: false,
      isShowOpenstackModal: false,
      config: {},
      vmActiveKey: '',
      cephIsSetting: false,
    }
  }

  componentWillMount() {
    const { getAllIntegration } = this.props;
    getAllIntegration();
    this.loadConfig()
  }
  loadConfig = () => {
    const { getConfigByType, clusterID } = this.props;
    getConfigByType(clusterID, 'openstack', {
      success: {
        func: res => {
          if (res.statusCode === 200 && res.data) {
            // const openstack = filter(res.data, { configType: 'openstack' })[0]
            // debugger
            this.setState({
              config: res.data,
            })
          }
        },
        isAsync: true,
      }
    })
  }

  onChangeShowType(type) {
    //this function for user change the type of app list
    this.setState({
      currentShowApps: type
    });
  }

  onChangeAppType(type) {
    //this function for user change the type of app
    this.setState({
      currentAppType: type
    });
  }

  ShowDetailInfo(id, isDefaultSetting) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail',
      currentIntegration: id,
      vmActiveKey: isDefaultSetting ? '4' : ''
    }, () => {
      setTimeout(() => {
        this.setState({
          vmActiveKey: '',
        })
      }, 10000)
    });
  }

  openCreateIntegration = () => {
    //this function for user open the create integration modal
    this.setState({
      createIntegrationModal: true
    })
    setTimeout(() => {
      document.getElementById('name').focus()
    }, 500)
  }

  closeCreateIntegration() {
    //this function for user close the create integration modal
    this.setState({
      createIntegrationModal: false
    });
  }

  showSetting = (type, _cb) => {
    switch (type) {
      case 'openstack': {
        this.setState({
          isShowOpenstackModal: true,
        })
        break;
      }
      case 'ceph': {
        this.cephCallback()
        break;
      }
      case 'vmware': {
        _cb()
        break;
      }
      case 'rightCloud':
        break
    }
  }
  cephCallback = () => {
    this.setState({
      showType: 'Ceph',
      cephIsSetting: true
    }, () => {
      setTimeout({
        cephIsSetting: false
      }, 10000)
    })
  }
  onOk = body => {
    let { config } = this.state
    const { saveGlobalConfig, clusterID } = this.props
    config.configDetail = body
    saveGlobalConfig(clusterID, 'openstack', config, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            notification.success({
              message: '配置成功'
            })
            this.setState({
              isShowOpenstackModal: false,
            })
            this.loadConfig()
          }
        },
        isAsync: true,
      }
    })
  }

  toRightCloud = () => {
    browserHistory.push('/cluster/integration/rightCloud')
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching, integrations } = this.props;
    const { isShowOpenstackModal, config, vmActiveKey, cephIsSetting, configID } = this.state
    const temp = config && (typeof config.configDetail === 'string' ? JSON.parse(config.configDetail) : config.configDetail)
    const isLinkBlank = !!temp && temp.type === 1
    const isNeedSetting = config && (!config.configDetail || config.configDetail === '{}')
    const scope = this;
    if (isFetching || !Boolean(integrations.vsphere)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const isCephReady = integrations.ceph
    let appShow = null;
    // if (integrations.length > 0) {
      appShow = (() => {
        const item = integrations.vsphere && integrations.vsphere[0] || false
        const index = 0
        let envList = (
          <div className="envInfo">
            <div className='envDetail' key={'appDetail' + index + 'envDetail0'}>
              <div className='numBox'>
                {'01'}
              </div>
              <div className='envName'>部署好的vSphere环境</div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail1'}>
              <div className='numBox'>
                {'02'}
              </div>
              <div className='envName'>vSphere访问URL</div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail2'}>
              <div className='numBox'>
                {'03'}
              </div>
              <div className='envName'>登录帐号&密码</div>
            </div>
          </div>
        )
        return (
          <Col span={12}>
            <div className='appDetail'>
              <div className='leftBox'>
                <img src={vmwareImg} />
              </div>
              <div className='middleBox'>
                <div className='appInfo'>
                  <p>
                    vSphere
                  {
                    standardFlag ?
                      <Button className='installedBtn' size='large' type={standardFlag ? 'primary' : ''} disabled={standardFlag}
                        style={{ width: '90px' }} onClick={ item && this.ShowDetailInfo(item.id)}>
                        <span>敬请期待</span>
                      </Button>
                      :
                      [
                        !!item ?
                          <Icon className="setting" type="setting" onClick={() => this.showSetting('vmware', () => { this.ShowDetailInfo(item.id, true)} )} />
                          :
                          <Icon className="setting" type="setting" onClick={this.openCreateIntegration} />,
                        <Button disabled={!!!item || standardFlag} className='unintsallBtn' size='large' type={'primary'}
                          style={{ width: '90px' }} onClick={() => { item && this.ShowDetailInfo(item.id) }}>
                          <FormattedMessage {...menusText.showAppDetail} />
                        </Button>]
                    }
                    {
                      !standardFlag ?
                      <div className='installedFlag'>
                        <FormattedMessage {...menusText.installedFlag} />
                      </div>
                      : null
                    }
                  </p>
                </div>
                <div className='infoMessage'>
                  <div className="list">vSphere是VMware公司推出一套服务器虚拟化解决方案。</div>
                  <div className="list">vSphere将应用程序和操作系统从底层分离出来，从而简化了IT操作，用户现有的应用程序可以看到专有资源，而服务器则可以作为资源池进行管理。</div>
                </div>
              </div>
              {envList}
            </div>
          </Col>
        )
      })()
    // }
    return (
      <div className='IntegrationAnimateBox' key='IntegrationAnimateBox'>
        <div id='IntegrationList' key="integration">
          <Title title="集成中心" />
          <Alert message={formatMessage(menusText.tooltips)} type='info' />
          {isFetching ?
            <div className='loadingBox' key='loadingBox'>
              <Spin size='large' />
            </div>
            :
            <div key='infoBoxAnimate'>
              {this.state.showType == 'list' ?
                <QueueAnim key='listBoxAnimate'>
                  <Row gutter={20}>
                    { appShow }
                    <Col span={12} >
                      <div className='cephDetail appDetail'>
                        <div className='leftBox'>
                          <img src={cephImg} />
                        </div>
                        <div className='middleBox'>
                          <div className='appInfo'>
                            <p>
                              Ceph存储总览
                                <Icon className="setting" type="setting" onClick={() => this.showSetting('ceph', this.cephCallback)} />
                                <Button className='unintsallBtn' onClick={() => this.setState({ showType: 'Ceph' })} key='unintsallBtn' size='large' type='primary'
                                  style={{ width: '90px' }} disabled={!isCephReady}>
                                <FormattedMessage {...menusText.showAppDetail} />
                              </Button>
                            </p>
                          </div>
                          <div className="infoMessage">
                            <span>这个应用具备查看Ceph总体存储相关情况的Dashboard，可以配置安装后，立即查看。</span>
                          </div>
                        </div>

                        <div className='envInfo'>
                          <div className='envDetail'>
                            <div className='numBox'>01</div>
                            <div className='envName'>Ceph 存储集群</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>02</div>
                            <div className='envName'>Ceph 管理API</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>03</div>
                            <div className='envName'>Ceph 授权</div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className='cephDetail appDetail'>
                        <div className='leftBox'>
                          <img src={openstackImg} />
                        </div>
                        <div className='middleBox'>
                          <div className='appInfo'>
                            <p>
                              OpenStack 集成
                                <Icon className="setting" type="setting" onClick={() => this.showSetting('openstack')} />
                                {
                                  isLinkBlank ?
                                    <a disabled={isNeedSetting} href="/api/v2/openstack" target="_blank" className="ant-btn ant-btn-primary ant-btn-lg unintsallBtn" key='unintsallBtn' style={{ width: '90px' }}>
                                      <FormattedMessage {...menusText.showAppDetail} />
                                    </a>
                                    :
                                    <a disabled={isNeedSetting} onClick={() => {
                                      browserHistory.push({
                                        pathname: '/OpenStack/host',
                                      })
                                    }} target="_blank" className="ant-btn ant-btn-primary ant-btn-lg unintsallBtn" key='unintsallBtn' style={{ width: '90px' }}>
                                      <FormattedMessage {...menusText.showAppDetail} />
                                    </a>
                                }
                            </p>
                          </div>
                          <div className="infoMessage">
                            <div className="list">OpenStack 是一个开源的云计算管理平台项目，由几个主要的组件组合起来完成具体工作。</div>
                            <div className="list">这里集成主要的计算、存储、网络管理，满足为 PaaS 提供应有的基础设施支撑。</div>
                          </div>
                        </div>

                        <div className='envInfo'>
                          <div className='envDetail'>
                            <div className='numBox'>01</div>
                            <div className='envName'>部署好的 OpenStack 环境</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>02</div>
                            <div className='envName'>OpenStack 访问的 URL</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>03</div>
                            <div className='envName'>登录账号&密码</div>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className='cephDetail appDetail'>
                        <div className='leftBox'>
                          <img className="htzyImg" src={htzyImg} />
                        </div>
                        <div className='middleBox'>
                          <div className='appInfo'>
                            <p>
                              云星集成
                              <Icon className="setting" type="setting" onClick={() => this.showSetting('rightCloud')} />
                              <Button className='unintsallBtn' onClick={this.toRightCloud} key='unintsallBtn' size='large' type='primary'
                                      style={{ width: '90px' }}>
                                <FormattedMessage {...menusText.showAppDetail} />
                              </Button>
                            </p>
                          </div>
                          <div className="infoMessage">
                            <div className="list">云管理平台（Cloud Management Platform，简称CMP）是一款云星数据研发，帮忙企业构建云环境等。</div>
                            <div className="list">支持企业接入多数据中心资源池，多级分子公司、组织自有资源池进行统一管理。</div>
                          </div>
                        </div>

                        <div className='envInfo'>
                          <div className='envDetail'>
                            <div className='numBox'>01</div>
                            <div className='envName'>部署好的云星环境</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>02</div>
                            <div className='envName'>云星访问URL</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>03</div>
                            <div className='envName'>登录账号&密码</div>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className='cephDetail appDetail'>
                        <div className='leftBox'>
                          <img src={TerraformImg} />
                        </div>
                        <div className='middleBox'>
                          <div className='appInfo'>
                            <p>
                              Terraform 集成
                                <Button className='unintsallBtn'
                                  disabled={true}
                                  onClick={() => browserHistory.push('/OpenStack')} key='unintsallBtn' size='large' type=''
                                style={{ width: '90px' }}>
                                敬请期待
                              </Button>
                            </p>
                          </div>
                          <div className="infoMessage">
                            <div className="list">Terraform 是一个 IT 基础架构自动化编排工具，它的口号是“Write，Plan，and create Infrastructure as Code ”，基础架构即代码。具体的说就是可以用代码来管理维护 IT 资源。 </div>
                          </div>
                        </div>

                        <div className='envInfo'>
                          <div className='envDetail'>
                            <div className='numBox'>01</div>
                            <div className='envName'>部署好的 Terraform 环境</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>02</div>
                            <div className='envName'>Terraform 访问的 URL</div>
                          </div>
                          <div className='envDetail'>
                            <div className='numBox'>03</div>
                            <div className='envName'>登录账号&密码</div>
                          </div>
                        </div>
                      </div>
                    </Col>

                  </Row>
                </QueueAnim>
                : null}
              {this.state.showType == 'detail' ? [
                <QueueAnim key='detailBoxAnimate'>
                  <div className='detailBox' key='detailBox'>
                    <IntegrationDetail defaultActiveKey={vmActiveKey} scope={scope} integrationId={this.state.currentIntegration} />
                  </div>
                </QueueAnim>
              ] : null}
              {this.state.showType === 'Ceph' ?
                <Ceph cephIsSetting={cephIsSetting} key="ceph" scope={this} />
                : null
              }
            </div>
          }
        </div>
        <Modal
          title={<FormattedMessage {...menusText.createTitle} />}
          className='createIntegrationModal'
          visible={this.state.createIntegrationModal}
          onCancel={this.closeCreateIntegration.bind(this)}
        >
          <CreateVSphereModal scope={scope} createIntegrationModal={this.state.createIntegrationModal} />
        </Modal>
        {
          isShowOpenstackModal ?
            <OpenstackSetting
              onCancel={() => this.setState({ isShowOpenstackModal: false })}
              onOk={this.onOk}
              scope={scope}
              visible={isShowOpenstackModal}
              config={config}
            />
            :
            null
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultAppList = {
    isFetching: false,
    integrations: {}
  }
  const { getAllIntegration } = state.integration
  const { isFetching, integrations } = getAllIntegration || defaultAppList
  return {
    clusterID: state.entities.current.cluster.clusterID,
    isFetching,
    integrations
  }
}

Integration.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getAllIntegration,
  getConfigByType,
  saveGlobalConfig,
})(injectIntl(Integration, {
  withRef: true,
}));

