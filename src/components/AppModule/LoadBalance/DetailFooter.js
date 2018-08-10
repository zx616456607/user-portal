/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Detail footer
 *
 * @author zhangxuan
 * @date 2018-08-02
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import './style/DetailFooter.less'

export default class DetailFooter extends React.PureComponent{
  static propTypes = {
    loading: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  }
  render() {
    const { loading, onCancel, onOk } = this.props
    return (
      <div className="configFooter">
        <Button type="ghost" size="large" onClick={onCancel} disabled={loading}>取消</Button>
        <Button type="primary" size="large" onClick={onOk} loading={loading}>确认</Button>
      </div>
    )
  }
}
