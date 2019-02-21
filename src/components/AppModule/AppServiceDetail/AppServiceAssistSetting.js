/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * App service assist setting
 *
 * v0.1 - 2017-01-18
 * @author Zhangpc
 */
import React from 'react'
import { Card, Spin, Form, Input, Checkbox, Radio,
  notification, Button, Row, Icon, Tooltip } from 'antd'
import './style/AppServiceAssistSetting.less'
import { TENX_LOCAL_TIME_VOLUME } from '../../../../constants'
import { connect } from 'react-redux'
import {
  loadOtherDetailTagConfig,
} from '../../../actions/app_center'
import { loadRepositoriesTagConfigInfo } from '../../../actions/harbor'
import { updateServiceConfigGroup } from '../../../actions/app_manage'
import { DEFAULT_REGISTRY } from '../../../constants'

import ServiceCommonIntl, { AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl } from 'react-intl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import scMessage from '../../../containers/Application/ServiceConfigIntl'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import yaml from 'js-yaml'
import Deployment from '../../../../kubernetes/objects/deployment'

const createForm = Form.create
const FormItem = Form.Item
const RadioGroup = Radio.Group


let AppServiceAssistSetting = React.createClass({
  propTypes: {
    //
  },
  getInitialState() {
    return {
      buttonLock: true,
      buttonLoding: false,
      spinning: true,
    }
  },
  componentDidMount() {
    const { serviceDetail: { spec } } = this.props
    const { containers } = getDeepValue(spec, [ 'template', 'spec' ]) || []
    this.container = containers[0]
    const container = containers[0]
    let tag = '',
      imageName = ''
    if (container && container.image) {
      const arr = container.image.split(':')
      arr.length > 0 && (imageName = (() => {
        const temp = arr[0]
        const temparr = temp.split('/')
        temparr.shift()
        return temparr.join('/')
      })())
      arr.length > 1 && (tag = arr[1])
    }
    const other = getDeepValue(spec, [ 'template', 'metadata', 'annotations', 'system/registry' ])
    this.loadImageConfig(other, imageName, tag, container)

  },

  loadImageConfig(other, imageName, imageTag, container) {
    const {
      loadOtherDetailTagConfig,
      loadRepositoriesTagConfigInfo,
      harbor,
    } = this.props
    let loadImageConfigFunc
    const callback = {
      success: {
        func: res => {
          const { form: { setFieldsValue, getFieldsValue } } = this.props
          const default_args = res.data.cmd
          this.setState({
            default_args,
            entrypoint: res.data.entrypoint,
          })
          const { args = [] } = container
          const argsKeys = []
          // const b = args.length === default_args.length
          // let _b = true
          args.forEach((arg, index) => {
            argsKeys.push({
              value: index,
            })
            const key = [ `args${index}` ]
            setFieldsValue({
              [key]: arg,
            })
            // if (b && arg !== default_args[index]) {
            //   _b = false
            // }
          })
          // _b === true && (_b = b)
          const argsType = !args.length ? 'default' : 'DIY'
          setFieldsValue({
            argsType,
            argsKeys,
            defaultArgsKeys: argsKeys,
          })
          this.initValues = getFieldsValue()
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            spinning: false,
          })
        },
      },
    }
    if (other) {
      const config = {
        imageId: other,
        fullname: imageName,
        imageTag,
      }
      loadImageConfigFunc = loadOtherDetailTagConfig.bind(this, config, callback)
    } else {
      loadImageConfigFunc = loadRepositoriesTagConfigInfo.bind(this,
        harbor, DEFAULT_REGISTRY, imageName, imageTag, callback)
    }
    loadImageConfigFunc()
  },
  openButtonLock(e) {
    e.preventDefault()
    // this.setState({ buttonLock: false })
  },
  renderCMD() {
    const { buttonLock, entrypoint } = this.state
    const { form: { getFieldProps }, intl: { formatMessage } } = this.props
    let { command } = this.container
    if (!command || command.length === 0) {
      command = []
    }
    const cmd = command.length ? command.join(' ') : (() => {
      return entrypoint ? entrypoint.join(' ') : undefined
    })()
    return <FormItem
      className="runningCodeForm"
      style={{ paddingLeft: '100px' }}
    >
      <Input
        disabled={buttonLock}
        className="entryInput"
        placeholder={formatMessage(scMessage.entryPointPlaceholder)}
        size="large"
        {...getFieldProps('command', { initialValue: cmd })}
      />
    </FormItem>
  },

  renderArgs(openButtonLock) {
    const { form, intl } = this.props
    const { buttonLock } = this.state
    const { getFieldValue, getFieldProps } = form
    const argsKeys = getFieldValue('argsKeys')
    const argsType = getFieldValue('argsType')
    // const { formatMessage } = intl
    // if (!argsKeys || argsKeys.length === 0) {
    //   return (
    //     <div className="empty">
    //       {formatMessage(AppServiceDetailIntl.mirrorDefault)}
    //     </div>
    //   )
    // }
    return argsKeys && argsKeys.map((arg, index) => {
      if (arg.deleted) {
        return null
      }
      return (
        <div className="runningCodeForm" style={{ paddingLeft: 100 }}><FormItem
          style={{ display: 'inline-block' }}
          key={`args${index}`}
        >
          <Input
            disabled={buttonLock}
            className="entryInput"
            size="large"
            {...getFieldProps(`args${index}`, { onChange: openButtonLock, rules: [
              {
                required: true,
                message: intl.formatMessage(scMessage.pleaseEnter, {
                  item: intl.formatMessage(scMessage.startCommand),
                  end: '',
                }),
              },
            ] })}
          />
        </FormItem>
        {
          (!buttonLock && argsType !== 'default' && index > 0) && (
            <div span={3} className="deleteArgs">
              <Tooltip title={intl.formatMessage(scMessage.delete)}>
                <Button
                  type="dashed"
                  size="small"
                  onClick={this.removeArgsKey.bind(this, index)}
                >
                  <Icon type="delete" />
                </Button>
              </Tooltip>
            </div>
          )
        }
        </div>
      )
    })
  },

  renderImagePullPolicy(getFieldProps, openButtonLock) {
    const { formatMessage } = this.props.intl
    const { imagePullPolicy } = this.container
    const { buttonLock } = this.state
    return (
      <RadioGroup disabled={buttonLock} {...getFieldProps('imagePullPolicy', { initialValue: imagePullPolicy, onChange: openButtonLock })}
      >
        <Radio disabled={false} key="IfNotPresent" value="IfNotPresent">{formatMessage(AppServiceDetailIntl.priorityUseLocalMirror)}</Radio>
        {/* <Radio disabled={true} key="Never" value="Never">始终使用本地镜像</Radio>*/}
        <Radio disabled={false} key="Always" value="Always">{formatMessage(AppServiceDetailIntl.alwaysUseCloudMirror)}</Radio>
      </RadioGroup>
    )
  },

  getLocaltime() {
    const { volumeMounts } = this.container
    let checked = false
    if (!volumeMounts || volumeMounts.length == 0) {
      return checked
    }
    const { name, hostPath } = TENX_LOCAL_TIME_VOLUME
    volumeMounts.every(volume => {
      if (volume.name == name && volume.mountPath == hostPath.path) {
        checked = true
        return false
      }
      return true
    })
    return checked
  },
  getBody(values, serviceName) {
    const { serviceDetail } = this.props
    const deployment = new Deployment(serviceName)
    deployment.spec.template.spec.containers = serviceDetail.spec.template.spec.containers.map(item => {
      return {
        name: item.name,
        imagePullPolicy: values.imagePullPolicy,
      }
    })
    return deployment
  },
  handleSubmit(e) {
    e.preventDefault()
    const { cluster, updateServiceConfigGroup, form, serviceDetail } = this.props
    const serviceName = serviceDetail.metadata.name
    const { validateFields } = form
    validateFields((err, values) => {
      if (err) return
      const deployment = this.getBody(values, serviceName)
      const container = deployment.spec.template.spec.containers[0]
      this.setState({ spinning: true, buttonLoding: true }, () => {
        container.args = values.argsType === 'default' ? [] : (() => {
          const args = []
          values.argsKeys.forEach(item => {
            if (!item.deleted) {
              args.push(values['args' + item.value])
            }
          })
          return args
        })()
        if (this.container.command !== values.command) {
          container.command = values.command ? values.command.split(' ') : []
        }
        if (values.timeSet !== this.initValues.timeSet) {
          if (values.timeSet) {
            deployment.syncTimeZoneWithNode(serviceName)
          } else {
            deployment.syncTimeZoneWithNode(serviceName, 'delete')
          }
          // let volumeMounts = cloneDeep(this.container.volumeMounts)
          // const temp = {
          //   name: TENX_LOCAL_TIME_VOLUME.name,
          //   mountPath: TENX_LOCAL_TIME_VOLUME.hostPath.path,
          //   readOnly: true,
          // }

          // if (this.container.volumeMounts) {
          //   const item = filter(volumeMounts, temp)[0]
          //   if (item && !values.timeSet) {
          //     // volumeMounts
          //     item.$patch = 'delete'
          //   } else if (!item && values.timeSet) {
          //     volumeMounts = volumeMounts.concat(temp)
          //   }
          // } else {
          //   volumeMounts = [ temp ]
          // }
          // container.volumeMounts = volumeMounts
        }
        const volumes = deployment.spec.template.spec.volumes
        const temp_spec = {
          containers: [ container ],
        }
        if (volumes && volumes.length) {
          temp_spec.volumes = volumes
        }
        const body = {
          spec: {
            template: {
              spec: temp_spec,
            },
          },
        }
        console.log('body', body)
        // spec.template.spec
        // {
        //   "containers": [{
        //     "name": "test-rsw3",
        //     "command": ["ssss", "ssss2", "ssss3"],
        //     "args": ["/hello"],
        //     "imagePullPolicy": "Always"
        //     "volumeMounts": [{
        //       "name": "tenxcloud-time-localtime",
        //       "readOnly": true,
        //       "mountPath": "/etc/localtime"
        //     }],
        //   }],
        // }
        // ex: updateServiceConfigGroup(clusterID, 'Deployment', serviceName, yaml.dump(body), {cb})
        updateServiceConfigGroup(cluster, 'Deployment', serviceName, yaml.dump(body), {
          success: {
            func: () => {
              this.initValues = values
              notification.success({
                message: '修改辅助设置成功',
              })
              this.setState({ buttonLock: true })
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              notification.warn({
                message: '修改失败',
              })
              // setFieldsValue(this.initValues)
            },
          },
          finally: {
            func: () => {
              this.setState({
                spinning: false, buttonLoding: false,
              })
            },
          },
        })
      })
    })
  },
  removeArgsKey(key) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const argsKeys = getFieldValue('argsKeys') || []
    setFieldsValue({
      argsKeys: argsKeys.map(_key => {
        if (_key.value === key) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      }),
    })
  },
  addArgs(is_dis) {
    if (is_dis) return
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFieldsAndScroll } = form
    // const argsType = getFieldValue('argsType')
    // let argsKeys = argsType === 'default' ? getFieldValue('defaultArgsKeys') || [] : getFieldValue('argsKeys') || []
    let argsKeys = getFieldValue('argsKeys') || []
    const validateFieldsKeys = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        validateFieldsKeys.push(`args${key.value}`)
      }
    })

    validateFieldsAndScroll(validateFieldsKeys, errors => {
      if (errors) {
        return
      }
      const key = argsKeys[argsKeys.length - 1] || { value: -1 }
      let uid = key.value
      uid ++

      argsKeys = argsKeys.concat({ value: uid })
      setFieldsValue({
        argsKeys,
      })
      setTimeout(() => {
        document.getElementById(`args${uid}`).focus()
      }, 300)
    })
  },
  onCancel() {
    const { form: { setFieldsValue } } = this.props
    setFieldsValue(this.initValues)
    this.setState({ buttonLock: true })
  },
  render() {
    const { isFetching, serviceDetail, form } = this.props
    const { formatMessage } = this.props.intl
    const { getFieldProps, getFieldValue } = form
    const { buttonLock, buttonLoding, spinning, default_args } = this.state
    const openButtonLock = this.openButtonLock
    getFieldProps('defaultArgsKeys')
    getFieldProps('argsKeys')
    const argsType = getFieldValue('argsType')
    if (isFetching || !serviceDetail.metadata) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    if (!this.container) {
      return (
        <div className="loadingBox">
          {formatMessage(ServiceCommonIntl.loading)}
        </div>
      )
    }
    return (
      <Card id="AppServiceAssistSetting">
        <div className="info commonBox">
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.assistConfig)}</span>
          <Form>
            <div className="submitButton">
              {
                buttonLoding || !buttonLock ?
                  [ <Button onClick={this.handleSubmit} style={{ marginRight: '5px' }} type="primary" htmlType="submit" loading={buttonLoding} >确定</Button>,
                    <Button onClick={this.onCancel}>取消</Button> ]
                  :
                  <Button type="primary" onClick={() => this.setState({ buttonLock: false })} >编辑</Button>
              }
              {/* <Button type="primary" disabled={buttonLock} >编辑</Button> */}
            </div>

            <Spin spinning={spinning}>
              <div className="assitBox">
                <div>
                  <div className="inputBox">
                    <span className="commonSpan">{formatMessage(AppServiceDetailIntl.intoPoint)}</span>
                    {this.renderCMD()}
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className="inputBox">
                    <span className="commonSpan">{formatMessage(AppServiceDetailIntl.starCommand)}</span>
                    <div>
                      <FormItem>
                        <Radio.Group disabled={!buttonLoding && buttonLock} {...getFieldProps('argsType', {
                          initialValue: 'DIY',
                        })}>
                          <Radio value="default">镜像默认</Radio>
                          <Radio value="DIY">自定义</Radio>
                        </Radio.Group>
                      </FormItem>
                    </div>
                    <div className="selectBox" style={{ height: 'auto' }}>
                      <div className={argsType === 'default' ? 'default_args' : 'hide default_args'}>
                        {
                          default_args && default_args.length ?
                            default_args.map(item => {
                              return (
                                <div className="runningCodeForm" style={{ paddingLeft: 100 }}><FormItem
                                  style={{ display: 'inline-block' }}
                                  key={`args_default_${item}`}
                                >
                                  <Input
                                    disabled={true}
                                    className="entryInput"
                                    size="large"
                                    value={item}
                                  />
                                </FormItem></div>
                              )
                            })
                            :
                            <div style={{ display: 'inline-block' }}>镜像默认</div>
                        }
                      </div>
                      <div className={argsType === 'DIY' ? 'diy_args' : 'hide diy_args'}>
                        {this.renderArgs(openButtonLock)}
                      </div>
                      {
                        argsType !== 'default' && (
                          <Row className="addArgs"
                            style={{ paddingLeft: 100 }}>
                            <span className={!buttonLoding && buttonLock ? 'dis_add' : ''} onClick={() => this.addArgs(!buttonLoding && buttonLock)}>
                              <Icon type="plus-circle-o" />
                              <span >{formatMessage(scMessage.addStartCommand)}</span>
                            </span>
                          </Row>
                        )
                      }
                    </div>

                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className="inputBox">
                    <span className="commonSpan">{formatMessage(AppServiceDetailIntl.redeploy)}</span>
                    <div className="selectBox">
                      {this.renderImagePullPolicy(getFieldProps, openButtonLock)}
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  <div className="inputBox">
                    <span className="commonSpan">{formatMessage(AppServiceDetailIntl.timeZoneSet)}</span>
                    <div className="checkBox">
                      <Checkbox disabled={buttonLock} onChange={this.openButtonLock}
                        {...getFieldProps('timeSet', { initialValue: this.getLocaltime(), valuePropName: 'checked',
                          onChange: openButtonLock })}>
                        <span className="checkTitle">{formatMessage(AppServiceDetailIntl.useHostNodeTimeZone)}</span></Checkbox><br />
                      <span className="tooltip">{formatMessage(AppServiceDetailIntl.choicePromiseContainerAndHostNode)}</span>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </div>
              </div>
            </Spin>
          </Form>
        </div>
      </Card>
    )
  },
})

AppServiceAssistSetting = injectIntl(createForm()(AppServiceAssistSetting), { withRef: true,  })

function mapStateToProps(state) {
  const { cluster } = getDeepValue(state, [ 'entities', 'current' ])
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || '' : ''
  return {
    harbor,
    cluster: cluster.clusterID,
  }
}

export default connect(mapStateToProps, {
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo,
  updateServiceConfigGroup,
})(AppServiceAssistSetting)
