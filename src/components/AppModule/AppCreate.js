/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppCreate component
 * 
 * v0.1 - 2016-09-12
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox,Card,Menu,Dropdown,Button,Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/AppCreate.less'

export default class AppCreate extends Component {
  constructor(props) {
	super(props);
	this.onAllChange = this.onAllChange.bind(this);
  }
  
  onAllChange(){
  	
  }
	
  render() {
    return (
        <QueueAnim 
          className = "AppList"        
          type = "right"
        >
          <div id="AppList" key = "AppList">
      	    <Card>
      	      
      	    </Card>
          </div>
      </QueueAnim>
    )
  }
}