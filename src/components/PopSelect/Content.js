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
    this.handleSearchUserInput = this.handleSearchUserInput.bind(this)
    const { list, allUsers } = props
    this.userListId = 'user_' +(Math.random() *10).toString(16)
    this.searchListId = 'search_' + (Math.random() *10).toString(16)
    this.state = {
      list,
      userSearchList: allUsers,
      userSearchInput: '',
    }
  }

  // componentWillMount() {
  //   const { list } = this.props
  //   this.setState({
  //     list,
  //   })
  // }

  componentWillReceiveProps(nextProps) {
    const { list, allUsers } = nextProps
    this.setState({
      list,
      userSearchList: allUsers,
    })
  }
  userKeyCode(e) {
    const { userSearchList,userListIndex  } = this.state
    switch(e.keyCode) {
      case 38:{// up
        this.userListIndexSelect(userSearchList.length -1,'-')
        return;
      }
      case 40:{// down
        this.userListIndexSelect(userSearchList.length -1,'+')
        return;
      }
      case 13: {// enter
        this.props.onChange(userSearchList[userListIndex])
        return
      }
      default: this.setState({userListIndex: 0});
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

  handleSearchUserInput(e) {
    const { userSearchInput, userSearchList } = this.state
    const { allUsers } = this.props
    let value = e.target.value
    if (typeof value !== undefined) {
      value = value.trim()
    } else {
      value = userSearchInput
    }
    this.setState({
      userSearchInput: value,
      userSearchList: allUsers.filter(user => user.userName.indexOf(value) > -1),
    })
  }

  getSpecial() {
    const { onChange, special, popTeamSelect } = this.props
    if (!special && !popTeamSelect) {
      return
    }
    return (
      <div className="searchInt">
        {/* <div style={{lineHeight:'30px'}}>
          用户
        </div> */}
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
      </div>
    )
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
    let userList
    if (isSysAdmin) {
      userList = (
        <div>
          <span className='titlesearch'>
            <Input
              placeholder="请输入用户名"
              size="large"
              onChange={this.handleSearchUserInput}
              onPressEnter={this.handleSearchUserInput}
              onKeyUp={(e)=> this.userKeyCode(e)}
            />
            <Icon type="search" className='titleicon' onClick={this.handleSearchUserInput}/>
          </span>
          <ul className="searchList" id={this.userListId}>
            {
              userSearchList.length === 0
                ? <div className='loadingBox'>结果为空</div>
                :
                userSearchList.map((user, index) => {

                  let liProps = {
                    key: user.namespace + index,
                    className: classNames({
                      searchItem: true,
                      selectItem: userListIndex == index
                    })
                  }
                  return(
                    <li {...liProps}  onClick={onChange.bind(this, user)}>
                    {user.userName}
                    </li>
                  )
                })
            }
          </ul>
        </div>
      )
    }
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
        {this.getSpecial()}
        <Collapse accordion defaultActiveKey={collapseDefaultActiveKey || ['team']} >
          {
            isSysAdmin && (
              <Panel header={formatMessage(IntlMessages.personalProject)} key="user">
                {userList}
              </Panel>
            )
          }
          <Panel header={formatMessage(IntlMessages.sharedProject)} key="team">
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
          </Panel>
        </Collapse>
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
