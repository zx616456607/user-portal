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
import { Card, Select, Button, DatePicker, Input, Cascader, Spin } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
//import { getOperationLogList } from '../../actions/manage_monitor'
import './style/QueryLog.less'

const Option = Select.Option;

const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.QueryLog.headTitle',
    defaultMessage: '日志查询 | 时速云',
  },
  title: {
    id: 'ManageMonitor.QueryLog.title',
    defaultMessage: '日志查询',
  },
  time: {
    id: 'ManageMonitor.QueryLog.time',
    defaultMessage: '时间',
  },
  status: {
    id: 'ManageMonitor.QueryLog.status',
    defaultMessage: '状态',
  },
  during: {
    id: 'ManageMonitor.QueryLog.during',
    defaultMessage: '持续时间',
  },
  event: {
    id: 'ManageMonitor.QueryLog.event',
    defaultMessage: '任务事件',
  },
  obj: {
    id: 'ManageMonitor.QueryLog.obj',
    defaultMessage: '对象',
  },
  env: {
    id: 'ManageMonitor.QueryLog.env',
    defaultMessage: '环境',
  },
  cluster: {
    id: 'ManageMonitor.QueryLog.cluster',
    defaultMessage: '集群',
  },
  user: {
    id: 'ManageMonitor.QueryLog.user',
    defaultMessage: '发起者',
  },
  Create: {
    id: 'ManageMonitor.QueryLog.Create',
    defaultMessage: '添加',
  },
  Get: {
    id: 'ManageMonitor.QueryLog.Get',
    defaultMessage: '请求',
  },
  List: {
    id: 'ManageMonitor.QueryLog.List',
    defaultMessage: '获取',
  },
  Update: {
    id: 'ManageMonitor.QueryLog.Update',
    defaultMessage: '更新',
  },
  Delete: {
    id: 'ManageMonitor.QueryLog.Delete',
    defaultMessage: '删除',
  },
  Start: {
    id: 'ManageMonitor.QueryLog.Start',
    defaultMessage: '开始',
  },
  Stop: {
    id: 'ManageMonitor.QueryLog.Stop',
    defaultMessage: '结束',
  },
  Restart: {
    id: 'ManageMonitor.QueryLog.Restart',
    defaultMessage: '重启',
  },
  Pause: {
    id: 'ManageMonitor.QueryLog.Pause',
    defaultMessage: '停止',
  },
  Resume: {
    id: 'ManageMonitor.QueryLog.Resume',
    defaultMessage: '继续',
  },
  BatchDelete: {
    id: 'ManageMonitor.QueryLog.BatchDelete',
    defaultMessage: '批量删除',
  },  
  BatchStart: {
    id: 'ManageMonitor.QueryLog.BatchStart',
    defaultMessage: '批量开始',
  },
  BatchStop: {
    id: 'ManageMonitor.QueryLog.BatchStop',
    defaultMessage: '批量停止',
  },
  BatchRestart: {
    id: 'ManageMonitor.QueryLog.BatchRestart',
    defaultMessage: '批量重启',
  },
  QuickRestart: {
    id: 'ManageMonitor.QueryLog.QuickRestart',
    defaultMessage: '快速重启',
  },
  CheckExist: {
    id: 'ManageMonitor.QueryLog.CheckExist',
    defaultMessage: '检测存在',
  },
  Format: {
    id: 'ManageMonitor.QueryLog.Format',
    defaultMessage: '格式化',
  },
  Expand: {
    id: 'ManageMonitor.QueryLog.Expand',
    defaultMessage: '扩张',
  },
  Unknown: {
    id: 'ManageMonitor.QueryLog.Unknown',
    defaultMessage: '其它',
  },
  selectObject: {
    id: 'ManageMonitor.QueryLog.selectObject',
    defaultMessage: '选择操作对象',
  },
  selectEvent: {
    id: 'ManageMonitor.QueryLog.selectEvent',
    defaultMessage: '选择任务事件',
  },
  selectStatus: {
    id: 'ManageMonitor.QueryLog.selectEvent',
    defaultMessage: '选择状态',
  },
  Instance: {
    id: 'ManageMonitor.QueryLog.Instance',
    defaultMessage: '实例',
  },
  InstanceEvent: {
    id: 'ManageMonitor.QueryLog.InstanceEvent',
    defaultMessage: '实例事件',
  },
  InstanceLog: {
    id: 'ManageMonitor.QueryLog.InstanceLog',
    defaultMessage: '实例日志',
  },
  InstanceMetrics: {
    id: 'ManageMonitor.QueryLog.InstanceMetrics',
    defaultMessage: '实例指标',
  },
  InstanceContainerMetrics: {
    id: 'ManageMonitor.QueryLog.InstanceContainerMetrics',
    defaultMessage: '实例容器指标',
  },
  Service: {
    id: 'ManageMonitor.QueryLog.Service',
    defaultMessage: '服务',
  },
  ServiceInstance: {
    id: 'ManageMonitor.QueryLog.ServiceInstance',
    defaultMessage: '服务实例',
  },
  ServiceEvent: {
    id: 'ManageMonitor.QueryLog.ServiceEvent',
    defaultMessage: '服务事件',
  },
  ServiceLog: {
    id: 'ManageMonitor.QueryLog.ServiceLog',
    defaultMessage: '服务日志',
  },
  ServiceK8sService: {
    id: 'ManageMonitor.QueryLog.ServiceK8sService',
    defaultMessage: 'k8s服务',
  },
  ServiceRollingUpgrade: {
    id: 'ManageMonitor.QueryLog.ServiceRollingUpgrade',
    defaultMessage: '服务弹性伸缩',
  },
  ServiceManualScale: {
    id: 'ManageMonitor.QueryLog.ServiceManualScale',
    defaultMessage: '服务手动伸缩',
  },
});

class QueryLog extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  
  componentWillMount() {
    const { formatMessage } = this.props.intl;
    document.title = formatMessage(menusText.headTitle);
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
        </div>
      </div>
    </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultLogs = {
      isFetching: false,
      logs: []
  }
  const { operationAuditLog } = state.manageMonitor
  console.log(operationAuditLog)
  const { logs, isFetching } = operationAuditLog.logs || defaultLogs
  return {
      isFetching,
      logs
  }
}

QueryLog.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getOperationLogList: PropTypes.func.isRequired,
}

QueryLog = injectIntl(QueryLog, {
  withRef: true,
})

export default connect(mapStateToProps, {
  
})(QueryLog)