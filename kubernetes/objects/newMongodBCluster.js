/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * new mongodb cluster class for database_cache
 *
 * v0.1 - 2019-01-29
 * @author zhouhaitao
 */
'use strict'


 class newMongoDBCluster {
   constructor (name, replicas, lbgroup, config, storageCluster, size, username, password) {
     this.apiVersion = 'daas.tenxcloud.com/v1'
     this.kind = 'MongoDBReplica'
     this.metadata =  {
       annotations: {
         ['mongodbreplica.system/lbgroup']: lbgroup,
       },
       name,
     }
     this.spec = {
       replicas,
       resources: config,
       configRef: {
         name: `${name}-config`
       },
       secretRef: {
         username,
         password,
       },
       volumeClaimTemplate: {
         metadata: {
           name: 'data'
         },
         spec: {
           storageClassName: storageCluster,
           accessModes: ['ReadWriteOnce'],
           resources: {
             requests: {
               storage: size
             }
           }
         }
       }
   }
 }
}
module.exports = newMongoDBCluster

