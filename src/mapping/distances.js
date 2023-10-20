import { getDistanceRequest } from "../utils/localServerRequests";

async function getDistance(city1, city2) {
    return (await getDistanceRequest(city1, city2)).map(dist => Math.trunc(dist));
}

export { getDistance };