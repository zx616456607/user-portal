/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * SoftwarePackage component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/SoftwarePackage.less'
import { loadMirrorSafetyScan, loadMirrorSafetyChairinfo, loadMirrorSafetyLayerinfo } from '../../../../actions/app_center'
import { connect } from 'react-redux'

const Option = Select.Option

class SoftwarePackage extends Component {
  constructor(props) {
    super(props)
    this.TableData = this.TableData.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      None: 0,
      Total: 0
    }
  }

  TableData() {
    const { mirrorsafetyClair, mirrorLayeredinfo } = this.props
    if (!mirrorsafetyClair.mirrorchairinfo.result) {
      return []
    }
    const result = mirrorsafetyClair.mirrorchairinfo.result
    const features = result.report.features
    const vulnerabilities = result.report.vulnerabilities
    const fixedIn = result.report.fixedIn
    let tableDataSource = []
    let index = 1
    //let command = {}
    //let arrBug = []
    //let bugcell = [
    //  { sortNum: 0, High: 0 },
    //  { sortNum: 0, Medium: 0 },
    //  { sortNum: 0, Low: 0 },
    //  { sortNum: 0, Unknown: 0 },
    //  { sortNum: 0, Negligible: 0 },
    //  { sortNum: 0, Other: 0 }
    //]
    //let bugcellObj = []
    //let bugcellSlice = []
    //let bugcellValue = {
    //  nameOne: '',
    //  valueOne: '',
    //  nameTwo: '',
    //  valueTwo: ''
    //}
    //let nameStr = ''
    //let namevnlner = ''
    //let availableRepair = []
    //let unavailableRepair = []
    //let impact = 0
    // Echarts 数据
    let EchartsUnknownNum = 0
    let EchartsNegligibleNum = 0
    let EchartsLowNum = 0
    let EchartsMediumNum = 0
    let EchartsHighNum = 0
    let EchartsNoneNum = 0

    for (let key in features) {
      let command = {}
      let arrBug = []
      let bugcell = [
        { sortNum: 0, High: 0 },
        { sortNum: 0, Medium: 0 },
        { sortNum: 0, Low: 0 },
        { sortNum: 0, Unknown: 0 },
        { sortNum: 0, Negligible: 0 },
        { sortNum: 0, Other: 0 }
      ]
      let bugcellObj = []
      let bugcellSlice = []
      let bugcellValue = {
        nameOne: '',
        valueOne: '',
        nameTwo: '',
        valueTwo: ''
      }
      let nameStr = ''
      let namevnlner = ''
      let availableRepair = []
      let unavailableRepair = []
      let impact = 0

      // 漏洞数据获取
      // 找到当前包的漏洞信息，并将其存入一个数组
      if (features[key].vulnerabilities.length !== 0) {
        // 升级后的剩余
        nameStr = key.replace(/-/g, '')
        nameStr = nameStr.substring(0, 1).toUpperCase() + nameStr.substring(1, nameStr.length)
        for (let j = 0; j < features[key].vulnerabilities.length; j++) {
          // 升级后的影响
          namevnlner = (features[key].vulnerabilities[j]).replace(/-/g, '')
          namevnlner = namevnlner.substring(0, 1).toLowerCase() + namevnlner.substring(1, namevnlner.length)
          // 遍历 fixedIn ， 判断当前漏洞是否可修复
          for (let fixed in fixedIn) {
            if (namevnlner == fixed) {
              availableRepair.push(fixedIn[fixed])
            } else {
              unavailableRepair.push(features[key].vulnerabilities[j])
            }
          }
          for (let k in vulnerabilities) {
            if (vulnerabilities[k].name == features[key].vulnerabilities[j]) {
              arrBug.push(vulnerabilities[k])
            }
          }
        }
        impact = features[key].vulnerabilities.length - availableRepair.length
      } else {
        EchartsNoneNum++
      }

      // 遍历漏洞信息中的 安全等级，将安全等级信息存入一个数组中
      if (arrBug.length > 0) {
        for (var arr = 0; arr < arrBug.length; arr++) {
          switch (arrBug[arr]['severity']) {
            case "High":
              let HighNum = parseInt(bugcell[0]['High'])
              bugcell[0]['High'] = HighNum + 1
              bugcell[0]['sortNum'] = HighNum + 1
              EchartsHighNum = EchartsHighNum + 1
            case "Medium":
              let MediumNum = parseInt(bugcell[1]["Medium"])
              bugcell[1]["Medium"] = MediumNum + 1
              bugcell[1]["sortNum"] = MediumNum + 1
              EchartsMediumNum = EchartsMediumNum + 1
            case "Low":
              let LowNum = parseInt(bugcell[2]["Low"])
              bugcell[2]["Low"] = LowNum + 1
              bugcell[2]["sortNum"] = LowNum + 1
              EchartsLowNum = EchartsLowNum + 1
            case "Unknown":
              let UnknownNum = parseInt(bugcell[3]["Unknown"])
              bugcell[3]["Unknown"] = UnknownNum + 1
              bugcell[3]["sortNum"] = UnknownNum + 1
              EchartsUnknownNum = EchartsUnknownNum + 1
            case "Negligible":
              let NegligibleNum = parseInt(bugcell[4]["Negligible"])
              bugcell[4]["Negligible"] = NegligibleNum + 1
              bugcell[4]["sortNum"] = NegligibleNum + 1
              EchartsNegligibleNum = EchartsNegligibleNum + 1
            default:
              let OtherNum = parseInt(bugcell[5]["Other"])
              bugcell[5]["Other"] = OtherNum + 1
              bugcell[5]["sortNum"] = OtherNum + 1
              EchartsUnknownNum = EchartsUnknownNum + 1
          }
        }
      } else {
        bugcell = [
          { sortNum: 0, High: 0 },
          { sortNum: 0, Medium: 0 },
          { sortNum: 0, Low: 0 },
          { sortNum: 0, Unknown: 0 },
          { sortNum: 0, Negligible: 0 },
          { sortNum: 0, Other: 0 }
        ]
      }

      //将取到的漏洞状态进行排序
      let max = 0
      for (let a = 0; a < bugcell.length; a++) {
        for (let b = a + 1; b < bugcell.length; b++) {
          if (bugcell[a].sortNum > bugcell[b].sortNum) {
            max = bugcell[a]
            bugcell[a] = bugcell[b]
            bugcell[b] = max
          }
        }
      }

      //取出漏洞状态的前两位，准备传入table中
      if (bugcell.length >= 2) {
        bugcellSlice = bugcell.slice(4)
        if (bugcellSlice[0].sortNum == 0 && bugcellSlice[1].sortNum == 0) {
          bugcellValue.nameOne = '暂无数据'
        } else {
          delete bugcellSlice[0].sortNum
          delete bugcellSlice[1].sortNum
          for (let d = 0; d < bugcellSlice.length; d++) {
            for (let e in bugcellSlice[d]) {
              bugcellObj.push(e)
              bugcellObj.push(bugcellSlice[d][e])
            }
          }
          bugcellValue.nameOne = bugcellObj[2]
          bugcellValue.valueOne = bugcellObj[3]
          bugcellValue.nameTwo = bugcellObj[0]
          bugcellValue.valueTwo = bugcellObj[1]
        }
      }

      // 介绍了图像
      for (let i = 0; i < mirrorLayeredinfo.length; i++) {
        if (mirrorLayeredinfo[i].iD == features[key].layerID) {
          command = mirrorLayeredinfo[i].command
        }
      }
      let data = {
        key: index.toString(),
        softwarename: features[key].name,
        softwareversions: features[key].version,
        softwarebug: bugcellValue,
        softwareremain: impact,
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: command
      }
      tableDataSource.push(data)

      index++
      //command = {}
      //arrBug = []
      //bugcell = [
      //  { sortNum: 0, High: 0 },
      //  { sortNum: 0, Medium: 0 },
      //  { sortNum: 0, Low: 0 },
      //  { sortNum: 0, Unknown: 0 },
      //  { sortNum: 0, Negligible: 0 },
      //  { sortNum: 0, Other: 0 }
      //]
      //bugcellSlice = []
      //bugcellObj = []
      //bugcellValue = {
      //  nameOne: '',
      //  valueOne: '',
      //  nameTwo: '',
      //  valueTwo: ''
      //}
      //nameStr = ''
      //namevnlner = ''
      //availableRepair = []
      //unavailableRepair = []
    }
    return {
      tableDataSource,
      newData: {
        EchartsUnknownNum,
        EchartsNegligibleNum,
        EchartsLowNum,
        EchartsMediumNum,
        EchartsHighNum,
        EchartsNoneNum
      }
    }
  }

  componentDidMount() {
    const newDate = this.TableData().newData
    this.setState({
      Unknown: newDate.EchartsUnknownNum,
      Negligible: newDate.EchartsNegligibleNum,
      Low: newDate.EchartsLowNum,
      Medium: newDate.EchartsMediumNum,
      High: newDate.EchartsHighNum,
      None: newDate.EchartsNoneNum,
      Total: (newDate.EchartsUnknownNum + newDate.EchartsNegligibleNum + newDate.EchartsLowNum + newDate.EchartsMediumNum + newDate.EchartsHighNum + newDate.EchartsNoneNum)
    })
  }

  render() {
    const { Unknown, Negligible, Low, Medium, High, None } = this.state
    function EchartsGapTemplate(num) {
      let str = num.toString()
      switch (str.length) {
        case 1:
        default:
          return '   ' + '    ' + num + '  封装' + '      '
        case 2:
          return '   ' + '  ' + num + '  封装' + '      '
        case 3:
          return '   ' + num + '  封装' + '      '
      }
    }
    // 软件包 Option
    let softwareOption = {
      title: {
        text: '镜像安全扫描器已经认识 ' + this.state.Total + ' 包',
        textStyle: {
          fontWeight: 'normal'
        },
        left: '45%',
        top: '12%',
      },
      legend: {
        show: true,
        orient: 'vertical',
        height: 'auto',
        left: '45%',
        top: '30%',
        data: ['高级别安全漏洞', '中级别安全漏洞', '低级别安全漏洞', '可忽略级别漏洞', '未知的漏洞', '没有漏洞'],
        formatter: function (name) {
          if (name == '高级别安全漏洞') {
            return EchartsGapTemplate(High) + name
          }
          if (name == '中级别安全漏洞') {
            return EchartsGapTemplate(Medium) + name
          }
          if (name == '低级别安全漏洞') {
            return EchartsGapTemplate(Low) + name
          }
          if (name == '可忽略级别漏洞') {
            return EchartsGapTemplate(Negligible) + name
          }
          if (name == '未知的漏洞') {
            return EchartsGapTemplate(Unknown) + name
          }
          if (name == '没有漏洞') {
            return EchartsGapTemplate(None) + name
          }
        },
        textStyle: {
          fontSize: 14,
          color: '#666'
        },
      },
      tooltip: {
        formatter: '{b}:{c}'
      },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 5,
        radius: ['50', '70'],
        center: ['25%', '50%'],
        minAngle: '5',
        data: [
          { value: this.state.High, name: '高级别安全漏洞', selected: true },
          { value: this.state.Medium, name: '中级别安全漏洞' },
          { value: this.state.Low, name: '低级别安全漏洞' },
          { value: this.state.Negligible, name: '可忽略级别漏洞' },
          { value: this.state.Unknown, name: '未知的漏洞' },
          { value: this.state.None, name: '没有漏洞' }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: '{b} {c}',
            //formatter: function (param) {
            //  return param.percent.toFixed(0) + '%'
            //},
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              const colorList = ['#f6565d', '#fea24c', '#f7c92d', '#c7e7fb', 'grey', '#2abd83']
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 7,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]

    }

    //软件包 表格数据格式
    const softwareColumns = [
      {
        title: '包名称',
        dataIndex: 'softwarename',
        key: 'softwarename',
        width: '13%'
      },
      {
        title: '包版本',
        dataIndex: 'softwareversions',
        key: 'softwareversions',
        width: "16%",
      },
      {
        title: '漏洞',
        dataIndex: 'softwarebug',
        key: 'softwarebug',
        width: "13%",
        render: text => (
          <div className='softwarebug'><i className="fa fa-exclamation-triangle softwarebugspan" style={{ margin: '0 8px 0 2px ', color: '#f6565e' }} aria-hidden="true"></i><span>{text.nameOne}</span><span>{text.valueOne}</span><span>{text.nameTwo}</span><span>{text.valueTwo}</span></div>)
      },
      {
        title: '升级后的剩余',
        dataIndex: 'softwareremain',
        key: 'softwareremain',
        //width:'16%',
        width: '12%',
        render: text => (<div className='softwareremain'><i className="fa fa-arrow-circle-right softwareremainspan" aria-hidden="true"></i>{text}</div>)
      },
      //{
      //  title: '升级的影响',
      //  dataIndex: 'softwareimpact',
      //  key: 'softwareimpact',
      //  width: '12%',
      //  render: text => (
      //    <div><i className="fa fa-signal" aria-hidden="true" style={{ color: '#53b552', marginLeft: '1px' }}></i></div>),
      //},
      {
        title: '介绍了在图像',
        dataIndex: 'softwarepicture',
        key: 'softwarepicture',
        width: '30%',
        render: (text) => (
          <div className='softwarepicture'><span className='softwarepicturelleft'>{text.action}</span><Tooltip title={text.parameters}><span className="textoverflow softwarepicturespan">{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true"></i></div>)
      }
    ]

    //软件包 数据分页
    const softwarePagination = {
      total: this.TableData().length,
      showSizeChanger: true,
    }
    return (
      <div id="SoftwarePackage">
        <div className='softwarePackageEcharts' style={{ width: '100%' }}>
          <ReactEcharts
            option={softwareOption}
            style={{ height: '220px' }}
          />
        </div>
        <div className='softwarePackageTable'>
          <div className='softwarePackageTableTitle'>
            <div className='softwarePackageTableTitleleft'>
              镜像所含软件包
            </div>
            {/*<div className='softwarePackageTableTitleright'>*/}
            {/*<Input.Group style={{ width: '200px', marginRight: '35px' }}>*/}
            {/*<Select*/}
            {/*combobox*/}
            {/*notFoundContent=""*/}
            {/*filterOption={false}*/}
            {/*placeholder='Filter Vulnerabilities'*/}
            {/*style={{ width: '180px', height: '30px', borderRadius: '3px 0 0 3px' }}*/}
            {/*>*/}
            {/*<Option value="0">请选择1</Option>*/}
            {/*<Option value="1">请选择1</Option>*/}
            {/*<Option value="2">请选择2</Option>*/}
            {/*</Select>*/}
            {/*<div className="ant-input-group-wrap"*/}
            {/*style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '5px' }}>*/}
            {/*<Button>*/}
            {/*<Icon type="search" />*/}
            {/*</Button>*/}
            {/*</div>*/}
            {/*</Input.Group>*/}
            {/*</div>*/}
          </div>
          <div className='softwarePackageTableContent'>
            <Table
              columns={softwareColumns}
              dataSource={this.TableData().tableDataSource}
              pagination={softwarePagination}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}

export default SoftwarePackage