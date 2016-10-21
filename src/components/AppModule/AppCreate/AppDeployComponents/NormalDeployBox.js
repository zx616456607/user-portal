/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * NormalDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch } from 'antd'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { loadImageDetailTag, loadImageDetailTagConfig, loadFreeVolume } from '../../../../actions/app_center'
import "./style/NormalDeployBox.less"

const Option = Select.Option;
const OptGroup = Select.OptGroup;
const createForm = Form.create;
const FormItem = Form.Item;
let uuid = 0;
const MyComponent = React.createClass({
  remove(k) {
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    volumeKey = volumeKey.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      volumeKey,
    });
  },
  componentWillMount() {
    
  },
  add() {
    uuid++;
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    volumeKey = volumeKey.concat(uuid);
    form.setFieldsValue({
      volumeKey,
    });
  },
  render: function () {
    const { getFieldProps, getFieldValue, } = this.props.form
    getFieldProps('volumeKey', {
      initialValue: [1],
    });
    const formItems = getFieldValue('volumeKey').map((k) => {
      return (
        <FormItem key={`volume${k}`}>
          <span className="url" {...getFieldProps(`volumePath${k}`, {}) }>/var/www/html</span>
          <Select className="imageTag" size="large"
            defaultValue="我就是最快的SSD"
            style={{ width: 200 }}
            {...getFieldProps(`volumeName${k}`, {}) }>
            <Option value="ext4/volumeName">volumeName ext4 1024M</Option>
          </Select>
          <Checkbox className="readOnlyBtn" { ...getFieldProps(`volumeChecked${k}`, {}) }>
            只读
          </Checkbox>
          <i className="fa fa-refresh"/>
          <i className="fa fa-trash"/>
        </FormItem>
      )
    });
    return (
      <div className="serviceOpen" key="had">
        {formItems}
      </div>
    )
  }
})

function loadImageTags(props) {
  const { registry, currentSelectedImage, loadImageDetailTag } = props
  loadImageDetailTag(registry, currentSelectedImage, {
    success: {
      func: (result) => {
        const LATEST = 'latest'
        let tag = result.data[0]
        if (result.data.indexOf(LATEST) > -1) {
          tag = LATEST
        }
        loadImageTagConfigs(tag, props)
        const { setFieldsValue } = props.form
        setFieldsValue({
          imageVersion: tag
        })
      },
      isAsync: true
    }
  })
}

function setPorts(containerPorts, form) {
  const portsArr = []
  if (containerPorts) {
    containerPorts.map(function (item, index) {
      portsArr.push((index + 1));
      form.setFieldsValue({
        portKey: portsArr,
        ['targetPortUrl' + (index + 1)]: item.split('/')[0],
        ['portType' + (index + 1)]: item.split('/')[1],
      })
    })
  }
}

function setEnv(defaultEnv, form) {
  const envArr = []
  if (defaultEnv) {
    defaultEnv.map(function (item, index) {
      envArr.push((index + 1));
      form.setFieldsValue({
        envKey: envArr,
        ['envName' + (index + 1)]: item.split('=')[0],
        ['envValue' + (index + 1)]: item.split('=')[1],
      })
    })
  }
}

function loadImageTagConfigs(tag, props) {
  const { currentSelectedImage, loadImageDetailTagConfig, scope, checkState } = props
  loadImageDetailTagConfig(DEFAULT_REGISTRY, currentSelectedImage, tag, {
    success: {
      func: (result) => {
        if (checkState === '修改') {
          return
        }
        const { form } = props
        const { containerPorts, defaultEnv } = result.data
        setPorts(containerPorts, form)
        setEnv(defaultEnv, form)
      },
      isAsync: true
    }
  })
}

let NormalDeployBox = React.createClass({
  propTypes: {
    currentSelectedImage: PropTypes.string.isRequired,
    imageTags: PropTypes.array.isRequired,
    imageTagsIsFetching: PropTypes.bool.isRequired,
    loadImageDetailTag: PropTypes.func.isRequired,
    loadImageDetailTagConfig: PropTypes.func.isRequired,
    selectComposeType: PropTypes.func.isRequired,
  },
  selectComposeType(type) {
    const parentScope = this.props.scope
    parentScope.setState({
      composeType: type
    })
  },
  onSelectTagChange(tag) {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      imageVersion: tag
    })
    loadImageTagConfigs(tag, this.props)
  },
  userExists(rule, value, callback) {
    if (!value) {
      callback()
    } else {
      setTimeout(() => {
        if (!/^[a-z][a-z0-9-]*$/.test(value)) {
          callback([new Error('抱歉，该服务名称不合法.')])
        } else {
          callback()
        }
      },800)
    }
  },
  componentWillMount() {
    loadImageTags(this.props)
  },
  componentWillReceiveProps(nextProps) {
    const {serviceOpen} = nextProps
    if (serviceOpen == this.props.serviceOpen) {
      return
    }
    if (serviceOpen) {
      loadImageTags(nextProps)
    }
  },
  render: function () {
    const parentScope = this.props.scope;
    const { imageTags, imageTagsIsFetching, form, composeType } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, min: 3, max: 24, message: '服务名称至少为 3~24 个字符' },
        { validator: this.userExists },
      ],
    });
    const {registryServer, currentSelectedImage} = this.props
    const imageUrlProps = registryServer + '/' + currentSelectedImage
    const selectProps = getFieldProps('imageVersion', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
    })
    
    return (
      <div id="NormalDeployBox">
        <div className="topBox">
          <div className="inputBox">
            <span className="commonSpan">服务名称</span>
            <FormItem className="serviceNameForm"
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}>
              <Input {...nameProps} size="large" placeholder="起一个萌萌哒的名字吧~" autoComplete="off" />
            </FormItem>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="inputBox">
            <span className="commonSpan">镜像地址</span>
            <FormItem className="imageUrlForm" hasFeedback>
              <Input className="imageInput" size="large" value={imageUrlProps} />
              <div style={{ clear: "both" }}></div>
            </FormItem>
            <Button className="checkBtn" size="large" type="primary" onClick={this.checkImageUrl} disabled>检查地址</Button>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="inputBox">
            <span className="commonSpan">镜像版本</span>
            <FormItem className="imageTagForm">
              <Select
                {...selectProps}
                className="imageTag" size="large" tyle={{ width: 200 }}
                placeholder="请选择镜像版本"
                notFoundContent="镜像版本为空"
                defaultActiveFirstOption={true}
                onSelect={this.onSelectTagChange}
                >
                  {imageTags && imageTags.map((tag) => {
                    return (
                      <Option key={tag} value={tag}>{tag}</Option>
                    )
                  })}
              </Select>
            </FormItem>
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div className="infoBox">
          <div className="commonTitle">
            <div className="line"></div>
            <span className="titleSpan">基本配置</span>
            <span className="titleIntro">服务的计算资源、服务类型、以及实例个数等设置</span>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="operaBox">
            <div className="selectCompose">
              <span className="commonSpan">容器配置</span>
              <ul className="composeList">
                <li className="composeDetail">
                  <Button type={composeType == "1" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "1")}>
                    <div className="topBox">
                      1X
                   </div>
                    <div className="bottomBox">
                      <span>256M&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "2" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "2")}>
                    <div className="topBox">
                      2X
                   </div>
                    <div className="bottomBox">
                      <span>512M&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "4" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "4")}>
                    <div className="topBox">
                      4X
                   </div>
                    <div className="bottomBox">
                      <span>1GB&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "8" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "8")}>
                    <div className="topBox">
                      8X
                   </div>
                    <div className="bottomBox">
                      <span>2GB&nbsp;内存</span><br />
                      <span>1CPU&nbsp;(共享)</span>
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "16" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "16")}>
                    <div className="topBox">
                      16X
                   </div>
                    <div className="bottomBox">
                      <span>4GB&nbsp;内存</span><br />
                      <span>1CPU</span>
                    </div>
                  </Button>
                </li>
                <li className="composeDetail">
                  <Button type={composeType == "32" ? "primary" : "ghost"} onClick={this.selectComposeType.bind(this, "32")}>
                    <div className="topBox">
                      32X
                   </div>
                    <div className="bottomBox">
                      <span>8GB&nbsp;内存</span><br />
                      <span>2CPU</span>
                    </div>
                  </Button>
                </li>
                <div style={{ clear: "both" }}></div>
              </ul>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="stateService">
              <span className="commonSpan">服务类型</span>
              <Switch className="changeBtn"
                {...getFieldProps('volumeSwitch', {
                  valuePropName: 'checked'
                }) }
                />
              <span className="stateSpan">{form.getFieldValue('volumeSwitch') ? "有状态服务" : "无状态服务"}</span>
              {form.getFieldValue('volumeSwitch') ? [
                <MyComponent parentScope={parentScope} form={form} />
              ] : null}
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="containerNum">
              <span className="commonSpan">容器数量</span>
              <FormItem>
                <InputNumber className="inputNum"
                  {...getFieldProps('instanceNum', {
                    initialValue: '1'
                  }) }
                  size="large" min={1} max={100} />
                &nbsp;&nbsp;个
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultImageTags = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    tag: []
  }
  const {imageTag} = state.getImageTag
  const {registry, tag, isFetching, server } = imageTag[DEFAULT_REGISTRY] || defaultImageTags
  const {currentSelectedImage} = props

  return {
    registry,
    registryServer: server,
    imageTags: tag || [],
    imageTagsIsFetching: isFetching,
    currentSelectedImage
  }
}

NormalDeployBox = connect(mapStateToProps, {
  loadImageDetailTag,
  loadImageDetailTagConfig,
})(NormalDeployBox)

export default NormalDeployBox