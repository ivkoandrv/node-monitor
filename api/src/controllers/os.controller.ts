import { type Request, type Response } from "express";
import osService from "@/services/os.service";

const getCPUHistory = async (req: Request, res: Response) => {
  try {
    const startTime = parseInt(req.query.startTime as string);
    const endTime = parseInt(req.query.endTime as string);
    const aggregation =
      (req.query.aggregation as "raw" | "1m" | "5m" | "1h") || "raw";

    const data = await osService.getHistoricalData(
      startTime,
      endTime,
      aggregation
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CPU history" });
  }
};

export default { getCPUHistory };
