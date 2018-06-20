/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 20th 2018
 */
import * as React from 'react'
import { Progress, Icon } from 'antd'
import { Link } from 'react-router'
import PropTypes from 'prop-types'
import './style/index.less'
import _ from 'lodash'

class ResourceBanner extends React.Component {
  render () {
    return (
      <div className="ResourceBanner">
        <div>xxx项目在xxx集群中应用配额使用情况</div>
        <div className="progress">
          <Progress percent={50} strokeWidth={5} status="active" showInfo={false}/>
        </div>
        <div>8/10</div>
        <div><Link><Icon type="plus" /> 申请增加配额</Link></div>
      </div>
    )
  }
}

export default ResourceBanner