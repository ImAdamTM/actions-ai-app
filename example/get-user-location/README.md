# Get user location

_Note: This demo can only be demonstrated in the Actions on Google Console due to it using the `askForPermission()` behavior._

This example demonstrates retrieving the users current location using the `actions-on-google` [askForPermission()](https://developers.google.com/actions/reference/nodejs/AssistantApp#askForPermission) capability.

One of the main things to handle when requesting for permission, is how to return the user back to the intent flow that they were on when the permission was required. Using the `action()` method we can provide a callback intent that the user should be returned to once the request authorization is complete and we have compiled the users location data.

Additionally, we can store the users location in the session state for future access. For longer term access you may wish to use a third party service such as Firebase.

## Example

```
User: Hello

Bot: Hello! I can tell you your location. Just ask!

User: Locate me

Bot: To get your location, I'll just need to get your street address from Google. Is that ok?

User: ok

Bot: I found you! You are at latitude: 37.4219806, and longitude: -122.0841979. The next time you ask me your location, I will remember.
```

## Project Structure

```
.
├── app                      # The application directory
│    ├── index.js            # App initialization
│    ├── intents             # The intents directory
│    │   ├── index.js        # Imports the intents for use
│    │   ├── fallback.js     # The fallback intent (when the app doesn't understand)
│    │   ├── location.js     # The locations intent (where the user can ask for their location)
│    │   ├── permissions.js  # The permissions intent (handles permissions request)
│    │   └── welcome.js      # The welcome intent (greets the user)
│    └── ai.js               # `actions-ai-app` creation (exports the intent, invokeIntent, action, and entity methods so that we may import them anywhere)
├── cache                    # The cache is used to store json data for API.AI
└── nodemon.js               # Nodemon config, specifically we ignore the `cache` directory as we don't need refresh when cache changes
```

## Steps
1. Install with `yarn` or `npm install`.
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing.
1. Click *Use API.AI* and then *Create Actions on API.AI* to open the API.AI console.
1. Click *Save* to save the project.
1. Click on the gear icon to see the project settings.
1. Take note of your `Developer access token` which we will use for synchronizing your application to API.ai directly. Edit the `app/ai.js` and set your API.ai token: `APIAIToken: 'API_AI_DEVELOPER_TOKEN'`.
1. If developing locally, you may wish to use a service such as [ngrok](https://ngrok.com/). In either case, you will need to browse to the `Fulfillment` tab of your project within API.ai, enable your webhook and point it to the web address of your application when it is available.
1. Because this application uses Google Assistant specific behavior, you must enable the 'Actions on Google' integration within API.ai.
1. Use `yarn run start` or `npm start` to start the application.
1. View your project in the [Actions on Google Console](https://console.actions.google.com) to test the application (you will be required to submit your application in the API.ai integrations section for `Actions on Google` by hitting the "Test" button. See the example conversation above for this demonstration.
