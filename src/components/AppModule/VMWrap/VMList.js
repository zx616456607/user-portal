/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-18
 * @author ZhaoYanbei
 */

import React from 'react'
import { Button, Table, Row, Card, Modal, Icon, Popover, Form,
  Input, Pagination, Tooltip, Dropdown, Menu } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/VMList.less'
import CommonSearchInput from '../../../components/CommonSearchInput'
import Title from '../../Title'
import { getJdkList, createTomcat, deleteTomcat, getTomcatList, getVMinfosList, postVMinfoList, delVMinfoList, putVMinfoList, checkVMUser, checkVminfoExists } from '../../../actions/vm_wrap'
import reduce from '../../../reducers/vm_wrap'
import CreateVMListModal from './CreateVMListModal/createListModal'
import NotificationHandler from '../../../components/Notification'
import classNames from 'classnames'
import CreateTomcat from './CreateTomcat'

const temp = [{ catalina_home_dir: './', name: 'Tomcat_1', serverStatus: 1, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_2', serverStatus: 0, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_3', serverStatus: 2, appCount: 2},
{ catalina_home_dir: './', name: 'Tomcat_1', serverStatus: 1, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_2', serverStatus: 0, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_3', serverStatus: 2, appCount: 2},
{ catalina_home_dir: './', name: 'Tomcat_1', serverStatus: 1, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_2', serverStatus: 0, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_3', serverStatus: 2, appCount: 2},
{ catalina_home_dir: './', name: 'Tomcat_1', serverStatus: 1, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_2', serverStatus: 0, appCount: 2}, { catalina_home_dir: './', name: 'Tomcat_3', serverStatus: 2, appCount: 2}]

const notification = new NotificationHandler()

class VMList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      modalTitle: true,
      editRows: [],
      isModal: false,
      isAdd: false,
      isPrompt: '',
      isShowText: false,
      isDelVisible: false,
      isDelete: false,
      ID: '',
      Name: '',
      creationTime: true,
      createTime: true,
      list: [],
      total: 0,
      host: '',
      isLoading: true,
      searchValue: '',
      isShowAddModal: false,
      isShowCheckModal: false,
      isShowConfirmRemove: false, //二次确认
      tomcatList: [], //当前选中行的 tomcatList
      allCount: [], //当前选中行的 所有端口
      currTom: {},
      removeConfirmLoading: false,
      loading: false, //详情页的table loading
      createConfirmLoading: false,
      currVM: {},
      searchOptionValue: 'host',
    }
  }

  getInfo(n, value) {
    const { getVMinfosList } = this.props
    const { createTime, searchOptionValue } = this.state
    let notify = new NotificationHandler()
    const query = {
      page: n || 1,
      size: 10,
      sort: createTime ? "create_time" : "-create_time"
    }
    query[searchOptionValue] = value
    getVMinfosList(query, {
      success: {
        func: res => {
          res.results.map(item =>{
            item.createTime = item.createTime.replace('T',' ')
            item.createTime = item.createTime.split('.')[0]
          })
          if (res.statusCode === 200){
            this.setState({
              total: res.count,
              list: res.results,
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: res => {
          if (res.statusCode < 500) {
            notify.warn('获取数据失败', res.message || res.message.message)
          } else {
            if (res.statusCode == 501) {
              notify.warn('环境异常，请联系管理员处理')
              return
            }
            notify.error('获取数据失败', res.message || res.message.message)
          }
        }
      },
      finally: {
        func: () => {
          this.setState({
            isLoading: false
          })
        }
      }
    })
  }

  componentWillMount() {
    this.loadData()
  }
  loadData = () => {
    this.setState({
      isLoading: true,
    }, () => {
      const { searchValue } = this.state
      this.getInfo(1, searchValue)
    })
  }

  /**
   * 回调添加
   * @param {*} state
   */
  vmAddList(state) {
    const { postVMinfoList, putVMinfoList } = this.props
    const { searchValue } = this.state
    let res = {
      /*vmInfoName: 'root',*/
      vmInfoID: this.state.editRows.vminfoId !== null ? this.state.editRows.vminfoId : '',
      host: state.host,
      account: state.account,
      password: state.password,
      jdk_id: state.jdk_id,
      name: state.name,
    }
    if (this.state.isAdd) {
      postVMinfoList(res, {
        success: {
          func: res => {
            if (res.statusCode === 201 || res.statusCode === 200) {
              notification.success(`添加成功`)
              notification.close()
            }
            this.getInfo(null, searchValue)
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 400) {
              notification.error(err.message)
              return
            }
            notification.error(`添加失败`)
          }
        }
      })
    } else {
      putVMinfoList(res, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              notification.success(`修改成功`)
              notification.close()
              this.getInfo(null, searchValue)
            }
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            notification.error(`修改失败`)
          }
        }
      })
    }
  }

  /**
   * 添加信息
   */
  handleA() {
    this.setState({
      visible: true,
      modalTitle: true,
      isModal: true,
      isAdd: true
    })
    const self = this
    setTimeout(() => {
      document.querySelector('.vmModalName').focus()
    },100)
    setTimeout(function () {
      if (self.focusInput) {
        self.focusInput.refs.input.focus()
      }
    }, 0)
  }

  /**
   * 编辑信息
   */
  handleE(row) {
    this.setState({
      editRows: row,
      visible: true,
      modalTitle: false,
      isModal: true,
      isAdd: false
    })
  }

  /**
   * 删除信息
   */
  handleDel() {
    const { delVMinfoList } = this.props
    const { searchValue, ID } = this.state
    notification.spin(`删除 ${this.state.host} 中...`)
    this.state.isDelete ?
      delVMinfoList({
        vmID: ID
      }, {
          success: {
            func: res => {
              if (res.statusCode === 204) {
                notification.close()
                notification.success(`删除 ${this.state.host} 成功`)
                this.setState({
                  isDelVisible: false,
                  isDelete: false
                })
                this.getInfo(null, searchValue)
              }
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notification.error('删除失败！')
            }
          }
        }) : ''
  }

  /**
   * 信息验证
   * @param check
   */
  vmCheck(check) {
    const { checkVMUser } = this.props
    let query = {
      host: check.host,
      account: check.account,
      password: check.password
    }
    checkVMUser(query, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            return res.statusCode
          }
        }
      }, failed: {
        func: err => {
          this.setState({
            Prompt: false,
            isShow: false
          })
        }
      }
    })
  }

  /**
   * 查询
   * @param values
   */
  handleSearch(values) {
    this.setState({
      name: values
    })
    this.getInfo(1, values)
  }

  /**
   * 显示密文
   */
  handleChange(index) {
    this.setState({
      [`password${index}`]: !this.state[`password${index}`]
    })
  }

  /**
   * 关闭删除对话框
   */
  handleClose() {
    this.setState({
      isDelVisible: false
    })
  }

  /**
   * 确定删除
   */
  handleOK(e, record) {
    const { vminfoId, Name, host } = record
    switch(e.key) {
      case 'delete':
        this.setState({
          isDelVisible: true,
          isDelete: true,
          ID: vminfoId,
          Name: Name,
          host: host,
        })
      break;
    case 'check':
      this.getTomcatListFunc(record)
      this.setState({
        currVM: record || {},
      })
      break;
    case 'add':
      this.setState({
        isShowAddModal: true,
        // tomcatList: temp, //todo record.xxx
        allPort: record.ports,
        currVM: record || {},
      })
      break;
    default:
      break;
    }
  }
  getTomcatListFunc = record => {
    this.setState({
      isShowCheckModal: true,
      loading: true,
    }, () => {
      const { getTomcatList } = this.props
      getTomcatList({
        vminfo_id: record.vminfoId,
      }, {
        success: {
          func: res => {
            res.results && this.setState({
              tomcatList: res.results
            })
          },
        },
        finally: {
          func: () => {
            this.setState({
              loading: false,
            })
          }
        }
      })
    })
  }
  handleSort() {
    const { createTime, searchValue } = this.state
    this.getInfo(null, searchValue);
    if (createTime) {
      this.setState({
        createTime: false
      })
    } else {
      this.setState({
        createTime: true
      })
    }
  }
  getStatus = (status, name, isRemoveName) => {
    let color
    let text
    switch (status) {
      case 1 :
        color = '#2db7f5' //in prosess
        text = '启动中'
        break;
      case 2 :
        color = '#33b867' // succ
        text = '运行中'
        break;
      case 0 :
        color = '#f23e3f' // err
        text = '停止'
        break;
    }
    return (
      <div className="line">
        {isRemoveName === true ? '' : name} <span className="status">
          <i style={{ backgroundColor: color }} className="circle"/> {text}
        </span>
      </div>
    )
  }
  renderStatus(record) {
    let successCount = 0
    let errorCount = 0
    let startCount = 0
    const tomcats = record.tomcatStatus
    // let javaMessage = ''
    // let tomcatMessage = ''
    let allCount = tomcats.length
    const poverContent = tomcats.map(item => {
      if (item.status === 0) { errorCount++ }
      else if (item.status === 2) { successCount++ }
      else if (item.status === 1) { startCount++ }
      return this.getStatus(item.status, item.name)
    })
    return(
      <div>
        <div className={errorCount ? 'warnColor' : 'successColor'}>
          <i className={classNames("circle", {'successCircle': !errorCount, 'warnCircle': errorCount})}/>
          {successCount === tomcats.length ? '正常' : ''}
          {errorCount ? '异常' : ''}
          {!errorCount && startCount ? '启动中' : ''}
        </div>
        {/* <div>
          {
            successCount !== 2 &&
              <Tooltip
                title={
                  tomcatMessage + ' ' + javaMessage
                }
              >
                <Icon type="exclamation-circle-o" className="warnColor" style={{ marginRight: 5 }}/>
              </Tooltip>
          }
          {`${successCount}/2 运行中`}
        </div> */}
        <div>
          <Popover overlayClassName="vmListPopover" placement="right" content={poverContent} trigger="hover">
            <span>{`${successCount}/${allCount} 运行中`}</span>
          </Popover>
        </div>
      </div>
    )
  }
  addTomcat = values => {
    this.setState({
      createConfirmLoading: true,
    }, () => {
      //   {
      //     name: "tomcat_2",
      //     "start_port": "8000",
      //     "catalina_home_dir": "/usr/local/tomcat_2",
      //     "catalina_home_env": "CATALINA_HOME_TOMCAT_2"
      //  }
      const { createTomcat } = this.props
      values.vminfo_id = this.state.currVM.vminfoId
      values.name = values.tomcat_name
      createTomcat(values, {
        success: {
          func: res => {
            console.log(res)
            if (res.statusCode === 200) {
              notification.success(`新建 ${values.name} 成功`)
              this.setState({
                isShowAddModal: false,
              })
              this.loadData()
            }
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 500) {
              notification.warn('端口号重复')
            } else {
              notification.warn('新建 Tomcat 失败')
            }
          }
        },
        finally: {
          func: () => {
            this.setState({
              createConfirmLoading: false,
            })
          }
        }
      })
    })
  }
  onRemove = () => {
    this.setState({
      removeConfirmLoading: true,
    }, () => {
      const { currTom, currVM } = this.state
      console.log('当前行', currTom)
      const { deleteTomcat } = this.props
      deleteTomcat({
        id: currTom.id
      }, {
        success: {
          func: res => {
            if (res.status === 200 || res.statusCode === 200) {
              this.setState({
                currTom: {},
                // isShowCheckModal: false,
                isShowConfirmRemove: false,
              })
              // this.loadData()
              this.getTomcatListFunc(currVM)
              notification.success("卸载成功")
            }
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notification.warn("卸载失败")
          }
        },
        finally: {
          func: () => {
            this.setState({
              removeConfirmLoading: false,
            })
          }
        }
      })
    })
  }
  getSearchOptionValue = value => {
    this.setState({
      searchOptionValue: value,
    })
  }
  render() {
    const { data } = this.props
    const { list, total, searchValue, isShowAddModal, isShowConfirmRemove, createConfirmLoading,
      tomcatList, allPort, isShowCheckModal, currTom, removeConfirmLoading, currVM } = this.state
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: total,
      onChange: (n) => this.getInfo(n, searchValue)
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: text => {
          return text || '-'
        }
      },
      {
        title: '虚拟机IP',
        dataIndex: 'host',
        key: 'host',
        ID: 'vminfoId'
      },
      {
        title: '运行状态',
        render: (text, record) => this.renderStatus(record)
      },
      {
        title: '登录账号',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: '登录密码',
        dataIndex: 'password',
        key: 'password',
        render: (text, record, index) =>
          <div>
            <span ref="info" className="info">{this.state[`password${index}`] ? text : '******'}</span>
            <Icon
              type={this.state[`password${index}`] ? 'eye-o' : 'eye'}
              style={{ float: 'right', marginRight: 30 }}
              onClick={this.handleChange.bind(this, index)} />
          </div>
        ,
      },
      {
        title: '服务数量',
        dataIndex: 'serviceCount',
        key: 'serviceCount',
        sorter: (a, b) => a.serviceCount - b.serviceCount,
      },
      {
        title: (
          <div onClick={() => this.handleSort()}>
            创建时间
            <div className="ant-table-column-sorter">
              <span className={this.state.createTime ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.createTime ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作',
        /*key: 'operation',*/
        ID: 'vminfoId',
        render: (text, record, index) => {
          let fStyle = {
            marginRight: '6%'
          }
          const menu = (
            <Menu onClick={(e) => this.handleOK(e, record)}>
              <Menu.Item key="add">&nbsp;添加 Tomcat 实例&nbsp;&nbsp;</Menu.Item>
              <Menu.Item key="check">&nbsp;查看/卸载 Tomcat 实例&nbsp;&nbsp;</Menu.Item>
              <Menu.Item key="delete">&nbsp;删除&nbsp;&nbsp;</Menu.Item>
            </Menu>
          )
          return (
            <Dropdown.Button onClick={()=>this.handleE(record)} overlay={menu} type="ghost">
              编辑信息
            </Dropdown.Button>
          )
        }
      },
    ]
    const rowSelection = {
      // onSelect:(record)=> console.log(record),
      // onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
      onChange: (selectedRowKeys, selectedRows) => {
      }
    };
    const scope = this
    const checkColumns = [
      {
        title: '实例',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '状态',
        dataIndex: 'serverStatus',
        key: 'serverStatus',
        render: (text, record) => this.getStatus(record.serverStatus, record.name, true),
      },
      {
        title: '安装路径',
        dataIndex: 'catalinaHomeDir',
        key: 'catalinaHomeDir',
      },
      {
        title: '部署应用',
        dataIndex: 'appCount',
        key: 'appCount',
      },
      {
        title: '操作',
        dataIndex: 'e',
        key: 'operation',
        ID: 'operation',
        render: (text, record) => {
          return <Button onClick={() => { this.setState({
            currTom: record,
            isShowConfirmRemove: true,
          }) }}>卸载</Button>
        }
      },
    ]
    const selectProps = {
      defaultValue: '虚拟机IP',
      selectOptions : [{
        key: 'host',
        value: '虚拟机IP'
      }, {
        key: 'name',
        value: '名称'
      }]
    }
    return (
      <QueueAnim>
        <div key="VMList" id="VMList">
          <Title title="传统应用环境"/>
          <Row>
            <Button type='primary' size='large' className='addBtn' onClick={() => this.handleA()}>
              <i className='fa fa-plus' /> 添加传统环境
            </Button>
            <Button type="ghost" size="large" className="manageBtn" onClick={() => this.loadData()} ><i className='fa fa-refresh' /> 刷 新</Button>
            {/*<Button type="ghost" icon="delete" size="large" className="manageBtn">删除</Button>*/}
            {/* <Input className="search" placeholder="请输入虚拟机IP搜索" size="large" onSearch={(e) => this.handleSearch(e)} /> */}
            <CommonSearchInput selectProps={selectProps} onChange={searchValue => this.setState({searchValue})} getOption={this.getSearchOptionValue} onSearch={(value) => { this.getInfo(1, value) }} size="large" placeholder="请输入搜索内容" />
            { total !== 0 && <Pagination className="pag" {...pagination} />}
            { total !== 0 && <span className="total">共 {total} 个</span>}
          </Row>
          <Table
            pagination={false}
            loading={this.state.isLoading}
            columns={columns}
            dataSource={list}
          />
          {
            this.state.isModal ?
              <CreateVMListModal
                scope={scope}
                modalTitle={this.state.modalTitle}
                visible={this.state.visible}
                onSubmit={this.vmAddList.bind(this)}
                Rows={this.state.editRows}
                isAdd={this.state.isAdd}
                Check={this.vmCheck.bind(this)}
              >
              </CreateVMListModal> : ''
          }
          <Row>
            <Modal
              title={"删除传统环境"}
              visible={this.state.isDelVisible}
              onCancel={() => this.handleClose()}
              footer={[
                <Button key="back" size="large" type="ghost" onClick={() => this.handleClose()}>  取 消 </Button>,
                <Button key="submit" size="large" type="primary" onClick={() => this.handleDel()}> 确 定 </Button>,
              ]}
            >
              <div className="deleteHint"><i className="fa fa-exclamation-triangle"/>是否删除当前传统应用环境？</div>
              {/* <span style={{ fontSize: 16, color: '#ff0000' }}><Icon size={15} style={{ color: '#ff0000' }} type="question-circle-o" />是否删除当前传统应用环境</span> */}
            </Modal>
          </Row>
          {
            isShowAddModal ?
              <CreateTomcat
                isRight={true}
                form={this.props.form}
                isNeedModal={true}
                title="添加 Tomcat 实例"
                onOk={this.addTomcat}
                onCancel={() => this.setState({ isShowAddModal: false })}
                visible={isShowAddModal}
                tomcatList={tomcatList}
                allPort={allPort}
                confirmLoading={createConfirmLoading}
                jdk_id={currVM.jdkId}
                username={currVM.user}
              />
              :
              null
          }
          {
            isShowCheckModal ?
              <Modal
                title="查看/卸载 Tomcat 实例"
                width="650px"
                visible={isShowCheckModal}
                closable={false}
                footer={<Button size="large" onClick={() => {
                  this.setState({ isShowCheckModal: false })
                  this.loadData()
                }}>
                    关闭
                  </Button>}
                wrapClassName="checkTomcatModalWapper"
              >
                <Table
                  columns={checkColumns}
                  dataSource={tomcatList}
                  pagination={{
                    defaultCurrent: 1,
                    defaultPageSize: 5,
                    total: tomcatList.length,
                  }}
                  loading={this.state.loading}
                />
              </Modal>
              :
              null
          }
          {
            isShowConfirmRemove ?
              <Modal
                title="卸载"
                onCancel={() => { this.setState({ isShowConfirmRemove: false, currTom: {} }) }}
                onOk={this.onRemove}
                visible={isShowConfirmRemove}
                confirmLoading={removeConfirmLoading}
              >
                <div className="deleteRow">
                  <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
                  确定卸载实例 {currTom.name}？
                </div>
              </Modal>
              :
              null
          }
        </div>
      </QueueAnim>

    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  getVMinfosList,
  delVMinfoList,
  postVMinfoList,
  putVMinfoList,
  checkVMUser,
  checkVminfoExists,
  getTomcatList,
  getJdkList,
  deleteTomcat,
  createTomcat,
})(Form.create()(VMList))
