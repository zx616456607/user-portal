/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * secrets config
 *
 * v0.1 - 2018-01-31
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import TenxIcon from '@tenx-ui/icon/es/_old'
import {
  Card, Modal, Input, Button, Popover, Tooltip,
} from 'antd'
import { getSecrets } from '../../../../actions/secrets'
import '../style/SecretsConfig.less'

class SecretsConfig extends React.Component {
  state = {
    currentItem: {},
  }

  componentWillMount() {
    const { currentCluster, getSecrets, service } = this.props
    const { volumes = [] } = service.spec.template.spec
    volumes.length > 0 && getSecrets(currentCluster.clusterID)
  }

  getSecretsConfigMap = () => {
    const { service, secretsList = [] } = this.props
    const secretsConfigMap = []
    const { volumes = [] } = service.spec.template.spec
    volumes.forEach(v => {
      const { secret, name } = v
      if (secret) {
        const { secretName, items } = secret
        const volumeMount = find(
          service.spec.template.spec.containers[0].volumeMounts,
          { name }
        ) || {}
        const currentSecret = find(secretsList, { name: secretName }) || {}
        const currentSecretData = currentSecret.data || {}
        const config = {
          mountPath: volumeMount.mountPath,
          groupName: secretName,
        }
        if (items) {
          const configItems = items.map(({ key }) => ({
            key,
            value: currentSecretData[key],
          }))
          config.items = configItems
        } else {
          config.items = Object.keys(currentSecretData).map(key => ({
            key,
            value: currentSecretData[key],
          }))
          config.isWholeDir = true
        }
        secretsConfigMap.push(config)
      }
    })
    return secretsConfigMap
  }

  render() {
    // const { service } = this.props
    const secretsConfigMap = this.getSecretsConfigMap()
    return (
      <div id="secrets-config">
        <div className="titleBox">
          <div className="commonTitle">
            容器挂载点
          </div>
          <div className="commonTitle">
            配置组
          </div>
          <div className="commonTitle">
            加密对象
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Card className="composeList">
          {
            secretsConfigMap.map((config, index) =>
              <div className="composeDetail" key={index}>
                <Tooltip title={config.mountPath}>
                  <div className="commonData textoverflow">
                    <span>{config.mountPath}</span>
                  </div>
                </Tooltip>
                <div className="commonData">
                  <span>{config.groupName}</span>
                </div>
                <div className="composefile commonData">
                  <span
                    // title="点击查看配置文件"
                    // onClick={() => this.setState({
                    //   currentItem: config.items[0] || {},
                    //   modalConfigFile: true,
                    // })}
                  >
                    {config.items[0] && config.items[0].key}
                  </span>
                  {
                    config.items.length > 1 &&
                    <Popover
                      content={config.items.map(item => (
                        // <a>
                        <div
                          key={item.key}
                          // onClick={() => this.setState({
                          //   currentItem: item,
                          //   modalConfigFile: true,
                          // })}
                        >
                          {item.key}
                        </div>
                        // </a>
                      ))}
                      getTooltipContainer={() => document.getElementById('secrets-config')}
                    >
                      <TenxIcon type="ellipsis" className="more"/>
                    </Popover>
                  }
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
            )
          }
          {
            secretsConfigMap.length === 0 &&
            <div style={{ lineHeight: '60px' }}>暂无配置</div>
          }
          <Modal
            title="查看加密变量"
            wrapClassName="read-configFile"
            visible={this.state.modalConfigFile}
            footer={
              <Button
                type="primary"
                onClick={() => this.setState({ modalConfigFile: false }) }
              >
               确定
              </Button>
            }
            onCancel={() => { this.setState({ modalConfigFile: false }) } }
            width="600px"
          >
            <div className="configFile-name">
              <div className="ant-col-3 key">名称：</div>
              <div className="ant-col-19">
                <Input disabled={true} value={this.state.currentItem.key} />
              </div>
            </div>
            <div className="configFile-wrap">
              <div className="ant-col-3 key">内容：</div>
              <div className="ant-col-19">
                <pre className="configFile-content">
                  {this.state.currentItem.value}
                </pre>
              </div>
            </div>
            <br />
          </Modal>
        </Card>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { entities, secrets } = state
  const { current } = entities
  const { cluster } = current
  let secretsList = secrets.list[cluster.clusterID] || {}
  secretsList = secretsList.data || []
  return {
    currentCluster: cluster,
    secretsList,
  }
}

export default connect(mapStateToProps, {
  getSecrets,
})(SecretsConfig)
