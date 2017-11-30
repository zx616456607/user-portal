/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Replications component
 *
 * v0.1 - 2017-11-27
 * @author Zhangpc
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Card, Tabs, Table } from 'antd'
import { ROLE_SYS_ADMIN } from '../../../../../../constants'
import Endpoints from './Endpoints'
import Rules from './Rules'
import './style/index.less'

const TabPane = Tabs.TabPane

class Replications extends React.Component {
  componentWillMount() {
    const { loginUser } = this.props
    if (loginUser.role !== ROLE_SYS_ADMIN) {
      browserHistory.replace('/app_center/projects')
      return
    }
  }

  render() {
    const { location } = this.props
    return (
      <QueueAnim className="project-replications">
        <div key="replications">
          <Card>
            <Tabs defaultActiveKey="endpoints">
              <TabPane tab="同步目标" key="endpoints">
                <Endpoints />
              </TabPane>
              <TabPane tab="同步规则" key="rules">
                <Rules location={location}/>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities } = state
  const { location } = props
  return {
    loginUser: entities.loginUser.info,
    location
  }
}

export default connect(mapStateToProps,{
  //
})(Replications)
