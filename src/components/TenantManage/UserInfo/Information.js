/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  my Information
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, Input, Icon, Form, Modal, Spin, Radio, Checkbox, Tooltip } from 'antd'
import './style/Information.less'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { updateUser, bindRolesForUser } from '../../../actions/user'
import { parseAmount, formatDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import { ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN, ROLE_SYS_ADMIN, ROLE_USER, CREATE_PROJECTS_ROLE_ID, CREATE_TEAMS_ROLE_ID, PHONE_REGEX } from '../../../../constants'
import MemberRecharge from '../_Enterprise/Recharge'
import { chargeUser } from '../../../actions/charge'
import { loadLoginUserDetail } from '../../../actions/entities'
import { loadUserDetail, changeUserRole } from '../../../actions/user'
import { MAX_CHARGE, EMAIL_REG_EXP }  from '../../../constants'

const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const createForm = Form.create;
const FormItem = Form.Item;

let ResetPassWord = React.createClass({
  getInitialState() {
    return {
      password: 'password',
    }
  },
  handleChange() {
    if (this.state.password === 'text') {
      this.setState({
        password: 'password'
      })
    } else {
      this.setState({
        password: 'text'
      })
    }
  },
  handleCancel(e) {
    e.preventDefault();
    this.props.form.resetFields()
    this.props.onChange()
  },

  handleSubmit(e) {
    const { userID, userDetail } = this.props
    e.preventDefault();
    const noti = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      noti.spin('修改密码中')
      this.props.updateUser(userID,
        {
          password: values.passwd
        }, {
          success: {
            func: () => {
              noti.close()
              noti.success('密码修改成功')
              this.props.form.resetFields()
              this.props.onChange()
            }
          }
        })
    });
  },
  checkPass(rule, value, callback) {
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
    return callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！');
      return
    }
    return callback()
  },
  componentDidMount(){
    this.refs.intPass.refs.input.focus()
  },
  render: function () {
    const { password } = this.state
    const { getFieldProps } = this.props.form;
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { whitespace: true },
        { validator: this.checkPass },
      ],
    });
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    });
    return (
      <div id='UserInfReset'>
        <Form horizontal form={this.props.form}>
          <Row>
            <Col>
              <FormItem hasFeedback>
                <Input type={password} className="passInt" {...passwdProps} placeholder="输入新密码" autoComplete="off" ref='intPass' />
                <Icon type="eye"
                  onClick={this.handleChange}
                  className={password === 'text' ? 'passIcon' : ''} />
              </FormItem>
            </Col>
          </Row>
          <FormItem hasFeedback>
            <Input type={password} className="passInt" {...rePasswdProps}
              autoComplete="off"
              placeholder="两次输入密码保持一致" />
          </FormItem>
          <FormItem>
            <Button type="ghost" onClick={this.handleCancel} style={{ backgroundColor: '#efefef' }}>
              取消
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={this.handleSubmit}>确定</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
})
ResetPassWord = createForm()(ResetPassWord);

class Information extends Component {
  constructor(props) {
    super(props)
    this.handleRevise = this.handleRevise.bind(this)
    this.changeUserRoleModal = this.changeUserRoleModal.bind(this)
    this.resetPsw = this.resetPsw.bind(this)
    this.handleUpdateUser = this.handleUpdateUser.bind(this)
    this.resetForm = this.resetForm.bind(this)
    this.changeUserAuth = this.changeUserAuth.bind(this)
    this.state = {
      revisePass: false,
      number: 10,
      visibleMember: false,// member account
      selectUserRole: 1,
      changeUserRoleModal: false,
    }
    this.userAuth = []
  }
  handleRevise() {
    this.setState({
      revisePass: true
    })
  }
  resetPsw() {
    this.setState({
      revisePass: false
    })
  }
  componentWillMount(){
    const { editPass, location } = this.props
    if(location.hash == '#edit_pass') {
      this.setState({
        revisePass: true
      })
      return
    }
    this.setState({
      revisePass: editPass
    })
  }
  componentWillReceiveProps(nextProps) {
    const hash = nextProps.location.hash
    if(this.props.location.hash != hash) {
      if(hash == '#edit_pass') {
        this.setState({
          revisePass: true
        })
      }
      if(!hash) {
        this.setState({
          revisePass: false
        })
      }
    }
  }
  activeMenu(number) {
    this.setState({number})
  }
  memberRecharge(userDetail, roleName) {
    const record = {
      name: userDetail.displayName,
      namespace:userDetail.namespace,
      style: roleName,
      balance: parseAmount(userDetail.balance || 0).fullAmount
    }
    this.setState({
      visibleMember: true,
      record
    })
  }
  changeUser() {
    let notification = new NotificationHandler()
    const amount = parseInt(this.state.number)
    const body = {
      namespaces: [this.state.record.namespace],
      amount
    }
    if (!amount || amount <=0 ) {
      notification.info('请选择充值金额, 且不能为负数')
      return
    }
    const oldBalance = parseAmount(this.props.userDetail.balance, 4).amount
    if (oldBalance + amount >= MAX_CHARGE ) {
      // balance (T) + charge memory not 200000
      let isnewBalance = Math.floor(MAX_CHARGE - oldBalance )
      let newBalance = isnewBalance > 0 ? isnewBalance : 0
      notification.info(`充值金额大于可充值金额，最多还可充值 ${newBalance}`)
      return
    }
    const { loadLoginUserDetail, loadUserDetail, chargeUser} = this.props
    const _this = this
    const { userID, userDetail, loginUser} = this.props
    chargeUser(body, {
      success: {
        func: (ret) => {
          _this.setState({visibleMember: false})
          notification.success('充值成功')
          if (userDetail.namespace == loginUser.namespace) {
            loadLoginUserDetail()
          }
          loadUserDetail(userID || 'default')
        },
        isAsync: true
      }
    })
  }
  changeUserRoleModal() {
    const { userDetail } = this.props

    this.setState({
      changeUserRoleModal: true,
      selectUserRole: userDetail.role
    })
  }
  changeUserAuthModal() {
    const { userDetail } = this.props
    this.setState({
      changeUserAuthModal: true,
    })
  }
  changeUserRoleRequest() {
    const {
      updateUser, loginUser, userID,
      userDetail, changeUserRole, loadLoginUserDetail,form,bindRolesForUser,loadUserDetail
    } = this.props
    const { selectUserRole } = this.state
    const { validateFields } = form
    const notify = new NotificationHandler()
    if(loginUser.role === ROLE_USER || loginUser.role === ROLE_BASE_ADMIN) { return notify.error('只有系统管理员或平台管理员有此权限')}
    if(userDetail.role === selectUserRole ) {
      notify.error('用户角色没有发生变化')
      return
    }
    notify.spin('更新用户角色中')
    const self = this;

    updateUser(userID, { role: selectUserRole+1 }, {
      success: {
        func: () => {
          notify.close()
          notify.success('用户角色更新成功')
          self.setState({
            changeUserRoleModal: false
          },()=>{
            if(this.state.selectUserRole === ROLE_PLATFORM_ADMIN || this.state.selectUserRole  === ROLE_BASE_ADMIN){
              validateFields([ 'roles' ], (errors, values) => {
                const { roles } = values
                const auth = [ CREATE_PROJECTS_ROLE_ID, CREATE_TEAMS_ROLE_ID]
                function arrayDiff(a, b) {
                  for(var i=0;i<b.length;i++)
                  {
                    for(var j=0;j<a.length;j++)
                    {
                      if(a[j]==b[i]){
                        a.splice(j,1);
                        j=j-1;
                      }
                    }
                  }
                  return a;
                }
                const bindUserRoles = {
                  roles: arrayDiff(auth, roles),
                }
                const unbindUserRoles = {
                  roles: [],
                }
                bindRolesForUser(userID, 'global', 'global', { bindUserRoles, unbindUserRoles }, {
                  success: {
                    func: res => {
                      notify.success('更新用户权限成功')
                      loadUserDetail(userID)
                    },
                    isAsync: true,
                  },
                  failed: {
                    func: () => {
                      notify.error('更新用户权限失败')
                    }
                  }
                })
              })
            }
          })
          changeUserRole(userID, selectUserRole)
          if (loginUser.userID == userID) {
            loadLoginUserDetail()
            if (selectUserRole !== ROLE_SYS_ADMIN) {
              browserHistory.push('/tenant_manage/user')
            }
          }
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          notify.close()
          if(res.statusCode == 401) {
            notify.error('权限不足')
            return
          }
          notify.error('用户角色更新失败')
        }
      }
    })
  }
  changeUserAuth() {
    const { form, bindRolesForUser, userDetail, loadUserDetail } = this.props
    const { validateFields } = form
    const notify = new NotificationHandler()
    let userID = this.props.userID ||  userDetail.userID
    validateFields([ 'roles' ], (errors, values) => {
      const { roles } = values
      const bindUserRoles = {
        roles: roles.filter(role => this.userAuth.indexOf(role) < 0),
      }

      const unbindUserRoles = {
        roles: this.userAuth.filter(role => roles.indexOf(role) < 0),
      }
      bindRolesForUser(userID, 'global', 'global', { bindUserRoles, unbindUserRoles }, {
        success: {
          func: res => {
            notify.success('更新用户权限成功')
            this.setState({
              changeUserAuthModal: false,
            })
            loadUserDetail(userID)
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notify.error('更新用户权限失败')
          }
        }
      })
    })
  }
  checkTel(rule, value, callback){
    if(!value){
      callback()
      return
    }
    if (!PHONE_REGEX.test(value)){
      callback([new Error('请输入正确的号码')])
      return
    }
    callback()
  }
  checkEmail(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (!EMAIL_REG_EXP.test(value)) {
      callback([new Error('邮箱格式错误')])
      return
    }
    callback()
  }
  resetForm() {
    const { form, userDetail } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      phone: userDetail.phone,
      email: userDetail.email,
      comment: userDetail.comment,
    })
  }
  handleUpdateUser(key) {
    const {
      form, updateUser, loadUserDetail,
      loginUser, loadLoginUserDetail,
    } = this.props
    const { validateFields } = form
    const notify = new NotificationHandler()
    const userID = this.props.userID || 'default'
    validateFields([ key ], (errors, values) => {
      if (!!errors) {
        return
      }
      updateUser(userID, values, {
        success: {
          func: () => {
            notify.success('更新成功')
            this.setState({
              [`${key}ModalVisible`]: false
            })
            loadUserDetail(userID)
            loginUser.userID == userID && loadLoginUserDetail()
            this.setState({
              commentEditVisible: false,
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            notify.close()
            if(res.statusCode == 401) {
              notify.error('权限不足')
              return
            }
            if (res.statusCode === 409) {
              let type = '信息'
              if (key === 'email') {
                type = '邮箱'
              } else if (key === 'phone') {
                type = '手机号'
              }
              return notify.error('修改失败', `该${type}已在平台上注册`)
            }
            if(res.statusCode == 500) {
              const { message } = res
              if (typeof message === 'string') {
                if (message.indexOf('email_UNIQUE') > -1) {
                  notify.error('修改失败', '该邮箱已在平台上注册')
                  return
                }
              }
            }
            notify.error('更新失败')
          }
        }
      })
    })
  }
  changeRole = (e)=>{
    this.setState({ selectUserRole: e.target.value })
  }
  checkAuth = (val) =>{
    this.userAuth = val
  }
  render() {
    const { revisePass } = this.state
    const { form, userID, userDetail, updateUser, loginUser, isFetching } = this.props
    let notAllowChange = (loginUser.role === ROLE_PLATFORM_ADMIN &&
      (userDetail.role === ROLE_SYS_ADMIN || userDetail.role === ROLE_PLATFORM_ADMIN || userDetail.role === ROLE_BASE_ADMIN)) ||
      (loginUser.role === ROLE_SYS_ADMIN && userDetail.role === ROLE_SYS_ADMIN )
    let accountTypeEdit = false
    let editRole = true //隐藏权限的修改按钮
    const currentPath = this.props.location.pathname
    if(loginUser.userID == this.props.userID && loginUser.role === ROLE_PLATFORM_ADMIN ) {
      notAllowChange = false
    }
    // 当前登陆的用户就是详情的用户或者处在我的账户页面，可编辑信息
    if(loginUser.userID == this.props.userID || currentPath === '/account') {
      notAllowChange = false
    }
    let authorityDisabled = notAllowChange
    // 系统管理员不可修改自己、基础设施管理员、平台管理员的权限
    if(loginUser.role == ROLE_SYS_ADMIN && (userDetail.role === ROLE_SYS_ADMIN || userDetail.role === ROLE_BASE_ADMIN || userDetail.role === ROLE_PLATFORM_ADMIN)) {
      authorityDisabled = true
    }

    if(currentPath === '/account' &&
      (!loginUser.role || loginUser.role === ROLE_BASE_ADMIN)) {
      editRole = false
    }else if(currentPath !== '/account' && loginUser.role === ROLE_PLATFORM_ADMIN) {
      // 平台管理员不允许修改普通成员和基础设施管理员的用户类型
      accountTypeEdit = true
      if (loginUser.userID == userID) {
        accountTypeEdit = false
      }
    } else {
      accountTypeEdit = false
    }
    if (userDetail.role === ROLE_SYS_ADMIN ) {
      accountTypeEdit = true
    }
    // 登录user是平台管理员,将被禁止修改
    if (loginUser.role === ROLE_PLATFORM_ADMIN) {
      accountTypeEdit = true
    }

    const { billingConfig } = loginUser
    const { enabled: billingEnabled } = billingConfig
    let roleName
    switch (userDetail.role) {
      case ROLE_SYS_ADMIN:
        roleName = "系统管理员"
        break
      case ROLE_PLATFORM_ADMIN:
        roleName = "平台管理员"
        break
      case ROLE_BASE_ADMIN:
        roleName = "基础设施管理员"
        break
      default:
        roleName = "普通成员"
    }
    let balance = parseAmount(userDetail.balance || 0).amount
    const { getFieldProps } = form
    // 手机号
    const phoneProps = getFieldProps('phone', {
      rules: [
        { required: true, message: '请填写手机号' },
        { validator: this.checkTel },
      ],
      initialValue: userDetail.phone,
    })
    // 邮箱
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
      initialValue: userDetail.email,
    })
    // 备注
    const commentProps = getFieldProps('comment', {
      initialValue: userDetail.comment,
    })
    const { globalRoles, role } = userDetail
/*    let checkedAuth = (auth) => {
      switch(auth){
        case 'project-creator':
          return CREATE_PROJECTS_ROLE_ID
        case 'team-creator':
          return CREATE_TEAMS_ROLE_ID
      }
    }*/
    if (role === ROLE_SYS_ADMIN) {
      this.userAuth = [ CREATE_PROJECTS_ROLE_ID, CREATE_TEAMS_ROLE_ID ]
    } else {
      this.userAuth = []
      globalRoles && globalRoles.map(role => {
        if (role === 'project-creator') {
          this.userAuth.push(CREATE_PROJECTS_ROLE_ID)
        } else if (role === 'team-creator') {
          this.userAuth.push(CREATE_TEAMS_ROLE_ID)
        }
      })
    }
/*    let newAuth = []
    globalRoles && globalRoles.map(v => {
      newAuth.push(checkedAuth(v))
    });
    this.userAuth = newAuth*/

    // 权限
    let checked = this.userAuth
    let rolesProps = getFieldProps('roles', {
      initialValue: this.userAuth
    });

    return (
      <div id='Informations'>
        <div className="Essentialinformation">基本信息</div>
        <div className="informationleft">
          <Row className="Item">
            <Col span={4}>名称</Col>
            <Col span={20}>{userDetail.displayName}</Col>
          </Row>
          <Row className="Item">
            <Col span={4}>类型</Col>
            <Col span={13}>{roleName}</Col>
            {
              editRole?
                <Col span={7}>
                  <Button style={{width: '80px'}}
                          loading={isFetching}
                          disabled={accountTypeEdit}
                          type="primary"
                          onClick={() => this.changeUserRoleModal()}>
                    修 改
                  </Button>
                </Col>
                :
                ""
            }
          </Row>
          <Row className="Item">
            <Col span={4}>权限</Col>
            <Col span={13}>
              <CheckboxGroup
                disabled={true}
                value={ this.userAuth }
                options={[
                  { label: '可创建项目', value: CREATE_PROJECTS_ROLE_ID },
                  { label: '可创建团队', value: CREATE_TEAMS_ROLE_ID },
                ]}
              />
            </Col>
            {
              loginUser.role !== ROLE_PLATFORM_ADMIN &&
              <Col span={7}>
                <Button style={{width: '80px'}}
                        loading={isFetching}
                        disabled={authorityDisabled}
                        type="primary" onClick={() => this.changeUserAuthModal()}>
                  修 改
                </Button>
              </Col>
            }
          </Row>
          <Row className="Item">
            <Col span={4}>手机</Col>
            <Col span={13}>{userDetail.phone || '-'}</Col>
            <Col span={7}> <Button type="primary"
                                   loading={isFetching}
                                   onClick={() => this.setState({ phoneModalVisible: true })}
                                   disabled={notAllowChange}>修改手机</Button></Col>
          </Row>
          <Row className="Item">
            <Col span={4}>邮箱</Col>
            <Col span={13}>{userDetail.email}</Col>
            <Col span={7}> <Button type="primary"
                                   loading={isFetching}
                                   onClick={() => this.setState({ emailModalVisible: true })}
                                   disabled={notAllowChange}>修改邮箱</Button></Col>
          </Row>
          { userDetail && userDetail.type == 1 ? <Row className="Item">
            <Col span={4}>密码</Col>
            {
              !revisePass && <Col span={13}>已设置</Col>
            }
            <Col span={7}>
              {
                revisePass ?
                  <ResetPassWord updateUser={updateUser} userID={userID} userDetail={userDetail} onChange={this.resetPsw} />
                  :
                  <Button type="primary"
                          loading={isFetching}
                          onClick={this.handleRevise}
                          disabled={notAllowChange}
                  >修改密码</Button>
              }
            </Col>
          </Row> : ''}
        </div>
        <div className="informationleft">
          <Row className="Item">
            <Col span={4}>LDAP用户</Col>
            <Col span={18}>
            {
              userDetail.type === 2
                ? '是'
                : '否'
            }
            </Col>
          </Row>
          <Row className="Item">
            <Col span={4}>创建时间</Col>
            <Col span={18}>{formatDate(userDetail.creationTime)}</Col>
          </Row>
          {/* {
            billingEnabled &&
            <Row className="Item">
              <Col span={4}>余额</Col>
              <Col span={13}>{balance}T</Col>
              // system user
              {(ROLE_SYS_ADMIN == this.props.loginUser.role) ?
                <Col span={7}>
                  <Button type="primary" icon="pay-circle-o" onClick={()=>　this.memberRecharge(userDetail,roleName)}>
                    充值
                  </Button>
                </Col>
                :null
              }
            </Row>
          } */}
          <Row className="Item comment">
            <Col span={4}>备注</Col>
            <Col span={13}>
            {/* {userDetail.comment || '-'} */}
            <Form horizontal>
              <FormItem className='input_container'>
                <Input className="comment-input" disabled={!this.state.commentEditVisible} type="textarea" {...commentProps} placeholder="输入新备注" />
              </FormItem>
              {
                this.state.commentEditVisible && (
                  <div className="comment-btns">
                    <Button onClick={() => {
                      this.setState({ commentEditVisible: false})
                      this.resetForm()
                    }}>
                      取 消
                    </Button>
                    <Button onClick={this.handleUpdateUser.bind(this, 'comment')} type="primary">确 定</Button>
                  </div>
                )
              }
            </Form>
            </Col>
            <Col span={7}>
              {
                !this.state.commentEditVisible && (
                  <Button className="comment-edit-btn" icon="edit"  disabled={notAllowChange} onClick={() => this.setState({ commentEditVisible: true })}>
                    修改
                  </Button>
                )
              }
            </Col>
          </Row>
        </div>
        {/* 充值modal */}
        <Modal title="成员充值" visible={this.state.visibleMember}
         onCancel={()=> this.setState({visibleMember: false,number: 10})}
         onOk={()=> this.changeUser()}
         width={600}
        >
          <MemberRecharge parentScope={this} visible={this.state.visibleMember}/>
        </Modal>
        <Modal title="修改账号类型"
          visible={this.state.changeUserRoleModal}
          onCancel={() => this.setState({ changeUserRoleModal: false, selectUserRole: userDetail.role })}
          onOk={() => this.changeUserRoleRequest()}
        >
          <RadioGroup onChange={(e) => { this.changeRole(e)}}  value={this.state.selectUserRole}>
            <Radio key={ROLE_USER} value={ROLE_USER}>普通成员</Radio>
            {
              loginUser.role === ROLE_PLATFORM_ADMIN?
                ''
                :
                <Radio key={ROLE_PLATFORM_ADMIN} value={ROLE_PLATFORM_ADMIN}>平台管理员</Radio>
            }
            <Radio key={ROLE_BASE_ADMIN} value={ROLE_BASE_ADMIN}>基础设施管理员</Radio>
          </RadioGroup>
        </Modal>
        <Modal title="修改用户权限"
          visible={this.state.changeUserAuthModal}
          onCancel={() => this.setState({ changeUserAuthModal: false })}
          onOk={this.changeUserAuth}
        >
          <Form horizontal>
            <FormItem>
              <CheckboxGroup
                {...rolesProps}
                options={[
                  { label: '可创建项目', value: CREATE_PROJECTS_ROLE_ID },
                  { label: '可创建团队', value: CREATE_TEAMS_ROLE_ID },
                ]}
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title="修改手机"
          visible={this.state.phoneModalVisible}
          onCancel={() => {
            this.setState({ phoneModalVisible: false})
            this.resetForm()
          }}
          onOk={this.handleUpdateUser.bind(this, 'phone')}
        >
          <Form horizontal>
            <FormItem>
              <Input type="text" {...phoneProps} placeholder="输入新手机号" />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title="修改邮箱"
          visible={this.state.emailModalVisible}
          onCancel={() => {
            this.setState({ emailModalVisible: false})
            this.resetForm()
          }}
          onOk={this.handleUpdateUser.bind(this, 'email')}
        >
          <Form horizontal>
            <FormItem>
              <Input type="text" {...emailProps} placeholder="输入新邮箱" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

Information = createForm()(Information)

function mapStateToProp(state, props) {
  const loginUser = state.entities.loginUser.info
  const isFetching = state.user.userDetail.isFetching
  let userDetail = props.userDetail
  return {
    userDetail,
    loginUser,
    isFetching
  }
}

export default connect(mapStateToProp, {
  updateUser,
  loadLoginUserDetail, // 登录用户信息
  loadUserDetail,// 用户或者成员信息
  chargeUser,
  changeUserRole,
  bindRolesForUser,
})(Information)
