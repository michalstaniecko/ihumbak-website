// Every page knows the App or Client project it belongs to, looked up by its first URL segment.
import { segments } from "../../lib/terminal.js";

export default {
  app: (data) => data.apps.find((app) => app.slug === segments(data.page.url)[0]),
  project: (data) => data.projects.find((project) => project.slug === segments(data.page.url)[0]),
  appDocument: (data) => {
    const [appSlug, documentSlug] = segments(data.page.url);
    const app = data.apps.find((candidate) => candidate.slug === appSlug);
    return app?.documents.find((document) => document.slug === documentSlug);
  },
};
