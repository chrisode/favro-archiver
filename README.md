# Favro archiver

This is a script that archives all completed cards in your backlog. The completion status is determined from a done column in your board, the name of this is configurable. 
Status on tickets in one board can update multiple backlogs. 

The script uses the the [https://favro.com/developer/](Favro rest api) to do this.

## Setup

First of all, create a new config file named `config/secrets.json`, the format of this can be copied from `config/example-secrets.json`.
Then you need to get your Favro API authentication and links to the boards and backlogs you want to use. 

### Setting up Favro API Authentication

You authorize to your organisation by using a users email and a token generated for that user. Some information on the API authentication can be found [https://favro.com/developer/#authentication](here).


**organizationId**
Organisation id is the first guid in the url when you are looking at your collection, like this https://favro.com/organization/\<org guid\>/\<collection guid\>

**username** 
Username is the email of the user

**token**
You generate the token by logging in as that user and in the settings menu go to `Profile and account...` and then go to `API Tokens`. 

### Setting up collections

You can setup the script to update backlogs in multiple collections. The options for one collection looks like this

```javascript
{
  "name": "Name of your collection", // Required
  "backlog": [
    "https://favro.com/widget/collectionguid/backlogguid1", // One is required
    "https://favro.com/widget/collectionguid/backlogguid2"
  ],
  "board": "https://favro.com/widget/example/board", // Required
  "doneColumn": "Completed" //Optional, defaults to done
  "active": true
}
```

To grab the link to a backlog and board in Favro, use the three dot menu in the upper corner, select "Link to this backlog/board" in that menu and copy the link.

