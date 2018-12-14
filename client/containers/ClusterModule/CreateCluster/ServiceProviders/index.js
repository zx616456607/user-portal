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
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'
import { FormattedMessage } from 'react-intl'
import TenxIcon from '@tenx-ui/icon/es/_old'
import '@tenx-ui/icon/assets/index.css'
import './style/index.less'
import DiyHost from './DiyHost'
import RightCloud from './RightCloud'
import ClusterConfig from './ClusterConfig'

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
  }

  componentWillUnmount() {
    // uuid = 0
  }

  initDiyFields = () => {
    const { form, diyData } = this.props
    const { setFieldsValue } = form
    setFieldsValue(diyData)
  }

  initRcFields = () => {
    const { form, rightCloudData } = this.props
    const { setFieldsValue } = form
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
      rcDoubleMaster, updateHostState, diyData, rightCloudData,
      removeDiyField, removeRcField,
    } = this.props
    const { iaasSource } = this.state
    switch (iaasSource) {
      case 'diy':
        return <DiyHost
          {...{
            form,
            formItemLayout,
            updateState: data => updateHostState('diyData', data),
            removeDiyField,
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
            updateState: data => updateHostState('rightCloud', data),
            removeRcField,
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

  dataChange = (e, key) => {
    const { updateParentState, serviceProviderData } = this.props
    updateParentState({
      serviceProviderData: {
        ...serviceProviderData,
        [key]: e.target.value,
      },
    })
  }

  render() {
    const { form, formItemLayout, intl, serviceProviderData, updateParentState } = this.props
    const { getFieldProps } = form
    const { formatMessage } = intl
    getFieldProps('iaasSource', {
      initialValue: 'diy',
    })
    const clusterNameProps = getFieldProps('clusterName', {
      initialValue: serviceProviderData.clusterName,
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
      onChange: e => this.dataChange(e, 'clusterName'),
    })
    const descProps = getFieldProps('description', {
      initialValue: serviceProviderData.description,
      rules: [
        { whitespace: true },
      ],
      onChange: e => this.dataChange(e, 'description'),
    })
    return (
      <div className="service-provider">
        <div className="base-info">
          <FormItem
            label={<FormattedMessage {...intlMsg.clusterName} />}
            {...formItemLayout}
          >
            <Input
              {...clusterNameProps}
              placeholder={formatMessage(intlMsg.plsInputClusterName)}
            />
          </FormItem>
          <FormItem
            label={<FormattedMessage {...intlMsg.description} />}
            {...formItemLayout}
          >
            <Input
              {...descProps}
              type="textarea"
              placeholder={'请输入描述'}
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
            serviceProviderData,
            updateParentState,
          }}
        />
      </div>
    )
  }
}
