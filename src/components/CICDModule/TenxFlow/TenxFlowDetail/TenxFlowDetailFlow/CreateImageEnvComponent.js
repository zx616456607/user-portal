/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateImageEnvComponent component
 *
 * v0.1 - 2016-11-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { loadImageDetailTagConfig,  loadOtherDetailTagConfig } from '../../../../../actions/app_center'
import NotificationHandler from '../../../../../common/notification_handler'
import './style/CreateImageEnvComponent.less'

const createForm = Form.create;
const FormItem = Form.Item;

let CreateImageEnvComponent = React.createClass({
  getInitialState: function() {
    return {
      uuid: 0
    }
  },
  loadData() {
    const { form, loadImageDetailTagConfig, registryServer } = this.props
    let imageName = form.getFieldValue('imageName')
    if(!imageName) return
      this.setState({
      currentImageName: imageName
    })
    let registryUrl = ''
    if (imageName.indexOf('/') == imageName.lastIndexOf('/')) {
      registryUrl = registryServer.v2Server
      let tag = 'latest'
      if (imageName.indexOf(':') > 0) {
        imageName = imageName.split(':')
        tag = imageName[1]
        imageName = imageName[0]
        if (!tag) {
          tag = 'latest'
        }
      }
      const self = this
      if (registryUrl) {
        loadImageDetailTagConfig(registryUrl, imageName, tag, {
          success: {
            func: (result) => {
              if (!result.data) return
              const { scope, form, registry } = self.props;
              const { setFieldsValue } = form
              let imageEnv = result.data
              let envs = imageEnv.defaultEnv
              if (envs) {
                setFieldsValue({
                  imageEnvInputs: envs.map((env, index) => index)
                })
                if (this.state.uuid < envs.length) {
                  self.setState({
                    uuid: envs.length
                  })
                }
                envs.forEach((env, index) => {
                  env = env.split('=')
                  setFieldsValue({
                    [`imageEnvName${index}`]: env[0],
                    [`imageEnvValue${index}`]: env[1]
                  })
                })
              }
            }
          },
          failed: {
            func: (res) => {
              const { setFieldsValue } = self.props.form
              const notify = new NotificationHandler()
              setFieldsValue({
                  imageEnvInputs: [0]
              })
              if(res.message == 'Failed to find any tag') {
                notify.error('获取镜像信息失败，请检查该基础镜像是否存在')
                return
              }
              notify.error(res.message)
            }
          }
        })
      }
    }
  },
  componentWillMount() {
   this.loadData()
  },
  componentWillReceiveProps(nextProps) {
    const { form } = nextProps
    let imageName = form.getFieldValue('imageName')
    if(nextProps.visible != this.props.visible && nextProps.visible && this.state.currentImageName != imageName) {
      this.loadData()
    }
  },
  shouldComponentUpdate(nextProps) {
    const { form } = nextProps
    let imageName = form.getFieldValue('imageName')
     if(!nextProps.visible && this.state.currentImageName == imageName) {
       return false
     }
     return true
  },
  addImageEnv (scope) {
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
  removeImageEnv (k, scope){
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
      ImageEnvModal: null
    });
  },
  render() {
    const { scope, form, registryServer, imageConfig } = this.props;
    const { setFieldsValue } = form
    if(!registryServer || !imageConfig) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if(registryServer && imageConfig) {
      if(imageConfig.imageTagConfig[registryServer.v2Server] && imageConfig.imageTagConfig[registryServer.v2Server].isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form;
    getFieldProps('imageEnvInputs', {
      initialValue: [0],
    });
    const ImageEnvInputItems = getFieldValue('imageEnvInputs').map((i) => {
      const ImageEnvNameInputProps = getFieldProps(`imageEnvName${i}`, {
        rules: [
          { message: '请输入环境变量名' },
        ]
      });
      const ImageEnvValueInputProps = getFieldProps(`imageEnvValue${i}`, {
        rules: [
          { message: '请输入环境变量值' },
        ]
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
      <div id='CreateImageEnvComponent' key='CreateImageEnvComponent'>
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
  const defaultImageConfig = {}
  let imageConfig = state.getImageTagConfig
  if(!imageConfig) {
    imageConfig = defaultImageConfig
  }
    const defaultRegistryServer = {
  }
  let registryServer = defaultRegistryServer
  const { availableImage } = state.cicd_flow
  if(availableImage) {
    registryServer = availableImage.server ||  defaultRegistryServer
  }
  return {
    registryServer,
    imageConfig
  }
}

CreateImageEnvComponent.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  loadOtherDetailTagConfig,
  loadImageDetailTagConfig
})(injectIntl(CreateImageEnvComponent, {
  withRef: true,
}));

