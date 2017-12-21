/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Template list component
 *
 * v0.1 - 2017-11-7
 * @author Baiyu
 */


import React from 'react'
import { Form,Card,Row,Col,Input,Button,Affix } from 'antd'
import { connect } from 'react-redux'
import { checkName } from '../../../../common/naming_validation'
import { browserHistory } from 'react-router'

class TemplateName extends React.Component {
  constructor(props) {
    super()
  }
  formCreate() {
    const {func,form} = this.props
    form.validateFieldsAndScroll((errors,values)=> {
      console.log('errors',errors)
      if (errors) return
      console.log('values',values)
      func.scope.templateCreate(values)
    })
  }
  renderServiceName() {
    const { allFields} = this.props
    let allFieldsKeys =[]
    for(let key in allFields) {
      if (allFields[key].serviceName) {
        allFieldsKeys.push(allFields[key].serviceName)
      }
    }
    return allFieldsKeys.map((serviceName,index)=> {
      return <Row key={serviceName.value}>
        <Col span="16">{serviceName.value}</Col>
        <Col span="8" className="formright"><Button >删除</Button></Col>
        </Row>
    })
  }
  continueBtn() {
    const { func } = this.props
    func.scope.templateCreate()
  }
  continueAdd() {
    //  continue add service
    const { allFields, func } = this.props
    const allFieldsKeys = Object.keys(allFields)
    if (allFieldsKeys.length >1) {
      return <div className="text-center" style={{lineHeight:'80px',height:'60px'}}>
        <Button disabled={func.scope.state.saveBtn}  onClick={()=> this.continueBtn()} type="primary">继续添加</Button>
      </div>
    }
    return null
  }
  goBack(step) {
    if (step) {
      browserHistory.goBack()
      return
    }
    const { func } = this.props
    func.scope.removeAllFormFieldsAsync()
    browserHistory.push('/app_center/app_template')
  }
  render() {
    const { func,form } = this.props
    const templateNameProps = form.getFieldProps('templateName', {
      rules: [
        { required: true,message:'最少3个字符'},
        { validator: checkName}
      ],
    })
    return (
      <Form>
      <Card title="信息总览" bodyStyle={{padding:0}}>
        <div className="confirmList">
          <Row>
            模板名称：
            <Form.Item>
            <Input {...templateNameProps} placeholder="请输入模板名称" />
            </Form.Item>
          </Row>
          <Row>
            模板描述：
            <Input type="textarea" placeholder="选填" />
          </Row>
          <Row>
            <Col span="16">服务</Col>
            <Col span="8" className="formright">操作</Col>
          </Row>
          {this.renderServiceName()}
          {this.continueAdd()}
        </div>
        <Row className="footCard">
          <Col span="16"><Button onClick={()=> this.goBack(func.scope.state.saveBtn)} size="large">{func.scope.state.saveBtn ? '取消':'上一步'}</Button></Col>
          <Col span="8"><Button disabled={func.scope.state.saveBtn} onClick={()=> this.formCreate()} size="large" type="primary">创建</Button></Col>
        </Row>
      </Card>
      </Form>
    )
  }
}

function mapStateToProps(state, props) {
  const { quickCreateApp  } = state
  const { id } = props
  const { fields } = quickCreateApp
  const currentFields = quickCreateApp.fields[id]
  return {
    allFields: fields,
    currentFields,
  }
}
export default connect(mapStateToProps,{

})(Form.create()(TemplateName))
