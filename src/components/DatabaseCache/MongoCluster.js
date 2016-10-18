/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  MongoCluster module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Modal, Button, Icon, Input, message } from 'antd'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import './style/MongoCluster.less'

let testData =['Mongo1','Mongo2','Mongo3']

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function(database){
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentDatabase: database
    })
  },
  render: function () {
    const { config } = this.props;
    let items = config.map((item, index) => {
      return (
        <div className='List' key={ index }>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src='/img/test/mysql.jpg' />
              <div className='detailName'>
                { item }
              </div>
              <div className='detailName'>
                <Button type='ghost' size='large' onClick={ this.showDetailModal.bind(this,item) }><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span><span className='normal'>运行中</span></li>
              <li><span className='listKey'>地址</span><span className='listLink'>http://mp.weixi.qq.com</span></li>
              <li><span className='listKey'>副本数</span>996/999个</li>
              <li><span className='listKey'>存储卷</span>2014MB</li>
            </ul>
          </div>
        </div>
      );
    });
    return (
      <div className='layoutBox'>
        {items}
      </div>
    );
  }
});

export default class MongoCluster extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.state = {
      detailModal: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false
    }
  }
  
  createDatabaseShow(){
    //this function for user show the modal of create database
    this.setState({
      CreateDatabaseModalShow: true
    });
  }
  
  render() {
    const parentScope = this
    return (
    <QueueAnim id='MongoCluster' type='right'>
      <div className='databaseCol' key='MongoCluster'>
        <div className='databaseHead'>
          <Button type='primary' size='large' onClick={ this.createDatabaseShow }>
            <i className='fa fa-plus' />&nbsp;Mongo集群
          </Button>
          <span className='rightSearch'>
            <Input size='large' placeholder='搜索' style={{ width: 200 }} />
            <i className="fa fa-search" />
          </span>
        </div>
        <MyComponent scope={parentScope} config={testData} />
      </div>
      <Modal visible={this.state.detailModal}
        className='AppServiceDetail' transitionName='move-right'
        onCancel={() => { this.setState({ detailModal: false }) } } 
        >
        <ModalDetail scope={parentScope} />
      </Modal>
      <Modal visible={this.state.CreateDatabaseModalShow}
        className='CreateDatabaseModal'
        title='创建数据库集群'
        onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } } 
        >
        <CreateDatabase scope={parentScope} database={'mongo'} />
      </Modal>
    </QueueAnim>
    )
  }
}