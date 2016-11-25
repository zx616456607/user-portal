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
import { getAllIntegration } from '../../actions/integration'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Alert, Card, Spin, Input } from 'antd'
import './style/Integration.less'
import IntegrationDetail from './IntegrationDetail'

const ButtonGroup = Button.Group;

const menusText = defineMessages({
  tooltips: {
    id: 'Integration.IntegrationIndex.tooltips',
    defaultMessage: '企业集成应用中心，这里有时速云企业版提供了业内顶尖的企业管理和开发者工具集合，您可以在这里一键安装，并且在当前控制台完成所有应用的安装、卸载以及对应功能的管理。',
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
  envTitle: {
    id: 'Integration.IntegrationIndex.envTitle',
    defaultMessage: '依赖环境',
  },
  installedFlag: {
    id: 'Integration.IntegrationIndex.installedFlag',
    defaultMessage: '已安装',
  },
})

class Integration extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      currentIntegration: null
    }
  }
  
  componentWillMount() {
    document.title = '集成中心 | 时速云';
    const { getAllIntegration } = this.props;
    console.log(this.props)
    getAllIntegration();
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
  
  ShowDetailInfo(id) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail',
      currentIntegration: id
    });
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, integrations} = this.props;
    const scope = this;
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let appShow = null;
    if(integrations.length > 0) {  
      appShow = integrations.map((item, index) => {
        let envList = (
          <div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail0'}>
              <div className='numBox'>
                {'1'}
              </div>
              <span className='envName'>部署好的vSphere环境</span>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail1'}>
              <div className='numBox'>
                {'2'}
              </div>
              <span className='envName'>vSphere访问URL</span>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='envDetail' key={'appDetail' + index + 'envDetail2'}>
              <div className='numBox'>
                {'3'}
              </div>
              <span className='envName'>登录账号&密码</span>
              <div style={{ clear:'both' }}></div>
            </div>
          </div>
        )
        return (
          <div className='appDetail'>
            <div className='leftBox'>
              <img src='/img/appstore/vmware.png' />
            </div>
            <div className='middleBox'>
              <div className='appInfo'>
                <p>vSphere</p>
                <span>vSphere是VMware公司推出一套服务器虚拟化解决方案。</span>
                <br />
                <span>vSphere将应用程序和操作系统从底层分离出来，从而简化了IT操作，用户现有的应用程序可以看到专有资源，而服务器则可以作为资源池进行管理。</span>
              </div>
              <div className='envInfo'>
                <p><FormattedMessage {...menusText.envTitle} /></p>
                {envList}
              </div>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='rightBox'>
              {
                /*item.status == 'installed' ? */[
                  <Button className='installedBtn' key={'installedBtn' + index} size='large' type='ghost'
                    style={{ width: '102px' }} onClick={this.ShowDetailInfo.bind(scope, item.id)}>
                    <FormattedMessage {...menusText.showAppDetail} />
                  </Button>
                ] /*: null*/
              }
              {
                item.status == 'running' ? [
                  <Button className='runningBtn' key={'runningBtn' + index} size='large' type='primary'>
                    <i className='fa fa-cog fa-spin'></i>&nbsp;
                    <FormattedMessage {...menusText.running} />
                  </Button>
                ] : null
              }
              {
                item.status == 'unintsall' ? [
                  <Button className='unintsallBtn' key={'unintsallBtn' + index} size='large' type='primary'
                    style={{ width: '102px' }}>
                    <FormattedMessage {...menusText.uninstall} />
                  </Button>
                ] : null
              }
            </div>
            <div style={{ clear:'both' }}></div>
            {
              /*item.status == 'installed' ?*/ [
                <div className='installedFlag' key='installedFlag'>
                  <FormattedMessage {...menusText.installedFlag} />
                </div>
              ] /*: null*/
            }
          </div>
        )
      });
    }
    return (
      <QueueAnim className='IntegrationAnimateBox' key='IntegrationAnimateBox'>
        <div id='IntegrationList'>
          <Alert message={formatMessage(menusText.tooltips)} type='info' />
          <div className='operaBox'>
            <ButtonGroup size='large'>
              <Button type={this.state.currentShowApps == 'all' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'all')}>
                <FormattedMessage {...menusText.allApps} />
              </Button>
              <Button type={this.state.currentShowApps == 'install' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'install')}>
                <FormattedMessage {...menusText.installedApps} />
              </Button>
              <Button type={this.state.currentShowApps == 'delete' ? 'primary' : 'ghost'} onClick={this.onChangeShowType.bind(this, 'delete')}>
                <FormattedMessage {...menusText.deletedApps} />
              </Button>
            </ButtonGroup>
            <div className='searchBox'>
              <Input type='text' size='large' />
              <i className='fa fa-search' />
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          { isFetching ? [
              <div className='loadingBox' key='loadingBox'>
                <Spin size='large' />
              </div>
            ] : [
              <QueueAnim key='infoBoxAnimateBox'>
                <div key='infoBoxAnimate'>
                  <div className='typeBox'>
                    <span className='title'><FormattedMessage {...menusText.appType} /></span>
                    <span className={ this.state.currentAppType == '1' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '1')}>Iaas平台</span>
                    <span className={ this.state.currentAppType == '2' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '2')}>时速云公有云</span>
                    <span className={ this.state.currentAppType == '3' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '3')}>存储平台</span>
                    <span className={ this.state.currentAppType == '4' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '4')}>安全工具</span>
                    <span className={ this.state.currentAppType == '5' ? 'selectedType commonType' : 'commonType'} onClick={this.onChangeAppType.bind(this, '5')}>企业CRM</span>
                  </div>
                  <Card className='infoBox'>
                    {this.state.showType == 'list' ? [
                      <QueueAnim key='listBoxAnimate'>
                        <div className='listBox' key='listBox'>
                          {appShow}
                          { integrations.length == 0 ? [
                            <div className='appDetail'>
                              <div className='leftBox'>
                                <img src='/img/appstore/vmware.png' />
                              </div>
                              <div className='middleBox'>
                                <div className='appInfo'>
                                  <p>vSphere</p>
                                  <span>vSphere是VMware公司推出一套服务器虚拟化解决方案。</span>
                                  <br />
                                  <span>vSphere将应用程序和操作系统从底层分离出来，从而简化了IT操作，用户现有的应用程序可以看到专有资源，而服务器则可以作为资源池进行管理。</span>
                                </div>
                                <div className='envInfo'>
                                  <p><FormattedMessage {...menusText.envTitle} /></p>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'1'}
                                    </div>
                                    <span className='envName'>部署好的VSphere环境</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'2'}
                                    </div>
                                    <span className='envName'>VSphere访问URL</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                  <div className='envDetail'>
                                    <div className='numBox'>
                                      {'3'}
                                    </div>
                                    <span className='envName'>登录账号&密码</span>
                                    <div style={{ clear:'both' }}></div>
                                  </div>
                                </div>
                                <div style={{ clear:'both' }}></div>
                              </div>
                              <div className='rightBox'>
                                <Button className='unintsallBtn' key='unintsallBtn' size='large' type='primary'
                                  style={{ width: '102px' }}>
                                  <FormattedMessage {...menusText.uninstall} />
                                </Button>
                              </div>
                              <div style={{ clear:'both' }}></div>
                            </div>
                          ] : null }
                        </div>
                      </QueueAnim>
                    ] : null}
                    {this.state.showType == 'detail' ? [
                      <QueueAnim key='detailBoxAnimate'>
                        <div className='detailBox' key='detailBox'>
                          <IntegrationDetail scope={scope} integrationId={this.state.currentIntegration} />
                        </div>
                      </QueueAnim>
                    ] : null}
                  </Card>
                </div>
              </QueueAnim>
            ]
          }
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultAppList = {
    isFetching: false,
    integrations: []
  }
  const { getAllIntegration } = state.integration
  const {isFetching, integrations} = getAllIntegration || defaultAppList
  return {
    isFetching,
    integrations
  }
}

Integration.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getAllIntegration
})(injectIntl(Integration, {
  withRef: true,
}));

