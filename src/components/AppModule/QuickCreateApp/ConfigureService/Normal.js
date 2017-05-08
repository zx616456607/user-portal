/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: normal configure for service
 *
 * v0.1 - 2017-05-04
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { Row, Col, Form, InputNumber, Tooltip, Icon } from 'antd'
import ResourceSelect from '../../../ResourceSelect'
import './style/Normal.less'

const FormItem = Form.Item

export default React.createClass({
  componentWillMount() {
    const { fields, form } = this.props
    if (!fields || !fields.replicas) {
      form.setFieldsValue({
        replicas: 1,
      })
    }
  },
  onResourceChange({ resourceType, DIYMemory, DIYCPU }) {
    console.log(resourceType, DIYMemory, DIYCPU)
    const { setFieldsValue } = this.props.form
    setFieldsValue({ resourceType, DIYMemory, DIYCPU })
  },
  render() {
    const { formItemLayout, form, standardFlag, fields } = this.props
    const { getFieldProps } = form
    const { resourceType, DIYMemory, DIYCPU } = fields || {}
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true },
      ],
    })
    const resourceTypeProps = getFieldProps('resourceType', {
      rules: [
        { required: true },
      ],
    })
    const DIYMemoryProps = getFieldProps('DIYMemory')
    const DIYCPUProps = getFieldProps('DIYCPU')
    return (
      <div id="normalConfigureService">
        <Row className="header">
          <Col span={3} className="left">
            <div className="line"></div>
            <span className="title">基本配置</span>
          </Col>
          <Col span={21}>
            <div className="desc">服务的计算资源、服务类型、以及实例个数等设置</div>
          </Col>
        </Row>
        <div className="body">
          <FormItem
            {...formItemLayout}
            label={
              <div>
                容器配置&nbsp;
                {
                  standardFlag && (
                    <Tooltip title="专业版及企业认证用户可申请扩大容器配置">
                      <a>
                        <Icon type="question-circle-o" />
                      </a>
                    </Tooltip>
                  )
                }
              </div>
            }
            hasFeedback
          >
            <ResourceSelect
              standardFlag={standardFlag}
              onChange={this.onResourceChange}
              resourceType={resourceType && resourceType.value}
              DIYMemory={DIYMemory && DIYMemory.value}
              DIYCPU={DIYCPU && DIYCPU.value}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label={
              <div>
                服务类型&nbsp;
                <a href="http://docs.tenxcloud.com/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie" target="_blank">
                  <Tooltip title="若需数据持久化，请使用有状态服务">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </a>
              </div>
            }
            hasFeedback
          >
            服务类型
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label="实例数量"
            className="replicasFormItem"
          >
            <InputNumber
              size="large"
              min={1}
              max={10}
              {...replicasProps}
            />
            <div className="unit">个</div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label="映射端口"
            hasFeedback
          >
            映射端口
          </FormItem>
        </div>
      </div>
    )
  }
})