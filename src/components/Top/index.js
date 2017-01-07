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
import './style/Top.less'
import { Link } from 'react-router'

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
  	  	  <div className='topLogo'>
            <a href='/'>
              <img src="/img/TopLogo.svg" alt="logo" className="logo" />
            </a>
          </div>
  	  	  <div className='topNav'>
  	  	    <div className='navItem'>
              <a href='https://www.tenxcloud.com' target='_blank'>官网首页</a>
            </div>
  	  	    <div className='navItem'>
              <a href='http://docs.tenxcloud.com' target='_blank'>文档帮助</a>
            </div>
  	  	    <div className='navItem'>
              <a href='http://open.tenxcloud.com' target='_blank'>问答社区</a>
            </div>
            <div className='navItem'>
              <a href='http://blog.tenxcloud.com' target='_blank'>技术博客</a>
            </div>
  	  	    <span style={{lineHeight:'25px'}}>|</span>
  	  	    <div className='log'>
  	  	      <div className='navItem' style={{marginLeft: 0}}>
                <Link to='/login'>登录</Link>
              </div>
  	  	      <div className='navRegister'>
                <Link to='/register'>注册</Link>
              </div>
  	        </div>
  	  	  </div>
  	  	</div>
  	  </div>
	)
  }
}