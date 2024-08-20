import { APIGatewayProxyEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda';
// import AWS from 'aws-sdk';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
/**
 *
 * Event doc: https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
 * https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
 * @param {Object} event - S3 trigger event for an object creation
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: S3Event): Promise<APIGatewayProxyResult> => {
    try {
        console.log("s3 event:", event);

        const client = new SQSClient({ region: 'us-east-1', endpoint: 'https://sqs.us-east-1.localhost.localstack.cloud:4566' });
        const command = new SendMessageCommand({
            QueueUrl: process.env.QUEUE_URL || "",
            DelaySeconds: 10,
            // MessageAttributes: {
            //   Title: {
            //     DataType: "String",
            //     StringValue: "The Whistler",
            //   },
            //   Author: {
            //     DataType: "String",
            //     StringValue: "John Grisham",
            //   },
            //   WeeksOn: {
            //     DataType: "Number",
            //     StringValue: "6",
            //   },
            // },
            MessageBody: JSON.stringify(event)
        });

        const response = await client.send(command);
        console.log(response);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
