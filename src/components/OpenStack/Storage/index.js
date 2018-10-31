/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Under Construction with tab
 *
 * v0.1 - 2017-07-01
 * @author Zhangpc
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Tabs, Card } from 'antd'
// import UnderConstruction from '../../UnderConstruction/'
import './style/index.less'
import Title from '../../Title'
import ObjectStorage from './ObjectStore'
import BlockStorage from './BlockStorage'
// import Snapshot from '../Snapshot'

const TabPane = Tabs.TabPane

export default class UnderTab extends React.Component {
  constructor(props){
    super(props)
    this.tabsChange = this.tabsChange.bind(this)
    this.state = {
      activeKey: 'blockStorage'
    }
  }

  componentWillMount() {
    const { location } = this.props
    const { query } = location
    if(query && query.from == "objectDetail"){
      this.setState({
        activeKey: "objectStorage",
      })
    }
  }

  tabsChange(activeKey){
    this.setState({
      activeKey,
    })
  }

  render() {
    const { location } = this.props
    const { activeKey } = this.state
    return (
      <QueueAnim
        className='AppList'
        type='right'
      >
        <div id='Storage' key='Storage'>
          <Title title="存储"/>
          <Tabs activeKey={activeKey} onChange={this.tabsChange} className="ref-tabs">
            <TabPane tab='块存储' key='blockStorage'>
              <Card className="tabCard">
                <BlockStorage/>
              </Card>
            </TabPane>
            <TabPane tab='对象存储' key='objectStorage'>
              <Card className="tabCard">
                <ObjectStorage />
              </Card>
            </TabPane>
            {/*<TabPane tab='快照' key='fileStorage'>*/}
              {/*<Card className="tabCard">*/}
                {/*<Snapshot />*/}
              {/*</Card>*/}
            {/*</TabPane>*/}
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}
