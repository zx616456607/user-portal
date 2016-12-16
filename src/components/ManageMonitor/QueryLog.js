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
import { Card, Select, Button, DatePicker, Input, Spin, Popover, Icon, Checkbox } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getQueryLogList } from '../../actions/manage_monitor'
import { loadServiceContainerList } from '../../actions/services'
import { loadUserTeamspaceList } from '../../actions/user'
import { getClusterOfQueryLog, getServiceOfQueryLog } from '../../actions/manage_monitor'
import './style/QueryLog.less'
import { formatDate } from '../../common/tools'

const Option = Select.Option;

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
    defaultMsessage: '空间',
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
  noNamespace: {
    id: 'ManageMonitor.QueryLog.noNamespace',
    defaultMsessage: '请选择空间',
  },
  noCluster: {
    id: 'ManageMonitor.QueryLog.noCluster',
    defaultMsessage: '请选择集群',
  },
  noService: {
    id: 'ManageMonitor.QueryLog.noService',
    defaultMsessage: '请选择服务',
  },
  noInstance: {
    id: 'ManageMonitor.QueryLog.noInstance',
    defaultMsessage: '请选择实例',
  },
  searchType: {
    id: 'ManageMonitor.QueryLog.searchType',
    defaultMsessage: '模糊查询',
  },
  allBtn: {
    id: 'ManageMonitor.QueryLog.allBtn',
    defaultMsessage: '全选',
  },
  cancelBtn: {
    id: 'ManageMonitor.QueryLog.cancelBtn',
    defaultMsessage: '取消',
  },
});

function checkClass(popup, isError) {
  if (isError) {
    return 'cloneSelectError cloneSelectInput';
  } else if (popup) {
    return 'cloneSelectInputClick cloneSelectInput';
  } else {
    return 'cloneSelectInput';
  }
}

function keywordFormat(log, scope) {
  let str = scope.state.key_word;
  let reg = new RegExp(str, "gi");
  log = log.replace(reg, "<font style='color:rgb(255, 255, 0)'>" + str + "</font>");
  return log;
}

function timeFormat(time) {
  let newDate = new Date();
  time = parseInt(time);
  let newTime = newDate.setTime(time / 1000000);
  return formatDate(newTime);
}

function instanceSelected(config, instance) {
  //this function for view to user which instance is selected
  let selectedFlag = false;
  config.map((item) => {
    if (item == instance) {
      selectedFlag = true;
    }
  })
  if (selectedFlag) {
    return 'instanceSelected instanceDetail';
  } else {
    return 'instanceDetail';
  }
}

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
    namespace.map((item) => {
      if (item.spaceName.indexOf(value) > -1) {
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
          <div className='namespaceDetail' key={index} onClick={scope.onSelectNamespace.bind(scope, item.spaceName, item.teamID)}>
            {item.spaceName}
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
          <div className='namespaceDetail' key='defaultNamespace' onClick={scope.onSelectNamespace.bind(scope, '我的空间', 'default')}>
            <span>我的空间</span>
          </div>
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
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.cluster
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {cluster, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    cluster.map((item) => {
      if (item.clusterName.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {scope, isFetching, cluster} = this.props;
    let clusterList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (this.state.currentList.length == 0) {
      clusterList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      clusterList = this.state.currentList.map((item, index) => {
        return (
          <div className='clusterDetail' key={index} onClick={scope.onSelectCluster.bind(scope, item.clusterName, item.clusterID)}>
            <span className='leftSpan'>{item.clusterName}</span>
            <span className='rightSpan'>{item.instanceNum}</span>
            <span style={{ clear: 'both' }}></span>
          </div>
        )
      });
    }
    return (
      <div className='clusterModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput clusterInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='titleBox'>
            <span className='leftSpan'>名称</span>
            <span className='rightSpan'>实例</span>
            <span style={{ clear: 'both' }}></span>
          </div>
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
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.service
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {service, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    service.map((item) => {
      if (item.serviceName.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {service, scope, isFetching} = this.props;
    let serviceList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (this.state.currentList.length == 0) {
      serviceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      serviceList = this.state.currentList.map((item, index) => {
        return (
          <div className='serviceDetail' key={index} onClick={scope.onSelectService.bind(scope, item.serviceName)}>
            <span className='leftSpan'>{item.serviceName}</span>
            <span className='rightSpan'>{item.instanceNum}</span>
            <span style={{ clear: 'both' }}></span>
          </div>
        )
      });
    }
    return (
      <div className='serviceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput serviceInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='titleBox'>
            <span className='leftSpan'>名称</span>
            <span className='rightSpan'>实例</span>
            <span style={{ clear: 'both' }}></span>
          </div>
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
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.instance
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {instance, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    instance.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  onSelectAllInstances() {
    //this function for user select all instance
    const { scope } = this.props;
    const { currentList } = this.state;
    let tempList = currentList.map((item) => {
      return item.metadata.name;
    })
    scope.setState({
      currentInstance: tempList,
      instancePopup: false
    });
  },
  onCancelSelectedAllInstance() {
    //this function for user cancel select all instance
    const { scope } = this.props;
    scope.setState({
      currentInstance: [],
      instancePopup: false
    });
  },
  render: function () {
    const {scope, isFetching} = this.props;
    const {currentList} = this.state;
    let instanceList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (currentList.length == 0) {
      instanceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      instanceList = currentList.map((item, index) => {
        return (
          <div className={instanceSelected(scope.state.currentInstance, item.metadata.name)} key={index} onClick={scope.onSelectInstance.bind(scope, item.metadata.name)}>
            {item.metadata.name}
          </div>
        )
      });
    }
    return (
      <div className='instanceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput instanceInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='btnBox'>
            <div className='allBtn' onClick={this.onSelectAllInstances}>
              <FormattedMessage {...menusText.allBtn} />
            </div>
            <div className='cancelBtn' onClick={this.onCancelSelectedAllInstance}>
              <FormattedMessage {...menusText.cancelBtn} />
            </div>
          </div>
        </div>
        <div className='dataList'>
          {instanceList}
        </div>
      </div>
    )
  }
});

let LogComponent = React.createClass({
  render: function () {
    const { logs, isFetching, scope } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!logs || logs.length == 0) {
      return (
        <div className='loadingBox'>
          <span className='noDataSpan'>暂无日志记录</span>
        </div>
      )
    }
    let logItems = logs.map((item, index) => {
      return (
        <div className='logDetail' key={'logDetail' + index}>
          <span className='instanceSpan'>{'[' + item.name + ']'}</span>
          <span className='instanceSpan'>{timeFormat(item.timeNano)}</span>
          <span className='logSpan'>
            <span dangerouslySetInnerHTML={{ __html: keywordFormat(item.log, scope) }}></span>
          </span>
        </div>
      )
    })
    return (
      <div className='logList'>
        <pre>
          {logItems}
        </pre>
      </div>
    )
  }
});

class QueryLog extends Component {
  constructor(props) {
    super(props)
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
    this.onChangeQueryType = this.onChangeQueryType.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
    this.state = {
      namespacePopup: false,
      currentNamespace: null,
      namespaceList: null,
      clusterPopup: false,
      currentCluster: null,
      currentClusterId: props.cluster,
      clusterList: [],
      servicePopup: false,
      currentService: null,
      serviceList: [],
      instancePopup: false,
      currentInstance: [],
      instanceList: [],
      gettingNamespace: true,
      gettingCluster: false,
      gettingSerivce: false,
      gettingInstance: false,
      selectedNamespace: false,
      selectedCluster: false,
      selectedSerivce: false,
      selectedInstance: false,
      start_time: null,
      end_time: null,
      key_word: null,
      searchKeyword: null,
      bigLog: false,
      queryType: true
    }
  }

  componentWillMount() {
    const { formatMessage } = this.props.intl;
    document.title = formatMessage(menusText.headTitle);
    const { loadUserTeamspaceList, current, query } = this.props;
    const _this = this;
    loadUserTeamspaceList('default', { size: 100 }, {
      success: {
        func: (res) => {
          _this.setState({
            namespaceList: res.teamspaces,
            gettingNamespace: false
          })
        },
        isAsync: true
      }
    });
    const { space, cluster } = current;
    const { spaceName, teamID } = space;
    this.onSelectNamespace(spaceName, teamID);
    const { clusterName, clusterID } = cluster;
    this.onSelectCluster(clusterName, clusterID);
    const { service, instance } = query;
    if (service && instance) {
      this.setState({
        currentNamespace: spaceName,
        currentCluster: clusterName,
        currentClusterId: clusterID,
        currentService: service,
      });
      this.onSelectService(service);
      this.onSelectInstance(instance);
      setTimeout(this.submitSearch);
    }
  }

  onSelectNamespace(name, teamId) {
    //this function for user get search 10-20 of namespace list
    const { getClusterOfQueryLog } = this.props;
    const _this = this;
    if (name != this.state.currentNamespace) {
      this.setState({
        gettingCluster: true,
        namespacePopup: false,
        currentNamespace: name,
        currentCluster: null,
        currentService: null,
        currentInstance: [],
        clusterList: [],
        serviceList: [],
        instanceList: [],
        selectedNamespace: false,
      });
      getClusterOfQueryLog(teamId, {
        success: {
          func: (res) => {
            _this.setState({
              clusterList: res.data,
              gettingCluster: false
            });
          },
          isAsync: true
        }
      });
    }
  }

  onSelectCluster(name, clusterId) {
    //this function for user get search 10-20 of service list
    const { getServiceOfQueryLog } = this.props;
    const _this = this;
    if (name != this.state.currentCluster) {
      this.setState({
        gettingSerivce: true,
        clusterPopup: false,
        currentCluster: name,
        currentClusterId: clusterId,
        currentService: null,
        currentInstance: [],
        serviceList: [],
        instanceList: [],
        selectedCluster: false,
      });
      getServiceOfQueryLog(clusterId, {
        success: {
          func: (res) => {
            _this.setState({
              serviceList: res.data,
              gettingSerivce: false
            });
          },
          isAsync: true
        }
      });
    }
  }

  onSelectService(name) {
    //this function for user get search 10-20 of service list
    const _this = this;
    if (name != this.state.currentService) {
      this.setState({
        gettingInstance: true,
        currentService: name,
        servicePopup: false,
        currentInstance: [],
        instanceList: [],
        selectedSerivce: false,
      });
      const { loadServiceContainerList } = this.props;
      loadServiceContainerList(this.state.currentClusterId, name, {
        success: {
          func: (res) => {
            _this.setState({
              gettingInstance: false,
              instanceList: res.data
            })
          },
          isAsync: true
        }
      });
    }
  }

  onSelectInstance(name) {
    //this function for user get search 10-20 of instance list
    let selectedFlag = false;
    let selectedIndex = -1;
    this.setState({
      selectedInstance: false,
    })
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

  onChangeQueryType(e) {
    this.setState({
      queryType: e.target.checked
    })
  }

  submitSearch() {
    //this function for search the log
    //check user had selected all item
    let checkFlag = true;
    if (!Boolean(this.state.currentNamespace)) {
      this.setState({
        selectedNamespace: true
      });
      checkFlag = false;
    }
    if (!Boolean(this.state.currentCluster)) {
      this.setState({
        selectedCluster: true
      });
      checkFlag = false;
    }
    if (!Boolean(this.state.currentService)) {
      this.setState({
        selectedSerivce: true
      });
      checkFlag = false;
    }
    if (this.state.currentInstance.length == 0) {
      this.setState({
        selectedInstance: true
      });
      checkFlag = false;
    }
    if (!checkFlag) {
      return;
    }
    const { getQueryLogList } = this.props;
    let key_word = this.state.key_word;
    if (this.state.queryType) {
      if (key_word && key_word.length > 0) {
        key_word = '*' + this.state.key_word + '*';
      }
    }
    let body = {
      date_start: this.state.start_time,
      date_end: this.state.end_time,
      from: null,
      size: null,
      keyword: key_word
    }
    this.setState({
      searchKeyword: this.state.key_word
    });
    let instances = this.state.currentInstance.join(',');
    getQueryLogList(this.state.currentClusterId, instances, body);
  }

  onChangeBigLog() {
    //this function for change the log box big or small
    this.setState({
      bigLog: !this.state.bigLog
    })
  }

  render() {
    const {logs, isFetching} = this.props;
    const { formatMessage } = this.props.intl;
    const scope = this;
    if (this.state.gettingNamespace) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
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
                content={<NamespaceModal scope={scope} namespace={this.state.namespaceList} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideUserPopup}
                visible={this.state.namespacePopup}
                >
                <div className={checkClass(this.state.namespacePopup, this.state.selectedNamespace)} >
                  <span className='selectedSpan'>{this.state.currentNamespace ? this.state.currentNamespace : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectUser} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noNamespace} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.cluster} /></span>
              <Popover
                content={<ClusterModal scope={scope} cluster={this.state.clusterList} isFetching={this.state.gettingCluster} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideClusterPopup}
                visible={this.state.clusterPopup}
                >
                <div className={checkClass(this.state.clusterPopup, this.state.selectedCluster)} >
                  <span className='selectedSpan'>{this.state.currentCluster ? this.state.currentCluster : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectCluster} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noCluster} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.service} /></span>
              <Popover
                content={<ServiceModal scope={scope} service={this.state.serviceList} isFetching={this.state.gettingSerivce} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideServicePopup}
                visible={this.state.servicePopup}
                >
                <div className={checkClass(this.state.servicePopup, this.state.selectedSerivce)} >
                  <span className='selectedSpan'>{this.state.currentService ? this.state.currentService : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectService} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noService} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.instance} /></span>
              <Popover
                content={<InstanceModal scope={scope} instance={this.state.instanceList} isFetching={this.state.gettingInstance} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideInstancePopup}
                visible={this.state.instancePopup}
                >
                <div className={checkClass(this.state.instancePopup, this.state.selectedInstance)} >
                  <span className='selectedSpan'>{this.state.currentInstance.length != 0 ? this.state.currentInstance.join(',') : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectInstance} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noInstance} /></span>
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
              <Checkbox onChange={this.onChangeQueryType} checked={this.state.queryType} style={{ marginLeft: '29px' }}>
                <FormattedMessage {...menusText.searchType} /></Checkbox>
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
              <LogComponent logs={logs} isFetching={isFetching} scope={scope} />
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { cluster } = current
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  const defaultLogs = {
    cluster: cluster.clusterID,
    isFetching: false,
    logs: []
  }
  const defaultContainers = {
    containersList: {}
  }
  const { getQueryLog } = state.manageMonitor
  const { serviceContainers } = state.services
  const { logs, isFetching } = getQueryLog.logs || defaultLogs
  const containersList = serviceContainers[cluster.clusterID] || defaultContainers
  const { query } = props.location
  return {
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    cluster: cluster.clusterID,
    containersList,
    isFetching,
    logs,
    current,
    query,
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
  loadServiceContainerList,
  loadUserTeamspaceList,
  getClusterOfQueryLog,
  getServiceOfQueryLog
})(QueryLog)