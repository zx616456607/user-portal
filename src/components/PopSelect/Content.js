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
          团队
        </div>
      </div>
    )
  }

  render() {
    const { onChange, loading, special, popTeamSelect } = this.props
    const { list } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>结果为空</div>
        :
        list.map((item) => {
          return (
            <li
              key={item.name}
              className="searchItem"
              onClick={() => onChange(item)}>
              {
                popTeamSelect ?
                  item.teamName :
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
        {this.getSpecial()}
        <ul className="searchList">
          {searchList}
        </ul>
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