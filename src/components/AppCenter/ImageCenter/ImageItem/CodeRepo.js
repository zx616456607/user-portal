/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeRepo component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Tabs,Menu,Dropdown, Table, Icon, Button, Card, Input } from 'antd'
import { Link ,browserHistory} from 'react-router'
import '../style/CodeRepo.less'

class CodeRepo extends Component {
  constructor(props) {
    super()
  }
  render() {
    const server ='192.168.1.1'
    const dataSource = [
      {
        name: 'demo-1',
        downloadNumber: 1,
        address: '1',
      },
      {
        name: 'demo-2',
        downloadNumber: 2,
        address: '2',
      },
      {
        name: 'demo-33',
        downloadNumber: 1,
        address: '3',
      }
    ]
    const columns = [
      {
        title: '镜像名',
        dataIndex: 'name',
        key: 'name',
        render: (text,row) => {
          return (
            <div className="imageList">
              <div className="imageBox">
                <svg className='appcenterlogo'>
                  <use xlinkHref='#appcenterlogo' />
                </svg>
              </div>
              <div className="contentBox">
                <div className="title">
                  {text}
                </div>
              </div>
            </div>
          )
        }
      }, {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        render:(text, row) => {
          return (
            <div className="imgurl">镜像地址：{server}/{row.name}</div>
          )
        }
      }, {
        title: '下载',
        dataIndex: 'downloadNumber',
        key: 'downloadNumber',
        render: text => {
          return (
            <div>下载次数：{text}</div>
          )
        }
      }, {
        title: '部署',
        dataIndex: 'icon',
        key: 'icon',
        render: (text, row)=> {
          const dropdown = (
            <Menu onClick={()=> this.setState({delModal: true, imageName: row.name})}
              style={{ width: "100px" }}
            >
              <Menu.Item key={row.id}>
               删除
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button overlay={dropdown} type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${row.name}`)}>
              部署服务
            </Dropdown.Button>
          )
        }
      }
    ]

    return (
      <div id="codeRepo">
         <div className="topRow">
            <Button type="primary" size="large" icon="cloud-upload-o">上传镜像</Button>
            <Button type="ghost" size="large" icon="cloud-download-o">下载镜像</Button>

          <Input placeholder="搜索" className="search" size="large" />
          <i className="fa fa-search"></i>
          <span className="totalPage">共计：{dataSource.length} 条</span>
        </div>
        <Table showHeader={false} className="myImage_item" dataSource={dataSource} columns={columns} pagination={{ simple: true }} />
      </div>
    )
  }
}

export default CodeRepo