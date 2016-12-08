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
import { Button, Icon, Spin, Modal ,message ,Collapse ,Row, Col, Dropdown ,Timeline } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbClusterDetail, deleteDatabaseCluster } from '../../actions/database_cache'
import './style/ModalDetail.less'
import { formatDate } from '../../common/tools.js'
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const confirm = Modal.confirm;

class VolumeHeader extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    const { data }= this.props
    return (
      <Row>
        <Col className="group-name textoverflow" span="8">
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{data.objectMeta.name}</span>
        </Col>
        <Col span="8">
          <div className={data.podPhase}>
         <i className="fa fa-circle"></i> &nbsp;
          {data.podPhase}
          </div>
        </Col>
        <Col span="8">
          创建时间&nbsp;&nbsp;{formatDate(data.objectMeta.creationTimestamp)}
        </Col>
      </Row>
    )
  }
}

class VolumeDetail extends Component {
  constructor(props) {
    super(props)
  }
  render () {
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
                      <div style={{ width: '160px' }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{configFileItem}</div>
                    </td>
                  
                    <td style={{ width: '130px',textAlign:'center'}}>
                      <div className='li'>关联容器</div>
                      <div className='lis'>挂载路径</div>
                    </td>
                    <td>
                      <div className="li"><Link to={`/app_manage/container/`+ containers.name}>{containers.name}</Link></div>
                      <div className='lis'>{ volumeMounts }</div>
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

class ModalDetail extends Component {
  constructor() {
    super()
    this.deleteDatebaseCluster = this.deleteDatebaseCluster.bind(this)
    this.state = {
      currentDatabase: null
    }
  }

  deleteDatebaseCluster(dbName) {
    //this function for use delete the database
    const { deleteDatabaseCluster, cluster, scope,database } = this.props;
    const { loadDbClusterDetail } = scope.props;
    const _this = this
    const clusterTypes = scope.state.clusterTypes
    confirm({
      title: '您是否确认要删除 ' + dbName,
      onOk() {
        _this.setState({deleteBtn: true})
        deleteDatabaseCluster(cluster, dbName, database ,{
          success:{
            func: () => {
              message.success('删除成功')
              scope.setState({
                detailModal: false
              });
            }
          },
          failed: {
            func: (res) =>{
              message.error('删除失败',res.message.message)
            }
          }
        });
      },
      onCancel() { },
    });
  }

  componentWillMount() {
    const { loadDbClusterDetail, cluster, dbName } = this.props
    this.setState({
      currentDatabase: dbName
    });
    loadDbClusterDetail(cluster, dbName);
  }

  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const { loadDbClusterDetail, cluster, dbName } = nextProps;
    if (dbName != this.state.currentDatabase) {
      this.setState({
        currentDatabase: dbName,
        deleteBtn: false
      })
      loadDbClusterDetail(cluster, nextProps.dbName);
    }
  }

  render() {
    const { scope, dbName, isFetching, databaseInfo } = this.props;
    if (isFetching || databaseInfo == null) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const podSpec = databaseInfo.podList.pods[0].podSpec

    const volumeMount= databaseInfo.podList.pods.map((list, index) => {
      return (
        <Panel header={<VolumeHeader data={list} />} key={'volumeMount-'+index}>
          <VolumeDetail volumes={list} key={'VolumeDetail-' + index} />
        </Panel>
      )
    })
    return (
      <div id='databaseDetail'>
        <div className='modalWrap'>
          <div className='modalHead'>
            <img className='detailImg' src='/img/test/mysql.jpg' />
            <ul className='detailTitle'>
              <li>
                <div className='name'>{databaseInfo.serviceInfo.name}</div>
              </li>
              <li>
                <div className='desc'>
                  {databaseInfo.serviceInfo.name}/{databaseInfo.serviceInfo.namespace}
                </div>
              </li>
              <li>
                <span>状态：</span><span className='normal'>运行中</span>
              </li>
            </ul>
            <div className='danger'>
              <Icon type='cross' className='cursor' onClick={() => { scope.setState({ detailModal: false }) } } />
              <div className='li'>
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
          <div className='modalDetailBox'>
            <div className='configContent'>
              <div className='configHead'>配置信息</div>
              <div className='configList'>
                <span className='listKey'>
                  <Icon type='link' />&nbsp;访问地址：
              </span>
                <span className='listLink'>
                  {'tcp://' + databaseInfo.serviceInfo.name + '.' + databaseInfo.serviceInfo.namespace + '.svc.cluster.local'}
                </span>
              </div>
              <div className='configList'><span className='listKey'>副本数：</span>{databaseInfo.podInfo.pending + databaseInfo.podInfo.running}/{databaseInfo.podInfo.desired}个</div>
              {this.props.database == 'mysql'?
              <div><div className='configHead'>参数</div>
              <ul className='parse-list'>
                <li><span className='key'>key</span> <span className='value'>value</span></li>
                <li><span className='key'>name</span> <span className='value'>{ podSpec.containers[0].env ? podSpec.containers[0].env[0].name : ''}</span></li>
                {this.state.passShow ?
                <li><span className='key'>password</span> <span className='value'>{ podSpec.containers[0].env ? podSpec.containers[0].env[0].value : ''}</span><span  className="pasBtn" onClick={()=>this.setState({passShow: false})}><i className="fa fa-eye-slash"></i> 隐藏</span></li>
                :
                <li><span className='key'>password</span> <span className='value'>******</span><span className="pasBtn" onClick={()=>this.setState({passShow: true})}><i className="fa fa-eye"></i> 显示</span></li>
                }
              </ul>
              </div>
              :null
              }
              <div className='configHead'>实例副本</div>
              <Collapse accordion>
                {volumeMount}
              </Collapse>
            </div>
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
    isFetching: false,
    // cluster: cluster.clusterID,
    cluster: 'e0e6f297f1b3285fb81d27742255cfcf11',
    databaseInfo: databaseInfo,
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
  deleteDatabaseCluster
})(ModalDetail)