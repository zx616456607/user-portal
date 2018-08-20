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
import { Menu, Button, Card, Spin, Input, Modal, Table } from 'antd'
import { Link ,browserHistory} from 'react-router'
import { camelize } from 'humps'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  DeleteOtherImage, SearchOtherImage, getOtherImageList, searchDockerhubRepos,
} from '../../../actions/app_center'
import './style/OtherSpace.less'
import ImageDetailBox from './ImageDetail/OtherDetail.js'
import { toQuerystring } from '../../../common/tools'

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

class OtherSpace extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.searchDockerhub = this.searchDockerhub.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.searchImage = this.searchImage.bind(this);
    this.state = {
      currentImage: null,
      currentImageConfig: null,
      imageDetailModalShow: false,
      searchInput: null,
    }
  }

  loadData() {
    const { getOtherImageList, imageId } = this.props;
    getOtherImageList(imageId);
  }

  componentWillMount() {
    this.loadData()
  }
  componentDidUpdate() {
    const { imageId } = this.props
    let searchInput = document.getElementById(imageId);
    searchInput && searchInput.focus()
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
  searchDockerhub(query) {
    const { otherHead, imageId, searchDockerhubRepos } = this.props
    const defaultQuery = {
      query: this.state.searchInput,
      page_size: 10,
    }
    searchDockerhubRepos(imageId, Object.assign({}, defaultQuery, query))
  }
  onTableChange(pagination) {
    const { otherHead } = this.props
    const { searchInput } = this.state
    if (otherHead.type === 'dockerhub' && searchInput && searchInput.trim()) {
      const { current } = pagination
      this.searchDockerhub({ page: current })
    }
  }
  searchImage(image) {
    const otherHead = this.props.otherHead
    if (otherHead.type === 'dockerhub') {
      if (!image || !image.trim()) {
        this.loadData()
        return
      }
      this.searchDockerhub()
      return
    }
    this.props.SearchOtherImage(image, this.props.imageId)
    // this.props.getOtherImageList(this.props.imageId)
  }
  showImageDetail(imageName, row) {
    //this function for user select image and show the image detail info
    this.setState({
      imageDetailModalShow:true,
      currentImage: imageName,
      currentImageConfig: row,
    });
  }
  renderRegistryType(type) {
    switch (type) {
      case 'dockerhub':
        return 'hub.docker.com'
      default:
        return 'Docker Registry'
    }
  }
  render() {
    const { formatMessage } = this.props.intl;
    const { liteFlag, imageId, imageList } = this.props;
    const rootscope = this.props.scope;
    const scope = this;
    const otherHead = this.props.otherHead
    const registryServer = otherHead.url.split('//')[1]
    const total = this.props.total || imageList.length
    const { searchInput } = this.state
    // const isSearchDockerhub = otherHead.type === 'dockerhub' && searchInput
    const columns = [
      {
        title: '镜像名',
        dataIndex: 'name',
        key: 'name',
        width:'30%',
        render: (text, row) => {
          return (
            <div className="imageList">
              <div className="imageBox">
                <svg className='appcenterlogo'>
                  {/*@#app-center-logo*/}
                  <use xlinkHref='#appcenterlogo' />
                </svg>
              </div>
              <div className="contentBox">
                <div className="title" onClick={()=> this.showImageDetail(row.name, row)}>
                  {text}
                </div>
                <div className='type'>
                  <FormattedMessage {...menusText.belong} />&nbsp;
                  {row[camelize('is_private')] ? '私有' : '公有'}
                </div>
              </div>
            </div>
          )
        }
      },
      {
        title: '地址',
        dataIndex: 'description',
        key: 'description',
        width:'35%',
        render:(text, row) => {
          return (
            <div className="imgurl"><FormattedMessage {...menusText.imageUrl} />{registryServer}/{row.name}</div>
          )
        }
      },
      {
        title: '统计信息',
        dataIndex: camelize('pull_count'),
        key: camelize('pull_count'),
        width:'15%',
        render: (text, row) => {
          if (text === undefined) {
            return ''
          }
          return (
            <div>
              下载次数：{row[camelize('pull_count')]} <br/>
              评价星级：{row[camelize('star_count')]}
            </div>
          )
        }
      },
      {
        title: '部署',
        dataIndex: 'icon',
        key: 'icon',
        width:'15%',
        render: (text, row)=> {
          const query = {
            registryServer,
            imageName: row.name,
            other: imageId,
          }
          if (otherHead.type === 'dockerhub') {
            query.systemRegistry = 'dockerhub'
          }
          // registryServer=${registryServer}&imageName=${row.name}&other=${imageId}
          return (
            <Button type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}`)}>
              <FormattedMessage {...menusText.deployService} />
            </Button>
          )
        }
      }
    ];
    return (
      <QueueAnim className='OtherSpace'
        type='right'
      >
        <div id='OtherSpace' key='OtherSpace'>
          <Card className='OtherSpaceCard'>
            <div className='operaBox'>
              <div className="spanceInfo">
                <span className="first-title">
                  {otherHead.title}
                </span>
                <span>仓库类型：{this.renderRegistryType(otherHead.type)}</span>
              </div>
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
              <div className="searchBox">
                <Input
                  size="large"
                  id={imageId}
                  placeholder={
                    otherHead.type === 'dockerhub'
                    ? '搜索 Docker Hub 公开镜像'
                    : '按镜像名称搜索'
                  }
                  onPressEnter={e => this.searchImage(e.target.value)}
                  onChange={e => this.setState({ searchInput: e.target.value.trim() })}
                />
                <i className='fa fa-search' onClick={() => this.searchImage(searchInput)}></i>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <Table
              showHeader={false}
              className="privateImage"
              dataSource={imageList}
              columns={columns}
              pagination={{ simple:true, total }}
              loading={this.props.isFetching}
              onChange={this.onTableChange}
              rowKey={row => row.name}
            />
            {/*<MyComponent scope={scope} parentScope={this.props.scope.parentScope} isFetching={this.props.isFetching} imageId ={this.props.imageId} otherHead={otherHead} config={this.props.imageList} />*/}
          </Card>
          <Modal
            visible={this.state.imageDetailModalShow}
            className='AppServiceDetail'
            transitionName='move-right'
            onCancel={this.closeImageDetailModal}
          >
            {
              this.state.imageDetailModalShow &&
              <ImageDetailBox
                scope={scope}
                server={otherHead.url}
                parentScope={rootscope}
                imageId ={this.props.imageId}
                config={this.state.currentImage}
                imageConfig={this.state.currentImageConfig}
              />
            }
          </Modal>
          <Modal title="删除第三方镜像操作" visible={this.state.delModal}
            onOk={()=> this.deleteImage()} onCancel={()=> this.setState({delModal: false})}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle"/>
              您是否确定要删除这项操作?
            </div>
          </Modal>
        </div>
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
  const { imageList, isFetching, total } = otherImages[props.imageId] || defaultPrivateImages
  const { imageRow } = otherImages
  return {
    imageList: imageList || [],
    imageRow,
    isFetching,
    total,
  }
}

export default connect(mapStateToProps,{
  getOtherImageList,
  DeleteOtherImage,
  SearchOtherImage,
  searchDockerhubRepos,
})(injectIntl(OtherSpace, {
  withRef: true,
}))
