/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React,{ Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Button, Spin,
  Icon, Select, Popover, Alert, Radio } from 'antd'
import QueueAnim from 'rc-queue-anim'
import isEmpty from 'lodash/isEmpty'
import './style/traditionEnv.less'
import classNames from 'classnames'
import { checkVMUser, getVMinfosList, getTomcatList, getJdkList, getTomcatVersion } from '../../../../actions/vm_wrap'
import CreateTomcat from '../CreateTomcat'
import filter from 'lodash/filter'

const FormItem = Form.Item;
const ButtonGroup = Button.Group;
const Option = Select.Option
const RadioGroup = Radio.Group

class TraditionEnv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      Prompt: undefined,
      isShow: false,
      loading: false,
      activeBtn: 'new',
      tomcatRadio: 1, // 1 已安装 Tomcat 2 添加新 Tomcat
      tomcatList: [],
      loadingTomcat: false,
      isTestSucc: false,
      jdkList: [],
      tomcatVersionList: [],
      ports: [],
      isShowPassword: false,
      readOnly: true,
      currentVm: {},
    }
  }
  componentWillMount() {
    this.getVMList()
  }
  componentWillUnmount() {
    clearTimeout(this.failedTime)
    clearTimeout(this.successTime)
  }
  checkHostExist(host) {
    const { vmList } = this.props
    let flag
    flag = !isEmpty(vmList) ? vmList.some(item => item.host === host) : false
    return flag
  }
  checkHost(rules,value,callback) {
    const { scope } = this.props;
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!value) {
      callback([new Error('请输入传统环境 IP')])
      return
    }
    if (reg.test(value) !== true) {
      callback([new Error('请输入正确 IP 地址')])
      return
    }
    if (this.checkHostExist(value)) {
      return callback('该环境已经存在，请直接在已导入环境中选择')
    }
    scope.setState({
      host:value
    })
    return callback()
  }
  checkName(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      return callback('请填写账号')
    }
    scope.setState({
      account:value
    })
    return callback()
  }
  checkPass(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      return callback('请填写密码')
    }
    scope.setState({
      password:value
    })
    return callback()
  }
  getJdk = () => {
    const { getJdkList } = this.props
    getJdkList({}, {
      success: {
        func: res => {
          if (res.statusCode === 200 && res.results) {
            this.setState({
              jdkList: res.results
            })
          }
        },
        isAsync: true,
      }
    })
  }
  checkUser(){
    const { form,checkVMUser } = this.props
    const { validateFields, getFieldsValue } = form
    let validateArr = ['envIP','userName','password']
    validateFields(validateArr,(errors,values)=>{
      if (!!errors) {
        return
      }
      let info = getFieldsValue()
      this.setState({
        isShow: true,
        loading: true
      })
      let infos = {
        host: info.envIP,
        account: info.userName,
        password: info.password
      }
      checkVMUser(infos,{
        success: {
          func: res => {
            if(res.statusCode === 200){
              this.setState({
                Prompt: true,
                isTestSucc: true,
                loading: false,
                ports: res.ports,
              },()=>{
                this.successTime = setTimeout(()=>{
                  this.setState({
                    isShow: false,
                    Prompt: undefined
                  })
                },3000)
              })
              this.getJdk()
            }
          },
          isAsync: true
        },
        failed: {
          func: err => {
            this.setState({
              Prompt: false,
              loading: false
            },()=>{
              this.failedTime = setTimeout(()=>{
                this.setState({
                  isShow: false,
                  Prompt: undefined
                })
              },3000)
            })
          },
          isAsync:true
        }
      })
    })

  }

  getVMList() {
    const { getVMinfosList } = this.props
    getVMinfosList({
      size: -1
    })
  }
  changeBtn(activeBtn) {
    const { changeEnv } = this.props
    this.setState({
      activeBtn
    })
    if (activeBtn === 'old') {
      this.getVMList()
      changeEnv(false)
    } else {
      changeEnv(true)
    }
  }
  selectHost(vminfoId) {
    const { vmList, scope, getTomcatList } = this.props
    const currentVm = vmList.filter(item => item.vminfoId === Number(vminfoId))
    this.setState({
      portList: currentVm[0].ports,
      currentVm,
    })

    scope.setState({
      host: currentVm[0].host,
    })
    this.setState({
      loadingTomcat: true,
    }, () => {
      getTomcatList({
        vminfo_id: vminfoId,
      }, {
        success: {
          func: res => {
            if(res.results && res.results.length) {
              this.setState({
                tomcatList: res.results,
              })
            }
          },
          isAsync: true,
        },
        finally: {
          func: () => {
            this.setState({
              loadingTomcat: false,
            })
          }
        }
      })
    })
  }
  onTomRadioChange = e => {
    const tomcatRadio = e.target.value
    this.setState({
      tomcatRadio,
    })
    this.props.changeIsAddTomcat(tomcatRadio)
  }
  onExsistTomcatChange = id => {
    const { tomcatList } = this.state
    const { form: { setFieldsValue } } = this.props
    const curr = filter(tomcatList, { id })[0]
    if (curr) setFieldsValue({ port: curr.startPort })
  }
  onNewPortChange = e => {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      tomcat_name: 'tomcat_' + e.target.value,
    })
  }
  onJdkChange = jdk_id => {
    const { getTomcatVersion, scope } = this.props
    scope.setState({
      jdk_id
    })
    getTomcatVersion({
      jdk_id
    }, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              tomcatVersionList: res.results
            })
          }
        },
        isAsync: true,
      }
    })
  }
  checkNewPort = (rules,value,callback) => {
    const { ports } = this.state
    if (!value) return callback(new Error('请填写端口号'))
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error('请填入数字'))
      return
    }
    const port = parseInt(value.trim())
    if (port < 1 || port > 65535) {
      callback(new Error('请填入1~65535'))
      return
    }
    if (ports.indexOf(port) >= 0) {
      callback(new Error('该端口已被占用'))
      return
    }
    return callback()
  }
  render() {
    const { activeBtn, portList, tomcatRadio, tomcatList, loadingTomcat, ports, isShowPassword } = this.state
    const { vmList, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const name = 'tomcat_'
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const formSmallLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 4 }
    }
    const formBtnLayout = {
      wrapperCol: { span: 9, offset: 3 },
    }
    const formTextLayout = {
      wrapperCol: { span: 9, offset: 3 },
    };
    const envName = getFieldProps('envName', {
      rules: [
        { required: true, message: "请输入传统环境名称" },
        // { validator: this.checkHost.bind(this)}
      ],
    })
    const envIP = getFieldProps('envIP', {
      rules: [
        // { required: true, message: "请输入传统环境IP" },
        { validator: this.checkHost.bind(this)}
      ],
    });
    const userName = getFieldProps('userName', {
      rules: [
        { required: true, message: "请输入环境登录账号" },
        { validator: this.checkName.bind(this)}
      ],
    });
    const username = getFieldValue('userName')
    const password = getFieldProps('password', {
      rules: [
        { required: true, message: "请输入环境登录密码" },
        { validator: this.checkPass.bind(this)}
      ],
    });
    const hostProps = getFieldProps('host', {
      rules: [
        {required: true, message: "请选择应用环境"}
      ],
      onChange: this.selectHost.bind(this)
    })
    const tomcatSelectProps = getFieldProps('tomcat', {
      rules: [
        {required: true, message: "请选择已安装的 Tomcat 环境"}
      ],
      onChange: this.onExsistTomcatChange,
    })

    const new_portProps = getFieldProps('new_port', {
      rules: [
        {required: true, message: "请选择输入端口号"},
        {validator: this.checkNewPort}
      ],
      onChange: this.onNewPortChange,
    })

    const tomcatVersionProps = getFieldProps('tomcat_id', {
      rules: [
        {required: true, message: "请选择 Tomcat 版本"}
      ],
    })

    const javaProps = getFieldProps('jdk_id', {
      rules: [
        {required: true, message: "请选择 Java 环境"}
      ],
      onChange: this.onJdkChange,
    })

    const nameProps = getFieldProps('tomcat_name', {
      initialValue: name,
    })
    const new_port = getFieldValue('new_port') || ''
    const dir = `/${username === 'root' ? username : `home/${username}`}/${name+new_port}`
    const env = `CATALINA_HOME_${name.toLocaleUpperCase()+new_port}`
    const dirProps = getFieldProps('catalina_home_dir', {
      initialValue: dir,
    })
    const envProps = getFieldProps('catalina_home_env', {
      initialValue: env,
    })

    const portProps = getFieldProps('port')

    let testStyle = {
      color: '#31ba6a',
      marginLeft: '20px',
      size: 20
    }
    let fallStyle = {
      color: '#FF0000',
      marginLeft: '20px',
      size: 20
    }
    let children = [];
    vmList &&
      vmList.length &&
      vmList.forEach(item => children.push(<Option key={item.vminfoId}>{item.host}</Option>))
    const content = (
      <div className="portBody">
        {
          portList &&
            portList.length &&
            portList.map(item => <div key={item}>{item}</div>)
        }
      </div>
    );
    const new_content = (
      <div className="portBody">
        {
          ports.map(item => <div key={item}>{item}</div>)
        }
      </div>
    );

    const host = getFieldValue("host")
    const tomcatOptions = tomcatList.map(item => {
      return <Option key={item.id} value={item.id}>{item.name}</Option>
    })
    const tomcatVersionOptions = this.state.tomcatVersionList.map(item => <Option key={item.id} value={item.id}>{item.tomcatName}</Option>)
    const javaOptions = this.state.jdkList.map(item => <Option key={item.id} value={item.id}>{item.jdkName}</Option>)
    const jdk_id = getFieldValue('jdk_id')
    const jdk_name = jdk_id && this.state.jdkList.length && filter(this.state.jdkList, { id: jdk_id })[0].jdkName
    return (
      <div className="traditionEnv">
        <Input type="hidden" {...portProps} />
        <Row style={{ marginBottom: 20 }}>
          <Col offset={3}>
            <ButtonGroup size="large">
              <Button type="ghost" className={classNames({'active': activeBtn === 'new'})} onClick={() => this.changeBtn('new')}>新建环境</Button>
              <Button type="ghost" className={classNames({'active': activeBtn === 'old'})} onClick={() => this.changeBtn('old')}>已有环境</Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Form>
          {
            activeBtn === 'new' ?
              <div>
                <FormItem
                  label="传统环境名称"
                  {...formItemLayout}
                >
                  <Input placeholder="请输入传统环境名称" size="large" {...envName}/>
                </FormItem>
                <FormItem
                  label="传统环境IP"
                  className="nomarginbottom"
                  {...formItemLayout}
                >
                  <Input disabled={this.state.isTestSucc} placeholder="请输入已开通SSH登录的传统环境IP" size="large" {...envIP}/>
                </FormItem>
                <FormItem
                  {...formTextLayout}
                >
                  <div><Icon type="question-circle-o" /> 传统环境一般指非容器环境（Linux的虚拟机、物理机等）</div>
                </FormItem>
                <FormItem
                  label="环境登录账号"
                  {...formItemLayout}
                >
                  <Input disabled={this.state.isTestSucc} placeholder="请输入传统环境登录账号" size="large" {...userName}/>
                </FormItem>
                <FormItem
                  label="环境登录密码"
                  {...formItemLayout}
                >
                  <Input
                    type={isShowPassword ? 'text' : 'password'}
                    autoComplete="off"
                    readOnly={this.state.readOnly}
                    onFocus={() => this.setState({ readOnly: false })}
                    onBlur={() => this.setState({ readOnly: true })} disabled={this.state.isTestSucc} placeholder="请输入传统环境登录密码" size="large" {...password}/>
                    <span style={{ cursor: 'pointer', position: 'absolute', right: '-20px', top: '2px' }}>
                      {
                        isShowPassword ?
                          <Icon onClick={() => this.setState({ isShowPassword: false })} type={'eye'}/>
                          :
                          <Icon onClick={() => this.setState({ isShowPassword: true })} type={'eye-o'}/>
                      }
                    </span>
                </FormItem>
                <FormItem
                  {...formBtnLayout}
                >
                  {
                    this.state.isTestSucc ?
                    <Button type="ghost" size="large" onClick={() => {
                      const { form: { setFieldsValue } } = this.props
                      setFieldsValue({
                        envIP: '',
                        userName: '',
                        password: '',
                        new_port: '',
                        tomcat_id: undefined,
                        jdk_id: undefined,
                      })
                      this.setState({
                        isTestSucc: false
                      })
                    }}>重新填写</Button>
                    :
                    <Button type="primary" size="large" loading={this.state.loading} onClick={this.checkUser.bind(this)}>测试连接</Button>
                  }
                  {
                    this.state.isShow ?
                      <span>
                        {
                          this.state.Prompt === true ? <span style={testStyle}><Icon type="check-circle-o" /> 测试连接成功</span> : ''
                        }
                        {
                          this.state.Prompt === false ? <span style={fallStyle}><Icon type="cross-circle-o" /> 测试连接失败</span> : ''
                        }
                      </span> : ''
                  }
                </FormItem>
              </div>
              :
              <div>
                <FormItem
                  label="选择应用环境"
                  {...formSmallLayout}
                  className="envSelectBox"
                >
                  <Select
                    showSearch
                    searchPlaceholder="标签模式"
                    {...hostProps}
                  >
                    {children}
                  </Select>
                  <Popover
                    content={content}
                    title="已被占用的端口"
                    trigger="click"
                  >
                    <Button className="portBtn verticalCenter" type="primary">查看已用端口</Button>
                  </Popover>
                </FormItem>
                {
                  host && [<Row style={{ marginTop: '10px' }}>
                      <Col span={3}></Col>
                      <Col span={8}>
                        <RadioGroup onChange={this.onTomRadioChange} value={tomcatRadio}>
                          <Radio key="1" value={1}>已安装 Tomcat</Radio>
                          <Radio key="2" value={2}>添加新 Tomcat</Radio>
                        </RadioGroup>
                      </Col>
                    </Row>,
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}></Col>
                        <Col span={8}>
                          <Spin spinning={loadingTomcat}>
                            {
                              tomcatRadio === 1 ?
                                <FormItem>
                                  <Select
                                    placeholder="选择已安装 Tomcat 环境"
                                    {...tomcatSelectProps}>
                                    {tomcatOptions}
                                  </Select>
                                </FormItem>
                                :
                                <CreateTomcat
                                  jdk_id={filter(vmList, { vminfoId: parseInt(host) })[0].jdkId}
                                  form={form}
                                  allPort={portList}
                                  tomcatList={tomcatList}
                                  username={this.state.currentVm.user}
                                />
                            }
                          </Spin>
                        </Col>
                    </Row>]
                }
              </div>
          }
          {
            activeBtn === 'new' && [
            <FormItem
              label="Java 环境"
              {...formItemLayout}
            >
              <Select disabled={!this.state.isTestSucc} placeholder="请选择 Java 环境" size="large" {...javaProps}>
                {javaOptions}
              </Select>
            </FormItem>,
            <FormItem
              label="Tomcat 版本"
              {...formItemLayout}
            >
              <Select disabled={!this.state.isTestSucc} placeholder="请选择 Tomcat 版本" size="large" {...tomcatVersionProps}>
                {tomcatVersionOptions}
              </Select>
            </FormItem>,
            <FormItem
              label="端口号"
              {...formItemLayout}
            >
              <Input disabled={!this.state.isTestSucc} placeholder="请输入端口号" size="large" {...new_portProps}/>
              <Popover
                content={new_content}
                title="已被占用的端口"
                trigger="click"
              >
                <Button disabled={!this.state.isTestSucc} style={{ marginLeft: 5 }} size="large" className="portBtn verticalCenter" type="primary">查看已用端口</Button>
              </Popover>
            </FormItem>,
            <FormItem
              {...formItemLayout}
              label="实例"
              style={{ marginTop: 10}}
            >
              <div>{ name+new_port }</div>
              <Input type="hidden" {...nameProps} />
              <Input type="hidden" {...dirProps} />
              <Input type="hidden" {...envProps} />
            </FormItem>,
            <FormItem
              {...formItemLayout}
              label="环境安装路径"
              style={{ marginTop: 20}}
            >
              <div className="alertRow" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                {
                  username === 'root' ?
                    [<div>JAVA_HOME='/root/java/{jdk_name}'</div>,
                    <div>JRE_HOME='/root/java/{jdk_name}/jre'</div>,
                    <div>CATALINA_HOME_TOMCAT_{this.props.form.getFieldValue('new_port')}='/root/tomcat_{this.props.form.getFieldValue('new_port')}'</div>]
                    :
                    [<div>JAVA_HOME='/home/{username}/java/{jdk_name}'</div>,
                    <div>JRE_HOME='/home/{username}/java/{jdk_name}/jre'</div>,
                    <div>CATALINA_HOME_TOMCAT_{this.props.form.getFieldValue('new_port')}='/home/{username}/tomcat_{this.props.form.getFieldValue('new_port')}'</div>]

                }
                <div style={{ marginTop: 20 }}>系统将默认安装该 Tomcat 环境</div>
              </div>
            </FormItem>]
          }
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { vmWrap } = state
  const { vminfosList } = vmWrap
  const { list: vmList } = vminfosList || { list: [] }
  return {
    vmList
  }
}
export default connect(mapStateToProps, {
  checkVMUser,
  getVMinfosList,
  getTomcatList,
  getJdkList,
  getTomcatVersion,
})(TraditionEnv)