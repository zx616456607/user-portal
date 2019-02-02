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
import { Input, Button, Spin, Icon, Collapse } from 'antd'
import './style/Content.less'
import { MY_SPACE } from '../../constants'
import classNames from 'classnames'
import IntlMessages from '../../containers/IndexPage/Enterprise/Intl'

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
const Panel = Collapse.Panel

class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    const { list } = props
    this.userListId = 'user_' +(Math.random() *10).toString(16)
    this.searchListId = 'search_' + (Math.random() *10).toString(16)
    this.state = {
      list,
    }
  }

  // componentWillMount() {
  //   const { list } = this.props
  //   this.setState({
  //     list,
  //   })
  // }

  componentWillReceiveProps(nextProps) {
    const { list, visible } = nextProps
    this.setState({
      list,
    })
    if (!visible) {
      this.refs.titleInput.refs.input.value = ''
    }
  }
  userListIndexSelect(num, mark) {
    const { userListIndex = 0 } = this.state
    let newList = userListIndex

    if (mark == '+') {
      if (userListIndex >= num) {
        newList = -1
      }
      ++ newList
    } else {
      if (userListIndex <= 0) {
        newList = ++ num
      }
      -- newList
    }

    const searchList = document.getElementById(this.userListId)
    this.setState({ userListIndex: newList },()=> {
      searchList.scrollTop = (newList-1) * 30;
    })
  }
  changeKeyCode(e) {
    const { list, listIndex } = this.state
    switch(e.keyCode) {
      case 38:{// up
        this.listIndexSelect(list.length -1,'-')
        return;
      }
      case 40:{// down
        this.listIndexSelect(list.length -1,'+')
        return;
      }
      case 13: {// enter
        this.props.onChange(list[listIndex])
        return
      }
      default: this.setState({listIndex: 0});
    }
  }
  listIndexSelect(num, mark) {
    const { listIndex=0 } = this.state
    let newList = listIndex

    if (mark == '+') {
      if (listIndex >= num) {
        newList = -1
      }
      ++ newList
    } else {
      if (listIndex <= 0) {
        newList = ++ num
      }
      -- newList
    }

    const searchList = document.getElementById(this.searchListId)
    this.setState({ listIndex: newList },()=> {
      searchList.scrollTop = (newList-1) * 30;
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

  render() {
    const {
      onChange, loading, special, popTeamSelect, Search,
      isSysAdmin, allUsers, collapseDefaultActiveKey
    } = this.props
    const { list, userSearchList, listIndex, userListIndex } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>结果为空</div>
        :
        list.map((item, index) => {
          let { name, disabled, isOk } = item
          // Only for clusters
          if (disabled === undefined && isOk !== undefined) {
            disabled= !isOk
          }
          let liProps = {
            key: name,
            title: name,
            className: classNames({
              searchItem: true,
              itemDisabled: disabled,
              selectItem: listIndex == index
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
    if (!special && !popTeamSelect) {
      return (
        <div className="PopSelectContent">
          <div style={{lineHeight:'25px'}}>
            {
              Search && (
                <span className='titlesearch'>
                  <Input
                    placeholder="请输入项目名"
                    size="large"
                    ref='titleInput'
                    id='titleInput'
                    onChange={this.handleSearchInput}
                    onPressEnter={this.handleSearchInput}
                    onKeyUp={(e)=> this.changeKeyCode(e)}
                  />
                  <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
                </span>
              )
            }
            <ul className="searchList" id={this.searchListId}>
              {searchList}
            </ul>
          </div>
        </div>
      )
    }
    const { formatMessage } = window._intl
    return (
      <div className="PopSelectContent">
        {
          Search && (
            <span className='titlesearch'>
              <Input
                placeholder="请输入项目名"
                size="large"
                ref='titleInput'
                id='titleInput'
                onChange={this.handleSearchInput}
                onPressEnter={this.handleSearchInput}
                onKeyUp={(e)=> this.changeKeyCode(e)}
              />
              <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
            </span>
          )
        }
        <ul className="searchList" id={this.searchListId}>
          {searchList}
        </ul>
        {/* <Collapse accordion defaultActiveKey={collapseDefaultActiveKey || ['team']} >
          <Panel header={formatMessage(IntlMessages.project)} key="team">

          </Panel>
        </Collapse> */}
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
