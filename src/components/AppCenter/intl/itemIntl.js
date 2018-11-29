/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl of page src/components/AppCenter/item
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.Tab',
  data: {
    repoGroup: '仓库组',
    allRepoGroup: '所有仓库组',
    privateRepoGroup: '私有仓库组',
    publicRepoGroup: '公开仓库组',
    imageRepo: '镜像仓库',
    releaseRecord: '发布记录',
    repoManage: '仓库管理',
    thirdPartyRepo: '第三方仓库',
    addThirdParty: '添加第三方',
    addThirdPartySuccess: '添加第三方镜像成功',
    addThirdPartyFailed: '添加第三方镜像失败',
    accessTypeRequired: '请选择接入类型',
    accessType: '接入类型',
    userNameRequired: '请输入用户名',
    pwdRequired: '请输入密码',
    repoName: '仓库名',
    repoNameCustom: '自定义仓库名',
    repoUrl: '地址',
    repoUrlPlaceholder: '仓库地址',
    alertMessage: '私有仓库需要填写用户名和密码',
    userName: '用户名',
    repoUserName: '仓库用户名',
    notSupportEmail: '暂不支持邮箱',
    pwd: '密码',
    repoPwd: '仓库密码',
    confirm: '确定',
    cancel: '取消',
    tipMsg: '第三方仓库接入，支持标准 Docker Registry 和 hub.docker.com 接口（平台默认 registry 为 Harbor，第三方接口无需再次接入）。',
    thirdPartyHelpMsg0: '镜像仓库组：用于存放镜像仓库，每个镜像仓库由若干个镜像版本组成',
    thirdPartyHelpMsg1: '第三方仓库：关联第三方仓库后可部署仓库中的镜像',
    thirdPartyHelpMsg2: '流水线中构建出来的镜像可发布到镜像仓库（所选仓库组）或第三方镜像仓库中。',
    repoNameVerifyMsg1: '请输入仓库名称',
    repoNameVerifyMsg2: '仓库名称不能少于3位',
    repoNameVerifyMsg3: '仓库名称过长，名称不能超过63位',
    repoNameVerifyMsg4: '仓库名称只能由中英文、数字等组成',
    repoUrlVerifyMsg1: '请输入仓库地址',
    repoUrlVerifyMsg2: '地址以http或者https开头',
    registryRepeat: '仓库名重复',
    addotherRegistry0: '添加第三方镜像失败',
    addotherRegistry1: '添加第三方镜像成功',
    pleaseCheckAddress: '请重新检查填写地址、帐号密码',
    readOnlyPrompt: "该仓库已被设置为只读模式，在此模式下，不能删除镜像、版本 Tag、推送镜像及发布镜像商店",
  }
}
export default defineIntlMessages(mapData)
