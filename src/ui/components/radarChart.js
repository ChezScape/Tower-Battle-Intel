"use strict";

import { clamp, escapeAttr } from "../sections/sectionUtils.js";

const AXES = Object.freeze([
    ["damage", -90],
    ["economy", 0],
    ["survivability", 90],
    ["utility", 180]
]);

export function buildRadarChart(scores = {}) {
    const pointsA = radarPolygon(scores, "a");
    const pointsB = radarPolygon(scores, "b");

    return `
        <svg class="tbi-radar" viewBox="0 0 360 300" role="img" aria-label="Run A versus Run B category radar chart">
            <defs>
                <filter id="tbiRadarGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <polygon class="radar-ring radar-ring-outer" points="180,54 285,145 180,236 75,145" />
            <polygon class="radar-ring" points="180,77 259,145 180,213 101,145" />
            <polygon class="radar-ring" points="180,100 233,145 180,190 127,145" />
            <polygon class="radar-ring" points="180,123 207,145 180,167 153,145" />
            <line class="radar-axis" x1="180" y1="54" x2="180" y2="236" />
            <line class="radar-axis" x1="75" y1="145" x2="285" y2="145" />
            <polygon class="radar-run radar-run-a" points="${escapeAttr(pointsA)}" />
            <polygon class="radar-run radar-run-b" points="${escapeAttr(pointsB)}" />
            <circle class="radar-node" cx="180" cy="54" r="3" />
            <circle class="radar-node" cx="285" cy="145" r="3" />
            <circle class="radar-node" cx="180" cy="236" r="3" />
            <circle class="radar-node" cx="75" cy="145" r="3" />
            <text class="radar-label" x="180" y="31" text-anchor="middle">Damage Output</text>
            <text class="radar-label" x="309" y="151" text-anchor="start">Economy</text>
            <text class="radar-label" x="180" y="274" text-anchor="middle">Survivability</text>
            <text class="radar-label" x="51" y="151" text-anchor="end">Utility</text>
        </svg>
    `;
}

function radarPolygon(scores, runKey) {
    const centerX = 180;
    const centerY = 145;
    const radius = 91;

    return AXES.map(([key, angle]) => {
        const value = clamp(Number(scores?.[key]?.[runKey] || 50), 0, 100);
        const rad = angle * Math.PI / 180;
        const r = radius * value / 100;
        const x = centerX + Math.cos(rad) * r;
        const y = centerY + Math.sin(rad) * r;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
}
