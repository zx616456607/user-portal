/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  RedisDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 * update by Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Switch, Modal, Row, Col, Button, Icon, Input, Spin, Tooltip, InputNumber } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbCacheList ,searchDbservice} from '../../actions/database_cache'
import { loadMyStack } from '../../actions/app_center'
import { getProxy } from '../../actions/cluster'
import { DEFAULT_REGISTRY } from '../../../constants'
import ModalDetail from './ModalDetail.js'
import CreateDatabase from './CreateDatabase.js'
import NotificationHandler from '../../components/Notification'
import { formatDate } from '../../common/tools.js'
// import './style/RedisCluster.less'
import './style/MysqlCluster.less'
import redisImg from '../../assets/img/database_cache/redis.jpg'
import noDbImgs from '../../assets/img/database_cache/no_redis.png'
import Title from '../Title'
import ResourceBanner from '../TenantManage/ResourceBanner/index'
import yaml from "js-yaml";
import { autoBackupSet, autoBackupDetele, checkAutoBackupExist } from '../../../client/actions/backupChain'
import BackupStrategy from '../../../client/containers/DatabaseCache/BackupStrategy'
let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function (database) {
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentData: database,
      currentDatabase: database.objectMeta.name
    })
  },
  //自动备份开关
  autoBackupSwitch: function(checked, item) {
    if(checked) {
      this.props.setAutoBackup(item)
    }
  },
  render: function () {
    const { config, isFetching } = this.props;
    const canCreate = this.props.canCreate
    let title = ''
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!config ||config.length == 0) {
      return (
        <div className="text-center">
          <img src={noDbImgs} />
          <div>还没有 Redis 集群，创建一个！ <Tooltip title={title} placement="right"><Button type="primary" size="large" onClick={()=> this.props.scope.createDatabaseShow()} disabled={!canCreate}>创建集群</Button></Tooltip></div>
        </div>
      )
    }
    const statusText = status => {
      switch(status) {
        case 'Pending':
          return '启动中'
        case 'Success':
          return '启动成功'
        case 'Running':
          return '运行中'
      }
    }
    let items = config.map((item, index) => {
      return (
        <div className='List' key={index}>
          <div className='list-wrap'>
            <div className='detailHead'>
              <img src={redisImg} />
              <div className='detailName'>
                {item.objectMeta.name}
              </div>
              <div className='detailName'>
                <Button type='ghost' size='large' onClick={this.showDetailModal.bind(this, item)}><Icon type='bars' />展开详情</Button>
              </div>
            </div>
            <ul className='detailParse'>
              <li><span className='listKey'>状态</span>
                <span className='normal'>{statusText(item.staus)} </span>
              </li>
              <li><span className='listKey'>副本数</span>{`${item.currentReplicas}/${item.replicas}`}个</li>
              <li>
                <span className='listKey'>创建时间</span>
                <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
              </li>
              <li><span className='listKey'>存储大小</span>{item.storage ? item.storage.replace('Mi','MB').replace('Gi','GB'): '0'}</li>
              <li><span className='listKey'>自动备份</span>
                <Switch checkedChildren="开"
                        onChange={(checked) => this.autoBackupSwitch(checked, item)}
                        unCheckedChildren="关"
                        defaultChecked={this.props.autoBackupList.indexOf(item.objectMeta.uid) >= 0}
                />
              </li>
            </ul>
          </div>
        </div>
      );
    });
    return (
      <div className='layoutBox'>
        {items}
      </div>
    );
  }
});

class RedisDatabase extends Component {
  constructor() {
    super()
    this.createDatabaseShow = this.createDatabaseShow.bind(this);
    this.clusterRefresh = this.clusterRefresh.bind(this);
    this.handSearch = this.handSearch.bind(this);
    this.state = {
      search: '',
      detailModal: false,
      putVisible: false,
      currentDatabase: null,
      CreateDatabaseModalShow: false,
      autoBackupModalShow: false,
      days: [ '0', '1', '2', '3', '4', '5', '6' ],
      daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
      hour: '1',
      minutes: '0',
      currentClusterNeedBackup: '',
      aleradySetAuto: []
    }
  }
  clusterRefresh() {
    const _this = this
    const { loadDbCacheList, cluster } = this.props
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })
    loadDbCacheList(cluster, 'redis', {
      success: {
        func: () => {
          const { search } = this.state
          if (search) {
            return this.handSearch()
          }
        },
        isAsync: true,
      }
    })
  }
  componentWillMount() {
    const { loadDbCacheList, cluster, getProxy, checkAutoBackupExist } = this.props
    if (cluster == undefined) {
      let notification = new NotificationHandler()
      notification.error('请选择集群','invalid cluster ID')
      return
    }
    getProxy(cluster)
    // 获取集群列表
    loadDbCacheList(cluster, 'redis', {
      success: {
        func: res => {
          setTimeout(() => {
            checkAutoBackupExist(cluster, 'redis', {
              success: {
                func: response => {
                  const list = res.databaseList;
                  const alerady = response.database.items //已经设置自动备份的数据、
                  for (const v of alerady) {
                    this.state.aleradySetAuto.push(v.metadata.uid)
                    this.setState()
                  }

                },
              },
              failed: {
                func: () => {
                  notification.warn('检查是否有自动备份失败')
                },
              },
            }) // 检查是否有自动备份
          })
        }
      }
    })
  }
  componentDidMount() {
    const _this = this
    this.props.loadMyStack(DEFAULT_REGISTRY, 'dbservice', {
      success: {
        func: (res) => {
          _this.setState({
            dbservice: res.data.data.templates
          })
        }
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    const { form, current} = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    this.props.loadDbCacheList(current.cluster.clusterID, 'redis')
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.detailModal) {
      this.setState({putVisible: false})
    }
    return nextState
  }
  putModal() {
    this.setState({
      putVisible: !this.state.putVisible
    })
  }
  createDatabaseShow() {
    //this function for user show the modal of create database
    this.setState({
      CreateDatabaseModalShow: true
    });
    setTimeout(function() {
      document.getElementById('dbName').focus()
    }, 100);
  }
  handSearch() {
    const { search } = this.state
    this.props.searchDbservice('redis', search)
  }

  // 自动备份弹窗组件
  autoBackupModal = () => {
    const { currentClusterNeedBackup } = this.state
    const { database, databaseInfo, cluster, autoBackupSet, autoBackupDetele } = this.props
    // 获取选择备份周期
    const selectPeriod = (week, index) => {
      const { days } = this.state
      const localWeeks = JSON.parse(JSON.stringify(days))
      localWeeks[index] = localWeeks[index] ? false : week.en
      // 转换周期格式（仅天）参考格式： http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html
      const newDays = localWeeks.filter(v => !!v)
      if (newDays[0] === '0') {
        newDays.push(newDays.shift())
      }
      this.setState({
        days: localWeeks,
        daysConvert: newDays,
      })

      // console.log(period)
    }
    // 确定
    const handleAutoBackupOk = () => {
      const { hour, minutes, daysConvert } = this.state
      const schedule = `${minutes} ${hour} * * ${daysConvert.join(',').replace(/,/g, ' ')}`
      // 传给后台的yaml文件
      const postData = {
        apiVersion: 'daas.tenxcloud.com/v1',
        kind: 'RedisCronBackup',
        metadata: {
          name: `${currentClusterNeedBackup.objectMeta.name}redis01`,
          namespace: 'admin',
          labels: {
            'tenxcloud.com/cluster': 'redis01',
          },
        },
        spec: {
          schedule,
          cluster: currentClusterNeedBackup.objectMeta.name,
          sourceDirectory: '/redis-master-data/',
          s3SecretName: 's301',
          s3SecretNamespace: 'kube-system',
        },
      }
      // 设置自动备份
      autoBackupSet(cluster, database, yaml.dump(postData), {
        success: {
          func: () => {
            notification.success('设置自动备份成功')
            this.setState({
              autoBackupModalShow: false,
            })

          },
        },
      })
    }

    const statusSwitch = val => {
      if (!val) {
        autoBackupDetele(clusterID, database, databaseInfo.objectMeta.name, {
          success: {
            func: () => {
              notification.warn('关闭自动备份成功')
              this.setState({
                autoBackupSwitch: false,
              })
            },
          },
          failed: {
            func: () => {
              notification.warn('关闭自动备份失败')
            },
          },
        })
        return
      }
      this.setState({
        autoBackupSwitch: true,
      })
      // console.log(val)
    }
    // 获取小时
    const hour = h => {
      this.setState({ hour: `${h}` })
      // console.log(time)
    }
    // 获取分钟
    const minutes = m => {
      this.setState({ minutes: `${m}` })
      // console.log(time)
    }
    return <Modal
      visible={this.state.autoBackupModalShow}
      title="设置自动备份"
      onOk={handleAutoBackupOk}
      onCancel={() => this.setState({
        autoBackupModalShow: false,
      })}
      width={650}
    >
      <div className="autoContent">
        <Row className="item">
          <Col span={4} className="title">备份集群</Col>
          <Col span={19} push={1}>123</Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">状态</Col>
          <Col span={19} push={1}>
            <Switch checkedChildren="开" onChange={statusSwitch} unCheckedChildren="关" checked={this.state.autoBackupSwitch} />
          </Col>
        </Row>

          <div>
            <Row className="item">
              <Col span={4} className="title">备份周期</Col>
              <Col span={19} push={1}>
                <BackupStrategy weeksSelected={this.state.days} setPeriod={selectPeriod}/>
              </Col>
            </Row>
            <Row className="item">
              <Col span={4} className="title">备份时间</Col>
              <Col span={19} push={1}>
                <div>
                  <InputNumber min={0} max={24} defaultValue={1} onChange={hour} />
                  <span className="text">时</span>
                  <InputNumber min={0} max={60} defaultValue={0} onChange={minutes} />
                  <span className="text">分</span>
                </div>
              </Col>
            </Row>
          </div>
      </div>
    </Modal>
  }

  onAutoBackup = item => {
    this.setState({
      autoBackupModalShow: true,
      currentClusterNeedBackup: item,
    })
  }

  render() {
    const _this = this;
    const { isFetching, databaseList, clusterProxy, storageClassType } = this.props;
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    const currentCluster = this.props.current.cluster
    let canCreate = true
    if (!storageClassType.private) canCreate = false
    if(!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    return (
      <QueueAnim id='mysqlDatabase' type='right'>
        <div className='databaseCol' key='RedisDatabase'>
          <Title title="Redis" />
          <div className='databaseHead'>
          <ResourceBanner resourceType='redis'/>
            { mode === standard ? <div className='alertRow'>您的 Redis 集群创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充值，继续使用。如无充值，1 周后资源会被彻底销毁，不可恢复。</div> : <div></div>}
            <Tooltip title={title} placement="right"><Button type='primary' size='large' onClick={this.createDatabaseShow} disabled={!canCreate}>
              <i className='fa fa-plus' />&nbsp;Redis集群
          </Button></Tooltip>
            <Button className="button_refresh" size='large' onClick={this.clusterRefresh} disabled={!canCreate}>
              <i className='fa fa-refresh' />&nbsp;刷 新
            </Button>
            <span className='rightSearch'>
              <Input size='large' placeholder='搜索' style={{ width: '180px', paddingRight:'28px' }} ref="redisRef" onChange={(e)=>this.setState({search: e.target.value.trim()})} onPressEnter={(e)=> this.handSearch(e)}/>
              <i className="fa fa-search cursor" onClick={()=> this.handSearch()} />
            </span>
          </div>
          <MyComponent scope={_this} isFetching={isFetching} setAutoBackup={this.onAutoBackup} autoBackupList = {this.state.aleradySetAuto} config={databaseList} canCreate={canCreate}/>
        </div>
        <Modal visible={this.state.detailModal}
          className='AppServiceDetail' transitionName='move-right'
          onCancel={() => { this.setState({ detailModal: false }) } }
          >
          <ModalDetail scope={_this} putVisible={ _this.state.putVisible } database={this.props.database} currentData={this.state.currentData} dbName={this.state.currentDatabase} />
        </Modal>
        <Modal visible={this.state.CreateDatabaseModalShow}
          className='CreateDatabaseModal' maskClosable={false}
          title='创建Redis集群' width={600}
          onCancel={() => { this.setState({ CreateDatabaseModalShow: false }) } }
          >
          <CreateDatabase scope={_this} dbservice={this.state.dbservice} database={'redis'} clusterProxy={clusterProxy} visible={this.state.CreateDatabaseModalShow}/>
        </Modal>
        { this.autoBackupModal() }
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultRedisList = {
    isFetching: false,
    cluster: cluster.clusterID,
    database: 'redis',
    databaseList: []
  }

  const { databaseAllList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllList.redis || defaultRedisList
  const { current } = state.entities
  let clusterProxy = state.cluster.proxy.result || {}
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false
  }
  if(cluster.storageClassType){
    defaultStorageClassType = cluster.storageClassType
  }
  return {
    cluster: cluster.clusterID,
    // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',// @todo default
    current,
    database,
    databaseList: databaseList,
    isFetching,
    clusterProxy,
    storageClassType: defaultStorageClassType
  }
}

RedisDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbCacheList: PropTypes.func.isRequired,
  loadMyStack: PropTypes.func.isRequired
}

RedisDatabase = injectIntl(RedisDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbCacheList,
  loadMyStack,
  searchDbservice,
  getProxy,
  autoBackupSet,
  autoBackupDetele,
  checkAutoBackupExist,
})(RedisDatabase)
