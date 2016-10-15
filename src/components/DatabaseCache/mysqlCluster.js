/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v2.0 - 2016/10/11
 * @author Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Modal, Button, Icon, Collapse, Input, message } from 'antd'
import ModalDetail from './ModalDetail.js'
import './style/database.less'

export default class MysqlCluster extends Component {
  constructor() {
    super()
    this.state = {
      detailModal: false,
    }
  }
  showDetailModal(name) {
    console.log('cluster name is ', name)
    this.setState({
      detailModal: true
    })
  }

  render() {
    const parentScope = this
    return (
      <div className="databaseCol">
        <div className="databaseHead">
          <Button type="primary" size="large"><Icon type="plus" />MySQL集群</Button>
          <span className="rightSearch">
            <Input size="large" placeholder="搜索" style={{ width: 200 }} />
            <Icon type="search" />
          </span>
        </div>
        <div className="layoutBox">
          <div className="List">
            <div className="list-wrap">
              <div className="detailHead">
                <img src="/img/test/mysql.jpg" />
                <div className="detailName">
                  MySql-1
                </div>
                <div className="detailName">
                  <Button type="ghost" size="large" onClick={(name) => this.showDetailModal('mysql-1')}><Icon type="bars" />展开详情</Button>
                </div>
              </div>

              <ul className="detailParse">
                <li><span className="listKey">状态</span><span className="normal">运行中</span></li>
                <li><span className="listKey">地址</span><span className="listLink">http://mp.weixi.qq.com</span></li>
                <li><span className="listKey">副本数</span>996/999个</li>
                <li><span className="listKey">存储卷</span>2014MB</li>
              </ul>
            </div>
          </div>
          <div className="List">
            <div className="list-wrap">
              <div className="detailHead">
                <img src="/img/test/mysql.jpg" />
                <div className="detailName">
                  MySql-1
                </div>
                <div className="detailName">
                  <Button type="ghost" size="large" onClick={(name) => this.showDetailModal('mysql-2')}><Icon type="bars" />展开详情</Button>
                </div>
              </div>

              <ul className="detailParse">
                <li><span className="listKey">状态</span><span className="error">停止中</span></li>
                <li><span className="listKey">地址</span><span className="listLink">http://mp.weixi.qq.com</span></li>
                <li><span className="listKey">副本数</span>996/999个</li>
                <li><span className="listKey">存储卷</span>2014MB</li>
              </ul>
            </div>
          </div>
          <div className="List">
            <div className="list-wrap">
              <div className="detailHead">
                <img src="/img/test/mysql.jpg" />
                <div className="detailName">
                  MySql-1
                </div>
                <div className="detailName">
                  <Button type="ghost" size="large" onClick={(name) => this.showDetailModal('mysql-3')}><Icon type="bars" />展开详情</Button>
                </div>
              </div>

              <ul className="detailParse">
                <li><span className="listKey">状态</span><span className="normal">运行中</span></li>
                <li><span className="listKey">地址</span><span className="listLink">http://mp.weixi.qq.com</span></li>
                <li><span className="listKey">副本数</span>996/999个</li>
                <li><span className="listKey">存储卷</span>2014MB</li>
              </ul>
            </div>
          </div>
          <div className="List">
            <div className="list-wrap">
              <div className="detailHead">
                <img src="/img/test/mysql.jpg" />
                <div className="detailName">
                  MySql-1
                </div>
                <div className="detailName">
                  <Button type="ghost" size="large" onClick={(name) => this.showDetailModal('mysql-4')}><Icon type="bars" />展开详情</Button>
                </div>
              </div>

              <ul className="detailParse">
                <li><span className="listKey">状态</span><span className="normal">运行中</span></li>
                <li><span className="listKey">地址</span><span className="listLink">http://mp.weixi.qq.com</span></li>
                <li><span className="listKey">副本数</span>996/999个</li>
                <li><span className="listKey">存储卷</span>2014MB</li>
              </ul>
            </div>
          </div>
          <Modal visible={this.state.detailModal}
            className="AppServiceDetail" transitionName="move-right"
            onCancel={() => { this.setState({ detailModal: false }) } } >
            <ModalDetail scope={parentScope} />
          </Modal>
        </div>   {/* end layoutBox */}
      </div>
    )
  }
}