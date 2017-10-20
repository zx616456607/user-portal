/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import "./style/StorageBind.less"
import { Card, Row, Col, Icon, Spin } from 'antd';
import { Timeline } from 'antd';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getVolumeBindInfo } from '../../actions/storage'

const messages = defineMessages({
  forIn: {
    id: "Storage.titleRow.forin",
    defaultMessage: '挂载点'
  },
  volume: {
    id: "StorageBind.bind.volume",
    defaultMessage: "存储卷"
  },
  container: {
    id: "StorageBind.bind.container",
    defaultMessage: "服务"
  },
  app: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  },
})

class StorageBind extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    let query = {}
    if(this.props.query){
      query = this.props.query
    }
    this.props.getVolumeBindInfo(this.props.cluster, this.props.volumeName, query)
  }
  render() {
    const { volumeBindInfo } = this.props
    const {formatMessage} = this.props.intl
    let mountInfo = {}
    if(volumeBindInfo.volumeBindInfo && volumeBindInfo.volumeBindInfo[0]){
      mountInfo = volumeBindInfo.volumeBindInfo[0]
    }
    let isFetching = volumeBindInfo.isFetching
    if (isFetching) {
    return (<div className="loadingBox">
       <Spin size="large"></Spin> 
       </div>) 
    }
    if(!Object.keys(mountInfo).length || mountInfo.appName =='') {
      return (
        <div id="StorageBind" style={{paddingLeft:'15px'}}>
            无绑定服务
        </div>
      )
    }
    return (
      <div id="StorageBind">
        <Row>
          <Col>
            <Timeline>
              <Timeline.Item>
                <Card title={`${formatMessage(messages.app)}：${mountInfo.appName} `} style={{ width: 300 }} bordered={false}>
                  <div className="container">
                    <div className="container-ico">
                      <i className="fa fa-server"></i>
                    </div>
                    <p>
                      <FormattedMessage {...messages.container} />
                      <div className="serviceName">{mountInfo.serviceName}</div>
                    </p>
                  </div>
                </Card>
                <div className="point">
                  <span className="point-inf">
                    <FormattedMessage {...messages.forIn} />
                    ： {mountInfo.mountPoint}
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item color="#5bb95b">
                <div className="volume">
                  <div className="volume-ico">
                    <Icon type="hdd" />
                  </div>
                  <p>
                    <FormattedMessage {...messages.volume} />
                    <div className="volumeName">{this.props.volumeName}</div>
                  </p>
                </div>
              </Timeline.Item>
            </Timeline>
          </Col>
        </Row>
      </div>
    )
  }
}
StorageBind.propTypes = {
  intl: PropTypes.object.isRequired,
  getVolumeBindInfo: PropTypes.func.isRequired
}

function mapStateToProp(state) {
  return {
    volumeBindInfo: state.storage.volumeBindInfo
  }
}
export default connect(mapStateToProp, {
  getVolumeBindInfo
})(injectIntl(StorageBind, {
  withRef: true,
}))

