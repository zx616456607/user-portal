/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Thursday June 14th 2018
 */
import * as React from 'react'
import { Modal, Button, Form, Input, Table, Icon, Tooltip, notification } from 'antd'
// import classnames from 'classnames'
import PropTypes from 'prop-types'
import './style/index.less'
import _ from 'lodash'
import { connect } from 'react-redux'
import { getDeepValue } from '../../../../client/util/util'
import { calcuDate } from '../../../common/tools'
import { updateResourcequota } from '../../../../client/actions/applyLimit'
import { removeOldFormFieldsByRegExp } from '../../../actions/quick_create_app';
const FormItem = Form.Item
// 表单布局
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 16 },
}
const formItemLayoutLarge = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
}

const getcolums = ({ setApprovalState, cancelApprovalState, approvalState }) => {
  const allPass = approvalState.every( x => x === true )
  const allRefuse = approvalState.every( x => x=== false )
  const allPassType = allPass ? 'check-circle' : 'check-circle-o'
  const allPassClass = allPass ? 'allPassIcon' : 'notAllPassIcon'

  const allRefuseType = allRefuse ? 'cross-circle' : 'cross-circle-o'
  const allRefuseClass = allRefuse ? 'allRefuseIcon' : 'notallRefuseIcon'
  const columns = [{
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
  }, {
    title: '申请集群',
    dataIndex: 'aggregate',
    key: 'aggregate',
  }, {
    title: '已用',
    dataIndex: 'use',
    key: 'use',
  }, {
    title: '申请配额',
    dataIndex: 'applyLimit',
    key: 'applyLimit',
    render: (text, record) => <span className="appiyLimitNum">{record.applyLimit}</span>,
  }, {
    title:
    <div>
      <span>审批</span>
      <span className="allApprovalIcon">
        <Tooltip title="全部同意">
          <Icon type={allPassType} className={allPassClass} onClick={setApprovalState.bind(null, 'all')} />
        </Tooltip>
      </span>
      <span>
        <Tooltip title="全部拒绝">
          <Icon type={allRefuseType} className={allRefuseClass} onClick={cancelApprovalState.bind(null, 'all')}/>
        </Tooltip>
      </span>
    </div>,
    dataIndex: 'status',
    key: 'status',
    render: (text, record) => {
      let key = parseInt(record.key) - 1
      const pass = approvalState[key]
      const noPass = !pass
      const PassType = pass ? 'check-circle' : 'check-circle-o'
      const PassClass = pass ? 'allPassIcon' : 'notAllPassIcon'

      const RefuseType = noPass ? 'cross-circle' : 'cross-circle-o'
      const RefuseClass = noPass ? 'allRefuseIcon' : 'notallRefuseIcon'
      return (
        <div>
          <span className="allApprovalIcon">
            <Tooltip title="同意">
              <Icon type={PassType} className={PassClass} onClick={setApprovalState.bind(null, key)} />
            </Tooltip>
          </span>
          <span>
            <Tooltip title="拒绝">
              <Icon type={RefuseType} className={RefuseClass} onClick={cancelApprovalState.bind(null, key)}/>
            </Tooltip>
          </span>
      </div>
      )
    },
  }]
  return columns
}

const findClusersName = ({ id, choiceClusters }) => {
    for (const o of choiceClusters.data) {
      if (o.clusterID === id) {
        return o.clusterName
      }
    }
}

  const formatTabDate = (applyDetails, approveDetails, choiceClusters) => {
    const date = []
    let indexKey = 1
    if (applyDetails) {
      for (const key in applyDetails) {
        const clusterName = findClusersName({ id: key, choiceClusters })
        for (const resourcekey in applyDetails[key]) {
          date.push({
            key: indexKey,
            resource: resourcekey,
            aggregate: key === 'global' ? '-' : clusterName, // 全局资源没有集群
            use: '后台没有提供',
            applyLimit: applyDetails[key][resourcekey] || '无限制',
            approvalStatus: approveDetails[key] ? approveDetails[key].indexOf(resourcekey) !== -1 : false,
            clusterID: key,
          })
          indexKey++
        }
      }
    }
    return date
  }

const formateUpdateResoure = (tabData, approvalState) => {
  const body = {
    approveDetails: {},
    status: 3
  }
  for(const o of tabData) {
    if (approvalState[o.key-1]) {
      if (!body.approveDetails[o.clusterID]) {
        body.approveDetails[o.clusterID] = ''
      }
      body.approveDetails[o.clusterID] += `${o.resource},`
    }
  }
  if (approvalState.every( o => o === true)) { // 全部同意
    body.status = 1
  }
  if (approvalState.every( o => o === false)) { // 全部拒绝
    body.status = 2
  }
  return body
}
class ApprovalOperation extends React.Component {
  state = {
    approvalState: [false], // 审批状态, Array(n) n = data的个数
    loading: false, // 完成审批的loading状
  }
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    toggleVisable: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  }
  setApprovalState = key => {
    let { approvalState } = this.state
    const tabDataLength = this.props.tabData.length
    if (key === 'all') {
      this.setState({ approvalState: _.fill(Array(tabDataLength), true) })
      return
    }
    if (approvalState.length !== tabDataLength) {
      approvalState = _.fill(Array(tabDataLength), false)
    }
    approvalState[parseInt(key)] = true
    this.setState({ approvalState })
  }
  cancelApprovalState = key => {
    let { approvalState } = this.state
    const tabDataLength = this.props.tabData.length
    if (key === 'all') {
      this.setState({ approvalState: _.fill(Array(tabDataLength), false) })
      return
    }
    if (approvalState.length !== tabDataLength) {
      approvalState = _.fill(Array(tabDataLength), false)
    }
    approvalState[parseInt(key)] = false
    this.setState({ approvalState })
  }
  fetchApprovalResult = (record, e) => {
    const { updateResourcequota, toggleVisable, tabData, reload } = this.props
    const { approvalState } = this.state
    const body = formateUpdateResoure(tabData, approvalState)
    const id = record.id
    console.log('body', body)
    console.log('fucjid', id)
    updateResourcequota(record.id, body, {
        success: {
          func: res => {
            toggleVisable(undefined, 'success')
            this.setState({ approvalState: [false] })
            reload()
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notification.error('审批操作失败')
          },
        },
    })
  }
  render() {
    const { visible, toggleVisable, record, title, resourcequoteRecord, choiceClusters, tabData } = this.props
    const { approvalState } = this.state
    const setApprovalState = this.setApprovalState
    const cancelApprovalState = this.cancelApprovalState
    const { isFetching, data: recordData = {} } = resourcequoteRecord
    return (
      <Modal
        visible = {visible}
        title = {title}
        onCancel={ toggleVisable }
        footer={[
          <span className="ApprovalOperation result-wrap">
            <span>申请时间:</span><span className="result">{calcuDate(recordData.createTime)}</span>
          </span>,
          <Button key="cancel" size="large" onClick={toggleVisable}>
            取消
          </Button>,
          <Button key="makeSure" type="primary" size="large" onClick={this.fetchApprovalResult.bind(null, record)}>
              完成审批
          </Button>,
        ]}
        width={700}
      >
        <div className="ApprovalOperation">
          <FormItem
            label="申请项目" {...formItemLayout}
          >
            <Input value={recordData.displayName}/>
          </FormItem>
          <FormItem
            label="申请人" {...formItemLayout}
          >
            <Input value={recordData.applier}/>
          </FormItem>
          <FormItem
            label="申请原因" {...formItemLayoutLarge}
          >
            <Input value={recordData.comment} type="textarea" rows={4}/>
          </FormItem>
          <Table columns={getcolums({ setApprovalState, cancelApprovalState, approvalState})} dataSource={tabData} pagination={false} size="small"
            scroll={{ y: 120 }}/>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  const detailData = getDeepValue(state, [ 'applyLimit', 'resourcequotaDetail' ])
  const choiceClusters = state.projectAuthority.projectVisibleClusters.default

  const { data: recordData = {} } = detailData
  const { applyDetails, approveDetails } = recordData
  const tabData = formatTabDate(applyDetails, approveDetails, choiceClusters)
  return {
    resourcequoteRecord: detailData, choiceClusters,tabData
  }
}
export default connect(mapStateToProps, {
  updateResourcequota
})(ApprovalOperation)