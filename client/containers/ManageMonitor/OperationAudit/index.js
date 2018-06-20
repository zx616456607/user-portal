import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Select, Button, Table, DatePicker, Cascader, Pagination } from 'antd'
import { injectIntl } from 'react-intl'
import { getOperationLogList, getOperationalTarget } from '../../../../src/actions/manage_monitor'
import { formatDate } from '../../../../src/common/tools.js'
import '../style/manageMonitor.less'
import NotificationHandler from '../../../../src/components/Notification'

const Option = Select.Option
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
function transformOperationType(type) {
  switch (type) {
    case 0:
      return '未知'
    case 1:
      return '创建'
    case 2:
      return '请求'
    case 3:
      return '获取'
    case 4:
      return '更新'
    case 5:
      return '删除'
    case 6:
      return '开始'
    case 7:
      return '结束'
    case 8:
      return '重启'
    case 9:
      return '停止'
    case 10:
      return '继续'
    case 11:
      return '批量删除'
    case 12:
      return '批量启动'
    case 13:
      return '批量停止'
    case 14:
      return '批量重启'
    case 15:
      return '快速重启'
    case 16:
      return '检测存在'
    case 17:
      return '格式化'
    case 18:
      return '扩张'
    case 19:
      return '批量忽略'
    case 20:
      return '允许发邮件'
    case 21:
      return '禁止发邮件'
    case 22:
      return '创建或更新'
    case 23:
      return '切换'
    case 24:
      return '忽略'
    case 25:
      return '回滚'
    case 26:
      return '克隆'
    default:
      return '未知'
  }
}
function transformResourceType(type) {
  switch (type) {
    case 0:
      return '未知'
    case 1:
      return '实例'
    case 2:
      return '实例事件'
    case 3:
      return '实例日志'
    case 4:
      return '实例指标'
    case 5:
      return '实例容器指标'
    case 6:
      return '服务'
    case 7:
      return '服务实例'
    case 8:
      return '服务事件'
    case 9:
      return '服务日志'
    case 10:
      return 'k8s服务'
    case 11:
      return '服务滚动发布'
    case 12:
      return '服务手动伸缩'
    case 13:
      return '服务自动伸缩'
    case 14:
      return '更改服务配置'
    case 15:
      return '高可用设置'
    case 16:
      return '服务域名'
    case 17:
      return '应用'
    case 18:
      return '应用服务'
    case 19:
      return '应用操作日志'
    case 20:
      return '应用外部信息'
    case 21:
      return '应用拓扑'
    case 22:
      return '配置组'
    case 23:
      return '服务配置'
    case 24:
      return '主机'
    case 25:
      return '主机指标'
    case 26:
      return '第三方镜像仓库'
    case 27:
      return '存储'
    case 28:
      return '存储使用'
    case 29:
      return '成员'
    case 30:
      return '用户团队'
    case 31:
      return '用户空间'
    case 32:
      return '团队'
    case 33:
      return '团队成员'
    case 34:
      return '团队空间'
    case 35:
      return '集群'
    case 36:
      return '代码仓库'
    case 37:
      return '已激活代码库'
    case 38:
      return 'TenxFlow'
    case 39:
      return 'TenxFlow执行过程'
    case 40:
      return 'TenxFlow共享目录'
    case 41:
      return 'TenxFlow构建'
    case 42:
      return 'CI规则'
    case 43:
      return 'CD规则'
    case 44:
      return '云端Dockerfile'
    case 45:
      return 'CI构建'
    case 46:
      return 'CD部署镜像'
    case 47:
      return '镜像导出'
    case 48:
      return '告警通知组'
    case 49:
      return '告警记录'
    case 50:
      return '告警策略'
    case 51:
      return '告警规则'
    case 52:
      return '快照'
    case 53:
      return '标签'
    case 54:
      return '数据库缓存'
    case 55:
      return '项目'
    case 59:
      return '项目角色'
    case 60:
      return '应用包管理'
    case 61:
      return '应用商店'
    case 62:
      return '应用包发布审核'
    case 63:
      return '镜像'
    case 64:
      return '镜像商店'
    case 65:
      return '镜像发布审核'
    case 66:
      return '监控面板'
    case 67:
      return '监控图表'
    case 68:
      return '服务灰度发布'
    case 69:
      return '加密配置组'
    case 70:
      return '加密服务配置'
    case 71:
      return '分类管理'
    case 72:
      return '负载均衡'
    case 73:
      return '监听器'
    case 74:
      return '权限控制'
    case 75:
      return '应用模板'
    case 1000:
      return '基础镜像'
    default:
      return '未知'
  }
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
class OperationalAuditBkt extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [
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
          render: val => <span>{transformOperationType(val)}</span>,
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
              <div>类型：{transformResourceType(row.resourceType)}</div>
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
      ],
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
    })
  }
  // 选择操作类型
  selectOptionType = value => {
    this.setState({
      operation: parseInt(value),
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
      const hash = {}
      operationType = operationType.reduce(function(item, next) {
        hash[next.id] ? '' : hash[next.id] = true && item.push(next)
        return item
      }, [])
    }
    mapData(arr)
    return {
      operationType,
      operationObjects,
    }
  }
  render() {
    const { isFetching, filterData } = this.props

    const { operationType, operationObjects } = this.parseData(filterData)
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
                  operationType.map(v => <Option value={v.id} key={v.id}>{v.resourceName}</Option>)
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
                    <Option value={v.value} key={v.value}>{v.label}</Option>
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
              columns={this.state.columns}
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

OperationalAuditBkt.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getOperationLogList: PropTypes.func.isRequired,
}

const OperationalAuditBktCom = injectIntl(OperationalAuditBkt, {
  withRef: true,
})

export default connect(mapStateToProps, {
  getOperationLogList,
  getOperationalTarget,

})(OperationalAuditBktCom)
