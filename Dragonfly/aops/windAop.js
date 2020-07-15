import { aop, hookName, createHook } from 'to-aop';
import {DroneModel} from '../public/js/Model/DroneModel';

let oldFunction = undefined;

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

        // Acelerar e diminuir altura

        const originalResult = Reflect.apply(object[property], context, args);
        
        if (context.dataEnv.windSpeed >= context.speed) {
            if (context.speed < 120) {
                context.speed += 30;
            } else {
        	   context.lastWaypointIndex = context.waypoints.length;
            }
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