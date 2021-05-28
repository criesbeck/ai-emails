# AI Emails

An AI emailing system.

# Developing

To spin up a live system with hot reloading, run:

```sh
npm start
```

This command also starts a develompent server for testing interactions with the backend. All of the mock backend code lives in the `server` folder located in the root of this repository.

## Issue Finding

All of the business logic for detecting issues in the student data lives in the `src/help-system` directory. The following information may prove useful if you wish to change that logic:

- To edit the templates the system uses as the basis for tags, modify the file in `server/examples/templates.json`. That data will likely go in the database.
- To change how the system creates tags, considing adding a new function to either `src/help-system/tagReducers.ts`.
- To run postprocessing functions on the tags the system comes up with, consider adding a new function to `src/help-system/tagPostProcessors.ts`.
- To modify the way that the functions in those files ultimately get composed together, modify `src/help-system/studentRanker.ts`.

For more information about the shape of the data, consult the type definitions in `src/help-system/CriticStructure.ts` and `src/help-system/tagStructure.ts`. The former file adds describes the types of information obtained from the API; the later file describes the types of information our system computes.

## Backend Interactions

Our email system currently makes 6 separate GET requests to the following endpoints stored in the following environment variables:

```
REACT_APP_SUBMISSION_DATA
REACT_APP_AUTHORS
REACT_APP_POKE
REACT_APP_TEMPLATES_URL
REACT_APP_GET_EMAILS_URL
```

These endpoints can be configured by changing the `.env` file in the root of this repository. To see the structure expected from each endpoint, check out the file `api.json` in the root of this repository and the types described above.

To change the actual fetching code, check out the function `fetchEmailStatistics` in `src/views/EmailGateway.tsx`; that file defines the boundary between the API and the rest of the interface.

In addition, our email system allows you to make some `POST` and `PUT` requests at the following endpoints:

```
REACT_APP_POST_EMAILS_URL
REACT_APP_PUT_TEMPLATES_URL
```

Those send `FormData` that the Java backend should be able to parse. For development purposes, there exists a small development server that runs when one invokes `npm start` from the command line.

## Testing

Run:

```sh
npm test
```

## Deployment

Run:

```sh
npm run build
```

And place the static files generated into the directory of your choice.
