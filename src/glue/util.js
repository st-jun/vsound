export function clip(value, min=0., max=1.) {
    return Math.min(max, Math.max(min, value));
}


export function norm(x, y) {
    return Math.sqrt(x ** 2 + y ** 2);
}


export function angleRad(x0, y0, x1, y1, minAngle = false) {
    const dotProduct = x0 * x1 + y0 * y1;

    const magnitudeA = norm(x0, y0);
    const magnitudeB = norm(x1, y1);

    const cosTheta = dotProduct / (magnitudeA * magnitudeB);
    let angle = Math.acos(cosTheta);

    if (!minAngle) {
        const crossProduct = x0 * y1 - x1 * y0;
        if (crossProduct < 0) {
            angle = 2 * Math.PI - angle;
        }
    }

    return angle;
}


export function angleDeg(x0, y0, x1, y1, minAngle = false) {
    return angleRad(x0, y0, x1, y1, minAngle) * (180. / Math.PI);
}


export function waitForCondition(conditionFunc, interval) {
    return new Promise((resolve) => {
        const int = setInterval(() => {
            if (conditionFunc()) {
                clearInterval(int);
                resolve();
            }
        }, interval);
    });
}