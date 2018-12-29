/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: deploy ai service
 *
 * v0.1 - 2018-06-11
 * @author Zhangpc
 */

import React from 'react'
import { Table, Button, Row, Col, Select } from 'antd'
import { connect } from 'react-redux'
import * as aiopsActions from '.././../../actions/aiops'
import './style/DeployAI.less'
import Notification from '../../../../src/components/Notification'
const notification = new Notification()

const AI_IMAGE_DATA = [
  {
    image: 'system_containers/tf-model-server-cpu',
  },
]

class DeployAI extends React.Component {
  onRowClick = ({ image }) => {
    const { onChange } = this.props
    onChange && onChange({
      runAIImage: image,
    })
  }

  componentDidMount() {
    const { current, getAIModelsets, onChange, aiopsConfig } = this.props
    const { host, apiVersion } = aiopsConfig
    if (host && apiVersion) {
      getAIModelsets(current.cluster.clusterID, {
        failed: {
          func: err => {
            const { statusCode } = err
            if (statusCode === 404) {
              notification.close()
              notification.warn('AI 深度学习配置不可用', '请联系管理员重新配置')
            }
          },
        },
      })
    } else {
      notification.close()
      notification.warn('请在全局配置中配置 AI 服务地址')
    }
    onChange && onChange({
      runAIImage: AI_IMAGE_DATA[0].image,
    })
  }

  render() {
    const { loginUser, modelsets, runAIImage, modelSet, onChange } = this.props
    const registryServer = loginUser.registryConfig.server.replace(/https?:\/\//, '')
    const columns = [
      {
        title: '运行环境',
        dataIndex: 'image',
        render: text => `${registryServer}/${text}`,
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: () => <Button type="primary">选择</Button>,
      },
    ]
    let selectedRowKeys = []
    if (runAIImage) {
      selectedRowKeys = [ runAIImage ]
    }
    return <div className="deployAI">
      <div className="deployAI-env-text">选择运行环境</div>
      <Table
        rowSelection={{
          selectedRowKeys,
          type: 'radio',
          onChange: keys => {
            onChange && onChange({
              runAIImage: keys[0],
            })
          },
        }}
        columns={columns}
        dataSource={AI_IMAGE_DATA}
        rowKey={row => row.image}
        onRowClick={this.onRowClick}
        pagination={false}
      />
      <Row className="deployAI-bind-modelsets">
        <Col span={4} className="deployAI-bind-modelsets-label">绑定模型集</Col>
        <Col span={20}>
          <Select
            showSearch
            size="large"
            optionFilterProp="children"
            placeholder="输入名称选择模型集"
            style={{ width: 200 }}
            value={modelSet}
            onChange={value => {
              const targetModelsets = (modelsets.data
                && modelsets.data.filter(({ metadata: { name } }) => name === value))
                || []
              const targetModelset = targetModelsets[0] || {}
              let modelSetVolumeConfig = {
                mountPath: '/models',
                readOnly: false,
              }
              try {
                const {
                  metadata: { name, labels },
                  spec: { resources: { requests: { storage } } },
                } = targetModelset
                modelSetVolumeConfig = Object.assign(
                  {},
                  modelSetVolumeConfig,
                  {
                    type: labels['system/shareType'],
                    type_1: labels['system/pvType'],
                    // volume: `${labels['system/volumeName']} ext4 ${storage}`,
                    volume: `${name} ext4 ${storage}`,
                  }
                )
              } catch (error) {
                //
              }
              onChange && onChange({
                modelSet: value,
                modelSetVolumeConfig,
              })
            }}
          >
            {
              modelsets.data && modelsets.data.map(({ metadata: { name, labels } }) =>
                <Select.Option value={name}>
                  {labels['system/volumeName']}
                </Select.Option>
              )
            }
          </Select>
        </Col>
      </Row>
    </div>
  }
}

const mapStateToProps = (
  {
    entities: { loginUser, loginUser: { info: { aiopsConfig } }, current },
    aiops: { modelsets = {} },
  }
) => ({
  loginUser: loginUser.info,
  current,
  modelsets,
  aiopsConfig,
})

export default connect(mapStateToProps, {
  getAIModelsets: aiopsActions.getAIModelsets,
})(DeployAI)
