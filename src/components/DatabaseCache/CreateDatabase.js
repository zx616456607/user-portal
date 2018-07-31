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
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Input, Select, InputNumber, Button, Form, Icon, Row, Col, Radio, Spin } from 'antd'
import { CreateDbCluster } from '../../actions/database_cache'
import newMySqlCluster from '../../../kubernetes/objects/newMysqlCluster'
import newRedisCluster from '../../../kubernetes/objects/newRedisCluster'
import yaml from 'js-yaml'
import { setCurrent } from '../../actions/entities'
import { getProjectVisibleClusters, ListProjects } from '../../actions/project'
import { getClusterStorageList } from '../../actions/cluster'
import { getConfigDefault, createMySqlClusterPwd, createMySqlConfig, createDatabaseCluster, checkDbName } from '../../actions/database_cache'
import NotificationHandler from '../../components/Notification'
import ResourceConfig from '../../../client/components/ResourceConfig'
import {ASYNC_VALIDATOR_TIMEOUT, MY_SPACE} from '../../constants'
import { parseAmount, getResourceByMemory } from '../../common/tools.js'
import { validateK8sResourceForServiceName } from '../../common/naming_validation'
import './style/CreateDatabase.less'
import { camelize } from 'humps'
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;


let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      currentType: this.props.database,
      showPwd: 'text',
      firstFocues: true,
      onselectCluster: true,
      composeType: 512,
      advanceConfigContent: "log-bin = mysql-bin",
      showAdvanceConfig: false,
      clusterConfig: {},
      path: '/etc/redis',
      file: 'redis.conf'
    }
  },
  componentWillMount() {
    const { ListProjects, cluster, database, getConfigDefault } = this.props
    if(database === 'mysql') {
      this.setState({
        path:'/etc/mysql',
        file: 'mysql.conf'
      })
    }
    getConfigDefault(cluster, database, {
      success: {
        func: res => {
          this.setState({
            advanceConfigContent: res.data.config
          })
        }
      }
    })
    ListProjects({ size: 0 })
    this.loadStorageClassList()
    // 初始给集群配置赋值
    function formatConfigData(convertedConfig) {
      const configData = {}
      configData.limits = {
        cpu: `${convertedConfig.cpu * 1000}m`,
        memory: `${convertedConfig.memory}Mi`,
      }
      configData.requests = {
        cpu: `${convertedConfig.limitCpu * 1000}m`,
        memory:`${convertedConfig.limitMemory}Mi`,
      }
      return configData
    }
    const convertedConfig = getResourceByMemory('512')
    this.setState({
      clusterConfig: formatConfigData(convertedConfig)
    })
  },
  componentWillReceiveProps(nextProps) {
    // if create box close return default select cluster
    if (this.props !== nextProps) {
      if(!nextProps.scope.state.CreateDatabaseModalShow) {
        this.setState({onselectCluster: true, loading: false})
      }
      this.setState({
        currentType: nextProps.database,
      })
      if(this.props.visible !== nextProps.visible && nextProps.visible){
        this.loadStorageClassList()
      }
    }
  },
  onChangeCluster(clusterID) {
    this.setState({onselectCluster: false})
    const { projectVisibleClusters, form, space, setCurrent } = this.props
    const currentNamespace = form.getFieldValue('namespaceSelect') || space.namespace
    const projectClusters = projectVisibleClusters[currentNamespace] && projectVisibleClusters[currentNamespace].data || []
    projectClusters.every(cluster => {
      if (cluster.clusterID == clusterID) {
        setCurrent({
          cluster,
        })
        return false
      }
      return true
    })
  },
  selectDatabaseType(database) {
    //this funciton for user select different database
    this.setState({
      currentType: database
    });
    document.getElementById('name').focus()
  },
  onChangeNamespace(namespace) {
    //this function for user change the namespace
    //when the namespace is changed, the function would be get all clusters of new namespace
    const { projects, getProjectVisibleClusters, setCurrent, form } = this.props
    projects.every(space => {
      if (space.namespace == namespace) {
        setCurrent({
          space,
          team: {
            teamID: space.teamID
          }
        })
        getProjectVisibleClusters(namespace, {
          success: {
            func: (result) => {
              const { clusters } = result.data
              if(clusters.length > 0) {
                form.setFieldsValue({
                  'clusterSelect': clusters[0].clusterID
                })
              } else {
                form.setFieldsValue({'clusterSelect':''})
              }
            },
            isAsync: true
          }
        })
        return false
      }
      return true
    })
  },

  checkPwd: function () {
    //this function for user change the password box input type
    //when the type is password and change to the text, user could see the password
    //when the type is text and change to the password, user couldn't see the password
    if (this.state.showPwd == 'password') {
      this.setState({
        showPwd: 'text'
      });
    } else {
      this.setState({
        showPwd: 'password'
      });
    }
  },
  setPsswordType() {
    if (this.state.firstFocues) {
      this.setState({
        showPwd: 'password',
        firstFocues: false
      });

    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    e.preventDefault();
    const _this = this;
    const { scope,
      projects,
      projectVisibleClusters,
      form,
      setCurrent,
      space,
      cluster,
      createMySqlClusterPwd,
      createDatabaseCluster,
      createMySqlConfig,
      namespace,
      database,
    } = this.props;
    const { loadDbCacheList } = scope.props;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      _this.setState({loading: true})
      let templateId
      this.props.dbservice.map(item => {
        if (item.category === _this.state.currentType) {
          return templateId = item.id
        }
      })
      if (this.state.onselectCluster) {
        values.clusterSelect = this.props.cluster
      }
      let notification = new NotificationHandler()
      if (values.replicas > 100) {
        notification.info('副本数不能大于 100')
        _this.setState({loading: false})
        return
      }
      let newSpace, newCluster
      projects.map(list => {
        if (list.namespace === values.namespaceSelect) {
          return newSpace = list
        }
      })
      const currentNamespace = form.getFieldValue('namespaceSelect') || space.namespace
      const projectClusters = projectVisibleClusters[currentNamespace] && projectVisibleClusters[currentNamespace].data || []
      projectClusters.map(list => {
        if (list.clusterID === values.clusterSelect) {
          return newCluster = list
        }
      })
      let externalIP = ''
      if (newCluster.publicIPs && newCluster.publicIPs != "") {
        let ips = eval(newCluster.publicIPs)
        if (ips && ips.length > 0) {
          externalIP = ips[0]
        }
      }
      let lbGroupID = 'none'
      if(values.outerCluster){
        lbGroupID = values.outerCluster
      }
      const replicas = this.state.currentType == 'zookeeper' ? values.zkReplicas : values.replicas
      // 错误处理
      const handleError = error => {
        if (error.message.message && error.message.message.indexOf('already exists') > 0) {
          notification.warn('集群名已经存在')
          this.setState({loading: false})
        }else {
          notification.warn(error.message)
          this.setState({loading: false})
        }
      }
      if(database === 'mysql') {
        const createMySql = async () => {
          const newMySqlClusterData = new newMySqlCluster(
            values.name,
            replicas,
            lbGroupID,
            this.state.clusterConfig,
            values.storageClass,
            `${values.storageSelect}Mi`
          )

          // 创建密码
          const pwdCreate = await createMySqlClusterPwd(cluster, values.name, values.password)
          if(pwdCreate.error) {
            handleError(pwdCreate.error)
            return
          }
          // 创建配置
          const confCreate = await createMySqlConfig(cluster, values.name, this.state.advanceConfigContent)
          if(confCreate.error) {
            handleError(confCreate.error)
            return
          }
          // 创建集群
          const dbCreate = await createDatabaseCluster(cluster, yaml.dump(newMySqlClusterData), 'mysql')
          if(dbCreate.error) {
            handleError(dbCreate.error)
            return
          }
          // 创建成功
          notification.success('创建成功')
          setCurrent({
            cluster: newCluster,
            space: newSpace
          })
          this.props.form.resetFields();
          scope.setState({
            CreateDatabaseModalShow: false
          }, () => {
            loadDbCacheList(cluster, 'mysql')
          });
        }
        createMySql()
      }else if(database === 'redis') {
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
          if(dbCreate.error) {
            handleError(dbCreate.error)
            return
          }
          // 创建成功
          notification.success('创建成功')
          setCurrent({
            cluster: newCluster,
            space: newSpace
          })
          this.props.form.resetFields();
          scope.setState({
            CreateDatabaseModalShow: false
          }, () => {
            loadDbCacheList(cluster, 'redis')
          });
        }
        createRedis()
      }

    });
  },
  getDefaultOutClusterValue(){
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    let defaultValue = undefined
    if(!clusterProxy || !clusterProxy[clusterId] || !clusterProxy[clusterId].data || !clusterProxy[clusterId].data.length){
      return defaultValue
    }
    clusterProxy[clusterId].data.forEach( item => {
      if(item.isDefault){
        defaultValue = item.id
      }
    })
    return defaultValue
  },
  renderSelectOption(){
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    if(!clusterProxy || !clusterProxy[clusterId] || !clusterProxy[clusterId].data || !clusterProxy[clusterId].data.length){
      return <Option value="none" key="none" disabled>暂无可用网络出口</Option>
    }
    return clusterProxy[clusterId].data.map((item, index) => {
      let name = '公网'
      if(item.type == 'private'){
        name = '内网'
      }
      return <Option value={item.id} key={item.address + index}>{name}: {item.name}</Option>
    })
  },
  loadStorageClassList(){
    const { getClusterStorageList, cluster } = this.props
    getClusterStorageList(cluster)
  },
  renderStorageClassListOption(){
    const { storageClassList } = this.props
    const { isFetching, cephList } = storageClassList
    let option = [<Option
      value='loading'
      key='loading'
      style={{textAlign: 'center'}}
      disabled
    >
      <Spin />
    </Option>]
    if(!isFetching){
      option = cephList.map((item, index) => {
        let name = item.metadata.annotations[`tenxcloud.com/scName`] || item.metadata.name
        return <Option key={`list${index}`} value={item.metadata.name}>{name}</Option>
      })
    }
    return option
  },

  //获取集群配置的值
  recordResouceConfigValue(values) {
    let configData = {}
    //格式化配置信息
    function formatConfigData(convertedConfig) {
      const configData = {}
      configData.requests = {
        cpu: `${convertedConfig.cpu * 1000}m`,
        memory: `${convertedConfig.memory}Mi`,
      }
      configData.limits = {
        cpu: `${convertedConfig.limitCpu * 1000}m`,
        memory:`${convertedConfig.limitMemory}Mi`,
      }
      return configData
    }
    if(values.maxMemoryValue) {
      const { maxMemoryValue, minMemoryValue, maxCPUValue, minCPUValue } = values
      const convertedConfig = getResourceByMemory('DIY', minMemoryValue, minCPUValue, maxMemoryValue, maxCPUValue)
      configData = formatConfigData(convertedConfig)
    }else {
      const convertedConfig = getResourceByMemory('512')
      configData = formatConfigData(convertedConfig)
    }
    this.setState({
      clusterConfig: configData
    })
  },
  selectComposeType(type) {
    this.setState({
      composeType: type,
    })
  },
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not
    const { checkDbName, cluster } = this.props;
    let flag = false;
    if (!Boolean(value)) {
      callback();
      return
    } else {
      setTimeout(() => {
        checkDbName(cluster, value, {
          success: {
            func: (result) => {
              if (result.data) {
                callback([new Error('集群名称已存在')]);
                flag = true
                return
              }
              callback()
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              return callback([new Error('集群名校验失败')])
              flag = true
            },
            isAsync: true
          }
        })
      }, ASYNC_VALIDATOR_TIMEOUT)

    }
  },
  dbNameIsLegal(rule, value, callback) {
    let flag = false;
    if (!validateK8sResourceForServiceName(value)) {
      flag = true
      return callback('名称由3~60 位小写字母、数字、中划线组成')
    }

    // if (value.length < 3) {
    //   callback([new Error('集群名称长度不能少于3位')]);
    //   flag = true;
    // }
    // if (value.length > 12) {
    //   callback('集群名称长度不高于12位');
    //   flag = true;
    // }
    let checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
    if (!checkName.test(value)) {
      callback([new Error('名称仅由小写字母、数字和横线组成，且以小写字母开头')]);
      flag = true;
    }
    if (!flag) {
      callback();
    }

  },

  render() {
    const { composeType } = this.state
    const { isFetching, projects, projectVisibleClusters, space } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue} = this.props.form;
    const currentNamespace = getFieldValue('namespaceSelect') || space.namespace
    const projectClusters = projectVisibleClusters[currentNamespace] && projectVisibleClusters[currentNamespace].data || []
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, whitespace: true ,message:'请输入名称'},
        { validator: this.databaseExists },
        { validator: this.dbNameIsLegal },
      ],
    });
    let defaultValue = this.getDefaultOutClusterValue()
    const accessTypeProps = getFieldProps('accessType',{
      initialValue: defaultValue ? 'outcluster' : 'none',
      rules: [{
        required: true,
        message: '请选择集群访问方式'
      }]
    })
    let accessType = getFieldValue('accessType')
    let outClusterProps
    if(accessType == 'outcluster'){
      outClusterProps = getFieldProps('outerCluster',{
        initialValue: defaultValue,
        rules: [
          { required: true, message: '请选择网络出口' },
        ],
      })
    }
    const replicasProps = getFieldProps('replicas', {
      initialValue: 3
    });
    const storageClassProps = getFieldProps('storageClass', {
      rules: [{required: true, message: '块存储名字不能为空'}]
    })
    const zkReplicasProps = getFieldProps('zkReplicas', {
      initialValue: 3
    });
    const selectStorageProps = getFieldProps('storageSelect', {
      initialValue: 512
    });
    const passwdProps = getFieldProps('password', {
      rules: [
        {
          required: this.state.currentType !== 'elasticsearch' && this.state.currentType !== 'etcd',
          whitespace: true,
          message: '请填写密码'
        },
      ],
    });
    const storageNumber = this.state.currentType === 'zookeeper' ? getFieldValue('zkReplicas') : getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    const teamspaceList = projects.map((list, index) => {
      return (
        <Option key={list.namespace}>{list.name}</Option>
      )
    })
    const clusterList = projectClusters.map(item => {
      return (
        <Option key={item.clusterID}>{item.clusterName}</Option>
      )
    })
    const hourPrice = this.props.resourcePrice && parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio , 4)
    const countPrice = this.props.resourcePrice && parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio * 24 * 30, 4)
    const statefulApps = {
      mysql: 'MySQL',
      redis: 'Redis',
      zookeeper: 'ZooKeeper',
      elasticsearch: 'ElasticSearch',
      etcd: 'Etcd',
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select defaultValue='mysql' value={this.state.currentType} onChange={this.selectDatabaseType}>
        {statefulAppOptions}
      </Select>
    )

    return (
      <QueueAnim>
        <div id='CreateDatabase' key="createDatabase">
          <Form horizontal>
            <div className='infoBox'>
              <div className='commonBox'>
                <div className='title'>
                  <span>名称</span>
                </div>
                <div className='inputBox'>

                  <FormItem
                    hasFeedback
                    help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                  >
                    <Input {...nameProps} size='large' id="name" placeholder="请输入名称" disabled={isFetching} maxLength={20} />
                  </FormItem>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className="commonBox configContent">
                <div className='title'>
                  <span>集群配置</span>
                </div>
                <div className="rightConfigBox">
                  <ResourceConfig
                    toggleComposeType={this.selectComposeType}
                    composeType={composeType}
                    onValueChange={this.recordResouceConfigValue}/>
                </div>
              </div>

              <div className='commonBox accesstype'>
                <div className='title'>
                  <span>集群访问方式</span>
                </div>
                <div className='radioBox'>
                  <FormItem>
                    <Radio.Group {...accessTypeProps}>
                      <Radio value="outcluster" key="2">可集群外访问</Radio>
                      <Radio value="none" key="1">仅在集群内访问</Radio>
                    </Radio.Group>
                  </FormItem>
                  {
                    accessType === 'outcluster'
                      ? <div className='accessTips'>数据库与缓存集群可提供集群外访问</div>
                      : <div className='accessTips'>选择后该数据库与缓存集群仅提供集群内访问</div>
                  }
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              {
                accessType === 'outcluster'
                  ? <div className='commonBox outclusterBox'>
                    <div className='title'></div>
                    <div className='inputBox'>
                      <FormItem>
                        <Select
                          {...outClusterProps}
                          placeholder='选择网络出口'
                        >
                          { this.renderSelectOption() }
                        </Select>
                      </FormItem>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  : null
              }
              <div className='commonBox'>
                <div className='title'>
                  <span>副本数</span>
                </div>
                <div className='inputBox replicas'>
                  <FormItem style={{ width: '80px', float: 'left' }}>
                    {
                      this.state.currentType == 'zookeeper' ?
                        <InputNumber {...zkReplicasProps} size='large' min={3} max={100} disabled={isFetching} /> :
                        <InputNumber {...replicasProps} size='large' min={1} max={100} disabled={isFetching} />
                    }
                  </FormItem>
                  <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>个</span>
                  {
                    this.props.database == 'mysql' && <span className='mysql_tips'>
                      <Icon type="exclamation-circle-o" className='tips_icon'/> 多实例仅支持 InnoDB 引擎
                    </span>
                  }
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className='desc'>
                <span>每个副本占用的cpu、内存等资源也将在计算资源配额中统计</span>
              </div>
              <div className='commonBox' style={{marginBottom: '4px'}}>
                <div className='title'>
                  <span>存储</span>
                </div>
                <div className='inputBox replicas'>
                  <FormItem style={{ width: '200px', float: 'left', marginRight: '12px'}}>
                    <Select
                      placeholder='请选择一个块存储集群'
                      size='large'
                      {...storageClassProps}
                    >
                      { this.renderStorageClassListOption() }
                    </Select>
                  </FormItem>
                  <FormItem style={{ width: '80px', float: 'left', marginRight: '8px' }}>
                    <InputNumber
                      {...selectStorageProps}
                      size='large'
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
                <div className='commonBox'>
                  <div className='title'>
                    <span>密码</span>
                  </div>
                  <div className='inputBox'>
                    <FormItem
                      hasFeedback
                    >
                      <Input {...passwdProps} onFocus={()=> this.setPsswordType()} type={this.state.showPwd} size='large' placeholder="请输入密码" disabled={isFetching} />
                      <i className={this.state.showPwd == 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'} onClick={this.checkPwd}></i>
                    </FormItem>
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>}
              <div className="commonBox advanceConfig">
                <div className="line"></div>
                <div className="top" style={{ color: this.state.showAdvanceConfig? '#2DB7F5' : '#666' }} onClick={() => this.setState({ showAdvanceConfig: !this.state.showAdvanceConfig })}>
                  <Icon type={this.state.showAdvanceConfig? "minus-square" : "plus-square"} />
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
                            advanceConfigContent: e.target.value
                          })
                        }}/>
                      </div>
                    </div>
                  </div>
                }
              </div>
                <div className="modal-price">
                  <div className="price-left">
                    <div className="keys">实例：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                    <div className="keys">存储：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                  </div>
                  <div className="price-unit">
                    <p>合计：<span className="unit">{countPrice && countPrice.unit=='￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice && hourPrice.amount }{countPrice && countPrice.unit=='￥'? '' : ' T'}/小时</span></p>
                    <p className="unit">（约：{ countPrice && countPrice.fullAmount }/月）</p>
                  </div>
                </div>
            </div>
            <div className='btnBox'>
              <Button size='large' onClick={this.handleReset}>
                取消
              </Button>
              {this.state.loading ?
                <Button size='large' type='primary' loading={this.state.loading}>
                  确定
                </Button>
                :
                <Button size='large' type='primary' onClick={this.handleSubmit}>
                  确定
                </Button>
              }
            </div>
          </Form>
        </div>
      </QueueAnim>
    )
  }
});

function mapStateToProps(state, props) {
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
  let projects = projectList.data || []
  projects = ([ MY_SPACE ]).concat(projects)
  let defaultStorageClassList = {
    isFetching: false,
    cephList: []
  }
  if(clusterStorage[cluster.clusterID]){
    defaultStorageClassList = clusterStorage[cluster.clusterID]
  }
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    namespace,
    space,
    current,
    isFetching,
    projects,
    projectVisibleClusters,
    resourcePrice: cluster.resourcePrice, //storage
    storageClassList: defaultStorageClassList,
  }

}

CreateDatabase = createForm()(CreateDatabase);

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbCluster: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired,
  database: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  CreateDbCluster,
  setCurrent,
  createMySqlConfig, //创建mysql集群配置
  getConfigDefault, // 获取redis默认配置
  createDatabaseCluster, // 创建集群
  getProjectVisibleClusters,
  ListProjects,
  getClusterStorageList,
  createMySqlClusterPwd, // 创建密码
  checkDbName, // 检查集群名是否存在
})(CreateDatabase)
