import { S3ObjectCreatedNotificationEvent } from 'aws-lambda';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

const rekognitionClient = new RekognitionClient();

export const lambdaHandler = async (event: S3ObjectCreatedNotificationEvent) => {
  // Only printing out the event structure for Debug purposes
  console.debug(JSON.stringify(event, null, 2));

  const bucket = event.detail.bucket.name;
  const key = decodeURIComponent(event.detail.object.key.replace(/\+/g, ' '));

  console.info(`Going to detect labels for bucket ${bucket} and key ${key}`);

  const labels: string[] = await detectLabels(bucket, key);

  const response = {
    'S3Key' : key,
    'labels' : labels
  };

  // Results logged in a structured JSON format
  console.info(JSON.stringify(response));
};

/* 
 * Detects labels for the given image.
*/
const detectLabels = async (bucket: string, key: string) : Promise<string[]> => {
  const labels: string[] = [];
  const imageParams = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    }
  };

  const labelData = await rekognitionClient.send(
    new DetectLabelsCommand(imageParams)
  );

  console.debug('DetectLabelsCommand:', labelData);

  labelData.Labels?.forEach(label => {
    labels.push(label.Name!);
  });

  return labels
};