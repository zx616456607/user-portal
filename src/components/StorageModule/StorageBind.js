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
import "./style/StorageBind.less"
import { Card, Row, Col,Icon } from 'antd';
import { Timeline } from 'antd';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

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
  render(){
    const {formatMessage} = this.props.intl
    return (
      <div id="StorageBind">
        <Row>
          <Col>
            <Timeline>
              <Timeline.Item>
                <Card title={`${formatMessage(messages.app)} : my_app`} style={{ width: 300 }} bordered={false}>
                  <div className="container">
                    <div className="container-ico">
                      <i className="fa fa-server"></i>
                    </div>
                    <p>
                      <FormattedMessage {...messages.container} />
                      : my_container
                    </p>
                  </div>
                </Card>
                <div className="point">
                  <span className="point-inf">
                    <FormattedMessage {...messages.forIn} />
                    :var/data/_123321test/volume
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
  intl: PropTypes.object.isRequired
}

export default injectIntl(StorageBind, {
  withRef: true,
})

