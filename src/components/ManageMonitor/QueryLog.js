/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Operation Audit list
 *
 * v2.0 - 2016-11-02
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Card, Select, Button, DatePicker, Input, Spin, Popover, Icon } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getQueryLogList } from '../../actions/manage_monitor'
import { loadServiceContainerList } from '../../actions/services'
import './style/QueryLog.less'

const Option = Select.Option;

let testData = [
  {
    name: 'gaojianAAA'
  }, {
    name: 'gaojianBBB'
  }, {
    name: 'gaojianCCC'
  }, {
    name: 'gaojianDDD'
  }, {
    name: 'gaojianEEE'
  }, {
    name: 'gaojianFFF'
  }, {
    name: 'gaojianGGG'
  }, {
    name: 'gaojianHHH'
  },
]

const testServiceData = [
  {
    name: 'rter'
  }, {
    name: 'webapp'
  },
]


const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.QueryLog.headTitle',
    defaultMessage: '日志查询 | 时速云',
  },
  title: {
    id: 'ManageMonitor.QueryLog.title',
    defaultMsessage: '日志查询',
  },
  user: {
    id: 'ManageMonitor.QueryLog.user',
    defaultMsessage: '用户',
  },
  selectUser: {
    id: 'ManageMonitor.QueryLog.selectUser',
    defaultMsessage: '选择用户',
  },
  cluster: {
    id: 'ManageMonitor.QueryLog.cluster',
    defaultMsessage: '集群',
  },
  selectCluster: {
    id: 'ManageMonitor.QueryLog.selectCluster',
    defaultMsessage: '选择集群',
  },
  service: {
    id: 'ManageMonitor.QueryLog.service',
    defaultMsessage: '服务',
  },
  selectService: {
    id: 'ManageMonitor.QueryLog.selectService',
    defaultMsessage: '选择服务',
  },
  instance: {
    id: 'ManageMonitor.QueryLog.instance',
    defaultMsessage: '实例',
  },
  selectInstance: {
    id: 'ManageMonitor.QueryLog.selectInstance',
    defaultMsessage: '选择实例',
  },
  startTime: {
    id: 'ManageMonitor.QueryLog.startTime',
    defaultMsessage: '开始',
  },
  endTime: {
    id: 'ManageMonitor.QueryLog.endTime',
    defaultMsessage: '结束',
  },
  keyword: {
    id: 'ManageMonitor.QueryLog.keyword',
    defaultMsessage: '关键词',
  },
  search: {
    id: 'ManageMonitor.QueryLog.search',
    defaultMsessage: '立即查询',
  },
});

let NamespaceModal = React.createClass({
  propTypes: {
    namespace: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {namespace} = this.props;
    this.setState({
      currentList: namespace
    });
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {namespace, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    scope.searchNamespace();
    namespace.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {scope} = this.props;
    let namespaceList = null;
    if (this.state.currentList.length == 0) {
      namespaceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      namespaceList = this.state.currentList.map((item, index) => {
        return (
          <div className='namespaceDetail' key={index} onClick={scope.onSelectNamespace.bind(scope, item.name)}>
            {item.name}
          </div>
        )
      });
    }
    return (
      <div className='namespaceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput namespaceInput' onChange={this.inputSearch} type='text' size='large' />
        </div>
        <div className='dataList'>
          {namespaceList}
        </div>
      </div>
    )
  }
});

let ClusterModal = React.createClass({
  propTypes: {
    cluster: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {cluster} = this.props;
    this.setState({
      currentList: cluster
    });
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {cluster, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    scope.searchCluster();
    cluster.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {scope} = this.props;
    let clusterList = null;
    if (this.state.currentList.length == 0) {
      clusterList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      clusterList = this.state.currentList.map((item, index) => {
        return (
          <div className='clusterDetail' key={index} onClick={scope.onSelectCluster.bind(scope, item.name)}>
            {item.name}
          </div>
        )
      });
    }
    return (
      <div className='clusterModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput clusterInput' onChange={this.inputSearch} type='text' size='large' />
        </div>
        <div className='dataList'>
          {clusterList}
        </div>
      </div>
    )
  }
});

let ServiceModal = React.createClass({
  propTypes: {
    service: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {service} = this.props;
    this.setState({
      currentList: service
    });
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {service, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    scope.searchService();
    service.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {service, scope} = this.props;
    let serviceList = null;
    if (this.state.currentList.length == 0) {
      serviceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      serviceList = this.state.currentList.map((item, index) => {
        return (
          <div className='serviceDetail' key={index} onClick={scope.onSelectService.bind(scope, item.name)}>
            {item.name}
          </div>
        )
      });
    }
    return (
      <div className='serviceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput serviceInput' onChange={this.inputSearch} type='text' size='large' />
        </div>
        <div className='dataList'>
          {serviceList}
        </div>
      </div>
    )
  }
});

let InstanceModal = React.createClass({
  propTypes: {
    instance: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {instance} = this.props;
    this.setState({
      currentList: instance
    });
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {instance, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    scope.searchInstance();
    instance.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {instance, scope} = this.props;
    let instanceList = null;
    if (!!instance[scope.state.currentService]) {
      if (instance[scope.state.currentService].containerList.length == 0) {
        instanceList = (
          <div className='loadingBox'>
            <span>没数据哦</span>
          </div>
        )
      } else {
        instanceList = instance[scope.state.currentService].containerList.map((item, index) => {
          return (
            <div className='instanceDetail' key={index} onClick={scope.onSelectInstance.bind(scope, item.metadata.name)}>
              {item.metadata.name}
            </div>
          )
        });
      }
      return (
        <div className='instanceModal'>
          <div className='searchBox'>
            <Input className='commonSearchInput instanceInput' onChange={this.inputSearch} type='text' size='large' />
          </div>
          <div className='dataList'>
            {instanceList}
          </div>
        </div>
      )
    } else {
      return (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    }
  }
});

class QueryLog extends Component {
  constructor(props) {
    super(props)
    this.getFirstNamespace = this.getFirstNamespace.bind(this);
    this.getFirstCluster = this.getFirstCluster.bind(this);
    this.getFirstService = this.getFirstService.bind(this);
    this.getFirstInstance = this.getFirstInstance.bind(this);
    this.searchNamespace = this.searchNamespace.bind(this);
    this.searchCluster = this.searchCluster.bind(this);
    this.searchService = this.searchService.bind(this);
    this.searchInstance = this.searchInstance.bind(this);
    this.onSelectNamespace = this.onSelectNamespace.bind(this);
    this.onSelectCluster = this.onSelectCluster.bind(this);
    this.onSelectService = this.onSelectService.bind(this);
    this.onSelectInstance = this.onSelectInstance.bind(this);
    this.hideUserPopup = this.hideUserPopup.bind(this);
    this.hideClusterPopup = this.hideClusterPopup.bind(this);
    this.hideServicePopup = this.hideServicePopup.bind(this);
    this.hideInstancePopup = this.hideInstancePopup.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.onChangeKeyword = this.onChangeKeyword.bind(this);
    this.onChangeBigLog = this.onChangeBigLog.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
    this.state = {
      namespacePopup: false,
      currentNamespace: null,
      namespaceList: null,
      clusterPopup: false,
      currentCluster: null,
      clusterList: null,
      servicePopup: false,
      currentService: null,
      serviceList: null,
      instancePopup: false,
      currentInstance: [],
      instanceList: null,
      start_time: null,
      end_time: null,
      key_word: null,
      searchKeyword: null,
      bigLog: false
    }
  }

  componentWillMount() {
    const { formatMessage } = this.props.intl;
    document.title = formatMessage(menusText.headTitle);
  }

  getFirstNamespace() {
    //this function for user get first 10-20 of namespace list
    console.log('getFirstNamespace')
  }

  getFirstCluster() {
    //this function for user get first 10-20 of cluster list
    console.log('getFirstCluster')
  }

  getFirstService() {
    //this function for user get first 10-20 of service list
    console.log('getFirstService')
  }

  getFirstInstance() {
    //this function for user get first 10-20 of instance list
    console.log('getFirstInstance')
  }

  searchNamespace() {
    //this function for user get search 10-20 of namespace list
    console.log('searchNamespace')
  }

  searchCluster() {
    //this function for user get search 10-20 of cluster list
    console.log('searchCluster')
  }

  searchService() {
    //this function for user get search 10-20 of service list
    console.log('searchService')
  }

  searchInstance() {
    //this function for user get search 10-20 of instance list
    console.log('searchInstance')
  }

  onSelectNamespace(name) {
    //this function for user get search 10-20 of namespace list
    if (name != this.state.currentNamespace) {
      this.setState({
        namespacePopup: false,
        currentNamespace: name,
        currentCluster: null,
        currentService: null,
        currentInstance: []
      });
      this.getFirstCluster()
    }
  }

  onSelectCluster(name) {
    //this function for user get search 10-20 of cluster list
    if (name != this.state.currentCluster) {
      this.setState({
        clusterPopup: false,
        currentCluster: name,
        currentService: null,
        currentInstance: []
      });
      this.getFirstService()
    }
  }

  onSelectService(name) {
    //this function for user get search 10-20 of service list
    if (name != this.state.currentService) {
      this.setState({
        currentService: name,
        servicePopup: false,
        currentInstance: []
      });
      const { cluster, loadServiceContainerList } = this.props;
      loadServiceContainerList(cluster, name);
    }
  }

  onSelectInstance(name) {
    //this function for user get search 10-20 of instance list
    let selectedFlag = false;
    let selectedIndex = -1;
    this.state.currentInstance.map((item, index) => {
      if (name == item) {
        selectedFlag = true;
        selectedIndex = index;
      }
    });
    if (selectedFlag) {
      let tempList = [];
      if (selectedIndex == 0) {
        tempList = this.state.currentInstance.slice(1);
      } else {
        tempList = this.state.currentInstance.slice(0, selectedIndex);
      }
      tempList.concat(this.state.currentInstance.slice(selectedIndex + 1));
      this.setState({
        currentInstance: tempList
      });
    } else {
      let tempList = this.state.currentInstance;
      tempList.push(name);
      this.setState({
        currentInstance: tempList
      });
    }
  }

  hideUserPopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      namespacePopup: e
    });
  }

  hideClusterPopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      clusterPopup: e
    })
  }

  hideServicePopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      servicePopup: e
    })
  }

  hideInstancePopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      instancePopup: e
    })
  }

  onChangeStartTime(e, str) {
    //this function for change the start time
    this.setState({
      start_time: str
    });
  }

  onChangeEndTime(e, str) {
    //this function for change the end time
    this.setState({
      end_time: str
    });
  }

  onChangeKeyword(e) {
    //this function for change the keyword
    this.setState({
      key_word: e.target.value
    });
  }

  submitSearch() {
    //this function for search the log
    const { cluster, getQueryLogList } = this.props;
    let body = {
      date_start: this.state.start_time,
      date_end: this.state.end_time,
      from: null,
      size: null,
      keyword: this.state.key_word
    }
    this.setState({
      searchKeyword: this.state.key_word
    });
    let instances = this.state.currentInstance.join(',');
    getQueryLogList(cluster, instances, body);
  }

  onChangeBigLog() {
    //this function for change the log box big or small
    this.setState({
      bigLog: !this.state.bigLog
    })
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className='QueryLogBox' type='right'>
        <div id='QueryLog' key='QueryLog'>
          <div className='bigTitle'>
            <span><FormattedMessage {...menusText.title} /></span>
          </div>
          <div className='operaBox'>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.user} /></span>
              <Popover
                content={<NamespaceModal scope={scope} namespace={testData} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideUserPopup}
                visible={this.state.namespacePopup}
                >
                <div className={this.state.namespacePopup ? 'cloneSelectInputClick cloneSelectInput' : 'cloneSelectInput'} >
                  <span className='selectedSpan'>{this.state.currentNamespace ? this.state.currentNamespace : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectUser} /></span>]}</span>
                  <Icon type='down' />
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.cluster} /></span>
              <Popover
                content={<ClusterModal scope={scope} cluster={testData} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideClusterPopup}
                visible={this.state.clusterPopup}
                >
                <div className={this.state.clusterPopup ? 'cloneSelectInputClick cloneSelectInput' : 'cloneSelectInput'} >
                  <span className='selectedSpan'>{this.state.currentCluster ? this.state.currentCluster : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectCluster} /></span>]}</span>
                  <Icon type='down' />
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.service} /></span>
              <Popover
                content={<ServiceModal scope={scope} service={testServiceData} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideServicePopup}
                visible={this.state.servicePopup}
                >
                <div className={this.state.servicePopup ? 'cloneSelectInputClick cloneSelectInput' : 'cloneSelectInput'} >
                  <span className='selectedSpan'>{this.state.currentService ? this.state.currentService : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectService} /></span>]}</span>
                  <Icon type='down' />
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.instance} /></span>
              <Popover
                content={<InstanceModal scope={scope} instance={this.props.containersList} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideInstancePopup}
                >
                <div className={this.state.instancePopup ? 'cloneSelectInputClick cloneSelectInput' : 'cloneSelectInput'} >
                  <span className='selectedSpan'>{this.state.currentInstance.length != 0 ? this.state.currentInstance.join(',') : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectInstance} /></span>]}</span>
                  <Icon type='down' />
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.startTime} /></span>
              <DatePicker onChange={this.onChangeStartTime} style={{ float: 'left', minWidth: '155px', width: 'calc(100% - 85px)' }} format='yyyy-MM-dd' size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.endTime} /></span>
              <DatePicker onChange={this.onChangeEndTime} style={{ float: 'left', minWidth: '155px', width: 'calc(100% - 85px)' }} format='yyyy-MM-dd' size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.keyword} /></span>
              <Input className='keywordInput' onChange={this.onChangeKeyword} style={{ float: 'left' }} size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <Button className='searchBtn' size='large' type='primary' onClick={this.submitSearch}>
                <i className='fa fa-wpforms'></i>
                <FormattedMessage {...menusText.search} />
              </Button>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className={this.state.bigLog ? 'logBox' : 'logBox'}>
            <div className='titleBox'>
              <span className='keywordSpan'>{this.state.searchKeyword ? '关键词' + this.state.searchKeyword + '结果查询页' : '结果查询页'}</span>
              <i className={this.state.bigLog ? 'fa fa-compress' : 'fa fa-expand'} onClick={this.onChangeBigLog} />
            </div>
            <div className='msgBox'>

            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultLogs = {
    cluster: cluster.clusterID,
    isFetching: false,
    logs: []
  }
  const defaultContainers = {
    containersList: {}
  }
  const { operationAuditLog } = state.manageMonitor
  const { serviceContainers } = state.services
  const { logs, isFetching } = operationAuditLog.logs || defaultLogs
  const containersList = serviceContainers[cluster.clusterID] || defaultContainers
  return {
    containersList,
    cluster: cluster.clusterID,
    isFetching,
    logs
  }
}

QueryLog.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
}

QueryLog = injectIntl(QueryLog, {
  withRef: true,
})

export default connect(mapStateToProps, {
  getQueryLogList,
  loadServiceContainerList
})(QueryLog)