/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Pop content
 *
 * v0.1 - 2016-11-15
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Input, Button, Spin, Icon, } from 'antd'
import './style/Content.less'
import { MY_SPACE } from '../../constants'
import classNames from 'classnames'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE

class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
  }

  componentWillMount() {
    const { list } = this.props
    this.setState({
      list,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { list } = nextProps
    this.setState({
      list,
    })
  }

  handleSearchInput() {
    const searchItem = this.refs.titleInput.refs.input.value
    const { list } = this.props
    let last = [];
    if(searchItem=="" || (searchItem.indexOf(" ")!=-1)){
      last = list
    }else {
      for(let i = 0;i < list.length;i++){
        if((list[i].name).indexOf(searchItem)!=-1) {
          last.push(list[i])
        }
      }
    }
    this.setState({
      list:last
    })
  }

  getSpecial() {
    const { onChange, special, popTeamSelect } = this.props
    if (!special && !popTeamSelect) {
      return
    }
    return (
      <div className="searchInt">
        <div style={{lineHeight:'30px'}}>
          用户
        </div>
        <ul className="searchList">
          <li
            onClick={() => onChange(MY_SPACE)}
            className="myItem">
            {
              popTeamSelect
                ? MY_SPACE.teamName
                : MY_SPACE.name
            }
          </li>
        </ul>
        <div style={{lineHeight:'25px'}}>
          团队空间
        </div>
      </div>
    )
  }

  render() {
    const { onChange, loading, special, popTeamSelect, Search } = this.props
    const { list } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>结果为空</div>
        :
        list.map((item) => {
          let { name, disabled, isOk } = item
          // Only for clusters
          if (disabled === undefined && isOk !== undefined) {
            disabled= !isOk
          }
          let liProps = {
            key: name,
            className: classNames({
              searchItem: true,
              itemDisabled: disabled
            })
          }
          if (!disabled) {
            liProps.onClick = () => onChange(item)
          }
          return (
            <li {...liProps}>
              {
                popTeamSelect ?
                  item.teamName
                  :
                  item.name
              }
            </li>
          )
        })
    )

    if (loading) {
      searchList = (
        <div className='loadingBox'>
          <Spin />
        </div>
      )
    }

    if(Search){
      return (
        <div className="PopSelectContent">
          {this.getSpecial()}
          <span className='titlesearch'>
            <Input
              placeholder="请输入空间名"
              size="large"
              ref='titleInput'
              id='titleInput'
              onChange={this.handleSearchInput}
              onPressEnter={this.handleSearchInput}
            />
            <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
          </span>
          <ul className="searchList">
            {searchList}
          </ul>
        </div>
      )
    }else{
      return (
        <div className="PopSelectContent">
          {this.getSpecial()}
          <ul className="searchList">
            {searchList}
          </ul>
        </div>
      )
    } 
  }
}

PopSelect.propTypes = {
  list: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  special: PropTypes.bool,
}

export default PopSelect