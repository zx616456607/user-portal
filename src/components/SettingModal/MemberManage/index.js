/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React,{ Component } from 'react'
import './style/MemberManage.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Form, Checkbox, Tooltip, } from 'antd'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { loadUserList, createUser, deleteUser } from '../../../actions/user'

const createForm = Form.create;
const FormItem = Form.Item;

function loadData(props) {
  const { loadUserList, users, total, size } = props
  loadUserList(null)
}

let MemberTable =  React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
    };
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  },
  handleBack(){
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delMember(record){
    console.log('delmember !',record);
    const { scope } = this.props
    scope.props.deleteUser(record.key,{
      success: {
        func: () => {
          console.log('del !');
        },
        isAsync: true
      },
    })
    scope.props.loadUserList(null)
  },
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope } = this.props
    console.log('listdata',data);
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    // let pageTotal = searchResult.length === 0 ? data.length : searchResult.length
    const pagination = {
      total: this.props.scope.props.total,
      showSizeChanger: true,
      defaultPageSize: 5,
      pageSizeOptions: ['5','10','15','20'],
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize);
        const from = (current-1)*pageSize
        scope.props.loadUserList({
          page: from,
          size: pageSize
        })
        scope.setState({
          pageSize: pageSize
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        const { users } = scope.props
        console.log('Current: ', current);
        scope.props.loadUserList({
          page: (current-1)*pageSize,
          size: pageSize
        })
        console.log('userList new ',users);
      },
    }
    const columns = [
      {
        title: '成员名',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        className: 'memberName',
        width: 150,
      },
      {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
        width: 150,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 200,
      },
      {
        title: '类型',
        dataIndex: 'style',
        key: 'style',
        filters: [
          { text: '团队管理员', value: '团队管理员' },
          { text: '普通成员', value: '普通成员' },
        ],
        filteredValue: filteredInfo.style,
        onFilter: (value, record) => record.style.indexOf(value) === 0,
        width: 150,
      },
      {
        title: '团队',
        dataIndex: 'team',
        key: 'team',
        width: 150,
      },
      {
        title: '余额',
        dataIndex: 'balance',
        key: 'balance',
        width: 150,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 180,
        render: (text, record,index) => (
          <div>
            <Button icon="setting" className="setBtn">管理</Button>
            <Button icon="delete" className="delBtn" onClick={() => this.delMember(record)}>
              删除
            </Button>
          </div>
        ),
      },
    ]
    if(notFound){
      return (
        <div id="notFound">
          <div className="notFoundTip">没有查询到符合条件的记录，尝试其他关键字。</div>
          <a onClick={this.handleBack}>[返回成员管理列表]</a>
        </div>
      )
    } else {
      return (
              <Table columns={columns}
                     dataSource={searchResult.length === 0?data : searchResult}
                     pagination={pagination}
                     onChange={this.handleChange} />
      )
    }
  },
})
let NewMemberForm = React.createClass({
  userExists(rule, value, callback) {
    if (!value) {
      callback([new Error('请输入用户名')]);
    } else {
      setTimeout(() => {
        if (!/^[a-z][-a-z0-9]{1,40}[a-z0-9]$/.test(value)) {
          callback([new Error('抱歉，用户名不合法。')]);
        } else {
          callback()
        }
      }, 800);
    }
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form;
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback();
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！');
    } else {
      callback();
    }
  },
  telExists(rule, value, callback){
    if(!/^[0-9][-0-9()]{5,12}[0-9]$/.test(value)){
      callback([new Error('请输入正确的手机号')]);
    } else {
      callback()
    }
  },
  handleOk() {
    const { scope, users } = this.props
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      const { name, passwd, email, tel, check, } = values
      let newUser = {
        userName: name,
        password: passwd,
        email: email,
        phone: tel,
        sendEmail: check,
      }
      let newItem = {
        key: scope.state.memberList.length,
        name: name,
        tel: tel,
        email: email,
        style: 0,
        team: '1',
        balance: 0,
      }
      scope.props.createUser(newUser,{
        success: {
          func: () => {
            scope.setState({
              visible: false,
            })
            // scope.state.memberList.push(newItem)

            scope.props.loadUserList(null)
            console.log('loadUserList',scope.props.users);
          },
          isAsync: true
        },
      })
    });
  },
  handleCancel(e) {
    const { scope } = this.props
    e.preventDefault();
    this.props.form.resetFields();
    scope.setState({
      visible: false,
    })
  },
  render() {
    const { form, scope, visible } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const text = <span>前台只能添加普通成员</span>
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.userExists },
      ],
    })
    const telProps = getFieldProps('tel', {
      validate: [{
        rules: [
          { required: true, message: '请输入手机号' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { validator: this.telExists },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    })
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
    })
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    })
    const checkProps = getFieldProps('check', {})
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <Form horizontal form={this.props.form}>
        <Modal title="添加新成员" visible={visible}
               onOk={this.handleOk} onCancel={this.handleCancel}
               wrapClassName="NewMemberForm"
               width="463px"
        >
          <FormItem
            {...formItemLayout}
            label="名称"
            hasFeedback
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
          >
            <Input {...nameProps} placeholder="新成员名称" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="类型"
            hasFeedback
          >
            <div>
              普通成员
              <Tooltip placement="right" title={text}>
                <Icon type="question-circle-o" style={{marginLeft: 10}}/>
              </Tooltip>
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="密码"
            hasFeedback
          >
            <Input {...passwdProps} type="password" autoComplete="off"
                   placeholder="新成员名称登录密码"
            />
          </FormItem>
    
          <FormItem
            {...formItemLayout}
            label="确认密码"
            hasFeedback
          >
            <Input {...rePasswdProps} type="password" autoComplete="off" placeholder="请再次输入密码确认"/>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="手机"
            hasFeedback
          >
            <Input {...telProps} type="text" placeholder="新成员手机" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="邮箱"
            hasFeedback
          >
            <Input {...emailProps} type="email" placeholder="新成员邮箱账号" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label=""
          >
            <Checkbox className="ant-checkbox-vertical" {...checkProps}>
              创建完成后, 密码账户名发送至该邮箱
            </Checkbox>
          </FormItem>
        </Modal>
      </Form>
    )
  },
})
NewMemberForm = createForm()(NewMemberForm)
class MemberManage extends Component {
  constructor(props){
    super(props)
    this.showModal = this.showModal.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      memberList: [],
      pageSize: 5,
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
  }
  componentWillMount(){
    this.props.loadUserList({
      page: 0,
      size: 5
    })
    
  }
  componentWillReceiveProps(nextProps){
    /*const { users } = this.props
    if(users.length === 0){
      return
    }
    this.setState({
      memberList: nextProps.users
    })*/
  }
  render(){
    const { users } = this.props
    console.log('users',users);
    const scope = this
    const { visible, memberList } = this.state
    const searchIntOption = {
      width:'280px',
      position: 'right',
      addBefore: [
        {key: 'name', value: '用户名'},
        {key: 'team', value: '团队'},
        {key: 'tel', value: '手机号'},
        {key: 'email', value: '邮箱'},
      ],
      defaultValue: 'name',
      placeholder: '请输入关键词搜索',
    }
    return (
      <div id="MemberManage">
        <Row>
          <Button type="primary" size="large" onClick={this.showModal} icon="plus" className="addBtn">
            添加新成员
          </Button>
          <SearchInput data={users} scope={scope} searchIntOption={searchIntOption}/>
          <NewMemberForm visible={visible} scope={scope}/>
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTable scope={scope} data={users}/>
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
  let size = 0
  let data = []
  const users = state.user.users
  if (users.result) {
    if (users.result.users) {

      usersData = users.result.users
      console.log('usersData',usersData);
      usersData.map((item,index) => {
        data.push(
          {
            key: item.userID,
            name: item.displayName,
            tel: item.phone,
            email: item.email,
            style: item.role === 1?'团队管理员':'普通成员',
            team: '1',
            balance: item.balance,
          }
        )
      })
    }
    if (users.result.total) {
      total = users.result.total
    }
    if (users.result.count) {
      size = users.result.size
    }
  }
  
  return {
    users: data,
    total,
    size,
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
})(MemberManage)