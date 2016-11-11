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
import { Link } from 'react-router'

const createForm = Form.create;
const FormItem = Form.Item;
const confirm = Modal.confirm;

let MemberTable =  React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      pagination: {},
      loading: false,
      sortName: true,
      sortTeam: true,
      sortBalance: true,
      sort: "a,userName",
      filter: ""
    };
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  },
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleSortName(){
    const { loadUserList } = this.props.scope.props
    const { sortName } = this.state
    let sort = this.getSort(!sortName, 'userName')
    loadUserList({
        page: this.state.page,
        size: this.state.pageSize,
        sort,
        filter: this.state.filter,
    })
    this.setState({
      sortName: !sortName,
      sort,
    })
  },
  handleSortTeam(){
    const { loadUserList } = this.props.scope.props
    const { sortTeam } = this.state
    let sort = this.getSort(!sortTeam, 'userName')
    loadUserList({
        page: this.state.page,
        size: this.state.pageSize,
        sort,
        filter: this.state.filter,
    })
    this.setState({
      sortTeam: !sortTeam,
      sort,
    })
  },
  handleSortBalance(){
    const { loadUserList } = this.props.scope.props
    const { sortBalance } = this.state
    let sort = this.getSort(!sortBalance, 'userName')
    loadUserList({
        page: this.state.page,
        size: this.state.pageSize,
        sort,
        filter: this.state.filter,
    })
    this.setState({
      sortBalance: !sortBalance,
      sort,
    })
  },
  handleBack(){
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delMember(record){
    const { scope } = this.props
    confirm({
      title: '您是否确认要删除这项内容',
      content: '点确认 1 秒后关闭',
      onOk() {
        console.log('del !!!!!')
        scope.props.deleteUser(record.key,{
          success: {
            func: () => {
              scope.props.loadUserList({
                page: scope.state.page,
                size: scope.state.pageSize,
                sort: scope.state.sort,
                filter: scope.state.filter,
              })
            },
            isAsync: true
          },
        })
      },
      onCancel() {},
    });
  },
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope } = this.props
    console.log('listdata',data);
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const pagination = {
      total: this.props.scope.props.total,
      showSizeChanger: true,
      defaultPageSize: 5,
      pageSizeOptions: ['5','10','15','20'],
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize);
        scope.props.loadUserList({
          page: current,
          size: pageSize,
          sort: scope.state.sort,
          filter: scope.state.filter
        })
        scope.setState({
          pageSize: pageSize,
          page: current
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        console.log('Current: ', current);
        scope.props.loadUserList({
          page: current,
          size: pageSize,
          sort: scope.state.sort,
          filter: scope.state.filter
        })
        scope.setState({
          pageSize: pageSize,
          page: current
        })
      },
    }
    const columns = [
      {
        title: (
          <div onClick={this.handleSortName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortName?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortName?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
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
        title: (
          <div onClick={this.handleSortTeam}>
            团队
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortTeam?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortTeam?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        width: 150,
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            余额
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortBalance?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortBalance?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
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
            <Link to="/setting">
            <Button icon="setting" className="setBtn">
              管理
            </Button>
            </Link>
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
      
      scope.props.createUser(newUser,{
        success: {
          func: () => {
            scope.setState({
              visible: false,
            })
            scope.props.loadUserList({
              page: scope.state.page,
              size: scope.state.pageSize,
              sort: scope.state.sort,
              filter: scope.state.filter
            })
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
      page: 1,
      sort: "a,userName",
      filter: "",
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
  }
  componentWillMount(){
    this.props.loadUserList({
      page: 1,
      size: 5,
      sort: "a,userName",
      filter: "",
    })
    
  }
  componentWillReceiveProps(nextProps){
    
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
          <SearchInput scope={scope} searchIntOption={searchIntOption}/>
          <NewMemberForm visible={visible} scope={scope}/>
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTable scope={scope} data={users} />
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
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
            team: item.teamCount,
            balance: item.balance,
          }
        )
      })
    }
    if (users.result.total) {
      total = users.result.total
    }
  }
  
  return {
    users: data,
    total
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
})(MemberManage)