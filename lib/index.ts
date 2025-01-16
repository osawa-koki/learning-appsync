import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export class IndexStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      stackName: process.env.BASE_STACK_NAME!,
    });

    const api = new appsync.GraphqlApi(this, 'HelloWorldApi', {
      name: 'HelloWorldApi',
      definition: {
        schema: appsync.SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql')),
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
    });

    const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.helloWorld',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
    });
    const goodByeWorldFunction = new lambda.Function(this, 'GoodByeWorldFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.goodByeWorld',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
    });

    const helloWorldDataSource = api.addLambdaDataSource(
      'HelloWorldDataSource',
      helloWorldFunction
    );
    const goodByeWorldDataSource = api.addLambdaDataSource(
      'GoodByeWorldDataSource',
      goodByeWorldFunction
    );

    helloWorldDataSource.createResolver('HelloResolver', {
      typeName: 'Query',
      fieldName: 'hello',
    });
    goodByeWorldDataSource.createResolver('GoodByeResolver', {
      typeName: 'Query',
      fieldName: 'goodbye',
    });

    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
    if (api.apiKey != null) {
      new cdk.CfnOutput(this, 'GraphQLAPIKey', {
        value: api.apiKey,
      });
    }
  }
}
