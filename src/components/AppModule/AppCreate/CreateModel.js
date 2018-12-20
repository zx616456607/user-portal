/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateModel component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 * changeBy baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Button, Form, Select, Menu, Tooltip } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'
import { connect } from 'react-redux'
import { MY_SPACE } from '../../../constants'
import appTemplate from '../../../assets/img/app/appTemplate.png'
import appTemplateHover from '../../../assets/img/app/appTemplateHover.png'
import image from '../../../assets/img/app/image.png'
import imageHover from '../../../assets/img/app/imageHover.png'
import imageStore from '../../../assets/img/app/imageStore.png'
import imageStoreHover from '../../../assets/img/app/imageStoreHover.png'
import appStore from '../../../assets/img/app/appStore.png'
import appStoreHover from '../../../assets/img/app/appStoreHover.png'
import wrapManageHover from '../../../assets/img/app/wrapManageHover.png'
import wrapManage from '../../../assets/img/app/wrapManage.png'
import stackIcon from '../../../assets/img/app/stackIcon.svg'
import stackIconHover from '../../../assets/img/app/stackIconHover.svg'
import { genRandomString, toQuerystring } from '../../../common/tools'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'
import isEmpty from 'lodash/isEmpty';

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;

function loadProjects(props, callback) {
  const { ListProjects, loginUser } = props
  ListProjects({ size: 0 }, callback)
}

class CreateModel extends Component {
  constructor(props) {
    super(props)
    this.selectCreateModel = this.selectCreateModel.bind(this)

    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
    this.state = {
      createModel: "quick",
      linkUrl: "quick_create",
      disabled: false,
      moreService: false
    }
  }

  componentWillMount() {
    const { current, location } = this.props
    const { appName, action, fromDetail } = location.query
    if (appName) {
      this.setState({moreService: true})
    }
  }

  genConfigureServiceKey() {
    this.serviceSum ++
    return `${this.serviceSum}-${genRandomString('0123456789')}`
  }

  selectCreateModel(currentSelect) {
    //user select current create model,so that current selected model's css will be change
    let linkUrl = ""
    // compose_file
    switch(currentSelect) {
      case 'template':
        linkUrl = 'template'
        break
      case 'quick': {
        linkUrl = 'quick_create'
        break
      }
      case 'image_store':
        // linkUrl = 'quick_create?imageType=imageStore'
        linkUrl = 'image_store'
        break
      case 'store': {
        linkUrl = "app_store"
        break
      }
      case 'AI': {
        linkUrl = "AI"
        break
      }
      case 'layout': {
        linkUrl = "compose_file"
        break
      }
      case 'deploy_wrap': {
        linkUrl = "deploy_wrap"
        break
      }
      case 'wrap_store': {
        linkUrl = 'wrap_store'
        break
      }
      default: linkUrl = 'quick_create'
    }

    const parentScope = this.props.scope;
    this.setState({
      createModel: currentSelect,
      linkUrl: linkUrl
    });
    parentScope.setState({
      createModel: currentSelect
    });
  }

  handleNextStep(linkUrl, e) {
    e.preventDefault()
    const { form, location } = this.props
    const { validateFields, resetFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { query } = location
      let next = linkUrl
      switch (linkUrl) {
        case 'template':
          next = 'quick_create'
          query.template = true
          break
        case 'image_store':
          next = 'quick_create'
          query.imageType = 'imageStore'
          break
        case 'deploy_wrap':
          next = 'quick_create'
          query.addWrap = true
          break
        case 'AI':
          next = 'quick_create'
          query.addAI = true
          break
        case 'wrap_store':
          next = 'quick_create'
          query.addWrap = true
          query.from = 'wrapStore'
          break
        default:
          break
      }
      browserHistory.push(`/app_manage/app_create/${next}?${toQuerystring(query)}`)
    })
  }

  render() {
    const { intl, location } = this.props
    const isAddService = !isEmpty(location.query) && location.query.action === 'addService'
    const { createModel, linkUrl, moreService} = this.state
    return (
      <QueueAnim
        id="CreateModel"
        type="right"
        >
        <div className="CreateModel" key="CreateModel">
          <div className="topBox">
            <div className="contentBox">
              <div className={createModel == "quick" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "quick")}>
                <img src={createModel == "quick" ? imageHover : image} />
                <div className="infoBox">
                  <p><FormattedMessage {...IntlMessage.imageWarehouse}/></p>
                  <span><FormattedMessage {...(isAddService ? IntlMessage.createServerByWarehouse : IntlMessage.createAppByWarehouse )} /></span>
                </div>
                <TenxIcon type="selected" className="selectedIcon"/>
              </div>
              <div className={createModel == "image_store" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "image_store")}>
                <img src={createModel == "image_store" ? imageStoreHover : imageStore} />
                <div className="infoBox">
                  <p><FormattedMessage {...IntlMessage.imageStore}/></p>
                  <span><FormattedMessage {...(isAddService ? IntlMessage.createServerByImageStore : IntlMessage.createAppByImageStore)}/></span>
                </div>
                <TenxIcon type="selected" className="selectedIcon"/>
              </div>
              <div className={createModel == "deploy_wrap" ? "deploy_wrap commonBox selectedBox" : "deploy_wrap commonBox"} onClick={this.selectCreateModel.bind(this, "deploy_wrap")}>
                <img src={createModel == "deploy_wrap" ? wrapManageHover : wrapManage} />
                <div className="infoBox">
                  <p><FormattedMessage {...IntlMessage.wrapDeploy}/></p>
                  <span><FormattedMessage {...(isAddService ? IntlMessage.createServerByWrap : IntlMessage.createAppByWrap)}/></span>
                </div>
                <TenxIcon type="selected" className="selectedIcon"/>
              </div>
              <div className={createModel == "wrap_store" ? " commonBox selectedBox" : " commonBox"} onClick={this.selectCreateModel.bind(this, "wrap_store")}>
                <img src={createModel == "wrap_store" ? appStoreHover : appStore} />
                <div className="infoBox">
                  <p><FormattedMessage {...IntlMessage.wrapStore}/></p>
                  <span><FormattedMessage {...(isAddService ? IntlMessage.createServerByWrapStore : IntlMessage.createAppByWrapStore)}/></span>
                </div>
                <TenxIcon type="selected" className="selectedIcon"/>
              </div>
              <Tooltip title={moreService ? intl.formatMessage(IntlMessage.notSupportAppTemplate) : ''}>
                <div className={moreService ? "fastCreate disabled" : createModel == "template" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"}
                  onClick={moreService ? () => false : this.selectCreateModel.bind(this, "template")}>
                  <img src={createModel == "template" ? appTemplateHover : appTemplate} />
                  <div className="infoBox">
                    <p><FormattedMessage {...IntlMessage.appTemplate}/></p>
                    <span><FormattedMessage {...(isAddService ? IntlMessage.createServerByAppTemplate : IntlMessage.createAppByAppTemplate)}/></span>
                  </div>
                  <TenxIcon type="selected" className="selectedIcon"/>
                </div>
              </Tooltip>
            </div>
            <Button type={createModel=='AI' ? 'primary':'ghost'} className='AI' onClick={()=> this.selectCreateModel('AI')}>
              <img src={createModel == 'AI' ? stackIconHover : stackIcon} className="stackIcon" />
              <FormattedMessage {...IntlMessage.aiModelApp}/>
            </Button>
            {/* {moreService ?
              <Tooltip title={intl.formatMessage(IntlMessage.notSupportLayoutFile)}>
                <div className='otherStack'>
                  <img src={stackIcon} className="stackIcon" />
                  <FormattedMessage {...IntlMessage.layoutFile}/>
                </div>
              </Tooltip>
              :
              <Button type={createModel=='layout' ? 'primary':'ghost'} className='stack' onClick={()=> this.selectCreateModel('layout')}>
                <img src={createModel == 'layout' ? stackIconHover : stackIcon} className="stackIcon" />
                <FormattedMessage {...IntlMessage.layoutFile}/>
              </Button>
            } */}
          </div>
          <div className="bottomBox">
            <Link to="/app_manage">
              <Button size="large">
                <FormattedMessage {...IntlMessage.cancel}/>
              </Button>
            </Link>
            <Button onClick={this.handleNextStep.bind(this, linkUrl)} size="large" type="primary" disabled={this.state.disabled}>
              <FormattedMessage {...IntlMessage.nextStep}/>
            </Button>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}
CreateModel = createForm()(CreateModel)

function mapStateToProps(state, props) {
  const { current } = state.entities
  return {
    current,
  }
}

export default connect(mapStateToProps, {
  //
})(injectIntl(CreateModel, {
  withRef: true,
}))
