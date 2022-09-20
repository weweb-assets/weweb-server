# weweb-server

## Prerequisite

You will need a WeWeb subscription to have access to this server and to be able to configure it.
Contact WeWeb team to subscribe to the "Self-Hosting" plan at [https://www.weweb.io](https://www.weweb.io).

## Principle

`weweb-server` will be the entry point of you self-hosted WeWeb project : it will manage Authentication, pages accesses and file serve for one or multiple of your WeWeb projects.

`weweb-server` needs to be connected to a Postgres Database that you will also have to host.
We advise you to add a CDN in front of this server to keep some files in cache.

`weweb-server` needs some storage to retreive your projects' files. This storage can be local, distant or an AWS S3 bucket.

Each time you publish a new version of one of your projects, you will need to update the project's files and configure the server's DB info using WeWeb's Dashboard (The configure button can be found in the project's Dashboard > Self-Hosting > Configure WeWeb Server)

> Note : `weweb-server` needs to be accessible from our servers so that we can send some configuration data to it each time you publish a project.

## Database

You need to create a new Postgres Database that will be used by this server to store some non sensible data about your projects' pages (private accesses, user groups and a list of all pages).
You will need to set some environment variables in `weweb-server` for it to be able to connect to the Database.

## Storage

You will need some storage to put your projects' files on it.

This storage can be :

-   Local to weweb-server (add a folder in the server)
-   Distant (in some http url)
-   AWS S3 Bucket (the bucket doesn't need to be dedicated to this storage)

The storage location is configured using environment variables.

## Environment variables

#### Main variables :

| Varible name | Required | Default | Values                                   | Description                                                                                                                |
| ------------ | -------- | ------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV     | Yes      | -       | production                               | Must be set to production                                                                                                  |
| FILES_PATH   | Yes      | -       | -                                        | Path of a frontend project's files in your storage. [More information](#files_path-)                                       |
| PUBLIC_KEY   | Yes      | -       | -                                        | Can be found in WeWeb Dashboard > Workspace > Self-Hosting                                                                 |
| PRIVATE_KEY  | Yes      | -       | -                                        | Can be found in WeWeb Dashboard > Workspace > Self-Hosting                                                                 |
| PORT         | No       | 80      | -                                        | Port where `weweb-server` should run                                                                                       |
| SERVER_PATH  | No       | -       | -                                        | Sub path for your server url. Not required if your server url is an IP or a domain name. [More information](#server_path-) |
| WW_LOG_LEVEL | No       | trace   | _fatal, error, warn, info, debug, trace_ | Logs `weweb-server` should display                                                                                         |

> #### FILES_PATH :
>
> For local storage, FILES_PATH should start with `./` else distant storage will be used.
> You can use two variables in the path that can be found in the name of the ZIP of the project :
>
> -   `:projectId`
> -   `:filesVersion`
>
> Ex: `./projects/:projectId/:filesVersion` will fetch the frontend project's files localy.
> FILES_PATH should end without a `/` .

> #### SERVER_PATH :
>
> If you setup something like https://my-domain.com/servers/weweb-server/ as WeWeb Server URL in your Dashboard, you should set SERVER_PATH to the value `/servers/weweb-server`.
> SERVER_PATH should end without a `/` .

#### Database configuration :

| Varible name | Required | Default value | Description                              |
| ------------ | -------- | ------------- | ---------------------------------------- |
| DB_HOSTNAME  | Yes      | -             | Database hostname                        |
| DB_PORT      | No       | 5432          | Database port                            |
| DB_NAME      | Yes      | -             | Database name                            |
| DB_USERNAME  | Yes      | -             | User name to connect to the Database     |
| DB_PASSWORD  | Yes      | -             | User password to connect to the Database |
| DB_SSL       | No       | false         | Use SSL connection to database           |

#### AWS S3 configuration (not required if a different storage is used) :

| Varible name          | Required |
| --------------------- | -------- |
| AWS_ACCESS_KEY_ID     | Yes      |
| AWS_SECRET_ACCESS_KEY | Yes      |
| BUCKETREGION          | Yes      |
| BUCKETNAME            | Yes      |

## Publish a new version of a project

1.  Publish your project on WeWeb Dashboard and wait for it to finish
2.  Go to your project's Dashboard > Self-Hosting and download the project's ZIP archive
3.  Unzip the archive in your storage. We advise you to use subfolders for each projects and each versions of your projects to prevent downtime.
4.  Go to your project's Dashboard > Self-Hosting and click on Configure WeWeb Server

The new version of your project is now live !

## Updating `weweb-server`

TBD
