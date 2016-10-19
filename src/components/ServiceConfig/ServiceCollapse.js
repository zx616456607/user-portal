/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group
 *
 * v0.1 - 2016-10-17
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from './ServiceCollapseContainer'
import { Collapse } from 'antd'

const Panel = Collapse.Panel

class ServiceCollapse extends Component {
  constructor(props) {
    super(props)
    this.state = {
      Head: props.group,
      List: props.group.extended.configs,
      Size: props.group.extended.size
    }
  }
  sideCollapse(e) {
    console.log('ess ',e)
  }
  render() {
    const scope = this
    const { btnDeleteGroup, handChageProp, configGroupName, configName } = this.props
    const { Head ,List ,Size} = this.state
    return (
      <Collapse onChange={(e)=>this.sideCollapse(e)} accordion>
        <Panel
          header={
            <CollapseHeader
              parentScope={scope}
              btnDeleteGroup={btnDeleteGroup}
              handChageProp={handChageProp}
              collapseHeader={Head}
              sizeNumber={Size}
            />
          }
          handChageProp={handChageProp}
          key={Head.native.metadata.name}
          >
          <CollapseContainer
            parentScope={scope}
            configName={configName}
            configGroupName={(obj) => configGroupName(obj)}
            collapseContainer={List}
            groupname={Head.native.metadata.name} />
        </Panel>
      </Collapse>
    )
  }
}

export default ServiceCollapse