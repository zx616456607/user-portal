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
import { Button, Icon, Input, Tabs, Upload, Radio, Form} from 'antd'
import { connect } from 'react-redux'
import { browserHistory }  from 'react-router'
import { getQiNiuToken } from '../../../../actions/upload.js'
import uploadFile from '../../../../common/upload.js'
import EnterpriseComponse from './detail/EnterpriseComponse'
import OtherComponse from './detail/OtherComponse'
import './style/Authentication.less'
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

// const ButtonGroup = Button.Group;

//  个人认证
class Indivduals extends Component {
  constructor(props) {
    super(props)
  }
  beforeUpload(file) {
    const self = this
    this.props.getQiNiuToken('certificate', file.name.trim(), {
      success: {
        func: (result)=> {
          self.setState({
            uptoken: result.upToken
          })
          uploadFile(file, {
            url: result.url,
            method: 'POST',
            headers: {
              ['content-type']: file.type
            },
            body: {
              token: result.upToken,
              file: file
            }
          })
        }
      }
    })
    return false
  }
  render() {
    const props = {
      action: '/upload.do',
      listType: 'picture-card',
      defaultFileList: [{
        uid: -1,
        name: 'xxx.png',
        status: 'done',
        url: 'https://os.alipayobjects.com/rmsportal/NDbkJhpzmLxtPhB.png',
        thumbUrl: 'https://os.alipayobjects.com/rmsportal/NDbkJhpzmLxtPhB.png'
      }],
      onPreview: (file) => {
        this.setState({
          priviewImage: file.url,
          priviewVisible: true
        })
      }
    }
    return (
      <div className="Indivduals">
        <div className="description">个人用户通过个人认证可获得5元代金券，请按照提示填写本人的真实照片</div>
        <div className="auth-status">
          <svg className="auth-img"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img"></use></svg>
          <span className="auth-text">个人认证</span>
          <Button type="small">未认证</Button>
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <div className="user-info">
            <p>
              <span className="key">真实姓名 <span className="important">*</span></span>
              <Input className="input" size="large" />
            </p>
            <p>
              <span className="key">身份证号 <span className="important">*</span></span>
              <Input className="input" size="large" />
            </p>
            <p>
              <span className="key">手持身份证照片 <span className="important">*</span></span>
              <div className="upload">
                <Upload {...props}  beforeUpload={(file) => {
                  this.beforeUpload(file)
                }} customRequest={() => true }>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>1.持有者需正面、免冠、未化妆、双手持身份证且露出手臂</li>
                <li>2.身份证为本人持有，不得盗用他人身份证且不得遮挡持有者面部，身份证全部信息（包换身份证号、头像）需清晰可辩认</li>
                <li>3.照片未经任何软件编辑修改</li>
                <li>4.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
            </p>
            <p>
              <span className="key">身份证反面扫描 <span className="important">*</span></span>
              <div className="upload">
                <Upload {...props} beforeUpload={ (file) =>
                  this.beforeUpload(file)
                }>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传照片</div>
                </Upload>
              </div>
              <ul className="chk">
                <li>&nbsp;</li>
                <li>1.身份证信息清晰可辩认</li>
                <li>2.上传照片支持（gif/jpg/jpeg/png/bmp 图片格式，大小不超过3M）</li>
              </ul>
              <div style={{ clear: 'both' }}></div>
            </p>
          </div>
          <div className="info-footer" style={{padding:'0 50px'}}>
            <Button size="large">提交</Button>
          </div>
        </div>

      </div>
    )
  }
}

function indivdualsMapStateToProp(state, props) {
  return {
    //token: state.upload.qiniuToken
  }
}

Indivduals = connect(indivdualsMapStateToProp, {
  getQiNiuToken
})(Indivduals)

// 企业 认证
class Enterprise extends Component {
  constructor(props) {
    super(props)
    this.state = {
       trytype:1
    }
  }
  changeType(e) {
    this.setState({trytype: e})
  }
  
  render() {

    const enterprise = (
      <div><Radio value="1" checked ={this.state.trytype =='1' ? true : false}></Radio> 企业</div>
    )
    const otherwise = (
      <div><Radio value="2" checked ={this.state.trytype =='2' ? true : false}></Radio>其他组织</div>
    )
    return (
      <div className="Indivduals">
        <div className="description">企业用户通过企业认证可获得50元代金券，认证的企业用户的资源配额拥有比未认证的用户更高的配额。请根据您的组织类型选择类型选择认证，企业指领取营业执照的有限责任公司、股份有限公司、非公司企业法人、合伙企业、个人独资企业及其分支机构、来华从事经营的外国（地区）企业，及其他经营单位；其他组歌指在中华人民共和国境内依法注册、依法登记的机关、事业单位、社会团体、学校和民办非企业单位和其他机构。</div>
        <div className="auth-status">
          <svg className="auth-img"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#auth-img2"></use></svg>
          <span className="auth-text">企业认证</span>
          <Button type="small">未认证</Button>
        </div>
        <Tabs defaultActiveKey="1" type="card" id="sfdsf8888"  onChange={(e)=> this.changeType(e)} value={this.state.trytype}>
          <TabPane tab="请选择组织类型" key="3" disabled ></TabPane>
          <TabPane tab={ enterprise } key="1"><EnterpriseComponse /></TabPane>
          <TabPane tab={ otherwise } key="2"><OtherComponse /></TabPane>
        </Tabs>
         
      </div>
    )
  }
}

function enterpriseStateToProps(state, props) {
  return {
   // token: state.upload.qiniuToken
  }
}

Enterprise = connect(enterpriseStateToProps, {
  getQiNiuToken
})(Enterprise)


class Authentication extends Component {
  constructor(props) {
    super(props)
    this.state= {
      currentHash: '#cert-company'
    }
  }
  componentWillReceiveProps(nextProps) {
     if(nextProps.hash === this.props.hash) {
       return
     }
     this.setState({
       currentHash: nextProps.hash
     })
  }
  tabClick(e) {
    console.log(e)
    console.log(this.state.currentHash)
    let hash = '#cert-company'
    if(e === '2') {
      hash = '#cert-user'
    }
    if(hash === this.state.currentHash) {
      return
    }
    this.setState({
      currentHash: hash
    })
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      hash
    })
  }
  render() {
    const { hash } = this.props
    let activeKey = '2'
    if(hash.indexOf('company') >= 0) {
      activeKey = '1'
    }
    return (
      <div className="Authentication" >
        <Tabs  type="card" activeKey={activeKey} onTabClick={(e) => this.tabClick(e)}> 
          <TabPane tab="企业用户" key="1"><Enterprise /></TabPane>
          <TabPane tab="个人用户" key="2"><Indivduals /></TabPane>
        </Tabs>
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(Authentication)
