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

const Option = Select.Option
const createForm = Form.create;
const FormItem = Form.Item;

function noop() {
  return false;
}

const data = [
  {key: '1',name: 'a',tel: '11',email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: '5',},
  {key: '2',name: 'ba',tel: '12',email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: '5',},
  {key: '3',name: 'caa',tel: '13',email: 'emaila@tenxcloud.com',style: '普通成员',team: '1',rest: '5',},
  {key: '4',name: 'daaa',tel: '14',email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: '5',},
  {key: '5',name: 'eaaaa',tel: '15',email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: '5',},
  {key: '6',name: 'f',tel: '16',email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: '5',},
  {key: '7',name: 'g',tel: '17',email: 'emaila@tenxcloud.com',style: '普通成员',team: '2',rest: '5',},
  {key: '8',name: 'h',tel: '18',email: 'emaila@tenxcloud.com',style: '团队管理员',team: '1',rest: '5',},
  ];

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
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    let pageTotal = searchResult.length === 0 ? data.length : searchResult.length
    const pagination = {
      total: pageTotal,
      showSizeChanger: true,
      defaultPageSize: 5,
      pageSizeOptions: ['5','10','15','20'],
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize);
      },
      onChange(current) {
        console.log('Current: ', current);
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
        dataIndex: 'rest',
        key: 'rest',
        width: 150,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 180,
        render: (text, record) => (
          <div>
            <Button icon="setting" className="setBtn">管理</Button>
            <Button icon="delete" className="delBtn">删除</Button>
          </div>
        ),
      },]
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
      callback();
    } else {
      setTimeout(() => {
        if (value === 'zhaoxueyu') {
          callback([new Error('抱歉，该用户名已被占用。')]);
        } else {
          callback();
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
  handleOk() {
    const { scope } = this.props
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      scope.setState({
        visible: false,
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
        { required: true, min: 5, message: '用户名至少为 5 个字符' },
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
          { type: 'email', message: '请输入正确的邮箱地址' },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    });
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
    const checkProps = getFieldProps('check', {});
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
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
                   onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                   placeholder="新成员名称登录密码"
            />
          </FormItem>
    
          <FormItem
            {...formItemLayout}
            label="确认密码"
            hasFeedback
          >
            <Input {...rePasswdProps} type="password" autoComplete="off" placeholder="请再次输入密码确认"
                   onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
            />
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

export default class MemberManage extends Component {
  constructor(props){
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleInt = this.handleInt.bind(this)
    this.showModal = this.showModal.bind(this)
    this.state = {
      selecteData: [],
      selecteValue: '',
      searchValue: '',
      searchResult: [],
      notFound: false,
      visible: false,
    }
  }
  handleInt(e){
    const { selecteValue } = this.state
    
    if(selecteValue === ''){
      const selecteData = []
      data.map((item,index) => {
        selecteData.push(item['name'])
      })
      this.setState({
        selecteValue:'name',
        selecteData: selecteData
      })
    }
    let value = e.target.value
    this.setState({
      searchValue: value
    })
  }
  handleSearch(){
    const { selecteData, searchValue, selecteValue } = this.state
    if(selecteData.length === 0){
      return
    } else {
      let result = []
      let searchResult= []
      selecteData.map((item,index) => {
        let flag = item.indexOf(searchValue)
        if(flag >= 0){
          result.push(item)
        }
        if(result.length === 0){
          this.setState({
            notFound: true
          })
        } else {
          this.setState({
            notFound: false
          })
        }
      })
      data.map((item) => {
        if(result.includes(item[`${selecteValue}`])){
          searchResult.push(item)
        }
      })
      this.setState({
        searchResult: searchResult
      })
    }
  }
  handleSelect(value){
    const selecteData = []
    data.map((item,index) => {
      selecteData.push(item[`${value}`])
    })
    this.setState({
      selecteValue:value,
      selecteData: selecteData
    })
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  componentWillMount(){
    this.setState({
      data: data,
      selecteData: [],
      searchResult: data,
    })
  }
  render(){
    const scope = this
    const { visible } = this.state
    const selectBefore = (
      <Select defaultValue="name" style={{ width: 80 }} onChange={this.handleSelect}>
        <Option value="name">用户名</Option>
        <Option value="team">团队</Option>
        <Option value="tel">手机号</Option>
        <Option value="email">邮箱</Option>
      </Select>
    )
    return (
      <div id="MemberManage">
        <Row>
          <Button type="primary" size="large" onClick={this.showModal}>
            <i className="fa fa-plus"/>
            添加新成员
          </Button>
            <NewMemberForm visible={visible} scope={scope}/>
          <div className="ant-search-input-wrapper search">
            <Input addonBefore={selectBefore}
                   placeholder="请输入关键词搜索"
                   onChange={this.handleInt}
                   onPressEnter={this.handleSearch}/>
            <div className="ant-input-group-wrap">
              <Button icon="search"
                      className='ant-search-btn searchBtn'
                      onClick={this.handleSearch} />
            </div>
          </div>
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTable scope={scope}/>
          </Card>
        </Row>
      </div>
    )
  }
}