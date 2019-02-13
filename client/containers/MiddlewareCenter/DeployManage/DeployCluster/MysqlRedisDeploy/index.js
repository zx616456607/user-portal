/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CreateDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Input,
  Select,
  InputNumber,
  Button,
  Form,
  Icon,
  Tooltip,
  Radio,
  Spin,
  Row,
  Col,
  Card,
} from 'antd'
import * as databaseCacheActions from '../../../../../../src/actions/database_cache'
import newMySqlCluster from '../../../../../../kubernetes/objects/newMysqlCluster'
import newRedisCluster from '../../../../../../kubernetes/objects/newRedisCluster'
import yaml from 'js-yaml'
import { setCurrent } from '../../../../../../src/actions/entities'
import * as projectActions from '../../../../../../src/actions/project'
import * as clusterActions from '../../../../../../src/actions/cluster'

import NotificationHandler from '../../../../../../src/components/Notification'
import ResourceConfig from '../../../../../components/ResourceConfig'
import { ASYNC_VALIDATOR_TIMEOUT, MY_SPACE } from '../../../../../../src/constants'
import { parseAmount, getResourceByMemory } from '../../../../../../src/common/tools.js'
import { validateK8sResourceForServiceName } from '../../../../../../src/common/naming_validation'
import './style/MysqlRedisDeploy.less'
import { camelize } from 'humps'
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

class MysqlRedisDeploy extends React.Component {
  state = {
    currentType: this.props.routeParams.database,
    showPwd: 'text',
    firstFocues: true,
    onselectCluster: true,
    composeType: 512,
    advanceConfigContent: '',
    showAdvanceConfig: false,
    clusterConfig: {},
    path: '/etc/redis',
    file: 'redis.conf',
    clusterMode: 'single',
    pluginMsg: false,
  }
  componentWillMount() {
    const { ListProjects, cluster, getConfigDefault, getProxy,
      loadDbCacheList, storageClassType } = this.props
    const { database } = this.props.routeParams
    // 初始给集群配置赋值
    function formatConfigData(convertedConfig) {
      const configData = {}
      configData.requests = {
        cpu: `${convertedConfig.cpu * 1000}m`,
        memory: `${convertedConfig.memory}Mi`,
      }
      configData.limits = {
        cpu: `${convertedConfig.limitCpu * 1000}m`,
        memory: `${convertedConfig.limitMemory}Mi`,
      }
      return configData
    }
    if (database === 'mysql' || database === 'redis') {
      if (database === 'mysql') {
        this.setState({
          path: '/etc/mysql',
          file: 'mysql.conf',
          composeType: 1024,
        })
      }

      getConfigDefault(cluster, database, {
        success: {
          func: res => {
            this.setState({
              advanceConfigContent: res.data.config,
            })
          },
        },
      })
      const should4X = database === 'mysql'
      const convertedConfig = getResourceByMemory(should4X ? '1024' : '512')
      this.setState({
        clusterConfig: formatConfigData(convertedConfig),
      })
    }
    getProxy(cluster)
    ListProjects({ size: 0 })
    this.setState({
      pluginMsg: '校验插件中...',
    })
    const errHandler = err => {
      if (err.statusCode === 404 && err.message.details) {
        const { kind } = err.message.details
        const reg = /cluster-operator/g
        if (reg.test(kind)) {
          this.setState({
            pluginMsg: `${kind}插件未安装，请联系管理员安装插件`,
          })
        }
      }
    }
    loadDbCacheList(cluster, database, {
      success: {
        func: () => this.setState({
          pluginMsg: false,
        }),
      },
      failed: {
        func: err => errHandler(err),
      },
    })
    this.loadStorageClassList().then(() => {
      if (storageClassType && !storageClassType.private) {
        this.setState({
          pluginMsg: '尚未配置块存储集群，暂不能创建',
        })
      }
    })
  }

  selectDatabaseType(database) {
    // this funciton for user select different database
    this.setState({
      currentType: database,
    });
    document.getElementById('name').focus()
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
    browserHistory.push('/middleware_center/app')
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false,
    });
  }
  handleSubmit = e => {
    // this function for user submit the form
    e.preventDefault();
    const {
      cluster,
      createDBClusterPwd,
      createDatabaseCluster,
      createDBConfig,
      namespace,
      params,
    } = this.props;
    const { database } = this.props.routeParams
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      this.setState({ loading: true })
      if (this.state.onselectCluster) {
        values.clusterSelect = this.props.cluster
      }
      const notification = new NotificationHandler()
      if (values.replicas > 100) {
        notification.info('副本数不能大于 100')
        this.setState({ loading: false })
        return
      }
      let lbGroupID = 'none'
      if (values.outerCluster) {
        lbGroupID = values.outerCluster
      }
      const replicas = this.state.currentType === 'zookeeper' ? values.zkReplicas : values.replicas
      // 错误处理
      const handleError = error => {
        if (error.message.message && error.message.message.indexOf('already exists') > 0) {
          notification.warn('集群名已经存在')
          this.setState({ loading: false })
        } else {
          notification.warn(error.message)
          this.setState({ loading: false })
        }
      }
      if (database === 'mysql') {
        const createMySql = async () => {
          const newMySqlClusterData = new newMySqlCluster(
            values.name,
            replicas,
            lbGroupID,
            this.state.clusterMode === 'multi',
            this.state.clusterConfig,
            values.storageClass,
            `${values.storageSelect}Mi`
          )
          // 创建密码
          const pwdCreate = await createDBClusterPwd(cluster, values.name, '', values.password, 'mysql')
          if (pwdCreate.error) {
            handleError(pwdCreate.error)
            return
          }
          // 创建配置
          const confCreate = await createDBConfig(cluster,
            values.name, this.state.advanceConfigContent, 'mysql')
          if (confCreate.error) {
            handleError(confCreate.error)
            return
          }
          // 创建集群
          const dbCreate = await createDatabaseCluster(
            cluster,
            yaml.dump(newMySqlClusterData),
            'mysql')
          if (dbCreate.error) {
            handleError(dbCreate.error)
            return
          }
          // 创建成功
          notification.success('创建成功')
          this.props.form.resetFields();
          this.setState({ loading: false })
          if (params.from === 'middleware_center') {
            browserHistory.push({
              pathname: '/middleware_center/deploy',
              state: {
                active: database,
              },
            })
          } else {
            browserHistory.push({
              pathname: `/database_cache/${database}_cluster`,
            })
          }
        }
        createMySql()
      } else if (database === 'redis') {
        const createRedis = async () => {
          const newRedisClusterData = new newRedisCluster(
            values.name,
            replicas,
            lbGroupID,
            this.state.clusterConfig,
            values.storageClass,
            `${values.storageSelect}Mi`,
            namespace,
            values.password,
            this.state.advanceConfigContent.trim()
          )
          const dbCreate = await createDatabaseCluster(cluster, yaml.dump(newRedisClusterData), 'redis')
          if (dbCreate.error) {
            handleError(dbCreate.error)
            return
          }
          // 创建成功
          notification.success('创建成功')
          this.props.form.resetFields();
          this.setState({ loading: false })
          if (params.from === 'middleware_center') {
            browserHistory.push({
              pathname: '/middleware_center/deploy',
              state: {
                active: database,
              },
            })
          } else {
            browserHistory.push({
              pathname: `/database_cache/${database}_cluster`,
            })
          }
        }
        createRedis()
      }
    });
  }
  getDefaultOutClusterValue = () => {
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    let defaultValue
    if (!clusterProxy ||
      !clusterProxy[clusterId] ||
      !clusterProxy[clusterId].data ||
      !clusterProxy[clusterId].data.length) {
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
      !clusterProxy[clusterId] ||
      !clusterProxy[clusterId].data ||
      !clusterProxy[clusterId].data.length) {
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
    const { getClusterStorageList, cluster } = this.props
    return getClusterStorageList(cluster)
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
  // 获取集群配置的值
  recordResouceConfigValue = values => {
    let configData = {}
    // 格式化配置信息
    function formatConfigData(convertedConfig) {
      const configData = {}
      configData.requests = {
        cpu: `${convertedConfig.cpu * 1000}m`,
        memory: `${convertedConfig.memory}Mi`,
      }
      configData.limits = {
        cpu: `${convertedConfig.limitCpu * 1000}m`,
        memory: `${convertedConfig.limitMemory}Mi`,
      }
      return configData
    }
    if (values.maxMemoryValue) {
      const { maxMemoryValue, minMemoryValue, maxCPUValue, minCPUValue } = values
      const convertedConfig = getResourceByMemory('DIY', minMemoryValue, minCPUValue, maxMemoryValue, maxCPUValue)
      configData = formatConfigData(convertedConfig)
    } else {
      const convertedConfig = getResourceByMemory('512')
      configData = formatConfigData(convertedConfig)
    }
    this.setState({
      clusterConfig: configData,
    })
  }
  selectComposeType = type => {
    this.setState({
      composeType: type,
    })
  }
  databaseExists = (rule, value, callback) => {
    // this function for check the new database name is exist or not
    const { checkDbName, cluster } = this.props;
    if (!value) {
      callback();
      return
    }
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
      return callback('名称仅由小写字母、数字和"-"组成，3-60位，且以小写字母开头，字母或数字结尾')
    }

    // if (value.length < 3) {
    //   callback([new Error('集群名称长度不能少于3位')]);
    //   flag = true;
    // }
    // if (value.length > 12) {
    //   callback('集群名称长度不高于12位');
    //   flag = true;
    // }
    const checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
    if (!checkName.test(value)) {
      callback([ new Error('名称仅由小写字母、数字和"-"组成，3-60位，且以小写字母开头，字母或数字结尾') ]);
      flag = true;
    }
    if (!flag) {
      callback();
    }

  }
  // 选出默认存储
  defaultStorage = () => {
    const { storageClassList } = this.props
    const { cephList } = storageClassList
    let defaultStorage = cephList.length > 0 ? cephList[0].metadata.name : ''
    cephList.map(item => {
      if (item.metadata.labels['system/storageDefault'] && item.metadata.labels['system/storageDefault'] === 'true') {
        defaultStorage = item.metadata.name
      }
      return null
    })
    return defaultStorage
  }
  // 选择集群模式
  selectClusterMode = e => {
    this.setState({
      clusterMode: e.target.value,
    })
  }
  render() {
    const { composeType, clusterMode } = this.state
    const { isFetching, billingConfig } = this.props
    const { database } = this.props.routeParams
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.databaseExists },
        { validator: this.dbNameIsLegal },
      ],
    });
    const defaultValue = this.getDefaultOutClusterValue()
    const accessTypeProps = getFieldProps('accessType', {
      initialValue: defaultValue ? 'outcluster' : 'none',
      rules: [{
        required: true,
        message: '请选择集群访问方式',
      }],

    })
    const clusterModeProps = getFieldProps('clusterMode', {
      initialValue: 'single',
      onChange: this.selectClusterMode,
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
      initialValue: 1024,
    });
    const passwdProps = getFieldProps('password', {
      rules: [
        {
          required: this.state.currentType !== 'elasticsearch' && this.state.currentType !== 'etcd',
          whitespace: true,
          message: '请填写密码',
        },
        {
          validator: (rule, value, callback) => {
            const reg = /[@:%\/\s\+]/g
            const regChinese = /[\u4e00-\u9fa5]/g
            if (reg.test(value) || regChinese.test(value)) {
              return callback('由大小写字母、数字或特殊字符组成，不包含 “@”、“:”、“/”、“%”、“+”和空格')
            }
            return callback()
          },
        },
      ],
    });
    const storageNumber = this.state.currentType === 'zookeeper' ? getFieldValue('zkReplicas') : getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    const configParam = database === 'mysql' ? '4x' : '2x'
    const hourPrice = this.props.resourcePrice && parseAmount(
      (strongSize / 1024 * this.props.resourcePrice.storage * storageNumber +
        (storageNumber * this.props.resourcePrice[configParam])) *
      this.props.resourcePrice.dbRatio, 4)
    const countPrice = this.props.resourcePrice && parseAmount(
      (strongSize / 1024 * this.props.resourcePrice.storage * storageNumber +
        (storageNumber * this.props.resourcePrice[configParam])) *
      this.props.resourcePrice.dbRatio * 24 * 30, 4)

    const clusterModeTxt = database === 'mysql' ? '提供高可用，当主节点故障后，备节点自动升级为主节点，包含一个主节点和多个备节点，主备节点的数据通过实时复制保持一致，备节点为只读节点，系统自动进行读请求的负载均衡' :
      '提供高可用，当主节点故障后，备节点自动升级为主节点，包含一个主节点和多个备节点，主备节点的数据通过实时复制保持一致，备节点为只读节点，系统可将所有的读请求分摊到所有备节点'
    return (
      <QueueAnim>
        <div id="MysqlRedisDeploy">
          <Row gutter={24}>
            <Col span={17} className="leftBox">
              <Card>
                <Form horizontal>
                  <div className="infoBox">
                    <div className="commonBox name">
                      <div className="title">
                        <span>集群名称</span>
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
                    {
                      (database === 'mysql' || database === 'redis') &&
                      <div className="commonBox configContent">
                        <div className="title">
                          <span>容器配置</span>
                        </div>
                        <div className="rightConfigBox">
                          <ResourceConfig
                            should4X={database === 'mysql'}
                            toggleComposeType={this.selectComposeType}
                            composeType={composeType}
                            onValueChange={this.recordResouceConfigValue}/>
                        </div>
                      </div>
                    }
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
                                style={{ width: 200 }}
                                {...outClusterProps}
                                placeholder="选择网络出口"
                              >
                                { this.renderSelectOption() }
                              </Select>
                            </FormItem>
                          </div>
                          <div style={{ clear: 'both' }}></div>
                        </div>
                        : null
                    }

                    <div className="commonBox clusterModeBox">
                      <div className="title">
                        <span>集群模式</span>
                      </div>
                      <div className="radioBox">
                        <FormItem>
                          <Radio.Group {...clusterModeProps}>
                            <Radio value="single" key="2">
                              <Tooltip title={clusterModeTxt}>
                                <span>一主多从</span>
                              </Tooltip>
                            </Radio>
                            {
                              database === 'mysql' &&
                              <Radio value="multi" key="1">
                                <Tooltip title="节点均为主节点，不存在Slave延迟，具有读和写的扩展能力"><span>多主</span></Tooltip>
                              </Radio>
                            }
                          </Radio.Group>
                        </FormItem>

                        {
                          clusterMode === 'single' && database !== 'redis'
                            ? <div className="modeTips">使用 Group Replication 的一主多从模式，能更加保证数据的准确性与一致性</div>
                            : ''
                        }
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>

                    <div className="commonBox replications">
                      <div>
                        <div className="title">
                          <span>副本数</span>
                        </div>
                        <div className="inputBox replicas">
                          <FormItem style={{ width: '80px', float: 'left' }}>
                            {
                              this.state.currentType === 'zookeeper' ?
                                <InputNumber {...zkReplicasProps} size="large" min={3} max={100} disabled={isFetching} /> :
                                <InputNumber
                                  {...replicasProps}
                                  size="large"
                                  min={3}
                                  max={100}
                                  step={1}
                                  disabled={isFetching}
                                />
                            }
                          </FormItem>
                          <span className="litteColor" style={{ float: 'left', paddingLeft: '15px' }}>个</span>
                          {
                            database === 'mysql' && <span className="mysql_tips">
                              <Icon type="exclamation-circle-o" className="tips_icon"/> 多实例仅支持 InnoDB 引擎
                            </span>
                          }
                        </div>
                        <div style={{ clear: 'both' }}></div>
                      </div>
                      <div className="desc">
                        <span>每个副本占用的cpu、内存等资源也将在计算资源配额中统计</span>
                      </div>

                    </div>

                    <div className="commonBox storage" style={{ marginBottom: '4px' }}>
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
                            min={1024}
                            max={1024000}
                            defaultValue={1024}
                            step={1024}
                            disabled={isFetching}
                          />
                        </FormItem>
                        MB
                      </div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    {this.state.currentType === 'elasticsearch' || this.state.currentType === 'etcd' ? null :
                      <div className="commonBox pwd">
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
                    {
                      (database === 'mysql' || database === 'redis') &&
                      <div className="commonBox advanceConfig">
                        <div className="line"></div>
                        <div className="top" style={{ color: this.state.showAdvanceConfig ? '#2DB7F5' : '#666' }} onClick={() => this.setState({ showAdvanceConfig: !this.state.showAdvanceConfig })}>
                          <Icon type={this.state.showAdvanceConfig ? 'minus-square' : 'plus-square'} />
                          高级配置
                        </div>
                        {
                          this.state.showAdvanceConfig &&
                          <div>
                            <div className="configTitle">配置管理</div>
                            <div className="configItem">
                              <div className="title">配置文件</div>
                              <div>{this.state.file}</div>
                            </div>
                            <div className="configItem">
                              <div className="title">挂载目录</div>
                              <div>{this.state.path}</div>
                            </div>
                            <div className="configItem content">
                              <div className="title">内容</div>
                              <div className="content">
                                <Input type="textarea" rows={6} value={this.state.advanceConfigContent} onChange={e => {
                                  this.setState({
                                    advanceConfigContent: e.target.value,
                                  })
                                }}/>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <div className="btnBox">
                    <Button size="large" onClick={this.handleReset}>
                      取消
                    </Button>
                    <Tooltip title={this.state.pluginMsg}>
                      <Button
                        size="large"
                        type="primary"
                        disabled={this.state.pluginMsg}
                        loading={this.state.loading}
                        onClick={this.handleSubmit}
                      >
                        创建
                      </Button>
                    </Tooltip>
                  </div>
                </Form>
              </Card>
            </Col>
            {
              billingConfig.enabled &&
              <Col span={7}>
                <Card>
                  <div className="modal-price">
                    <div className="price-top">
                      <div className="keys">实例：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice[configParam] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                      <div className="keys">存储：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                    </div>
                    <div className="price-unit">
                      <div className="price-unit-inner">
                        <p>合计：<span className="unit">{countPrice && countPrice.unit === '￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice && hourPrice.amount }{countPrice && countPrice.unit === '￥' ? '' : ' T'}/小时</span></p>
                        <p className="unit">（约：{ countPrice && countPrice.fullAmount }/月）</p>
                      </div>
                    </div>
                  </div>
                </Card>

              </Col>
            }
          </Row>

        </div>
      </QueueAnim>
    )
  }

}

function mapStateToProps(state) {
  const { cluster, space } = state.entities.current
  const { billingConfig, namespace } = state.entities.loginUser.info
  const { clusterStorage } = state.cluster
  const defaultDbNames = {
    isFetching: false,
    cluster: cluster.clusterID,
  }

  const { databaseAllNames } = state.databaseCache
  const { isFetching } = databaseAllNames.DbClusters || defaultDbNames
  const { current } = state.entities
  const { projectList, projectVisibleClusters } = state.projectAuthority
  const clusterProxy = state.cluster.proxy.result || {}
  let projects = projectList.data || []
  projects = ([ MY_SPACE ]).concat(projects)
  let defaultStorageClassList = {
    isFetching: false,
    cephList: [],
  }
  if (clusterStorage[cluster.clusterID]) {
    defaultStorageClassList = clusterStorage[cluster.clusterID]
  }
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    namespace,
    space,
    current,
    isFetching,
    clusterProxy,
    billingConfig,
    projects,
    projectVisibleClusters,
    resourcePrice: cluster.resourcePrice, // storage
    storageClassList: defaultStorageClassList,
  }

}

MysqlRedisDeploy.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbCluster: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, {
  CreateDbCluster: databaseCacheActions.CreateDbCluster,
  setCurrent,
  createDBConfig: databaseCacheActions.createDBConfig, // 创建mysql集群配置
  getConfigDefault: databaseCacheActions.getConfigDefault, // 获取redis默认配置
  createDatabaseCluster: databaseCacheActions.createDatabaseCluster, // 创建集群
  getProjectVisibleClusters: projectActions.getProjectVisibleClusters,
  ListProjects: projectActions.ListProjects,
  getClusterStorageList: clusterActions.getClusterStorageList,
  createDBClusterPwd: databaseCacheActions.createDBClusterPwd, // 创建密码
  checkDbName: databaseCacheActions.checkDbName, // 检查集群名是否存在
  loadDbCacheList: databaseCacheActions.loadDbCacheList,
  getProxy: clusterActions.getProxy,
})(createForm()(MysqlRedisDeploy))
