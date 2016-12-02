/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

 /*
 * Product modes
 *
 * v0.1 - 2016-12-02
 * @author huangqg
 */

const models = {
  standard: { // 标准版
    network: 'public',
    modules: {
      billing: { // 开启资源计费
        enable: true
      },
      recharge: { // 开启充值功能
        enable: true
      },
      app_manage: { // 应用管理
        enable: true
      },
      app_center: { // 应用中心
        enable: true
      },
      ci_cd: { // CI_CD
        enable: true
      },
      database_cache: { // 数据库与缓存
        enable: true
      },
      integration: { // 集成中心
        enable: true
      },
      manange_monitor: { // 管理与监控
        enable: true
      },
      account: { // 账户中心
        enable: true
      },
      setting: { // 系统设置
        enable: true
      }
    }
  },
  enterprise: { // 企业版
    network: 'private',
    modules: {
      billing: { // 开启资源计费
        enable: false
      },
      recharge: { // 开启充值功能
        enable: false
      },
      app_manage: { // 应用管理
        enable: true
      },
      app_center: { // 应用中心
        enable: true
      },
      ci_cd: { // CI_CD
        enable: true
      },
      database_cache: { // 数据库与缓存
        enable: true
      },
      integration: { // 集成中心
        enable: true
      },
      manange_monitor: { // 管理与监控
        enable: true
      },
      account: { // 账户中心
        enable: true
      },
      setting: { // 系统设置
        enable: true
      }
    }
  }
}

module.exports = models