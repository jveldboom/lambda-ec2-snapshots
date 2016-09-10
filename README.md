# Setup Guide
- Copy the code from either snapshots.js or snapshots.py into a new Lambda function
- Use a similar IAM policy to allow access to EC2 tags, snapshots, etc. 
  **Replace `ec2-snapshots` with the name of your Lambda function**

```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:*:*:log-group:/aws/lambda/ec2-snapshots:*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateSnapshot",
                "ec2:DeleteSnapshot",
                "ec2:CreateTags",
                "ec2:ModifySnapshotAttribute",
                "ec2:ResetSnapshotAttribute",
                "ec2:Describe*"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

- Set the Lambda's function Trigger to a "CloudWatch Events - Schedule". 
  This can be set from within the Lambda function console under the "Triggers" tab 
- Add the following tags to the EC2 instance(s) you want snapshots created

|  Tag | Value | Description |
|------|-------|:-------------|
| Backup    |     | tags the EC2's volume for a snapshot to be created
| Retention | int | number of days to keep the snapshot (for example 7 would be keep the snapshot for 7 days)
