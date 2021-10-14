#!/usr/bin/env bash

BRAND=firstaffirmative

echo "BRAND = "$BRAND""
echo "ENVIRONMENT = api.sbxaws.foliofn.com"

echo "calling: /programlist"
curl https://api.sbxaws.foliofn.com/programlist?brand=$BRAND | json_pp

echo "calling: /security"
curl https://api.sbxaws.foliofn.com/security?brand=$BRAND | json_pp

echo "calling: /billing-plan"
curl https://api.sbxaws.foliofn.com/billing-plan?brand=$BRAND | json_pp

echo "calling: /charts"
curl https://api.sbxaws.foliofn.com/charts?brand=$BRAND | json_pp

echo "calling: /content"
curl https://api.sbxaws.foliofn.com/content?brand=$BRAND | json_pp

echo "calling: /enabled"
curl https://api.sbxaws.foliofn.com/enabled?brand=$BRAND | json_pp

echo "calling: /exclusions-inclusions"
curl https://api.sbxaws.foliofn.com/exclusions-inclusions?brand=$BRAND | json_pp

echo "calling: /goal-types"
curl https://api.sbxaws.foliofn.com/goal-types?brand=$BRAND | json_pp

echo "calling: /header-config"
curl https://api.sbxaws.foliofn.com/header-config?brand=$BRAND | json_pp

echo "calling: /risk-levels"
curl https://api.sbxaws.foliofn.com/risk-levels?brand=$BRAND | json_pp

echo "calling: /transfer-money"
curl https://api.sbxaws.foliofn.com/transfer-money?brand=$BRAND | json_pp

echo "calling: /program-config"
curl https://api.sbxaws.foliofn.com/program-config?brand=$BRAND | json_pp

echo "calling: /api-keys"
curl https://api.sbxaws.foliofn.com/api-keys?secretName=$BRAND | json_pp

echo "calling: /all-firm-config"
curl https://api.sbxaws.foliofn.com/all-firm-config

echo "calling: /firm-conf"
curl https://api.sbxaws.foliofn.com/firm-conf?brand=$BRAND | json_pp

echo "calling: /account-create-config"
curl https://api.sbxaws.foliofn.com/account-create-config?brand=$BRAND | json_pp

echo "calling: /questionnaire-config"
curl https://api.sbxaws.foliofn.com/questionnaire-config?brand=$BRAND | json_pp

echo "calling: /questionnaire-content"
curl https://api.sbxaws.foliofn.com/questionnaire-content?brand=$BRAND | json_pp

