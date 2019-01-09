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
import { Spin, Button, Table } from 'antd'
import { injectIntl } from 'react-intl'
import baseScanIntl from './intl/baseScanIntl'
import mirrorSafetyBug from './intl/mirrorSafetyBugIntl'
import softwarePackage from './intl/softwarePackage'
import detailIndexIntl from './intl/detailIndexIntl'
import './style/BaseScan.less'
import { connect } from 'react-redux'
import { loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'

let BaseScanDescription = React.createClass({
  render: function () {
    const dataObj = this.props.description;
    const { formatMessage } = this.props.intl
    let dataStr = ''
    if (Object.keys(dataObj).length == 0) {
      dataStr = ' <div class="basicscantableSubOne"><i class="fa fa-minus" aria-hidden="true" style="margin-right: 8px"></i><span class="noneInfo">{formatMessage(baseScanIntl.noDataText)}</span></div>'
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
BaseScanDescription = injectIntl(BaseScanDescription, {withRef: true})

let TableTemplate = React.createClass({
  TableDataSource() {
    const { mirrorsafetyLyins, imageName, tag } = this.props
    if (!mirrorsafetyLyins[imageName] || !mirrorsafetyLyins[imageName][tag] || !mirrorsafetyLyins[imageName][tag].result) {
      return
    }
    const result = mirrorsafetyLyins[imageName][tag].result
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
TableTemplate = injectIntl(TableTemplate, {withRef: true})
class BaseScan extends Component {
  constructor(props) {
    super(props)
    this.TableSwitch = this.TableSwitch.bind(this)
    this.tableTemplate = this.tableTemplate.bind(this)
    this.TableDataSource = this.TableDataSource.bind(this)
    this.severLyins = this.severLyins.bind(this)
    this.severScanLyins = this.severScanLyins.bind(this)
    this.handlemirrorScanstatus = this.handlemirrorScanstatus.bind(this)
    this.handlemirrorScanstatusFialed = this.handlemirrorScanstatusFialed.bind(this)
    this.handlemirrorScanstatusSatus = this.handlemirrorScanstatusSatus.bind(this)
    this.state = {
      loadingRunning:false,
      basescanFailed:false,
    }
  }

  severLyins() {
    const { loadMirrorSafetyLyinsinfo, mirrorScanstatus, imageName, tag } = this.props
    this.setState({loadingRunning:true})
    if(!mirrorScanstatus){
      return
    }
    const scanstatus = mirrorScanstatus[imageName][tag].result
    const blob_sum = scanstatus.blobSum
    const full_name = scanstatus.fullName
    loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag},{
      success:{
        func: () => {
          this.setState({loadingRunning:false})
        }
      },
      failed: {
        func : () => {
          this.setState({basescanFailed : false})
        },
        isAsync : true
      }
    })
  }

  severScanLyins(){
    const { loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, cluster_id, imageName, tag, mirrorScanUrl, mirrorSafetyScan, mirrorScanstatus, scanFailed, formatErrorMessage } = this.props
    const registry = mirrorScanUrl
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    const config = {
      cluster_id,
      imageName,
      tag,
      registry,
      full_name
    }
    this.setState({basescanFailed : true})
    if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
      const { formatMessage } = this.props.intl
      return loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag},{
        success:{
          func: () => {
            this.setState({basescanFailed : false})
          },
          isAsync : true
        },
        failed: {
          func : () => {
            this.setState({basescanFailed : false})
          },
          isAsync : true
        }
      })
    }
    return loadMirrorSafetyScan({...config}, {
      success: {
        func: () =>{
          loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag},{
            success:{
              func: () => {
                this.setState({basescanFailed : false})
              },
              isAsync : true
            },
            failed: {
              func : () => {
                this.setState({basescanFailed : false})
              },
              isAsync : true
            }
          })
        },
        isAsync : true
      },
      failed: {
        func : (res) => {
          this.setState({basescanFailed : false})
          new NotificationHandler().error(formatMessage(detailIndexIntl.errMsg, {name: imageName, tag, msg: formatErrorMessage(res)}))
          //scanFailed('failed')
        },
        isAsync : true
      }
    })
  }

  TableSwitch() {
    const { mirrorsafetyLyins, imageName, tag } = this.props
    if (!mirrorsafetyLyins || !mirrorsafetyLyins[imageName] || !mirrorsafetyLyins[imageName][tag] || !mirrorsafetyLyins[imageName][tag].result) {
      return <div></div>
    }
    const result = mirrorsafetyLyins[imageName][tag].result
    const statusCode = result.statusCode
    const status = result.status
    const message = result.message
    const { formatMessage } = this.props.intl
    if(statusCode && statusCode == 500){
      return <div>{message}</div>
    }
    if (statusCode && statusCode == 200) {
      switch (status) {
        case 'running':
          return <div className='BaseScanRunning'>
            <div className="top">{formatMessage(mirrorSafetyBug.scanning)}</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.severLyins} loading={this.state.loadingRunning}>{formatMessage(mirrorSafetyBug.reload)}</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyLyins={mirrorsafetyLyins} imageName={imageName} tag={tag}/>
        case 'failed':
          return <div className="BaseScanFailed">
            <div className='top'>{formatMessage(softwarePackage.scanningFailure)}</div>
            <Button onClick={this.severScanLyins} loading={this.state.basescanFailed}>{formatMessage(mirrorSafetyBug.reload)}</Button>
          </div>
        case 'nojob':
        default:
          return <div className="BaseScanFailed">
            <div className="top">{formatMessge(softwarePackage.hasNotBeenScanned)}</div>
            <Button onClick={this.severScanLyins} loading={this.state.basescanFailed}>{formatMessge(softwarePackage.clickToScan)}</Button>
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

  handlemirrorScanstatusSatus(status){
    const { formatMessage } = this.props.intl
    switch(status){
      case 'noresult':
        return <span>{formatMessage(mirrorSafetyBug.hasNotAndReload)}</span>
      case 'different':
        return <span>{formatMessage(mirrorSafetyBug.differentResult)}</span>
      case 'failed':
        return <span>{formatMessage(mirrorSafetyBug.scanFailure)}</span>
      default:
        return <span></span>
    }
  }

  handlemirrorScanstatus(){
    const { imageName, tag, mirrorScanstatus, mirrorsafetyLyins } = this.props
    let status = ''
    if(mirrorScanstatus[imageName][tag].result.status){
      status = mirrorScanstatus[imageName][tag].result.status
    }
    const { formatMessage } = this.props.intl
    if(status == 'failed' || status == 'different'){
      if(!mirrorsafetyLyins[imageName] || !mirrorsafetyLyins[imageName][tag]){
        return (
          <div className='BaseScanFailed' data-status="scanstatusnosult">
            <div className='top'>{this.handlemirrorScanstatusSatus(status)}</div>
            <Button onClick={this.severScanLyins}>{formatMessage(mirrorSafetyBug.toScan)}</Button>
          </div>
        )
      }else{
        return <div>{this.TableSwitch()}</div>
      }
    }
    return <div>{this.TableSwitch()}</div>
  }

  handlemirrorScanstatusFialed(){
    const { imageName, tag, mirrorScanstatus } = this.props
    return <div>{mirrorScanstatus[imageName][tag].result.message}</div>
  }

  render() {
    const { imageName, tag, mirrorScanstatus } = this.props
    const { formatMessage } = this.props.intl
    let statusCode = 200
    let status = ''
    if(!mirrorScanstatus[imageName] || !mirrorScanstatus[imageName][tag] || !mirrorScanstatus[imageName][tag].result){
      return <div style={{textAlign:'center',paddingTop:'50px'}}><Spin /></div>
    }
    if(mirrorScanstatus[imageName][tag].result.status){
      status = mirrorScanstatus[imageName][tag].result.status
    }
    if(mirrorScanstatus[imageName][tag].result.statusCode == 500){
      statusCode == 500
    }
    return (
      <div id="BaseScan">
        <div className='basicscantitle alertRow'>
          {formatMessage(baseScanIntl.alert)}
        </div>
        <div className="basicscanmain">
          <div className='basicscanmaintitle'>
            <span className='basicscanmaintitleitem'>{formatMessage(baseScanIntl.baseScanRes)}</span>
          </div>
          <div className='basicscanmaintable'>
            {statusCode == 200 ? this.handlemirrorScanstatus() : this.handlemirrorScanstatusFialed()}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, images } = state
  const { imageType } = props
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server || ''
  }
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorsafetyLyins = images.mirrorSafetyLyinsinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  let mirrorSafetyScan = images.mirrorSafetyScan
  return {
    cluster_id,
    mirrorScanUrl,
    mirrorsafetyLyins,
    mirrorScanstatus,
    mirrorSafetyScan
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo
})(injectIntl(BaseScan, {withRef: true}))
