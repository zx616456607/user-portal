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
import ServiceCommonIntl, { AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import { formateStorage } from '../../../actions/storage';
import { getDeepValue } from '../../../../client/util/util';

const FormItem = Form.Item
const Option = Select.Option

class GrayscaleUpgradeModal extends React.Component {
  state = {
    containers: [],
    newCount: 0,
    confirmLoading: false,
  }

  parseImage = image => {
    let tagIndex = image.lastIndexOf(':')
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
    const { formatMessage } = this.props.intl
    const { service, onCancel } = this.props
    const replicas = service.spec.replicas
    const isPrivateVolume = this.isPrivateVolume()
    let title
    if (isPrivateVolume) {
      title = formatMessage(AppServiceDetailIntl.servicePrivateCache)
    } else if (replicas < 2) {
      title = formatMessage(AppServiceDetailIntl.serviceOneInstance)
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
    const { formatMessage } = this.props.intl
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
      let msg = formatMessage(AppServiceDetailIntl.greyPublish)
      if (newCount === 0) {
        action = rollbackUpdateService.bind(this, cluster, serviceName)
        msg = formatMessage(AppServiceDetailIntl.publishreroll)
      }
      action({
        success: {
          func: () => {
            loadServiceList(cluster, appName)
            setTimeout(function () {
              notification.success(formatMessage(AppServiceDetailIntl.openServiceSuccess, {
                serviceName, msg
              }))
            }, 300)
            onCancel()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            setTimeout(function () {
              notification.error(formatMessage(AppServiceDetailIntl.openServiceFailure, {
                serviceName, msg
              }))
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
    const { formatMessage } = this.props.intl
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
        { required: true, message: formatMessage(AppServiceDetailIntl.pleaseChoiceVersion)  },
      ],
    })
    const newCountProps = getFieldProps('newCount', {
      initialValue: newCount,
      rules: [
        { required: true, message: formatMessage(AppServiceDetailIntl.pleaseChoiceVersionNumber) }
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
        { required: true, message: formatMessage(AppServiceDetailIntl.writeUpdateTimeInterval) }
      ],
    })
    const currentContainer = containers[0]
    let currentImageTags = imageTags[currentContainer.imageObj.fullName]
    currentImageTags = currentImageTags && currentImageTags.tagWithOS || []
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    let okText = formatMessage(ServiceCommonIntl.confirm)
    if (isRollingUpdate && newCount === 0) {
      okText = formatMessage(AppServiceDetailIntl.confirmPublishreRool)
    } else if (isRollingUpdate && newCount === replicas) {
      okText = formatMessage(AppServiceDetailIntl.confirmPublishfinish)
    }
    const os = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'imagetagOs' ]) || ''
    const arch = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'imagetagArch' ]) || ''
    const showOs = (() => {
      if (os && arch) {
        const array = os.split('')
        array[0] = array[0].toUpperCase()
        const osStr = array.join('')
        const showArch = arch.toUpperCase()
        if (os === 'windows') {
          return <div>
            <Button className="btnOs" size="small" type="ghost">{osStr} {showArch}</Button>
          </div>
        } else if (os === 'linux') {
          return <div>
            <Button className="btnOs" size="small" type="ghost">{osStr} {showArch}</Button>
          </div>
        }
      }
    })()
    return (
      <Modal
        title={formatMessage(AppServiceDetailIntl.greyPublish)}
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
          {formatMessage(AppServiceDetailIntl.greyPublishInfo)}。
          <strong>{formatMessage(AppServiceDetailIntl.greyPublishInfoStrong)}</strong>。
          {formatMessage(AppServiceDetailIntl.greyPublishInfoAfer)}
        </div>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label={formatMessage(AppServiceDetailIntl.serviceName)}
          >
            {service.metadata.name}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={formatMessage(AppServiceDetailIntl.os)}
          >
            {showOs}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage(AppServiceDetailIntl.mirrorVersion)}
          >
            {currentContainer.imageObj.image}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage(AppServiceDetailIntl.allObjectNumber)}
          >
            {/* <InputNumber placeholder="总实例数" />&nbsp;个 */}
            {replicas} 个 {newCount > 0 && newCount != replicas ? <span style={{color:"#bbb9b9"}}>({formatMessage(AppServiceDetailIntl.plusOneObject)}) <Tooltip title={formatMessage(AppServiceDetailIntl.greyPublishingInfo)}><Icon type="question-circle-o" /></Tooltip></span>: ""}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage(AppServiceDetailIntl.currentVersion)}
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
                <Icon type="exclamation-circle-o" className="tips_icon"/>{formatMessage(AppServiceDetailIntl.reRollReBuild)}
              </span>
            </div></FormItem>
          }
          <Row className="target-tag">
            <Col span={4}>{formatMessage(AppServiceDetailIntl.targetVersion)}</Col>
            <Col span={20}>
              <Row>
                <Col span={15}>
                  <Tag className="new-tag">new</Tag>
                  <FormItem className="">
                    <Select placeholder={formatMessage(AppServiceDetailIntl.choicegreyVersion)} {...targetTagProps} disabled={isRollingUpdate}>
                      {
                        currentImageTags.map(tag => {
                          let disabled = false
                          if (tag.name === currentContainer.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Option key={tag.name} value={tag.name} disabled={disabled || tag.os !== os} title={tag.name}>
                              {tag.name}
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
                {formatMessage(AppServiceDetailIntl.updateInterval)}&nbsp;
                <Tooltip title={formatMessage(AppServiceDetailIntl.upgradeObjectInfo)}>
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            <InputNumber min={10} placeholder={formatMessage(AppServiceDetailIntl.suggest260s)} {...intervalProps} />
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

  const { cluster } =  state.entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    registry: DEFAULT_REGISTRY,
    imageTags: targetImageTag,
    harbor,
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadRepositoriesTags,
  rollingUpdateService,
  rollbackUpdateService
})(Form.create()(GrayscaleUpgradeModal)), { withRef: true, })
