/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * CreateModel component
 * 
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card,Button } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'

export default class CreateModel extends Component {
  constructor(props) {
	super(props);
  }
	
  render() {
  	const { children } = this.props
    return (
        <QueueAnim 
          id = "CreateModel"        
          type = "right"
        >
          <div className="CreateModel" key = "CreateModel">
            <div className="topBox">
              <div className="contentBox">
              <div className="fastCreate commonBox">
                <svg className="home commonImg">
			      <use xlinkHref="#appstore" />
			    </svg>
              </div>
              <div className="appShop commonBox">
              </div>
              <div className="layout commonBox">
              </div>
              <div style={{ clear:"both" }}></div>
              </div>
            </div>
            <div className="bottomBox">
              <Button size="large">
                取消
              </Button>
              <Button size="large" type="primary">
                下一步
              </Button>
            </div>
          </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}