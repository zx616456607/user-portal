/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Create cluster
 *
 * @author zhangxuan
 * @date 2018-11-27
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import { Form, Radio, Row, Col, Button } from 'antd'
import { injectIntl } from 'react-intl'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import TenxPage from '@tenx-ui/page/lib'
import '@tenx-ui/page/assets/index.css'
import './style/index.less'
import ServiceProviders from './ServiceProviders/index'
import ExistingCluster from './ExistingCluster'
import SelfBuild from './SelfBuild'
import * as ClusterActions from '../../../../src/actions/cluster'
import * as EntitiesActions from '../../../../src/actions/entities'
import * as ProjectActions from '../../../../src/actions/project'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import NotificationHandler from '../../../../src/components/Notification'
import intlMsg from '../../../../src/components/ClusterModule/indexIntl'
import Title from '../../../../src/components/Title'
import isEmpty from 'lodash/isEmpty'
import { sleep } from '../../../../src/common/tools'
import cloneDeep from 'lodash/cloneDeep';
import { formatIpRangeToArray } from './ServiceProviders/utils'

const RadioGroup = Radio.Group
const FormItem = Form.Item
const notify = new NotificationHandler()

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20, offset: 1 },
}

const mapStateToProps = state => {
  const current = getDeepValue(state, [ 'entities', 'current' ])
  const hostInfo = getDeepValue(state, [ 'cluster', 'checkHostInfo', 'data' ])
  return {
    current,
    hostInfo,
  }
}

@connect(mapStateToProps, {
  loadClusterList: ClusterActions.loadClusterList,
  createCluster: ClusterActions.createCluster,
  autoCreateCluster: ClusterActions.autoCreateCluster,
  loadLoginUserDetail: EntitiesActions.loadLoginUserDetail,
  getProjectVisibleClusters: ProjectActions.getProjectVisibleClusters,
})
class CreateCluster extends React.PureComponent {

  state = {
    serviceProviderData: {
      autoSelect: true,
    }, // 接入服务商数据 （集群名、描述、cidr）
    existingK8sData: {}, // 已有k8s集群数据 （集群名、API Host、KubeConfig 等）
    diyData: {}, // 自定义添加主机列表数据
    openStackData: {}, // openStack 主机列表数据
    rightCloudData: {}, // 云星主机列表数据
  }

  componentWillUnmount() {
    const { resetFields } = this.props.form
    resetFields()
  }
  back = () => {
    browserHistory.push('/cluster')
  }

  createClusterByConfig = resolve => {
    this.setState({
      resolve,
    })
  }

  updateState = state => {
    this.setState(state)
  }

  addDiyFields = data => {
    const { diyData } = this.state
    const { hostInfo } = this.props
    const copyData = cloneDeep(diyData)
    if (!copyData.errorHosts) {
      copyData.errorHosts = []
    }
    copyData.errorHosts.push(...data.errorHosts)
    let lastKey = 0
    if (!isEmpty(copyData.keys)) {
      lastKey = copyData.keys[copyData.keys.length - 1]
    } else {
      copyData.keys = []
    }
    if (data.addType === 'diff') {
      data.newKeys.forEach(key => {
        lastKey++
        copyData.keys.push(lastKey)
        Object.assign(copyData, {
          [`host-${lastKey}`]: data[`host-${key}`],
          [`hostName-${lastKey}`]: hostInfo[data[`host-${key}`]],
          [`username-${lastKey}`]: data[`username-${key}`],
          [`password-${lastKey}`]: data[`password-${key}`],
        })
      })
    } else {
      const { editor, username, password } = data
      const hostArray = formatIpRangeToArray(editor)
      hostArray.forEach(item => {
        lastKey++
        copyData.keys.push(lastKey)
        Object.assign(copyData, {
          [`host-${lastKey}`]: item,
          [`hostName-${lastKey}`]: hostInfo[item],
          [`username-${lastKey}`]: username,
          [`password-${lastKey}`]: password,
        })
      })
    }
    this.setState({
      diyData: Object.assign({}, copyData, {
        addType: data.addType,
      }),
    })
  }

  addOpenStackFields = data => {
    const { openStackData } = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    const copyData = cloneDeep(openStackData)
    let lastKey = 0
    if (!isEmpty(copyData.osKeys)) {
      lastKey = copyData.osKeys[copyData.osKeys.length - 1]
    } else {
      copyData.osKeys = []
    }
    lastKey++
    copyData.osKeys.push(lastKey)
    Object.assign(copyData, {
      [`domain-${lastKey}`]: data.domain,
      [`network-${lastKey}`]: data.network,
      [`securityGroup-${lastKey}`]: data.securityGroup,
      [`image-${lastKey}`]: data.image,
      [`configSpecify-${lastKey}`]: data.configSpecify,
    })
    setFieldsValue(copyData)
    this.setState({
      openStackData: copyData,
    })
  }

  addRightCloudFields = data => {
    const { rightCloudData } = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    const copyData = cloneDeep(rightCloudData)
    if (isEmpty(copyData.rcKeys)) {
      copyData.rcKeys = []
    }
    data.forEach(item => {
      copyData.rcKeys.push(item.id)
      Object.assign(copyData, {
        [`host-${item.id}`]: item.innerIp + ':' + item.port,
        [`hostName-${item.id}`]: item.instanceName,
        [`password-${item.id}`]: item.password,
        [`cloudEnvName-${item.id}`]: item.cloudEnvName,
      })
    })
    setFieldsValue(copyData)
    this.setState({
      rightCloudData: copyData,
    })
  }

  removeRcField = key => {
    const { rightCloudData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const rcKeys = getFieldValue('rcKeys')
    setFieldsValue({
      rcKeys: rcKeys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, rightCloudData, {
      rcKeys: rightCloudData.rcKeys.filter(_key => _key !== key),
    })
    this.setState({
      rightCloudData: finalData,
    })
  }

  removeDiyField = key => {
    const { diyData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('keys')
    setFieldsValue({
      keys: keys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, diyData, {
      keys: diyData.keys.filter(_key => _key !== key),
    })
    if (finalData.errorHosts.includes(finalData[`host-${key}`])) {
      finalData.errorHosts = finalData.errorHosts.filter(_key => _key !== finalData[`host-${key}`])
    }
    this.setState({
      diyData: finalData,
    })
  }

  removeOsField = key => {
    const { openStackData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('osKeys')
    setFieldsValue({
      osKeys: keys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, openStackData, {
      osKeys: openStackData.osKeys.filter(_key => _key !== key),
    })
    this.setState({
      openStackData: finalData,
    })
  }

  updateHostState = (key, data) => {
    switch (key) {
      case 'diyData':
        return this.addDiyFields(data)
      case 'openStack':
        return this.addOpenStackFields(data)
      case 'rightCloud':
        return this.addRightCloudFields(data)
      default:
        break
    }
  }

  renderContent = () => {
    const {
      diyMasterError, diyDoubleMaster, rcMasterError, rcDoubleMaster,
      diyData, rightCloudData, serviceProviderData, existingK8sData,
      openStackData, osMasterError, osDoubleMaster,
    } = this.state
    const { form, intl } = this.props
    const { getFieldValue } = form
    const type = getFieldValue('type')
    switch (type) {
      case 'other':
        return <ServiceProviders
          {...{
            intl,
            form,
            formItemLayout,
            updateParentState: this.updateState,
            updateHostState: this.updateHostState,
            removeDiyField: this.removeDiyField,
            removeOsField: this.removeOsField,
            removeRcField: this.removeRcField,
            diyData,
            openStackData,
            rightCloudData,
            serviceProviderData,
            diyMasterError,
            diyDoubleMaster,
            rcMasterError,
            rcDoubleMaster,
            osMasterError,
            osDoubleMaster,
          }}
        />
      case 'k8s':
        return <ExistingCluster
          {...{
            intl,
            form,
            formItemLayout,
            callbackFunc: this.createClusterByConfig,
            existingK8sData,
          }}
        />
      case 'diy':
        return <SelfBuild
          {...{
            intl,
          }}
        />
      default:
        break
    }
  }

  otherConfirm = async () => {
    const { diyMasterError, rcMasterError, osMasterError } = this.state
    const {
      form, autoCreateCluster, loadLoginUserDetail, getProjectVisibleClusters,
      loadClusterList, current, intl: { formatMessage },
    } = this.props
    const { validateFieldsAndScroll } = form
    validateFieldsAndScroll(async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const { iaasSource, clusterName, description, podCIDR, serviceCIDR } = values
      const body = {
        clusterName,
        description,
        podCIDR,
        serviceCIDR,
        master: {
          Master: [], // 第一个master
        },
        slave: {
          HaMaster: [], // 其他的master
          Slave: [],
        },
      }
      if (iaasSource === 'diy') {
        if (isEmpty(values.keys)) {
          notify.warn(formatMessage(intlMsg.plsAddHosts))
          this.setState({
            confirmLoading: false,
          })
          return
        }
        if (diyMasterError || diyMasterError === undefined) {
          this.setState({
            confirmLoading: false,
          })
          return
        }
        body.clusterType = 1
        values.keys.forEach(key => {
          const Host = values[`existHost-${key}`]
          const HostName = values[`hostName-${key}`]
          const RootPass = values[`password-${key}`]
          const hostRole = values[`hostRole-${key}`]
          if (hostRole.includes('master')) {
            const hostInfo = {
              Host,
              RootPass,
            }
            if (HostName) {
              hostInfo.HostName = HostName
            }
            body.master.Master.push(hostInfo)
          } else {
            const hostInfo = {
              Host,
              RootPass,
            }
            if (HostName) {
              hostInfo.HostName = HostName
            }
            body.slave.Slave.push(hostInfo)
          }
        })
      } else if (iaasSource === 'rightCloud') {
        if (isEmpty(values.rcKeys)) {
          notify.warn(formatMessage(intlMsg.plsAddHosts))
          this.setState({
            confirmLoading: false,
          })
          return
        }
        if (rcMasterError || rcMasterError === undefined) {
          this.setState({
            confirmLoading: false,
          })
          return
        }
        body.clusterType = 3
        values.rcKeys.forEach(key => {
          const Host = values[`existHost-${key}`]
          const HostName = values[`hostName-${key}`]
          const RootPass = values[`password-${key}`]
          const hostRole = values[`hostRole-${key}`]
          if (hostRole.includes('master')) {
            const hostInfo = {
              Host,
              RootPass,
            }
            if (HostName) {
              hostInfo.HostName = HostName
            }
            body.master.Master.push(hostInfo)
          } else {
            const hostInfo = {
              Host,
              RootPass,
            }
            if (HostName) {
              hostInfo.HostName = HostName
            }
            body.slave.Slave.push(hostInfo)
          }
        })
      } else { // openStack
        if (isEmpty(values.osKeys)) {
          notify.warn(formatMessage(intlMsg.plsAddHosts))
          this.setState({
            confirmLoading: false,
          })
          return
        }
        if (osMasterError || osMasterError === undefined) {
          this.setState({
            confirmLoading: false,
          })
          return
        }
        body.clusterType = 2
        values.osKeys.forEach(key => {
          const domain = values[`domain-${key}`]
          const network = values[`network-${key}`]
          const securityGroup = values[`securityGroup-${key}`]
          const image = values[`image-${key}`]
          const configSpecify = values[`configSpecify-${key}`]
          const hostName = values[`hostName-${key}`]
          const hostCount = values[`hostCount-${key}`]
          const config = values[`config-${key}`]
          const hostRole = values[`hostRole-${key}`]
          if (hostRole.includes('master')) {
            const hostInfo = {
              domain,
              network,
              securityGroup,
              image,
              configSpecify,
              hostCount,
              config,
            }
            if (hostName) {
              hostInfo.hostName = hostName
            }
            body.master.Master.push(hostInfo)
          } else {
            const hostInfo = {
              domain,
              network,
              securityGroup,
              image,
              configSpecify,
              hostCount,
              config,
            }
            if (hostName) {
              hostInfo.hostName = hostName
            }
            body.slave.Slave.push(hostInfo)
          }
        })
      }
      if (body.master.Master.length > 1) {
        body.slave.HaMaster = body.master.Master.splice(1, body.master.Master.length - 1)
      }
      autoCreateCluster(body, {
        success: {
          func: async () => {
            loadLoginUserDetail()
            getProjectVisibleClusters(current.space.namespace)
            await loadClusterList({ size: 100 })
            notify.success(formatMessage(intlMsg.addClusterNameSuccess, {
              clusterName: values.clusterName,
            }))
            this.setState({
              confirmLoading: false,
            })
            this.back()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 409) {
              notify.warn(formatMessage(intlMsg.clusterNameExist))
              this.setState({
                confirmLoading: false,
              })
              return
            }
            const _message = err.message.message || ''
            notify.warn(formatMessage(intlMsg.addClusterFail, {
              clusterName: values.clusterName,
            }), _message)
            this.setState({
              confirmLoading: false,
            })
          },
        },
      })
    })
  }

  k8sConfirm = async () => {
    const {
      createCluster,
      loadClusterList,
      loadLoginUserDetail,
      getProjectVisibleClusters,
      current,
      form,
      intl: { formatMessage },
    } = this.props
    const { resolve } = this.state
    const { validateFields } = form
    validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      if (values.authType === 'apiToken') {
        const body = {
          clusterName: values.clusterName,
          apiHost: values.apiHost,
          apiToken: values.apiToken,
          description: values.description,
        }
        await createCluster(body, {
          success: {
            func: async () => {
              loadLoginUserDetail()
              getProjectVisibleClusters(current.space.namespace)
              await loadClusterList({ size: 100 })
              notify.success(formatMessage(intlMsg.addClusterNameSuccess, {
                clusterName: values.clusterName,
              }))
              this.setState({
                confirmLoading: false,
              })
              this.back()
            },
            isAsync: true,
          },
          failed: {
            func: error => {
              const _message = error.message.message || ''
              if (_message === 'cluster by API host and API token already exist') {
                notify.warn(formatMessage(intlMsg.addClusterFail, {
                  clusterName: values.clusterName,
                }), formatMessage(intlMsg.apiHostAndTokenExist))
                this.setState({
                  confirmLoading: false,
                })
                return
              }
              notify.warn(formatMessage(intlMsg.addClusterFail, {
                clusterName: values.clusterName,
              }), _message)
              this.setState({
                confirmLoading: false,
              })
            },
          },
        })
      } else {
        resolve()
        await sleep(200)
        this.setState({
          confirmLoading: false,
        })
      }
    })
  }

  handleConfirm = () => {
    const { form } = this.props
    const { getFieldValue } = form
    const type = getFieldValue('type')
    switch (type) {
      case 'other':
        return this.otherConfirm()
      case 'k8s':
        return this.k8sConfirm()
      case 'diy':
        return this.back()
      default:
        break
    }
  }


  render() {
    const { confirmLoading } = this.state
    const { form, intl: { formatMessage } } = this.props
    const { getFieldProps } = form
    return (
      <QueueAnim className="create-cluster">
        <Title title={formatMessage(intlMsg.addCluster)}/>
        <ReturnButton onClick={this.back}>{formatMessage(intlMsg.backToCluster)}</ReturnButton>
        <span className="first-title">{formatMessage(intlMsg.addCluster)}</span>
        <TenxPage className="create-cluster-body">
          <FormItem
            label={formatMessage(intlMsg.addType)}
            {...formItemLayout}
          >
            <RadioGroup {...getFieldProps('type', {
              initialValue: 'other',
            })}>
              <Radio value="other">{formatMessage(intlMsg.serviceProviderType)}</Radio>
              <Radio value="k8s">{formatMessage(intlMsg.k8sType)}</Radio>
              <Radio value="diy">{formatMessage(intlMsg.selfBuiltType)}</Radio>
            </RadioGroup>
          </FormItem>
          {this.renderContent()}
        </TenxPage>
        <div className="dividing-line"/>
        <Row className={'create-cluster-footer'}>
          <Col offset={4}>
            <Button type={'ghost'} onClick={this.back}>{formatMessage(intlMsg.cancel)}</Button>
            <Button type={'primary'} loading={confirmLoading} onClick={this.handleConfirm}>{formatMessage(intlMsg.confirm)}</Button>
          </Col>
        </Row>
      </QueueAnim>
    )
  }
}

export default injectIntl(Form.create()(CreateCluster), {
  withRef: true,
})
