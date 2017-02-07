/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OtherSpace component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Spin,Input, Modal } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {DeleteOtherImage, SearchOtherImage, getOtherImageList} from '../../../actions/app_center'
import './style/OtherSpace.less'
import ImageDetailBox from './ImageDetail/OtherDetail.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.OtherSpace.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.OtherSpace.belong',
    defaultMessage: '类型：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.OtherSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.OtherSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.OtherSpace.deployService',
    defaultMessage: '部署服务',
  },
  logout: {
    id: 'AppCenter.ImageCenter.OtherSpace.logout',
    defaultMessage: '注销',
  },
  noData: {
    id: 'AppCenter.ImageCenter.OtherSpace.noData',
    defaultMessage: '暂无数据',
  }
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  showImageDetail: function (imageName) {
    //this function for user select image and show the image detail info
     const {scope, imageId} = this.props
     scope.setState({
      imageDetailModalShow:true,
      currentImage:imageName
     });
  },
  render: function () {
    const ipAddress = (this.props.otherHead.url).split('//')[1]
    const {isFetching , config } = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0) {
      return (
        <div className='loadingBox'>
          <FormattedMessage {...menusText.noData} />
        </div>
      )
    }
    let items = config.map((item) => {
      return (
        <div className='imageDetail' key={item} >
          <div className='imageBox'>
            <svg className='appcenterlogo'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
          </div>
          <div className='contentBox'>
            <span className='title' onClick={this.showImageDetail.bind(this, item)}>
              {item}
            </span><br />
            <span className='type'>
              <FormattedMessage {...menusText.belong} />&nbsp;私有
            </span>
            <span className='imageUrl textoverflow'>
              <FormattedMessage {...menusText.imageUrl} />&nbsp;
            <span className=''>{ipAddress}/{item}</span>
            </span>

          </div>
          <div className='btnBox'>
            <Button type='ghost' onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${ipAddress}&imageName=${item}&other=${this.props.imageId}`)}>
              <FormattedMessage {...menusText.deployService} />
            </Button>
          </div>
        </div>
      );
    });
    return (
      <div className='imageList'>
        {items}
      </div>
    );
  }
});

class OtherSpace extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false
    }
  }

  componentWillMount() {
    const { getOtherImageList, imageId } = this.props;
    getOtherImageList(imageId);
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }

  deleteImage() {
    const parentScope = this.props.scope
    this.setState({delModal: false})
    const scope = this
    this.props.DeleteOtherImage(this.state.imageId, {
      success:{
        func: () => {
          const imageRow = scope.props.imageRow
          parentScope.setState({
            otherImageHead: imageRow,
            current: 'imageSpace',
            otherSpace: ''
          })
        },
        isAsync: true
      }
    })
      
  }

  searchImage(e) {
    const image = e.target.value
    this.props.SearchOtherImage(image)
    // this.props.getOtherImageList(this.props.imageId)
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { liteFlag } = this.props;
    const rootscope = this.props.scope;
    const scope = this;
    const otherHead = this.props.otherHead
    return (
      <QueueAnim className='OtherSpace'
        type='right'
        >
        <div id='OtherSpace' key='OtherSpace'>
          <Card className='OtherSpaceCard'>
            <div className='operaBox'>
              <div className='infoBox'>
                <div className='url'>
                  <i className='fa fa-link'></i>&nbsp;&nbsp;
                    {otherHead.url}
                </div>
                {otherHead.username ?
                <div className='name'>
                  <i className='fa fa-user'></i>&nbsp;&nbsp;
                  {otherHead.username}
                </div>
                :null
                }
              </div>
              <Button className='logout' size='large' type='ghost' onClick={()=>this.setState({imageId:this.props.imageId, delModal: true})}>
                <FormattedMessage {...menusText.logout} />
              </Button>
              <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' onPressEnter={(e)=>this.searchImage(e)}/>
              <i className='fa fa-search'></i>
              <div style={{ clear: 'both' }}></div>
            </div>
            <MyComponent scope={scope} parentScope={this.props.scope.parentScope} isFetching={this.props.isFetching} imageId ={this.props.imageId} otherHead={otherHead} config={this.props.imageList} />
          </Card>
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeImageDetailModal}
          >
          <ImageDetailBox scope={scope}  server={otherHead.url} parentScope={rootscope} imageId ={this.props.imageId} config={this.state.currentImage} />
        </Modal>
        <Modal title="删除第三方镜像操作" visible={this.state.delModal}
          onOk={()=> this.deleteImage()} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除这项操作?</div>
        </Modal>
      </QueueAnim>
    )
  }
}

OtherSpace.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    imageList: [],
  }
  const { otherImages} = state.images
  const { imageList, isFetching, imageRow} = otherImages || defaultPrivateImages

  return {
    imageList,
    imageRow,
    isFetching,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getOtherImageList: (id) => {
      dispatch(getOtherImageList(id))
    },
    DeleteOtherImage: (id, callback)=> {
      dispatch(DeleteOtherImage(id,callback))
    },
    SearchOtherImage: (image, callback) => {
      dispatch(SearchOtherImage(image, callback))
    }
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(injectIntl(OtherSpace, {
  withRef: true,
}))