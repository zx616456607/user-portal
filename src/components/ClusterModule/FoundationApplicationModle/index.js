/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Thursday June 7th 2018
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tooltip } from 'antd'
import InfrastructureImg from '../../../assets/img/quickentry/infrastructure.png'
// '../../assets/img/quickentry/infrastructure.png'
import './style/index.less'
const foundationApplicationModle = () => {
  Modal.info({
    title:"基础设施与应用关系",
    width: 720,
    content:(
      <div className='rightbox'>
        <div className='charts'>
          <div className='imgcontainer'>
            <img src={InfrastructureImg} alt="" className='img'/>
          </div>
        </div>
        <div className='legend'>
          <div className='container'>
            <Tooltip title="运行在节点上的基于Docker镜像创建的运行时的实例">
              <div className="item"><i className="fa fa-cube margin item_container" aria-hidden="true"></i><span className='text'>Container: 容器</span></div>
            </Tooltip>
            <Tooltip title="由N个相同镜像和配置定义的容器组成">
              <div className="item"><i className="fa fa-cubes margin" aria-hidden="true"></i><span className='text'>Service: 服务</span></div>
            </Tooltip>
          </div>
          <div className='container'>
            <Tooltip title="安装了Docker的服务器，可运行多个容器">
              <div className="item"><i className='icon margin node'></i><span className='text'>Node: 节点</span></div>
            </Tooltip>
            <Tooltip title="包含一个或多个节点">
              <div className="item"><i className='icon margin cluster'></i><span className='text'>Cluster: 集群</span></div>
            </Tooltip>
            <Tooltip title="可以包含N个相同或不同的服务">
              <div className="item"><i className='icon margin app'></i><span className='text'>APP: 应用</span></div>
            </Tooltip>
          </div>
        </div>
      </div>
    ),
    onOk() {},
  })
}

export default foundationApplicationModle