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
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Icon, Spin, message } from 'antd'
import { connect } from 'react-redux'
import filter from 'lodash/filter'
import { DEFAULT_REGISTRY, DEFAULT_CLUSTER } from '../../../../constants'
import { loadImageDetailTag, loadImageDetailTagConfig } from '../../../../actions/app_center'
import { checkServiceName } from '../../../../actions/app_manage'
import { loadFreeVolume, createStorage } from '../../../../actions/storage'
import "./style/NormalDeployBox.less"

const Option = Select.Option;
const OptGroup = Select.OptGroup;
const createForm = Form.create;
const FormItem = Form.Item;
let uuid = 1;
let MyComponent = React.createClass({
  getInitialState() {
    return {
      name: '',
      size: 100,
      format: 'ext4',
      cluster: ''
    }
  },
  componentWillMount() {
    this.props.loadFreeVolume(this.props.cluster)

  },
  getFormValue() {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, getFieldProps} = form
    const volumes = getFieldValue('volumes')
    const volumeMounts = getFieldValue('volumeMounts')
    if (!volumes || volumes.length <= 0) return
    let volumeKey = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) return
      const mount = filter(volumeMounts, ['name', volume.name])
      getFieldProps(`volumePath${index + 1}`, { initialValue: mount[0].mountPath })
      getFieldProps(`volumeName${index + 1}`, { initialValue: `${volume.rbd.image}/${volume.rbd.fsType}` })
      getFieldProps(`volumeChecked${index + 1}`, { initialValue: mount[0].readOnly })
      index++
      volumeKey.push(index)
    })
    getFieldProps(`volumeKey`, {
      initialValue: volumeKey
    })
  },
  remove(k) {
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    volumeKey = volumeKey.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      volumeKey,
    });
    if (volumeKey.length <= 0) {
      const registry = this.props.registry
      const mountPath = this.props.tagConfig[registry].configList.mountPath
      volumeKey = mountPath.map((i, index) => { return index + 1 })
      form.setFieldsValue({
        volumeSwitch: false,
        volumeKey
      })
    }
  },
  add() {
    const { form } = this.props
    let volumeKey = form.getFieldValue('volumeKey')
    uuid = volumeKey.length
    uuid++
    volumeKey = volumeKey.concat(uuid);
    form.setFieldsValue({
      volumeKey,
    });
  },
  volumeList() {
    const registry = this.props.registry
    const volume = this.props.avaliableVolume
    if (volume.data.volumes) {
      return volume.data.volumes.map(item => {
        return <Option value={`${item.name}/${item.fsType}`}>{item.name} {item.fsType} {item.size}</Option>
      })
    } else {
      return ''
    }
  },
  getVolumeName(e) {
    this.setState({
      name: e.target.value
    })
  },
  getVolumeSize(value) {
    this.setState({
      size: value
    })
  },
  getVolumeFormat(format) {
    this.setState({
      format: format
    })
  },
  refresh() {
    this.props.loadFreeVolume(this.props.cluster)
  },
  createVolume() {
    const self = this
    if (!this.state.name) {
      message.error('请填写存储名称')
      return
    }
    let storageConfig = {
      driver: 'rbd',
      name: this.state.name,
      driverConfig: {
        size: this.state.size,
        fsType: this.state.format,
      },
      cluster: self.props.cluster
    }
    this.props.createStorage(storageConfig, {
      success: {
        func: () => {
          self.setState({
            name: '',
            size: 0,
            format: ''
          })
          self.props.loadFreeVolume(self.props.cluster)
        },
        isAsync: true
      },
    })
  },
  render: function () {
    const { getFieldProps, getFieldValue, } = this.props.form
    const registry = this.props.registry
    const mountPath = this.props.tagConfig[registry].configList.mountPath
    if (!this.props.avaliableVolume.data && !getFieldValue('volumeName1')) {
      return <div></div>
    }
    let { isFetching } = this.props.avaliableVolume
    if (isFetching) {
      return <div className='loadingBox'>
        <Spin size='large' />
      </div>
    }
    isFetching = this.props.createState.isFetching
    if (isFetching) {
      return <div className='loadingBox'>
        <Spin size='large' />
      </div>
    }
    const volume = this.props.avaliableVolume.data.volumes
    let formItems = ''
    if (volume.length <= 0) {
      getFieldProps('volumeKey', {
        initialValue: [1],
      });
      return (
        <div>
          <ul>
            <li className="volumeDetail">
              <div className="input">
                <Input className="volumeInt" type="text" placeholder="存储卷名称" onChange={(e) => { this.getVolumeName(e) } } />
              </div>
              <div className="input">
                <InputNumber className="volumeInt" type="text" placeholder="存储卷大小" defaultValue="100" max="9999" onChange={(value) => this.getVolumeSize(value)} />
                <Select className='imageTag' placeholder="请选择格式" defaultValue="ext4" onChange={(value) => {
                  this.getVolumeFormat(value)
                } }>
                  <Option value='ext4'>ext4</Option>
                  <Option value='xfs'>xfs</Option>
                  <Option value='reiserfs'>reiserfs</Option>
                </Select>
                <Button onClick={() => this.createVolume()}>创建存储卷</Button>
              </div>
              <div style={{ clear: "both" }}></div>
            </li>
          </ul>
        </div>
      )
    } else {
      if(!getFieldProps('volumeKey').value) {
        getFieldProps('volumeKey', {
          initialValue: mountPath.map((i, index) => { return index + 1 }),
        });
      }
      this.getFormValue()
      formItems = getFieldValue('volumeKey').map((k) => {
        return (
          <FormItem key={`volume${k}`}>
            {
              mountPath[k - 1] ?
                <span type='text' className="url">
                  <Input className="hide"  value={(function(){
                    if(!getFieldProps(`volumePath${k}`).value) {
                      getFieldProps(`volumePath${k}`, {initialValue: mountPath[k-1]})
                    }
                    return mountPath
                  })()}/>
                  {mountPath[k - 1]}
                </span> :
                <Input {...getFieldProps(`volumePath${k}`) } className="urlInt" />
            }
            <Select className="imageTag" size="large" placeholder="请选择一个存储卷"
              style={{ width: 200 }}
              {...getFieldProps(`volumeName${k}`) }>
              {this.volumeList()}
            </Select>
            <Checkbox className="readOnlyBtn" { ...getFieldProps(`volumeChecked${k}`) } checked={getFieldValue(`volumeChecked${k}`)}>
              只读
          </Checkbox>
            <i className="fa fa-refresh" onClick={() => this.refresh()} />
            <i className="fa fa-trash" onClick={() => this.remove(k)} />
          </FormItem>
        )
      });
    }
    return (
      <div className="serviceOpen" key="had">
        <ul>
          <li>{formItems}</li>
          <li>          <div className="volumeAddBtn" onClick={this.add}>
            <Icon type="plus-circle-o" />
            <span>添加一个容器目录</span>
          </div></li>

        </ul>
      </div>
    )
  }
})

function mapStateToMyComponentProp(state) {
  return {
    avaliableVolume: state.storage.avaliableVolume,
    tagConfig: state.getImageTagConfig.imageTagConfig,
    createState: state.storage.createStorage
  }
}

MyComponent = connect(mapStateToMyComponentProp, {
  loadFreeVolume,
  createStorage
})(MyComponent)


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
  console.log('get port !!!');
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
  const { currentSelectedImage, loadImageDetailTagConfig, scope, isCreate } = props
  loadImageDetailTagConfig(DEFAULT_REGISTRY, currentSelectedImage, tag, {
    success: {
      func: (result) => {
        if (!isCreate) {
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
  getInitialState: function () {
    return {
      cluster: ''
    }
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
    const { checkServiceName, isCreate } = this.props
    const { servicesList } = this.props.scope.props.scope.state
    let i = 0
    if (!value) {
      callback()
    } else {
      if (!/^[a-z][a-z0-9-]{2,24}$/.test(value)) {
        callback([new Error('抱歉，该服务名称不合法.')])
      } else {
        if(!isCreate){
          const oldServiceName = this.props.form.getFieldProps('name').value
          servicesList.map((service) => {
            if((value !== oldServiceName) && (service.id === value)){
              callback([new Error('服务名称已经存在')])
              return
            }
          })
        } else {
          servicesList.map((service) => {
            if (service.id === value) {
              callback([new Error('服务名称已经存在')])
              return
            }
          })
        }
        checkServiceName(this.state.cluster, value, {
          success: {
            func: (result) => {
              if (result.data) {
                callback([new Error('服务名称已经存在')])
              } else {
                callback()
              }
            },
            isAsync: true
          }
        })
      }
    }
  },
  componentWillMount() {
    loadImageTags(this.props)
    const cluster = window.localStorage.getItem('cluster')
    this.setState({
      cluster: cluster
    })
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
        { required: true, },
        { validator: this.userExists },
      ],
    });
    const {registryServer, currentSelectedImage, tagConfig, registry} = this.props
    const imageUrlProps = registryServer + '/' + currentSelectedImage
    const selectProps = getFieldProps('imageVersion', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
    })
    let switchDisable = false
    let mountPath = []
    if (!tagConfig || !tagConfig[registry] || !tagConfig[registry].configList || !tagConfig[registry].configList.mountPath || tagConfig[registry].configList.mountPath.length <= 0) {
      switchDisable = true
    }
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
              <Switch className="changeBtn" disabled={switchDisable}
                {...getFieldProps('volumeSwitch', {
                  valuePropName: 'checked'
                }) }
                />
              <span className="stateSpan">{form.getFieldValue('volumeSwitch') ? "有状态服务" : "无状态服务"}</span>
              {form.getFieldValue('volumeSwitch') ? [
                <MyComponent parentScope={parentScope} form={form} cluster={this.state.cluster} registry={this.props.registry} serviceOpen={this.props.serviceOpen}/>
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
  const {currentSelectedImage} = props
  const {imageTag} = state.getImageTag
  let targetImageTag
  if (imageTag[DEFAULT_REGISTRY]) {
    targetImageTag = imageTag[DEFAULT_REGISTRY][currentSelectedImage]
  }
  const {registry, tag, isFetching, server } = targetImageTag || defaultImageTags

  return {
    registry,
    registryServer: server,
    imageTags: tag || [],
    imageTagsIsFetching: isFetching,
    currentSelectedImage,
    checkServiceName: state.apps.checkServiceName,
    tagConfig: state.getImageTagConfig.imageTagConfig
  }
}

NormalDeployBox = connect(mapStateToProps, {
  loadImageDetailTag,
  loadImageDetailTagConfig,
  checkServiceName,
})(NormalDeployBox)

export default NormalDeployBox