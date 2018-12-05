/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Service providers
 *
 * @author zhangxuan
 * @date 2018-11-27
 */
import React from 'react'
import { Form, Input, Button, Icon } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'
import { FormattedMessage } from 'react-intl'
import TenxIcon from '@tenx-ui/icon/es/_old'
import '@tenx-ui/icon/assets/index.css'
import './style/index.less'
import DiyHost from './DiyHost'
import RightCloud from './RightCloud'
import ClusterConfig from './ClusterConfig'
import { formatIpRangeToArray } from './utils'

// let uuid = 0
const FormItem = Form.Item

const IAAS_LIST = [{
  value: 'diy',
  name: '自定义添加主机',
  iconType: 'hostlists-o',
  disabled: false,
}, {
  value: 'openStack',
  name: 'Open Stack',
  iconType: 'openstack',
  disabled: true,
}, {
  value: 'rightCloud',
  name: '云管--云星',
  iconType: 'rightCloud',
  disabled: false,
}]

export default class ServiceProviders extends React.PureComponent {

  state = {
    iaasSource: 'diy',
    diyData: {},
    rightCloudData: {},
  }

  componentWillUnmount() {
    // uuid = 0
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

  initDiyFields = () => {
    const { diyData } = this.state
    const { setFieldsValue } = this.props.form
    setFieldsValue(diyData)
  }

  initRcFields = () => {
    const { rightCloudData } = this.state
    const { setFieldsValue } = this.props.form
    setFieldsValue(rightCloudData)
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

  selectIaasSource = iaasSource => {
    // uuid = 0
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      iaasSource,
    })
    this.setState({
      iaasSource,
    })
    switch (iaasSource) {
      case 'diy':
        return this.initDiyFields()
      case 'rightCloud':
        return this.initRcFields()
      default:
        break
    }
  }

  renderIaasList = () => {
    const { iaasSource } = this.state
    return IAAS_LIST.map((item, index) => {
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

  renderHostList = () => {
    const {
      formItemLayout, form, updateParentState,
      diyMasterError, diyDoubleMaster, rcMasterError,
      rcDoubleMaster,
    } = this.props
    const { iaasSource, diyData, rightCloudData } = this.state
    switch (iaasSource) {
      case 'diy':
        return <DiyHost
          {...{
            form,
            formItemLayout,
            updateState: data => this.updateState('diyData', data),
            removeDiyField: this.removeDiyField,
            dataSource: diyData,
            updateParentState,
            diyMasterError,
            diyDoubleMaster,
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
            updateParentState,
            rcMasterError,
            rcDoubleMaster,
          }}
        />
      default:
        break
    }
  }

  render() {
    const { form, formItemLayout, intl } = this.props
    const { getFieldProps } = form
    const { formatMessage } = intl
    getFieldProps('iaasSource', {
      initialValue: 'diy',
    })
    const clusterNameProps = getFieldProps('clusterName', {
      rules: [
        { required: true, message: formatMessage(intlMsg.plsInputClusterName) },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 18) {
              return callback([ new Error(formatMessage(intlMsg.clusterNameErr)) ])
            }
            callback()
          },
        },
      ],
    })
    const descProps = getFieldProps('description', {
      rules: [
        { whitespace: true },
      ],
    })
    return (
      <div className="service-provider">
        <div className="base-info">
          <FormItem
            label={<FormattedMessage {...intlMsg.clusterName} />}
            {...formItemLayout}
          >
            <Input {...clusterNameProps}/>
          </FormItem>
          <FormItem
            label={<FormattedMessage {...intlMsg.description} />}
            {...formItemLayout}
          >
            <Input
              {...descProps}
              type="textarea"
            />
          </FormItem>
        </div>
        <div className="dividing-title">
          <span>主机配置</span>
          <i/>
        </div>
        <FormItem
          label={'选择 IaaS 来源'}
          {...formItemLayout}
        >
          <div className="iaas-list">
            {this.renderIaasList()}
          </div>
        </FormItem>
        {this.renderHostList()}
        <div className="dividing-title">
          <span>集群配置</span>
          <i/>
        </div>
        <ClusterConfig
          {...{
            form,
            formItemLayout,
          }}
        />
      </div>
    )
  }
}
