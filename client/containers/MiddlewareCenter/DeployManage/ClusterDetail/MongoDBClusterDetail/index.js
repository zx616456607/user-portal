/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 *  RabbitMQ Cluster detail
 *
 * v3.2 - 2018-12-14
 * @author zhouhaitao
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory, Link } from 'react-router'
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
  Dropdown,
  Menu,
  Timeline,
  InputNumber,
  Tabs,
  Tooltip,
  Radio,
  Select,
  Popover,
  Input,
  Form } from 'antd'
import * as databaseActions from '../../../../../../src/actions/database_cache'
import * as servicesAction from '../../../../../../src/actions/services'
import * as clusterActions from '../../../../../../src/actions/cluster'
import './style/ModalDetail.less'
import AppServiceEvent from '../../../../../../src/components/AppModule/AppServiceDetail/AppServiceEvent'
import DatabaseEvent from '../../../../DatabaseCache/ClusterDetailComponent/DatabaseEvent'
import Storage from '../../../../DatabaseCache/ClusterDetailComponent/Storage'
import ConfigManagement from '../../../../DatabaseCache/ClusterDetailComponent/ConfigManagement'
import ResourceConfig from '../../../../../components/ResourceConfig/index'
import { calcuDate, parseAmount } from '../../../../../../src/common/tools.js'
import NotificationHandler from '../../../../../../src/common/notification_handler'
import mongodbImg from '../../../../../assets/img/MiddlewareCenter/mongoDB.jpg'
import Log from './Log'
import { ANNOTATION_LBGROUP_NAME, ANNOTATION_SVC_SCHEMA_PORTNAME } from '../../../../../../constants';

const Option = Select.Option;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
const FormItem = Form.Item;

class VolumeDetail extends Component {
  render() {
    const { volumes } = this.props
    // const containers = this.props.volumes.podSpec.containers[0]
    if (!volumes) {
      return (
        <div></div>
      )
    }

    return (
      <Row className="file-list">
        <Timeline>
          <Timeline.Item key={volumes.claimName}>
            <Row className="file-item">
              <div className="line"></div>
              <table>
                <tbody>
                  <tr>
                    <td style={{ padding: '15px' }}>
                      <div style={{ width: this.props.selfScope.state.winWidth }} className="textoverflow"><Icon type="file-text" style={{ marginRight: '10px' }} />{volumes.claimName}</div>
                    </td>

                    <td style={{ width: '130px', textAlign: 'center' }}>
                      <div className="li">关联容器</div>
                      <div className="lis">挂载路径</div>
                    </td>
                    <td>
                      <div className="li"><Link to={'/app_manage/container/' + volumes.name}>{volumes.name}</Link></div>
                      <div className="lis">{volumes.mountPath}</div>
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

class VolumeHeader extends Component {
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
          <Link to={'/app_manage/container/' + data.name}>{data.name}</Link>
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

class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      passShow: false,
      storageValue: this.props.database.spec ?
        parseInt(this.props.database.spec.volumeClaimTemplate.spec.resources.requests.storage) : 0,
      resourceConfigEdit: false,
      resourceConfigValue: '',
      composeType: 'DIY',
      defaultType: 'DIY', // 默认的资源配置类型
      defaultResourceConfig: { // 默认的资源配置值
        maxCPUValue: 0.5,
        maxMemoryValue: 100,
        minCPUValue: 0.5,
        minMemoryValue: 100,
      },
      changePasswordModal: false,
      // 绑定到 ResourceConfig组件上的资源配置值
      resourceConfig: {
        maxCPUValue: 0.5,
        maxMemoryValue: 100,
        minCPUValue: 0.5,
        minMemoryValue: 100,
      },
      pwdModalShow: false,
      replicasModal: false,
    }
  }
  componentDidMount() {
    const { database } = this.props
    if (database === 'mysql' || database === 'redis') {
      // 将后台请求回的资源数据赋值
      const resource = this.props.databaseInfo.resources
      const should4X = database === 'mysql'
      if (Object.keys(resource).length !== 0) {
        const { limits, requests } = resource
        const cpuMax = limits.cpu
        const memoryMax = limits.memory
        const cpuMin = requests.cpu
        const memoryMin = requests.memory
        const resourceConfigs = {
          maxCPUValue: cpuMax.indexOf('m') < 0 ? cpuMax : parseInt(cpuMax) / 1000,
          maxMemoryValue: memoryMax.indexOf('Gi') >= 0 ? (parseInt(memoryMax) + 0.024) * 1000 : parseInt(memoryMax),
          minCPUValue: cpuMin.indexOf('m') < 0 ? cpuMin : parseInt(cpuMin) / 1000,
          minMemoryValue: memoryMin.indexOf('Gi') >= 0 ? (parseInt(memoryMax) + 0.024) * 1000 : parseInt(memoryMin),
        }

        if (resource.requests.cpu.indexOf('m') < 0) {
          const temp = resourceConfigs.maxCPUValue
          resourceConfigs.maxCPUValue = resourceConfigs.minCPUValue
          resourceConfigs.minCPUValue = temp
        }
        // 判断资源类型是自定义类型还是默认类型
        const { maxCPUValue, maxMemoryValue, minCPUValue, minMemoryValue } = resourceConfigs
        if (
          `${maxCPUValue}` === '1' &&
          (`${minCPUValue}` === '0.4') &&
          (`${maxMemoryValue}` === '1024') &&
          (`${minMemoryValue}` === '1024')
        ) {
          this.setState({
            composeType: 1024,
            defaultType: 1024,
          })
          if (should4X) {
            this.setState({
              resourceConfig: {
                maxCPUValue: 1,
                maxMemoryValue: 1024,
                minCPUValue: 0.4,
                minMemoryValue: 512,
              },
              defaultResourceConfig: { // 默认的资源配置值
                maxCPUValue: 1,
                maxMemoryValue: 1024,
                minCPUValue: 0.4,
                minMemoryValue: 512,
              },
            })
          }
        } else {
          this.setState({
            resourceConfig: resourceConfigs,
            defaultResourceConfig: resourceConfigs,
          })
        }
        this.setState({
          resourceConfigValue: resourceConfigs,
        })
      } else {
        this.setState({
          composeType: 512,
          defaultType: 512,
          resourceConfig: {
            maxCPUValue: 1,
            maxMemoryValue: 1024,
            minCPUValue: 0.4,
            minMemoryValue: 512,
          },
          defaultResourceConfig: { // 默认的资源配置值
            maxCPUValue: 1,
            maxMemoryValue: 1024,
            minCPUValue: 0.4,
            minMemoryValue: 512,
          },
        })
      }
    }
    const winWidth = document.body.clientWidth
    if (winWidth > 1440) {
      this.setState({ winWidth: '220px' })
      return
    }
    this.setState({
      winWidth: '120px',
    })
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function() {
      scope.setState({
        copySuccess: false,
      });
    }, 500);
  }
  // 修改密码弹出层
  passwordPanel = () => {
    const { getFieldProps } = this.props.form
    const { database } = this.props
    const checkPass = (rule, value, callback) => {
      const { validateFields } = this.props.form;
      if (value) {
        validateFields([ 'rePasswd' ], { force: true });
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
        {
          validator: (rule, value, callback) => {
            if (database === 'mysql' && value.indexOf('@') >= 0) {
              return callback('密码不能包含@')
            }
            return callback()
          },
        },
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
        if (errors) {
          return;
        }
        const { dbName, database } = this.props
        const { cluster,
          updateMysqlPwd,
          loadDbClusterDetail } = this.props.scope.props
        // mysql 和 redis修改密码是两种方式
        const notification = new NotificationHandler()
        const body = {
          root_password: values.passwd,
        }
        updateMysqlPwd(cluster, dbName, body, 'mysql', {
          success: {
            func: () => {
              notification.success('操作成功，重启方能生效')
              setTimeout(() => {
                loadDbClusterDetail(cluster, dbName, database, true);
              })
              this.setState({
                pwdModalShow: false,
              })
            },
          },
        })
      });
    }
    return <Form className="pwdChangeWrapper">
      <FormItem >
        <Input {...passwdProps} type="password" placeholder="新密码" style={{ width: 205 }}/>
      </FormItem>
      <FormItem >
        <Input {...rePasswdProps} type="password" placeholder="两次密码输入保持一致" style={{ width: 205 }}/>
      </FormItem>
      <div className="pwd-btn-group">
        <Button onClick={() => this.setState({
          pwdModalShow: false,
        })
        }>取消</Button>
        <Button type="primary" onClick={confirm}>确定</Button>
      </div>
    </Form>

  }
  // 修改资源配置的时候将值记录下来
  recordResouceConfigValue = values => {
    // getResourceByMemory
    this.setState({
      resourceConfigValue: values,
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
          cpu: `${resourceConfigValue.maxCPUValue * 1000}m`,
          memory: `${resourceConfigValue.maxMemoryValue}Mi`,
        },
        requests: {
          cpu: `${resourceConfigValue.minCPUValue * 1000}m`,
          memory: `${resourceConfigValue.minMemoryValue}Mi`,
        },
      },
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
            resourceConfigEdit: false,
          })
        },
      },
    })
  }
  // 取消资源配置修改
  cancelEditResourceConfig = () => {
    this.refs.resourceConfig.resetFields() // 取消重置自定义中的所有值
    this.setState({
      resourceConfigEdit: false,
      composeType: this.state.defaultType,
      resourceConfig: Object.assign({}, this.state.defaultResourceConfig),
    })
  }
  editReplicas = () => {
    this.setState({
      replicasModal: true,
    })
  }
  saveReplicasModal = () => {
    const { editDatabaseCluster,
      putDbClusterDetail,
      loadDbClusterDetail,
      cluster,
      database,
      dbName,
      scope } = this.props
    const body = { replicas: this.state.replicasNum }
    const notification = new NotificationHandler()
    if (database === 'elasticsearch' || database === 'zookeeper') {
      putDbClusterDetail(cluster, dbName, this.state.replicasNum, {
        success: {
          func: () => {
            notification.success('更新成功')
            this.setState({
              replicasModal: false,
            })
            setTimeout(() => {
              loadDbClusterDetail(cluster, dbName, database, {
                success: {
                  func: res => {
                    scope.setState({
                      replicas: res.database.replicas,
                      storageValue: parseInt(res.database.storage),
                    })
                  },
                },
              });
            })
          },
        },
      })
    } else {
      editDatabaseCluster(cluster, database, dbName, body, {
        success: {
          func: () => {
            notification.success('更新成功')
            this.setState({
              replicasModal: false,
            })
            setTimeout(() => {
              loadDbClusterDetail(cluster, dbName, database, {
                success: {
                  func: res => {
                    scope.setState({
                      replicas: res.database.replicas,
                      storageValue: parseInt(res.database.storage),
                    })
                  },
                },
              });
            })
          },
        },
      })
    }
  }
  render() {
    const { databaseInfo, dbName, database } = this.props
    const { resourceConfigEdit, composeType, replicasModal } = this.state
    const parentScope = this.props.scope
    const { billingEnabled } = parentScope.props
    let storagePrc = parentScope.props.resourcePrice &&
      parentScope.props.resourcePrice.storage *
      parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice &&
      parentScope.props.resourcePrice['2x'] *
      parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue / 1024 * storagePrc *
      parentScope.state.replicas + parentScope.state.replicas * containerPrc), 4)
    const countPrice = parseAmount((parentScope.state.storageValue / 1024 * storagePrc *
      parentScope.state.replicas + parentScope.state.replicas * containerPrc) * 24 * 30, 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)
    const modalContent = (
      <div className="old-cluster-detail-modal-content">
        <div className="modal-li padTop"><span className="spanLeft">服务名称</span><span>{dbName}</span></div>
        <div className="modal-li">
          <span className="spanLeft">实例副本</span>
          <InputNumber onChange={e => this.setState({ replicasNum: e })}
            defaultValue={parentScope.state.replicas}
            min={3}
          /> &nbsp; 个
        </div>
        <div className="modal-li">
          <span className="spanLeft">存储大小</span>·
          <InputNumber
            min={512}
            step={512}
            max={20480}
            disabled={true}
            value={databaseInfo.storage} /> &nbsp;
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
                <span className="unit">{countPrice.unit === '￥' ? ' ￥' : ''}</span>
                <span className="unit blod">{ hourPrice.amount }{containerPrc.unit === '￥' ? '' : ' T'}/小时</span>
              </p>
              <p>
                <span className="unit">（约：{ countPrice.fullAmount } /月）</span>
              </p>
            </div>
          </div>
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
    const tips = database === 'zookeeper' ? 'Tips: 修改密码后，需要重启集群才能生效。' : 'Tips: 修改密码或资源配置后，需要重启集群才能生效。'
    return (
      <div className="modalDetailBox" id="dbClusterDetailInfo">
        <div className="configContent">
          {
            database === 'elasticsearch' ?
              null
              :
              <div className="tips">
                {tips}
              </div>
          }
          {database === 'elasticsearch' || database === 'etcd' ? null :
            <div><div className="configHead">参数</div>
              <ul className="parse-list">
                <li><span className="key">用户名：</span> <span className="value">{ database === 'zookeeper' ? 'super' : 'root' }</span></li>
                <li>
                  <span className="key">密码：</span>
                  {
                    this.state.passShow ?
                      <span>
                        <span className="value">{ databaseInfo.password }</span>
                        <span className="pasBtn" onClick={() => this.setState({ passShow: false })}>
                          <i className="fa fa-eye-slash"></i> 隐藏
                        </span>
                      </span>
                      :
                      <span>
                        <span className="value">******</span>
                        <span className="pasBtn" onClick={() => this.setState({ passShow: true })}>
                          <i className="fa fa-eye"></i>显示
                        </span>
                      </span>
                  }

                  <Popover content={this.passwordPanel()} visible={this.state.pwdModalShow} title={null} trigger="click">
                    <Button type="primary" style={{ marginLeft: 24 }} onClick={() => this.setState({
                      pwdModalShow: true,
                    })}>修改密码</Button>
                  </Popover>
                </li>
              </ul>
            </div>}
          <div className="resourceConfigPart">
            <div className="themeHeader"><i className="themeBorder"/>资源配置
              {
                resourceConfigEdit ?
                  <div className="resource-config-btn">
                    <Button size="large" onClick={() => this.cancelEditResourceConfig()}>取消</Button>
                    <Button type="primary" size="large" onClick={this.saveResourceConfig}>确定</Button>
                  </div>
                  :
                  <Button type="primary" className="resource-config-btn" size="large" onClick={() => this.setState({ resourceConfigEdit: true })} style={{ marginLeft: 30 }}>编辑</Button>
              }
            </div>

            <ResourceConfig
              ref="resourceConfig"
              toggleComposeType={this.selectComposeType}
              composeType={composeType}
              onValueChange={this.recordResouceConfigValue}
              value={this.state.resourceConfig}
              should4X={database === 'mysql'}
              freeze={!resourceConfigEdit}/>
          </div>
          <div className="themeHeader"><i className="themeBorder"/>实例副本 <span>{databaseInfo.replicas}个 &nbsp;</span>
            <Button type="primary" size="large" onClick={() => this.editReplicas()}>更改实例数</Button>
          </div>
          <Collapse accordion>
            {volumeMount}
          </Collapse>
        </div>
        <Modal
          visible={replicasModal}
          title="更改实例数"
          onOk={() => this.saveReplicasModal()}
          onCancel={() => {
            this.setState({ replicasModal: false })
          }}
        >
          <div>
            { modalContent }
          </div>
        </Modal>

      </div>
    )
  }
}

let FormBaseInfo = Form.create()(BaseInfo)
FormBaseInfo = connect(() => {}, {
  editDatabaseCluster: databaseActions.editDatabaseCluster,
  loadDbClusterDetail: databaseActions.loadDbClusterDetail,
  putDbClusterDetail: databaseActions.putDbClusterDetail,
})(FormBaseInfo)


class VisitTypesComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      disabled: true,
      forEdit: false,
      selectDis: undefined,
      deleteHint: false,
      svcDomain: [],
      copyStatus: false,
      isInternal: false,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      groupID: '',
      selectValue: '',
      readOnly: false,
    }
  }
  componentDidMount() {
    const { getProxy, clusterID, databaseInfo } = this.props;
    const annotationLbgroupName = 'mongodbreplica.system/lbgroup'
    const externalId = databaseInfo.objectMeta.annotations &&
      databaseInfo.objectMeta.annotations[annotationLbgroupName]
    if (!externalId || externalId === 'none') {
      this.setState({
        initValue: 1,
        value: 1,
        initSelectDics: true,
      })
    } else {
      this.setState({
        initValue: 2,
        value: 2,
        initGroupID: externalId,
        initSelectDics: false,
      })
    }
    getProxy(clusterID, true, {
      success: {
        func: res => {
          this.setState({
            proxyArr: res[camelize(clusterID)].data,
          }, () => {
            const { proxyArr } = this.state
            if (externalId && externalId !== 'none') {
              this.setState({
                deleteHint: proxyArr.findIndex(v => v.id === externalId) < 0 && externalId,
              })

            }

          })
        },
        isAsync: true,
      },
    })
  }
  onChange(e) {
    const value = e.target.value;
    this.setState({
      value,
      selectDis: false,
      selectValue: null,
    });
    if (value === 1) {
      this.setState({
        selectDis: true,
      })
    }
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit: true,
    });
  }
  saveEdit() {
    const { loadDbClusterDetail } = this.props.scope.props
    let value = this.state.value
    if (!value) {
      value = this.state.initValue
    }
    const {
      databaseInfo,
      database,
      dbServiceProxyGroupSave,
      clusterID,
      form,
    } = this.props;
    form.validateFields(err => {
      if (err) {
        return
      }
      let groupID = 'none'
      let body = {
        annotations: {
          'mongodbreplica.system/lbgroup': groupID,
        },
      }

      if (value === 2) {
        groupID = form.getFieldValue('groupID')
        body = {
          annotations: {
            'mongodbreplica.system/lbgroup': groupID,
            // 'system/schemaPortname': `${databaseInfo.service.annotations['system/schemaPortname']}`
          },
        }
        if (database === 'redis') {
          body = {
            annotations: {
              // 'system/schemaPortname': `${databaseInfo.service.annotations['system/schemaPortname']}`
              'master.system/lbgroup': `${groupID}`,
              'slave.system/lbgroup': `${groupID}`,
            },
          }
        }
      }
      const notification = new NotificationHandler()
      const success = {
        func: () => {
          notification.close()
          notification.success('出口方式更改成功')
          setTimeout(() => {
            loadDbClusterDetail(clusterID, databaseInfo.objectMeta.name, database, false);
          }, 0)
          this.setState({
            disabled: true,
            forEdit: false,
          });
          if (value === 1) {
            this.setState({
              initValue: 1,
              initSelectDics: true,
              addrHide: true,
              isinternal: false,
              addrhide: false,
              value: undefined,
              selectDics: undefined,
            })
          } else {
            this.setState({
              initValue: 2,
              initGroupID: groupID,
              initSelectDics: false,
              addrHide: false,
              selectDics: undefined,
              value: undefined,
              isinternal: true,
            })
            form.setFieldsValue({
              groupID,
            })
          }
        },
        isAsync: false,
      }
      const failed = {
        func: res => {
          notification.close()
          let message = '更改出口方式失败'
          if (res.message) {
            message = res.message
          }
          if (res.message && res.message.message) {
            message = res.message.message
          }
          notification.error(message)
        } }
      notification.spin('保存中更改中')
      dbServiceProxyGroupSave(clusterID,
        database,
        databaseInfo.objectMeta.name,
        body, { success, failed })
    })
  }
  cancelEdit() {
    this.setState({
      disabled: true,
      forEdit: false,
      value: this.state.initValue,
      selectDis: this.state.initSelectDis,
    });
    const { form } = this.props
    form.setFieldsValue({
      groupID: this.state.initGroupID,
    })
  }
  handleChange(value) {
    this.setState({
      groupID: value,
      selectValue: value,
    })
  }
  copyTest() {
    const target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand('Copy', false);
    this.setState({
      copyStatus: true,
    })
  }
  startCopyCode(domain) {
    const target = document.getElementsByClassName('copyTest')[0];
    target.value = domain;
  }
  returnDefaultTooltip() {
    this.setState({
      copyStatus: false,
    })
  }

  // 出口地址
  externalUrl = () => {
    const { database, databaseInfo } = this.props
    const { proxyArr } = this.state
    const annotationSvcSchemaPortName = database === 'redis' ? 'master.system/schemaPortname' : ANNOTATION_SVC_SCHEMA_PORTNAME

    const systemLbgroup = database === 'redis' ? 'master.system/lbgroup' : ANNOTATION_LBGROUP_NAME
    // 当集群外访问的时候，网络出口的id，目的是在公网挑选出当前选择的网络出口的IP
    const externalIpId = databaseInfo.service.annotations &&
      databaseInfo.service.annotations[systemLbgroup]
    if (!externalIpId || externalIpId === 'none') {
      return null
    }
    let domain = ''
    let externalIp = ''
    proxyArr.length !== 0 && proxyArr.every(proxy => {
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

    const portAnnotation = databaseInfo.service.annotations &&
      databaseInfo.service.annotations[annotationSvcSchemaPortName]
    const readOnlyportAnnotation = databaseInfo.service.annotations &&
      databaseInfo.service.annotations['slave.system/schemaPortname']
    // 普通的出口端口
    let externalPort = portAnnotation && portAnnotation.split('/')
    if (externalPort && externalPort.length > 1) {
      externalPort = externalPort[2]
    }
    // redis开启只读时的出口端口
    const readOnlyExternalPort = readOnlyportAnnotation && readOnlyportAnnotation.split('/')[2]
    let readOnlyExternalUrl
    if (readOnlyExternalPort) {
      readOnlyExternalUrl = externalIp + ':' + readOnlyExternalPort
    }
    let externalUrl
    if (externalPort !== '') {
      if (domain) {
        externalUrl = databaseInfo.service && databaseInfo.objectMeta.namespace + '-'
          + databaseInfo.service && databaseInfo.objectMeta.namespace + '.' + domain + ':' + (externalPort || '未知')
      } else {
        externalUrl = externalIp + ':' + (externalPort || '未知')
      }
    }
    return { externalUrl, readOnlyExternalUrl }
  }
  // 集群内实例访问地址
  inClusterUrl = () => {
    const { databaseInfo } = this.props
    const { copyStatus } = this.state
    const clusterAdd = [];
    const port = databaseInfo.service.port.port;
    const serviceName = databaseInfo.objectMeta.name;
    const pods = databaseInfo.pods
    if (pods) {
      for (const v of pods) {
        const url = `${v.name}.${serviceName}:${port}`
        clusterAdd.push(url)
      }
    }
    if (!clusterAdd.length) return '-'
    const domainList = clusterAdd && clusterAdd.map(item => {
      return (
        <div className="addrList" key={item}>
          <span className="domain">{item}</span>
          <Tooltip placement="top" title={copyStatus ? '复制成功' : '点击复制'}>
            <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this, item)} onClick={this.copyTest.bind(this)}/>
          </Tooltip>
        </div>
      )
    })
    return domainList
  }

  render() {
    const { form, database, databaseInfo } = this.props
    const { value,
      disabled,
      forEdit,
      selectDis,
      copyStatus,
      proxyArr,
      initValue,
      initGroupID,
      initSelectDics,
    } = this.state;
    // const lbinfo = databaseInfo.service.annotations ? databaseInfo.service.annotations[ANNOTATION_LBGROUP_NAME] : 'none'
    let validator = (rule, val, callback) => callback()
    if (value === 2) {
      validator = (rule, val, callback) => {
        if (!value) {
          return callback('请选择网络出口')
        }
        return callback()
      }
    }
    const selectGroup = form.getFieldProps('groupID', {
      rules: [{
        validator,
      }],
      initialValue: initGroupID,
    })
    const proxyNode = proxyArr.length > 0 ? proxyArr.map(item => {
      return (
        <Option key={item.id} value={item.id}>
          {item.type === 'public' ? '公网：' : '内网：'}{item.name}
        </Option>
      )
    }) : null

    const radioValue = value || initValue
    const hide = selectDis === undefined ? initSelectDics : selectDis
    const dataSource = [
      {
        key: 'externalUrl',
        text: '出口地址',
      },
      {
        key: 'inClusterUrls',
        text: '集群内实例访问地址',
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
                          <Tooltip placement="top" title={copyStatus ? '复制成功' : '点击复制'}>
                            <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this, this.externalUrl().externalUrl)} onClick={this.copyTest.bind(this)}/>
                          </Tooltip>
                        </div>

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
                <Tooltip placement="top" title={copyStatus ? '复制成功' : '点击复制'}>
                  <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this, this.loadBalancing().url)} onClick={this.copyTest.bind(this)}/>
                </Tooltip>
              </div>
            </div>
          )
        },
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
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>,
              ] :
                <Button
                  disabled={databaseInfo.status !== 'Running' && database === 'redis'}
                  type="primary"
                  size="large"
                  onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={radioValue}>
                <Radio key="b" value={2} disabled={disabled}>可集群外访问</Radio>
                <Radio key="a" value={1} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  radioValue === 1 ? '选择后该数据库与缓存集群仅提供集群内访问' : '数据库与缓存可提供集群外访问，选择一个网络出口'
                }
              </p>
              <div className={classNames('inlineBlock selectBox', { hide })}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled}
                    getPopupContainer={() => document.getElementsByClassName('selectBox')[0]}
                  >
                    {proxyNode}
                  </Select>
                </Form.Item>
              </div>
              {
                this.state.deleteHint &&
                <div className={classNames('inlineBlock deleteHint')}>
                  <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
                  已选网络出口已被管理员删除，请选择其他网络出口或访问方式
                </div>
              }
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox configContent">
          <div className="visitTypeTitle configHead">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{ opacity: 0 }}/>
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

function mapStateToProp(state) {
  const { current } = state.entities;
  const { clusterID } = current.cluster
  return {
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    clusterID,
  }
}

const VisitTypes = connect(mapStateToProp, {
  setServiceProxyGroup: servicesAction.setServiceProxyGroup,
  dbServiceProxyGroupSave: servicesAction.dbServiceProxyGroupSave,
  getProxy: clusterActions.getProxy,
})(Form.create()(VisitTypesComponent))

class LeasingInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storageValue: this.props.databaseInfo.storage ? parseInt(this.props.databaseInfo.storage) : 0,
    }
  }
  render() {
    const parentScope = this.props.scope
    const { databaseInfo, database } = this.props
    let storagePrc = parentScope.props.resourcePrice.storage *
      parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice[database === 'mysql' ? '4x' : '2x'] *
      parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue / 1024 *
      storagePrc * parentScope.state.replicas +
      parentScope.state.replicas * containerPrc), 4)
    const countPrice = parseAmount((parentScope.state.storageValue / 1024 *
      storagePrc * parentScope.state.replicas +
      parentScope.state.replicas * containerPrc) * 24 * 30, 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)
    return (
      <div className="modalDetailBox" id="dbClusterDetailInfo">
        <div className="configContent">
          <div className="configHead">租赁信息</div>
          <div className="containerPrc">
            <p><Icon type="pay-circle-o" /> 实例：<span className="unit">{ containerPrc.fullAmount }/（个*小时）</span> * {databaseInfo.replicas}个</p>
            <p><Icon type="hdd" /> 存储：<span className="unit">{ storagePrc.fullAmount }/（GB*小时）</span> * {databaseInfo.replicas}个</p>
          </div>
          <div className="countPrice">
            合计价格：
            <span className="unit">
              {hourPrice.unit === '￥' ? '￥' : ''}
            </span>
            <span className="unit blod">
              {hourPrice.amount}{hourPrice.unit === '￥' ? '' : ' T'}/小时
            </span>
            <span className="unit" style={{ marginLeft: '10px' }}>
              （约：{countPrice.fullAmount}/月）
            </span>
          </div>
        </div>
      </div>
    )
  }
}

class MongoDBClusterDetail extends Component {
  constructor() {
    super()
    this.state = {
      currentDatabase: null,
      activeTabKey: '#BaseInfo',
      putModaling: false,
      startAlertModal: false,
      stopAlertModal: false,
      accessMethodData: null,
      rebootClusterModal: false,
      rebootLoading: false,
      recordItem: null,
    }
  }
  deleteDatebaseCluster(dbName) {
    // this function for use delete the database
    const { deleteDatabaseCluster, cluster } = this.props;
    const { database } = this.props.params
    this.setState({ delModal: false })
    const notification = new NotificationHandler()
    this.setState({ deleteBtn: true })
    deleteDatabaseCluster(cluster, dbName, database, {
      success: {
        func: () => {
          notification.success('删除成功')
          setTimeout(() => {
            browserHistory.push({
              pathname: '/middleware_center/deploy',
              state: {
                active: database,
              },
            })
          })
        },
      },
      failed: {
        func: res => {
          this.setState({ deleteBtn: false })
          notification.error('删除失败', res.message.message)
        },
      },
    });
  }
  componentWillMount() {
    const { dbName, database } = this.props.params
    const { loadDbClusterDetail, cluster } = this.props
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, database, true, {
      success: {
        func: res => {
          this.setState({
            replicas: res.database.replicas,
            storageValue: parseInt(res.database.storage),
          })
        },
      },
    });
  }

  refurbishDetail() {
    const { dbName, database } = this.props.params
    const { loadDbClusterDetail, cluster } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, database, {
      success: {
        func: res => {
          _this.setState({ replicas: res.database.replicas })
        },
      },
    });
  }

  handSave() {
    const { dbName, database } = this.props.params
    const {
      cluster,
      editDatabaseCluster,
      loadDbClusterDetail } = this.props
    const notification = new NotificationHandler()
    this.setState({ putModaling: true })
    const body = { replicas: this.state.replicas }
    if (database === 'mysql' || database === 'redis') {
      editDatabaseCluster(cluster, database, dbName, body, {
        success: {
          func: () => {
            notification.success('更新成功')
            setTimeout(() => {
              loadDbClusterDetail(cluster, dbName, database, {
                success: {
                  func: res => {
                    this.setState({
                      replicas: res.database.replicas,
                      storageValue: parseInt(res.database.storage),
                    })
                  },
                },
              });
            })
          },
        },
      })
    }

  }
  colseModal() {
    const storageValue = parseInt(this.props.databaseInfo.storage)

    this.setState({
      putModaling: false,
      replicas: this.props.databaseInfo.replicas,
      storageValue,
    })
  }
  onTabClick(activeTabKey) {
    if (activeTabKey === '#monitor') {
      const { dbName } = this.props.params
      window.open(`/app-stack/StatefulSet?redirect=/StatefulSet/${encodeURIComponent(dbName)}/monitor`)
    }
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    this.setState({
      activeTabKey,
      recordItem: null,
    })
  }
  dbStatus(status) {
    if (status === 'Running') {
      return (<span className="running"><i className="fa fa-circle"></i> 运行中 </span>)
    }
    if (status === 'Pending') {
      return (<span className="padding"><i className="fa fa-circle"></i> 启动中 </span>)
    }
    if (status === 'Stopping') {
      return (<span className="stopping"><i className="fa fa-circle"></i> 停止中 </span>)
    }
    if (status === 'Stopped') {
      return (<span className="stop"><i className="fa fa-circle"></i> 已停止 </span>)
    }
  }
  stopAlert = () => {
    this.setState({
      stopAlertModal: true,
    })
  }
  startAlert = () => {
    this.setState({
      startAlertModal: true,
    })
  }
  stopTheCluster = () => {
    const { dbName, database } = this.props.params
    const { cluster,
      databaseInfo,
      editDatabaseCluster,
      loadDbClusterDetail } = this.props
    const { name } = databaseInfo.objectMeta
    const body = { onOff: 'stop' }
    editDatabaseCluster(cluster, database, name, body, {
      success: {
        func: () => {
          setTimeout(() => {
            loadDbClusterDetail(cluster, dbName, database, true);
          })
          this.setState({
            stopAlertModal: false,
          })
        },
      },
    })
  }
  startTheCluster = () => {
    const { dbName, database } = this.props.params
    const { cluster,
      databaseInfo,
      editDatabaseCluster,
      loadDbClusterDetail } = this.props
    const { name } = databaseInfo.objectMeta
    const body = { onOff: 'start' }
    editDatabaseCluster(cluster, database, name, body, {
      success: {
        func: () => {
          setTimeout(() => {
            loadDbClusterDetail(cluster, dbName, database, true);
          })
          this.setState({
            startAlertModal: false,
          })
        },
      },
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
          <span><span className="stopIcon"></span>停止</span>
        </div>
      case 'Stopped':
        return <div onClick={this.startAlert}>启动</div>
      case 'Stopping':
        return <div onClick={this.startAlert}>启动</div>
      default:
        return ''
    }
  }
  reboot = () => {
    const { dbName, database } = this.props.params
    const confirm = () => {
      const { loadDbClusterDetail, cluster, rebootCluster } = this.props
      this.setState({
        rebootLoading: true,
      })
      rebootCluster(cluster, dbName, database, {
        success: {
          func: () => {
            this.setState({
              rebootClusterModal: false,
              rebootLoading: false,
            })
            setTimeout(() => {
              loadDbClusterDetail(cluster, dbName, database, true);
            })
          },
        },
        failed: {
          func: () => {
            const notification = new NotificationHandler()
            notification.error('重启失败')
            this.setState({
              rebootClusterModal: false,
              rebootLoading: false,
            })
          },
        },
      })
    }
    return <Modal
      title="重启集群"
      onOk={confirm}
      confirmLoading={this.state.rebootLoading}
      onCancel={() => {
        this.setState({
          rebootClusterModal: false,
          rebootLoading: false,
        })
      }}
      visible={this.state.rebootClusterModal}
    >
      <div className="appServiceDetailRebootAlert">
        <div>
          <Icon type="question-circle-o" className="question" />
          确认重启集群吗？
        </div>
      </div>
    </Modal>
  }
  editConfigOk = () => {
    const { dbName, database } = this.props.params
    const { loadDbClusterDetail, cluster } = this.props
    loadDbClusterDetail(cluster, dbName, database, true);
  }
  linkToBackup = backupRef => {
    this.setState({
      activeTabKey: '#Backup',
      recordItem: backupRef,
    })
  }
  render() {
    const { dbName, database } = this.props.params
    const { scope,
      isFetching,
      databaseInfo,
      domainSuffix,
      bindingIPs,
      billingEnabled,
      cluster,
    } = this.props;
    if (isFetching || databaseInfo == null) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    const needReboot = databaseInfo.objectMeta.annotations['system/daasReboot']
    const operationMenu = () => <Menu>
      <MenuItem key="del" disabled={this.state.deleteBtn}>
        <div onClick={() => this.setState({ delModal: true })}>删除集群</div>
      </MenuItem>
      <MenuItem key="stop" >
        {
          this.clusterBtn(databaseInfo.status)
        }
      </MenuItem>
    </Menu>
    const disableReboot = databaseInfo.objectMeta.annotations['system/daasReboot'] === 'disable'
    const reboot = () => {
      const rebootBtn = () => {
        return <div>
          <Button
            style={{ marginRight: '16px' }}
            disabled={databaseInfo.status === 'Stopped' || disableReboot}
            onClick={() => {
              this.setState({ rebootClusterModal: true })
            }}>
            重启
          </Button>
        </div>
      }
      return <div className="li">
        {
          needReboot === 'enable' && databaseInfo.status !== 'Stopped' ?
            <Tooltip title="集群配置已更改，重启后生效">
              <Button style={{ marginRight: '16px' }} className="shinning" onClick={() => {
                this.setState({ rebootClusterModal: true })
              }}>
                重启
              </Button>
            </Tooltip>
            :
            rebootBtn()
        }
        {this.reboot()}
        <Button style={{ marginRight: '16px' }} onClick={() => this.refurbishDetail()}>
          <i className="fa fa-refresh"></i>&nbsp;
          刷新
        </Button>

        {/* 操作按钮*/}
        <DropdownButton overlay={operationMenu()}>
          其他操作
        </DropdownButton>

      </div>
    }
    return (
      <div id="RabbitDeployClusterDetail" className="dbServiceDetail">
        <div className="topBox">
          <Icon className="closeBtn" type="cross" onClick={() => { scope.setState({ detailModal: false }) } } />
          <div className="imgBox">
            <img src={mongodbImg} alt=""/>
          </div>

          <div className="infoBox">
            <p className="instanceName">
              {databaseInfo.objectMeta && databaseInfo.objectMeta.name}
            </p>
            <div className="leftBox TenxStatus">
              <div className="dbDesc">{databaseInfo.objectMeta.namespace} / {databaseInfo.objectMeta.name}</div>
              <div>集群模式：{databaseInfo.multiMaster === true ? '多主' : '一主多从' }</div>
              <div> 状态：
                {this.dbStatus(databaseInfo.status)}
              </div>
            </div>
            <div className="rightBox">
              {reboot()}
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作"
          visible={this.state.delModal}
          onOk={() => this.deleteDatebaseCluster(dbName)}
          onCancel={() => this.setState({ delModal: false })}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            您是否确定要删除数据库 { dbName }?
          </div>
        </Modal>
        <div className="bottomBox">
          <div className="siderBox">
            <Tabs
              onTabClick={e => this.onTabClick(e)}
              activeKey={this.state.activeTabKey}
            >

              <TabPane tab="基础信息" key="#BaseInfo">
                {
                  this.state.activeTabKey === '#BaseInfo' && <FormBaseInfo
                    domainSuffix={domainSuffix} bindingIPs={bindingIPs}
                    databaseInfo={databaseInfo}
                    storageValue={this.state.storageValue}
                    database={database}
                    dbName={dbName}
                    cluster={cluster}
                    scope= {this}
                  />
                }
              </TabPane>
              { billingEnabled ?
                [
                  <TabPane tab="访问方式" key="#VisitType">
                    <VisitTypes
                      isCurrentTab={this.state.activeTabKey === '#VisitType'}
                      domainSuffix={domainSuffix} bindingIPs={bindingIPs}
                      currentData={databaseInfo.pods}
                      detailModal={this.props.detailModal}
                      databaseInfo={databaseInfo}
                      storageValue={this.state.storageValue}
                      database={database}
                      dbName={dbName}
                      scope= {this} />
                  </TabPane>,
                  <TabPane tab="存储" key="#Storage">
                    <Storage databaseInfo={databaseInfo} database={database}/>
                  </TabPane>,
                  <TabPane tab="配置管理" key="#ConfigManage">
                    <ConfigManagement
                      database={database}
                      databaseInfo={databaseInfo}
                      onEditConfigOk={this.editConfigOk}/>
                  </TabPane>,
                  <TabPane tab={<span>监控 <Icon type="export" /></span>} key="#monitor">
                    <div className="monitor">
                      &nbsp;&nbsp;&nbsp;已在新窗口中打开
                    </div>
                  </TabPane>,
                  <TabPane tab="日志" key="#log">
                    <div className="log">
                      <Log dbName={dbName}/>
                    </div>
                  </TabPane>,
                  <TabPane tab="事件" key="#events">
                    {
                      database !== 'mysql' && database !== 'redis' ?
                        <AppServiceEvent
                          serviceName={dbName}
                          cluster={this.props.cluster}
                          type={'dbservice'}/>
                        :
                        <DatabaseEvent
                          database={database}
                          databaseInfo={databaseInfo}
                          cluster={this.props.cluster}/>
                    }
                  </TabPane>,
                  <TabPane tab="租赁信息" key="#leading">
                    <LeasingInfo databaseInfo={databaseInfo} database={database} scope= {this} />
                  </TabPane> ]
                :
                [ <TabPane tab="访问方式" key="#VisitType">
                  <VisitTypes
                    isCurrentTab={this.state.activeTabKey === '#VisitType'}
                    domainSuffix={domainSuffix}
                    bindingIPs={bindingIPs}
                    currentData={databaseInfo.pods}
                    detailModal={this.props.detailModal}
                    databaseInfo={databaseInfo}
                    storageValue={this.state.storageValue}
                    database={database}
                    dbName={dbName}
                    scope= {this} />
                </TabPane>,
                <TabPane tab="存储" key="#Storage">
                  <Storage databaseInfo={databaseInfo} database={database}/>
                </TabPane>,
                <TabPane tab="配置管理" key="#ConfigManage">
                  <ConfigManagement
                    database={database}
                    databaseInfo={databaseInfo}
                    onEditConfigOk={this.editConfigOk}/>
                </TabPane>,
                <TabPane tab={<span>监控 <Icon type="export" /></span>} key="#monitor">
                  <div className="monitor">
                    &nbsp;&nbsp;&nbsp;已在新窗口中打开
                  </div>
                </TabPane>,

                <TabPane tab="日志" key="#log">
                  <div className="log">
                    <Log dbName={dbName}/>
                  </div>
                </TabPane>,
                <TabPane tab="事件" key="#events">
                  {
                    database !== 'mysql' ?
                      <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
                      :
                      <DatabaseEvent
                        database={database}
                        databaseInfo={databaseInfo}
                        cluster={this.props.cluster}/>
                  }
                </TabPane> ]
              }
            </Tabs>
          </div>
        </div>
        <Modal
          visible={this.state.stopAlertModal}
          title="停止数据库与缓存集群"
          onCancel={() => this.setState({
            stopAlertModal: false,
          })}
          onOk={this.stopTheCluster}
        >
          <div className="alertContent">
            <Icon type="question-circle-o" />{`是否确定停止${databaseInfo.objectMeta.name}集群？`}
          </div>
        </Modal>
        <Modal
          visible={this.state.startAlertModal}
          title="启动数据库与缓存集群"
          onCancel={() => this.setState({ startAlertModal: false })}
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
function mapStateToProps(state) {
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
    databaseInfo,
    resourcePrice: cluster.resourcePrice, // storage
    billingEnabled,
  }
}
export default connect(mapStateToProps, {
  loadDbClusterDetail: databaseActions.loadDbClusterDetail,
  deleteDatabaseCluster: databaseActions.deleteDatabaseCluster,
  putDbClusterDetail: databaseActions.putDbClusterDetail,
  loadDbCacheList: databaseActions.loadDbCacheList,
  editDatabaseCluster: databaseActions.editDatabaseCluster,
  rebootCluster: databaseActions.rebootCluster,
  updateMysqlPwd: databaseActions.updateMysqlPwd,
})(MongoDBClusterDetail)
