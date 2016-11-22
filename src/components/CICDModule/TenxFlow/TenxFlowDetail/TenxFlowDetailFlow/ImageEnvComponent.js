/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageEnvComponent component
 *
 * v0.1 - 2016-11-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/ImageEnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let ImageEnvComponent = React.createClass({
  getInitialState: function() {
    return {
      uuid: 0
    }
  },
  addServicesInput (k, index, scope) {
    //this function for user add an new input div
    //there are no button for user click
    //when user input words, after user key up would triger the function
    const { form } = this.props;
    let inputValue = form.getFieldValue('service' + index + 'input' + k);
    if(k == this.state.uuid) {
      if(!!inputValue) {
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
      }
    }
  },
  removeServicesInput (k, index, scope){
    //this function for user remove the input div
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('service' + index + 'inputs');
    if(keys.length == 1) {
      return ;
    }
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    let temp = 'service' + index + 'inputs';
    form.setFieldsValue({
      [`${temp}`]: keys
    });
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
      const servicesInputProps = getFieldProps(`service${index}input${i}`, {
        rules: [
          { message: '请输入环境变量' },
        ],
      });
      return (
      <QueueAnim key={'service' + index + 'input' + i + 'Animate'}>
        <div className='serviceInputDetail' key={'service' + index + 'input' + i}>
          <FormItem className='serviceInputForm'>
            <Input onKeyUp={ () => this.addServicesInput(i, index, scope) } {...servicesInputProps} type='text' size='large' />
            <i className='fa fa-trash' onClick={() => this.removeServicesInput(i, index, scope)} />
          </FormItem>
          <div style={{ clera:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='ImageEnvComponent' key='ImageEnvComponent'>
        {servicesInputItems}
      </div>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

ImageEnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(ImageEnvComponent, {
  withRef: true,
}));

