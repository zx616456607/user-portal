/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User info - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form} from 'antd'
import { connect } from 'react-redux'
import Authentication from './Authentication'
import './style/UserInfo.less'
import PhoneRow from './detail/PhoneRow'
import EmallRow from './detail/EmallRow'
import PasswordRow from './detail/PassowrdRow'

const TabPane = Tabs.TabPane;
const createForm = Form.create;


class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editEmall: false,
      editPsd: false,
      editPhone: false,
      uploadModalVisible: false,
      userIconsrc: 'avatars.png'
    }
  }
  closeEdit(editType) {
    this.setState({
      [editType]: false
    })
  }
  UploadIconModal() {
    console.log(this)
    console.log('comem in')
  }
  setUserIcon(icon) {
    this.setState({
      userIconsrc: icon
    })
  }


  render() {
    // const {getFieldProps} = this.props.form
    const propsAction = {
      name: 'file',
      action: '/upload.do',
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功。`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败。`);
        }
      }
    }
   
    return (
      <div className="baseInfo">
        <div className="topBox">
          <div className="userimage">
            <img src="/img/standard/avatars.png" />
          </div>
          <div className="topbar userBtn">
            <p>Hi, 换个吊炸天的头像吧！</p>
            <Button type="primary" onClick={() => this.setState({ uploadModalVisible: true })}>更换头像</Button>
          </div>
          <div className="to-recharge">
            <p className="money">105元</p>
            <p className="money-desc">我的账户余额</p>
            <Button type="primary">去充值</Button>
          </div>
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <ul className="info-list">
            <li>
              <span className="key">用户名</span>
              <span className="value">
                china
              <Button className="btn-auth" style={{ marginLeft: '10px' }}>点击认证</Button></span>
            </li>
            <li>
              <span className="key">企业名称</span>
              <span className="value">
                北京云思畅想有限责任公司
                <Button className="btn-auth" style={{ marginLeft: '10px' }}>点击认证</Button> &nbsp;
                <Icon type="question-circle-o" />
              </span>
            </li>
            {this.state.editEmall ?
              <li>
                <EmallRow scope ={this} />
              </li>
              :
              <li>
                <span className="key">邮箱</span>
                <span className="value">pupu@tenxcloud.com</span>
                <Button onClick={() => this.setState({ editEmall: true })}>修改邮箱</Button>
              </li>
            }
            {this.state.editPsd ?
              <li>
                <PasswordRow scope={this} />
              </li>
              :
              <li>
                <span className="key">密码</span>
                <span className="value" style={{color:'#5cb85c'}}>已设置</span>
                <Button type="primary" onClick={() => this.setState({ editPsd: true })}>修改密码</Button>
              </li>
            }
            {this.state.editPhone ?
            <li>
              <PhoneRow scope ={this} />
            </li>
            :
            <li>
              <span className="key">手机</span>
              <span className="value">13520251666</span>
              <Button type="primary" onClick={() => this.setState({ editPhone: true })}>修改手机</Button>
            </li>
          }

          </ul>
        </div>

        <div className="wechatBox">
          <div className="hand">
            <span className="title">登录授权</span>
            <span className="other">第三方</span>
          </div>
          <div className="send-tu">
            <div className="backcolor">
              <i className="fa fa-wechat"></i>
            </div>
            <Button className="btn-success">立即绑定</Button>
          </div>
        </div>
        <Modal title={'更换头像'} className="uploadIconModal" visible={this.state.uploadModalVisible}
          onCancel={() => this.setState({ uploadModalVisible: false })} onOk={() => this.UploadIconModal()} width={600}
          >
          <Tabs defaultActiveKey="11">
            <TabPane tab="个性头像选择" key='11'>
              <div className="images">
                <div className="leftBox">
                  <img src="/img/standard/icon-1.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-1.jpg')} />
                  <img src="/img/standard/icon-2.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-2.jpg')} />
                  <img src="/img/standard/icon-3.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-3.jpg')} />
                  <img src="/img/standard/icon-4.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-4.jpg')} />
                  <img src="/img/standard/icon-5.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-5.jpg')} />
                  <img src="/img/standard/icon-6.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-6.jpg')} />
                  <img src="/img/standard/icon-1.jpg" className="userIcon" onClick={() => this.setUserIcon('icon-1.jpg')} />
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src={`/img/standard/${this.state.userIconsrc}`} />
                  </div>
                  <div>头像预览</div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="本地头像" key='12'>
              <div className="images">
                <div className="leftBox">
                  <br />
                  <p className="row">从电脑里挑选一张喜欢的图作为头像吧</p>
                  <Upload {...propsAction}>
                    <Input size="large" placeholder="选择一张照片" style={{ width: '66%' }} />
                    <Button type="primary" style={{ marginLeft: "20px" }}>本地照片
                    </Button>
                  </Upload>
                  <p className="row">支持jpg/png 格式图片，文件需小于2M</p>
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src="/img/standard/avatars.png" />
                  </div>
                  <div>头像预览</div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    )
  }

}

class UserInfo extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="public-userinfo">
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1"><BaseInfo /></TabPane>
          <TabPane tab="认证信息" key="2"><Authentication /></TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect()(UserInfo)
