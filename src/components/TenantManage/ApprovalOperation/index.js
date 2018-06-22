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
import { Modal, Button, Form, Input, Table, Icon, Tooltip } from 'antd'
// import classnames from 'classnames'
import PropTypes from 'prop-types'
import './style/index.less'
import _ from 'lodash'

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
      // console.log('pass', Pass)
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

const data = [
  {
    key: '1',
    resource: '1',
    aggregate: '集群1',
    use: 1,
    applyLimit: -2,
  }, {
    key: '2',
    resource: '1',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }, {
    key: '3',
    resource: '1',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }, {
    key: '4',
    resource: '1',
    aggregate: '集群2',
    use: 1,
    applyLimit: -2,
  }]

class ApprovalOperation extends React.Component {
  state = {
    approvalState: _.fill(Array(4), false), // 审批状态, Array(n) n = data的个数
  }
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    toggleVisable: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  }
  setApprovalState = key => {
    const { approvalState } = this.state
    if (key === 'all') {
      if (approvalState.every( x => x === true )) {
        return
      }
      this.setState({ approvalState: _.fill(approvalState, true) })
      return
    }
    approvalState[parseInt(key)] = true
    this.setState({ approvalState })
  }
  cancelApprovalState = key => {
    const { approvalState } = this.state
    if (key === 'all') {
      if (approvalState.every( x => x === false )) {
        return
      }
      this.setState({ approvalState: _.fill(approvalState, false) })
      return
    }
    approvalState[parseInt(key)] = false
    this.setState({ approvalState })
  }
  render() {
    const { visible, toggleVisable, record, title } = this.props
    const { approvalState } = this.state
    const setApprovalState = this.setApprovalState
    const cancelApprovalState = this.cancelApprovalState

    return (
      <Modal
        visible = {visible}
        title = {title}
        onCancel={ toggleVisable }
        footer={[
          <span className="ApprovalOperation result-wrap">
            <span>申请时间:</span><span className="result">两天前</span>
          </span>,
          <Button key="cancel" size="large" onClick={toggleVisable}>
            取消
          </Button>,
          <Button key="makeSure" type="primary" size="large" onClick={toggleVisable}>
              完成审批
          </Button>,
        ]}
        width={700}
      >
        <div className="ApprovalOperation">
          <FormItem
            label="申请项目" {...formItemLayout}
          >
            <Input value={record}/>
          </FormItem>
          <FormItem
            label="申请人" {...formItemLayout}
          >
            <Input value={'申请人'}/>
          </FormItem>
          <FormItem
            label="申请原因" {...formItemLayoutLarge}
          >
            <Input value={'babab'} type="textarea" rows={4}/>
          </FormItem>
          <Table columns={getcolums({ setApprovalState, cancelApprovalState, approvalState})} dataSource={data} pagination={false} size="small"
            scroll={{ y: 120 }}/>
        </div>
      </Modal>
    )
  }
}

export default ApprovalOperation

