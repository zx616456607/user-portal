/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * project component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Icon, Button,Form,Radio, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import DataTable from './DataTable'
const RadioGroup = Radio.Group

class CreateItem extends Component {
  constructor(props) {
    super()
  }
  handCancel() {
    const {form,func} = this.props
    form.resetFields()
    func.scope.setState({createItem:false})
  }
  handOk() {
    const {form,func} = this.props
    form.validateFields((error,values)=> {
      if (error) {
        return
      }
      console.log('value',values)
      func.scope.setState({createItem:false})
    })

  }
  render() {
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    }
    const itemName= getFieldProps('itemName',{
      rules: [
        { required: true, min: 3, message: '项目至少为3个字符' },
        { validator: this.nameExists },
      ],
    })
    return (
      <Modal title="新建项目" visible={this.props.visible} onOk={()=> this.handOk()} onCancel={()=> this.handCancel()}>
        <Form className="itemCreateFrom">
          <Form.Item label="项目名称" {...formItemLayout} className="createForm">
            <Input placeholder="请输入项目名称" {...itemName}/>
          </Form.Item>
          <Form.Item label="项目类型" {...formItemLayout} className="createForm">
            <RadioGroup defaultValue="1">
              <Radio value="1">私有</Radio>
              <Radio value="2">公开</Radio>
            </RadioGroup>
          </Form.Item>

          <div className="alertRow">当项目设为公开后，任何人都有此项目下镜像的读权限。命令行用户不需要“docker login”就可以拉取此项目下的镜像。</div>
        </Form>
      </Modal>
    )
  }
}

CreateItem = Form.create()(CreateItem)

class Project extends Component {
  constructor(props) {
    super()
    this.state = {
      createItem: false,// create modal
      deleteItem: false,// delte modal
      selectedRows:[]
    }
  }
  deleteItemOk() {
    // go delete item
    console.log('sfsfsdf')
  }
  render() {

    const dataSource = [
      {
        name: 'demo-1',
        type: 1,
        role: '1',
        ropo: '90',
        createTime: '2017-4-5'
      },
      {
        name: 'demo-2',
        type: 2,
        role: '2',
        ropo: '30',
        createTime: '2017-8-5'
      },
      {
        name: 'demo-33',
        type: 1,
        role: '3',
        ropo: '50',
        createTime: '2017-4-0'
      }
    ]
    const func={
      scope: this,
    }
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出来的镜像</div>
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Button type="primary" size="large" icon="plus" onClick={()=> this.setState({createItem:true})}>新建项目</Button>
                <Button type="ghost" disabled={this.state.selectedRows.length==0} onClick={()=> this.setState({deleteItem:true})} size="large" icon="delete">删除</Button>

                <Input placeholder="搜索" className="search" size="large" />
                <i className="fa fa-search"></i>
                <span className="totalPage">共计：{dataSource.length} 条</span>
              </div>
              <DataTable dataSource={dataSource}  func={func}/>
            </Card>
            {/* 创建项目 Modal */}
            <CreateItem visible={this.state.createItem} func={func}/>

            {/* 删除项目 Modal */}
            <Modal title="删除项目" visible={this.state.deleteItem}
              onCancel={()=> this.setState({deleteItem:false})}
              onOk={()=> this.deleteItemOk()}
            >
              <div className="confirmText" style={{lineHeight:'30px'}}>删除仓库组后，仓库组内的镜像将全部删除。</div>
              <div className="confirmText">您确认删除 {this.state.selectedRows.map(item=> item.name).join(',')} 仓库组?</div>
            </Modal>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

export default Project