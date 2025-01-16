# learning-appsync

🎚🎚🎚 AppSyncの学習用リポジトリ！  

![成果物](./fruit.gif)  

## 実行方法

`.env.example`をコピーして`.env`ファイルを作成します。  
中身を適切に設定してください。  

DevContainerに入り、以下のコマンドを実行します。  
※ `~/.aws/credentials`にAWSの認証情報があることを前提とします。  

```shell
cdk bootstrap
cdk synth
cdk deploy --require-approval never --all
```

デプロイされたAppSyncをテストしてみます。  

```shell
source .env

OUTPUT=$(aws cloudformation describe-stacks --stack-name ${BASE_STACK_NAME} --query "Stacks[0].Outputs[]" --output json)
APP_SYNC_URL=$(echo $OUTPUT | jq -r '.[] | select(.OutputKey=="GraphQLAPIURL") | .OutputValue')
APP_SYNC_KEY=$(echo $OUTPUT | jq -r '.[] | select(.OutputKey=="GraphQLAPIKey") | .OutputValue')

echo "APP_SYNC_URL: ${APP_SYNC_URL}"
echo "APP_SYNC_KEY: ${APP_SYNC_KEY}"
```

エンドポイント(`${APP_SYNC_URL}`)にアクセスして、`query { hello }`と`query { goodbye }`と`query { hello, goodbye }`を実行してみます。  
ヘッダーに`x-api-key: ${APP_SYNC_KEY}`を追加してください。  

```shell
curl -X POST ${APP_SYNC_URL} -H "x-api-key: ${APP_SYNC_KEY}" -H "Content-Type: application/json" -d '{"query": "query { hello }"}'
curl -X POST ${APP_SYNC_URL} -H "x-api-key: ${APP_SYNC_KEY}" -H "Content-Type: application/json" -d '{"query": "query { goodbye }"}'
curl -X POST ${APP_SYNC_URL} -H "x-api-key: ${APP_SYNC_KEY}" -H "Content-Type: application/json" -d '{"query": "query { hello, goodbye }"}'
```

---

GitHub Actionsでデプロイするためには、以下のシークレットを設定してください。  

| シークレット名 | 説明 |
| --- | --- |
| AWS_ROLE_ARN | IAMロールARN (Ref: https://github.com/osawa-koki/oidc-integration-github-aws) |
| AWS_REGION | AWSリージョン |
| DOTENV | `.env`ファイルの内容 |

タグをプッシュすると、GitHub Actionsがデプロイを行います。  
手動でトリガーすることも可能です。  
