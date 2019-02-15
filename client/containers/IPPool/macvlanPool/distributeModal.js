/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * Network Solutions component
 *
 * v0.1 - 2017-1-22
 * @author lvjunfeng
 */
import React from 'react'
import { connect } from 'react-redux'
import { Table, Modal, Button, Row, Col, Form, Select, Input } from 'antd'
import SearchInput from '../../../components/SearchInput'
import * as IPPoolActions from '../../../actions/ipPool'
import * as clusterActions from '../../../../src/actions/cluster'
import './style/distributeModal.less'
import Notification from '../../../../src/components/Notification'

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
          const { statusCode } = err
          if (statusCode !== 401) {
            notification.close()
            notification.warn('删除项目地址池失败')
            this.delProjectPool()
          }
        },
      },
    })
  }

  render() {
    const { visible, enterLoading, toggleDistributeVisible, form,
      listData, isFetching } = this.props
    const { getFieldProps } = form
    const { searchVal, addItem, projects, deleteVisible, delTarget } = this.state
    const filterData = !searchVal ? listData : listData.filter(item =>
      item.metadata.name.toUpperCase().indexOf(searchVal.toUpperCase()) > -1)
    const column = [
      {
        title: '地址池名称',
        key: 'metadata.name',
        dataIndex: 'metadata.name',
        width: '18%',
      }, {
        title: '项目名称',
        key: 'spec.project.namespace',
        dataIndex: 'spec.project.namespace',
        width: '18%',
      }, {
        title: '起始 IP',
        key: 'spec.begin',
        dataIndex: 'spec.begin',
        width: '18%',
      }, {
        title: '结束 IP',
        key: 'spec.end',
        dataIndex: 'spec.end',
        width: '18%',
      }, {
        title: 'IP 数',
        key: 'num',
        dataIndex: 'num',
        width: '10%',
        render: (text, record) => (!text ? '--' : record.metadata.name),
      }, {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        width: '15%',
        render: (key, record) => {
          // const = record
          return <span>
            <Button
              type="ghost"
              onClick={() => this.delProjectPool(record)}
            >
              删除
            </Button>
          </span>
        },
      },
    ]
    return (
      <Modal
        width={830}
        title="项目 IP 地址池"
        visible={visible}
        confirmLoading={enterLoading}
        onOk={toggleDistributeVisible}
        onCancel={toggleDistributeVisible}
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
            {/* <Pagination onChange={onChange} total={50} /> */}
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
                        // validator: this.checkCidr,
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
                        message: '请输入起始 IP 地址',
                      }, {
                        // validator: this.checkCidr,
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
                        message: '请输入结束 IP 地址',
                      }, {
                        // validator: this.checkCidr,
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
})(Form.create()(DistributeModal))
