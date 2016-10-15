/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppServiceDetailInfo component
 * 
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceDetailInfo.less"			

export default class AppServiceDetailInfo extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
		const { isFetching, serviceDetail } = this.props
  	const parentScope = this;
		if (isFetching || !serviceDetail.metadata) {
			return (
				<Spin />
			)
		}
    return (
     <Card id="AppServiceDetailInfo">
	    <div className="info commonBox">
	      <span className="titleSpan">基本信息</span>
	      <div className="titleBox">
	        <div className="commonTitle">
	          名称
	        </div>
	        <div className="commonTitle">
	          镜像名称
	        </div>
	        <div className="commonTitle">
	          创建时间
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	      <div className="dataBox">
	        <div className="commonTitle">
						{ serviceDetail.metadata.name }
	        </div>
	        <div className="commonTitle">
	          { serviceDetail.images.join(', ') || '-' }
	        </div>
	        <div className="commonTitle">
	          { serviceDetail.metadata.creationTimestamp }
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	    </div>
	    <div className="compose commonBox">
	      <span className="titleSpan">配置信息</span>
	      <div className="titleBox">
	        <div className="commonTitle">
	        	CPU
	        </div>
	        <div className="commonTitle">
	        内存
	        </div>
	        <div className="commonTitle">
	          系统盘
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	      <div className="dataBox">
	        <div className="commonTitle">
	          { serviceDetail.spec.template.spec.containers[0].resources.requests.cpu || '-' }
	        </div>
	        <div className="commonTitle">
	          { serviceDetail.spec.template.spec.containers[0].resources.requests.memory || '-' }
	        </div>
	        <div className="commonTitle">
	          10G
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	    </div>
	    <div className="environment commonBox">
	      <span className="titleSpan">环境变量</span>
	      <div className="titleBox">
	        <div className="commonTitle">
	        变量名
	        </div>
	        <div className="commonTitle">
	          变量值
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	      <div className="dataBox">
	        <div className="commonTitle">
	          -
	        </div>
	        <div className="commonTitle">
	         	-
	        </div>
	        <div style={{ clear:"both" }}></div>
	      </div>
	    </div>
     </Card>
    )
  }
}

AppServiceDetailInfo.propTypes = {
//
}
