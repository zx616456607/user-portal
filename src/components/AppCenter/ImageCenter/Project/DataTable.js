/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DataTable project component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Table, Button, Modal, Icon, Tooltip } from 'antd'
import { Link } from 'react-router'
import { camelize } from 'humps'
import { formatDate } from '../../../../common/tools'
import { DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import repoGroupListIntl from './intl/imageCenterIntl'
import { injectIntl } from 'react-intl'
import TimeHover from '@tenx-ui/time-hover/lib'

const notification = new NotificationHandler()

class DataTable extends Component {
  constructor(props) {
    super()
    this.handleChange = this.handleChange.bind(this)
    this.setProjectPublic = this.setProjectPublic.bind(this)
    this.handleListDataItem = this.handleListDataItem.bind(this)
    this.state = {
      sortedInfo: null,
      filteredInfo: null,
      selectedRows: [],
      publicModalVisible: false,
      currentProject: {},
    }
  }

  setProjectPublic() {
    const { currentProject } = this.state
    const { func, harbor, intl } = this.props
    const { formatMessage } = intl
    const succ = () => {
      func.loadData()
      this.setState({ publicModalVisible: false })
    }
    const failed = err => {
      notification.error(formatMessage(repoGroupListIntl.updateFailed, {repoName: currentProject.name}))
    }
    if(!!currentProject.metadata){
      const body = {
        metadata: {
          public: this.getIsPublicText(currentProject, "false", "true"),
          enable_content_trust: currentProject.metadata.enableContentTrust,
          prevent_vul: currentProject.metadata.preventVul,
          severity: currentProject.metadata.severity,
          auto_scan: currentProject.metadata.autoScan,
        }
      }
      func.updateProject(harbor, DEFAULT_REGISTRY, currentProject[camelize('project_id')], body, {
        success: {
          func: succ,
          isAsync: true,
        },
        failed: {
          func:failed,
        }
      })
    } else {
      func.updateProjectPublicity(harbor, DEFAULT_REGISTRY, currentProject[camelize('project_id')], {
        public: this.getIsPublicText(currentProject, 0, 1),
      }, {
        success: {
          func: succ,
          isAsync: true,
        },
        failed: {
          func:failed,
        }
      })
    }
  }

  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  paginationChange(current) {
    const { func } = this.props
    const { scope, loadData } = func
    scope.setState({
      currentPage: current,
    })
    loadData({ page: current })
  }

  handleListDataItem(text,record) {
    if (this.props.from==='public') {
      return <Link to={{
          pathname:`/app_center/projects/detail/${record[camelize('project_id')]}`,
          query: { type: 'public' }
        }}>{text}</Link>
    }
    return <Link to={`/app_center/projects/detail/${record[camelize('project_id')]}`}>{text}</Link>
  }
  getIsPublicText = (curr, ispublicText, isprivateText) => {
    let res = ""
    if(!isNaN(curr.public)){
      if (curr.public === 0) {
        res = isprivateText
      } else {
        res = ispublicText
      }
    } else if(!!curr.metadata && !!curr.metadata.public){
      if(curr.metadata.public === "true"){
        res = ispublicText
      } else {
        res = isprivateText
      }
    }
    return res
  }
  render() {
    let { sortedInfo, filteredInfo } = this.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const { dataSource, func, loginUser, from, intl } = this.props
    const { formatMessage } = intl
    const scope = func.scope
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    const defaultColumns = [
      {
        title: formatMessage(repoGroupListIntl.repoGroupName),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => this.handleListDataItem(text, record)
      },
      {
        title: formatMessage(repoGroupListIntl.accessLevel),
        dataIndex: 'public',
        key: 'public',
        //filters: [
        //  { text: '私有', value: 0 },
        //  { text: '公开', value: 1 },
        //],
        //filteredValue: filteredInfo.public,
        //onFilter: (value, record) => record.public == value,
        render: (text, record) => this.getIsPublicText(record, formatMessage(repoGroupListIntl.publicType), formatMessage(repoGroupListIntl.privateType))
      },
      {
        title: formatMessage(repoGroupListIntl.myRole),
        dataIndex: camelize('current_user_role_id'),
        key: camelize('current_user_role_id'),
        //filters: [
        //  { text: '管理员', value: 1 },
        //  { text: '开发人员', value: 2 },
        //  { text: '访客', value: 3 },
        //],
        //filteredValue: filteredInfo[camelize('current_user_role_id')],
        //onFilter: (value, record) => record[camelize('current_user_role_id')] == value,
        render: text => {
          if (text == 1) {
            return formatMessage(repoGroupListIntl.admin)
          }
          if (text == 2) {
            return formatMessage(repoGroupListIntl.developer)
          }
          if (text == 3) {
            return formatMessage(repoGroupListIntl.visitor)
          }
          return ''
        }
      },
      {
        title: formatMessage(repoGroupListIntl.countOfImage),
        dataIndex: camelize('repo_count'),
        key: camelize('repo_count'),
        sorter: (a, b) => a[camelize('repo_count')] - b[camelize('repo_count')],
        sortOrder: sortedInfo.columnKey === camelize('repo_count') && sortedInfo.order
      },
      {
        title: formatMessage(repoGroupListIntl.updateTime),
        dataIndex: camelize('creation_time'),
        key: camelize('creation_time'),
        render: text => <TimeHover time={text} />,
        sorter: (a, b) => new Date(a[camelize('creation_time')]) - new Date(b[camelize('creation_time')]),
        sortOrder: sortedInfo.columnKey === camelize('creation_time') && sortedInfo.order
      },
      {
        title: formatMessage(repoGroupListIntl.creationTime),
        dataIndex: camelize('update_time'),
        key: camelize('update_time'),
        render: text => <TimeHover time={text} />,
        sorter: (a, b) => new Date(a[camelize('update_time')]) - new Date(b[camelize('update_time')]),
        sortOrder: sortedInfo.columnKey === camelize('update_time') && sortedInfo.order
      },
      {
        title: formatMessage(repoGroupListIntl.option),
        dataIndex: 'action',
        key: 'action',
        render: (text, row) => {
          if (row[camelize('current_user_role_id')] == 1 || isAdmin) {
            const setText = this.getIsPublicText(row, formatMessage(repoGroupListIntl.setToPrivate), formatMessage(repoGroupListIntl.setToPublic))
            return (
              <div className="action">
                {
                  setText && <Button
                    type="primary"
                    onClick={() => this.setState({ currentProject: row, publicModalVisible: true })}
                  >
                    {setText}
                  </Button>
                }
                <Button disabled={row.name === 'system_store'} type="ghost" onClick={()=>{
                  if(row.name !== 'system_store'){
                    scope.setState({deleteItem:true,selectedRows:[row]})
                  }
                }}>
                  {formatMessage(repoGroupListIntl.deleteThis)}
                </Button>
                {
                  row.name === 'system_store' && (
                    <Tooltip placement="top" title={formatMessage(repoGroupListIntl.deleteThisAlertMsg)}>
                      <Icon type="info-circle-o" />
                    </Tooltip>
                  )
                }
              </div>
            )
          }
          return (
            <div className="action">
              <Button disabled={true} type="primary">
                {
                  this.getIsPublicText(row, formatMessage(repoGroupListIntl.setToPrivate), formatMessage(repoGroupListIntl.setToPublic))
                }
              </Button>
              <Button disabled={true} type="ghost"> {formatMessage(repoGroupListIntl.deleteThis)}</Button>
            </div>
          )
        }
      }
    ]
    const columns = []
    defaultColumns.forEach(column => {
      if (this.props.from === 'public') {
        if (([ 'public', 'action', camelize('current_user_role_id') ]).indexOf(column.dataIndex) > -1) {
          return
        }
      }
      columns.push(column)
    })
    /*const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        scope.setState({selectedRows})
      }
    }*/
    let paginationOpts = {
      size: "small",
      pageSize: 10,
      total: dataSource.total,
      onChange: current => func.loadData({ page: current }),
      showTotal: total => `${formatMessage(repoGroupListIntl.total, {total})}`,
      simple: true,
    }
    if (from === "private") {
      const { currentPage } = this.props
      paginationOpts = Object.assign({}, paginationOpts, {
        onChange: current => this.paginationChange(current),
        current: currentPage,
      })
    }
    const { currentProject } = this.state
    let isPublic = this.getIsPublicText(currentProject, true, false)
    const publicModalTitle = isPublic ?formatMessage(repoGroupListIntl.setToPrivate): formatMessage(repoGroupListIntl.setToPublic)
    return (
      <div>
        <Table className="myImage"
          dataSource={dataSource.list}
          columns={columns}
          loading={dataSource.isFetching}
          pagination={paginationOpts}
          onChange={this.handleChange}
        />
        { dataSource && dataSource.total !== 0 && <span className='total_num_style'>{formatMessage(repoGroupListIntl.total, {total: dataSource.total})}</span>}
        {/* 设置仓库组 公共/私有 属性 */}
        <Modal
          title={publicModalTitle}
          visible={this.state.publicModalVisible}
          onCancel={()=> this.setState({publicModalVisible: false})}
          onOk={this.setProjectPublic}
        >
          <div className="confirmText">
            <div>
              <p>①&nbsp;
                {
                  isPublic ? formatMessage(repoGroupListIntl.setToPublicContent1) : formatMessage(repoGroupListIntl.setToPrivateContent1)
                }
              </p>
              <p>②&nbsp;
                {
                  isPublic ? formatMessage(repoGroupListIntl.setToPublicContent2) : formatMessage(repoGroupListIntl.setToPrivateContent2)
                }
                <code>docker login</code>
                {
                  isPublic ? formatMessage(repoGroupListIntl.setToPublicContent3) : formatMessage(repoGroupListIntl.setToPrivateContent3)
                }
              </p>
            </div>
          </div>
          <br/>
          <div className="confirmText"><Icon type="question-circle-o" style={{ marginRight: '10px' }} />
            {/*您确认将项目...吗？*/}
            {formatMessage(repoGroupListIntl.setToPrivateConfirm)} {this.state.currentProject.name} {publicModalTitle}?</div>
        </Modal>
      </div>
    )
  }
}

export default injectIntl(DataTable, {
  withRef: true
})
