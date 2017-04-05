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
import { loadMirrorSafetyScanStatus, loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo } from '../../../../actions/app_center'

const BaseScanDescription = React.createClass({
  render: function () {
    const dataObj = this.props.description;
    let dataStr = ''
    console.log(dataObj)
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
    const { mirrorsafetyLyins } = this.props
    console.log('mirrorsafetyLyins', mirrorsafetyLyins)
    if (!mirrorsafetyLyins || !mirrorsafetyLyins.mirrorLyinsinfo.result) {
      return
    }
    const result = mirrorsafetyLyins.mirrorLyinsinfo.result
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
    this.state = {

    }
  }
  //直接调取lyins的结果
  componentWillMount() {
    const { loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo } = this.props
    const { mirrorScanstatus, imageName, mirrorScanUrl, cluster_id } = this.props
    const scanstatusCode = mirrorScanstatus.statusCode
    const scanStatus = mirrorScanstatus.status
    const blob_sum = mirrorScanstatus.blobSum || ''
    //const cluster_id = 'CID-fe23111d77cb'
    console.log('mirrorScanstatus=',mirrorScanstatus)
    const tag = 'latest'
    const registry = mirrorScanUrl
    const config = {
      cluster_id,
      imageName,
      tag,
      registry
    }
    if (scanstatusCode && scanstatusCode == 200) {
      switch(scanStatus){
        case 'lynis':
        case 'clair':
        case 'running':
        case 'both':
          return loadMirrorSafetyLyinsinfo({blob_sum})
        case 'noresult':
        case 'different':
        default:
          return loadMirrorSafetyScan({...config}, {
            success: {
              func: () =>{
                loadMirrorSafetyLyinsinfo({blob_sum})
              },
              isAsync: true
            }
          })
      }
    }
  }

  severLyins() {
    const { loadMirrorSafetyLyinsinfo, mirrorScanstatus } = this.props
    if(!mirrorScanstatus){
      return
    }
    const blob_sum = mirrorScanstatus.blobSum || ''
    loadMirrorSafetyLyinsinfo({ blob_sum })
  }

  TableSwitch() {
    const { mirrorsafetyLyins } = this.props
    if (!mirrorsafetyLyins || !mirrorsafetyLyins.mirrorLyinsinfo || !mirrorsafetyLyins.mirrorLyinsinfo.result) {
      return
    }
    const result = mirrorsafetyLyins.mirrorLyinsinfo.result
    const statusCode = result.statusCode
    const status = result.status
    const message = result.message
    if (statusCode && statusCode == 200) {
      switch (status) {
        case 'running':
          return <div className='BaseScanRunning'>
            <div className="top">正在扫描尚未结束</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.severLyins}>点击重新获取</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyLyins={mirrorsafetyLyins} />
        case 'failed':
          return <div className="BaseScanFailed">
            <div className='top'>扫描失败，请重新扫描</div>
            <Button onClick={this.severLyins}>点击重新获取</Button>
          </div>
        case 'nojob':
        default:
          return <div>没被触发过扫描</div>
      }
    } else {
      return <div>{message}</div>
    }
  }

  TableDataSource() {
    const { mirrorsafetyLyins } = this.props
    const result = mirrorsafetyLyins.mirrorLyinsinfo.result
    const report = result.report
    console.log(report)
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
    const { mirrorsafetyLyins } = this.props
    let status = ''
    if (mirrorsafetyLyins.mirrorLyinsinfo && mirrorsafetyLyins.mirrorLyinsinfo.result) {
      status = mirrorsafetyLyins.mirrorLyinsinfo.result.status
    }
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
  const { registry } = props
  let mirrorScanUrl = ''
  if (images.publicImages[registry] && images.publicImages[registry].server) {
    mirrorScanUrl = images.publicImages[registry].server || ''
  }
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorsafetyLyins = images.mirrorSafetyLyinsinfo
  return {
    cluster_id,
    registry,
    mirrorScanUrl,
    mirrorsafetyLyins
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScanStatus,
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo
})(BaseScan)