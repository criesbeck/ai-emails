declare module "comlink-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
    processStudents(ctx: any): Promise<any>;
  }

  export = WebpackWorker;
}
