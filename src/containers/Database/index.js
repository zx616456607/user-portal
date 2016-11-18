/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database component
 *
 * v0.1 - 2016-10-11
 * @author Bai Yu
 */


import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import './style/database.less'

const menuList = [
  {
    url: '/database_cache',
    name: 'MySQL集群'
  },
  {
    url: '/database_cache/mongo_cluster',
    name: 'Mongo集群'
  },
  {
    url: '/database_cache/redis_cluster',
    name: 'Redis集群'
  },
  {
    url: '/database_cache/database_storage',
    name: '存储卷'
  }
]

export default class Database extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  
  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id="Database">
        <QueueAnim 
          className="DatabaseSider" 
          key="DatabaseSider" 
          type="left"
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'DatabaseMenu CommonSecondMenu' : 'hiddenMenu DatabaseMenu CommonSecondMenu'} key='imageSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'DatabaseContent CommonSecondContent' : 'hiddenContent DatabaseContent CommonSecondContent' } >
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