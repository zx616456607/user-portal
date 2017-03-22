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
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/SoftwarePackage.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class SoftwarePackage extends Component {

  render() {
    // 软件包 Option
    let softwareOption = {
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
        data: [
          { value: 7, name: '高级别安全漏洞', selected: true },
          { value: 89, name: '中级别漏洞' },
          { value: 96, name: '低级别漏洞' },
          { value: 5, name: '可忽略级别的漏洞' }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: false,
            position: 'center',
            formatter: '{b} : {c}',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
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
              const colorList = ['#f6565d', '#fea24c', '#f7c92d', '#c7e7fb', '#2abd83']
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

    // 软件包 表格数据格式
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
        render: text => (<div><i className="fa fa-exclamation-triangle" style={{ margin: '0 8px 0 2px ', color: '#f6565e' }} aria-hidden="true"></i>{text}</div>)
      },
      {
        title: '升级后的剩余',
        dataIndex: 'softwareremain',
        key: 'softwareremain',
        width: '16%',
        render: text => (<div><i className="fa fa-arrow-circle-right" aria-hidden="true" style={{ margin: '0 8px 0 1px', color: '#ffb56e' }}></i>{text}</div>)
      },
      {
        title: '升级的影响',
        dataIndex: 'softwareimpact',
        key: 'softwareimpact',
        width: '12%',
        render: text => (<div><i className="fa fa-signal" aria-hidden="true" style={{ color: '#53b552', marginLeft: '1px' }}></i></div>),
      },
      {
        title: '介绍了在图像',
        dataIndex: 'softwarepicture',
        key: 'softwarepicture',
        width: '30%',
        render: text => (<div><span className='softwarepicturelleft'>RUN</span>文件：<span>{text}</span><i className="fa fa-database softwarepicturelright" aria-hidden="true"></i></div>)
      }
    ]

    //	软件包数据
    const softwareData = [
      {
        key: "11",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "22",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasda'
      }, {
        key: "33",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "44",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "55",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "66",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "1",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }
    ]
    
    return (
      <div id="SoftwarePackage">
        <div className='softwarePackageEcharts' style={{ width: '100%' }}>
          <ReactEcharts
            option={softwareOption}
            style={{ height: '220px' }}
          />
          <div className='softwarePackageLegend'>
            <div className='softwarePackageLegendmain'>
              <table style={{ fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td className='softwarePackageLegendheader' colSpan="3">
                      镜像安全扫描器已经认识150包
									</td>
                  </tr>
                  <tr>
                    <td className='softwarePackageLegendmain1'>
                      <i className="fa fa-book" aria-hidden="true" style={{ color: '#f35860' }}></i>
                    </td>
                    <td className='softwarePackageLegendmain2'>
                      7封装
									</td>
                    <td>
                      高级别安全漏洞
									</td>
                  </tr>
                  <tr>
                    <td className='softwarePackageLegendmain1'>
                      <i className="fa fa-book" aria-hidden="true" style={{ color: '#fda34d' }}></i>
                    </td>
                    <td className='softwarePackageLegendmain2'>
                      89封装
									</td>
                    <td>
                      中级别漏洞
									</td>
                  </tr>
                  <tr>
                    <td className='softwarePackageLegendmain1'>
                      <i className="fa fa-book" aria-hidden="true" style={{ color: '#f7cb2e' }}></i>
                    </td>
                    <td className='softwarePackageLegendmain2' style={{ align: 'right' }}>
                      96封装
									</td>
                    <td>
                      低级别漏洞
									</td>
                  </tr>
                  <tr>
                    <td className='softwarePackageLegendmain1'>
                      <i className="fa fa-book" aria-hidden="true" style={{ color: '#c6e9fc' }}></i>
                    </td>
                    <td className='softwarePackageLegendmain2'>
                      1封装
									</td>
                    <td>
                      可忽略级别漏洞
									</td>
                  </tr>
                  <tr>
                    <td className='softwarePackageLegendmain1'>
                      <i className="fa fa-book" aria-hidden="true" style={{ color: '#2abe84' }}></i>
                    </td>
                    <td colSpan="2">
                      108封装没有漏洞
									</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='softwarePackageTable'>
          <div className='softwarePackageTableTitle'>
            <div className='softwarePackageTableTitleleft'>
              镜像所含软件包
						</div>
            <div className='softwarePackageTableTitleright'>
              <Input.Group style={{ width: '200px', marginRight: '35px' }}>
                <Select
                  combobox
                  notFoundContent=""
                  filterOption={false}
                  placeholder='Filter Vulnerabilities'
                  style={{ width: '180px', height: '30px', borderRadius: '3px 0 0 3px' }}
                >
                  <Option value="0">请选择1</Option>
                  <Option value="1">请选择1</Option>
                  <Option value="2">请选择2</Option>
                </Select>
                <div className="ant-input-group-wrap" style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '5px' }}>
                  <Button>
                    <Icon type="search" />
                  </Button>
                </div>
              </Input.Group>
            </div>
          </div>
          <div className='softwarePackageTableContent'>
            <Table
              columns={softwareColumns}
              dataSource={softwareData}
              pagination={false}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}

export default (injectIntl(SoftwarePackage, {
  withRef: true,
}));
