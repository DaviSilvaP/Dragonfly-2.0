import { aop, hookName, createHook } from 'to-aop';
import {DroneModel} from '../public/js/Model/DroneModel';

import {getLength} from 'ol/sphere';
import {LineString} from 'ol/geom';

function routeLength (waypoints) {
    // Distancia em metros
    let line = new LineString(waypoints);
    return Math.round(getLength(line) * 100) / 100;
};

const classHookBefore = createHook(
    hookName.beforeMethod,
    /^(advanceWaypoints)$/,
    ({ target, object, property, context, args }) => {
        /*console.log(
            `Instance of ${target.name} call "${property}"
            with arguments ${args && args.length ? args : '[]'}.`
        );*/
    }
);

const classHookAround = createHook(
    hookName.aroundMethod,
    /^(advanceWaypoints)$/,
    ({ target, object, property, context, args, payload }) => {

        // Verificar distância

        let waypoints = context.waypoints.slice(context.lastWaypointIndex + 1);
        waypoints.unshift(context.coords);
        let totalDistance = routeLength(context.waypoints);
        let distanceToEnd = routeLength(waypoints);
        let p = distanceToEnd / totalDistance;

        const originalResult = Reflect.apply(object[property], context, args);
        
        // Verifica se quando metade da rota for percorrida, terá mais da metade da bateria.
        // Se não tiver, o drone volta para o começo.
        if (context.initialBatteryCapacity <= 52 &&
            context.initialBatteryCapacity >= 48 && 
            p >= 0.5 && 
            context.status.code !== context.codes.LANDING) {
        	context.status.code = context.codes.RETURN_TO_HOME;
        };

        return originalResult;
    }
);

const classHookAfter = createHook(
    hookName.afterMethod,
    /^(advanceWaypoints)$/,
    ({ target, object, property, context, args, payload }) => {
        /*console.log(
            `Instance of ${target.name} call "${property}"
            with arguments ${args && args.length ? args : '[]'}
            and return value is "${payload}".`
        );*/
    }
);

const hooks = Object.assign({}, classHookBefore, classHookAfter, classHookAround);

aop(
    DroneModel,
    hooks
);