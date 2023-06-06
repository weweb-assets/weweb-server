[Learn more about WeWeb Public API here](#weweb-public-api)

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

| Varible name | Required | Default | Values                                   | Description                                                                                                                                                          |
| ------------ | -------- | ------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV     | Yes      | -       | production                               | Must be set to production                                                                                                                                            |
| FILES_PATH   | Yes      | -       | -                                        | Path of a frontend project's files in your storage. [More information](#files_path-)                                                                                 |
| PUBLIC_KEY   | Yes      | -       | -                                        | Can be found in WeWeb Dashboard > Workspace > Settings                                                                                                               |
| PRIVATE_KEY  | Yes      | -       | -                                        | Can be found in WeWeb Dashboard > Workspace > Settings                                                                                                               |
| PORT         | No       | 80      | -                                        | Port where `weweb-server` should run                                                                                                                                 |
| SERVER_PATH  | No       | -       | -                                        | Sub path for your server url. Not required if your server url is an IP or a domain name. [More information](#server_path-)                                           |
| WW_LOG_LEVEL | No       | trace   | _fatal, error, warn, info, debug, trace_ | Logs `weweb-server` should display                                                                                                                                   |
| HIDE_VERSION | No       | -       | false, true                              | Hide server version from API calls and logs. Warning : This will prevent you to use the Dashboard interface with your server, and force you to use weweb-server API. |
| MULTI_THREAD | No       | -       | false, true                              | If true, the weweb-server will use all available CPUs to launch multiple threads.                                                                                    |

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
| DB_SCHEMA    | No       | public        | Schema to connect to the Database        |
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

# WeWeb Public API

WeWeb Public API allows you to automate deployements on your weweb-server.

WeWeb Public API has a rate limit of 3 calls per seconds and will return `429 Too many requests error` if the limit is hit.

## Access to WeWeb Public API

Please contact the WeWeb team to get access to WeWeb Public API.

Currently, access to WeWeb Public API is also granted if you have access to the self-hosting feature.

## Authentication

WeWeb Public API authentication is done using an `Authorization` header in every requests.

The value of this header should be `Bearer <YOUR WORKSPACE PRIVATE KEY>`.

Your workspace Private Key can be found under the `Settings` tab in your workspace.

You can generate a new Private Key at any time but this will invalidate the old one.

> Example :
> `headers: {"Authorization": "Bearer WW-PRIVATE-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"}`

#### Requests available :

[Start the publication of a project](#start-the-publication-of-a-project)

[Check the publication status of a project](#check-the-publication-status-of-a-project)

[Download Raw project files ZIP (not built) by version](#download-raw-project-files-zip-not-built-by-version)

[Start project file ZIP (built and ready for deployment) generation by version](#start-project-file-zip-built-and-ready-for-deployment-generation-by-version)

[Get project file ZIP (built and ready for deployment) generation status by version](#get-project-file-zip-built-and-ready-for-deployment-generation-status-by-version)

[Download project files ZIP (built and ready for deployment) by version](#download-project-files-zip-built-and-ready-for-deployment-by-version)

[Download “weweb-server.config.json“ by version](#download-weweb-serverconfigjson-by-version)

[Activate a version in you weweb-server](#activate-a-version-in-you-weweb-server)

[List versions of a project in you weweb-server](#list-versions-of-a-project-in-you-weweb-server)

#### Typical auto deploy script

A typical auto deploy script should be :

```
 1. Start the publication of a project.
 2. Store the version provided by the previous request
 3. While the project is publishing, check the publication status of a project. The publication is done when the progress is 100 and status is "published".
 4. Start project file ZIP (built and ready for deployment) generation by version using the version provided in the start publication step
 5. While the ZIP file is being generated, get the generation status by version using the version provided in the start publication step
 6. Download project files ZIP by version using the version provided in the start publication step
 7. Save the downloaded ZIP file
 8. Extract the download zip file to your weweb-server storage at the right place (defined by FILES_PATH
 9. Activate the published version in you weweb-server using the version provided in the start publication step
```

### Start the publication of a project

-   **Method** : `POST`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/publish`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
-   **Data** :
    `env` : accepts values `production` or `staging` and defines the target of the publication. Publishing to production will also publish to staging.
-   **Returns** :

```
{
	"progress": 0,    //Progress of the publish from 0 to 100
	"message": "Fetching data",    //Progress message
	"status": "publish",    //Status of the publish. Can be : publish / published / error
	"environment": "production",    //Target environment
	"version": 33,    //Version of current publish
	"createdAt": "2022-12-12T16:13:47.142Z"    //Date of creation
}
```

### Check the publication status of a project

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/publish/status`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
-   **Data** : _no data_.
-   **Returns** :

```
{
	"progress": 0,    //Progress of the publish from 0 to 100
	"message": "Fetching data",    //Progress message
	"status": "publish",    //Status of the publish. Can be : publish / published / error
	"environment": "production",    //Target environment
	"version": 33,    //Version of current publish
	"createdAt": "2022-12-12T16:13:47.142Z"    //Date of creation
}
```

### Download Raw project files ZIP (not built) by version

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/versions/{{:version}}/download/raw`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** : _no data_.
-   **Returns** : a ZIP file containing the Raw project files.

### Start project file ZIP (built and ready for deployment) generation by version

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/versions/{{:version}}/download/generate`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** : _no data_.
-   **Returns** :

```
{
	"progress": 0,    //Progress of the generation from 0 to 100
	"status": "IN_PROGRESS",    //Status of the generation. Can be : IN_PROGRESS / DONE / ERROR
}
```

### Get project file ZIP (built and ready for deployment) generation status by version

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/versions/{{:version}}/download/status`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** : _no data_.
-   **Returns** :

```
{
	"progress": 0,    //Progress of the generation from 0 to 100
	"status": "IN_PROGRESS",    //Status of the generation. Can be : IN_PROGRESS / DONE / ERROR
}
```

### Download project files ZIP (built and ready for deployment) by version

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/versions/{{:version}}/download`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** : _no data_.
-   **Returns** : a ZIP file containing the project files ready for deployment.

### Download “weweb-server.config.json“ by version

-   **Method** : `GET`
-   **URL** :
    `https://api.weweb.io/public/v1/workspaces/{{:workspaceId}}/projects/{{:projectId}}/versions/{{:version}}/config`
    `:workspaceId` can be found in the URL of the workspace
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** : _no data_.
-   **Returns** : Returns a JSON containing all the data needed to configure the weweb-server.

> The result of this requets should be saved in a `weweb-server.config.json` file that is at in the root folder of weweb-server.
> At the next start, weweb-server will look for this file and create a new version on it's database.
> This is only useful if your weweb-server cannot be reached on the internet by our servers.

### Activate a version in you weweb-server

**_This request is done directly to your weweb-server_**

-   **Method** : `POST`
-   **URL** :
    `https://<YOUR WEWEB-SERVER URL>/public/v1/projects/{{:projectId}}/versions/{{:version}}/active`
    `:projectId` can be found in the URL of the project
    `:version` can be found in the `Versions` tab of the project or as a result of previous requests.
-   **Data** :
    `env` : accepts values `production` or `staging` and defines the target of the activation.
-   **Returns** :

```
{
	"success": true,    //Success, can be `true` or `false`
}
```

### List versions of a project in you weweb-server

**_This request is done directly to your weweb-server_**

-   **Method** : `GET`
-   **URL** :
    `https://<YOUR WEWEB-SERVER URL>/public/v1/project/{{:projectId}}/versions`
    `:projectId` can be found in the URL of the project
-   **Returns** :

```
{
	"success": true,          //Success, can be `true` or `false`
	"data": [
		{
			"version": 1,     //Version number
			"prod": true,     //Whether the version is active in production or not
			"staging": false  //Whether the version is active in staging or not
		}
	]
}
```
