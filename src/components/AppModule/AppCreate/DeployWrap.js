/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage component
 *
 * v0.1 - 2017-6-29
 * @author Baiyu
 */
import React, { Component } from 'react'
import { Input, Button, Card, Steps, Row, Collapse, Col, Select,Icon,Switch,Form, Checkbox } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { DEFAULT_REGISTRY } from '../../../constants'
import { wrapManageList, getWrapStoreList,getImageTemplate } from '../../../actions/app_center'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import { formatDate } from '../../../common/tools'
import Title from '../../Title'
import NotificationHandler from '../../../components/Notification'
import WrapListTable from '../../AppCenter/AppWrap/WrapListTable'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Weblogic from './WeblogicConfig'
import './style/WrapManage.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
const notificat = new NotificationHandler()
import { SHOW_BILLING } from '../../../constants'
import {getFieldsValues} from "../QuickCreateApp/utils";
const SERVICE_CONFIG_HASH = '#configure-service'
const Step = Steps.Step
const ButtonGroup = Button.Group;
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'

import { loadAllProject, loadRepositoriesTags } from '../../../actions/harbor'
import isEmpty from 'lodash/isEmpty'

class WrapManage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stepStatus: 'process',
      serviceList: [],
      page: 1,
      defaultTemplate:null,// 默认选中一个模板
      selectedRowKeys:[],
      version:'none',
      id:[],// selected id
      template: [],
      currentType: 'trad'
    }
  }
  componentWillMount() {
    const { location } = this.props
    const { from, fileName } = location.query
    this.props.getImageTemplate(DEFAULT_REGISTRY,{
      success:{
        func:(res) => {
          window.template = res.template
          this.setState({template:res.template})
        }
      }

    })
    let query = {}
    if (fileName) {
      query = {
        filter: `fileName contains ${location.query.fileName}`,
      }
      if (from && from === 'wrapStore') {
        this.setState({
          currentType: 'store'
        })
        this.getStoreList(fileName)
      } else {
        this.getQueryNameData(query)
      }
      this.setState({
        selectedRowKeys: [0]
      })
      return
    }
    if (from && from === 'wrapStore') {
      this.setState({
        currentType: 'store'
      })
      this.getStoreList()
      return
    }
    this.loadData()
  }
  getQueryNameData = query => {
    this.props.wrapManageList(query).then(res => {
      const { pkgs } = res.response.result.data
      const { fileType } = pkgs[0]
      window.WrapListTable = pkgs[0]
      switch(fileType) {
        case 'jar':
          this.setState({
            defaultTemplate: 0,
            fileType:'jar',
            version: getDeepValue(window.template, [ 0, 'version', 0 ])
          })
          break
        case 'war':
          this.setState({
            defaultTemplate: 1,
            fileType:'war',
            version: getDeepValue(window.template, [ 1, 'version', 0 ])
          })
          break
        default:
          break
      }
    })
  }
  getList(e) {
    let inputValue = e.target.value
    if (inputValue == '') {
      this.loadData()
      return
    }
    const query = {
      filter: `fileName contains ${inputValue}`,
    }
    this.props.wrapManageList(query)
  }
  loadData(current) {
    current = current || this.state.page
    this.setState({ page: current })
    let from = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }
  getStoreList(value, current) {
    const { getWrapStoreList } = this.props
    current = current || this.state.page
    const query = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    if (value) {
      Object.assign(query, { file_name: value })
    }
    getWrapStoreList(query, {
      success: {
        func: res => {
          if (res && res.data && res.data.pkgs) {
            window.WrapListTable = res.data.pkgs[0]
            switch(res.data.pkgs[0].fileType) {
              case 'jar':
                this.setState({
                  defaultTemplate: 0,
                  fileType:'jar',
                  version: getDeepValue(window.template, [ 0, 'version', 0 ])
                })
                break
              case 'war':
                this.setState({
                  defaultTemplate: 1,
                  fileType:'war',
                  version: getDeepValue(window.template, [ 1, 'version', 0 ])
                })
                break
              default:
                break
            }
          }
        }
      }
    })
  }
  changeWrap(type) {
    const { location } = this.props
    const { from, fileName } = location.query
    this.setState({
      currentType: type,
      selectedRowKeys: [],
      id: [],
      defaultTemplate:null, // not selected
      version:'none', // not selected
      fileType:'none', // not selected
    })
    switch(type) {
      case 'trad':
        if (fileName && !from) {
          const query = {
            filter: `fileName contains ${fileName}`,
          }
          this.getQueryNameData(query)
          this.setState({
            selectedRowKeys: [0]
          })
          return
        }
        this.loadData()
        break
      case 'store':
        this.getStoreList()
        break
    }
  }
  searchData(e) {
    const { currentType } = this.state
    switch(currentType) {
      case 'trad':
        this.getList(e)
        break
      case 'store':
        this.getStoreList(e.target.value)
        break
    }
  }
  reload = () => {
    const { currentType } = this.state
    switch(currentType) {
      case 'trad':
        this.loadData()
        break
      case 'store':
        this.getStoreList()
        break
    }
  }
  getStepsCurrent() {
    return 1
  }
  getAppResources() {
    const { current } = this.props
    const fields = this.props.fields || {}
    let cpuTotal = 0 // unit: C
    let memoryTotal = 0 // unit: G
    let priceHour = 0 // unit: T/￥
    for (let key in fields) {
      if (fields.hasOwnProperty(key) && fields[key].serviceName) {
        const { resourceType, DIYMemory, DIYMaxMemory, DIYCPU, DIYMaxCPU, replicas } = getFieldsValues(fields[key])
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
        cpuTotal += cpuShow
        memoryTotal += memoryShow
        let price = current.cluster.resourcePrice[config]
        if (price) {
          priceHour += price * replicas
        } else {
          // @Todo: need diy resource price
        }
      }
    }
    cpuTotal = Math.ceil(cpuTotal * 100) / 100
    memoryTotal = Math.ceil(memoryTotal * 100) / 100
    const priceMonth = parseAmount(priceHour * 24 * 30, 4).amount
    priceHour = parseAmount(priceHour, 4).amount
    return {
      resource: `${cpuTotal}C ${memoryTotal}G`,
      priceHour,
      priceMonth,
    }
  }
  changTemplate(num,item) {
    if (item.type !== 'diy') {
      this.setState({defaultTemplate: num,version:item.version[0]})
      return
    }
    const { loadAllProject, images, harbor } = this.props
    if (isEmpty(images) || (isEmpty(images.publicImages) && isEmpty(images.privateImages))) {
      loadAllProject(DEFAULT_REGISTRY, { harbor })
    }
    this.setState({defaultTemplate: num, version: '', diyEnv: '', confirmPath: ''})
  }
  formatEnvName = name => {
    switch (name) {
      case 'weblogic':
        return name.replace('w', 'W').replace('l', 'L')
      case 'java':
      case 'tomcat':
        return name.substring(0, 1).toUpperCase() + name.substring(1)
      case 'diy':
        return '自定义'
      default:
        break
    }
  }
  templateList() {
    const { template,defaultTemplate,fileType } = this.state
    return template.map((item,index) => {
      let disabled = item.type !== fileType
      if (item.type.indexOf('|')> -1 || item.type === 'diy') {
        disabled = false
      }
      let name = item.name.split('/')[1]
      return (
        <Button type="ghost" key={index} onClick={()=> this.changTemplate(index,item)} disabled={ !window.WrapListTable || disabled} style={{border:0}}>
        <div className={classNames("template", {'templateActive': defaultTemplate === index})} key={item.name}>
          <img src={`${item.imageUrl}`} className={item.type}/>
          {defaultTemplate == index?
          [<span className="triangle" key={index+1}></span>,
          <Icon type="check" key={index +2}/>]
          :null
          }
          <span className="textoverflow">
            {this.formatEnvName(name)}
            </span>
        </div>
          {
            item.type !== 'diy' ?
              <div className="template_version"><FormattedMessage {...IntlMessage.latestVersion}/>：{item.version[0]}</div>
              : <div/>
          }
        </Button>
      )

    })
  }
  templateVersion() {
    const { defaultTemplate, template } = this.state
    if (defaultTemplate === null || !template[defaultTemplate]) {
      return <Select.Option key="none"><FormattedMessage {...IntlMessage.selectWrapTip}/></Select.Option>
    }
    return template[defaultTemplate].version.map(item=> {
      return <Select.Option key={item}>{item}</Select.Option>
    })
  }
  goDeploy = (row)=> {
    const { intl } = this.props
    if (!row) {
      notificat.info(intl.formatMessage(IntlMessage.selectWrapTip))
      return
    }
    if (this.state.weblogicChecked) {
      const weblogicconfig = this.refs.Weblogic.formCheckecd()
      if (!weblogicconfig) {
        return
      }
      window.WrapListTable.weblogic = weblogicconfig
    }
    const { wrapList, location, wrapStoreList, images } = this.props
    const { from } = location.query
    if(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0 && location.query.entryPkgID) {
      notificat.error(intl.formatMessage(IntlMessage.serviceRepeatTip))
      return
    }
    // /app_manage/app_create/quick_create#configure-service
    const { version, defaultTemplate, template, diyEnv, confirmPath } = this.state
    let registry = wrapList.registry
    if (from && from === 'wrapStore') {
      registry = wrapStoreList.registry
    }
    // 自定义运行环境
    if (defaultTemplate === 3) {
      registry = images.server
    }
    // registry = registry && registry.split(/^(http:\/\/|https:\/\/)/)[2]
    if (registry.includes('//')) {
      registry = registry && registry.split('//')[1]
    }
    if (defaultTemplate === 3) {
      if (!diyEnv) {
        notificat.info('请选择镜像')
        return
      }
      if (!version) {
        notificat.info('请选择版本')
        return
      }
      if (!confirmPath) {
        notificat.info('请确认应用包默认路径，所选镜像可识别处理')
        return
      }
    }
    let tag = version
    if (!version) {
      tag = template[defaultTemplate].version[0]
    }
    if (!registry) {
      notificat.error(intl.formatMessage(IntlMessage.imageAddressAcquisitionFailed),
        intl.formatMessage(IntlMessage.refreshTip))
      return
    }
    if (defaultTemplate !==3 && template[defaultTemplate].version.indexOf(tag) == -1) {
      notificat.info(intl.formatMessage(IntlMessage.versionWrong))
      return
    }
    const { appName, action} = location.query
    let name = ''
    if (defaultTemplate === 3) {
      // 自定义镜像
      name = diyEnv
    } else {
      name = this.state.template[defaultTemplate].name
    }
    let imageName ='?imageName='+name +`&tag=${tag}&isWrap=true`+
                    `&registryServer=${registry}&appPkgID=${row.id}&entryPkgID=${(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0) ? row.id : ''}`
    if (appName) {
      imageName += `&appName=${appName}&action=${action}`
    }
    if (location.pathname ==='/app_center/app_template/create') {
      browserHistory.push('/app_center/app_template/create'+ imageName + SERVICE_CONFIG_HASH)
      return
    }
    browserHistory.push('/app_manage/app_create/quick_create'+ imageName + SERVICE_CONFIG_HASH)

  }
  heightConfig () {
    const { defaultTemplate } = this.state
    if (defaultTemplate === 2) {
      if (this.state.weblogicChecked) {
        return (
          <div className="reset_form_item_label_style">
            <div className="list_row">
              <span className="wrap_key"><FormattedMessage {...IntlMessage.connectToOracle}/> </span>
              <Switch
                checked={this.state.weblogicChecked}
                onChange={(e)=> this.setState({weblogicChecked: e})}
                checkedChildren={<FormattedMessage {...IntlMessage.open}/>}
                unCheckedChildren={<FormattedMessage {...IntlMessage.close}/>}
              />
            </div>
            <Weblogic form={this.props.form} ref="Weblogic" />
          </div>
        )
      }
      return (
        <div className="list_row">
          <span className="wrap_key"><FormattedMessage {...IntlMessage.connectToOracle}/> </span>
          <Switch
            checked={this.state.weblogicChecked}
            onChange={(e)=> this.setState({weblogicChecked: e})}
            checkedChildren={<FormattedMessage {...IntlMessage.open}/>}
            unCheckedChildren={<FormattedMessage {...IntlMessage.close}/>}
          />
        </div>
      )
    }
    return null
  }

  callbackRow = (RowKeys, id, Template, fileType) => {
    this.setState({
      selectedRowKeys: RowKeys,
      id,
      defaultTemplate: Template,
      version: null,
      fileType,
    })
  }

  renderImagesOptions = () => {
    const { images } = this.props
    if (isEmpty(images) || (!images.publicImages && !images.privateImages)) {
      return
    }
    const allImages = [].concat(images.publicImages, images.privateImages)
    return allImages.map(item => <Select.Option key={item.repositoryName}>{item.repositoryName}</Select.Option>)
  }

  renderImageTags = () => {
    const { diyEnv } = this.state
    const { imageTags } = this.props
    if (!diyEnv) {
      return
    }
    return (imageTags[diyEnv].tag || []).map(item => <Select.Option key={item}>{item}</Select.Option>)
  }

  selectImage = value => {
    const { loadRepositoriesTags, harbor } = this.props
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, value)
    this.setState({
      diyEnv: value,
      version: '',
    })
  }

  selectImageTag = tag => {
    this.setState({
      version: tag,
    })
  }

  confirmDefaultPath = e => {
    this.setState({
      confirmPath: e.target.checked,
    })
  }
  renderImages = () => {
    const { wrapStoreList, wrapList } = this.props
    const { confirmPath, version, currentType, id, diyEnv } = this.state
    const currentList = currentType === 'trad' ? wrapList : wrapStoreList
    const pkgs = currentList.pkgs || []
    const currentRow = pkgs.filter(item => item.id === id[0])
    let fileName = ''
    if (!isEmpty(currentRow)) {
      fileName = currentRow[0].fileName
    }
    return (
      <div className="images-box">
        <div>
          <Select
            style={{ width: 280 }}
            placeholder={'请选择作为运行环境的镜像'}
            onChange={this.selectImage}
            value={diyEnv}
            showSearch
          >
            {this.renderImagesOptions()}
          </Select>
          <Select
            style={{ width: 180, marginLeft: 20 }}
            placeholder={'选择版本'}
            onChange={this.selectImageTag}
            value={version}
            showSearch
          >
            {this.renderImageTags()}
          </Select>
        </div>
        {
          fileName &&
          <div style={{marginTop: 15}}>
            <Checkbox
              onChange={this.confirmDefaultPath}
              checked={!!confirmPath}
            >
              确认知悉，应用包默认路径为 <span className="failedColor">{`/app-dir/${fileName}`}</span>，所选自定义镜像必须识别并处理
            </Checkbox>
          </div>
        }
      </div>
    )
  }
  render() {
    const { serviceList, template, defaultTemplate, version, currentType, loading } = this.state
    const { current, quick_create, location, childrenSteps, intl } = this.props
    const { resource, priceHour, priceMonth } = this.getAppResources()
    const funcCallback = {
      goDeploy: this.goDeploy,
      scope: this,
      location
    }
    let showprice = 18
    if (!SHOW_BILLING) {
      showprice = 24
    }
    let steps = null
    if (!childrenSteps) {
      steps = (<Steps size="small" className="steps" status={this.state.stepStatus} current={this.getStepsCurrent()}>
      <Step title={<FormattedMessage {...IntlMessage.deployMethod}/>} />
      <Step title={<FormattedMessage {...IntlMessage.selectBaseImage}/>} />
      <Step title={<FormattedMessage {...IntlMessage.configService}/>} />
    </Steps>)
    }
    const header = (
      <div><FormattedMessage {...IntlMessage.advancedSettings}/></div>
    )
    if (quick_create) {
      return (
        <QueueAnim id="deploy_wrap">
          <div className="wrap_manage" >
            <div className="list_row">
              <span className="wrap_key"><FormattedMessage {...IntlMessage.selectWrap}/></span>
              <span className="searchInput">
                <Input
                  size="large" onPressEnter={(e) => this.searchData(e)}
                  placeholder={
                    currentType === 'trad' ?
                      intl.formatMessage(IntlMessage.wrapPlaceholder) :
                      intl.formatMessage(IntlMessage.wrapStorePlaceholder)
                  }
                />
                <Button type="ghost" size="large" onClick={this.reload}>
                  <Icon type="reload" />
                </Button>
                <Button type="primary" onClick={() => window.open('/app_center/wrap_manage')} size="large">
                  <FormattedMessage {...IntlMessage.uploadWrap}/>
                </Button>

              </span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <ButtonGroup>
                <Button type="ghost" className={classNames({'active': currentType === 'trad'})} onClick={() =>this.changeWrap('trad')}>
                  <FormattedMessage {...IntlMessage.wrap}/>
                </Button>
                <Button type="ghost" className={classNames({'active': currentType === 'store'})} onClick={() =>this.changeWrap('store')}>
                  <FormattedMessage {...IntlMessage.wrapStore}/>
                </Button>
              </ButtonGroup>
            </div>
            <WrapListTable
              currentType={currentType}
              func={funcCallback}
              selectedRowKeys={this.state.selectedRowKeys}
              entryPkgID={location.query.entryPkgID}
              callbackRow={this.callbackRow}
            />
            <br />
            <div className="list_row" style={{ height: 'auto' }}>
              <span className="wrap_key" style={{ float: 'left' }}><FormattedMessage {...IntlMessage.operatingEnv}/></span>
              <div className="template_list">
                {this.templateList()}
              </div>
              <div className="wrap_hint"><Icon type="exclamation-circle-o"/> <FormattedMessage {...IntlMessage.operatingEnvTip}/></div>
            </div>
            {
              defaultTemplate !== 3 ?
                <Collapse>
                  <Collapse.Panel header={header}>
                    <div className="list_row">
                      <span className="wrap_key"><FormattedMessage {...IntlMessage.selectVersion}/></span>
                      <Select style={{width:180}} size="large" value={version ||  getDeepValue(template, [ defaultTemplate, 'version', 0 ])} onChange={(e)=> {this.setState({version: e});window.version = e}}>
                        { this.templateVersion() }
                      </Select>
                    </div>
                    {this.heightConfig()}
                  </Collapse.Panel>
                </Collapse>
                :
                this.renderImages()
            }
            <div className="footerBtn">
              <Button size="large" onClick={() => browserHistory.push('/app_manage/app_create')}>
                <FormattedMessage {...IntlMessage.previous}/>
              </Button>
              <Button size="large" style={{marginLeft:10}} onClick={() => this.goDeploy(window.WrapListTable)}>
                <FormattedMessage {...IntlMessage.nextStep}/>
              </Button>
            </div>
          </div>
        </QueueAnim>
      )
    }
    return (
      <QueueAnim id="deploy_wrap">
        <Title title="部署应用"/>
        <Row gutter={16}>
          <Col span={showprice}>
            <Card key="wrap_manage" className="wrap_manage" title={steps}>
              <div className="list_row">
                <span className="wrap_key">选择应用包</span>
                <span className="searchInput">
                  <Input size="large" onPressEnter={(e) => this.searchData(e)} placeholder={currentType === 'trad' ? '请输入包名称搜索' : '请输入包名称或发布名称搜索'} />
                  <Button type="primary" onClick={() => browserHistory.push('/app_center/wrap_manage')} size="large">去上传部署包</Button>

                </span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <ButtonGroup>
                  <Button type="ghost" className={classNames({'active': currentType === 'trad'})} onClick={() =>this.changeWrap('trad')}>应用包</Button>
                  <Button type="ghost" className={classNames({'active': currentType === 'store'})} onClick={() =>this.changeWrap('store')}>应用包商店</Button>
                </ButtonGroup>
              </div>
              <WrapListTable
                location={location}
                currentType={currentType}
                func={funcCallback}
                selectedRowKeys={this.state.selectedRowKeys}
                entryPkgID={location.query.entryPkgID}
                callbackRow={this.callbackRow}
              />
              <br />
              <div className="list_row" style={{ height: 'auto' }}>
                <span className="wrap_key" style={{ float: 'left' }}>运行环境</span>
                <div className="template_list">
                  {this.templateList()}
                </div>
                <div className="wrap_hint"><Icon type="exclamation-circle-o"/> 设置 JAVA_OPTS：在下一步『配置服务』页面，配置环境变量中修改 JAVA_OPTS 键对应的值</div>
              </div>
              {
                defaultTemplate !== 3 &&
                <Collapse>
                  <Collapse.Panel header={header}>
                    <div className="list_row">
                      <span className="wrap_key">选择版本</span>
                      <Select style={{width:180}} size="large" value={version || template[defaultTemplate].version[0]} onChange={(e)=> {this.setState({version: e});window.version = e}}>
                        { this.templateVersion() }
                      </Select>
                    </div>
                    {this.heightConfig()}
                  </Collapse.Panel>
                </Collapse>
              }
              <div className="footerBtn">
                <Button size="large" onClick={() => browserHistory.goBack()}>上一步</Button>
                <Button size="large" style={{marginLeft:10}} onClick={() => this.goDeploy(window.WrapListTable)}>下一步</Button>
              </div>
            </Card>
          </Col>
          { SHOW_BILLING ?
            <Col span="6">
              <Card title={
                <Row className="title">
                  <Col span={16}>已添加服务</Col>
                  <Col span={8} className="textAlignRight">操作</Col>
                </Row>
              }>
                <div className="serviceList">
                  {serviceList}
                </div>
                <div className="resourcePrice">
                  <div className="resource">
                    计算资源：
                      <span>{resource}</span>
                  </div>
                  {
                    current.unit === '¥'
                      ? (
                        <div className="price">
                          合计：
                          <span className="hourPrice"><font>¥</font> {priceHour}/小时</span>
                          <span className="monthPrice">（合 <font>¥</font> {priceMonth}/月）</span>
                        </div>
                      )
                      : (
                        <div className="price">
                          合计：
                          <span className="hourPrice">{priceHour} {current.unit}/小时</span>
                          <span className="monthPrice">（合 {priceMonth} {current.unit}/月）</span>
                        </div>
                      )
                  }
                </div>
                {
                  (serviceList.length > 0 && currentStep === 1) && (
                    <div className="createApp">
                      <Button type="primary" size="large" onClick={this.onCreateAppOrAddServiceClick.bind(this, false)}>
                        {this.renderCreateBtnText()}
                      </Button>
                    </div>
                  )
                }
              </Card>
            </Col>
          :null
          }
        </Row>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities } = state
  const { wrapList, wrapStoreList } = state.images
  const { result: storeList } = wrapStoreList || { result: {}}
  const { data: storeData } = storeList || { data: [] }
  const list = wrapList || {}
  let datalist = { pkgs: [], total: 0 }
  if (list.result) {
    datalist = list.result.data
  }
  return {
    current: entities.current,
    loginUser: entities.loginUser.info,
    images: getDeepValue(state, ['harbor', 'allProject', DEFAULT_REGISTRY]),
    wrapList: datalist,
    isFetching: list.isFetching,
    wrapStoreList: storeData,
    harbor: getDeepValue(state, ['entities', 'current', 'cluster', 'harbor', 0]),
    imageTags: getDeepValue(state, ['harbor', 'imageTags', DEFAULT_REGISTRY])
  }
}
WrapManage = Form.create()(WrapManage)

export default connect(mapStateToProps, {
  wrapManageList,
  getImageTemplate,
  getWrapStoreList,
  loadAllProject,
  loadRepositoriesTags
})(injectIntl(WrapManage, {
  withRef: true,
}))
