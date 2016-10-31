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
import { Input, Select, InputNumber, Button, Form } from 'antd'
import { postCreateMysqlDbCluster } from '../../actions/database_cache'
import './style/CreateDatabase.less'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

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
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (value === 'oracle') {
          callback([new Error('抱歉，该数据库名称已被占用。')]);
        } else {
          callback();
        }
      }, 800);
    }
  },
  checkPwdStart: function(){
    //this function for user check his password change the input type
    this.setState({
      showPwd: 'text'
    });
  },
  checkPwdEnd: function(){
    //this function for user stop check his password change the input type
    this.setState({
      showPwd: 'password'
    });
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    e.preventDefault();
    const { scope, postCreateMysqlDbCluster } = this.props;
    const _this = this;
    const { loadMysqlDbCacheAllList, cluster } = scope.props;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      var body = {
        cluster: values.clusterSelect,
        name: values.name,
        servicesNum: values.services,
        password: values.passwd,
        dbType: _this.state.currentType
      }
      scope.setState({
        CreateDatabaseModalShow: false
      });
      this.props.form.resetFields();
      postCreateMysqlDbCluster(body, loadMysqlDbCacheAllList(cluster));
    });
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入数据库集群名称' },
        { validator: this.databaseExists },
      ],
    });
    const servicesProps = getFieldProps('services', {
      initialValue: 1
    });
    const selectStorageProps = getFieldProps('storageSelect', {
      rules: [
        { required: true, message: '请选择存储卷' },
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
      ],
    });
    const selectNamespaceProps = getFieldProps('namespaceSelect', {
      rules: [
        { message: '请选择空间' },
      ],
    });
    const selectClusterProps = getFieldProps('clusterSelect', {
      rules: [
        { required: true, message: '请选择集群' },
      ],
    });
    return (
    <div id='CreateDatabase' type='right'>
    <Form horizontal>
      <div className='infoBox'>
        <div className='commonBox'>
          <div className='title'>
            <span>类型</span>
          </div>
          <div className='inputBox'>
            <Button size='large' type={ this.state.currentType == 'mysql' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'mysql') }>
              MySQL
            </Button>
            <Button size='large' type={ this.state.currentType == 'mongo' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'mongo') }>
              Mongo
            </Button>
            <Button size='large' type={ this.state.currentType == 'redis' ? 'primary' : 'ghost' } onClick={ this.selectDatabaseType.bind(this,'redis') }>
              Redis
            </Button>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>名称</span>
          </div>
          <div className='inputBox'>
            <FormItem 
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
            >
              <Input {...nameProps} size='large' />
            </FormItem>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>副本数</span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'80px',float:'left' }}>
              <InputNumber {...servicesProps} size='large' min={1} max={1000} />
            </FormItem>
            <span className='litteColor' style={{ float:'left',paddingLeft:'15px' }}>个</span>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>存储卷</span>
          </div>
          <div className='inputBox'>
            <FormItem>
              <Select {...selectStorageProps} className='storageSelect' size='large' >
                <Option value='jack'>Jack</Option>
                <Option value='lucy'>Lucy</Option>
                <Option value='yiminghe'>yiminghe</Option>
              </Select>
              <i className='fa fa-refresh litteColor'></i>
              <i className='fa fa-trash litteColor'></i>
            </FormItem>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>密码</span>
          </div>
          <div className='inputBox'>
            <FormItem
              hasFeedback
            >
              <Input {...passwdProps} type={this.state.showPwd} size='large' />
              <i className='fa fa-eye' onMouseDown={this.checkPwdStart} onMouseUp={this.checkPwdEnd}></i>
            </FormItem>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span>部署环境</span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'150px',float:'left',marginRight:'20px' }}>
              <Select {...selectNamespaceProps} className='envSelect' size='large'>
                <Option value='jack'>Jack</Option>
                <Option value='lucy'>Lucy</Option>
                <Option value='yiminghe'>yiminghe</Option>
              </Select>
            </FormItem>
            <FormItem style={{ width:'150px',float:'left' }}>
              <Select {...selectClusterProps} className='envSelect' size='large'>
                <Option value="cce1c71ea85a5638b22c15d86c1f61de">test</Option>
                <Option value="e0e6f297f1b3285fb81d2774225dddd">产品环境</Option>
                <Option value="e0e6f297f1b3285fb81d27742255cfcf">k8s 1.4</Option>
              </Select>
            </FormItem>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </div>
      <div className='btnBox'>
        <Button size='large' onClick={this.handleReset}>
          取消
        </Button>
        <Button size='large' type='primary' onClick={this.handleSubmit}>
          确定
        </Button>
      </div>
    </Form>
    </div>
    )
  }
});

function mapStateToProps(state) {
  return {
    createMySql: state.databaseCache.createMySql
  }
}

CreateDatabase = createForm()(CreateDatabase);

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  postCreateMysqlDbCluster
})(CreateDatabase)