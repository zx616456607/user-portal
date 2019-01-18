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
import { Modal, Button, Form, Input, Table, Icon } from 'antd'
import PropTypes from 'prop-types'
import './style/index.less'
import { connect } from 'react-redux'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import _ from 'lodash'
import QueueAnim from 'rc-queue-anim'

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

// 整理后台传来的资源定义列表
const formateResourceDefinitions = (resourceDefinitions = []) => {
  const definitions = {}
  for (const value of resourceDefinitions) {
    for (const child of (value.children || [])) {
      definitions[child.resourceType] = child.resourceName
    }
  }
  return definitions
}

const getcolums = (resourceDefinitions = []) => {
  const columns = [{
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
    render: (text, record) => {
      return (
        <span>{formateResourceDefinitions(resourceDefinitions)[record.resource]}</span>
      )
    },
    width: 100,
  }, {
    title: '申请集群',
    dataIndex: 'aggregate',
    key: 'aggregate',
    width: 100,
  }, {
    title: '已用',
    dataIndex: 'use',
    key: 'use',
    width: 100,
  }, {
    title: '申请配额',
    dataIndex: 'applyLimit',
    key: 'applyLimit',
    render: (text, record) => <span className="appiyLimitNum">{record.applyLimit}</span>,
    width: 100,
  }, {
    title: '审批状态',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    render: (text, record) => {
      let type = 'cross-circle'
      let color = 'red'
      if (record.approvalStatus === true) {
        type = 'check-circle'
        color = 'green'
      }
      return (
        <div>
          <span className="crossIcon"><Icon type={type} style={ { color } }/></span>
        </div>
      )
    },
    width: 100,
  }]
  return columns
}

const findClusersName = ({ id, choiceClusters }) => {
  for (const o of (choiceClusters.data || [])) {
    if (o.clusterID === id) {
      return o.clusterName
    }
  }
}

// tabData
const printApprovalResult = tabData => {
  let approvalResult = '部分同意'
  if (tabData.every(o => !o.approvalStatus)) {
    approvalResult = '全部拒绝'
  } else if (tabData.every(o => o.approvalStatus)) {
    approvalResult = '全部同意'
  }
  return approvalResult
}
const formatTabDate = (applyDetails, approveDetails, choiceClusters, resourceInuse,
  globaleDevopsQuotaList) => {
  const date = []
  let indexKey = 1
  if (applyDetails && globaleDevopsQuotaList && !_.isEmpty(resourceInuse)) {
    for (const key in applyDetails) {
      const clusterName = findClusersName({ id: key, choiceClusters })
      for (const resourcekey in applyDetails[key]) {
        date.push({
          key: indexKey,
          resource: resourcekey,
          aggregate: key === 'global' ? '-' : clusterName, // 全局资源没有集群
          use: (resourceInuse[key] || {})[resourcekey] !== undefined ?
            resourceInuse[key][resourcekey] : globaleDevopsQuotaList[resourcekey],
          applyLimit: applyDetails[key][resourcekey] || '无限制',
          approvalStatus: approveDetails[key] ?
            approveDetails[key][resourcekey] !== undefined : false,
        })
        indexKey++
      }
    }
  }
  return date
}
class ApplayDetail extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    toggleVisable: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
  }
  render() {
    const { visible, title, resourcequoteRecord, choiceClusters: choiceClustersObject,
      resourceDefinitions,
      resourceInuse, globaleDevopsQuotaList, cancelVisable } = this.props
    const { isFetching, data: recordData = {} } = resourcequoteRecord
    const { applyDetails, approveDetails } = recordData
    const choiceClusters = choiceClustersObject[recordData.namespace] || {}
    const tabData = formatTabDate(applyDetails, approveDetails, choiceClusters, resourceInuse,
      globaleDevopsQuotaList)
    let accountType
    if (recordData.applier === recordData.namespace) {
      accountType = '个人项目'
    } else {
      accountType = '共享项目'
    }
    return (
      <Modal
        visible = {visible}
        title = {title}
        onCancel={cancelVisable}
        footer={[
          <span className="ApplyDetail result-wrap">
            <span>审批结果:</span><span className="result">{printApprovalResult(tabData)}</span>
          </span>,
          <Button key="makeSure" type="primary" size="large" onClick={cancelVisable}>
              知道了
          </Button>,
        ]}
        width={600}
      >
        <div className="ApplyDetail">
          <FormItem
            label="申请项目" {...formItemLayout}
          >
            <Input value={`${recordData.displayName} (${accountType})`} disabled/>
          </FormItem>
          <FormItem
            label="申请人" {...formItemLayout}
          >
            <Input value={recordData.applier} disabled/>
          </FormItem>
          <FormItem
            label="申请原因" {...formItemLayoutLarge}
          >
            <Input value={recordData.comment} type="textarea" rows={4} disabled/>
          </FormItem>
          {
            isFetching === false ?
              <QueueAnim>
                <div key="table">
                  <Table columns={getcolums(resourceDefinitions)}
                    dataSource={tabData}
                    pagination={false} size="small"
                    scroll={{ y: 120 }} loading={isFetching}
                  />
                </div>
              </QueueAnim> : null
          }

        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  const detailData = getDeepValue(state, [ 'applyLimit', 'resourcequotaDetail' ])
  // const projectName = getDeepValue(state, [ 'entities', 'current', 'space', 'projectName' ])

  const choiceClusters = state.projectAuthority.projectVisibleClusters
  return {
    resourcequoteRecord: detailData, choiceClusters,
  }
}
export default connect(mapStateToProps, {
})(ApplayDetail)
