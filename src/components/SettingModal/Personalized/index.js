/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  personalized setting
 *
 * v0.1 - 2017-7-17
 * @author BaiYu
 */
import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Card,Button,Icon,Row,Col,Input,Switch,Modal,Upload } from 'antd'
import './style/Personalized.less'
import tenxImgIcon from '../../../assets/img/icon/tenxImg.svg'
import tenxColorIcon from '../../../assets/img/icon/tenxColor.svg'
import tenxTextIcon from '../../../assets/img/icon/tenxText.svg'
import NotificationHandler from '../../../common/notification_handler'
import { setBackColor } from '../../../actions/personalized'
class Personalized extends Component{
  constructor(props){
    super(props)
    this.state = {
      switch: false,
      siderColor:'1'
    }
  }
  componentWillMount() {
    document.title = '个性外观 | 时速云'
  }
  changeSwitch(e) {
    this.setState({switch:e})
  }
  setSliderColor(c) {
    this.setState({siderColor:c})
    this.props.setBackColor(c-1)
  }
  restoreDefault(type) {
    this.setState({[type]:true})
  }
  restoreLogo() {
    console.log('this is restore default logo')
  }
  restoreText() {
    console.log('this is restore default text')
  }
  restoreColor() {
    console.log('this is restore default color')
  }
  saveColor() {
    console.log('saveColor')
  }
  render(){
    const uploadParams = {
      name: 'file',
      // showUploadList: false,
      action: '/static/',
      beforeUpload(file) {
        const notificat = new NotificationHandler()
        console.log('filetype,',file.type)
        const isJPG = file.type === 'image/jpeg';
        if (file.type !== 'image/jpeg'|| file.type !== 'image/png' || file.type !== 'image/gif') {
          notificat.info('只能上传 jpg、png、gif 文件哦！')
          return false
        }
        if (file.size > 2 * 1024 * 1024) {
          notificat.error('头像图片大小应小于2M！')
          return false
        }
        return true;
      }
    };
    return (
      <QueueAnim className="Personalized" type="right">
        <div id='Personalized' key="Personalized">
          <div className="toptitle">个性外观</div>
          <Card className="image-push" title={[<img className="img-icon" src={tenxImgIcon} key="image" />,<span key="span-1">Logo 定制  支持jpg/png/gif 格式图片，文件需小于2M （推荐png格式）</span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('logo')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>导航图片（展开）</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换左侧导航顶部展开时图标，建议大小120px * 30px</div>
                  <span className="wrap-image">
                    <img className="logo" src="/public/img/logo.377057cc.png" />
                    <Icon type="plus" className="push-icon"/>
                    <Upload {...uploadParams} className="uploadStyle">
                      <img className="logo" src="/public/img/logo.377057cc.png" />
                    </Upload>
                  </span>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>导航图片（收起）</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换左侧导航顶部收起时图标，建议大小40px * 40px</div>
                  <span className="wrap-image">
                    <img className="logo" src="/public/img/logo.377057cc.png" />
                    <Icon type="plus" className="push-icon"/>
                    <Upload {...uploadParams} className="uploadStyle">
                      <img className="logo" src="/public/img/logo.377057cc.png" />
                    </Upload>
                  </span>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>浏览器图标</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换浏览器标签图标，建议大小40px * 40px</div>
                  <span className="wrap-image">
                    <img className="logo" src="/public/img/logo.377057cc.png" />
                    <Icon type="plus" className="push-icon"/>
                    <Upload {...uploadParams} className="uploadStyle">
                      <img className="logo" src="/public/img/logo.377057cc.png" />
                    </Upload>
                  </span>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>登录图片</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换登录顶部左侧图标，建议大小120px * 30px</div>
                  <span className="wrap-image">
                    <img className="logo" src="/public/img/logo.377057cc.png" />
                    <Icon type="plus" className="push-icon"/>
                    <Upload {...uploadParams} className="uploadStyle">
                      <img className="logo" src="/public/img/logo.377057cc.png" />
                    </Upload>
                  </span>
              </Col>
            </Row>
          </Card>

          <Card className="image-push" title={[<img className="img-icon" src={tenxTextIcon} key="image-text" />,<span key='span-text'>文字定义</span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('tenxText')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>产品名称</Col>
              <Col span="20" style={{width:600}}>
                <div className="row-text">此处文字用于替换平台上的“时速云 / 时速云企业版”字样，包换登录页、浏览器标签文字；</div>
                <Input style={{width:200}}  size="large" placeholder="请输入产品名称"  />
                <Button size="large" style={{margin:'0 10px'}}>取消</Button>
                <Button size="large" type="primary">保存</Button>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>版权声明</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">切换是否显示登录页公司名“© 2017 北京云思畅想科技有限公司”</div>
                <Switch defaultChecked={this.state.switch} onChange={(e)=> this.changeSwitch(e)} checkedChildren="ON" unCheckedChildren="OFF" className="inswitch"/>
                <span className="switchText">{this.state.switch ? '开启':'关闭'}</span>
              </Col>
            </Row>
          </Card>

          <Card className="image-push" title={[<img className="img-icon" src={tenxColorIcon} key="image-color" />,<span key='color-span'>颜色定制</span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('tenxColor')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>选择颜色</Col>
              <Col span="20">
                <div className="row-text">此颜色是左侧导航栏颜色，为了更好的搭配您自定义的LOGO；</div>
                <div className="colorMap">
                  <span className={this.state.siderColor=='1' ?'list color-1 selected':'list color-1'} onClick={()=> this.setSliderColor(1)}></span>
                  <span className={this.state.siderColor=='2' ?'list color-2 selected':'list color-2'} onClick={()=> this.setSliderColor(2)}></span>
                  <span className={this.state.siderColor=='3' ?'list color-3 selected':'list color-3'} onClick={()=> this.setSliderColor(3)}></span>
                  <span className={this.state.siderColor=='4' ?'list color-4 selected':'list color-4'} onClick={()=> this.setSliderColor(4)}></span>
                  <span className={this.state.siderColor=='5' ?'list color-5 selected':'list color-5'} onClick={()=> this.setSliderColor(5)}></span>
                  <span className={this.state.siderColor=='6' ?'list color-6 selected':'list color-6'} onClick={()=> this.setSliderColor(6)}></span>
                  <span className={this.state.siderColor=='7' ?'list color-7 selected':'list color-7'} onClick={()=> this.setSliderColor(7)}></span>
                  <span className={this.state.siderColor=='8' ?'list color-8 selected':'list color-8'} onClick={()=> this.setSliderColor(8)}></span>

                </div>
                <div className="colorButton">
                  <Button size="large">取消</Button>
                  <Button size="large" style={{margin:'0 10px'}} type="primary" onClick={()=> this.saveColor()}>保存</Button>
                </div>
              </Col>
            </Row>

          </Card>
          <Modal visible={this.state.logo} title="恢复默认设置图标"
            onOk={()=> this.restoreLogo()}
            onCancel={()=> this.setState({logo: false})}
          >
            <div className="confirmText">是否确定将所有图标恢复至默认设置？</div>
          </Modal>
          <Modal visible={this.state.tenxText} title="恢复默认设置文字"
            onOk={()=> this.restoreText()}
            onCancel={()=> this.setState({tenxText: false})}
          >
            <div className="confirmText">是否确定将文字定制中内容恢复至默认设置？</div>
          </Modal>
          <Modal visible={this.state.tenxColor} title="恢复默认设置颜色"
            onOk={()=> this.restoreColor()}
            onCancel={()=> this.setState({tenxColor: false})}
          >
            <div className="confirmText">是否确定将左侧导航的颜色恢复至默认设置？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  console.log('state---',state.personalized)
  return {

  }
}

export default connect(mapStateToProps,{
  setBackColor
})(Personalized)