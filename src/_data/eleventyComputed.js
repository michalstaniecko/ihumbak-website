// Every page knows the App or Client project it belongs to, looked up by its first URL segment.
import { segments } from "../../lib/terminal.js";

export default {
  app: (data) => data.apps.find((app) => app.slug === segments(data.page.url)[0]),
  project: (data) => data.projects.find((project) => project.slug === segments(data.page.url)[0]),
  appDocument: (data) => data.app?.documents?.find((document) => document.slug === segments(data.page.url)[1]),
};
