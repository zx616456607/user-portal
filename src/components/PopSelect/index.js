/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Menu, Dropdown, Icon, Select, Input, Button, Form, Popover, } from 'antd'
import './style/PopSelect.less'
import classNames from 'classnames'

export default class PopSelect extends Component{
  constructor(props){
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.setValue = this.setValue.bind(this)
    this.state = {
      spaceVisible: false,
      selectValue: '',
      focus: false,
      spaceArr : ['奔驰-CRM系统','奔驰-OA系统','奔驰-进销存系统'],
      resultArr: [],
    }
  }
  handleSearch(e) {
    let value = e.target.value
    const { spaceArr, resultArr } = this.state
    const result = []
    if(value === '' || !value){
      this.setState({
        resultArr: ['奔驰-CRM系统','奔驰-OA系统','奔驰-进销存系统'],
      })
    } else {
      spaceArr.map((item,index) => {
        let flag = item.indexOf(value)
        if(flag >= 0){
          result.push(item)
        }
      })
      this.setState({
        resultArr: result,
      })
    }
  }
  setValue(item){
    this.setState({
      selectValue: item,
    })
  }
  componentWillMount(){
    const { btnStyle, selectValue, resultArr } = this.props
    this.setState({
      resultArr: resultArr,
      selectValue: selectValue
    })
  }
  render(){
    const { btnStyle,  } = this.props
    const { selectValue } = this.state
    const text = <span className="PopSelectTitle">选择项目空间</span>
    const content = (
      <div className="PopSelectContent">
        <div className="ant-search-input-wrapper searchInt">
          <Input.Group className='ant-search-input'>
            <Input placeholder='查询' onChange={this.handleSearch}/>
            <div className="ant-input-group-wrap">
              <Button className='ant-search-btn'>
                <Icon type="search" />
              </Button>
            </div>
          </Input.Group>
        </div>
        <div>
          <ul className="searchList">
            {
              this.state.resultArr.length === 0 ?
                <div>无匹配结果</div>
                :
                this.state.resultArr.map((item) => {
                  return (
                    <li className="searchItem" onClick={() => this.setValue(`${item}`)}>{item}</li>
                  )
                })
            }
          </ul>
        </div>
      </div>
    )
    return (
      <div id="PopSelect">
        <Popover placement="bottomLeft" title={text} content={content} trigger="click"
                 getTooltipContainer={() => document.getElementById('PopSelect')}>
          {
            btnStyle ?
              <Button className='popBtn'>
                <i className="fa fa-sitemap" style={{float: 'left',marginTop: '3px'}}/>
                {selectValue}
                <Icon type="caret-down" />
              </Button> :
              <a className="ant-dropdown-link lineBtn" href="#">
                {selectValue}
                <i className="anticon anticon-caret-down"/>
              </a>
          }
        </Popover>
      </div>
    )
  }
}