import React from 'react'
import './style/Storage.less'
import { Button, Tooltip } from 'antd'
import graphCluster from '../../../assets/img/database_cache/cluster.png'
import graphStorage from '../../../assets/img/database_cache/storage.png'

class Storage extends React.Component {
  render() {
    return <div className="storage">
      <div className="title">存储</div>
      <div className="extendBtn">
        <Tooltip title="停止集群后可做扩容操作">
          <Button type="primary">扩容</Button>
        </Tooltip>
      </div>
      <div className="graph">
        <div className="cluster">
          <img src={graphCluster} alt=""/>
        </div>
        <div className="storage">
          <img src={graphStorage} alt=""/>
        </div>
      </div>
    </div>
  }
}
export default Storage
