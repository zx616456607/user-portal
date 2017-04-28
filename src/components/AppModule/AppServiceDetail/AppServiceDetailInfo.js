/* Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceDetailInfo component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Form, Input, Select, Button, Dropdown, Menu, Tooltip, Modal } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/AppServiceDetailInfo.less'
import { formatDate, cpuFormat, memoryFormat } from '../../../common/tools'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'
import { appEnvCheck } from '../../../common/naming_validation'
import { editServiceEnv } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler.js'

const enterpriseFlag = ENTERPRISE_MODE == mode
const FormItem = Form.Item
class MyComponent extends Component {
  constructor(props){
    super(props)
    this.templateTable = this.templateTable.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleCancleEdit = this.handleCancleEdit.bind(this)
    this.handleSaveEdit = this.handleSaveEdit.bind(this)
    this.addNewEnv = this.addNewEnv.bind(this)
    this.ModalDeleteOk = this.ModalDeleteOk.bind(this)
    this.ModalDeleteCancel = this.ModalDeleteCancel.bind(this)
    this.envNameCheck = this.envNameCheck.bind(this)
    this.state = {
      rowDisableArray : [],
      dataArray : [],
      saveBtnLoadingArray : [],
      ModalDeleteVisible : false,
      DeletingEnvName : '',
      DeletingEnvIndex : '',
      buttonLoading : false,
    }
  }

  componentWillMount(){
    const { serviceDetail } = this.props
    const containers = serviceDetail.spec.template.spec.containers[0].env
    let rowDisableArray = []
    let dataArray = []
    let saveBtnLoadingArray = []
    if(containers){
      for(let i=0; i<containers.length; i++){
        rowDisableArray.push({disable : false})
        dataArray.push(containers[i])
        saveBtnLoadingArray.push({loading : false})
      }
    }
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray,
    })
  }

  handleEdit(index){
    const { rowDisableArray } = this.state
    rowDisableArray[index].disable = true
    this.setState({
      rowDisableArray,
    })
  }

  handleCancleEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form } = this.props
    const { getFieldValue } = form
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == undefined || value == undefined || name == '' || value == ''){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      })
      return
    }
    rowDisableArray[index].disable = false
    this.setState({
      rowDisableArray
    })
  }

  handleSaveEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form, serviceDetail, cluster, editServiceEnv } = this.props
    const { getFieldValue } = form
    const Notification = new NotificationHandler()
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == '' || value == '' || name == undefined || value == undefined){
      Notification.error('变量名和变量值均不能为空')
      return
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == name){
        Notification.error('变量名已近存在，请修改！')
        return
      }
    }
    saveBtnLoadingArray[index].loading = true
    this.setState({
      saveBtnLoadingArray
    })
    dataArray[index].name = name
    dataArray[index].value = value
    let body = {
      clusterId : cluster,
      service : serviceDetail.metadata.name,
      arr : dataArray
    }
    editServiceEnv(body,{
      success : {
        func : () => {
          Notification.success('环境变量修改成功！')
          saveBtnLoadingArray[index].loading = false
          rowDisableArray[index].disable = false
          this.setState({
            rowDisableArray,
            dataArray,
            saveBtnLoadingArray,
          })
        },
        isAsync : true
      },
      failed : {
        func : () => {
          Notification.error('环境变量修改失败！')
          rowDisableArray[index].disable = false
          saveBtnLoadingArray[index].loading = false
          this.setState({
            rowDisableArray,
            saveBtnLoadingArray
          })
        },
        isAsync : true
      }
    })
  }

  addNewEnv(){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){
      new NotificationHandler().error("请先保存新增的环境变量")
      return
    }
    rowDisableArray.push({disable : true})
    saveBtnLoadingArray.push({loading : false})
    dataArray.push({name:'',value:''})
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray
    })
  }

  handleDelete(index,name){
    this.setState({
      DeletingEnvName : name,
      DeletingEnvIndex : index,
      ModalDeleteVisible : true
    })
  }

  ModalDeleteOk(){
    const { rowDisableArray, dataArray, DeletingEnvIndex, saveBtnLoadingArray } = this.state
    const { serviceDetail, cluster, editServiceEnv } = this.props
    const Notification = new NotificationHandler()
    let body = {
      clusterId : cluster,
      service : serviceDetail.metadata.name,
      arr : this.state.dataArray
    }
    console.log('this.state=',this.state)
    console.log('body=',body)
    let deleteEnv = dataArray[DeletingEnvIndex]
    rowDisableArray.splice(DeletingEnvIndex,1)
    dataArray.splice(DeletingEnvIndex,1)
    saveBtnLoadingArray.splice(DeletingEnvIndex,1)
    this.setState({
      buttonLoading : true
    })
    editServiceEnv(body,{
      success : {
        func : () => {
          Notification.success('删除环境变量成功！')
          this.setState({
            ModalDeleteVisible : false,
            rowDisableArray,
            dataArray,
            saveBtnLoadingArray,
            buttonLoading : false,
          })
        },
        isAsync : true
      },
      failed : {
        func : () => {
          Notification.error('删除环境变量失败！')
          rowDisableArray.splice(DeletingEnvIndex,0,{disable : false})
          dataArray.splice(DeletingEnvIndex,0,deleteEnv)
          saveBtnLoadingArray.splice(DeletingEnvIndex,0,{loading : false})
          this.setState({
            ModalDeleteVisible : false,
            buttonLoading : false,
            rowDisableArray,
            dataArray,
            saveBtnLoadingArray,
          })
        },
        isAsync : true
      }
    })
  }

  ModalDeleteCancel(){
    this.setState({
      ModalDeleteVisible : false
    })
  }

  envNameCheck(rule, value, callback) {
    const { dataArray } = this.state
    let flag = false
    let errorMsg = appEnvCheck(value, '环境变量');
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == value){
        callback(new Error('变量名已存在！'))
      }
    }
    if(errorMsg == 'success') {
      callback()
    } else {
      callback(new Error([errorMsg]));
    }
  }  
  
  templateTable(dataArray,rowDisableArray) {
    if(dataArray.length == 0) {
      return <div className='noData'>暂无环境变量</div>
    }
    const { form } = this.props
    const { getFieldProps } = form
    const ele = []
    dataArray.forEach((env,index) => {

      const editMenu = (<Menu style={{width:'100px'}} onClick={() => this.handleEdit(index)}>
        <Menu.Item key="1"><Icon type="edit" />&nbsp;编辑</Menu.Item>
      </Menu>)

      ele.push(
        <div className="dataBox" key={index}>
          <div className="commonTitleName">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <Input {...getFieldProps(`envName${index}`, {
                  initialValue:env.name,
                  rules: [{ validator: this.envNameCheck },],
                })} placeholder={env.name} size="default"/>
              </FormItem>
              :<Tooltip title={env.name} placement="topLeft">
                <span>{env.name}</span>
              </Tooltip>
            }
          </div>
          <div className="commonTitleValue ">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <Input {...getFieldProps(`envValue${index}`,{
                  initialValue:env.value
                })
                } placeholder={env.value} size="default"/>
              </FormItem>
              :<Tooltip title={env.value} placement="topLeft">
                <span style={{width:'33%'}}>{env.value}</span>
              </Tooltip>
            }
          </div>
          <div>
            {
              rowDisableArray[index].disable
              ? <div>
                <Button type='primary' className='saveBtn' onClick={() => this.handleSaveEdit(index)} loading={this.state.saveBtnLoadingArray[index].loading}>保存</Button>
                <Button onClick={() => this.handleCancleEdit(index)}>取消</Button>
              </div>
              : <Dropdown.Button type="ghost" overlay={editMenu} className='editButton' onClick={() => this.handleDelete(index,env.name)}>
                  <Icon type="delete" />删除
                </Dropdown.Button>
            }
          </div>
          <div className='checkbox'></div>
        </div>
      )
    })
  return ele
  }
  render(){
    const { DeletingEnvName } = this.state
    return (
      <div className='DetailInfo__MyComponent'>
        <div>
          <Form>
            {this.templateTable(this.state.dataArray,this.state.rowDisableArray)}
          </Form>
        </div>
        <div className="pushRow">
          <a onClick={this.addNewEnv}><Icon type="plus" />添加环境变量</a>
        </div>
        <Modal
          title="删除环境变量操作"
          wrapClassName="ModalDeleteInfo"
          visible={this.state.ModalDeleteVisible}
          onOk={this.ModalDeleteOk}
          onCancel={this.ModalDeleteCancel}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={this.ModalDeleteCancel}>
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.buttonLoading}
              onClick={this.ModalDeleteOk}>
              确 定
            </Button>,
          ]}
        >
          <div className='ModalColor'><i className="anticon anticon-question-circle-o modali"></i>你是否确定删除 [<span>{DeletingEnvName}</span>] 环境变量</div>
        </Modal>
      </div>
    )
  }
}
MyComponent = Form.create()(MyComponent)

function mapStateToProp(state, props){

  return {

  }
}

MyComponent = connect(mapStateToProp, {
  editServiceEnv
})(MyComponent)


export default class AppServiceDetailInfo extends Component {
  constructor(props) {
    super(props)
  }


  render() {
    const { isFetching, serviceDetail, cluster } = this.props
    if (isFetching || !serviceDetail.metadata) {
      return ( <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    return (
      <Card id="AppServiceDetailInfo">
        <div className="info commonBox">
          <span className="titleSpan">基本信息</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
          </div>
            <div className="commonTitle">
              镜像名称
          </div>
            <div className="commonTitle">
              创建时间
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {serviceDetail.metadata.name}
            </div>
            <div className="commonTitle">
              {serviceDetail.images.join(', ') || '-'}
            </div>
            <div className="commonTitle">
              {formatDate(serviceDetail.metadata.creationTimestamp || '')}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="compose commonBox">
          <span className="titleSpan">资源配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
          </div>
            <div className="commonTitle">
              内存
          </div>
            <div className="commonTitle">
              系统盘
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              { cpuFormat(serviceDetail.spec.template.spec.containers[0].resources.requests.memory, serviceDetail.spec.template.spec.containers[0].resources) || '-'}
            </div>
            <div className="commonTitle">
              { memoryFormat(serviceDetail.spec.template.spec.containers[0].resources)}
            </div>
            <div className="commonTitle">
              10G
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="environment commonBox">
          <span className="titleSpan">环境变量</span>
          <div className="titleBox">
            <div className="commonTitle">
              变量名
            </div>
            <div className="commonTitle">
              变量值
            </div>
            <div className="commonTitle">
              操作
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <MyComponent
            serviceDetail={serviceDetail}
            cluster={cluster}
          />
        </div>
      </Card>
    )
  }
}

AppServiceDetailInfo.propTypes = {
  //
}
