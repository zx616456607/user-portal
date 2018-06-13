import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Card, Select, Button, Table, DatePicker, Input, Cascader, Spin, Tooltip, Pagination } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getOperationLogList } from '../../actions/manage_monitor'
import { formatDate } from '../../common/tools.js'
import './style/OperationalAudit.less'
import Title from '../Title'
import NotificationHandler from '../../components/Notification'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
const Option = Select.Option;

// 持续时间
function duringTimeFormat(time, scope) {
  //this function for format duringtime
  const { formatMessage } = scope.props.intl;
  time = time / 1000;
  time = time.toFixed(0);
  if (time > 1000) {
    time = time / 1000;
    time = time.toFixed(0);
    if (time > 1000) {
      time = time / 60;
      time = time.toFixed(0);
      if (time > 60) {
        time = time / 60;
        time = time.toFixed(0);
        //hour
        return (time + ' ' + formatMessage(menusText.hour))
      } else {
        //min
        return (time + ' ' + formatMessage(menusText.minute))
      }
    } else {
      //s
      return (time + ' ' + formatMessage(menusText.second))
    }
  } else {
    //ms
    return (time + ' ' + formatMessage(menusText.millisecond))
  }
}
let standardFlag = (mode == standard ? true : false);
class OperationalAuditBkt extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [
        {
          dataIndex: 'time',
          title: '时间',
          render: val => <span>{formatDate(val)}</span>
        },
        {
          dataIndex: 'duration',
          title: '持续时间',
          render: val => <span>{duringTimeFormat(val)}</span>
        },
        {
          dataIndex: 'clusterName',
          title: '集群名'
        },
      ]
    }
  }
  componentWillMount() {
    const { getOperationLogList } = this.props;
    const { formatMessage } = this.props.intl;
    const _this = this;

    let body = {
      from: 0,
      size: 15,
      namespace: null,
      operation: null,
      resource: null,
      start_time: null,
      end_time: null
    }
    let notification = new NotificationHandler()
    getOperationLogList(body, {
      success: {
        func: (res) => {
          _this.setState({
            totalNum: res.count
          });
        }
      },
      failed: {
        func: (error) => {
          notification.error('操作审计', '请求操作审计日志失败');
        }
      }
    })
  }

  render() {

    const { isFetching, logs } = this.props
    const { count, records } = logs
    console.log(count, records);
    return <div className="audit">
      {/*<Table*/}
        {/*loading={isFetching}*/}
        {/*dataSource={records}*/}
      {/*/>*/}
    </div>
  }
}
function mapStateToProps(state) {
  const defaultLogs = {
    isFetching: true,
    logs: []
  }
  const { operationAuditLog } = state.manageMonitor
  const { current } = state.entities
  const { namespace } = current.space || { namespace: ''}
  let { logs, isFetching } = defaultLogs

  if (operationAuditLog.logs && operationAuditLog.logs.logs) {
    logs = operationAuditLog.logs.logs
    isFetching = operationAuditLog.logs.isFetching
  }

  return {
    isFetching,
    logs,
    namespace
  }
}

OperationalAuditBkt.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getOperationLogList: PropTypes.func.isRequired,
}

OperationalAuditBkt = injectIntl(OperationalAuditBkt, {
  withRef: true,
})

export default connect(mapStateToProps, {
  getOperationLogList
})(OperationalAuditBkt)
