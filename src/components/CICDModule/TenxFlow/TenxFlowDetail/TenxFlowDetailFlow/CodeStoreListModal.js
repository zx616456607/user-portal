/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeStoreListModal component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CodeStoreListModal.less'

const menusText = defineMessages({
  name: {
    id: 'CICD.Tenxflow.CodeStoreListModal.name',
    defaultMessage: '名称',
  },
  attr: {
    id: 'CICD.Tenxflow.CodeStoreListModal.attr',
    defaultMessage: '属性',
  },
  resource: {
    id: 'CICD.Tenxflow.CodeStoreListModal.resource',
    defaultMessage: '代码源',
  },
})

let CodeStoreListModal = React.createClass({
  getInitialState: function() {
    return {
    }
  },
  selectedCodeStore(id, name) {
    //this function for user select code store
    const { scope } = this.props;
    scope.setState({
      currentCodeStore: id,
      currentCodeStoreName: name,
      codeStoreModalShow: false,
      noSelectedCodeStore: false
    });
  },
  closeModal () {
    //this function for user close the env input modal
    const { scope } = this.props;
    scope.setState({
      codeStoreModalShow: false
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, config, hadSelected } = this.props;
    const codeItems = config.map((item, index) => {
      return (
      <QueueAnim key={'codeDetailAnimate' + index}>
        <div className={ item.id == hadSelected ? 'selectedCode codeDetail' : 'codeDetail' } key={'codeDetail' + index} onClick={this.selectedCodeStore.bind(this, item.id, item.name)}>
          <div className='commonTitle'>
            <span>{item.name}</span>
          </div>
          <div className='commonTitle'>
            <span>{item.isPrivate}</span>
          </div>
          <div className='commonTitle'>
            <span>{item.address}</span>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='CodeStoreListModal' key='CodeStoreListModal'>
        <div className='titleBox'>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.name} />
          </div>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.attr} />
          </div>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.resource} />
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='codeList'>
          {codeItems}
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

CodeStoreListModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(CodeStoreListModal, {
  withRef: true,
}));

