import React from 'react'
import { connect } from 'react-redux'
import SearchInput from '../../components/SearchInput'
import { formatDate } from '../../../src/common/tools'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination, Icon } from 'antd'
import Title from '../../../src/components/Title'
import DnsModal from './dnsModal'
import YamlModal from './yamlModal'
import './style/index.less'
import { getDnsList, deleteDnsItem } from '../../actions/dnsRecord'
import Notification from '../../../src/components/Notification'

const notification = new Notification()

class ServiceDiscover extends React.Component {
  state = {
    search: '',
    visible: false,
    showYaml: false,
    targetName: '',
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getDnsList, cluster } = this.props
    getDnsList(cluster)
  }

  handleCreate = () => {
    this.setState({
      visible: !this.state.visible,
    })

  }

  changeInp = search => {
    this.setState({
      search,
    })
  }

  searchService = search => {
    this.setState({
      search,
    }, this.loadData)
  }

  editItem = record => {
    this.setState({
      showYaml: !this.state.showYaml,
      targetName: record && record.name || '',
    })
  }

  deleteItem = record => {
    // console.log( 'delete' )
    const { deleteDnsItem, cluster } = this.props
    deleteDnsItem(cluster, record.name, {
      success: {
        func: () => {
          notification.close()
          notification.success('成功删除 DNS 记录')
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode, message } = err
          notification.close()
          notification.warn(`删除 DNS 记录失败，错误代码: ${statusCode}， ${message.message}`)
        },
      },
    })
  }

  operatorDns = (key, record) => {
    switch (key.key) {
      case 'editItem':
        this.editItem(record)
        break
      case 'deleteItem':
        this.deleteItem(record)
        break
      default:
        break
    }
  }
  dealWith = (text, type) => {
    if (type === 'name') {
      return text
    }
    const targetArr = JSON.parse(text)
    return targetArr.map((item, index) => {
      return <p key={index}>{item}</p>
    })
  }
  render() {
    const { search, visible, showYaml, targetName } = this.state
    const { list, isFetching, cluster } = this.props
    const listData = !search ? list : list.filter(item => (
      item.name.toUpperCase().indexOf(search.toUpperCase()) > -1
    ))
    const total = listData.length
    const pagination = {
      simple: true,
      total,
      current: 1, // page,
      pageSize: 10, // DEFAULT_PAGE_SIZE,
      // onChange: this.handlePager
    }
    const columnsDiscover = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '12%',
      }, {
        title: '类型',
        key: 'type',
        dataIndex: 'type',
        width: '14%',
        render: text => <div>{ text === 'ip' ? '外部 IP 地址' : '外部主机名' }</div>,
      }, {
        title: '目标',
        key: 'target',
        dataIndex: 'target',
        width: '16%',
        render: (text, record) => <div>{this.dealWith(text, record.type)}</div>,
      }, {
        title: '端口号',
        key: 'port',
        dataIndex: 'port',
        width: '11%',
      }, {
        title: '创建时间',
        key: 'time',
        dataIndex: 'time',
        width: '18%',
        render: text => <div>{formatDate(text)}</div>,
      }, {
        title: '更新时间',
        key: 'refresh',
        dataIndex: 'refresh',
        width: '12%',
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '17%',
        render: (key, record) => {
          const menu = <Menu
            onClick={ key => this.operatorDns(key, record)}
            style={{ width: 120 }}>
            <Menu.Item key="editItem">编辑 / 查看 yaml</Menu.Item>
            <Menu.Item key="deleteItem">删除</Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button
              // onClick={this.handleRollbackSnapback.bind(this, record.volumeStatus === "used", key)}
              overlay={menu}
              trigger={[ 'click' ]}
              // onClick={() => this.operatorDns(record)}
              type="ghost">
              <Icon type="edit" />更多操作
            </Dropdown.Button>
          </div>
        },
      }]
    return <QueueAnim className="serviceDiscover">
      <div className="discoverPage" key="discover">
        <Title title="服务发现" />
        {
          visible ?
            <DnsModal
              visible={visible}
              handleCreate={this.handleCreate}
              loadData={this.loadData}
            />
            : null
        }
        {
          showYaml ?
            <YamlModal
              visible={showYaml}
              editItem={this.editItem}
              targetName={targetName}
              cluster={cluster}
              loadData={this.loadData}
              key={targetName}
            />
            : null
        }
        <div className="layout-content-btns">
          <Button type="primary" size="large" onClick={this.handleCreate}>
            <i className="fa fa-plus" style={{ marginRight: 8 }}/>
            DNS 记录
          </Button>
          <SearchInput
            size="large"
            id="serviceDiscoverInp"
            placeholder="请输入名称搜索"
            value={search}
            style={{ width: 200 }}
            onChange={this.changeInp}
            onSearch={this.searchService}
          />
          {
            total ?
              <div className="page-box">
                <span className="total">共计 {total} 条</span>
                <Pagination {...pagination}/>
              </div>
              : null
          }
        </div>
        <Card className="discoverTabTable">
          <Table
            className="reset_antd_table_header"
            columns={columnsDiscover}
            dataSource={listData}
            pagination={false}
            loading={ isFetching }
          />
        </Card>
      </div>
    </QueueAnim>
  }
}
const mapStateToProps = ({ entities: { current }, dnsRecord: { getList } }) => {
  const list = getList.data && getList.data.data || []
  const arr = []
  list.map(item => {
    return arr.push({
      name: item.metadata.name,
      type: item.metadata.labels['system/endpoint-type'],
      target: item.metadata.annotations && item.metadata.annotations['system/endpoint-ips'] || item.spec.externalName,
      time: item.metadata.creationTimestamp,
      port: item.metadata.annotations && item.metadata.annotations['system/endpoint-ip-port'] || '-',
      refresh: '刷新时间',
    })
  })
  return {
    cluster: current.cluster.clusterID,
    isFetching: getList.isFetching,
    list: arr,
  }
}

export default connect(mapStateToProps, {
  getDnsList,
  deleteDnsItem,
})(ServiceDiscover)
