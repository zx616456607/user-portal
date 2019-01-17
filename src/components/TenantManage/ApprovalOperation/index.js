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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { calcuDate } from '../../../common/tools'
import { updateResourcequota } from '../../../../client/actions/applyLimit'
// import { removeOldFormFieldsByRegExp } from '../../../actions/quick_create_app';
import QueueAnim from 'rc-queue-anim'
import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/compact'
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
  let definitions = {}
  for (const value of resourceDefinitions){
    for(const child of (value.children || [])){
      definitions[child.resourceType] = child.resourceName
    }
  }
  return definitions
}

const getcolums = ({ setApprovalState, cancelApprovalState, approvalState, resourceDefinitions,
  }) => {
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
    width: 160,
    render: (text, record) => {
      return (
        <span>{formateResourceDefinitions(resourceDefinitions)[record.resource]}</span>
      )
     }
  }, {
    title: '申请集群',
    dataIndex: 'aggregate',
    key: 'aggregate',
    width: 150,
  }, {
    title: '已用',
    dataIndex: 'use',
    key: 'use',
    width: 150,
  }, {
    title: '配额更改为',
    dataIndex: 'applyLimit',
    key: 'applyLimit',
    width: 150,
    render: (text, record) => <span className="appiyLimitNum">{record.applyLimit}</span>,
  },
  //  {
  //   title:
  //   <div>
  //     <span>审批</span>
  //     <span className="allApprovalIcon">
  //       <Tooltip title="全部同意">
  //         <span onClick={setApprovalState.bind(null, 'all')} >
  //           <Icon type={allPassType} className={allPassClass} />
  //         </span>
  //       </Tooltip>
  //     </span>
  //     <span>
  //       <Tooltip title="全部拒绝">
  //         <span onClick={cancelApprovalState.bind(null, 'all')}>
  //           <Icon type={allRefuseType} className={allRefuseClass} />
  //         </span>
  //       </Tooltip>
  //     </span>
  //   </div>,
  //   dataIndex: 'status',
  //   key: 'status',
  //   width: 150,
  //   render: (text, record) => {
  //     let key = parseInt(record.key) - 1
  //     const pass = approvalState[key]
  //     const noPass = !pass
  //     const PassType = pass === true ? 'check-circle' : 'check-circle-o'
  //     const PassClass = pass === true ? 'allPassIcon' : 'notAllPassIcon'

  //     const RefuseType = noPass === true ? 'cross-circle' : 'cross-circle-o'
  //     const RefuseClass = noPass === true ? 'allRefuseIcon' : 'notallRefuseIcon'
  //     return (
  //       <div className="iconItemWrap">
  //         <span className="allApprovalIcon">
  //           <Tooltip title="同意">
  //             <span onClick={setApprovalState.bind(null, key)} >
  //               <Icon type={PassType} className={PassClass} />
  //             </span>
  //           </Tooltip>
  //         </span>
  //         <span>
  //           <Tooltip title="拒绝">
  //             <span onClick={cancelApprovalState.bind(null, key)}>
  //               <Icon type={RefuseType} className={RefuseClass} />
  //             </span>
  //           </Tooltip>
  //         </span>
  //     </div>
  //     )
  //   },
  // }
]
  return columns
}

const findClusersName = ({ id, choiceClusters }) => {
    for (const o of (choiceClusters.data || [])) {
      if (o.clusterID === id) {
        return o.clusterName
      }
    }
}

  const formatTabDate = (applyDetails, approveDetails, choiceClusters, resourceInuse, globaleDevopsQuotaList) => {
    const date = []
    let indexKey = 1
    if (applyDetails && globaleDevopsQuotaList && !_.isEmpty(resourceInuse)) {
      // if (applyDetails && !_.isEmpty(resourceInuse)) {
      for (const key in applyDetails) {
        const clusterName = findClusersName({ id: key, choiceClusters })
        for (const resourcekey in applyDetails[key]) {
          date.push({
            key: indexKey,
            resource: resourcekey,
            aggregate: key === 'global' ? '-' : clusterName, // 全局资源没有集群
            use: (resourceInuse[key] || {})[resourcekey] !== undefined ? resourceInuse[key][resourcekey] : globaleDevopsQuotaList[resourcekey],
            applyLimit: applyDetails[key][resourcekey] || '无限制',
            approvalStatus: approveDetails[key] ? approveDetails[key][resourcekey] !== -1 : false,
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
        body.approveDetails[o.clusterID] = {}
      }
      let NuApplyLimit
      if (o.applyLimit === '无限制') {
        NuApplyLimit = null
      } else {
        NuApplyLimit = parseFloat(o.applyLimit)
      }
      body.approveDetails[o.clusterID][o.resource] = NuApplyLimit;
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
    approvalState: _.fill(Array(1), false), // 审批状态, Array(n) n = data的个数 1 // 表示什么都不是 不默认同意, 也不默认不同意
    loading: false, // 完成审批的loading状
    selectedRowKeys: [],
  }
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    toggleVisable: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    resourceDefinitions: PropTypes.object.isRequired
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
    const { updateResourcequota, toggleVisable, tabData, reload, record: listRecord } = this.props
    const { approvalState } = this.state
    const body = formateUpdateResoure(tabData, approvalState)
    const id = record.id
    updateResourcequota(record.id, {headers: listRecord.namespace} ,body, {
        success: {
          func: res => {
            toggleVisable(undefined, 'success')
            this.setState({ approvalState: _.fill(Array(1), false) })
            this.setState({ selectedRowKeys: [] })
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
  cnacelModal = () => {
    const { cancelApprovalModal } = this.props
    this.setState({ approvalState: _.fill(Array(1), false), })
    this.setState({ selectedRowKeys: [] })
    cancelApprovalModal()
  }
  render() {
    const { visible, toggleVisable, record, title, resourcequoteRecord,
      choiceClusters, tabData,
      resourceDefinitions, cancelApprovalModal, detailDataisFetching } = this.props
    const { approvalState, selectedRowKeys } = this.state
    const setApprovalState = this.setApprovalState
    const cancelApprovalState = this.cancelApprovalState
    const { isFetching, data: recordData = {} } = resourcequoteRecord
    const tabDataLength = this.props.tabData.length
    let approvalStateArr = approvalState.slice(0, tabDataLength)
    let approvalPass = 0

    const accountType = '共享项目'
    if (!_.isEmpty(approvalStateArr)) {
      for(const value of approvalStateArr) {
        if (value === true) {
          approvalPass ++
        }
      }
    }
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      onSelect: (record, selected, selectedRows) => {
        this.cancelApprovalState('all')
        for(const value of selectedRows) {
          this.setApprovalState(value.key - 1)
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        // console.log('selected', selected,);
        // console.log('selectedRows',selectedRows,);
        // console.log('changeRows', changeRows);
        if(selected === true) { // 表示全部选中
          this.setApprovalState('all')
        }
        if(selected === false) { //表示全部取消
          this.cancelApprovalState('all')
        }
      },
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      selectedRowKeys: selectedRowKeys,
    }
    const rowClick = (record, index, e) => {
      const newselectedRowKeys = cloneDeep(selectedRowKeys)
      if (newselectedRowKeys.includes(index+1)){
        delete newselectedRowKeys[selectedRowKeys.findIndex(v=> v===index+1)]
      } else {
        newselectedRowKeys.push(index + 1)
      }
      this.setState({ selectedRowKeys: compact(newselectedRowKeys) })
      const { approvalState } = this.state
      if (approvalState[index] === true) {
        this.cancelApprovalState(index)
      } else {
        this.setApprovalState(index)
      }
    }
    return (
      <Modal
        visible = {visible}
        title = {title}
        onCancel={ this.cnacelModal }
        footer={[
          <span className="ApprovalOperation result-wrap" key="span">
            <span>申请时间:</span><span className="result">{calcuDate(recordData.createTime)}</span>
          </span>,
          <Button key="cancel" size="large" onClick={this.cnacelModal}>
            取消
          </Button>,
          <Tooltip title={`${approvalPass} 个通过, ${tabDataLength-approvalPass} 个拒绝`}>
            <Button key="makeSure" type="primary" size="large" onClick={this.fetchApprovalResult.bind(null, record)}
            >
                <span>{`确认通过 (${approvalPass})`}</span>
            </Button>
          </Tooltip>,
        ]}
        width={700}
      >
        <div className="ApprovalOperation">
          <FormItem
            label="申请项目" {...formItemLayout}
          >
            <Input value={recordData.displayName} disabled/>
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
            detailDataisFetching === false ?
            <QueueAnim>
            <div key='table'>
            <span className="alertTips" >tips: 选择可以通过的申请, 未选择的表示拒绝申请</span>
            <Table columns={getcolums({ setApprovalState, cancelApprovalState, approvalState, resourceDefinitions })} dataSource={tabData} pagination={false} size="small"
              scroll={{ y: 120 }} loading={isFetching} rowSelection={rowSelection}
              onRowClick={rowClick}/>
            </div>
            </QueueAnim> : null
          }

        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (state, props) => {
  const detailData = getDeepValue(state, [ 'applyLimit', 'resourcequotaDetail' ])
  // const projectName = getDeepValue(state, [ 'entities', 'current', 'space', 'projectName' ])
  const choiceClustersObject = state.projectAuthority.projectVisibleClusters
  const choiceClusters = choiceClustersObject[props.record.namespace] || {}
  const { data: recordData = {} , isFetching: detailDataisFetching} = detailData
  const { applyDetails, approveDetails } = recordData
  let resourceInuse = props.resourceInuseProps
  let globaleDevopsQuotaList = props.globaleDevopsQuotaList
  const tabData = formatTabDate(applyDetails, approveDetails, choiceClusters, resourceInuse, globaleDevopsQuotaList)
  return {
    resourcequoteRecord: detailData, choiceClusters,tabData,detailDataisFetching
  }
}
export default connect(mapStateToProps, {
  updateResourcequota
})(ApprovalOperation)
