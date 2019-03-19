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
import QueueAnim from 'rc-queue-anim'
import './style/database.less'

const menuList = [
  {
    url: '/database_cache/mysql_cluster',
    name: 'mysqlCluster'
  },
  {
    url: '/database_cache/redis_cluster',
    name: 'redisCluster'
  },
  {
    url: '/database_cache/zookeeper_cluster',
    name: 'zookeeperCluster'
  },

  {
    url: '/database_cache/elasticsearch_cluster',
    name: 'elasticsearchCluster'
  },

  //{
  //  url: '/database_cache/etcd_cluster',
  //  name: 'Etcd集群'
  //}

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
        <div className="DatabaseContent CommonSecondContent" >
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
