import React, { Component, PropTypes } from 'react'
import Breadcrumb from 'antd/lib/breadcrumb'
import { loadTranshRcList } from '../../actions'
import { connect } from 'react-redux'
import { Tabs, Icon, Table, Button } from 'antd'
import { MASTERS } from '../../constants'

const TabPane = Tabs.TabPane
let DEFAULT_MASTER = 'default'
function loadData(props, state) {
  const { master } = state
  props.loadTranshRcList(master)
}

class Transh extends Component {
  constructor(props) {
    super(props)
    this.tabCk = this.tabCk.bind(this)
    this.state = {
      master: DEFAULT_MASTER,
      transhRcList: this.props.transhRcList,
      isFetching: this.props.isFetching
    }
  }

  componentWillReceiveProps(nextProps) {
    const { master, transhRcList, isFetching } = nextProps
    this.setState({
      master,
      transhRcList,
      isFetching
    })
  }

  componentWillMount() {
    const { master } = this.state
    document.title = '回收站 - 时速云'
    loadData(this.props, this.state)
  }

  tabCk(key) {
    const { loadTranshRcList } = this.props
    this.setState({master: key})
    DEFAULT_MASTER = key
    // loadTranshRcList(key)
    setTimeout(function() {
      loadTranshRcList(key)
    }, 100)
  }

  render() {
    const { master, transhRcList, isFetching } = this.state
    const columns = [{
      title: '名称',
      dataIndex: 'rcName'
    }, {
      title: '镜像',
      dataIndex: 'image'
    }, {
      title: '内存',
      dataIndex: 'memory'
    }, {
      title: '创建时间',
      dataIndex: 'createTime'
    }]
    const rowKey = function(record) {
      return record.rcName;  // 比如你的数据主键是 rcName
    }
    const btnClass = {
      marginRight: 8
    }
    const transhBtnGroup = (
      <div style={{paddingBottom: 18 }}>
        <Button type="primary" icon="reload" style={btnClass}></Button>
        <Button type="primary" icon="rollback" style={btnClass}>恢复</Button>
        <Button icon="delete" style={btnClass}>删除</Button>
      </div>
    )
    const transhTable = (
      <Table rowKey={rowKey} columns={columns} dataSource={transhRcList} loading={isFetching} />
    )
    return (
      <div>
        <div className="tenx-layout-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>控制台</Breadcrumb.Item>
            <Breadcrumb.Item>回收站</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="tenx-layout-container">
          <Tabs onChange={this.tabCk} type="card">
              {MASTERS.map((master) => {
                return(
                  <TabPane tab={<span><Icon type="environment-o" />{master.name}</span>} key={master.value}>
                    {transhBtnGroup}
                    {transhTable}
                  </TabPane>
                )
              })}
          </Tabs>
        </div>
      </div>
    )
  }
}

Transh.propTypes = {
  // Injected by React Redux
  master: PropTypes.string.isRequired,
  transhRcList: PropTypes.array.isRequired,
  number: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadTranshRcList: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const defaultTranshRcs = {
    isFetching: false,
    master: DEFAULT_MASTER,
    login: null,
    number: 0,
    rcList: []
  }
  const {
    transhRcs,
    entities: { users, rcs }
  } = state
  const { rcList, number, isFetching, master } = transhRcs[DEFAULT_MASTER] || defaultTranshRcs
  const transhRcList = rcList.map(id => rcs[id])

  return {
    master,
    transhRcList,
    number,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadTranshRcList
})(Transh)