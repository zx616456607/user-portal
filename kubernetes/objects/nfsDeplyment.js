/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ceph class for k8s
 *
 * v0.1 - 2017-9-20
 * @author Zhangpc
 */
'use strict'
class NfsDeplyment {
  constructor(nfsname, ip, path, image){
    this.kind = 'Deployment'
    this.apiVersion = 'extensions/v1beta1'
    this.metadata = {
      name: nfsname,
      namespace: 'kube-system'
    }
    this.spec = {
      replicas: 1,
      strategy: {
        type: 'Recreate'
      },
      template:{
        metadata: {
          labels: {
            app: nfsname,
          }
        },
        spec: {
          serviceAccount: 'nfs-provisioner',
          containers: [
            {
              name: nfsname,
              image,
              volumeMounts: [
                {
                  "name": "nfs-client-root",
                  "mountPath": "/persistentvolumes"
                }
              ],
              env: [
                {
                  "name": "PROVISIONER_NAME",
                  "value": nfsname,
                },
                {
                  "name": "NFS_SERVER",
                  "value":  ip,
                },
                {
                  "name": "NFS_PATH",
                  "value": path,
                }
              ]
            }
          ],
          volumes: [
            {
              "name": "nfs-client-root",
              "nfs": {
                "server": ip,
                "path": path,
              }
            }
          ]
        }
      },
    }
  }
}

module.exports = NfsDeplyment