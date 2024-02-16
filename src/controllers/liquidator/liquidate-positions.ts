import dotenv from "dotenv"
import { POST } from "../../utils/constants"

dotenv.config()
const { ENCRYPTED_DEVELOPMENT_API_KEY, ENCRYPTED_PRODUCTION_API_KEY, ENVIRONMENT_URL } = process.env
const URL = ENVIRONMENT_URL ? ENVIRONMENT_URL : "http://localhost:8080"

export async function liquidatePositions(positionIds: any[]) {
    positionIds.forEach(async function (positionId: any) {
        const body = {
            positionId: positionId
        }

        await fetch(`${URL}/liquidate-position`, {
            method: POST,
            headers: {
                "api-key": ENCRYPTED_DEVELOPMENT_API_KEY as string ?? ENCRYPTED_PRODUCTION_API_KEY as string
            },
            body: JSON.stringify(body)
        })
    })
}