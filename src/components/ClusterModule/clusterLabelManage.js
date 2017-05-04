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

const FormItem = Form.Item

class ClusterLabelManage extends Component{
  constructor(props){
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.formlabeldata = this.formlabeldata.bind(this)
    this.handleEditCancelModal = this.handleEditCancelModal.bind(this)
    this.handleEditOkModal = this.handleEditOkModal.bind(this)
    this.handleEditButton = this.handleEditButton.bind(this)
    this.handleDeleteButton = this.handleDeleteButton.bind(this)
    this.handleDelteOkModal = this.handleDelteOkModal.bind(this)
    this.handleDelteCancelModal = this.handleDelteCancelModal.bind(this)
    this.state = {
      editVisible : false,
      labeldataArray : [],
      ModalLabelKey : '',
      ModalLabelValue : '',
      deleteVisible : false,
      deleteLabelNum : '',
    }
  }

  componentWillMount(){
    this.setState({
      labeldataArray : this.formlabeldata(),
    })
  }

  formlabeldata(){
    let index = 0
    let array = [{
      key:index,
      labelkey:'asda',
      attribute:'系统创建',
      labelvalue:'value',
      bind:'10',
      createtime:"1个月前",
      handle:{
        system:true,
        index:index
      }
    }]
    for(let i=0; i <5; i++){
      index ++
      let item = {
        key:index,
        labelkey:'asda',
        attribute:'自定义',
        labelvalue:'value',
        bind:'0',
        createtime:"1个月前",
        handle:{
          system:false,
          index:index
        }
      }
      array.push(item)
    }
    return array
  }

  handleSearchInput(){
    console.log('按下回车键搜索')
  }

  handleEditCancelModal(){
    this.setState({
      editVisible : false,
    })
  }

  handleEditOkModal(){
    this.setState({
      editVisible : false,
    })
  }

  handleEditButton(index){
    const { labeldataArray } = this.state
    this.setState({
      editVisible : true,
      ModalLabelKey : labeldataArray[index].labelkey,
      ModalLabelValue : labeldataArray[index].labelvalue
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
    const { labeldataArray ,deleteLabelNum } = this.state
    labeldataArray.splice(deleteLabelNum,1)
    this.setState({
      deleteVisible : false,
      labeldataArray
    })
  }

  render(){
    const { form } = this.props
    const { getFieldProps } = form
    const labelcolumns = [{
      title:'标签键',
      key:'1',
      dataIndex:'labelkey',
      width:'19%',
      render : (text) => <div>{text}</div>
    },{
      title:'属性',
      key:'2',
      dataIndex:'attribute',
      width:'16%',
      render : (text) => <div>{text}</div>
    },{
      title:'标签值',
      key:'3',
      dataIndex:'labelvalue',
      width:'15%',
      render : (text) => <div>{text}</div>
    },{
      title:'绑定实例',
      key:'4',
      dataIndex:'bind',
      width:'15%',
      render : (text) => <div className='binditem'>
        {text}
        <span className='itemspan'>个</span>
        </div>
    },{
      title:'创建时间',
      key:'5',
      dataIndex:'createtime',
      width:'19%',
      sorter: true,
      render : (text) => <div>{text}</div>
    },{
      title:'操作',
      key:'6',
      dataIndex:'handle',
      width:'16%',
      className:'handle',
      render : (text) => <div>
        {
          !text.system
          ?<span>
            <Button type="primary"　className='editbutton' onClick={() => this.handleEditButton(text.index)}>修改</Button>
            <Button className='deletebutton' onClick={() => this.handleDeleteButton(text.index)}>删除</Button>
          </span>
          :<span className='systemmessage'>
            <Icon type="info-circle-o" className='handleicon'/>
            该标签为系统创建，不可操作
          </span>
        }
      </div>
    }]
    return <div id="cluster__labelmanage">
      <div className='labelmanage__title'>
        <Button type="primary" icon="reload" size="large" className='titlebutton'>刷新</Button>
        <span className='titlesearch'>
          <Input
            placeholder="情输入标签键或标签值搜索"
            size="large"
            className='titleInput'
            onPressEnter={this.handleSearchInput}
          />
          <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
        </span>
        <span className='titlenum'>共计 <span>4</span> 条</span>
      </div>
      <div className="labelmanage__content">
        <Table
          columns={labelcolumns}
          dataSource={this.formlabeldata()}
        />
      </div>

      <Modal
        title="修改标签"
        visible={this.state.editVisible}
        onOk={this.handleEditOkModal}
        onCancel={this.handleEditCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
      >
        <Form className='labelManageForm'>
          <div className="formlabelkey">
            <div className='top'>标签键</div>
            <FormItem>
              <Input {...getFieldProps('editlabelkey',{
                initialValue : this.state.ModalLabelKey
              })}/>
            </FormItem>
          </div>
          <div className="formlabelvalue">
            <div className='top'>标签值</div>
            <FormItem>
              <Input {...getFieldProps('editlabelvalue',{
                initialValue : this.state.ModalLabelValue
              })}/>
            </FormItem>
          </div>
        </Form>
        <div style={{clear:'both'}}></div>
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

export default ClusterLabelManage