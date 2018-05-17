/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * server tag component
 *
 * v0.1 - 2018-04-10
 * @author Lvjunfeng
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Icon, Table, Button, Input, Modal, Select,  Form, Menu, Pagination, Tooltip } from 'antd'
import './style/AppServerTag.less'
import NotificationHandler from '../../../components/Notification'
import { getClusterLabel, addLabels, editLabels, searchLabels, } from '../../../actions/cluster_node'
import {  getAllServiceTag, addServiceTag, delteServiceTag, updataServiceTag } from '../../../actions/cluster_node'
import cloneDeep from 'lodash/cloneDeep'
import { KubernetesValidator } from '../../../common/naming_validation'
import { calcuDate } from '../../../common/tools'
const FormItem = Form.Item
let uuid = 0

function range(begin, end) {
  const count = end - begin
  return Array.apply(null, Array(count)).map((_, index) => index + begin)
}

class AppServerTag extends Component{
  constructor(props){
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.handleEditCancelModal = this.handleEditCancelModal.bind(this)
    this.handleEditOkModal = this.handleEditOkModal.bind(this)
    this.handleEditButton = this.handleEditButton.bind(this)
    this.handleDeleteButton = this.handleDeleteButton.bind(this)
    this.handleDelteOkModal = this.handleDelteOkModal.bind(this)
    this.handleDelteCancelModal = this.handleDelteCancelModal.bind(this)
    this.checkKey = this.checkKey.bind(this)
    this.checkValue = this.checkValue.bind(this)
    this.state = {
      editVisible : false,
      deleteVisible : false,
      targets:{},
      tagList: []
    }
  }
  componentDidMount() {
    const { clusterID, getAllServiceTag } = this.props
    getAllServiceTag(clusterID)
  }

  handleSearchInput(){
    const { clusterID } = this.props
    const searchItem = this.refs.titleInput.refs.input.value.trim()
    this.props.searchLabels(searchItem,clusterID)
  }

  handleEditCancelModal(){
    this.setState({
      editVisible : false,
      targets:{}
    })
    setTimeout(()=> {
      this.props.form.resetFields()
      uuid = 0
    },500)
  }

  handleEditButton(row){
    this.setState({
      editVisible: true,
      create: false,
      targets: row
    })
  }

  handleDeleteButton(row){
    this.setState({
      deleteVisible : true,
      deleteLabelNum : row.id
    })
  }

  handleDelteCancelModal(){
    this.setState({
      deleteVisible : false,
      deleteLabelNum : '',
    })
  }

  handleDelteOkModal(){
    const { deleteLabelNum } = this.state
    const { result, clusterID, serviceName, delteServiceTag } = this.props
    const notificat = new NotificationHandler()
    result.map((item,index)=>{
      if( item.id === deleteLabelNum ) {
        notificat.spin('删除中')
        delteServiceTag(item.key ,clusterID, serviceName, {
          success: {
            func: () => {
              notificat.close()
              notificat.success('删除标签成功！')
              this.props.loadDataAllData()
            },
            isAsync: true
          },
          failed: {
              func: (ret) => {
                notificat.close()
                notificat.error('删除标签失败！',ret.message.message || ret.message)
              }
            }
        })
      }
    })

    this.setState({
      deleteVisible : false,
    })
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
      let keys = form.getFieldValue('keys')
      keys = keys.concat(uuid)
      form.setFieldsValue({
        keys
      });
      setTimeout(()=> {
        document.getElementById(`key${uuid}`).focus()
      },200)
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
    const { form, result } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (result.filter(label =>  label.key === key).length > 0) {
      callback(new Error('标签键已经存在'))
      return
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
    const { form, result } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (range(0, uuid).filter(
      id => form.getFieldValue(`key${id}`) === key
        && form.getFieldValue(`value${id}`) === value).length > 0) {
      callback(new Error('标签已重复添加'))
    }
    if (result.filter(label =>  label.key === key && label.value === value).length > 0) {
      callback(new Error('标签已经存在'))
      return
    }
    callback()
  }
  handleEditOkModal(){
    const { addLabels, editLabels, clusterID, form,serviceName, addServiceTag, getAllServiceTag, updataServiceTag } = this.props
    const _this = this
    const notificat = new NotificationHandler()
    if (this.state.create) {
      form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        let labels = {}
        this.handleEditCancelModal()
        values.keys.map((item)=> {
          labels[values[`key${item}`]] = values[`value${item}`]
        })
        addServiceTag(labels,clusterID,serviceName,{
          success: {
            func:(ret)=>{
              notificat.close()
              notificat.success('添加成功！')
              this.props.loadDataAllData()
            },
            isAsync:true
          },
          failed:{
            func:(ret)=> {
              notificat.close()
              notificat.error('添加失败！')
            }
          }
        })
      })
    } else {
      const { targets } = this.state
      form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        const labels = {
          key: values.key0,
          value: values.value0
        }
        if (targets.key == labels.key && targets.value == labels.value) {
          notificat.info('未作更改，无需更新！')
          uuid = 0
          return
        }
        let body = {
          [labels.key]:labels.value
        }
        body = JSON.stringify(body)
        this.handleEditCancelModal()
        notificat.spin('修改中...')
        updataServiceTag( body, clusterID, serviceName, {
          success: {
            func: ()=> {
              notificat.close()
              notificat.success('修改成功！')
              this.props.loadDataAllData()
            },
            isAsync: true
          },
          failed: {
            func:()=> {
              notificat.close()
              notificat.error('修改失败！')
            }
          },
          finally: {
            func:()=> uuid = 0
          }
        })
      });
    }
  }
  createModal() {
    this.setState({editVisible: true,create: true})
    setTimeout(()=> {
      document.getElementById('key0').focus()
    },300)
  }
  render(){
    const { form,  result } = this.props   //isFetching
    const { getFieldProps, getFieldValue } = form
    const { targets } = this.state
    const labelcolumns = [
      {
        title:'类型',
        key:'2',
        dataIndex:'attribute',
        width:'20%',
        render : (text,row) => {
          const reg = new RegExp(/^tenxcloud.com(.*)/g)
          const regS = new RegExp(/^system(.*)/g)
          const regName = new RegExp(/^name(.*)/g)
          if (reg.test(row.key) || regS.test(row.key) ||regName.test(row.key)) {
            return (
              <div>系统创建</div>
            )
          }
          return (
            <div>自定义</div>
          )
        }
      },
      {
        title:'键',
        key:'keys',
        dataIndex:'key',
        width:'30%',
        sorter: (a, b) => a.key.localeCompare(b.key),
        // render: text => <Tooltip title={text}><div className="textoverflow" style={{ width: '99%'}}>{text}</div></Tooltip>
      },{
        title:'值',
        key:'value',
        dataIndex:'value',
        width:'20%',
        sorter: (a, b) => a.value.localeCompare(b.value)
      },{
        title:'操作',
        key:'actions',
        dataIndex:'handle',
        width:'30%',
        className:'handle',
        render : (text,row) => {
          const reg = new RegExp(/^tenxcloud.com(.*)/g)
          const regS = new RegExp(/^system(.*)/g)
          const regName = new RegExp(/^name(.*)/g)
          if ( !reg.test(row.key) && !regS.test(row.key) && !regName.test(row.key) ) {
            return (<div>
              <Button type="primary"　className='editbutton' onClick={() => this.handleEditButton(row)}>修改</Button>
              <Button className='deletebutton' onClick={() => this.handleDeleteButton(row)}>删除</Button>
            </div>)
          }
          return (
            <span className='systemmessage'>
              <Icon type="info-circle-o" className='handleicon'/>
              系统创建，不可操作
            </span>
          )
        }

      }
    ]
    getFieldProps('keys', {
      initialValue: [0],
    });
    const formItems = getFieldValue('keys').map((k) => {
        return (
          <div className="formRow" key={`create-${k}`}>
            <div className="formlabelkey">
              <FormItem key={k}>
                <Input
                  disabled={ targets.key ? true: false}
                 {...getFieldProps(`key${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkKey
                  }],
                  initialValue: targets.key ? targets.key : undefined
                })} placeholder="请填写标签键"
                />
              </FormItem>
            </div>
            <div className="formlabelvalue">
              <FormItem key={k}>
                <Input {...getFieldProps(`value${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkValue
                  }],
                  initialValue: targets.value ? targets.value : undefined
                })} placeholder="请填写标签值"
                />
              </FormItem>
            </div>
            <Button icon="delete" className="foredelteicon" size="large" onClick={() => this.removeRow(k)}></Button>
          </div>
        );
    });

    return <div id="cluster__labelmanage">
      <div className='labelmanage__title'>
        <Button type="primary" onClick={()=> this.createModal()} size="large" className='titlebutton'>
          <Icon type="plus" />
          创建标签
        </Button>
        { result && result.length !== 0 && <span className='titlenum'>共计 <span>{result ? result.length:0}</span> 条</span>}
      </div>
      <Table
        rowKey={record => 'row-'+ record.key + record.value}
        className="labelmanage__content"
        columns={labelcolumns}
        dataSource={ result }
        pagination={{simple:true}}
        // loading={isFetching}
      />
      <Modal
        title={this.state.create ? '创建标签':'修改标签'}
        visible={this.state.editVisible}
        onOk={this.handleEditOkModal}
        onCancel={this.handleEditCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
        >
        <Form className='labelManageForm'>
          <div className="formlabelkey">
            <div className='top'>标签键</div>
          </div>
          <div className="formlabelvalue">
            <div className='top'>标签值</div>
          </div>
          <div style={{clear:'both'}}></div>
          {/* create form  item or edit form item view */}
          {formItems}
        </Form>
        { this.state.create ?
          <div style={{clear:'both'}}>
            <span className="cursor" onClick={()=> this.addRow()}><Icon type="plus-circle-o" /> 添加一组标签</span>
          </div>
          :
          <div style={{clear:'both'}}></div>
        }
      </Modal>

      <Modal
        title="删除标签"
        visible={this.state.deleteVisible}
        onOk={this.handleDelteOkModal}
        onCancel={this.handleDelteCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
      >
        <div className="confirmText">
          <Icon type="info-circle-o" style={{marginRight:'3px'}}/>
          确定要删除当前标签吗？
        </div>
      </Modal>
    </div>
  }
}

AppServerTag = Form.create()(AppServerTag)

function mapStateToProps(state,props) {
  const { clusterLabel } = state.cluster_nodes || {}
  const cluster = props.clusterID
  const { serviceTag } = props
  const { tagList } = state
  let listData = []
  const tagKey = Object.keys(serviceTag) || []
  tagKey.map( (ele,index)=>{
    listData.push({
      key:ele,
      value: serviceTag[ele],
      id: index
    })
  })
  return {
   result: listData
  }


}

export default connect(mapStateToProps, {
  getAllServiceTag,
  addServiceTag,
  delteServiceTag,
  updataServiceTag
})(AppServerTag)