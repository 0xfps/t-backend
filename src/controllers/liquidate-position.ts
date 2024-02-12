import { Request, Response } from "express";

export default async function liquidatePositionController(req: Request, res: Response) {
    const { positionId } = req.body

    const body = {
        positionId: positionId
    }

    const liquidationCall = await fetch("http://localhost:8080/close-position", {
        method: "POST",
        headers: {
            "api-key": process.env.ENCRYPTED_DEVELOPMENT_API_KEY as string ?? process.env.ENCRYPTED_PRODUCTION_API_KEY as string
        },
        body: JSON.stringify(body)
    })

    const response = await liquidationCall.json()

    // Do stuff with response after coding and return stuff.
}