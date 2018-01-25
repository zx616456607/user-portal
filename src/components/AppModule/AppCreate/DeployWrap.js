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
import { Input, Button, Card, Steps, Row, Collapse, Col, Select,Icon,Switch,Form } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { DEFAULT_REGISTRY } from '../../../constants'
import { wrapManageList, getWrapStoreList } from '../../../actions/app_center'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import { formatDate } from '../../../common/tools'
import javaImage from '../../../assets/img/appstore/java.png'
import tomcatImage from '../../../assets/img/appstore/tomcat.png'
import weblogicImage from '../../../assets/img/appstore/weblogic.png'
import Title from '../../Title'
import NotificationHandler from '../../../components/Notification'
import WrapListTable from '../../AppCenter/AppWrap/WrapListTable'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Weblogic from './WeblogicConfig'
import './style/WrapManage.less'
const notificat = new NotificationHandler()
import { SHOW_BILLING } from '../../../constants'
const SERVICE_CONFIG_HASH = '#configure-service'
const Step = Steps.Step
const ButtonGroup = Button.Group;

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
      template: [
        {
          registry: DEFAULT_REGISTRY,
          name: 'tenx_containers/java',
          imageUrl: javaImage,
          version: ['8','7']
        },
        {
          registry: DEFAULT_REGISTRY,
          name: 'tenx_containers/tomcat',
          imageUrl: tomcatImage,
          version: ['9','8','7']
        },
        {
          registry: DEFAULT_REGISTRY,
          name: 'tenx_containers/weblogic',
          imageUrl: weblogicImage,
          version: ['11g']
        }
      ],
      currentType: 'trad'
    }
  }
  componentWillMount() {
    const { location } = this.props
    const { from, fileName } = location.query
    const { template } = this.state
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
        this.props.wrapManageList(query).then(res => {
          const { pkgs } = res.response.result.data
          const { fileType } = pkgs[0]
          window.WrapListTable = pkgs[0]
          switch(fileType) {
            case 'jar':
              this.setState({
                defaultTemplate: 0,
                version: template[0].version[0]
              })
              break
            case 'war':
              this.setState({
                defaultTemplate: 1,
                version: template[1].version[0]
              })
              break
            default:
              break
          }
        })
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
    window.template = this.state.template
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
    getWrapStoreList(query)
  }
  changeWrap(type) {
    this.setState({
      currentType: type,
      selectedRowKeys: [],
      id: [],
    })
    switch(type) {
      case 'trad':
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
        const { resourceType, DIYMemory, DIYCPU, replicas } = getFieldsValues(fields[key])
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU)
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
    this.setState({defaultTemplate: num,version:item.version[0]})
  }
  templateList() {
    const { template,defaultTemplate } = this.state
    let disabled = [defaultTemplate]
    if (defaultTemplate === 0) {
      disabled = [1,2]
    }
    if (defaultTemplate >0) {
      disabled = [0]
    }
    return template.map((item,index) => {
      let name = item.name.split('/')[1]
      return (
        <Button type="ghost" key={index} onClick={()=> this.changTemplate(index,item)} disabled={ !window.WrapListTable || disabled.some(list=> list === index)} style={{border:0}}>
        <div className="template" key={item.name}>
          <img src={`${item.imageUrl}`} />
          {defaultTemplate == index?
          [<span className="triangle" key={index+1}></span>,
          <Icon type="check" key={index +2}/>]
          :null
          }
          <span className="textoverflow">
            {
              name === 'weblogic' ?
                name.replace('w', 'W').replace('l', 'L'):
                name.substring(0, 1).toUpperCase() + name.substring(1)
            }
            </span>
        </div>
        <div className="template_version">最新版本：{template[index].version[0]}</div>
        </Button>
      )

    })
  }
  templateVersion() {
    const { defaultTemplate, template } = this.state
    if (defaultTemplate === null) {
      return <Select.Option key="none">请先选择应用包</Select.Option>
    }
    return template[defaultTemplate].version.map(item=> {
      return <Select.Option key={item}>{item}</Select.Option>
    })
  }
  goDeploy = (row)=> {
    if (!row) {
      notificat.info('请先选择应用包')
      return
    }
    if (this.state.weblogicChecked) {
      const weblogicconfig = this.refs.Weblogic.formCheckecd()
      if (!weblogicconfig) {
        return
      }
      window.WrapListTable.weblogic = weblogicconfig
    }
    const { wrapList, location } = this.props
    if(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0 && location.query.entryPkgID) {
      notificat.error('应用下已有设置entryPkgID的服务')
      return
    }
    // /app_manage/app_create/quick_create#configure-service
    const { version, defaultTemplate, template } = this.state
    let registry = wrapList.registry
    registry = registry && registry.split(/^(http:\/\/|https:\/\/)/)[2]
    // if (!version) {
    //   notificat.info('请选择版本')
    //   return
    // }
    let tag = version
    if (!version) {
      tag = template[defaultTemplate].version[0]
    }
    if (!registry) {
      notificat.error('镜像地址获取失败','尝试刷新后重试')
      return
    }
    if (template[defaultTemplate].version.indexOf(tag) == -1) {
      notificat.info('版本有误，请重新选择版本')
      return
    }
    const { appName, action} = location.query
    let imageName ='?imageName='+this.state.template[defaultTemplate].name +`&tag=${tag}`+`&registryServer=${registry}&appPkgID=${row.id}&entryPkgID=${(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0) ? row.id : ''}`
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
              <span className="wrap_key">连接Oracle </span>
              <Switch checked={this.state.weblogicChecked} onChange={(e)=> this.setState({weblogicChecked: e})} checkedChildren="开" unCheckedChildren="关" />
            </div>
            <Weblogic form={this.props.form} ref="Weblogic" />
          </div>
        )
      }
      return (
        <div className="list_row">
          <span className="wrap_key">连接Oracle </span>
          <Switch checked={this.state.weblogicChecked} onChange={(e)=> this.setState({weblogicChecked: e})} checkedChildren="开" unCheckedChildren="关" />
        </div>
      )
    }
    return null
  }
  render() {
    const { serviceList, template, defaultTemplate, version, currentType } = this.state
    const { current, quick_create, location, childrenSteps } = this.props
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
      <Step title="部署方式" />
      <Step title="选择基础镜像" />
      <Step title="配置服务" />
    </Steps>)
    }
    const header = (
      <div>高级设置
      </div>
    )
    if (quick_create) {
      return (
        <QueueAnim id="deploy_wrap">
          <div className="wrap_manage" >
            <div className="list_row">
              <span className="wrap_key">选择应用包</span>
              <span className="searchInput">
                <Input size="large" onPressEnter={(e) => this.searchData(e)} placeholder="请输入包名称搜索" />
                <Button type="primary" onClick={() => browserHistory.push('/app_center/wrap_manage')} size="large">去上传部署包</Button>

              </span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <ButtonGroup>
                <Button type="ghost" className={classNames({'active': currentType === 'trad'})} onClick={() =>this.changeWrap('trad')}>应用包</Button>
                <Button type="ghost" className={classNames({'active': currentType === 'store'})} onClick={() =>this.changeWrap('store')}>应用包商店</Button>
              </ButtonGroup>
            </div>
            <WrapListTable currentType={currentType} func={funcCallback} selectedRowKeys={this.state.selectedRowKeys} entryPkgID={location.query.entryPkgID}/>
            <br />
            <div className="list_row" style={{ height: 'auto' }}>
              <span className="wrap_key" style={{ float: 'left' }}>运行环境</span>
              <div className="template_list">
                {this.templateList()}
              </div>
              <div className="wrap_hint"><Icon type="exclamation-circle-o"/> 设置 JAVA_OPTS：在下一步『配置服务』页面，配置环境变量中修改 JAVA_OPTS 键对应的值</div>
            </div>
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
            <div className="footerBtn">
              <Button size="large" onClick={() => browserHistory.push('/app_manage/app_create')}>上一步</Button>
              <Button size="large" style={{marginLeft:10}} onClick={() => this.goDeploy(window.WrapListTable)}>下一步</Button>
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
                  <Input size="large" onPressEnter={(e) => this.searchData(e)} placeholder="请输入包名称搜索" />
                  <Button type="primary" onClick={() => browserHistory.push('/app_center/wrap_manage')} size="large">去上传部署包</Button>

                </span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <ButtonGroup>
                  <Button type="ghost" className={classNames({'active': currentType === 'trad'})} onClick={() =>this.changeWrap('trad')}>应用包</Button>
                  <Button type="ghost" className={classNames({'active': currentType === 'store'})} onClick={() =>this.changeWrap('store')}>应用包商店</Button>
                </ButtonGroup>
              </div>
              <WrapListTable location={location} currentType={currentType} func={funcCallback} selectedRowKeys={this.state.selectedRowKeys} entryPkgID={location.query.entryPkgID}/>
              <br />
              <div className="list_row" style={{ height: 'auto' }}>
                <span className="wrap_key" style={{ float: 'left' }}>运行环境</span>
                <div className="template_list">
                  {this.templateList()}
                </div>
                <div className="wrap_hint"><Icon type="exclamation-circle-o"/> 设置 JAVA_OPTS：在下一步『配置服务』页面，配置环境变量中修改 JAVA_OPTS 键对应的值</div>
              </div>
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
  const { wrapList } = state.images

  const list = wrapList || {}
  let datalist = { pkgs: [], total: 0 }
  if (list.result) {
    datalist = list.result.data
  }
  return {
    current: entities.current,
    loginUser: entities.loginUser.info,

    wrapList: datalist,
    isFetching: list.isFetching
  }
}
WrapManage = Form.create()(WrapManage)

export default connect(mapStateToProps, {
  wrapManageList,
  getWrapStoreList
})(WrapManage)