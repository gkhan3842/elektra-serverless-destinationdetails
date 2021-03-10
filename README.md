# elektra-serverless-destinationdetails

API hosted in AWS as lambda function to get all active destination(LS) / site(LT) / both the details.

Deployment: Prerequisites:

npm install serverless -g
serverless config credentials using the secret key and password shared by the tech lead.
Steps to deploy:

Download the project and "npm install"
The environement variables are in secrets.dev.yml and encrypted under secrets.dev.yml.encrypted. 
To make changes or before deploy, run the below command serverless decrypt --stage dev --password 'xxxxx' (Replace dev with qa for qa, live for live)
serverless deploy --stage dev

To run locally: serverless invoke local --function getDestinationDetails --log true --stage dev
