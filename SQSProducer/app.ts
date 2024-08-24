import { S3Event, S3EventRecord } from 'aws-lambda';
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

async function processRecordAsync(record: S3EventRecord): Promise<any> {
    try {
        const client = new SQSClient({});
        console.log("s3 event--------------:", record);
        console.log("queue url-------------:", process.env.QUEUE_URL);
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
            MessageBody: record.s3.object.key.replace(/\+/g, ' ')
        });

        const response = await client.send(command);

        console.log("SENDING TO QUEUE IS DONE----------------");
        console.log('response from sqs send:' + response.MessageId + "...." + response.MD5OfMessageBody)
    } catch (err) {
        console.error("An error occurred");
        throw err;
    }
}

export const lambdaHandler = async (event: S3Event): Promise<void> => {
    try {
        for (const record of event.Records) {
            await processRecordAsync(record);
        }
    } catch (err) {
        console.log(err);
    }
};
