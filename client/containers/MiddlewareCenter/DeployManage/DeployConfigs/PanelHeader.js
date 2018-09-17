/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Panel header
 *
 * @author zhangxuan
 * @date 2018-09-08
 */
import React from 'react'
import classNames from 'classnames'

export default ({ title, isFirst }) => {
  return (
    <div
      className={classNames('configBoxHeader', {
        'reset-background-color': isFirst,
      })}
    >
      <div className="headerLeft">
        <div className="line"/>
        <span className="title">{title}</span>
      </div>
    </div>
  )
}
