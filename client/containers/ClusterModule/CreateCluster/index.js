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
import { getDeepValue } from '../../../util/util'
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
  return {
    current,
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
    serviceProviderData: {}, // 接入服务商数据 （集群名、描述、cidr）
    existingK8sData: {}, // 已有k8s集群数据 （集群名、API Host、KubeConfig 等）
    diyData: {}, // 自定义添加主机列表数据
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
    const { form } = this.props
    const { setFieldsValue } = form
    const copyData = cloneDeep(diyData)
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
          [`username-${lastKey}`]: username,
          [`password-${lastKey}`]: password,
        })
      })
    }
    setFieldsValue(copyData)
    this.setState({
      diyData: Object.assign({}, copyData, {
        addType: data.addType,
      }),
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
      copyData.rcKeys.push(item.instanceName)
      Object.assign(copyData, {
        [`host-${item.instanceName}`]: item.innerIp + ':' + item.port,
        [`hostName-${item.instanceName}`]: item.instanceName,
        [`password-${item.instanceName}`]: item.password,
        [`cloudEnvName-${item.instanceName}`]: item.cloudEnvName,
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
    this.setState({
      diyData: finalData,
    })
  }

  updateHostState = (key, data) => {
    switch (key) {
      case 'diyData':
        return this.addDiyFields(data)
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
            removeRcField: this.removeRcField,
            diyData,
            rightCloudData,
            serviceProviderData,
            diyMasterError,
            diyDoubleMaster,
            rcMasterError,
            rcDoubleMaster,
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
    const { diyMasterError, rcMasterError } = this.state
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
      const { iaasSource, clusterName, description } = values
      const body = {
        clusterName,
        description,
        hosts: {
          Master: [],
          Slave: [],
        },
      }
      if (iaasSource === 'diy') {
        if (isEmpty(values.keys)) {
          notify.warn('请添加主机')
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
            body.hosts.Master.push({
              Host,
              HostName,
              RootPass,
            })
          } else {
            body.hosts.Slave.push({
              Host,
              HostName,
              RootPass,
            })
          }
        })
      } else if (iaasSource === 'rightCloud') {
        if (isEmpty(values.rcKeys)) {
          notify.warn('请添加主机')
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
            body.hosts.Master.push({
              Host,
              HostName,
              RootPass,
            })
          } else {
            body.hosts.Slave.push({
              Host,
              HostName,
              RootPass,
            })
          }
        })
      }
      const result = await autoCreateCluster(body)
      if (result.error) {
        const _message = result.error.message.message || ''
        notify.warn(formatMessage(intlMsg.addClusterFail, {
          clusterName: values.clusterName,
        }), _message)
        this.setState({
          confirmLoading: false,
        })
        return
      }
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
        const result = await createCluster(body)
        if (result.error) {
          const _message = result.error.message.message || ''
          notify.warn(formatMessage(intlMsg.addClusterFail, {
            clusterName: values.clusterName,
          }), _message)
          this.setState({
            confirmLoading: false,
          })
          return
        }
      } else {
        await sleep()
        resolve()
      }
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
    const { form } = this.props
    const { getFieldProps } = form
    return (
      <QueueAnim className="create-cluster">
        <Title title={'添加集群'}/>
        <ReturnButton onClick={this.back}>返回集群管理</ReturnButton>
        <span className="first-title">添加集群</span>
        <TenxPage className="create-cluster-body">
          <FormItem
            label="添加方式"
            {...formItemLayout}
          >
            <RadioGroup {...getFieldProps('type', {
              initialValue: 'other',
            })}>
              <Radio value="other">接入服务商提供的主机</Radio>
              <Radio value="k8s">导入已有 Kubernetes 集群</Radio>
              <Radio value="diy">添加主机自建 Kubernetes 集群</Radio>
            </RadioGroup>
          </FormItem>
          {this.renderContent()}
        </TenxPage>
        <div className="dividing-line"/>
        <Row className={'create-cluster-footer'}>
          <Col offset={4}>
            <Button type={'ghost'} onClick={this.back}>取消</Button>
            <Button type={'primary'} loading={confirmLoading} onClick={this.handleConfirm}>确定</Button>
          </Col>
        </Row>
      </QueueAnim>
    )
  }
}

export default injectIntl(Form.create()(CreateCluster), {
  withRef: true,
})
