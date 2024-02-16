import { Request, Response } from "express";
import dotenv from "dotenv"
import ResponseInterface from "../interfaces/response-interface";
import { POST } from "../utils/constants";

dotenv.config()
const { ENCRYPTED_DEVELOPMENT_API_KEY, ENCRYPTED_PRODUCTION_API_KEY, ENVIRONMENT_URL } = process.env
const URL = ENVIRONMENT_URL ? ENVIRONMENT_URL : "http://localhost:8080"

export default async function liquidatePositionController(req: Request, res: Response) {
    const { positionId } = req.body

    const body = {
        positionId: positionId
    }

    const liquidationCall = await fetch(`${URL}/close-position`, {
        method: POST,
        headers: {
            "api-key": ENCRYPTED_DEVELOPMENT_API_KEY as string ?? ENCRYPTED_PRODUCTION_API_KEY as string
        },
        body: JSON.stringify(body)
    })

    const resp = await liquidationCall.json()

    if (resp.status != 200) {
        const response: ResponseInterface = {
            status: resp.status,
            msg: "Error"
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: resp.status,
        msg: resp.msg,
        data: resp.data
    }

    res.send(response)
}