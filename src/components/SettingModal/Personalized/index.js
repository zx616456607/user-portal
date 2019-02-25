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
import NotificationHandler from '../../../components/Notification'
import { getPersonalized,isCopyright,updateLogo,restoreDefault } from '../../../actions/personalized'
import { setBackColor,loadLoginUserDetail } from '../../../actions/entities'

class Personalized extends Component{
  constructor(props){
    super(props)
    this.state = {
      // switch: false,
      siderColor:'1',
      productName: null,
    }
    this.updateInfo = this.updateInfo.bind(this)
  }
  loadInfo(scope,type){
    scope.props.getPersonalized({
      success:{
        func:(ret)=>{
          if (type && type === 'logo') {
            return
          }
          document.title = `个性外观 | ${ret.company.productName}`
          scope.setState({siderColor:ret.colorThemeID})
          this.setState({
            productName: ret.company.productName,
          })
        }
      }
    })

  }
  componentWillMount() {
    this.loadInfo(this)
  }
  componentWillUnmount() {
    const {colorThemeID} = this.props.oemInfo
    this.props.setBackColor(colorThemeID)
  }
  updateInfo(body) {
    const notificat = new NotificationHandler()
    const _this = this
    this.props.isCopyright(body, {
      success: {
        func: ()=> {
          _this.loadInfo(_this)
          notificat.success('修改成功！')
          _this.setState({loading: false})

        },
        isAsync: true
      },
      failed: {
        func:()=> {
          notificat.error('修改失败！')
        }
      }
    })
  }
  changeSwitch(e) {
    // bai 是否显示版权信息
    const { oemInfo,getPersonalized } = this.props
    const body = {
      "company": {
      "name": oemInfo.company.name,
      "visible": e,
      "productName": oemInfo.company.productName,
      }
    }
    this.updateInfo(body)
  }
  /* clearProductName() {
    const { oemInfo } = this.props
    this.setState({
      productName: oemInfo.company.productName,
    })
  } */
  saveproductName() {
    // bai 更新产品名称
    const { oemInfo } = this.props
    const { productName } = this.state
    const body = {
      "company": {
      "name": oemInfo.company.name,
      "productName": productName || '',
      "visible": oemInfo.company.visible
      }
    }
    this.updateInfo(body)
    this.setState({loading: true})
  }

  beforeUpload(file, type) {
    const notificat = new NotificationHandler()
    if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/gif' && file.type !== 'image/x-icon' ) {
      notificat.info('只能上传 jpg、png、gif 文件哦！')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      notificat.error('图片大小应小于2M！')
      return false
    }
    // return true;
    const data = new FormData()
    data.append('file', file)
    data.append('key',type)

    if (type == 'favoriteIcon') {
      data.append('format','ico')
    } else {
      data.append('format',file.type.split('/')[1])
    }
    const _this = this
    this.props.updateLogo(data,{
      success:{
        func:()=>{
          _this.loadInfo(_this,'logo')
          if (type == 'favoriteIcon') {
            notificat.info('修改成功，刷新浏览器可看到效果！')
            return
          }
          notificat.success('修改成功！')
          if (type == 'loginLogo') {
            return
          }
          _this.props.loadLoginUserDetail()
        },
        isAsync: true
      }
    })
    return false
  }
  setSliderColor(c) {
    this.setState({siderColor:c})
    this.props.setBackColor(c)
  }
  handCancelTheme() {
    const { oemInfo,setBackColor } = this.props
    setBackColor(oemInfo.colorThemeID)
    this.setState({siderColor:oemInfo.colorThemeID})
  }
  restoreDefault(type) {
    this.setState({[type]:true})
  }
  restoreTheme(type) {
    const _this = this
    const notificat = new NotificationHandler()
    this.props.restoreDefault(type, {
      success:{
        func:()=> {
          notificat.success('恢复成功！')
          _this.loadInfo(_this)
          _this.props.loadLoginUserDetail()
        },
        isAsync: true
      }
    })
    this.setState({
      logo:false,
      tenxText:false,
      tenxColor:false
    })

  }
  saveColor() {
    const body = {
      colorThemeID: this.state.siderColor
    }
    this.updateInfo(body)
  }
  render(){
    const { oemInfo } = this.props
    return (
      <QueueAnim className="Personalized" type="right">
        <div id='Personalized' key="Personalized">
          <div className="toptitle">个性外观</div>
          <Card className="image-push" title={[<img className="img-icon" src={tenxImgIcon} key="image" />,<span key="span-1">Logo定制  <span style={{fontSize:12,paddingLeft:30}}>支持jpg/png/gif 格式图片，文件需小于2M （推荐png格式）</span></span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('logo')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>导航图片（展开）</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换左侧导航顶部展开时图标，建议大小120px * 30px</div>
                <Upload beforeUpload={(file)=> this.beforeUpload(file,'naviExpand')}>
                  <span className="wrap-image">
                    <Icon type="plus" className="push-icon"/>
                    <img className="logo" src={ oemInfo.naviExpand } />
                  </span>
                </Upload>
              </Col>
            </Row>
            {/* <Row className="image-row">
              <Col span="3"style={{width:150}}>导航图片（收起）</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换左侧导航顶部收起时图标，建议大小40px * 40px</div>
                <Upload beforeUpload={(file)=> this.beforeUpload(file,'naviShrink')}>
                  <span className="wrap-image" style={{width:100}}>
                    <Icon type="plus" className="push-icon"/>
                    <img className="logo" src={ oemInfo.naviShrink } />
                  </span>
                </Upload>
              </Col>
            </Row> */}
            <Row className="image-row">
              <Col span="3"style={{width:150}}>浏览器图标</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换浏览器标签图标，建议大小40px * 40px</div>
                <Upload beforeUpload={(file)=> this.beforeUpload(file,'favoriteIcon')}>
                  <span className="wrap-image" style={{width:100}}>
                    <Icon type="plus" className="push-icon" />
                    <img className="logo" src={ oemInfo.favoriteIcon } />
                  </span>
                </Upload>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>登录图片</Col>
              <Col span="20" style={{width:400}}>
                <div className="row-text">此处图片用于替换登录顶部左侧图标，建议大小120px * 30px</div>
                <Upload beforeUpload={(file)=> this.beforeUpload(file,'loginLogo')}>
                  <span className="wrap-image">
                    <img className="logo" src={ oemInfo.loginLogo } />
                    <Icon type="plus" className="push-icon"/>
                  </span>
                </Upload>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>邮箱LOGO</Col>
              <Col span="20">
                <div className="row-text">此处图片用于替换系统邮件左下角 logo 图标，如告警邮件、构建邮件及其它敏感操作邮件等，建议大小120px*30px</div>
                <Upload beforeUpload={(file)=> this.beforeUpload(file,'emailLogo')}>
                  <span className="wrap-image">
                    <img className="logo" src={ oemInfo.emailLogo } />
                    <Icon type="plus" className="push-icon"/>
                  </span>
                </Upload>
              </Col>
            </Row>

          </Card>

          <Card className="image-push" title={[<img className="img-icon" src={tenxTextIcon} key="image-text" />,<span key='span-text'>文字定制</span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('tenxText')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>产品名称</Col>
              <Col span="20" style={{width:600}}>
                <div className="row-text">此处文字用于替换平台上的产品标识字样；</div>
                <div className="image-flex">
                  <Input
                    style={{width:200}}
                    id="productName"
                    size="large"
                    placeholder="请输入产品名称"
                    value={this.state.productName}
                    onChange={e => this.setState({ productName: e.target.value })}
                  />
                  {/* <Button size="large" onClick={()=> this.clearProductName()} style={{margin:'0 10px'}}>取消</Button> */}
                  <Button
                    size="large"
                    type="primary"
                    loading={this.state.loading}
                    onClick={()=> this.saveproductName()}
                    style={{margin:'0 10px'}}
                  >
                  保存
                  </Button>
                </div>
              </Col>
            </Row>
            <Row className="image-row">
              <Col span="3"style={{width:150}}>版权声明</Col>
              <Col span="20">
                <div className="row-text">切换是否显示登录页公司名“ {oemInfo.company ? oemInfo.company.name :''} ”</div>
                <Switch checked={oemInfo.company?oemInfo.company.visible:true} onChange={(e)=> this.changeSwitch(e)} checkedChildren="开" unCheckedChildren="关" className="inswitch"/>
                  {oemInfo.company?
                  <span className="switchText">{oemInfo.company.visible ? '开启':'关闭'}</span>
                  :null
                  }
              </Col>
            </Row>
          </Card>

          <Card className="image-push" title={[<img className="img-icon" src={tenxColorIcon} key="image-color" />,<span key='color-span'>颜色定制</span>]} extra={<Button icon="setting" className="btnRestore" onClick={()=> this.restoreDefault('tenxColor')}>恢复默认设置</Button>} >
            <Row className="image-row">
              <Col span="3"style={{width:150}}>选择颜色</Col>
              <Col span="20">
                <div className="row-text">此颜色是顶部导航栏颜色，为了更好的搭配您自定义的LOGO；</div>
                <div className="colorMap">
                  <span className={this.state.siderColor=='1' ?'list color-1 selected':'list color-1'} onClick={()=> this.setSliderColor(1)}></span>
                  <span className={this.state.siderColor=='2' ?'list color-2 selected':'list color-2'} onClick={()=> this.setSliderColor(2)}></span>
                  <span className={this.state.siderColor=='3' ?'list color-3 selected':'list color-3'} onClick={()=> this.setSliderColor(3)}></span>
                  <span className={this.state.siderColor=='4' ?'list color-4 selected':'list color-4'} onClick={()=> this.setSliderColor(4)}></span>
                  <span className={this.state.siderColor=='5' ?'list color-5 selected':'list color-5'} onClick={()=> this.setSliderColor(5)}></span>
                  <span className={this.state.siderColor=='6' ?'list color-6 selected':'list color-6'} onClick={()=> this.setSliderColor(6)}></span>
                  <span className={this.state.siderColor=='7' ?'list color-7 selected':'list color-7'} onClick={()=> this.setSliderColor(7)}></span>
                  <span className={this.state.siderColor=='8' ?'list color-8 selected':'list color-8'} onClick={()=> this.setSliderColor(8)}></span>
                  <span className={this.state.siderColor=='9' ?'list color-9 selected':'list color-9'} onClick={()=> this.setSliderColor(9)}></span>

                </div>
                <div className="colorButton">
                  <Button size="large" onClick={()=> this.handCancelTheme()}>取消</Button>
                  <Button size="large" style={{margin:'0 10px'}} type="primary" onClick={()=> this.saveColor()}>保存</Button>
                </div>
              </Col>
            </Row>

          </Card>
          <Modal visible={this.state.logo} title="恢复默认设置图标"
            onOk={()=> this.restoreTheme('logo')}
            onCancel={()=> this.setState({logo: false})}
          >
            <div className="confirmText">是否确定将所有图标恢复至默认设置？</div>
          </Modal>
          <Modal visible={this.state.tenxText} title="恢复默认设置文字"
            onOk={()=> this.restoreTheme('info')}
            onCancel={()=> this.setState({tenxText: false})}
          >
            <div className="confirmText">是否确定将文字定制中内容恢复至默认设置？</div>
          </Modal>
          <Modal visible={this.state.tenxColor} title="恢复默认设置颜色"
            onOk={()=> this.restoreTheme('color')}
            onCancel={()=> this.setState({tenxColor: false})}
          >
            <div className="confirmText">是否确定将顶部导航的颜色恢复至默认设置？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  const { info } = state.personalized
  return {
    oemInfo: info.result || { company: {} }
  }
}

export default connect(mapStateToProps,{
  loadLoginUserDetail,
  getPersonalized,
  setBackColor,
  isCopyright,
  updateLogo,
  restoreDefault
})(Personalized)
