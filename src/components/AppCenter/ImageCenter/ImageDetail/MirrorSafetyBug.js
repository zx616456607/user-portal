/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafetyBug component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafetyBug.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class MirrorSafetyBug extends Component {

  // 漏洞扫描table 子级
  tableSub() {
    // 表格数据结构
    const columns1 = [{
      title: '访问向量',
      // className: 'column-visite',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '访问的复杂性',
      // className:'column-indent',
      dataIndex: 'age',
      width: '18%',
      key: 'age',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '认证',
      // className:'column-indent',
      dataIndex: 'address',
      width: '15%',
      key: 'address',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '保密性的影响',
      // className:'column-indent',
      dataIndex: 'address1',
      width: '21%',
      key: 'address1',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '完整性的影响',
      // className:'column-fontSize',
      dataIndex: 'address2',
      key: 'address2',
      width: '21%',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }]

    // 表格数据
    const dataSource1 = [{
      key: '1',
      name: '网络',
      age: '低',
      address: '没有',
      address1: '完成',
      address2: '完成',
      // description:[<div>这是额外信息一<div>这是额外信息二</div></div>]
    }, {
      key: '2',
      name: '相邻网络',
      age: '中',
      address: '单',
      address1: '局部',
      address2: '局部',
    }, {
      key: '3',
      name: '本地',
      age: '高',
      address: '多',
      address1: '没有',
      address2: '没有',
    }]

    return (
      <div className='tablesub'>
        <div className='tablesubtitle'>矢量</div>
        <div className='tablesubbody'>
          <Table
            columns={columns1}
            dataSource={dataSource1}
            pagination={false}
            size="small"
          >
          </Table>
        </div>
        <div className='tablesubtitlefooter'>描述</div>
        <div className='tablesubtitlefooteritem' title="babadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;lj">babadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;lj</div>
      </div>
    )
  }

  render() {
    // 漏洞扫描 Option
    let safetybugOption = {
      tooltip: {
        formatter: '{b} : {c}'
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
            // formatter: function(param) {
            //   return param.percent.toFixed(0) + '%'
            // },
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
              const colorList = ['#fa4f55', '#f7a45e', '#fbc82f', '#c7eafe', '#2abd83'];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          // emphasis: {
          //   borderWidth: 0,
          //   shadowBlur: 7,
          //   shadowOffsetX: 0,
          //   shadowColor: 'rgba(0, 0, 0, 0.5)'
          // }
        }
      }]
    }

    // 漏洞扫描 表格数据格式
    const columns = [{
      title: 'CVE',
      width: '15%',
      dataIndex: 'name',
      key: 'name',
      render: text => (<span><span style={{ marginRight: '6px' }}>{text}</span><i className="fa fa-link" aria-hidden="true" style={{ color: '#9dd8f8' }} ></i></span>)
    }, {
      title: '严重',
      width: '13%',
      dataIndex: 'age',
      key: 'age',
      render: text => (<span><i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ marginRight: '8px', color: 'red' }}></i>{text}</span>),
      sorter: (a, b) => a.age - b.age,
    }, {
      title: '软件包',
      width: '11%',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: '当前版本',
      width: '15%',
      dataIndex: 'address1',
      key: 'address1',
    }, {
      title: '修正版',
      width: '15%',
      dataIndex: 'address2',
      key: 'address2',
      render: text => (<span style={{ color: '#5bcea3' }}><i className="fa fa-arrow-circle-right" aria-hidden="true" style={{ marginRight: '2px' }}></i>{text}</span>),
    }, {
      title: '位于镜像层',
      width: '27%',
      dataIndex: 'address3',
      key: 'address3',
      render: text => (<div><span className='safetybugtablepoint'>RUN</span>文件：<span className=''>{text}</span><i className="fa fa-database softwarepicturelright" aria-hidden="true"></i></div>),
    }]

    // 漏洞扫描 表格数据
    const dataSource = [{
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖',
      address1: '1weqeqweqwadas111111111111111111111111111111',
      address2: '2eqweqdsvdfsdf111111111111111111111111111111',
      address3: '3fsfesfsuofjuisdf1111111111111111111111111111111111111111111111111111111111111111',
      description: this.tableSub()
    }, {
      key: '2',
      name: '胡彦祖胡彦祖胡彦祖胡彦祖胡彦祖胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '3',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '4',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '5',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }]
    return (
      <div id="MirrorSafetyBug">
        <div className='safetybugEcharts'>
          <div style={{ width: '100%' }}>
            <ReactEcharts
              option={safetybugOption}
              style={{ height: '220px' }}
            />
          </div>
          <div className='safetybugEchartslegend'>
            <div className='safetybugEchartslegendtitle'>镜像安全扫描到190个漏洞，补丁为134个漏洞</div>
            <table>
              <tbody>
                <tr className='safetybugEchartslegendcontent'>
                  <td className='safetybugEchartslegendcontentleft'>
                    <i className="fa fa-square iconmargin highcolor" aria-hidden="true"></i>
                    高级别安全漏洞
									</td>
                  <td className='safetybugEchartslegendcontentright'>
                    <span className='highcolor rightmargin'>7</span>&nbsp;个
									</td>
                </tr>
                <tr className='safetybugEchartslegendcontent'>
                  <td className='safetybugEchartslegendcontentleft'>
                    <i className="fa fa-square iconmargin middlecolor" aria-hidden="true"></i>
                    中级别安全漏洞
									</td>
                  <td className='safetybugEchartslegendcontentright'>
                    <span className='middlecolor rightmargin'>89</span>&nbsp;个
									</td>
                </tr>
                <tr className='safetybugEchartslegendcontent'>
                  <td className='safetybugEchartslegendcontentleft'>
                    <i className="fa fa-square iconmargin lowcolor" aria-hidden="true"></i>
                    低级别安全漏洞
									</td>
                  <td className='safetybugEchartslegendcontentright'>
                    <span className='lowcolor rightmargin'>96</span>&nbsp;个
									</td>
                </tr>
                <tr className='safetybugEchartslegendcontent'>
                  <td className='safetybugEchartslegendcontentleft'>
                    <i className="fa fa-square iconmargin ignorecolor" aria-hidden="true"></i>
                    可忽略级别安全漏洞
									</td>
                  <td className='safetybugEchartslegendcontentright'>
                    <span className='ignorecolor rightmargin'>5</span>&nbsp;个
									</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className='safetybugmirror'>
          <div className='safetybugmirrortitle'>
            <div className='safetybugmirrortitleleft'>
              镜像漏洞
						</div>
            <div className="safetybugmirrortitleright">
              <Checkbox style={{ float: 'left', width: '120px', marginTop: '6px' }}>只显示可修复</Checkbox>
              <Input.Group style={{ float: 'left', width: '200px' }}>
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
          <div className="safetybugtable">
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              expandedRowRender={record => <span>{record.description}</span>}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}

export default (injectIntl(MirrorSafetyBug, {
  withRef: true,
}));
