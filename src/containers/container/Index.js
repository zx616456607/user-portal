import React, { Component, PropTypes } from 'react'
import { Breadcrumb, Tabs, Icon, Table, Button, Menu, Dropdown } from 'antd'
import { MASTERS } from '../../constants'
import { loadRcList } from '../../actions'
import { connect } from 'react-redux'

const TabPane = Tabs.TabPane
let DEFAULT_MASTER = 'default'
function loadData(props, state) {
  const { master } = state
  props.loadRcList(master)
}

class Index extends Component {
  constructor(props) {
    super(props)
    this.tabCk = this.tabCk.bind(this)
    this.reloadList = this.reloadList.bind(this)
    this.state = {
      master: DEFAULT_MASTER,
      containerList: this.props.containerList,
      isFetching: this.props.isFetching
    }
  }
  
  componentWillMount() {
    const { master } = this.state
    document.title = '容器服务 - 时速云'
    loadData(this.props, this.state)
  }
  
  componentWillReceiveProps(nextProps) {
    const { master, containerList, isFetching } = nextProps
    this.setState({
      master,
      containerList,
      isFetching
    })
  }
  
  tabCk(key) {
    const { loadRcList } = this.props
    this.setState({master: key})
    DEFAULT_MASTER = key
    setTimeout(function() {
      loadRcList(key)
    }, 100)
  }
  
  reloadList() {
    const { loadRcList } = this.props
    this.setState({
      isFetching: true
    })
    loadRcList(DEFAULT_MASTER)
  }
  
  render() {
    const { master, containerList, isFetching } = this.state
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
      return record.rcName
    }
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    }
    const containerTable = (
      <Table rowSelection={rowSelection} rowKey={rowKey} columns={columns} dataSource={containerList} loading={isFetching} />
    )
    const btnClass = {
      marginRight: 8
    }
    const dropdownList = (
      <Menu>
        <Menu.Item key="start-up">
          <span><Icon type="caret-circle-o-right" /> 启动</span>
        </Menu.Item>
        <Menu.Item key="stop">
          <span><Icon type="poweroff" /> 停止</span>
        </Menu.Item>
        <Menu.Item key="delete">
          <span><Icon type="delete" /> 删除</span>
        </Menu.Item>
        <Menu.Item key="scale" disabled>
          <span><Icon type="retweet" /> 弹性伸缩</span>
        </Menu.Item>
        <Menu.Item key="grayscale-upgrade">
          <span><Icon type="setting" /> 灰度升级</span>
        </Menu.Item>
        <Menu.Item key="redeploy">
          <span><Icon type="reload" /> 重新部署</span>
        </Menu.Item>
      </Menu>
    )
    const containerBtnGroup = (
      <div style={{paddingBottom: 18 }}>
        <Button type="primary" icon="reload" style={btnClass} onClick={this.reloadList}></Button>
        <Button type="primary" icon="plus" style={btnClass}>创建</Button>
        <Dropdown.Button overlay={dropdownList} type="primary">
          更改配置
        </Dropdown.Button>
      </div>
    )
    return (
      <div>
        <div className="tenx-layout-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>控制台</Breadcrumb.Item>
            <Breadcrumb.Item>容器服务</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="tenx-layout-container">
          <Tabs onChange={this.tabCk} type="card">
              {MASTERS.map((master) => {
                return(
                  <TabPane tab={<span><Icon type="environment-o" />{master.name}</span>} key={master.value}>
                    {containerBtnGroup}
                    {containerTable}
                  </TabPane>
                )
              })}
          </Tabs>
        </div>
      </div>
    )
  }
}

Index.propTypes = {
  // Injected by React Redux
  master: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  number: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadRcList: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultRcs = {
    isFetching: false,
    master: DEFAULT_MASTER,
    login: null,
    number: 0,
    rcList: []
  }
  const {
    containerList,
    entities: { users, rcs }
  } = state
  const { rcList, number, isFetching, master } = containerList[DEFAULT_MASTER] || defaultRcs
  const mapContainerList = rcList.map(id => rcs[id])

  return {
    master,
    containerList: mapContainerList,
    number,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadRcList
})(Index)