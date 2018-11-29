/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * label module
 *
 * v0.1 - 2018-07-11
 * @author rensiwei
 */



import React, { Component } from 'react'
import { Table, Button, Popover, Input, Icon, Spin, Modal, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import { connect } from 'react-redux'
import TenxIcon from '@tenx-ui/icon/es/_old'
import Editor from './Editor'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { loadLabelList, updateLabel, createLabel, setImageLabel, deleteLabel } from '../../../../../actions/harbor'
import NotificationHandler from '../../../../../components/Notification'
import { formatDate } from "../../../../../common/tools";
import { remove, filter, cloneDeep } from 'lodash'
import TimeHover from '@tenx-ui/time-hover/lib'

const notification = new NotificationHandler()
// const confirm = Modal.confirm
const colors = [
  '#872ED8', '#AE64F4', '#4067FF', '#548CFE', '#2DB8F4',
  '#2BCFE5', '#00D183', '#27E09A', '#54C41A', '#83D167',
  '#FCBB00', '#F9B659', '#FF6A00', '#FF8A67', '#F5232B',
  '#F95561', '#EC3195', '#FB7F9E', '#687689', '#AABAC4',
]
class Project extends Component {
  state = {
    spinning: true,
    color: 'orange',
    selectedRows: [],
    isShowEditor: false,
    current: {},
    currPage: 1,
    data: [],
    searchInput: "",
    allData: [],
    delVisible: false,
    isDelLoading: false,
  }
  componentDidMount() {
    this.loadData()
  }
  handleColorChange = ({ hex: color }) => {
    console.log(color)
    this.setState({
      color,
    })
  }
  onRowChange = (selectedRowKeys, selectedRows) => {
    const { isShowEditor } = this.state
    // if (isShowEditor) return
    const lastItem = selectedRows.pop()
    this.setState({
      selectedRows: lastItem ? [lastItem] : [],
    })
  }
  loadData = () => {
    this.setState({
      spinning: true,
    }, () => {
      const { loadLabelList, harbor, scope, projectId } = this.props
      const query = {
        harbor,
        scope,
      }
      if(scope === "p"){
        query.project_id = projectId
      }
      loadLabelList(DEFAULT_REGISTRY, query, {
        success:{
          func: res => {
            const tempdata = res.data
            const data = []
            !!tempdata && tempdata.map(item => {
              if(item.id !== 1){
                data.push(item)
              }
            })
            if(!!data){
              this.setState({
                data,
                allData: data,
                searchInput: "",
                spinning: false,
                current: {},
              })
            }
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            this.setState({
              data: [],
              allData: [],
              searchInput: "",
              spinning: false,
            })
          },
          isAsync: true,
        }
      })
    })
  }
  reload = () => {
    this.loadData()
    this.onEditorCancel() // 重置
  }
  edit = () => {
    const { selectedRows, current } = this.state
    if (selectedRows.length === 1){
      this.setState({
        isShowEditor: true,
        current: selectedRows[0],
      })
    } else if(selectedRows.length === 0) {
      notification.warn('请选择一个标签')
    }
  }
  del = () => {
    const { selectedRows } = this.state
    if (selectedRows.length){
      this.setState({
        delVisible: true,
      })
      // const onOk =
      // confirm({
      //   modalTitle: "删除",
      //   content: "确定删除 [" + selectedRows.map((row, index, rows) => { return row.name +
      //     (index !== rows.length-1 ? ", " : "") }) + "] ?",
      //   onOk,
      // })
    } else {
      notification.warn('请选择标签')
    }
  }
  onDelOk = () => {
    this.setState({
      isDelLoading: true,
    }, () => {
      const { selectedRows, current } = this.state
      const { deleteLabel, harbor } = this.props
      selectedRows.map(async (row, index) => await deleteLabel(harbor, DEFAULT_REGISTRY, row.id, {
        success: {
          func: (res) => {
            notification.success("删除标签 [" + row.name + "] 成功")
            if(index >= selectedRows.length-1){
              this.loadData()
              this.setState({
                delVisible: false,
                selectedRows: [],
                current: {},
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.warn("删除标签 [" + row.name + "] 失败")
          }
        },
        finally: {
          func: () => {
            this.setState({
              isDelLoading: false,
            })
          }
        }
      }))
    })
  }
  add = () => {
    this.setState({
      current: {},
      isShowEditor: true,
    })
  }
  onEditorOk = params => {
    const { current } = this.state
    const { createLabel, updateLabel, harbor, scope, projectId } = this.props
    if (!!current.id) {
      const temp = {
        id: current.id,
        label: params,
      }
      updateLabel(harbor, DEFAULT_REGISTRY, temp, {
        success: {
          func: res => {
            // console.log(res)
            notification.success('修改标签成功')
            this.loadData()
            this.onEditorCancel()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            // console.log(err)
            if(err.statusCode === 409){
              notification.warn('标签名称重复')
            }else{
              notification.warn('修改标签失败')
            }
          },
          isAsync: true,
        },
      })
    } else {
      createLabel(harbor, DEFAULT_REGISTRY, Object.assign({}, params, {
        scope,
        project_id: projectId && scope !== 'g' ? projectId : 0,
      }), {
        success: {
          func: res => {
            // console.log(res)
            notification.success('新增标签成功')
            this.loadData()
            this.onEditorCancel()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            // console.log(err)
            if(err.statusCode === 409){
              notification.warn('标签名称重复')
            }else{
              notification.warn('新增标签失败')
            }
          },
          isAsync: true,
        },
      })
    }
  }
  onEditorCancel = () => {
    this.setState({
      isShowEditor: false,
      current: {},
      selectedRows: [],
    })
  }
  onTableChange = (pageination) => {
    this.setState({
      currPage: pageination.current
    })
  }
  onRowClick = record => {
    const { selectedRows } = this.state
    let temp = cloneDeep(selectedRows)
    !!filter(selectedRows, {
      id: record.id
    })[0] ?
    temp = remove(selectedRows, row => row.id !== record.id )
    :
    temp.push(record)
    const lastItem = temp.pop()
    this.setState({
      selectedRows: lastItem ? [lastItem] : [],
    })
  }
  onSearchChange = e => {
    const value = e.target.value
    this.setState({
      spinning: true,
    }, () => {
      const temp = []
      this.state.allData.map(o => o.name.indexOf(value) > -1 && temp.push(o) )
      this.setState({ searchInput: value, data: temp })
      setTimeout(() => {
        this.setState({
          spinning: false,
        })
      }, 500)
    })
  }
  render() {
    const { spinning, color, selectedRows, isShowEditor, current, currPage, data, searchInput, delVisible, isDelLoading } = this.state
    const { scope } = this.props
    const columns = [
      {
        title: '标签',
        width: '33%',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Tooltip title={text}>
            <div className={(record.color ? "" : "nocolor ") + "tag"} style={{ backgroundColor: record.color }}>
              {record.scope === 'g' ? <TenxIcon type="global-tag" /> : <TenxIcon type="tag" />}
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: '描述',
        width: '33%',
        dataIndex: 'description',
        key: 'description',
        render: text => <Tooltip title={text}><div className="description">{text}</div></Tooltip>
      },
      {
        title: '创建时间',
        width: '33%',
        dataIndex: 'creationTime',
        key: 'creationTime',
        render: text => <TimeHover time={text} />,
      },
    ]
    const rowSelection = {
      selectedRowKeys: selectedRows.map( row => row.id ),
      onChange: this.onRowChange,
      type: 'radio',
    }
    const tempData = filter(data, { scope })
    const total = tempData.length
    const pagination = {
      simple: true,
      current: currPage,
      defaultPageSize: 10,
      total,
    }
    let isHasLockTag = false
    selectedRows.map(o => {
      if (o.id === 1) isHasLockTag = true
    })
    const btnDelDisabled = selectedRows.length !== 1 || isHasLockTag //!selectedRows.length
    const btnEditDisabled = selectedRows.length !== 1
    return (
      <QueueAnim className='LabelModule'>
        <Spin spinning={spinning} key="main">
          <div className="topRow">
            <Button type="primary" size="large" onClick={this.add}><i className='fa fa-plus'/>&nbsp;新建标签</Button>
            <Button type="ghost" size="large" onClick={this.reload}><i className='fa fa-refresh'/>&nbsp;刷&nbsp;新</Button>
            <Button disabled={btnEditDisabled} type="ghost" size="large" onClick={this.edit}><i className='fa fa-edit'/>&nbsp;编&nbsp;辑</Button>
            <Button disabled={btnDelDisabled} type="ghost" size="large" onClick={this.del}><Icon type="delete" />删&nbsp;除</Button>
            <Input
              placeholder="按标签名称搜索"
              className="search"
              size="large"
              value={searchInput}
              onChange={this.onSearchChange}
            />
            <i className="fa fa-search" onClick={this.searchProjects}></i>
            {
              total ? <div className="total">共计 {total} 条</div> : null
            }
          </div>
          {
            isShowEditor ?
              <Editor
                current={current}
                onOk={this.onEditorOk}
                onCancel={this.onEditorCancel}
              />
              :
              null
          }
          <Table
            pagination={pagination}
            columns={columns}
            dataSource={tempData}
            rowKey={row => row.id}
            rowSelection={rowSelection}
            onChange={this.onTableChange}
            onRowClick={this.onRowClick}
          />
        </Spin>
        <Modal
          maskClosable={false}
          visible={delVisible}
          title="删除"
          onOk={this.onDelOk}
          confirmLoading={isDelLoading}
          onCancel={ () => this.setState({ delVisible: false })}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            <span style={{ wordBreak: 'break-all' }}> {"确定删除 [" + selectedRows.map((row, index, rows) => { return row.name +
            (index !== rows.length-1 ? ", " : "") }) + "] ?"}</span>
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { entities } = state;
  const { harbor: harbors } = entities.current.cluster;
  const harbor = harbors[0]
  return {
    harbor,
  };
};

export default connect(mapStateToProps,  {
  loadLabelList,
  updateLabel,
  createLabel,
  setImageLabel,
  deleteLabel,
})(Project)
