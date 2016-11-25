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
import { Button, Input, Form, Icon } from 'antd'
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
  componentDidMount(){
    const { config, form } = this.props;
    if(!!config) {
      config.map((item) => {
        let tmpUuid = ++this.state.uuid;
        this.setState({
          uuid: tmpUuid
        });
        let keys = form.getFieldValue('imageEnvInputs');
        keys = keys.concat(this.state.uuid);
        let temp = 'imageEnvInputs';
        form.setFieldsValue({
          'imageEnvInputs': keys
        });
      });
    } else {
      form.setFieldsValue({
        'imageEnvInputs': [0]
      });
    }
  },
  addImageEnv (k, index, scope) {
    //this function for user add an new input div
    //there are no button for user click
    //when user input words, after user key up would triger the function
    const { form } = this.props;
    let inputValue = form.getFieldValue('imageEnvInputs');
    let tmpUuid = ++this.state.uuid;
    this.setState({
      uuid: tmpUuid
    });
    // can use data-binding to get
    let keys = form.getFieldValue('imageEnvInputs');
    keys = keys.concat(this.state.uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      'imageEnvInputs': keys
    });
  },
  removeImageEnv (k, index, scope){
    //this function for user remove the input div
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('imageEnvInputs');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'imageEnvInputs': keys
    });
    if(keys.length == 0) {
      this.addImageEnv(scope)
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
    const { scope, form, config } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
    getFieldProps('imageEnvInputs', {
      initialValue: [0],
    });
    const ImageEnvInputItems = getFieldValue('imageEnvInputs').map((i) => {
      let itemKey = '';
      let configFlag = config[i] || {};
      const ImageEnvNameInputProps = getFieldProps(`imageEnvName${i}`, {
        rules: [
          { message: '请输入环境变量名' },
        ],
        initialValue: configFlag.name
      });
      const ImageEnvValueInputProps = getFieldProps(`imageEnvValue${i}`, {
        rules: [
          { message: '请输入环境变量值' },
        ],
        initialValue: configFlag.value
      });
      return (
      <QueueAnim key={`imageEnvInputs${i}`}>
        <div className='imageEnvInputDetail' key={`imageEnvInputDetail${i}`}>
          <div className='commonTitle'>
            <FormItem className='ImageEnvName'>
              <Input {...ImageEnvNameInputProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <span>=</span>
          </div>
          <div className='commonTitle'>
            <FormItem className='ImageEnvValue'>
              <Input {...ImageEnvValueInputProps} type='text' size='large' />
            </FormItem>
          </div>
          <div className='equalTitle'>
            <i className='fa fa-trash' onClick={() => this.removeImageEnv(i)}/>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='ImageEnvComponent' key='ImageEnvComponent'>
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
        {ImageEnvInputItems}
        <div className='addBtnBox'>
          <div className='addBtn' onClick={this.addImageEnv}>
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

ImageEnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(ImageEnvComponent, {
  withRef: true,
}));

