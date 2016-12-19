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
const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE

class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
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

  getSpecial() {
    const { onChange, special, popTeamSelect } = this.props
    if (!special && !popTeamSelect) {
      return
    }
    return (
      <div>
        <div>
          用户
        </div>
        <ul className="searchList">
          <li
            onClick={() => onChange(MY_SPACE)}
            className="searchItem">
            {
              popTeamSelect?
              MY_SPACE.teamName:
              MY_SPACE.name
            }
          </li>
        </ul>
        <div>
          团队
        </div>
      </div>
    )
  }

  handleSearch(e) {
    const { list, popTeamSelect } = this.props
    let value = e.target.value
    let cpList = popTeamSelect?
      list.filter(item => {
        item.index = item.teamName.indexOf(value)
        if (item.index > -1) {
          return item
        }
      }):
      list.filter(item => {
        item.index = item.name.indexOf(value)
        if (item.index > -1) {
          return item
        }
      })
    const sortList = function (a, b) {
      return a.index - b.index
    }
    cpList.sort(sortList)
    this.setState({
      list: cpList
    })
  }

  render() {
    const { onChange, loading, special, popTeamSelect } = this.props
    const { list } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>无匹配结果</div>
        :
        list.map((item) => {
          return (
            <li
              key={item.name}
              className="searchItem"
              onClick={() => onChange(item)}>
              {
                popTeamSelect?
                item.teamName:
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

    return (
      <div className="PopSelectContent">
        <div className="ant-search-input-wrapper searchInt">
          {this.getSpecial()}
          <Input.Group className='ant-search-input'>
            <Input placeholder='查询' onChange={this.handleSearch} />
            <div className="ant-input-group-wrap">
              <Button className='ant-search-btn'>
                <Icon type="search" />
              </Button>
            </div>
          </Input.Group>
        </div>
        <div>
          <ul className="searchList">
            {searchList}
          </ul>
        </div>
      </div>
    )
  }
}

PopSelect.propTypes = {
  list: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  special: PropTypes.bool,
}

export default PopSelect