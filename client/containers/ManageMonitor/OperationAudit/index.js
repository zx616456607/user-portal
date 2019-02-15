import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Select, Button, Table, DatePicker, Row, Col, Cascader, Pagination, Tooltip } from 'antd'
import { ROLE_BASE_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants/index'
import { injectIntl } from 'react-intl'
import * as manageMonitorActions from '../../../../src/actions/manage_monitor'
import { ListProjects } from '../../../../src/actions/project'
import { formatDate } from '../../../../src/common/tools.js'
import Title from '../../../../src/components/Title'
import '../style/operationAudit.less'
import NotificationHandler from '../../../../src/components/Notification'

const RangePicker = DatePicker.RangePicker
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

// 转换对象及类型中的对象
const formatResourceName = (resourceName, resourceId) => {
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
          ids.push(item.strategyName)
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
    if (newBody.filePkgName) {
      return newBody.filePkgName
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
      // @Todo: resourceId is unused
      if (resourceId && resourceId.length === 0) {
        return '-'
      }
      return '-'
    }
    return resourceName
  }
}
// 转换对象及类型中的类型
const formatTypeName = (code, data) => {

  for (const v of data) {
    if (code === v.id) {
      return v.name
    }
    if (v.children) {
      for (const k of v.children) {
        if (code === k.id) {
          return k.name
        }
        if (k.children) {
          for (const j of k.children) {
            if (code === j.id) {
              return j.name
            }
          }
        }
      }
    }
  }
}
// 转换操作类型
const formatOperationType = (code, data) => {
  let types = []
  for (const v of data) {
    if (v.children) {
      for (const k of v.children) {
        if (k.operation) {
          types = types.concat(k.operation)
        }
        if (k.children) {
          for (const j of k.children) {
            if (j.operation) {
              types = types.concat(j.operation)
            }
          }
        }
      }
    }
  }
  const hash = {}
  types = types.reduce(function(item, next) {
    hash[next.id] ? '' : hash[next.id] = true && item.push(next)
    return item
  }, [])
  for (const v of types) {
    if (code === v.id) {
      return v.resourceName
    }
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
      currentProject: this.props.projectName || undefined,
      projectDisabled: false,
    }
  }
  componentDidMount() {
    const { namespace } = this.props
    this.setState({ namespace }, () => {
      this.getData()
      this.props.getOperationalTarget()
      this.loadProjectData()
    })
  }
  loadProjectData = () => {
    this.props.ListProjects({ size: 0 }, {
      success: {
        func: res => {
          const projectsList = res.data && res.data.projects || []
          this.setState({
            projectsList,
          })
        },
      },
    })
  }
  // 将各个操作对象对应的操作类型按照 id:operation的形式格式化
  selectOperation = list => {
    const operationList = []
    const select = arr => {
      for (const v of arr) {
        if (v.operation) {
          operationList.push({
            id: v.id,
            operation: v.operation,
          })
        }
        if (v.children) {
          select(v.children)
        }
      }
    }
    select(list)
    return operationList
  }
  // 选择操作对象
  selectOptionTarget = value => {
    const temp = {
      namespace: this.props.namespace,
      resource: value,
      operationType: [{ id: undefined, resourceName: '请选择操作对象' }],
      operation: undefined,
    }
    if (value.indexOf(10009) > -1 || value.indexOf(10010) > -1) {
      temp.namespace = ''
      temp.projectDisabled = true
      this.setState({
        namespace: '',
        currentProject: '',
      })
    } else if (this.state.projectDisabled === true) {
      temp.currentProject = this.props.projectName || undefined
      temp.projectDisabled = false
    } else {
      // temp.currentProject = undefined
      temp.projectDisabled = false
    }
    this.setState(temp, () => {
      const { filterData } = this.props
      if (value.length !== 0) {
        const id = value[value.length - 1]
        const selectOperationList = this.selectOperation(filterData)

        // 将选出来的操作对象id和格式好的operation(操作类型数组循环比较，若比较出来，将操作类型的数组值赋为比较出来的值)
        for (const v of selectOperationList) {
          if (id === v.id) {
            this.setState({
              operationType: v.operation,
            })
          }
        }
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
  onRangeChange = value => {
    this.setState({
      start_time: formatDate(value[0]),
      end_time: formatDate(value[1]),
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
      namespace: this.props.namespace,
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
    const { from, size, resource, // namespace,
      operation, start_time, end_time, status, currentProject } = this.state
    const body = {
      projectName: currentProject,
      from: from * size,
      size,
      resource: resource ? resource[resource.length - 1] : undefined,
      namespace: currentProject,
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
          this.setState({
            records: [],
          })
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
    // const operationObjects = []
    const { loginUser } = this.props
    const isDisabled = !(loginUser.role === ROLE_BASE_ADMIN || loginUser.role === ROLE_SYS_ADMIN)
    const dataFormat = data => {
      const list = data
      const mapData = item => {
        for (const v of item) {
          v.label = v.name
          v.value = v.id
          if (v.children) {
            mapData(v.children)
          }
          if (isDisabled && v.id === 10009 && v.name === '基础设施') {
            v.disabled = true
          }
          if (v.operation) {
            operationType = [ ...operationType, ...v.operation ]
          }
        }
      }
      mapData(list)
    }
    dataFormat(arr)
    // const formatOperationType = types => {
    //   const hash = {}
    //   types = types.reduce(function(item, next) {
    //     hash[next.id] ? '' : hash[next.id] = true && item.push(next)
    //     return item
    //   }, [])
    //   return types
    // }
    return {
      operationObjects: arr,
    }
  }

  renderProjectList = () => {
    const { projectsList } = this.state
    return (projectsList || []).map(project =>
      <Select.Option key={`${project.projectName}`} value={project.projectName}>{project.name}</Select.Option>)
  }
  onSelectNamespace = currentProject => {
    this.setState({
      currentProject,
    })
  }

  disabledStartDate = startValue => {
    const end_time = new Date(this.state.end_time)
    if (!startValue || !end_time || !this.state.end_time) {
      return false
    }
    return startValue.getTime() >= end_time.getTime()
  }

  disabledEndDate = endValue => {
    const start_time = new Date(this.state.start_time)
    if (!endValue || !start_time || !this.state.start_time) {
      return false
    }
    return endValue.getTime() <= start_time.getTime()
  }
  rangeDisabledDate = value => {
    // debugger
    return new Date(value.getTime()) > new Date()
    // () => {
    //   const date = new Date()
    //   return date.setDate(date.getDate() + 1)
    // }
  }
  render() {
    const { isFetching, filterData } = this.props
    const { currentProject, projectDisabled } = this.state
    const tableColumns = [
      {
        dataIndex: 'time',
        title: '时间',
        width: '10%',
        render: val => <span className="time">{formatDate(val)}</span>,
      },
      {
        dataIndex: 'duration',
        title: '持续时间',
        width: '10%',
        render: val => <span>{duringTimeFormat(val)}</span>,
      },
      {
        dataIndex: 'operationType',
        title: '操作类型',
        width: '10%',
        render: val => <span>{val === 0 ? '未知' : formatOperationType(val, filterData)}</span>,
      },
      {
        dataIndex: 'targetAndType',
        title: '对象及类型',
        width: '10%',
        render: (val, row) => {
          try {
            JSON.parse(row.resourceName)
            row.resourceName = formatResourceName(row.resourceName, row.operationType)
              || JSON.parse(row.resourceConfig).origin_id
          } catch (e) {
            if (row.resourceName === '') {
              try {
                const resourceConfig = JSON.parse(row.resourceConfig)
                const { pvcList } = resourceConfig
                if (pvcList && pvcList.length > 0) {
                  const names = []
                  pvcList.map(v => {
                    names.push(v.pvcName)
                    return null
                  })
                  row.resourceName = names.join(',')
                } else {
                  row.resourceName = '-'
                }
              } catch (e) {
                row.resourceName = '-'
              }
            }
          }
          return <div>
            <div>类型：{formatTypeName(row.resourceType, filterData)}</div>
            <Tooltip title={row.resourceName}>
              <div className="object">对象：{row.resourceName}</div>
            </Tooltip>
          </div>
        },

      },
      {
        dataIndex: 'namespace',
        title: '项目',
        width: '10%',
        render: val => <span>{ val ? val : '-' }</span>,
      },
      {
        dataIndex: 'clusterName',
        title: '集群名',
        width: '10%',
        render: val => <span>{ val ? val : '-' }</span>,
      },
      {
        dataIndex: 'status',
        title: '状态',
        width: '10%',
        render: (val, row) => <span className="status">{statusFormat(val, row.createTime)}</span>,
      },
      {
        dataIndex: 'operator',
        title: '发起者',
        width: '10%',
        render: val => <span className="user">
          <i className="fa fa-user-o" />
          <span className="commonSpan">{val}</span>
        </span>,
      },
    ]
    const { operationObjects } = this.parseData(filterData)
    return (
      <QueueAnim type="right">
        <div id="auditContainer" className="audit" key="auditWrapper">
          <Title title="操作审计" />
          <div className="optionBox">
            <Row type="flex" justify="space-between" gutter={4}>
              <Col span={16}>
                <div className="options">
                  <Cascader
                    options = {operationObjects}
                    className="selectionBox"
                    onChange={this.selectOptionTarget}
                    value={this.state.resource ? this.state.resource : ''}
                    placeholder="选择操作对象"
                    popupClassName= "resourceSelectPopup"
                    size="large"
                  />
                  <Select
                    optionFilterProp="children"
                    showSearch
                    getPopupContainer={() => document.getElementById('auditContainer')}
                    className="selectionBox"
                    style={{ width: '180px' }}
                    size={'large'}
                    value={currentProject}
                    onSelect={value => this.onSelectNamespace(value)}
                    disabled={projectDisabled}
                    placeholder="全局资源"
                  >
                    {this.renderProjectList()}
                  </Select>
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
                  <RangePicker
                    style={{ marginRight: 20, marginTop: 10, float: 'left' }}
                    size="large"
                    showTime
                    value={[ this.state.start_time, this.state.end_time ]}
                    format="yyyy-MM-dd HH:mm:ss"
                    onChange={this.onRangeChange}
                    disabledDate={this.rangeDisabledDate}
                  />
                  {/* <DatePicker
                    onChange={this.onChangeStartTime}
                    style={{ marginRight: 20, marginTop: 10, float: 'left' }}
                    showTime
                    format="yyyy-MM-dd HH:mm:ss"
                    size="large"
                    value={this.state.start_time}
                    disabledDate={this.disabledStartDate}
                  />
                  <DatePicker
                    onChange={this.onChangeEndTime}
                    style={{ marginRight: 20, marginTop: 10, float: 'left' }}
                    showTime
                    format="yyyy-MM-dd HH:mm:ss"
                    size="large"
                    value={this.state.end_time}
                    disabledDate={this.disabledEndDate}
                  /> */}
                  <Button className="btn" size="large" onClick={this.submitSearch} type="primary">
                    <i className="fa fa-wpforms"></i>
                    立即查询
                  </Button>
                  <Button type="ghost" size="large" className="btn" onClick={this.refresh}>
                    <i className="fa fa-refresh"/>刷 新
                  </Button>
                </div>
              </Col>
              <Col span={4}>
                <div className="pagination">
                  <Pagination
                    simple
                    pageSize={this.state.size}
                    current={this.state.from + 1}
                    total={this.state.count}
                    onChange={this.changePage}
                  />
                </div>
              </Col>
            </Row>
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
    isFetching: false,
    logs: [],
  }
  const { operationAuditLog, operationalTarget } = state.manageMonitor

  const { current, loginUser } = state.entities
  const { namespace, projectName } = current.space || { namespace: '' }
  let { logs, isFetching } = operationAuditLog.logs || defaultLogs
  if (operationAuditLog.logs && operationAuditLog.logs.logs) {
    logs = operationAuditLog.logs.logs
  }

  const filterData = operationalTarget.data || []
  return {
    isFetching,
    logs,
    namespace,
    projectName,
    loginUser: loginUser.info,
    filterData: filterData.filter(v => v.id !== 0), // 过来掉数据中的‘其他’
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
  getOperationLogList: manageMonitorActions.getOperationLogList,
  getOperationalTarget: manageMonitorActions.getOperationalTarget,
  ListProjects,
})(OperationalAuditCom)
export {
  formatResourceName,
  formatTypeName,
  formatOperationType,
}
