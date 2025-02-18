import { Router } from "express";
import osController from "@/controllers/os.controller";

const osRoutes = (basePath: string, router: Router) => {
  router.get(`${basePath}/cpu-history`, osController.getCPUHistory);
};

export default osRoutes;
