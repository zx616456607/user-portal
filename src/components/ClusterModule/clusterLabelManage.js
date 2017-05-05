/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Label Manage component
 *
 * v0.1 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Button, Icon, Input, Table, Modal, Form } from 'antd'
import './style/clusterLabelManege.less'
import { getClusterLabel, addLabels, editLabels } from '../../actions/cluster_node'
import { connect } from 'react-redux'
import { calcuDate } from '../../common/tools'
import cloneDeep from 'lodash/cloneDeep'
import NotificationHandler from '../../common/notification_handler'

const FormItem = Form.Item
let uuid = 0

class ClusterLabelManage extends Component{
  constructor(props){
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.handleEditCancelModal = this.handleEditCancelModal.bind(this)
    this.handleEditOkModal = this.handleEditOkModal.bind(this)
    this.handleEditButton = this.handleEditButton.bind(this)
    this.handleDeleteButton = this.handleDeleteButton.bind(this)
    this.handleDelteOkModal = this.handleDelteOkModal.bind(this)
    this.handleDelteCancelModal = this.handleDelteCancelModal.bind(this)
    this.state = {
      editVisible : false,
      deleteVisible : false,
      targets:[],
      labeldataArray: []
    }
  }
  loadData(that) {
    const _this = this
    const { clusterID } = that.props
    that.props.getClusterLabel(clusterID, {
      success:{
        func:(res)=> {
          _this.setState({labeldataArray: res.summary})
        }
      }
    })
  }
  componentWillMount(){
    this.loadData(this)
  }

  handleSearchInput(){
    console.log('按下回车键搜索')
  }

  handleEditCancelModal(){
    this.setState({
      editVisible : false,
      targets:[]
    })
    setTimeout(()=> {
      this.props.form.resetFields()
    },500)
  }

  handleEditButton(id){
    let targets=[]
    this.props.result.forEach((item) => {
      if (item.id && item.id == id) {
        targets.push(item)
      }
    })
    this.setState({
      editVisible : true,
      create:false,
      targets
    })
  }

  handleDeleteButton(index){
    this.setState({
      deleteVisible : true,
      deleteLabelNum : index
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
    const labeldataArray = cloneDeep(this.state.labeldataArray)
    const notificat = new NotificationHandler()
    const _this = this
    this.props.editLabels(deleteLabelNum,'DELETE',{
      success:{
        func: () => {
          this.state.labeldataArray.forEach((list,index)=> {
            if (list.id == deleteLabelNum) {
              labeldataArray.splice(index,1)
            }
          })
          notificat.success('删除标签成功！')
          _this.setState({labeldataArray})
        }
      },
      failed: {
        func: (ret) => {
          notificat.error('删除标签失败！',ret.message.message || ret.message)
        }
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
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      uuid++
      let keys = form.getFieldValue('keys')
      keys = keys.concat(uuid)
      form.setFieldsValue({
        keys
      });

    });
  }
   handleEditOkModal(){
    //  e.preventDefault();
    const { addLabels } = this.props
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      // @todo
      console.log(values);
      const labels =[]
      values.keys.map((item)=> {
        labels.push({
          key: values[`key${item}`],
          value: values[`value${item}`]
        })
      })
      console.log('label',labels)
      addLabels(labels,{
        success:{
          func:()=> {
            console.log('success')
          }
        }
      })
    });
    // this.setState({
    //   editVisible : false,
    // })
  }
  render(){
    const { form, isFetching } = this.props
    const { getFieldProps, getFieldValue } = form
    const result = this.state.labeldataArray
    const labelcolumns = [
      {
        title:'标签键',
        key:'keys',
        dataIndex:'key',
        width:'19%',
      },{
        title:'属性',
        key:'2',
        dataIndex:'attribute',
        width:'16%',
        render : (text,row) => {
          if (row.createAt) {
            return (
              <div>自定义</div>
            )
          }
          return (
            <div>系统创建</div>
          )
        }
      },{
        title:'标签值',
        key:'value',
        dataIndex:'value',
        width:'15%'
      },{
        title:'绑定实例',
        key:'targets',
        dataIndex:'targets',
        width:'15%',
        render : (text) => <div className='binditem'>
          {text.length}
          <span className='itemspan'>个</span>
          </div>
      },{
        title:'创建时间',
        key:'createAt',
        dataIndex:'createAt',
        width:'19%',
        sorter: true,
        render : (text)=>{
          if (text) {
            return (
              <div>{calcuDate(text)}</div>
            )
          }
          return '--'
        }
      },{
        title:'操作',
        key:'actions',
        dataIndex:'handle',
        width:'16%',
        className:'handle',
        render : (text,row) => <div>
          {
            row.createAt
            ?<span>
              <Button type="primary"　className='editbutton' onClick={() => this.handleEditButton(row.id)}>修改</Button>
              <Button className='deletebutton' onClick={() => this.handleDeleteButton(row.id)}>删除</Button>
            </span>
            :<span className='systemmessage'>
              <Icon type="info-circle-o" className='handleicon'/>
              该标签为系统创建，不可操作
            </span>
          }
        </div>
      }
    ]
    getFieldProps('keys', {
      initialValue: [0],
    });
    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div className="formRow">
          <div className="formlabelkey">
            <FormItem key={k}>
              <Input {...getFieldProps(`key${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请填写标签键',
                }],
              })} placeholder="请填写标签键" style={{ width: '90%', marginRight: 8 }}
              />
            </FormItem>
          </div>
          <div className="formlabelvalue">
            <FormItem key={k}>
              <Input {...getFieldProps(`value${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请填写标签值',
                }],
              })} placeholder="请填写标签值" style={{ width: '90%', marginRight: 8 }}
              />
            </FormItem>
          </div>
          <Button icon="delete" style={{float:'left'}} size="large" onClick={() => this.removeRow(k)}></Button>
        </div>
      );
    });
    const editFormItem = this.state.targets.map((k)=> {
      return (
        <div className="formRow">
          <div className="formlabelkey">
            <FormItem key={k}>
              <Input {...getFieldProps(`key${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请填写标签名',
                }],
                initialValue: k.key
              })} style={{ width: '90%', marginRight: 8 }}
              />
            </FormItem>
          </div>
          <div className="formlabelvalue">
            <FormItem key={k}>
              <Input {...getFieldProps(`value${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请填写标签值',
                }],
                initialValue: k.value
              })} style={{ width: '90%', marginRight: 8 }}
              />
            </FormItem>
          </div>
        </div>
      );
    })
    return <div id="cluster__labelmanage">
      <div className='labelmanage__title'>
        <Button icon="plus" type="primary" onClick={()=> this.setState({editVisible: true,create: true})} size="large" className='titlebutton'>创建标签</Button>
        <Button type="primary" size="large" onClick={()=> this.loadData(this)} className='titlebutton'><i className='fa fa-refresh' /> 刷新</Button>
        <span className='titlesearch'>
          <Input
            placeholder="情输入标签键或标签值搜索"
            size="large"
            className='titleInput'
            onPressEnter={this.handleSearchInput}
          />
          <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
        </span>
        <span className='titlenum'>共计 <span>{result.length}</span> 条</span>
      </div>
      <Table
        rowKey={record => record.key+record.value}
        className="labelmanage__content"
        columns={labelcolumns}
        dataSource={ result }
        pagination={{simple:true}}
        loading={isFetching}
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
          { this.state.create ?
            formItems
            :
            editFormItem
          }

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
        <Icon type="info-circle-o" style={{marginRight:'3px'}}/>
        确定要删除当前标签吗？
      </Modal>
    </div>
  }
}

ClusterLabelManage = Form.create()(ClusterLabelManage)

function mapStateToProps(state,props) {
  const { clusterLabel } = state.cluster_nodes || {}
  let { isFetching, result } = clusterLabel
  if (!isFetching) {
    isFetching = false
  }
  if (!result) {
    result = {summary:[]}
  }
  return {
    isFetching,
    result:result.summary
  }
}

export default connect(mapStateToProps, {
  getClusterLabel,
  addLabels,
  editLabels
})(ClusterLabelManage)