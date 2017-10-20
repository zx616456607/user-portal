import React from 'react'
import { Modal, Alert, Table, Button, Input, Card } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import Title from '../../../Title'
import { getCachedVolumes, deleteCachedVolume } from '../../../../actions/cicd_flow'
import { formatDate } from '../../../../common/tools'
import Notification from '../../../Notification'
import './style/index.less'

const notification = new Notification()

class CachedVolumes extends React.Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.openDelModal = this.openDelModal.bind(this)
    this.deleteVolume = this.deleteVolume.bind(this)
    this.state = {
      searchValue: '',
      currentVolume: {},
      delModal: false,
      delModalBtnLoading: false,
    }
  }

  loadData() {
    const { getCachedVolumes } = this.props
    getCachedVolumes()
  }

  componentDidMount() {
    this.loadData()
  }

  openDelModal(volume) {
    this.setState({
      currentVolume: volume,
      delModal: true,
    })
  }

  deleteVolume() {
    const { currentVolume } = this.state
    this.setState({
      delModalBtnLoading: true,
    })
    this.props.deleteCachedVolume(currentVolume.pvcName, {
      success: {
        func: () => {
          notification.success(`删除缓存卷 ${currentVolume.volumeName} 成功`)
          this.setState({
            delModalBtnLoading: false,
            delModal: false,
          })
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error(`删除缓存卷 ${currentVolume.volumeName} 失败`)
        },
        isAsync: true,
      },
    })
  }

  render() {
    const { volumes, isFetching } = this.props
    let { searchValue } = this.state
    searchValue = searchValue && searchValue.trim() || ''
    const data = volumes.filter(v => v.volumeName.indexOf(searchValue) > -1)
    const columns = [{
      title: '缓存卷',
      dataIndex: 'volumeName',
      key: 'volumeName',
    }, {
      title: '状态',
      dataIndex: 'statusPhase',
      key: 'statusPhase',
      render: (text, record) => {
        if (text === 'abnormal') {
          return (
            <span>
              <i className="fa fa-circle icon-marginRight error"></i>
              异常
            </span>
          )
        }
        if (record.ownerFlowName) {
          return (
            <span>
              <i className="fa fa-circle icon-marginRight used"></i>
              使用中
            </span>
          )
        }
        return (
          <span>
            <i className="fa fa-circle icon-marginRight no_used"></i>
            未使用
          </span>
        )
      }
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: () => '可靠块存储'
    }, {
      title: '大小',
      dataIndex: 'volumeSize',
      key: 'volumeSize',
    }, {
      title: 'TenxFlow',
      dataIndex: 'ownerFlowName',
      key: 'ownerFlowName',
      render: (text, record) => (
        <Link to={`/ci_cd/tenx_flow/tenx_flow_build?${record.ownerFlowId}`}>
          {text}
        </Link>
      )
    }, {
      title: '创建时间',
      dataIndex: 'creationTimestamp',
      key: 'creationTimestamp',
      render: text => formatDate(text),
    }, {
      title: '操作',
      dataIndex: 'aciton',
      key: 'aciton',
      render: (text, record) => (
        <Button icon="delete" onClick={this.openDelModal.bind(this, record)}>
          删除
        </Button>
      )
    }]
    return (
      <QueueAnim className='cached-volumes'
        type='right'
      >
        <Title title="缓存卷" />
        <div id='cached-volumes' key='cached-volumes'>
          <Alert message="缓存卷：为 TenxFlow 的任务提供缓存功能，用户可以将执行任务常用的依赖保存在缓存内，避免每次执行都要拉取的等待" type='info' />
          <div className='operaBox'>
            <Button
              className='createBtn'
              size='large'
              type='primary'
              onClick={this.loadData}
            >
              <i className='fa fa-refresh' />&nbsp;
              刷新
            </Button>
            <Input
              className='searchBox'
              placeholder="按缓存卷名称搜索"
              value={this.state.searchValue}
              onChange={e => this.setState({ searchValue: e.target.value })}
            />
            <i className='fa fa-search' />
            <div style={{ clear: 'both' }}/>
          </div>
          <Card>
            <Table
              loading={isFetching}
              dataSource={data}
              columns={columns}
              rowKey={row => row.pvcName}
              pagination={false}
            />
          </Card>
        </div>
        <Modal title="删除缓存卷操作"
          visible={this.state.delModal}
          onOk={this.deleteVolume}
          onCancel={()=> this.setState({delModal: false})}
          confirmLoading={this.state.delModalBtnLoading}
        >
          <div className="modalColor">
            <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>
            确定要删除存储 {this.state.currentVolume.volumeName} 吗?
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { cachedVolumes } = state.cicd_flow
  return {
    volumes: cachedVolumes && cachedVolumes.result && cachedVolumes.result.volumes || [],
    isFetching: cachedVolumes && cachedVolumes.isFetching,
  }
}

export default connect(mapStateToProps, {
  getCachedVolumes,
  deleteCachedVolume,
})(CachedVolumes)
