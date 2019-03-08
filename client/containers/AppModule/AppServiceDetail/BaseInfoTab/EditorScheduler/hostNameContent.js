/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * editor Scheduler
 *
 * @author lvjunfeng
 * @date 2019-02-28
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Select } from 'antd'
import { SYSTEM_DEFAULT_SCHEDULE } from '../../../../../../src/constants'
import * as clusterActions from '../../../../../../src/actions/cluster_node'
const FormItem = Form.Item

const mapStateToProps = ({
  entities: { current: { cluster: { clusterID } } },
  cluster_nodes: { clusterNodes },
}) => {
  const nodeList = []
  const listData = clusterNodes[clusterID] || []
  listData.forEach(item => {
    if (!item.taints) {
      nodeList.push(item)
    }
  })
  return {
    clusterID,
    listNodes: 8,
    clusterNodes: nodeList,
  }
}

@connect(mapStateToProps, {
  getNodes: clusterActions.getNodes,
})
class HostNameContent extends React.PureComponent {

  componentDidMount = async () => {
    const { getNodes, clusterID } = this.props
    await getNodes(clusterID)
  }

  changeHostName = hostName => {
    const { setHostValue } = this.props
    setHostValue(hostName)
  }

  render() {
    const { form: { getFieldProps }, clusterNodes, hostValue } = this.props
    const hostNameProps = getFieldProps('hostName', {
      rules: [{
        required: true,
        message: '请选择绑定节点',
      }],
      initialValue: hostValue,
      onChange: this.changeHostName,
    })
    return <FormItem>
      <Select
        size="large"
        placeholder={'请选择绑定节点'}
        showSearch
        optionFilterProp="children"
        {...hostNameProps}
        style={{ minWidth: 290 }}
      >
        <Select.Option
          key={SYSTEM_DEFAULT_SCHEDULE}
          value={SYSTEM_DEFAULT_SCHEDULE}
        >
          使用系统默认调度
        </Select.Option>
        {
          clusterNodes.map(node => {
            const { name, ip, podCount, schedulable, isMaster } = node
            return <Select.Option key={name} disabled={isMaster || !schedulable}>
              {name} | {ip} (容器：{podCount} 个)
            </Select.Option>
          })
        }
      </Select>
    </FormItem>
  }
}

export default Form.create()(HostNameContent)
