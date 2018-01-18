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
import { connect } from 'react-redux'
import {
  Modal, Form, Select, InputNumber, Tooltip, Icon, Tag,
  Row, Col, Slider,
} from 'antd'
import { camelize } from 'humps'
import cloneDeep from 'lodash/cloneDeep'
import { DEFAULT_REGISTRY } from '../../../constants'
import { loadRepositoriesTags } from '../../../actions/harbor'
import { rollingUpdateService } from '../../../actions/services'
import NotificationHandler from '../../Notification'
import './style/GrayscaleUpgradeModal.less'

const FormItem = Form.Item
const Option = Select.Option

class GrayscaleUpgradeModal extends React.Component {
  state = {
    containers: [],
    newCount: 0,
    confirmLoading: false,
  }

  parseImage = image => {
    let tagIndex = image.indexOf(':')
    if(tagIndex < 0) {
      tagIndex = image.length
    }
    const tag = image.substr(tagIndex + 1)
    const imageSrc = image.substring(0, tagIndex)
    const fullName = image.substring(image.indexOf('/') + 1, tagIndex)
    return {
      tag,
      imageSrc,
      fullName,
    }
  }

  componentWillMount() {
    const { service, loadRepositoriesTags, registry } = this.props
    if (!service) {
      return
    }
    const serviceStatus = service.status || {}
    const serviceReplicas = service.spec && service.spec.replicas
    const isRollingUpdate = serviceStatus.phase === 'RollingUpdate'
    let targetTag
    let newCount = 0
    console.log('service', {
      service,
    })
    if (isRollingUpdate) {
      const annotations = service.metadata.annotations || {}
      const currentImages = JSON.parse(annotations['rollingupdate/target'] || '{}')
      const image = currentImages[0] && currentImages[0].to || ''
      targetTag = this.parseImage(image).tag
      newCount = parseInt(annotations['rollingupdate/newCount'])
    }
    const containers = cloneDeep(service.spec.template.spec.containers)
    containers.map((container) => {
      const { image } = container
      container.imageObj = this.parseImage(image)
    })
    console.log('xxx', {
      isRollingUpdate,
      newCount,
      targetTag,
      containers,
    })
    this.setState({
      isRollingUpdate,
      newCount,
      targetTag,
      containers,
    })
    containers.map((container) => {
      let { imageObj } = container
      loadRepositoriesTags(registry, imageObj.fullName)
    })
  }

  handleSubmit = () => {
    const {
      form, rollingUpdateService, cluster, service, loadServiceList,
      onCancel, appName,
    } = this.props
    const { validateFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const { targetTag, newCount, interval } = values
      const serviceName = service.metadata.name
      const replicas = service.spec.replicas
      const { containers } = this.state
      const currentContainer = containers[0]
      const targets = {}
      targets[currentContainer.name] = `${currentContainer.imageObj.imageSrc}:${targetTag}`
      const body = {
        type: 0,
        targets,
        interval,
        oldCount: replicas - newCount,
        newCount,
      }
      const notification = new NotificationHandler()
      rollingUpdateService(cluster, serviceName, body, {
        success: {
          func: () => {
            loadServiceList(cluster, appName)
            setTimeout(function () {
              notification.success(`服务 ${serviceName} 灰度发布已成功开启`)
            }, 300)
            onCancel()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            setTimeout(function () {
              notification.error(`服务 ${serviceName} 开启灰度发布失败`)
            }, 300)
          }
        },
        finally: {
          func: () => {
            this.setState({
              confirmLoading: false,
            })
          }
        },
      })
    })
  }

  render() {
    const { onCancel, cluster, service, form, imageTags } = this.props
    const { containers, newCount, isRollingUpdate, targetTag } = this.state
    const { getFieldProps, setFieldsValue } = form
    const targetTagProps = getFieldProps('targetTag', {
      initialValue: targetTag,
      rules: [
        { required: true, message: '请选择目标版本' },
      ],
    })
    const newCountProps = getFieldProps('newCount', {
      initialValue: newCount,
      rules: [
        { required: true, message: '请选择目标版本数量' }
      ],
      onChange: value => {
        if (value < this.state.newCount) {
          value = 0
          setTimeout(() => setFieldsValue({
            newCount: value,
          }), 100)
        }
        this.setState({ newCount: value })
      },
    })
    const intervalProps = getFieldProps('interval', {
      initialValue: 10,
      rules: [
        { required: true, message: '请填写更新间隔' }
      ],
    })
    const currentContainer = containers[0]
    let currentImageTags = imageTags[currentContainer.imageObj.fullName]
    currentImageTags = currentImageTags && currentImageTags.tag || []
    const replicas = service.spec.replicas
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    return (
      <Modal
        title="灰度升级"
        visible={true}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        width={600}
        maskClosable={false}
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
            {service.metadata.name}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="镜像版本"
          >
            {currentContainer.image}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="总实例数"
          >
            {/* <InputNumber placeholder="总实例数" />&nbsp;个 */}
            {replicas} 个
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="当前版本"
          >
            <Row>
              <Col span={15}>
                <Tag className="old-tag">old</Tag>
                {currentContainer.imageObj.tag}
              </Col>
              <Col span={8} className="text-align-right">
                {replicas - newCount} 个
                （{parseInt((replicas - newCount) / replicas * 100)}%）
              </Col>
            </Row>
          </FormItem>
          <Row className="target-tag">
            <Col span={4}>目标版本</Col>
            <Col span={20}>
              <Row>
                <Col span={15}>
                  <Tag className="new-tag">new</Tag>
                  <FormItem className="">
                    <Select placeholder="选择灰度版本" {...targetTagProps} disabled={isRollingUpdate}>
                      {
                        currentImageTags.map(tag => {
                          let disabled = false
                          if (tag === currentContainer.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Option key={tag} value={tag} disabled={disabled}>
                              {tag}
                            </Option>
                          )
                        })
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col span={8} className="text-align-right">
                  {newCount} 个（
                  {parseInt(newCount / replicas * 100)}%）
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={4}>
            </Col>
            <Col span={18}>
              <Slider
                marks={{ '0': 0, [replicas]: replicas }}
                min={0}
                max={replicas}
                {...newCountProps}
              />
            </Col>
          </Row>
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
            <InputNumber min={10} placeholder="建议 2~60s" {...intervalProps} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    imageTags
  } = state.harbor
  const targetImageTag = imageTags[DEFAULT_REGISTRY] || {}
  return {
    registry: DEFAULT_REGISTRY,
    imageTags: targetImageTag,
  }
}

export default connect(mapStateToProps, {
  loadRepositoriesTags,
  rollingUpdateService,
})(Form.create()(GrayscaleUpgradeModal))
