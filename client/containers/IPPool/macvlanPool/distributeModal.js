/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * Network Solutions component
 *
 * v0.1 - 2019-2-14
 * @author lvjunfeng
 */
import React from 'react'
import { connect } from 'react-redux'
import { Table, Modal, Pagination, Button, Row, Col, Form, Select, Input, Icon, Tooltip } from 'antd'
import SearchInput from '../../../components/SearchInput'
import * as IPPoolActions from '../../../actions/ipPool'
import * as clusterActions from '../../../../src/actions/cluster'
import './style/distributeModal.less'
import Notification from '../../../../src/components/Notification'
import { ip4ToInt, checkIPInRange } from '../../../../kubernetes/ip'
import { serviceNameCheck } from '../../../../src/common/naming_validation'
import { IP_REGEX } from '../../../../constants'
import ipRangeCheck from 'ip-range-check'

const FormItem = Form.Item
const Option = Select.Option
const notification = new Notification()

class DistributeModal extends React.Component {

  state = {
    searchVal: undefined,
    addItem: false,
    projects: [],
    deleteVisible: false,
    delTarget: '',
    currentPage: 1,
    defaultVisible: false,
    targetAssign: undefined,
  }

  componentDidMount = () => {
    this.loadData()
    this.getProjects()
  }

  getProjects = async () => {
    const { getProjectByClustr, cluster } = this.props
    const res = await getProjectByClustr(cluster)
    this.setState({
      projects: res.response.result.data,
    })
  }

  loadData = () => {
    const { getIPAssignment, cluster, currentPool } = this.props
    const { currentPage } = this.state
    const query = {
      pool: currentPool.metadata.name,
    }
    getIPAssignment(cluster, query, {
      failed: {
        func: error => {
          const { statusCode } = error
          if (statusCode !== 401) {
            notification.warn('获取项目分配信息失败')
          }
        },
      },
    })
    currentPage !== 1 && this.handlePager(1)
  }

  saveInfo = () => {
    const {
      form: { validateFields, resetFields },
      currentPool: { metadata }, cluster,
      createProjectPool,
    } = this.props
    validateFields((err, values) => {
      if (err) return
      const { name, namespace, begin, end } = values
      const reqBody = {
        metadata: {
          name,
          annotations: {
            displayName: '',
          },
        },
        spec: {
          default: false,
          begin,
          end,
          type: 'Project',
          pool: metadata.name,
          project: {
            namespace,
          },
        },
      }
      createProjectPool(cluster, reqBody, {
        success: {
          func: () => {
            notification.success('创建项目地址池成功')
            this.loadData()
            this.toggleAddStatus()
            resetFields()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            const { statusCode } = error
            if (statusCode === 400 && error.message.message === 'ip range collision') {
              const { field, message } = error.message.details.causes[0]
              return notification.warn(
                '创建项目地址池失败',
                `和地址池 ${message} 在网段 ${field} 部分冲突，请重新填写`
              )
            }
            if (statusCode === 409 && error.message.message.indexOf('already exists') > -1) {
              const existsName = error.message.details.name
              return notification.warn(`项目地址池 ${existsName} 已存在`, '请填写其他可用名称')
            }
            if (statusCode !== 401) {
              notification.warn('创建项目地址池失败')
            }
          },
        },
      })
    })
  }

  toggleAddStatus = () => {
    this.setState({
      addItem: !this.state.addItem,
    })
  }

  delProjectPool = row => {
    this.setState({
      deleteVisible: !this.state.deleteVisible,
      delTarget: row || '',
    })
  }

  confirmDelete = () => {
    const { deleteProjectPool, cluster } = this.props
    const { delTarget } = this.state
    notification.spin('删除中...')
    deleteProjectPool(cluster, delTarget.metadata.name, {
      success: {
        func: () => {
          this.loadData()
          this.delProjectPool()
          notification.close()
          notification.success('删除项目地址池成功')
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode, message } = err
          if (statusCode === 400 && message.message === 'ip assignment in using') {
            notification.close()
            return notification.warn('删除项目地址池失败', '该项目地址池正在使用中，不可删除')
          }
          if (statusCode !== 401) {
            notification.close()
            notification.warn('删除项目地址池失败')
          }
        },
      },
    })
  }

  confirmChangeDefault = () => {
    const { updateDefaultAssignment, cluster } = this.props
    const { targetAssign } = this.state
    const name = targetAssign.metadata.name
    let query = {}
    const isDefault = targetAssign.spec.default
    if (isDefault) {
      query = { unset: true }
    }
    updateDefaultAssignment(cluster, name, query, {
      success: {
        func: () => {
          this.loadData()
          notification.close()
          notification.success(`${isDefault ? '取消默认项目地址池成功' : '设置默认项目地址池成功'}`)
          this.changeDefaultVisible()
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.close()
          notification.warn(`${isDefault ? '取消默认项目地址池成功' : '设置默认项目地址池成功'}`)
        },
      },
    })
  }

  dealIpNum = record => {
    const begin = ip4ToInt(record.spec.begin)
    const end = ip4ToInt(record.spec.end)
    return end - begin + 1
  }

  checkName = (rule, value, callback) => {
    if (!value) return callback()
    const msg = serviceNameCheck(value, '名称')
    if (msg !== 'success') {
      return callback(msg)
    }
    const { listData } = this.props
    listData.forEach(item => {
      if (item.metadata.name === value) {
        return callback('地址池名称已存在')
      }
    })
    callback()
  }

  checkIpBegin = (rule, value, callback) => {
    if (!value) return callback()
    if (!IP_REGEX.test(value)) {
      return callback('请填写格式正确的 IP')
    }
    const { currentPool, listData, form: { getFieldValue } } = this.props
    const cidr = currentPool.spec.cidr
    if (!ipRangeCheck(value, cidr)) {
      return callback(`请填写属于 ${cidr} 网段的 IP`)
    }
    listData.forEach(el => {
      const isOccupy = checkIPInRange(value, el.spec.begin, el.spec.end)
      if (isOccupy) {
        return callback(`${el.spec.begin} - ${el.spec.end} 已占用`)
      }
    })
    if (getFieldValue('end')
      && ip4ToInt(getFieldValue('end')) <= ip4ToInt(value)) {
      return callback('起始 IP 应小于 结束 IP')
    }
    callback()
  }
  checkIpEnd = (rule, value, callback) => {
    if (!value) return callback()
    if (!IP_REGEX.test(value)) {
      return callback('请填写格式正确的 IP')
    }
    const { currentPool, form: { getFieldValue, validateFields }, listData } = this.props
    const cidr = currentPool.spec.cidr
    if (!ipRangeCheck(value, cidr)) {
      return callback(`请填写属于 ${cidr} 网段的 IP`)
    }
    listData.forEach(el => {
      const isOccupy = checkIPInRange(value, el.spec.begin, el.spec.end)
      if (isOccupy) {
        return callback(`${el.spec.begin} - ${el.spec.end} 已占用`)
      }
    })
    if (!getFieldValue('begin')) {
      validateFields([ 'begin' ], { force: true })
    }
    if (getFieldValue('begin')
      && ip4ToInt(getFieldValue('begin')) >= ip4ToInt(value)) {
      return callback('结束 IP 应大于 起始 IP')
    }
    callback()
  }
  handlePager = currentPage => {
    this.setState({ currentPage })
  }
  changeDefaultVisible = record => {
    this.setState({
      defaultVisible: !this.state.defaultVisible,
      targetAssign: record || '',
    })
  }
  render() {
    const { visible, enterLoading, toggleDistributeVisible, form,
      listData, isFetching } = this.props
    const { currentPage, defaultVisible, targetAssign } = this.state
    const { getFieldProps } = form
    const { searchVal, addItem, projects, deleteVisible, delTarget } = this.state
    let filterData = !searchVal ? listData : listData.filter(item =>
      item.metadata.name.toUpperCase().indexOf(searchVal.toUpperCase()) > -1)
    const column = [
      {
        title: '地址池名称',
        key: 'metadata.name',
        dataIndex: 'metadata.name',
        width: '18%',
        render: (text, record) => {
          const isDefault = record.spec.default
          return <div>
            {text}&nbsp;&nbsp;
            {isDefault && <Tooltip title="默认" >
              <Icon type="exclamation-circle" />
            </Tooltip>
            }
          </div>
        },
      }, {
        title: '项目名称',
        key: 'spec.project.namespace',
        dataIndex: 'spec.project.namespace',
        width: '15%',
      }, {
        title: '起始 IP',
        key: 'spec.begin',
        dataIndex: 'spec.begin',
        width: '15%',
      }, {
        title: '结束 IP',
        key: 'spec.end',
        dataIndex: 'spec.end',
        width: '15%',
      }, {
        title: 'IP 数',
        key: 'num',
        dataIndex: 'num',
        width: '8%',
        render: (text, record) => this.dealIpNum(record),
      }, {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        width: '23%',
        render: (key, record) => {
          return <span>
            {
              record.spec.default ?
                <Button
                  type="primary"
                  onClick={() => this.changeDefaultVisible(record)}
                >
                  取消项目默认
                </Button>
                : <Button
                  type="primary"
                  onClick={() => this.changeDefaultVisible(record)}
                >
                  设为项目默认
                </Button>
            }
            <Button
              type="ghost"
              style={{ marginLeft: 6 }}
              onClick={() => this.delProjectPool(record)}
            >
              删除
            </Button>
          </span>
        },
      },
    ]
    const total = filterData.length
    filterData = filterData.length < 10 ?
      filterData
      : filterData.slice((currentPage - 1) * 10, currentPage * 10)
    return (
      <Modal
        width={830}
        title="项目 IP 地址池"
        visible={visible}
        confirmLoading={enterLoading}
        onCancel={toggleDistributeVisible}
        footer={[
          <Button
            size="large"
            type="primary"
            onClick={toggleDistributeVisible}
          >
            知道了
          </Button>,
        ]}
      >
        <div className="manageProjectPool">
          <div className="layout-content-btns">
            <Button
              type="primary"
              icon="plus"
              disabled={addItem}
              onClick={this.toggleAddStatus}
            >
              项目地址池
            </Button>
            <Button
              type="ghost"
              icon="refresh"
              onClick={this.loadData}
            >
              刷新
            </Button>
            <SearchInput
              size="large"
              id="macvlan"
              placeholder="输入地址池名称搜索"
              value={searchVal}
              style={{ width: 200, marginLeft: 0 }}
              onChange={value => this.setState({ searchVal: value })}
              // onSearch={this.searchService}
            />
            <div className="ant-pagination">
              <Pagination
                simple
                total={total}
                current={currentPage}
                pageSize={10}
                onChange={this.handlePager}
              />
              <div className="ant-pagination" style={{ lineHeight: '30px' }}>
                {`共 ${total} 条`}
              </div>
            </div>
          </div>
          <Table
            className="reset_antd_table_header"
            columns={column}
            dataSource={filterData}
            loading={isFetching}
            pagination={false}
          />
          {
            addItem ?
              <Row className="addLine">
                <Col>
                  <FormItem>
                    <Input
                      placeholder="请输入地址池名称"
                      { ...getFieldProps('name', { rules: [{
                        required: true,
                        message: '请输入地址池名称',
                      }, {
                        validator: this.checkName,
                      }] }) }
                    />
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="请选择项目"
                      { ...getFieldProps('namespace', { rules: [{
                        required: true,
                        message: '请选择项目',
                      }] }) }
                    >
                      {
                        projects.map(item => (
                          <Option key={item.namespace}>{item.namespace}</Option>
                        ))
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Input
                      placeholder="请输入起始 IP 地址"
                      { ...getFieldProps('begin', { rules: [{
                        required: true,
                        message: '请输入起始 IP',
                      }, {
                        validator: this.checkIpBegin,
                      }] }) }
                    />
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Input
                      placeholder="请输入结束 IP 地址"
                      { ...getFieldProps('end', { rules: [{
                        required: true,
                        message: '请输入结束 IP',
                      }, {
                        validator: this.checkIpEnd,
                      }] }) }
                    />
                  </FormItem>
                </Col>
                <Col style={{ width: '8%' }}></Col>
                <Col style={{ width: '20%' }}>
                  <Button
                    type="primary"
                    style={{ marginRight: 6 }}
                    onClick={this.saveInfo}
                  >
                    保存
                  </Button>
                  <Button
                    onClick={this.toggleAddStatus}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
              : null
          }
        </div>
        <Modal
          title="删除操作"
          visible={deleteVisible}
          onOk={this.confirmDelete}
          onCancel={this.delProjectPool}
          okText={'确认删除'}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <div>
              <p>确认删除项目地址池 {delTarget && delTarget.metadata && delTarget.metadata.name} ？</p>
            </div>
          </div>
        </Modal>
        <Modal
          title="项目默认操作"
          visible={defaultVisible}
          onOk={this.confirmChangeDefault}
          onCancel={this.changeDefaultVisible}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <div>
              {
                targetAssign && targetAssign.spec && targetAssign.spec.default ?
                  <p>取消该分配为唯一项目默认，其他业务需要 ip 分配的将无法启动（工作负载、流水线、数据库缓存等业务？</p>
                  : <p>请确认以该分配为唯一项目默认（用于工作负载、流水线、数据库缓存等业务）？</p>
              }
            </div>
          </div>
        </Modal>
      </Modal>
    )
  }
}

const mapStateToProps = ({
  ipPool: { ipAssignmentList },
}) => ({
  isFetching: ipAssignmentList.isFetching || false,
  listData: ipAssignmentList.data || [],
})

export default connect(mapStateToProps, {
  getIPAssignment: IPPoolActions.getIPAssignment,
  getProjectByClustr: clusterActions.getProjectByClustr,
  createProjectPool: IPPoolActions.createProjectPool,
  deleteProjectPool: IPPoolActions.deleteProjectPool,
  updateDefaultAssignment: IPPoolActions.updateDefaultAssignment,
})(Form.create()(DistributeModal))
