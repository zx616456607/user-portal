/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row,Timeline } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ConfigFile from './ServiceConfigFile'

class CollapseContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <Row className="file-list">
        <Timeline>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
        </Timeline>
      </Row>
    )
  }
}

CollapseContainer.propTypes = {
  intl: PropTypes.object.isRequired
}

export default injectIntl(CollapseContainer, {
  withRef: true,
})


