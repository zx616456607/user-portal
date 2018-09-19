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
import { Button } from 'antd'
import ContainerNetwork from '../QuickCreateApp/ContainerNetwork'
import { AppServiceDetailIntl } from '../../../../src/components/AppModule/ServiceIntl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { sleep } from '../../../../src/common/tools';

export default class ContainerNetworkForDetail extends React.PureComponent {

  state = {}

  handleConfirm = async () => {
    const { form } = this.props
    const { getFieldValue, validateFields } = form
    const aliasesKeys = getFieldValue('aliasesKeys')
    const validateArray = [ 'hostname', 'subdomain' ]
    !isEmpty(aliasesKeys) && aliasesKeys.forEach(key => {
      const ipHost = `ipHost-${key}`
      const hostAliases = `hostAliases-${key}`
      validateArray.push(ipHost, hostAliases)
    })
    validateFields(validateArray, async errors => {
      if (errors) {
        return
      }
      this.setState({
        loading: true,
      })
      await sleep()
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
        </div>
        <ContainerNetwork
          {...this.props}
          setParentState={this.editing}
        />
      </div>
    )
  }
}
