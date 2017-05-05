/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Tag Dropdown component
 *
 * v0.1 - 2017-5-5
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Tooltip } from 'antd'
import './style/tagDropdomn.less'
import cloneDeep from 'lodash/cloneDeep'

const SubMenu = Menu.SubMenu;

class TagDropdown extends Component {
  constructor(props){
    super(props)
    this.formtag = this.formtag.bind(this)
    this.handeldata = this.handeldata.bind(this)
    this.state = {
      data:  [
        {
          "id": 1,
          "key": "一夜暴富",
          "value": "长生不老",
          "target": "node"
        },{
          "id": 2,
          "key": "一夜暴富",
          "value": "长生请问请问请问2大声道不老",
          "target": "node"
        },{
          "id": 3,
          "key": "一夜暴富",
          "value": "长第三方士大夫三个地方干活生不老",
          "target": "node"
        },{
          "id": 4,
          "key": "人生赢家",
          "value": "月入百万",
          "target": "node"
        },{
          "id": 5,
          "key": "人生赢家",
          "value": "月入orepw[ijmdsflksaoeirwpo百万",
          "target": "node"
        },{
          "id": 6,
          "key": "人生赢家",
          "value": "qweqweqeqweqwe月入百万",
          "target": "node"
        },{
          "id": 7,
          "key": "一夜七次",
          "value": "微商直销",
          "target": "node"
        },{
          "id": 8,
          "key": "一夜七次",
          "value": "sdfdasfas",
          "target": "node"
        },{
          "id": 9,
          "key": "一夜七次",
          "value": "pofispdofksfsdfasfewirpoweropweik",
          "target": "node"
        }
      ]
    }
  }

  handeldata(){
    return []

    //const { data } = this.state
    //for(let i=0;i<data.length;i++){
    //  let value = []
    //  for(let j=0;j<data.length;j++){
    //    //if(!data[j].falg && data[i].key == data[j].key && ){
    //    //  value.push({
    //    //    id : data[j].id,
    //    //    value : data[j].value
    //    //  })
    //    //}
    //  }
    //}
    // console.log('state.data=',data)
    //let cloneData = cloneDeep(this.state.data)
    //console.log('cloneData=',cloneData)
    let datasource = []
    //const newData = cloneData.map((list)=> {
    //  list.value = {
    //    value:list.value,
    //    id:list.id,
    //  }
    //  return list
    //})
    //console.log('newData',newData)
    //return []
    //for(let i=0; i<cloneData.length ; i++){
    //  let value = []
    //  for(let j=0; j < cloneData.length; j++){
    //    if(i <= j && cloneData[i].key == cloneData[j].key){
    //      value.push({
    //        key : cloneData[j].id,
    //        value : cloneData[j].value
    //      })
    //    }
    //  }
    //  datasource.push({
    //    key : cloneData[i].key,
    //    value,
    //  })
    //}
    //console.log('datasource=',datasource)
    //return datasource
  }

  formtag(){
    const arr = this.handeldata()
    if(arr.length == 0){
      return <div>暂无标签</div>
    }
    let item = arr.map( (item, index) => {
      return item.value.map( (itemson,indexson ) => {
        return (<Menu.Item className='selectMenuSecond' key={itemson.key}>
          111111
        </Menu.Item>)
      })
    })

    let result = arr.map((item,index) => {
      return <SubMenu title={item.key}>
        <Menu.Item className='selectMenutitle'>
          <div>标签值</div>
        </Menu.Item>
        {item[index]}
      </SubMenu>
    })
    return (
      <Menu>
        <Menu.Item className='selectMenutitle'>
          <div>标签键</div>
        </Menu.Item>
        <Menu.Divider />
        {result}
      </Menu>
    )
  }

  render(){
    const { footer } = this.props
    return(
      <div id='tagdropdomn'>
        <Menu>
          {this.formtag()}
        {
          footer
          ? [<Menu.Divider />,
            <Menu.Item>
              <Icon type="plus" style={{marginRight:6}}/>
              创建标签
            </Menu.Item>,
            <Menu.Item>
              <span onClick={this.handleManageLabel}>
              <Icon type="setting" style={{marginRight:6}}/>
              标签管理
            </span>
            </Menu.Item>]
            : <Menu.Item></Menu.Item>
        }
        </Menu>
      </div>
    )
  }
}

export default TagDropdown;

{/*<Tooltip title={itemson.value}>*/}
  {/*<div className='name'>{itemson.value}</div>*/}
{/*</Tooltip>*/}
{/*<div className='num'>(<span>10</span>)</div>*/}
  {/*<div className='select'><Icon type="check-circle-o" /></div>*/}