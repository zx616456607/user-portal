/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * upgrade modal component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import VersionNoraml from './Normal.js'
import VersionProfress from './Profress.js'
import "./style/UpgradeModal.less"

class UpgradeModal extends Component {
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {
    }
  }
  
  handleCancel() {
    //this function for user close the modal
    const { scope } = this.props;
    scope.setState({
      modalShow: false
    })
  }

  componentWillMount() {
  }

  render() {
    const { modalShow, currentType } = this.props;
    return (
      <Modal className='upgradeModalBox'
        onCancel={this.handleCancel}
        visible={modalShow}
      >
        <div id = 'upgradeModal'>
          <div className='titleBox'>
            <span>升级专业版</span>
          </div>
          <div className='infoBox'>
            <div className='leftBox'>
              <div className='littleTitle'>
                <span>标准版</span>￥<span>0</span>/月
              </div>
              <div className={ currentType == 'app' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>应用管理</span>
              </div>
              <div className={ currentType == 'storage' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>存储管理</span>
              </div>
              <div className={ currentType == 'appcenter' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>交付中心（2个镜像）</span>
              </div>
              <div className={ currentType == 'cicd' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>CI/CD完整版（2个项目）代码库（Github）</span>
              </div>
              <div className={ currentType == 'database' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>数据库集群&缓存集群</span>
              </div>
              <div className={ currentType == 'intergation' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>集成中心（集成应用）</span>
              </div>
              <div className={ currentType == 'log' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>操作审计、日志中心（一天以内日志）</span>
              </div>
              <div className={ currentType == 'user' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>账户中心</span>
              </div>
            </div>
            <div className='rightBox'>
              <div className='littleTitle'>
                <span>专业版</span>￥<span>66</span>/月
              </div>
              <div className={ currentType == 'app' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>应用管理</span>
              </div>
              <div className={ currentType == 'storage' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>存储管理</span>
              </div>
              <div className={ currentType == 'appcenter' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src='/img/version/proIcon.png' />
                <span className='littleIcon'></span>
                <span className='infoSpan'>交付中心（20个镜像）</span>
              </div>
              <div className={ currentType == 'cicd' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src='/img/version/proIcon.png' />
                <span className='littleIcon'></span>
                <span className='infoSpan'>CI/CD完整版（5个项目）<br />代码库（Github、GitLab、SVN）</span>
              </div>
              <div className={ currentType == 'database' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>数据库集群&缓存集群</span>
              </div>
              <div className={ currentType == 'intergation' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>集成中心（集成应用）</span>
              </div>
              <div className={ currentType == 'log' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src='/img/version/proIcon.png' />
                <span className='littleIcon'></span>
                <span className='infoSpan'>操作审计、日志中心（一年以内日志）</span>
              </div>
              <div className={ currentType == 'user' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>账户中心</span>
              </div>
              <div className={ currentType == 'team' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src='/img/version/proIcon.png' />
                <span className='littleIcon'></span>
                <span className='infoSpan'>团队管理</span>
              </div>
            </div>
            <div style={{ clear:'both' }}></div>
          </div>
          <div className='btnBox'>
            <div className='bgBox'></div>
            <Button size='large' type='ghost'>
              <span>下次再说</span>
            </Button>
            <Button size='large' type='primary'>
              <span>升级专业版</span>
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}

UpgradeModal.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  return {
  }
}

export default connect(mapStateToProps, {
})(injectIntl(UpgradeModal, {
  withRef: true,
}))