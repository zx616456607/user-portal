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
import ServiceCommonIntl, { AppServiceDetailIntl } from '../../../../../../src/components/AppModule/ServiceIntl'
import { injectIntl } from 'react-intl'
import TenxIcon from '@tenx-ui/icon/es/_old'

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

  getSysLogo = node => {
    const style = { color: '#2db7f5', marginRight: '5px' }
    switch (node.os) {
      case 'linux': {
        if (node.arch === 'arm64') {
          return <TenxIcon style={style} type="Arm" />
        }
        return <TenxIcon style={style} type="Linux" />
      }
      case 'windows': {
        return <TenxIcon style={style} type="windows" />
      }
      default:
        break
    }
  }

  render() {
    const { form: { getFieldProps }, clusterNodes, hostValue,
      intl: { formatMessage },
    } = this.props
    const hostNameProps = getFieldProps('hostName', {
      rules: [{
        required: true,
        message: formatMessage(AppServiceDetailIntl.pleaseBindNode),
      }],
      initialValue: hostValue,
      onChange: this.changeHostName,
    })
    return <FormItem>
      <Select
        size="large"
        placeholder={formatMessage(AppServiceDetailIntl.pleaseBindNode)}
        showSearch
        optionFilterProp="children"
        {...hostNameProps}
        style={{ minWidth: 290 }}
      >
        <Select.Option
          key={SYSTEM_DEFAULT_SCHEDULE}
          value={SYSTEM_DEFAULT_SCHEDULE}
        >
          {formatMessage(AppServiceDetailIntl.systemDefaultDispatch)}
        </Select.Option>
        {
          clusterNodes.map(node => {
            const { name, ip, podCount, schedulable, isMaster } = node
            const prompt = `${name} | ${ip} ( ${formatMessage(AppServiceDetailIntl.containerPod)}: ${podCount} ${formatMessage(ServiceCommonIntl.units)})`
            return <Select.Option key={name} disabled={isMaster || !schedulable}>
              {this.getSysLogo(node)} {prompt}
            </Select.Option>
          })
        }
      </Select>
    </FormItem>
  }
}

export default injectIntl(Form.create()(HostNameContent))
