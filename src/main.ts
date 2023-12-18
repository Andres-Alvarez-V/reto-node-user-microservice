import { App } from "./app";
import { config } from "./application/core/config";

console.log(config.APP_PORT)
const application = new App();
application.run();