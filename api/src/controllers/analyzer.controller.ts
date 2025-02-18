import {type Request, type Response} from "express";
import analyze from "@/services/analyze";
import {AnalyzerBodyRequest} from "@types/utils";

const startAnalyzer = async (req: Request, res: Response) => {

    const {mode, numCalc, cores} = req.body as  AnalyzerBodyRequest

    try{
        const data = await analyze.runAnalyze({mode, numCalc, cores});

        res.status(200).json(data);
    } catch(err){
        console.log(err)
        res.status(400).send(err)

        return
    }

}

export default {
    startAnalyzer
}