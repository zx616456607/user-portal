/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppCreate component
 * 
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/ProgressList.less'

export default class ProgressList extends Component {
  constructor(props) {
	super(props);
  }
	
  render() {
  	const { children } = this.props
    return (
        <QueueAnim 
          id = "ProgressList"        
          type = "left"
        >
          <div className="ProgressList" key = "ProgressList">
            <div className="firstStep">
              
            </div>
          </div>
      </QueueAnim>
    )
  }
}

ProgressList.propTypes = {
  // Injected by React Router
}