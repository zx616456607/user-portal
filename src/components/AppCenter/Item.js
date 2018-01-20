/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component, PropTypes } from 'react'
import {
  Modal, Menu, Tabs, Icon, Button, Form, Card, Alert, Input, Tooltip,
  Radio,
} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import OtherSpace from './ImageCenter/OtherSpace'
import './style/Item.less'
import { LoadOtherImage, addOtherStore } from '../../actions/app_center'
import NotificationHandler from '../../components/Notification'
import Title from '../Title'
import { ROLE_SYS_ADMIN } from '../../../constants'
import { camelize } from 'humps'

const createForm = Form.create;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

let MyComponent = React.createClass({
  getInitialState: function () {
    //this function for init the state
    return {
      UrlReverse: false,
      UrlPaused: true,
      UrlMoment: null,
      NameReverse: false,
      NamePaused: true,
      NameMoment: null,
      PwdReverse: false,
      PwdPaused: true,
      PwdMoment: null,
      urlInput: null,
      nameInput: null,
      textareaInput: null,
      pwdInput: null,
      registryInput: null,
      regMoment: null,
      regPaused: true,
      regReverse: false,
      inputType: 'text',
    };
  },
  propTypes: {
    config: React.PropTypes.array,
  },
  selectSpaceType(type) {
    //this function for user select new other image space type
    const scope = this.props.scope;
    scope.setState({
      otherSpaceType: type
    });
  },
  handleReset(e) {
    //this function for user close add other image space modal
    e.preventDefault();
    this.props.form.resetFields();
    const scope = this.props.scope;
    scope.setState({
      createModalShow: false
    });
  },
  regnameExists(rule, value, callback) {
    if (!value) {
      callback([new Error('请输入仓库名称')])
      return
    }
    if (value.length < 3) {
      callback([new Error('仓库名称不能少于3位')])
      return
    }
    if (value.length > 63) {
      callback([new Error('仓库名称过长，名称不能超过63位')])
      return
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
      callback([new Error('仓库名称只能由中英文、数字等组成')])
      return
    }
    callback()
    return
  },
  urlExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入仓库地址')])
      return
    }
    if (values.indexOf('http') < 0) {
      callback('地址以http或者https开头')
      return
    }
    callback()
    return

  },
  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const scope = this.props.scope;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      const config = {
        registryName: values.registryName,
        username: values.username || null,
        password: values.passwd || null,
        type: values.type,
        url: values.url,
      }
      let notification = new NotificationHandler()

      this.setState({ visible: false });
      const self = this
      notification.spin(`添加第三方镜像中...`)
      this.props.addOtherStore(config, {
        success: {
          func: (res) => {
            notification.close()
            notification.success('添加第三方镜像成功')
            setTimeout(() => {
              scope.props.LoadOtherImage({
                success: {
                  func: (res) => {
                    scope.setState({
                      otherImageHead: res.data
                    })
                    self.props.form.resetFields()
                  }
                }
              })

            }, 500)
          }
        },
        failed: {
          func: (err) => {
            /*Modal.error({
              title: '添加第三方镜像失败',
              content: (<h3>{err.message.message}</h3>)
            });*/
            notification.close()
            notification.error('添加第三方镜像失败', err.message.message)
          }
        },
        isAsync: true
      })
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
      scope.setState({
        createModalShow: false
      });
    });
  },
  render() {
    const scope = this.props.scope;
    const {
      getFieldProps, getFieldError, setFieldsValue, isFieldValidating,
      getFieldValue,
    } = this.props.form;
    const registryTypeProps = getFieldProps('type', {
      initialValue: 'registry',
      rules: [{ required: true, message: '请选择接入类型' }],
      onChange: e => {
        let url
        if (e.target.value === 'dockerhub') {
          url = 'https://index.docker.io'
        }
        setTimeout(() => setFieldsValue({
          url,
        }), 100)
      },
    })
    const registryProps = getFieldProps('registryName', {
      rules: [{ required: true, validator: this.regnameExists}]
    })
    const urlProps = getFieldProps('url', {
      rules: [
        { required: true, validator: this.urlExists }
      ],
    });
    const nameProps = getFieldProps('username', {
      rules: [
        { required: false, message: '请输入用户名' }
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: false, message: '请输入密码' },
      ],
    });
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <div className='modalBox'>
        <div className='alertRow'>
          第三方仓库接入，支持标准 Docker Registry 和 index.docker.io 接口（暂不支持 Harbor 等第三方接口）。
        </div>
        <Form className='addForm' horizontal>
          <FormItem label="接入类型" {...formItemLayout}>
            <RadioGroup {...registryTypeProps}>
              <Radio value="registry">Docker Registry</Radio>
              <Radio value="dockerhub">index.docker.io</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="仓库名" {...formItemLayout}>
            <Input {...registryProps} placeholder="自定义仓库名" />
          </FormItem>
          <FormItem label="地址" {...formItemLayout}>
            <Input
              {...urlProps}
              placeholder="仓库地址"
              disabled={getFieldValue('type') === 'dockerhub'}
            />
          </FormItem>
          <Alert message="私有仓库需要填写用户名和密码" type="info" showIcon />
          <FormItem label="用户名" {...formItemLayout}>
            <Input {...nameProps} placeholder="仓库用户名" />
          </FormItem>
          <FormItem label="密码" {...formItemLayout}>
            <Input {...passwdProps} placeholder="仓库密码" type="password" />
          </FormItem>
          <br />
          <div className='btnBox'>
            <Button size='large' type='primary' onClick={this.handleSubmit}>确定</Button>
            &nbsp;&nbsp;
            <Button size='large' onClick={this.handleReset}>取消</Button>
          </div>
        </Form>
      </div>
    );
  },
});

MyComponent = createForm()(MyComponent);

class ImageCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createModalShow: false,
      otherImageHead: [], // other image store
      other: {}
    }
    if(props.location.query.addUserDefined) {
      this.state.createModalShow = true
    }
  }
  setItem(type,other) {
    other = other || {}
    this.setState({itemType:type,other})
    if (type=='private') {
      browserHistory.push('/app_center/projects')
      return
    }
    browserHistory.push(`/app_center/projects/${type}`)
  }
  componentWillMount() {
    const { location } = this.props
    if (location.pathname === '/app_center') {
      browserHistory.replace('/app_center/projects')
      return
    }
    let type='private'
    if (location.pathname === '/app_center/projects/public') {
      type = 'public'
    } else if (location.pathname === '/app_center/projects/publish') {
      type = 'publish'
    } else if (location.pathname === '/app_center/projects/replications') {
      type = 'replications'
    }
    this.setState({itemType:type})
    this.props.LoadOtherImage({
      success: {
        func: (res) => {
          this.setState({
            otherImageHead: res.data
          })
        }
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { location: oldLocation } = this.props
    const { location: newLocation } = nextProps
    if (oldLocation !== newLocation) {
      if (newLocation.pathname === '/app_center') {
        browserHistory.replace('/app_center/projects')
        return
      }
      if (newLocation.pathname === '/app_center/projects/other') {
        this.props.LoadOtherImage({
          success: {
            func: (res) => {
              this.setState({
                otherImageHead: res.data
              })
            }
          }
        })
        return
      }
      let type='private'
      if (newLocation.pathname === '/app_center/projects/public') {
        type = 'public'
      } else if (newLocation.pathname === '/app_center/projects/publish') {
        type = 'publish'
      } else if (newLocation.pathname === '/app_center/projects/replications') {
        type = 'replications'
      }
      this.setState({ itemType: type })
    }
  }
  render() {
    const { children, loginUser } = this.props
    const { otherImageHead, other, itemType } = this.state
    const _this = this
    const OtherItem = otherImageHead.map(item => {
      return (<span key={item.title} className={ other.title == item.title ?'tab active':'tab'} onClick={()=> this.setItem('other',item)}>
        <Icon type="shopping-cart" />&nbsp;{item.title}
      </span>)
    })
    if (OtherItem.length >0) {
      OtherItem.unshift(<span className="otherName">第三方仓库：</span>)
    }
    let tempImageList = otherImageHead.map((list, index) => {
      return (
        <TabPane tab={<span>{list.title}</span>} key={list.title}>
          <OtherSpace scope={_this} otherHead={list} imageId={list.id} />
        </TabPane>
      )
    })
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] === 1
    return (
      <QueueAnim className='ImageCenterBox' type='right'>
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title="镜像仓库" />
          <div className="ImageCenterTabs">
           <span className={itemType =='private' ?'tab active':'tab'} onClick={()=> this.setItem('private')}>我的仓库组</span>
            <span className={itemType =='public' ?'tab active':'tab'} onClick={()=> this.setItem('public')}>公开仓库组</span>
            <span className={itemType =='publish' ?'tab active':'tab'} onClick={()=> this.setItem('publish')}>发布记录</span>
            {
              isAdmin &&
              <span className={itemType =='replications' ?'tab active':'tab'} onClick={()=> this.setItem('replications')}>
              同步管理
              </span>
            }
            {OtherItem}
            <span style={{display:'inline-block',float:'right'}}>
              <Button type="primary" size="large" onClick={()=> this.setState({createModalShow:true})}><i className='fa fa-plus'/>&nbsp;添加第三方</Button>
              <Tooltip title={<div>
                <div>镜像仓库组：用于存放镜像仓库，每个镜像仓库由若干个镜像版本组成。</div>
                <div>第三方仓库：关联第三方仓库后可部署仓库中的镜像。</div>
                <div>TenxFlow 中构建出来的镜像可发布到镜像仓库（所选仓库组）或第三方镜像仓库中。</div>
              </div>} placement="bottomRight">
                <Button icon='question-circle-o' style={{margin:'0 10px'}} type='ghost'></Button>
              </Tooltip>
            </span>
          </div>
          {itemType =='other'?
            <Tabs
              key='ImageCenterTabs'
              className="otherStore"
              activeKey={other.title}
              >
              {tempImageList}
            </Tabs>
          : children
          }


          <Modal title='添加第三方' className='addOtherSpaceModal' footer={null} onCancel={()=> this.setState({createModalShow:false})} visible={this.state.createModalShow}>
            <MyComponent scope={this} addOtherStore={this.props.addOtherStore} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    otherImageHead: [],
    server: ''
  }
  const defaultBindInfo = {
    configured: false
  }
  const { images, entities } = state
  const { privateImages, otherImages, imagesInfo, getAppCenterBindUser } = images
  const { registry, imageList, isFetching } = privateImages || defaultConfig
  const { imageRow, server} = otherImages || defaultConfig
  const { configured } = getAppCenterBindUser || defaultBindInfo
  return {
    otherImageHead: imageRow,
    isFetching,
    server,
    configured,
    loginUser: entities.loginUser.info,
  }
}


export default connect(mapStateToProps,{
  addOtherStore,
  LoadOtherImage,
})(ImageCenter)
