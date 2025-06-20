# <img src="./public/favicon.svg" alt="favicon" height="40" width="40" /> Capture Love

A **zero cost** wedding/event photos & videos upload web app

By utilizing [GitHubs' free hosting](https://pages.github.com/) & [AWS free 1 year trial](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=tier%2312monthsfree&awsf.Free%20Tier%20Categories=categories%23storage) for the S3 service this application can run at zero cost for the special day.
- the app has already been used at 3 weddings with great success!

| | | |
|-|-|-|
| ![screen_1](.github/docs/screen_1.png) | ![screen_2](.github/docs/screen_2.png) | ![screen_3](.github/docs/screen_3.png)
| | | |
---

## Deployment

### Setup GitHub pages

1. Go to project `Settings` > `Pages` > `Build and deployment`
    1. Set "**Source**" to "**GitHub Actions**"
1. Go to project `Settings` > `Environments`
    1. If not already there, create an environment called `github-pages`
    2. Set "**Deployment branches**" to "**All branches**"

### Setup the ENV variables & secrets
1. Go to project `Settings` > `Secrets and variables` > `Actions`
    1. `Secrets` > `Repository secrets` > Set the secrets for the following:
        - `AWS_ACCOUNT_ID`
        - `AWS_ACCESS_KEY_ID`
        - `AWS_SECRET_ACCESS_KEY`
        - `AWS_S3_REGION`
        - `AWS_S3_BUCKET`
    2. `Variables` > `Repository variables` > Set the variables for the following:
        - `HEADER`
        - `HEADER_DATE`
        - `SITE_TITLE`

### Setup AWS S3 bucket and IAM role

1. Login to [AWS console](https://aws.amazon.com/console) as admin/root
2. Find the `S3` service
3. Create a bucket with name `capture-love` (make sure the region is the closest to you event location for best performance)
4. Inside the bucket go to `Permissions`
    1. Update the `Bucket Policy` to below
        ```JSON
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicListGet",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": [
                        "s3:List*",
                        "s3:Get*"
                    ],
                    "Resource": [
                        "arn:aws:s3:::capture-love",
                        "arn:aws:s3:::capture-love/*"
                    ]
                }
            ]
        }
        ```
    2. Update the `Cross-origin resource sharing (CORS)` to below
        ```JSON
        [
            {
                "AllowedHeaders": [
                    "*"
                ],
                "AllowedMethods": [
                    "GET",
                    "PUT",
                    "POST"
                ],
                "AllowedOrigins": [
                    "https://example.com", // <- your GitHub pages URL goes here
                ],
                "ExposeHeaders": []
            }
        ]
        ```
5. Find the `IAM` service and create a new user with name `capture-love` (make sure to select the `Programmatic access` option & save the credentials)
6. Add the following permissions policy to the user using the `Add permissions` > `Create inline policy` option:
    ```JSON
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicListGetPut",
                "Effect": "Allow",
                "Action": "s3:*",
                "Resource": [
                    "arn:aws:s3:::capture-love",
                    "arn:aws:s3:::capture-love/*"
                ]
            }
        ]
    }
    ```

### Deploy the app

Triggering the deploy job can be achieved in three ways:

#### 1. Via GitHub Project Page
Looking at the project main page on GitHub, on the right-hand side column, there is a section **"Releases"**.

Click on the button **"Create a new release"**.

Follow instructions, it is required to enter a tag such as **"v1.0.0"**

#### 2. Via Bash Script - Remotely
Using the script that lives in `scripts/deploy.sh`, you can call:

    yarn deploy --{TYPE}

Where `{TYPE}` can be `major`, `minor` or `patch`

#### 3. Via Console using GIT - Remotely
Go to the root of the project that was previously pulled from git.
In the console (always increment in the next release):

```sh
git tag v1.0.0
git push origin --tags
```

---

## Development

### Setup
Run the following commands to setup the project

```sh
cp .env.example .env.local
```

## Post wedding/event

### Download whole S3 bucket

Example:
- bucket name (same as ENV variable) = `capture-love`
- AWS CLI profile = `capture-love`
```sh
aws s3 sync s3://capture-love . --profile capture-love
```