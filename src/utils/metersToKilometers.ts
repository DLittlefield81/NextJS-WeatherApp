export function metersToKilometers(visiblityInMeters: number):string {
    const visiblityInKilometers = visiblityInMeters / 1000;
    return `${visiblityInKilometers.toFixed(0)}km`;
}