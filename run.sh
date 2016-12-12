#!/bin/bash


MODEL=enterprise
if [ "$DASHBOARD_MODEL" = "SE" ]; then
  MODEL=standard
fi


gen_model_config() {
  echo -e "\nmodule.exports = models.$MODEL" >> "configs/models.js"
}

gen_model_config
node app.js
