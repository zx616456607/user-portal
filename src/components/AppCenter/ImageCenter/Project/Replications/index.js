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
import { Card, Tabs, Table } from 'antd'
import Endpoints from './Endpoints'
import Rules from './Rules'
import LabelModule from '../LabelModule'
import './style/index.less'
import RepoReadOnly from '../../../../../../client/containers/AppCenter/ImageCenter/Project/Replications/RepoReadOnly'
import RepoClear from '../../../../../../client/containers/AppCenter/ImageCenter/Project/Replications/RepoClear'

const TabPane = Tabs.TabPane

class Replications extends React.Component {

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
              <TabPane tab="标签" key="label">
                <LabelModule scope="g" />
              </TabPane>
              <TabPane tab="仓库只读" key="readOnly">
                <RepoReadOnly />
              </TabPane>
              <TabPane tab="仓库清理" key="clearRepo">
                <RepoClear />
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
