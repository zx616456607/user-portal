/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CreateDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Input, Select, InputNumber, Button } from 'antd'
import './style/CreateDatabase.less'

const Option = Select.Option;

let CreateDatabase = React.createClass({
  getInitialState: function() {
    return {
      currentType: 'mysql',
      showPwd: 'password'
    }
  },
  componentWillMount: function(){
    const { database } = this.props;
    this.setState({
      currentType: database,
      showPwd: 'password'
    });
  },
  selectDatabaseType: function(database){
    //this funciton for user select different database
    this.setState({
      currentType: database
    });
  },
  
  render() {
    console.log(this.state)
    return (
    <div id='CreateDatabase' type='right'>
      <div className='infoBox'>
        <div className='commonBox'>
          <div className='title'>
            <span>类型</span>
          </div>
          <div className='inputBox'>
            <Button size='large' type={ this.currentType == 'mysql' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'mysql') }>
              MySQL
            </Button>
            <Button size='large' type={ this.currentType == 'mongo' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'mongo') }>
              Mongo
            </Button>
            <Button size='large' type={ this.currentType == 'redis' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'redis') }>
              Redis
            </Button>
          </div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>名称</span>
          </div>
          <div className='inputBox'>
            <Input size='large' />
          </div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>副本数</span>
          </div>
          <div className='inputBox'>
            <InputNumber size='large' min={1} max={1000} defaultValue={1} />
          </div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>存储卷</span>
          </div>
          <div className='inputBox'>
            <Select size='large' defaultValue='lucy' style={{ width: 200 }} >
              <Option value='jack'>Jack</Option>
              <Option value='lucy'>Lucy</Option>
              <Option value='yiminghe'>yiminghe</Option>
            </Select>
            <i className='fa fa-refresh'></i>
            <i className='fa fa-trash'></i>
          </div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>密码</span>
          </div>
          <div className='inputBox'>
            <Input type={this.state.showPwd} size='large' />
            <i className="fa fa-eye" onClick={this.checkPwd}></i>
          </div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>部署环境</span>
          </div>
          <div className='inputBox'>
            <Select size='large' defaultValue='lucy' style={{ width: 200 }}>
              <Option value='jack'>Jack</Option>
              <Option value='lucy'>Lucy</Option>
              <Option value='yiminghe'>yiminghe</Option>
            </Select>
            <Select size='large' defaultValue='lucy' style={{ width: 200 }}>
              <Option value='jack'>Jack</Option>
              <Option value='lucy'>Lucy</Option>
              <Option value='yiminghe'>yiminghe</Option>
            </Select>
          </div>
        </div>
      </div>
      <div className='btnBox'>
        <Button size='large' type='primary'>
          确定
        </Button>
        <Button size='large'>
          取消
        </Button>
      </div>
    </div>
    )
  }
})

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(CreateDatabase, {
  withRef: true,
}))