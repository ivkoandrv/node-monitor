import { Router } from "express";
import analyzerController from "@/controllers/analyzer.controller";

const analyzerRoutes = (basePath: string, router: Router) => {
    router.get(`${basePath}/run`, analyzerController.startAnalyzer);
};

export default analyzerRoutes;
