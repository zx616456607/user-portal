/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Databse Cluster detail
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 * @change by Gaojian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { camelize } from 'humps'
import classNames from 'classnames'
import { Table, Button, Icon, Spin, Modal, Collapse, Row, Col, Popover, Input, Timeline, InputNumber, Tabs, Tooltip, Radio, Select, Form} from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbClusterDetail,
  deleteDatabaseCluster,
  putDbClusterDetail,
  loadDbCacheList,
  editDatabaseCluster,
  updateMysqlPwd,
  getDbDetail} from '../../actions/database_cache'
import { setServiceProxyGroup, dbServiceProxyGroupSave } from '../../actions/services'
import { getProxy } from '../../actions/cluster'
import './style/ModalDetail.less'
import AppServiceEvent from '../AppModule/AppServiceDetail/AppServiceEvent'
import Storage from '../../../client/containers/DatabaseCache/ClusterDetailComponent/Storage'
import Backup from '../../../client/containers/DatabaseCache/ClusterDetailComponent/Backup'
import ConfigManagement from '../../../client/containers/DatabaseCache/ClusterDetailComponent/ConfigManagement'
import ResourceConfig from '../../../client/components/ResourceConfig'
import { calcuDate, parseAmount, getResourceByMemory } from '../../common/tools.js'
import NotificationHandler from '../../common/notification_handler'
import { ANNOTATION_SVC_SCHEMA_PORTNAME, ANNOTATION_LBGROUP_NAME } from '../../../constants'
import mysqlImg from '../../assets/img/database_cache/mysql.png'
import redisImg from '../../assets/img/database_cache/redis.jpg'
import zkImg from '../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../assets/img/database_cache/etcd.jpg'

const Option = Select.Option;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
class VolumeHeader extends Component {
  constructor(props) {
    super(props)
  }
  // 类名
  style = status => {
      switch (status) {
        case 'Stopped':
          return {
            color: '#f85a5a',
          }
        case 'Stopping':
          return {
            color: '#ffbf00',
          }
        case 'Pending':
          return {
            color: '#ffbf00',
          }
        case 'Running':
          return {
            color: '#5cb85c',
          }
        default:
          return {
            color: '#cccccc',
          }
      }

  }
  render() {
    const { data } = this.props
    return (
      <Row>
        <Col className="group-name textoverflow" span="8">
          <Icon type="folder-open" />
          <Icon type="folder" />
          <Link to={`/app_manage/container/` + data.name}>{data.name}</Link>
        </Col>
        <Col span="6">
          <div style={this.style(data.status)}>
            <i className="fa fa-circle"></i> &nbsp;
            {data.status}
          </div>
        </Col>
        <Col span="10">
          创建时间&nbsp;&nbsp;{calcuDate(data.creationTimestamp)}
        </Col>
      </Row>
    )
  }
}

class VolumeDetail extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { volumes } = this.props
    // const containers = this.props.volumes.podSpec.containers[0]
    if (!volumes) {
      return (
        <div></div>
      )
    }

    return (
      <Row className='file-list'>
        <Timeline>
          <Timeline.Item key={volumes.claimName}>
            <Row className='file-item'>
              <div className='line'></div>
              <table>
                <tbody>
                  <tr>
                    <td style={{ padding: '15px' }}>
                      <div style={{ width: this.props.selfScope.state.winWidth }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{volumes.claimName}</div>
                    </td>

                    <td style={{ width: '130px', textAlign: 'center' }}>
                      <div className='li'>关联容器</div>
                      <div className='lis'>挂载路径</div>
                    </td>
                    <td>
                      <div className="li"><Link to={`/app_manage/container/` + volumes.name}>{volumes.name}</Link></div>
                      <div className='lis'>{volumes.mountPath}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </Row>
          </Timeline.Item>
        </Timeline>
      </Row>
    )
  }
}

class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.state ={
      passShow: false,
      storageValue: this.props.database.spec ? parseInt(this.props.database.spec.volumeClaimTemplate.spec.resources.requests.storage) : 0,
      resourceConfigEdit: false,
      resourceConfigValue: '',
      composeType: 'DIY',
      defaultType: 'DIY', //默认的资源配置类型
      defaultResourceConfig: { //默认的资源配置值
        maxCPUValue: 0.5,
        maxMemoryValue: 100,
        minCPUValue: 0.5,
        minMemoryValue: 100
      },
      changePasswordModal: false,
      // 绑定到 ResourceConfig组件上的资源配置值
      resourceConfig: {
        maxCPUValue: 0.5,
        maxMemoryValue: 100,
        minCPUValue: 0.5,
        minMemoryValue: 100
      },
      pwdModalShow: false
    }
  }
  componentDidMount() {
    // 将后台请求回的资源数据赋值
    const resource = this.props.databaseInfo.resources
    const { limits, requests } = resource
    const cpuMax = limits.cpu
    const memoryMax = limits.memory
    const cpuMin = requests.cpu
    const memoryMin = requests.memory
    let resourceConfigs = {
      maxCPUValue:cpuMax.indexOf('m')<0? cpuMax : parseInt(cpuMax)/1000,
      maxMemoryValue:memoryMax.indexOf('Gi')>= 0 ? parseInt(memoryMax) * 1000 : parseInt(memoryMax),
      minCPUValue:cpuMin.indexOf('m')<0? cpuMin : parseInt(cpuMin)/1000,
      minMemoryValue:memoryMin.indexOf('Gi')>= 0 ? parseInt(memoryMin) * 100 : parseInt(memoryMin)
    }
    if(resource.requests.cpu.indexOf('m')<0) {
      let temp = resourceConfigs.maxCPUValue
      resourceConfigs.maxCPUValue = resourceConfigs.minCPUValue
      resourceConfigs.minCPUValue = temp
    }
    // 判断资源类型是自定义类型还是默认类型
    const { maxCPUValue, maxMemoryValue, minCPUValue, minMemoryValue } = resourceConfigs
    if (
      maxCPUValue == 1 &&
      minCPUValue == 0.2 &&
      maxMemoryValue == 512 &&
      minMemoryValue == 512
    ) {
      this.setState({
        composeType: 512,
        defaultType: 512
      })
    } else {
      this.setState({
        resourceConfig: resourceConfigs,
        defaultResourceConfig: resourceConfigs
      })

    }
    const winWidth = document.body.clientWidth
    if (winWidth > 1440) {
      this.setState({winWidth: '220px'})
      return
    }
    this.setState({
      winWidth: '120px',
    })
  }
  copyDownloadCode(index) {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("databaseCodeInput");
    code[index].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  // 修改密码弹出层
  passwordPanel = () => {
    const { getFieldProps } = this.props.form
    const checkPass = (rule, value, callback) => {
      const { validateFields } = this.props.form;
      if (value) {
        validateFields(['rePasswd'], { force: true });
      }
      callback();
    }
    const checkRepetPass = (rule, value, callback) => {
      const { getFieldValue } = this.props.form;
      if (value && value !== getFieldValue('passwd')) {
        callback('两次输入密码不一致！');
      } else {
        callback();
      }
    }

    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: checkRepetPass,
      }],
    })
    const confirm = e => {
      e.preventDefault();
      this.props.form.validateFields((errors, values) => {
        if (!!errors) {
          return;
        }
        const { dbName, database } = this.props
        const { cluster, editDatabaseCluster, updateMysqlPwd, loadDbClusterDetail } = this.props.scope.props
        // mysql 和 redis修改密码是两种方式
        if (database === 'mysql') {
          const body = {
            root_password: values.passwd
          }
          updateMysqlPwd(cluster, dbName, body, {
            success: {
              func: () => {
                setTimeout(() => {
                  loadDbClusterDetail(cluster, dbName, database, true);
                })
                this.setState({
                  pwdModalShow: false
                })
              }
            },
          })
        } else if(database === 'redis') {
          const body = {
            password: values.passwd
          }
          editDatabaseCluster(cluster, database, dbName, body, {
            success: {
              func: () => {
                setTimeout(() => {
                  loadDbClusterDetail(cluster, dbName, database, true);
                })
                this.setState({
                  pwdModalShow: false
                })
              }
            },
          })
        }
      });
    }
    return <Form className="pwdChangeWrapper">
        <FormItem >
          <Input {...passwdProps} type="password" placeholder="新密码" style={{width: 205}}/>
        </FormItem>
        <FormItem >
          <Input {...rePasswdProps} type="password" placeholder="两次密码输入保持一致" style={{width: 205}}/>
        </FormItem>
        <div className="pwd-btn-group">
          <Button onClick={() => this.setState({
            pwdModalShow: false
          })
          }>取消</Button>
          <Button type='primary' onClick={confirm}>确定</Button>
        </div>
      </Form>

  }
  // 修改资源配置的时候将值记录下来
  recordResouceConfigValue = (values) => {
    // getResourceByMemory
    this.setState({
      resourceConfigValue: values
    })
  }
  // 选择现成的or自定义的资源类型
  selectComposeType = type => {
    this.setState({
      composeType: type,
    })
  }
  // 保存资源配置修改
  saveResourceConfig = () => {
    const { dbName, database } = this.props
    const { cluster, editDatabaseCluster, loadDbClusterDetail } = this.props.scope.props
    const { resourceConfigValue } = this.state
    const body = {
      resources: {
        limits: {
          cpu: `${resourceConfigValue.maxCPUValue*1000}m`,
          memory: `${resourceConfigValue.maxMemoryValue}Mi`,
        },
        requests: {
          cpu: `${resourceConfigValue.minCPUValue*1000}m`,
          memory: `${resourceConfigValue.minMemoryValue}Mi`
        }
      }
    }
    editDatabaseCluster(cluster, database, dbName, body, {
      success: {
        func: () => {
          setTimeout(() => {
            loadDbClusterDetail(cluster, dbName, database, true);
          })
          this.setState({
            resourceConfigEdit: false
          })
        }
      },
    })
  }
  // 取消资源配置修改
  cancelEditResourceConfig = () => {
    this.refs.resourceConfig.resetFields() // 取消重置自定义中的所有值
    this.setState({
      resourceConfigEdit: false,
      composeType: this.state.defaultType,
      resourceConfig: Object.assign({}, this.state.defaultResourceConfig)
    })
  }

  render() {
    const { databaseInfo ,dbName, database } = this.props
    const { resourceConfigEdit, composeType } = this.state
    const parentScope = this.props.scope
    const { billingEnabled } = parentScope.props
    const rootScope = parentScope.props.scope
    // if (databaseInfo.podList.pods && databaseInfo.podList.pods.length > 0) {
    //   podSpec = databaseInfo.podList.pods[0].podSpec
    // }
    let storagePrc = parentScope.props.resourcePrice && parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice && parentScope.props.resourcePrice['2x'] * parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc ), 4)
    const countPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc) * 24 * 30 , 4)
    // const showHourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * this.props.currentData.desired +  this.props.currentData.desired * containerPrc), 4)
    // const showCountPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * this.props.currentData.desired +  this.props.currentData.desired * containerPrc) * 24 * 30, 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)

    const modalContent = (
      <div className="modal-content">
        <div className="modal-header">更改实例数  <Icon type='cross' onClick={() => parentScope.colseModal()} className='cursor' style={{ float: 'right' }} /></div>
        <div className="modal-li padTop"><span className="spanLeft">服务名称</span><span>{dbName}</span></div>
        <div className="modal-li">
          <span className="spanLeft">实例副本</span>
          <InputNumber onChange={(e) => parentScope.setState({ replicas: e })}
                       value={parentScope.state.replicas}
                       min={ this.props.database == 'zookeeper' ? 3 : 1 }
                       /> &nbsp; 个
        </div>
        <div className="modal-li">
          <span className="spanLeft">存储大小</span>·
          {/* <Slider min={500} max={10000} onChange={(value)=>parentScope.onChangeStorage(value)} value={parentScope.state.storageValue} step={100} /> */}
          <InputNumber min={512} step={512} max={20480} disabled={true} value={databaseInfo.storage} /> &nbsp;
        </div>
        {
          billingEnabled &&
          <div className="modal-price">
            <div className="price-left">
              <div className="keys">实例：<span className="unit">{ containerPrc.fullAmount }</span>/（个*小时）* { parentScope.state.replicas } 个</div>
              <div className="keys">存储：<span className="unit">{ storagePrc.fullAmount }</span>/（GB*小时）* { parentScope.state.replicas } 个</div>
            </div>
            <div className="price-unit">
              <p>合计：
                <span className="unit">{countPrice.unit=='￥' ? ' ￥' : ''}</span>
                <span className="unit blod">{ hourPrice.amount }{containerPrc.unit=='￥'? '' : ' T'}/小时</span>
              </p>
              <p>
                <span className="unit">（约：{ countPrice.fullAmount } /月）</span>
              </p>
            </div>
          </div>
        }
        {parentScope.state.putModaling ?
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" loading={true} type="primary">保存</Button></div>
        :
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" type="primary" onClick={() => parentScope.handSave()}>保存</Button></div>
       }
      </div>
    )

    const volumeMount = databaseInfo.pods && databaseInfo.pods.map((list, index) => {
      return (
        <Panel header={<VolumeHeader data={list} database={database}/>} key={'volumeMount-' + index}>
          <VolumeDetail volumes={list} key={'VolumeDetail-' + index} selfScope={this}/>
        </Panel>
      )
    })

    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          {this.props.database === 'elasticsearch' || this.props.database === 'etcd' ? null :
          <div><div className='configHead'>参数</div>
            <ul className='parse-list'>
              <li><span className='key'>用户名：</span> <span className='value'>{ this.props.database === 'zookeeper' ? "super" : "root" }</span></li>
              <li>
                <span className='key'>密码：</span>
                {
                  this.state.passShow ?
                    <span>
                      <span className='value'>{ databaseInfo.password }</span>
                      <span className="pasBtn" onClick={() => this.setState({ passShow: false })}>
                        <i className="fa fa-eye-slash"></i> 隐藏
                      </span>
                    </span>
                    :
                    <span>
                      <span className='value'>******</span>
                      <span className="pasBtn" onClick={() => this.setState({ passShow: true })}>
                        <i className="fa fa-eye"></i>显示
                      </span>
                    </span>
                }
                <Popover content={this.passwordPanel()} visible={this.state.pwdModalShow} title={null} trigger="click">
                  <Button type="primary" style={{ marginLeft:24 }} onClick={() => this.setState({
                    pwdModalShow: true
                  })}>修改密码</Button>
                </Popover>
              </li>
            </ul>
          </div>}
          <div className="resourceConfigPart">
            <div className="themeHeader"><i className="themeBorder"/>资源配置
              {
                resourceConfigEdit?
                  <div className="resource-config-btn">
                    <Button size="large" onClick={() => this.cancelEditResourceConfig()}>取消</Button>
                    <Button type="primary" size="large" onClick={this.saveResourceConfig}>确定</Button>
                  </div>
                  :
                  <Button type="primary" className="resource-config-btn" size="large" onClick={() => this.setState({resourceConfigEdit: true})} style={{ marginLeft: 30 }}>编辑</Button>
              }
            </div>
            <div className="tips">
              Tips: 重新编辑配置 , 保存后系统将重启该集群的所有实例。 将进行滚动升级。
            </div>

            <ResourceConfig
              ref="resourceConfig"
              toggleComposeType={this.selectComposeType}
              composeType={composeType}
              onValueChange={this.recordResouceConfigValue}
              value={this.state.resourceConfig}
              freeze={!resourceConfigEdit}/>
          </div>

          <div className="themeHeader"><i className="themeBorder"/>实例副本 <span>{this.props.currentData.replicas}个 &nbsp;</span>
            <Popover content={modalContent} title={null} trigger="click" overlayClassName="putmodalPopover"
              visible={rootScope.state.putVisible} getTooltipContainer={()=> document.getElementById('AppServiceDetail')}
              >
              <Button type="primary" size="large" onClick={() => parentScope.props.scope.putModal()}>更改实例数</Button>
            </Popover>
          </div>
          <Collapse accordion>
            {volumeMount}
          </Collapse>
        </div>
      </div>
    )
  }
}

const FormBaseInfo = Form.create()(BaseInfo)

class VisitTypes extends Component{
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      disabled:true,
      forEdit: false,
      selectDis: undefined,
      deleteHint: true,
      svcDomain: [],
      copyStatus: false,
      isInternal: false,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      groupID:'',
      selectValue: ''
    }
  }
  componentWillMount() {
    const { getProxy, clusterID, databaseInfo } = this.props;
    const lbinfo = databaseInfo.service.annotations && databaseInfo.service.annotations[ANNOTATION_LBGROUP_NAME]

    if(lbinfo == 'none') {
      this.setState({
        initValue: 1,
        initSelectDics: true
      })
    } else {
      this.setState({
        initValue: 2,
        initGroupID: lbinfo,
        initSelectDics: false,
      })
    }
    getProxy(clusterID,true,{
      success: {
        func: (res) => {
          this.setState({
            proxyArr:res[camelize(clusterID)].data
          })
        },
        isAsync: true
      },
    })
  }
  componentWillReceiveProps(nextProps) {
    const { detailModal, isCurrentTab } = nextProps;
    if ((!detailModal && this.props.detailModal != nextProps.detailModal) || (!isCurrentTab && isCurrentTab != this.props.isCurrentTab)) {
      this.cancelEdit()
    }
  }
  onChange(e) {
    let value = e.target.value;
    let flag;
    this.setState({
      value: value,
      selectDis: false,
      selectValue: null
    });
    if (value === 1) {
      flag = 'incluster'
      this.setState({
        selectDis: true
      })
    } else {
      flag = 'other'
    }
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit:true
    });
  }
  saveEdit() {
    const { groupid, initValue } = this.state;
    let value = this.state.value
    if(!value) {
      value = this.state.initValue
    }
    const { databaseInfo, database, dbServiceProxyGroupSave, clusterID, form, scope } = this.props;
    form.validateFields((err, values) => {
      if(err) {
        return
      }
      let groupID = 'none'
      let body = {
        annotations: {
          'system/lbgroup': groupID,
        }
      }

      if(value == 2) {
        groupID = form.getFieldValue('groupID')
        body = {
          annotations: {
            'system/lbgroup': groupID,
            'tenxcloud.com/schemaPortname': `${databaseInfo.service.name}/${databaseInfo.service.port.protocol}/${databaseInfo.service.port.port}`
          }
        }
      }
      const notification = new NotificationHandler()
      notification.spin('保存中更改中')

      dbServiceProxyGroupSave(clusterID, database, databaseInfo.objectMeta.name, body, {
        success: {
          func: () => {
            notification.close()
            notification.success('出口方式更改成功')
            const { loadDbClusterDetail } = scope.props
            setTimeout(() => {
              loadDbClusterDetail(clusterID, databaseInfo.objectMeta.name, database, false);
            }, 0)
            this.setState({
              disabled: true,
              forEdit:false
            });
            if (value ===1) {
              this.setState({
                initValue: 1,
                initSelectDics: true,
                addrHide: true,
                isinternal:false,
                addrhide: false,
                value: undefined,
                selectDics: undefined
              })
            } else {
              this.setState({
                initValue: 2,
                initGroupID: groupID,
                initSelectDics: false,
                addrHide: false,
                selectDics: undefined,
                value: undefined,
                isinternal:true,
              })
              form.setFieldsValue({
                groupID
              })
            }
          },
          isAsync: false
        },
        failed: (res) => {
          notification.close()
          let message = '更改出口方式失败'
          if(res.message) {
            message = res.message
          }
          if(res.message && res.message.message) {
            message = res.message.message
          }
          notification.error(message)
        }
      })
    })
  }
  cancelEdit() {
    this.setState({
      disabled: true,
      forEdit:false,
      value: this.state.initValue,
      selectDis: this.state.initSelectDis,
    });
    const { form } = this.props
    form.setFieldsValue({
      groupID: this.state.initGroupID
    })
  }
  handleChange(value) {
    this.setState({
      groupID: value,
      selectValue: value
    })
  }
  copyTest() {
    let target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  startCopyCode(domain){
    let target = document.getElementsByClassName('copyTest')[0];
    target.value = domain;
  }
  returnDefaultTooltip() {
    this.setState({
      copyStatus: false
    })
  }
  render() {
    const { bindingIPs, domainSuffix, databaseInfo, form } = this.props
    const { value, disabled, forEdit, selectDis, deleteHint, copyStatus, addrHide, proxyArr, initValue, initGroupID, initSelectDics } = this.state;
    const lbinfo = databaseInfo.service.annotations[ANNOTATION_LBGROUP_NAME]
    let clusterAdd = [];
    let port = databaseInfo.service.port.port;
    let serviceName = databaseInfo.objectMeta.name;
    let portNum = databaseInfo.pods && databaseInfo.pods.length;
    for (let i = 0; i < portNum; i++) {
      clusterAdd.push({
        start:`${serviceName}-${i}`,
        end:`${serviceName}-${i}.${serviceName}:${port}`
      })
    }
    const domainList = clusterAdd && clusterAdd.map((item,index)=>{
      return (
        <dd className="addrList" key={item.start}>
          <span className="domain">{item.end}</span>
          <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
            <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,item.end)} onClick={this.copyTest.bind(this)}/>
          </Tooltip>
        </dd>
      )
    })
    let validator = (rule, value, callback) => callback()
    if(value == 2) {
      validator = (rule, value, callback) => {
        if(!value) {
          return callback('请选择网络出口')
        }
        return callback()
      }
    }
    const selectGroup = form.getFieldProps("groupID", {
      rules:[{
        validator
      }],
      initialValue: initGroupID
    })
    const proxyNode = proxyArr.length > 0 ? proxyArr.map((item,index)=>{
      return (
          <Option key={item.id} value={item.id}>{item.type == 'public' ? '公网：' : '内网：'}{item.name}</Option>
      )
    }):null
    let domain = ''
    if (domainSuffix) {
      domain = eval(domainSuffix)[0]
    }
    let bindingIP = ''
    if (bindingIPs) {
      bindingIP = eval(bindingIPs)[0]
    }
    // get domain, ip from lbgroup
    proxyArr && proxyArr.every(proxy => {
      if (proxy.id === lbinfo) {
        domain = proxy.domain
        bindingIP = proxy.address
        return false
      }
      return true
    })
    let portAnnotation = databaseInfo.service.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]
    let externalPort = ''
    if (portAnnotation) {
      externalPort = portAnnotation.split('/')
      if (externalPort && externalPort.length > 1) {
        externalPort = externalPort[2]
      }
    }
    let externalUrl
    if (externalPort != '') {
      if (domain) {
        externalUrl = databaseInfo.serviceInfo.name + '-' + databaseInfo.serviceInfo.namespace + '.' + domain + ':' + externalPort
      } else {
        externalUrl = bindingIP + ':' + externalPort
      }
    }
    const inClusterLB = `${serviceName}:${port}`
    const radioValue = value || initValue
    const hide = selectDis == undefined ? initSelectDics : selectDis
    const dataSource = [
      {
        key: 'externalUrl',
        text: '出口地址',
      },
      {
        key: 'inClusterUrls',
        text: '集群内实例访问地址',
      },
      {
        key: 'inClusterLB',
        text: '集群内负载均衡地址',
      },
    ]
    const columes = [
      {
        title: '类型',
        dataIndex: 'text',
        key: 'text',
        width: '30%',
      },
      {
        title: '地址',
        dataIndex: 'key',
        key: 'key',
        width: '70%',
        render: key => {
          if (key === 'externalUrl') {
            return (
              <div>
                {
                  externalUrl
                  ? (
                    <div>
                      <span className="domain">{externalUrl}</span>
                      <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                        <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,externalUrl)} onClick={this.copyTest.bind(this)}/>
                      </Tooltip>
                    </div>
                  )
                  : '-'
                }
              </div>
            )
          }
          if (key === 'inClusterUrls') {
            return domainList
          }
          return (
            <div>
              <span className="domain">{inClusterLB}</span>
              <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,inClusterLB)} onClick={this.copyTest.bind(this)}/>
              </Tooltip>
            </div>
          )
        }
      },
    ]
    return (
      <div id="visitsTypePage" className="modalDetailBox">
        <div className="visitTypeTopBox configContent">
          <div className="visitTypeTitle configHead">集群访问方式</div>
          <div className="visitTypeInnerBox">
            {
              forEdit ? [
                <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>,
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>
              ] :
                <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={radioValue}>
                <Radio key="b" value={2} disabled={disabled}>可集群外访问</Radio>
                <Radio key="a" value={1} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  radioValue === 1 ? '选择后该数据库与缓存集群仅提供集群内访问；': '数据库与缓存可提供集群外访问，选择一个网络出口；'
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': hide})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled}
                        getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                >
                  {proxyNode}
                </Select>
               </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': deleteHint})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>未配置该网络出口模式，请选择其他模式</div>
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox configContent">
          <div className="visitTypeTitle configHead">访问地址</div>
          <div className="visitAddrInnerBox">
          <input type="text" className="copyTest" style={{opacity:0}}/>
            <Table
              dataSource={dataSource}
              columns={columes}
              showHeader={false}
              pagination={false}
              bordered
            />
          </div>
        </div>
      </div>
    )
  }
}

function mapSateToProp(state) {
  const { current } = state.entities;
  const { clusterID } = current.cluster
  return {
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    clusterID
  }
}

VisitTypes = connect(mapSateToProp, {
  setServiceProxyGroup,
  dbServiceProxyGroupSave,
  getProxy
})(Form.create()(VisitTypes))

class LeasingInfo extends Component {
  constructor(props) {
    super(props)
    this.state ={
      storageValue: this.props.databaseInfo.storage ? parseInt(this.props.databaseInfo.storage) : 0
    }
  }
  render() {
    const parentScope = this.props.scope
    const { databaseInfo } = this.props
    let storagePrc = parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice['2x'] * parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc ), 4)
    const countPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc) * 24 * 30 , 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)
    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          <div className='configHead'>租赁信息</div>
          <div className="containerPrc">
            <p><Icon type="pay-circle-o" /> 实例：<span className="unit">{ containerPrc.fullAmount }/（个*小时）</span> * {databaseInfo.replicas}个</p>
            <p><Icon type="hdd" /> 存储：<span className="unit">{ storagePrc.fullAmount }/（GB*小时）</span> * {databaseInfo.replicas}个</p>
          </div>
          <div className="countPrice">
            合计价格：<span className="unit">{hourPrice.unit =='￥' ? '￥': ''}</span><span className="unit blod">{hourPrice.amount}{hourPrice.unit =='￥' ? '': ' T'}/小时</span> <span className="unit" style={{marginLeft:'10px'}}>（约：{countPrice.fullAmount}/月）</span>
          </div>
        </div>
      </div>
    )
  }
}

class ModalDetail extends Component {
  constructor() {
    super()
    this.state = {
      currentDatabase: null,
      activeTabKey:'#BaseInfo',
      putModaling: false,
      startAlertModal: false,
      stopAlertModal: false,
      accessMethodData: null
    }
  }
  deleteDatebaseCluster(dbName) {
    //this function for use delete the database
    const { deleteDatabaseCluster, cluster, scope, database } = this.props;
    const _this = this
    this.setState({delModal: false})
    let notification = new NotificationHandler()
    _this.setState({ deleteBtn: true })
    deleteDatabaseCluster(cluster, dbName, database, {
      success: {
        func: () => {
          notification.success('删除成功')
          scope.setState({
            detailModal: false
          });
          setTimeout(() => {
            scope.props.loadDbCacheList(cluster, database)
          })
        }
      },
      failed: {
        func: (res) => {
          scope.setState({
            detailModal: false
          });
          _this.setState({deleteBtn: false})
          notification.error('删除失败', res.message.message)
        }
      }
    });

  }
  componentWillMount() {
    const { loadDbClusterDetail, getDbDetail, cluster, dbName, database } = this.props
    // 请求之前的获取详情的接口，主要为了访问方式的数据
    getDbDetail(cluster, dbName, {
      success: {
        func: res => {
          this.setState({
            accessMethodData: res.database
          })
        }
      }
    })
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, database, true, {
      success: {
        func: (res) => {
          _this.setState({
            replicas: res.database.replicas,
            storageValue: parseInt(res.database.storage)
          })
        }
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const { loadDbClusterDetail, cluster, dbName, database } = nextProps;
    const _this = this
    if (dbName != this.state.currentDatabase) {
      this.setState({
        currentDatabase: dbName,
        deleteBtn: false
      })
      loadDbClusterDetail(cluster, nextProps.dbName, database, true, {
        success: {
          func: (res) => {
            _this.setState({ replicas: 2 })
          }
        },
      });
    }
  }
  refurbishDetail() {
    const { loadDbClusterDetail, cluster, dbName, database } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, database, {
      success: {
        func: (res) => {
          _this.setState({ replicas: res.database.replicas })
        }
      }
    });
  }
  putModal() {
    const putVisible = this.props.scope.state.putVisible
    this.props.scope.setState({
      putVisible: !putVisible
    })
  }
  handSave() {
    const {putDbClusterDetail, cluster, database, dbName, editDatabaseCluster, loadDbCacheList, loadDbClusterDetail} = this.props
    const parentScope = this.props.scope
    const _this = this
    const notification = new NotificationHandler()
    this.setState({putModaling: true})
    const body = {replicas: this.state.replicas}
    editDatabaseCluster(cluster, database, dbName, body, {
      success: {
        func: () => {
          notification.success('更新成功')
          parentScope.setState({ detailModal: false })
          _this.setState({putModaling: false})
          setTimeout(() => {
            loadDbCacheList(cluster, database)
            loadDbClusterDetail(cluster, dbName, database, {
              success: {
                func: (res) => {
                  parentScope.setState({
                    replicas: res.database.replicas,
                    storageValue: parseInt(res.database.storage)
                  })
                }
              }
            });
          })
        }
      },
    })

  }
  colseModal() {
    const storageValue = parseInt(this.props.databaseInfo.storage)
    this.putModal()
    this.setState({
      putModaling:false,
      replicas: this.props.databaseInfo.replicas,
      storageValue
    })
  }
  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    this.setState({
      activeTabKey
    })
  }
  logo(clusterType) {
    const logoMapping = {
      'mysql': mysqlImg,
      'redis': redisImg,
      'zookeeper': zkImg,
      'elasticsearch': esImg,
      'etcd': etcdImg,
    }
    if (!(clusterType in logoMapping)) {
      return redisImg
    }
    return logoMapping[clusterType]
  }
  dbStatus(status) {
    if (status === 'Running') {
      return (<span className='running'><i className="fa fa-circle"></i> 运行中 </span>)
    }
    if (status === 'Pending') {
       return (<span className='padding'><i className="fa fa-circle"></i> 启动中 </span>)
    }
    if (status === 'Stopping') {
       return (<span className='padding'><i className="fa fa-circle"></i> 停止中 </span>)
    }
    if (status === 'Stopped') {
       return (<span className='stop'><i className="fa fa-circle"></i> 已停止 </span>)
    }
  }
  stopAlert = () => {
    this.setState({
      stopAlertModal: true
    })
  }
  startAlert = () => {
    this.setState({
      startAlertModal: true
    })
  }
  stopTheCluster = () => {
    const { cluster, databaseInfo, database, editDatabaseCluster, dbName, loadDbClusterDetail } = this.props
    const { name } = databaseInfo.objectMeta

    const body = {onOff: "stop"}

    editDatabaseCluster(cluster, database, name, body, {
      success: {
        func: () => {
          setTimeout(() => {
            loadDbClusterDetail(cluster, dbName, database, true);
          })
          this.setState({
            stopAlertModal: false
          })
        }
      },
    })
  }
  startTheCluster = () => {
    const { cluster, databaseInfo, database, editDatabaseCluster, dbName, loadDbClusterDetail } = this.props
    const { name } = databaseInfo.objectMeta
    const body = {onOff: "start"}
    editDatabaseCluster(cluster, database, name, body, {
      success: {
        func: () => {
          setTimeout(() => {
            loadDbClusterDetail(cluster, dbName, database, true);
          })
          this.setState({
            startAlertModal: false
          })
        }
      }
    })
  }
  clusterBtn = status => {
    switch (status) {
      case 'Pending':
        return <Button type="primary" style={{marginRight:'10px'}} onClick={this.stopAlert}>
          <span className="stopIcon"></span>停止
        </Button>
      case 'Running':
        return <Button type="primary" style={{marginRight:'10px'}} onClick={this.stopAlert}>
          <span className="stopIcon"></span>停止
        </Button>
      case 'Stopped':
        return <Button type="primary" icon="caret-right" style={{marginRight:'10px'}} onClick={this.startAlert}>启动</Button>
      case 'Stopping':
        return <Button type="primary" icon="caret-right" style={{marginRight:'10px'}} onClick={this.startAlert}>启动</Button>
    }
  }
  render() {
    const { scope, dbName, isFetching, databaseInfo, domainSuffix, bindingIPs, billingEnabled, database } = this.props;

    if (isFetching || databaseInfo == null) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='topBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false }) } } />
          <div className='imgBox'>
            <img src={ this.logo(this.props.database) } />
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {databaseInfo.objectMeta && databaseInfo.objectMeta.name}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">{databaseInfo.objectMeta.namespace} / {databaseInfo.objectMeta.name}</div>
              <div> 状态：
                {this.dbStatus(databaseInfo.status)}
              </div>
            </div>
            <div className='rightBox'>
              <div className='li'>
                {/*操作按钮*/}
                {this.clusterBtn(databaseInfo.status)}
                <Button style={{marginRight:'10px'}} onClick={()=> this.refurbishDetail()}>
                  <i className="fa fa-refresh"></i>&nbsp;
                  刷新
                </Button>
                {this.state.deleteBtn ?
                  <Button size='large' className='btn-danger' type='ghost' loading={true}>
                    删除集群
                </Button>
                  :
                  <Button size='large' className='btn-danger' type='ghost' onClick={()=> this.setState({delModal: true}) }>
                    <Icon type='delete' />删除集群
                </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作" visible={this.state.delModal}
          onOk={()=> this.deleteDatebaseCluster(dbName)} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除数据库 { dbName }?</div>
        </Modal>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left'
              onTabClick={(e)=> this.onTabClick(e)}
              activeKey={this.state.activeTabKey}
              >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <FormBaseInfo domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData} databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
              </TabPane>
              <TabPane tab='存储' key='#Storage'>
                <Storage databaseInfo={databaseInfo} database={this.props.database}/>
              </TabPane>
              <TabPane tab='备份' key='#Backup'>
                <Backup database={database} scope= {this} databaseInfo={databaseInfo}/>
              </TabPane>
              <TabPane tab='配置管理' key='#ConfigManage'>
                <ConfigManagement database={database} databaseInfo={databaseInfo}/>
              </TabPane>
              { billingEnabled ?
                [<TabPane tab='访问方式' key='#VisitType'>
                 <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                             databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                 </TabPane>,
                 <TabPane tab='事件' key='#events'>
                   <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                 </TabPane>,
                 <TabPane tab='租赁信息' key='#leading'>
                   <LeasingInfo databaseInfo={databaseInfo} scope= {this} />
                 </TabPane>]
                :
                [<TabPane tab='访问方式' key='#VisitType'>
                 <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                            databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                 </TabPane>,
                <TabPane tab='事件' key='#events'>
                  <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                </TabPane>]
              }
            </Tabs>
          </div>
        </div>
        <Modal
          visible={this.state.stopAlertModal}
          title="停止数据库与缓存集群"
          onCancel={() => this.setState({stopAlertModal: false})}
          onOk={this.stopTheCluster}
        >
          <div className="alertContent">
            <Icon type="question-circle-o" />{`是否确定停止${databaseInfo.objectMeta.name}集群？`}
          </div>
        </Modal>
        <Modal
          visible={this.state.startAlertModal}
          title="启动数据库与缓存集群"
          onCancel={() => this.setState({startAlertModal: false})}
          onOk={this.startTheCluster}
        >
          <div className="alertContent">
            <Icon type="question-circle-o" />{`是否确定启动${databaseInfo.objectMeta.name}集群？`}
          </div>
        </Modal>
      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const { enabled: billingEnabled } = billingConfig
  const defaultMysqlList = {
    isFetching: false,
    cluster: cluster.clusterID,
    databaseInfo: null,
  }
  const { databaseClusterDetail } = state.databaseCache
  const { databaseInfo, isFetching } = databaseClusterDetail.databaseInfo || defaultMysqlList
  return {
    isFetching,
    cluster: cluster.clusterID,
    domainSuffix: cluster.bindingDomains,
    bindingIPs: cluster.bindingIPs,
    databaseInfo: databaseInfo,
    resourcePrice: cluster.resourcePrice, //storage
    billingEnabled
  }
}

ModalDetail.PropTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbClusterDetail: PropTypes.func.isRequired,
  deleteDatabaseCluster: PropTypes.func.isRequired,
}

ModalDetail = injectIntl(ModalDetail, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbClusterDetail,
  deleteDatabaseCluster,
  putDbClusterDetail,
  loadDbCacheList,
  parseAmount,
  editDatabaseCluster,
  updateMysqlPwd,
  getDbDetail// 修改MySQL集群密码
})(ModalDetail)
