/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Petset Redis class for petset
 *
 * v0.1 - 2016-10-31
 * @author GaoJian
 */
"use strict"
const TENXCLOUD_PREFIX = "tenxcloud.com/"

class PetsetRedis {
  constructor(name) {
    this.kind = "PetSet"
    this.apiVersion = "apps/v1alpha1"
    this.metadata = {
      name: name,
      namespace: null,
      labels: {
        appType: 'redis'
      },
    }
    this.spec = {
      serviceName: name,
      replicas: 1,
      template: {
        metadata: {
          labels: {
            app: name,
            appType: 'redis'
          },
          annotations: {
            "pod.alpha.kubernetes.io/initialized": "true",
            "pod.alpha.kubernetes.io/init-containers": `'[
              {
                  "name": "install",
                  "image": "index.tenxcloud.com/google_containers/redis-install:0.1",
                  "imagePullPolicy": "Always",
                  "args": ["--version=3.2.0", "--install-into=/opt", "--work-dir=/work-dir"],
                  "volumeMounts": [
                      {
                          "name": "opt",
                          "mountPath": "/opt"
                      },
                      {
                          "name": "workdir",
                          "mountPath": "/work-dir"
                      }
                  ]
              },
              {
                  "name": "bootstrap",
                  "image": "index.tenxcloud.com/docker_library/debian:jessie",
                  "command": ["/work-dir/peer-finder"],
                  "args": ["-on-start=\\"/work-dir/on-start.sh\\"", "-service=${name}"],
                  "env": [
                    {
                        "name": "POD_NAMESPACE",
                        "valueFrom": {
                            "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "metadata.namespace"
                            }
                        }
                     }
                  ],
                  "volumeMounts": [
                      {
                          "name": "opt",
                          "mountPath": "/opt"
                      },
                      {
                          "name": "workdir",
                          "mountPath": "/work-dir"
                      }
                  ]
              }
            ]'`
          }
        },
        spec: {
           "containers": [
            {
              "name": "redis",
              "readinessProbe": {
                "initialDelaySeconds": 15,
                "timeoutSeconds": 5,
                "exec": {
                  "command": [
                    "sh",
                    "-c",
                    '/opt/redis/redis-cli -h $(hostname) ping'
                  ]
                }
              },
              "image": "index.tenxcloud.com/docker_library/debian:jessie",
              "args": [
                "/opt/redis/redis.conf"
              ],
              "volumeMounts": [
                {
                  "mountPath": "/data",
                  "name": "datadir"
                },
                {
                  "mountPath": "/opt",
                  "name": "opt"
                }
              ],
              "ports": [
                {
                  "containerPort": 6379,
                  "name": "peer"
                }
              ]
            }
          ],
          "volumes": [
            {
              "emptyDir": {},
              "name": "opt"
            },
            {
              "emptyDir": {},
              "name": "datadir"
            },
            {
              "emptyDir": {},
              "name": "workdir"
            }
          ]
        }
      }
    }
  }

  createRedisDatabase( instanceNum) {
    this.spec.replicas = instanceNum
    this.metadata.namespace = "zhangpc"
  }
  
}

module.exports = PetsetRedis