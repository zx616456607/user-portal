/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * modal of Edit yaml
 *
 * v0.1 - 2018-07-10
 * @author lvjunfeng
 */

import React from 'react'
import { Modal } from 'antd'
import yaml from 'js-yaml'
import { connect } from 'react-redux'
import YamlEditor from '../../../src/components/Editor/Yaml'
import * as dnsRecordActions from '../../actions/dnsRecord'
import Notification from '../../../src/components/Notification'
import './style/index.less'

const notification = new Notification()
const EditOpts = { readOnly: false }

class YamlModal extends React.Component {
  state = {
    appDescYaml: '',
    yamlStr: '',
  }

  componentDidMount() {
    const { targetName, cluster, getDnsItemDetail } = this.props
    getDnsItemDetail(cluster, targetName, {
      failed: {
        func: err => {
          const { message } = err
          notification.close()
          notification.warn('获取 DNS 记录', message.message)
        },
      },
    }).then(res => {
      const appDescYaml = yaml.dump(res.response.result.data)
      this.setState({
        appDescYaml,
        yamlStr: appDescYaml,
      })
    })
  }

  editYamlSetState = val => {
    // this function for yaml edit callback function
    this.setState({
      appDescYaml: val,
    })
  }

  handleOk = () => {
    const { changeDnsItem, cluster, editItem, loadData } = this.props
    const { appDescYaml, yamlStr } = this.state
    if (appDescYaml === yamlStr) {
      return notification.info('未修改 DNS 记录')
    }
    const body = yaml.safeLoad(appDescYaml)
    delete body.status
    delete body.metadata.creationTimestamp
    delete body.metadata.namespace
    // delete body.metadata.resourceVersion
    delete body.metadata.selfLink
    delete body.metadata.uid
    delete body.spec.sessionAffinity
    changeDnsItem(cluster, body, {
      success: {
        func: () => {
          notification.close()
          notification.success('修改 DNS 记录成功')
          editItem()
          loadData()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { message } = err
          notification.close()
          notification.warn('修改 DNS 记录失败，请检查 yaml', message.message)
        },
      },
    })
  }

  render() {
    const { appDescYaml } = this.state
    const { visible, editItem } = this.props
    return <Modal
      title="查看 / 编辑 Yaml"
      visible={visible}
      onOk={this.handleOk}
      confirmLoading={this.state.confirmLoading}
      onCancel={editItem}
      width={600}
    >
      <YamlEditor value={appDescYaml} options={EditOpts} callback={this.editYamlSetState} />
    </Modal>
  }
}
const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, {
  getDnsItemDetail: dnsRecordActions.getDnsItemDetail,
  changeDnsItem: dnsRecordActions.changeDnsItem,
})(YamlModal)
