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
import { Input, Button, Card, Table, Steps, Row, Col } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { DEFAULT_REGISTRY } from '../../../constants'
import { wrapManageList } from '../../../actions/app_center'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import { formatDate } from '../../../common/tools'
import javaImage from '../../../assets/img/appstore/Java.png'
import tomcatImage from '../../../assets/img/appstore/tomcat.png'
import Title from '../../Title'
import NotificationHandler from '../../../components/Notification'

import { connect } from 'react-redux'
import './style/WrapManage.less'
const notificat = new NotificationHandler()

const Step = Steps.Step

class WrapManage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stepStatus: 'process',
      serviceList: [],
      page: 1,
      defaultTemplate:0,// 默认选中一个模板
      template: [
        {
          registry: DEFAULT_REGISTRY,
          name: 'appdeploy/java',
          imageUrl: javaImage,
          version: [7, 8]
        },
        {
          registry: DEFAULT_REGISTRY,
          name: 'appdeploy/tomcat',
          imageUrl: tomcatImage,
          version: [7, 8, 9]
        }
      ]
    }
  }
  componentWillMount() {
    this.props.wrapManageList()
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
  changTemplate(num) {
    this.setState({defaultTemplate: num})
  }
  templateList() {
    return this.state.template.map((item,index) => {
      return (
        <div className="template cursor" key={item.name} onClick={()=> this.changTemplate(index)}>
          <img src={`${item.imageUrl}`} />
          <i className="selectIcon fa fa-check-circle"></i>
          <span className="textoverflow">{item.name.split('/')[1]}</span>
        </div>
      )

    })
  }
  templateVersion() {
    const { defaultTemplate, template } = this.state
    return template[defaultTemplate].version.map(item=> {
      return <Button className="version" onClick={()=> this.setState({version: item})} type={this.state.version == item ?'primary':'ghost'}>{item}</Button>
    })
  }
  goDeploy(id) {
    // /app_manage/app_create/quick_create#configure-service
    const { version, defaultTemplate, template } = this.state
    if (!version) {
      notificat.info('请选择版本')
      return
    }
    if (template[defaultTemplate].version.indexOf(version) == -1) {
      notificat.info('版本有误，请重新选择版本')
      return
    }

    const imageName ='?imageName='+this.state.template[defaultTemplate].name +'&registryServer=192.168.1.52&appPkgID='+ id
    browserHistory.push('/app_manage/app_create/quick_create'+imageName)

  }
  render() {
    const { serviceList } = this.state
    const { current } = this.props
    const { resource, priceHour, priceMonth } = this.getAppResources()
    const dataSource = this.props.wrapList
    const columns = [
      {
        title: '包名称',
        dataIndex: 'fileName',
        key: 'name',
        width: '20%',
        render: (text, row) => <a target="_blank" href={`${API_URL_PREFIX}/pkg/${row.id}`}>{text}</a>
      }, {
        title: '版本标签',
        dataIndex: 'fileTag',
        key: 'tag',
        width: '20%',
      }, {
        title: '包类型',
        dataIndex: 'fileType',
        key: 'type',
      }, {
        title: '上传时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        render: text => formatDate(text)
      }, {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        width: '150px',
        render: (e, row) => <Button type="primary" onClick={()=> this.goDeploy(row.id)} key="1">部署</Button>
      }
    ]
    const paginationOpts = {
      size: "small",
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page,
      total: dataSource.total,
      onChange: current => this.loadData(current),
      showTotal: total => `共计： ${total} 条 `,
    }
    const _this = this


    const steps = (
      <Steps size="small" className="steps" status={this.state.stepStatus} current={this.getStepsCurrent()}>
        <Step title="部署方式" />
        <Step title="选择基础镜像" />
        <Step title="配置服务" />
      </Steps>
    )
    return (
      <QueueAnim id="deploy_wrap">
        <Title title="部署应用"/>
        <Row gutter={16}>
          <Col span="18">
            <Card key="wrap_manage" className="wrap_manage" title={steps}>
              <div className="list_row" style={{ height: 'auto' }}>
                <span className="wrap_key" style={{ float: 'left' }}>选择模板</span>
                <div className="template_list">
                  {this.templateList()}
                </div>
              </div>
              <div className="list_row">
                <span className="wrap_key">选择版本</span>
                {
                  this.templateVersion()
                }
              </div>
              <div className="list_row">
                <span className="wrap_key">选择应用包</span>
                <span className="searchInput">
                  <Input size="large" onPressEnter={(e) => this.getList(e)} placeholder="请输入包名称或标签搜索" />
                  <Button type="primary" onClick={() => browserHistory.push('/app_center/wrap_manage')} size="large">去上传部署包</Button>

                </span>
              </div>
              <br />
              <Table className="strategyTable" loading={this.props.isFetching} dataSource={dataSource.pkgs} columns={columns} pagination={paginationOpts} />
              <div className="footerBtn">
                <Button onClick={() => browserHistory.goBack()}>上一步</Button>
                <Button style={{ marginLeft: 10 }} type="primary" onClick={() => this.goDeploy()}>下一步</Button>
              </div>
            </Card>
          </Col>
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

export default connect(mapStateToProps, {
  wrapManageList
})(WrapManage)