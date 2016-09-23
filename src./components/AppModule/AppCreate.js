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
import ProgressList from './AppCreate/ProgressList.js'
import AppCreateSelectModel from './AppCreate/CreateModel.js'
import './style/AppCreate.less'

export default class AppCreate extends Component {
  constructor(props) {
		super(props);
		this.state = {
	  	createModel:"fast"
		}
	}
  render() {
  	const { children } = this.props;
  	const parentScope = this;
  	let newChildren = React.cloneElement(
        this.props.children, 
        {scope: parentScope}
   );
    return (
        <QueueAnim 
          id = "AppCreate"        
          type = "right"
        >
          <div className="AppCreate" key = "AppCreate">
      	    <Card>
      	      <div className="leftBox">
      	        <ProgressList scope={ parentScope } />
      	      </div>
      	      <div className="rightBox">
      	        { newChildren }
      	      </div>
      	      <div style={{ clear:"both" }}></div>
      	    </Card>
          </div>
      </QueueAnim>
    )
  }
}

AppCreate.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}