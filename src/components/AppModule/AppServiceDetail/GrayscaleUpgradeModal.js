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
  Row, Col, Slider, Button,
} from 'antd'
import { camelize } from 'humps'
import cloneDeep from 'lodash/cloneDeep'
import { DEFAULT_REGISTRY } from '../../../constants'
import { loadRepositoriesTags } from '../../../actions/harbor'
import { rollingUpdateService, rollbackUpdateService } from '../../../actions/services'
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
      image,
      tag,
      imageSrc,
      fullName,
    }
  }

  componentWillMount() {
    const { service, loadRepositoriesTags, registry, harbor } = this.props
    if (!service) {
      return
    }
    const serviceStatus = service.status || {}
    const serviceReplicas = service.spec && service.spec.replicas
    const isRollingUpdate = serviceStatus.phase === 'RollingUpdate'
    let targetTag
    let newCount = 0
    let currentImages
    if (isRollingUpdate) {
      const annotations = service.metadata.annotations || {}
      currentImages = JSON.parse(annotations['rollingupdate/target'] || '{}')
      const image = currentImages[0] && currentImages[0].to || ''
      targetTag = this.parseImage(image).tag
      newCount = annotations['rollingupdate/newCount'] || 0
      if (newCount) {
        newCount = parseInt(newCount)
      }
      this.newCount = newCount
    }
    const containers = cloneDeep(service.spec.template.spec.containers)
    containers.map((container, index) => {
      let { image } = container
      if (isRollingUpdate) {
        image = currentImages[index] && currentImages[index].from || ''
      }
      container.imageObj = this.parseImage(image)
    })
    this.setState({
      isRollingUpdate,
      newCount,
      targetTag,
      containers,
    })
    containers.map((container) => {
      let { imageObj } = container
      loadRepositoriesTags(harbor, registry, imageObj.fullName)
    })
  }

  componentDidMount() {
    const { service, onCancel } = this.props
    const replicas = service.spec.replicas
    const isPrivateVolume = this.isPrivateVolume()
    let title
    if (isPrivateVolume) {
      title = '服务已挂载独享型存储，不能做灰度发布操作'
    } else if (replicas < 2) {
      title = '服务只有 1 个实例，不能做灰度发布操作'
    }
    if (title) {
      onCancel()
      Modal.info({
        title,
        width: 480,
        onOk() {},
      })
    }
  }

  handleSubmit = () => {
    const {
      form, rollingUpdateService, cluster, service, loadServiceList,
      onCancel, appName, rollbackUpdateService,
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
      let action = rollingUpdateService.bind(this, cluster, serviceName, body)
      let msg = '灰度发布'
      if (newCount === 0) {
        action = rollbackUpdateService.bind(this, cluster, serviceName)
        msg = '发布回滚'
      }
      action({
        success: {
          func: () => {
            loadServiceList(cluster, appName)
            setTimeout(function () {
              notification.success(`服务 ${serviceName} ${msg}已成功开启`)
            }, 300)
            onCancel()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            setTimeout(function () {
              notification.error(`服务 ${serviceName} 开启${msg}失败`)
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

  isPrivateVolume(){
    const { service } = this.props
    const { volumeTypeList } = service
    let incloudPrivate = false
    for (let i = 0; i < volumeTypeList.length; i++) {
      if(volumeTypeList[i] == 'private'){
        incloudPrivate = true
        break
      }
    }
    return incloudPrivate
  }

  render() {
    const { onCancel, cluster, service, form, imageTags } = this.props
    const { containers, newCount, isRollingUpdate, targetTag, confirmLoading } = this.state
    const { getFieldProps, setFieldsValue } = form
    const replicas = service.spec.replicas
    if (this.isPrivateVolume() || replicas < 2) {
      return null
    }
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
        if (isRollingUpdate && value < this.newCount) {
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
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    let okText = '确 定'
    if (isRollingUpdate && newCount === 0) {
      okText = '确认发布回滚'
    } else if (isRollingUpdate && newCount === replicas) {
      okText = '确认发布完成'
    }
    return (
      <Modal
        title="灰度发布"
        visible={true}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        width={600}
        maskClosable={false}
        wrapClassName="grayscale-upgrade-modal"
        footer={[
          <Button key="back" type="ghost" size="large" onClick={onCancel}>
          取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={confirmLoading}
            onClick={this.handleSubmit}
            disabled={!isRollingUpdate && newCount === 0}
          >
            {okText}
          </Button>,
        ]}
      >
        <div className="alertRow">
          灰度发布，应用新老版本之间的平滑过渡，发布新版本时不直接替换旧版本，经过一段时间的版本共存来灰度验证。
          <strong>选择灰度发布后，在「灰度发布」期间不能进行「滚动发布」</strong>。
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
            {currentContainer.imageObj.image}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="总实例数"
          >
            {/* <InputNumber placeholder="总实例数" />&nbsp;个 */}
            {replicas} 个 {newCount > 0 && newCount != replicas ? <span style={{color:"#bbb9b9"}}>(+1 个过渡实例) <Tooltip title="在灰度过程中，会有一个当前版本的过渡实例存在，灰度完成或回滚将删除该过渡实例"><Icon type="question-circle-o" /></Tooltip></span>: ""}
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
          { isRollingUpdate && newCount === 0 &&<FormItem
            {...formItemLayout}
            label={<span></span>}>
            <div>
              <span className="rollback_tip">
                <Icon type="exclamation-circle-o" className="tips_icon"/>目标版本实例减少，回滚只确保最终状态为该比例，期间当前版本实例会删除重建
              </span>
            </div></FormItem>
          }
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
                            <Option key={tag} value={tag} disabled={disabled} title={tag}>
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

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    registry: DEFAULT_REGISTRY,
    imageTags: targetImageTag,
    harbor,
  }
}

export default connect(mapStateToProps, {
  loadRepositoriesTags,
  rollingUpdateService,
  rollbackUpdateService
})(Form.create()(GrayscaleUpgradeModal))
