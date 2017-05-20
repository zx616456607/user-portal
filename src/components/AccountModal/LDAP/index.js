/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * LDAP component
 *
 * v0.1 - 2017-05-19
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import './style/LDAP.less'
import { Row, Col, Form, Input, Button, Radio, Modal } from 'antd'
import MemberImg from '../../../assets/img/account/member.png'
import ArrowImg from '../../../assets/img/account/arrow.png'
import LDAPImg from '../../../assets/img/account/ldap.png'

const FormItem = Form.Item

class LDAP extends Component {
	constructor(props){
    super(props)
    this.checkHost = this.checkHost.bind(this)
    this.checkPort = this.checkPort.bind(this)
    this.checkBaseDN = this.checkBaseDN.bind(this)
    this.checkUserDN = this.checkUserDN.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
    this.checkAgreement = this.checkAgreement.bind(this)
    this.checkUserObjectFilters = this.checkUserObjectFilters.bind(this)
    this.checkUserEmail = this.checkUserEmail.bind(this)
    this.checkUserObject = this.checkUserObject.bind(this)
    this.handleSynchronization = this.handleSynchronization(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleConfirmLiftIntegration = this.handleConfirmLiftIntegration.bind(this)
    this.handelCancelLiftIntegration = this.handelCancelLiftIntegration.bind(this)
    this.handleLiftIntegration = this.handleLiftIntegration.bind(this)
    this.handleConfirmLiftIntegrationOther = this.handleConfirmLiftIntegrationOther.bind(this)
    this.state = {
      LiftIntegrationModalVisible: false,
    }
  }

  handleConfirmLiftIntegration(){
	  this.setState({
      LiftIntegrationModalVisible: false
	  })
  }

  handleConfirmLiftIntegrationOther(){
    this.setState({
      LiftIntegrationModalVisible: false
    })
  }

  handelCancelLiftIntegration(){
    this.setState({
      LiftIntegrationModalVisible: false
    })
  }

  handleLiftIntegration(){
    this.setState({
      LiftIntegrationModalVisible: true
    })
  }

  checkHost(rule, value, callback){
    if(!value){
      return callback('请输入Host')
    }
    callback()
  }

  checkPort(rule, value, callback){
    if(!value){
      return callback('请输入Port')
    }
    callback()
  }

  checkBaseDN(rule, value, callback){
    if(!value){
      return callback('请输入Base DN')
    }
    callback()
  }

  checkUserDN(rule, value, callback){
    if(!value){
      return callback('请输入User DN')
    }
    callback()
  }

  checkPassword(rule, value, callback){
    if(!value){
      return callback('请输入密码')
    }
    callback()
  }

  checkAgreement(rule, value, callback){
    if(!value){
      return callback('请选择协议')
    }
    callback()
  }

  checkUserObjectFilters(rule, value, callback){
    if(!value){
      return callback('请输入用户对象过滤器')
    }
    callback()
  }

  checkUserEmail(rule, value, callback){
    if(!value){
      return callback('请输入用户邮箱')
    }
    callback()
  }

  checkUserObject(rule, value, callback){
    if(!value){
      return callback('请输入用户对象过滤器')
    }
    callback()
  }

  handleSynchronization(){

  }

  handleSave(){
    const { form } = this.props
    form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return;
      }
    })
  }

  render(){
	  const { form } = this.props
    const { getFieldProps } = form
	  const HostProps = getFieldProps('host',{
      rules: [
        { validator: this.checkHost }
      ],
    })
    const PortProps = getFieldProps('port',{
      rules: [
        { validator: this.checkPort }
      ],
    })
    const BaseBNProps = getFieldProps('baseDN',{
      rules: [
        { validator: this.checkBaseDN }
      ],
    })
    const UserDNProps = getFieldProps('UserDN',{
      rules: [
        { validator: this.checkUserDN }
      ],
    })
    const PasswordProps = getFieldProps('password',{
      rules: [
        { validator: this.checkPassword }
      ],
    })
    const AgreementProps =  getFieldProps('agreement', {
      rules: [
        { validator: this.checkAgreement }
      ],
    });
    const UserObjectFiltersProps = getFieldProps('UserObjectFilters',{
      rules: [
        { validator: this.checkUserObjectFilters }
      ],
    })
    const UserEmailProps = getFieldProps('UserEmail',{
      rules: [
        { validator: this.checkUserEmail }
      ],
    })
    const UserObjectProps = getFieldProps('UserObject',{
      rules: [
        { validator: this.checkUserObject }
      ],
    })
    return(
      <div id="account_ldap">
        <div className='alertRow'>通过配置以下信息可将企业用户目录信息同步到该平台。所有接入的成员都默认是普通成员，同步到平台后，可修改成员类型（系统管理员、团队管理员、普通成员）；*为必填字段，其他为选填字段。</div>
        <div className='lastDetails'>
          <div className='title'>上次同步详情</div>
          <div className='container'>
            <div className='imgcomtainer'>
              <Row>
                <Col span={9} className='leftcol'>
                  <img src={MemberImg} alt=""/>
                  <div className='leftcoltips'>平台成员：<span>100</span></div>
                </Col>
                <Col span={6} className='centercol'>
                  <img src={ArrowImg} alt=""/>
                  <Button type="primary" onClick={this.handleSynchronization}>立即同步</Button>
                </Col>
                <Col span={9} className='rightcol'>
                  <img src={LDAPImg} alt=""/>
                  <div className='rightcoltips'>LDAP成员：<span>110</span></div>
                </Col>
              </Row>
            </div>
            <div className="detail rowStandard">
              <Row className='item itemfirst'>
                <Col span={4} className='item_title'><div>上次同步时间</div></Col>
                <Col span={20} className='item_content'><div>2017-05-18 16:32:4</div></Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={4} className='item_title'>上次同步成员</Col>
                <Col span={20} className='item_content'>
                  增<span className='number'>0</span>,
                  覆盖<span className='number'>5</span>,
                  删<span className='number'>2</span>,
                  改<span className='number'>1</span>
                </Col>
              </Row>
              <Row className='item itemfirst'>
                <Col span={4} className='item_title'></Col>
                <Col span={20} className='item_content'>
                  有<span className="number">2</span>个成员因名称不合法而同步失败
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='basicSetup'>
          <div className='title'>基本设置</div>
          <div className="container">
            <Form>
              <div className='type rowPadding'>
                <Row className='itemtype'>
                  <Col span={4} className='item_title'>类型<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>OpenLDAP</Col>
                </Row>
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Host<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...HostProps} placeholder="请输入IP地址或域名"/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Port</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...PortProps} placeholder='例：389'/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Base DN<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...BaseBNProps} placeholder="例：dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='host_port rowPadding'>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>User DN<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserDNProps} placeholder="例：cn=admin, dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>Password<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...PasswordProps} placeholder='请输入密码'/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='synchronous rowPadding'>
                <Row className='firstrow'>
                  <Col span={4} className='item_title'>同步方式<span className='star'>*</span></Col>
                  <Col span={20} className='item_content'>
                    <Radio checked={true}></Radio>仅手动同步
                  </Col>
                </Row>
                <Row className='seconderow'>
                  <Col span={4} className='item_title'></Col>
                  <Col span={20} className='item_content'>
                    仅手动同步，需要手动点击『立即同步』按钮即可将用户目录信息接入到平台，会自动覆盖相同名字的成员，在平台上已删除的LDAP成员会被再次同步到平台上，删除LDAP中已删除成员
                  </Col>
                </Row>
                <Row className='thirdrow'>
                  <Col span={4} className='item_title'>协议</Col>
                  <Col span={20} className='item_content'>
                    <Radio.Group {...AgreementProps}>
                      <Radio key="ldap" value="ldap" className='leftradio'>LDAP</Radio>
                      <Radio key="ldaps" value="ldaps">LDAPS</Radio>   
                    </Radio.Group>
                  </Col>
                </Row>
              </div>
              <div className="userinfo rowPadding">
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户对象过滤器</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserObjectFiltersProps} placeholder="例：cn=admin, dc=demo, dc=com"/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户邮箱属性</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserEmailProps} placeholder='mail'/>
                    </FormItem>
                  </Col>
                </Row>
                <Row className='item_input'>
                  <Col span={4} className='item_title'>用户对象属性</Col>
                  <Col span={20} className='item_content'>
                    <FormItem>
                      <Input {...UserObjectProps} placeholder='cn'/>
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <div className='buttonrow rowPadding'>
                <Row>
                  <Col span={4} className='item_title'></Col>
                  <Col span={20} className='item_content'>
                    <Button className='leftbutton'>取消</Button>
                    <Button type="primary" onClick={this.handleSave}>保存</Button>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
        </div>
        <div className='handle'>
          <div className="title">操作</div>
          <div className="container">
            <div className='tips'>
              <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
              请注意，点击解除企业用户目录集成，可选择仅接触集成或同时移除已经同步的用户，该操作不能被恢复
            </div>
            <div className='remove'>
              <Button className='removeButton' onClick={this.handleLiftIntegration}>解除</Button>
            </div>
          </div>
        </div>

         <Modal
           title="解除集成"
           visible={this.state.LiftIntegrationModalVisible}
           closable={true}
           onOk={this.handleConfirmLiftIntegration}
           onCancel={this.handelCancelLiftIntegration}
           width='570px'
           maskClosable={false}
           wrapClassName="LiftIntegrationModal"
           footer={[
             <Button onClick={this.handelCancelLiftIntegration} size="large">取消</Button>,
             <Button onClick={this.handleConfirmLiftIntegrationOther} size="large">解除集成并移除用户</Button>,
             <Button onClick={this.handleConfirmLiftIntegration} type="primary" size="large">仅解除集成</Button>
           ]}
         >
           <div>
             <div className='title'>是否解除集成企业用户目录?</div>
             <div className='tips'>
               <div className='iconcontainer'>
                 <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
               </div>
               
               <div className='item'>
                 请注意，点击解除企业用户目录集成，可选择仅解除集成或同时移除已经同步的用户，该操作不可被恢复！
               </div>
             </div>
           </div>
         </Modal>






      </div>
    )
  }
}


LDAP = Form.create()(LDAP)

function mapStateToProp(state, props) {

  return {

  }
}


export default connect(mapStateToProp, {

})(LDAP)