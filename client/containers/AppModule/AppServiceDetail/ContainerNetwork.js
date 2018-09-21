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
import { Button } from 'antd'
import ContainerNetwork from '../QuickCreateApp/ContainerNetwork'
import { AppServiceDetailIntl } from '../../../../src/components/AppModule/ServiceIntl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import * as serviceActions from '../../../../src/actions/services'
import Notification from '../../../../src/components/Notification'

const {
  UPDATE_SERVICE_HOSTNAME_FAILURE,
  UPDATE_SERVICE_HOSTALIASES_FAILURE,
} = serviceActions
const notify = new Notification()

@connect(null, {
  updateHostname: serviceActions.updateHostname,
  updateHostAliases: serviceActions.updateHostAliases,
})
export default class ContainerNetworkForDetail extends React.PureComponent {

  state = {}

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

  handleConfirm = async () => {
    const { form, cluster, serviceDetail, updateHostname, updateHostAliases, intl } = this.props
    const { getFieldValue, validateFields } = form
    const serviceName = serviceDetail.metadata.name
    const aliasesKeys = getFieldValue('aliasesKeys')
    const validateArray = [ 'hostname', 'subdomain', 'aliasesKeys' ]
    !isEmpty(aliasesKeys) && aliasesKeys.forEach(key => {
      const ipHost = `ipHost-${key}`
      const hostAliases = `hostAliases-${key}`
      validateArray.push(ipHost, hostAliases)
    })
    validateFields(validateArray, async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        loading: true,
      })
      const { hostname, subdomain, aliasesKeys } = values
      const hostnameBoby = {
        hostname,
        subdomain,
      }
      const aliasesArray = []
      if (!isEmpty(aliasesKeys)) {
        aliasesKeys.forEach(key => {
          aliasesArray.push({
            ip: values[`ipHost-${key}`],
            hostnames: [ values[`hostAliases-${key}`] ],
          })
        })
      }
      const promiseArray = [
        updateHostAliases(cluster, serviceName, aliasesArray, { failed: { func: () => false } }),
      ]
      if (hostname && subdomain) {
        promiseArray.push(
          updateHostname(cluster, serviceName, hostnameBoby, { failed: { func: () => false } }))
      }
      const result = await Promise.all(promiseArray)
      const flag = result.every(res => {
        if (res.type === UPDATE_SERVICE_HOSTNAME_FAILURE) {
          notify.warn(intl.formatMessage(AppServiceDetailIntl.updateHostnameFailed))
          return false
        }
        if (res.type === UPDATE_SERVICE_HOSTALIASES_FAILURE) {
          notify.warn(intl.formatMessage(AppServiceDetailIntl.updateHostAliasesFailed))
          return false
        }
        return true
      })
      if (flag) {
        notify.close(intl.formatMessage(AppServiceDetailIntl.changeSuccess))
        this.setState({
          loading: false,
          isEdit: false,
        })
        return
      }
      this.setState({
        loading: false,
      })
    })
  }

  editing = flag => {
    this.setState({
      isEdit: flag,
    })
  }

  render() {
    const { isEdit, loading } = this.state
    const { intl, serviceDetail } = this.props
    const { formatMessage } = intl
    const { hostname, subdomain } = serviceDetail.spec.template.spec
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
        </div>
        <ContainerNetwork
          {...this.props}
          setParentState={this.editing}
          originalHostname={hostname}
          originalSubdomain={subdomain}
        />
      </div>
    )
  }
}
