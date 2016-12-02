/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateVmModal component
 *
 * v0.1 - 2016-11-26
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Spin, Select } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getCloneVmConfig, createIntegrationVm } from '../../actions/integration'
import './style/CreateVmModal.less'

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const menusText = defineMessages({
  templateTitle: {
    id: 'Integration.CreateVmModal.templateTitle',
    defaultMessage: '选择虚拟机模板',
  },
  name: {
    id: 'Integration.CreateVmModal.name',
    defaultMessage: '虚拟机名称',
  },
  resourcePool: {
    id: 'Integration.CreateVmModal.resourcePool',
    defaultMessage: '计算资源池',
  },
  datastores: {
    id: 'Integration.CreateVmModal.datastores',
    defaultMessage: '存储资源池',
  },
  finishBtn: {
    id: 'Integration.CreateVmModal.finishBtn',
    defaultMessage: '配置完成',
  },
  cancelBtn: {
    id: 'Integration.CreateVmModal.cancelBtn',
    defaultMessage: '取消',
  },
})

let CreateVmModal = React.createClass({
  getInitialState: function() {
    return {
      template: null,
      resourcePool: null,
      datastore: null,
      vm: null,
      templateError: false,
      vmError: false,
      resourcePoolError: false,
      datastoreError: false
    }
  },
  componentWillMount() {
    const { getCloneVmConfig, integrationId, currentDataCenter } = this.props;
    getCloneVmConfig(integrationId, currentDataCenter)
  },
  componentWillReceiveProps(nextProps) {
    const { createIntegrationModal, currentDataCenter, getCloneVmConfig, integrationId } = nextProps;
    if(!createIntegrationModal) {
      this.props.form.resetFields();
    }
    if(this.props.currentDataCenter != currentDataCenter) {
      currentDataCenter(integrationId, currentDataCenter)
    }
  },
  onChangeTemplate(e) {
    //this function for user change the template
    this.setState({
      template: e,
      templateError: false
    })
  },
  onChangeVm(e) {
    //this function for user change the vm
    let value = e.target.value;
    this.setState({
      vm: value
    })
    if(value != '' && Boolean(value)){
      this.setState({
        vmError: false
      })
    }
  },
  onChangeResourcePool(e) {
    //this function for user change the resourcePool
    this.setState({
      resourcePool: e,
      resourcePoolError: false
    })
  },
  onChangeDatastore(e) {
    console.log(e)
    //this function for user change the datastore
    this.setState({
      datastore: e,
      datastoreError: false
    })
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      createVmModal: false
    });
  },
  handleSubmitCreate() {
    //this function for user submit the form
    const { scope, createIntegrationVm, integrationId, currentDataCenter } = this.props;
    const { getAllIntegration } = scope.props;
    let errorFlag = false;
    if(this.state.template == '' || !Boolean(this.state.template)) {
      this.setState({
        templateError: true
      })
      errorFlag = true;
    }
    if(this.state.vm == '' || !Boolean(this.state.vm)) {
      this.setState({
        vmError: true
      })
      errorFlag = true;
    }
    if(this.state.resourcePool == '' || !Boolean(this.state.resourcePool)) {
      this.setState({
        resourcePoolError: true
      })
      errorFlag = true;
    }
    if(this.state.datastore == '' || !Boolean(this.state.datastore)) {
      this.setState({
        datastoreError: true
      })
      errorFlag = true;
    }
    if(errorFlag) {
      return;
    }
    let body = {
      template: this.state.template,
      vm: this.state.template + '/' + this.state.vm,
      resource_pool: this.state.resourcePool,
      datastore: this.state.datastore       
    }
    createIntegrationVm(integrationId, currentDataCenter, body, {
      success: {
        func: () => {
          scope.setState({
            createVmModal: false
          });
          getIntegrationVmList(integrationId, currentDataCenter);  
        },
        isAsync: true
      }
    })
  },
  render() {
    const { isFetching, config } = this.props;
    if(isFetching || !Boolean(config)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    let datastores = null;
    if(!!config.datastores){
      datastores = config.datastores.map((item) => {
        return (
          <Option value={item} key={item}>{item}</Option>
        )
      });
    }
    let resourcePools = null;
    if(!!config.resourcePools) {
      resourcePools = config.resourcePools.map((item) => {
        return (
          <Option value={item} key={item}>{item}</Option>
        )
      });
    }
    let templates = null;
    if(!!config.templates) {
      templates = config.templates.map((item) => {
        return (
          <Option value={item} key={item}>{item}</Option>
        )
      })
    }
    return (
      <div id='CreateVmModal' key='CreateVmModal'>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.templateTitle} /></span>
          </div>
          <div className='inputBox'>
            <Select style={{ width: '300px' }} onChange={this.onChangeTemplate} value={this.state.template}>
              {templates}
            </Select>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.name} /></span>
          </div>
          <div className='inputBox'>
            <Input type='text' size='large' onChange={this.onChangeVm} value={this.state.vm}/>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.resourcePool} /></span>
          </div>
          <div className='inputBox'>
            <Select style={{ width: '300px' }} onChange={this.onChangeResourcePool} value={this.state.resourcePool}>
              {resourcePools}
            </Select>             
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.datastores}/></span>
          </div>
          <div className='inputBox'>            
            <Select style={{ width: '300px' }} onChange={this.onChangeDatastore} value={this.state.datastore}>
              {datastores}
            </Select>              
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          <div>
            <Button size='large' type='primary' onClick={this.handleSubmitCreate}>
              <FormattedMessage {...menusText.finishBtn} />
            </Button>
            <Button size='large' type='ghost' onClick={this.handleReset}>
              <FormattedMessage {...menusText.cancelBtn} />
            </Button>
          </div>
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const defaultVmConfig = {
    isFetching: false,
    config: {}
  }
  const { getCloneVmConfig } = state.integration
  const { isFetching, config } = getCloneVmConfig || defaultVmConfig
  return {
    isFetching,
    config
  }
}

CreateVmModal = createForm()(CreateVmModal);

CreateVmModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getCloneVmConfig,
  createIntegrationVm
})(injectIntl(CreateVmModal, {
  withRef: true,
}));

