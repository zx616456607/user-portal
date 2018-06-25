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
import { getAIModelsets } from '.././../../actions/aiops'
import './style/DeployAI.less'

const AI_IMAGE_DATA = [
  {
    image: 'kubeflow/tf-model-server-cpu',
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
    const { current, getAIModelsets, onChange } = this.props
    getAIModelsets(current.cluster.clusterID)
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
          onChange: selectedRowKeys => {
            onChange && onChange({
              runAIImage: selectedRowKeys[0],
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
                    type: labels['tenxcloud.com/shareType'],
                    type_1: labels['tenxcloud.com/pvType'],
                    // volume: `${labels['tenxcloud.com/volumeName']} ext4 ${storage}`,
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
                  {labels['tenxcloud.com/volumeName']}
                </Select.Option>
              )
            }
          </Select>
          <div className="desc-text">数据集将映射到 用户目录/model/[数据集名称] 目录</div>
        </Col>
      </Row>
    </div>
  }
}

const mapStateToProps = (
  {
    entities: { loginUser, current },
    aiops: { modelsets = {} },
  }
) => ({
  loginUser: loginUser.info,
  current,
  modelsets,
})

export default connect(mapStateToProps, {
  getAIModelsets,
})(DeployAI)
