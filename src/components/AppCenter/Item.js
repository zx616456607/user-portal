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
import { ROLE_SYS_ADMIN, ROLE_BASE_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../constants'
import DockerImg from '../../assets/img/quickentry/docker.png'
import itemIntl from './intl/itemIntl'
import { injectIntl } from 'react-intl'
import filter from 'lodash/filter'
import ReadOnlyPrompt from '../../../client/containers/AppCenter/ImageRepo/ReadOnlyPrompt'
import RepoVolumes from '../../../client/containers/AppCenter/ImageCenter/Project/Replications/RepoVolumes'

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
      btnLoading: false,
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
    const { formatMessage } = this.props.intl
    if (!value) {
      callback([new Error(formatMessage(itemIntl.repoNameVerifyMsg1))])
      return
    }
    if (value.length < 3) {
      callback([new Error(formatMessage(itemIntl.repoNameVerifyMsg2))])
      return
    }
    if (value.length > 63) {
      callback([new Error(formatMessage(itemIntl.repoNameVerifyMsg3))])
      return
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
      callback([new Error(formatMessage(itemIntl.repoNameVerifyMsg4))])
      return
    }
    callback()
    return
  },
  urlExists(rule, values, callback) {
    const { formatMessage } = this.props.intl
    if (!values) {
      callback([new Error(formatMessage(itemIntl.repoUrlVerifyMsg1))])
      return
    }
    if (values.indexOf('http') < 0) {
      callback(formatMessage(itemIntl.repoUrlVerifyMsg2))
      return
    }
    callback()
    return

  },
  requiredCheck(error, rule, value, callback) {
    const {
      getFieldValue,
    } = this.props.form
    const isDockerhub = getFieldValue('type') === 'dockerhub'
    if (isDockerhub && !value) {
      return callback(error)
    }
    callback()
  },
  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const scope = this.props.scope;
    const { formatMessage } = this.props.intl
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input
        return;
      }
      this.setState({
        btnLoading: true,
      })
      const config = {
        registryName: values.registryName,
        username: values.username || null,
        password: values.passwd || null,
        type: values.type,
        url: values.url,
      }
      let notification = new NotificationHandler()

      const self = this
      this.props.addOtherStore(config, {
        success: {
          func: (res) => {
            notification.success(formatMessage(itemIntl.addotherRegistry1))
            scope.setState({
              createModalShow: false
            });
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
            }, 100)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            /*Modal.error({
              title: '添加第三方镜像失败',
              content: (<h3>{err.message.message}</h3>)
            });*/
            if (err.code === 409 || err.statusCode === 409){
              notification.error(formatMessage(itemIntl.addotherRegistry0), formatMessage(itemIntl.registryRepeat))
            } else {
              notification.error(formatMessage(itemIntl.addotherRegistry0), formatMessage(itemIntl.pleaseCheckAddress))
            }
          },
          isAsync: true
        },
        finally: {
          func: () => {
            this.setState({
              btnLoading: false,
            })
          }
        }
      })
    });
  },
  render() {
    const scope = this.props.scope;
    const { formatMessage } = this.props.intl
    const {
      getFieldProps, getFieldError, setFieldsValue, isFieldValidating,
      getFieldValue,
    } = this.props.form;
    const registryTypeProps = getFieldProps('type', {
      initialValue: '3rdparty-registry',
      rules: [{ required: true, message: formatMessage(itemIntl.accessTypeRequired) }],
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
        {
          required: false,
          message: formatMessage(itemIntl.userNameRequired),
          validator: this.requiredCheck.bind(this, formatMessage(itemIntl.userNameRequired))
        }
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        {
          required: false,
          message: formatMessage(itemIntl.pwdRequired),
          validator: this.requiredCheck.bind(this, formatMessage(itemIntl.pwdRequired))
        },
      ],
    });
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <div className='modalBox'>
        <div className='alertRow'>
          {formatMessage(itemIntl.tipMsg)}
        </div>
        <Form className='addForm' horizontal>
          <FormItem label={formatMessage(itemIntl.accessType)} {...formItemLayout}>
            <RadioGroup {...registryTypeProps}>
              <Radio value="3rdparty-registry">Docker Registry</Radio>
              <Radio value="dockerhub">hub.docker.com</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={formatMessage(itemIntl.repoName)} {...formItemLayout}>
            <Input {...registryProps} placeholder={formatMessage(itemIntl.repoNameCustom)} />
          </FormItem>
          <FormItem label={formatMessage(itemIntl.repoUrl)} {...formItemLayout}>
            <Input
              {...urlProps}
              placeholder={formatMessage(itemIntl.repoUrlPlaceholder)}
              disabled={getFieldValue('type') === 'dockerhub'}
            />
          </FormItem>
          <Alert message={formatMessage(itemIntl.alertMessage)} type="info" showIcon />
          <FormItem label={formatMessage(itemIntl.userName)} {...formItemLayout}>
            <Input
              {...nameProps}
              placeholder={
                `${formatMessage(itemIntl.repoUserName)} ${getFieldValue('type') === 'dockerhub' && `${formatMessage(itemIntl.notSupportEmail)}` || ''}`
              }
            />
          </FormItem>
          <FormItem label={formatMessage(itemIntl.pwd)} {...formItemLayout}>
            <Input
              {...passwdProps}
              placeholder={formatMessage(itemIntl.repoPwd)}
              type="password"
              autoComplete="new-password"
              readOnly={!!this.state.readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
            />
          </FormItem>
          <br />
          <div className='btnBox'>
            <Button
              size='large'
              type='primary'
              loading={this.state.btnLoading}
              onClick={this.handleSubmit}
            >
              {formatMessage(itemIntl.confirm)}
            </Button>
            &nbsp;&nbsp;
            <Button size='large' onClick={this.handleReset}>{formatMessage(itemIntl.cancel)}</Button>
          </div>
        </Form>
      </div>
    );
  },
});

MyComponent = createForm()(MyComponent);
MyComponent = injectIntl(MyComponent, {
  withRef: true
});

class PageImageCenter extends Component {
  constructor(props) {
    super(props)
    const { location } = this.props
    const { addUserDefined, public: repoPublic } = props.location.query
    let other = {}
    let itemType = ''
    let activeKey = ''
    if (location.pathname.indexOf('/other/') > -1){
      activeKey = location.pathname.split('/').pop()
      other = {
        id: activeKey
      }
      itemType = 'other'
    }
    this.state = {
      createModalShow: false,
      otherImageHead: [], // other image store
      other,
      itemType,
      activeKey,
      repoPublic: this.queryPublicToState(repoPublic),
      readOnlyVisible: false,
    }
    if(addUserDefined) {
      this.state.createModalShow = true
    }
  }
  setItem(type,other) {
    other = other || {}

    this.setState({itemType:type, other})
    if (type=='private') {
      browserHistory.push('/app_center/projects')
      return
    }
    browserHistory.push(`/app_center/projects/${type}` + (type === 'other' ? '/' + other.id : ''))
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
    } else if(location.pathname.indexOf('/other/') > -1){
      type = 'other'
    }
    this.setState({itemType:type})
    this.props.LoadOtherImage({
      success: {
        func: (res) => {
          this.setState({
            otherImageHead: res.data
          })
        },
        isAsync: true,
      }
    })
  }
  componentDidMount() {
    const { systeminfo } = this.props
    if (systeminfo && systeminfo.readOnly === true) {
      this.setState({ readOnlyVisible: true })
    }
  }
  queryPublicToState(repoPublic) {
    if (repoPublic === undefined) {
      repoPublic = 'all'
    }
    return repoPublic
  }
  componentWillReceiveProps(nextProps) {
    const { location: oldLocation } = this.props
    const { location: newLocation } = nextProps
    if (this.props.systeminfo.readOnly !==  nextProps.systeminfo.readOnly) {
      this.toggleVisible(nextProps.systeminfo.readOnly)
    }
    if (newLocation.query.public !== oldLocation.query.public) {
      this.setState({
        repoPublic: this.queryPublicToState(newLocation.query.public),
      })
    }
    if (oldLocation !== newLocation) {
      if (newLocation.pathname === '/app_center') {
        browserHistory.replace('/app_center/projects')
        return
      }
      if (newLocation.pathname.indexOf('/other/') > -1) {
        this.props.LoadOtherImage({
          success: {
            func: (res) => {
              const activeKey = newLocation.pathname.split('/').pop()
              this.setState({
                activeKey,
                otherImageHead: res.data,
                other: filter(res.data, { id: activeKey })[0] || this.state.other
              })
            },
            isAsync: true,
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
      if (newLocation.query.type) {
        type = newLocation.query.type
      }
      this.setState({ itemType: type })
    }
  }
  // 控制只读提示的header 可切换是否显示亦可指定状态
  toggleVisible = (visible) => {
    let readOnlyVisible = !this.state.readOnlyVisible
    if ( typeof visible === 'boolean') {
      readOnlyVisible = visible
    }
    this.setState({
      readOnlyVisible,
    })
  }

  render() {
    const { children, loginUser, intl, location, storage: { total, free } } = this.props
    const { formatMessage } = intl
    const { otherImageHead, other, itemType, activeKey, readOnlyVisible } = this.state
    const _this = this
    const OtherItem = otherImageHead.map(item => {
      return (
        <span
          key={item.id}
          className={ other.id === item.id ? 'tab active':'tab'}
          onClick={()=> this.setItem('other', item)}
        >
          {
            item.type === 'dockerhub'
            ? <img src={DockerImg} className="docker-icon" />
            : <Icon type='shopping-cart' />
          }
          &nbsp;{item.title}
        </span>
      )
    })
    if (OtherItem.length >0) {
      OtherItem.unshift(<span className="otherName">{formatMessage(itemIntl.thirdPartyRepo)}：</span>)
    }
    let tempImageList = otherImageHead.map((list, index) => {
      return (
        <TabPane tab={<span>{list.title}</span>} key={list.id}>
          {
            other.id === list.id &&
            <OtherSpace scope={_this} otherHead={list} imageId={list.id} />
          }
        </TabPane>
      )
    })

    const isAuth = loginUser.role === ROLE_BASE_ADMIN || loginUser.role === ROLE_SYS_ADMIN || loginUser.role === ROLE_PLATFORM_ADMIN
    // 只有平台管理员和系统管理员才可见“同步管理” add: 非同步管理 应为仓库管理 ROLE_BASE_ADMIN基础设施管理员 ROLE_PLATFORM_ADMIN平台管理员也可见
    return (
      <QueueAnim className='ImageCenterBox' type='right'>
        <ReadOnlyPrompt
          toggleVisible={this.toggleVisible}
          visible={readOnlyVisible}
          intl={intl}
          key="ReadOnlyPrompt"
        />
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title={formatMessage(itemIntl.imageRepo)} />
          <div className="ImageCenterTabs">
            <span className={itemType =='private' ?'tab active':'tab'} onClick={()=> this.setItem('private')}>
              {formatMessage(itemIntl.repoGroup)}
            </span>
            {/* <span className={itemType =='public' ?'tab active':'tab'} onClick={()=> this.setItem('public')}>
              {formatMessage(itemIntl.publicRepoGroup)}
            </span> */}
            <span className={itemType =='publish' ?'tab active':'tab'} onClick={()=> this.setItem('publish')}>
              {formatMessage(itemIntl.releaseRecord)}
            </span>
            {
              isAuth &&
              <span className={itemType =='replications' ?'tab active':'tab'} onClick={()=> this.setItem('replications')}>
                {formatMessage(itemIntl.repoManage)}
              </span>
            }
            {OtherItem}
            <span style={{display:'inline-block',float:'right'}}>
              <Button type="primary" size="large" onClick={()=> this.setState({createModalShow:true})}><i className='fa fa-plus'/>&nbsp;{formatMessage(itemIntl.addThirdParty)}</Button>
              <Tooltip title={<div>
                <div>{formatMessage(itemIntl.thirdPartyHelpMsg0)}</div>
                <div>{formatMessage(itemIntl.thirdPartyHelpMsg1)}</div>
                <div>{formatMessage(itemIntl.thirdPartyHelpMsg2)}</div>
              </div>} placement="bottomRight">
                <Button icon='question-circle-o' style={{margin:'0 10px'}} type='ghost'></Button>
              </Tooltip>
            </span>
          </div>
          {
            location.pathname === '/app_center/projects' &&
            <div className="ImageCenterRepoSwitch">
              <RadioGroup
                value={this.state.repoPublic}
                onChange={e => {
                  const repoPublic = e.target.value
                  this.setState({ repoPublic })
                  let pathname = '/app_center/projects'
                  if (repoPublic !== 'all') {
                    pathname += `?public=${repoPublic}`
                  }
                  browserHistory.push(pathname)
                }}
              >
                <Radio value="all">{formatMessage(itemIntl.allRepoGroup)}</Radio>
                <Radio value="0">{formatMessage(itemIntl.privateRepoGroup)}</Radio>
                <Radio value="1">{formatMessage(itemIntl.publicRepoGroup)}</Radio>
              </RadioGroup>
              { total && free ? '|' : null }
              <div className="volumesHeader">
                <RepoVolumes />
              </div>
            </div>
          }
          {itemType =='other'?
            <Tabs
              key='ImageCenterTabs'
              className="otherStore"
              activeKey={activeKey}
              >
              {tempImageList}
            </Tabs>
          : children
          }


          <Modal title={formatMessage(itemIntl.addThirdParty)} className='addOtherSpaceModal' footer={null} onCancel={()=> this.setState({createModalShow:false})} visible={this.state.createModalShow}>
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
  const { images, entities, harbor: { systeminfo, volumes: { data } } } = state
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
    systeminfo: systeminfo && systeminfo.default && systeminfo.default.info || {},
    storage: data && data.storage || {},
  }
}

const ImageCenter = injectIntl(PageImageCenter, {
  withRef: true
})
export default connect(mapStateToProps, {
  addOtherStore,
  LoadOtherImage,
})(ImageCenter)
