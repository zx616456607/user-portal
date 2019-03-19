/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Container network
 *
 * @author zhangxuan
 * @date 2018-09-18
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Spin } from 'antd'
import ContainerNetwork from '../QuickCreateApp/ContainerNetwork'
import { AppServiceDetailIntl } from '../../../../src/components/AppModule/ServiceIntl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import * as serviceActions from '../../../../src/actions/services'
import Notification from '../../../../src/components/Notification'
import get from 'lodash/get'
import * as con from '../../../../src/constants'

const {
  UPDATE_SERVICE_HOSTCONFIG_FAILURE,
} = serviceActions
const notify = new Notification()

function mapStateToProps() {
  return { }
}

@connect(mapStateToProps, {
  updateHostConfig: serviceActions.updateHostConfig,
  UpdateServiceAnnotation: serviceActions.UpdateServiceAnnotation,
})
export default class ContainerNetworkForDetail extends React.PureComponent {

  state = {
    refresh: false,
  }

  componentDidMount() {
    const { serviceDetail, form } = this.props
    const { setFieldsValue } = form
    const { hostname, subdomain, hostAliases } = serviceDetail.spec.template.spec
    const aliasesKeys = []
    const aliasesObj = {}
    if (!isEmpty(hostAliases)) {
      hostAliases.forEach((item, index) => {
        aliasesKeys.push(index + 1)
        Object.assign(aliasesObj, {
          [`ipHost-${index + 1}`]: item.ip,
          [`hostAliases-${index + 1}`]: item.hostnames[0],
        })
      })
    }
    setFieldsValue({
      hostname,
      subdomain,
      aliasesKeys,
      ...aliasesObj,
    })
  }
  updateFlowContainer = async () => {
    const cluster = get(this.props, [ 'cluster' ], null)
    const serviceName = get(this.props, [ 'serviceDetail', 'metadata', 'name' ], null)
    const res = get(this.props.serviceDetail, [ 'spec', 'template', 'metadata', 'annotations' ], {})
    const flag = res[con.flowContainerIN] || res[con.flowContainerOut]
    if (cluster && serviceName) {
      if (this.props.form.getFieldValue('flowSliderCheck')) {
        this.props.UpdateServiceAnnotation(cluster, serviceName, {
          [con.flowContainerIN]: this.props.form.getFieldValue('flowSliderInput') * con.LimitFlowContainer + 'M',
          [con.flowContainerOut]: this.props.form.getFieldValue('flowSliderOut') * con.LimitFlowContainer + 'M',
        })
      } else {
        if (flag !== undefined) {
          this.props.UpdateServiceAnnotation(cluster, serviceName, {
            [con.flowContainerIN]: '',
            [con.flowContainerOut]: '',
          })
        }
      }
    }
  }
  handleConfirm = async () => {
    const { form, cluster, serviceDetail, updateHostConfig, intl } = this.props
    const { getFieldValue, validateFields, setFields } = form
    const serviceName = serviceDetail.metadata.name
    const aliasesKeys = getFieldValue('aliasesKeys')
    const validateArray = [ 'hostname', 'subdomain', 'aliasesKeys' ]
    !isEmpty(aliasesKeys) && aliasesKeys.forEach(key => {
      const ipHost = `ipHost-${key}`
      const hostAliases = `hostAliases-${key}`
      validateArray.push(ipHost, hostAliases)
    })
    this.updateFlowContainer()
    validateFields(validateArray, async (errors, values) => {
      if (errors) {
        return
      }
      const { hostname, subdomain, aliasesKeys } = values
      const newHostname = hostname && hostname.trim()
      const newSubdomain = subdomain && subdomain.trim()
      if (!!newHostname && !newSubdomain || !newHostname && !!newSubdomain) {
        const errorObj = {}
        if (!newHostname) {
          Object.assign(errorObj, {
            hostname: {
              errors: [ intl.formatMessage(AppServiceDetailIntl.hostnameIsRequired) ],
              value: '',
            },
          })
        } else {
          Object.assign(errorObj, {
            subdomain: {
              errors: [ intl.formatMessage(AppServiceDetailIntl.subdomainIsRequired) ],
              value: '',
            },
          })
        }
        setFields(errorObj)
        return
      }
      this.setState({
        loading: true,
      })
      const hostaliases = []
      if (!isEmpty(aliasesKeys)) {
        aliasesKeys.forEach(key => {
          hostaliases.push({
            ip: values[`ipHost-${key}`],
            hostnames: [ values[`hostAliases-${key}`] ],
          })
        })
      }
      const hostnameBoby = {
        hostname: newHostname,
        subdomain: newSubdomain,
        hostaliases,
      }
      const result =
        await updateHostConfig(cluster, serviceName, hostnameBoby, {
          failed: { func: () => false },
        })
      if (result.type === UPDATE_SERVICE_HOSTCONFIG_FAILURE) {
        notify.warn(intl.formatMessage(AppServiceDetailIntl.changeFailure))
        this.setState({
          loading: false,
        })
        return
      }
      notify.success(intl.formatMessage(AppServiceDetailIntl.changeSuccess))
      this.setState({
        loading: false,
        isEdit: false,
      })
    })
  }

  editing = flag => {
    this.setState({
      isEdit: flag,
    })
  }
  onCancel = () => {
    this.setState({
      isEdit: false,
      refresh: true,
    }, () => { this.setState({ refresh: false }) })
  }
  render() {
    const { isEdit, loading } = this.state
    const { intl } = this.props
    const { formatMessage } = intl
    return (
      <div className="commonBox containerNetworkForDetail">
        <span className="titleSpan">{formatMessage(AppServiceDetailIntl.containerNetwork)}</span>
        <div className={classNames('editTip', { hide: !isEdit })}>
          {formatMessage(AppServiceDetailIntl.changeNoEffect)}
        </div>
        <div className="save_box">
          <Button
            type="primary"
            size="large"
            onClick={() => this.handleConfirm()}
            className="title_button"
            disabled={!isEdit}
            loading={loading}
          >
            {formatMessage(AppServiceDetailIntl.appChange)}
          </Button>
          { isEdit &&
              <Button
                style={{ marginLeft: 8 }}
                size="large"
                onClick={this.onCancel}
              >
                取消
              </Button>
          }
        </div>
        { this.state.refresh ?
          <Spin/>
          : <ContainerNetwork
            {...this.props}
            setParentState={this.editing}
          /> }
      </div>
    )
  }
}
