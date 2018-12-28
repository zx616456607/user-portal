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
import NotificationHandler from '../../components/Notification'
import './style/TagDropdown.less'
import cloneDeep from 'lodash/cloneDeep'
import intlMsg from './hostListIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

const FormItem = Form.Item
const SubMenu = Menu.SubMenu;
let uuid=0

function range(begin, end) {
  const count = end - begin
  return Array.apply(null, Array(count)).map((_, index) => index + begin)
}

class TagDropdown extends Component {
  constructor(props) {
    super(props)
    this.formtag = this.formtag.bind(this)
    this.handleDropdownContext = this.handleDropdownContext.bind(this)
    this.handelfooter = this.handelfooter.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleLabelButton = this.handleLabelButton.bind(this)
    this.visibleChange = this.visibleChange.bind(this)
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
    const filterLabels = labels.filter(a => a.isUserDefined
      || (a.key === 'beta.kubernetes.io/arch' && a.value === 'arm64')
      || (a.key === 'beta.kubernetes.io/arch' && a.value === 'amd64')
      || a.key === 'beta.kubernetes.io/os')
    filterLabels.forEach(label => {
      if (newData[label.key]) {
        newData[label.key].push(label)
      } else {
        newData[label.key] = [ label ]
      }
    })
    const arr = []
    for (const i in newData) {
      const item = {}
      item.key = i
      item.values = newData[i]
      arr.push(item)
    }
    let result = []
    if (arr.length !== 0) {
      let tagvalue = arr.map((item, index) => {
        return item.values.map((itemson, indexson) => {
          return (<Menu.Item className='tagvaluewidth' key={itemson.value}>
            <Tooltip title={itemson.value} placement="topLeft">
              <div className='name'>{itemson.value}</div>
            </Tooltip>
            <div className='num'>(<Tooltip title={itemson.targets.join(", ")}><span>{itemson.targets.length}</span></Tooltip>)</div>
            <div className='select'><Icon type="check-circle-o" /></div>
          </Menu.Item>)
        })
      })

      result = arr.map((item, index) => {
        return <SubMenu title={item.key} className='tagkeywidth' key={item.key}>
          <Menu.Item className='selectMenutitle' key="tagvalue">
            <FormattedMessage {...intlMsg.labelValue}/>
          </Menu.Item>
          {tagvalue[index]}
        </SubMenu>
      })
      //neirong

    } else {
      result =  <Menu.Item className='notag'><FormattedMessage {...intlMsg.noLabel}/></Menu.Item>
    }

    return (
      <Menu>
        <Menu.Item className='selectMenutitle' key="labelKey">
          <FormattedMessage {...intlMsg.labelKey}/> <Icon type="cross" style={{marginLeft:'80px'}}/>
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
          <FormattedMessage {...intlMsg.selectHasNode}/>
          <Icon type="down" style={{ marginLeft: '5px' }} />
        </span>
      case 'hostlist':
      case 'app':
        return <span>
          <i className="fa fa-tag" aria-hidden="true"></i>&nbsp;
          <FormattedMessage {...intlMsg.label}/>
          <Icon type="down" style={{ marginLeft: '12px' }} />
        </span>
      default:
        return <span><FormattedMessage {...intlMsg.inputTextForShow}/></span>
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

  visibleChange(visible) {
    const { handleDropdownVisible } = this.props
    handleDropdownVisible('onVisibleChange')
    this.setState({
      DropdownVisible: visible,
    })
  }

  render(){
    const { width } = this.props
    return (
      <div className='cluster__TagDropDown__Component'>
        <Dropdown
          overlay={this.handelfooter()}
          trigger={['click']}
          className='cluster__TagDropDown__Component'
          visible={this.state.DropdownVisible}
          onVisibleChange={(visible) => this.visibleChange(visible)}>
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
    this.checkValue = this.checkValue.bind(this)
    this.handleDropdownVisible = this.handleDropdownVisible.bind(this)
    this.state = {
      createLabelModal: false,
      visible: false,
    }
  }

  handleCreateLabelModal() {
    const { form, addLabels,clusterID, getClusterLabel, intl: { formatMessage } } = this.props
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
          target:'node',
          clusterID,
        })
      })
      notificat.spin(formatMessage(intlMsg.adding))
      addLabels(labels,clusterID,{
        success: {
          func:(ret)=> {
            getClusterLabel(clusterID)
            notificat.close()
            notificat.success(formatMessage(intlMsg.addSuccess))
            this.setState({
              createLabelModal: false,
            })
          },
          isAsync: true
        },
        failed:{
          func:(ret)=> {
            notificat.close()
            notificat.error(formatMessage(intlMsg.addFail))
          }
        },
        finally: {
          func: () => uuid = 0
        }
      })
    })
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
          const multiMap = tag.reduce((mm, label) => {
            const key = label.key
            const value = label.value
            if (mm.hasOwnProperty(key)) {
              mm[key].push(value)
            } else {
              mm[key] = [value]
            }
            return mm
          }, {})
          scope.props.nodes.nodes.map((node) => {
            let labels = node.objectMeta.labels
            if (Object.getOwnPropertyNames(multiMap).every(key => multiMap[key].indexOf(labels[key]) !== -1)) {
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
        //  ('href....',this.props.scope)
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
    const { callbackHostList } = this.props
    if(obj == 'onVisibleChange'){
      this.setState({
        visible: false
      })
      return
    }
    switch(obj.key){
      case 'manageTag':
        this.setState({
          visible: false
        })
        callbackHostList(obj)
        return
      case 'createTag':
        this.props.form.resetFields()
        this.setState({
          createLabelModal: true,
          visible: false,
        })
        return
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
      ++uuid
      let keys = form.getFieldValue('keys');
      keys = keys.concat(uuid)
      form.setFieldsValue({
        keys
      });

    });
  }
  checkKey(rule, value, callback, formatMessage) {
    if (!Boolean(value)){
      callback(new Error(formatMessage(intlMsg.plsInputLabelKey)))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 63) {
      callback(new Error(formatMessage(intlMsg.keyLength364)))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error(formatMessage(intlMsg.keyAlphaNumStart)))
      return
    }
    callback()
  }
  checkValue(rule, value, callback, formatMessage) {
    if (!Boolean(value)){
      callback(new Error(formatMessage(intlMsg.plsInputLabelValue)))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 63) {
      callback(new Error(formatMessage(intlMsg.valueLength364)))
      return
    }
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error(formatMessage(intlMsg.valueAlphaNumbStart)))
      return
    }
    const { form, labels } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (range(0, uuid).filter(
        id => form.getFieldValue(`key${id}`) === key
        && form.getFieldValue(`value${id}`) === value).length > 0) {
      callback(new Error(formatMessage(intlMsg.labelHasRepeat)))
    }
    if (labels.filter(label =>  label.key === key && label.value === value).length > 0) {
      callback(new Error(formatMessage(intlMsg.labelHasExist)))
      return
    }
    callback()
  }
  render() {
    const { getFieldProps, getFieldValue } = this.props.form
    const { intl: { formatMessage } } = this.props
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
                    validator: (rule, value, callback) => this.checkKey(rule, value, callback, formatMessage)
                  }],
                })} placeholder={formatMessage(intlMsg.plsWriteLabelKey)}
                />
              </FormItem>
              <FormItem className='inputlabelvalue'>
                <Input className="width" {...getFieldProps(`value${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: (rule, value, callback) => this.checkValue(rule, value, callback, formatMessage)
                  }],
                })} placeholder={formatMessage(intlMsg.plsWriteLabelValue)}
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
        <TagDropdown
          labels={this.props.labels}
          footer={this.props.footer}
          context={'hostlist'}
          callbackManegeTag={this.handlecallback}
          callbackHostList={this.handlecallbackHostList}
          handleDropdownVisible={this.handleDropdownVisible}
          width={'100px'}
          visible={this.state.visible}
        />

        <Modal
          title={formatMessage(intlMsg.createLabel)}
          visible={this.state.createLabelModal}
          onOk={this.handleCreateLabelModal}
          onCancel={() => this.setState({createLabelModal: false})}
          width="560px"
          wrapClassName="manageLabelModal"
          maskClosable={false}
        >
          <div className='title'>
            <div className='labelkey'><FormattedMessage {...intlMsg.labelKey}/></div>
            <div className='labelvalue'><FormattedMessage {...intlMsg.labelValue}/></div>
            <div className='handle'><FormattedMessage {...intlMsg.operation}/></div>
          </div>
          <Form inline>
            <div className='body'>
              { formItems }
            </div>
            <div style={{clear:'both'}}>
              <span className="cursor" onClick={()=> this.addRow()}><Icon type="plus-circle-o" /> <FormattedMessage {...intlMsg.addAGroupLabel}/></span>
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
})(injectIntl(ManageTagModal, {
  withRef: true,
}))
