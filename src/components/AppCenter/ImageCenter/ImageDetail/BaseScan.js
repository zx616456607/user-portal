/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * BaseScan component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/BaseScan.less'
import { connect } from 'react-redux'
import { loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'

const BaseScanDescription = React.createClass({
  render: function () {
    const dataObj = this.props.description;
    let dataStr = ''
    if (Object.keys(dataObj).length == 0) {
      dataStr = ' <div class="basicscantableSubOne"><i class="fa fa-minus" aria-hidden="true" style="margin-right: 8px"></i><span class="noneInfo">暂无信息</span></div>'
      return (
        <div className='basicscantableSub' dangerouslySetInnerHTML={{ __html: dataStr }}></div>
      )
    } else {
      for (let key in dataObj) {
        dataStr = dataStr + ' <div class="basicscantableSubOne"><i class="fa fa-minus" aria-hidden="true" style="margin-right: 8px"></i>' + key + '<span class="spanmargin">:</span><span class="spancheck">' + dataObj[key] + '</span></div>'
      }
      return (
        <div className='basicscantableSub' dangerouslySetInnerHTML={{ __html: dataStr }}></div>
      )
    }
  }
});

const TableTemplate = React.createClass({
  TableDataSource() {
    const { mirrorsafetyLyins,imageName } = this.props
    if (!mirrorsafetyLyins[imageName] || !mirrorsafetyLyins[imageName].result) {
      return
    }
    const result = mirrorsafetyLyins[imageName].result
    const report = result.report
    const JsonFile = JSON.parse(report)
    const dataSource = []
    let index = 0
    let data = {
      key: '',
      outerItem: ''
    }
    for (let i in JsonFile) {
      index++
      data = {
        key: index,
        outerItem: i,
        description: <BaseScanDescription description={JsonFile[i]} />
      }
      dataSource.push(data)
      data = {
        key: '',
        outerItem: ''
      }
    }
    return dataSource
  },
  render: function () {
    const basicscanColumns = [{
      dataIndex: 'outerItem',
      key: "AAAA",
      className: 'basicscanColumns'
    }]
    return (
      <Table
        columns={basicscanColumns}
        dataSource={this.TableDataSource()}
        pagination={false}
        showHeader={null}
        expandedRowRender={record => (<div>{record.description}</div>)}
      >
      </Table>
    )
  }
});

class BaseScan extends Component {
  constructor(props) {
    super(props)
    this.TableSwitch = this.TableSwitch.bind(this)
    this.tableTemplate = this.tableTemplate.bind(this)
    this.TableDataSource = this.TableDataSource.bind(this)
    this.severLyins = this.severLyins.bind(this)
    this.severScanLyins = this.severScanLyins.bind(this)
    this.state = {

    }
  }

  severLyins() {
    const { loadMirrorSafetyLyinsinfo, mirrorScanstatus, imageName } = this.props
    if(!mirrorScanstatus){
      return
    }
    const blob_sum = mirrorScanstatus[imageName].blobSum
    const full_name = mirrorScanstatus[imageName].fullName
    loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name})
  }

  severScanLyins(){
    const { loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, cluster_id, imageName, tag, mirrorScanUrl, mirrorSafetyScan, mirrorScanstatus } = this.props
    const registry = mirrorScanUrl
    const full_name = mirrorScanstatus[imageName].fullName
    const blob_sum = mirrorScanstatus[imageName].blobSum
    const config = {
      cluster_id,
      imageName,
      tag,
      registry,
      full_name
    }
    if(mirrorSafetyScan[imageName]){
      return loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name})
    }
    return loadMirrorSafetyScan({...config}, {
      success: {
        func: () =>{
          loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name})
        },
        isAsync : true
      }
    })
  }

  TableSwitch() {
    const { mirrorsafetyLyins,imageName } = this.props
    if (!mirrorsafetyLyins || !mirrorsafetyLyins[imageName] || !mirrorsafetyLyins[imageName].result) {
      return
    }
    const result = mirrorsafetyLyins[imageName].result
    const statusCode = result.statusCode
    const status = result.status
    const message = result.message
    if(statusCode && statusCode == 500){
      return <div>{message}</div>
    }
    if (statusCode && statusCode == 200) {
      switch (status) {
        case 'running':
          return <div className='BaseScanRunning'>
            <div className="top">正在扫描尚未结束</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.severLyins}>点击重新获取</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyLyins={mirrorsafetyLyins} imageName={imageName}/>
        case 'failed':
          return <div className="BaseScanFailed">
            <div className='top'>扫描失败，请重新扫描</div>
            <Button onClick={this.severLyins}>点击重新获取</Button>
          </div>
        case 'nojob':
        default:
          return <div className="BaseScanFailed">
            <div className="top">镜像没有被扫描过</div>
            <Button onClick={this.severScanLyins}>点击扫描</Button>
          </div>
      }
    }
  }

  TableDataSource() {
    const { mirrorsafetyLyins,imageName } = this.props
    const result = mirrorsafetyLyins[imageName].result
    const report = result.report
    const JsonFile = JSON.parse(report)
    const dataSource = []
    let index = 0
    let data = {
      key: '',
      outerItem: ''
    }
    for (let i in JsonFile) {
      index++
      data = {
        key: index,
        outerItem: i,
        description: <BaseScanDescription description={JsonFile[i]} />
      }
      dataSource.push(data)
      data = {
        key: '',
        outerItem: ''
      }
    }
    return dataSource
  }

  tableTemplate() {
    return [{
      dataIndex: 'outerItem',
      key: "AAAA",
      className: 'basicscanColumns'
    }]


  }

  render() {
    return (
      <div id="BaseScan">
        <div className='basicscantitle alertRow'>
          镜像的安全扫描，这里提供的是一个静态的扫描，能检测出镜像的诸多安全问题，例如：端口暴露异常、是否提供了SSH Daemon等等安全相关。（注：请注意每个镜像的不同版本，安全报告可能会不同）
				</div>
        <div className="basicscanmain">
          <div className='basicscanmaintitle'>
            <span className='basicscanmaintitleitem'>基础扫描结果</span>
          </div>
          <div className='basicscanmaintable'>
            {this.TableSwitch()}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, images } = state
  let mirrorScanUrl = ''
  if (images.publicImages[DEFAULT_REGISTRY] && images.publicImages[DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images.publicImages[DEFAULT_REGISTRY].server || ''
  }
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorsafetyLyins = images.mirrorSafetyLyinsinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    cluster_id,
    mirrorScanUrl,
    mirrorsafetyLyins,
    mirrorScanstatus
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo
})(BaseScan)