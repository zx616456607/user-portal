import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Select, Button, Table, DatePicker, Cascader, Pagination } from 'antd'
import { injectIntl } from 'react-intl'
import { getOperationLogList, getOperationalTarget } from '../../../../src/actions/manage_monitor'
import { formatDate } from '../../../../src/common/tools.js'
import '../style/manageMonitor.less'
import NotificationHandler from '../../../../src/components/Notification'

const notification = new NotificationHandler()

// this function for format duringtime
function duringTimeFormat(time) {
  // const { formatMessage } = scope.props.intl
  time = time / 1000
  time = time.toFixed(0)
  if (time > 1000) {
    time = time / 1000
    time = time.toFixed(0)
    if (time > 1000) {
      time = time / 60
      time = time.toFixed(0)
      if (time > 60) {
        time = time / 60
        time = time.toFixed(0)
        // hour
        return (time + ' 小时')
      }
      // min
      return (time + ' 分钟')
    }
    // s
    return (time + ' 秒')
  }
  // ms
  return (time + ' 毫秒')
}
function statusFormat(status, createTime) {
  // this function for format status to show user
  const newDate = new Date(createTime)
  const nowDate = new Date()
  switch (status) {
    case 200:
      return (
        <span className="success">
          <i className="fa fa-check-circle-o" />
          完成
        </span>
      )
    case 0:
      if ((nowDate - newDate) > 300000) {
        return (
          <span className="fail">
            <i className="fa fa-times-circle-o" />
            未完成
          </span>
        )
      }
      return (
        <span className="running">
          <i className="fa fa-cog fa-spin fa-3x fa-fw" />
          运行中
        </span>
      )
    default:
      return (
        <span className="fail">
          <i className="fa fa-times-circle-o" />
          失败
        </span>
      )
  }
}
function formatResourceName(resourceName, resourceId) {
  // this function for format the resourceName
  if (resourceName.indexOf('{') > -1) {
    const newBody = JSON.parse(resourceName)
    // check services
    if (newBody.services) {
      let newName = newBody.services
      if (!Array.isArray(newName) || newName.length === 0) {
        return '-'
      }
      newName = newName.join(',')
      return newName
    }
    // check apps
    if (newBody.apps) {
      let newName = newBody.apps
      if (!Array.isArray(newName) || newName.length === 0) {
        return '-'
      }
      newName = newName.join(',')
      return newName
    }
    // check projects
    if (newBody.projects) {
      let newName = newBody.projects
      if (!Array.isArray(newName) || newName.length === 0) {
        return '-'
      }
      newName = newName.join(',')
      return newName
    }
    // check volumes
    if (newBody.volumes) {
      let newName = newBody.volumes
      if (newName.length === 0) {
        return '-'
      }
      newName = newName.join(',')
      return newName
    }
    // check cloneName
    if (newBody.cloneName) {
      return newBody.cloneName
    }
    // check classifyName
    if (newBody.classifies) {
      const classifyNameArray = newBody.classifies.map(item => {
        return item.classifyName
      })
      return classifyNameArray.join(',')
    }
    // check snapshotName
    if (!!newBody.snapshotName && !newBody.cloneName) {
      const snapshotName = newBody.snapshotName
      const snaps = []
      for (const snap in snapshotName) {
        snapshotName[snap].forEach(item => {
          snaps.push(item)
        })
      }
      return snaps.join(',')
    }
    if (newBody.users) {
      const newName = newBody.users
      if (newName.length === 0) {
        return '-'
      }
      const userNames = newName.forEach(item => {
        return item.userName
      })
      return userNames.join(',')
    }
    if (newBody.name) {
      return newBody.name
    }
    if (newBody.strategyName) {
      return newBody.strategyName
    }
    if (newBody.imagename) {
      return newBody.imagename
    }
    if (newBody.strategyIDs && Array.isArray(newBody.strategyIDs) &&
      newBody.strategyIDs.length > 0) {
      return newBody.strategyIDs.join(',')
    }
    if (newBody.strategies && Array.isArray(newBody.strategies) && newBody.strategies.length > 0) {
      const ids = []
      for (let i = 0; i < newBody.strategies.length; i++) {
        const item = newBody.strategies[i]
        if (item && item.strategyName) {
          ids.push(item.strategyName)
          break
        }
        if (item && item.strategyID) {
          ids.push(item.strategyID)
        }
      }
      return ids.join(',')
    }
    if (newBody.names) {
      return newBody.names[0]
    }
    if (newBody.filePkgNames) {
      return newBody.filePkgNames.toString()
    }
    if (newBody.ids && Array.isArray(newBody.ids) && newBody.ids.length > 0) {
      return newBody.ids.join(',')
    }
    if (newBody.fileName) {
      return newBody.fileName
    }
    if (newBody.fileNickName) {
      return newBody.fileNickName
    }
    if (newBody.imageTagName) {
      return newBody.imageTagName
    }
    // secret config
    if (newBody.key && newBody.value) {
      return newBody.key
    }
  } else {
    if (resourceName.length === 0) {
      if (resourceId.length === 0) {
        return '-'
      }
      return resourceId
    }
    return resourceName
  }
}
class OperationalAudit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

      statusList: [
        {
          value: '',
          label: '所有状态',
        },
        {
          value: 'running',
          label: '未完成',
        },
        {
          value: 'success',
          label: '成功',
        },
        {
          value: 'failed',
          label: '失败',
        },
      ],
      namespace: undefined,
      start_time: undefined,
      end_time: undefined,
      resource: undefined, // 操作对象
      operation: undefined, // 操作类型
      status: undefined, // 状态
      size: 15,
      from: 0,
      count: 0,
      records: [],
      operationType: [{ id: undefined, resourceName: '请选择操作对象' }],
      operationTypeArr: [],
    }
  }
  componentDidMount() {
    this.getData()
    this.props.getOperationalTarget()
  }

  // 选择操作对象
  selectOptionTarget = value => {
    this.setState({
      resource: value,
    }, () => {
      const { filterData } = this.props
      this.setState({
        operation: undefined,
      })

      if (value.length !== 0) {
        if (value.length === 1) {
          this.setState({
            operationType: [{ id: undefined, resourceName: '暂无可选' }],
          })
        }
        for (const v of filterData) {
          if (v.children) {
            for (const k of v.children) {
              if (value[value.length - 1] === k.id) {
                this.setState({
                  operationType: k.opetation ? k.opetation : [{ id: undefined, resourceName: '暂无可选' }],
                })
              }
            }
          }
        }
      } else {
        this.setState({
          operationType: [{ id: undefined, resourceName: '请选择操作对象' }],
          operation: undefined,
        })
      }

    })
  }
  // 选择操作类型
  selectOptionType = value => {
    this.setState({
      operation: value ? parseInt(value) : undefined,
    })
  }
  // 选择状态
  selectStatus = value => {
    this.setState({
      status: value,
    })
  }
  // 选择起始时间
  onChangeStartTime = time => {
    this.setState({
      start_time: formatDate(time),
    })
  }
  // 选择结束时间
  onChangeEndTime = time => {
    this.setState({
      end_time: formatDate(time),
    })
  }
  // 立即查询
  submitSearch = () => {
    this.getData()
  }
  // 刷新
  refresh = () => {
    this.setState({
      from: 0,
      namespace: undefined,
      start_time: undefined,
      end_time: undefined,
      resource: undefined,
      operation: undefined,
      status: undefined,
    }, () => this.getData())
  }
  // 请求数据
  getData = () => {
    const { getOperationLogList } = this.props
    const { from, size, resource, namespace, operation, start_time, end_time, status } = this.state
    const body = {
      from,
      size,
      resource: resource ? resource[resource.length - 1] : undefined,
      namespace,
      operation,
      start_time,
      end_time,
      status }
    const _this = this
    getOperationLogList(body, {
      success: {
        func: res => {
          _this.setState({
            count: res.logs.count,
            records: res.logs.records,
          })
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error('操作审计', '请求操作审计日志失败')
        },
      },
    })
  }
  // 翻页
  changePage = page => {
    this.setState({
      from: page - 1,
    }, () => {
      this.getData(this.state.from)
    })
  }
  parseData = arr => {
    let operationType = []
    const operationObjects = []
    const mapData = arr => {
      for (const v of arr) {
        const item = {
          label: v.name,
          value: v.id,
        }
        if (v.children) {
          const children = []
          for (const k of v.children) {
            const childItem = {
              label: k.name,
              value: k.id,
            }
            children.push(childItem)
          }
          item.children = children
        }

        if (v.opetation) {
          operationType = [ ...operationType, ...v.opetation ]
        }
        operationObjects.push(item)
      }
    }
    mapData(arr)
    return {
      operationType,
      operationObjects,
    }
  }
  filterOperationType = () => {
    const { filterData } = this.props
    let tempArr = []
    for (const v of filterData) {
      if (v.children) {
        for (const k of v.children) {
          if (k.opetation) {
            tempArr = tempArr.concat(k.opetation)
          }
        }
      }
    }
    const hash = {}
    tempArr = tempArr.reduce(function(item, next) {
      hash[next.id] ? '' : hash[next.id] = true && item.push(next)
      return item
    }, [])
    return tempArr
  }
  filterResourceName = code => {
    const { filterData } = this.props
    for (const v of filterData) {
      if (code === v.id) {
        return v.name
      }
      if (v.children) {
        for (const k of v.children) {
          if (code === k.id) {
            return v.name
          }
        }
      }
    }
  }
  render() {

    const { isFetching, filterData } = this.props
    const formatOperationType = code => {
      const types = this.filterOperationType()
      for (const v of types) {
        if (code === v.id) {
          return v.resourceName
        }
      }
    }

    const tableColumns = [
      {
        dataIndex: 'time',
        title: '时间',
        render: val => <span className="time">{formatDate(val)}</span>,
      },
      {
        dataIndex: 'duration',
        title: '持续时间',
        render: val => <span>{duringTimeFormat(val)}</span>,
      },
      {
        dataIndex: 'operationType',
        title: '操作类型',
        render: val => <span>{val === 0 ? '未知' : formatOperationType(val)}</span>,
      },
      {
        dataIndex: 'targetAndType',
        title: '对象及类型',
        render: (val, row) => {
          try {
            row.resourceName = formatResourceName(row.resourceName, row.resourceId)
          } catch (e) {
            // do nothing
          }
          return <div>
            <div>类型：{this.filterResourceName(row.resourceType)}</div>
            <div>对象：{row.resourceName}</div>
          </div>
        },
        width: 600,
      },
      {
        dataIndex: 'namespace',
        title: '项目',
      },
      {
        dataIndex: 'clusterName',
        title: '集群名',
        render: val => <span>{ val ? val : '-' }</span>,
      },
      {
        dataIndex: 'status',
        title: '状态',
        render: (val, row) => <span className="status">{statusFormat(val, row.createTime)}</span>,
      },
      {
        dataIndex: 'operator',
        title: '发起者',
        render: val => <span className="user">
          <i className="fa fa-user-o" />
          <span className="commonSpan">{val}</span>
        </span>,
      },
    ]
    const { operationObjects } = this.parseData(filterData)
    return (
      <QueueAnim type="right">
        <div className="audit" key="auditWrapper">
          <div className="optionBox">
            <div className="options">
              <Cascader
                options = {operationObjects}
                className="selectionBox"
                onChange={this.selectOptionTarget}
                value={this.state.resource ? this.state.resource : ''}
                placeholder="选择操作对象"
                size="large"
              />
              <Select
                placeholder="选择操作类型"
                className="selectionBox"
                value={this.state.operation}
                onChange={this.selectOptionType}
                size="large"
              >
                {
                  this.state.operationType.map(v =>
                    <Select.Option value={v.id} key={v.id ? v.id : 'key'}>{v.resourceName}</Select.Option>)
                }
              </Select>
              <Select
                placeholder="选择状态"
                className="selectionBox"
                value={this.state.status}
                size="large"
                onChange={this.selectStatus}
              >
                {
                  this.state.statusList.map(v => (
                    <Select.Option value={v.value} key={v.value}>{v.label}</Select.Option>
                  ))
                }
              </Select>
              <DatePicker
                onChange={this.onChangeStartTime}
                style={{ marginRight: 20, marginTop: 10, float: 'left' }}
                showTime
                format="yyyy-MM-dd HH:mm:ss"
                size="large"
                value={this.state.start_time}
              />
              <DatePicker
                onChange={this.onChangeEndTime}
                style={{ marginRight: 20, marginTop: 10, float: 'left' }}
                showTime
                format="yyyy-MM-dd HH:mm:ss"
                size="large"
                value={this.state.end_time}
              />
              <Button className="btn" size="large" onClick={this.submitSearch} type="primary">
                <i className="fa fa-wpforms"></i>
                立即查询
              </Button>
              <Button type="ghost" size="large" className="btn" onClick={this.refresh}>
                <i className="fa fa-refresh"/>刷 新
              </Button>
            </div>
            <div className="pagination">
              <Pagination
                simple
                current={this.state.from + 1}
                total={this.state.count}
                onChange={this.changePage}
              />
            </div>
          </div>
          <div className="dataTable">
            <Table
              columns={tableColumns}
              loading={isFetching}
              dataSource={this.state.records}
              pagination={false}
            />
          </div>
        </div>

      </QueueAnim>
    )
  }
}
function mapStateToProps(state) {
  const defaultLogs = {
    isFetching: true,
    logs: [],
  }
  const { operationAuditLog, operationalTarget } = state.manageMonitor

  const { current } = state.entities
  const { namespace } = current.space || { namespace: '' }
  let { logs, isFetching } = defaultLogs
  if (operationAuditLog.logs && operationAuditLog.logs.logs) {
    logs = operationAuditLog.logs.logs
    isFetching = operationAuditLog.logs.isFetching
  }

  const filterData = operationalTarget.data || []

  return {
    isFetching,
    logs,
    namespace,
    filterData,
  }
}

OperationalAudit.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getOperationLogList: PropTypes.func.isRequired,
}

const OperationalAuditCom = injectIntl(OperationalAudit, {
  withRef: true,
})

export default connect(mapStateToProps, {
  getOperationLogList,
  getOperationalTarget,

})(OperationalAuditCom)
