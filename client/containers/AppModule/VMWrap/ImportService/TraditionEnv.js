/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: import service
 *
 * v0.1 - 2018-11-16
 * @author rensiwei
 */

import React from 'react'
// import { Link, browserHistory } from 'react-router'
import { checkVMUser, getJdkList, getTomcatVersion, getVMinfosList, getTomcatList } from '../../../../../src/actions/vm_wrap'
import { connect } from 'react-redux'
import { Form, Input, Icon, Button, Select, Row, Col, Radio, Tooltip } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'
import './style/TraditionEnv.less'
import NotificationHandler from '../../../../../src/components/Notification'
import CreateTomcat from '../../../../../src/components/AppModule/VMWrap/CreateTomcat'

const notify = new NotificationHandler();
const ButtonGroup = Button.Group


const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
}

const formTextLayout = {
  wrapperCol: { span: 9, offset: 3 },
}
const formItemNoLabelLayout = {
  wrapperCol: { span: 24, offset: 0 },
}
const formLargeItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15 },
}

class TraditionEnv extends React.Component {
  state = {
    readOnly: true,
    isShowPassword: false,
    jdkList: [],
    isTestSucc: false,
    ports: [],
    btnLoading: false,
    tomcatVersionList: [],
    vmList: [],
    tomcatList: [],
    total: 0,
  }
  getTom = jdk_id => {
    const { getTomcatVersion, form: { setFieldsValue } } = this.props
    getTomcatVersion({
      jdk_id,
    }, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              tomcatVersionList: res.results,
            })
            res.results[0] && setFieldsValue({
              tomcat_id_0: res.results[0].id,
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {},
      },
    })
  }
  componentDidMount() {
    const { getJdkList } = this.props
    getJdkList({}, {
      success: {
        func: res => {
          if (res.statusCode === 200 && res.results) {
            this.setState({
              jdkList: res.results,
            })
            res.results[0] && this.getTom(res.results[0].id)
          }
        },
        isAsync: true,
      },
    })
    this.getVMList()
  }
  checkVmInfos = () => {
    const { form, checkVMUser, checkSucc } = this.props
    const { validateFields } = form
    const validateArr = [ 'host', 'account', 'password' ]
    validateFields(validateArr, (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        btnLoading: true,
      }, () => {
        const infos = cloneDeep(values)
        checkVMUser(infos, {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                this.setState({
                  isTestSucc: true,
                  ports: res.ports,
                })
                notify.success('测试连接成功')
                checkSucc(true)
              }
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              this.setState({
                ports: [],
              })
              notify.warn('测试连接失败')
            },
            isAsync: true,
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
          },
        })
      })
    })

  }
  checkHost = (rules, value, callback) => {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!value) {
      callback([ new Error('请输入传统环境 IP') ])
      return
    }
    if (reg.test(value) !== true) {
      callback([ new Error('请输入正确 IP 地址') ])
      return
    }
    if (filter(this.state.vmList, { host: value })[0]) {
      return callback('该环境已经存在，请直接在已导入环境中选择')
    }
    return callback()
  }
  validateDefaultFields = () => {
    const { form } = this.props
    const { validateFields } = form
    validateFields((err, values) => {
      if (err || !values) return
      // console.log(values)
    })
  }
  rePut = () => {
    // const { form, checkSucc } = this.props
    // const { setFieldsValue } = form
    // setFieldsValue({
    //   account: '',
    //   password: '',
    //   host: '',
    // })
    this.setState({
      isTestSucc: false,
    })
    this.props.checkSucc(false)
  }
  onJdkChange = jdk_id => {
    this.getTom(jdk_id)
  }
  onEnvBtnClick = type => {
    const { checkSucc, form } = this.props
    form.setFieldsValue({
      type,
    })
    if (type === '2') {
      this.getVMList()
      checkSucc(true)
    } else {
      checkSucc(false)
    }
  }

  getVMList() {
    const { getVMinfosList, setVmList } = this.props
    getVMinfosList({}, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              vmList: res.results,
              total: res.count,
            })
            setVmList(res.results)
          }
        },
        isAsync: true,
      },
    })
  }

  onPortChange = value => {
    const { form: { setFieldsValue } } = this.props
    const temp = {}
    temp.tomcat_name = 'tomcat_' + value
    setFieldsValue(temp)
    // this.onCheckAddressChange({ port: value })
  }

  onVmIdChange = vminfo_id => {
    const { getTomcatList, setTomcatList } = this.props
    getTomcatList({
      vminfo_id,
    }, {
      success: {
        func: res => {
          if (res.results && res.results.length) {
            this.setState({
              tomcatList: res.results,
            })
            setTomcatList(res.results)
          }
        },
        isAsync: false,
      },
    })
  }
  render() {
    const { form, limit } = this.props
    const { getFieldProps, getFieldValue } = form
    const { readOnly, isShowPassword, jdkList, isTestSucc,
      btnLoading, tomcatVersionList, vmList, tomcatList, total } = this.state

    const tomcatVersionOptions =
      tomcatVersionList.map(item =>
        <Option key={item.id} value={item.id}>{item.tomcatName}</Option>)

    const typeProps = getFieldProps('type', {
      initialValue: '1',
    })
    const isNewTomcatProps = getFieldProps('isNewTomcat', {
      initialValue: '1',
    })
    const isNewTomcat = getFieldValue('isNewTomcat')
    const type = getFieldValue('type')
    const vm_id = getFieldValue('vm_id')

    const options = jdkList.map(item => {
      return <Option key={item.id} value={item.id}>{item.jdkName}</Option>
    })
    const vmOpts = vmList.map(item => {
      return <Option key={item.vminfoId} value={item.vminfoId} >{item.host} ({item.user})</Option>
    })
    const tomcatOptions = tomcatList.map(item => {
      return <Option key={item.id} value={item.id}>{item.name}</Option>
    })
    return (
      <Form className="importTraditionEnv">
        <FormItem>
          <Row>
            <Col span={3}></Col>
            <Col span={9}>
              <ButtonGroup>
                <Button size="large" type="ghost" className={type === '1' && 'active'} onClick={() => this.onEnvBtnClick('1')} value="1">导入新环境</Button>
                <Button size="large" type="ghost" className={type === '2' && 'active'} onClick={() => this.onEnvBtnClick('2')} value="2">已有环境</Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Input type="hidden" {...typeProps} />
        </FormItem>
        {
          type === '1' ?
            [
              <FormItem
                key="envName"
                {...formItemLayout}
                label="传统环境名称"
              >
                <Input placeholder="请输入传统环境名称" size="large" {...getFieldProps('envName', {
                  rules: [
                    { required: true, message: '请输入传统环境名称' },
                  ],
                })} />
              </FormItem>,
              <FormItem
                key="host"
                className="nomarginbottom"
                {...formItemLayout}
                label="传统环境 IP"
              >
                <Input disabled={isTestSucc} placeholder="请输入传统环境 IP" size="large" {...getFieldProps('host', {
                  rules: [
                    { validator: this.checkHost },
                  ],
                  onChange: this.onHostChange,
                })} />
              </FormItem>,
              <FormItem
                key="hint"
                {...formTextLayout}
              >
                <div><Icon type="question-circle-o" /> 传统环境一般指非容器环境（Linux的虚拟机、物理机等）</div>
              </FormItem>,
              <FormItem
                key="account"
                {...formItemLayout}
                label="环境登录账号"
              >
                <Input disabled={isTestSucc} placeholder="请输入环境登录账号" size="large" {...getFieldProps('account', {
                  rules: [
                    { required: true, message: '请输入环境登录账号' },
                  ],
                })} />
              </FormItem>,
              <FormItem
                key="password"
                {...formItemLayout}
                label="环境登录密码"
              >
                <Input
                  disabled={isTestSucc}
                  type={isShowPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  readOnly={readOnly}
                  onFocus={() => this.setState({ readOnly: false })}
                  onBlur={() => this.setState({ readOnly: true })}
                  placeholder="请输入环境登录密码"
                  size="large"
                  {... getFieldProps('password', {
                    rules: [
                      { required: true, message: '请输入环境登录密码' },
                    ],
                  })} />
                <Icon
                  className="eyeIcon"
                  type={isShowPassword ? 'eye-o' : 'eye'}
                  onClick={() => this.setState({
                    isShowPassword: !isShowPassword,
                  })}
                />
              </FormItem>,
              <FormItem
                key="btn"
                {...formTextLayout}
              >
                <div>{
                  (() => {
                    if (!isTestSucc) {
                      if (total >= limit) {
                        return <Tooltip title={`为了保证平台性能，每个项目建议不多于 ${limit} 个传统环境`}>
                          <Button type="primary" size="large" disabled={true}>测试连接</Button>
                        </Tooltip>
                      }
                      return <Button loading={btnLoading} type="primary" size="large" onClick={this.checkVmInfos}>测试连接</Button>
                    }
                    return <Button type="ghost" size="large" onClick={this.rePut}>重新填写</Button>
                  })()
                }</div>
              </FormItem>,
              <FormItem
                key="jdk"
                label="Java 环境"
                {...formItemLayout}
              >
                <Select style={{ marginLeft: '5px' }} {...getFieldProps('jdk_id', {
                  rules: [
                    { required: true, message: '请选择 JDK 版本' },
                  ],
                  initialValue: jdkList[0] && jdkList[0].id,
                  onChange: this.onJdkChange,
                })} placeholder="请选择 Java 环境">
                  {options}
                </Select>
              </FormItem>,
              <FormItem
                key="home"
                {...formItemLayout}
                label="安装路径"
              >
                <Row className="rowHome">
                  <Col span={5} className="left">JAVA_HOME</Col>
                  <Col span={2} className="equre"> = </Col>
                  <Col span={10}>
                    <FormItem
                      {...formItemNoLabelLayout}
                    >
                      <Input placeholder="请输入 JAVA_HOME" size="large" {...getFieldProps('java_home', {
                        rules: [
                          { required: true, message: '请输入 JAVA_HOME' },
                        ],
                      })} />
                    </FormItem>
                  </Col>
                </Row>
                <Row className="rowHome">
                  <Col span={5} className="left">JRE_HOME</Col>
                  <Col span={2} className="equre"> = </Col>
                  <Col span={10}>
                    <FormItem
                      {...formItemNoLabelLayout}
                    >
                      <Input placeholder="请输入 JRE_HOME" size="large" {...getFieldProps('jre_home', {
                        rules: [
                          { required: true, message: '请输入 JRE_HOME' },
                        ],
                      })} />
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>,
              <FormItem
                key="tomcat"
                label="Tomcat 版本"
                {...formItemLayout}
              >
                <Select placeholder="请选择 Tomcat 版本" size="large" {...getFieldProps('tomcat_id', {
                  rules: [
                    { required: true, message: '请选择 Tomcat 版本' },
                  ],
                  initialValue: (tomcatVersionList[0] && tomcatVersionList[0].id) || undefined,
                })}>
                  {tomcatVersionOptions}
                </Select>
              </FormItem>,
              <FormItem
                key="port"
                {...formItemLayout}
                label="端口号"
              >
                <Input placeholder="请输入端口号" size="large" {...getFieldProps('start_port', {
                  rules: [
                    { validator: this.checkPort },
                  ],
                  onChange: e => this.onPortChange(e.target.value),
                })} />
              </FormItem>,
              <FormItem
                key="tomcat_name"
                {...formItemLayout}
                label="实例名称"
              >
                {'tomcat_' + (getFieldValue('start_port') || '')}
                <Input type="hidden" {...getFieldProps('tomcat_name', {
                  rules: [
                    // { required: true, message: '请输入端口号' },
                  ],
                })} />
              </FormItem>,
              <FormItem
                key="dirs"
                {...formLargeItemLayout}
                label="安装路径"
              >
                <Row>
                  <Col span={7}>
                    <FormItem
                      {...formItemNoLabelLayout}
                    >
                      <Input placeholder="请输入 CATALINA_HOME 变量名" {...getFieldProps('catalina_home_env', {
                        rules: [
                          { required: true, message: '请输入 CATATALINA_HOME 变量名' },
                        ],
                      })} />
                    </FormItem>
                  </Col>
                  <Col style={{ textAlign: 'center' }} span={1}>=</Col>
                  <Col span={7}>
                    <FormItem
                      {...formItemNoLabelLayout}
                    >
                      <Input placeholder="请输入 CATALINA_HOME 指向的路径" {...getFieldProps('catalina_home_dir', {
                        rules: [
                          { required: true, message: '请输入 CATATALINA_HOME 指向路径' },
                        ],
                      })} />
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>,
            ]
            :
            <div>
              <FormItem
                key="vm_id"
                {...formItemLayout}
                label="选择应用环境">
                <Select placeholder="请选择应用环境" {...getFieldProps('vm_id', {
                  rules: [
                    { required: true, message: '请选择应用环境' },
                  ],
                  onChange: this.onVmIdChange,
                })}>
                  {vmOpts}
                </Select>
              </FormItem>
              {
                vm_id &&
                  <div>
                    <Row>
                      <Col span={3}></Col>
                      <Col span={9}>
                        <FormItem
                          key="isNewTomcat"
                          className="noMarginBottom"
                        >
                          <RadioGroup {...isNewTomcatProps}>
                            <Radio value="1">已安装 Tomcat</Radio>
                            <Radio value="2">添加新 Tomcat</Radio>
                          </RadioGroup>
                        </FormItem>
                      </Col>
                    </Row>
                    {
                      isNewTomcat === '1' ?
                        <Row>
                          <Col span={3}></Col>
                          <Col span={9}>
                            <FormItem>
                              <Select placeholder="请选择已安装 Tomcat 环境" {...getFieldProps('tomcat_env_id', {
                                rules: [
                                  { required: true, message: '请选择已安装 Tomcat 环境' },
                                ],
                              })}>
                                {tomcatOptions}
                              </Select>
                            </FormItem>
                          </Col>
                        </Row>
                        :
                        (() => {
                          const obj = filter(vmList, { vminfoId: parseInt(vm_id) })[0]
                          return <Row>
                            <Col span={3}></Col>
                            <Col span={9}>
                              <CreateTomcat
                                jdk_id={obj.jdkId}
                                form={form}
                                allPort={obj.ports}
                                username={obj.user}
                                isImport={true}
                              />
                            </Col>
                          </Row>
                        })()
                    }
                  </div>
              }
            </div>
        }
      </Form>
    )
  }
}

function mapStateToProps() {
  return {

  }
}
export default connect(mapStateToProps, {
  checkVMUser,
  getJdkList,
  getTomcatVersion,
  getVMinfosList,
  getTomcatList,
})(Form.create()(TraditionEnv))
