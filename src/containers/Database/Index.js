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
import QueueAnim from 'rc-queue-anim'
import './style/database.less'

export default class Database extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="Database">
        <QueueAnim 
          className="DatabaseSider" 
          key="DatabaseSider" 
          type="left"
          >
          <div className="DatabaseMenu" key="imageSider">
            <DatabaseSider />
          </div>
        </QueueAnim>
        <div className="DatabaseContent">
          { children }
        </div>
      </div>
    )
  }
}

Database.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}