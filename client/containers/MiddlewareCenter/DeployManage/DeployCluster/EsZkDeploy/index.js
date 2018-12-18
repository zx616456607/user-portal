/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 *  CreateDatabase for Zookeeper and ES
 *
 * v3.2 - 2018-12-13
 * @author zhouhaitao
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Input, Select, InputNumber, Button, Form, Radio, Spin, Row, Col, Card } from 'antd'
import * as databaseCacheActions from '../../../../../../src/actions/database_cache'
import * as entitiesActions from '../../../../../../src/actions/entities'
import * as projectActions from '../../../../../../src/actions/project'
import * as clusterActions from '../../../../../../src/actions/cluster'
import * as appCenterActions from '../../../../../../src/actions/app_center'
import NotificationHandler from '../../../../../../src/components/Notification'
import { ASYNC_VALIDATOR_TIMEOUT, MY_SPACE } from '../../../../../../src/constants'
import { parseAmount } from '../../../../../../src/common/tools.js'
import './style/EsZkDeploy.less'
import { UPGRADE_EDITION_REQUIRED_CODE, DEFAULT_REGISTRY } from '../../../../../../src/constants'
import { camelize } from 'humps'
import { validateK8sResourceForServiceName } from '../../../../../../src/common/naming_validation'
import { browserHistory } from 'react-router';

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

class EsZkDeployComponent extends React.Component {
  state = {
    currentType: '',
    showPwd: 'text',
    firstFocues: true,
    onselectCluster: true,
    dbservice: [],
  }
  componentDidMount() {
    this.setState({
      currentType: this.props.routeParams.database,
    })
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: res => {
          this.setState({
            dbservice: res.data.data.templates,
          })
        },
      },
    })

    this.props.ListProjects({ size: 0 })
    this.loadStorageClassList()
  }
  /*  getDerivedStateFromProps(nextProps) {
    // if create box close return default select cluster
    if (!nextProps.scope.state.CreateDatabaseModalShow) {
      this.setState({ onselectCluster: true, loading: false })
    }
    this.setState({
      currentType: nextProps.database,
    })
    if (this.props.visible !== nextProps.visible && nextProps.visible) {
      this.loadStorageClassList()
    }
  }*/
  /*
  onChangeCluster = clusterID => {
    this.setState({ onselectCluster: false })
    const { projectVisibleClusters, form, space, setCurrent } = this.props
    const currentNamespace = form.getFieldValue('namespaceSelect') || space.namespace
    const projectClusters = projectVisibleClusters[currentNamespace] &&
      projectVisibleClusters[currentNamespace].data || []
    projectClusters.every(cluster => {
      if (cluster.clusterID === clusterID) {
        setCurrent({
          cluster,
        })
        return false
      }
      return true
    })
  }
  selectDatabaseType = database => {
    // this funciton for user select different database
    this.setState({
      currentType: database,
    });
    document.getElementById('dbName').focus()
  }
*/
  onChangeNamespace = namespace => {
    // this function for user change the namespace
    // when the namespace is changed, the function would be get all clusters of new namespace
    const { projects, form, setCurrent, getProjectVisibleClusters } = this.props
    projects.every(space => {
      if (space.namespace === namespace) {
        setCurrent({
          space,
          team: {
            teamID: space.teamID,
          },
        })
        getProjectVisibleClusters(namespace, {
          success: {
            func: result => {
              const { clusters } = result.data
              if (clusters.length > 0) {
                form.setFieldsValue({
                  clusterSelect: clusters[0].clusterID,
                })
              } else {
                form.setFieldsValue({ clusterSelect: '' })
              }
            },
            isAsync: true,
          },
        })
        return false
      }
      return true
    })
  }
  databaseExists = (rule, value, callback) => {
    if (!value) {
      callback();
      return
    }
    const { cluster, checkDbName } = this.props;
    setTimeout(() => {
      checkDbName(cluster, value, {
        success: {
          func: result => {
            if (result.data) {
              callback([ new Error('集群名称已存在') ]);
              return
            }
            callback()
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            return callback([ new Error('集群名校验失败') ])
          },
          isAsync: true,
        },
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  dbNameIsLegal = (rule, value, callback) => {
    let flag = false;
    if (!validateK8sResourceForServiceName(value)) {
      flag = true
      return callback('名称由3~60 位小写字母、数字、中划线组成')
    }
    const checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
    if (!checkName.test(value)) {
      callback([ new Error('名称仅由小写字母、数字和横线组成，且以小写字母开头') ]);
      flag = true;
    }
    if (!flag) {
      callback();
    }
  }
  checkPwd = () => {
    // this function for user change the password box input type
    // when the type is password and change to the text, user could see the password
    // when the type is text and change to the password, user couldn't see the password
    if (this.state.showPwd === 'password') {
      this.setState({
        showPwd: 'text',
      });
    } else {
      this.setState({
        showPwd: 'password',
      });
    }
  }
  setPsswordType = () => {
    if (this.state.firstFocues) {
      this.setState({
        showPwd: 'password',
        firstFocues: false,
      });

    }
  }
  handleReset = e => {
    // this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false,
    });
  }
  handleSubmit = e => {
    // this function for user submit the form
    e.preventDefault();
    const _this = this;
    const { space } = this.props;
    const { database } = this.props.routeParams
    const { projects, projectVisibleClusters, form, CreateDbCluster, setCurrent } = this.props;
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      _this.setState({ loading: true })
      let templateId
      this.state.dbservice.forEach(item => {
        if (item.category === _this.state.currentType) {
          templateId = item.id
        }
      })
      if (this.state.onselectCluster) {
        values.clusterSelect = this.props.cluster
      }
      const notification = new NotificationHandler()
      if (values.replicas > 100) {
        notification.info('副本数不能大于 100')
        _this.setState({ loading: false })
        return
      }
      let newSpace,
        newCluster
      projects.forEach(list => {
        if (list.namespace === values.namespaceSelect) {
          newSpace = list
        }
      })
      const currentNamespace = form.getFieldValue('namespaceSelect') || space.namespace
      const projectClusters = projectVisibleClusters[currentNamespace] &&
        projectVisibleClusters[currentNamespace].data || []
      projectClusters.map(list => {
        if (list.clusterID === values.clusterSelect) {
          newCluster = list
        }
        return ''
      })
      let externalIP = ''
      if (newCluster.publicIPs && newCluster.publicIPs !== '') {
        const ips = JSON.parse(newCluster.publicIPs)
        if (ips && ips.length > 0) {
          externalIP = ips[0]
        }
      }
      let lbGroupID = 'none'
      if (values.outerCluster) {
        lbGroupID = values.outerCluster
      }
      const replicas = this.state.currentType === 'zookeeper' ? values.zkReplicas : values.replicas
      const body = {
        cluster: values.clusterSelect,
        externalIP,
        serviceName: values.name,
        password: values.password,
        replicas,
        volumeSize: values.storageSelect,
        teamspace: newSpace.namespace,
        templateId,
        lbGroupID,
        storageClassName: values.storageClass,
      }
      if (!templateId) {
        notification.info(`${_this.state.currentType} 集群创建还在开发中，敬请期待`)
        _this.setState({ loading: false })
        return
      }
      CreateDbCluster(body, {
        success: {
          func: () => {
            notification.success('创建成功')
            this.setState({ loading: false })
            browserHistory.push({
              pathname: '/middleware_center/deploy',
              state: {
                active: database,
              },
            })
            setCurrent({
              cluster: newCluster,
              space: newSpace,
            })
            this.props.form.resetFields();

          },
          isAsync: true,
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              notification.error('数据库服务 ' + values.name + ' 同已有资源冲突，请修改名称后重试')
            } else {
              if (res.statusCode !== UPGRADE_EDITION_REQUIRED_CODE) {
                notification.error('创建数据库服务失败')
              }

            }
          },
        },
        finally: {
          func: () => {
            this.setState({ loading: false })
          },
        },
      });
    });
  }
  getDefaultOutClusterValue = () => {
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    let defaultValue
    if (!clusterProxy || !clusterProxy[clusterId] ||
      !clusterProxy[clusterId].data || !clusterProxy[clusterId].data.length) {
      return defaultValue
    }
    clusterProxy[clusterId].data.forEach(item => {
      if (item.isDefault) {
        defaultValue = item.id
      }
    })
    return defaultValue
  }
  renderSelectOption = () => {
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    if (!clusterProxy ||
      !clusterProxy[clusterId]
      || !clusterProxy[clusterId].data || !clusterProxy[clusterId].data.length) {
      return <Option value="none" key="none" disabled>暂无可用网络出口</Option>
    }
    return clusterProxy[clusterId].data.map((item, index) => {
      let name = '公网'
      if (item.type === 'private') {
        name = '内网'
      }
      return <Option value={item.id} key={item.address + index}>{name}: {item.name}</Option>
    })
  }
  loadStorageClassList = () => {
    const { cluster, getClusterStorageList } = this.props
    getClusterStorageList(cluster)
  }
  renderStorageClassListOption = () => {
    const { storageClassList } = this.props
    const { isFetching, cephList } = storageClassList
    let option = [ <Option
      value="loading"
      key="loading"
      style={{ textAlign: 'center' }}
      disabled
    >
      <Spin />
    </Option> ]
    if (!isFetching) {
      option = cephList.map((item, index) => {
        const name = item.metadata.annotations['system/scName'] || item.metadata.name
        return <Option key={`list${index}`} value={item.metadata.name}>{name}</Option>
      })
    }
    return option
  }
  // 选出默认存储
  defaultStorage = () => {
    const { storageClassList } = this.props
    const { cephList } = storageClassList
    let defaultStorage = cephList.length > 0 ? cephList[0].metadata.name : ''
    cephList.forEach(item => {
      if (item.metadata.labels['system/storageDefault'] && item.metadata.labels['system/storageDefault'] === 'true') {
        defaultStorage = item.metadata.name
      }
    })
    return defaultStorage
  }

  render() {
    const { isFetching, space, billingEnabled } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, whitespace: true, message: '请输入名称' },
        { validator: this.databaseExists },
        { validator: this.dbNameIsLegal },
      ],
    });
    getFieldProps('namespaceSelect', {
      initialValue: space.namespace,
      onChange: this.onChangeNamespace,
    });

    const defaultValue = this.getDefaultOutClusterValue()
    const accessTypeProps = getFieldProps('accessType', {
      initialValue: defaultValue ? 'outcluster' : 'none',
      rules: [{
        required: true,
        message: '请选择集群访问方式',
      }],
    })
    const accessType = getFieldValue('accessType')
    let outClusterProps
    if (accessType === 'outcluster') {
      outClusterProps = getFieldProps('outerCluster', {
        initialValue: defaultValue,
        rules: [
          { required: true, message: '请选择网络出口' },
        ],
      })
    }
    const replicasProps = getFieldProps('replicas', {
      initialValue: 3,
    });
    const storageClassProps = getFieldProps('storageClass', {
      initialValue: this.defaultStorage(),
      rules: [{ required: true, message: '块存储名字不能为空' }],
    })
    const zkReplicasProps = getFieldProps('zkReplicas', {
      initialValue: 3,
    });
    const selectStorageProps = getFieldProps('storageSelect', {
      initialValue: 512,
    });
    const passwdProps = getFieldProps('password', {
      rules: [
        {
          required: this.state.currentType !== 'elasticsearch' && this.state.currentType !== 'etcd',
          whitespace: true,
          message: '请填写密码',
        },
      ],
    });
    const storageNumber = this.state.currentType === 'zookeeper' ? getFieldValue('zkReplicas') : getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    let hourPrice = 0
    let countPrice = 0
    if (this.props.resourcePrice) {
      hourPrice = parseAmount((strongSize / 1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio, 4)
      countPrice = parseAmount((strongSize / 1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio * 24 * 30, 4)
    }
    return (
      <QueueAnim>
        <div id="EsZkDeploy" key="createDatabase">
          <Row gutter={24}>
            <Col span={17}>
              <Card>
                <Form horizontal>
                  <div className="infoBox">
                    <div className="commonBox">
                      <div className="title">
                        <span>名称</span>
                      </div>
                      <div className="inputBox">
                        <FormItem
                          hasFeedback
                          help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                        >
                          <Input {...nameProps} size="large" id="name" placeholder="请输入名称" disabled={isFetching}/>
                        </FormItem>
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className="commonBox accesstype">
                      <div className="title">
                        <span>集群访问方式</span>
                      </div>
                      <div className="radioBox">
                        <FormItem>
                          <Radio.Group {...accessTypeProps}>
                            <Radio value="outcluster" key="2">可集群外访问</Radio>
                            <Radio value="none" key="1">仅在集群内访问</Radio>
                          </Radio.Group>
                        </FormItem>
                        {
                          accessType === 'outcluster'
                            ? <div className="accessTips">数据库与缓存集群可提供集群外访问</div>
                            : <div className="accessTips">选择后该数据库与缓存集群仅提供集群内访问</div>
                        }
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    {
                      accessType === 'outcluster'
                        ? <div className="commonBox outclusterBox">
                          <div className="title"></div>
                          <div className="inputBox">
                            <FormItem>
                              <Select
                                {...outClusterProps}
                                placeholder="选择网络出口"
                                style={{ width: 200 }}
                              >
                                { this.renderSelectOption() }
                              </Select>
                            </FormItem>
                          </div>
                          <div style={{ clear: 'both' }}></div>
                        </div>
                        : null
                    }
                    <div className="commonBox">
                      <div className="title">
                        <span>副本数</span>
                      </div>
                      <div className="inputBox replicas">
                        <FormItem style={{ width: '80px', float: 'left' }}>
                          {
                            this.state.currentType === 'zookeeper' ?
                              <InputNumber {...zkReplicasProps} size="large" min={3} max={100} disabled={isFetching} /> :
                              <InputNumber {...replicasProps} size="large" min={1} max={100} disabled={isFetching} />
                          }
                        </FormItem>
                        <span className="litteColor" style={{ float: 'left', paddingLeft: '15px' }}>个</span>
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className="desc">
                      <span>每个副本占用的cpu、内存等资源也将在计算资源配额中统计</span>
                    </div>
                    <div className="commonBox" style={{ marginBottom: '4px' }}>
                      <div className="title">
                        <span>存储</span>
                      </div>
                      <div className="inputBox replicas">
                        <FormItem style={{ width: '200px', float: 'left', marginRight: '12px' }}>
                          <Select
                            placeholder="请选择一个块存储集群"
                            size="large"
                            {...storageClassProps}
                          >
                            { this.renderStorageClassListOption() }
                          </Select>
                        </FormItem>
                        <FormItem style={{ width: '80px', float: 'left', marginRight: '8px' }}>
                          <InputNumber
                            {...selectStorageProps}
                            size="large"
                            min={512}
                            max={20480}
                            defaultValue={512}
                            step={512}
                            disabled={isFetching}
                          />
                        </FormItem>
                        MB
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    {this.state.currentType === 'elasticsearch' || this.state.currentType === 'etcd' ? null :
                      <div className="commonBox">
                        <div className="title">
                          <span>密码</span>
                        </div>
                        <div className="inputBox">
                          <FormItem
                            hasFeedback
                          >
                            <Input {...passwdProps} onFocus={() => this.setPsswordType()} type={this.state.showPwd} size="large" placeholder="请输入密码" disabled={isFetching} />
                            <i className={this.state.showPwd === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'} onClick={this.checkPwd}></i>
                          </FormItem>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                      </div>}
                  </div>
                  <div className="btnBox">
                    <Button size="large" onClick={this.handleReset}>
                      取消
                    </Button>
                    {this.state.loading ?
                      <Button size="large" type="primary" loading={this.state.loading}>
                        确定
                      </Button>
                      :
                      <Button size="large" type="primary" onClick={this.handleSubmit}>
                        确定
                      </Button>
                    }
                  </div>
                </Form>
              </Card>
            </Col>
            <Col span={7}>
              <Card>
                { billingEnabled ?
                  <div className="modal-price">
                    <div className="price-top">
                      <div className="keys">实例：{ this.props.resourcePrice && parseAmount(this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                      <div className="keys">存储：{ this.props.resourcePrice && parseAmount(this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                    </div>
                    <div className="price-unit">
                      <div className="price-unit-inner">
                        <p>合计：<span className="unit">{countPrice.unit === '￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice.amount }{countPrice.unit === '￥' ? '' : ' T'}/小时</span></p>
                        <p className="unit">（约：{ countPrice.fullAmount }/月）</p>
                      </div>
                    </div>
                  </div>
                  : null
                }
              </Card>
            </Col>
          </Row>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { cluster, space } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const { clusterStorage } = state.cluster
  const defaultDbNames = {
    isFetching: false,
    cluster: cluster.clusterID,
    databaseNames: [],
  }
  const { databaseAllNames } = state.databaseCache
  const { databaseNames, isFetching } = databaseAllNames.DbClusters || defaultDbNames
  const { current } = state.entities
  const { projectList, projectVisibleClusters } = state.projectAuthority
  const { enabled: billingEnabled } = billingConfig
  let projects = projectList.data || []
  projects = ([ MY_SPACE ]).concat(projects)
  let defaultStorageClassList = {
    isFetching: false,
    cephList: [],
  }
  if (clusterStorage[cluster.clusterID]) {
    defaultStorageClassList = clusterStorage[cluster.clusterID]
  }
  const clusterProxy = state.cluster.proxy.result || {}
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    space,
    current,
    databaseNames,
    clusterProxy,
    isFetching,
    projects,
    projectVisibleClusters,
    resourcePrice: cluster.resourcePrice, // storage
    storageClassList: defaultStorageClassList,
    billingEnabled,
  }

}

const Index = createForm()(EsZkDeployComponent);

Index.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbCluster: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, {
  CreateDbCluster: databaseCacheActions.CreateDbCluster,
  setCurrent: entitiesActions.setCurrent,
  getProjectVisibleClusters: projectActions.getProjectVisibleClusters,
  ListProjects: projectActions.ListProjects,
  getClusterStorageList: clusterActions.getClusterStorageList,
  checkDbName: databaseCacheActions.checkDbName,
  loadMyStack: appCenterActions.loadMyStack,
})(Index)
