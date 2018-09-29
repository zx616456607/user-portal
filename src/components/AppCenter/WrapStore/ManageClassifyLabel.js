/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2018-2-8
 * @author zhangcz
 */

import React, { Component } from 'react'
import { Modal, Table, Button, Form, Input } from 'antd'
import { getWrapGroupDetailList } from '../../../actions/app_center'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import Notification from '../../Notification'
import './style/ManageClassifyLabel.less'

const notification = new Notification()

const FormItem = Form.Item

class ManageClassifyLabel extends Component {
  constructor(props) {
    super(props)
    this.renderTableColumn = this.renderTableColumn.bind(this)
    this.loadData = this.loadData.bind(this)
    this.state = {
      list: [],
      deleteList: [],
      isFetching: true,
    }
  }

  componentWillMount() {
    this.loadData()
  }

  loadData() {
    const { getWrapGroupDetailList } = this.props
    this.setState({ isFetching: true })
    getWrapGroupDetailList({
      success: {
        func: res => {
          const { data } = res
          const initalList = cloneDeep(data) || []
          initalList.forEach(item => {
            item.isEdit = false
          })
          this.setState({ list: initalList })
        }
      },
      finally: {
        func: () => this.setState({ isFetching: false })
      }
    })
  }

  deleteLabel(index) {
    const { list, deleteList } = this.state
    const preList = cloneDeep(list)
    const preDeleteList = cloneDeep(deleteList)
    preList[index].operation = 2
    preDeleteList.push(preList[index])
    preList.splice(index, 1)
    this.setState({
      list: preList,
      deleteList: preDeleteList,
    })
  }

  editLabel(index) {
    const { list } = this.state
    const preList = cloneDeep(list)
    preList[index].isEdit = true
    this.setState({ list: preList })
  }

  saveEdit(index) {
    const { list } = this.state
    const { form } = this.props
    form.validateFields([`name-${index}`], (error, value) => {
      if (error) return
      const preList = cloneDeep(list)
      preList[index].classifyName = value[`name-${index}`]
      preList[index].content = value[`name-${index}`]
      preList[index].isEdit = false
      preList[index].operation = 1
      this.setState({ list: preList })
    })
  }

  cancelEdit(index) {
    const { list } = this.state
    const preList = cloneDeep(list)
    preList[index].isEdit = false
    this.setState({ list: preList })
  }

  handleOk() {
    const { callback, form } = this.props
    const { list, deleteList } = this.state
    for (let i = 0; i < list.length; i++) {
      if (list[i].isEdit) {
        return notification.info('请先确认保存修改的标签')
      }
    }
    form.validateFields(errors => {
      if (errors) return
      const editList = []
      list.forEach(item => {
        if (item.operation === 1) {
          editList.push(item)
        }
      })
      const resultList = editList.concat(deleteList)
      callback(resultList)
    })
  }

  renderTableColumn() {
    const { form } = this.props
    const { getFieldProps } = form
    return [
      {
        title: '分类', key: 'classifyName', dataIndex: 'classifyName', width: '16%',
        render: (text, record, index) => {
          if (record.isEdit) {
            return <FormItem>
              <Input placeholder="请输入分类名称" {...getFieldProps(`name-${index}`, {
                initialValue: text,
                rules: [{
                  validator: (rule, value, callback) => {
                    if (!value) {
                      return callback('名称不能为空')
                    }
                    return callback()
                  }
                }]
              })}
              />
            </FormItem>
          }
          return text
        },
      },
      {
        title: '已发布镜像', key: 'images', dataIndex: 'images', width: '16%',
        render: (text, record) => {
          if (record.isEdit) {
            return <div className="editing-style">{text}</div>
          }
          return text
        }
      },
      {
        title: '已发布应用包', key: 'apppkgs', dataIndex: 'apppkgs', width: '16%',
        render: (text, record) => {
          if (record.isEdit) {
            return <div className="editing-style">{text}</div>
          }
          return text
        }
      },
      {
        title: '待审核镜像', key: 'pendingApprovalImage', dataIndex: 'pendingApprovalImage', width: '16%',
        render: (text, record) => {
          if (record.isEdit) {
            return <div className="editing-style">{text}</div>
          }
          return text
        }
      },
      {
        title: '待审核应用包', key: 'pendingApprovalPkg', dataIndex: 'pendingApprovalPkg', width: '16%',
        render: (text, record) => {
          if (record.isEdit) {
            return <div className="editing-style">{text}</div>
          }
          return text
        }
      },
      {
        title: '操作', key: 'handler', dataIndex: 'handler', width: '16%',
        render: (text, record, index) => {
          if (record.isEdit) {
            return (
              <div className="editing-style">
                <Button icon="check" type="primary" onClick={this.saveEdit.bind(this, index)}
                  className="button-margin-style"
                />
                <Button icon="cross" type="ghost" onClick={this.cancelEdit.bind(this, index)}/>
              </div>
            )
          }
          return (
            <span>
              <Button icon="edit" key="edit" onClick={this.editLabel.bind(this, index)}
                type="dashed"
                className="button-margin-style"
              />
              <Button icon="delete" key="delete" type="dashed" onClick={this.deleteLabel.bind(this, index)}
                disabled={record.images || record.apppkgs || record.pendingApprovalImage || record.pendingApprovalPkg}
              />
            </span>
          )
        }
      },
    ]
  }

  render() {
    const { closeModalMethod, loading } = this.props
    const { list, isFetching } = this.state
    return (
      <Modal
        title="分类管理"
        visible={true}
        closable={true}
        onOk={() => this.handleOk()}
        onCancel={() => closeModalMethod()}
        width="650px"
        maskClosable={false}
        confirmLoading={loading}
        wrapClassName="manage-classify-label"
      >
        <Table
          columns={this.renderTableColumn()}
          dataSource={list}
          pagination={false}
          loading={loading || isFetching}
          rowKey={record => record.id}
          scroll={{ y: 400 }}
          className="reset_antd_table_header"
        />
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  getWrapGroupDetailList,
})(Form.create()(ManageClassifyLabel))
