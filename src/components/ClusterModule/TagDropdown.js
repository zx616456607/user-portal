/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Tag Dropdown component
 *
 * v0.1 - 2017-5-5
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Tooltip, Button, Modal, Form, Input, Tag } from 'antd'
import './style/TagDropdown.less'
import cloneDeep from 'lodash/cloneDeep'

const SubMenu = Menu.SubMenu;

class TagDropdown extends Component {
  constructor(props) {
    super(props)
    this.formtag = this.formtag.bind(this)
    this.handleDropdownContext = this.handleDropdownContext.bind(this)
    this.handelfooter = this.handelfooter.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleLabelButton = this.handleLabelButton.bind(this)
    this.state = {
      DropdownVisible: this.props.visible,
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.DropdownVisible !== nextProps.visible){
      this.setState({
        DropdownVisible: nextProps.visible
      })
    }
  }

  formtag() {
    const { labels } = this.props
    if (!labels) {
      return
    }
    const newData = {}
    labels.forEach((label, index) => {
      if(newData[label.key]){
        newData[label.key].push(label)
      } else {
        newData[label.key] = [label]
      }
    })

    let arr = []
    for (let i in newData) {
      let item = {}
      item.key = i
      item.values = newData[i]
      arr.push(item)
    }
    if (arr.length == 0) {
      return <Menu.Item className='notag'>暂无标签</Menu.Item>
    }

    let tagvalue = arr.map((item, index) => {
      return item.values.map((itemson, indexson) => {
        return (<Menu.Item className='tagvaluewidth' key={itemson.value}>
          <Tooltip title={itemson.value} placement="topLeft">
            <div className='name'>{itemson.value}</div>
          </Tooltip>
          <div className='num'>(<span>{item.values.length}</span>)</div>
          <div className='select'><Icon type="check-circle-o" /></div>
        </Menu.Item>)
      })
    })

    let result = arr.map((item, index) => {
      return <SubMenu title={item.key} className='tagkeywidth' key={item.key}>
        <Menu.Item className='selectMenutitle' key="tagvalue">
          标签值
        </Menu.Item>
        {tagvalue[index]}
      </SubMenu>
    })
    return (
      <Menu>
        <Menu.Item className='selectMenutitle' key="labelkey">
          标签键 <Icon type="cross" style={{marginLeft:'80px'}}/>
        </Menu.Item>
        <Menu.Divider key="baseline1" />
        {result}
      </Menu>
    )
  }

  handleDropdownContext() {
    const { context } = this.props
    switch (context) {
      case 'Modal':
        return <span>
          选择已有节点
          <Icon type="down" style={{ marginLeft: '5px' }} />
        </span>
      case 'hostlist':
      case 'app':
        return <span>
          <i className="fa fa-tag selectlabeltag" aria-hidden="true"></i>
          标签
          <Icon type="down" style={{ marginLeft: '12px' }} />
        </span>
      default:
        return <span>请输入要显示的文字</span>
    }
  }

  handelfooter() {
    const { footer } = this.props
    return <Menu id='cluster__TagDropDown__Component' onClick={this.handleMenuClick}>
      {this.formtag()}
      {
        footer
          ? [<Menu.Divider key="baseline2" />,
          <Menu.Item key="createtag">
            <Icon type="plus" style={{ marginRight: 6 }} />
            创建标签
          </Menu.Item>,
          <Menu.Item key="managetag">
            <span>
            <Icon type="setting" style={{marginRight:6}}/>
            标签管理
          </span>
          </Menu.Item>]
          : <Menu.Item className='nofooter'></Menu.Item>
      }
      <Menu.Divider key="baseline3" />
    </Menu>
  }

  handleMenuClick(obj) {
    const { callbackManegeTag, callbackHostList, callbackManegeModal } = this.props
    callbackManegeTag(obj)
  }

  handleLabelButton() {
    this.setState({
      DropdownVisible: true
    })
  }

  render(){
    const { width } = this.props
    return (
      <div className='cluster__TagDropDown__Component'>
        <Dropdown overlay={this.handelfooter()} trigger={['click']} className='cluster__TagDropDown__Component' visible={this.state.DropdownVisible}>
          <Button type="ghost" size="large" style={{width:{width},padding:'4px 12px'}} onClick={this.handleLabelButton}>
            {this.handleDropdownContext()}
          </Button>
        </Dropdown>
      </div>
    )
  }
}

class ManageTagModal extends Component {
  constructor(props) {
    super(props)
    this.formManegeLabelContainerTag = this.formManegeLabelContainerTag.bind(this)
    this.handleAddLabel = this.handleAddLabel.bind(this)
    this.handlecallback = this.handlecallback.bind(this)
    this.handlecallbackHostList = this.handlecallbackHostList.bind(this)
    this.callbackManegeModal = this.callbackManegeModal.bind(this)
    this.handleCreateLabelModal = this.handleCreateLabelModal.bind(this)
    this.handleCancelLabelModal = this.handleCancelLabelModal.bind(this)
    this.handeldeleteNewLabel = this.handeldeleteNewLabel.bind(this)
    this.handleAddInput = this.handleAddInput.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.state = {
      createLabelModal: false,
      visible: false,
    }
  }

  handleCreateLabelModal() {
    this.setState({
      createLabelModal: false
    })
  }

  handleCancelLabelModal() {
    this.setState({
      createLabelModal: false
    })
  }

  formManegeLabelContainerTag() {
    //const { manageLabelContainer } = this.state
    //if(manageLabelContainer.length == 0){
    return <div>暂无标签</div>
    //}
  }

  formTagContainer() {
    let arr = []
    for (let i = 0; i < 30; i++) {
      arr.push(<Tag closable color="blue" className='tag' key={i}>
        <Tooltip title='key1'>
          <span className='key'>key1</span>
        </Tooltip>
        <span className='point'>:</span>
        <Tooltip title='value2017'>
          <span className='value'>value2017</span>
        </Tooltip>
      </Tag>)
    }
    return arr
  }


  handleAddLabel(key, value) {
    return <div>
      <Tag closable color="blue"><span>key</span><span>value</span></Tag>
    </div>
  }

  handlecallback(obj) {
    const {callbackHostList} = this.props
    switch(obj.key){
      case 'managetag' :
        callbackHostList(obj)
        this.setState({
          visible: false
        })
        return
      case 'createtag' :
        return this.setState({createLabelModal: true})
      case 'labelkey' :
        return this.setState({
          visible: false
        })
      default :
        return this.setState({
          visible: true
        })

    }
    //this.setState({
    //  manageLabelModal : obj.visible
    //})
  }

  handlecallbackHostList(obj) {
    const { callbackHostList } = this.props
    return callbackHostList(obj)
  }

  callbackManegeModal(obj) {
    console.log('Modal.obj=', obj)
  }

  handeldeleteNewLabel() {
    console.log('删除标签')
  }

  handleAddInput() {
    console.log('添加一组标签')
  }

  render() {
    return (
      <div id="cluster__ManageTagModal__Component">
        <TagDropdown labels={this.props.labels} footer={true} context={'hostlist'} callbackManegeTag={this.handlecallback} callbackHostList={this.handlecallbackHostList} width={'100px'} visible={this.state.visible}/>

        <Modal
          title="创建标签"
          visible={this.state.createLabelModal}
          onOk={this.handleCreateLabelModal}
          onCancel={this.handleCancelLabelModal}
          width="560px"
          wrapClassName="manageLabelModal"
          maskClosable={false}
        >
          <Form inline>
            <div className='title'>
              <span className='labelkey'>标签键</span>
              <span className='labelvalue'>标签值</span>
              <span className='handle'>操作</span>
            </div>
            <div className='body'>
              <Form.Item className='inputlabelkey'>
                <Input placeholder="请输入标签键" className='width' />
              </Form.Item>
              <Form.Item className='inputlabelvalue'>
                <Input placeholder="请输入标签值" className='width' />
              </Form.Item>
              <span className='inputhandle' onClick={this.handeldeleteNewLabel}>
                <Icon type="delete"></Icon>
              </span>
            </div>
            <div className='body'>
              <Form.Item className='inputlabelkey'>
                <Input placeholder="请输入标签键" className='width' />
              </Form.Item>
              <Form.Item className='inputlabelvalue'>
                <Input placeholder="请输入标签值" className='width' />
              </Form.Item>
              <span className='inputhandle' onClick={this.handeldeleteNewLabel}>
                <Icon type="delete"></Icon>
              </span>
            </div>
            <div className='footer' onClick={this.handleAddInput}>
              <Icon type="plus-circle-o" /> <span>添加一组标签</span>
            </div>

          </Form>
        </Modal>
      </div>
    )
  }
}

export default ManageTagModal;