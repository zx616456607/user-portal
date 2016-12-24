/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {  } from 'antd'
import './style/Top.less'

export default class Top extends Component {
  constructor (props) {
  	super(props)
  	this.state = {

  	}
  }
  render(){
  	return (
  	  <div id='Top'>
  	  	<div className='topWrap'>
  	  	  <div className='topLogo'>时速云</div>
  	  	  <div className='topNav'>
  	  	    <div className='navItem'>官网首页</div>
  	  	    <div className='navItem'>文档中心</div>
  	  	    <div className='navItem'>关于</div>
  	  	    <span style={{lineHeight:'25px'}}>|</span>
  	  	    <div className='log'>
  	  	      <div className='navItem'>登录</div>
  	  	      <div className='navItem'>注册</div>
  	        </div>
  	  	  </div>
  	  	</div>
  	  </div>
	)
  }
}