/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageVersion component
 *
 * v0.1 - 2017-6-8
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin, Tabs, Button, Table, Icon, Select, Input, Pagination, Dropdown, Menu, Modal } from 'antd'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { encodeImageFullname } from '../../../../common/tools'
import ServiceAPI from './ServiceAPI.js'
import './style/ImageVersion.less'
import { loadRepositoriesTags } from '../../../../actions/harbor'

const TabPane = Tabs.TabPane
const Search = Input.Search
const Option = Select.Option
const MenuItem = Menu.Item

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentTag: null
    };
  },
  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let tagList = this.props.config
    if (!tagList || tagList.length == 0) {
      return (
        <div>镜像版本不存在</div>
      )
    }
    const fullname = this.props.fullname
    let items = tagList.map((item, index) => {
      return (
        <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={`${item}@${index}`} >
          {<ServiceAPI imageTags={item} fullname={fullname} />}
        </TabPane>
      )
    })

    return (
      <div></div>
    )
  }
})

class ImageVersion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataAry: [],
      edition: '',
      detailVisible: false,
      imageDetail: null,
    }
  }

  componentWillMount() {
    const { loadRepositoriesTags, loadRepositoriesTagConfigInfo } = this.props
    const imageDetail = this.props.config
    let processedName = encodeImageFullname(imageDetail.name)
    loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    const oldImageDatail = this.props.config;
    const newImageDetail = nextPorps.config;
    const tableData = nextPorps.detailAry
    const { loadRepositoriesTags } = this.props
    this.fetchData(tableData)
    if (newImageDetail.name != oldImageDatail.name) {
      let processedName = encodeImageFullname(newImageDetail.name)
      loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
    }
  }

  fetchData(data) {
    const curData = []
    if (Object.keys(data).length > 0) {
      data.forEach((item, index) => {
        const curColums = {
          id: index,
          size: '2M',
          source: '容器导出镜像',
          edition: item,
        }
        curData.push(curColums)
      })
      this.setState({
        dataAry: curData,
      })
    }
  }

  handleClose() {
    this.setState({
      detailVisible: false,
    })
  }

  handleDetail(record) {
    this.setState({
      edition: record.edition,
      detailVisible: true,
    })
  }

  handleMenu(e, record) {
    switch (e.key) {
      case 'deploy':
        this.setState({

        })
        return
      case 'delete':
        this.setState({

        })
        return
    }
  }

  render() {
    const { isFetching, detailAry } = this.props
    const { edition, dataAry } = this.state
    const imageDetail = this.props.config
    const rowSelection = {
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    }
    const columns = [{
      id: 'id',
      title: '版本',
      dataIndex: 'edition',
      key: 'edition',
    }, {
      title: '安全扫描',
      dataIndex: 'scanning',
      key: 'scanning',
      render: (text, record) => <div>
        <svg className='notscanning'>
          <use xlinkHref='#notscanning' />
        </svg>
        <span style={{ marginLeft:5 }}>未扫描, <a>开始扫描</a></span>
      </div>
    }, {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    }, {
      title: '版本来源',
      dataIndex: 'source',
      key: 'source',
    }, {
      title: '操作',
      dataIndex: 'comment',
      render: (text, record) => <div>
        {
          <Dropdown.Button
            overlay={
              <Menu style={{ width: '115px' }} onClick={() => { }} >
                <MenuItem key='deploy'>
                  <i className="anticon anticon-appstore-o"></i> 部署镜像
                </MenuItem>
                <MenuItem key='del'>
                  <Icon type="delete" /> 删除
                </MenuItem>
              </Menu>
            } type="ghost" onClick={this.handleDetail.bind(this, record)}>
            <Icon type="eye-o" />查看详情
          </Dropdown.Button>
        }
      </div >
    }]

    const selectBefore = (
      <Select defaultValue="全部版本" style={{ width: 100 }}>
        <Option value="全部版本">全部版本</Option>
        <Option value="已代码分支名命名">已代码分支名命名</Option>
        <Option value="已时间数命名">已时间数命名</Option>
        <Option value="自定义版本名">自定义版本名</Option>
      </Select>)
    const pageOption = {
      simple: true,
      total: 10,
      defaultPageSize: 10,
      defaultCurrent: 1,
      // current: this.state.current,
      onChange: () => { }
    }
    return (
      <Card className="ImageVersion" >
        {/* <MyComponent loading={isFetching} config={imageDetailTag} fullname={imageDetail.name ? imageDetail.name : imageDetail} /> */}
        < div className="table" >
          <div className="top">
            <Button className="delete"><Icon type="delete" />删除</Button>
            <div className='SearchInput' style={{ width: 280 }}>
              <div className='littleLeft'>
                <i className='fa fa-search' onClick={this.handleSearch} />
              </div>
              <div className='littleRight'>
                <Input
                  addonBefore={selectBefore}
                  onChange={this.handleInt}
                  placeholder={"请输入关键词搜索"}
                  onPressEnter={this.handleSearch}
                />
              </div>
            </div>
            <div className="right">
              <span style={{ verticalAlign: 'super' }}>共计 {dataAry.length} 条</span>
              <Pagination className="pag" {...pageOption} />
            </div>
          </div>
          <div className="body">
            <Table
              columns={columns}
              dataSource={dataAry}
              pagination={false}
              loading={false}
              rowSelection={rowSelection}
            />
          </div>
        </div>
        <Modal title="镜像版本详情" visible={this.state.detailVisible} onCancel={this.handleClose.bind(this)}
          footer={[
            <Button key="back" type="primary" size="large" onClick={this.handleClose.bind(this)}>知道了</Button>,
          ]}>
          {<ServiceAPI imageTags={edition} fullname={imageDetail.name ? imageDetail.name : imageDetail} />}
        </Modal>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    server: '',
    tag: [],
  }
  const { imageTags } = state.harbor
  let processedName = encodeImageFullname(props.config.name)
  let targetImageTag = {}
  if (imageTags[DEFAULT_REGISTRY]) {
    targetImageTag = imageTags[DEFAULT_REGISTRY][processedName] || {}
  }
  const { tag, server } = targetImageTag || defaultImageDetailTag
  return {
    detailAry: tag,
    isFetching: targetImageTag.isFetching
  }
}

export default connect(mapStateToProps, {
  loadRepositoriesTags
})(ImageVersion)