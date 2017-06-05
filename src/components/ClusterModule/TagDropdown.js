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
import { connect } from 'react-redux'
import { Menu, Dropdown, Icon, Tooltip, Button, Modal, Form, Input, Tag } from 'antd'
import { addLabels } from '../../actions/cluster_node'
import { KubernetesValidator } from '../../common/naming_validation'
import NotificationHandler from '../../common/notification_handler'
import './style/TagDropdown.less'
import cloneDeep from 'lodash/cloneDeep'
const FormItem = Form.Item
const SubMenu = Menu.SubMenu;
let uuid=0

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

  isNodeMatchLabels(node, multiMap) {
    const labelKeys = Object.getOwnPropertyNames(multiMap)
    for (let i = 0; i < labelKeys.length; i++) {
      const labelKey = labelKeys[i]
      if (!node.hasOwnProperty(labelKey)) {
        return false
      }
      const nodeValue = node[labelKey]
      const labelValues = multiMap[labelKey]
      if (labelValues.indexOf(nodeValue) === -1) {
        return false
      }
    }
    return true
  }

  labelsToMultiMap(labels) {
    const multiMap = {}
    labels.forEach(label => {
      const key = label.key
      const value = label.value
      if (multiMap.hasOwnProperty(key)) {
        multiMap[key].push(value)
      } else {
        multiMap[key] = [value]
      }
    })
    return multiMap
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
        <Menu.Item className='selectMenutitle' key="labelKey">
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
          <i className="fa fa-tag" aria-hidden="true"></i>&nbsp;
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
          <Menu.Item key="createTag">
            <Icon type="plus" style={{ marginRight: 6 }} />
            创建标签
          </Menu.Item>,
          <Menu.Item key="manageTag">
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
    const { callbackManegeTag } = this.props
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
    this.handlecallback = this.handlecallback.bind(this)
    this.handlecallbackHostList = this.handlecallbackHostList.bind(this)
    this.handleCreateLabelModal = this.handleCreateLabelModal.bind(this)
    this.handleCancelLabelModal = this.handleCancelLabelModal.bind(this)
    this.checkKey = this.checkKey.bind(this)
    this.handleDropdownVisible = this.handleDropdownVisible.bind(this)
    this.state = {
      createLabelModal: false,
      visible: false,
    }
  }

  handleCreateLabelModal() {
    const { form, addLabels,clusterID } = this.props
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      const notificat = new NotificationHandler()
      const labels =[]
      values.keys.map((item)=> {
        labels.push({
          key:values[`key${item}`],
          value:values[`value${item}`],
          target:'node'
        })
      })
      notificat.spin('添加中...')
      addLabels(labels,clusterID,{
        success: {
          func:(ret)=> {
            notificat.close()
            notificat.success('添加成功！')
          }
        },
        failed:{
          func:(ret)=> {
            notificat.close()
            notificat.error('添加失败！')
          }
        }
      })
    })
    setTimeout(()=> {
      this.setState({
        createLabelModal: false,
        visible: true
      })
    },500)
  }

  handleCancelLabelModal() {
    this.setState({
      createLabelModal: false,
      visible: true
    })
    this.props.form.resetFields()
  }

  handlecallback(obj) {
    //console.log('e',obj)

    // *bai this is action set nodelist and labels
    // isManage  (true) to manage labes
    const { callbackHostList, scope, labels, isManage } = this.props
    if (obj.key !== "labelKey" &&  obj.key !== 'manageTag' && obj.key !=='createTag') {
      if (!isManage) {
        const tag = cloneDeep(scope.state.summary)
        let isSet = false
        labels.map((item) => {
          if (item.key == obj.keyPath[1] && item.value ==  obj.keyPath[0]) {
            tag.map(list => {
              if (list.value == obj.key) {
              isSet = true
              }
            })
            tag.push(item)
          }
        })
        if (isSet) {
          return
        }
        if(scope.state.createApp){
          scope.handledDropDownSetvalues(tag)
          scope.setState({
            summary:tag,
          })
          this.handleDropdownVisible(obj)
          return
        }
        if(scope.props.nodes){
          let nodeList =[]
          scope.props.nodes.nodes.map((node) => {
            let labels = node.objectMeta.labels
            let isEqual = true
            tag.every(item => {
              if (!labels[item.key]) {
                isEqual = false
                return false
              }
              return true
            })
            if (isEqual) {
              nodeList.push(node)
            }

          });
          // nodeList = Array.from(new Set(nodeList))
          scope.setState({
            summary:tag,
            nodeList
          })
        }
      } else {
        //console.log('href....',this.props.scope)
        // ManagLabelModal.js in scope
        let userCreateLabel = cloneDeep(scope.state.userCreateLabel)
        userCreateLabel[obj.keyPath[1]] = obj.keyPath[0]

        scope.setState({
          userCreateLabel
        })

      }
    }

    this.handleDropdownVisible(obj)
    //this.setState({
    //  manageLabelModal : obj.visible
    //})
  }

  handleDropdownVisible(obj){
    switch(obj.key){
      case 'manageTag':
        callbackHostList(obj)
        this.setState({
          visible: false
        })
        return
      case 'createTag':
        return this.setState({createLabelModal: true})
      case 'labelKey':
        return this.setState({
          visible: false
        })
      default:
        return this.setState({
          visible: true
        })

    }
  }

  handlecallbackHostList(obj) {
    const { callbackHostList } = this.props
    return callbackHostList(obj)
  }

  removeRow(k) {
  const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
  }
  addRow() {
    const { form } = this.props;
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      uuid++
      let keys = form.getFieldValue('keys');
      keys = keys.concat(uuid)
      form.setFieldsValue({
        keys
      });

    });
  }
  checkKey(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签键'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可(_-)'))
      return
    }
    let isExtentd
    for (let item of this.props.labels) {
      if (item.key === value) {
        isExtentd = true
        break
      }
    }
    if (isExtentd) {
      return callback(new Error('标签键已存在'))
    }
    callback()
  }
  checkValue(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签值'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可(_-)'))
      return
    }
    callback()
  }
  render() {
    const { getFieldProps, getFieldValue } = this.props.form
    getFieldProps('keys', {
      initialValue: [0],
    });
    const formItems = getFieldValue('keys').map((k) => {
        return (
          <div className="formRow" key={`create-${k}`}>
              <FormItem className='inputlabelkey'>
                <Input className="width" {...getFieldProps(`key${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkKey
                  }],
                })} placeholder="请填写标签键"
                />
              </FormItem>
              <FormItem className='inputlabelvalue'>
                <Input className="width" {...getFieldProps(`value${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkValue
                  }],
                })} placeholder="请填写标签值"
                />
              </FormItem>
              <span className='inputhandle' onClick={() => this.removeRow(k)}>
                <Icon type="delete"></Icon>
              </span>
          </div>
        );
    });
    return (
      <div id="cluster__ManageTagModal__Component">
        <TagDropdown labels={this.props.labels} footer={this.props.footer} context={'hostlist'} callbackManegeTag={this.handlecallback} callbackHostList={this.handlecallbackHostList} width={'100px'} visible={this.state.visible}/>

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
              {/*<Form.Item className='inputlabelkey'>
                <Input placeholder="请输入标签键" className='width' />
              </Form.Item>
              <Form.Item className='inputlabelvalue'>
                <Input placeholder="请输入标签值" className='width' />
              </Form.Item>
              <span className='inputhandle' onClick={this.handeldeleteNewLabel}>
                <Icon type="delete"></Icon>
              </span>*/}
              { formItems }
            </div>
            <div style={{clear:'both'}}>
              <span className="cursor" onClick={()=> this.addRow()}><Icon type="plus-circle-o" /> 添加一组标签</span>
            </div>

          </Form>
        </Modal>
      </div>
    )
  }
}

ManageTagModal= Form.create()(ManageTagModal)

function mapStateToProps(state,props) {
  return {

  }
}

export default connect(mapStateToProps,{
  addLabels
})(ManageTagModal)