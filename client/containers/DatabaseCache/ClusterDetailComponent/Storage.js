import React from 'react'
import './style/Storage.less'
import { Button, Icon, Modal } from 'antd'
import graphCluster from '../../../assets/img/database_cache/cluster.png'
import graphStorage from '../../../assets/img/database_cache/storage.png'
import extend from '../../../assets/img/database_cache/extend.png'
import extendDisabled from '../../../assets/img/database_cache/extend-disabled.png'

class Storage extends React.Component {
  state = {
    extendModal: false,
  }
  showExtendModal = () => {
    this.setState({
      extendModal: true,
    })
  }
  render() {
    const { databaseInfo } = this.props
    return <div className="storage">
      <div className="title">存储</div>
      <div className="extendBtn">
        <Button type="primary" disabled= {databaseInfo.running === 0 } onClick={this.showExtendModal}>
          <img src={databaseInfo.running !== 0 ? extend : extendDisabled} alt=""/>
          <span>扩容</span>
        </Button>
        {
          databaseInfo.running === 0 &&
          <span className="tip">
            <Icon type="info-circle-o" />
            停止集群后可做扩容操作
          </span>
        }
      </div>
      <div className="graph">
        <div className="cluster">
          <div className="clusterName">
            MySql集群：
          </div>
          <div className="graphCluster">
            <img src={graphCluster} alt=""/>
            <div className="name">3个容器实例</div>
          </div>
        </div>
        <div className="line"></div>
        <div className="graphStorage">
          <img src={graphStorage} alt=""/>
          <div className="name">存储卷： 512M</div>
        </div>
      </div>
      <Modal
        title="扩容存储卷"
        visible={this.state.extendModal}
        onOk={this.confirmExtend}
        onCancel={() => {
          this.setState({
            extendModal: false,
          })
        }}
      >

      </Modal>
    </div>
  }
}
export default Storage
