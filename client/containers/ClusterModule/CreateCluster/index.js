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

  state = {}

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

  renderContent = () => {
    const { diyMasterError, diyDoubleMaster, rcMasterError, rcDoubleMaster } = this.state
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

  typeChange = () => {
    this.setState({
      diyMasterError: false,
      rcMasterError: false,
    })
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
              onChange: this.typeChange,
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
