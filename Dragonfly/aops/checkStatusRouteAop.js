import { aop, hookName, createHook } from 'to-aop';
import {DroneModel} from '../public/js/Model/DroneModel';

import {getLength} from 'ol/sphere';
import {LineString} from 'ol/geom';

function routeLength (waypoints) {
    // Distancia em metros
    let line = new LineString(waypoints);
    return Math.round(getLength(line) * 100) / 100;
};


const classHookAround = createHook(
    hookName.aroundMethod,
    /^(advanceWaypoints)$/,
    ({ target, object, property, context, args, payload }) => {

        // O drone DEVE gastar no máximo 3% de bateria por segundo, mas esse valor pode ser 
        // maior se a velocidade do vento do ambiente for superior ao do drone.

        let waypoints = context.waypoints.slice(context.lastWaypointIndex + 1);
        waypoints.unshift(context.coords);
        let timeToEnd = routeLength(waypoints) / context.speed;

        if ((timeToEnd * 3) > context.initialBatteryCapacity) {
            context.updateStatus(context.codes.LANDING, "Insufficient Battery");
        };

        if (context.dataEnv.windSpeed >= context.speed) {
            context.updateStatus(context.codes.LANDING, "Too Strong Wind");
        };

        const originalResult = Reflect.apply(object[property], context, args);
        return originalResult;
    }
);

const hooks = Object.assign({}, classHookAround);

aop(
    DroneModel,
    hooks
);