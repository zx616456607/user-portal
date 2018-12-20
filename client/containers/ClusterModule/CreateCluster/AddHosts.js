/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Add hosts
 *
 * @author zhangxuan
 * @date 2018-12-03
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button } from 'antd'
import { browserHistory } from 'react-router'
import Title from '../../../../src/components/Title'
import TenxIcon from '@tenx-ui/icon/lib/_old'
import '@tenx-ui/icon/assets/index.css'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import TenxPage from '@tenx-ui/page/lib'
import '@tenx-ui/page/assets/index.css'
import './style/AddHosts.less'
import DiyHost from './ServiceProviders/DiyHost'
import RightCloud from './ServiceProviders/RightCloud'
import { formatIpRangeToArray } from './ServiceProviders/utils';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import NotificationHandler from '../../../../src/components/Notification'
import * as clusterActions from '../../../../src/actions/cluster'
import * as ProjectActions from '../../../../src/actions/project'
import * as EntitiesActions from '../../../../src/actions/entities'
import { getDeepValue } from '../../../util/util'

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20, offset: 1 },
}
const FormItem = Form.Item
const notify = new NotificationHandler()

const mapStateToProps = state => {
  const current = getDeepValue(state, [ 'entities', 'current' ])
  const activeCluster = getDeepValue(state, [ 'terminal', 'active', 'cluster' ])
  const hostInfo = getDeepValue(state, [ 'cluster', 'checkHostInfo', 'data' ])
  let masterCount = 0
  const nodes = getDeepValue(state, [ 'cluster_nodes', 'getAllClusterNodes', activeCluster, 'nodes', 'clusters', 'nodes', 'nodes' ])
  if (nodes && !isEmpty(nodes)) {
    nodes.forEach(node => {
      if (node.isMaster) {
        masterCount++
      }
    })
  }
  return {
    current,
    activeCluster,
    masterCount,
    hostInfo,
  }
}
@connect(mapStateToProps, {
  autoCreateNode: clusterActions.autoCreateNode,
  loadClusterList: clusterActions.loadClusterList,
  loadLoginUserDetail: EntitiesActions.loadLoginUserDetail,
  getProjectVisibleClusters: ProjectActions.getProjectVisibleClusters,
})

class AddHosts extends React.PureComponent {

  state = {
    diyData: {},
    rightCloudData: {},
  }

  back = () => {
    browserHistory.push('/cluster')
  }

  addDiyFields = data => {
    const { diyData } = this.state
    const { form, hostInfo } = this.props
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

  updateState = (key, data) => {
    switch (key) {
      case 'diyData':
        return this.addDiyFields(data)
      case 'rightCloud':
        return this.addRightCloudFields(data)
      default:
        break
    }
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

  handleConfirm = async () => {
    const { diyMasterError, rcMasterError } = this.state
    const {
      form, location: { query }, autoCreateNode,
      loadLoginUserDetail, getProjectVisibleClusters,
      loadClusterList, current, activeCluster,
    } = this.props
    const { validateFields } = form
    validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const body = {
        clusterId: activeCluster,
        hosts: {
          HaMaster: [],
          Slave: [],
        },
      }
      if (query.clusterType === '1') {
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
        // body.clusterType = 1
        values.keys.forEach(key => {
          const Host = values[`existHost-${key}`]
          const HostName = values[`hostName-${key}`]
          const RootPass = values[`password-${key}`]
          const hostRole = values[`hostRole-${key}`]
          if (hostRole.includes('master')) {
            body.hosts.HaMaster.push({
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
      } else if (query.clusterType === '3') {
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
        // body.clusterType = 3
        values.rcKeys.forEach(key => {
          const Host = values[`existHost-${key}`]
          const HostName = values[`hostName-${key}`]
          const RootPass = values[`password-${key}`]
          const hostRole = values[`hostRole-${key}`]
          if (hostRole.includes('master')) {
            body.hosts.HaMaster.push({
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
      const result = await autoCreateNode(body)
      if (result.error) {
        this.setState({
          confirmLoading: false,
        })
        return notify.warn('添加主机失败')
      }
      loadLoginUserDetail()
      getProjectVisibleClusters(current.space.namespace)
      await loadClusterList({ size: 100 })
      this.setState({
        confirmLoading: false,
      })
      this.back()
    })
  }

  renderClusterSource = () => {
    const { location: { query } } = this.props
    switch (query.clusterType) {
      case '1':
        return '接入服务商提供的主机（自定义添加主机）'
      case '2':
        return '接入服务商提供的主机（OpenStack）'
      case '3':
        return '接入服务商提供的主机（云星）'
      default:
        return ''
    }
  }

  _setState = state => {
    this.setState(state)
  }

  renderHosts = () => {
    const {
      diyData, rightCloudData, diyMasterError, diyDoubleMaster,
      rcMasterError, rcDoubleMaster,
    } = this.state
    const { form, location: { query }, masterCount } = this.props
    switch (query.clusterType) {
      case '1':
        return <DiyHost
          {...{
            form,
            formItemLayout,
            updateState: data => this.updateState('diyData', data),
            removeDiyField: this.removeDiyField,
            dataSource: diyData,
            updateParentState: this._setState,
            diyMasterError,
            diyDoubleMaster,
            masterCount,
            isAddHosts: true,
          }}
        />
      case '2': // TODO openStack
      case '3':
        return <RightCloud
          {...{
            form,
            formItemLayout,
            updateState: data => this.updateState('rightCloud', data),
            removeRcField: this.removeRcField,
            dataSource: rightCloudData,
            updateParentState: this._setState,
            rcMasterError,
            rcDoubleMaster,
            masterCount,
            isAddHosts: true,
          }}
        />
      default:
        break
    }
  }

  render() {
    const { confirmLoading } = this.state
    return (
      <QueueAnim className="add-hosts">
        <Title title={'添加节点'}/>
        <ReturnButton onClick={this.back}>返回集群管理</ReturnButton>
        <span className="first-title">添加节点</span>
        <TenxPage className="add-hosts-body">
          <FormItem
            label={'集群节点来源'}
            {...formItemLayout}
          >
            <div><TenxIcon type="server"/> {this.renderClusterSource()}</div>
          </FormItem>
          {this.renderHosts()}
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

export default Form.create()(AddHosts)
