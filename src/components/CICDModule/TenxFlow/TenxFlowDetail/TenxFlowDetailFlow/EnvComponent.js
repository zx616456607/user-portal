/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EnvComponent component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/EnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let EnvComponent = React.createClass({
  getInitialState: function() {
    return {
      uuid: 0
    }
  },
  addServicesInput (index) {
    //this function for user add an new input div
    //there are no button for user click
    //when user input words, after user key up would triger the function
    const { form } = this.props;
    let tmpUuid = ++this.state.uuid;
    this.setState({
      uuid: tmpUuid
    });
    // can use data-binding to get
    let keys = form.getFieldValue('service' + index + 'inputs');
    keys = keys.concat(this.state.uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    let temp = 'service' + index + 'inputs';
    form.setFieldsValue({
      [`${temp}`]: keys
    });
  },
  removeServicesInput (k, index){
    //this function for user remove the input div
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('service' + index + 'inputs');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    let temp = 'service' + index + 'inputs';
    form.setFieldsValue({
      [`${temp}`]: keys
    });
    if(keys.length == 0) {
      this.addServicesInput(index)
    }
  },
  closeModal () {
    //this function for user close the env input modal
    const { scope } = this.props;
    scope.setState({
      envModalShow: null
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, index, form } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
    getFieldProps('service' + index + 'inputs', {
      initialValue: [0],
    });
    const servicesInputItems = getFieldValue('service' + index + 'inputs').map((i) => {
      const servicesInputNameProps = getFieldProps(`service${index}inputName${i}`, {
        rules: [
          { message: '请输入环境变量名' },
        ],
        initialValue: '',
      });
      const servicesInputValueProps = getFieldProps(`service${index}inputValue${i}`, {
        rules: [
          { message: '请输入环境变量值' },
        ],
        initialValue: '',
      });
      return (
      <QueueAnim key={'service' + index + 'input' + i + 'Animate'}>
        <div className='serviceInputDetail' key={'service' + index + 'input' + i}>
          <div className='commonTitle'>
            <FormItem className='serviceInputForm'>
              <Input {...servicesInputNameProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <span>=</span>
          </div>
          <div className='commonTitle'>
            <FormItem className='serviceInputForm'>
              <Input {...servicesInputValueProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <i className='fa fa-trash' onClick={() => this.removeServicesInput(i, index)} />
          </div>
          <div style={{ clera:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='EnvComponent' key='EnvComponent'>
        <div className='titleBox'>
          <div className='commonTitle'>
            <span>变量名</span>
          </div>
          <div className='equalTitle'>            
          </div>
          <div className='commonTitle'>
            <span>变量值</span>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        {servicesInputItems}
        <div className='addBtnBox'>
          <div className='addBtn' onClick={() => this.addServicesInput(index)}>
            <Icon type='plus-circle-o' />
            <span>增加环境变量</span>
          </div>
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

EnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(EnvComponent, {
  withRef: true,
}));

