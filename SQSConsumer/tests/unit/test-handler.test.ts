import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it } from '@jest/globals';

describe('Unit test for app handler', function () {
    it('verifies successful response', async () => {
        const event: SQSEvent = {
            "Records": [
                {
                    "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
                    "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
                    "body": "sunset.jpg",
                    "attributes": {
                        "ApproximateReceiveCount": "1",
                        "SentTimestamp": "1545082649183",
                        "SenderId": "AIDAIENQZJOLO23YVJ4VO",
                        "ApproximateFirstReceiveTimestamp": "1545082649185"
                    },
                    "messageAttributes": {},
                    "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
                    "eventSource": "aws:sqs",
                    "eventSourceARN": "arn:aws:sqs:us-east-1:111122223333:my-queue",
                    "awsRegion": "us-east-1"
                }
            ]
        };
        await lambdaHandler(event);

        // expect(result.statusCode).toEqual(200);
        // expect(result.body).toEqual(
        //     JSON.stringify({
        //         message: 'hello world',
        //     }),
        // );
    });
});
