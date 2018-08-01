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
import { Card, Spin, Tabs, Button, Table, Icon, Select, Input, message,
  Pagination, Dropdown, Menu, Modal, Popover, Checkbox, Tooltip, InputNumber, Alert } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { encodeImageFullname } from '../../../../common/tools'
import ServiceAPI from './ServiceAPI.js'
import TenxIcon from '@tenx-ui/icon'
import './style/ImageVersion.less'
import NotificationHandler from '../../../../components/Notification'
import { loadRepositoriesTags, deleteAlone, loadProjectMaxTagCount, updateProjectMaxTagCount,
  setRepositoriesTagLabel, delRepositoriesTagLabel, loadLabelList } from '../../../../actions/harbor'
import { appStoreApprove } from '../../../../actions/app_store'
import { formatDate } from '../../../../common/tools'
import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'
import remove from 'lodash/remove'

const notification = new NotificationHandler()
const TabPane = Tabs.TabPane
const Search = Input.Search
const Option = Select.Option
const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu
// const confirm = Modal.confirm

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
      <div>{items}</div>
    )
  }
})

class ImageVersion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverIp: '',
      dataAry: [],
      aryName: [],
      edition: '',
      delValue: '',
      isBatchDel: false,
      deleteVisible: false,
      detailVisible: false,
      imageDetail: null,
      processedName: '',
      deleteAll: false,
      selectedRowKeys: [],
      max_tags_count: 0,
      lastCount: 0,
      allLabels: [],
      isEditMaxTag: false,
      isShowLockModel: false,
      lockType: "",
      currentEdition: "",
      dropdownVisible: {},
    }
  }

  componentWillMount() {
    this.loadData()
  }

  loadData() {
    const { loadRepositoriesTags, loadRepositoriesTagConfigInfo, detailAry, harbor, loadProjectMaxTagCount,
      config: imageDetail, loadLabelList,
    } = this.props
    const project_id = ""
    let processedName = encodeImageFullname(imageDetail.name)
    this.setState({
      processedName,
    })
    const query = {
      harbor,
      registry: DEFAULT_REGISTRY,
      imageName: processedName,
    }
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, processedName, {
      success: {
        func: res => {
          if (res && res.data && res.data.length) {
            this.fetchData(res.data)
          }
        },
        isAsync: true,
      },
      failed:{
        func: err => {
          if(err.statusCode === 404){
            notification.warn("对象不存在, 请求无法完成")
          }
        },
        isAsync: true,
      }
    }, true)
    loadProjectMaxTagCount(DEFAULT_REGISTRY, { harbor, project_id: imageDetail.projectId }, {
      success: {
        func: res => {
          const currTag = filter(res.data, { name: processedName })[0]
          const max_tags_count = currTag ? currTag.maxTagsCount : 0
          this.setState({
            max_tags_count,
            lastCount: max_tags_count,
          })
        },
        isAsync: true,
      }
    })
    this.setState({
      allLabels: [],
    }, () => {
      const params = {
        harbor,
      }
      const succ = res => {
        const data = res.data
        if(!!data){
          const { allLabels } = this.state
          this.setState({
            allLabels: [].concat(allLabels, remove(cloneDeep(data), label => label.id !== 1))
          })
        }
      }
      // 项目内标签
      loadLabelList(DEFAULT_REGISTRY, Object.assign({}, params, { scope: 'p', project_id: imageDetail.projectId }), {
        success:{
          func: succ,
          isAsync: true,
        },
        failed: {
          func: (err) => {
            // console.log(err)
          },
          isAsync: true,
        }
      })
      // 全局标签
      loadLabelList(DEFAULT_REGISTRY, Object.assign({}, params, { scope: 'g' }), {
        success:{
          func: succ,
          isAsync: true,
        },
        failed: {
          func: (err) => {
            // console.log(err)
          },
          isAsync: true,
        }
      })
    })
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    // if (isEqual(this.props.config.name, nextPorps.config.name)) {
    //   return
    // }
    const oldImageDatail = this.props.config;
    const newImageDetail = nextPorps.config;
    const tableData = nextPorps.detailAry
    this.setState({
      serverIp: nextPorps.scope.props.server,
    })
    const { loadRepositoriesTags, harbor } = this.props
    if (newImageDetail.name != oldImageDatail.name) {
      let processedName = encodeImageFullname(newImageDetail.name)
      const query = {
        registry: DEFAULT_REGISTRY, imageName: processedName, harbor
      }
      loadRepositoriesTags(harbor, DEFAULT_REGISTRY, processedName, {
        success: {
          func: res => {
            if (res && res.data && res.data.length) {
              this.fetchData(res.data)
            }
          },
          isAsync: true,
        }
      }, true)
    }
  }

  fetchData(data) {
    const curData = []
    if (data && data.length) {
      data.forEach((item, index) => {
        const curColums = {
          id: index,
          edition: item.name || item.tag,
          push_time: item.last_updated || item.first_push,
          labels: item.labels,
        }
        curData.unshift(curColums)
      })
    }
    this.setState({
      dataAry: curData,
    })
  }

  handleClose() {
    this.setState({
      detailVisible: false,
    })
  }

  handleDelClose() {
    this.setState({
      deleteVisible: false,
    })
  }

  handleDetail(record) {
    this.setState({
      edition: record.edition,
      detailVisible: true,
    })
  }

  handleDelete(value) {
    this.setState({
      isBatchDel: false,
      delValue: value,
      deleteVisible: true,
    })
  }

  handleOk() {
    const { deleteAlone, scopeDetail, loadRepositoriesTags, config, isWrapStore, harbor } = this.props
    const { aryName, delValue, isBatchDel, deleteAll } = this.state
    let notify = new NotificationHandler()
    if (isWrapStore) {
      this.offShelfImage()
      return
    }
    const query = {
      tagName: isBatchDel ? aryName.trim() : delValue,
      registry: DEFAULT_REGISTRY,
      repoName: config.name,
      harbor,
    }

    deleteAlone(query, {
      success: {
        func: res => {
          if (isBatchDel) {
            notify.success(`批量删除成功`)
          } else {
            notify.success(`删除 ${config.name} 成功`)
          }
          this.setState({
            deleteVisible: false,
            selectedRowKeys: [],
          })
          this.loadData()
          if(deleteAll) {
            scopeDetail.setState({
              imageDetailModalShow: false,
            })
          }
          scopeDetail.loadRepos()
          const query = {
            registry: DEFAULT_REGISTRY, imageName: config.name, harbor
          }
          loadRepositoriesTags(harbor, DEFAULT_REGISTRY, config.name)
        },
        isAsync: true
      }, failed: {
        func: err => {
          if (isBatchDel) {
            notify.error(`批量删除失败`)
          } else {
            notify.error(`删除 ${config.name} 失败`)
          }
        },
        isAsync: true
      }
    })
  }

  offShelfImage() {
    const { appStoreApprove, config, scopeDetail, loadRepositoriesTags } = this.props
    const { delValue } = this.state
    let notify = new NotificationHandler()
    let offshelfId
    let versions = config.versions
    for (let i = 0; i < versions.length; i++) {
      if (versions[i].tag === delValue) {
        offshelfId = versions[i].iD
        break
      }
    }
    const body = {
      id: offshelfId,
      type: 2,
      status: 4,
      imageTagName: `${config.resourceName}:${delValue}`
    }
    appStoreApprove(body, {
      success: {
        func: () => {
          notify.success('删除成功')
          scopeDetail.setState({
            imageDetailModalShow: false,
          })
          this.setState({
            deleteVisible: false,
          })
          scopeDetail.props.getStoreList()
          scopeDetail.props.getAppsHotList()
          let processedName = encodeImageFullname(config.name)
          this.setState({
            processedName,
          })
          const query = {
            registry: DEFAULT_REGISTRY, imageName: processedName, harbor
          }
          loadRepositoriesTags(harbor, DEFAULT_REGISTRY, processedName)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('删除失败')
        }
      }
    })
  }

  handleBatchDel() {
    const { selectedRowKeys, dataAry } = this.state
    let names = ''
    if(dataAry.length < 2) {
      this.setState({
        deleteAll: true,
        deleteVisible: true,
        aryName: dataAry[0].edition,
      })
    } else if (selectedRowKeys) {
      selectedRowKeys.forEach(item => {
        dataAry.forEach(value => {
          if(value.id === item.id) {
            names += `,${value.edition}`
          }
        })
      })
      this.setState({
        aryName: names.replace(',', ''),
        isBatchDel: true,
        deleteVisible: true,
      })
    }
  }

  handleDeploy(value) {
    const { serverIp, processedName } = this.state
    browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${serverIp}&imageName=${processedName}&tag=${value}`)
  }

  handleMenu(record, e) {
    if (e.key === 'deploy') {
      this.handleDeploy(record.edition)
    } else if (e.key === 'del') {
      this.handleDelete(record.edition)
    } else if (e.key === 'lock' || e.key === 'unlock') {
      this.lockState(record, e.key)
    }
  }
  lockCb = () => {
    this.setState({
      isShowLockModel: false,
      currentEdition: "",
      lockType: ""
    }, () => {
      this.loadData()
    })
  }
  lockFunc = () => {
    const { imageName, harbor } = this.props
    const { max_tags_count, currentEdition } = this.state
    const query = {
      registry: DEFAULT_REGISTRY,
      name: imageName,
      harbor,
      id: 1,
      tagName: currentEdition,
    }
    this.setLabel(query, { succ: "锁定成功", failed: "锁定失败" }, this.lockCb)
  }
  lockState = (record, lockType) => {
    this.setState({
      isShowLockModel: true,
      lockType,
      currentEdition: record.edition,
    })
  }
  setLabel = (query, { succ, failed }, _cb) => {
    this.props.setRepositoriesTagLabel(query, {
      success: {
        func: res => {
          // message.success(succ)
          notification.destroy()
          notification.success(succ)
          !!_cb && _cb()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if(!!err){
            notification.destroy()
            // message.warning(failed)
            notification.warn(failed)
          }
        }
      }
    })
  }
  unLockFunc = () => {
    const { imageName, harbor } = this.props
    const { max_tags_count, currentEdition } = this.state
    const query = {
      registry: DEFAULT_REGISTRY,
      name: imageName,
      harbor,
      id: 1,
      tagName: currentEdition,
    }
    this.delLabel(query, { succ: '解锁成功', failed: '解锁失败' }, this.lockCb)
  }
  delLabel = (query, { succ, failed }, _cb) => {
    this.props.delRepositoriesTagLabel(query, {
      success: {
        func: res => {
          notification.destroy()
          // message.success(succ)
          notification.success(succ)
          !!_cb && _cb()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          if(!!err){
            notification.destroy()
            // message.warning(failed)
            notification.warn(failed)
          }
        }
      }
    })
  }

  onCheckboxChange = (flag, label, record, _cb) => {
    const { imageName: name, harbor }= this.props
    const query = {
      registry: DEFAULT_REGISTRY,
      name,
      harbor,
      id: label.id,
      tagName: record.edition,
    }
    if(flag){
      this.setLabel(query, { succ: '添加标签成功', failed: '添加标签失败' }, _cb)
    }else{
      this.delLabel(query, { succ: '删除标签成功', failed: '删除标签失败' }, _cb)
    }
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: selectedRows
    })
  }

  handleRefresh() {
    const { config, loadRepositoriesTags, harbor } = this.props
    const imageDetail = this.props.config
    let processedName = encodeImageFullname(imageDetail.name)
    const query = {
      registry: DEFAULT_REGISTRY, imageName: processedName, harbor
    }
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, processedName, {
      success: {
        func: res => {
          if (res && res.data && res.data.length) {
            this.fetchData(res.data)
          }
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            selectedRowKeys: [],
          })
        }
      }
    }, true)
  }
  onPressEnter = e => {
    this.onConfirmOk()
  }
  onConfirmOk = () => {
    const { imageName, harbor, updateProjectMaxTagCount } = this.props
    const { max_tags_count } = this.state
    const query = {
      registry: DEFAULT_REGISTRY,
      name: imageName,
      max_tags_count,
      harbor,
    }
    updateProjectMaxTagCount(query, {
      success: {
        func: res => {
          notification.success("修改成功")
          this.setState({
            isEditMaxTag: false,
          }, () => {
            // this.loadData()
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          console.log(err)
          if(!!err && err.code === 400){
            const current_tag_total = err.message.current_tag_total
            if(!!current_tag_total){
              this.setState({
                max_tags_count: current_tag_total,
                lastCount: current_tag_total,
              })
            }
            notification.warn("版本最多个数，需不小于（≥）当前版本数" + (current_tag_total && "，当前版本数为：" + current_tag_total))
          } else {
            notification.warn("修改失败")
          }
        }
      }
    })
  }
  onConfirmCancel = () => {
    this.setState({
      isShowMaxConfirm: false,
    })
  }
  render() {
    // const menu = (
    //   <Menu onClick={this.handleMenuClick}>
    //     <Menu.Item key="1">第一个菜单项</Menu.Item>
    //     <Menu.Item key="2">第二个菜单项</Menu.Item>
    //     <Menu.Item key="3">第三个菜单项</Menu.Item>
    //   </Menu>
    // );
    // return (
    //   <Dropdown.Button visible={true} onClick={this.handleButtonClick} overlay={menu} type="ghost">
    //     某功能按钮
    //   </Dropdown.Button>
    // )
    if(!this.dropdownVisible) this.dropdownVisible = {}
    const { isFetching, detailAry, isAdminAndHarbor, isWrapStore, currentUserRole } = this.props
    const { max_tags_count, edition, dataAry, delValue, aryName,
      isBatchDel, selectedRowKeys, deleteAll, isEditMaxTag, isShowLockModel, lockType } = this.state
    const imageDetail = this.props.config
    const rowSelection = {
      onChange: this.onSelectChange,
    }
    const columns = [{
      id: 'id',
      title: '版本',
      dataIndex: 'edition',
      key: 'edition',
      width: '19%',
      render: (text, record) => {
        return (
          <div>{text} {
            !!filter(record.labels, { id: 1 })[0] ?
              <i className="fa fa-lock"></i>
              :
              ""
              // <i className="fa fa-unlock"></i>
           }</div>
        )
      }
    },{
      id: 'push_time',
      title: '推送时间',
      dataIndex: 'push_time',
      key: 'push_time',
      width: '25%',
      render: text => { return text ? formatDate(text) : "" }
    }, {
      id: 'labels',
      title: '标签',
      dataIndex: 'labels',
      key: 'labels',
      width: '25%',
      render: (labels, record) => {
        const tempLabels = remove(cloneDeep(labels), label => {
          return label.id !== 1
        })
        if(!tempLabels.length) return "无标签"
        const label = tempLabels[0] || {}
        const otherTags = tempLabels.slice(1).map((o, i) => {
          return (
            <div><div className="tag otherTag" style={{ backgroundColor: o.color }}>
              {o.scope === 'g' ? <TenxIcon type="global-tag" /> : <TenxIcon type="tag" />}
              {' ' + o.name}
            </div></div>
          )
        })
        return (
          [
            <div className="tag" style={{ backgroundColor: label.color }}>
              {label.scope === 'g' ? <TenxIcon type="global-tag" /> : <TenxIcon type="tag" />}
              {' ' + label.name}
            </div>,
            tempLabels.length > 1 ?
            <Popover overlayClassName="otherTagsTip" placement="right" content={otherTags}>
              <span className="more">...</span>
            </Popover> : ""
          ]
        )
      }
    }, {
      title: '操作',
      dataIndex: 'comment',
      render: (text, record) => {
        const items = []
        const isLock = !!!filter(record.labels, { id: 1 })[0]
        isLock ?
          items.push(<MenuItem key='lock'>
            <i className="fa fa-lock"></i>&nbsp;&nbsp;锁定
          </MenuItem>)
          :
          items.push(<MenuItem key='unlock'>
            <i className="fa fa-unlock"></i>&nbsp;&nbsp;解锁
          </MenuItem>)
        items.push(<MenuItem disabled={!isLock} key='del'>
          <Icon type="delete" /> {isWrapStore ? '下架（删除）' : '删除'}
        </MenuItem>)

        const name = record.edition
        this.dropdownVisible[name] = false
        const overOut = (flag, name) => {
          const { dropdownVisible } = this.state
          const temp = cloneDeep(dropdownVisible)
          temp[name] = flag
          this.setState({
            dropdownVisible: temp
          })
          this.dropdownVisible[name] = true
        }
        const { allLabels } = this.state
        const subItems = allLabels.length && allLabels.map((label, i) => {
          let checked = false
          if(!!filter(record.labels, { name: label.name, scope: label.scope })[0]) checked = true
          const key = name + "_" + label.name + "_checkbox"
          return (
            <MenuItem key={key} className="row">
              <Checkbox
                defaultChecked={checked}
                onChange={
                  e => {
                    e.stopPropagation()
                    this.onCheckboxChange(e.target.checked, label, record)
                  }
                }
              >
                <div className="tag otherTag" style={{ backgroundColor: label.color }}>
                  <span>{label.scope === 'g' ? <TenxIcon type="global-tag" /> : <TenxIcon type="tag" />}{' ' + label.name}</span>
                </div>
              </Checkbox>
            </MenuItem>
          )
        })
        const labelMenu = <SubMenu
          key="subMenu"
          className="rowContainer"
          onMouseover={() => overOut(true, name)}
          onMouseout={() => overOut(false, name)}
          title={<span><Icon type="tags" /> 配置标签</span>}>
          {subItems}
        </SubMenu>
        items.unshift(labelMenu)
        return (
          <div>
            <Button className="viewDetailsBtn"type="ghost" onClick={this.handleDetail.bind(this, record)}>
              <span><Icon type="eye-o" />查看详情</span>
            </Button>
            <Dropdown
              visible={typeof this.state.dropdownVisible[name] === "boolean" ? this.state.dropdownVisible[name] : this.dropdownVisible[name]}
              onVisibleChange={flag => overOut(flag, name)}
              overlay={
                <Menu defaultOpenKeys={['subMenu']} openKeys={['subMenu']} className="imageVersionDropdownMenu" style={{ width: '115px' }} onClick={this.handleMenu.bind(this, record)} >
                  <MenuItem key='deploy'>
                    <span><i className="anticon anticon-appstore-o"></i> 部署镜像</span>
                  </MenuItem>
                  {
                    isAdminAndHarbor ?
                      items
                      :
                      ""
                  }
                  {
                    !isAdminAndHarbor && (currentUserRole === 1 || currentUserRole === 2)?
                      labelMenu
                      :
                      ""
                  }
                </Menu>
              }>
              <Button type="ghost" className="downBtn">
                <Icon type="circle-o-down" />
              </Button></Dropdown>
          </div>
        )
      }
    }]

    // {
    //   title: '安全扫描',
    //   dataIndex: 'scanning',
    //   key: 'scanning',
    //   render: (text, record) => <div>
    //     <svg className='notscanning'>
    //       <use xlinkHref='#notscanning' />
    //     </svg>
    //     <span style={{ marginLeft: 5 }}>未扫描, <a>开始扫描</a></span>
    //   </div>
    // }, {
    //   title: '大小',
    //   dataIndex: 'size',
    //   key: 'size',
    // }, {
    //   title: '版本来源',
    //   dataIndex: 'source',
    //   key: 'source',
    // },

    const selectBefore = (
      <Select defaultValue="全部版本" style={{ width: 100 }}>
        <Option value="全部版本">全部版本</Option>
        <Option value="已代码分支名命名">已代码分支名命名</Option>
        <Option value="已时间数命名">已时间数命名</Option>
        <Option value="自定义版本名">自定义版本名</Option>
      </Select>)
    const pageOption = {
      simple: true,
    }
    return (
      <Card className="ImageVersion" >
        {/* {<MyComponent loading={isFetching} config={imageDetailTag} fullname={imageDetail.name ? imageDetail.name : imageDetail} />} */}
        < div className="table" >
          <div className="top">
            {
              isAdminAndHarbor && !isWrapStore ?
                <Button className="delete" disabled={!selectedRowKeys.length} onClick={this.handleBatchDel.bind(this)} ><Icon type="delete" />删除</Button> : ''
            }
            <Button className="refresh" onClick={this.handleRefresh.bind(this)}><i className='fa fa-refresh' /> &nbsp;刷新</Button>
            {/*<span style={{ marginLeft: 10 }}>
              保留版本最多
              <Input onChange={ e => this.setState({ max_tags_count: e.target.value })} value={max_tags_count} style={{width: 50}} onPressEnter={this.onPressEnter} />
              个（自动清理最旧版本）
              <Tooltip placement="top" title="最旧版本，即时间按照（推送时间）倒叙排列，最早推送的未锁定版本">
                <Icon type="question-circle" style={{cursor: 'pointer'}} />
              </Tooltip>
            </span>*/}
            <span style={{ marginLeft: 16 }}>&nbsp;保留版本最多&nbsp;
              {
                isEditMaxTag
                ? <InputNumber
                  min={0}
                  step={1}
                  value={max_tags_count === -1 ? "" : max_tags_count}
                  placeholder="无上限"
                  onChange={max_tags_count => {
                    this.setState({ max_tags_count: isNaN(max_tags_count) ? -1 : max_tags_count })
                  }}
                />
                : max_tags_count === -1 ? "无上限" : max_tags_count
              }
              &nbsp;个（自动清理旧版本 <Tooltip placement="top" title="最旧版本，即时间按照（推送时间）倒叙排列，最早推送的未锁定版本">
                <Icon type="question-circle" style={{cursor: 'pointer'}} />
              </Tooltip>）
              {
                !isEditMaxTag &&
                <Tooltip title="编辑">
                  <Icon
                    type="edit"
                    style={{ cursor: 'pointer', marginLeft: 8 }}
                    onClick={() => {
                      this.max_tags_count = max_tags_count
                      this.setState({ isEditMaxTag: true })
                    }}
                  />
                </Tooltip>
              }
              {
                isEditMaxTag && [
                  <Tooltip title="取消">
                    <Icon
                      key="cancel"
                      type="cross"
                      style={{ cursor: 'pointer', marginLeft: 8 }}
                      onClick={() => {
                        this.setState({ isEditMaxTag: false, max_tags_count: this.max_tags_count })
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="保存">
                    <Icon
                      key="save"
                      type="save"
                      style={{ cursor: 'pointer', marginLeft: 16 }}
                      onClick={this.onConfirmOk}
                    />
                  </Tooltip>
                ]
              }
            </span>
            {/* <div className='SearchInput' style={{ width: 280 }}>
              <div className='littleLeft'>
                <i className='fa fa-search' onClick={this.handleSearch} />
              </div>
              <div className='littleRight'>
                <Input
                  style={{ width: '80%' }}
                  // addonBefore={selectBefore}
                  onChange={this.handleInt}
                  placeholder={"请输入关键词搜索"}
                  onPressEnter={this.handleSearch}
                />
              </div>
            </div> */}
            <div className="right">
              <span style={{ verticalAlign: 'super' }}>共计 {dataAry.length} 条</span>
              {/* <Pagination className="pag" {...pageOption} /> */}
            </div>
          </div>
          <div className="body">
            <Table
              columns={columns}
              dataSource={dataAry}
              loading={isFetching}
              pagination={pageOption}
              rowSelection={isWrapStore ? null : rowSelection}
            />
          </div>
        </div>
        <Modal title="镜像版本详情" visible={this.state.detailVisible} style={{ paddingRight: 5, top: 40 }}
          onCancel={this.handleClose.bind(this)}
          wrapClassName="image-detail-modal"
          width="600"
          footer={[
            <Button key="back" type="primary" size="large" onClick={this.handleClose.bind(this)}>知道了</Button>,
          ]}>
          <ServiceAPI imageTags={edition} fullname={imageDetail.name ? imageDetail.name : imageDetail} />
        </Modal>
        <Modal title="删除版本" visible={this.state.deleteVisible}
          onCancel={this.handleDelClose.bind(this)}
          onOk={this.handleOk.bind(this)}>
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {
              deleteAll ? <p>该仓库中仅剩最后一个镜像版本，删除后整个{aryName}镜像仓库将被删除。</p> :
                <span>确认要删除镜像版本 {isBatchDel ? aryName : delValue} ？</span>
            }
          </div>
        </Modal>
        {
          isShowLockModel ?
            <Modal
              className="lockModal"
              visible={isShowLockModel}
              title={lockType === "lock" ? "锁定" : "解锁"}
              onOk={lockType === "lock" ? this.lockFunc : this.unLockFunc}
              okText={lockType === "lock" ? "确认锁定（不被清理)" : "确认解锁（允许清理)"}
              onCancel={() => this.setState({ isShowLockModel: false })}
            >
              {
                lockType === "lock" ?
                  <Alert className="alert" message={
                    <div>
                      <div className="left"><i className="fa fa-lock"></i></div>
                      <div className="right">
                        <div>锁定版本后，将不受自动清理旧版本功能影响！
                        一般为版本为稳定、常用版本时，保留备份使用！
                        <span className="hint">注：锁定版本的推送更新、手动删除不受锁定限制</span></div>
                        <div>确定锁定该版本，不被清理？</div>
                      </div>
                      <div className="clear"></div>
                    </div>
                  }>
                  </Alert>
                  :
                  <Alert className="alert" message={
                    <div>
                      <div className="left"><i className="fa fa-unlock"></i></div>
                      <div className="right">
                        <div>解锁版本后，将受自动清理旧版本功能影响！
                        若超镜像版本数量上限，且该版本为最旧，其将被优先清理！</div>
                        <div>确定解锁该版本？</div>
                      </div>
                      <div className="clear"></div>
                    </div>
                  }>
                  </Alert>
              }
            </Modal>
            :
            null
        }
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
  const { location } = props
  const { pathname } = location || { pathname: '' }
  const { imageTags } = state.harbor
  let processedName = encodeImageFullname(props.config.name)
  let targetImageTag = {}
  if (imageTags[DEFAULT_REGISTRY]) {
    targetImageTag = imageTags[DEFAULT_REGISTRY][processedName] || {}
  }
  let isWrapStore = false
  if (pathname === '/app_center/wrap_store') {
    isWrapStore = true
  }
  const { tag, server } = targetImageTag || defaultImageDetailTag

  const { cluster } =  state.entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    detailAry: tag,
    isFetching: targetImageTag.isFetching,
    isWrapStore,
    harbor,
    loginUser: state.entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  deleteAlone,
  loadRepositoriesTags,
  appStoreApprove,
  loadProjectMaxTagCount,
  updateProjectMaxTagCount,
  setRepositoriesTagLabel,
  delRepositoriesTagLabel,
  loadLabelList,
})(ImageVersion)