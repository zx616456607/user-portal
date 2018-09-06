/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Databse Cluster detail
 *
 * v2.0 - 2016-10-11
 * @author Bai YuBackup
 * @change by Gaojian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { camelize } from 'humps'
import classNames from 'classnames'
import { Table,
  Button,
  Icon,
  Spin,
  Modal,
  Collapse,
  Row,
  Col,
  Popover,
  Input,
  Dropdown,
  Menu,
  Timeline,
  InputNumber,
  Tabs,
  Tooltip,
  Radio,
  Select,
  Form,
  Checkbox} from 'antd'
import { injectIntl } from 'react-intl'
import { loadDbClusterDetail,
  deleteDatabaseCluster,
  putDbClusterDetail,
  loadDbCacheList,
  editDatabaseCluster,
  updateMysqlPwd,
  rebootCluster,
} from '../../actions/database_cache'
import { setServiceProxyGroup, dbServiceProxyGroupSave } from '../../actions/services'
import { getProxy } from '../../actions/cluster'
import './style/ModalDetail.less'
import AppServiceEvent from '../AppModule/AppServiceDetail/AppServiceEvent'
import DatabaseEvent from '../../../client/containers/DatabaseCache/ClusterDetailComponent/DatabaseEvent'
import Storage from '../../../client/containers/DatabaseCache/ClusterDetailComponent/Storage'
import Backup from '../../../client/containers/DatabaseCache/ClusterDetailComponent/Backup'
import { getbackupChain } from '../../../client/actions/backupChain'
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
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
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
    const { database } = this.props
    if (database === "mysql" || database === "redis") {
      // 将后台请求回的资源数据赋值
      const resource = this.props.databaseInfo.resources
      if (Object.keys(resource).length !== 0) {
        const { limits, requests } = resource
        const cpuMax = limits.cpu
        const memoryMax = limits.memory
        const cpuMin = requests.cpu
        const memoryMin = requests.memory
        let resourceConfigs = {
          maxCPUValue:cpuMax.indexOf('m')<0? cpuMax : parseInt(cpuMax)/1000,
          maxMemoryValue:memoryMax.indexOf('Gi')>= 0 ? (parseInt(memoryMax) + 0.024)* 1000 : parseInt(memoryMax),
          minCPUValue:cpuMin.indexOf('m')<0? cpuMin : parseInt(cpuMin)/1000,
          minMemoryValue:memoryMin.indexOf('Gi')>= 0 ? (parseInt(memoryMax) + 0.024)* 1000 : parseInt(memoryMin)
        }

        if(resource.requests.cpu.indexOf('m')<0) {
          let temp = resourceConfigs.maxCPUValue
          resourceConfigs.maxCPUValue = resourceConfigs.minCPUValue
          resourceConfigs.minCPUValue = temp
        }
        // 判断资源类型是自定义类型还是默认类型
        const { maxCPUValue, maxMemoryValue, minCPUValue, minMemoryValue } = resourceConfigs
        const should4X = database === 'mysql'
        if (
          maxCPUValue == 1 &&
          (minCPUValue == 0.2 || minCPUValue == 0.4) &&
          (maxMemoryValue == 512 || maxMemoryValue == 1024) &&
          (minMemoryValue == 512 || minMemoryValue == 1024)
        ) {
          this.setState({
            composeType: should4X? 1024 : 512,
            defaultType: should4X? 1024 : 512
          })
          if(should4X) {
            this.setState({
              resourceConfig: {
                maxCPUValue: 1,
                maxMemoryValue: 1024,
                minCPUValue: 0.5,
                minMemoryValue: 512
              },
              defaultResourceConfig: { //默认的资源配置值
                maxCPUValue: 1,
                maxMemoryValue: 1024,
                minCPUValue: 0.5,
                minMemoryValue: 512
              },
            })
          }
        } else {
          this.setState({
            resourceConfig: resourceConfigs,
            defaultResourceConfig: resourceConfigs
          })
        }
        this.setState({
          resourceConfigValue: resourceConfigs
        })
      }
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
        const notification = new NotificationHandler()
        if (database === 'mysql') {
          const body = {
            root_password: values.passwd
          }
          updateMysqlPwd(cluster, dbName, body, {
            success: {
              func: () => {
                notification.success('操作成功，重启方能生效')
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
                notification.success('操作成功，重启方能生效')
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
          const notification = new NotificationHandler()
          notification.success('操作成功，重启方能生效')
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
                       min={ this.props.database === 'elasticsearch' ? 1 : 3 }
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
          <div className="tips">
            Tips: 修改密码或修改资源配置后，需要重启集群才能生效。
          </div>
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
                {
                  (database === 'redis' || database === 'mysql') &&
                  <Popover content={this.passwordPanel()} visible={this.state.pwdModalShow} title={null} trigger="click">
                    <Button type="primary" style={{ marginLeft:24 }} onClick={() => this.setState({
                      pwdModalShow: true
                    })}>修改密码</Button>
                  </Popover>
                }
              </li>
            </ul>
          </div>}
          {
            (database === 'mysql' || database === 'redis') &&
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
                <ResourceConfig
                  ref="resourceConfig"
                  toggleComposeType={this.selectComposeType}
                  composeType={composeType}
                  onValueChange={this.recordResouceConfigValue}
                  value={this.state.resourceConfig}
                  database={database}
                  freeze={!resourceConfigEdit}/>
              </div>
          }
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
      deleteHint: false,
      svcDomain: [],
      copyStatus: false,
      isInternal: false,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      groupID:'',
      selectValue: '',
      readOnly: false,
      isEditAccessAddress: false,
    }
  }
  componentWillMount() {
    const { getProxy, clusterID, databaseInfo, database } = this.props;
    const annotationLbgroupName = database === 'redis'? 'master.system/lbgroup' : ANNOTATION_LBGROUP_NAME
    const externalId = databaseInfo.service.annotations && databaseInfo.service.annotations[annotationLbgroupName]
    const annotations = databaseInfo.service.annotations;
    this.setReadOnlyCheck(this.props)
    if(!externalId || externalId === 'none') {
      this.setState({
        initValue: 1,
        value: 1,
        initSelectDics: true
      })
    } else {
      this.setState({
        initValue: 2,
        value: 2,
        initGroupID: externalId,
        initSelectDics: false,
      })
    }
    getProxy(clusterID,true,{
      success: {
        func: (res) => {
          this.setState({
            proxyArr:res[camelize(clusterID)].data
          }, () =>{
            const { proxyArr } = this.state
            if (externalId && externalId !== 'none') {
              this.setState({
                deleteHint: proxyArr.findIndex(v => v.id === externalId) < 0 && externalId
              })

            }

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
    this.setReadOnlyCheck(nextProps)
  }
  //设置开启只读地址回显
  setReadOnlyCheck = whichProps => {
    const annotations = whichProps.databaseInfo.service.annotations;
    const visitType = annotations['master.system/lbgroup']

    if(visitType !== 'none') {
      //说明是集群外访问，slave.system/lbgroup 不为none是开启只读
      if (annotations['slave.system/lbgroup'] && annotations['slave.system/lbgroup'] !== 'none') {
        this.setState({
          readOnly: true
        })
      }else {
        this.setState({
          readOnly: false
        })
      }
    }else {
      // 集群内访问，slave.system/lbgroup 为none时说明开启只读，没有该字段说明关闭只读
      if (annotations['slave.system/lbgroup'] && annotations['slave.system/lbgroup'] === 'none') {
        this.setState({
          readOnly: true
        })
      }else {
        this.setState({
          readOnly: false
        })
      }
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
    const { editDatabaseCluster } = this.props.scope.props
    let value = this.state.value
    if(!value) {
      value = this.state.initValue
    }
    const { databaseInfo, database, dbServiceProxyGroupSave, clusterID, form, scope, setServiceProxyGroup } = this.props;
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
            // 'tenxcloud.com/schemaPortname': `${databaseInfo.service.annotations['tenxcloud.com/schemaPortname']}`
          }
        }
        if (database === 'redis') {
          body = {
            annotations: {
              // 'tenxcloud.com/schemaPortname': `${databaseInfo.service.annotations['tenxcloud.com/schemaPortname']}`
              'master.system/lbgroup': `${groupID}`,
              'slave.system/lbgroup': `${groupID}`,
            }
          }
        }
      }else {
        if (database === 'redis') {
          body = {
            annotations: {
              // 'tenxcloud.com/schemaPortname': `${databaseInfo.service.annotations['tenxcloud.com/schemaPortname']}`
              'master.system/lbgroup': `none`,
              'slave.system/lbgroup': `none`,
            }
          }
        }
      }

      const success = {
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
      }
      const failed = {
        func: (res) => {
        notification.close()
        let message = '更改出口方式失败'
        if(res.message) {
          message = res.message
        }
        if(res.message && res.message.message) {
          message = res.message.message
        }
        notification.error(message)
      }}
      const notification = new NotificationHandler()
      notification.spin('保存中更改中')
      if(database === 'mysql') {
        dbServiceProxyGroupSave(clusterID, database, databaseInfo.objectMeta.name, body, { success, failed })
      } else if (database === 'redis') {
        editDatabaseCluster(clusterID, database, databaseInfo.objectMeta.name, body, { success, failed })
      } else {
        setServiceProxyGroup({
          cluster: clusterID,
          service: databaseInfo.service.name,
          groupID
        }, { success, failed })
      }
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
  // 编辑访问地址
  editAccessAddress = () => {
    this.setState({
      isEditAccessAddress: true
    })
  }
  editAccessAddressSave = () => {
    const notification = new NotificationHandler()
    notification.spin('保存中更改中')
    const annotations = this.props.databaseInfo.service.annotations;
    const visitType = annotations['master.system/lbgroup']
    const { editDatabaseCluster } = this.props.scope.props
    const { databaseInfo, database, clusterID } = this.props
    const success = {
      func: () => {
        notification.close()
        notification.success('保存成功')
        const { loadDbClusterDetail } = this.props.scope.props
        setTimeout(() => {
          loadDbClusterDetail(clusterID, databaseInfo.objectMeta.name, database, false);
        }, 0)
        this.setState({
          disabled: true,
          forEdit:false
        });
      },
      isAsync: false
    }
    const failed = {
      func: (res) => {
        notification.close()
        let message = '更改出口方式失败'
        if(res.message) {
          message = res.message
        }
        if(res.message && res.message.message) {
          message = res.message.message
        }
        notification.error(message)
    }}
    const groupID = databaseInfo.objectMeta.annotations['master.system/lbgroup']
    const { readOnly } = this.state
    let body
    if (visitType === 'none') {
      body = {
        annotations: {
          'master.system/lbgroup': `${groupID}`,
          'slave.system/lbgroup': readOnly? 'none' : '',
        }
      }
    }else {
      body = {
        annotations: {
          'master.system/lbgroup': `${groupID}`,
          'slave.system/lbgroup': readOnly? `${groupID}` : 'none',
        }
      }
    }
    editDatabaseCluster(clusterID, database, databaseInfo.objectMeta.name, body, { success, failed })
    this.setState({
      isEditAccessAddress: false
    })
  }
  editAccessAddressCancel = () => {
    this.setState({
      isEditAccessAddress: false
    })
  }
  // 是否开启只读
  readOnlyEnable = () => {
    const { database, databaseInfo } = this.props
    const enableReadOnly = database === 'redis' &&
      databaseInfo.service.annotations['slave.system/lbgroup'] &&
      databaseInfo.service.annotations['slave.system/lbgroup'] === 'none'
    return enableReadOnly
  }
  // 出口地址
  externalUrl = () => {
    const { database, databaseInfo, domainSuffix, bindingIPs } = this.props
    const { proxyArr } = this.state
    let annotationSvcSchemaPortName = database === 'redis'? 'master.tenxcloud.com/schemaPortname' : ANNOTATION_SVC_SCHEMA_PORTNAME

    const systemLbgroup = database === 'redis'? 'master.system/lbgroup' : ANNOTATION_LBGROUP_NAME
    // 当集群外访问的时候，网络出口的id，目的是在公网挑选出当前选择的网络出口的IP
    const externalIpId = databaseInfo.service.annotations && databaseInfo.service.annotations[systemLbgroup]
    if(!externalIpId || externalIpId === 'none') {
      return null
    }
    let domain = ''
    let externalIp = ''
    proxyArr.length!== 0 && proxyArr.every(proxy => {
      if (proxy.id === externalIpId) {
        domain = proxy.domain
        externalIp = proxy.address
        return false
      }
      return true
    })
    // 出口没匹配到，出口被管理员删除了
    if (proxyArr.findIndex(v => v.id === externalIpId) === -1) {
      return null
    }

    let portAnnotation = databaseInfo.service.annotations && databaseInfo.service.annotations[annotationSvcSchemaPortName]
    let readOnlyportAnnotation = databaseInfo.service.annotations && databaseInfo.service.annotations['slave.tenxcloud.com/schemaPortname']
    // 普通的出口端口
    let externalPort = portAnnotation && portAnnotation.split('/')
    if (externalPort && externalPort.length > 1) {
      externalPort = externalPort[2]
    }
    // redis开启只读时的出口端口
    let readOnlyExternalPort = readOnlyportAnnotation && readOnlyportAnnotation.split('/')[2]
    let readOnlyExternalUrl
    if(readOnlyExternalPort) {
      readOnlyExternalUrl = externalIp + ':' + readOnlyExternalPort
    }
    let externalUrl
    if (externalPort != '') {
      if (domain) {
        externalUrl = databaseInfo.service && databaseInfo.service.name + '-'
          + databaseInfo.service && databaseInfo.service.namespace + '.' + domain + ':' + (externalPort || '未知')
      } else {
        externalUrl = externalIp + ':' + (externalPort || '未知')
      }
    }
    return {externalUrl,readOnlyExternalUrl}
  }
  // 集群内实例访问地址
  inClusterUrl = () => {
    const { databaseInfo } = this.props
    const { copyStatus } = this.state
    const clusterAdd = [];
    let port = databaseInfo.service.port.port;
    let serviceName = databaseInfo.objectMeta.name;
    const pods = databaseInfo.pods
    if(pods) {
      for (const v of pods) {
        const url = `${v.name}.${serviceName}:${port}`
        clusterAdd.push(url)
      }
    }
    const domainList = clusterAdd && clusterAdd.map(item=>{
      return (
        <div className="addrList" key={item}>
          <span className="domain">{item}</span>
          <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
            <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,item)} onClick={this.copyTest.bind(this)}/>
          </Tooltip>
        </div>
      )
    })
    return domainList
  }
  // 集群内负载均衡地址
  loadBalancing = () => {
    const { databaseInfo, database } = this.props
    const port = databaseInfo.service.port.port;
    const annotationSvcSchemaPortName = database === 'redis'? 'master.tenxcloud.com/schemaPortname' : ANNOTATION_SVC_SCHEMA_PORTNAME
    const name = databaseInfo.service.annotations && databaseInfo.service.annotations[annotationSvcSchemaPortName]
    const nameReadonly = databaseInfo.service.annotations && databaseInfo.service.annotations['slave.tenxcloud.com/schemaPortname']
    const serviceName = name && name.split('/')[0];
    const serviceNameReadOnly = nameReadonly && nameReadonly.split('/')[0];
    const url = `${serviceName}:${port}`
    const readOnlyUrl = `${serviceNameReadOnly}:${port}`
    return {url, readOnlyUrl}
  }
  render() {
    const { databaseInfo, form, database } = this.props
    const { value, disabled, forEdit, selectDis, deleteHint, copyStatus, proxyArr, initValue, initGroupID, initSelectDics,isEditAccessAddress } = this.state;
    const lbinfo = databaseInfo.service.annotations ? databaseInfo.service.annotations[ANNOTATION_LBGROUP_NAME] : 'none'
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
    const proxyNode = proxyArr.length > 0 ? proxyArr.map((item)=>{
      return (
          <Option key={item.id} value={item.id}>{item.type == 'public' ? '公网：' : '内网：'}{item.name}</Option>
      )
    }):null

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
                  this.externalUrl()
                  ? (
                    <div>
                      <div>
                        <span className="domain">{this.externalUrl().externalUrl}</span>
                        <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                          <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,this.externalUrl().externalUrl)} onClick={this.copyTest.bind(this)}/>
                        </Tooltip>
                      </div>
                      {
                        this.readOnlyEnable() &&
                        <div>
                          <span className="domain">{this.externalUrl().readOnlyExternalUrl} (只读)</span>
                          <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                            <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,this.externalUrl().readOnlyExternalUrl)} onClick={this.copyTest.bind(this)}/>
                          </Tooltip>
                        </div>
                      }
                    </div>
                  )
                  : '-'
                }
              </div>
            )
          }
          if (key === 'inClusterUrls') {
            return this.inClusterUrl()
          }
          return (
            <div>
              <div>
                <span className="domain">{this.loadBalancing().url}</span>
                <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                  <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,this.loadBalancing().url)} onClick={this.copyTest.bind(this)}/>
                </Tooltip>
              </div>
              {
                this.readOnlyEnable() &&
                <div>
                  <span className="domain">{this.loadBalancing().readOnlyUrl} (只读)</span>
                  <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,this.loadBalancing().readOnlyUrl)} onClick={this.copyTest.bind(this)}/>
                  </Tooltip>
                </div>
              }
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
                  radioValue === 1 ? '选择后该数据库与缓存集群仅提供集群内访问': '数据库与缓存可提供集群外访问，选择一个网络出口'
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
              {
                this.state.deleteHint &&
                <div className={classNames("inlineBlock deleteHint")}>
                  <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
                  已选网络出口已被管理员删除，请选择其他网络出口或访问方式
                </div>
              }
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox configContent">
          <div className="visitTypeTitle configHead">访问地址</div>
          {
            database === 'redis' &&
            <div className="redisEdit">
              {
                isEditAccessAddress?
                  [
                    <Button type="default" style={{marginRight: 10}} onClick={this.editAccessAddressCancel}>取消</Button>,
                    <Button type="primary" onClick={this.editAccessAddressSave}>保存</Button>
                  ]
                  :
                  <Button type="primary" onClick={this.editAccessAddress}>编辑</Button>
              }

              <div className="readOnlySwitch">
                <Checkbox checked={this.state.readOnly} disabled={!isEditAccessAddress} onChange={e => {
                  this.setState({readOnly: e.target.checked})
                }}>
                  开启只读地址
                </Checkbox>
              </div>
              <div className="readOnlyTip">开启只读地址后，使用只读地址执行读请求，可将所有的读请求分摊到所有备节点</div>
            </div>
          }
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
    const { databaseInfo, database } = this.props
    let storagePrc = parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice[database === 'mysql'? '4x':'2x'] * parentScope.props.resourcePrice.dbRatio
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
      accessMethodData: null,
      rebootClusterModal: false,
      rebootLoading: false,
      checkingBackupStatus: false,
      backupPending: false,
      backupChecking: false,
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
    const { loadDbClusterDetail, cluster, dbName, database } = this.props
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
  getBackupList = () => {
    const { cluster, dbName, database, getbackupChain } = this.props
    this.setState({
      checkingBackupStatus: true,
    })
    if (database === 'redis' || database === 'mysql') {
      getbackupChain(cluster, database, dbName, {
        success: {
          func: res => {
            this.setState({
              checkingBackupStatus: false,
            })
            let chains = []
            res.data.items.forEach(v => {chains = chains.concat(v.chains)})
            chains.forEach(v => {
              if (v.status === 'Scheduled' ||  v.status === 'Started' || v.status === '202') {
                this.setState({
                  backupPending: true
                })
                return
              }
            } )
          },
        },
      })
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
    if(database === 'mysql' || database === 'redis') {
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
    } else {
      putDbClusterDetail(cluster, dbName, this.state.replicas, {
        success: {
          func: (res) => {
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
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            parentScope.setState({ detailModal: false })
            _this.setState({putModaling: false})
            notification.error('更新失败', res.message.message)
          }
        }
      })
    }

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
       return (<span className='stopping'><i className="fa fa-circle"></i> 停止中 </span>)
    }
    if (status === 'Stopped') {
       return (<span className='stop'><i className="fa fa-circle"></i> 已停止 </span>)
    }
  }
  stopAlert = () => {
    this.getBackupList()
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
        return <div onClick={this.stopAlert}>
          <span className="stopIcon"></span>停止
        </div>
      case 'Running':
        return <div onClick={this.stopAlert}>
          <span className="stopIcon"></span>停止
        </div>
      case 'Stopped':
        return <div  onClick={this.startAlert}>启动</div>
      case 'Stopping':
        return <div  onClick={this.startAlert}>启动</div>
    }
  }
  reboot = () => {
    const confirm = () => {
      const { database, loadDbClusterDetail, dbName, cluster, rebootCluster } = this.props
      this.setState({
        rebootLoading: true
      })
      rebootCluster(cluster, dbName, database, {
        success: {
          func: () => {
            this.setState({
              rebootClusterModal: false,
              rebootLoading: false
            })
            setTimeout(() => {
              loadDbClusterDetail(cluster, dbName, database, true);
            })
          }
        },
        failed: {
          func: () => {
            const notification = new NotificationHandler()
            notification.error('重启失败')
            this.setState({
              rebootClusterModal: false,
              rebootLoading: false
            })
          }
        }
      })
    }
    return <Modal
      title="重启集群"
      onOk={confirm}
      confirmLoading={this.state.checkingBackupStatus || this.state.rebootLoading}
      onCancel={() => {
        this.setState({
          rebootClusterModal: false,
          rebootLoading: false,
          checkingBackupStatus: false
        })
      }}
      visible={this.state.rebootClusterModal}
    >
      <div className="appServiceDetailRebootAlert">
        <div>
          <Icon type="question-circle-o" className="question" />
          确认重启集群吗？
        </div>
        {this.state.backupPending &&
          <div className="attention">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            集群存在正在备份状态备份点，重启集群可能导致备份失败，为保证备份数据完整性建议备份完成后再重启集群
          </div>
        }

      </div>
    </Modal>
  }
  editConfigOk = () => {
    const { database, loadDbClusterDetail, dbName, cluster } = this.props
    loadDbClusterDetail(cluster, dbName, database, true);

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
    const needReboot = databaseInfo.objectMeta.annotations['system/daasReboot']
    const operationMenu = () => <Menu>
      <MenuItem key="del" disabled={this.state.deleteBtn}>
        <div onClick={()=> this.setState({delModal: true})}>删除集群</div>
      </MenuItem>
      <MenuItem key="stop" >
        {
          this.clusterBtn(databaseInfo.status)
        }
      </MenuItem>
    </Menu>
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
              <div className="dbDesc">{databaseInfo.objectMeta.namespace} / {databaseInfo.objectMeta.name}</div>
              <div>集群模式：{databaseInfo.multiMaster === true? '多主': '一主多从' }</div>
              <div> 状态：
                {this.dbStatus(databaseInfo.status)}
              </div>
            </div>
            <div className='rightBox'>
              {
                database === 'mysql' || database === 'redis' ?
                  <div className='li'>
                    {
                      needReboot === 'enable' && databaseInfo.status !== 'Stopped'?
                        <Tooltip title="集群配置已更改，重启后生效">
                          <Button style={{marginRight:'16px'}} className="shinning" onClick={() => {
                            this.getBackupList()
                            this.setState({rebootClusterModal: true})}}>
                            重启
                          </Button>
                        </Tooltip>
                        :
                        <Button style={{marginRight:'16px'}} disabled={databaseInfo.status === 'Stopped'} onClick={() => {
                          this.getBackupList()
                          this.setState({rebootClusterModal: true})}}>
                          重启
                        </Button>
                    }
                    {this.reboot()}
                    <Button style={{marginRight:'16px'}} onClick={()=> this.refurbishDetail()}>
                      <i className="fa fa-refresh"></i>&nbsp;
                      刷新
                    </Button>

                    {/*操作按钮*/}
                    <DropdownButton overlay={operationMenu()}>
                      其他操作
                    </DropdownButton>

                  </div>
                  :
                  <div className='li'>
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
              }
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作" visible={this.state.delModal}
          onOk={()=> this.deleteDatebaseCluster(dbName)} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            您是否确定要删除数据库 { dbName }?
          </div>
        </Modal>
        <div className='bottomBox'>
          <div className='siderBox'>
            {
              (database === 'mysql' || database === 'redis') ?
                <Tabs
                  tabPosition='left'
                  onTabClick={(e)=> this.onTabClick(e)}
                  activeKey={this.state.activeTabKey}
                >
                  <TabPane tab='基础信息' key='#BaseInfo'>
                    {
                      this.state.activeTabKey === '#BaseInfo' && <FormBaseInfo
                        domainSuffix={domainSuffix} bindingIPs={bindingIPs}
                        currentData={this.props.currentData}
                        databaseInfo={databaseInfo}
                        storageValue={this.state.storageValue}
                        database={this.props.database}
                        dbName={dbName}
                        scope= {this}
                      />
                    }
                  </TabPane>
                  <TabPane tab='存储' key='#Storage'>
                    <Storage databaseInfo={databaseInfo} database={this.props.database}/>
                  </TabPane>
                  <TabPane tab='备份' key='#Backup'>
                    <Backup database={database} scope= {this} databaseInfo={databaseInfo}/>
                  </TabPane>
                  <TabPane tab='配置管理' key='#ConfigManage'>
                    <ConfigManagement database={database} databaseInfo={databaseInfo} onEditConfigOk={this.editConfigOk}/>
                  </TabPane>
                  { billingEnabled ?
                    [<TabPane tab='访问方式' key='#VisitType'>
                      <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                                  databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                    </TabPane>,
                      <TabPane tab='事件' key='#events'>
                        {
                          database !== "mysql" && database !== "redis" ?
                            <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                            :
                            <DatabaseEvent database={database} databaseInfo={databaseInfo} cluster={this.props.cluster}/>
                        }
                      </TabPane>,
                      <TabPane tab='租赁信息' key='#leading'>
                        <LeasingInfo databaseInfo={databaseInfo} database={database} scope= {this} />
                      </TabPane>]
                    :
                    [<TabPane tab='访问方式' key='#VisitType'>
                      <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                                  databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                    </TabPane>,
                      <TabPane tab='事件' key='#events'>
                        {
                          database !== "mysql"?
                            <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                            :
                            <DatabaseEvent database={database} databaseInfo={databaseInfo} cluster={this.props.cluster}/>
                        }
                      </TabPane>]
                  }
                </Tabs>
                :
                <Tabs
                  tabPosition='left'
                  onTabClick={(e)=> this.onTabClick(e)}
                  activeKey={this.state.activeTabKey}
                >
                  <TabPane tab='基础信息' key='#BaseInfo'>
                    {
                      this.state.activeTabKey === '#BaseInfo' && <FormBaseInfo
                        domainSuffix={domainSuffix} bindingIPs={bindingIPs}
                        currentData={this.props.currentData}
                        databaseInfo={databaseInfo}
                        storageValue={this.state.storageValue}
                        database={this.props.database}
                        dbName={dbName}
                        scope= {this}
                      />
                    }
                  </TabPane>
                  { billingEnabled ?
                    [<TabPane tab='访问方式' key='#VisitType'>
                      <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                                  databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                    </TabPane>,
                      <TabPane tab='事件' key='#events'>
                        {
                          database !== "mysql"?
                            <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                            :
                            <DatabaseEvent database={database} databaseInfo={databaseInfo} cluster={this.props.cluster}/>
                        }
                      </TabPane>,
                      <TabPane tab='租赁信息' key='#leading'>
                        <LeasingInfo databaseInfo={databaseInfo} database={database} scope= {this} />
                      </TabPane>]
                    :
                    [<TabPane tab='访问方式' key='#VisitType'>
                      <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                                  databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
                    </TabPane>,
                      <TabPane tab='事件' key='#events'>
                        {
                          database !== "mysql"?
                            <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                            :
                            <DatabaseEvent database={database} databaseInfo={databaseInfo} cluster={this.props.cluster}/>
                        }
                      </TabPane>]
                  }
                </Tabs>

            }
          </div>
        </div>
        <Modal
          visible={this.state.stopAlertModal}
          title="停止数据库与缓存集群"
          onCancel={() => this.setState({
            stopAlertModal: false,
            checkingBackupStatus: false,
          })}
          onOk={this.stopTheCluster}
          confirmLoading={this.state.checkingBackupStatus}
        >
          <div className="alertContent">
            <Icon type="question-circle-o" />{`是否确定停止${databaseInfo.objectMeta.name}集群？`}
            {this.state.backupPending &&
            <div className="attention">
              <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              集群存在正在备份状态备份点，停止集群可能导致备份失败，为保证备份数据完整性建议备份完成后再停止集群
            </div>
            }

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
  rebootCluster,
  getbackupChain,
})(ModalDetail)
