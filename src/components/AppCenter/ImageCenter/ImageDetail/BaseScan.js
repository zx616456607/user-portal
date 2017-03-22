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
import ReactEcharts from 'echarts-for-react'
import './style/BaseScan.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class BaseScan extends Component {
  
  // 基础扫描table 子级
  basicscantableSub() {
    return (
      <div className='basicscantableSub' style={{ background: 'white', padding: '10px 0' }}>
        <div style={{ lineHeight: '26px', fontSize: '16px', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title="12321313123131231aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa          aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
        <i className="fa fa-minus" aria-hidden="true" style={{ marginRight: '8px' }}></i>
        12321313123131231aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
					aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
					aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
				</div>
      <div style={{ lineHeight: '26px', fontSize: '16px' }} title="12321313123131231"><i className="fa fa-minus" aria-hidden="true" style={{ marginRight: '8px' }}></i>12321313123131231</div>
			</div >
		)
  }

  render() {
    //	基础扫描 数据格式
    const basicscanColumns = [{
      dataIndex: 'aaaa',
      key: "AAAA",
      className: 'basicscanColumns'
    }]

    //	基础扫描 数据
    const basicscanData = [
      {
        key: '1',
        aaaa: 'asdasdadadadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        description: this.basicscantableSub()
      }, {
        key: '2',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '3',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '4',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '5',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }
    ]

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
            <Table
              columns={basicscanColumns}
              dataSource={basicscanData}
              pagination={false}
              showHeader={null}
              expandedRowRender={record => (<div>{record.description}</div>)}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}

export default (injectIntl(BaseScan, {
  withRef: true,
}));
