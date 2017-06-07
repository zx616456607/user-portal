/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-6
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Icon, Table, Modal, Form, Row, Col, Checkbox, Select, Spin, Radio, Dropdown, Menu } from 'antd'
import { connect } from 'react-redux'
import '../style/ImageUpdate.less'
import { ecma48SgrEscape } from '../../../../common/ecma48_sgr_escape'

let LogsTemplate = React.createClass({
  getInitialState() {
    return {

    }
  },
  formatLogDetails() {
    let arr = []
    let log = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    for(let i=0;i<100;i++){
      let item = <div className='logDetail' key={'logs' + i}>
        <span className='time'>名字 </span>
        <span className='info'>时间 </span>
        <span className='logs'>{log}</span>
      </div>
      arr.push(item)
    }
    return arr
  },
  handleExpand(){
    this.props.scope.setState({
      expand: !this.props.scope.state.expand
    })
  },
  render() {
    return (<div id="logsTemplate" className={this.props.scope.state.expand ? 'bigModal' : 'smallModal'}>
      <div className='title'>
        日志记录
        {
          this.props.scope.state.expand
          ? <i className="fa fa-compress" aria-hidden="true" onClick={this.handleExpand}></i>
          : <i className="fa fa-expand" aria-hidden="true" onClick={this.handleExpand}></i>
        }
      </div>
      <div className='logsbody'>
        {this.formatLogDetails()}
      </div>
    </div>)
  }
})

class ImageUpdate extends Component {
	constructor(props){
    super(props)
    this.handleSearchRules = this.handleSearchRules.bind(this)
    this.handleInputValue = this.handleInputValue.bind(this)
    this.handleAddRules = this.handleAddRules.bind(this)
    this.handleCancelAddRules = this.handleCancelAddRules.bind(this)
    this.handleComfirmAddRules = this.handleComfirmAddRules.bind(this)
    this.handelTestStoreLink = this.handelTestStoreLink.bind(this)
    this.handlTestLinkResult = this.handlTestLinkResult.bind(this)
    this.handleModalFooterDomNodes = this.handleModalFooterDomNodes.bind(this)
    this.handleSelectOption = this.handleSelectOption.bind(this)
    this.checkRulesNameProps = this.checkRulesNameProps.bind(this)
    this.checkURLAddressProps = this.checkURLAddressProps.bind(this)
    this.checkNewTargetstoreNameProps = this.checkNewTargetstoreNameProps.bind(this)
    this.checkuserNameProps = this.checkuserNameProps.bind(this)
    this.checkpassWordProps = this.checkpassWordProps.bind(this)
    this.handleEditTargetStore = this.handleEditTargetStore.bind(this)
    this.handleDelteTargetStore = this.handleDelteTargetStore.bind(this)
    this.handleConfirmSwitchRules = this.handleConfirmSwitchRules.bind(this)
    this.handleRulesModalText = this.handleRulesModalText.bind(this)
    this.state = {
      inputValue: '',
      rulesData:[
        {
          key:'1',
          name:'fuzhi-demo1',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'using'
        },{
          key:'2',
          name:'fuzhi-demo2',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'using'
        },{
          key:'3',
          name:'fuzhi-demo3',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'stop'
        },{
          key:'4',
          name:'fuzhi-demo4',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'stop'
        },{
          key:'5',
          name:'fuzhi-demo5',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'stop'
        },{
          key:'6',
          name:'fuzhi-demo5',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'stop'
        },{
          key:'7',
          name:'fuzhi-demo5',
          description:'---',
          targetName:'192.168.1.52',
          lastStartTime:'2016/6/1 下午12：24',
          status:'stop',
          lllll:'1231231'
      }],
      taskUpdataData:[
        {
          key:'1',
          name:'fuzhi-demo1',
          status:'finished',
          handle:'delete',
          time:'2ms',
          status:'using',
          createTime:'2016/6/1 下午12：24',
          endTime:'2016/6/1 下午12：24',
          logs:'asdasdadadad',
        },{
          key:'2',
          name:'fuzhi-demo1',
          status:'finished',
          handle:'delete',
          time:'2ms',
          status:'using',
          createTime:'2016/6/1 下午12：24',
          endTime:'2016/6/1 下午12：24',
          logs:'asdasdadadad',
        },{
          key:'3',
          name:'fuzhi-demo1',
          status:'finished',
          handle:'delete',
          time:'2ms',
          status:'using',
          createTime:'2016/6/1 下午12：24',
          endTime:'2016/6/1 下午12：24',
          logs:'asdasdadadad',
        },{
          key:'4',
          name:'fuzhi-demo1',
          status:'finished',
          handle:'delete',
          time:'2ms',
          status:'using',
          createTime:'2016/6/1 下午12：24',
          endTime:'2016/6/1 下午12：24',
          logs:'asdasdadadad',
        },{
          key:'5',
          name:'fuzhi-demo1',
          status:'finished',
          handle:'delete',
          time:'2ms',
          status:'using',
          createTime:'2016/6/1 下午12：24',
          endTime:'2016/6/1 下午12：24',
          logs:'asdasdadadad',
        },
      ],
      addRulesVisible: false,
      testLink: false,
      testLinkResult: false,
      eidtTargetStore: false,
      SwitchRulesVisible: false,
      switchTitle: '停用',
      currentKey: 0,
      editDisabled: false,
      logsVisible: false,
      expand: false,
    }
  }

  componentDidMount() {
    //bind 'esc' key down
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.addEventListener('keyup',handler )
  }

  componentWillUnmount() {
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.removeEventListener('keyup', handler)
  }

  handleEditTargetStore(){
	  this.setState({
      eidtTargetStore: true,
	  })
  }

  handleDelteTargetStore(){
    console.log('delete')
  }

  handleInputValue(e){
    this.setState({
      inputValue: e.target.value
    })
  }

  handleSearchRules(){
	  const { inputValue } = this.state
    const { rulesData } = this.state
    console.log(inputValue)
    let newRulesData  = []
    rulesData.map((item, index) => {
	    if(item.name.indexOf(inputValue) > -1){
        newRulesData.push(item)
      }
    })
    this.setState({
      rulesData: newRulesData
    })
  }

  handleAddRules(){
    this.setState({
      addRulesVisible: true,
      editDisabled: false,
    })
  }

  handleCancelAddRules(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      addRulesVisible: false,
    })
  }

  handleComfirmAddRules(){
    const { form } = this.props
    form.validateFields((errors, values) => {
      console.log('values=',values)
    })
  }

  handelTestStoreLink(){
    this.setState({
      testLink: true,
      testLinkResult: false,
    })
  }

  handlTestLinkResult(){
    const { testLinkResult } = this.state
    if(testLinkResult){
      return <div className='success'><Icon type="check-circle-o icon" />测试连接成功</div>
    }
    return <div className='failed'><Icon type="cross-circle-o icon" />测试连接失败</div>
    return <Spin />
  }

  handleModalFooterDomNodes(){
    const { testLink } = this.state
    return <div>
      <Button  type="primary" className='test' size="large" onClick={this.handelTestStoreLink}>测试仓库连接</Button>
      {
        testLink
        ? <div className='wrap'>{this.handlTestLinkResult()}</div>
        : <span></span>
      }
      <Button size="large" onClick={this.handleCancelAddRules}>取消</Button>
      <Button type="primary" size="large" onClick={this.handleComfirmAddRules}>确定</Button>
    </div>
  }

  handleSelectOption(){
    let arr = []
    for(let i = 0; i < 10; i++){
      arr.push('value' + i)
    }
    let options = arr.map((item, index) => {
      return <Select.Option key={item} value={item}>{item}</Select.Option>
    })
    return options
  }

  checkRulesNameProps(rule, value, callback){
    if(!value){
      return callback('请输入规则名称')
    }
    callback()
  }

  checkNewTargetstoreNameProps(rule, value, callback){
    if(!value){
      return callback('请输入新目标仓库名称')
    }
    callback()
  }

  checkURLAddressProps(rule, value, callback){
    if(!value){
      return callback('请输入URL地址')
    }
    callback()
  }

  checkuserNameProps(rule, value, callback){
    if(!value){
      return callback('请输入用户名')
    }
    callback()
  }

  checkpassWordProps(rule, value, callback){
    if(!value){
      return callback('请输入密码')
    }
    callback()
  }

  handleConfirmSwitchRules(){
    const { switchTitle, currentKey } = this.state
    this.setState({
      SwitchRulesVisible: false,
    })
    switch(switchTitle){
      case '停用':
        return console.log('停用' + currentKey)
      case '启用':
        return console.log('启用' + currentKey)
      case '删除':
        return console.log('删除' + currentKey)
      default:
        return
    }
  }

  handleRulesModalText(){
    const { switchTitle } = this.state
    let obj = {}
    switch(switchTitle){
      case '停用':
        return obj = {
          title: '停用规则',
          text: '停用规则后，所有未完成的同步任务将被终止和取消'
        }
      case '启用':
        return  obj = {
          title: '启用规则',
          text: '启用规则后，该项目下的所有镜像仓库将同步到目标实例。'
        }
      case '删除':
        return  obj = {
          title: '删除规则',
          text: '删除规则后，将无法继续同步任务。'
        }
      default:
        return obj = {}
    }
  }

  handleDropDownMenu(key, item){
    this.setState({
      currentKey: key,
    })
    switch(item.key){
      case 'stop':
        return this.setState({
          switchTitle: '停用',
          SwitchRulesVisible: true,
        })
      case 'delete':
        return this.setState({
          switchTitle: '删除',
          SwitchRulesVisible: true,
        })
      case 'start':
        return this.setState({
          switchTitle: '启用',
          SwitchRulesVisible: true,
        })
      default: return
    }
  }

  handleEditRule(key){
    const { form } = this.props
    const { rulesData } = this.state
    this.setState({
      addRulesVisible: true,
      currentKey: key,
      editDisabled: true,
    })
    form.setFieldsValue({
      rulesName: rulesData[key].name,
      description: rulesData[key].description,
      targetStoreType: "selectTargetStore",
      URLAddress: rulesData[key].targetName,
      userName: rulesData[key].name,
      passWord: rulesData[key].name,
      SelectTargetStore: 'value0'
    })
  }

  render(){
    const { form } = this.props
    const { rulesData, taskUpdataData } = this.state
    const { getFieldProps, getFieldValue } = form
    const scope = this
    function formatstatus(status){
      switch(status){
        case 'using':
          return <span className='using'><i className="fa fa-circle marginR" aria-hidden="true"></i>启用</span>
        case 'stop':
          return <span className='stop'><i className="fa fa-circle marginR" aria-hidden="true"></i>停止</span>
        default:
          return <span className='default'><i className="fa fa-circle marginR" aria-hidden="true"></i>异常</span>
      }
    }

    const menu = rulesData.map((item, index) => {
      return <Menu onClick={this.handleDropDownMenu.bind(this,index)}>
        {
          item.status == 'using'
          ? <Menu.Item key="stop"><i className="fa fa-stop" aria-hidden="true" style={{ marginRight: '5px'}}></i>停用</Menu.Item>
          : <Menu.Item key="start"><i className="fa fa-play" aria-hidden="true" style={{ marginRight: '5px'}}></i>启用</Menu.Item>
        }
        <Menu.Item key="delete"><i className="fa fa-trash-o" aria-hidden="true" style={{ marginRight: '5px'}}></i>删除</Menu.Item>
      </Menu>
    })

    const rulesColumn = [
      {
        title:'名称',
        dataIndex:'name',
      },{
        title:'描述',
        dataIndex:'description',
      },{
        title:'目标名',
        dataIndex:'targetName',
      },{
        title:'上次起始时间',
        dataIndex:'lastStartTime',
      },{
        title:'活动状态',
        dataIndex:'status',
        render: (status) => <div>{formatstatus(status)}</div>
      },{
        title:'操作',
        dataIndex:'key',
        render: (key) => <div>
          <Dropdown.Button onClick={this.handleEditRule.bind(this, key)} overlay={menu[key-1]} size="large">
            <i className="fa fa-pencil-square-o handleicon"></i>修改
          </Dropdown.Button>
        </div>
      }
    ]

    const updataTaskColumn = [
      {
        title:'名称',
        dataIndex:'name',
      },
      {
        title:'状态',
        dataIndex:'status',
      },
      {
        title:'操作',
        dataIndex:'handle',
      },
      {
        title:'耗时',
        dataIndex:'time',
      },
      {
        title:'创建时间',
        dataIndex:'createTime',
      },
      {
        title:'结束时间',
        dataIndex:'endTime',
      },
      {
        title:'日志',
        dataIndex:'logs',
        render: () => <div><Icon type="file-text icon" onClick={() => this.setState({logsVisible: true})}/></div>
      }
    ]

    const rulesNameProps = getFieldProps('rulesName',{
      rules: [
        {validator: this.checkRulesNameProps}
      ]
    })

    const descriptionProps = getFieldProps('description',{
      rules: [
        {required: false},
      ]
    })

    const targetStoreTypeProps = getFieldProps('targetStoreType',{
      initialValue: 'createNewstore'
    })

    const URLAddressProps = getFieldProps('URLAddress',{
      rules: [
        {validator: this.checkURLAddressProps},
      ]
    })

    const userNameProps = getFieldProps('userName',{
      rules: [
        {validator: this.checkuserNameProps},
      ]
    })

    const passWordProps = getFieldProps('passWord',{
      rules: [
        {validator: this.checkpassWordProps},
      ]
    })

    const startUseProps = getFieldProps('startUse',{
      valuePropName:'checked',
      initialValue: false
    })

    const NewTargetstoreNameProps = getFieldProps('NewTargetstoreName',{
      rules: [
        {validator: this.checkNewTargetstoreNameProps},
      ]
    })

    const SelcetTargetStoreProps = getFieldProps('SelectTargetStore',{
      rules: [
        {required: require, message: '请选择一个目标仓库'},
      ]
    })

    let targetstoretype = getFieldValue('targetStoreType')

    return(
      <div id='imageUpdata'>
        <div className='rules'>
          <div className='header'>
            <Button type="primary" size='large' icon="plus" className='buttonadd' onClick={this.handleAddRules}>添加规则</Button>
            <span className='searchBox'>
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>
            <span className='totleNum'>共计：{rulesData.length} 条</span>
          </div>
          <div className="body">
            <Table
              columns={rulesColumn}
              dataSource={rulesData}
              pagination={{ simple: true }}
            >
            </Table>
          </div>
        </div>
        <div className='updataTask'>
          <div className='title'>同步任务</div>
          <div className="header">
            <span className="searchBox">
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>
            <span className='totleNum'>共计：{rulesData.length} 条</span>
          </div>
          <div className="body">
            <Table
              columns={updataTaskColumn}
              dataSource={taskUpdataData}
              pagination={{ simple: true }}
            >
            </Table>
          </div>
        </div>

        <Modal
          title={this.state.editDisabled ? '修改规则' : '新建规则'}
          visible={this.state.addRulesVisible}
          closable={true}
          width='570px'
          onCancel={this.handleCancelAddRules}
          maskClosable={false}
          wrapClassName="imageUpdataAddRules"
          footer={this.handleModalFooterDomNodes()}
        >
          <Form>
            <Row className='rulesName standard'>
              <Col span="4" className='title'>规则名称</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...rulesNameProps}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='description'>
              <Col span="4" className='title'>描述</Col>
              <Col span="20" className='valueheight'>
                <Form.Item className='value'>
                  <Input size="large" {...descriptionProps} className='textareaStyle' type="textarea"/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='radioBox'>
              <Col span="4"></Col>
              <Col span="20">
                <Form.Item>
                  <Radio.Group {...targetStoreTypeProps}>
                    <Radio value="createNewstore" key="createNewstore">新建目标仓库</Radio>
                    <Radio value="selectTargetStore" key="selectTargetStore">选择已有目标仓库</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row className='targetStore standard'>
              <Col span="4" className='title'>目标仓库<span className='star'>*</span></Col>
              <Col span="20" style={{height:'56px'}}>
                {
                  targetstoretype == 'createNewstore'
                  ? <Form.Item className='value'>
                     <Input {...NewTargetstoreNameProps}/>
                  </Form.Item>
                  : <Form.Item className='value' style={{paddingTop:'0'}}>
                      <Select
                        showSearch
                        {...SelcetTargetStoreProps}
                        placeholder="选择目标仓库"
                        className='widthbox'
                        size='large'
                        style={{width:'320px'}}
                      >
                        {this.handleSelectOption()}
                      </Select>
                  </Form.Item>
                }
              </Col>
            </Row>
            <Row className='URLAddress standard'>
              <Col span="4" className='title'>URL 地址<span className='star'>*</span></Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...URLAddressProps} disabled={this.state.editDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='userName standard'>
              <Col span="4" className='title'>用户名</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...userNameProps} disabled={this.state.editDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='passWord standard'>
              <Col span="4" className='title'>密码</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...passWordProps} disabled={this.state.editDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='using'>
              <Col span="4"></Col>
              <Col span="20">
                <Form.Item>
                  <Checkbox {...startUseProps}>创建完成后，立即启用</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title={this.handleRulesModalText().title}
          visible={this.state.SwitchRulesVisible}
          closable={true}
          onOk={this.handleConfirmSwitchRules}
          onCancel={() => this.setState({SwitchRulesVisible: false})}
          width='570px'
          maskClosable={false}
          wrapClassName="switchRulesModal"
        >
          <div>
            <div>{this.handleRulesModalText().text}</div>
            <div>请确认继续。</div>
          </div>
        </Modal>

         <Modal

           visible={this.state.logsVisible}
           closable={false}
           onOk={() => this.setState({logsVisible: false})}
           onCancel={() => this.setState({logsVisible: false})}
           maskClosable={false}
           footer={[]}
           width="570px"
           wrapClassName="taskUpdataLogsModal"
         >
           <LogsTemplate scope={scope}/>
         </Modal>
      </div>
    )
  }
}

ImageUpdate = Form.create()(ImageUpdate)

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(ImageUpdate)

