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
import { Button, Icon, Spin, Modal } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbClusterDetail, deleteDatabaseCluster } from '../../actions/database_cache'
import './style/ModalDetail.less'

const confirm = Modal.confirm;

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
    const { deleteDatabaseCluster, cluster, scope } = this.props;
    const { loadDbClusterDetail } = scope.props;
    confirm({
      title: '您是否确认要删除' + dbName,
      onOk() {
        scope.setState({
          CreateDatabaseModalShow: false
        });
        deleteDatabaseCluster(cluster, dbName, loadDbClusterDetail(cluster));
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
        currentDatabase: dbName
      })
      loadDbClusterDetail(cluster, nextProps.dbName);
    }
  }

  render() {
    const { scope, dbName, isFetching, databaseInfo } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
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
                <Button size='large' className='btn-danger' type='ghost' onClick={this.deleteDatebaseCluster.bind(this, dbName)}>
                  <Icon type='delete' />删除集群
              </Button>
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
              <div className='configHead'>参数</div>
              <ul className='parse-list'>
                <li><span className='key'>key</span> <span className='value'>value</span></li>
                <li><span className='key'>username</span> <span className='value'>mysql-admin</span></li>
                <li><span className='key'>password</span> <span className='value'>value</span></li>
                <li><span className='key'>InstanceId</span> <span className='value'>uuid-md5-1212555-xxlos</span></li>
                <li><span className='key'>volume</span> <span className='value'>volume-value-1212555-xxlos</span></li>
              </ul>
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
    cluster,
    databaseInfo: {},
  }
  const { databaseClusterDetail } = state.databaseCache
  const { databaseInfo, isFetching } = databaseClusterDetail.databaseInfo || defaultMysqlList
  return {
    isFetching: false,
    cluster,
    databaseInfo: databaseInfo
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