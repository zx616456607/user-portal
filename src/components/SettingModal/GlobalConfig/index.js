/**
	* Licensed Materials - Property of tenxcloud.com
	* (C) Copyright 2017 TenxCloud. All Rights Reserved.
	*
	*  Setting GlobalConfig
	*
	* v0.1 - 2017/3/7
	* @author ZhangChengZheng
	*/
import React, { Component } from 'react'
import { Row, Col, Icon, Form, Button, Input } from 'antd'
import './style/GlobalConfig.less'
import EmailImg from '../../../assets/img/setting/globalconfigEmail.png'
import conInter from '../../../assets/img/setting/globalconfigCICD.png'
import MirrorImg from '../../../assets/img/setting/globalconfigmirror.png'
import CephImg from '../../../assets/img/setting/globalconfigceph.png'
import { connect } from 'react-redux'

const FormItem = Form.Item

//邮件报警
let Emaill = React.createClass({
  getInitialState() {
    return {
      isEve: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    console.log("取消")
    this.props.form.resetFields();
    this.props.emailChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleEmail() {
    this.props.emailChange()
  },
  checkService(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写服务器地址')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    callback()
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },
  render() {
    const { emailDisable, emailChange } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    //邮件服务器
    const serviceProps = getFieldProps('service', {
      rules: [
        { validator: this.checkService }
      ]
    });

    //邮箱
    const emailProps = getFieldProps('email', {
      validate: [{
        rules: [
          { required: true, message: '请输入邮箱地址' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { type: 'email', message: '请输入正确的邮箱地址' },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    });

    //密码
    const passwordProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass }
      ]
    });
    return (
      <div className="GlobalConfigEmail">
        <div className="title">邮件报警</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={EmailImg} alt="邮件报警" />
            </div>
            <div className="contentkeys">
              <div className="key">邮件服务器</div>
              <div className="key">邮箱</div>
              <div className="key">密码</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem hasFeedback>
                  <Input {...serviceProps} placeholder="如：smtp.exmail.qq.com:25" disabled={emailDisable} />
                </FormItem>
                <FormItem hasFeedback>
                  <Input className="temInput1" {...emailProps} type="email" placeholder="邮箱地址" disabled={emailDisable} />
                </FormItem>
                <FormItem hasFeedback>
                  <i className={this.state.isEve ? 'fa fa-eye activeEve' : 'fa fa-eye-slash activeEve'}
                    onClick={() => this.handEve()}></i>
                  <Input {...passwordProps} type={this.state.isEve ? "text" : "password"} placeholder="请输入密码"
                    disabled={emailDisable} />
                </FormItem>
                <FormItem>
                  {
                    emailDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleEmail}>编辑</Button>
                      : ([
                        <Button type='primary' className="itemInputLeft" onClick={this.handleEmail}>保存</Button>,
                        <Button onClick={this.handleReset} disabled={emailDisable}>取消</Button>
                      ])
                  }

                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//持续集成
let ConInter = React.createClass({
  handleCicd() {
    this.props.cicdeditChange()
  },
  handleReset() {
    this.props.cicdeditChange()
  },
  checkCicd(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },
  render() {
    const { cicdeditDisable, cicdeditChange } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const cicdProps = getFieldProps('cicd', {
      rules: [
        { validator: this.checkCicd }
      ]
    });
    return (
      <div className="conInter">
        <div className="title">持续集成</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={conInter} alt="持续集成" />
            </div>
            <div className="contentkeys">
              <div className="key">主机地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem hasFeedback>
                  <Input {...cicdProps} placeholder="http://192.168.1.103:38090" disabled={cicdeditDisable} />
                </FormItem>
                <FormItem>
                  {
                    cicdeditDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleCicd}>编辑</Button>
                      : ([
                        <Button type='primary' className="itemInputLeft" onClick={this.handleCicd}>保存</Button>,
                        <Button onClick={this.handleReset}>取消</Button>
                      ])
                  }
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//镜像服务
let MirrorService = React.createClass({
  handleMirror() {
    this.props.mirrorChange()
  },
  handleReset() {
    this.props.mirrorChange()
  },
  // 镜像服务地址校验规则
  checkMirror(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },

  // 认证服务地址校验规则
  checkApprove(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },

  // 扩展服务地址校验规则
  checkExtend(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },
  render() {
    const { mirrorDisable, mirrorChange } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const mirrorProps = getFieldProps('mirror', {
      rules: [
        { validator: this.checkMirror }
      ]
    })
    const approveProps = getFieldProps('approve', {
      rules: [
        { validator: this.checkApprove }
      ]
    })
    const extendProps = getFieldProps('extend', {
      rules: [
        { validator: this.checkExtend }
      ]
    })
    return (
      <div className="mirrorservice">
        <div className="title">
          镜像服务
						<span className="tips">Tips：时速云官方不支持企业版Lite配置私有的镜像仓库，如有需要请联系时速云购买企业版Pro</span>
        </div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={MirrorImg} alt="镜像服务" />
            </div>
            <div className="contentkeys">
              <div className="key">镜像服务地址</div>
              <div className="key">认证服务地址</div>
              <div className="key">扩展服务地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem hasFeedback>
                  <Input {...mirrorProps} placeholder="如：192.168.1.113" disabled={mirrorDisable} />
                </FormItem>
                <FormItem hasFeedback>
                  <Input {...approveProps} placeholder="如：https://192.168.1.113:5001" disabled={mirrorDisable} />
                </FormItem>
                <FormItem hasFeedback>
                  <Input {...extendProps} placeholder="如：https://192.168.1.113:4081" disabled={mirrorDisable} />
                </FormItem>
                <FormItem>
                  {
                    mirrorDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleMirror}>编辑</Button>
                      : ([
                        <Button type='primary' className="itemInputLeft" onClick={this.handleMirror}>保存</Button>,
                        <Button onClick={this.handleReset}>取消</Button>
                      ])
                  }
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//存储服务
let StorageService = React.createClass({
  handleCeph() {
    this.props.cephChange()
  },
  handleReset() {
    this.props.cephChange()
  },
  // 存储节点校验规则
  checkNode(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },

  // ceph Url 校验规则
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },
  render() {
    const { cephDisable, cephChange } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const nodeProps = getFieldProps('node', {
      rules: [
        { validator: this.checkNode }
      ]
    })
    const urlProps = getFieldProps('url', {
      rules: [
        { validator: this.checkUrl }
      ]
    })
    return (
      <div className="storageservice">
        <div className="title">
          存储服务
						<span className="tips">Tips：时速云官方不支持企业版Lite配置存储服务，如有需要请联系时速云购买企业版Pro</span>
        </div>
        <div className="content">
          <div className="contentHeader">
            Ceph分布式存储
						</div>
          <div className="contentMain">
            <div className="contentImg">
              <img src={CephImg} alt="镜像服务" />
            </div>
            <div className="contentkeys">
              <div className="key">存储节点</div>
              <div className="key">Ceph URL</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem hasfeedback>
                  <Input {...nodeProps} placeholder="如：192.168.1.113:4081" disabled={cephDisable} />
                </FormItem>
                <FormItem hasfeedback>
                  <Input {...urlProps} placeholder="如：https://192.168.88.6789" disabled={cephDisable} />
                </FormItem>
                <FormItem>
                  {
                    cephDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleCeph}>编辑</Button>
                      : ([
                        <Button type='primary' className="itemInputLeft" onClick={this.handleCeph}>保存</Button>,
                        <Button className="itemInputLeft" onClick={this.handleReset}>取消</Button>
                      ])
                  }
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

Emaill = Form.create()(Emaill)
ConInter = Form.create()(ConInter)
MirrorService = Form.create()(MirrorService)
StorageService = Form.create()(StorageService)


export default class GlobalConfig extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailDisable: true,
      cicdeditDisable: true,
      mirrorDisable: true,
      cephDisable: true
    }
  }

  emailChange() {
    this.setState({ emailDisable: !this.state.emailDisable })
  }

  cicdeditChange() {
    this.setState({ cicdeditDisable: !this.state.cicdeditDisable })
  }

  mirrorChange() {
    this.setState({ mirrorDisable: !this.state.mirrorDisable })
  }

  cephChange() {
    this.setState({ cephDisable: !this.state.cephDisable })
  }

  render() {
    const { emailDisable, emailChange, cicdeditDisable, cicdeditChange, mirrorDisable, mirrorChange, cephDisable, cephChange } = this.state
    return (
      <div id="GlobalConfig">
        <div className="alertRow" style={{ margin: 0 }}>
          全局配置---对这整个系统的邮件报警、持续集成、镜像服务、分布式存储的配置；只有做了这些配置才能完整的使用这几项功能，分别是：邮件报警对应的是系统中涉及的邮件提醒、持续集成对应的是CI/CD中整个Tenxflow功能的使用、镜像服务对应的是镜像仓库的使用、分布式存储对应的是容器有状态服务存储的使用
					</div>
        <Emaill emailDisable={emailDisable} emailChange={this.emailChange.bind(this)} />
        <ConInter cicdeditDisable={cicdeditDisable} cicdeditChange={this.cicdeditChange.bind(this)} />
        <MirrorService mirrorDisable={mirrorDisable} mirrorChange={this.mirrorChange.bind(this)} />
        <StorageService cephDisable={cephDisable} cephChange={this.cephChange.bind(this)} />
      </div>
    )
  }
}

