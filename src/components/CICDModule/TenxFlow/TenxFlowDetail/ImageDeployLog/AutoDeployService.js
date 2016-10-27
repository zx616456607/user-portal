/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoDeployService component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Radio, Select, Alert, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/AutoDeployService.less'
import { browserHistory } from 'react-router';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  tag: {
    id: 'CICD.Tenxflow.AutoDeployService.tag',
    defaultMessage: '镜像版本',
  },
  service: {
    id: 'CICD.Tenxflow.AutoDeployService.service',
    defaultMessage: '服务',
  },
  updateType: {
    id: 'CICD.Tenxflow.AutoDeployService.updateType',
    defaultMessage: '升级策略',
  },
  opera: {
    id: 'CICD.Tenxflow.AutoDeployService.opera',
    defaultMessage: '操作',
  },
  confirm: {
    id: 'CICD.Tenxflow.AutoDeployService.confirm',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'CICD.Tenxflow.AutoDeployService.cancel',
    defaultMessage: '取消',
  },
  add: {
    id: 'CICD.Tenxflow.AutoDeployService.add',
    defaultMessage: '添加自动部署配置',
  },
  edit: {
    id: 'CICD.Tenxflow.AutoDeployService.edit',
    defaultMessage: '编辑',
  },
  title: {
    id: 'CICD.Tenxflow.AutoDeployService.title',
    defaultMessage: '自动部署服务',
  },
  tooltips: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltips',
    defaultMessage: '注：通过服务对应的镜像版本选出要自动部署的服务，并配置好部署升级方式（即：TenxFlow构建出某镜像版本后，将对以下服务升级部署）',
  },
  addNow: {
    id: 'CICD.Tenxflow.AutoDeployService.addNow',
    defaultMessage: '立即部署应用',
  },
  tooltipsFirst: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltipsFirst',
    defaultMessage: '检测到当前Flow构建生成的镜像，还未部署过应用或服务，请先使用该镜像直接创建',
  },
  tooltipsSecond: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltipsSecond',
    defaultMessage: '【单服务应用】或者创建其它【多服务应用】使用该镜像创建子服务',
  },
  normalUpdate: {
    id: 'CICD.Tenxflow.AutoDeployService.normalUpdate',
    defaultMessage: '普通升级',
  },
  imageUpdate: {
    id: 'CICD.Tenxflow.AutoDeployService.imageUpdate',
    defaultMessage: '灰度升级',
  },

})

let uuid = 0;
let AutoDeployService = React.createClass({
  getInitialState: function() {
    return {
      editing: false
    }
  },
  componentWillMount () {
    document.title = 'TenxFlow | 时速云';
  },
  changeEdit (e) {
    //this function for user change the edit type
    //if the current edit type is false,then the current type will be change to the true
    //if the current edit type is true,then the form will be submit and change to the false
    const { editing } = this.state;
    if(!editing) {
      //it's meaning editing is false
      this.setState({
        editing: true
      });
    }else {
      //it's meaning editing is true
      e.preventDefault();
      this.props.form.validateFields((errors, values) => {
        if (errors) {
          console.log(errors);
          return;
        }
        console.log(values);
        this.setState({
          editing: false
        });
      });
    }   
  },
  cancelEdit (e) {
    this.setState({
      editing: false
    });
  },
  remove (k) {
    const { form } = this.props;
    // can use data-binding to get
    if(this.state.editing){
      let keys = form.getFieldValue('keys');
      keys = keys.filter((key) => {
        return key !== k;
      });
      // can use data-binding to set
      form.setFieldsValue({
        keys,
      });
    }  
  },
  add () {
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
  },
  render () {
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('keys', {
      initialValue: [0],
    });
    const haveTag = false;
    const formItems = getFieldValue('keys').map((k) => {
      const tagSelect = getFieldProps('tagSelect' + k, {
        rules: [
          { required: true, message: '请选择' },
        ],
      });
      const selectProps = getFieldProps('serviceSelect' + k, {
        rules: [
          { required: true, message: '请选择' },
        ],
      });
      const updateType = getFieldProps('radio' + k, {
        initialValue: 'normalUpdate'
      });
      return (
        <div className='tagDetail'>
          <Form.Item key={'name' + k} className='tag commonItem'>
            <Select {...tagSelect} style={{ width: '90%' }} disabled={this.state.editing ? false : true } >
              <Option value='test1'>test1</Option>
              <Option value='test2'>test2</Option>
              <Option value='test3'>test3</Option>
              <Option value='test4'>test4</Option>
              <Option value='test5'>test5</Option>
            </Select>
          </Form.Item>
          <Form.Item key={'select' + k} className='service commonItem'>
            <Select {...selectProps} style={{ width: '90%' }} disabled={this.state.editing ? false : true } >
              <Option value='test1'>test1</Option>
              <Option value='test2'>test2</Option>
              <Option value='test3'>test3</Option>
              <Option value='test4'>test4</Option>
              <Option value='test5'>test5</Option>
            </Select>
          </Form.Item>
          <Form.Item key={'radio' + k} className='updateType commonItem'>
            <RadioGroup {...updateType} disabled={this.state.editing ? false : true } >
              <Radio key='a' value={'normalUpdate'}><FormattedMessage {...menusText.normalUpdate} /></Radio>
              <Radio key='b' value={'rollingUpdate'}><FormattedMessage {...menusText.imageUpdate} /></Radio>
            </RadioGroup>
          </Form.Item>
          <div className='opera commonItem'>
            <i className='fa fa-trash' onClick={() => this.remove(k)}></i>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      );
    });
    return (
      <div id='AutoDeployService' key='AutoDeployService'>
        <div className='title'>
          <FormattedMessage {...menusText.title} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='btnBox'>
            { haveTag ? [
              <Button className='editBtn' size='large' type='primary' onClick={this.changeEdit}>
                { this.state.editing ? formatMessage(menusText.confirm) : formatMessage(menusText.edit) }
              </Button>
            ] : null}
            { this.state.editing ? [
              <Button className='cancelBtn' size='large' type='ghost' onClick={this.cancelEdit}>
                <FormattedMessage {...menusText.cancel} />
              </Button>
              ] : null 
            }
          </div>
          <Form className='tagForm' horizontal form={this.props.form}>
            { haveTag ? [
              <div>
                <div className='tagTitle'>
                  <span className='tag commonTitle'>
                    <FormattedMessage {...menusText.tag} />
                  </span>
                  <span className='service commonTitle'>
                    <FormattedMessage {...menusText.service} />
                  </span>
                  <span className='updateType commonTitle'>
                    <FormattedMessage {...menusText.updateType} />
                  </span>
                  <span className='opera commonTitle'>
                    <FormattedMessage {...menusText.opera} />
                  </span>
                  <div style={{ clear:'both' }}></div>
                </div>
                {formItems}      
              </div>
            ] : [
              <div className='noTag'>
                <Button className='delployBtn' size='large' type='primary'>
                  <FormattedMessage {...menusText.addNow} />
                </Button>
                <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
                <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
              </div>
            ] }
          </Form>
          { this.state.editing ? [
            <div className='addBtn' onClick={this.add}>
              <Icon type='plus-circle-o' /><FormattedMessage {...menusText.add} />
            </div>
            ] : null
          }
        </div>
      </div>
    );
  },
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

AutoDeployService = createForm()(AutoDeployService);

AutoDeployService.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(AutoDeployService, {
  withRef: true,
}));

