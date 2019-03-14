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
import { FormattedMessage, injectIntl } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button, Icon } from 'antd'
import { browserHistory } from 'react-router'
import Title from '../../../../src/components/Title'
import TenxIcon from '@tenx-ui/icon/lib/_old'
import '@tenx-ui/icon/assets/index.css'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import '@tenx-ui/page/assets/index.css'
import './style/AddHosts.less'
import DiyHost from './ServiceProviders/DiyHost'
import OpenStack from './ServiceProviders/OpenStack'
import RightCloud from './ServiceProviders/RightCloud'
import { formatIpRangeToArray } from './ServiceProviders/utils';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import NotificationHandler from '../../../../src/components/Notification'
import * as clusterActions from '../../../../src/actions/cluster'
import * as ProjectActions from '../../../../src/actions/project'
import * as EntitiesActions from '../../../../src/actions/entities'
import intlMsg from '../../../../src/components/ClusterModule/indexIntl'
import intl from '../../../../src/components/ClusterModule/ClusterInfoIntl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import SelfBuild from './SelfBuild'

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20, offset: 1 },
}
const FormItem = Form.Item
const notify = new NotificationHandler()

const OPEN_STACK = {
  value: 'openStack',
  name: 'OpenStack',
  iconType: 'openstack',
}
const RIGHT_CLOUD = {
  value: 'rightCloud',
  name: <FormattedMessage {...intlMsg.rcIaas}/>,
  iconType: 'rightCloud',
}
const DEFAULT_LIST = [{
  value: 'diy',
  name: <FormattedMessage {...intlMsg.diyIaas}/>,
  iconType: 'hostlists-o',
}, {
  value: 'command',
  name: <FormattedMessage {...intlMsg.commandType}/>,
  iconType: 'command',
}]

const mapStateToProps = state => {
  const current = getDeepValue(state, [ 'entities', 'current' ])
  const activeCluster = getDeepValue(state, [ 'cluster', 'clusterActive', 'cluster' ])
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
    openStackData: {},
    rightCloudData: {},
    diyMasterError: false,
    rcMasterError: false,
    osMasterError: false,
    iaasSource: 'diy',
  }

  back = () => {
    const { location } = this.props
    const { clusterID } = location.query
    browserHistory.push(`/cluster?form=addHosts&clusterID=${clusterID}`)
  }

  addDiyFields = data => {
    const { diyData } = this.state
    const { hostInfo, form: { setFieldsValue } } = this.props
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
    setFieldsValue({
      keys: copyData.keys,
    })
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
    setFieldsValue({
      osKeys: copyData.osKeys,
    })
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
      copyData.rcKeys.push(item.instanceName)
      Object.assign(copyData, {
        [`host-${item.instanceName}`]: item.innerIp + ':' + item.port,
        [`hostName-${item.instanceName}`]: item.instanceName,
        [`password-${item.instanceName}`]: item.password,
        [`cloudEnvName-${item.instanceName}`]: item.cloudEnvName,
      })
    })
    setFieldsValue({
      rcKeys: copyData.rcKeys,
    })
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

  updateState = (key, data) => {
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
    const { diyMasterError, rcMasterError, osMasterError, iaasSource } = this.state
    const {
      form, autoCreateNode,
      loadLoginUserDetail, getProjectVisibleClusters,
      loadClusterList, current, activeCluster, intl: { formatMessage },
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
        slave: {
          HaMaster: [],
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
        if (diyMasterError) {
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
        if (rcMasterError) {
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
            const hostInfo = {
              Host,
              RootPass,
            }
            if (HostName) {
              hostInfo.HostName = HostName
            }
            body.slave.HaMaster.push(hostInfo)
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
      } else if (iaasSource === 'openStack') { // openStack
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
        // body.clusterType = 2
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
            body.slave.HaMaster.push(hostInfo)
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
      } else if (iaasSource === 'command') {
        return this.back()
      }
      autoCreateNode(body, {
        success: {
          func: async () => {
            loadLoginUserDetail()
            getProjectVisibleClusters(current.space.namespace)
            await loadClusterList({ size: 100 })
            this.setState({
              confirmLoading: false,
            })
            this.back()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 409
              && getDeepValue(err, [ 'message', 'details', 'kind' ]) === 'already exist') {
              const ips = JSON.parse(err.message.details.name)
              this.setState({
                confirmLoading: false,
              })
              return notify.warn(formatMessage(intlMsg.addHostFailed),
                formatMessage(intlMsg.hostsExist({
                  ips: ips.join(),
                })))
            }
            this.setState({
              confirmLoading: false,
            })
            return notify.warn(formatMessage(intlMsg.addHostFailed))
          },
          isAsync: true,
        },
      })
    })
  }

  renderClusterSource = () => {
    const { location: { query }, intl: { formatMessage } } = this.props
    switch (query.clusterType) {
      case '1':
        return formatMessage(intl.clusterTypeOne)
      case '2':
        return formatMessage(intl.clusterTypeTwo)
      case '3':
        return formatMessage(intl.clusterTypeThree)
      case '4':
        return formatMessage(intl.clusterTypeFour)
      case '5':
        return formatMessage(intl.clusterTypeFive)
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
      rcMasterError, rcDoubleMaster, openStackData, osMasterError,
      osDoubleMaster, iaasSource,
    } = this.state
    const { form, masterCount } = this.props
    switch (iaasSource) {
      case 'diy':
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
      case 'openStack': // TODO openStack
        return <OpenStack
          {...{
            form,
            formItemLayout,
            updateState: data => this.updateState('openStack', data),
            removeDiyField: this.removeOsField,
            dataSource: openStackData,
            updateParentState: this._setState,
            osMasterError,
            osDoubleMaster,
            masterCount,
            isAddHosts: true,
          }}
        />
      case 'rightCloud':
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
      case 'command':
        return this.renderSelfBuild()
      default:
        break
    }
  }

  renderSelfBuild = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <FormItem
        label={formatMessage(intlMsg.hostConfig)}
        {...formItemLayout}
      >
        <SelfBuild
          {...{
            intl,
          }}
          isAddHost
        />
      </FormItem>
    )
  }

  selectIaasSource = iaasSource => {
    this.setState({
      iaasSource,
    })
  }

  renderIaasList = () => {
    const { iaasSource } = this.state
    const { location: { query: { clusterType } } } = this.props
    const iaasList = [].concat(DEFAULT_LIST)
    switch (clusterType) {
      case '2':
        iaasList.push(OPEN_STACK)
        break
      case '3':
        iaasList.push(RIGHT_CLOUD)
        break
      default:
        break
    }
    return iaasList.map((item, index) => {
      return (
        <Button
          type={iaasSource === item.value ? 'primary' : 'ghost'}
          onClick={() => this.selectIaasSource(item.value)}
          disabled={item.disabled}
        >
          <div className="template">
            <TenxIcon type={item.iconType}/>{item.name}
            {
              iaasSource === item.value ?
                [ <span className="triangle" key={index + 1}/>,
                  <Icon type="check" key={index + 2}/> ]
                : null
            }
          </div>
        </Button>
      )
    })
  }

  render() {
    const { confirmLoading } = this.state
    const { intl: { formatMessage } } = this.props
    return (
      <QueueAnim className="add-hosts">
        <Title title={formatMessage(intlMsg.addNodes)}/>
        <ReturnButton onClick={this.back}>{formatMessage(intlMsg.backToCluster)}</ReturnButton>
        <span className="first-title">{formatMessage(intlMsg.addNodes)}</span>
        <div className="add-hosts-body">
          <FormItem
            label={formatMessage(intlMsg.clusterNodeSource)}
            {...formItemLayout}
          >
            <div><TenxIcon type="server"/> {this.renderClusterSource()}</div>
          </FormItem>
          <FormItem
            label={formatMessage(intlMsg.addType)}
            {...formItemLayout}
          >
            <div className="iaas-list">
              {this.renderIaasList()}
            </div>
          </FormItem>
          {this.renderHosts()}
        </div>
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

export default injectIntl(Form.create()(AddHosts), {
  withRef: true,
})
