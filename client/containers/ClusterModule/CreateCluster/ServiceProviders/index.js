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
import ClusterConfig from './ClusterConfig'

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
  }

  updateState = (key, data) => {
    this.setState({
      [key]: data,
    })
  }

  selectIaasSource = iaasSource => {
    this.setState({
      iaasSource,
    })
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
    const { formItemLayout, form } = this.props
    const { iaasSource, diyData } = this.state
    switch (iaasSource) {
      case 'diy':
        return <DiyHost
          {...{
            form,
            formItemLayout,
            updateState: data => this.updateState('diyData', data),
            dataSource: diyData,
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
