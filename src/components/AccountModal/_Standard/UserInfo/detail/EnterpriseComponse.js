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
const FormItem = Form.Item

let EnterpriseComponse = React.createClass({
  idCard(rule, value, callback) {
    if (value.length < 15 || value.length > 18) {
      callback(new Error('请输入15位 - 18位身份证号!'));
    } else {
      callback();
    }
  },
  isPhone(rule, value, callback) {
    if (value.length < 11 || value.length > 11) {
      callback(new Error('请输入11位手机号!'));
    } else {
      callback();
    }
  },
  handleSubmit(e) {
    e.preventDefault();
    console.log('收到表单值：', this.props.form.getFieldsValue());
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      console.log('Submit!!!');
      console.log(values);
    });
  },
  render() {
    const props = {
      action: '/upload.do',
      listType: 'picture-card',
      defaultFileList: [{
        uid: -1,
        name: 'xxx.png',
        status: 'done',
        url: 'https://os.alipayobjects.com/rmsportal/NDbkJhpzmLxtPhB.png',
        thumbUrl: 'https://os.alipayobjects.com/rmsportal/NDbkJhpzmLxtPhB.png',
      }],
      onPreview: (file) => {
        this.setState({
          priviewImage: file.url,
          priviewVisible: true,
        });
      },
    }
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
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <div className="myInfo">
          <div className="hand">企业信息</div>
          <div className="user-info">
            <p>
              <span className="key">企业名称 <span className="important">*</span></span>
              <FormItem>
                <Input {...companyNameProps} className="input" size="large" />
              </FormItem>
            </p>
            <p>
              <span className="key">营业执照注册号 <span className="important">*</span></span>
              <FormItem>
                <Input {...registrationNumberProps} className="input" size="large" />
              </FormItem>
            </p>
            <p>
              <span className="key">营业执照妇描件 <span className="important">*</span></span>
              <div className="upload">
                <Upload {...props}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.营业执照正副本均可，文字/盖章需清晰可见</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </p>
            <div style={{ clear: 'both' }}></div>
          </div>

        </div>
        <div className="myInfo">
          <div className="hand">企业负责人信息</div>
          <div className="user-info">
            <p>
              <span className="key">负责人姓名 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameProps} className="input" size="large" />
              </FormItem>
            </p>
            <p>
              <span className="key">负责人身份证号码 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNameNumberProps} type="number" className="input" size="large" />
              </FormItem>
            </p>
            <p>
              <span className="key">联系人手机号 <span className="important">*</span></span>
              <FormItem>
                <Input {...ownerNamePhoneProps} type="number" className="input" size="large" />
              </FormItem>
            </p>
            <p>
              <span className="key">负责人身份证正面扫描 <span className="important">*</span></span>
              <div className="upload">
                <Upload {...props}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.持有者需正面、免冠、未化妆、双手持身份证且露出手臂</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </p>
            <p>
              <span className="key">负责人身份证反面扫描 <span className="important">*</span></span>
              <div className="upload">
                <Upload {...props}>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>1.身份证信息清晰可辨认</li>
                <li>2.身份证为本人持有，不得盗用他人身份证且不得遮挡持有者面部，身份证全部信息（包换身份证号、头像）需清晰可辩认</li>
                <li>3.照片未经任何软件编辑修改</li>
                <li>4.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </p>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="info-footer">
          <Button size="large" htmlType="submit">提交</Button>
        </div>
      </Form>
    )
  }
})

 EnterpriseComponse = Form.create()(EnterpriseComponse);

export default EnterpriseComponse