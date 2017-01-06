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
import { Button, Icon, Spin, Modal, Collapse, Row, Col, Dropdown, Slider, Timeline, Popover, InputNumber, Tabs, Tooltip} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbClusterDetail, deleteDatabaseCluster, putDbClusterDetail, loadDbCacheList } from '../../actions/database_cache'
import './style/ModalDetail.less'
import AppServiceEvent from '../AppModule/AppServiceDetail/AppServiceEvent'
import { calcuDate, parseAmount} from '../../common/tools.js'
import NotificationHandler from '../../common/notification_handler'
import serverSVG from '../../assets/img/server.svg'
import { ANNOTATION_SVC_SCHEMA_PORTNAME } from '../../../constants'

const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;

class VolumeHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { data } = this.props
    return (
      <Row>
        <Col className="group-name textoverflow" span="8">
          <Icon type="folder-open" />
          <Icon type="folder" />
          <Link to={`/app_manage/container/` + data.objectMeta.name}>{data.objectMeta.name}</Link>
        </Col>
        <Col span="6">
          <div className={data.podPhase}>
            <i className="fa fa-circle"></i> &nbsp;
          {data.podPhase}
          </div>
        </Col>
        <Col span="10">
          创建时间&nbsp;&nbsp;{calcuDate(data.objectMeta.creationTimestamp)}
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
    const volumes = this.props.volumes.podSpec.volumes
    const containers = this.props.volumes.podSpec.containers[0]
    if (!volumes) {
      return (
        <div></div>
      )
    }
    const configFileItem = volumes.map(list => {
      if (list.name === 'datadir') {
        return list.persistentVolumeClaim.claimName
      }
    })
    const volumeMounts = containers.volumeMounts.map(list => {
      if (list.name === 'datadir') {
        return list.mountPath
      }
    })

    return (
      <Row className='file-list'>
        <Timeline>
          <Timeline.Item key={configFileItem}>
            <Row className='file-item'>
              <div className='line'></div>
              <table>
                <tbody>
                  <tr>
                    <td style={{ padding: '15px' }}>
                      <div style={{ width: '100px' }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{configFileItem}</div>
                    </td>

                    <td style={{ width: '130px', textAlign: 'center' }}>
                      <div className='li'>关联容器</div>
                      <div className='lis'>挂载路径</div>
                    </td>
                    <td>
                      <div className="li"><Link to={`/app_manage/container/` + this.props.volumes.objectMeta.name}>{this.props.volumes.objectMeta.name}</Link></div>
                      <div className='lis'>{volumeMounts}</div>
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
      storageValue: parseInt(this.props.databaseInfo.volumeInfo.size)
    }
  }
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("databaseCodeInput");
    code[0].select();
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
  render() {
    const { domainSuffix, databaseInfo ,dbName } = this.props
    const parentScope = this.props.scope
    const rootScope = parentScope.props.scope
    const podSpec = databaseInfo.podList.pods[0].podSpec
    let storagePrc = parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice['2x'] * parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc ), 4)
    const countPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc) * 24 * 30 , 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)
    let domain = ''
    if (domainSuffix) {
      domain = eval(domainSuffix)[0]
    }
    let portAnnotation = databaseInfo.serviceInfo.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]
    let externalPort = ''
    if (portAnnotation) {
      externalPort = portAnnotation.split('/')
      if (externalPort && externalPort.length > 1) {
        externalPort = externalPort[2]
      }
    }
    const modalContent = (
      <div className="modal-content">
        <div className="modal-header">更改实例数  <Icon type='cross' onClick={() => parentScope.colseModal()} className='cursor' style={{ float: 'right' }} /></div>
        <div className="modal-li padTop"><span className="spanLeft">服务名称</span><span>{dbName}</span></div>
        <div className="modal-li"><span className="spanLeft">实例副本</span><InputNumber  onChange={(e) => parentScope.setState({ replicas: e })} value={parentScope.state.replicas} min={1} max={5} /> &nbsp; 个</div>
        <div className="modal-li">
          <span className="spanLeft">存储大小</span>
          {/* <Slider min={500} max={10000} onChange={(value)=>parentScope.onChangeStorage(value)} value={parentScope.state.storageValue} step={100} /> */}
          <InputNumber min={512} step={512} max={20480} disabled={true} value={parentScope.state.storageValue} /> &nbsp; M
        </div>
        <div className="modal-price">
          <div className="price-left">
            <div className="keys">实例：<span className="unit">￥{ containerPrc.amount } </span>/（个*小时）* { parentScope.state.replicas } 个</div>
            <div className="keys">存储：<span className="unit">￥{ storagePrc.amount } </span>/（GB*小时）* { parentScope.state.replicas } 个</div>
          </div>
          <div className="price-unit">
            <p>合计：
            <span className="unit blod">￥{ hourPrice.amount } 元/小时</span>
            </p>
            <p>
            <span className="unit">（约：￥{ countPrice.amount } 元/月）</span>
            </p>
          </div>
        </div>
        {parentScope.state.putModaling ?
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" loading={true} type="primary">保存</Button></div>
        :
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" type="primary" onClick={() => parentScope.handSave()}>保存</Button></div>
       }
      </div>
    )
    const volumeMount = databaseInfo.podList.pods.map((list, index) => {
      return (
        <Panel header={<VolumeHeader data={list} />} key={'volumeMount-' + index}>
          <VolumeDetail volumes={list} key={'VolumeDetail-' + index} />
        </Panel>
      )
    })
    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          <div className='configHead'>配置信息</div>
          <div className='configList'>
            <span className='listKey'>
              <Icon type='link' />&nbsp;内网地址：
            </span>
            <span className='listLink'>
              {databaseInfo.serviceInfo.name + ':' + databaseInfo.serviceInfo.ports[0].port}
            </span>
          </div>
          <div className='configList'>
            <span className='listKey'>
              <Icon type='link' />&nbsp;出口地址：
            </span>
            <span className='listLink'>
              {externalPort != ''? databaseInfo.serviceInfo.name + '-' + databaseInfo.serviceInfo.namespace + '.' + domain + ':' + externalPort : '-'}
            </span>
            <Tooltip title={this.state.copySuccess ? '复制成功' : '点击复制'}>
              <svg style={{width:'50px', height:'16px',verticalAlign:'middle'}} onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}>
                <use xlinkHref='#appcentercopy' style={{fill: '#2db7f5'}}/>
              </svg>
            </Tooltip>
            <input className="databaseCodeInput" style={{ position: "absolute", opacity: "0" }} defaultValue= {externalPort != ''? databaseInfo.serviceInfo.name + '-' + databaseInfo.serviceInfo.namespace + '.' + domain + ':' + externalPort : '-'}/>
          </div>
          <div className='configList'><span className='listKey'>副本数：</span>{databaseInfo.podInfo.pending + databaseInfo.podInfo.running}/{databaseInfo.podInfo.desired}个</div>
          {this.props.database == 'mysql' ?
            <div><div className='configHead'>参数</div>
              <ul className='parse-list'>
                <li><span className='key'>参数名</span> <span className='value'>参数值</span></li>
                <li><span className='key'>用户名：</span> <span className='value'>root</span></li>
                {this.state.passShow ?
                  <li><span className='key'>密码：</span> <span className='value'>{podSpec.containers[0].env ? podSpec.containers[0].env[0].value : ''}</span><span className="pasBtn" onClick={() => this.setState({ passShow: false })}><i className="fa fa-eye-slash"></i> 隐藏</span></li>
                  :
                  <li><span className='key'>密码：</span> <span className='value'>******</span><span className="pasBtn" onClick={() => this.setState({ passShow: true })}><i className="fa fa-eye"></i> 显示</span></li>
                }
              </ul>
            </div>
            : null
          }
          <div className='configHead'>实例副本 <span>{databaseInfo.podInfo.desired}个 &nbsp;</span>
            <Popover content={modalContent} title={null} trigger="click" overlayClassName="putmodalPopover"
              visible={rootScope.state.putVisible} getTooltipContainer={()=> document.getElementById('AppServiceDetail')}
              >
              <Button type="primary" size="large" onClick={() => parentScope.props.scope.putModal()}>更改实例数</Button>
            </Popover>

          </div>
          <Collapse accordion>
            {volumeMount}
          </Collapse>

          <div className='configHead'>租赁信息</div>
          <div className="containerPrc">
            <p><Icon type="pay-circle-o" /> 实例：<span className="unit">￥{ containerPrc.amount }/（个*小时）</span> * {databaseInfo.podInfo.desired}个</p>
            <p><Icon type="hdd" /> 存储：<span className="unit">￥{ storagePrc.amount }/（GB*小时）</span> * {databaseInfo.podInfo.desired}个</p>
          </div>
          <div className="countPrice">
            合计价格：<span className="unit">￥</span><span className="unit blod">{hourPrice.amount}元/小时</span> <span className="unit" style={{marginLeft:'10px'}}>（约：￥{countPrice.amount}元/月）</span>
          </div>
        </div>

      </div>
    )
  }
}

class ModalDetail extends Component {
  constructor() {
    super()
    this.deleteDatebaseCluster = this.deleteDatebaseCluster.bind(this)
    this.state = {
      currentDatabase: null,
      activeTabKey:'#BaseInfo',
      putModaling: false
    }
  }
  deleteDatebaseCluster(dbName) {
    //this function for use delete the database
    const { deleteDatabaseCluster, cluster, scope, database } = this.props;
    const { loadDbClusterDetail } = scope.props;
    const _this = this
    const clusterTypes = scope.state.clusterTypes
    confirm({
      title: '您是否确认要删除 ' + dbName,
      onOk() {
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
      },
      onCancel() { },
    });
  }

  componentWillMount() {
    const { loadDbClusterDetail, cluster, dbName } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, {
      success: {
        func: (res) => {
          _this.setState({
            replicas: res.database.podInfo.desired,
            storageValue: parseInt(res.database.volumeInfo.size)
          })
        }
      }
    });
  }
  
  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const { loadDbClusterDetail, cluster, dbName } = nextProps;
    const _this = this
    if (dbName != this.state.currentDatabase) {
      this.setState({
        currentDatabase: dbName,
        deleteBtn: false
      })
      loadDbClusterDetail(cluster, nextProps.dbName, {
        success: {
          func: (res) => {
            _this.setState({ replicas: res.database.podInfo.desired })
          }
        }
      });
    }
  }
  refurbishDetail() {
    const { loadDbClusterDetail, cluster, dbName } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, {
      success: {
        func: (res) => {
          _this.setState({ replicas: res.database.podInfo.desired })
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
    const {putDbClusterDetail, cluster, dbName, loadDbCacheList} = this.props
    const parentScope = this.props.scope
    const _this = this
    const notification = new NotificationHandler()
    this.putModal()
    this.setState({putModaling: true})
    putDbClusterDetail(cluster, dbName, this.state.replicas, {
      success: {
        func: (res) => {
          notification.success('更新成功')
          parentScope.setState({ detailModal: false })
          _this.setState({putModaling: false})
          loadDbCacheList(cluster, this.props.database)
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
  colseModal() {
    const storageValue = parseInt(this.props.databaseInfo.volumeInfo.size)
    this.putModal()
    this.setState({
      putModaling:false,
      replicas: this.props.databaseInfo.podInfo.desired,
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
  render() {
    const { scope, dbName, isFetching, databaseInfo, domainSuffix } = this.props;

    if (isFetching || databaseInfo == null) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='titleBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false }) } } />
          <div className='imgBox'>
            <img src={serverSVG} />
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {databaseInfo.serviceInfo.name}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">{databaseInfo.serviceInfo.name}/{databaseInfo.serviceInfo.namespace}</div>
              <div> 状态：
                {databaseInfo.podInfo.running >0 ?
                  <span className="normal" style={{top:'0'}}> <i className="fa fa-circle"></i> 运行 </span>
                  :null
                }
                {databaseInfo.podInfo.pending >0 ?
                  <span className="stop" style={{top:'0'}}> <i className="fa fa-circle"></i> 停止 </span>
                  :null
                }
                {databaseInfo.podInfo.failed >0 ?
                  <span className="error" style={{top:'0'}}> <i className="fa fa-circle"></i> 失败 </span>
                  :null
                }
              </div>

            </div>
            <div className='rightBox'>
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
                  <Button size='large' className='btn-danger' type='ghost' onClick={this.deleteDatebaseCluster.bind(this, dbName)}>
                    <Icon type='delete' />删除集群
                </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>

        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left'
              onTabClick={(e)=> this.onTabClick(e)}
              activeKey={this.state.activeTabKey}
              >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <BaseInfo domainSuffix={domainSuffix} databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
              </TabPane>
              <TabPane tab='事件' key='#events'>
                <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
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
    databaseInfo: databaseInfo,
    resourcePrice: cluster.resourcePrice //storage
    // podSpec: databaseInfo.pods[0].podSpec
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
  parseAmount
})(ModalDetail)