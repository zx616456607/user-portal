/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2016-10-11
 * @author Bai Yu
 */


import React, { Component, PropTypes } from 'react'
import DatabaseSider from '../../components/DatabaseCache/databaseSider'
import MysqlCluster from '../../components/DatabaseCache/mysqlCluster'
import QueueAnim from 'rc-queue-anim'
// import './style/AppCenter.less'

export default class Database extends Component {
  render() {
    const { children } = this.props
    console.log('this props', this.props)
    return (
      <div id="AppCenter">
        <QueueAnim className="DatabaseSider" key="DatabaseSider" type="left">
          <div className="imageMenu" key="imageSider">
            <DatabaseSider />
          </div>
        </QueueAnim>
        <div className="imageContent">
          <MysqlCluster />
        </div>
      </div>
    )
  }
}

Database.propTypes = {
  // Injected by React Router
  // children: PropTypes.node
}