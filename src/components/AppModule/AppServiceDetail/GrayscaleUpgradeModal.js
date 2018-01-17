/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Grayscale upgrade
 *
 * v0.1 - 2018-01-16
 * @author Zhangpc
 */

import React from 'react'
import {
  Modal, Form, Select, InputNumber, Tooltip, Icon, Tag,
  Row, Col, Slider,
} from 'antd'
import './style/GrayscaleUpgradeModal.less'

const FormItem = Form.Item
const Option = Select.Option

export default class GrayscaleUpgradeModal extends React.Component {
  render() {
    const { onCancel } = this.props
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    return (
      <Modal
        title="灰度升级"
        visible={true}
        onCancel={onCancel}
        width={600}
        wrapClassName="grayscale-upgrade-modal"
      >
        <div className="alertRow">
          灰度发布，应用新老版本之间的平滑过渡，发布新版本时不直接替换旧版本，经过一段时间的版本共存来灰度验证。
          <strong>选择灰度发布后，在「灰度升级」期间不能进行「滚动发布」</strong>。
        </div>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="服务名称"
          >
            service
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="镜像版本"
          >
            192.168.1.52/tenx_containers/tomcat:9
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="总实例数"
          >
            <InputNumber placeholder="总实例数" />&nbsp;个
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="当前版本"
          >
            <Row>
              <Col span={18}>
                <Tag className="old-tag">old</Tag>
                v1.0
              </Col>
              <Col span={5} className="text-align-right">
              10个（20%）
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="目标版本"
            className="target-tag"
          >
            <Row>
              <Col span={18}>
                <Tag className="new-tag">new</Tag>
                <Select placeholder="选择灰度版本">
                  <Option value="v1">v1</Option>
                  <Option value="v2">v2</Option>
                </Select>
              </Col>
              <Col span={5} className="text-align-right">
              40个（80%）
              </Col>
            </Row>
            <Row>
              <Col span={22}>
                <Slider defaultValue={30} marks={{ '0': 0, '100': 100 }} />
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={
              <span>
                更新间隔&nbsp;
                <Tooltip title="容器实例升级时间间隔，例如若为 0 秒，则 Pod 在 Ready 后就会被认为是可用状态，继续升级">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            <InputNumber placeholder="建议 2~60s" />
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
