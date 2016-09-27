/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppServiceLog component
 * 
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { DatePicker } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceLog.less"

export default class AppServiceLog extends Component {
  constructor(props) {
    super(props);
  }	
  
  render() {
    return (
      <div id="AppServiceLog">
		    <div className="bottomBox">
		      <div className="introBox"> 
		        <div className="operaBox">
		          <i className="fa fa-expand"></i>
		          <i className="fa fa-refresh"></i>
		          <DatePicker className="datePicker" />
		        </div>
		        <div className="infoBox">
		          Hello world~
		          <br />
		          &nbsp;&nbsp;Let me introduce myself.
		          <br />
		          &nbsp;&nbsp;&nbsp;&nbsp;I am an application of mengmengda~
		        </div>
		        <div style={{ clear:"both" }}></div>
		      </div>
		      <div style={{ clear:"both" }}></div>
		    </div>
      </div>
    )
  }
}
