/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Authentication - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Icon, Input, Upload, Form} from 'antd'
import uploadFile from '../../../../../common/upload.js'
import { IDValide } from '../../../../../common/naming_validation.js'
import NotificationHandler from '../../../../../common/notification_handler.js'
const FormItem = Form.Item

let EnterpriseComponse = React.createClass({
  getInitialState() {
    return {
      userLicense:{},
      userFrontId:{},
      backId:{},
      disabled:false
    }
  },
  idCard(rule, values, callback) {
    const message = IDValide(values)
    if(message) {
      callback([new Error(message)])
      return
    }
    callback()
    return
  },
  isPhone(rule, value, callback) {
    if (value.length < 11 || value.length > 11) {
      callback(new Error('请输入11位手机号!'));
    } else {
      callback();
    }
  },
  beforeUpload(file, type) {
    const self = this
    const index = file.name.lastIndexOf('.')
    let fileName = file.name.substring(0, index)
    let ext = file.name.substring(index + 1)
    fileName = fileName + (new Date() - 0) + '.' + ext
    this.props.getQiNiuToken('certificate', fileName, {
      success: {
        func: (result)=> {
          self.setState({
            uptoken: result.upToken
          })
          const timestamp = new Date() - 0
          const body = {
            file: file,
            token: result.upToken,
            key: fileName
          }
          uploadFile(file, {
            url: result.uploadUrl,
            key: fileName,
            method: 'POST',
            body: body
          }).then(response => {
            self.setState({
              qiniu: result.url,
              origin: result.origin
            })
            const url = `${result.origin}/${response.key}`
            const info = {
              uid: -1,
              name: file.name,
              status: 'done',
              url,
              thumbUrl: url
            }
            if(type == 'license') {
              self.setState({
                userLicense: info
              })
              return
            }
            if(type == 'frontId') {
              self.setState({
                userFrontId: info
              })
              return
            }
            self.setState({
              backId: info
            })
          })
        }
      }
    })
    return false
  },
  handleSubmit(e) {
    e.preventDefault();
    const {userLicense, userFrontId, backId} = this.state
    const parentScope = this.props.scope.props.scope
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      const notification = new NotificationHandler()
      if (!userLicense.url) {
        notification.error('请上传负责人身份证正面扫描照')
        return
      }
      if (!userFrontId.url) {
        notification.error('请上传负责人身份证正面扫描照')
        return
      }
      if (!backId.url) {
        notification.error('请上传负责人身份证反面扫描照')
        return
      }
      console.log('Submit!!!', this.state);
      console.log(values);
      notification.spin('提交审核信息中')
      const body = {
        certType: 2,
        certUserName: values.ownerName,
        certUserID: values.ownerNameNumber,
        enterpriseCertPic:userLicense.url,
        userHoldPic: userFrontId.url,
        userScanPic: backId.url,
        enterpriseOwnerPhone: values.ownerNamePhone,
        enterpriseCertID:values.registrationNumber,
        enterpriseName:values.companyName
      }
      parentScope.props.createCertInfo(body, {
       success: {
         func: () => {
           notification.close()
           notification.success('提交到审核中')
           parentScope.props.loadStandardUserCertificate
         }
        },
        failed: {
          func: () => {
            notification.close()
            notification.error('提交审核失败, 请稍后重试')
          }
        }
      })

    });
  },
  componentDidMount(){
    const data = this.props.config
    console.log('data', data)
    if (data && data.status == 1) {
      this.props.form.setFieldsValue({
        companyName: data.enterpriseName,
        registrationNumber: data.enterpriseCertID,
        ownerName: data.certUserName,
        ownerNameNumber:data.certUserID,
        ownerNamePhone: data.enterpriseOwnerPhone
      })
      this.setState({
        disabled:true
      })
    }
  },
   render() {

    const data = this.props.config || {}
    const { getFieldProps } = this.props.form;
    const companyNameProps = getFieldProps('companyName', {
      rules: [
        { required: true, whitespace: true, message:'请输入企业名称'}
      ],
      initialValue: ''
    });
    const registrationNumberProps = getFieldProps('registrationNumber', {
      rules: [
        { required: true, whitespace: true, message:'请输入营业执照注册号'}
      ],
      initialValue: ''
    });
    const ownerNameProps = getFieldProps('ownerName', {
      rules: [
        { required: true, whitespace: true, message:'请输入负责人姓名'}
      ],
      initialValue: ''
    });
    const ownerNameNumberProps = getFieldProps('ownerNameNumber', {
      rules: [
        { whitespace: true, message:'请输入负责任人身份证号'},
        { validator: this.idCard }
      ],
      initialValue: ''
    });
    const ownerNamePhoneProps = getFieldProps('ownerNamePhone', {
      rules: [
        { whitespace: true, message:'请输入联系人手机号'},
        { validator: this.isPhone }
      ],
      initialValue: ''
    });

    const license = this.state.userLicense.url ? [this.state.userLicense] : null
    const frontId = this.state.userFrontId.url ? [this.state.userFrontId] : null
    const backId = this.state.backId.url ? [this.state.backId] : null
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <div className="myInfo">
          <div className="hand">企业信息</div>
          <div className="user-info">
            <div className="list">
              <span className="key">企业名称 <span className="important">*</span></span>
              <FormItem>
                <Input {...companyNameProps} className="input" size="large" disabled={this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">营业执照注册号 <span className="important">*</span></span>
              <FormItem>
                <Input {...registrationNumberProps} className="input" size="large" disabled={this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">营业执照妇描件 <span className="important">*</span></span>
              <div className="upload">
                {data.status ?
                <img src={data.enterpriseCertPic} className="ant-upload ant-upload-select-picture-card" style={{padding:0}} />
                :  
                <Upload listType="picture-card" fileList={license} beforeUpload={(file) => 
                  this.beforeUpload(file, 'license') 
                } customRequest={() => true }  disabled={ license ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
                }

              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.营业执照正副本均可，文字/盖章需清晰可见</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>

        </div>
        <div className="myInfo" style={{marginTop:'20px'}}>
          <div className="hand">企业负责人信息</div>
          <div className="user-info">
            <div className="list">
              <span className="key">负责人姓名 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameProps} className="input" size="large" disabled={this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">负责人身份证号码 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameNumberProps} className="input" size="large" disabled={this.state.disabled} />
              </FormItem>
            </div>
            <div className="list">
              <span className="key">联系人手机号 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNamePhoneProps} type="number" className="input" size="large" disabled={this.state.disabled}/>
              </FormItem>
            </div>
            <div className="list">
              <span className="key">负责人身份证正面扫描 <span className="important">*</span></span>
              <div className="upload">
               {data.status ?
                <img src={data.userHoldPic} className="ant-upload ant-upload-select-picture-card" style={{padding:0}} />
                :
                <Upload listType="picture-card" fileList={frontId} beforeUpload={(file) => 
                  this.beforeUpload(file, 'frontId') 
                } customRequest={() => true }  disabled={ frontId ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
               }
        
              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.持有者需正面、免冠、未化妆、双手持身份证且露出手臂</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div className="list">
              <span className="key">负责人身份证反面扫描 <span className="important">*</span></span>
              <div className="upload">
              {data.status ?
                <img src={data.userScanPic} className="ant-upload ant-upload-select-picture-card" style={{padding:0}} />
                :
                <Upload listType="picture-card" fileList={backId} beforeUpload={(file) => 
                  this.beforeUpload(file, 'backId') 
                } customRequest={() => true }  disabled={ backId ? true : false}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              }
              </div>
              <ul className="chk">
                <li>1.身份证信息清晰可辨认</li>
                <li>2.身份证为本人持有，不得盗用他人身份证且不得遮挡持有者面部，身份证全部信息（包换身份证号、头像）需清晰可辩认</li>
                <li>3.照片未经任何软件编辑修改</li>
                <li>4.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="info-footer">
          {this.state.disabled ?
          <Button size="large" type="primary" onClick={()=> this.setState({disabled: false}) }>修改</Button>
          :
          <Button size="large" htmlType="submit">提交</Button>
          }
        </div>
      </Form>
    )
  }
})

EnterpriseComponse = Form.create()(EnterpriseComponse);
export default EnterpriseComponse