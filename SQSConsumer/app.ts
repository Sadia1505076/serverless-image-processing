import { SQSEvent, SQSRecord } from 'aws-lambda';
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { Upload } from "@aws-sdk/lib-storage";

/**
 *
 * Event doc: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
 * @param {Object} event - SQS event
 *
 */

async function processMessageAsync(message: SQSRecord): Promise<any> {
    try {
        const client = new SQSClient({}); // give this a thought
        const s3Client = new S3Client({});
        const messageBody = message.body;
        const receiptHandle = message.receiptHandle;
        const readBucketName = process.env.INPUT_BUCKET;
        const writeBucketName = process.env.OUTPUT_BUCKET;
        console.log(`Processed message ${messageBody}`);

        const getObjectCommand = new GetObjectCommand({
            Bucket: readBucketName || "image-processing-imageuploadbucket-rxoooesuub5a",
            Key: messageBody,
        });
        const response = await s3Client.send(getObjectCommand);
        if (!response.Body || !(response.Body instanceof Readable)) {
            throw new Error("Received empty body from S3");
        }
        console.log("object is fetched:---------------" + response.ContentType);

        const sharpInstance = sharp()
            .resize(300, 200)
            .toFormat('webp');
        response.Body.pipe(sharpInstance);
        // const processedImage = await sharpInstance.toBuffer();

        // when the file is large or stream of unknown length
        // s3 write
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: writeBucketName || 'image-processing-processedimagesbucket-vpnyhporn9aj',
                Key: messageBody,
                Body: sharpInstance,
                ContentType: 'webp',
            },
        });
        const result = await upload.done();
        console.log('File successfully uploaded:', result);

        // deleting the message from the queue
        const command = new DeleteMessageCommand({
            QueueUrl: process.env.QUEUE_URL || '',
            ReceiptHandle: receiptHandle,
        });
        await client.send(command);
        console.log("message is deleted from the queue");
    } catch (err) {
        console.error("An error occurred");
        throw err;
    }
}

export const lambdaHandler = async (event: SQSEvent): Promise<void> => {
    try {
        for (const message of event.Records) {
            await processMessageAsync(message);
        }
        console.info("done");
    } catch (err) {
        console.log(err);
    }
};
