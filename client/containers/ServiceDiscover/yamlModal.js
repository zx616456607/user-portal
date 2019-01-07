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
import Yaml from '../../components/EditorModule'
import * as dnsRecordActions from '../../actions/dnsRecord'
import Notification from '../../../src/components/Notification'
import './style/index.less'

const notification = new Notification()

class YamlModal extends React.Component {
  state = {
    appDescYaml: undefined,
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
      // 解决光标问题： 动画结束（dom可获取）渲染数据，=> 显示滚动条
      setTimeout(() => {
        this.setState({
          appDescYaml,
          yamlStr: appDescYaml,
        })
      }, 200)
    })
  }

  handleOk = () => {
    const { changeDnsItem, cluster, editItem, loadData } = this.props
    const { appDescYaml, yamlStr } = this.state
    const body = yaml.safeLoad(appDescYaml)
    if (!body) {
      return notification.info('DNS 记录不能为空')
    }
    if (appDescYaml === yamlStr) {
      return editItem()
    }
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
          const { message, statusCode } = err
          notification.close()
          if (statusCode === 412) {
            return
          }
          notification.warn('修改 DNS 记录失败，请检查 yaml', message.message)
        },
      },
    })
  }
  onChangeCurrEditorValue = appDescYaml => {
    this.setState({
      appDescYaml,
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
      width={700}
      className="yamlModal"
    >
      <Yaml
        onChange={this.onChangeCurrEditorValue}
        value={appDescYaml}
        height={400} />
      <div className="changePrompt">为确保可见可用，请谨慎编辑列表对应字段</div>
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
