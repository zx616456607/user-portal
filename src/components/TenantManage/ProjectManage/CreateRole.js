/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateRole
 *
 * v0.1 - 2017-07-28
 * @author zhangxuan
 */

import React, { Component } from 'react'
import { Row, Col, Button, Input, Modal, Transfer, Tree, Form } from 'antd'
import { connect } from 'react-redux'
import { ListRole, CreateRole, ExistenceRole } from '../../../actions/role'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { PermissionAndCount } from '../../../actions/permission'
import Notification from '../../../components/Notification'

class CreateRole extends Component{
  constructor(props) {
    super(props)
    this.state = {
    
    }
  }
}