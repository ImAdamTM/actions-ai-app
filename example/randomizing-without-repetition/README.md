# Randomizing without repetition

This example demonstrates the use of the store to list out a series of  items in a randomized non-repetitive order that the user can iterate through. This works by creating a randomized array of indexes when the user asks for a fact the first time and storing it to their state (session) data.

Subsequent requests for facts iterate over this randomized index list until we reach the end.

## Example
```
User: Hello

Bot: Hello! Ask me for an interesting fact!

User: Tell me a fact

Bot: Super interesting fact 3. Would you like to hear another fact?

User: Yes

Bot: Super interesting fact 1. Would you like to hear another fact?

User: Yes

Bot: Super interesting fact 2. Would you like to hear another fact?

User: Yes

Bot: Super interesting fact 4. That's all the facts I have for you. Is there something else I can help you with?.
```

## Project Structure

```
.
├── app                      # The application directory
│    ├── index.js            # App initialization
│    ├── intents             # The intents directory
│    │   ├── index.js        # Imports the intents for use
│    │   ├── fallback.js     # The fallback intent (when the app doesn't understand)
│    │   ├── welcome.js      # The welcome intent (greets the user)
│    │   └── facts.js        # The facts intent (tells randomized facts)
│    ├── entities.js         # The entities configuration
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
1. Take note of your `Developer access token` which we will use for synchronizing your application to API.ai directly. Edit the `app/ai.js` and set your API.ai token: `APIAIToken: 'API_AI_DEVELOPER_TOKEN'`
1. If developing locally, you may wish to use a service such as [ngrok](https://ngrok.com/). In either case, you will need to browse to the `Fulfillment` tab of your project within API.ai, enable your webhook and point it to the web address of your application when it is available
1. Use `yarn run start` or `npm start` to start the application.
1. View your project in the API.ai console to test the application. See the example conversation above for this demonstration.
I