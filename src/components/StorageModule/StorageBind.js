/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */
import React, { Component,PropTypes } from 'react'
import { connect } from 'react-redux'
import "./style/StorageBind.less"
import { Card, Row, Col,Icon } from 'antd';
import { Timeline } from 'antd';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getVolumeBindInfo } from '../../actions/storage'

const messages = defineMessages({
  forIn: {
    id: "Storage.titleRow.forin",
    defaultMessage: '容器挂载点'
  },
  volume: {
    id: "StorageBind.bind.volume",
    defaultMessage: "存储卷"
  },
  container: {
    id: "StorageBind.bind.container",
    defaultMessage: "容器"
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
    this.props.getVolumeBindInfo(this.props.pool, this.props.cluster, this.props.volumeName) 
  }
  render(){
    
    const {formatMessage} = this.props.intl
    let mountInfo = this.props.volumeBindInfo.volumeBindInfo
    if(!mountInfo) return <div></div>
    let appName = Object.getOwnPropertyNames(mountInfo)
    if(!appName || appName.length <=0) {
      return <div></div>
    }
    appName = appName[0]
    const appInfo = mountInfo[appName][0]
    if(!appInfo) return <div></div>
    let podName = Object.getOwnPropertyNames(appInfo)
    if(!podName) return <div></div>
    podName = podName[0]    
    return (
      <div id="StorageBind">
        <Row>
          <Col>
            <Timeline>
              <Timeline.Item>
                <Card title={`${formatMessage(messages.app)} : ${ appName } `} style={{ width: 300 }} bordered={false}>
                  <div className="container">
                    <div className="container-ico">
                      <i className="fa fa-server"></i>
                    </div>
                    <p>
                      <FormattedMessage {...messages.container} />
                      : { podName }
                    </p>
                  </div>
                </Card>
                <div className="point">
                  <span className="point-inf">
                    <FormattedMessage {...messages.forIn} />
                    : {appInfo[podName].join(',')}
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
                    : my-volume
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

