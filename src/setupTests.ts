// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-localstorage-mock";
process.env.REACT_APP_SUBMISSION_DATA = "/example-submission-data.json";
process.env.REACT_APP_AUTHORS = "/authors.json";
process.env.REACT_APP_POKE = "/poke-325-export.json";
process.env.REACT_APP_POST_EMAILS_URL = "/emails";
process.env.REACT_APP_TEMPLATES_URL = "/templates";
