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
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

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
    const { formatMessage } = this.props.intl
    const notificat = new NotificationHandler()
    result.map((item,index)=>{
      if( item.id === deleteLabelNum ) {
        notificat.spin(formatMessage(AppServiceDetailIntl.deleting))
        delteServiceTag(item.key ,clusterID, serviceName, {
          success: {
            func: () => {
              notificat.close()
              notificat.success(formatMessage(AppServiceDetailIntl.deleteTagSuccess))
              this.props.loadDataAllData()
            },
            isAsync: true
          },
          failed: {
              func: (ret) => {
                notificat.close()
                notificat.error(formatMessage(AppServiceDetailIntl.deleteTagFailure),ret.message.message || ret.message)
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
    const { formatMessage } = this.props.intl
    if (!this.state.create) {
      callback()
    }
    if (!Boolean(value)){
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInputTagKey)))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 63) {
      callback(new Error(formatMessage(AppServiceDetailIntl.TagKeyLength)))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.TagKeyNameRule)))
      return
    }
    const { form, result } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (result.filter(label =>  label.key === key).length > 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.tagKeyExist)))
      return
    }
    callback()
  }
  checkValue(rule, value, callback) {
    const { formatMessage } = this.props.intl
    if (!Boolean(value)){
      callback(new Error(formatMessage(AppServiceDetailIntl.pleaseInputTagValue)))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 63) {
      callback(new Error(formatMessage(AppServiceDetailIntl.TagValueLength)))
      return
    }
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.TagKeyNameRule)))
      return
    }
    const { form, result } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (range(0, uuid).filter(
      id => form.getFieldValue(`key${id}`) === key
        && form.getFieldValue(`value${id}`) === value).length > 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.tagKeyAlreadyRepeatAdd)))
    }
    if (result.filter(label =>  label.key === key && label.value === value).length > 0) {
      callback(new Error(formatMessage(AppServiceDetailIntl.tagKeyAlreadyExist)))
      return
    }
    callback()
  }
  handleEditOkModal(){
    const { formatMessage } = this.props.intl
    const { addLabels, editLabels, clusterID, form,serviceName, addServiceTag, getAllServiceTag, updataServiceTag } = this.props
    const _this = this
    const notificat = new NotificationHandler()
    if (this.state.create) {
      form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        if (!values.keys.length) {
          notificat.close()
          return notificat.error(formatMessage(AppServiceDetailIntl.pleaseAddCorrectTag))
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
              notificat.success(formatMessage(AppServiceDetailIntl.addSuccess))
              this.props.loadDataAllData()
            },
            isAsync:true
          },
          failed:{
            func:(ret)=> {
              notificat.close()
              notificat.error(formatMessage(AppServiceDetailIntl.addFailure))
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
          notificat.info(formatMessage(AppServiceDetailIntl.noChangeNoUpdate))
          uuid = 0
          return
        }
        let body = {
          [labels.key]:labels.value
        }
        body = JSON.stringify(body)
        this.handleEditCancelModal()
        notificat.spin(formatMessage(AppServiceDetailIntl.changing))
        updataServiceTag( body, clusterID, serviceName, {
          success: {
            func: ()=> {
              notificat.close()
              notificat.success(formatMessage(AppServiceDetailIntl.changeSuccess))
              this.props.loadDataAllData()
            },
            isAsync: true
          },
          failed: {
            func:()=> {
              notificat.close()
              notificat.error(formatMessage(AppServiceDetailIntl.changeFailure))
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
    const { formatMessage } = this.props.intl
    const { targets } = this.state
    const labelcolumns = [
      {
        title:formatMessage(ServiceCommonIntl.type),
        key:'2',
        dataIndex:'attribute',
        width:'20%',
        render : (text,row) => {
          const reg = new RegExp(/^tenxcloud.com(.*)/g)
          const regS = new RegExp(/^system(.*)/g)
          const regName = new RegExp(/^name(.*)/g)
          if (reg.test(row.key) || regS.test(row.key) ||regName.test(row.key)) {
            return (
              <div>{formatMessage(AppServiceDetailIntl.systemCreate)}</div>
            )
          }
          return (
            <div>{formatMessage(AppServiceDetailIntl.custom)}</div>
          )
        }
      },
      {
        title: formatMessage(AppServiceDetailIntl.key),
        key:'keys',
        dataIndex:'key',
        width:'30%',
        sorter: (a, b) => a.key.localeCompare(b.key),
        // render: text => <Tooltip title={text}><div className="textoverflow" style={{ width: '99%'}}>{text}</div></Tooltip>
      },{
        title: formatMessage(AppServiceDetailIntl.value),
        key:'value',
        dataIndex:'value',
        width:'20%',
        sorter: (a, b) => a.value.localeCompare(b.value)
      },{
        title: formatMessage(ServiceCommonIntl.operation),
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
              <Button type="primary"　className='editbutton' onClick={() => this.handleEditButton(row)}>{formatMessage(AppServiceDetailIntl.change)}</Button>
              <Button className='deletebutton' onClick={() => this.handleDeleteButton(row)}>{formatMessage(ServiceCommonIntl.delete)}</Button>
            </div>)
          }
          return (
            <span className='systemmessage'>
              <Icon type="info-circle-o" className='handleicon'/>
              {formatMessage(AppServiceDetailIntl.systemCreatingNoOperation)}
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
                })} placeholder={formatMessage(AppServiceDetailIntl.pleaseInputTagKey)}
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
                })} placeholder={formatMessage(AppServiceDetailIntl.pleaseInputTagValue)}
                />
              </FormItem>
            </div>
            {
               this.state.create ?
               <Button icon="delete" className="foredelteicon" size="large" onClick={() => this.removeRow(k)}></Button>
               : null
            }
          </div>
        );
    });

    return <div id="cluster__labelmanage">
      <div className='labelmanage__title'>
        <Button type="primary" onClick={()=> this.createModal()} size="large" className='titlebutton'>
          <Icon type="plus" />
          {formatMessage(AppServiceDetailIntl.createTag)}
        </Button>
        { result && result.length !== 0 && <span className='titlenum'>{formatMessage(AppServiceDetailIntl.total)}<span>{result ? result.length:0}
        </span>{formatMessage(AppServiceDetailIntl.tiao)}</span>
      }
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
        title={this.state.create ?
          formatMessage(AppServiceDetailIntl.createTag)
          :
          formatMessage(AppServiceDetailIntl.changeTag)
        }
        visible={this.state.editVisible}
        onOk={this.handleEditOkModal}
        onCancel={this.handleEditCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
        >
        <Form className='labelManageForm'>
          <div className="formlabelkey">
            <div className='top'>{formatMessage(AppServiceDetailIntl.tagKey)}</div>
          </div>
          <div className="formlabelvalue">
            <div className='top'>{formatMessage(AppServiceDetailIntl.tagValue)}</div>
          </div>
          <div style={{clear:'both'}}></div>
          {/* create form  item or edit form item view */}
          {formItems}
        </Form>
        { this.state.create ?
          <div style={{clear:'both'}}>
            <span className="cursor" onClick={()=> this.addRow()}><Icon type="plus-circle-o" />{formatMessage(AppServiceDetailIntl.addAnGroupTag)}</span>
          </div>
          :
          <div style={{clear:'both'}}></div>
        }
      </Modal>

      <Modal
        title={formatMessage(AppServiceDetailIntl.deleteTag)}
        visible={this.state.deleteVisible}
        onOk={this.handleDelteOkModal}
        onCancel={this.handleDelteCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {formatMessage(AppServiceDetailIntl.makeSureCurrentTag)}
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
  const nameReg = /^tenxcloud.com\//
  tagKey.filter( (ele,index)=> !nameReg.test(ele)
    && listData.push({
        key:ele,
        value: serviceTag[ele],
        id: index
      })
  )
  return {
   result: listData
  }


}

export default injectIntl(connect(mapStateToProps, {
  getAllServiceTag,
  addServiceTag,
  delteServiceTag,
  updataServiceTag
})(AppServerTag), { withRef: true })