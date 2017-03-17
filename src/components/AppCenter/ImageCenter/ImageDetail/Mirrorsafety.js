/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafety component
 *
 * v0.1 - 2017-3-14
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card , Spin ,Icon, Select, Tabs, Button, Steps, Radio, Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafety.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step

class MirrorSafety extends Component {
  testContent() {
    return (
      <div className='safetytabitem'>
        <span className='safetytabitemtitle'>CMD</span>
        <div className='safetytabitemdescription'>dsadadadadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd</div>
      </div>
    )
  }
  render() {
    // 漏洞扫描 Option
    let bugOption = {
      // title:{
      //   text:'镜像安全扫描检测到190个漏洞，补丁为134个漏洞',
      //   left:78,
      //   top:40,
      //   textAlign: 'left',
      //   backgroundColor:'red',
      //   textStyle: {
      //     fontWeight:'normal',
      //     fontSize:18,
      //     color: 'black'
      //   }
      // },
      // tooltip: {
      //   trigger: 'item',
      //   formatter: '{b} : {c}'
      // },
      
      legend: {
        orient:'vertical',
        top:88,
        left:375,
        itemGap:10,
        formatter:function(name,value){
          return name + value + '个'
        },
        data:[
          {value: 7, name:'高级别安全漏洞',selected:true},
          {value: 89, name:'中级别漏洞'},
          {value: 96, name:'低级别漏洞'},
          {value: 5, name:'可忽略级别的漏洞'}
        ]
      },
      series:[{
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 5,
        radius: ['50', '70'],
        center: ['225px', '110px'],
        data:[          
          {value: 7, name:'高级别安全漏洞',selected:true},
          {value: 89, name:'中级别漏洞'},
          {value: 96, name:'低级别漏洞'},
          {value: 5, name:'可忽略级别的漏洞'}
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter:'{b} : {c}',
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
            // color:['#f5585f'],
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

    return (
      <div id='mirrorsafety'>
        <div className='safetyselect'>
          <Select className='safetyselectson' placeholder='选择镜像版本，查看安全报告'>
            <Option value='0'>选择镜像版本，查看安全报告</Option>
            <Option value='1'>选择镜像版本，查看安全报告</Option>
            <Option value='2'>选择镜像版本，查看安全报告</Option>
          </Select>
        </div>
        <div className='safetytabcontainer'>
          <ul className='safetytab'>
            <li className='safetytabpane safetytabpaneradius1 safetytabpaneselected'>镜像分层</li>
            <li className='safetytabpane '>漏洞扫描</li>
            <li className='safetytabpane'>软件包</li>
            <li className='safetytabpane safetytabpaneradius2'>基础扫描</li>
          </ul>

          {/* 镜像分层 */}
          <div style={{ display:'none'}}>
            <div style={{width:'100%',paddingTop:'40px'}} className='safetycontent' >
              <ul style={{width:'104px',float:'left'}}>
                <li>11111111111</li>
                <li>11111111111</li>
                <li>11111111111</li>
                <li>11111111111</li>
                <li>11111111111</li>
              </ul>
              <Steps direction="vertical" size='small' current={2} className='safetycontentmian'
              >
                <Step description={this.testContent()} className='safetycontentmianitem'/>
                <Step title={null} description={this.testContent()} className='safetycontentmianitem'/>
                <Step title={null} description={this.testContent()} className='safetycontentmianitem'/>
                <Step title={null} description={this.testContent()} className='safetycontentmianitem'/>
              </Steps>
            </div>
          </div>

          {/* 漏洞扫描 */}
          <div className='safetybug'>
            <ReactEcharts
              style={{width:'890px',height:'220px',border:'1px solid red',margin:'0 auto'}}
              option = {bugOption}
            />
            {/*镜像漏洞*/}
            <div className='safetybugmirror'>
              <div className='safetybugmirrortitle'>
                <div className='safetybugmirrortitleleft'>
                  镜像漏洞
                </div>
                <div className="safetybugmirrortitleright">
																		<Radio>只显示可修复</Radio>

	                 <Input.Group>
		                  <Select placeholder='Filter Vulnerabilities' style={{width:'180px',height:'30px',borderRadius:'3px',float:'right'}}>

		                  </Select>
																				<Option value>
		                 <div className="ant-search-input-wrapper" style={this.props.style}>
			                 <Input.Group>
				                 <Select>

				                 </Select>
				                 <div className="ant-input-group-wrap">
					                 <Button >
						                 <Icon type="search" />
					                 </Button>
				                 </div>
			                 </Input.Group>
		                 </div>





	                 </Input.Group>
                </div>
              </div>
            </div>
          </div> 

        </div>
      </div>
    )
  }
}

export default (injectIntl(MirrorSafety, {
  withRef: true,
}));