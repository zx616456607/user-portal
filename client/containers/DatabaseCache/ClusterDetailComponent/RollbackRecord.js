import React from 'react'
import { Table, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { formatDate } from '../../../../src/common/tools'
import { getRollbackRecord } from '../../../actions/backupChain'
import './style/RollbackRecord.less'
class RollbackRecord extends React.Component {
  state = {
    columns: [
      {
        dataIndex: 'startTime',
        title: '回滚开始时间',
        render: text => <span>{formatDate(text)}</span>,
        width: 350,
      },
      {
        dataIndex: 'status',
        title: '回滚状态',
        render: text => <span style={{ color: this.convertStatus(text).color }}>
          {this.convertStatus(text).text}</span>,
        width: 150,
      },
      {
        dataIndex: 'whichBackup',
        title: '使用备份',
        render: text => <Tooltip title={text} placement="topLeft"><span className="overflow-span">{text}</span></Tooltip>,
        width: 200,
      },
      {
        dataIndex: 'whichChain',
        title: '所在链路',
        render: (text, record) => <Tooltip title={text} placement="topLeft"
        ><span onClick={() => this.jumpToBackupPannel(record)} className="overflow-span link-to">{text}</span></Tooltip>,
        width: 200,
      },
      {
        dataIndex: 'endTime',
        title: '回滚结束时间',
        render: text => <span>{formatDate(text)}</span>,
        width: 300,
      },
    ],
  }
  componentDidMount() {
    const { clusterID, databaseInfo, database } = this.props
    const databaseName = databaseInfo.objectMeta.name
    this.props.getRollbackRecord(clusterID, database, databaseName, {
      success: {
        func: () => {
          // something
        },
      },
      failed: {
        func: () => {
          // something
        },
      },
    })
  }
  jumpToBackupPannel(recordItem) {
    this.props.linkToBackup(recordItem.whichChain, recordItem.whichBackup)
  }
  convertStatus = status => {
    switch (status) {
      case '0':
        return {
          text: '回滚中',
          color: '#2db7f5',
        }
      case '1':
        return {
          text: '回滚完成',
          color: '#5cb85c',
        }
      case '2':
        return {
          text: '回滚失败',
          color: '#f85a5a',
        }
      default:
        return {
          text: '未知',
          color: '#ccc',
        }
    }
  }
  render() {
    const { rollbackRecord } = this.props
    return <div id="rollback-record">
      <Table
        loading={rollbackRecord.isFetching}
        dataSource={rollbackRecord.data}
        columns={this.state.columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  }
}
const mapStateToProps = state => {
  const { rollbackRecord } = state.backupChain
  const { clusterID } = state.entities.current.cluster
  rollbackRecord.data = rollbackRecord.data &&
    rollbackRecord.data.sort((a, b) => a.startTime - b.startTime)
  return { rollbackRecord, clusterID }
}
export default connect(mapStateToProps, {
  getRollbackRecord,
})(RollbackRecord)
