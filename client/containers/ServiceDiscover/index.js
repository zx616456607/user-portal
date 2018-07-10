import React from 'react'
// import { connect } from 'react-redux'
import SearchInput from '../../components/SearchInput'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination } from 'antd'
// import { browserHistory } from 'react-router'
// import { toQuerystring } from '../../../src/common/tools'
// import { loadApiInfo } from '../../../src/actions/open_api'
import Title from '../../../src/components/Title'
import DnsModal from './dnsModal'
import YamlModal from './yamlModal'
import './style/index.less'

class ServiceDiscover extends React.Component {
  state = {
    search: '',
    visible: false,
    showYaml: false,
    targetRow: '',
    isWrite: true,
  }

  componentDidMount() {

  }

  loadData = () => {

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
      targetRow: record,
      isWrite: true,
    })
  }

  deleteItem = () => {
    // console.log( 'delete' )
  }

  watchItem = record => {
    this.setState({
      showYaml: !this.state.showYaml,
      targetRow: record,
      isWrite: false,
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
      case 'watchItem':
        this.watchItem(record)
        break
      default:
        break
    }
  }

  render() {
    const { search, visible, showYaml, targetRow, isWrite } = this.state
    const total = 2
    const pagination = {
      simple: true,
      total,
      current: 1, // page,
      pageSize: 10, // DEFAULT_PAGE_SIZE,
      // onChange: this.handlePage
    }
    const columnsDiscover = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '16%',
      }, {
        title: '类型',
        key: 'type',
        dataIndex: 'type',
        width: '16%',
      // render: (text) => <div className={iconclassName('正常')}>
      //     {this.formatStatus(text)}
      //   </div>
      }, {
        title: '目标',
        key: 'target',
        dataIndex: 'target',
        width: '20%',
        // render: (fstype) => <div>{fstype}</div>
      }, {
        title: '创建时间',
        key: 'time',
        dataIndex: 'time',
        width: '16%',
        // render: (size) => <div>{size} M</div>
      }, {
        title: '更新时间',
        key: 'refresh',
        dataIndex: 'refresh',
        width: '16%',
        // render: (volume) => <div>
        //   <Link to={`/app_manage/storage/exclusiveMemory/${DEFAULT_IMAGE_POOL}/${this.props.cluster}/${volume}`}>
        //     {volume}
        //   </Link>
        // </div>
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '15%',
        render: (key, record) => {
          const menu = <Menu
            onClick={ key => this.operatorDns(key, record)}
            style={{ width: '80px' }}>
            <Menu.Item key="editItem">编辑</Menu.Item>
            <Menu.Item key="watchItem">查看 yaml </Menu.Item>
            <Menu.Item key="deleteItem">删除</Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button
              // onClick={this.handleRollbackSnapback.bind(this, record.volumeStatus === "used", key)}
              overlay={menu}
              trigger={[ 'click' ]}
              // onClick={() => this.operatorDns(record)}
              type="ghost">
              操作
            </Dropdown.Button>
          </div>
        },
      }]
    const dnsList = [{
      name: '胡彦斌',
      type: 'type',
      target: 'target',
      time: '2018-7-9',
      refresh: '刷新',
    }, {
      name: '胡彦祖',
      type: 'type',
      target: 'target',
      time: '2018-7-9',
      refresh: '刷新',
    }]
    return <QueueAnim className="serviceDiscover">
      <div className="discoverPage" key="discover">
        <Title title="服务发现" />
        {
          visible ?
            <DnsModal
              visible={visible}
              handleCreate={this.handleCreate}
            />
            : null
        }
        {
          showYaml ?
            <YamlModal
              visible={showYaml}
              editItem={this.editItem}
              self={targetRow}
              isWrite={isWrite}
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
            dataSource={dnsList}
            pagination={false}
            // loading={ isFetching }
          />
        </Card>
      </div>
    </QueueAnim>
  }
}

export default ServiceDiscover
