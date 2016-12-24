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
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form, Spin, message} from 'antd'
import { connect } from 'react-redux'
import { browserHistory, Link } from 'react-router'
import Authentication from './Authentication'
import './style/UserInfo.less'
import PhoneRow from './detail/PhoneRow'
import EmailRow from './detail/EmailRow'
import PasswordRow from './detail/PassowrdRow'
import { loadStandardUserInfo, changeUserInfo } from '../../../../actions/user.js'
import { getQiNiuToken } from '../../../../actions/upload.js'
import NotificationHandler from '../../../../common/notification_handler.js'
import uploadFile from '../../../../common/upload.js'

const TabPane = Tabs.TabPane
const createForm = Form.create

class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editEmail: false,
      editPsd: (props.hash === '#edit_pass' ? true : false),
      editPhone: false,
      uploadModalVisible: false,
      userIconsrc: 'avatars.png',
      disabledButton: false,
      currentKey: '11'
    }
  }
  componentWillMount() {
    const self = this
    const { loadStandardUserInfo } = this.props
    loadStandardUserInfo({
      success: {
        func: (result) => {
          self.setState({
            userIconsrc: result.userInfo.avatar
          })
        }
      }
    })
  }
  closeEdit(editType) {
    this.setState({
      [editType]: false
    })
  }
  UploadIconModal() {
    if(this.state.disabledButton) return
    if(this.state.file) {
      this.setState({
        disabledButton: true
      })
      const self = this
      const fileName = this.state.fileName
      const file = this.state.file
      this.props.getQiNiuToken('certificate', fileName, {
        success: {
          func: (result) => {
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
              body: body,
              size: 2 * 1024 * 1024,
              fileType: ['jpg', 'png', 'gif']
            }).then(response => {
              const url = `${result.origin}/${response.key}`
              self.setState({
                userIconsrc: url,
                disabledButton: false
              })
              self.changeUserAvator(url)
            }).catch(err => {
              self.setState({
                disabledButton: false
              })
            })
          }
        }
      })
      return
    }
    const userDetail = this.props.user.userInfo
    const notification = new NotificationHandler()
    if(userDetail.avatar === this.state.userIconsrc) {
      notification.error('请选和现在头像不同的图片')
      return
    }
    this.changeUserAvator(this.state.userIconsrc)
  }
  changeUserAvator(avatar) {
    const notification = new NotificationHandler()
    notification.spin('更新头像中')
    this.setState({
      disabledButton: true
    })
    const self = this
    this.props.changeUserInfo({
      avatar
    }, {
        success: {
          func: () => {
            self.setState({
              disabledButton: false,
              uploadModalVisible: false
            })
            notification.close()
            notification.success('更换头像成功')
          }
        },
        failed: {
          func: (result) => {
            notification.close()
            notification.error(result.message)
            self.setState({
              disabledButton: false
            })
          }
        }
      })
  }
  beforeUpload(file) {
    const self = this
    const namespace = this.props.namespace
    const index = file.name.lastIndexOf('.')
    let ext = file.name.substring(index + 1)
    const fileType = ['jpg', 'png', 'gif']
    const notification = new NotificationHandler()
    if (fileType.indexOf(ext) < 0) {
      notification.error('头像格式仅支持jpg/png/gif')
      this.setState({
        disabledButton: true
      })
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      notification.error('头像图片大小应小于2mb')
      this.setState({
        disabledButton: true
      })
      return false
    }
    let fileName = namespace + (new Date() - 0) + '.' + ext
    const filePath = this.uploadInstance.refs.upload.refs.inner.refs.file.value
    const reader = new FileReader()
    const dataUrl = reader.readAsDataURL(file)
    reader.addEventListener('load', function () {
      self.setState({
        filePath: filePath,
        file: file,
        fileName: fileName,
        userIconsrc: reader.result
      })
    }, false)
    return false
  }
  setUserIcon(icon) {
    this.setState({
      userIconsrc: icon
    })
  }
  cert(type) {
    let { pathname, hash } = this.props
    hash = `#cert-${type}`
    browserHistory.push({
      pathname,
      hash
    })
  }
  getCertStatus(status) {
    switch(status) {
      case 1: {
        return '待审核'
      }
      case 2: {
        return '审核中'
      }
      case 3: {
        return '认证失败'
      }
      case 4: {
        return '认证成功'
      }
      default: {
        return '未认证'
      }
    }
  }
  onTabClick(key) {
    if(key == this.state.currentKey){
      return
    }
    const user = this.props.user.userInfo
    this.setState({
      file: '',
      currentKey: key,
      userIconsrc: user.avatar,
      filePath: '',
      fileName: ''
    })
  }
  hideModal() {
    this.setState({ uploadModalVisible: false })
    const user = this.props.user.userInfo
    this.setState({
      file: '',
      userIconsrc: user.avatar,
      filePath: '',
      fileName: ''
    })
  }
  renderEdition(envEdition) {
    return (
      <span className="value">
        {
          envEdition == 0
          ? <span>标准版<img className="edition" alt="升级专业版" title="升级专业版" src="/img/version/proIcon-gray.png"/></span>
          : <span>专业版<img className="edition" alt="专业版" title="专业版" src="/img/version/proIcon.png"/></span>
        }
        <Button style={{ marginLeft: '10px' }} onClick={() => browserHistory.push('/account/version#pro')}>
          {
            envEdition == 0
            ? '了解专业版'
            : '查看详情'
          }
        </Button> &nbsp;
        <Icon type="question-circle-o" />
      </span>
    )
    if (envEdition == 0) {
      return (
        <span className="value">
          <span>标准版<img className="edition" alt="升级专业版" title="升级专业版" src="/img/version/proIcon-gray.png"/></span>
          <Button style={{ marginLeft: '10px' }} onClick={() => browserHistory.push('/account/version#pro')}>
            了解专业版
          </Button> &nbsp;
          <Icon type="question-circle-o" />
        </span>
      )
    }
    return (
      <span className="value">
        <span>专业版<img className="edition" alt="专业版" title="专业版" src="/img/version/proIcon.png"/></span>
        <Button style={{ marginLeft: '10px' }} onClick={() => browserHistory.push('/account/version')}>
          查看详情
        </Button> &nbsp;
        <Icon type="question-circle-o" />
      </span>
    )
  }
  render() {
    // const {getFieldProps} = this.props.form
    let { user } = this.props
    if(!user) {
      return <div></div>
    }
    if(user.isFetching) {
      return (
        <div className="loadingBox">
            <Spin size="large"></Spin>
          </div>
      )
    }
    const userDetail = user.userInfo
    const cert = user.certInfo
    let userCert, companyCert
    if(!cert) {
      return (<div></div>)
    }
    cert.data.forEach(item => {
      if(item.certType == '1') {
        userCert = item
        return
      }
      companyCert = item
    })
    let disabledUserCert = false
    if(!userCert) {
      userCert = {
        userName: userDetail.userName
      }
      if(companyCert) {
        disabledUserCert = true
      }
    }
    if(!companyCert) {
      companyCert = {}
    }
    return (
      <div className="baseInfo">
        <div className="topBox">
          <div className="userimage">
            <img src={`${userDetail.avatar}`} />
          </div>
          <div className="topbar userBtn">
            <p>Hi, 换个自己喜欢的头像吧！</p>
            <Button type="primary" onClick={() => this.setState({ uploadModalVisible: true })}>更换头像</Button>
          </div>
          <div className="to-recharge">
            <p className="money">{userDetail.balance / 100 }元</p>
            <p className="money-desc">我的帐户余额</p>
            <Button type="primary"><Link to="/account/balance/payment">去充值</Link></Button>
          </div>
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <ul className="info-list">
            <li>
              <span className="key">用户名</span>
              <span className="value">
                {userDetail.userName}
              <Button className="btn-auth" disabled={disabledUserCert} style={{ marginLeft: '10px' }} onClick={() => this.cert('user')}>{this.getCertStatus(userCert.status)}</Button></span>
            </li>
            <li>
              <span className="key">企业名称</span>
              <span className="value">
                {companyCert.enterpriseName}
                <Button className="btn-auth" style={{ marginLeft: '10px' }} onClick={() => this.cert('company')}>{this.getCertStatus(companyCert.status)}</Button> &nbsp;
                <Icon type="question-circle-o" />
              </span>
            </li>
            <li>
              <span className="key">版本</span>
              {this.renderEdition(userDetail.envEdition)}
            </li>
            {this.state.editEmail ?
              <li>
                <EmailRow scope ={this} email={userDetail.email} />
              </li>
              :
              <li>
                <span className="key">邮箱</span>
                <span className="value">{userDetail.email}</span>
                <Button onClick={() => this.setState({ editEmail: true })}>修改邮箱</Button>
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
              <span className="value">{userDetail.phone}</span>
              <Button type="primary" onClick={() => this.setState({ editPhone: true })}>修改手机</Button>
            </li>
          }
          </ul>
        </div>

        <div className="wechatBox" style={{display: 'none'}}>
          <div className="hand">
            <span className="title">登录授权</span>
            <span className="other">第三方</span>
          </div>
          <div className="send-tu">
            <div className="backcolor">
              <i className="fa fa-wechat"></i>
            </div>
            <Button className="btn-success" title="即将开放" disabled>立即绑定</Button>
          </div>
        </div>
        <Modal title={'更换头像'} className="uploadIconModal" visible={this.state.uploadModalVisible}
          onCancel={() => this.hideModal()} onOk={() => this.UploadIconModal()} width={600}
          >
          <Tabs defaultActiveKey="11" onTabClick={key => this.onTabClick(key)}>
            <TabPane tab="个性头像选择" key="11">
              <div className="images">
                <div className="leftBox">
                  <img src="/img/standard/icon-1.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-1.jpg')} />
                  <img src="/img/standard/icon-2.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-2.jpg')} />
                  <img src="/img/standard/icon-3.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-3.jpg')} />
                  <img src="/img/standard/icon-4.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-4.jpg')} />
                  <img src="/img/standard/icon-5.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-5.jpg')} />
                  <img src="/img/standard/icon-6.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-6.jpg')} />
                  <img src="/img/standard/icon-1.jpg" className="userIcon" onClick={() => this.setUserIcon('/img/standard/icon-1.jpg')} />
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src={`${this.state.userIconsrc}`} />
                  </div>
                  <div>头像预览</div>
                </div>
              </div>
            </TabPane>
            <TabPane tab="本地头像" key="12">
              <div className="images">
                <div className="leftBox">
                  <br />
                  <p className="row">从电脑里挑选一张喜欢的图作为头像吧</p>
                  <Upload beforeUpload={(file) => this.beforeUpload(file)} ref={(instance) => this.uploadInstance = instance } accept="image/*">
                    <Input size="large" placeholder="选择一张照片" style={{ width: '66%' }} value={this.state.filePath}/>
                    <Button type="primary" style={{ marginLeft: '20px' }}>本地照片
                    </Button>
                  </Upload>
                  <p className="row">支持jpg/png/gif 格式图片，文件需小于2M</p>
                </div>
                <div className="rightBox">
                  <div className="useIcon">
                    <img src= {this.state.userIconsrc} />
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

function baseInfoMapStateToProps(state) {
  return {
    user: state.user.standardUserDetail
  }
}

BaseInfo = connect(baseInfoMapStateToProps, {
  loadStandardUserInfo,
  changeUserInfo,
  getQiNiuToken
})(BaseInfo)


class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentHash: '#user'
    }
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.hash === nextProps.hash) {
      return
    }
    this.setState({
      currentHash: nextProps.hash
    })
  }
  tabChange(e) {
    const { history } = this.props
    let hash = '#base'
    if(e === '2') {
      hash = '#cert'
    }
    if(hash === this.state.currentHash) {
      return
    }
    this.setState({
      currentHash: hash
    })
    const { pathname } = this.props
    browserHistory.push({
      pathname: pathname,
      hash
    })
  }
  render() {
    const hash = this.props.hash
    let activeKey = '1'
    if(hash.indexOf('#cert') >= 0) {
      activeKey = '2'
    }
    return (
      <div id="public-userinfo">
        <Tabs activeKey={activeKey} onTabClick={(e)=> { this.tabChange(e)}}>
          <TabPane tab="基本信息" key="1"><BaseInfo pathname={this.props.pathname} hash={hash} namespace = {this.props.namespace}/></TabPane>
          <TabPane tab="认证信息" key="2"><Authentication pathname={this.props.pathname} hash={hash}/></TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { pathname, hash } = props.location
  return {
    pathname,
    hash,
    namespace: state.entities.loginUser.info.namespace
  }
}


export default connect(mapStateToProps, {})(UserInfo)
