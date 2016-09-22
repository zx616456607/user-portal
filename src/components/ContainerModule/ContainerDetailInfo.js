/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ContainerDetailInfo component
 * 
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ContainerDetailInfo.less"			

export default class ContainerDetailInfo extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
  	const parentScope = this;
    return (
      <div id="ContainerDetailInfo">
	    <QueueAnim className="demo-content"
	      key="demo"
	      type="right"
	    >
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
	              所属节点
	          </div>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="dataBox">
	          <div className="commonTitle">
	            挺萌的容器
	          </div>
	          <div className="commonTitle">
	            好萌的镜像
	          </div>
	          <div className="commonTitle">
	            在北京呢
	          </div>
	          <div style={{ clear:"both" }}></div>
	        </div>
	      </div>
	      <div className="compose commonBox">
	        <span className="titleSpan">配置信息</span>
	        <div className="titleBox">
	          <div className="commonTitle">
	          带宽
	          </div>
	          <div className="commonTitle">
	          内存
	          </div>
	          <div className="commonTitle">
	          处理器
	          </div>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="dataBox">
	          <div className="commonTitle">
	          100M
	          </div>
	          <div className="commonTitle">
	          1024M
	          </div>
	          <div className="commonTitle">
	          256M
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
	      </div>
	      <div className="storage commonBox">
	        <span className="titleSpan">数据存储器</span>
	        <div className="titleBox">
	          <div className="commonTitle">
	          名称
	          </div>
	          <div className="commonTitle">
	          挂载点
	          </div>
	          <div style={{ clear:"both" }}></div>
	        </div>
	      </div>
        </QueueAnim>
      </div>
    )
  }
}

ContainerDetailInfo.propTypes = {
//
}
