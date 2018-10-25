/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * 对象存储复制  component
 *
 * v0.1 - 2017-9-12
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Dropdown, Menu, Modal,Form,Icon, Select } from 'antd'
import { connect } from 'react-redux'
import {
  getObjectStorageList,
  getObjectStorageDetailList,
  objectStorageDetailCopy,
} from '../../../actions/openstack/openstack_storage'
import NotificationHandler from '../../../common/notification_handler'
const notificat = new NotificationHandler()

class ObjectCopy extends Component {
  constructor(props) {
    super()
    this.state = {}
  }
  createOk() {
    const { form,func } = this.props
    form.validateFields((error, values)=> {
      if (error) return
      values.fromPath = values.fromPath || this.props.currentPath.trim()
      // let fromDirectory = values.fromDirectory ? '/'+ values.fromDirectory.trim():''
      const body = {
        from: this.props.currentPath.trim() +'/'+ this.props.currentPathName.name ,
        to: values.fromPath + '/'+ values.directory
      }
      if (body.from == body.to) {
        notificat.error('对象名称已存在')
        return
      }
      this.setState({copying: true})
      this.props.objectStorageDetailCopy(body,{
        project: this.props.project
      },{
        success:{
          func:(res)=> {
            notificat.success('复制对象成功')
            func.scope.refreshObjectStoreDetail()
            func.handAction('storageCopy',false)
          },
          isAsync: true
        },
        failed:{
          func:(res)=> {
            this.setState({copying: false})
            let message='复制失败'
            try {
              message = JSON.stringify(res.message)
            } catch (error) {
            }
            notificat.warn(message)
          }
        }
      })
    })
  }
  filedirectory(rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value.length > 16) {
      return callback('对象目录最多可输入16位字符')
    }
    if (/[\u4e00-\u9fa5]|[`~、·]+/g.test(value)) {
      return callback('请输入英文字母和数字')
    }
    if (/\/|\\/g.test(value)) {
      return callback('文件名不能包含"/"和"\\"')
    }
    callback()
  }
  getFilePath() {
    return this.props.objectStorageList.map(list => {
      return (
        <Select.Option key={list.name}>{list.name}</Select.Option>
      )
    })
  }
  getStorageList(name) {
    const { form } = this.props
    const directoryName = form .getFieldValue('directory')
    if (!directoryName) return
    this.props.getObjectStorageDetailList(name,{project: this.props.project}, {
      success:{
        func:(res)=> {
          let hasName = null
          res.detail && res.detail.every(list => {
            if (list.name == directoryName) {
              hasName = ['对象目录名已存在']
              return false
            }
            return true
          })
          form.setFields({
            'directory':{errors: hasName,value: directoryName}
          })
        }
      }
    })
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    }
    const { form ,func,currentPathName } = this.props
    const directory = form.getFieldProps('directory',{
      rules:[
      {validator: (rule,value,callback)=> {
        const regx = new RegExp('^\\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?)*$')

        if (!value) {
          return callback('请输入对象名称')
        }
        if (value.length <2 || value.length >32) {
          return callback('请输入2~32位字符')
        }
        if (!regx.test(value)) {
          return callback('对象名称由字母、数字开头和结尾，中间可[-_.]')
        }

        if(form.getFieldValue('fromPath')) {
          this.getStorageList(form.getFieldValue('fromPath'))
        }
        callback()
      } }]
    })
    const fromPath = form.getFieldProps('fromPath',{
      rules:[{required: false ,message: '请选择一个对象目录'}],
      onChange:(name)=> {
        if(form.getFieldValue('directory')) {
          this.getStorageList(name)
        }
      }
    })
    // const fromDirectory = form.getFieldProps('fromDirectory',{
    //   rules:[{validator: this.filedirectory }]
    // })
    return (
      <Modal visible={true} title="复制对象"
       maskClosable={false}
       className="reset_form_item_label_style"
       onCancel={()=> func.handAction('storageCopy',false)}
       confirmLoading={this.state.copying}
       onOk={()=> this.createOk()}
       >
       <div className="alertRow">注：您可以对选定的对象进行复制，您可以指定复制对象的路径，如果不指定并且不指定存储空间，将默认复制在当前目录下。</div>
        <Form>
          <Form.Item label="复制对象名称" {...formItemLayout}>
            <Input disabled={true} value={currentPathName.name} />
          </Form.Item>
          <Form.Item label="对象目录" {...formItemLayout}>
            <Select placeholder="默认当前目录下" {...fromPath}>
              { this.getFilePath() }
            </Select>
          </Form.Item>
          <Form.Item label="对象名称" {...formItemLayout}>
            <Input placeholder="请输入对象名称" {...directory}/>
          </Form.Item>
          {/* <Form.Item label="复制目录" {...formItemLayout}>
            <Input placeholder="选填" {...fromDirectory}/>
          </Form.Item> */}
        </Form>
      </Modal>
    )
  }
}

function mapStateToProp(state,props) {
  const { openstack_storage } = state
  let objectStorageList = []
  if(openstack_storage.objectStorageList && openstack_storage.objectStorageList.result){
  objectStorageList =  openstack_storage.objectStorageList.result.filter(item=> {
    if(item.name.indexOf('/') < 0) {
      return true
    }
    return false
  })
}
  return {
    objectStorageList,
  }
}

export default connect(mapStateToProp,{
  objectStorageDetailCopy,
  getObjectStorageDetailList,
  getObjectStorageList
})(Form.create()(ObjectCopy))